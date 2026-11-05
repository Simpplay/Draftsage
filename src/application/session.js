// easy-coachless/src/application/session.js
// Punto de entrada de la sesión para presentación y casos de uso: oculta qué infraestructura la implementa.
export { login, logout, restoreSession, sessionInfo, hasPremium, isLoggedIn, api } from '../infrastructure/coachless/auth.js'
