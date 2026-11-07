// draftsage/src/application/app.js — composición de la parte de datos (cliente Coachless, caché, LCU, controlador)
// Es el único sitio que conecta las piezas; el resto de módulos reciben lo que necesitan por parámetro.
import { api, apiGet, isLoggedIn, hasPremium } from './session.js'
import { catalog } from './catalog.js'
import { createRecommendationService } from './recommendation.js'
import { createChampSelectController } from './champ-select.js'
import { createSourceRouter } from './sources.js'
import { createLolalyticsSource } from './lolalytics-source.js'
import { createChampionStats, createOverlayController } from './overlay.js'
import { createPickAdvisor, createPickAdvisorController } from './pick-advisor.js'
import { createEnemyRoles } from './enemy-roles.js'
import { createMastery } from './mastery.js'
import { createPickFilters } from './pick-filters.js'
import { createConfigurationApplier } from './configuration.js'
import { createLiveGame } from './live-game.js'
import { contextFromSnapshot } from '../domain/live.js'
import { getApplyPrefs, setApplyPrefs, getFilterPrefs, setFilterPrefs, getSourcePrefs, setSourcePrefs, getOverlayPrefs, setOverlayPrefs, getAdvisorPrefs, setAdvisorPrefs, getPickFilterPrefs, setPickFilterPrefs, pins } from './preferences.js'
import { needsLogin } from '../domain/sources.js'
import { createCoachlessClient } from '../infrastructure/coachless/client.js'
import { createCache } from '../infrastructure/coachless/cache.js'
import { createLolalyticsClient } from '../infrastructure/lolalytics/client.js'
import { createIteroClient } from '../infrastructure/itero/client.js'
import { createEnglishNames } from '../infrastructure/ddragon/names.js'
import { createChampSelectProvider } from '../infrastructure/lcu/champ-select-provider.js'
import { lcuGet } from '../infrastructure/lcu/lcu-client.js'
import { createIdentity } from '../infrastructure/lcu/identity.js'
import { createLoadoutGateway } from '../infrastructure/lcu/loadout-gateway.js'
import { createLiveClient } from '../infrastructure/liveclient/live-client.js'
import { log } from '../shared/logger.js'

const requestCache = createCache({ ttlMs: 30 * 60 * 1000, max: 300 })
const resultCache = createCache({ ttlMs: 30 * 60 * 1000, max: 100 })

const client = createCoachlessClient({ post: api, get: apiGet, cache: requestCache })
const service = createRecommendationService({ client, log, cache: resultCache, keystoneTrees: () => catalog.keystoneTrees(), getFilters: getFilterPrefs })

// LoLalytics (segunda fuente + estadísticas de la selección): caché larga (los datos cambian por parche) y sin cuenta.
const lolaCache = createCache({ ttlMs: 2 * 60 * 60 * 1000, max: 80 })
const lolaClient = createLolalyticsClient({ cache: lolaCache, log })
const lolaSource = createLolalyticsSource({ client: lolaClient, catalog, getFilters: getFilterPrefs, log })
// Qué fuente responde (Ajustes → Fuente): 'auto' (por defecto), 'coachless' o 'lolalytics' (domain/sources.js).
const router = createSourceRouter({ sources: { coachless: service, lolalytics: lolaSource }, getMode: () => getSourcePrefs().mode, isLoggedIn, log })

// Seguimiento de la partida (oro e ítems con la Live Client Data API): solo se sondea mientras hay partida.
const liveClient = createLiveClient()
const live = createLiveGame({ client: liveClient })

const controller = createChampSelectController({
  provider: createChampSelectProvider({
    lcuGet,
    // Cliente reiniciado en plena partida: el campeón, rol y rivales salen de la Live Client Data API.
    recoverGameContext: async () => {
      await catalog.load()
      const ctx = contextFromSnapshot(await liveClient.snapshot(), (q) => catalog.findChampion(q))
      if (ctx) log.info('partida recuperada con la Live Client Data API:', ctx.championId)
      return ctx
    },
  }),
  recommend: (ctx, o) => router.getRecommendation(ctx, o),
  // «Puede recomendar»: solo la fuente Coachless exige sesión; con LoLalytics (o auto sin cuenta) no hace falta iniciar sesión.
  isLoggedIn: () => !needsLogin(getSourcePrefs().mode) || isLoggedIn(),
  hasPremium,
  debounceMs: 350, // pasar el cursor por varios campeones no debe lanzar una consulta por cada uno
  pins,            // runa clave y hechizos fijados por el usuario, por campeón y rol
})

controller.subscribe((st) => { if (st.context?.phase === 'game') live.start(); else live.stop() })

// Estadísticas de cada campeón sobre la selección (win rate y counters contra el rival de tu línea).
const championStats = createChampionStats({ client: lolaClient, catalog, getFilters: getFilterPrefs, log })
const overlay = createOverlayController({
  stats: championStats,
  source: controller, prefs: { get: getOverlayPrefs, set: setOverlayPrefs }, getFilters: getFilterPrefs, debounceMs: 300, log,
})

// Consejero de picks (iTero = composición completa): DESACTIVADO hasta que el usuario acepte el aviso, porque la composición del draft viaja
// a un tercero. Una respuesta de iTero pesa ~1,7 MB: caché de 10 min con solo lo recortado. La lista de MATCHUP (LoLalytics) es otra y va aparte.
const iteroClient = createIteroClient({ cache: createCache({ ttlMs: 10 * 60 * 1000, max: 40 }), log })
// Maestría del jugador (iTero basic-info): APAGADA hasta que el usuario acepte el aviso (su Riot ID viaja a iTero). La usan iTero y el filtro «dominio».
const mastery = createMastery({ identity: createIdentity({ lcuGet }), itero: iteroClient, source: controller, prefs: { get: getAdvisorPrefs }, log })
const advisor = createPickAdvisorController({
  advisor: createPickAdvisor({ itero: iteroClient, names: createEnglishNames({ log }), catalog, lola: lolaClient, stats: championStats, mastery, getFilters: getFilterPrefs, getPrefs: getAdvisorPrefs, log }),
  source: controller, prefs: { get: getAdvisorPrefs, set: setAdvisorPrefs }, getFilters: getFilterPrefs, debounceMs: 600, maxQueries: 12, log,
})

// Línea de cada rival: la que elige el jugador en el panel o la que deduce el plugin (cuota de línea de LoLalytics).
const enemyRoles = createEnemyRoles({ source: controller, lola: lolaClient, getFilters: getFilterPrefs, log })

// Filtros de la selección (clase, dominio, matchup, meta, fase, daño): deciden qué campeones se ven en las listas y en la cuadrícula.
const pickFilters = createPickFilters({ catalog, overlay, advisor, mastery, prefs: { get: getPickFilterPrefs, set: setPickFilterPrefs } })

const applier = createConfigurationApplier({ gateway: createLoadoutGateway(), prefs: { get: getApplyPrefs, set: setApplyPrefs }, log })

export const app = {
  catalog,
  controller,
  applier,
  live,
  /** Filtros de rango de parches y de Elo (los guardados). Al cambiarlos se vuelve a consultar con el contexto actual. */
  filters: {
    get: getFilterPrefs,
    set(patch) { const next = setFilterPrefs(patch); controller.refresh(); return next },
  },
  /** Fuente de las recomendaciones. Al cambiarla se vuelve a consultar con el contexto actual. */
  source: {
    get: () => getSourcePrefs().mode,
    set(mode) { const next = setSourcePrefs({ mode }); controller.refresh(); return next.mode },
  },
  /** Estadísticas sobre la selección (win rate y counters). */
  overlay,
  /** Consejero de picks de draft (iTero). `advisor.iteroStatus()` = backoff y nº de peticiones, para diagnóstico. */
  advisor: Object.assign(advisor, { iteroStatus: () => iteroClient.status() }),
  /** Maestría del jugador (opcional, apagada por defecto) y filtros de la selección. */
  mastery,
  enemyRoles,
  pickFilters,
  /** Al cerrar sesión o cambiar de cuenta: nada de lo cacheado debe pasar a otra cuenta (puede variar el plan). */
  resetData: () => { requestCache.clear(); resultCache.clear() },
}
