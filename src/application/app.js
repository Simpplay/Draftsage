// easy-coachless/src/application/app.js — composición de la parte de datos (cliente Coachless, caché, LCU, controlador)
// Es el único sitio que conecta las piezas; el resto de módulos reciben lo que necesitan por parámetro.
import { api, apiGet, isLoggedIn, hasPremium } from './session.js'
import { catalog } from './catalog.js'
import { createRecommendationService } from './recommendation.js'
import { createChampSelectController } from './champ-select.js'
import { createConfigurationApplier } from './configuration.js'
import { getApplyPrefs, setApplyPrefs } from './preferences.js'
import { createCoachlessClient } from '../infrastructure/coachless/client.js'
import { createCache } from '../infrastructure/coachless/cache.js'
import { createChampSelectProvider } from '../infrastructure/lcu/champ-select-provider.js'
import { lcuGet } from '../infrastructure/lcu/lcu-client.js'
import { createLoadoutGateway } from '../infrastructure/lcu/loadout-gateway.js'
import { log } from '../shared/logger.js'

const requestCache = createCache({ ttlMs: 30 * 60 * 1000, max: 300 })
const resultCache = createCache({ ttlMs: 30 * 60 * 1000, max: 100 })

const client = createCoachlessClient({ post: api, get: apiGet, cache: requestCache })
const service = createRecommendationService({ client, log, cache: resultCache, keystoneTrees: () => catalog.keystoneTrees() })

const controller = createChampSelectController({
  provider: createChampSelectProvider({ lcuGet }),
  recommend: (ctx, o) => service.getRecommendation(ctx, o),
  isLoggedIn,
  hasPremium,
  debounceMs: 350, // pasar el cursor por varios campeones no debe lanzar una consulta por cada uno
})

const applier = createConfigurationApplier({ gateway: createLoadoutGateway(), prefs: { get: getApplyPrefs, set: setApplyPrefs }, log })

export const app = {
  catalog,
  controller,
  applier,
  /** Al cerrar sesión o cambiar de cuenta: nada de lo cacheado debe pasar a otra cuenta (puede variar el plan). */
  resetData: () => { requestCache.clear(); resultCache.clear() },
}
