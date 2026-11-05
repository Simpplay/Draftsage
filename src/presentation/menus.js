// easy-coachless/src/presentation/menus.js — todas las pantallas del plugin, construidas con ui.js.
// Para añadir una pantalla nueva: crea aquí una función que use openDialog/openForm/openMenu
// y devuelve su handle (así quien la llame puede esperar `.result` o cerrarla).

import { openDialog, openForm, openMenu, confirm, notify, copyText, h } from './ui.js'
import { login, logout, sessionInfo } from '../application/session.js'
import { log } from '../shared/logger.js'

export const CONFIG_LINE = 'DisableWebSecurity=1'

// Pasos para activar DisableWebSecurity en Pengu. result.action: 'later' | 'never' | 'dismiss'
export function corsSetupMenu() {
  const steps = h(
    'div', { class: 'ec-box', style: 'display:none' },
    '1. Abre la carpeta de Pengu Loader (una carpeta por encima de «plugins»).', h('br'),
    '2. Abre el archivo «config» con el Bloc de notas (como administrador si está en Program Files).', h('br'),
    '3. Añade una línea nueva con ', h('code', null, CONFIG_LINE), ' y guarda.', h('br'),
    '4. Pulsa «Reiniciar cliente».',
  )
  return openDialog({
    id: 'cors-setup',
    title: 'Easy Coachless',
    body: [
      h('p', null,
        'Para consultar Coachless, Pengu necesita la opción ', h('b', null, 'DisableWebSecurity'),
        '. Desactiva la seguridad web de ', h('b', null, 'todo'),
        ' el cliente (para todos los plugins). ¿Quieres ver cómo activarla?'),
      steps,
    ],
    actions: [
      { id: 'steps', label: 'Ver pasos', keepOpen: true, onClick: () => { steps.style.display = steps.style.display === 'none' ? 'block' : 'none'; return false } },
      { id: 'copy', label: 'Copiar línea', keepOpen: true, onClick: async (d) => { d.setStatus((await copyText(CONFIG_LINE)) ? 'Copiado: ' + CONFIG_LINE : 'No se pudo copiar; escríbela a mano.'); return false } },
      { id: 'folder', label: 'Abrir carpeta de plugins', keepOpen: true, onClick: (d) => {
          try { window.openPluginsFolder() } catch (e) { log.error('openPluginsFolder falló:', e) }
          d.setStatus('Se abrió la carpeta de plugins; el archivo «config» está una carpeta más arriba.')
          return false
        } },
      { id: 'restart', label: 'Reiniciar cliente', keepOpen: true, onClick: (d) => {
          d.setStatus('Reiniciando el cliente…')
          setTimeout(() => { try { window.restartClient() } catch (e) { log.error('restartClient falló:', e); d.setStatus('No se pudo reiniciar; hazlo a mano.', 'error') } }, 400)
          return false
        } },
      { id: 'later', label: 'Ahora no' },
      { id: 'never', label: 'No volver a preguntar' },
    ],
  })
}

// Inicio de sesión. result.value = { premium } si salió bien.
export function loginMenu() {
  return openForm({
    id: 'login',
    title: 'Iniciar sesión en Coachless',
    description:
      'Usa tu cuenta de coachless.gg. La contraseña solo se envía a Coachless y no se guarda. ' +
      'El plugin conserva en tu equipo un token de sesión (caduca a los 30 días) que puedes borrar con «Cerrar sesión».',
    fields: [
      { name: 'email', label: 'Email', type: 'email', placeholder: 'tu@correo.com', required: true, autocomplete: 'username' },
      { name: 'password', label: 'Contraseña', type: 'password', required: true, autocomplete: 'current-password', focusOnError: true },
    ],
    submitLabel: 'Iniciar sesión',
    onSubmit: async ({ email, password }) => {
      const r = await login(email.trim(), password)
      if (r.ok) { notify.success('Easy Coachless: sesión iniciada'); return { premium: r.premium } }
      return r.reason === 'network'
        ? 'No se pudo conectar con Coachless. Revisa tu conexión.'
        : 'Email o contraseña incorrectos (o la cuenta no está confirmada).'
    },
  })
}

async function logoutFlow() {
  const ok = await confirm({
    id: 'logout-confirm', title: 'Cerrar sesión',
    message: 'Se borrará el token de sesión guardado en este equipo.',
    confirmLabel: 'Cerrar sesión', danger: true,
  })
  if (ok) { logout(); notify.success('Easy Coachless: sesión cerrada') }
}

// Menú principal del plugin (punto de entrada para el resto de pantallas).
export function mainMenu() {
  const s = sessionInfo()
  return openMenu({
    id: 'main',
    title: 'Easy Coachless',
    description: s.loggedIn
      ? `Sesión iniciada${s.email ? ' como ' + s.email : ''}${s.email ? ` · cuenta ${s.premium ? 'premium' : 'gratuita'}` : ''}`
      : 'Sin sesión iniciada',
    items: [
      s.loggedIn
        ? { id: 'logout', label: 'Cerrar sesión', description: 'Borra el token guardado en este equipo', onSelect: logoutFlow }
        : { id: 'login', label: 'Iniciar sesión', description: 'Con tu cuenta de coachless.gg', onSelect: loginMenu },
      { id: 'cors', label: 'Conexión con Coachless (Pengu)', description: 'Pasos para activar DisableWebSecurity', onSelect: corsSetupMenu },
    ],
  })
}
