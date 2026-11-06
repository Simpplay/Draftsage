// easy-coachless/src/infrastructure/lolalytics/qwik.js — lectura del estado Qwik que Lolalytics incrusta en su HTML
//
// La web (Qwik, renderizada en servidor) no pide sus datos desde el navegador: viajan dentro del HTML, en
// <script type="qwik/json"> { refs, ctx, objs, subs }. `objs` es un grafo serializado: cada elemento de un array/objeto es una
// referencia (cadena en base 36 con el índice en `objs`). Los índices cambian en cada despliegue y por página: NUNCA se fijan;
// los objetos se localizan por sus claves. Detalle en docs/lolalytics.md §5. Solo lectura, sin dependencias.
// El HTML descargado NO se inserta en el DOM: se trata como texto.

const isObj = (o) => o !== null && typeof o === 'object' && !Array.isArray(o)

/** Extrae y parsea el estado Qwik del HTML. Lanza Error('sin-estado-qwik') si no está o no tiene la forma esperada. */
export function parseQwikState(html) {
  const m = /<script type="qwik\/json">([\s\S]*?)<\/script>/.exec(String(html ?? ''))
  if (!m) throw new Error('sin-estado-qwik')
  let state
  try { state = JSON.parse(m[1]) } catch { throw new Error('sin-estado-qwik') }
  if (!state || !Array.isArray(state.objs)) throw new Error('sin-estado-qwik')
  return state
}

/** Resuelve referencias a valores (memoriza lo ya resuelto: el grafo tiene ciclos). `at(i)` devuelve el valor de objs[i]. */
export function makeResolver(state) {
  const objs = state.objs
  const memo = new Map()
  function at(i) {
    if (memo.has(i)) return memo.get(i)
    const o = objs[i]
    if (o === null || typeof o !== 'object') { memo.set(i, o); return o }
    const out = Array.isArray(o) ? [] : {}
    memo.set(i, out) // permite ciclos
    const val = (v) => (typeof v === 'string' ? at(parseInt(v, 36)) : v)
    if (Array.isArray(o)) o.forEach((v) => out.push(val(v)))
    else for (const k in o) out[k] = val(o[k])
    return out
  }
  return { at, objs }
}

/** Índice del objeto raíz de una página de build: el único con la clave `skillEarly`. null si no existe. */
export function findRoot(state, key = 'skillEarly') {
  const i = state.objs.findIndex((o) => isObj(o) && key in o)
  return i < 0 ? null : i
}

/** Raíz ya resuelta de una página de build, o null. */
export function readRoot(state) {
  const i = findRoot(state)
  return i === null ? null : makeResolver(state).at(i)
}

/** Mapa cid → slug de campeón (objeto con las claves '81' y '62' y más de 100 entradas). null si no está. */
export function findChampionMap(state) {
  const i = state.objs.findIndex((o) => isObj(o) && '81' in o && '62' in o && Object.keys(o).length > 100)
  return i < 0 ? null : makeResolver(state).at(i)
}

/** Filas de la lista de tier: todos los objetos con las claves `cid` y `row` → Map<cid, row>. */
export function extractTierlist(state) {
  const { at } = makeResolver(state)
  const out = new Map()
  state.objs.forEach((o, i) => {
    if (!isObj(o) || !('cid' in o) || !('row' in o)) return
    const r = at(i)
    if (r && isObj(r.row) && Number.isInteger(r.cid)) out.set(r.cid, r.row)
  })
  return out
}
