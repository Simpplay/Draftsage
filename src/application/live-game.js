// easy-coachless/src/application/live-game.js — seguimiento de la partida en curso (oro e ítems) con la Live Client Data API
//
// start()/stop() los llama la composición (app.js) según la fase: solo se sondea mientras hay partida. Estado:
//   { status: 'off' | 'connecting' | 'live' | 'offline', gold, level, items:[{item,count,slot}] }
//   'offline' = la API del juego aún (o ya no) responde; se conserva lo último que se vio para no vaciar el panel.
// Solo se avisa a los suscriptores cuando cambia algo visible (el oro se agrupa de 25 en 25 para no repintar cada 2 s).

const EMPTY = { status: 'off', gold: 0, level: null, items: [] }
const itemsKey = (items) => items.map((i) => `${i.item}x${i.count}`).sort().join()

export function createLiveGame({ client, intervalMs = 2000, offlineMs = 3000 }) {
  const listeners = new Set()
  let state = EMPTY
  let running = false
  let timer = null
  let gen = 0

  const sig = (s) => `${s.status}|${s.level}|${Math.floor(s.gold / 25)}|${itemsKey(s.items)}`
  const set = (next) => {
    const changed = sig(next) !== sig(state)
    state = next
    if (changed) for (const cb of [...listeners]) { try { cb(state) } catch { /* un suscriptor roto no para el sondeo */ } }
  }

  async function tick(g) {
    let r
    try { r = await client.snapshot() } catch { r = { ok: false, reason: 'offline' } }
    if (!running || g !== gen) return
    if (r.ok) set({ status: 'live', gold: r.gold, level: Number.isFinite(r.level) ? r.level : 0, items: r.items })
    else set({ ...state, status: 'offline' })
    timer = setTimeout(() => tick(g), r.ok ? intervalMs : offlineMs)
  }

  return {
    getState: () => state,
    subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb) },
    start() {
      if (running) return
      running = true
      set({ ...EMPTY, status: 'connecting' })
      tick(++gen)
    },
    stop() {
      if (!running && state.status === 'off') return
      running = false; gen++
      clearTimeout(timer); timer = null
      set(EMPTY)
    },
  }
}
