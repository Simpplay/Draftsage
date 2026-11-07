// draftsage/src/domain/patch.js — elección de parche (regla pura)
//
// El parche más reciente suele tener muy poca muestra (16.22: 243 k partidas frente a 6,8 M en los anteriores),
// así que se usa el último cuya muestra sea al menos `minRatio` de la de los parches anteriores.

/**
 * @param {{major:number, patch:number, matchCount:number, label?:string}[]} patches  respuesta de GetPatches
 * @returns {{major:number, patch:number, label:string, matchCount:number, fallback:boolean}|null}
 *   fallback = true si se descartó el más reciente por tener poca muestra.
 */
export function choosePatch(patches, { minRatio = 0.3, lookback = 3 } = {}) {
  const list = (Array.isArray(patches) ? patches : [])
    .filter((p) => p && Number.isFinite(p.major) && Number.isFinite(p.patch) && Number.isFinite(p.matchCount))
    .sort((a, b) => a.major - b.major || a.patch - b.patch)
  if (!list.length) return null

  for (let i = list.length - 1; i >= 0; i--) {
    const before = list.slice(Math.max(0, i - lookback), i)
    const ref = before.length ? Math.max(...before.map((p) => p.matchCount)) : 0
    const p = list[i]
    if (!before.length || p.matchCount >= ref * minRatio) {
      return { major: p.major, patch: p.patch, label: p.label ?? `${p.major}.${p.patch}`, matchCount: p.matchCount, fallback: i !== list.length - 1 }
    }
  }
  const p = list[0]
  return { major: p.major, patch: p.patch, label: p.label ?? `${p.major}.${p.patch}`, matchCount: p.matchCount, fallback: list.length > 1 }
}

/** «16.21–22» para un rango de parches (premium); sin rango o si no se puede calcular, la etiqueta del parche (+N). */
export function patchSpanLabel(patch, additions = 0) {
  const n = Math.max(0, Math.round(additions) || 0)
  if (!patch || n === 0) return patch?.label ?? ''
  const from = patch.patch - n
  return from >= 1 ? `${patch.major}.${from}–${patch.patch}` : `${patch.label}+${n}`
}
