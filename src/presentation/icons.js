// easy-coachless/src/presentation/icons.js — iconos SVG de trazo (sin innerHTML: nodos creados con createElementNS)
// Uso: icon('bolt', 16)  → <svg> que hereda el color del texto (currentColor).

const NS = 'http://www.w3.org/2000/svg'

const PATHS = {
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7z',
  crown: 'M3 8l4 4 5-7 5 7 4-4-2 11H5z',
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 21c0-4 4-6 8-6s8 2 8 6'],
  page: ['M6 3h12v18H6z', 'M9 8h6', 'M9 12h6', 'M9 16h4'],
  swap: ['M5 8h13l-3-3', 'M19 16H6l3 3'],
  swords: ['M4 4l11 11', 'M20 4 9 15', 'M4 20l3-3', 'M20 20l-3-3'],
  gear: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z', 'M12 2v3', 'M12 19v3', 'M2 12h3', 'M19 12h3', 'M5 5l2 2', 'M17 17l2 2', 'M19 5l-2 2', 'M7 17l-2 2'],
  eye: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  eyeOff: ['M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z', 'M3 3l18 18'],
  logout: ['M9 4H5v16h4', 'M16 8l4 4-4 4', 'M20 12H9'],
  chevron: 'M6 9l6 6 6-6',
  refresh: ['M20 12a8 8 0 1 1-2.3-5.7', 'M20 4v5h-5'],
  warn: ['M12 3 2 21h20z', 'M12 10v5', 'M12 18v.5'],
  plug: ['M9 7V3', 'M15 7V3', 'M7 7h10v4a5 5 0 0 1-10 0z', 'M12 16v5'],
  target: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  check: 'M5 12l5 5 9-10',
  spark: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z',
  pin: ['M9 3h6l-1 6 3 4H7l3-4z', 'M12 13v8'],
  link: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5H5V6h5'],
  cart: ['M3 4h3l2.5 11h10L21 7H7', 'M9.5 19.5h.01', 'M17.5 19.5h.01'],
  recall: ['M3 11 12 3l9 8', 'M5 10v10h14V10'],
  boots: 'M8 3h5v7l7 4v5H4v-4l4-2z',
  sword: ['M20 4 9 15', 'M7 13l4 4', 'M5 19l2-2', 'M20 4h-5', 'M20 4v5'],
  next: ['M5 12h14', 'M13 6l6 6-6 6'],
  coin: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M12 7v10', 'M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4'],
  play: 'M8 5l11 7-11 7z',
  users: ['M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M3 20c0-3 3-5 6-5s6 2 6 5', 'M16 5.5a3 3 0 0 1 0 5.5', 'M18 15c2 .6 3 2.2 3 5'],
  trend: ['M3 17l6-6 4 4 8-8', 'M15 7h6v6'],
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  globe: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M3 12h18', 'M12 3c3.5 3.5 3.5 14.5 0 18', 'M12 3c-3.5 3.5-3.5 14.5 0 18'],
}

export function icon(name, size = 16, cls = '') {
  const svg = document.createElementNS(NS, 'svg')
  for (const [k, v] of Object.entries({
    viewBox: '0 0 24 24', width: size, height: size, fill: 'none', stroke: 'currentColor',
    'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true',
    class: ('ec-ico ' + cls).trim(),
  })) svg.setAttribute(k, String(v))
  for (const d of [].concat(PATHS[name] ?? [])) {
    const p = document.createElementNS(NS, 'path')
    p.setAttribute('d', d)
    svg.append(p)
  }
  return svg
}
