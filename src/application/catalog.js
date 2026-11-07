// draftsage/src/application/catalog.js — nombres e iconos (campeones, runas, hechizos) para la interfaz
// Fachada de lo que implementa infrastructure/lcu/game-data.js, igual que session.js con la sesión.
import { lcuGet } from '../infrastructure/lcu/lcu-client.js'
import { createGameData } from '../infrastructure/lcu/game-data.js'

export const catalog = createGameData({ lcuGet })
