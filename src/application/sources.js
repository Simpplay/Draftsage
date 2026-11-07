// draftsage/src/application/sources.js — elige de qué fuente sale la recomendación (Coachless, LoLalytics o automático)
//
// Cada fuente tiene la misma firma: getRecommendation(ctx, {premium, signal}) → { ok:true, data } | { ok:false, reason }.
// El orden y los recursos los decide domain/sources.js. El resultado lleva `meta.source` ('coachless' | 'lolalytics') y, si la primera
// fuente falló y se usó otra (solo en «auto»), el aviso `source-fallback`. Un error lleva `source` (la última fuente probada).

import { sourceOrder } from '../domain/sources.js'

/**
 * @param {{sources:{coachless:{getRecommendation:Function}, lolalytics:{getRecommendation:Function}},
 *          getMode:()=>string, isLoggedIn:()=>boolean, log?:object}} deps
 */
export function createSourceRouter({ sources, getMode, isLoggedIn, log = null }) {
  async function getRecommendation(ctx, o = {}) {
    const order = sourceOrder({ mode: getMode(), loggedIn: isLoggedIn(), premium: !!o.premium, wantsMatchup: !!ctx?.opponentChampionId })
    let last = { ok: false, reason: 'no-data', source: order[0] }
    for (let i = 0; i < order.length; i++) {
      const name = order[i]
      let r
      try { r = await sources[name].getRecommendation(ctx, o) } catch (e) { log?.error(name + ': la fuente lanzó una excepción:', String(e)); r = { ok: false, reason: 'network' } }
      if (o.signal?.aborted || r.reason === 'aborted') return { ok: false, reason: 'aborted' }
      if (r.ok) {
        const notices = i > 0 ? [...new Set([...r.data.meta.notices, 'source-fallback'])] : r.data.meta.notices
        return { ok: true, data: { ...r.data, meta: { ...r.data.meta, source: name, notices } } }
      }
      last = { ...r, source: name }
      if (i + 1 < order.length) log?.warn(name + ' falló (' + r.reason + '); se prueba ' + order[i + 1])
    }
    return last
  }
  return { getRecommendation }
}
