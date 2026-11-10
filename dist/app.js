/* draftsage v1.0.5 — generado por dev/tools/release.mjs; no editar */

// src/shared/strings.js
var es = {
  "common.ok": "Aceptar",
  "common.cancel": "Cancelar",
  "common.close": "Cerrar",
  "common.done": "Listo",
  "common.missing": "Falta: {0}",
  "common.unexpected": "Error inesperado: {0}",
  "role.0": "Top",
  "role.1": "Jungla",
  "role.2": "Mid",
  "role.3": "ADC",
  "role.4": "Support",
  "role.5": "Cualquiera",
  "role.s.0": "T",
  "role.s.1": "J",
  "role.s.2": "M",
  "role.s.3": "A",
  "role.s.4": "S",
  "er.title": "L\xEDnea que crees que jugar\xE1 cada rival",
  "er.tip.none": "{0}: l\xEDnea desconocida. Clic para elegirla",
  "er.tip.manual": "{0}: {1} (la elegiste t\xFA). Clic para cambiarla",
  "er.tip.position": "{0}: {1} (la informa el cliente). Clic para cambiarla",
  "er.tip.auto": "{0}: {1} (deducida por el plugin). Clic para cambiarla",
  "er.pickFor": "L\xEDnea de {0}",
  "er.reset": "Volver al autom\xE1tico",
  "tier.3": "Gold",
  "tier.4": "Platino",
  "tier.5": "Esmeralda",
  "tier.6": "Diamante",
  "tier.7": "Master+",
  "panel.fold": "Plegar",
  "panel.unfold": "Desplegar",
  "panel.close": "Cerrar (reaparece si cambias de campe\xF3n o rival, o al empezar la partida)",
  "panel.pick": "Elige un campe\xF3n para ver runas y hechizos",
  "panel.login": "Iniciar sesi\xF3n en Coachless",
  "panel.enter": "Entrar",
  "panel.retry": "Reintentar",
  "panel.rival": "Rival para el matchup",
  "panel.inUse": "(en uso)",
  "panel.web": "Ver en coachless.gg",
  // Interfaz integrada en el Champion Select del cliente (presentation/native.js)
  "nat.close": "Cerrar",
  "nat.buildOpen": "Clic: ver la build completa (runas, hechizos, \xEDtems)",
  "nat.picksOpen": "Picks sugeridos y filtros",
  "nat.picksRival": "Mejores contra {0}",
  "nat.picksDraft": "Mejores para tu draft (iTero)",
  "nat.find": "Clic: localizarlo en la cuadr\xEDcula",
  "nat.picksNone": "A\xFAn sin sugerencias: revela a tu rival o activa el consejero (Ajustes \u2192 M\xE1s)",
  "nat.notInGrid": "No est\xE1 a la vista en la cuadr\xEDcula: despl\xE1zate o usa el buscador",
  "nat.launch": "Draftsage: ajustes (Ctrl+Shift+E)",
  "web.copied": "No se pudo abrir el navegador. Enlace copiado: {0}",
  "web.failed": "No se pudo abrir el enlace",
  "err.network": "Sin conexi\xF3n con Coachless",
  "err.forbidden": "Coachless rechaz\xF3 la consulta",
  "err.no-data": "A\xFAn no hay datos suficientes",
  "err.no-patch": "Parche actual desconocido",
  "err.auth": "Sesi\xF3n caducada",
  "err.blocked": "LoLalytics no responde (bloqueo temporal)",
  "err.http": "LoLalytics devolvi\xF3 un error",
  "err.shape": "LoLalytics cambi\xF3 su formato",
  "notice.lola-tier-fallback": "LoLalytics no sirve ese rango: se usa Esmeralda+.",
  "notice.source-fallback": "La fuente elegida fall\xF3: se us\xF3 la otra.",
  "tag.lola": "Datos de LoLalytics (parche actual)",
  "stat.tipWr": "{0} \xB7 {1} % de victorias \xB7 {2} partidas",
  "set.source": "Fuente de datos",
  "set.srcAuto": "Auto",
  "set.srcAutoTip": "Coachless si tienes sesi\xF3n (y premium para el matchup); si no o si falla, LoLalytics",
  "set.srcCoachless": "Coachless",
  "set.srcCoachlessTip": "Recomendaci\xF3n de Coachless (necesita iniciar sesi\xF3n)",
  "set.srcLola": "LoLalytics",
  "set.srcLolaTip": "Recomendaci\xF3n de LoLalytics (gratis, sin cuenta; parche actual)",
  "set.overlay": "Estad\xEDsticas",
  "set.overlayOn": "Win rate y counters sobre cada campe\xF3n: activado",
  "set.overlayOff": "Win rate y counters sobre cada campe\xF3n: desactivado",
  "ov.wr": "Win rate {0} % \xB7 nota {1}",
  "ov.pr": "Uso {0} %",
  "ov.vs": "Contra el rival: {0} % ({1} sobre su media) \xB7 {2} partidas",
  "ov.vsLow": "Contra el rival: {0} % ({1}) \xB7 pocas partidas, poco fiable ({2})",
  "ov.vsShort": "{0} % ({1}) \xB7 {2} partidas",
  "ov.counter": "Counter n\xBA {0} contra el rival",
  "ov.countersTip": "Mejores counters contra {0}",
  "mu.tag": "Matchup",
  "mu.tip": "Picks de MATCHUP: los campeones que mejor le ganan a {0} seg\xFAn LoLalytics (win rate del duelo directo).",
  "mu.tagTip": "LoLalytics: mejor win rate contra {0} en tu l\xEDnea, con partidas suficientes. Va aparte de la lista de draft.",
  "mu.pickTip": "{0} \xB7 {1} % contra {2} ({3} sobre su media) \xB7 {4} partidas",
  "mu.none": "Sin picks con estos filtros",
  "mu.noRival": "A\xFAn no se sabe qui\xE9n es el rival de tu l\xEDnea: elige a su campe\xF3n o asigna su l\xEDnea.",
  "mu.noRivalShort": "Matchup: falta tu rival",
  "mu.vsReason": "Los datos del matchup est\xE1n incompletos",
  "err.other": "Error inesperado",
  "notice.matchup-requires-premium": "El matchup requiere cuenta premium: se muestran los datos del campe\xF3n.",
  "notice.matchup-low-sample": "Hay pocas partidas de este matchup: se muestran los datos del campe\xF3n.",
  "notice.filters-downgraded": "Tu cuenta no admite alg\xFAn filtro (rango de parches, matchup o regiones): se us\xF3 uno m\xE1s simple.",
  "notice.patch-low-sample": "El \xFAltimo parche tiene pocos datos: se usa el anterior.",
  "notice.spells-adjusted": "Hechizos ajustados al modo de juego y al rol.",
  "notice.patch-range-requires-premium": "El rango de parches requiere cuenta premium: se usa solo el parche actual.",
  "apply.btn": "Aplicar",
  "apply.done": "Hecho",
  "apply.all": "Aplica las runas y, en Champion Select, los hechizos (Ctrl+Shift+A)",
  "apply.runes": "Solo las runas",
  "apply.spells": "Solo los hechizos",
  "apply.noRunes": "Faltan runas en la recomendaci\xF3n",
  "apply.champSelect": "Solo en Champion Select",
  "apply.unconfirmed": "el cliente no confirm\xF3 el cambio",
  "apply.probRunes": "Runas: {0}",
  "apply.probSpells": "Hechizos: {0}",
  "applyErr.disabled": "Aplicar est\xE1 desactivado",
  "applyErr.incomplete": "Faltan runas en la recomendaci\xF3n",
  "applyErr.invalid": "P\xE1gina no v\xE1lida",
  "applyErr.lcu": "Sin conexi\xF3n con el cliente",
  "applyErr.not-editable": "La p\xE1gina activa no es editable",
  "applyErr.no-slot": "Sin hueco: borra una p\xE1gina o usa \xABActiva\xBB en ajustes",
  "applyErr.rejected": "Rechazado por el cliente",
  "applyErr.not-in-champ-select": "Solo en la selecci\xF3n de campe\xF3n",
  "tag.patch": "Parche",
  "tag.tier": "Rango de la lobby",
  "tag.tierManual": "Rango de Elo elegido por ti",
  "tag.regions": "Regiones elegidas por ti: {0}",
  "tag.matchup": "Datos del matchup",
  "tag.sim": "Simulaci\xF3n manual",
  "conf.1": "baja",
  "conf.2": "media",
  "conf.3": "alta",
  "conf.tip": "Fiabilidad {1}: {0} partidas analizadas",
  "lowdata": "Pocas partidas: poco fiable",
  "stat.tip": "{0} \xB7 WPA {1} \xB7 {2} partidas",
  "stat.share": " \xB7 {0} % de uso",
  "alt.keystones": "Otras runas clave: clic para elegir",
  "alt.auto": " (recomendada)",
  "alt.spells": "Cambiar hechizo",
  "alt.reset": "Volver a la recomendaci\xF3n",
  "pin.off": "Fijar mi elecci\xF3n para este campe\xF3n y rol",
  "pin.on": "Fijado: se usar\xE1 siempre. Clic para quitarlo",
  "items.starters": "Inicio",
  "items.early": "Primera vuelta",
  "items.boots": "Botas",
  "items.core": "N\xFAcleo y siguientes",
  "items.options": "Alternativas",
  "items.situational": "Situacionales",
  "items.tip": "Build {0} \xB7 {1} % de victorias \xB7 {2} partidas",
  "items.tipNoTier": "Build \xB7 {1} % de victorias \xB7 {2} partidas",
  "items.fallback": "No hay una build con esta runa clave: son los \xEDtems de la build m\xE1s usada",
  "items.game": "En partida: Alt+Tab al cliente para ver los \xEDtems",
  "live.gold": "Oro: {0}",
  "live.own": "{0}: ya lo tienes",
  "live.next": "Siguiente: {0} \xB7 te faltan {1} de oro",
  "live.ready": "Siguiente: {0} \xB7 \xA1ya puedes comprarlo!",
  "set.premium": "Premium",
  "set.free": "Gratis",
  "set.enter": "Entrar",
  "set.enterTip": "Iniciar sesi\xF3n en Coachless",
  "set.logout": "Cerrar sesi\xF3n",
  "set.apply": "Aplicar",
  "set.applyOn": "Aplicar activado: los botones del panel escriben runas y hechizos en el cliente",
  "set.applyOff": "Aplicar desactivado: el panel solo muestra la recomendaci\xF3n",
  "set.runes": "Runas",
  "set.own": "Propia",
  "set.ownTip": "P\xE1gina propia \xAB[DS] \u2026\xBB: no toca tus p\xE1ginas de runas",
  "set.current": "Activa",
  "set.currentTip": "Reemplaza el contenido de la p\xE1gina de runas activa",
  "set.elo": "Rango de Elo",
  "set.auto": "Auto",
  "set.eloAutoTip": "Autom\xE1tico: el rango de tu lobby y los contiguos",
  "set.eloTip": "Incluir o quitar {0} del rango de Elo",
  "set.patches": "Parches",
  "set.patchAutoTip": "Autom\xE1tico: el \xFAltimo parche con datos (y el anterior con premium)",
  "set.patchCurrent": "Actual",
  "set.patchCurrentTip": "Solo el \xFAltimo parche con datos suficientes",
  "set.patchPlusTip": "El \xFAltimo parche y los {0} anterior(es) (premium)",
  "set.premiumOnly": "Requiere cuenta premium",
  "set.regions": "Regiones",
  "set.regionsAll": "Todas",
  "set.regionsAllTip": "Todas las regiones (lo mismo que la web de Coachless por defecto)",
  "set.regionsPick": "Elegir",
  "set.regionsPickTip": "Elegir regiones concretas: Coachless usa todas las elegidas; iTero, solo si eliges una; LoLalytics usa siempre todas",
  "set.regionTip": "Incluir o quitar {0}",
  "set.flash": "Destello",
  "set.flashKey": "Destello en la tecla {0}",
  "set.more": "M\xE1s",
  "set.moreTip": "M\xE1s opciones",
  "set.simulate": "Simular",
  "set.simulateTip": "Ver runas de un matchup sin estar en partida",
  "set.exit": "Salir",
  "set.exitTip": "Quitar la simulaci\xF3n y volver al Champion Select real",
  "set.panel": "Panel",
  "set.panelHide": "Ocultar el panel en Champion Select",
  "set.panelShow": "Mostrar el panel en Champion Select",
  "set.conn": "Conexi\xF3n",
  "set.connTip": "Pasos para activar DisableWebSecurity en Pengu",
  "set.lang": "Idioma",
  "set.langTip": "Idioma: espa\xF1ol (clic para cambiar a ingl\xE9s)",
  "cors.intro": "Para consultar Coachless, Pengu necesita la opci\xF3n **DisableWebSecurity**. Desactiva la seguridad web de **todo** el cliente (para todos los plugins). \xBFQuieres ver c\xF3mo activarla?",
  "cors.step1": "1. Abre la carpeta de Pengu Loader (una carpeta por encima de \xABplugins\xBB).",
  "cors.step2": "2. Abre el archivo \xABconfig\xBB con el Bloc de notas (como administrador si est\xE1 en Program Files).",
  "cors.step3": "3. A\xF1ade una l\xEDnea nueva con `DisableWebSecurity=1` y guarda.",
  "cors.step4": "4. Pulsa \xABReiniciar cliente\xBB.",
  "cors.btnSteps": "Ver pasos",
  "cors.btnCopy": "Copiar l\xEDnea",
  "cors.copied": "Copiado: {0}",
  "cors.copyFail": "No se pudo copiar; escr\xEDbela a mano.",
  "cors.btnFolder": "Abrir carpeta de plugins",
  "cors.folderDone": "Se abri\xF3 la carpeta de plugins; el archivo \xABconfig\xBB est\xE1 una carpeta m\xE1s arriba.",
  "cors.btnRestart": "Reiniciar cliente",
  "cors.restarting": "Reiniciando el cliente\u2026",
  "cors.restartFail": "No se pudo reiniciar; hazlo a mano.",
  "cors.later": "Ahora no",
  "cors.never": "No volver a preguntar",
  "login.title": "Iniciar sesi\xF3n en Coachless",
  "login.desc": "Usa tu cuenta de coachless.gg. La contrase\xF1a solo se env\xEDa a Coachless y no se guarda. El plugin conserva en tu equipo un token de sesi\xF3n (caduca a los 30 d\xEDas) que puedes borrar con \xABCerrar sesi\xF3n\xBB.",
  "login.email": "Email",
  "login.emailPh": "tu@correo.com",
  "login.password": "Contrase\xF1a",
  "login.submit": "Iniciar sesi\xF3n",
  "login.ok": "Draftsage: sesi\xF3n iniciada",
  "login.errNetwork": "No se pudo conectar con Coachless. Revisa tu conexi\xF3n.",
  "login.errBad": "Email o contrase\xF1a incorrectos (o la cuenta no est\xE1 confirmada).",
  "logout.title": "Cerrar sesi\xF3n",
  "logout.msg": "Se borrar\xE1 el token de sesi\xF3n guardado en este equipo.",
  "logout.btn": "Cerrar sesi\xF3n",
  "logout.ok": "Draftsage: sesi\xF3n cerrada",
  "sim.title": "Ver runas de un matchup",
  "sim.desc": "Prueba la recomendaci\xF3n sin estar en Champion Select. El rival, el rol y el rango son opcionales.",
  "sim.champion": "Tu campe\xF3n",
  "sim.opponent": "Rival (solo cuentas premium)",
  "sim.role": "Rol",
  "sim.rolePh": "top, jungla, mid, adc, support",
  "sim.tier": "Rango de la lobby",
  "sim.tierPh": "oro, platino, esmeralda, diamante, master",
  "sim.submit": "Ver runas",
  "sim.searching": "Buscando\u2026",
  "sim.notFound": "No encuentro el campe\xF3n \xAB{0}\xBB.",
  "sim.notLoaded": "El cliente a\xFAn no ha cargado la lista de campeones; int\xE9ntalo en unos segundos.",
  "sim.oppNotFound": "No encuentro el rival \xAB{0}\xBB.",
  "sim.badRole": "Rol no v\xE1lido (top, jungla, mid, adc, support).",
  "sim.badTier": "Rango no v\xE1lido (oro, platino, esmeralda, diamante, master).",
  "consent.title": "Aplicar en el cliente",
  "consent.msg": "Al pulsar \xABAplicar\xBB, Draftsage escribir\xE1 en tu cliente de League la p\xE1gina de runas y los hechizos recomendados. Solo act\xFAa cuando t\xFA pulsas el bot\xF3n (o Ctrl+Shift+A), nunca de forma autom\xE1tica. Usa la API interna del cliente, que no es oficial: revisa las pol\xEDticas de Riot y de Pengu Loader antes de activarlo y \xFAsalo bajo tu responsabilidad. Por defecto solo toca una p\xE1gina propia llamada \xAB[DS] \u2026\xBB. Puedes desactivarlo en el men\xFA.",
  "consent.btn": "Activar y aplicar",
  "adv.tag": "iTero",
  "adv.tagTip": "Picks de DRAFT de iTero seg\xFAn la composici\xF3n completa de ambos equipos. Son puntos relativos, no probabilidades de victoria.",
  "adv.tagLola": "Contrastado con el matchup de LoLalytics: \u2713 coinciden, \u26A0 discrepan (no cambia el orden)",
  "adv.masteryOn": "Incluye tu maestr\xEDa de campeones (iTero)",
  "adv.masteryErr": "Maestr\xEDa no disponible: {0}",
  "adv.mastery": "Tu maestr\xEDa: {0} puntos",
  "mastery.err.identity": "no se pudo leer tu Riot ID del cliente",
  "mastery.err.not-found": "iTero no conoce tu Riot ID",
  "mastery.err.blocked": "iTero no responde (bloqueo temporal)",
  "mastery.err.network": "sin conexi\xF3n con iTero",
  "mastery.err.http": "iTero devolvi\xF3 un error",
  "mastery.err.shape": "iTero cambi\xF3 su formato",
  "adv.pickTip": "{0} \xB7 {1} puntos relativos \xB7 {2} partidas",
  "adv.agree": "Ambas fuentes lo ven bien",
  "adv.conflict": "Discrepan: encaja en la composici\xF3n, pero el matchup es malo",
  "adv.vs": "Contra {0}: {1} % ({2} sobre su media) \xB7 {3} partidas",
  "adv.syn": "Sinergia con {0}: {1} %",
  "adv.ctr": "Va bien contra {0}: {1} %",
  "adv.weak": "D\xE9bil contra {0}: {1} %",
  "adv.scale": "Mejora el equipo {0}: {1} %",
  "adv.phase.early": "al inicio",
  "adv.phase.mid": "a mitad de partida",
  "adv.phase.late": "al final",
  "adv.dmg.ad": "Da\xF1o del equipo muy f\xEDsico (AD)",
  "adv.dmg.ap": "Da\xF1o del equipo muy m\xE1gico (AP)",
  "adv.dmg.balanced": "Da\xF1o del equipo equilibrado (AD/AP)",
  "adv.none": "Sin sugerencias con estos filtros",
  "adv.err.network": "iTero sin conexi\xF3n",
  "adv.err.blocked": "iTero no responde (bloqueo temporal)",
  "adv.err.http": "iTero devolvi\xF3 un error",
  "adv.err.shape": "iTero cambi\xF3 su formato",
  "adv.err.limit": "Tope de consultas de esta selecci\xF3n",
  "adv.unrecognized": "iTero no reconoci\xF3 alg\xFAn campe\xF3n: sugerencias poco fiables",
  "adv.sideAssumed": "El cliente no inform\xF3 tu lado: se asume el azul",
  "advisor.title": "Picks de draft (iTero)",
  "advisor.msg": "El consejero env\xEDa a iTero (itero.gg), un servicio de terceros, la composici\xF3n del draft: los campeones ya revelados de ambos equipos, los bans, tu l\xEDnea, el lado y el rango de la lobby. No env\xEDa tu cuenta, tu Riot ID ni datos personales. Usa una API privada de iTero que no es oficial ni est\xE1 documentada: puede dejar de funcionar sin aviso y no tenemos su autorizaci\xF3n expresa, as\xED que revisa sus condiciones y \xFAsalo bajo tu responsabilidad. Tambi\xE9n consulta LoLalytics (win rates) y Data Dragon de Riot (nombres de campeones). Solo muestra sugerencias; no elige ni cambia nada por ti. Puedes desactivarlo en Ajustes \u2192 M\xE1s.",
  "advisor.btn": "Activar el consejero",
  "mastery.title": "Maestr\xEDa de campeones",
  "mastery.msg": "Para pesar tus campeones, el plugin env\xEDa tu **Riot ID** (nombre, etiqueta y regi\xF3n) a iTero (itero.gg), un servicio de terceros, y recibe tu maestr\xEDa por campe\xF3n. Solo se guarda en memoria mientras el cliente est\xE1 abierto; no se env\xEDa tu cuenta de Coachless ni nada m\xE1s. Usa una API privada de iTero que no es oficial ni est\xE1 documentada: puede dejar de funcionar sin aviso y no tenemos su autorizaci\xF3n expresa, as\xED que \xFAsalo bajo tu responsabilidad. Tambi\xE9n sirve para el filtro \xABDominio\xBB. Puedes apagarlo en Ajustes \u2192 M\xE1s.",
  "mastery.btn": "Activar la maestr\xEDa",
  "flt.btn": "Filtros",
  "flt.title": "Filtros de campeones: deja a la vista solo los que buscas",
  "flt.active": "{0} filtro(s) activo(s)",
  "flt.reset": "Quitar todos los filtros",
  "flt.class": "Clase",
  "flt.mastery": "Dominio",
  "flt.matchup": "Matchup",
  "flt.meta": "Meta",
  "flt.phase": "Fase",
  "flt.damage": "Da\xF1o",
  "flt.any": "Todos",
  "flt.class.fighter": "Luchador",
  "flt.class.tank": "Tanque",
  "flt.class.mage": "Mago",
  "flt.class.marksman": "Tirador",
  "flt.class.assassin": "Asesino",
  "flt.class.support": "Soporte",
  "flt.mastery.played": "Jugados",
  "flt.mastery.pool": "Pool",
  "flt.mastery.main": "Main",
  "flt.mastery.tip": "Seg\xFAn tu maestr\xEDa (puntos m\xEDnimos: {0})",
  "flt.matchup.favorable": "Favorable",
  "flt.matchup.counter": "Counter",
  "flt.meta.strong": "Fuertes",
  "flt.phase.early": "Inicio",
  "flt.phase.mid": "Medio",
  "flt.phase.late": "Final",
  "flt.damage.ad": "AD",
  "flt.damage.ap": "AP",
  "flt.damage.balanced": "Mixto",
  "flt.tip.favorable": "Ganan m\xE1s del 50 % contra el rival de tu l\xEDnea",
  "flt.tip.counter": "Entre los mejores counters contra el rival de tu l\xEDnea",
  "flt.tip.strong": "Nota S+ \u2026 A- en tu l\xEDnea ahora mismo (LoLalytics)",
  "flt.tip.early": "Mejoran al equipo al inicio de la partida (iTero)",
  "flt.tip.mid": "Mejoran al equipo a mitad de la partida (iTero)",
  "flt.tip.late": "Mejoran al equipo al final de la partida (iTero)",
  "flt.tip.ad": "Dejan el da\xF1o del equipo muy f\xEDsico (iTero)",
  "flt.tip.ap": "Dejan el da\xF1o del equipo muy m\xE1gico (iTero)",
  "flt.tip.balanced": "Dejan el da\xF1o del equipo equilibrado (iTero)",
  "flt.off.mastery": "Necesita tu maestr\xEDa: act\xEDvala en Ajustes \u2192 M\xE1s \u2192 Maestr\xEDa",
  "flt.off.matchup": "Necesita saber el rival de tu l\xEDnea",
  "flt.off.meta": "Necesita las estad\xEDsticas de la l\xEDnea (LoLalytics)",
  "flt.off.itero": "Necesita los picks de draft de iTero (Ajustes \u2192 M\xE1s \u2192 Picks)",
  "set.advisor": "Picks",
  "set.advisorOn": "Picks de draft (iTero): activado",
  "set.advisorOff": "Picks de draft (iTero): desactivado",
  "set.resetPos": "Posici\xF3n",
  "set.resetPosTip": "Devolver el panel arriba a la derecha (si qued\xF3 fuera de alcance)",
  "set.mastery": "Maestr\xEDa (iTero)",
  "set.masteryTip": "Tu maestr\xEDa de campeones pesa en los picks de draft de iTero y en el filtro \xABDominio\xBB. Env\xEDa tu Riot ID a iTero.",
  "set.masteryOff": "No",
  "set.masteryLow": "Baja",
  "set.masteryNormal": "Normal",
  "set.masteryHigh": "Alta",
  "set.masteryWeightTip": "Peso de tu maestr\xEDa: {0}",
  "set.updates": "Actualizaciones",
  "set.updatesTip": "Versi\xF3n {0} ({1}). \xABAuto\xBB descarga versiones firmadas y las usa al reiniciar el cliente.",
  "set.restartClient": "Reiniciar cliente",
  "set.updAuto": "Auto",
  "set.updAutoTip": "Descarga versiones nuevas (verificadas con firma) y las usa en el siguiente arranque",
  "set.updPackaged": "Solo incluida",
  "set.updPackagedTip": "Usa solo el c\xF3digo incluido en el plugin; no busca ni descarga nada",
  "set.updRestart": "Reinicia el cliente para aplicar el cambio",
  "set.updSrcRemote": "descargada",
  "set.updSrcPackaged": "incluida",
  "upd.updated": "Draftsage se actualiz\xF3 a la versi\xF3n {0}",
  "upd.ready": "Draftsage {0} descargada: se aplicar\xE1 al reiniciar el cliente",
  "upd.reinstall": "Hay una versi\xF3n nueva de Draftsage que exige reinstalar el plugin",
  "build.shards": "Fragmentos",
  "build.spells": "Hechizos",
  "build.origin.auto": "Recomendada",
  "build.origin.autoTip": "P\xE1gina recomendada por Draftsage con los datos de la fuente",
  "build.origin.custom": "Elegida por ti",
  "build.origin.customTip": "Cambiaste la runa clave o un hechizo; el resto de la p\xE1gina sigue los datos para esa elecci\xF3n",
  "build.origin.pinned": "Fijada",
  "build.origin.pinnedTip": "Tu elecci\xF3n fijada para este campe\xF3n y rol (\u{1F4CC} para quitarla)",
  "build.reset": "Recomendada",
  "build.resetTip": "Volver a la p\xE1gina recomendada",
  "build.scope.matchup": "contra {0}",
  "build.scope.matchupTip": "Datos espec\xEDficos de este matchup (contra {0})",
  "build.scope.general": "general",
  "build.scope.generalTip": "Datos del campe\xF3n en tu rol sin tener en cuenta al rival",
  "build.altLegend": "% = uso entre {0} partidas \xB7 ordenadas por WPA (aporte a la victoria), no por win rate",
  "ds.title": "Recomendaci\xF3n",
  "ds.alts": "Alternativas",
  "ds.perspective": "Perspectiva de la recomendaci\xF3n",
  "ds.p.auto": "Auto",
  "ds.p.lane": "L\xEDnea",
  "ds.p.team": "Equipo",
  "ds.p.autoTip": "Autom\xE1tico: si ya se sabe tu rival de l\xEDnea, manda el matchup; si no, el encaje con el equipo",
  "ds.p.laneTip": "Counter de l\xEDnea: el mejor enfrentamiento contra tu rival directo (LoLalytics)",
  "ds.p.teamTip": "Encaje con el equipo: sinergia con tus aliados y respuesta a los rivales revelados (iTero)",
  "ds.p.offTip": "Sin datos para esta perspectiva todav\xEDa",
  "ds.locate": "Localizar",
  "ds.locateFor": "Localizar a {0} en la cuadr\xEDcula",
  "ds.locateTip": "Desplaza la cuadr\xEDcula hasta su ficha y la resalta. No lo elige por ti",
  "ds.whyFor": "Por qu\xE9 {0}",
  "ds.yourRival": "tu rival",
  "ds.games": "{0} partidas",
  "ds.why.best-team": "mejor encaje con el equipo",
  "ds.why.best-lane": "mejor matchup",
  "ds.why.next-lane": "otro buen matchup",
  "ds.why.next-team": "otra buena opci\xF3n para el equipo",
  "ds.why.comfort": "tu campe\xF3n",
  "ds.r.lane": "{0} % contra {1} ({2} sobre su media)",
  "ds.r.laneNoBase": "{0} % contra {1}",
  "ds.r.general": "Gana sobre todo por fuerza general: su ventaja en este matchup es peque\xF1a",
  "ds.r.team": "Encaja con tu equipo ({0} puntos relativos)",
  "ds.r.teamBad": "Encaja peor que la media con tu equipo ({0} puntos relativos)",
  "ds.r.syn": "Sinergia con {0} ({1} %)",
  "ds.r.ctr": "Va bien contra {0} ({1} %)",
  "ds.r.weak": "D\xE9bil contra {0} ({1} %)",
  "ds.r.scale": "Mejora al equipo {0}",
  "ds.r.disagree": "LoLalytics e iTero no coinciden con este campe\xF3n",
  "ds.r.agree": "Las dos fuentes lo ven bien",
  "ds.r.comfort": "Lo dominas ({0} puntos de maestr\xEDa)",
  "ds.ev.statistical": "dato",
  "ds.ev.statisticalTip": "Estad\xEDstica observada en partidas reales",
  "ds.ev.model": "modelo",
  "ds.ev.modelTip": "Predicci\xF3n del modelo de iTero, solo comparable dentro de esta recomendaci\xF3n (no es un win rate)",
  "ds.ev.heuristic": "regla",
  "ds.ev.heuristicTip": "Regla de Draftsage a partir de los datos, no una estad\xEDstica",
  "ds.conf.high": "Muestra suficiente",
  "ds.conf.highTip": "El dato del matchup se apoya en bastantes partidas",
  "ds.conf.medium": "Muestra limitada",
  "ds.conf.mediumTip": "El dato del matchup tiene pocas partidas: t\xF3malo como orientaci\xF3n",
  "ds.conf.low": "Pocos datos",
  "ds.conf.lowTip": "Muy pocas partidas: no es una recomendaci\xF3n fuerte",
  "ds.conf.model": "Predicci\xF3n",
  "ds.conf.modelTip": "Solo hay la predicci\xF3n del modelo de iTero, sin estad\xEDstica del matchup",
  "tc.allies": "Tu equipo",
  "tc.enemies": "Rivales",
  "tc.slot": "{0}: {1} ({2})",
  "tc.empty": "{0}: sin campe\xF3n todav\xEDa",
  "tc.unplaced": "+{0} sin l\xEDnea",
  "tc.st.self": "t\xFA",
  "tc.st.confirmed": "l\xEDnea informada por el cliente",
  "tc.st.manual": "l\xEDnea elegida por ti",
  "tc.st.inferred": "l\xEDnea deducida por Draftsage, puede no ser la real",
  "tc.st.empty": "vac\xEDo",
  "tc.legend": "Borde dorado: t\xFA o elegida por ti \xB7 continuo: la informa el cliente \xB7 discontinuo con \xAB?\xBB: deducida",
  "set.sec.general": "General",
  "set.sec.generalDesc": "Qu\xE9 se muestra en Champion Select y en qu\xE9 idioma.",
  "set.sec.data": "Datos",
  "set.sec.dataDesc": "De d\xF3nde salen las runas, hechizos e \xEDtems, y qu\xE9 partidas se cuentan.",
  "set.sec.advisor": "Consejero",
  "set.sec.advisorDesc": "Sugerencias de campe\xF3n seg\xFAn la composici\xF3n (iTero). Apagado hasta que aceptes: los campeones del draft se env\xEDan a iTero.",
  "set.sec.apply": "Aplicaci\xF3n",
  "set.sec.applyDesc": "Poner la p\xE1gina de runas y los hechizos en el cliente. Siempre con un clic tuyo; nunca autom\xE1tico.",
  "set.sec.advanced": "Avanzado",
  "set.sec.advancedDesc": "Simulaci\xF3n, diagn\xF3stico de conexi\xF3n y actualizaciones.",
  "set.d.source": "Auto usa Coachless si has iniciado sesi\xF3n; LoLalytics si no, si pides un matchup sin premium o si Coachless falla.",
  "set.d.elo": "Auto usa el rango de tu lobby (\xB11, m\xEDnimo Gold). Pulsa rangos para fijar los tuyos.",
  "set.d.advisor": "Al encenderlo ver\xE1s el aviso de privacidad antes de enviar nada.",
  "set.d.mastery": "Opcional: tus campeones pesan m\xE1s. Env\xEDa tu Riot ID a iTero (con aviso previo).",
  "set.d.apply": "Desactivado de inicio. Al activarlo ver\xE1s el aviso de pol\xEDticas de Riot/Pengu.",
  "set.d.shortcuts": "Atajos: Ctrl+Shift+A aplica lo que ves \xB7 Ctrl+Shift+E abre estos ajustes."
};
var en = {
  "common.ok": "OK",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.done": "Done",
  "common.missing": "Missing: {0}",
  "common.unexpected": "Unexpected error: {0}",
  "role.0": "Top",
  "role.1": "Jungle",
  "role.2": "Mid",
  "role.3": "ADC",
  "role.4": "Support",
  "role.5": "Any",
  "role.s.0": "T",
  "role.s.1": "J",
  "role.s.2": "M",
  "role.s.3": "A",
  "role.s.4": "S",
  "er.title": "Lane you think each opponent will play",
  "er.tip.none": "{0}: unknown lane. Click to choose it",
  "er.tip.manual": "{0}: {1} (chosen by you). Click to change it",
  "er.tip.position": "{0}: {1} (reported by the client). Click to change it",
  "er.tip.auto": "{0}: {1} (deduced by the plugin). Click to change it",
  "er.pickFor": "Lane of {0}",
  "er.reset": "Back to automatic",
  "tier.3": "Gold",
  "tier.4": "Platinum",
  "tier.5": "Emerald",
  "tier.6": "Diamond",
  "tier.7": "Master+",
  "panel.fold": "Collapse",
  "panel.unfold": "Expand",
  "panel.close": "Close (it comes back if you change champion or opponent, or when the game starts)",
  "panel.pick": "Pick a champion to see runes and spells",
  "panel.login": "Sign in to Coachless",
  "panel.enter": "Sign in",
  "panel.retry": "Retry",
  "panel.rival": "Opponent for the matchup",
  "panel.inUse": "(in use)",
  "panel.web": "Open on coachless.gg",
  "nat.close": "Close",
  "nat.buildOpen": "Click: show the full build (runes, spells, items)",
  "nat.picksOpen": "Suggested picks and filters",
  "nat.picksRival": "Best against {0}",
  "nat.picksDraft": "Best for your draft (iTero)",
  "nat.find": "Click: find it in the grid",
  "nat.picksNone": "No suggestions yet: reveal your opponent or turn on the advisor (Settings \u2192 More)",
  "nat.notInGrid": "Not visible in the grid: scroll or use the search box",
  "nat.launch": "Draftsage settings (Ctrl+Shift+E)",
  "web.copied": "Could not open the browser. Link copied: {0}",
  "web.failed": "Could not open the link",
  "err.network": "No connection to Coachless",
  "err.forbidden": "Coachless rejected the request",
  "err.no-data": "Not enough data yet",
  "err.no-patch": "Current patch unknown",
  "err.auth": "Session expired",
  "err.blocked": "LoLalytics is not responding (temporary block)",
  "err.http": "LoLalytics returned an error",
  "err.shape": "LoLalytics changed its format",
  "notice.lola-tier-fallback": "LoLalytics does not serve that rank: Emerald+ is used.",
  "notice.source-fallback": "The chosen source failed: the other one was used.",
  "tag.lola": "LoLalytics data (current patch)",
  "stat.tipWr": "{0} \xB7 {1} % win rate \xB7 {2} games",
  "set.source": "Data source",
  "set.srcAuto": "Auto",
  "set.srcAutoTip": "Coachless if you are signed in (premium for matchups); otherwise, or if it fails, LoLalytics",
  "set.srcCoachless": "Coachless",
  "set.srcCoachlessTip": "Coachless recommendation (needs sign-in)",
  "set.srcLola": "LoLalytics",
  "set.srcLolaTip": "LoLalytics recommendation (free, no account; current patch)",
  "set.overlay": "Stats",
  "set.overlayOn": "Win rate and counters over each champion: on",
  "set.overlayOff": "Win rate and counters over each champion: off",
  "ov.wr": "Win rate {0} % \xB7 grade {1}",
  "ov.pr": "Pick rate {0} %",
  "ov.vs": "Vs. the opponent: {0} % ({1} over their average) \xB7 {2} games",
  "ov.vsLow": "Vs. the opponent: {0} % ({1}) \xB7 few games, unreliable ({2})",
  "ov.vsShort": "{0} % ({1}) \xB7 {2} games",
  "ov.counter": "Counter #{0} against the opponent",
  "ov.countersTip": "Best counters against {0}",
  "mu.tag": "Matchup",
  "mu.tip": "MATCHUP picks: the champions that beat {0} best according to LoLalytics (head-to-head win rate).",
  "mu.tagTip": "LoLalytics: best win rate against {0} in your lane, with enough games. Separate from the draft list.",
  "mu.pickTip": "{0} \xB7 {1} % against {2} ({3} over its average) \xB7 {4} games",
  "mu.none": "No picks with these filters",
  "mu.noRival": "We don't know your lane opponent yet: pick their champion or set their lane.",
  "mu.noRivalShort": "Matchup: opponent needed",
  "mu.vsReason": "The matchup data is incomplete",
  "err.other": "Unexpected error",
  "notice.matchup-requires-premium": "Matchup data needs a premium account: champion data is shown.",
  "notice.matchup-low-sample": "Few games for this matchup: champion data is shown.",
  "notice.filters-downgraded": "Your account does not support a filter (patch range, matchup or regions): a simpler one was used.",
  "notice.patch-low-sample": "The latest patch has little data: the previous one is used.",
  "notice.spells-adjusted": "Spells adjusted to the game mode and role.",
  "notice.patch-range-requires-premium": "Patch ranges need a premium account: only the current patch is used.",
  "apply.btn": "Apply",
  "apply.done": "Done",
  "apply.all": "Applies the runes and, in Champion Select, the spells (Ctrl+Shift+A)",
  "apply.runes": "Runes only",
  "apply.spells": "Spells only",
  "apply.noRunes": "The recommendation has missing runes",
  "apply.champSelect": "Only in Champion Select",
  "apply.unconfirmed": "the client did not confirm the change",
  "apply.probRunes": "Runes: {0}",
  "apply.probSpells": "Spells: {0}",
  "applyErr.disabled": "Apply is turned off",
  "applyErr.incomplete": "The recommendation has missing runes",
  "applyErr.invalid": "Invalid page",
  "applyErr.lcu": "No connection to the client",
  "applyErr.not-editable": "The active page is not editable",
  "applyErr.no-slot": 'No free slot: delete a page or use "Active" in settings',
  "applyErr.rejected": "Rejected by the client",
  "applyErr.not-in-champ-select": "Only during champion select",
  "tag.patch": "Patch",
  "tag.tier": "Lobby rank",
  "tag.tierManual": "Rank range chosen by you",
  "tag.regions": "Regions chosen by you: {0}",
  "tag.matchup": "Matchup data",
  "tag.sim": "Manual simulation",
  "conf.1": "low",
  "conf.2": "medium",
  "conf.3": "high",
  "conf.tip": "Reliability {1}: {0} games analyzed",
  "lowdata": "Few games: unreliable",
  "stat.tip": "{0} \xB7 WPA {1} \xB7 {2} games",
  "stat.share": " \xB7 {0}% pick rate",
  "alt.keystones": "Other keystones: click to pick",
  "alt.auto": " (recommended)",
  "alt.spells": "Swap spell",
  "alt.reset": "Back to the recommendation",
  "pin.off": "Pin my choice for this champion and role",
  "pin.on": "Pinned: always used. Click to remove",
  "items.starters": "Start",
  "items.early": "First back",
  "items.boots": "Boots",
  "items.core": "Core and next",
  "items.options": "Alternatives",
  "items.situational": "Situational",
  "items.tip": "Build {0} \xB7 {1}% win rate \xB7 {2} games",
  "items.tipNoTier": "Build \xB7 {1}% win rate \xB7 {2} games",
  "items.fallback": "No build uses this keystone: these are the items of the most played build",
  "items.game": "In game: Alt+Tab to the client to see your items",
  "live.gold": "Gold: {0}",
  "live.own": "{0}: you already have it",
  "live.next": "Next: {0} \xB7 you need {1} more gold",
  "live.ready": "Next: {0} \xB7 you can buy it now!",
  "set.premium": "Premium",
  "set.free": "Free",
  "set.enter": "Sign in",
  "set.enterTip": "Sign in to Coachless",
  "set.logout": "Sign out",
  "set.apply": "Apply",
  "set.applyOn": "Apply is on: the panel buttons write runes and spells to the client",
  "set.applyOff": "Apply is off: the panel only shows the recommendation",
  "set.runes": "Runes",
  "set.own": "Own",
  "set.ownTip": 'Own page "[DS] \u2026": your rune pages are not touched',
  "set.current": "Active",
  "set.currentTip": "Replaces the contents of the active rune page",
  "set.elo": "Rank range",
  "set.auto": "Auto",
  "set.eloAutoTip": "Automatic: your lobby rank and the adjacent ones",
  "set.eloTip": "Include or remove {0} from the rank range",
  "set.patches": "Patches",
  "set.patchAutoTip": "Automatic: the latest patch with data (plus the previous one with premium)",
  "set.patchCurrent": "Current",
  "set.patchCurrentTip": "Only the latest patch with enough data",
  "set.patchPlusTip": "The latest patch and the {0} before it (premium)",
  "set.premiumOnly": "Needs a premium account",
  "set.regions": "Regions",
  "set.regionsAll": "All",
  "set.regionsAllTip": "All regions (same as the Coachless website by default)",
  "set.regionsPick": "Choose",
  "set.regionsPickTip": "Choose specific regions: Coachless uses all you pick; iTero, only if you pick one; LoLalytics always uses all",
  "set.regionTip": "Include or remove {0}",
  "set.flash": "Flash",
  "set.flashKey": "Flash on key {0}",
  "set.more": "More",
  "set.moreTip": "More options",
  "set.simulate": "Simulate",
  "set.simulateTip": "See the runes for a matchup without being in a game",
  "set.exit": "Exit",
  "set.exitTip": "Drop the simulation and go back to the real champion select",
  "set.panel": "Panel",
  "set.panelHide": "Hide the panel in champion select",
  "set.panelShow": "Show the panel in champion select",
  "set.conn": "Connection",
  "set.connTip": "Steps to enable DisableWebSecurity in Pengu",
  "set.lang": "Language",
  "set.langTip": "Language: English (click to switch to Spanish)",
  "cors.intro": "To query Coachless, Pengu needs the **DisableWebSecurity** option. It turns off web security for **the whole** client (for every plugin). Want to see how to enable it?",
  "cors.step1": '1. Open the Pengu Loader folder (one level above "plugins").',
  "cors.step2": '2. Open the "config" file with Notepad (as administrator if it is in Program Files).',
  "cors.step3": "3. Add a new line with `DisableWebSecurity=1` and save.",
  "cors.step4": '4. Click "Restart client".',
  "cors.btnSteps": "Show steps",
  "cors.btnCopy": "Copy line",
  "cors.copied": "Copied: {0}",
  "cors.copyFail": "Could not copy; type it by hand.",
  "cors.btnFolder": "Open plugins folder",
  "cors.folderDone": 'The plugins folder was opened; the "config" file is one folder above.',
  "cors.btnRestart": "Restart client",
  "cors.restarting": "Restarting the client\u2026",
  "cors.restartFail": "Could not restart; do it by hand.",
  "cors.later": "Not now",
  "cors.never": "Don't ask again",
  "login.title": "Sign in to Coachless",
  "login.desc": 'Use your coachless.gg account. The password is only sent to Coachless and is never stored. The plugin keeps a session token on this computer (it expires after 30 days) that you can delete with "Sign out".',
  "login.email": "Email",
  "login.emailPh": "you@mail.com",
  "login.password": "Password",
  "login.submit": "Sign in",
  "login.ok": "Draftsage: signed in",
  "login.errNetwork": "Could not reach Coachless. Check your connection.",
  "login.errBad": "Wrong email or password (or the account is not confirmed).",
  "logout.title": "Sign out",
  "logout.msg": "The session token stored on this computer will be deleted.",
  "logout.btn": "Sign out",
  "logout.ok": "Draftsage: signed out",
  "sim.title": "See the runes for a matchup",
  "sim.desc": "Try the recommendation without being in champion select. Opponent, role and rank are optional.",
  "sim.champion": "Your champion",
  "sim.opponent": "Opponent (premium accounts only)",
  "sim.role": "Role",
  "sim.rolePh": "top, jungle, mid, adc, support",
  "sim.tier": "Lobby rank",
  "sim.tierPh": "gold, platinum, emerald, diamond, master",
  "sim.submit": "Show runes",
  "sim.searching": "Searching\u2026",
  "sim.notFound": 'I cannot find the champion "{0}".',
  "sim.notLoaded": "The client has not loaded the champion list yet; try again in a few seconds.",
  "sim.oppNotFound": 'I cannot find the opponent "{0}".',
  "sim.badRole": "Invalid role (top, jungle, mid, adc, support).",
  "sim.badTier": "Invalid rank (gold, platinum, emerald, diamond, master).",
  "consent.title": "Apply to the client",
  "consent.msg": `When you press "Apply", Draftsage writes the recommended rune page and spells to your League client. It only acts when you press the button (or Ctrl+Shift+A), never automatically. It uses the client's internal API, which is unofficial: check the Riot and Pengu Loader policies before turning it on and use it at your own risk. By default it only touches its own page called "[DS] \u2026". You can turn it off in the menu.`,
  "consent.btn": "Turn on and apply",
  "adv.tag": "iTero",
  "adv.tagTip": "DRAFT picks from iTero based on the full composition of both teams. Relative points, not win probabilities.",
  "adv.tagLola": "Cross-checked with the LoLalytics matchup: \u2713 agree, \u26A0 disagree (does not change the order)",
  "adv.masteryOn": "Includes your champion mastery (iTero)",
  "adv.masteryErr": "Mastery unavailable: {0}",
  "adv.mastery": "Your mastery: {0} points",
  "mastery.err.identity": "could not read your Riot ID from the client",
  "mastery.err.not-found": "iTero does not know your Riot ID",
  "mastery.err.blocked": "iTero is not responding (temporary block)",
  "mastery.err.network": "no connection to iTero",
  "mastery.err.http": "iTero returned an error",
  "mastery.err.shape": "iTero changed its format",
  "adv.pickTip": "{0} \xB7 {1} relative points \xB7 {2} games",
  "adv.agree": "Both sources like it",
  "adv.conflict": "Sources disagree: it fits the composition, but the matchup is bad",
  "adv.vs": "Against {0}: {1} % ({2} over its average) \xB7 {3} games",
  "adv.syn": "Synergy with {0}: {1} %",
  "adv.ctr": "Does well against {0}: {1} %",
  "adv.weak": "Weak against {0}: {1} %",
  "adv.scale": "Improves the team {0}: {1} %",
  "adv.phase.early": "early",
  "adv.phase.mid": "in the mid game",
  "adv.phase.late": "late",
  "adv.dmg.ad": "Team damage is mostly physical (AD)",
  "adv.dmg.ap": "Team damage is mostly magic (AP)",
  "adv.dmg.balanced": "Balanced team damage (AD/AP)",
  "adv.none": "No suggestions with these filters",
  "adv.err.network": "iTero is unreachable",
  "adv.err.blocked": "iTero is not responding (temporary block)",
  "adv.err.http": "iTero returned an error",
  "adv.err.shape": "iTero changed its format",
  "adv.err.limit": "Query limit reached for this champ select",
  "adv.unrecognized": "iTero did not recognise a champion: suggestions are less reliable",
  "adv.sideAssumed": "The client did not report your side: blue is assumed",
  "advisor.title": "Draft picks (iTero)",
  "advisor.msg": "The advisor sends the draft composition to iTero (itero.gg), a third-party service: the champions already revealed on both teams, the bans, your lane, your side and the lobby rank. It does not send your account, your Riot ID or any personal data. It uses a private iTero API that is neither official nor documented: it may stop working without notice and we do not have their explicit permission, so check their terms and use it at your own risk. It also queries LoLalytics (win rates) and Riot's Data Dragon (champion names). It only shows suggestions; it never picks or changes anything for you. You can turn it off in Settings \u2192 More.",
  "advisor.btn": "Turn on the advisor",
  "mastery.title": "Champion mastery",
  "mastery.msg": 'To weigh your champions, the plugin sends your **Riot ID** (name, tag and region) to iTero (itero.gg), a third-party service, and receives your mastery per champion. It is only kept in memory while the client is open; your Coachless account and nothing else is sent. It uses a private iTero API that is neither official nor documented: it may stop working without notice and we do not have their explicit permission, so use it at your own risk. It also powers the "Mastery" filter. You can turn it off in Settings \u2192 More.',
  "mastery.btn": "Turn on mastery",
  "flt.btn": "Filters",
  "flt.title": "Champion filters: keep only the ones you are looking for in view",
  "flt.active": "{0} active filter(s)",
  "flt.reset": "Clear all filters",
  "flt.class": "Class",
  "flt.mastery": "Mastery",
  "flt.matchup": "Matchup",
  "flt.meta": "Meta",
  "flt.phase": "Phase",
  "flt.damage": "Damage",
  "flt.any": "All",
  "flt.class.fighter": "Fighter",
  "flt.class.tank": "Tank",
  "flt.class.mage": "Mage",
  "flt.class.marksman": "Marksman",
  "flt.class.assassin": "Assassin",
  "flt.class.support": "Support",
  "flt.mastery.played": "Played",
  "flt.mastery.pool": "Pool",
  "flt.mastery.main": "Main",
  "flt.mastery.tip": "By your mastery (minimum points: {0})",
  "flt.matchup.favorable": "Favorable",
  "flt.matchup.counter": "Counter",
  "flt.meta.strong": "Strong",
  "flt.phase.early": "Early",
  "flt.phase.mid": "Mid",
  "flt.phase.late": "Late",
  "flt.damage.ad": "AD",
  "flt.damage.ap": "AP",
  "flt.damage.balanced": "Mixed",
  "flt.tip.favorable": "Win more than 50 % against your lane opponent",
  "flt.tip.counter": "Among the best counters against your lane opponent",
  "flt.tip.strong": "Grade S+ \u2026 A- in your lane right now (LoLalytics)",
  "flt.tip.early": "Improve the team early in the game (iTero)",
  "flt.tip.mid": "Improve the team in the mid game (iTero)",
  "flt.tip.late": "Improve the team late in the game (iTero)",
  "flt.tip.ad": "Leave the team damage mostly physical (iTero)",
  "flt.tip.ap": "Leave the team damage mostly magic (iTero)",
  "flt.tip.balanced": "Leave the team damage balanced (iTero)",
  "flt.off.mastery": "Needs your mastery: turn it on in Settings \u2192 More \u2192 Mastery",
  "flt.off.matchup": "Needs to know your lane opponent",
  "flt.off.meta": "Needs the lane stats (LoLalytics)",
  "flt.off.itero": "Needs the iTero draft picks (Settings \u2192 More \u2192 Picks)",
  "set.advisor": "Picks",
  "set.advisorOn": "Draft picks (iTero): on",
  "set.advisorOff": "Draft picks (iTero): off",
  "set.resetPos": "Position",
  "set.resetPosTip": "Put the panel back at the top right (if it ended up out of reach)",
  "set.mastery": "Mastery (iTero)",
  "set.masteryTip": 'Your champion mastery weighs in iTero draft picks and in the "Mastery" filter. Sends your Riot ID to iTero.',
  "set.masteryOff": "Off",
  "set.masteryLow": "Low",
  "set.masteryNormal": "Normal",
  "set.masteryHigh": "High",
  "set.masteryWeightTip": "Mastery weight: {0}",
  "set.updates": "Updates",
  "set.updatesTip": 'Version {0} ({1}). "Auto" downloads signed versions and uses them after restarting the client.',
  "set.restartClient": "Restart client",
  "set.updAuto": "Auto",
  "set.updAutoTip": "Downloads new versions (signature-verified) and uses them on the next start",
  "set.updPackaged": "Bundled only",
  "set.updPackagedTip": "Uses only the code bundled with the plugin; never checks or downloads anything",
  "set.updRestart": "Restart the client to apply the change",
  "set.updSrcRemote": "downloaded",
  "set.updSrcPackaged": "bundled",
  "upd.updated": "Draftsage updated to version {0}",
  "upd.ready": "Draftsage {0} downloaded: it will apply when you restart the client",
  "upd.reinstall": "A new Draftsage version requires reinstalling the plugin",
  "build.shards": "Shards",
  "build.spells": "Spells",
  "build.origin.auto": "Recommended",
  "build.origin.autoTip": "Page recommended by Draftsage from the source data",
  "build.origin.custom": "Your choice",
  "build.origin.customTip": "You changed the keystone or a spell; the rest of the page follows the data for that choice",
  "build.origin.pinned": "Pinned",
  "build.origin.pinnedTip": "Your pinned choice for this champion and role (\u{1F4CC} to remove it)",
  "build.reset": "Recommended",
  "build.resetTip": "Back to the recommended page",
  "build.scope.matchup": "vs {0}",
  "build.scope.matchupTip": "Data specific to this matchup (against {0})",
  "build.scope.general": "general",
  "build.scope.generalTip": "Data for the champion in your role, regardless of the opponent",
  "build.altLegend": "% = pick rate among {0} games \xB7 sorted by WPA (win contribution), not by win rate",
  "ds.title": "Recommendation",
  "ds.alts": "Alternatives",
  "ds.perspective": "Recommendation perspective",
  "ds.p.auto": "Auto",
  "ds.p.lane": "Lane",
  "ds.p.team": "Team",
  "ds.p.autoTip": "Automatic: if your lane opponent is known, the matchup leads; otherwise, team fit",
  "ds.p.laneTip": "Lane counter: the best head-to-head against your direct opponent (LoLalytics)",
  "ds.p.teamTip": "Team fit: synergy with your allies and answer to the revealed enemies (iTero)",
  "ds.p.offTip": "No data for this perspective yet",
  "ds.locate": "Find",
  "ds.locateFor": "Find {0} in the grid",
  "ds.locateTip": "Scrolls the grid to its tile and highlights it. It does not pick it for you",
  "ds.whyFor": "Why {0}",
  "ds.yourRival": "your opponent",
  "ds.games": "{0} games",
  "ds.why.best-team": "best team fit",
  "ds.why.best-lane": "best matchup",
  "ds.why.next-lane": "another good matchup",
  "ds.why.next-team": "another good team option",
  "ds.why.comfort": "your champion",
  "ds.r.lane": "{0} % against {1} ({2} over its average)",
  "ds.r.laneNoBase": "{0} % against {1}",
  "ds.r.general": "Wins mostly on general strength: its edge in this matchup is small",
  "ds.r.team": "Fits your team ({0} relative points)",
  "ds.r.teamBad": "Fits your team worse than average ({0} relative points)",
  "ds.r.syn": "Synergy with {0} ({1} %)",
  "ds.r.ctr": "Does well against {0} ({1} %)",
  "ds.r.weak": "Weak against {0} ({1} %)",
  "ds.r.scale": "Improves the team {0}",
  "ds.r.disagree": "LoLalytics and iTero disagree on this champion",
  "ds.r.agree": "Both sources rate it well",
  "ds.r.comfort": "You know it well ({0} mastery points)",
  "ds.ev.statistical": "data",
  "ds.ev.statisticalTip": "Statistic observed in real games",
  "ds.ev.model": "model",
  "ds.ev.modelTip": "Prediction from the iTero model, only comparable within this recommendation (not a win rate)",
  "ds.ev.heuristic": "rule",
  "ds.ev.heuristicTip": "A Draftsage rule built on the data, not a statistic",
  "ds.conf.high": "Enough data",
  "ds.conf.highTip": "The matchup figure rests on plenty of games",
  "ds.conf.medium": "Limited data",
  "ds.conf.mediumTip": "The matchup figure has few games: take it as a hint",
  "ds.conf.low": "Little data",
  "ds.conf.lowTip": "Very few games: not a strong recommendation",
  "ds.conf.model": "Prediction",
  "ds.conf.modelTip": "Only the iTero model prediction is available, with no matchup statistic",
  "tc.allies": "Your team",
  "tc.enemies": "Enemies",
  "tc.slot": "{0}: {1} ({2})",
  "tc.empty": "{0}: no champion yet",
  "tc.unplaced": "+{0} no lane",
  "tc.st.self": "you",
  "tc.st.confirmed": "lane reported by the client",
  "tc.st.manual": "lane set by you",
  "tc.st.inferred": "lane inferred by Draftsage, may be wrong",
  "tc.st.empty": "empty",
  "tc.legend": "Gold border: you or set by you \xB7 solid: reported by the client \xB7 dashed with \xAB?\xBB: inferred",
  "set.sec.general": "General",
  "set.sec.generalDesc": "What is shown in Champion Select and in which language.",
  "set.sec.data": "Data",
  "set.sec.dataDesc": "Where runes, spells and items come from, and which games are counted.",
  "set.sec.advisor": "Advisor",
  "set.sec.advisorDesc": "Champion suggestions based on team composition (iTero). Off until you accept: the draft's champions are sent to iTero.",
  "set.sec.apply": "Applying",
  "set.sec.applyDesc": "Put the rune page and spells into the client. Always with your click; never automatic.",
  "set.sec.advanced": "Advanced",
  "set.sec.advancedDesc": "Simulation, connection check and updates.",
  "set.d.source": "Auto uses Coachless when you are logged in; LoLalytics otherwise, for a matchup without premium, or if Coachless fails.",
  "set.d.elo": "Auto uses your lobby's rank (\xB11, Gold minimum). Click ranks to set your own.",
  "set.d.advisor": "Turning it on shows the privacy notice before anything is sent.",
  "set.d.mastery": "Optional: your champions weigh more. Sends your Riot ID to iTero (with a notice first).",
  "set.d.apply": "Off by default. Turning it on shows the Riot/Pengu policy notice.",
  "set.d.shortcuts": "Shortcuts: Ctrl+Shift+A applies what you see \xB7 Ctrl+Shift+E opens these settings."
};
var STRINGS = { es, en };

// src/shared/i18n.js
var LANGS = ["es", "en"];
var current = "es";
function resolveLang(pref, navLang = ((_a) => (_a = globalThis.navigator) == null ? void 0 : _a.language)()) {
  if (LANGS.includes(pref)) return pref;
  return String(navLang ?? "es").toLowerCase().startsWith("es") ? "es" : "en";
}
function setLang(pref) {
  current = resolveLang(pref);
  return current;
}
var getLang = () => current;
function t(key2, ...args) {
  var _a;
  const s = ((_a = STRINGS[current]) == null ? void 0 : _a[key2]) ?? STRINGS.es[key2] ?? key2;
  return args.length ? s.replace(/\{(\d+)\}/g, (m, i) => args[i] ?? m) : s;
}

// src/domain/lobby.js
var ROLE_FILL = 5;
var POSITION_TO_ROLE = { top: 0, jungle: 1, middle: 2, bottom: 3, utility: 4 };
var roleFromPosition = (position) => POSITION_TO_ROLE[String(position ?? "").toLowerCase()] ?? ROLE_FILL;
var MIN_TIER = 3;
var MAX_TIER = 7;
var DEFAULT_TIERS = [5, 6, 7];
var TIER_NAMES = { 3: "Gold", 4: "Platino", 5: "Esmeralda", 6: "Diamante", 7: "Master+" };
var RAW_TIER = { IRON: 0, BRONZE: 1, SILVER: 2, GOLD: 3, PLATINUM: 4, EMERALD: 5, DIAMOND: 6, MASTER: 7, GRANDMASTER: 7, CHALLENGER: 7 };
var rawTierFromLcu = (tier) => RAW_TIER[String(tier ?? "").toUpperCase()] ?? null;
var clampTier = (t2) => Math.min(MAX_TIER, Math.max(MIN_TIER, Math.round(t2)));
function lobbyTierFromRaw(rawTiers) {
  const v = (rawTiers ?? []).filter((x) => Number.isFinite(x));
  if (!v.length) return void 0;
  return clampTier(v.reduce((a, b) => a + b, 0) / v.length);
}
function tiersForLobby(lobbyTier) {
  if (!Number.isFinite(lobbyTier)) return [...DEFAULT_TIERS];
  const t2 = clampTier(lobbyTier);
  return [t2 - 1, t2, t2 + 1].filter((x) => x >= MIN_TIER && x <= MAX_TIER);
}
function tiersLabel(tiers, names = TIER_NAMES) {
  const ts = [...tiers ?? []].sort((a, b) => a - b);
  if (!ts.length) return "";
  const name = (t2) => names[t2] ?? "?";
  return ts.length === 1 ? name(ts[0]) : `${name(ts[0])} \u2013 ${name(ts[ts.length - 1])}`;
}
var norm = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9+]/g, "");
var ROLE_ALIASES = {
  top: 0,
  jungla: 1,
  jungle: 1,
  jg: 1,
  jng: 1,
  mid: 2,
  middle: 2,
  medio: 2,
  adc: 3,
  bot: 3,
  bottom: 3,
  tirador: 3,
  support: 4,
  supp: 4,
  sup: 4,
  soporte: 4,
  utility: 4,
  cualquiera: 5,
  fill: 5,
  todos: 5,
  auto: 5
};
var TIER_ALIASES = { gold: 3, oro: 3, platino: 4, platinum: 4, plat: 4, esmeralda: 5, emerald: 5, diamante: 6, diamond: 6, master: 7, "master+": 7, maestro: 7 };
function parseRole(text) {
  const t2 = norm(text);
  if (/^[0-5]$/.test(t2)) return Number(t2);
  return ROLE_ALIASES[t2];
}
function parseTier(text) {
  const t2 = norm(text);
  if (/^[0-9]$/.test(t2)) return clampTier(Number(t2));
  return TIER_ALIASES[t2];
}

// src/domain/filters.js
var MAX_PATCH_RANGE = 2;
var DEFAULT_FILTERS = Object.freeze({
  tiers: Object.freeze({ mode: "auto", min: 5, max: 7 }),
  patches: Object.freeze({ mode: "auto", additions: 1 }),
  regions: Object.freeze([])
});
var REGIONS = Object.freeze([
  { id: 0, code: "BR" },
  { id: 1, code: "EUNE" },
  { id: 2, code: "EUW" },
  { id: 3, code: "JP" },
  { id: 4, code: "KR" },
  { id: 5, code: "LAN" },
  { id: 6, code: "LAS" },
  { id: 7, code: "ME" },
  { id: 8, code: "NA" },
  { id: 9, code: "OCE" },
  { id: 12, code: "SG" },
  { id: 11, code: "RU" },
  { id: 14, code: "TR" },
  { id: 15, code: "TW" },
  { id: 16, code: "VN" }
]);
var REGION_IDS = new Set(REGIONS.map((r) => r.id));
var regionCode = (id) => {
  var _a;
  return ((_a = REGIONS.find((r) => r.id === id)) == null ? void 0 : _a.code) ?? "?";
};
function normalizeRegions(raw) {
  const ids = [...new Set((Array.isArray(raw) ? raw : []).map(Number).filter((x) => REGION_IDS.has(x)))].sort((a, b) => a - b);
  return ids.length === REGION_IDS.size ? [] : ids;
}
var int = (x, fallback) => Number.isFinite(Number(x)) && x !== null && x !== "" ? Math.round(Number(x)) : fallback;
function normalizeFilters(raw) {
  const t2 = (raw == null ? void 0 : raw.tiers) ?? {};
  const a = clampTier(int(t2.min, DEFAULT_FILTERS.tiers.min)), b = clampTier(int(t2.max, DEFAULT_FILTERS.tiers.max));
  const p = (raw == null ? void 0 : raw.patches) ?? {};
  return {
    tiers: { mode: t2.mode === "range" ? "range" : "auto", min: Math.min(a, b), max: Math.max(a, b) },
    patches: {
      mode: p.mode === "manual" ? "manual" : "auto",
      additions: Math.min(MAX_PATCH_RANGE, Math.max(0, int(p.additions, DEFAULT_FILTERS.patches.additions)))
    },
    regions: normalizeRegions(raw == null ? void 0 : raw.regions)
  };
}
function resolveRegions(filters) {
  const ids = normalizeFilters(filters).regions;
  return ids.length ? { regions: ids, manual: true } : { regions: null, manual: false };
}
function toggleRegion(regions, id) {
  const cur = normalizeRegions(regions);
  if (!REGION_IDS.has(Number(id))) return cur;
  return normalizeRegions(cur.includes(Number(id)) ? cur.filter((x) => x !== Number(id)) : [...cur, Number(id)]);
}
function resolveTiers(filters, lobbyTier) {
  const f = normalizeFilters(filters).tiers;
  if (f.mode !== "range") return { tiers: tiersForLobby(lobbyTier), manual: false };
  const tiers = [];
  for (let n = Math.max(MIN_TIER, f.min); n <= Math.min(MAX_TIER, f.max); n++) tiers.push(n);
  return { tiers, manual: true };
}
function resolveAdditions(filters, premium) {
  const f = normalizeFilters(filters).patches;
  if (f.mode !== "manual") return { additions: premium ? 1 : 0, manual: false, limited: false };
  return { additions: premium ? f.additions : 0, manual: true, limited: !premium && f.additions > 0 };
}
function toggleTier(tiers, tier) {
  const f = normalizeFilters({ tiers }).tiers;
  const t2 = clampTier(tier);
  if (f.mode !== "range") return { mode: "range", min: t2, max: t2 };
  if (t2 < f.min) return { ...f, min: t2 };
  if (t2 > f.max) return { ...f, max: t2 };
  if (f.min === f.max) return { ...f, mode: "auto" };
  if (t2 === f.min) return { ...f, min: t2 + 1 };
  if (t2 === f.max) return { ...f, max: t2 - 1 };
  return t2 - f.min < f.max - t2 ? { ...f, min: t2 } : { ...f, max: t2 };
}

// src/domain/sources.js
var SOURCES = ["coachless", "lolalytics"];
var SOURCE_MODES = ["auto", ...SOURCES];
var DEFAULT_SOURCE_MODE = "auto";
var normalizeSource = (raw) => ({ mode: SOURCE_MODES.includes(raw == null ? void 0 : raw.mode) ? raw.mode : DEFAULT_SOURCE_MODE });
var needsLogin = (mode) => mode === "coachless";
function sourceOrder({ mode, loggedIn, premium = false, wantsMatchup = false }) {
  if (mode === "lolalytics") return ["lolalytics"];
  if (mode === "auto") {
    if (!loggedIn) return ["lolalytics"];
    return wantsMatchup && !premium ? ["lolalytics", "coachless"] : ["coachless", "lolalytics"];
  }
  return ["coachless"];
}

// src/domain/itero.js
var ENDPOINT = "https://www.itero.gg/api/draft-picks";
var INFO_ENDPOINT = "https://www.itero.gg/api/basic-info";
var MASTERY_WEIGHTS = Object.freeze({ low: 0.15, normal: 0.3, high: 0.6 });
var DEFAULT_MASTERY_WEIGHT = MASTERY_WEIGHTS.normal;
var LANES = [
  "TOP",
  "JUNGLE",
  "MIDDLE",
  "BOTTOM",
  "UTILITY"
];
var PHASES = ["early", "mid", "late"];
var RANK_CLASSES = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER+"
];
var DEFAULT_RANK_CLASS = "EMERALD";
var UNSUPPORTED_MODES = /* @__PURE__ */ new Set([
  "ARAM",
  "KIWI",
  "CHERRY"
]);
var laneOfRole = (role) => {
  const isValidRole = Number.isInteger(role) && role >= 0 && role <= 4;
  return isValidRole ? LANES[role] : null;
};
var laneOfPosition = (position) => {
  const normalizedPosition = String(position ?? "").toUpperCase();
  return LANES.includes(normalizedPosition) ? normalizedPosition : null;
};
var supportsMode = (mode) => {
  const normalizedMode = String(mode ?? "").toUpperCase();
  return !UNSUPPORTED_MODES.has(normalizedMode);
};
var sideOfTeam = (team) => {
  if (team === 1) return "Blue";
  if (team === 2) return "Red";
  return null;
};
function rankClassOf(tier) {
  const isValidTier = Number.isInteger(tier) && tier >= 0 && tier < RANK_CLASSES.length;
  return isValidTier ? RANK_CLASSES[tier] : DEFAULT_RANK_CLASS;
}
function rankClassOfTiers(tiers) {
  const validTiers = (tiers ?? []).filter(Number.isInteger);
  if (validTiers.length === 0) {
    return DEFAULT_RANK_CLASS;
  }
  const middleIndex = Math.floor(validTiers.length / 2);
  const middleTier = validTiers[middleIndex];
  return rankClassOf(middleTier);
}
var rankClassFor = (resolved, lobbyTier) => {
  if (resolved == null ? void 0 : resolved.manual) {
    return rankClassOfTiers(resolved.tiers);
  }
  return rankClassOf(lobbyTier);
};
function buildRequest({
  lane,
  rankClass,
  side = "Blue",
  allies = {},
  enemies = {},
  bans = [],
  region = "euw1",
  mastery: mastery2 = null
}) {
  const teamComp = {};
  for (const currentLane of LANES) {
    if (currentLane !== lane && allies[currentLane]) {
      teamComp[`t1_${currentLane}_champion`] = allies[currentLane];
    }
    if (enemies[currentLane]) {
      teamComp[`t2_${currentLane}_champion`] = enemies[currentLane];
    }
  }
  const normalizedBans = [...new Set(bans)].filter(Boolean).sort();
  const weight = clamp01(mastery2 == null ? void 0 : mastery2.weight);
  const useMastery = weight > 0 && !!(mastery2 == null ? void 0 : mastery2.data) && Object.keys(mastery2.data).length > 0;
  return {
    region,
    rankClass,
    side: side === "Red" ? "Red" : "Blue",
    lane,
    masteryData: useMastery ? { ...mastery2.data } : {},
    teamComp,
    bans: normalizedBans,
    userModelWeightings: {
      [`t1_${lane}_mastery`]: useMastery ? weight : 0
    }
  };
}
var clamp01 = (x) => Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0;
function requestKey(req) {
  const normalizedComposition = Object.keys(req.teamComp).sort().map((key2) => `${key2}=${req.teamComp[key2]}`).join(",");
  return [
    "itero",
    req.rankClass,
    req.side,
    req.lane,
    req.bans.join("/"),
    normalizedComposition,
    masteryTag(req)
  ].join("|");
}
function masteryTag(req) {
  var _a;
  const weight = ((_a = req == null ? void 0 : req.userModelWeightings) == null ? void 0 : _a[`t1_${req.lane}_mastery`]) ?? 0;
  const values = Object.values((req == null ? void 0 : req.masteryData) ?? {}).filter((v) => typeof v === "number");
  if (!(weight > 0) || !values.length) return "m0";
  return `m${weight}:${values.length}:${values.reduce((a, b) => a + b, 0)}`;
}
var KEY = (value) => {
  return String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
};
var nameKey = KEY;
function parseNum(value) {
  var _a;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value !== "string") {
    return null;
  }
  const pattern = /^\s*([+-]?\d+(?:\.\d+)?)\s*(x|%|G|k)?\s*$/i;
  const match = pattern.exec(value);
  if (!match) {
    return null;
  }
  const numericValue = Number(match[1]);
  const unit = (_a = match[2]) == null ? void 0 : _a.toLowerCase();
  const multiplier = unit === "k" ? 1e3 : 1;
  return numericValue * multiplier + 0;
}
var num = (value) => parseNum(value);
var round = (value, decimals = 2) => {
  if (value == null) {
    return null;
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};
function normalizeCandidate(raw, lane) {
  var _a, _b, _c, _d, _e;
  if (!raw || typeof raw.champion !== "string" || !raw.champion) {
    return null;
  }
  const pred = num(raw.result_pred);
  if (pred == null) {
    return null;
  }
  const player2 = ((_a = raw.stats) == null ? void 0 : _a.player) ?? {};
  const teamDamage = ((_c = (_b = raw.stats) == null ? void 0 : _b.t1) == null ? void 0 : _c.damage) ?? {};
  const teamScaling = ((_e = (_d = raw.stats) == null ? void 0 : _d.t1) == null ? void 0 : _e.scaling) ?? {};
  const syn = {};
  const ctr = {};
  for (const currentLane of LANES) {
    if (currentLane !== lane) {
      const synergy = num(
        player2[`t1_syn_LANE_${currentLane}_wr`]
      );
      if (synergy != null) {
        syn[currentLane] = synergy;
      }
    }
    const counter = num(
      player2[`t1_counter_LANE_${currentLane}_wr`]
    );
    if (counter != null) {
      ctr[currentLane] = counter;
    }
  }
  const scale = {};
  for (const phase of PHASES) {
    const value = num(
      teamScaling[`t1_${phase}_wr_adj_diff`]
    );
    if (value != null) {
      scale[phase] = round(value, 3);
    }
  }
  return {
    name: raw.champion,
    pred,
    rating: num(raw.result_pred_rating),
    laning: num(raw.laning_pred_rating),
    count: num(raw.champ_count) ?? 0,
    pick: num(raw.pick_perc) ?? 0,
    champWr: num(player2.t1_LANE_champ_wr),
    predGold: num(player2.t1_LANE_pred_gold),
    synAvg: num(player2.t1_LANE_syn_avg),
    ctrAvg: num(player2.t1_LANE_counter_avg),
    syn,
    ctr,
    scale,
    adRatio: num(teamDamage.t1_ad_ratio),
    adRatioVar: num(teamDamage.t1_ad_ratio_without_player_var)
  };
}
function normalizeResponse(raw, lane, { min = 20 } = {}) {
  if (!Array.isArray(raw) || raw.length === 0) {
    return {
      ok: false,
      reason: "shape"
    };
  }
  const candidates = [];
  for (const row of raw) {
    const candidate2 = normalizeCandidate(row, lane);
    if (candidate2) {
      candidates.push(candidate2);
    }
  }
  const hasEnoughCandidates = candidates.length >= min;
  const hasAcceptableValidityRate = candidates.length >= raw.length * 0.9;
  if (hasEnoughCandidates && hasAcceptableValidityRate) {
    return {
      ok: true,
      candidates
    };
  }
  return {
    ok: false,
    reason: "shape"
  };
}
function findUnrecognized(req, candidates) {
  const candidateNames = new Set(
    candidates.map((candidate2) => KEY(candidate2.name))
  );
  return Object.entries(req.teamComp).filter(([, championName]) => {
    return candidateNames.has(KEY(championName));
  }).map(([, championName]) => championName);
}
var ITERO_REGION_OF = Object.freeze({
  0: "BR1",
  1: "EUN1",
  2: "EUW1",
  3: "JP1",
  4: "KR",
  5: "LA1",
  6: "LA2",
  7: "ME1",
  8: "NA1",
  9: "OC1",
  10: "PH2",
  12: "SG2",
  13: "TH2",
  14: "TR1",
  15: "TW2",
  16: "VN2"
});
function iteroRegion(regions) {
  return Array.isArray(regions) && regions.length === 1 ? ITERO_REGION_OF[regions[0]] ?? null : null;
}
var PLATFORM_OF_REGION = {
  NA: "NA1",
  BR: "BR1",
  LAN: "LA1",
  LAS: "LA2",
  EUW: "EUW1",
  EUNE: "EUN1",
  TR: "TR1",
  RU: "RU",
  JP: "JP1",
  KR: "KR",
  OCE: "OC1",
  ME1: "ME1",
  SG2: "SG2",
  TW2: "TW2",
  VN2: "VN2",
  PH2: "PH2",
  TH2: "TH2"
};
var PLATFORMS = new Set(Object.values(PLATFORM_OF_REGION));
function platformOf(value) {
  const v = String(value ?? "").trim().toUpperCase();
  if (PLATFORMS.has(v)) return v;
  return PLATFORM_OF_REGION[v] ?? null;
}
function basicInfoRequest(id) {
  const gameName = String((id == null ? void 0 : id.gameName) ?? "").trim();
  const tagLine = String((id == null ? void 0 : id.tagLine) ?? "").trim().replace(/^#/, "");
  const region = platformOf(id == null ? void 0 : id.region);
  if (!gameName || !tagLine || !region || gameName.length > 32 || tagLine.length > 8) return null;
  return { gameName, tagLine, region };
}
function normalizeBasicInfo(raw) {
  const mastery2 = raw == null ? void 0 : raw.mastery;
  if (!mastery2 || typeof mastery2 !== "object" || Array.isArray(mastery2)) return null;
  const points = {};
  let count = 0;
  let sum = 0;
  for (const [key2, value] of Object.entries(mastery2)) {
    if (!/^\d+$/.test(key2)) continue;
    const n = num(value);
    if (n == null || n < 0) continue;
    points[key2] = n;
    sum += n;
    count++;
  }
  const avgRaw = num(mastery2.avg);
  return { points, avg: avgRaw ?? (count ? Math.round(sum / count) : 0), count };
}

// src/domain/pick-advice.js
var MIN_LANE_SHARE = 30;
var DEFAULTS = Object.freeze({
  weight: 0,
  // peso de LoLalytics en la mezcla (0 = solo iTero; las listas de iTero y de matchup van separadas)
  minPick: 25e-4,
  // uso mínimo (fracción 0–1) como en la web de iTero: oculta fuera de línea y raros
  minGames: 1e3,
  // partidas mínimas del campeón en la línea
  n0: 300,
  // muestra a partir de la cual el matchup pesa la mitad
  top: 5,
  // cuántos picks se enseñan
  agreeTop: 10,
  // «ambas fuentes lo ven bien» = está en el top N de iTero y su matchup es favorable
  vetoWr: 47,
  // matchup malo: win rate contra el rival por debajo de esto con ≥ vetoGames partidas
  vetoGames: 500,
  badEdge: -2
  // o ventaja sobre su media ≤ esto con muestra suficiente (no `low`)
});
var isNum = (v) => typeof v === "number" && Number.isFinite(v);
var round1 = (x) => Math.round(x * 10) / 10;
function median(xs) {
  const v = xs.filter(isNum).sort((a, b) => a - b);
  if (!v.length) return 0;
  const m = v.length >> 1;
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}
function assignLanes(members, share, { minShare = MIN_LANE_SHARE, slack = 15 } = {}) {
  const byLane = {};
  const unknown = [];
  for (const m of members ?? []) {
    const lane = laneOfPosition(m.position);
    if (lane && !byLane[lane]) byLane[lane] = m.championId;
    else unknown.push(m.championId);
  }
  const free = LANES.filter((l) => !byLane[l]);
  const sols = [];
  const rec = (i, used, assign, score) => {
    if (i === unknown.length) {
      sols.push({ assign, score });
      return;
    }
    rec(i + 1, used, [...assign, null], score);
    for (const l of free) {
      if (used.has(l)) continue;
      const s = share(unknown[i], l);
      if (isNum(s) && s >= minShare) rec(i + 1, /* @__PURE__ */ new Set([...used, l]), [...assign, l], score + s);
    }
  };
  rec(0, /* @__PURE__ */ new Set(), [], 0);
  if (!sols.length) return byLane;
  const best = Math.max(...sols.map((s) => s.score));
  const near = sols.filter((s) => s.score >= best - slack);
  const top = near.find((s) => s.score === best);
  unknown.forEach((cid, i) => {
    const lane = top.assign[i];
    if (lane && near.every((s) => s.assign[i] === lane)) byLane[lane] = cid;
  });
  return byLane;
}
var pct = (mult) => isNum(mult) ? round1((mult - 1) * 100) : null;
var dmgOf = (adRatio) => isNum(adRatio) ? adRatio > 65 ? "ad" : adRatio < 35 ? "ap" : "balanced" : null;
var SCALE_MIN = 0.01;
function chipsOf(c, { allyLanes = [], enemyLanes = [] } = {}) {
  var _a;
  const out = [];
  const best = (map, lanes, sign2) => {
    let pick2 = null;
    for (const l of lanes) {
      const v = pct(map == null ? void 0 : map[l]);
      if (v == null) continue;
      if (!pick2 || (sign2 > 0 ? v > pick2.value : v < pick2.value)) pick2 = { lane: l, value: v };
    }
    return pick2;
  };
  const syn = best(c.syn, allyLanes, 1);
  if (syn && syn.value >= 2) out.push({ kind: "syn", ...syn });
  const ctr = best(c.ctr, enemyLanes, 1);
  if (ctr && ctr.value >= 2) out.push({ kind: "ctr", ...ctr });
  const weak = best(c.ctr, enemyLanes, -1);
  if (weak && weak.value <= -3) out.push({ kind: "weak", ...weak });
  let phase = null;
  for (const p of ["early", "mid", "late"]) {
    const v = (_a = c.scale) == null ? void 0 : _a[p];
    if (isNum(v) && v >= SCALE_MIN && (!phase || v > phase.v)) phase = { p, v };
  }
  if (phase) out.push({ kind: "scale", phase: phase.p, value: round1(phase.v * 100) });
  if (isNum(c.adRatio)) out.push({ kind: "dmg", value: dmgOf(c.adRatio) });
  return out;
}
function rankPicks({ candidates, idOf, stats: stats2 = null, banned = [], reveal = {}, options = {} }) {
  var _a, _b;
  const o = { ...DEFAULTS, ...options };
  const banSet = new Set(banned.map(nameKey));
  const pool = (candidates ?? []).filter((c) => c.pick >= o.minPick && c.count >= o.minGames && !banSet.has(nameKey(c.name)));
  if (!pool.length) return { picks: [], rows: [], blended: false, contrasted: false, pool: 0 };
  const med = median(pool.map((c) => c.pred));
  const byDelta = [...pool].sort((a, b) => b.pred - a.pred);
  const topSet = new Set(byDelta.slice(0, o.agreeTop).map((c) => c.name));
  let blended = false;
  let contrasted = false;
  const rows = [];
  for (const c of pool) {
    const cid = idOf(c.name);
    if (cid == null) continue;
    const vs = ((_b = (_a = stats2 == null ? void 0 : stats2.champions) == null ? void 0 : _a[cid]) == null ? void 0 : _b.vs) ?? null;
    const usable = !!vs && isNum(vs.edge) && isNum(vs.n) && vs.n > 0;
    const shrunk = usable ? vs.edge * (vs.n / (vs.n + o.n0)) : 0;
    if (usable) contrasted = true;
    if (usable && o.weight > 0) blended = true;
    const delta = c.pred - med;
    const score = delta + o.weight * shrunk;
    let agree = null;
    if (topSet.has(c.name) && vs) {
      const bad = vs.n >= o.vetoGames && vs.wr < o.vetoWr || !vs.low && isNum(vs.edge) && vs.edge <= o.badEdge;
      if (bad) agree = "conflict";
      else if (!vs.low && isNum(vs.edge) && vs.edge > 0) agree = "agree";
    }
    rows.push({
      championId: cid,
      name: c.name,
      score: round1(score),
      delta: round1(delta),
      games: c.count,
      agree,
      matchup: vs ? { wr: vs.wr, edge: vs.edge, n: vs.n, low: !!vs.low } : null,
      chips: chipsOf(c, reveal),
      scale: c.scale ?? {},
      dmg: dmgOf(c.adRatio),
      _s: score
    });
  }
  rows.sort((a, b) => b._s - a._s);
  const clean = rows.map(({ _s, ...r }, i) => ({ rank: i + 1, ...r }));
  return { picks: clean.slice(0, o.top), rows: clean, blended, contrasted, pool: pool.length };
}

// src/domain/pick-filters.js
var CLASSES = Object.freeze(["fighter", "tank", "mage", "marksman", "assassin", "support"]);
var MASTERY_STEPS = Object.freeze(["any", "played", "pool", "main"]);
var MATCHUP_STEPS = Object.freeze(["any", "favorable", "counter"]);
var META_STEPS = Object.freeze(["any", "strong"]);
var PHASE_STEPS = Object.freeze(["any", "early", "mid", "late"]);
var DAMAGE_STEPS = Object.freeze(["any", "ad", "ap", "balanced"]);
var MASTERY_POINTS = Object.freeze({ played: 1, pool: 1e4, main: 4e4 });
var STRONG_GRADES = Object.freeze(["S+", "S", "S-", "A+", "A", "A-"]);
var DEFAULT_PICK_FILTERS = Object.freeze({ classes: [], mastery: "any", matchup: "any", meta: "any", phase: "any", damage: "any" });
var pick = (value, allowed) => allowed.includes(value) ? value : "any";
function normalizePickFilters(raw) {
  const o = raw && typeof raw === "object" ? raw : {};
  const classes = [...new Set((Array.isArray(o.classes) ? o.classes : []).map((c) => String(c).toLowerCase()).filter((c) => CLASSES.includes(c)))];
  return {
    classes,
    mastery: pick(o.mastery, MASTERY_STEPS),
    matchup: pick(o.matchup, MATCHUP_STEPS),
    meta: pick(o.meta, META_STEPS),
    phase: pick(o.phase, PHASE_STEPS),
    damage: pick(o.damage, DAMAGE_STEPS)
  };
}
function activeCount(f) {
  return (f.classes.length ? 1 : 0) + ["mastery", "matchup", "meta", "phase", "damage"].filter((k) => f[k] !== "any").length;
}
var isActive = (f) => activeCount(f) > 0;
var toggleClass = (f, cls) => ({ ...f, classes: f.classes.includes(cls) ? f.classes.filter((c) => c !== cls) : [...f.classes, cls] });
var evaluable = (key2, avail = {}) => {
  if (key2 === "mastery") return !!avail.mastery;
  if (key2 === "matchup") return !!avail.matchup;
  if (key2 === "phase" || key2 === "damage") return !!avail.itero;
  if (key2 === "meta") return avail.meta !== false;
  return true;
};
function matches(f, facts, avail = { mastery: true, matchup: true, itero: true, meta: true }) {
  var _a;
  if (f.classes.length && !(facts.classes ?? []).some((c) => f.classes.includes(c))) return false;
  if (f.mastery !== "any" && evaluable("mastery", avail)) {
    const pts = facts.mastery;
    if (!(typeof pts === "number" && pts >= MASTERY_POINTS[f.mastery])) return false;
  }
  if (f.matchup !== "any" && evaluable("matchup", avail)) {
    const vs = facts.vs;
    if (f.matchup === "favorable" && !(vs && !vs.low && vs.wr > 50)) return false;
    if (f.matchup === "counter" && facts.counter == null) return false;
  }
  if (f.meta !== "any" && evaluable("meta", avail) && !STRONG_GRADES.includes(facts.grade)) return false;
  if (f.phase !== "any" && evaluable("phase", avail) && !(typeof ((_a = facts.scale) == null ? void 0 : _a[f.phase]) === "number" && facts.scale[f.phase] >= SCALE_MIN)) return false;
  if (f.damage !== "any" && evaluable("damage", avail) && facts.dmg !== f.damage) return false;
  return true;
}
function unavailableIds(ctx) {
  const out = /* @__PURE__ */ new Set();
  if (!ctx) return out;
  for (const id of ctx.bans ?? []) if (Number.isInteger(id) && id > 0) out.add(id);
  for (const p of [...ctx.allies ?? [], ...ctx.enemies ?? []]) if (Number.isInteger(p == null ? void 0 : p.championId) && p.championId > 0) out.add(p.championId);
  if (ctx.championId) out.delete(ctx.championId);
  return out;
}

// src/application/preferences.js
var KEY2 = "draftsage/panel";
var DEFAULTS2 = { enabled: true, collapsed: false, x: null, y: null, lang: "auto", filtersOpen: false };
function getPanelPrefs() {
  try {
    return { ...DEFAULTS2, ...DataStore.get(KEY2, {}) ?? {} };
  } catch {
    return { ...DEFAULTS2 };
  }
}
function setPanelPrefs(patch) {
  const next = { ...getPanelPrefs(), ...patch };
  try {
    DataStore.set(KEY2, next);
  } catch {
  }
  return next;
}
function initLanguage() {
  setLang(getPanelPrefs().lang);
}
function setLanguagePref(lang) {
  const next = setPanelPrefs({ lang: lang === "es" || lang === "en" ? lang : "auto" });
  setLang(next.lang);
  return next.lang;
}
var PINS_KEY = "draftsage/pins";
var PINS_MAX = 200;
var readPins = () => {
  try {
    return DataStore.get(PINS_KEY, {}) ?? {};
  } catch {
    return {};
  }
};
var pinKey = (championId, role) => `${championId}|${role}`;
var intOrNull = (x) => Number.isInteger(x) && x > 0 ? x : null;
var pins = {
  get(championId, role) {
    const p = readPins()[pinKey(championId, role)];
    if (!p) return null;
    const spells = Array.isArray(p.spells) && p.spells.length === 2 && p.spells.every((x) => intOrNull(x)) ? p.spells : null;
    return { keystone: intOrNull(p.keystone), spells };
  },
  set(championId, role, { keystone = null, spells = null } = {}) {
    const all = readPins();
    all[pinKey(championId, role)] = { keystone: intOrNull(keystone), spells: Array.isArray(spells) ? spells.map(intOrNull) : null, at: Date.now() };
    const keys = Object.keys(all);
    if (keys.length > PINS_MAX) for (const k of keys.sort((a, b) => (all[a].at ?? 0) - (all[b].at ?? 0)).slice(0, keys.length - PINS_MAX)) delete all[k];
    try {
      DataStore.set(PINS_KEY, all);
    } catch {
    }
  },
  remove(championId, role) {
    const all = readPins();
    delete all[pinKey(championId, role)];
    try {
      DataStore.set(PINS_KEY, all);
    } catch {
    }
  }
};
var APPLY_KEY = "draftsage/apply";
var APPLY_DEFAULTS = { enabled: false, target: "own", flashKey: "f" };
function getApplyPrefs() {
  try {
    return { ...APPLY_DEFAULTS, ...DataStore.get(APPLY_KEY, {}) ?? {} };
  } catch {
    return { ...APPLY_DEFAULTS };
  }
}
function setApplyPrefs(patch) {
  const next = { ...getApplyPrefs(), ...patch };
  try {
    DataStore.set(APPLY_KEY, next);
  } catch {
  }
  return next;
}
var FILTERS_KEY = "draftsage/filters";
function getFilterPrefs() {
  try {
    return normalizeFilters(DataStore.get(FILTERS_KEY, {}));
  } catch {
    return normalizeFilters(null);
  }
}
function setFilterPrefs(patch) {
  const next = normalizeFilters({ ...getFilterPrefs(), ...patch });
  try {
    DataStore.set(FILTERS_KEY, next);
  } catch {
  }
  return next;
}
var SOURCE_KEY = "draftsage/source";
function getSourcePrefs() {
  try {
    return normalizeSource(DataStore.get(SOURCE_KEY, {}));
  } catch {
    return normalizeSource(null);
  }
}
function setSourcePrefs(patch) {
  const next = normalizeSource({ ...getSourcePrefs(), ...patch });
  try {
    DataStore.set(SOURCE_KEY, next);
  } catch {
  }
  return next;
}
var ADVISOR_KEY = "draftsage/advisor";
var ADVISOR_DEFAULTS = { enabled: false, minPick: 25e-4, useMastery: false, masteryWeight: DEFAULT_MASTERY_WEIGHT };
var clampNum = (x, lo, hi, d) => Number.isFinite(Number(x)) && x !== null && x !== "" ? Math.min(hi, Math.max(lo, Number(x))) : d;
var cleanAdvisor = (o) => ({
  enabled: (o == null ? void 0 : o.enabled) === true,
  minPick: clampNum(o == null ? void 0 : o.minPick, 5e-4, 0.02, ADVISOR_DEFAULTS.minPick),
  useMastery: (o == null ? void 0 : o.useMastery) === true,
  masteryWeight: clampNum(o == null ? void 0 : o.masteryWeight, 0.05, 1, ADVISOR_DEFAULTS.masteryWeight)
});
function getAdvisorPrefs() {
  try {
    return cleanAdvisor(DataStore.get(ADVISOR_KEY, {}));
  } catch {
    return { ...ADVISOR_DEFAULTS };
  }
}
function setAdvisorPrefs(patch) {
  const next = cleanAdvisor({ ...getAdvisorPrefs(), ...patch });
  try {
    DataStore.set(ADVISOR_KEY, next);
  } catch {
  }
  return next;
}
var PICK_FILTERS_KEY = "draftsage/pick-filters";
function getPickFilterPrefs() {
  try {
    return normalizePickFilters(DataStore.get(PICK_FILTERS_KEY, {}));
  } catch {
    return normalizePickFilters(null);
  }
}
function setPickFilterPrefs(patch) {
  const next = normalizePickFilters({ ...getPickFilterPrefs(), ...patch });
  try {
    DataStore.set(PICK_FILTERS_KEY, next);
  } catch {
  }
  return next;
}
var OVERLAY_KEY = "draftsage/overlay";
var OVERLAY_DEFAULTS = { enabled: true, selector: "" };
var cleanOverlay = (o) => ({ enabled: (o == null ? void 0 : o.enabled) !== false, selector: typeof (o == null ? void 0 : o.selector) === "string" ? o.selector.trim().slice(0, 200) : "" });
function getOverlayPrefs() {
  try {
    return cleanOverlay({ ...OVERLAY_DEFAULTS, ...DataStore.get(OVERLAY_KEY, {}) ?? {} });
  } catch {
    return { ...OVERLAY_DEFAULTS };
  }
}
function setOverlayPrefs(patch) {
  const next = cleanOverlay({ ...getOverlayPrefs(), ...patch });
  try {
    DataStore.set(OVERLAY_KEY, next);
  } catch {
  }
  return next;
}

// src/shared/logger.js
var TAG = "[draftsage]";
var DEBUG_KEY = "draftsage/debug";
var debugOn = () => {
  try {
    return !!DataStore.get(DEBUG_KEY, false);
  } catch {
    return false;
  }
};
var log = {
  info: (...a) => console.info(TAG, ...a),
  warn: (...a) => console.warn(TAG, ...a),
  error: (...a) => console.error(TAG, ...a),
  debug: (...a) => {
    if (debugOn()) console.log(TAG, "[debug]", ...a);
  }
};
window.draftsage = Object.assign(window.draftsage ?? {}, {
  debug: (on = true) => DataStore.set(DEBUG_KEY, !!on)
});

// src/presentation/theme.js
var STYLE_ID = "draftsage-theme";
var TOKENS = Object.freeze({
  // Fondos y superficies
  "bg": "#010a13",
  "surface": "#0a1428",
  "surface-2": "#1e2328",
  "border": "#3c3c41",
  "border-soft": "#2a2a30",
  // Dorado (selección y énfasis)
  "gold-dim": "#785a28",
  "gold": "#c8aa6e",
  "gold-hi": "#f0c870",
  "gold-bg": "#2a2314",
  // Texto
  "text": "#cdbe91",
  "text-hi": "#f0e6d2",
  "meta": "#a09b8c",
  "mute": "#7b7a76",
  "mute-2": "#5b5a56",
  // Estados
  "teal": "#0ac8b9",
  "teal-bg": "#06201f",
  "red": "#e84057",
  "rival": "#a8404f",
  "amber": "#e0a93a"
});
var FONT = Object.freeze({ meta: "10px", text: "12px", section: "12px", name: "14px", title: "15px" });
var ROOTS = [".ecp", ".ecx", ".ec-overlay", ".ecs", ".ecb-layer", ".ecp-fab", ".ecx-launch"];
var css = () => {
  const vars = Object.entries(TOKENS).map(([k, v]) => `--ds-${k}:${v}`).join(";");
  const fs = Object.entries(FONT).map(([k, v]) => `--ds-fs-${k}:${v}`).join(";");
  const inside = (sel) => ROOTS.map((r) => `${r} ${sel}, ${r}${sel}`).join(",");
  return `:root{${vars};${fs}}
${inside(":focus-visible")}{outline:2px solid var(--ds-gold-hi);outline-offset:1px}
@media (prefers-reduced-motion: reduce){${ROOTS.map((r) => `${r}, ${r} *`).join(",")}{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}`;
};
function ensureTheme(doc = document) {
  if (doc.getElementById(STYLE_ID)) return;
  const s = doc.createElement("style");
  s.id = STYLE_ID;
  s.textContent = css();
  (doc.head ?? doc.documentElement).append(s);
}

// src/presentation/ui.js
var STYLE_ID2 = "draftsage-style";
var T0 = performance.now();
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
var whenReady = (ms = 8e3) => sleep(Math.max(0, ms - (performance.now() - T0)));
var CSS = `
.ec-overlay{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:rgba(1,10,19,.72)}
.ec-modal{box-sizing:border-box;width:min(var(--ec-w,520px),92vw);max-height:90vh;overflow:auto;background:var(--ds-bg);color:var(--ds-text);border:1px solid var(--ds-gold-dim);box-shadow:0 0 24px #000;padding:20px 24px;font-size:14px;line-height:1.5;outline:none}
.ec-title{font-size:16px;font-weight:bold;margin:0 0 10px;color:var(--ds-text-hi)}
.ec-body p{margin:0 0 8px}
.ec-box{margin:8px 0;padding:8px 10px;background:var(--ds-surface)}
.ec-status{min-height:20px;margin-top:8px;color:var(--ds-teal)}
.ec-status.ec-error{color:var(--ds-red)}
.ec-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.ec-btn{background:var(--ds-surface-2);color:var(--ds-text);border:1px solid var(--ds-gold-dim);padding:6px 14px;cursor:pointer;font:inherit}
.ec-btn:hover:not(:disabled){border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ec-btn:disabled{opacity:.5;cursor:default}
.ec-btn.ec-primary{border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ec-btn.ec-danger{border-color:var(--ds-red);color:var(--ds-red)}
.ec-field{display:block;margin:8px 0}
.ec-field>span{display:block;margin-bottom:2px;font-size:12px;color:var(--ds-meta)}
.ec-input{box-sizing:border-box;width:100%;padding:6px 8px;background:var(--ds-surface-2);color:var(--ds-text-hi);border:1px solid var(--ds-border);font:inherit}
.ec-input:focus{outline:none;border-color:var(--ds-gold)}
.ec-check{display:flex;align-items:center;gap:6px;margin:8px 0}
.ec-menu{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.ec-menu .ec-btn{text-align:left}
.ec-menu small{display:block;color:var(--ds-meta)}
`;
function ensureStyle() {
  ensureTheme();
  if (document.getElementById(STYLE_ID2)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID2;
  s.textContent = CSS;
  document.head.append(s);
}
function h(tag, props, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props ?? {})) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "style") el.style.cssText = v;
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}
var asNodes = (body) => [].concat(body ?? []).filter((x) => x != null && x !== false).map((x) => x instanceof Node ? x : h("p", null, String(x)));
function richText(text) {
  return String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/).filter(Boolean).map((part) => part.startsWith("**") ? h("b", null, part.slice(2, -2)) : part.startsWith("`") ? h("code", null, part.slice(1, -1)) : part);
}
async function openExternal(url) {
  if (!/^https:\/\//.test(String(url))) return false;
  try {
    const w = window.open(url, "_blank");
    if (w) w.opener = null;
    return true;
  } catch (e) {
    log.warn("window.open fall\xF3:", String(e));
  }
  notify.error(await copyText(url) ? t("web.copied", url) : t("web.failed"));
  return false;
}
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
  }
  try {
    const ta = h("textarea", { style: "position:fixed;opacity:0;pointer-events:none" });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}
var notify = {
  success: (m) => {
    try {
      window.Toast.success(m);
    } catch {
      log.info(m);
    }
  },
  error: (m) => {
    try {
      window.Toast.error(m);
    } catch {
      log.error(m);
    }
  }
};
var registry = /* @__PURE__ */ new Map();
var queue = [];
var current2 = null;
function pump() {
  if (current2 || !queue.length) return;
  if (!document.body) {
    document.addEventListener("DOMContentLoaded", pump, { once: true });
    return;
  }
  const entry = queue.shift();
  current2 = entry;
  try {
    show(entry);
  } catch (e) {
    log.error("no se pudo abrir la ventana:", e);
    current2 = null;
    entry.handle.close({ action: "error" });
  }
}
function show(entry) {
  const { opts, handle } = entry;
  const prevFocus = document.activeElement;
  ensureStyle();
  const status = h("div", { class: "ec-status", role: "status" });
  const actionsEl = h("div", { class: "ec-actions" });
  const modal = h(
    "div",
    { class: "ec-modal", role: "dialog", "aria-modal": "true", tabindex: "-1", style: opts.width ? `--ec-w:${opts.width}px` : null },
    opts.title && h("div", { class: "ec-title" }, opts.title),
    h("div", { class: "ec-body" }, asNodes(opts.body)),
    status,
    actionsEl
  );
  const overlay2 = h("div", { class: "ec-overlay" }, modal);
  const actions = opts.actions ?? [];
  const buttons = /* @__PURE__ */ new Map();
  let busy = false;
  const setStatus = (msg = "", kind = "info") => {
    status.textContent = msg;
    status.className = "ec-status" + (kind === "error" ? " ec-error" : "");
  };
  const setBusy = (on) => {
    busy = on;
    for (const b of buttons.values()) b.disabled = on;
    for (const i of modal.querySelectorAll("input")) i.disabled = on;
  };
  const refocus = () => {
    var _a;
    return (_a = modal.querySelector("[data-ec-focus]") ?? modal.querySelector("input:not([type=checkbox])")) == null ? void 0 : _a.focus();
  };
  async function run(a) {
    if (busy || entry.closed) return;
    let out;
    if (a.onClick) {
      setBusy(true);
      setStatus("");
      try {
        out = await a.onClick(handle);
      } catch (e) {
        log.error("error en la acci\xF3n", a.id, e);
        if (!entry.closed) {
          setBusy(false);
          setStatus(t("common.unexpected", (e == null ? void 0 : e.message) ?? e), "error");
        }
        return;
      }
      if (entry.closed) return;
      setBusy(false);
      if (out === false) {
        refocus();
        return;
      }
    }
    if (!a.keepOpen) handle.close({ action: a.id, value: out });
  }
  for (const a of actions) {
    const b = h("button", { type: "button", class: "ec-btn" + (a.variant ? " ec-" + a.variant : "") }, a.label);
    b.addEventListener("click", () => run(a));
    buttons.set(a.id, b);
    actionsEl.append(b);
  }
  const dismiss = () => {
    if (opts.closable !== false && !busy) handle.close({ action: "dismiss" });
  };
  for (const ev of ["keydown", "keyup", "keypress"]) {
    modal.addEventListener(ev, (e) => {
      e.stopPropagation();
      if (ev === "keydown" && e.key === "Escape") {
        e.preventDefault();
        dismiss();
      }
    });
  }
  overlay2.addEventListener("mousedown", (e) => {
    e.stopPropagation();
    if (e.target === overlay2) dismiss();
  });
  overlay2.addEventListener("click", (e) => e.stopPropagation());
  entry.shown = true;
  entry.modal = modal;
  entry.applyStatus = setStatus;
  entry.setBusy = setBusy;
  entry.trigger = (id) => {
    const a = actions.find((x) => x.id === id);
    if (a) run(a);
  };
  entry.teardown = () => {
    var _a;
    for (const i of modal.querySelectorAll("input")) i.value = "";
    overlay2.remove();
    try {
      (_a = prevFocus == null ? void 0 : prevFocus.focus) == null ? void 0 : _a.call(prevFocus);
    } catch {
    }
  };
  if (entry.pendingStatus) setStatus(...entry.pendingStatus);
  document.body.append(overlay2);
  const first = modal.querySelector("input:not([type=checkbox])") ?? actionsEl.querySelector(".ec-primary") ?? actionsEl.querySelector("button") ?? modal;
  setTimeout(() => first.focus(), 0);
  log.debug("ventana abierta:", opts.id ?? opts.title);
}
function openDialog(opts = {}) {
  if (opts.id && registry.has(opts.id)) return registry.get(opts.id);
  const entry = { opts, closed: false, shown: false };
  let resolve;
  const result = new Promise((r) => resolve = r);
  const handle = {
    id: opts.id,
    result,
    get el() {
      return entry.modal ?? null;
    },
    setStatus: (msg, kind) => {
      var _a;
      entry.pendingStatus = [msg, kind];
      (_a = entry.applyStatus) == null ? void 0 : _a.call(entry, msg, kind);
    },
    setBusy: (on) => {
      var _a;
      return (_a = entry.setBusy) == null ? void 0 : _a.call(entry, on);
    },
    trigger: (id) => {
      var _a;
      return (_a = entry.trigger) == null ? void 0 : _a.call(entry, id);
    },
    close: (res = { action: "dismiss" }) => {
      if (entry.closed) return;
      entry.closed = true;
      if (opts.id) registry.delete(opts.id);
      if (entry.shown) {
        entry.teardown();
        if (current2 === entry) current2 = null;
      } else {
        const i = queue.indexOf(entry);
        if (i >= 0) queue.splice(i, 1);
      }
      resolve(res);
      pump();
    }
  };
  entry.handle = handle;
  if (opts.id) registry.set(opts.id, handle);
  queue.push(entry);
  pump();
  return handle;
}
async function confirm({ id, title, message, confirmLabel = t("common.ok"), cancelLabel = t("common.cancel"), danger = false } = {}) {
  const r = await openDialog({
    id,
    title,
    body: message,
    actions: [
      { id: "cancel", label: cancelLabel },
      { id: "ok", label: confirmLabel, variant: danger ? "danger" : "primary" }
    ]
  }).result;
  return r.action === "ok";
}
function openForm({ id, title, description, fields = [], submitLabel = t("common.ok"), cancelLabel = t("common.cancel"), closable = true, width, onSubmit } = {}) {
  const inputs = {};
  const rows = fields.map((f) => {
    const check = f.type === "checkbox";
    const input = h("input", {
      class: check ? null : "ec-input",
      type: f.type ?? "text",
      name: f.name,
      placeholder: f.placeholder,
      autocomplete: f.autocomplete ?? "off",
      spellcheck: "false",
      "data-ec-focus": f.focusOnError ? "" : null
    });
    if (f.value != null) {
      if (check) input.checked = !!f.value;
      else input.value = f.value;
    }
    inputs[f.name] = input;
    return check ? h("label", { class: "ec-check" }, input, f.label) : h("label", { class: "ec-field" }, h("span", null, f.label), input);
  });
  const form = h("form", { novalidate: true }, rows);
  form.addEventListener("submit", (e) => e.preventDefault());
  form.addEventListener("keydown", (e) => {
    var _a;
    if (e.key === "Enter" && ((_a = e.target) == null ? void 0 : _a.type) !== "checkbox") {
      e.preventDefault();
      handle.trigger("submit");
    }
  });
  const handle = openDialog({
    id,
    title,
    closable,
    width,
    body: [description, form].filter(Boolean),
    actions: [
      { id: "cancel", label: cancelLabel },
      {
        id: "submit",
        label: submitLabel,
        variant: "primary",
        onClick: async (hd) => {
          const values = Object.fromEntries(fields.map((f) => [f.name, f.type === "checkbox" ? inputs[f.name].checked : inputs[f.name].value]));
          const missing = fields.find((f) => f.required && f.type !== "checkbox" && !String(values[f.name]).trim());
          if (missing) {
            hd.setStatus(t("common.missing", missing.label), "error");
            return false;
          }
          const out = await (onSubmit == null ? void 0 : onSubmit(values, hd));
          if (typeof out === "string") {
            hd.setStatus(out, "error");
            return false;
          }
          return out === false ? false : out ?? true;
        }
      }
    ]
  });
  return handle;
}

// src/presentation/icons.js
var NS = "http://www.w3.org/2000/svg";
var PATHS = {
  bolt: "M13 2 4 14h7l-1 8 9-12h-7z",
  crown: "M3 8l4 4 5-7 5 7 4-4-2 11H5z",
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21c0-4 4-6 8-6s8 2 8 6"],
  page: ["M6 3h12v18H6z", "M9 8h6", "M9 12h6", "M9 16h4"],
  swap: ["M5 8h13l-3-3", "M19 16H6l3 3"],
  swords: ["M4 4l11 11", "M20 4 9 15", "M4 20l3-3", "M20 20l-3-3"],
  gear: ["M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z", "M12 2v3", "M12 19v3", "M2 12h3", "M19 12h3", "M5 5l2 2", "M17 17l2 2", "M19 5l-2 2", "M7 17l-2 2"],
  eye: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  eyeOff: ["M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z", "M3 3l18 18"],
  logout: ["M9 4H5v16h4", "M16 8l4 4-4 4", "M20 12H9"],
  chevron: "M6 9l6 6 6-6",
  refresh: ["M20 12a8 8 0 1 1-2.3-5.7", "M20 4v5h-5"],
  warn: ["M12 3 2 21h20z", "M12 10v5", "M12 18v.5"],
  plug: ["M9 7V3", "M15 7V3", "M7 7h10v4a5 5 0 0 1-10 0z", "M12 16v5"],
  target: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  check: "M5 12l5 5 9-10",
  spark: "M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z",
  pin: ["M9 3h6l-1 6 3 4H7l3-4z", "M12 13v8"],
  link: ["M14 4h6v6", "M20 4l-9 9", "M18 14v5H5V6h5"],
  cart: ["M3 4h3l2.5 11h10L21 7H7", "M9.5 19.5h.01", "M17.5 19.5h.01"],
  recall: ["M3 11 12 3l9 8", "M5 10v10h14V10"],
  boots: "M8 3h5v7l7 4v5H4v-4l4-2z",
  sword: ["M20 4 9 15", "M7 13l4 4", "M5 19l2-2", "M20 4h-5", "M20 4v5"],
  next: ["M5 12h14", "M13 6l6 6-6 6"],
  coin: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M12 7v10", "M9.5 9.5h4a1.5 1.5 0 0 1 0 3h-3a1.5 1.5 0 0 0 0 3h4"],
  play: "M8 5l11 7-11 7z",
  users: ["M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M3 20c0-3 3-5 6-5s6 2 6 5", "M16 5.5a3 3 0 0 1 0 5.5", "M18 15c2 .6 3 2.2 3 5"],
  trend: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  globe: ["M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z", "M3 12h18", "M12 3c3.5 3.5 3.5 14.5 0 18", "M12 3c-3.5 3.5-3.5 14.5 0 18"]
};
function icon(name, size = 16, cls = "") {
  const svg = document.createElementNS(NS, "svg");
  for (const [k, v] of Object.entries({
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    "stroke-width": 2,
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "aria-hidden": "true",
    class: ("ec-ico " + cls).trim()
  })) svg.setAttribute(k, String(v));
  for (const d of [].concat(PATHS[name] ?? [])) {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    svg.append(p);
  }
  return svg;
}

// src/presentation/settings.js
var STYLE_ID3 = "draftsage-settings-style";
var CSS2 = `
.ecs{display:flex;flex-direction:column;gap:16px;user-select:none}
.ecs-top{display:flex;align-items:center;gap:8px}
.ecs-brand{flex:1;display:flex;align-items:center;gap:8px;font:bold 13px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--ds-text-hi)}
.ecs-brand .ec-ico{color:var(--ds-gold)}
.ecs-plan{display:flex;align-items:center;gap:6px;padding:3px 11px 3px 8px;border:1px solid var(--ds-border);border-radius:12px;font-size:12px;background:var(--ds-surface);color:var(--ds-meta)}
.ecs-plan[data-plan=premium]{border-color:var(--ds-gold);color:var(--ds-gold-hi);box-shadow:0 0 10px rgba(200,170,110,.35)}
.ecs-plan[data-plan=none]{cursor:pointer}
.ecs-ib{width:28px;height:28px;display:flex;align-items:center;justify-content:center;padding:0;background:var(--ds-surface-2);border:1px solid var(--ds-border);color:var(--ds-meta);cursor:pointer}
.ecs-ib:hover{border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ecs-power{display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;padding:12px 16px;background:linear-gradient(90deg,var(--ds-surface),var(--ds-bg));border:1px solid var(--ds-border);color:var(--ds-meta);font:inherit;text-align:left;cursor:pointer;transition:.2s}
.ecs-power:hover{border-color:var(--ds-gold-dim)}
.ecs-power[aria-pressed=true]{border-color:var(--ds-gold);color:var(--ds-text-hi);box-shadow:inset 0 0 18px rgba(200,170,110,.18)}
.ecs-bolt{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--ds-surface-2);color:var(--ds-mute-2);border:1px solid var(--ds-border);transition:.25s}
.ecs-power[aria-pressed=true] .ecs-bolt{color:#1a1408;background:radial-gradient(circle,var(--ds-text-hi),var(--ds-gold));border-color:var(--ds-text-hi);box-shadow:0 0 16px var(--ds-gold)}
.ecs-power-t{flex:1;font:bold 14px sans-serif;letter-spacing:.06em;text-transform:uppercase}
.ecs-switch{width:46px;height:22px;border-radius:11px;background:var(--ds-surface-2);border:1px solid var(--ds-border);position:relative;transition:.25s}
.ecs-switch::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--ds-mute-2);transition:.25s}
.ecs-power[aria-pressed=true] .ecs-switch{border-color:var(--ds-gold);background:#2a2112}
.ecs-power[aria-pressed=true] .ecs-switch::after{left:26px;background:var(--ds-gold-hi);box-shadow:0 0 8px var(--ds-gold)}
.ecs-cap{display:flex;align-items:center;gap:6px;margin-bottom:8px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ds-meta)}
.ecs-seg{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.ecs-tile{display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 6px 9px;background:var(--ds-surface);border:1px solid var(--ds-border);color:var(--ds-mute);font:inherit;cursor:pointer;transition:.15s}
.ecs-tile:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecs-tile small{font-size:11px;letter-spacing:.06em;text-transform:uppercase}
.ecs-tile[aria-checked=true]{border-color:var(--ds-gold);color:var(--ds-text-hi);background:#17130a;box-shadow:inset 0 0 14px rgba(200,170,110,.22),0 0 10px rgba(200,170,110,.18)}
.ecs-keys{display:flex;gap:14px;justify-content:center}
.ecs-key{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:72px;height:66px;padding:0;background:linear-gradient(#2b2f36,#1a1d22);border:1px solid var(--ds-border);border-bottom-width:5px;border-radius:7px;color:var(--ds-mute);font:bold 22px sans-serif;cursor:pointer;transition:.08s}
.ecs-key img{width:26px;height:26px;border-radius:5px;opacity:.5;pointer-events:none}
.ecs-key:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecs-key[aria-checked=true]{color:var(--ds-text-hi);border-color:var(--ds-gold);background:linear-gradient(#3b3119,#1f1a0c);box-shadow:0 0 16px rgba(200,170,110,.45)}
.ecs-key[aria-checked=true] img{opacity:1}
.ecs-key:active{border-bottom-width:2px;transform:translateY(3px)}
.ecs-off .ecs-seg,.ecs-off .ecs-keys{opacity:.5}
.ecs-chips{display:flex;gap:6px}
.ecs-chip{flex:1;min-width:0;padding:8px 2px;background:var(--ds-surface);border:1px solid var(--ds-border);color:var(--ds-mute);font:inherit;font-size:11px;letter-spacing:.04em;text-transform:uppercase;cursor:pointer;transition:.15s}
.ecs-chip:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecs-chip[aria-pressed=true]{border-color:var(--ds-gold);color:var(--ds-text-hi);background:#17130a;box-shadow:inset 0 0 12px rgba(200,170,110,.22)}
.ecs-chips-t .ecs-chip{padding:8px 0;font-size:10px;letter-spacing:0;text-transform:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ecs-chips-t .ecs-chip[data-tier=auto]{flex:0 0 46px;text-transform:uppercase}
.ecs-chips-r{flex-wrap:wrap;margin-top:6px}
.ecs-chips-r .ecs-chip{flex:0 0 calc(20% - 5px);padding:6px 0;font-size:10px}
.ecs-chip[aria-disabled=true]{opacity:.35;cursor:not-allowed}
.ecs-chip[aria-disabled=true]:hover{border-color:var(--ds-border);color:var(--ds-mute)}
.ecs-more{display:flex;align-items:center;gap:6px;align-self:center;padding:4px 10px;background:none;border:0;color:#6b6b73;font:inherit;font-size:11px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}
.ecs-more:hover{color:var(--ds-text)}
.ecs-more .ec-ico{transition:transform .2s}
.ecs-more[aria-expanded=true] .ec-ico{transform:rotate(180deg)}
.ecs-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:8px}
.ecs-mini{display:flex;flex-direction:column;align-items:center;gap:4px;padding:9px 2px 6px;background:var(--ds-surface);border:1px solid var(--ds-border-soft);color:var(--ds-mute);font:inherit;cursor:pointer}
.ecs-mini small{font-size:10px;letter-spacing:.05em;text-transform:uppercase}
.ecs-mini:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecs-mini[aria-pressed=false]{opacity:.6}
.ecs-pop{animation:ecs-in .18s ease-out}
@keyframes ecs-in{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.ecs-sec{display:flex;flex-direction:column;gap:12px;padding-top:12px;border-top:1px solid var(--ds-border-soft)}
.ecs-sh{display:flex;flex-direction:column;gap:2px}
.ecs-sh h3{display:flex;align-items:center;gap:7px;margin:0;font:bold 12px sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--ds-gold)}
.ecs-desc{margin:0;font-size:11px;line-height:1.4;color:var(--ds-meta);letter-spacing:0;text-transform:none}
.ecs-cap + .ecs-desc{margin:-5px 0 8px}
`;
function ensureStyle2() {
  ensureTheme();
  if (document.getElementById(STYLE_ID3)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID3;
  s.textContent = CSS2;
  document.head.append(s);
}
var TARGETS = [
  { id: "own", ico: "page", label: "set.own", tip: "set.ownTip" },
  { id: "current", ico: "swap", label: "set.current", tip: "set.currentTip" }
];
function openSettings({ applier: applier2, catalog: catalog2, filters, source, overlay: overlay2, advisor: advisor2, mastery: mastery2, getSession, isSimulating, panelEnabled, updates, actions }) {
  ensureStyle2();
  const box = h("div", { class: "ecs" });
  let more = false;
  let regionsOpen = false;
  let regionsAnim = false;
  let handle;
  const go = (fn) => {
    handle.close();
    Promise.resolve().then(fn).catch((e) => log.error("ajustes:", e));
  };
  const build = () => {
    const cfg = applier2.getSettings();
    const ses = getSession();
    const plan = ses.loggedIn ? h("div", { class: "ecs-plan", "data-plan": ses.premium ? "premium" : "free", title: ses.email ?? "" }, icon(ses.premium ? "crown" : "user", 14), ses.premium ? t("set.premium") : t("set.free")) : h("button", { type: "button", class: "ecs-plan", "data-plan": "none", title: t("set.enterTip"), onclick: () => go(actions.login) }, icon("user", 14), t("set.enter"));
    const top = h(
      "div",
      { class: "ecs-top" },
      h("div", { class: "ecs-brand" }, icon("gear", 16), "Draftsage"),
      plan,
      ses.loggedIn && h("button", { type: "button", class: "ecs-ib", title: t("set.logout"), "data-act": "logout", onclick: () => go(actions.logout) }, icon("logout", 15))
    );
    const power = h("button", {
      type: "button",
      class: "ecs-power",
      "aria-pressed": String(cfg.enabled),
      "data-act": "power",
      title: cfg.enabled ? t("set.applyOn") : t("set.applyOff"),
      onclick: () => {
        if (cfg.enabled) {
          applier2.setEnabled(false);
          render();
        } else go(async () => {
          await actions.enableApply();
          actions.reopen();
        });
      }
    }, h("span", { class: "ecs-bolt" }, icon("bolt", 20)), h("span", { class: "ecs-power-t" }, t("set.apply")), h("span", { class: "ecs-switch" }));
    const target = h(
      "div",
      null,
      h("div", { class: "ecs-cap" }, icon("page", 13), t("set.runes")),
      h("div", { class: "ecs-seg", role: "radiogroup" }, TARGETS.map((x) => h("button", {
        type: "button",
        class: "ecs-tile",
        role: "radio",
        "aria-checked": String(cfg.target === x.id),
        "data-target": x.id,
        title: t(x.tip),
        onclick: () => {
          applier2.setSettings({ target: x.id });
          render();
        }
      }, icon(x.ico, 24), h("small", null, t(x.label)))))
    );
    const flashIcon = catalog2.spell(4).icon;
    const keys = h(
      "div",
      null,
      h("div", { class: "ecs-cap" }, icon("spark", 13), t("set.flash")),
      h("div", { class: "ecs-keys", role: "radiogroup" }, ["d", "f"].map((k) => h("button", {
        type: "button",
        class: "ecs-key",
        role: "radio",
        "aria-checked": String(cfg.flashKey === k),
        "data-key": k,
        title: t("set.flashKey", k.toUpperCase()),
        onclick: () => {
          applier2.setSettings({ flashKey: k });
          render();
        }
      }, flashIcon && h("img", { src: flashIcon, alt: "", draggable: "false" }), k.toUpperCase())))
    );
    const fl = filters.get();
    const eloChip = (id, label, tip, pressed, onclick) => h("button", { type: "button", class: "ecs-chip", "data-tier": id, "aria-pressed": String(pressed), title: tip, onclick }, label);
    const elo = h(
      "div",
      null,
      h("div", { class: "ecs-cap" }, icon("target", 13), t("set.elo")),
      h(
        "div",
        { class: "ecs-chips ecs-chips-t", role: "group" },
        eloChip("auto", t("set.auto"), t("set.eloAutoTip"), fl.tiers.mode === "auto", () => {
          filters.set({ tiers: { ...fl.tiers, mode: "auto" } });
          render();
        }),
        [3, 4, 5, 6, 7].map((n) => eloChip(
          String(n),
          t("tier." + n),
          t("set.eloTip", t("tier." + n)),
          fl.tiers.mode === "range" && n >= fl.tiers.min && n <= fl.tiers.max,
          () => {
            filters.set({ tiers: toggleTier(fl.tiers, n) });
            render();
          }
        ))
      )
    );
    const picked = fl.regions;
    const regionSummary = !picked.length ? t("set.regionsPick") : picked.length <= 2 ? picked.map(regionCode).join(" ") : regionCode(picked[0]) + " +" + (picked.length - 1);
    const regionChip = (id, label, tip, pressed, onclick, extra = {}) => h("button", { type: "button", class: "ecs-chip", "data-region": id, "aria-pressed": String(pressed), title: tip, onclick, ...extra }, label);
    const regions = h(
      "div",
      null,
      h("div", { class: "ecs-cap" }, icon("globe", 13), t("set.regions")),
      h(
        "div",
        { class: "ecs-chips", role: "group" },
        regionChip("all", t("set.regionsAll"), t("set.regionsAllTip"), !picked.length, () => {
          filters.set({ regions: [] });
          render();
        }),
        regionChip(
          "pick",
          regionSummary,
          picked.length ? picked.map(regionCode).join(", ") : t("set.regionsPickTip"),
          picked.length > 0,
          () => {
            regionsOpen = !regionsOpen;
            regionsAnim = regionsOpen;
            render();
          },
          { "aria-expanded": String(regionsOpen) }
        )
      ),
      regionsOpen && h(
        "div",
        { class: "ecs-chips ecs-chips-r" + (regionsAnim ? " ecs-pop" : ""), role: "group" },
        REGIONS.map((r) => regionChip(
          String(r.id),
          r.code,
          t("set.regionTip", r.code),
          picked.includes(r.id),
          () => {
            regionsAnim = false;
            filters.set({ regions: toggleRegion(picked, r.id) });
            render();
          }
        ))
      )
    );
    const premium = !!ses.premium;
    const patchChip = (id, label, tip, pressed, locked, onclick) => h("button", {
      type: "button",
      class: "ecs-chip",
      "data-patch": id,
      "aria-pressed": String(pressed),
      "aria-disabled": locked ? "true" : null,
      title: locked ? t("set.premiumOnly") : tip,
      onclick: locked ? null : onclick
    }, label);
    const auto = fl.patches.mode === "auto";
    const patches = h(
      "div",
      null,
      h("div", { class: "ecs-cap" }, icon("refresh", 13), t("set.patches")),
      h(
        "div",
        { class: "ecs-chips", role: "group" },
        patchChip("auto", t("set.auto"), t("set.patchAutoTip"), auto, false, () => {
          filters.set({ patches: { ...fl.patches, mode: "auto" } });
          render();
        }),
        patchChip("0", t("set.patchCurrent"), t("set.patchCurrentTip"), !auto && fl.patches.additions === 0, false, () => {
          filters.set({ patches: { mode: "manual", additions: 0 } });
          render();
        }),
        Array.from({ length: MAX_PATCH_RANGE }, (_, i) => i + 1).map((n) => patchChip(
          String(n),
          "+" + n,
          t("set.patchPlusTip", n),
          !auto && fl.patches.additions === n,
          !premium,
          () => {
            filters.set({ patches: { mode: "manual", additions: n } });
            render();
          }
        ))
      )
    );
    const srcMode = source.get();
    const srcChip = (id, label, tip) => h("button", { type: "button", class: "ecs-chip", "data-source": id, "aria-pressed": String(srcMode === id), title: tip, onclick: () => {
      source.set(id);
      render();
    } }, label);
    const src = h(
      "div",
      null,
      h("div", { class: "ecs-cap" }, icon("swap", 13), t("set.source")),
      h(
        "div",
        { class: "ecs-chips", role: "group" },
        srcChip("coachless", t("set.srcCoachless"), t("set.srcCoachlessTip")),
        srcChip("lolalytics", t("set.srcLola"), t("set.srcLolaTip")),
        srcChip("auto", t("set.srcAuto"), t("set.srcAutoTip"))
      )
    );
    const sim = isSimulating();
    const mini = (act, ico, label, tip, onclick, pressed) => h("button", { type: "button", class: "ecs-mini", "data-act": act, title: tip, "aria-pressed": pressed == null ? null : String(pressed), onclick }, icon(ico, 20), h("small", null, label));
    const grid = h(
      "div",
      { class: "ecs-grid ecs-pop" },
      mini("simulate", "target", t("set.simulate"), t("set.simulateTip"), () => go(actions.simulate)),
      sim && mini("unsimulate", "close", t("set.exit"), t("set.exitTip"), () => {
        actions.unsimulate();
        render();
      }),
      mini("cors", "plug", t("set.conn"), t("set.connTip"), () => go(actions.cors))
    );
    const generalMinis = [
      mini("panel", panelEnabled() ? "eye" : "eyeOff", t("set.panel"), panelEnabled() ? t("set.panelHide") : t("set.panelShow"), () => {
        actions.togglePanel();
        render();
      }, panelEnabled()),
      mini("overlay", "swords", t("set.overlay"), overlay2.isEnabled() ? t("set.overlayOn") : t("set.overlayOff"), () => {
        overlay2.setEnabled(!overlay2.isEnabled());
        window.dispatchEvent(new Event("draftsage:prefs"));
        render();
      }, overlay2.isEnabled()),
      mini("lang", "globe", getLang().toUpperCase(), t("set.langTip"), () => {
        actions.toggleLanguage();
        relabel();
      }),
      mini("resetpos", "refresh", t("set.resetPos"), t("set.resetPosTip"), () => actions.resetPanel())
    ];
    const advisorMini = mini(
      "advisor",
      "spark",
      t("set.advisor"),
      advisor2.isEnabled() ? t("set.advisorOn") : t("set.advisorOff"),
      () => {
        if (advisor2.isEnabled()) {
          advisor2.setEnabled(false);
          render();
        } else go(async () => {
          await actions.enableAdvisor();
          actions.reopen();
        });
      },
      advisor2.isEnabled()
    );
    const mOn = mastery2.isEnabled();
    const mW = mastery2.weight();
    const mNearest = Object.keys(MASTERY_WEIGHTS).reduce((a, b) => Math.abs(MASTERY_WEIGHTS[b] - mW) < Math.abs(MASTERY_WEIGHTS[a] - mW) ? b : a);
    const mChip = (id, label, tip, pressed, onclick) => h("button", { type: "button", class: "ecs-chip", "data-mastery": id, "aria-pressed": String(pressed), title: tip, onclick }, label);
    const masteryRow = h(
      "div",
      null,
      h("div", { class: "ecs-cap" }, icon("user", 13), t("set.mastery")),
      h(
        "div",
        { class: "ecs-chips", role: "group" },
        mChip("off", t("set.masteryOff"), t("set.masteryTip"), !mOn, () => {
          mastery2.off();
          render();
        }),
        [["low", "set.masteryLow"], ["normal", "set.masteryNormal"], ["high", "set.masteryHigh"]].map(([id, label]) => mChip(
          id,
          t(label),
          t("set.masteryWeightTip", MASTERY_WEIGHTS[id]),
          mOn && mNearest === id,
          () => {
            if (mOn) {
              mastery2.setWeight(MASTERY_WEIGHTS[id]);
              render();
            } else go(async () => {
              if (await actions.enableMastery()) mastery2.setWeight(MASTERY_WEIGHTS[id]);
              actions.reopen();
            });
          }
        ))
      )
    );
    const uMode = updates.mode();
    const uBuild = updates.build();
    const uChip = (id, label, tip) => h("button", {
      type: "button",
      class: "ecs-chip",
      "data-updates": id,
      "aria-pressed": String(uMode === id),
      title: tip,
      onclick: () => {
        updates.setMode(id);
        notify.success(t("set.updRestart"));
        render();
      }
    }, label);
    const updatesRow = h(
      "div",
      null,
      h("div", { class: "ecs-cap" }, icon("refresh", 13), t("set.updates")),
      h(
        "div",
        { class: "ecs-chips", role: "group", title: t("set.updatesTip", uBuild.version, t(uBuild.source === "remote" ? "set.updSrcRemote" : "set.updSrcPackaged")) },
        uChip("auto", t("set.updAuto"), t("set.updAutoTip")),
        uChip("packaged", t("set.updPackaged"), t("set.updPackagedTip"))
      ),
      h(
        "div",
        { style: "margin-top: 8px;" },
        h("button", {
          type: "button",
          class: "ecs-chip",
          onclick: () => {
            if (typeof window.restartClient === "function") {
              window.restartClient();
            }
          }
        }, t("set.restartClient"))
      )
    );
    const sect = (id, ico, children) => h(
      "section",
      { class: "ecs-sec", "data-section": id, "aria-label": t("set.sec." + id) },
      h("div", { class: "ecs-sh" }, h("h3", null, icon(ico, 14), t("set.sec." + id)), h("p", { class: "ecs-desc" }, t("set.sec." + id + "Desc"))),
      ...children.filter(Boolean)
    );
    const desc = (key2) => h("p", { class: "ecs-desc" }, t(key2));
    return [
      top,
      sect("general", "eye", [h("div", { class: "ecs-grid" }, generalMinis)]),
      sect("data", "swap", [src, desc("set.d.source"), elo, desc("set.d.elo"), patches, regions]),
      sect("advisor", "spark", [h("div", { class: "ecs-grid" }, advisorMini), desc("set.d.advisor"), masteryRow, desc("set.d.mastery")]),
      sect("apply", "bolt", [power, desc("set.d.apply"), h("div", { class: cfg.enabled ? "" : "ecs-off" }, h("div", { class: "ecs", style: "gap:16px" }, target, keys)), desc("set.d.shortcuts")]),
      h("button", { type: "button", class: "ecs-more", "aria-expanded": String(more), "data-act": "more", title: t("set.moreTip"), onclick: () => {
        more = !more;
        render();
      } }, icon("chevron", 14), t("set.sec.advanced")),
      more && sect("advanced", "gear", [grid, updatesRow])
    ];
  };
  const render = () => box.replaceChildren(...build().filter(Boolean));
  const relabel = () => {
    var _a;
    render();
    const b = (_a = handle.el) == null ? void 0 : _a.querySelector(".ec-actions .ec-btn");
    if (b) b.textContent = t("common.done");
  };
  handle = openDialog({ id: "main", width: 400, body: box, actions: [{ id: "close", label: t("common.done"), variant: "primary" }] });
  render();
  catalog2.load().then(render).catch(() => {
  });
  return handle;
}

// src/infrastructure/coachless/auth.js
var API = "https://api.coachless.gg/api/";
var KEY3 = "draftsage/auth";
var SKEW_MS = 5 * 60 * 1e3;
var access = null;
var inflight = null;
var TIMEOUT_MS = 15e3;
var request = async (method, path, body, token) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const r = await fetch(API + path, {
      method,
      headers: { ...method === "POST" && { "Content-Type": "application/json" }, ...token && { Authorization: "Bearer " + token } },
      body: method === "POST" ? JSON.stringify(body) : void 0,
      signal: ctrl.signal
    });
    let data = null;
    try {
      data = await r.json();
    } catch {
    }
    return { status: r.status, data };
  } finally {
    clearTimeout(timer);
  }
};
var post = (path, body, token) => request("POST", path, body, token);
function claimsOf(jwt) {
  try {
    const seg = jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(seg.padEnd(Math.ceil(seg.length / 4) * 4, "=")));
  } catch {
    return null;
  }
}
function setSession(accessToken, refreshToken) {
  const claims = claimsOf(accessToken);
  access = { token: accessToken, exp: ((claims == null ? void 0 : claims.exp) ?? 0) * 1e3, claims };
  DataStore.set(KEY3, { refreshToken });
}
function clearSession() {
  access = null;
  DataStore.remove(KEY3);
}
async function login(email, password) {
  let res;
  try {
    res = await post("Auth/login", { email, password, rememberMe: false });
  } catch (e) {
    log.error("login: error de red", String(e));
    return { ok: false, reason: "network" };
  }
  const d = res.data;
  if (res.status !== 200 || (d == null ? void 0 : d.actionResult) !== 0 || !(d == null ? void 0 : d.accessToken) || !(d == null ? void 0 : d.refreshToken)) {
    log.warn("login rechazado | HTTP", res.status, "| actionResult", d == null ? void 0 : d.actionResult);
    return { ok: false, reason: "rejected" };
  }
  setSession(d.accessToken, d.refreshToken);
  log.info("sesi\xF3n iniciada | premium:", hasPremium());
  return { ok: true, premium: hasPremium() };
}
function logout() {
  clearSession();
  log.info("sesi\xF3n cerrada");
}
async function refresh() {
  var _a, _b;
  const saved = DataStore.get(KEY3);
  if (!(saved == null ? void 0 : saved.refreshToken)) return false;
  let res;
  try {
    res = await post("Auth/refresh", { refreshToken: saved.refreshToken });
  } catch (e) {
    log.warn("refresh: error de red (se conserva la sesi\xF3n)", String(e));
    return false;
  }
  if (res.status === 200 && ((_a = res.data) == null ? void 0 : _a.accessToken) && ((_b = res.data) == null ? void 0 : _b.refreshToken)) {
    setSession(res.data.accessToken, res.data.refreshToken);
    log.debug("access token renovado");
    return true;
  }
  if ([400, 401, 403].includes(res.status)) {
    log.warn("refresh rechazado (HTTP " + res.status + "); se pide login de nuevo");
    clearSession();
  }
  return false;
}
async function getAccessToken() {
  if (access && access.exp - Date.now() > SKEW_MS) return access.token;
  inflight ??= refresh().finally(() => {
    inflight = null;
  });
  return await inflight ? access.token : null;
}
var isLoggedIn = () => {
  var _a;
  return !!access || !!((_a = DataStore.get(KEY3)) == null ? void 0 : _a.refreshToken);
};
function hasPremium() {
  var _a;
  return ((_a = access == null ? void 0 : access.claims) == null ? void 0 : _a.isSubscribed) === "1";
}
var sessionInfo = () => {
  var _a;
  return {
    loggedIn: isLoggedIn(),
    premium: hasPremium(),
    email: ((_a = access == null ? void 0 : access.claims) == null ? void 0 : _a.email) ?? null
    // solo disponible con el access token en memoria
  };
};
async function restoreSession() {
  var _a;
  if (!((_a = DataStore.get(KEY3)) == null ? void 0 : _a.refreshToken)) return false;
  return !!await getAccessToken();
}
async function authed(method, path, body) {
  try {
    let token = await getAccessToken();
    if (!token) return { ok: false, reason: "auth" };
    let res = await request(method, path, body, token);
    if (res.status === 401) {
      access = null;
      token = await getAccessToken();
      if (!token) return { ok: false, reason: "auth" };
      res = await request(method, path, body, token);
    }
    if (res.status === 403) return { ok: false, status: 403, reason: "forbidden", premium: hasPremium() };
    return { ok: res.status === 200, status: res.status, data: res.data };
  } catch (e) {
    log.warn("petici\xF3n fallida:", path, String(e));
    return { ok: false, reason: "network" };
  }
}
var api = (path, body) => authed("POST", path, body);
var apiGet = (path) => authed("GET", path);
window.draftsage = Object.assign(window.draftsage ?? {}, {
  auth: { login, logout, status: () => ({ loggedIn: isLoggedIn(), premium: hasPremium(), exp: access == null ? void 0 : access.exp }) }
});

// src/infrastructure/lcu/lcu-client.js
async function lcuGet(path, { timeoutMs = 4e3 } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(path, { signal: ctrl.signal });
    if (!r.ok) {
      log.debug("LCU", path, "\u2192 HTTP", r.status);
      return null;
    }
    return await r.json();
  } catch (e) {
    log.debug("LCU", path, "fall\xF3:", String(e));
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// src/infrastructure/lcu/game-data.js
var norm2 = (s) => String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
var plainText = (v) => typeof v === "string" ? v.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim().slice(0, 240) : "";
function createGameData({ lcuGet: lcuGet2 }) {
  const runes = /* @__PURE__ */ new Map();
  const spells = /* @__PURE__ */ new Map();
  const champions = /* @__PURE__ */ new Map();
  const items = /* @__PURE__ */ new Map();
  const keystoneTrees = /* @__PURE__ */ new Map();
  const runeTrees = /* @__PURE__ */ new Map();
  let loading = null;
  let loaded = false;
  const RUNE_RETRY_MS = [1500, 4e3, 8e3];
  const sleep2 = (ms) => new Promise((r) => setTimeout(r, ms));
  async function loadRunes() {
    var _a, _b, _c;
    const [perks, styles] = await Promise.all([
      lcuGet2("/lol-perks/v1/perks", { timeoutMs: 12e3 }),
      lcuGet2("/lol-perks/v1/styles", { timeoutMs: 8e3 })
    ]);
    for (const p of Array.isArray(perks) ? perks : []) runes.set(p.id, { id: p.id, name: p.name, icon: p.iconPath, desc: plainText(p.shortDesc) });
    for (const s of Array.isArray(styles) ? styles : []) {
      runes.set(s.id, { id: s.id, name: s.name, icon: s.iconPath });
      const keystones = ((_a = (s.slots ?? []).find((x) => x.type === "kKeyStone")) == null ? void 0 : _a.perks) ?? ((_c = (_b = s.slots) == null ? void 0 : _b[0]) == null ? void 0 : _c.perks) ?? [];
      for (const k of keystones) keystoneTrees.set(k, s.id);
      for (const slot of s.slots ?? []) for (const k of slot.perks ?? []) runeTrees.set(k, s.id);
    }
    return Array.isArray(perks) && perks.length > 0 && Array.isArray(styles) && styles.length > 0;
  }
  async function loadRunesWithRetry() {
    for (let attempt = 0; ; attempt++) {
      if (await loadRunes()) return true;
      if (attempt >= RUNE_RETRY_MS.length) return false;
      log.debug("runas del cliente no disponibles; reintento", attempt + 1, "de", RUNE_RETRY_MS.length);
      await sleep2(RUNE_RETRY_MS[attempt]);
    }
  }
  const load = () => loading ??= (async () => {
    const [runesOk, sp, ch, it] = await Promise.all([
      loadRunesWithRetry(),
      lcuGet2("/lol-game-data/assets/v1/summoner-spells.json"),
      lcuGet2("/lol-game-data/assets/v1/champion-summary.json"),
      lcuGet2("/lol-game-data/assets/v1/items.json")
    ]);
    for (const s of sp ?? []) spells.set(s.id, { id: s.id, name: s.name, icon: s.iconPath, desc: plainText(s.description) });
    for (const c of ch ?? []) if (c.id > 0) champions.set(c.id, { id: c.id, name: c.name, alias: c.alias, icon: c.squarePortraitPath, classes: Array.isArray(c.roles) ? c.roles.map((r) => String(r).toLowerCase()) : [] });
    for (const i of Array.isArray(it) ? it : []) if ((i == null ? void 0 : i.id) > 0) items.set(i.id, { id: i.id, name: i.name, icon: i.iconPath, boots: Array.isArray(i.categories) && i.categories.includes("Boots"), priceTotal: Number.isFinite(i.priceTotal) ? i.priceTotal : null, from: Array.isArray(i.from) ? i.from : [] });
    loaded = true;
    log.debug("datos del cliente:", runes.size, "runas,", spells.size, "hechizos,", champions.size, "campeones,", items.size, "\xEDtems");
    if (!runesOk) log.warn('no se pudieron cargar las runas del cliente (/lol-perks/v1/perks|styles): la interfaz mostrar\xE1 "#id" en lugar de iconos; activa draftsage.debug(true) para ver el motivo');
    if (!runesOk || !ch) loading = null;
  })();
  return {
    load,
    isLoaded: () => loaded,
    rune: (id) => runes.get(id) ?? { id, name: "#" + id, icon: null },
    spell: (id) => spells.get(id) ?? { id, name: "#" + id, icon: null },
    item: (id) => items.get(id) ?? { id, name: "#" + id, icon: null, boots: false, priceTotal: null, from: [] },
    /** Precio total y componentes (para el seguimiento en partida) o null si no se conocen. */
    recipe: (id) => {
      const i = items.get(id);
      return i && i.priceTotal != null ? { priceTotal: i.priceTotal, from: i.from } : null;
    },
    isBoots: (id) => {
      var _a;
      return ((_a = items.get(id)) == null ? void 0 : _a.boots) === true;
    },
    champion: (id) => champions.get(id) ?? { id, name: "#" + id, icon: null, classes: [] },
    keystoneTrees: () => keystoneTrees,
    runeTrees: () => runeTrees,
    /** Busca un campeón por nombre o alias (sin tildes ni mayúsculas): nombre exacto, alias exacto y por último prefijo. */
    findChampion(query) {
      const q = norm2(query);
      if (!q) return null;
      const all = [...champions.values()];
      return all.find((c) => norm2(c.name) === q) ?? all.find((c) => norm2(c.alias) === q) ?? all.find((c) => norm2(c.name).startsWith(q)) ?? null;
    }
  };
}

// src/application/catalog.js
var catalog = createGameData({ lcuGet });

// src/domain/patch.js
function choosePatch(patches, { minRatio = 0.3, lookback = 3 } = {}) {
  const list = (Array.isArray(patches) ? patches : []).filter((p2) => p2 && Number.isFinite(p2.major) && Number.isFinite(p2.patch) && Number.isFinite(p2.matchCount)).sort((a, b) => a.major - b.major || a.patch - b.patch);
  if (!list.length) return null;
  for (let i = list.length - 1; i >= 0; i--) {
    const before = list.slice(Math.max(0, i - lookback), i);
    const ref = before.length ? Math.max(...before.map((p3) => p3.matchCount)) : 0;
    const p2 = list[i];
    if (!before.length || p2.matchCount >= ref * minRatio) {
      return { major: p2.major, patch: p2.patch, label: p2.label ?? `${p2.major}.${p2.patch}`, matchCount: p2.matchCount, fallback: i !== list.length - 1 };
    }
  }
  const p = list[0];
  return { major: p.major, patch: p.patch, label: p.label ?? `${p.major}.${p.patch}`, matchCount: p.matchCount, fallback: list.length > 1 };
}
function patchSpanLabel(patch, additions = 0) {
  const n = Math.max(0, Math.round(additions) || 0);
  if (!patch || n === 0) return (patch == null ? void 0 : patch.label) ?? "";
  const from = patch.patch - n;
  return from >= 1 ? `${patch.major}.${from}\u2013${patch.patch}` : `${patch.label}+${n}`;
}

// src/domain/runes.js
var TREES = {
  8e3: { name: "Precisi\xF3n", keystones: [8005, 8008, 8021, 8010] },
  8100: { name: "Dominaci\xF3n", keystones: [8112, 8128, 9923] },
  8200: { name: "Brujer\xEDa", keystones: [8214, 8229, 8230, 8992] },
  8300: { name: "Inspiraci\xF3n", keystones: [8351, 8360, 8369] },
  8400: { name: "Valor", keystones: [8437, 8439, 8465] }
};
var TREE_IDS = Object.keys(TREES).map(Number);
function treeOfKeystone(keystoneId, extra) {
  var _a;
  const fromClient = (_a = extra == null ? void 0 : extra.get) == null ? void 0 : _a.call(extra, keystoneId);
  if (fromClient) return fromClient;
  return TREE_IDS.find((t2) => TREES[t2].keystones.includes(keystoneId));
}
var RUNE_TREE_EXCEPTIONS = { 9101: 8e3, 9103: 8e3, 9104: 8e3, 9105: 8e3, 9111: 8e3, 8299: 8e3, 9923: 8100 };
function treeOfRune(runeId, extra) {
  var _a;
  const fromClient = (_a = extra == null ? void 0 : extra.get) == null ? void 0 : _a.call(extra, runeId);
  if (fromClient) return fromClient;
  const ks = treeOfKeystone(runeId);
  if (ks) return ks;
  if (RUNE_TREE_EXCEPTIONS[runeId]) return RUNE_TREE_EXCEPTIONS[runeId];
  const g = Math.floor(runeId / 100) * 100;
  return TREE_IDS.includes(g) ? g : void 0;
}

// src/domain/items.js
var BLOCK = { STARTER: 0, EARLY: 1, CORE: 2, OPTIONS: 3, SITUATIONAL: 4 };
var LIMITS = { starters: 2, early: 4, boots: 3, next: 3, options: 4, situational: 6 };
var TIER_LETTERS = ["S", "A", "B"];
var tierLetter = (tier) => Number.isInteger(tier) ? TIER_LETTERS[tier] ?? null : null;
var validId = (x) => Number.isInteger(x) && x > 0 ? x : null;
var statOf = (e) => {
  const item = validId(e == null ? void 0 : e.item);
  if (!item) return null;
  const occurrence = Number.isFinite(e.occurrence) && e.occurrence > 0 ? e.occurrence : 0;
  const wpa = occurrence > 0 && Number.isFinite(e.wpa) ? e.wpa : null;
  return { item, wpa, occurrence, ...Number.isFinite(e.wr) && { wr: e.wr }, ...e.share != null && { share: e.share }, ...e.highlighted && { highlighted: true } };
};
var stats = (list) => {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const e of list ?? []) {
    const s = statOf(e);
    if (s && !seen.has(s.item)) {
      seen.add(s.item);
      out.push(s);
    }
  }
  return out;
};
var byUse = (a, b) => b.occurrence - a.occurrence;
function pickBuild(builds, keystone) {
  const list = (builds ?? []).filter((b) => b && typeof b === "object");
  if (!list.length) return null;
  const rank = (a, b) => (a.tier ?? 99) - (b.tier ?? 99) || (b.occurrence ?? 0) - (a.occurrence ?? 0);
  const same = list.filter((b) => b.keystone === keystone).sort(rank);
  if (same.length) return { build: same[0], keystoneMatch: true };
  return { build: [...list].sort(rank)[0], keystoneMatch: false };
}
function buildItemPlan(build, { keystoneMatch = true, boots = [], next = [] } = {}) {
  if (!build) return null;
  const block = (type) => (build.itemBlocks ?? []).filter((b) => (b == null ? void 0 : b.type) === type).flatMap((b) => b.items ?? []);
  const uniq = (ids) => [...new Set((ids ?? []).map(validId).filter(Boolean))];
  const plan = {
    tier: Number.isInteger(build.tier) ? build.tier : null,
    winrate: Number.isFinite(build.winrate) ? build.winrate : null,
    games: Number.isFinite(build.occurrence) && build.occurrence > 0 ? build.occurrence : 0,
    keystoneMatch,
    starters: uniq(build.starterIds).slice(0, LIMITS.starters),
    core: uniq([build.firstItemId, build.secondItemId]),
    path: stats(block(BLOCK.CORE)),
    early: stats(block(BLOCK.EARLY)).sort(byUse),
    options: stats(block(BLOCK.OPTIONS)).sort(byUse),
    situational: stats(block(BLOCK.SITUATIONAL)).sort((a, b) => Number(!!b.highlighted) - Number(!!a.highlighted) || byUse(a, b)),
    boots: stats(boots),
    next: stats(next)
  };
  const any = plan.starters.length || plan.core.length || plan.path.length || plan.early.length || plan.options.length || plan.situational.length;
  return any ? plan : null;
}
function layoutItems(plan, { isBoots = () => false, compact = false } = {}) {
  if (!plan) return null;
  const used = /* @__PURE__ */ new Set([...plan.core, ...plan.starters]);
  const fresh = (s) => !used.has(s.item);
  const take = (list, max) => {
    const out = [];
    for (const s of list) {
      if (out.length >= max) break;
      if (fresh(s)) {
        out.push(s);
        used.add(s.item);
      }
    }
    return out;
  };
  const bootsPool = plan.boots.length ? plan.boots : [...plan.path, ...plan.early].filter((s) => isBoots(s.item));
  const boots = take(bootsPool, LIMITS.boots);
  const notBoots = (s) => !isBoots(s.item);
  const next = take(plan.next.filter(notBoots), LIMITS.next);
  if (compact) return { tier: plan.tier, winrate: plan.winrate, games: plan.games, keystoneMatch: plan.keystoneMatch, starters: plan.starters, boots, core: plan.core, next, early: [], options: [], situational: [] };
  const early = take(plan.early.filter(notBoots), LIMITS.early);
  const options = take(plan.options.filter(notBoots), LIMITS.options);
  const situational = take(plan.situational.filter(notBoots), LIMITS.situational);
  return { tier: plan.tier, winrate: plan.winrate, games: plan.games, keystoneMatch: plan.keystoneMatch, starters: plan.starters, boots, core: plan.core, next, early, options, situational };
}
var hasItems = (l) => !!l && !!(l.starters.length || l.boots.length || l.core.length || l.next.length || l.early.length || l.options.length || l.situational.length);

// src/domain/selection.js
var MIN_SHARE = 0.1;
var MIN_TREE_SHARE = 0.1;
var MIN_ABS = 50;
var better = (a, b) => b.wpa > a.wpa || b.wpa === a.wpa && b.occurrence > a.occurrence ? b : a;
function pickBest(entries, { minShare = MIN_SHARE, minAbs = MIN_ABS, exclude } = {}) {
  const list = (entries ?? []).filter((e) => e && Number.isFinite(e.wpa) && e.occurrence > 0 && !(exclude && exclude(e)));
  if (!list.length) return null;
  const total = list.reduce((s, e) => s + e.occurrence, 0);
  const ok = list.filter((e) => e.occurrence >= Math.max(minAbs, total * minShare));
  const pool = ok.length ? ok : [list.reduce((a, b) => b.occurrence > a.occurrence ? b : a)];
  return pool.reduce(better);
}
function rankBest(entries, { minShare = MIN_SHARE, minAbs = MIN_ABS, exclude } = {}) {
  const list = (entries ?? []).filter((e) => e && Number.isFinite(e.wpa) && e.occurrence > 0 && !(exclude && exclude(e)));
  const total = list.reduce((s, e) => s + e.occurrence, 0);
  return list.filter((e) => e.occurrence >= Math.max(minAbs, total * minShare)).map((e) => ({ ...e, share: e.occurrence / total })).sort((a, b) => b.wpa - a.wpa || b.occurrence - a.occurrence);
}
var KEYSTONE_MIN_SHARE = 0.03;
var pickKeystone = (entries) => pickBest(entries, { minShare: KEYSTONE_MIN_SHARE });
var rankKeystones = (entries) => rankBest(entries, { minShare: KEYSTONE_MIN_SHARE });
var pickRows = (rows) => (rows ?? []).map((r) => pickBest(r));
function pickSecondary(treeRows) {
  const trees = Object.entries(treeRows ?? {}).map(([tree, rows]) => ({
    tree: Number(tree),
    rows,
    total: (rows ?? []).flat().reduce((s, x) => s + ((x == null ? void 0 : x.occurrence) ?? 0), 0)
  }));
  const maxTotal = Math.max(0, ...trees.map((t2) => t2.total));
  let best = null;
  for (const { tree, rows, total } of trees) {
    if (total < maxTotal * MIN_TREE_SHARE) continue;
    const cands = pickRows(rows).map((p, row) => p ? { ...p, row } : null).filter(Boolean);
    if (cands.length < 2) continue;
    const top2 = [...cands].sort((a, b) => b.wpa - a.wpa || b.occurrence - a.occurrence).slice(0, 2);
    const score = top2[0].wpa + top2[1].wpa;
    const occ = top2[0].occurrence + top2[1].occurrence;
    if (!best || score > best.score || score === best.score && occ > best.occ) {
      best = { tree, picks: top2.sort((a, b) => a.row - b.row), score, occ };
    }
  }
  return best && { tree: best.tree, picks: best.picks, score: best.score };
}
var pickSpell = (entries, excludeIds = []) => pickBest(entries, { exclude: (e) => excludeIds.includes(e.spell) });

// src/domain/configuration.js
var OWN_PREFIX = "[DS] ";
var NAME_MAX = 25;
var FLASH = 4;
function runePageName(champion, opponent) {
  const base = opponent ? `${champion} vs ${opponent}` : String(champion);
  return (OWN_PREFIX + base).slice(0, NAME_MAX);
}
function buildRunePage(rec, name) {
  var _a;
  const primary = [(_a = rec == null ? void 0 : rec.keystone) == null ? void 0 : _a.rune, ...((rec == null ? void 0 : rec.primaryPicks) ?? []).map((p) => p == null ? void 0 : p.rune)];
  const secondary = ((rec == null ? void 0 : rec.secondaryPicks) ?? []).map((p) => p == null ? void 0 : p.rune);
  const shards = (rec == null ? void 0 : rec.shards) ?? [];
  const ids = [...primary, ...secondary, ...shards];
  if (primary.length !== 4 || secondary.length !== 2 || shards.length !== 3 || ids.some((x) => !Number.isInteger(x) || x <= 0)) {
    return { ok: false, reason: "incomplete" };
  }
  if (!rec.primaryTree || !rec.secondaryTree || rec.primaryTree === rec.secondaryTree) return { ok: false, reason: "incomplete" };
  if (new Set(ids.slice(0, 6)).size !== 6) return { ok: false, reason: "invalid" };
  return {
    ok: true,
    page: { name, primaryStyleId: rec.primaryTree, subStyleId: rec.secondaryTree, selectedPerkIds: ids, current: true }
  };
}
function buildSpellPair(rec, flashKey = "f") {
  const ids = ((rec == null ? void 0 : rec.spells) ?? []).map((s) => s == null ? void 0 : s.spell);
  if (ids.length !== 2 || ids.some((x) => !Number.isInteger(x) || x <= 0) || ids[0] === ids[1]) return { ok: false, reason: "incomplete" };
  let [a, b] = ids;
  if (a === FLASH && flashKey === "f") [a, b] = [b, a];
  else if (b === FLASH && flashKey === "d") [a, b] = [b, a];
  return { ok: true, spell1Id: a, spell2Id: b };
}
var samePerks = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => x === b[i]);

// src/domain/spells.js
var SPELL = { CLEANSE: 1, EXHAUST: 3, FLASH, GHOST: 6, HEAL: 7, SMITE: 11, TELEPORT: 12, CLARITY: 13, IGNITE: 14, BARRIER: 21, MARK: 32 };
var ARAM_MODES = /* @__PURE__ */ new Set(["ARAM", "KIWI"]);
var NO_SPELL_MODES = /* @__PURE__ */ new Set(["CHERRY"]);
function spellRules({ mode, role } = {}) {
  const m = String(mode ?? "").toUpperCase();
  if (NO_SPELL_MODES.has(m)) return { id: "none", none: true, exclude: [], require: null };
  if (ARAM_MODES.has(m)) return { id: "aram", none: false, exclude: [SPELL.SMITE, SPELL.TELEPORT], require: null };
  const exclude = m === "CLASSIC" ? [SPELL.CLARITY, SPELL.MARK] : [];
  if (role === 1) return { id: "jungle", none: false, exclude, require: SPELL.SMITE };
  if (Number.isInteger(role) && role >= 0 && role <= 4) return { id: "lane", none: false, exclude: [...exclude, SPELL.SMITE], require: null };
  return { id: "open", none: false, exclude, require: null };
}
var rulesKey = (r) => `${r.id}:${r.exclude.join(".")}:${r.require ?? ""}`;
function isValidPair(pair, rules) {
  if (rules.none || !Array.isArray(pair) || pair.length !== 2) return false;
  const [a, b] = pair;
  if (!Number.isInteger(a) || !Number.isInteger(b) || a <= 0 || b <= 0 || a === b) return false;
  if (rules.exclude.includes(a) || rules.exclude.includes(b)) return false;
  return rules.require == null || pair.includes(rules.require);
}
function replaceableIndex(pair, rules) {
  const i = pair.findIndex((id) => id !== FLASH && id !== rules.require);
  if (i >= 0) return i;
  return rules.require != null ? pair.findIndex((id) => id !== rules.require) : 1;
}

// src/application/recommendation.js
var MIN_MATCHUP_SAMPLE = 3e3;
var ALT_KEYSTONES = 4;
var ALT_SPELLS = 3;
var MIN_BOOTS_SHARE = 0.1;
var MIN_NEXT_SHARE = 0.05;
var aborted = () => ({ ok: false, reason: "aborted" });
function createRecommendationService({ client: client2, log: log2, keystoneTrees = () => void 0, cache, getFilters = () => void 0 }) {
  const filtersOf = (ctx, patch, tiers, { additions, matchup, regions = null }) => ({
    patch: { major: patch.major, patch: patch.patch, patchAdditions: additions },
    championIds: [ctx.championId],
    matchupChampionIds: matchup ? [ctx.opponentChampionId] : null,
    leagueTiers: tiers,
    regions,
    role: ctx.role ?? ROLE_FILL
  });
  async function compute(ctx, patch, tiers, plan, signal) {
    const f = filtersOf(ctx, patch, tiers, plan);
    const rules = spellRules(ctx);
    const [ks, sp, bd] = await Promise.all([client2.keystones(f), client2.spells(f), client2.builds(f)]);
    if (signal == null ? void 0 : signal.aborted) return { status: "aborted" };
    for (const r of [ks, sp, bd]) if (!r.ok && r.reason === "forbidden") return { status: "forbidden" };
    if (!ks.ok) return { status: "error", reason: ks.reason };
    const sample = ks.data.reduce((s, x) => s + x.occurrence, 0);
    const auto = pickKeystone(ks.data);
    if (!auto) return { status: "error", reason: "no-data", sample };
    const ranked = rankKeystones(ks.data);
    const forced = ctx.keystoneOverride ? ranked.find((k) => k.rune === ctx.keystoneOverride) : null;
    const keystone = forced ?? ranked.find((k) => k.rune === auto.rune) ?? auto;
    const customKeystone = !!forced && forced.rune !== auto.rune;
    log2.info("pasada", JSON.stringify({
      filtros: f,
      muestra: sample,
      topKeystones: ranked.slice(0, ALT_KEYSTONES).map((k) => ({ rune: k.rune, wpa: k.wpa, partidas: k.occurrence })),
      auto: auto.rune,
      elegida: keystone.rune,
      keystoneOverride: ctx.keystoneOverride ?? null
    }));
    const build = bd.ok ? bd.data.find((b) => b.keystone === keystone.rune) ?? bd.data[0] : null;
    const primaryTree = treeOfKeystone(keystone.rune, keystoneTrees()) ?? ((build == null ? void 0 : build.keystone) === keystone.rune ? build.primaryTree : void 0);
    if (!primaryTree) return { status: "error", reason: "no-data", sample };
    const stat = (id) => sp.ok ? sp.data.find((s) => s.spell === id) : null;
    const asStat = (id) => stat(id) ?? { spell: id, wpa: null, occurrence: 0 };
    const useOverride = isValidPair(ctx.spellOverride, rules);
    const plain1 = sp.ok ? pickSpell(sp.data) : null;
    const spell1 = rules.none ? null : rules.require != null ? asStat(rules.require) : sp.ok ? pickSpell(sp.data, rules.exclude) : null;
    const picked = bd.ok ? pickBuild(bd.data, keystone.rune) : null;
    const itemBuild = picked == null ? void 0 : picked.build;
    const others = TREE_IDS.filter((t2) => t2 !== primaryTree);
    const [prim, paired, bootsRes, nextRes, ...secs] = await Promise.all([
      client2.treeRunes(f, primaryTree, primaryTree, keystone.rune),
      spell1 ? client2.spells(f, spell1.spell) : null,
      itemBuild ? client2.items(f, { type: 2 }) : null,
      (itemBuild == null ? void 0 : itemBuild.firstItemId) && (itemBuild == null ? void 0 : itemBuild.secondItemId) ? client2.items(f, { type: 1, slots: [3], first: itemBuild.firstItemId, second: itemBuild.secondItemId }) : null,
      ...others.map((t2) => client2.treeRunes(f, primaryTree, t2, keystone.rune))
    ]);
    if (signal == null ? void 0 : signal.aborted) return { status: "aborted" };
    for (const r of [prim, ...secs]) if (!r.ok && r.reason === "forbidden") return { status: "forbidden" };
    const rankedItems = (r, minShare) => (r == null ? void 0 : r.ok) ? rankBest(r.data, { minShare }) : [];
    const items = itemBuild ? buildItemPlan(itemBuild, { keystoneMatch: picked.keystoneMatch, boots: rankedItems(bootsRes, MIN_BOOTS_SHARE).slice(0, 3), next: rankedItems(nextRes, MIN_NEXT_SHARE).slice(0, 3) }) : null;
    const treeRows = {};
    others.forEach((t2, i) => {
      if (secs[i].ok) treeRows[t2] = secs[i].data.rows;
    });
    const secondary = pickSecondary(treeRows);
    const recommended = [];
    if (spell1) {
      recommended.push(spell1);
      const spell2 = (paired == null ? void 0 : paired.ok) ? pickSpell(paired.data, [spell1.spell, ...rules.exclude]) : null;
      if (spell2) recommended.push(spell2);
    }
    const spells = useOverride ? ctx.spellOverride.map(asStat) : recommended;
    const sameSpells = recommended.length === 2 && recommended.every((s) => {
      var _a;
      return (_a = ctx.spellOverride) == null ? void 0 : _a.includes(s.spell);
    });
    const customSpells = useOverride && !sameSpells;
    const spellsAdjusted = !rules.none && !useOverride && !!plain1 && rules.exclude.includes(plain1.spell);
    const altKeystones = ranked.slice(0, ALT_KEYSTONES);
    if (!altKeystones.some((k) => k.rune === keystone.rune)) altKeystones.splice(ALT_KEYSTONES - 1, 1, keystone);
    let altSpells = [];
    if (spells.length === 2 && sp.ok) {
      const pair = spells.map((s) => s.spell);
      const idx = replaceableIndex(pair, rules);
      altSpells = rankBest(sp.data, { minShare: 0.05, exclude: (e) => pair.includes(e.spell) }).map((e) => ({ ...e, pair: pair.map((id, i) => i === idx ? e.spell : id) })).filter((e) => isValidPair(e.pair, rules)).slice(0, ALT_SPELLS);
    }
    return {
      status: "ok",
      sample,
      spellsAdjusted,
      page: {
        keystone,
        primaryTree,
        primaryPicks: prim.ok ? pickRows(prim.data.rows) : [null, null, null],
        secondaryTree: (secondary == null ? void 0 : secondary.tree) ?? null,
        secondaryPicks: (secondary == null ? void 0 : secondary.picks) ?? [],
        shards: (build == null ? void 0 : build.shards) ?? [],
        items,
        spells,
        alternatives: { keystones: altKeystones, autoKeystone: auto.rune, spells: altSpells },
        custom: { keystone: customKeystone, spells: customSpells }
      }
    };
  }
  async function getRecommendation(ctx, { premium = false, signal } = {}) {
    var _a, _b;
    if (!(ctx == null ? void 0 : ctx.championId)) return { ok: false, reason: "no-data" };
    const notices = [];
    const pr = await client2.patches();
    if (signal == null ? void 0 : signal.aborted) return aborted();
    if (!pr.ok) return { ok: false, reason: pr.reason };
    const patch = choosePatch(pr.data);
    if (!patch) return { ok: false, reason: "no-patch" };
    if (patch.fallback) notices.push("patch-low-sample");
    const filters = getFilters();
    const { tiers, manual: tiersManual } = resolveTiers(filters, ctx.lobbyTier);
    const range = resolveAdditions(filters, premium);
    const { regions } = resolveRegions(filters);
    if (range.limited) notices.push("patch-range-requires-premium");
    let opponentSource = ctx.opponentChampionId ? ctx.opponentSource ?? "position" : null;
    if (!ctx.opponentChampionId && premium && ctx.role !== ROLE_FILL && ((_a = ctx.enemies) == null ? void 0 : _a.length)) {
      const f = (id) => filtersOf({ championId: id, role: ROLE_FILL }, patch, tiers, { additions: 0, matchup: false, regions });
      const roles = await Promise.all(ctx.enemies.map((e) => client2.championRole(f(e.championId))));
      if (signal == null ? void 0 : signal.aborted) return aborted();
      const i = roles.findIndex((r) => r.ok && r.data === ctx.role);
      if (i >= 0) {
        ctx = { ...ctx, opponentChampionId: ctx.enemies[i].championId };
        opponentSource = "role";
      }
    }
    const wantsMatchup = !!ctx.opponentChampionId;
    if (wantsMatchup && !premium) notices.push("matchup-requires-premium");
    let plan = { additions: range.additions, matchup: wantsMatchup && premium, regions };
    const key2 = [
      patch.label,
      plan.additions,
      tiers.join(),
      (regions ?? []).join("+") || "all",
      ctx.championId,
      plan.matchup ? ctx.opponentChampionId : 0,
      ctx.role ?? ROLE_FILL,
      rulesKey(spellRules(ctx)),
      ctx.keystoneOverride ?? 0,
      (ctx.spellOverride ?? []).join("+")
    ].join("|");
    const cached = cache.get(key2);
    log2.info("filtros", JSON.stringify({
      campeon: ctx.championId,
      rival: ctx.opponentChampionId ?? null,
      rivalOrigen: opponentSource,
      rivalesReveladosCliente: ((_b = ctx.enemies) == null ? void 0 : _b.length) ?? 0,
      rol: ctx.role ?? ROLE_FILL,
      modo: ctx.mode ?? null,
      rangoLobby: ctx.lobbyTier ?? null,
      premium,
      matchupPedido: wantsMatchup,
      matchupActivo: plan.matchup,
      parche: patch.label,
      parcheMuestraBaja: !!patch.fallback,
      parchesExtra: plan.additions,
      parchesManual: range.manual,
      rangos: tiers,
      rangosManual: tiersManual,
      regiones: regions,
      keystoneOverride: ctx.keystoneOverride ?? null,
      spellOverride: ctx.spellOverride ?? null,
      avisos: notices,
      cache: !!cached
    }));
    if (cached) return { ok: true, data: { ...cached, meta: { ...cached.meta, notices: [.../* @__PURE__ */ new Set([...cached.meta.notices, ...notices])] } } };
    let res = await compute(ctx, patch, tiers, plan, signal);
    if (res.status === "forbidden" && (plan.additions > 0 || plan.matchup || plan.regions)) {
      log2.warn("403 con filtros premium; se reintenta sin rango de parches, matchup ni regiones");
      plan = { additions: 0, matchup: false, regions: null };
      notices.push("filters-downgraded");
      res = await compute(ctx, patch, tiers, plan, signal);
    }
    const noMatchupData = res.status === "error" && res.reason === "no-data";
    if (plan.matchup && (res.status === "ok" && res.sample < MIN_MATCHUP_SAMPLE || noMatchupData)) {
      log2.info("muestra del matchup peque\xF1a (" + (res.sample ?? 0) + ", m\xEDnimo " + MIN_MATCHUP_SAMPLE + ", rival " + ctx.opponentChampionId + "); se usa el campe\xF3n sin rival");
      notices.push("matchup-low-sample");
      plan = { ...plan, matchup: false };
      res = await compute(ctx, patch, tiers, plan, signal);
    }
    if (res.status === "aborted") return aborted();
    if (res.status === "forbidden") return { ok: false, reason: "forbidden" };
    if (res.status !== "ok") return { ok: false, reason: res.reason };
    if (res.spellsAdjusted) notices.push("spells-adjusted");
    const data = {
      ...res.page,
      meta: {
        patch: patch.label,
        patchSpan: patchSpanLabel(patch, plan.additions),
        patchRange: plan.additions,
        patchSource: range.manual ? "manual" : "auto",
        patchFallback: patch.fallback,
        tiers,
        tierSource: tiersManual ? "manual" : "lobby",
        regions: plan.regions,
        regionSource: plan.regions ? "manual" : "all",
        matchup: plan.matchup,
        opponent: plan.matchup ? ctx.opponentChampionId : null,
        opponentSource: plan.matchup ? opponentSource : null,
        premium,
        sample: res.sample,
        mode: ctx.mode ?? null,
        notices: [...new Set(notices)]
      }
    };
    log2.info("resultado", JSON.stringify({
      keystone: data.keystone.rune,
      matchup: plan.matchup,
      rival: data.meta.opponent,
      muestra: res.sample,
      parche: data.meta.patchSpan,
      rangos: tiers,
      regiones: plan.regions,
      avisos: data.meta.notices
    }));
    cache.set(key2, data);
    return { ok: true, data };
  }
  return { getRecommendation };
}

// src/domain/enemy-roles.js
var positionOfLane = (lane) => String(lane).toLowerCase();
function pruneManual(manual, enemies) {
  const present = new Set((enemies ?? []).map((e) => e.championId));
  const out = {};
  const usedLanes = /* @__PURE__ */ new Set();
  for (const [cid, raw] of Object.entries(manual ?? {})) {
    const lane = laneOfPosition(raw);
    if (!lane || !present.has(Number(cid)) || usedLanes.has(lane)) continue;
    usedLanes.add(lane);
    out[cid] = lane;
  }
  return out;
}
function setManual(manual, championId, lane) {
  const target = laneOfPosition(lane);
  const out = {};
  for (const [cid, l] of Object.entries(manual ?? {})) if (Number(cid) !== Number(championId) && l !== target) out[cid] = l;
  if (target) out[championId] = target;
  return out;
}
var withManualPositions = (enemies, manual) => (enemies ?? []).map((e) => (manual == null ? void 0 : manual[e.championId]) ? { ...e, position: positionOfLane(manual[e.championId]) } : e);
function opponentByManual(manual, myLane) {
  if (!myLane) return null;
  const hit = Object.entries(manual ?? {}).find(([, lane]) => lane === myLane);
  return hit ? Number(hit[0]) : null;
}
var needsShares = (enemies, manual) => withManualPositions(enemies, manual).some((e) => !laneOfPosition(e.position));
function resolveEnemyRoles(enemies, manual, share = () => null) {
  const clean = pruneManual(manual, enemies);
  const members = [...withManualPositions(enemies, clean)].sort((a, b) => (clean[b.championId] ? 1 : 0) - (clean[a.championId] ? 1 : 0));
  const byLane = assignLanes(members, share);
  const byChampion = {};
  for (const lane of LANES) {
    const cid = byLane[lane];
    if (cid == null) continue;
    const original = (enemies ?? []).find((e) => e.championId === cid);
    const source = clean[cid] === lane ? "manual" : laneOfPosition(original == null ? void 0 : original.position) === lane ? "position" : "auto";
    byChampion[cid] = { lane, source };
  }
  return { byLane, byChampion };
}

// src/application/champ-select.js
var enemiesKey = (c) => (c.enemies ?? []).map((e) => e.championId).join(",");
var sameCtx = (a, b) => a === b || !!a && !!b && a.championId === b.championId && a.opponentChampionId === b.opponentChampionId && a.role === b.role && a.lobbyTier === b.lobbyTier && a.mode === b.mode && a.phase === b.phase && enemiesKey(a) === enemiesKey(b) && a.keystoneOverride === b.keystoneOverride && (a.spellOverride ?? []).join() === (b.spellOverride ?? []).join();
var extrasKey = (c) => [
  c.side ?? "",
  (c.bans ?? []).join(","),
  (c.allies ?? []).map((a) => a.championId + ":" + a.position).join(","),
  (c.enemies ?? []).map((e) => e.championId + ":" + (e.position ?? "")).join(",")
].join("|");
var loadoutKey = (c) => `${c.championId}|${c.role ?? ROLE_FILL}`;
var spellIds = (d) => d.spells.length === 2 ? d.spells.map((s) => s.spell) : null;
var matchesPin = (pin, d) => !!pin && (pin.keystone == null || pin.keystone === d.keystone.rune) && (pin.spells == null || (spellIds(d) ?? []).join() === pin.spells.join());
function createChampSelectController({ provider, recommend, isLoggedIn: isLoggedIn2, hasPremium: hasPremium2, debounceMs = 0, pins: pins2 = null }) {
  const listeners = /* @__PURE__ */ new Set();
  let state = { status: "idle", context: null, pinned: false };
  let lcuCtx = null;
  let manualCtx = null;
  let opponentOverride = null;
  let enemyManual = {};
  let choice = null;
  let generation = 0;
  let abort = null;
  let unsubscribe = null;
  const setState = (s) => {
    state = s;
    for (const cb of [...listeners]) {
      try {
        cb(state);
      } catch (e) {
        log.error("panel:", e);
      }
    }
  };
  const pinOf = (ctx) => pins2 && (ctx == null ? void 0 : ctx.championId) ? pins2.get(ctx.championId, ctx.role ?? ROLE_FILL) : null;
  function withLoadout(ctx) {
    if (choice && choice.key !== loadoutKey(ctx)) choice = null;
    const pin = pinOf(ctx);
    const keystone = choice && "keystone" in choice ? choice.keystone : pin == null ? void 0 : pin.keystone;
    const spells = choice && "spells" in choice ? choice.spells : pin == null ? void 0 : pin.spells;
    return { ...ctx, ...keystone && { keystoneOverride: keystone }, ...spells && { spellOverride: spells } };
  }
  async function evaluate({ force = false } = {}) {
    const base = manualCtx ?? lcuCtx;
    if (!base) {
      opponentOverride = null;
      choice = null;
      enemyManual = {};
    }
    let ctx = base && opponentOverride ? { ...base, opponentChampionId: opponentOverride, opponentSource: "manual" } : base;
    if (base) {
      enemyManual = pruneManual(enemyManual, base.enemies);
      const hasManual = Object.keys(enemyManual).length > 0;
      const assigned = hasManual && !opponentOverride ? opponentByManual(enemyManual, laneOfRole(base.role)) : null;
      if (hasManual || assigned) {
        ctx = {
          ...ctx,
          enemies: withManualPositions(base.enemies, enemyManual),
          enemyRoles: { ...enemyManual },
          ...assigned && { opponentChampionId: assigned, opponentSource: "assigned" }
        };
      }
    }
    if (ctx == null ? void 0 : ctx.championId) ctx = withLoadout(ctx);
    const prev = state.context;
    if (!force && sameCtx(ctx, prev) && state.status !== "idle") {
      if (ctx && prev && extrasKey(ctx) !== extrasKey(prev)) setState({ ...state, context: ctx });
      return;
    }
    if ((ctx == null ? void 0 : ctx.phase) === "game" && state.status === "ready" && (prev == null ? void 0 : prev.championId) === ctx.championId) {
      abort == null ? void 0 : abort.abort();
      generation++;
      return setState({ ...state, context: ctx });
    }
    abort == null ? void 0 : abort.abort();
    const gen = ++generation;
    const pin = pinOf(ctx);
    const pinned = !!pin;
    if (!ctx) return setState({ status: "idle", context: null, pinned: false });
    if (!ctx.championId) return setState({ status: "waiting", context: ctx, pinned: false });
    if (!isLoggedIn2()) return setState({ status: "needs-login", context: ctx, pinned });
    const last = state.status === "ready" ? state.data : state.status === "loading" ? state.stale : void 0;
    const stale = last && (prev == null ? void 0 : prev.championId) === ctx.championId ? last : void 0;
    setState({ status: "loading", context: ctx, pinned, ...stale && { stale } });
    if (debounceMs > 0) {
      await new Promise((r2) => setTimeout(r2, debounceMs));
      if (gen !== generation) return;
    }
    abort = new AbortController();
    let r;
    try {
      r = await recommend(ctx, { premium: hasPremium2(), signal: abort.signal });
    } catch (e) {
      log.error("recomendaci\xF3n fall\xF3:", String(e));
      r = { ok: false, reason: "network" };
    }
    if (gen !== generation) return;
    const b = manualCtx ?? lcuCtx;
    const fresh = b ? { ...ctx, ...b.side && { side: b.side }, ...b.bans && { bans: b.bans }, ...b.allies && { allies: b.allies } } : ctx;
    if (r.ok) setState({ status: "ready", context: fresh, data: r.data, pinned: matchesPin(pin, r.data) });
    else if (r.reason === "aborted") return;
    else setState({ status: "error", context: fresh, reason: r.reason, ...r.source && { source: r.source }, pinned });
  }
  function choose(patch) {
    const ctx = state.context;
    if (!(ctx == null ? void 0 : ctx.championId)) return;
    const key2 = loadoutKey(ctx);
    choice = { ...(choice == null ? void 0 : choice.key) === key2 ? choice : {}, key: key2, ...patch };
    return evaluate({ force: true });
  }
  return {
    getState: () => state,
    subscribe(cb) {
      listeners.add(cb);
      cb(state);
      return () => listeners.delete(cb);
    },
    start() {
      if (unsubscribe) return;
      unsubscribe = provider.subscribeToChanges((ctx) => {
        lcuCtx = ctx;
        evaluate();
      });
    },
    stop() {
      unsubscribe == null ? void 0 : unsubscribe();
      unsubscribe = null;
      abort == null ? void 0 : abort.abort();
    },
    /** Reintenta con el contexto actual (p. ej. tras iniciar sesión o un error de red). */
    refresh: () => evaluate({ force: true }),
    /** Fija el rival a mano (id) o vuelve al automático (null). */
    setOpponent(id) {
      opponentOverride = id || null;
      return evaluate({ force: true });
    },
    /**
     * Línea que el jugador cree que jugará un rival ('TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY') o null para volver al automático.
     * Solo vuelve a consultar la recomendación si con ello cambia MI rival (poner a un rival en tu línea); si no, solo se actualizan los rivales.
     */
    setEnemyRole(championId, lane) {
      enemyManual = setManual(enemyManual, championId, lane);
      return evaluate();
    },
    /** Elige la runa clave (id) o vuelve a la recomendada (null). */
    setKeystone: (rune) => choose({ keystone: rune || null }),
    /** Elige la pareja de hechizos ([a, b]) o vuelve a la recomendada (null). */
    setSpells: (pair) => choose({ spells: Array.isArray(pair) && pair.length === 2 ? pair : null }),
    /**
     * Fija lo que se está viendo para este campeón y rol (runa clave + hechizos); si ya estaba fijado tal cual, lo suelta.
     * Al soltar, la vista no cambia hasta la próxima selección. Devuelve true si queda fijado.
     */
    togglePin() {
      const ctx = state.context;
      if (!pins2 || state.status !== "ready" || !(ctx == null ? void 0 : ctx.championId)) return false;
      const role = ctx.role ?? ROLE_FILL;
      const d = state.data;
      const ids = spellIds(d);
      if (matchesPin(pins2.get(ctx.championId, role), d)) {
        pins2.remove(ctx.championId, role);
        choice = { key: loadoutKey(ctx), keystone: d.custom.keystone ? d.keystone.rune : null, spells: d.custom.spells ? ids : null };
        setState({ ...state, pinned: false });
        return false;
      }
      pins2.set(ctx.championId, role, { keystone: d.keystone.rune, spells: ids });
      setState({ ...state, pinned: true });
      return true;
    },
    /** Simula un contexto desde DevTools o el menú (null lo quita y vuelve al Champion Select real). */
    simulate(ctx) {
      manualCtx = ctx ? { ...ctx, source: "manual" } : null;
      return evaluate({ force: true });
    }
  };
}

// src/application/sources.js
function createSourceRouter({ sources, getMode, isLoggedIn: isLoggedIn2, log: log2 = null }) {
  async function getRecommendation(ctx, o = {}) {
    var _a;
    const order = sourceOrder({ mode: getMode(), loggedIn: isLoggedIn2(), premium: !!o.premium, wantsMatchup: !!(ctx == null ? void 0 : ctx.opponentChampionId) });
    let last = { ok: false, reason: "no-data", source: order[0] };
    for (let i = 0; i < order.length; i++) {
      const name = order[i];
      let r;
      try {
        r = await sources[name].getRecommendation(ctx, o);
      } catch (e) {
        log2 == null ? void 0 : log2.error(name + ": la fuente lanz\xF3 una excepci\xF3n:", String(e));
        r = { ok: false, reason: "network" };
      }
      if (((_a = o.signal) == null ? void 0 : _a.aborted) || r.reason === "aborted") return { ok: false, reason: "aborted" };
      if (r.ok) {
        const notices = i > 0 ? [.../* @__PURE__ */ new Set([...r.data.meta.notices, "source-fallback"])] : r.data.meta.notices;
        return { ok: true, data: { ...r.data, meta: { ...r.data.meta, source: name, notices } } };
      }
      last = { ...r, source: name };
      if (i + 1 < order.length) log2 == null ? void 0 : log2.warn(name + " fall\xF3 (" + r.reason + "); se prueba " + order[i + 1]);
    }
    return last;
  }
  return { getRecommendation };
}

// src/domain/lolalytics.js
var LANES2 = ["top", "jungle", "middle", "bottom", "support"];
var DEFAULT_TIER = "emerald_plus";
var MIN_MATCHUP_SAMPLE2 = 1e3;
var MIN_WIN_BUILD_GAMES = 300;
var MIN_BOOTS_PICK = 10;
var MIN_NEXT_PICK = 5;
var MIN_SPELL_PICK = 5;
var ALT_SPELLS2 = 3;
var num2 = (x) => typeof x === "number" && Number.isFinite(x) ? x : null;
var int2 = (x) => Number.isInteger(x) && x > 0 ? x : null;
var isArr = (x) => Array.isArray(x);
var laneOfRole2 = (role) => Number.isInteger(role) && role >= 0 && role <= 4 ? LANES2[role] : null;
var TIER_PLUS = { 3: "gold_plus", 4: "platinum_plus", 5: "emerald_plus", 6: "diamond_plus", 7: "master_plus" };
var TIER_ONE = { 3: "gold", 4: "platinum", 5: "emerald", 6: "diamond", 7: "master_plus" };
function tierParam(tiers) {
  const ts = [...tiers ?? []].filter(Number.isFinite).sort((a, b) => a - b);
  if (!ts.length) return { param: DEFAULT_TIER, tiers: [5, 6, 7] };
  const lo = clampTier(ts[0]), hi = clampTier(ts[ts.length - 1]);
  if (lo === hi) return { param: TIER_ONE[lo], tiers: [lo] };
  const covered = [];
  for (let n = lo; n <= 7; n++) covered.push(n);
  return { param: TIER_PLUS[lo], tiers: covered };
}
var isNum2 = (v) => typeof v === "number" && Number.isFinite(v);
var isRow = (r, len) => isArr(r) && r.length >= len;
function validateRoot(root, { vs = false } = {}) {
  var _a, _b, _c;
  const p = [];
  const need = (cond, msg) => {
    if (!cond) p.push(msg);
  };
  need(root && typeof root === "object", "ra\xEDz ausente");
  if (p.length) return p;
  const h2 = root.header ?? {};
  need(isNum2(h2.cid) && typeof h2.patch === "string" && typeof h2.lane === "string" && isNum2(h2.n), "header: cid/patch/lane/n");
  if (vs) need(isNum2(h2.vs) && isNum2(h2.vsWinRate), "header: vs/vsWinRate (matchup)");
  for (const which of ["pick", "win"]) {
    const s = (_a = root.summary) == null ? void 0 : _a[which];
    need(!!s, `summary.${which} ausente`);
    if (!s) continue;
    const set = (_b = s.runes) == null ? void 0 : _b.set;
    need(isArr(set == null ? void 0 : set.pri) && set.pri.length === 4 && isArr(set == null ? void 0 : set.sec) && set.sec.length === 2 && isArr(set == null ? void 0 : set.mod) && set.mod.length === 3, `summary.${which}.runes.set (4/2/3)`);
    need(set && [...set.pri ?? [], ...set.sec ?? [], ...set.mod ?? []].every(int2), `summary.${which}.runes.set: ids no v\xE1lidos`);
    need(isArr((_c = s.sums) == null ? void 0 : _c.ids) && s.sums.ids.length === 2 && s.sums.ids.every(int2), `summary.${which}.sums.ids`);
  }
  need(isArr(root.spells) && root.spells.length > 0 && isRow(root.spells[0], 4), 'spells = [["a_b", wr, pr, n], \u2026]');
  need(isArr(root.boots), "boots");
  if (!vs) need(root.enemy && typeof root.enemy === "object", "enemy (counters por l\xEDnea)");
  return p;
}
var KEEP = ["header", "summary", "spells", "boots", "item1", "item2", "item3", "item4", "item5", "popularItem", "enemy"];
function slimRoot(root) {
  const out = {};
  for (const k of KEEP) if ((root == null ? void 0 : root[k]) !== void 0) out[k] = root[k];
  return out;
}
function parseRow(r) {
  if (!isRow(r, 6) || !r.slice(0, 6).every(isNum2)) return null;
  return { cid: r[0], wr: r[1], d1: r[2], d2: r[3], pr: r[4], n: r[5] };
}
var pairRows = (root) => (root.spells ?? []).map((r) => {
  const ids = String((r == null ? void 0 : r[0]) ?? "").split("_").map(Number);
  return ids.length === 2 && ids.every(int2) && ids[0] !== ids[1] ? { ids, wr: num2(r[1]), pr: num2(r[2]) ?? 0, n: num2(r[3]) ?? 0 } : null;
}).filter(Boolean).sort((a, b) => b.n - a.n);
var sameSet = (a, b) => isArr(a) && isArr(b) && a.length === b.length && a.every((x) => b.includes(x));
var rowStat = (r) => ({ item: r[0], wpa: null, wr: num2(r[1]), occurrence: num2(r[3]) ?? 0, share: (num2(r[2]) ?? 0) / 100 });
var tableRows = (t2) => isArr(t2) ? t2.filter((r) => isRow(r, 4) && int2(r[0])) : [];
function itemsOf(root, b) {
  var _a, _b, _c, _d, _e, _f;
  const it = b.items ?? {};
  const objStat = (e) => e && int2(e.id) ? { item: e.id, wpa: null, wr: num2(e.wr), occurrence: num2(e.n) ?? 0 } : null;
  const start2 = isArr((_a = it.start) == null ? void 0 : _a.setUnique) && it.start.setUnique.length ? it.start.setUnique : ((_b = it.start) == null ? void 0 : _b.set) ?? [];
  const n3 = objStat(it.item3);
  const next = [...n3 ? [n3] : [], ...tableRows(root.item3).filter((r) => (num2(r[2]) ?? 0) >= MIN_NEXT_PICK).map(rowStat)];
  return buildItemPlan({
    tier: null,
    winrate: num2((_c = b.runes) == null ? void 0 : _c.wr),
    occurrence: num2((_d = b.runes) == null ? void 0 : _d.n) ?? 0,
    starterIds: start2,
    firstItemId: num2((_e = it.item1) == null ? void 0 : _e.id),
    secondItemId: num2((_f = it.item2) == null ? void 0 : _f.id),
    itemBlocks: [
      { type: BLOCK.OPTIONS, items: (isArr(it.item4) ? it.item4 : []).map(objStat).filter(Boolean) },
      { type: BLOCK.SITUATIONAL, items: tableRows(root.popularItem).slice(0, 8).map(rowStat) }
    ]
  }, {
    keystoneMatch: true,
    boots: tableRows(root.boots).filter((r) => (num2(r[2]) ?? 0) >= MIN_BOOTS_PICK).slice(0, 3).map(rowStat),
    next
  });
}
function buildRecommendation(root, ctx, o = {}) {
  const {
    rules = spellRules(ctx),
    keystoneTrees,
    runeTrees,
    matchup = false,
    opponent = null,
    opponentSource = null,
    tiers = [],
    tierSource = "lobby",
    premium = false
  } = o;
  const notices = [...o.notices ?? []];
  const h2 = root.header;
  const { pick: pick2, win } = root.summary;
  const ksOf = (b2) => {
    var _a, _b, _c;
    return (_c = (_b = (_a = b2 == null ? void 0 : b2.runes) == null ? void 0 : _a.set) == null ? void 0 : _b.pri) == null ? void 0 : _c[0];
  };
  const gamesOf = (b2) => {
    var _a;
    return num2((_a = b2 == null ? void 0 : b2.runes) == null ? void 0 : _a.n) ?? 0;
  };
  const sample = num2(h2.n) ?? gamesOf(pick2);
  const wantWin = !!ctx.keystoneOverride && ksOf(win) === ctx.keystoneOverride && ksOf(pick2) !== ctx.keystoneOverride && gamesOf(win) >= MIN_WIN_BUILD_GAMES;
  const b = wantWin ? win : pick2;
  const set = b.runes.set;
  const n = gamesOf(b);
  const stat = (rune) => ({ rune, wpa: null, occurrence: n });
  const keystone = { ...stat(set.pri[0]), wr: num2(b.runes.wr) };
  const primaryTree = treeOfKeystone(keystone.rune, keystoneTrees) ?? treeOfRune(keystone.rune, runeTrees);
  const secondaryTree = treeOfRune(set.sec[0], runeTrees);
  if (!primaryTree || !secondaryTree) return null;
  const autoKeystone = ksOf(pick2);
  const alts = [{ ...stat(autoKeystone), occurrence: gamesOf(pick2), wr: num2(pick2.runes.wr), share: sample > 0 ? gamesOf(pick2) / sample : 0 }];
  if (ksOf(win) !== autoKeystone && gamesOf(win) >= MIN_WIN_BUILD_GAMES) alts.push({ ...stat(ksOf(win)), occurrence: gamesOf(win), wr: num2(win.runes.wr), share: sample > 0 ? gamesOf(win) / sample : 0 });
  const pairs = pairRows(root);
  const pickIds = b.sums.ids;
  const zero = (ids) => ({ ids, wr: null, pr: 0, n: 0 });
  const statOfIds = (ids) => pairs.find((p) => sameSet(p.ids, ids)) ?? zero(ids);
  let rec = null;
  if (!rules.none) rec = isValidPair(pickIds, rules) ? pairs.find((p) => sameSet(p.ids, pickIds)) ?? { ids: pickIds, wr: num2(b.sums.wr), pr: 0, n: num2(b.sums.n) ?? 0 } : pairs.find((p) => isValidPair(p.ids, rules)) ?? null;
  const useOverride = isValidPair(ctx.spellOverride, rules);
  const chosen = useOverride ? statOfIds(ctx.spellOverride) : rec;
  const spells = chosen ? chosen.ids.map((id) => ({ spell: id, wpa: null, wr: chosen.wr, occurrence: chosen.n })) : [];
  const customSpells = useOverride && !(rec && sameSet(rec.ids, ctx.spellOverride));
  if (!rules.none && !useOverride && rec && !isValidPair(pickIds, rules)) notices.push("spells-adjusted");
  const altSpells = [];
  if (chosen) {
    for (const p of pairs) {
      if (altSpells.length >= ALT_SPELLS2) break;
      if (!isValidPair(p.ids, rules) || sameSet(p.ids, chosen.ids) || p.pr < MIN_SPELL_PICK) continue;
      const diff = p.ids.filter((id) => !chosen.ids.includes(id));
      if (diff.length !== 1 || altSpells.some((a) => a.spell === diff[0])) continue;
      altSpells.push({ spell: diff[0], wpa: null, wr: p.wr, occurrence: p.n, share: p.pr / 100, pair: p.ids });
    }
  }
  return {
    keystone,
    primaryTree,
    primaryPicks: set.pri.slice(1).map(stat),
    secondaryTree,
    secondaryPicks: set.sec.map((r, i) => ({ ...stat(r), row: i })),
    shards: [...set.mod],
    items: itemsOf(root, b),
    spells,
    alternatives: { keystones: alts, autoKeystone, spells: altSpells },
    custom: { keystone: !!ctx.keystoneOverride && keystone.rune === ctx.keystoneOverride && keystone.rune !== autoKeystone, spells: customSpells },
    meta: {
      patch: h2.patch,
      patchSpan: h2.patch,
      patchRange: 0,
      patchSource: "auto",
      patchFallback: false,
      tiers,
      tierSource,
      matchup,
      opponent: matchup ? opponent : null,
      opponentSource: matchup ? opponentSource : null,
      premium,
      sample,
      mode: ctx.mode ?? null,
      notices: [...new Set(notices)],
      source: "lolalytics"
    }
  };
}

// src/domain/overlay-stats.js
var MIN_ROW_GAMES = 200;
var MIN_SHOWN_GAMES = 30;
var COUNTER_LIMIT = 5;
var MIN_LANE_SHARE2 = 30;
var GRADES = ["S+", "S", "S-", "A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-"];
var gradeOf = (n) => Number.isInteger(n) ? GRADES[n - 1] ?? null : null;
var round12 = (x) => Math.round(x * 10) / 10;
var isNum3 = (v) => typeof v === "number" && Number.isFinite(v);
function statsOfTierRow(row) {
  if (!row || !isNum3(row.wr) || !isNum3(row.games)) return null;
  return {
    wr: round12(row.wr),
    pr: isNum3(row.pr) ? round12(row.pr) : null,
    br: isNum3(row.br) ? round12(row.br) : null,
    games: row.games,
    grade: gradeOf(row.tier),
    rank: Number.isInteger(row.rank) ? row.rank : null
  };
}
function inferOpponent(enemies, tierRows) {
  var _a;
  let best = null, tie = false;
  for (const e of enemies ?? []) {
    const share = (_a = tierRows == null ? void 0 : tierRows.get(e.championId)) == null ? void 0 : _a.pctLane;
    if (!isNum3(share) || share < MIN_LANE_SHARE2) continue;
    if (!best || share > best.share) {
      best = { id: e.championId, share };
      tie = false;
    } else if (share === best.share) tie = true;
  }
  return best && !tie ? best.id : null;
}
function matchupsVs(rivalRows, baseOf = () => null) {
  const out = [];
  for (const raw of rivalRows ?? []) {
    const r = parseRow(raw);
    if (!r || r.n < MIN_SHOWN_GAMES) continue;
    const wr = round12(100 - r.wr);
    const base = baseOf(r.cid);
    out.push({ cid: r.cid, wr, edge: isNum3(base) ? round12(wr - base) : null, n: r.n, low: r.n < MIN_ROW_GAMES });
  }
  return out.sort((a, b) => b.wr - a.wr);
}
var topCounters = (matchups, limit = COUNTER_LIMIT) => (matchups ?? []).filter((m) => !m.low).slice(0, limit);
function buildOverlayData({ lane, tiers, tierRows, rival = null, rivalSource = null, rivalRows = null, vsReason = null }) {
  const champions = {};
  for (const [cid, row] of tierRows ?? []) {
    const s = statsOfTierRow(row);
    if (s) champions[cid] = { ...s, vs: null, counter: null };
  }
  const base = (cid) => {
    var _a;
    return ((_a = champions[cid]) == null ? void 0 : _a.wr) ?? null;
  };
  const all = rivalRows ? matchupsVs(rivalRows, base) : [];
  const counters = topCounters(all);
  for (const m of all) {
    const c = champions[m.cid] ?? (champions[m.cid] = { wr: null, pr: null, br: null, games: 0, grade: null, rank: null, vs: null, counter: null });
    c.vs = { wr: m.wr, edge: m.edge, n: m.n, low: m.low };
  }
  counters.forEach((m, i) => {
    champions[m.cid].counter = i + 1;
  });
  return { lane, tiers, rival, rivalSource, champions, counters, vsReason };
}

// src/domain/web.js
var SITE = "https://coachless.gg";
var ROLE_SLUGS = ["top", "jungle", "mid", "adc", "support"];
var SLUG_EXCEPTIONS = { monkeyking: "wukong" };
var strip = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
function championSlug(info) {
  const base = strip(info == null ? void 0 : info.alias) || (String((info == null ? void 0 : info.name) ?? "").startsWith("#") ? "" : strip(info == null ? void 0 : info.name));
  return SLUG_EXCEPTIONS[base] ?? base;
}
function buildsUrl({ champion, role, opponent } = {}) {
  if (!champion) return null;
  const params = [];
  if (Number.isInteger(role) && ROLE_SLUGS[role]) params.push("role=" + ROLE_SLUGS[role]);
  if (opponent) params.push("matchup=" + encodeURIComponent(opponent));
  return `${SITE}/builds/${encodeURIComponent(champion)}` + (params.length ? "?" + params.join("&") : "");
}
var LOLA_SITE = "https://lolalytics.com";
function lolalyticsUrl({ champion, lane, opponent } = {}) {
  if (!champion) return null;
  return `${LOLA_SITE}/lol/${encodeURIComponent(champion)}/${opponent ? `vs/${encodeURIComponent(opponent)}/` : ""}build/` + (lane ? `?lane=${encodeURIComponent(lane)}` : "");
}

// src/application/lolalytics-source.js
function createLolalyticsSource({ client: client2, catalog: catalog2, getFilters = () => void 0, log: log2 = null }) {
  const slugOf = (id) => championSlug(catalog2.champion(id));
  async function getRecommendation(ctx, { premium = false, signal } = {}) {
    var _a, _b, _c;
    if (!(ctx == null ? void 0 : ctx.championId)) return { ok: false, reason: "no-data" };
    const aborted2 = () => ({ ok: false, reason: "aborted" });
    const notices = [];
    await catalog2.load().catch(() => {
    });
    const slug = slugOf(ctx.championId);
    if (!slug) return { ok: false, reason: "no-data" };
    const lane = laneOfRole2(ctx.role);
    const { tiers: wanted, manual } = resolveTiers(getFilters(), ctx.lobbyTier);
    let tp = tierParam(wanted);
    let rival = ctx.opponentChampionId ?? null;
    let rivalSource = rival ? ctx.opponentSource ?? "position" : null;
    if (!rival && lane && ((_a = ctx.enemies) == null ? void 0 : _a.length)) {
      const tl = await client2.tierlist({ lane, tier: tp.param });
      if (signal == null ? void 0 : signal.aborted) return aborted2();
      const id = tl.ok ? inferOpponent(ctx.enemies, tl.data.rows) : null;
      if (id) {
        rival = id;
        rivalSource = "role";
      }
    }
    let page = null;
    let matchup = false;
    if (rival && lane) {
      const rivalSlug = slugOf(rival);
      if (rivalSlug) {
        const r = await client2.build({ slug, lane, tier: tp.param, rival: rivalSlug });
        if (signal == null ? void 0 : signal.aborted) return aborted2();
        const h2 = r.ok ? r.data.root.header : null;
        if (r.ok && h2.vs === rival && h2.lane === lane && h2.n >= MIN_MATCHUP_SAMPLE2) {
          page = r;
          matchup = true;
        }
      }
      if (!matchup) notices.push("matchup-low-sample");
    }
    if (!page) {
      page = await client2.build({ slug, lane, tier: tp.param });
      if (signal == null ? void 0 : signal.aborted) return aborted2();
      if (!page.ok) return { ok: false, reason: page.reason };
    }
    if (page.tierUsed && page.tierUsed !== tp.param) {
      tp = tierParam([5, 6, 7]);
      notices.push("lola-tier-fallback");
    }
    const data = buildRecommendation(page.data.root, ctx, {
      rules: spellRules(ctx),
      keystoneTrees: (_b = catalog2.keystoneTrees) == null ? void 0 : _b.call(catalog2),
      runeTrees: (_c = catalog2.runeTrees) == null ? void 0 : _c.call(catalog2),
      matchup,
      opponent: rival,
      opponentSource: rivalSource,
      tiers: tp.tiers,
      tierSource: manual ? "manual" : "lobby",
      premium,
      notices
    });
    if (!data) {
      log2 == null ? void 0 : log2.warn("lolalytics: no se pudo deducir el \xE1rbol de alguna runa");
      return { ok: false, reason: "shape" };
    }
    log2 == null ? void 0 : log2.info("lolalytics resultado", JSON.stringify({ campeon: ctx.championId, linea: lane, rival: matchup ? rival : null, tier: tp.param, muestra: data.meta.sample, avisos: data.meta.notices }));
    return { ok: true, data };
  }
  return { getRecommendation };
}

// src/application/overlay.js
function createChampionStats({ client: client2, catalog: catalog2, getFilters = () => void 0, log: log2 = null }) {
  async function load(ctx) {
    var _a, _b;
    const lane = laneOfRole2(ctx == null ? void 0 : ctx.role);
    if (!lane) return { ok: false, reason: "no-lane" };
    await catalog2.load().catch(() => {
    });
    const { tiers } = resolveTiers(getFilters(), ctx.lobbyTier);
    const tp = tierParam(tiers);
    const tl = await client2.tierlist({ lane, tier: tp.param });
    if (!tl.ok) return { ok: false, reason: tl.reason };
    const used = tl.tierUsed && tl.tierUsed !== tp.param ? tierParam([5, 6, 7]) : tp;
    let rival = ctx.opponentChampionId ?? null;
    let rivalSource = rival ? ctx.opponentSource ?? "position" : null;
    if (!rival) {
      rival = inferOpponent(ctx.enemies, tl.data.rows);
      rivalSource = rival ? "role" : null;
    }
    let rivalRows = null;
    let vsReason = null;
    if (rival) {
      const slug = ((_a = tl.data.slugs) == null ? void 0 : _a[rival]) ?? championSlug(catalog2.champion(rival));
      if (!slug) vsReason = "no-slug";
      else {
        const rp = await client2.build({ slug, lane, tier: tl.tierUsed ?? tp.param });
        if (rp.ok && rp.data.root.header.lane === lane && Array.isArray((_b = rp.data.root.enemy) == null ? void 0 : _b[lane])) rivalRows = rp.data.root.enemy[lane];
        else vsReason = rp.ok ? "other-lane" : rp.reason;
      }
    }
    const data = buildOverlayData({ lane, tiers: used.tiers, tierRows: tl.data.rows, rival, rivalSource, rivalRows, vsReason });
    log2 == null ? void 0 : log2.info("estad\xEDsticas", JSON.stringify({ linea: lane, tier: used.param, rival, rivalOrigen: rivalSource, campeones: Object.keys(data.champions).length, counters: data.counters.map((c) => c.cid), vs: vsReason }));
    return { ok: true, data };
  }
  return { load };
}
function createOverlayController({ stats: stats2, source, prefs, getFilters = () => void 0, debounceMs = 300, log: log2 = null }) {
  const listeners = /* @__PURE__ */ new Set();
  let state = { status: "idle", data: null, key: null };
  let lastKey = null;
  let generation = 0;
  let unsubscribe = null;
  const setState = (s) => {
    state = s;
    for (const cb of [...listeners]) {
      try {
        cb(state);
      } catch (e) {
        log2 == null ? void 0 : log2.error("overlay:", e);
      }
    }
  };
  function contextOf(st) {
    var _a, _b;
    const c = st.context;
    if (!prefs.get().enabled || !c || st.status === "idle" || c.phase === "game") return null;
    const rival = c.opponentChampionId ?? ((_b = (_a = st.data) == null ? void 0 : _a.meta) == null ? void 0 : _b.opponent) ?? null;
    return {
      role: c.role,
      lobbyTier: c.lobbyTier,
      enemies: c.enemies ?? [],
      opponentChampionId: rival,
      ...rival && { opponentSource: c.opponentChampionId ? c.opponentSource ?? "position" : "role" }
    };
  }
  const keyOf = (c) => {
    var _a;
    return [c.role, c.lobbyTier ?? 0, c.opponentChampionId ?? 0, c.enemies.map((e) => e.championId).join(","), JSON.stringify(((_a = getFilters()) == null ? void 0 : _a.tiers) ?? null)].join("|");
  };
  async function evaluate({ force = false } = {}) {
    const ctx = contextOf(source.getState());
    if (!ctx) {
      lastKey = null;
      generation++;
      if (state.status !== "idle") setState({ status: "idle", data: null, key: null });
      return;
    }
    const key2 = keyOf(ctx);
    if (!force && key2 === lastKey) return;
    lastKey = key2;
    const gen = ++generation;
    setState({ status: "loading", data: state.data, key: key2 });
    if (debounceMs > 0) {
      await new Promise((r2) => setTimeout(r2, debounceMs));
      if (gen !== generation) return;
    }
    let r;
    try {
      r = await stats2.load(ctx);
    } catch (e) {
      log2 == null ? void 0 : log2.error("estad\xEDsticas fallaron:", String(e));
      r = { ok: false, reason: "network" };
    }
    if (gen !== generation) return;
    if (r.ok) setState({ status: "ready", data: r.data, key: key2 });
    else {
      lastKey = null;
      setState({ status: "error", data: null, reason: r.reason, key: key2 });
    }
  }
  return {
    getState: () => state,
    subscribe(cb) {
      listeners.add(cb);
      cb(state);
      return () => listeners.delete(cb);
    },
    start() {
      if (!unsubscribe) unsubscribe = source.subscribe(() => {
        evaluate();
      });
    },
    stop() {
      unsubscribe == null ? void 0 : unsubscribe();
      unsubscribe = null;
      generation++;
    },
    refresh: () => evaluate({ force: true }),
    isEnabled: () => prefs.get().enabled,
    setEnabled(on) {
      prefs.set({ enabled: !!on });
      return evaluate({ force: true });
    }
  };
}

// src/application/enemy-roles.js
async function loadLaneShares(lola, tierP) {
  const rows = {};
  if (!lola) return () => null;
  await Promise.all(LANES.map(async (lane) => {
    const r = await lola.tierlist({ lane: LANES2[LANES.indexOf(lane)], tier: tierP }).catch(() => null);
    if (r == null ? void 0 : r.ok) rows[lane] = r.data.rows;
  }));
  return (cid, lane) => {
    var _a, _b;
    return ((_b = (_a = rows[lane]) == null ? void 0 : _a.get(cid)) == null ? void 0 : _b.pctLane) ?? null;
  };
}
var EMPTY = Object.freeze({ status: "idle", byLane: {}, byChampion: {}, key: null });
function createEnemyRoles({ source, lola = null, getFilters = () => void 0, log: log2 = null }) {
  const listeners = /* @__PURE__ */ new Set();
  let state = EMPTY;
  let lastKey = null;
  let generation = 0;
  let unsubscribe = null;
  const setState = (s) => {
    state = s;
    for (const cb of [...listeners]) {
      try {
        cb(state);
      } catch (e) {
        log2 == null ? void 0 : log2.error("roles de rivales:", e);
      }
    }
  };
  const contextOf = (st) => {
    const c = st.context;
    return c && st.status !== "idle" && c.phase !== "game" && (c.enemies ?? []).length ? c : null;
  };
  async function evaluate() {
    const ctx = contextOf(source.getState());
    if (!ctx) {
      lastKey = null;
      generation++;
      if (state.status !== "idle") setState(EMPTY);
      return;
    }
    const { tiers } = resolveTiers(getFilters(), ctx.lobbyTier);
    const tp = tierParam(tiers);
    const manual = ctx.enemyRoles ?? {};
    const key2 = [(ctx.enemies ?? []).map((e) => e.championId + ":" + (e.position ?? "")).join(","), JSON.stringify(manual), tp.param].join("|");
    if (key2 === lastKey) return;
    lastKey = key2;
    const gen = ++generation;
    const first = resolveEnemyRoles(ctx.enemies, manual, () => null);
    const present = new Set((ctx.enemies ?? []).map((e) => e.championId));
    for (const [cid, v] of Object.entries(state.byChampion)) {
      if (v.source === "auto" && present.has(Number(cid)) && !first.byChampion[cid] && first.byLane[v.lane] == null) {
        first.byChampion[cid] = v;
        first.byLane[v.lane] = Number(cid);
      }
    }
    setState({ status: "ready", ...first, key: key2 });
    if (!needsShares(ctx.enemies, manual)) return;
    let shares;
    try {
      shares = await loadLaneShares(lola, tp.param);
    } catch (e) {
      log2 == null ? void 0 : log2.warn("roles de rivales: sin cuotas de l\xEDnea", String(e));
      return;
    }
    if (gen !== generation) return;
    const full = resolveEnemyRoles(ctx.enemies, manual, shares);
    setState({ status: "ready", ...full, key: key2 });
    log2 == null ? void 0 : log2.info("roles de rivales", JSON.stringify({ porLinea: full.byLane, origen: Object.fromEntries(Object.entries(full.byChampion).map(([c, v]) => [c, v.source])) }));
  }
  return {
    getState: () => state,
    subscribe(cb) {
      listeners.add(cb);
      cb(state);
      return () => listeners.delete(cb);
    },
    start() {
      if (!unsubscribe) unsubscribe = source.subscribe(() => {
        evaluate();
      });
    },
    stop() {
      unsubscribe == null ? void 0 : unsubscribe();
      unsubscribe = null;
      generation++;
    }
  };
}

// src/application/pick-advisor.js
function createPickAdvisor({ itero, names, catalog: catalog2, lola = null, stats: stats2 = null, mastery: mastery2 = null, getFilters = () => void 0, getPrefs = () => ({}), log: log2 = null }) {
  const nameOf = (id) => {
    var _a, _b;
    return names.name(id) ?? (((_b = (_a = catalog2.champion(id)) == null ? void 0 : _a.name) == null ? void 0 : _b.startsWith("#")) ? null : catalog2.champion(id).name);
  };
  const idOf = (name) => {
    const id = names.idOf(name);
    if (id != null) return id;
    const c = catalog2.findChampion(name);
    return c && nameKey(c.name) === nameKey(name) ? c.id : null;
  };
  async function advise(ctx) {
    const lane = laneOfRole(ctx == null ? void 0 : ctx.role);
    if (!lane) return { ok: false, reason: "no-lane" };
    if (!supportsMode(ctx.mode)) return { ok: false, reason: "mode" };
    await Promise.all([catalog2.load().catch(() => {
    }), names.load()]);
    const resolved = resolveTiers(getFilters(), ctx.lobbyTier);
    const rankClass = rankClassFor(resolved, ctx.lobbyTier);
    const tp = tierParam(resolved.tiers);
    const allies = ctx.allies ?? [], enemies = ctx.enemies ?? [];
    const lacksLane = needsShares(allies, {}) || needsShares(enemies, {});
    const shares = lacksLane ? await loadLaneShares(lola, tp.param) : () => null;
    const allyLanes = assignLanes(allies, shares);
    const enemyLanes = assignLanes(enemies, shares);
    delete allyLanes[lane];
    const rival = enemyLanes[lane] ?? ctx.opponentChampionId ?? null;
    if (rival && !enemyLanes[lane]) enemyLanes[lane] = rival;
    const toNames = (byLane) => {
      const out = {};
      for (const [l, cid] of Object.entries(byLane)) {
        const n = nameOf(cid);
        if (n) out[l] = n;
        else log2 == null ? void 0 : log2.warn("consejero: sin nombre ingl\xE9s para el campe\xF3n " + cid + "; se deja como hueco");
      }
      return out;
    };
    const bans = (ctx.bans ?? []).map(nameOf).filter(Boolean);
    const prefs = getPrefs();
    let masteryInfo = null;
    if (mastery2 == null ? void 0 : mastery2.isEnabled()) {
      const m = await mastery2.load().catch(() => null);
      if ((m == null ? void 0 : m.status) === "ready") masteryInfo = { data: { ...m.points, avg: m.avg }, weight: prefs.masteryWeight };
    }
    const region = iteroRegion(resolveRegions(getFilters()).regions);
    const req = buildRequest({ lane, rankClass, side: ctx.side ?? "Blue", allies: toNames(allyLanes), enemies: toNames(enemyLanes), bans, mastery: masteryInfo, ...region && { region } });
    const [it, st] = await Promise.all([
      itero.draftPicks(req),
      stats2 ? stats2.load({ role: ctx.role, lobbyTier: ctx.lobbyTier, enemies, opponentChampionId: rival, opponentSource: "position" }).catch(() => null) : null
    ]);
    if (!it.ok) return { ok: false, reason: it.reason };
    const reveal = { allyLanes: Object.keys(allyLanes), enemyLanes: Object.keys(enemyLanes) };
    const lanes = { allies: { ...allyLanes }, enemies: { ...enemyLanes } };
    const r = rankPicks({
      candidates: it.data.candidates,
      idOf,
      stats: (st == null ? void 0 : st.ok) ? st.data : null,
      reveal,
      banned: bans,
      options: { ...prefs.minPick != null && { minPick: prefs.minPick } }
    });
    const withMastery = req.userModelWeightings[`t1_${lane}_mastery`] > 0;
    log2 == null ? void 0 : log2.info("consejero", JSON.stringify({ linea: lane, rango: rankClass, region: req.region, lado: req.side, aliados: reveal.allyLanes, rivales: reveal.enemyLanes, bans: bans.length, pool: r.pool, contraste: r.contrasted, maestria: withMastery, top: r.picks.map((p) => p.name) }));
    return {
      ok: true,
      data: { picks: r.picks, rows: r.rows, meta: { lane, rankClass, region: req.region, regionManual: !!region, side: req.side, sideKnown: !!ctx.side, blended: r.blended, contrasted: r.contrasted, mastery: withMastery, pool: r.pool, rival, unrecognized: it.data.unrecognized, ...lanes } }
    };
  }
  return { advise };
}
function createPickAdvisorController({ advisor: advisor2, source, prefs, getFilters = () => void 0, debounceMs = 600, maxQueries = 12, log: log2 = null }) {
  const listeners = /* @__PURE__ */ new Set();
  let state = { status: "idle", data: null, key: null };
  let lastKey = null;
  let generation = 0;
  let queries = 0;
  let unsubscribe = null;
  const setState = (s) => {
    state = s;
    for (const cb of [...listeners]) {
      try {
        cb(state);
      } catch (e) {
        log2 == null ? void 0 : log2.error("consejero:", e);
      }
    }
  };
  function contextOf(st) {
    const c = st.context;
    if (!prefs.get().enabled || !c || st.status === "idle" || c.phase === "game") return null;
    return c;
  }
  const ids = (l) => (l ?? []).map((m) => m.championId + ":" + (m.position ?? "")).join(",");
  const keyOf = (c) => {
    var _a, _b;
    return [
      c.role,
      c.lobbyTier ?? 0,
      c.side ?? "",
      (c.bans ?? []).join(","),
      ids(c.allies),
      ids(c.enemies),
      c.opponentChampionId ?? 0,
      JSON.stringify(((_a = getFilters()) == null ? void 0 : _a.tiers) ?? null),
      JSON.stringify(((_b = getFilters()) == null ? void 0 : _b.regions) ?? null),
      prefs.get().minPick,
      prefs.get().useMastery ? prefs.get().masteryWeight : 0
    ].join("|");
  };
  async function evaluate({ force = false } = {}) {
    const ctx = contextOf(source.getState());
    if (!ctx) {
      lastKey = null;
      generation++;
      queries = 0;
      if (state.status !== "idle") setState({ status: "idle", data: null, key: null });
      return;
    }
    const key2 = keyOf(ctx);
    if (!force && key2 === lastKey) return;
    lastKey = key2;
    const gen = ++generation;
    if (++queries > maxQueries) {
      log2 == null ? void 0 : log2.warn("consejero: tope de consultas por selecci\xF3n alcanzado (" + maxQueries + ")");
      return setState({ status: "error", data: state.data, reason: "limit", key: key2 });
    }
    setState({ status: "loading", data: state.data, key: key2 });
    if (debounceMs > 0) {
      await new Promise((r2) => setTimeout(r2, debounceMs));
      if (gen !== generation) return;
    }
    let r;
    try {
      r = await advisor2.advise(ctx);
    } catch (e) {
      log2 == null ? void 0 : log2.error("consejero fall\xF3:", String(e));
      r = { ok: false, reason: "network" };
    }
    if (gen !== generation) return;
    if (r.ok) setState({ status: "ready", data: r.data, key: key2 });
    else {
      if (r.reason !== "no-lane" && r.reason !== "mode") lastKey = null;
      setState({ status: "error", data: null, reason: r.reason, key: key2 });
    }
  }
  return {
    getState: () => state,
    subscribe(cb) {
      listeners.add(cb);
      cb(state);
      return () => listeners.delete(cb);
    },
    start() {
      if (!unsubscribe) unsubscribe = source.subscribe(() => {
        evaluate();
      });
    },
    stop() {
      unsubscribe == null ? void 0 : unsubscribe();
      unsubscribe = null;
      generation++;
    },
    refresh: () => {
      queries = 0;
      return evaluate({ force: true });
    },
    isEnabled: () => prefs.get().enabled,
    setEnabled(on) {
      prefs.set({ enabled: !!on });
      return evaluate({ force: true });
    },
    /** Cambia los ajustes (minPick, useMastery, masteryWeight) y recalcula. */
    configure(patch) {
      prefs.set(patch);
      return evaluate({ force: true });
    }
  };
}

// src/application/mastery.js
function createMastery({ identity, itero, source, prefs, log: log2 = null }) {
  const listeners = /* @__PURE__ */ new Set();
  let state = { status: "off", points: null, avg: null, reason: null };
  let loading = null;
  let unsubscribe = null;
  const setState = (s) => {
    state = s;
    for (const cb of [...listeners]) {
      try {
        cb(state);
      } catch (e) {
        log2 == null ? void 0 : log2.error("maestr\xEDa:", e);
      }
    }
  };
  const enabled = () => prefs.get().useMastery === true;
  async function fetchNow() {
    setState({ ...state, status: "loading", reason: null });
    let r;
    try {
      const id = await identity.get();
      r = id ? await itero.basicInfo(id) : { ok: false, reason: "identity" };
    } catch (e) {
      log2 == null ? void 0 : log2.error("maestr\xEDa fall\xF3:", String(e));
      r = { ok: false, reason: "network" };
    }
    if (!enabled()) {
      setState({ status: "off", points: null, avg: null, reason: null });
      return state;
    }
    if (r.ok) {
      setState({ status: "ready", points: r.data.points, avg: r.data.avg, reason: null });
      log2 == null ? void 0 : log2.info("maestr\xEDa cargada", JSON.stringify({ campeones: r.data.count, media: r.data.avg }));
    } else {
      log2 == null ? void 0 : log2.warn("maestr\xEDa no disponible:", r.reason);
      setState({ status: "error", points: null, avg: null, reason: r.reason });
    }
    return state;
  }
  function load({ force = false } = {}) {
    if (!enabled()) {
      if (state.status !== "off") setState({ status: "off", points: null, avg: null, reason: null });
      return Promise.resolve(state);
    }
    if (loading) return loading;
    if (!force && state.status === "ready") return Promise.resolve(state);
    loading = fetchNow().finally(() => {
      loading = null;
    });
    return loading;
  }
  const inSelection = (st) => !!st.context && st.status !== "idle" && st.context.phase !== "game";
  return {
    getState: () => state,
    subscribe(cb) {
      listeners.add(cb);
      cb(state);
      return () => listeners.delete(cb);
    },
    start() {
      if (unsubscribe) return;
      unsubscribe = source.subscribe((st) => {
        if (inSelection(st)) {
          if (enabled() && state.status !== "ready" && state.status !== "loading") load();
        } else if (state.status === "error") setState({ ...state, status: enabled() ? "idle" : "off" });
      });
    },
    stop() {
      unsubscribe == null ? void 0 : unsubscribe();
      unsubscribe = null;
    },
    load,
    /** Tras activar/desactivar la función (o cambiar el peso). */
    refresh() {
      return load({ force: true });
    },
    isEnabled: enabled,
    /** Puntos de maestría de un campeón (0 si no lo ha jugado) o null si no hay datos. */
    pointsOf: (championId) => state.status === "ready" ? state.points[String(championId)] ?? 0 : null
  };
}

// src/application/pick-filters.js
var TOP = 5;
function createPickFilters({ catalog: catalog2, overlay: overlay2, advisor: advisor2, mastery: mastery2, prefs, top = TOP, getContext = () => null }) {
  const listeners = /* @__PURE__ */ new Set();
  const offs = [];
  let advRef = null;
  let advMap = /* @__PURE__ */ new Map();
  const notify2 = () => {
    for (const cb of [...listeners]) {
      try {
        cb();
      } catch {
      }
    }
  };
  const current3 = () => normalizePickFilters(prefs.get());
  const advRows = () => {
    var _a;
    const rows = (_a = advisor2.getState().data) == null ? void 0 : _a.rows;
    if (rows !== advRef) {
      advRef = rows;
      advMap = new Map((rows ?? []).map((r) => [r.championId, r]));
    }
    return advMap;
  };
  const overlayData = () => overlay2.getState().data;
  function availability() {
    const ov = overlayData();
    return {
      mastery: mastery2.getState().status === "ready",
      matchup: !!(ov == null ? void 0 : ov.rival) && Object.values(ov.champions).some((c) => c.vs),
      itero: advRows().size > 0,
      meta: !!ov
    };
  }
  function factsOf(cid) {
    var _a, _b;
    const c = (_b = (_a = overlayData()) == null ? void 0 : _a.champions) == null ? void 0 : _b[cid];
    const row = advRows().get(cid);
    return {
      classes: catalog2.champion(cid).classes ?? [],
      mastery: mastery2.pointsOf(cid),
      grade: (c == null ? void 0 : c.grade) ?? null,
      vs: (c == null ? void 0 : c.vs) ?? null,
      counter: (c == null ? void 0 : c.counter) ?? null,
      scale: (row == null ? void 0 : row.scale) ?? null,
      dmg: (row == null ? void 0 : row.dmg) ?? null
    };
  }
  const matches2 = (cid, f = current3(), avail = availability()) => matches(f, factsOf(cid), avail);
  const set = (patch) => {
    const next = prefs.set({ ...current3(), ...patch });
    notify2();
    return normalizePickFilters(next);
  };
  return {
    get: current3,
    availability,
    isActive: () => isActive(current3()),
    activeCount: () => activeCount(current3()),
    matches: matches2,
    set,
    toggleClass: (cls) => set(toggleClass(current3(), cls)),
    reset: () => set({ classes: [], mastery: "any", matchup: "any", meta: "any", phase: "any", damage: "any" }),
    /** Lista de MATCHUP (LoLalytics): mejor win rate contra el rival, con muestra suficiente, disponible y que cumple los filtros. [] sin rival o sin datos.
     *  Orden: win rate DEL MATCHUP (no el general); `edge` (ventaja sobre su media en la línea) viaja con cada pick para que la interfaz lo muestre. */
    matchupPicks() {
      const ov = overlayData();
      if (!(ov == null ? void 0 : ov.rival)) return [];
      const f = current3(), avail = availability(), taken = unavailableIds(getContext());
      return Object.entries(ov.champions).filter(([cid, c]) => c.vs && !c.vs.low && !taken.has(Number(cid))).map(([cid, c]) => ({ cid: Number(cid), wr: c.vs.wr, edge: c.vs.edge, n: c.vs.n, counter: c.counter })).sort((a, b) => b.wr - a.wr).filter((p) => matches2(p.cid, f, avail)).slice(0, top);
    },
    /** Lista de DRAFT (iTero): los mejores del consejero (ya ordenados), disponibles y que cumplen los filtros. [] si el consejero no tiene datos. */
    draftPicks() {
      var _a;
      const rows = ((_a = advisor2.getState().data) == null ? void 0 : _a.rows) ?? [];
      const f = current3(), avail = availability(), taken = unavailableIds(getContext());
      return rows.filter((r) => !taken.has(r.championId) && matches2(r.championId, f, avail)).slice(0, top);
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    /** Re-emite los cambios de los datos de los que dependen los filtros (maestría, estadísticas de LoLalytics, consejero). */
    start() {
      if (!offs.length) offs.push(overlay2.subscribe(notify2), advisor2.subscribe(notify2), mastery2.subscribe(notify2));
    },
    stop() {
      var _a;
      while (offs.length) (_a = offs.pop()) == null ? void 0 : _a();
    }
  };
}

// src/application/configuration.js
var fail = (reason, extra) => ({ ok: false, reason, ...extra });
function createConfigurationApplier({ gateway, prefs, log: log2 }) {
  const canApply = () => !!prefs.get().enabled;
  async function applyRunes(rec, { champion, opponent } = {}) {
    var _a;
    if (!canApply()) return fail("disabled");
    const name = runePageName(champion ?? "?", opponent);
    const built = buildRunePage(rec, name);
    if (!built.ok) return fail(built.reason);
    const pages = await gateway.listPages();
    if (!pages) return fail("lcu");
    const editable = pages.filter((p) => p.isEditable !== false);
    let target, mode;
    if (prefs.get().target === "current") {
      target = editable.find((p) => p.current);
      if (!target) return fail("not-editable");
      mode = "replaced";
    } else {
      target = editable.find((p) => String(p.name ?? "").startsWith(OWN_PREFIX));
      mode = "updated";
    }
    let id, res;
    if (target) {
      id = target.id;
      res = await gateway.updatePage(id, built.page);
    } else {
      const inv = await gateway.inventory();
      if (Number.isInteger(inv == null ? void 0 : inv.ownedPageCount) && editable.length >= inv.ownedPageCount) return fail("no-slot");
      res = await gateway.createPage(built.page);
      id = (_a = res.data) == null ? void 0 : _a.id;
      mode = "created";
    }
    if (!res.ok) return fail("rejected", { status: res.status });
    if (id != null) await gateway.setCurrent(id);
    const after = await gateway.listPages();
    const written = after == null ? void 0 : after.find((p) => p.id === id);
    const verified = !!written && samePerks(written.selectedPerkIds, built.page.selectedPerkIds);
    if (!verified) log2.warn("p\xE1gina de runas escrita pero no verificada (el cliente pudo cambiarla)");
    log2.info("runas aplicadas:", mode, name);
    return { ok: true, mode, name, verified };
  }
  async function applySpells(rec) {
    if (!canApply()) return fail("disabled");
    const pair = buildSpellPair(rec, prefs.get().flashKey);
    if (!pair.ok) return fail(pair.reason);
    if (await gateway.phase() !== "ChampSelect") return fail("not-in-champ-select");
    const res = await gateway.setSpells(pair.spell1Id, pair.spell2Id);
    if (!res.ok) return fail("rejected", { status: res.status });
    log2.info("hechizos aplicados:", pair.spell1Id, pair.spell2Id);
    return { ok: true, spell1Id: pair.spell1Id, spell2Id: pair.spell2Id };
  }
  return {
    canApply,
    /** Activa o desactiva la función (el aviso al usuario lo muestra la capa de presentación). */
    setEnabled: (enabled) => prefs.set({ enabled: !!enabled }),
    getSettings: () => prefs.get(),
    setSettings: (patch) => prefs.set(patch),
    applyRunes,
    applySpells
  };
}

// src/application/live-game.js
var EMPTY2 = { status: "off", gold: 0, level: null, items: [] };
var itemsKey = (items) => items.map((i) => `${i.item}x${i.count}`).sort().join();
function createLiveGame({ client: client2, intervalMs = 2e3, offlineMs = 3e3 }) {
  const listeners = /* @__PURE__ */ new Set();
  let state = EMPTY2;
  let running = false;
  let timer = null;
  let gen = 0;
  const sig = (s) => `${s.status}|${s.level}|${Math.floor(s.gold / 25)}|${itemsKey(s.items)}`;
  const set = (next) => {
    const changed = sig(next) !== sig(state);
    state = next;
    if (changed) for (const cb of [...listeners]) {
      try {
        cb(state);
      } catch {
      }
    }
  };
  async function tick(g) {
    let r;
    try {
      r = await client2.snapshot();
    } catch {
      r = { ok: false, reason: "offline" };
    }
    if (!running || g !== gen) return;
    if (r.ok) set({ status: "live", gold: r.gold, level: Number.isFinite(r.level) ? r.level : 0, items: r.items });
    else set({ ...state, status: "offline" });
    timer = setTimeout(() => tick(g), r.ok ? intervalMs : offlineMs);
  }
  return {
    getState: () => state,
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    start() {
      if (running) return;
      running = true;
      set({ ...EMPTY2, status: "connecting" });
      tick(++gen);
    },
    stop() {
      if (!running && state.status === "off") return;
      running = false;
      gen++;
      clearTimeout(timer);
      timer = null;
      set(EMPTY2);
    }
  };
}

// src/domain/live.js
function ownedCounts(items) {
  const m = /* @__PURE__ */ new Map();
  for (const i of items ?? []) {
    const id = i == null ? void 0 : i.item;
    if (!Number.isInteger(id) || id <= 0) continue;
    m.set(id, (m.get(id) ?? 0) + (Number.isInteger(i.count) && i.count > 0 ? i.count : 1));
  }
  return m;
}
function remainingCost(id, owned, info) {
  const pool = new Map(owned);
  const go = (item, depth) => {
    if ((pool.get(item) ?? 0) > 0) {
      pool.set(item, pool.get(item) - 1);
      return 0;
    }
    const it = info(item);
    if (!it || !Number.isFinite(it.priceTotal) || depth > 6) return null;
    const parts = it.from ?? [];
    if (!parts.length) return it.priceTotal;
    let sum = 0, partsTotal = 0;
    for (const p of parts) {
      const pi = info(p);
      if (!pi || !Number.isFinite(pi.priceTotal)) return null;
      partsTotal += pi.priceTotal;
      const r = go(p, depth + 1);
      if (r == null) return null;
      sum += r;
    }
    return sum + Math.max(0, it.priceTotal - partsTotal);
  };
  return go(id, 0);
}
function trackBuild(layout, items, gold, info) {
  const counts = ownedCounts(items);
  const owned = new Set(counts.keys());
  const targets = [...(layout == null ? void 0 : layout.core) ?? [], ...((layout == null ? void 0 : layout.next) ?? []).slice(0, 1).map((s) => s.item)];
  const id = targets.find((t2) => !owned.has(t2));
  if (id == null) return { owned, done: targets.length > 0, next: null };
  const cost = remainingCost(id, counts, info);
  if (cost == null) return { owned, done: false, next: null };
  const g = Number.isFinite(gold) ? gold : 0;
  return { owned, done: false, next: { item: id, cost, missing: Math.max(0, Math.ceil(cost - g)), progress: cost <= 0 ? 1 : Math.max(0, Math.min(1, g / cost)), ready: g >= cost } };
}
function contextFromSnapshot(snap, findChampion) {
  var _a;
  if (!(snap == null ? void 0 : snap.ok) || !snap.me) return null;
  const idOf = (p) => {
    var _a2;
    return ((_a2 = findChampion(p.alias) ?? findChampion(p.championName)) == null ? void 0 : _a2.id) ?? 0;
  };
  const championId = idOf(snap.me);
  if (!championId) return null;
  const pos = (p) => String(p.position ?? "").toLowerCase();
  const mine = snap.me;
  const others = (snap.players ?? []).filter((p) => p !== mine && (p.alias !== mine.alias || p.team !== mine.team));
  const toList = (list) => list.map((p) => ({ championId: idOf(p), position: pos(p) })).filter((p) => p.championId > 0);
  const enemies = toList(others.filter((p) => p.team !== mine.team));
  const opponent = pos(mine) ? (_a = enemies.find((e) => e.position === pos(mine))) == null ? void 0 : _a.championId : void 0;
  return {
    championId,
    role: roleFromPosition(mine.position),
    ...opponent && { opponentChampionId: opponent },
    ...snap.mode && { mode: snap.mode },
    enemies,
    allies: toList(others.filter((p) => p.team === mine.team)),
    source: "lcu"
  };
}

// src/infrastructure/coachless/client.js
var num3 = (x) => typeof x === "number" && Number.isFinite(x) ? x : null;
var runeStat = (x) => ({ rune: x.rune, wpa: num3(x.wpaOverall ?? x.wpa), occurrence: num3(x.occurrence) ?? 0 });
var itemStat = (x) => ({ item: x.itemId, wpa: num3(x.wpaOverall), occurrence: num3(x.occurrence) ?? 0 });
var spellStat = (x) => ({ spell: x.summonerSpell, wpa: num3(x.wpaOverall), occurrence: num3(x.occurrence) ?? 0 });
var asList = (data, map) => Array.isArray(data) ? data.map(map).filter((x) => x.wpa != null) : null;
function createCoachlessClient({ post: post2, get, cache }) {
  const call = (key2, fn, normalize) => cache.memo(
    key2,
    async () => {
      const r = await fn();
      if (!r.ok) return { ok: false, reason: r.reason ?? "http", status: r.status };
      const data = normalize(r.data);
      return data == null ? { ok: false, reason: "shape" } : { ok: true, data };
    },
    (v) => v.ok
  );
  const body = (filters, extra) => JSON.stringify({ commonFilters: filters, ...extra });
  const postNorm = (path, filters, extra, normalize) => call(path + body(filters, extra), () => post2(path, { commonFilters: filters, ...extra }), normalize);
  return {
    /** GET GetPatches → [{major, patch, label, matchCount}] */
    patches: () => call("GET patches", () => get("ChampionWinprob/GetPatches"), (d) => Array.isArray(d) ? d.filter((x) => Number.isFinite(x == null ? void 0 : x.matchCount)) : null),
    /** Keystones con su WPA (admite matchup en premium) → [{rune, wpa, occurrence}] */
    keystones: (filters) => postNorm("Rune/GetKeystoneData", filters, {}, (d) => asList(d, runeStat)),
    /** Hechizos (admite matchup en premium; `paired` fija un hechizo y da el otro) → [{spell, wpa, occurrence}] */
    spells: (filters, paired = null) => postNorm("ChampionWinprob/GetGlobalSummonerSpellStatistics", filters, { pairedSpell: paired }, (d) => asList(d, spellStat)),
    /** Filas de runas de un árbol → { rows: [fila1, fila2, fila3] } con [{rune, wpa, occurrence}] (puede haber filas vacías). */
    treeRunes: (filters, mainTree, treeToLoad, keystone) => postNorm("Rune/GetRunesForKeystoneAndTree", filters, { mainTree, treeToLoad, ...keystone != null && { keystone } }, (d) => d && typeof d === "object" && "rowOnes" in d ? { rows: [d.rowOnes, d.rowTwos, d.rowThrees].map((r) => Array.isArray(r) ? r.map(runeStat).filter((x) => x.wpa != null) : []) } : null),
    /** Rol principal de un campeón (GetRecommendedBuilds con role 5 devuelve el rol resuelto) → número 0–4, o null. */
    championRole: (filters) => call("role|" + body(filters, {}), () => post2("ChampionWinprob/GetRecommendedBuilds", { commonFilters: filters }), (d) => d && Number.isInteger(d.role) ? d.role : null),
    /**
     * Builds recomendadas (ignoran el matchup). Llevan los fragmentos y los ítems →
     * [{keystone, primaryTree, secondaryTree, shards, occurrence, tier, winrate, mostPopular, starterIds, firstItemId, secondItemId, itemBlocks}]
     * itemBlocks: [{type, items:[{item, wpa, occurrence, chooseOne, highlighted}]}] (sin filtrar: un ítem sin partidas trae wpa 0 de relleno).
     */
    builds: (filters) => postNorm("ChampionWinprob/GetRecommendedBuilds", filters, {}, (d) => d && Array.isArray(d.builds) ? d.builds.map((b) => {
      var _a, _b, _c, _d;
      return {
        keystone: b.keystone,
        primaryTree: (_a = b.runes) == null ? void 0 : _a.primaryTree,
        secondaryTree: (_b = b.runes) == null ? void 0 : _b.secondaryTree,
        selectedRunes: ((_c = b.runes) == null ? void 0 : _c.selectedRunes) ?? [],
        shards: ((_d = b.runes) == null ? void 0 : _d.selectedShards) ?? [],
        occurrence: num3(b.occurrence) ?? 0,
        tier: Number.isInteger(b.tier) ? b.tier : null,
        winrate: num3(b.winrate),
        mostPopular: b.mostPopular === true,
        starterIds: Array.isArray(b.starterIds) ? b.starterIds : [],
        firstItemId: num3(b.firstItemId),
        secondItemId: num3(b.secondItemId),
        itemBlocks: (Array.isArray(b.itemBlocks) ? b.itemBlocks : []).map((blk) => ({
          type: blk == null ? void 0 : blk.type,
          items: (Array.isArray(blk == null ? void 0 : blk.items) ? blk.items : []).map((i) => ({
            item: i == null ? void 0 : i.itemId,
            wpa: num3(i == null ? void 0 : i.wpa),
            occurrence: num3(i == null ? void 0 : i.occurrence) ?? 0,
            chooseOne: (i == null ? void 0 : i.chooseOne) === true,
            highlighted: (i == null ? void 0 : i.highlighted) === true
          }))
        }))
      };
    }) : null),
    /**
     * Estadísticas de ítems (GetGlobalItemStatistics) → [{item, wpa, occurrence}] sin ordenar.
     * `o`: { type (1 ítems completos por posición · 2 botas · 6 iniciales), slots (p. ej. [3]), first, second (1.er y 2.º legendario ya comprados) }.
     * ❓ Que `first`/`second` condicionen el resultado y que el matchup se respete en ítems no está verificado (dev/api-probes/test-coachless-items.mjs).
     */
    items: (filters, o = {}) => postNorm("ChampionWinprob/GetGlobalItemStatistics", filters, {
      itemSlots: o.slots ?? null,
      itemType: o.type ?? 1,
      keystone: null,
      starterId: null,
      firstPurchaseId: null,
      firstLegendaryId: o.first ?? null,
      secondLegendaryId: o.second ?? null,
      loadFirstEpicPurchase: false,
      includeSupportItems: false
    }, (d) => asList(d, itemStat))
  };
}

// src/infrastructure/coachless/cache.js
function createCache({ ttlMs = 30 * 60 * 1e3, max = 200, now = () => Date.now() } = {}) {
  const store = /* @__PURE__ */ new Map();
  const inflight2 = /* @__PURE__ */ new Map();
  const get = (key2) => {
    const e = store.get(key2);
    if (!e) return void 0;
    if (e.exp <= now()) {
      store.delete(key2);
      return void 0;
    }
    return e.value;
  };
  const set = (key2, value) => {
    store.delete(key2);
    store.set(key2, { value, exp: now() + ttlMs });
    while (store.size > max) store.delete(store.keys().next().value);
  };
  async function memo(key2, fn, cacheable = () => true) {
    const hit = get(key2);
    if (hit !== void 0) return hit;
    if (inflight2.has(key2)) return inflight2.get(key2);
    const p = (async () => {
      try {
        const v = await fn();
        if (cacheable(v)) set(key2, v);
        return v;
      } finally {
        inflight2.delete(key2);
      }
    })();
    inflight2.set(key2, p);
    return p;
  }
  return { get, set, memo, clear: () => {
    store.clear();
    inflight2.clear();
  }, size: () => store.size };
}

// src/infrastructure/lolalytics/qwik.js
var isObj = (o) => o !== null && typeof o === "object" && !Array.isArray(o);
function parseQwikState(html) {
  const m = /<script type="qwik\/json">([\s\S]*?)<\/script>/.exec(String(html ?? ""));
  if (!m) throw new Error("sin-estado-qwik");
  let state;
  try {
    state = JSON.parse(m[1]);
  } catch {
    throw new Error("sin-estado-qwik");
  }
  if (!state || !Array.isArray(state.objs)) throw new Error("sin-estado-qwik");
  return state;
}
function makeResolver(state) {
  const objs = state.objs;
  const memo = /* @__PURE__ */ new Map();
  function at(i) {
    if (memo.has(i)) return memo.get(i);
    const o = objs[i];
    if (o === null || typeof o !== "object") {
      memo.set(i, o);
      return o;
    }
    const out = Array.isArray(o) ? [] : {};
    memo.set(i, out);
    const val = (v) => typeof v === "string" ? at(parseInt(v, 36)) : v;
    if (Array.isArray(o)) o.forEach((v) => out.push(val(v)));
    else for (const k in o) out[k] = val(o[k]);
    return out;
  }
  return { at, objs };
}
function findRoot(state, key2 = "skillEarly") {
  const i = state.objs.findIndex((o) => isObj(o) && key2 in o);
  return i < 0 ? null : i;
}
function readRoot(state) {
  const i = findRoot(state);
  return i === null ? null : makeResolver(state).at(i);
}
function findChampionMap(state) {
  const i = state.objs.findIndex((o) => isObj(o) && "81" in o && "62" in o && Object.keys(o).length > 100);
  return i < 0 ? null : makeResolver(state).at(i);
}
function extractTierlist(state) {
  const { at } = makeResolver(state);
  const out = /* @__PURE__ */ new Map();
  state.objs.forEach((o, i) => {
    if (!isObj(o) || !("cid" in o) || !("row" in o)) return;
    const r = at(i);
    if (r && isObj(r.row) && Number.isInteger(r.cid)) out.set(r.cid, r.row);
  });
  return out;
}

// src/infrastructure/lolalytics/client.js
var SITE2 = "https://lolalytics.com/es/lol/";
var BACKOFF_MS = [6e4, 5 * 6e4, 30 * 6e4];
var BLOCK_STATUS = /* @__PURE__ */ new Set([403, 429, 503]);
function buildPageUrl({ slug, lane, tier, rival }) {
  const q = [`tier=${encodeURIComponent(tier)}`];
  if (lane) q.push(`lane=${encodeURIComponent(lane)}`);
  if (rival && lane) q.push(`vslane=${encodeURIComponent(lane)}`);
  return `${SITE2}${encodeURIComponent(slug)}/${rival ? `vs/${encodeURIComponent(rival)}/` : ""}build/?${q.join("&")}`;
}
var tierlistUrl = ({ lane, tier }) => `${SITE2}tierlist/?lane=${encodeURIComponent(lane)}&tier=${encodeURIComponent(tier)}`;
function createLolalyticsClient({ cache, log: log2 = null, fetchImpl = (...a) => globalThis.fetch(...a), now = () => Date.now(), timeoutMs = 1e4 }) {
  let blockedUntil = 0;
  let failures = 0;
  const block = (why) => {
    const wait = BACKOFF_MS[Math.min(failures, BACKOFF_MS.length - 1)];
    failures++;
    blockedUntil = now() + wait;
    log2 == null ? void 0 : log2.warn("lolalytics: " + why + "; sin peticiones durante " + Math.round(wait / 6e4) + " min");
  };
  async function getHtml(url) {
    if (now() < blockedUntil) return { ok: false, reason: "blocked" };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { signal: ctrl.signal, credentials: "omit" });
      if (res.status === 404) return { ok: false, reason: "no-data" };
      if (BLOCK_STATUS.has(res.status)) {
        block("HTTP " + res.status);
        return { ok: false, reason: "blocked" };
      }
      if (!res.ok) return { ok: false, reason: "http" };
      const html = await res.text();
      if (!html.includes("qwik/json")) {
        block("la p\xE1gina no trae datos (\xBFreto anti-bot?)");
        return { ok: false, reason: "blocked" };
      }
      failures = 0;
      return { ok: true, html };
    } catch (e) {
      log2 == null ? void 0 : log2.debug("lolalytics: fallo de red", String(e));
      return { ok: false, reason: "network" };
    } finally {
      clearTimeout(timer);
    }
  }
  const fetchBuild = async ({ slug, lane, tier, rival }) => {
    const page = await getHtml(buildPageUrl({ slug, lane, tier, rival }));
    if (!page.ok) return page;
    let root;
    try {
      root = readRoot(parseQwikState(page.html));
    } catch {
      return { ok: false, reason: "shape" };
    }
    const problems = root ? validateRoot(root, { vs: !!rival }) : ["sin ra\xEDz"];
    if (problems.length) {
      log2 == null ? void 0 : log2.warn("lolalytics: esquema inesperado:", problems.join("; "));
      return { ok: false, reason: "shape" };
    }
    return { ok: true, data: { root: slimRoot(root) } };
  };
  const fetchTierlist = async ({ lane, tier }) => {
    const page = await getHtml(tierlistUrl({ lane, tier }));
    if (!page.ok) return page;
    let rows, slugs;
    try {
      const st = parseQwikState(page.html);
      rows = extractTierlist(st);
      slugs = findChampionMap(st);
    } catch {
      return { ok: false, reason: "shape" };
    }
    if (rows.size < 10) {
      log2 == null ? void 0 : log2.warn("lolalytics: lista de tier con " + rows.size + " filas");
      return { ok: false, reason: "shape" };
    }
    return { ok: true, data: { rows, slugs } };
  };
  const memo = (key2, fn) => cache.memo(key2, fn, (v) => v.ok);
  async function withTierFallback(tier, run) {
    const r = await run(tier);
    if (r.ok || tier === DEFAULT_TIER || !["http", "shape", "no-data"].includes(r.reason)) return { ...r, tierUsed: tier };
    log2 == null ? void 0 : log2.warn("lolalytics: el rango \xAB" + tier + "\xBB no se sirvi\xF3 (" + r.reason + "); se usa " + DEFAULT_TIER);
    const f = await run(DEFAULT_TIER);
    return { ...f, tierUsed: DEFAULT_TIER };
  }
  return {
    /** Página de build (o de matchup si hay `rival`) → { root } reducida y validada. `tierUsed` = el rango que se acabó sirviendo. */
    build: ({ slug, lane = null, tier = DEFAULT_TIER, rival = null }) => withTierFallback(tier, (tr) => memo(`build|${slug}|${lane ?? ""}|${tr}|${rival ?? ""}`, () => fetchBuild({ slug, lane, tier: tr, rival }))),
    /** Lista de tier de una línea → { rows: Map<cid, fila>, slugs: {cid: slug}|null }. */
    tierlist: ({ lane, tier = DEFAULT_TIER }) => withTierFallback(tier, (tr) => memo(`tierlist|${lane}|${tr}`, () => fetchTierlist({ lane, tier: tr }))),
    /** Estado del backoff (para diagnóstico). */
    status: () => ({ blockedForMs: Math.max(0, blockedUntil - now()), failures })
  };
}

// src/infrastructure/itero/client.js
var BACKOFF_MS2 = [6e4, 5 * 6e4, 30 * 6e4];
var BLOCK_STATUS2 = /* @__PURE__ */ new Set([403, 429, 500, 502, 503, 504]);
function createIteroClient({ cache, log: log2 = null, fetchImpl = (...a) => globalThis.fetch(...a), now = () => Date.now(), timeoutMs = 1e4 }) {
  let blockedUntil = 0;
  let failures = 0;
  let requests = 0;
  const block = (why) => {
    const wait = BACKOFF_MS2[Math.min(failures, BACKOFF_MS2.length - 1)];
    failures++;
    blockedUntil = now() + wait;
    log2 == null ? void 0 : log2.warn("itero: " + why + "; sin peticiones durante " + Math.round(wait / 6e4) + " min");
  };
  async function post2(req) {
    if (now() < blockedUntil) return { ok: false, reason: "blocked" };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    requests++;
    try {
      const res = await fetchImpl(ENDPOINT, { method: "POST", body: JSON.stringify(req), signal: ctrl.signal, credentials: "omit" });
      if (BLOCK_STATUS2.has(res.status)) {
        block("HTTP " + res.status);
        return { ok: false, reason: "blocked" };
      }
      if (!res.ok) return { ok: false, reason: "http" };
      let raw;
      try {
        raw = await res.json();
      } catch {
        return { ok: false, reason: "shape" };
      }
      const n = normalizeResponse(raw, req.lane);
      if (!n.ok) {
        log2 == null ? void 0 : log2.warn("itero: respuesta con forma inesperada (\xBFcambi\xF3 la API?)");
        return { ok: false, reason: "shape" };
      }
      failures = 0;
      const unrecognized = findUnrecognized(req, n.candidates);
      if (unrecognized.length) log2 == null ? void 0 : log2.warn("itero: nombres no reconocidos (se trataron como huecos):", unrecognized.join(", "));
      return { ok: true, data: { candidates: n.candidates, unrecognized } };
    } catch (e) {
      log2 == null ? void 0 : log2.debug("itero: fallo de red", String(e));
      return { ok: false, reason: "network" };
    } finally {
      clearTimeout(timer);
    }
  }
  async function postInfo(body) {
    if (now() < blockedUntil) return { ok: false, reason: "blocked" };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    requests++;
    try {
      const res = await fetchImpl(INFO_ENDPOINT, { method: "POST", body: JSON.stringify(body), signal: ctrl.signal, credentials: "omit" });
      if (res.status === 500 || res.status === 404) return { ok: false, reason: "not-found" };
      if (BLOCK_STATUS2.has(res.status)) {
        block("HTTP " + res.status + " (maestr\xEDa)");
        return { ok: false, reason: "blocked" };
      }
      if (!res.ok) return { ok: false, reason: "http" };
      let raw;
      try {
        raw = await res.json();
      } catch {
        return { ok: false, reason: "shape" };
      }
      const info = normalizeBasicInfo(raw);
      if (!info) {
        log2 == null ? void 0 : log2.warn("itero: la respuesta de la maestr\xEDa no tiene el formato esperado (\xBFcambi\xF3 la API?)");
        return { ok: false, reason: "shape" };
      }
      return { ok: true, data: info };
    } catch (e) {
      log2 == null ? void 0 : log2.debug("itero: fallo de red (maestr\xEDa)", String(e));
      return { ok: false, reason: "network" };
    } finally {
      clearTimeout(timer);
    }
  }
  return {
    /**
     * Maestría del jugador ({ points, avg, count }). `id` = { gameName, tagLine, region }. Nunca lanza.
     * Los aciertos se cachean (la clave lleva el ID solo en memoria); los fallos no, salvo que sean «ID desconocido» (no insistir).
     */
    basicInfo(id) {
      const body = basicInfoRequest(id);
      if (!body) return Promise.resolve({ ok: false, reason: "identity" });
      return cache.memo("itero-info|" + body.region + "|" + body.gameName + "#" + body.tagLine, () => postInfo(body), (v) => v.ok || v.reason === "not-found");
    },
    /** Candidatos recortados para esa petición (ver domain/itero.js buildRequest). Nunca lanza. */
    draftPicks: (req) => cache.memo(requestKey(req), () => post2(req), (v) => v.ok),
    /** Estado del backoff y nº de peticiones reales hechas (para diagnóstico). */
    status: () => ({ blockedForMs: Math.max(0, blockedUntil - now()), failures, requests })
  };
}

// src/infrastructure/ddragon/names.js
var BASE = "https://ddragon.leagueoflegends.com";
var RETRY_MS = 5 * 6e4;
function createEnglishNames({ log: log2 = null, fetchImpl = (...a) => globalThis.fetch(...a), now = () => Date.now(), timeoutMs = 8e3 } = {}) {
  const names = /* @__PURE__ */ new Map();
  let ids = null;
  let loading = null;
  let failedAt = null;
  async function getJson(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, { signal: ctrl.signal, credentials: "omit" });
      return res.ok ? await res.json() : null;
    } finally {
      clearTimeout(timer);
    }
  }
  async function run() {
    var _a;
    try {
      const versions = await getJson(`${BASE}/api/versions.json`);
      const version = Array.isArray(versions) ? versions.find((v) => typeof v === "string" && /^\d+\.\d+\.\d+$/.test(v)) : null;
      if (!version) throw new Error("sin versi\xF3n");
      const data = (_a = await getJson(`${BASE}/cdn/${version}/data/en_US/champion.json`)) == null ? void 0 : _a.data;
      if (!data || typeof data !== "object") throw new Error("sin datos");
      for (const c of Object.values(data)) {
        const id = Number(c == null ? void 0 : c.key);
        if (Number.isInteger(id) && id > 0 && typeof c.name === "string" && c.name) names.set(id, c.name);
      }
      if (names.size < 100) throw new Error("lista incompleta (" + names.size + ")");
      log2 == null ? void 0 : log2.debug("nombres ingleses:", names.size, "campeones (Data Dragon " + version + ")");
      return true;
    } catch (e) {
      names.clear();
      ids = null;
      failedAt = now();
      log2 == null ? void 0 : log2.warn("nombres ingleses no disponibles; se usar\xE1n los del cliente:", String(e));
      return false;
    }
  }
  return {
    /** Carga la tabla (una vez; tras un fallo se reintenta pasados 5 min). Nunca lanza. Devuelve true si hay tabla. */
    load() {
      if (names.size) return Promise.resolve(true);
      if (failedAt !== null && now() - failedAt < RETRY_MS) return Promise.resolve(false);
      return loading ??= run().finally(() => {
        loading = null;
      });
    },
    isLoaded: () => names.size > 0,
    /** Nombre inglés de un campeón o null (campeón recién salido que Data Dragon aún no trae, o tabla sin cargar). */
    name: (id) => names.get(id) ?? null,
    /** Id de un campeón a partir de su nombre inglés (como lo devuelve iTero; sin importar mayúsculas ni signos) o null. */
    idOf(name) {
      if (!ids) {
        ids = /* @__PURE__ */ new Map();
        for (const [id, n] of names) ids.set(nameKey(n), id);
      }
      return ids.get(nameKey(name)) ?? null;
    }
  };
}

// src/infrastructure/lcu/champ-select-provider.js
var GAME_PHASES = /* @__PURE__ */ new Set(["GameStart", "InProgress", "Reconnect"]);
var key = (c) => c ? [
  c.phase ?? "",
  c.championId,
  c.opponentChampionId ?? 0,
  c.role,
  c.lobbyTier ?? 0,
  c.mode ?? "",
  c.side ?? "",
  (c.enemies ?? []).map((e) => e.championId + ":" + e.position).join(","),
  (c.allies ?? []).map((a) => a.championId + ":" + a.position).join(","),
  (c.bans ?? []).join(",")
].join("|") : "null";
var revealed = (list) => (list ?? []).filter((p) => p.championId > 0).map((p) => ({ championId: p.championId, position: p.assignedPosition || "" }));
function createChampSelectProvider({ lcuGet: lcuGet2, activeMs = 1e3, idleMs = 2500, rankTimeoutMs = 3e3, recoverGameContext = null } = {}) {
  const subs = /* @__PURE__ */ new Set();
  const rankCache = /* @__PURE__ */ new Map();
  let timer = null;
  let lastKey = "none";
  let busy = false;
  let inGame = false;
  let picked = null;
  let queue2 = null;
  async function queueOf() {
    var _a, _b;
    if (queue2) return queue2;
    const q = (_b = (_a = await lcuGet2("/lol-gameflow/v1/session")) == null ? void 0 : _a.gameData) == null ? void 0 : _b.queue;
    if (q && typeof q.gameMode === "string") queue2 = { mode: q.gameMode.toUpperCase(), ...Number.isInteger(q.id) && { queueId: q.id } };
    return queue2;
  }
  async function rawTierOf(puuid) {
    var _a, _b, _c;
    if (rankCache.has(puuid)) return rankCache.get(puuid);
    const d = await lcuGet2(`/lol-ranked/v1/ranked-stats/${encodeURIComponent(puuid)}`);
    if (!d) return void 0;
    const q = d.queueMap ?? {};
    const tier = ((_a = q.RANKED_SOLO_5x5) == null ? void 0 : _a.tier) || ((_b = q.RANKED_FLEX_SR) == null ? void 0 : _b.tier) || ((_c = d.highestRankedEntry) == null ? void 0 : _c.tier);
    const raw = rawTierFromLcu(tier);
    rankCache.set(puuid, raw);
    return raw;
  }
  async function lobbyTierOf(session) {
    const puuids = (session.myTeam ?? []).map((p) => p.puuid).filter(Boolean);
    if (!puuids.length) return void 0;
    const all = Promise.all(puuids.map(rawTierOf));
    const raws = await Promise.race([all, new Promise((r) => setTimeout(() => r([]), rankTimeoutMs))]);
    return lobbyTierFromRaw(raws.filter((x) => x != null));
  }
  async function buildContext(session) {
    var _a, _b, _c, _d;
    const me = (session.myTeam ?? []).find((p) => p.cellId === session.localPlayerCellId);
    if (!me) return null;
    const hover = (_a = (session.actions ?? []).flat().find((a) => a.actorCellId === session.localPlayerCellId && a.type === "pick" && a.championId)) == null ? void 0 : _a.championId;
    const championId = me.championId || hover || me.championPickIntent || 0;
    const position = me.assignedPosition || "";
    const opponent = position ? (_b = (session.theirTeam ?? []).find((p) => p.assignedPosition === position && p.championId > 0)) == null ? void 0 : _b.championId : void 0;
    const [lobbyTier, q] = await Promise.all([lobbyTierOf(session), queueOf()]);
    const side = sideOfTeam(me.team);
    const bans = [...((_c = session.bans) == null ? void 0 : _c.myTeamBans) ?? [], ...((_d = session.bans) == null ? void 0 : _d.theirTeamBans) ?? []].filter((id) => Number.isInteger(id) && id > 0);
    return {
      championId,
      ...opponent && { opponentChampionId: opponent },
      role: roleFromPosition(position),
      ...lobbyTier && { lobbyTier },
      ...q && { mode: q.mode },
      ...side && { side },
      bans,
      enemies: revealed(session.theirTeam),
      allies: revealed((session.myTeam ?? []).filter((p) => p.cellId !== me.cellId)),
      source: "lcu"
    };
  }
  async function getCurrentContext() {
    const phase = await lcuGet2("/lol-gameflow/v1/gameflow-phase");
    if (phase == null) return inGame && picked ? { ...picked, phase: "game" } : null;
    inGame = GAME_PHASES.has(phase);
    if (inGame) {
      if (!picked && recoverGameContext) {
        try {
          picked = await recoverGameContext() ?? null;
        } catch (e) {
          log.debug("no se pudo recuperar la partida:", String(e));
        }
      }
      return picked ? { ...picked, phase: "game" } : null;
    }
    if (phase !== "ChampSelect") {
      queue2 = null;
      picked = null;
      return null;
    }
    const session = await lcuGet2("/lol-champ-select/v1/session");
    const ctx = session ? await buildContext(session) : null;
    if (ctx == null ? void 0 : ctx.championId) picked = ctx;
    return ctx;
  }
  async function tick() {
    if (busy) return;
    busy = true;
    let ctx = null;
    try {
      ctx = await getCurrentContext();
    } catch (e) {
      log.warn("Champion Select: error leyendo el contexto", String(e));
    }
    busy = false;
    const k = key(ctx);
    if (k !== lastKey) {
      lastKey = k;
      log.info("contexto:", ctx ? JSON.stringify(ctx) : "sin Champion Select");
      for (const cb of [...subs]) {
        try {
          cb(ctx);
        } catch (e) {
          log.error("suscriptor:", e);
        }
      }
    }
    if (subs.size) timer = setTimeout(tick, ctx ? activeMs : idleMs);
  }
  return {
    getCurrentContext,
    subscribeToChanges(cb) {
      subs.add(cb);
      if (subs.size === 1) {
        lastKey = "none";
        timer = setTimeout(tick, 0);
      }
      return () => {
        subs.delete(cb);
        if (!subs.size) {
          clearTimeout(timer);
          timer = null;
        }
      };
    }
  };
}

// src/infrastructure/lcu/identity.js
function createIdentity({ lcuGet: lcuGet2 }) {
  let cached = null;
  async function read() {
    var _a;
    const [me, chat] = await Promise.all([lcuGet2("/lol-summoner/v1/current-summoner"), lcuGet2("/lol-chat/v1/me")]);
    const gameName = (me == null ? void 0 : me.gameName) || (chat == null ? void 0 : chat.gameName) || "";
    const tagLine = (me == null ? void 0 : me.tagLine) || (chat == null ? void 0 : chat.gameTag) || "";
    let region = platformOf(chat == null ? void 0 : chat.platformId);
    if (!region) region = platformOf((_a = await lcuGet2("/riotclient/region-locale")) == null ? void 0 : _a.region);
    return gameName && tagLine && region ? { gameName: String(gameName), tagLine: String(tagLine), region } : null;
  }
  return {
    /** El Riot ID o null. Solo se recuerda si se leyó completo (si el cliente aún no está listo, la próxima vez se reintenta). */
    async get() {
      if (cached) return cached;
      cached = await read() ?? null;
      return cached;
    },
    /** Olvida el ID (p. ej. al cambiar de cuenta en el cliente). */
    forget() {
      cached = null;
    }
  };
}

// src/infrastructure/lcu/loadout-gateway.js
async function send(method, path, body, timeoutMs = 5e3) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(path, {
      method,
      signal: ctrl.signal,
      headers: { "content-type": "application/json" },
      ...body !== void 0 && { body: JSON.stringify(body) }
    });
    let data = null;
    try {
      data = await r.json();
    } catch {
    }
    if (!r.ok) log.debug("LCU", method, path, "\u2192 HTTP", r.status);
    return { ok: r.ok, status: r.status, data };
  } catch (e) {
    log.debug("LCU", method, path, "fall\xF3:", String(e));
    return { ok: false, status: 0, data: null };
  } finally {
    clearTimeout(timer);
  }
}
function createLoadoutGateway() {
  return {
    phase: () => lcuGet("/lol-gameflow/v1/gameflow-phase"),
    listPages: async () => {
      const r = await lcuGet("/lol-perks/v1/pages");
      return Array.isArray(r) ? r : null;
    },
    inventory: () => lcuGet("/lol-perks/v1/inventory"),
    createPage: (page) => send("POST", "/lol-perks/v1/pages", page),
    updatePage: (id, page) => send("PUT", `/lol-perks/v1/pages/${encodeURIComponent(id)}`, page),
    setCurrent: (id) => send("PUT", "/lol-perks/v1/currentpage", id),
    setSpells: (spell1Id, spell2Id) => send("PATCH", "/lol-champ-select/v1/session/my-selection", { spell1Id, spell2Id })
  };
}

// src/infrastructure/liveclient/live-client.js
var num4 = (x) => typeof x === "number" && Number.isFinite(x) ? x : null;
var URL_ALL = "https://127.0.0.1:2999/liveclientdata/allgamedata";
var RAW_PREFIX = /^game_character_displayname_/;
var player = (p) => ({
  championName: typeof (p == null ? void 0 : p.championName) === "string" ? p.championName : "",
  alias: typeof (p == null ? void 0 : p.rawChampionName) === "string" ? p.rawChampionName.replace(RAW_PREFIX, "") : "",
  position: typeof (p == null ? void 0 : p.position) === "string" ? p.position : "",
  team: typeof (p == null ? void 0 : p.team) === "string" ? p.team : ""
});
function createLiveClient({ fetchFn = (u, o) => fetch(u, o), timeoutMs = 2500 } = {}) {
  async function getJson(url) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const r = await fetchFn(url, { signal: ctrl.signal });
      return r.ok ? await r.json() : null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  async function snapshot() {
    var _a, _b;
    const d = await getJson(URL_ALL);
    if (!d || typeof d !== "object") return { ok: false, reason: "offline" };
    const ap = d.activePlayer;
    const all = Array.isArray(d.allPlayers) ? d.allPlayers : [];
    if (!ap || typeof ap !== "object" || !all.length) return { ok: false, reason: "shape" };
    const mine = all.find((p) => ap.riotId && (p == null ? void 0 : p.riotId) === ap.riotId || ap.summonerName && (p == null ? void 0 : p.summonerName) === ap.summonerName);
    if (!mine) return { ok: false, reason: "shape" };
    return {
      ok: true,
      gold: num4(ap.currentGold) ?? 0,
      level: Number.isInteger(ap.level) ? ap.level : null,
      gameTime: num4((_a = d.gameData) == null ? void 0 : _a.gameTime),
      mode: typeof ((_b = d.gameData) == null ? void 0 : _b.gameMode) === "string" ? d.gameData.gameMode.toUpperCase() : null,
      items: (Array.isArray(mine.items) ? mine.items : []).filter((i) => Number.isInteger(i == null ? void 0 : i.itemID) && i.itemID > 0).map((i) => ({ item: i.itemID, count: Number.isInteger(i.count) && i.count > 0 ? i.count : 1, slot: Number.isInteger(i.slot) ? i.slot : null })),
      me: player(mine),
      players: all.map(player)
    };
  }
  return { snapshot };
}

// src/application/app.js
var requestCache = createCache({ ttlMs: 30 * 60 * 1e3, max: 300 });
var resultCache = createCache({ ttlMs: 30 * 60 * 1e3, max: 100 });
var client = createCoachlessClient({ post: api, get: apiGet, cache: requestCache });
var service = createRecommendationService({ client, log, cache: resultCache, keystoneTrees: () => catalog.keystoneTrees(), getFilters: getFilterPrefs });
var lolaCache = createCache({ ttlMs: 2 * 60 * 60 * 1e3, max: 80 });
var lolaClient = createLolalyticsClient({ cache: lolaCache, log });
var lolaSource = createLolalyticsSource({ client: lolaClient, catalog, getFilters: getFilterPrefs, log });
var router = createSourceRouter({ sources: { coachless: service, lolalytics: lolaSource }, getMode: () => getSourcePrefs().mode, isLoggedIn, log });
var liveClient = createLiveClient();
var live = createLiveGame({ client: liveClient });
var controller = createChampSelectController({
  provider: createChampSelectProvider({
    lcuGet,
    // Cliente reiniciado en plena partida: el campeón, rol y rivales salen de la Live Client Data API.
    recoverGameContext: async () => {
      await catalog.load();
      const ctx = contextFromSnapshot(await liveClient.snapshot(), (q) => catalog.findChampion(q));
      if (ctx) log.info("partida recuperada con la Live Client Data API:", ctx.championId);
      return ctx;
    }
  }),
  recommend: (ctx, o) => router.getRecommendation(ctx, o),
  // «Puede recomendar»: solo la fuente Coachless exige sesión; con LoLalytics (o auto sin cuenta) no hace falta iniciar sesión.
  isLoggedIn: () => !needsLogin(getSourcePrefs().mode) || isLoggedIn(),
  hasPremium,
  debounceMs: 350,
  // pasar el cursor por varios campeones no debe lanzar una consulta por cada uno
  pins
  // runa clave y hechizos fijados por el usuario, por campeón y rol
});
controller.subscribe((st) => {
  var _a;
  if (((_a = st.context) == null ? void 0 : _a.phase) === "game") live.start();
  else live.stop();
});
var championStats = createChampionStats({ client: lolaClient, catalog, getFilters: getFilterPrefs, log });
var overlay = createOverlayController({
  stats: championStats,
  source: controller,
  prefs: { get: getOverlayPrefs, set: setOverlayPrefs },
  getFilters: getFilterPrefs,
  debounceMs: 300,
  log
});
var iteroClient = createIteroClient({ cache: createCache({ ttlMs: 10 * 60 * 1e3, max: 40 }), log });
var mastery = createMastery({ identity: createIdentity({ lcuGet }), itero: iteroClient, source: controller, prefs: { get: getAdvisorPrefs }, log });
var advisor = createPickAdvisorController({
  advisor: createPickAdvisor({ itero: iteroClient, names: createEnglishNames({ log }), catalog, lola: lolaClient, stats: championStats, mastery, getFilters: getFilterPrefs, getPrefs: getAdvisorPrefs, log }),
  source: controller,
  prefs: { get: getAdvisorPrefs, set: setAdvisorPrefs },
  getFilters: getFilterPrefs,
  debounceMs: 600,
  maxQueries: 12,
  log
});
var enemyRoles = createEnemyRoles({ source: controller, lola: lolaClient, getFilters: getFilterPrefs, log });
var pickFilters = createPickFilters({ catalog, overlay, advisor, mastery, prefs: { get: getPickFilterPrefs, set: setPickFilterPrefs }, getContext: () => controller.getState().context });
var applier = createConfigurationApplier({ gateway: createLoadoutGateway(), prefs: { get: getApplyPrefs, set: setApplyPrefs }, log });
var app = {
  catalog,
  controller,
  applier,
  live,
  /** Filtros de rango de parches y de Elo (los guardados). Al cambiarlos se vuelve a consultar con el contexto actual. */
  filters: {
    get: getFilterPrefs,
    set(patch) {
      const next = setFilterPrefs(patch);
      controller.refresh();
      return next;
    }
  },
  /** Fuente de las recomendaciones. Al cambiarla se vuelve a consultar con el contexto actual. */
  source: {
    get: () => getSourcePrefs().mode,
    set(mode) {
      const next = setSourcePrefs({ mode });
      controller.refresh();
      return next.mode;
    }
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
  resetData: () => {
    requestCache.clear();
    resultCache.clear();
  }
};

// src/domain/update.js
var MAX_BUNDLE_BYTES = 6 * 1024 * 1024;
var MAX_ENVELOPE_BYTES = 16 * 1024;
var SEMVER_RE = /^(\d{1,4})\.(\d{1,4})\.(\d{1,4})$/;
function parseVersion(v) {
  const m = typeof v === "string" ? SEMVER_RE.exec(v) : null;
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

// src/application/update-prefs.js
var KEY4 = "draftsage/updates";
function getUpdatePrefs() {
  let o = null;
  try {
    o = DataStore.get(KEY4, {});
  } catch {
  }
  return {
    mode: (o == null ? void 0 : o.mode) === "packaged" ? "packaged" : "auto",
    lastNotified: parseVersion(o == null ? void 0 : o.lastNotified) ? o.lastNotified : ""
  };
}
function setUpdatePrefs(patch) {
  const next = { ...getUpdatePrefs(), ...patch };
  const clean = { mode: next.mode === "packaged" ? "packaged" : "auto", lastNotified: parseVersion(next.lastNotified) ? next.lastNotified : "" };
  try {
    DataStore.set(KEY4, clean);
  } catch {
  }
  return clean;
}

// src/presentation/menus.js
var CONFIG_LINE = "DisableWebSecurity=1";
function corsSetupMenu() {
  const steps = h(
    "div",
    { class: "ec-box", style: "display:none" },
    ["cors.step1", "cors.step2", "cors.step3", "cors.step4"].map((k) => h("div", null, richText(t(k))))
  );
  return openDialog({
    id: "cors-setup",
    title: "Draftsage",
    body: [h("p", null, richText(t("cors.intro"))), steps],
    actions: [
      { id: "steps", label: t("cors.btnSteps"), keepOpen: true, onClick: () => {
        steps.style.display = steps.style.display === "none" ? "block" : "none";
        return false;
      } },
      { id: "copy", label: t("cors.btnCopy"), keepOpen: true, onClick: async (d) => {
        d.setStatus(await copyText(CONFIG_LINE) ? t("cors.copied", CONFIG_LINE) : t("cors.copyFail"));
        return false;
      } },
      { id: "folder", label: t("cors.btnFolder"), keepOpen: true, onClick: (d) => {
        try {
          window.openPluginsFolder();
        } catch (e) {
          log.error("openPluginsFolder fall\xF3:", e);
        }
        d.setStatus(t("cors.folderDone"));
        return false;
      } },
      { id: "restart", label: t("cors.btnRestart"), keepOpen: true, onClick: (d) => {
        d.setStatus(t("cors.restarting"));
        setTimeout(() => {
          try {
            window.restartClient();
          } catch (e) {
            log.error("restartClient fall\xF3:", e);
            d.setStatus(t("cors.restartFail"), "error");
          }
        }, 400);
        return false;
      } },
      { id: "later", label: t("cors.later") },
      { id: "never", label: t("cors.never") }
    ]
  });
}
function loginMenu() {
  return openForm({
    id: "login",
    title: t("login.title"),
    description: t("login.desc"),
    fields: [
      { name: "email", label: t("login.email"), type: "email", placeholder: t("login.emailPh"), required: true, autocomplete: "username" },
      { name: "password", label: t("login.password"), type: "password", required: true, autocomplete: "current-password", focusOnError: true }
    ],
    submitLabel: t("login.submit"),
    onSubmit: async ({ email, password }) => {
      const r = await login(email.trim(), password);
      if (r.ok) {
        notify.success(t("login.ok"));
        app.resetData();
        app.controller.refresh();
        return { premium: r.premium };
      }
      return r.reason === "network" ? t("login.errNetwork") : t("login.errBad");
    }
  });
}
async function logoutFlow() {
  const ok = await confirm({
    id: "logout-confirm",
    title: t("logout.title"),
    message: t("logout.msg"),
    confirmLabel: t("logout.btn"),
    danger: true
  });
  if (ok) {
    logout();
    app.resetData();
    app.controller.refresh();
    notify.success(t("logout.ok"));
  }
}
function simulateMenu() {
  return openForm({
    id: "simulate",
    title: t("sim.title"),
    description: t("sim.desc"),
    fields: [
      { name: "champion", label: t("sim.champion"), placeholder: "Kai'Sa", required: true },
      { name: "opponent", label: t("sim.opponent"), placeholder: "Jinx" },
      { name: "role", label: t("sim.role"), placeholder: t("sim.rolePh") },
      { name: "tier", label: t("sim.tier"), placeholder: t("sim.tierPh") }
    ],
    submitLabel: t("sim.submit"),
    onSubmit: async (v, hd) => {
      hd.setStatus(t("sim.searching"));
      await app.catalog.load();
      const champ = app.catalog.findChampion(v.champion);
      if (!champ) return app.catalog.isLoaded() ? t("sim.notFound", v.champion.trim()) : t("sim.notLoaded");
      let opp = null;
      if (v.opponent.trim()) {
        opp = app.catalog.findChampion(v.opponent);
        if (!opp) return t("sim.oppNotFound", v.opponent.trim());
      }
      const role = v.role.trim() ? parseRole(v.role) : ROLE_FILL;
      if (role === void 0) return t("sim.badRole");
      const tier = v.tier.trim() ? parseTier(v.tier) : void 0;
      if (v.tier.trim() && tier === void 0) return t("sim.badTier");
      app.controller.simulate({ championId: champ.id, ...opp && { opponentChampionId: opp.id }, role, ...tier && { lobbyTier: tier } });
      return { champion: champ.id };
    }
  });
}
async function enableApplyFlow() {
  if (app.applier.canApply()) return true;
  const ok = await confirm({
    id: "apply-consent",
    title: t("consent.title"),
    message: t("consent.msg"),
    confirmLabel: t("consent.btn")
  });
  if (ok) app.applier.setEnabled(true);
  return ok;
}
async function enableAdvisorFlow() {
  if (app.advisor.isEnabled()) return true;
  const ok = await confirm({ id: "advisor-consent", title: t("advisor.title"), message: t("advisor.msg"), confirmLabel: t("advisor.btn") });
  if (ok) await app.advisor.setEnabled(true);
  return ok;
}
async function enableMasteryFlow() {
  if (getAdvisorPrefs().useMastery) return true;
  const ok = await confirm({ id: "mastery-consent", title: t("mastery.title"), message: t("mastery.msg"), confirmLabel: t("mastery.btn") });
  if (ok) {
    app.advisor.configure({ useMastery: true });
    await app.mastery.refresh();
  }
  return ok;
}
function togglePanel(enabled) {
  setPanelPrefs({ enabled });
  window.dispatchEvent(new Event("draftsage:prefs"));
  if (enabled) window.dispatchEvent(new Event("draftsage:show-panel"));
}
function resetPanelPosition() {
  setPanelPrefs({ x: null, y: null });
  window.dispatchEvent(new Event("draftsage:prefs"));
  window.dispatchEvent(new Event("draftsage:show-panel"));
}
function toggleLanguage() {
  setLanguagePref(getLang() === "es" ? "en" : "es");
  window.dispatchEvent(new Event("draftsage:prefs"));
}
function mainMenu() {
  return openSettings({
    applier: app.applier,
    catalog: app.catalog,
    filters: app.filters,
    source: app.source,
    overlay: app.overlay,
    advisor: app.advisor,
    mastery: {
      isEnabled: () => getAdvisorPrefs().useMastery,
      weight: () => getAdvisorPrefs().masteryWeight,
      setWeight: (w) => {
        app.advisor.configure({ masteryWeight: w });
      },
      off: () => {
        app.advisor.configure({ useMastery: false });
        app.mastery.refresh();
      }
    },
    getSession: sessionInfo,
    isSimulating: () => {
      var _a;
      return ((_a = app.controller.getState().context) == null ? void 0 : _a.source) === "manual";
    },
    panelEnabled: () => getPanelPrefs().enabled,
    updates: {
      mode: () => getUpdatePrefs().mode,
      setMode: (m) => {
        setUpdatePrefs({ mode: m });
      },
      build: () => {
        var _a, _b;
        return ((_b = (_a = window.draftsage) == null ? void 0 : _a.build) == null ? void 0 : _b.call(_a)) ?? { version: "?", source: "packaged" };
      }
    },
    actions: {
      login: loginMenu,
      logout: logoutFlow,
      simulate: simulateMenu,
      cors: corsSetupMenu,
      enableApply: enableApplyFlow,
      enableAdvisor: enableAdvisorFlow,
      enableMastery: enableMasteryFlow,
      reopen: mainMenu,
      unsimulate: () => app.controller.simulate(null),
      togglePanel: () => togglePanel(!getPanelPrefs().enabled),
      resetPanel: resetPanelPosition,
      toggleLanguage
    }
  });
}

// src/infrastructure/pengu/api-probe.js
var PROBE_URL = "https://api.coachless.gg/api/ChampionWinprob/GetPatches";
async function isApiReachable() {
  try {
    const r = await fetch(PROBE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    });
    log.debug("sonda respondi\xF3 con HTTP", r.status);
    return true;
  } catch (e) {
    log.debug("sonda fall\xF3:", String(e));
    return false;
  }
}

// src/application/ensure-api-access.js
var SKIP_KEY = "draftsage/skip-cors-prompt";
var FORCE_KEY = "draftsage/force-prompt";
window.draftsage = Object.assign(window.draftsage ?? {}, {
  openSetup: () => corsSetupMenu(),
  forcePrompt: (on = true) => DataStore.set(FORCE_KEY, !!on),
  resetPrompt: () => DataStore.remove(SKIP_KEY)
});
async function ensureApiAccess() {
  const forced = DataStore.get(FORCE_KEY, false);
  const ok = !forced && await isApiReachable();
  log.info("acceso a la API:", ok ? "OK (sin bloqueo CORS)" : forced ? "MODO PRUEBA (forzado)" : "BLOQUEADO por CORS");
  if (ok) return true;
  if (DataStore.get(SKIP_KEY, false)) {
    log.info("aviso omitido: el usuario eligi\xF3 no volver a preguntar");
    return false;
  }
  log.info("esperando a que el cliente monte su interfaz antes de avisar");
  await whenReady();
  corsSetupMenu().result.then((r) => {
    if (r.action === "never") DataStore.set(SKIP_KEY, true);
  });
  return false;
}

// src/domain/confidence.js
var LOW_ITEM_SAMPLE = 500;
var CONFIDENCE_STEPS = [1e4, 5e4];
function confidenceLevel(sample) {
  const n = Number(sample);
  if (!Number.isFinite(n) || n < CONFIDENCE_STEPS[0]) return 1;
  return n < CONFIDENCE_STEPS[1] ? 2 : 3;
}
var isLowData = (stat) => !!stat && Number.isFinite(stat.occurrence) && stat.occurrence > 0 && stat.occurrence < LOW_ITEM_SAMPLE;

// src/presentation/components/common.js
var pic = (info, cls, title) => info.icon ? h("img", { class: cls, src: info.icon, alt: info.name, title: title ?? info.name, draggable: "false" }) : h("div", { class: cls + " ecp-ph", title: title ?? info.name, role: "img", "aria-label": info.name }, String(info.name).slice(0, 2));
var line = (...children) => h("div", { class: "ecp-line" }, children);
var fmtWpa = (w) => (w >= 0 ? "+" : "") + w.toFixed(1);
var fmtN = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + " M" : n >= 1e3 ? Math.round(n / 1e3) + " k" : String(n);
var signed = (n) => (n >= 0 ? "+" : "") + n.toFixed(1);
var known = (prefix, id) => {
  const k = prefix + id;
  const s = t(k);
  return s === k ? t("err.other") : s;
};
function statTip(name, stat) {
  if (stat && stat.wpa == null && Number.isFinite(stat.wr)) return t("stat.tipWr", name, stat.wr.toFixed(1), (stat.occurrence ?? 0).toLocaleString(getLang()));
  if (!stat || stat.wpa == null) return name;
  return t("stat.tip", name, fmtWpa(stat.wpa), stat.occurrence.toLocaleString(getLang())) + (stat.share != null ? t("stat.share", Math.round(stat.share * 100)) : "") + (isLowData(stat) ? " \u2014 " + t("lowdata") : "");
}

// src/presentation/components/build.js
var STYLE_ID4 = "draftsage-build-style";
var CSS3 = `
.ecr{display:flex;flex-direction:column;gap:6px}
.ecr-tree{display:flex;flex-direction:column;gap:5px}
.ecr-th{display:flex;align-items:center;gap:6px;min-height:22px}
.ecr-tn{font-size:var(--ds-fs-section);font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-gold)}
.ecr-th .ecp-tree{width:20px;height:20px}
.ecr-key{display:flex;align-items:center;gap:8px}
.ecr-key .ecp-it{width:48px;flex:none}
.ecr-kt{display:flex;flex-direction:column;min-width:0}
.ecr-kn{font-size:var(--ds-fs-name);font-weight:bold;color:var(--ds-text-hi);line-height:1.2}
.ecr-kd{font-size:11px;color:var(--ds-meta);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ecr-grid{display:flex;gap:4px}
.ecr-grid .ecp-it{flex:1 1 0;width:auto;min-width:0}
.ecr-n{display:block;max-width:100%;margin-top:2px;font-size:var(--ds-fs-meta);line-height:12px;color:var(--ds-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ecr-shards .ecp-ico{width:24px;height:24px}
.ecr-spells .ecp-it{flex:0 0 76px}
.ecr-cap{font-size:var(--ds-fs-meta);color:var(--ds-mute);line-height:1.3}
.ecr-st{display:inline-flex;align-items:center;gap:4px;margin-left:auto;padding:1px 7px;border:1px solid var(--ds-border-soft);border-radius:9px;font-size:var(--ds-fs-meta);color:var(--ds-meta);background:var(--ds-surface);white-space:nowrap}
.ecr-st.ecr-custom{border-color:var(--ds-gold-dim);color:var(--ds-gold)}
.ecr-st.ecr-pinned{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecr-st button{display:inline-flex;align-items:center;gap:3px;padding:0 0 0 4px;margin:0;background:none;border:0;border-left:1px solid var(--ds-gold-dim);color:inherit;font:inherit;cursor:pointer}
.ecr-st button:hover{color:var(--ds-text-hi)}
.ecr-scope{color:var(--ds-mute)}
.ecr-sum{display:flex;flex-direction:column;gap:3px;font-size:11px;line-height:1.35;color:var(--ds-text)}
.ecr-sum .ecp-line{gap:6px;align-items:flex-start}
.ecr-sum .ecp-ico{width:22px;height:22px;flex:none}
.ecr-sum b{color:var(--ds-text-hi)}
.ecr-sum .ecr-k{color:var(--ds-gold)}
`;
function ensureStyle3() {
  if (document.getElementById(STYLE_ID4)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID4;
  s.textContent = CSS3;
  document.head.append(s);
}
var treeName = (id, cat) => {
  var _a;
  const info = cat.rune(id);
  return info.name !== "#" + id ? info.name : ((_a = TREES[id]) == null ? void 0 : _a.name) ?? "";
};
function treeIcon(id, cat) {
  const info = cat.rune(id);
  const name = treeName(id, cat);
  return info.icon ? h("img", { class: "ecp-tree", src: info.icon, alt: name, title: name, draggable: "false" }) : h("div", { class: "ecp-tree ecp-ph", title: name }, "");
}
var describe = (info, stat) => [statTip(info.name, stat), info.desc].filter(Boolean).join(" \u2014 ");
function option(info, stat, { cls = "", key: key2 = null, name = true } = {}) {
  const hasWpa = stat && stat.wpa != null;
  const label = describe(info, stat);
  return h(
    "div",
    { class: "ecp-it", role: "group", "aria-label": label },
    pic(info, "ecp-ico " + cls + (isLowData(stat) ? " ecp-low" : ""), label),
    key2 && h("span", { class: "ecp-keycap", "aria-hidden": "true" }, key2),
    name && h("span", { class: "ecr-n" }, info.name),
    hasWpa && h("div", { class: "ecp-w " + (stat.wpa >= 0 ? "ecp-pos" : "ecp-neg") }, fmtWpa(stat.wpa)),
    !hasWpa && stat && Number.isFinite(stat.wr) && h("div", { class: "ecp-w ecp-wr" }, Math.round(stat.wr) + "%")
  );
}
function originTag(d, state, cat, actions) {
  var _a, _b, _c, _d;
  const custom = !!(((_a = d.custom) == null ? void 0 : _a.keystone) || ((_b = d.custom) == null ? void 0 : _b.spells));
  const kind = (state == null ? void 0 : state.pinned) ? "pinned" : custom ? "custom" : "auto";
  const rival = ((_c = d.meta) == null ? void 0 : _c.matchup) && ((_d = d.meta) == null ? void 0 : _d.opponent) ? cat.champion(d.meta.opponent).name : null;
  const reset = kind === "custom" && actions ? h("button", { type: "button", "data-act": "build-reset", title: t("build.resetTip"), onclick: () => {
    var _a2;
    actions.keystone(null);
    if ((_a2 = d.custom) == null ? void 0 : _a2.spells) actions.spells(null);
  } }, icon("refresh", 11), t("build.reset")) : null;
  return h(
    "span",
    { class: "ecr-st" + (kind === "auto" ? "" : " ecr-" + kind), "data-origin": kind, title: t("build.origin." + kind + "Tip") },
    t("build.origin." + kind),
    h(
      "span",
      { class: "ecr-scope", "data-scope": rival ? "matchup" : "general", title: rival ? t("build.scope.matchupTip", rival) : t("build.scope.generalTip") },
      "\xB7 " + (rival ? t("build.scope.matchup", rival) : t("build.scope.general"))
    ),
    reset
  );
}
function keystoneAlts(d, cat, actions) {
  var _a;
  const list = ((_a = d.alternatives) == null ? void 0 : _a.keystones) ?? [];
  if (list.length < 2) return null;
  const total = list.reduce((s, k) => s + (k.occurrence ?? 0), 0);
  return [
    h(
      "div",
      { class: "ecp-line ecp-alts", "data-alts": "keystone", role: "group", "aria-label": t("alt.keystones"), title: t("alt.keystones") },
      h("span", { class: "ecp-lead ecp-mute" }, icon("swap", 14)),
      list.map((k) => {
        const on = k.rune === d.keystone.rune;
        const auto = k.rune === d.alternatives.autoKeystone;
        const info = cat.rune(k.rune);
        return h("button", {
          type: "button",
          class: "ecp-alt" + (on ? " ecp-on" : ""),
          "data-rune": k.rune,
          "data-auto": auto ? "" : null,
          "aria-pressed": String(on),
          "aria-label": statTip(info.name, k) + (auto ? t("alt.auto") : ""),
          title: statTip(info.name, k) + (auto ? t("alt.auto") : ""),
          onclick: () => {
            if (!on) actions.keystone(auto ? null : k.rune);
          }
        }, pic(info, "ecp-ico ecp-xs" + (isLowData(k) ? " ecp-low" : "")), h("span", { class: "ecp-w" }, Math.round(k.share * 100) + "%"));
      })
    ),
    h("div", { class: "ecr-cap", "data-legend": "keystones" }, t("build.altLegend", fmtN(total)))
  ];
}
function spellAlts(d, cat, actions) {
  var _a, _b, _c;
  const opts = ((_a = d.alternatives) == null ? void 0 : _a.spells) ?? [];
  if (!opts.length && !((_b = d.custom) == null ? void 0 : _b.spells)) return null;
  return h(
    "div",
    { class: "ecp-line ecp-spalts", "data-alts": "spells", role: "group", "aria-label": t("alt.spells"), title: t("alt.spells") },
    ((_c = d.custom) == null ? void 0 : _c.spells) && h("button", { type: "button", class: "ecp-alt", "data-act": "spells-reset", "aria-label": t("alt.reset"), title: t("alt.reset"), onclick: () => actions.spells(null) }, icon("refresh", 14)),
    opts.map((s) => h("button", {
      type: "button",
      class: "ecp-alt",
      "data-spell": s.spell,
      "aria-label": statTip(cat.spell(s.spell).name, s),
      title: statTip(cat.spell(s.spell).name, s),
      onclick: () => actions.spells(s.pair)
    }, pic(cat.spell(s.spell), "ecp-ico ecp-xs ecp-sq" + (isLowData(s) ? " ecp-low" : ""))))
  );
}
var section = (key2, head, ...body) => h("div", { class: "ecr-tree", "data-section": key2 }, h("div", { class: "ecr-th" }, head), ...body);
function runePage(d, cat, flashKey, actions, state = null) {
  ensureStyle3();
  const r = (id) => cat.rune(id);
  const pair = buildSpellPair(d, flashKey);
  const keys = pair.ok ? ["D", "F"] : [null, null];
  const spells = pair.ok ? [pair.spell1Id, pair.spell2Id].map((id) => d.spells.find((s) => s.spell === id)) : d.spells;
  const ks = r(d.keystone.rune);
  const minors = d.primaryPicks.filter(Boolean);
  return h(
    "div",
    { class: "ecr", "data-runes": "" },
    section(
      "primary",
      [treeIcon(d.primaryTree, cat), h("span", { class: "ecr-tn" }, treeName(d.primaryTree, cat)), originTag(d, state, cat, actions)],
      h(
        "div",
        { class: "ecr-key" },
        option(ks, d.keystone, { cls: "ecp-big", name: false }),
        h("div", { class: "ecr-kt" }, h("span", { class: "ecr-kn", "data-keystone-name": "" }, ks.name), ks.desc ? h("span", { class: "ecr-kd" }, ks.desc) : null)
      ),
      minors.length ? h("div", { class: "ecr-grid", "data-row": "primary" }, minors.map((p) => option(r(p.rune), p))) : null,
      actions ? keystoneAlts(d, cat, actions) : null
    ),
    d.secondaryTree ? section(
      "secondary",
      [treeIcon(d.secondaryTree, cat), h("span", { class: "ecr-tn" }, treeName(d.secondaryTree, cat))],
      h("div", { class: "ecr-grid", "data-row": "secondary" }, d.secondaryPicks.map((p) => option(r(p.rune), p)))
    ) : null,
    d.shards.length ? section(
      "shards",
      [h("span", { class: "ecp-lead ecp-mute" }, icon("spark", 14)), h("span", { class: "ecr-tn" }, t("build.shards"))],
      h("div", { class: "ecr-grid ecr-shards", "data-row": "shards" }, d.shards.map((id) => option(r(id), null, { cls: "ecp-sm" })))
    ) : null,
    d.spells.length ? section(
      "spells",
      [h("span", { class: "ecp-lead ecp-mute" }, icon("bolt", 14)), h("span", { class: "ecr-tn" }, t("build.spells"))],
      h(
        "div",
        { class: "ecp-line ecr-grid ecr-spells", "data-row": "spells" },
        spells.map((s, i) => option(cat.spell(s.spell), s, { cls: "ecp-sq", key: keys[i] })),
        h("div", { class: "ecp-grow" }),
        actions ? spellAlts(d, cat, actions) : null
      )
    ) : null
  );
}
function runeSummary(d, cat, flashKey) {
  ensureStyle3();
  const r = (id) => cat.rune(id);
  const names = (ids) => ids.map((id) => r(id).name).join(" \xB7 ");
  const pair = buildSpellPair(d, flashKey);
  const spells = pair.ok ? [pair.spell1Id, pair.spell2Id] : d.spells.map((s) => s.spell);
  const keys = pair.ok ? ["D", "F"] : ["", ""];
  const ks = r(d.keystone.rune);
  return h(
    "div",
    { class: "ecr ecr-sum", "data-runes": "summary" },
    h(
      "div",
      { class: "ecp-line" },
      pic(ks, "ecp-ico", describe(ks, d.keystone)),
      h("span", null, h("b", null, ks.name), " \xB7 ", names(d.primaryPicks.filter(Boolean).map((p) => p.rune)))
    ),
    d.secondaryTree ? h(
      "div",
      { class: "ecp-line" },
      treeIcon(d.secondaryTree, cat),
      h("span", null, h("b", null, treeName(d.secondaryTree, cat)), ": ", names(d.secondaryPicks.map((p) => p.rune)))
    ) : null,
    h(
      "div",
      { class: "ecp-line" },
      h("span", { class: "ecp-lead ecp-mute" }, icon("spark", 14)),
      h("span", null, names(d.shards), spells.length ? " \u2014 " : "", ...spells.flatMap((id, i) => [i ? " \xB7 " : "", keys[i] ? h("span", { class: "ecr-k" }, keys[i] + " ") : "", cat.spell(id).name]))
    )
  );
}

// src/domain/draft-summary.js
var PERSPECTIVES = Object.freeze(["auto", "lane", "team"]);
var DEFAULT_PERSPECTIVE = "auto";
var COMFORT_POINTS = 1e4;
var EDGE_CLEAR = 1;
var SAMPLE_STEPS = Object.freeze({ medium: 500, high: 2e3 });
var isNum4 = (v) => typeof v === "number" && Number.isFinite(v);
var normalizePerspective = (p) => PERSPECTIVES.includes(p) ? p : DEFAULT_PERSPECTIVE;
function resolvePerspective(requested, { lane, team }) {
  const p = normalizePerspective(requested);
  if (p === "lane") return lane ? "lane" : team ? "team" : null;
  if (p === "team") return team ? "team" : lane ? "lane" : null;
  return lane ? "lane" : team ? "team" : null;
}
function sampleLevel(n) {
  if (!isNum4(n) || n <= 0) return null;
  return n >= SAMPLE_STEPS.high ? "high" : n >= SAMPLE_STEPS.medium ? "medium" : "low";
}
function laneReasons(m) {
  if (!m) return [];
  const out = [];
  if (isNum4(m.edge)) {
    const polarity = m.edge >= EDGE_CLEAR ? "positive" : m.edge <= -EDGE_CLEAR ? "negative" : "neutral";
    out.push({ type: "lane-matchup", polarity, importance: "high", evidence: "statistical", wr: m.wr, edge: m.edge, n: m.n });
    if (polarity === "neutral" && m.wr > 50) out.push({ type: "general-strength", polarity: "neutral", importance: "medium", evidence: "statistical", wr: m.wr, edge: m.edge });
  } else {
    out.push({ type: "lane-matchup", polarity: m.wr > 50 ? "positive" : m.wr < 50 ? "negative" : "neutral", importance: "high", evidence: "statistical", wr: m.wr, edge: null, n: m.n });
  }
  return out;
}
function teamReasons(p) {
  if (!p) return [];
  const out = [{ type: "team-fit", polarity: p.score >= 0 ? "positive" : "negative", importance: "high", evidence: "model", score: p.score }];
  for (const c of p.chips ?? []) {
    if (c.kind === "syn") out.push({ type: "ally-synergy", polarity: "positive", importance: "medium", evidence: "model", lane: c.lane, value: c.value });
    else if (c.kind === "ctr") out.push({ type: "enemy-counter", polarity: "positive", importance: "medium", evidence: "model", lane: c.lane, value: c.value });
    else if (c.kind === "weak") out.push({ type: "enemy-weakness", polarity: "negative", importance: "medium", evidence: "model", lane: c.lane, value: c.value });
    else if (c.kind === "scale") out.push({ type: "scaling", polarity: "positive", importance: "low", evidence: "model", phase: c.phase, value: c.value });
    else if (c.kind === "dmg") out.push({ type: "damage", polarity: "neutral", importance: "low", evidence: "model", value: c.value });
  }
  if (p.agree === "conflict") out.push({ type: "sources-disagree", polarity: "negative", importance: "medium", evidence: "heuristic" });
  return out;
}
var RANK = { high: 0, medium: 1, low: 2 };
var byImportance = (a, b) => RANK[a.importance] - RANK[b.importance];
function candidate(cid, why, { laneOf, teamOf, masteryOf }) {
  const m = laneOf(cid), p = teamOf(cid);
  const pts = masteryOf(cid);
  const all = [...laneReasons(m), ...teamReasons(p)];
  if (m && p && p.agree === "agree") all.push({ type: "both-sources", polarity: "positive", importance: "medium", evidence: "heuristic" });
  if (isNum4(pts) && pts >= COMFORT_POINTS) all.push({ type: "comfort", polarity: "positive", importance: "medium", evidence: "statistical", points: pts });
  const reasons = all.filter((r) => r.polarity !== "negative").sort(byImportance);
  const tradeoffs = all.filter((r) => r.polarity === "negative").sort(byImportance);
  const confidence = m ? { level: sampleLevel(m.n) ?? "low", evidence: "statistical", n: isNum4(m.n) ? m.n : null } : { level: "model", evidence: "model", n: isNum4(p == null ? void 0 : p.games) ? p.games : null };
  return { cid, why, reasons, tradeoffs, confidence, lane: m ?? null, team: p ?? null, mastery: isNum4(pts) ? pts : null };
}
function buildDraftSummary({ lanePicks = [], teamPicks = [], perspective = DEFAULT_PERSPECTIVE, masteryOf = () => null, maxAlternatives = 3 } = {}) {
  const requested = normalizePerspective(perspective);
  const available = { lane: lanePicks.length > 0, team: teamPicks.length > 0 };
  const resolved = resolvePerspective(requested, available);
  const out = { requested, perspective: resolved, available, primary: null, alternatives: [] };
  if (!resolved) return out;
  const laneMap = new Map(lanePicks.map((m) => [m.cid, m]));
  const teamMap = new Map(teamPicks.map((p) => [p.championId, p]));
  const ctx = { laneOf: (cid) => laneMap.get(cid) ?? null, teamOf: (cid) => teamMap.get(cid) ?? null, masteryOf: (cid) => {
    const v = masteryOf(cid);
    return isNum4(v) ? v : null;
  } };
  const own = resolved === "lane" ? lanePicks.map((m) => m.cid) : teamPicks.map((p) => p.championId);
  const other = resolved === "lane" ? teamPicks.map((p) => p.championId) : lanePicks.map((m) => m.cid);
  out.primary = candidate(own[0], "primary", ctx);
  const used = /* @__PURE__ */ new Set([own[0]]);
  const add = (cid, why) => {
    if (cid == null || used.has(cid) || out.alternatives.length >= maxAlternatives) return;
    used.add(cid);
    out.alternatives.push(candidate(cid, why, ctx));
  };
  add(other.find((c) => !used.has(c)), resolved === "lane" ? "best-team" : "best-lane");
  add(own.find((c) => !used.has(c)), resolved === "lane" ? "next-lane" : "next-team");
  const comfort = [.../* @__PURE__ */ new Set([...own, ...other])].filter((c) => !used.has(c) && (ctx.masteryOf(c) ?? 0) >= COMFORT_POINTS).sort((a, b) => ctx.masteryOf(b) - ctx.masteryOf(a))[0];
  add(comfort, "comfort");
  return out;
}

// src/domain/team-context.js
function teamSlots({ me = null, myRole = null, allies = [], enemies = [], enemyRoles: enemyRoles2 = null } = {}) {
  var _a, _b;
  const empty = (lane) => ({ lane, cid: null, status: "empty" });
  const mine = Object.fromEntries(LANES.map((l) => [l, empty(l)]));
  const theirs = Object.fromEntries(LANES.map((l) => [l, empty(l)]));
  const unplacedAllies = [], unplacedEnemies = [];
  const myLane = Number.isInteger(myRole) ? LANES[myRole] ?? null : null;
  if (myLane) mine[myLane] = { lane: myLane, cid: me && me > 0 ? me : null, status: "self" };
  for (const a of allies) {
    if (!((a == null ? void 0 : a.championId) > 0)) continue;
    const lane = laneOfPosition(a.position);
    if (lane && mine[lane].status === "empty") mine[lane] = { lane, cid: a.championId, status: "confirmed" };
    else unplacedAllies.push(a.championId);
  }
  const SOURCE = { position: "confirmed", manual: "manual", auto: "inferred" };
  for (const e of enemies) {
    if (!((e == null ? void 0 : e.championId) > 0)) continue;
    const r = (_a = enemyRoles2 == null ? void 0 : enemyRoles2.byChampion) == null ? void 0 : _a[e.championId];
    const lane = (r == null ? void 0 : r.lane) ?? laneOfPosition(e.position);
    const status = r ? SOURCE[r.source] ?? "inferred" : "confirmed";
    if (lane && ((_b = theirs[lane]) == null ? void 0 : _b.status) === "empty") theirs[lane] = { lane, cid: e.championId, status };
    else unplacedEnemies.push(e.championId);
  }
  return { allies: LANES.map((l) => mine[l]), enemies: LANES.map((l) => theirs[l]), unplacedAllies, unplacedEnemies };
}

// src/presentation/components/draft.js
var STYLE_ID5 = "draftsage-draft-style";
var CSS4 = `
.ecd{display:flex;flex-direction:column;gap:7px;padding-bottom:9px;border-bottom:1px solid var(--ds-border-soft)}
.ecd-top{display:flex;align-items:center;gap:6px}
.ecd-cap{font-size:var(--ds-fs-section);font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-gold)}
.ecd-seg{display:flex;border:1px solid var(--ds-border);border-radius:10px;overflow:hidden}
.ecd-seg button{flex:1}
.ecd-seg button{padding:1px 8px;white-space:nowrap;background:var(--ds-surface-2);border:0;border-left:1px solid var(--ds-border);color:var(--ds-meta);font:inherit;font-size:var(--ds-fs-meta);cursor:pointer}
.ecd-seg button:first-child{border-left:0}
.ecd-seg button[aria-pressed=true]{background:var(--ds-gold-bg);color:var(--ds-gold-hi)}
.ecd-seg button:disabled{opacity:.4;cursor:not-allowed}
.ecd-main{display:flex;flex-direction:column;gap:5px;padding:7px;border:1px solid var(--ds-gold-dim);border-radius:6px;background:linear-gradient(var(--ds-gold-bg),var(--ds-bg))}
.ecd-who{display:flex;align-items:center;gap:8px}
.ecd-who .ecp-ico{width:42px;height:42px;border:2px solid var(--ds-gold)}
.ecd-name{display:flex;flex-direction:column;min-width:0;flex:1}
.ecd-name b{font-size:var(--ds-fs-name);color:var(--ds-text-hi);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ecd-sub{font-size:var(--ds-fs-meta);color:var(--ds-meta)}
.ecd-rs{display:flex;flex-direction:column;gap:2px;margin:0;padding:0;list-style:none}
.ecd-r{display:flex;align-items:baseline;gap:5px;font-size:12px;line-height:1.35;color:var(--ds-text)}
.ecd-r i{font-style:normal;font-weight:bold;width:10px;flex:none;text-align:center}
.ecd-r.ecd-pos i{color:var(--ds-teal)}.ecd-r.ecd-neg i{color:var(--ds-red)}.ecd-r.ecd-neu i{color:var(--ds-meta)}
.ecd-r .ecd-rt{flex:1;min-width:0}
.ecd-ev{flex:none;padding:0 5px;border:1px solid var(--ds-border-soft);border-radius:7px;font-size:var(--ds-fs-meta);line-height:13px;color:var(--ds-mute)}
.ecd-ev[data-ev=model]{border-style:dashed}
.ecd-ev[data-ev=heuristic]{border-style:dotted}
.ecd-conf{display:inline-flex;align-items:center;gap:4px;padding:1px 6px;border:1px solid var(--ds-border-soft);border-radius:8px;font-size:var(--ds-fs-meta);color:var(--ds-meta);white-space:nowrap}
.ecd-conf[data-level=low]{border-color:var(--ds-amber);color:var(--ds-amber)}
.ecd-conf[data-level=model]{border-style:dashed}
.ecd-loc{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:3px 10px;background:var(--ds-surface-2);border:1px solid var(--ds-gold-dim);border-radius:4px;color:var(--ds-text);font:inherit;font-size:12px;cursor:pointer}
.ecd-loc:hover{border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ecd-loc.ecd-miss{border-color:var(--ds-amber);color:var(--ds-amber)}
.ecd-loc.ecd-sq{padding:3px 6px}
.ecd-alts{display:flex;flex-direction:column;gap:4px}
.ecd-alt{display:flex;align-items:center;gap:7px}
.ecd-alt .ecp-ico{width:30px;height:30px}
.ecd-alt .ecd-name b{font-size:12px}
.ecd-why{font-size:var(--ds-fs-meta);color:var(--ds-gold);letter-spacing:.02em}
.ect{display:flex;flex-direction:column;gap:3px}
.ect-row{display:flex;align-items:center;gap:6px}
.ect-lab{width:64px;flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:var(--ds-fs-meta);letter-spacing:.06em;text-transform:uppercase;color:var(--ds-mute)}
.ect-row.ect-foe .ect-lab{color:var(--ds-rival)}
.ect-slot{display:flex;flex-direction:column;align-items:center;width:30px}
.ect-slot .ecp-ico,.ect-slot .ect-void{width:24px;height:24px;border-radius:50%;box-sizing:border-box}
.ect-void{border:1px dashed var(--ds-border);background:var(--ds-bg)}
.ect-slot b{font:bold 10px/12px sans-serif;color:var(--ds-mute-2)}
.ect-slot[data-status=self] .ecp-ico{border:2px solid var(--ds-gold)}
.ect-slot[data-status=manual] .ecp-ico{border:2px solid var(--ds-gold-dim)}
.ect-slot[data-status=inferred] .ecp-ico{border:1px dashed var(--ds-meta);opacity:.85}
.ect-slot[data-status=inferred] b::after{content:'?'}
.ect-row.ect-foe .ect-slot[data-status=confirmed] .ecp-ico{border-color:var(--ds-rival)}
.ect-more{font-size:var(--ds-fs-meta);color:var(--ds-meta)}
`;
function ensureStyle4() {
  if (document.getElementById(STYLE_ID5)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID5;
  s.textContent = CSS4;
  document.head.append(s);
}
var LANE_ROLE = { TOP: 0, JUNGLE: 1, MIDDLE: 2, BOTTOM: 3, UTILITY: 4 };
var pct2 = (v) => (v >= 0 ? "+" : "") + v;
function whoAt(lane, side, ctx) {
  var _a, _b;
  const cid = (_b = (_a = ctx.meta) == null ? void 0 : _a[side]) == null ? void 0 : _b[lane];
  return cid ? ctx.cat.champion(cid).name : t("role." + LANE_ROLE[lane]);
}
function reasonText(r, ctx) {
  switch (r.type) {
    case "lane-matchup":
      return r.edge == null ? t("ds.r.laneNoBase", r.wr.toFixed(1), ctx.rival) : t("ds.r.lane", r.wr.toFixed(1), ctx.rival, signed(r.edge));
    case "general-strength":
      return t("ds.r.general");
    case "team-fit":
      return t(r.polarity === "negative" ? "ds.r.teamBad" : "ds.r.team", signed(r.score));
    case "ally-synergy":
      return t("ds.r.syn", whoAt(r.lane, "allies", ctx), pct2(r.value));
    case "enemy-counter":
      return t("ds.r.ctr", whoAt(r.lane, "enemies", ctx), pct2(r.value));
    case "enemy-weakness":
      return t("ds.r.weak", whoAt(r.lane, "enemies", ctx), pct2(r.value));
    case "scaling":
      return t("ds.r.scale", t("adv.phase." + r.phase));
    case "damage":
      return t("adv.dmg." + r.value);
    case "sources-disagree":
      return t("ds.r.disagree");
    case "both-sources":
      return t("ds.r.agree");
    case "comfort":
      return t("ds.r.comfort", r.points.toLocaleString(getLang()));
    default:
      return r.type;
  }
}
var SIGN = { positive: "+", negative: "\u2212", neutral: "\xB7" };
var CLS = { positive: "ecd-pos", negative: "ecd-neg", neutral: "ecd-neu" };
var reasonItem = (r, ctx) => h(
  "li",
  { class: "ecd-r " + CLS[r.polarity], "data-reason": r.type, "data-polarity": r.polarity },
  h("i", { "aria-hidden": "true" }, SIGN[r.polarity]),
  h("span", { class: "ecd-rt" }, reasonText(r, ctx)),
  h("span", { class: "ecd-ev", "data-ev": r.evidence, title: t("ds.ev." + r.evidence + "Tip") }, t("ds.ev." + r.evidence))
);
function confTag(c) {
  const n = c.n != null ? fmtN(c.n) : null;
  return h(
    "span",
    { class: "ecd-conf", "data-level": c.level, title: t("ds.conf." + c.level + "Tip") + (c.n != null ? " \xB7 " + t("ds.games", c.n.toLocaleString(getLang())) : "") },
    t("ds.conf." + c.level),
    n && c.level !== "model" ? " \xB7 " + n : null
  );
}
function locateButton(cid, name, actions, compact = false) {
  if (!actions.locate) return null;
  const btn = h("button", {
    type: "button",
    class: "ecd-loc" + (compact ? " ecd-sq" : ""),
    "data-locate": cid,
    "aria-label": t("ds.locateFor", name),
    title: t("ds.locateTip"),
    onclick: () => {
      if (!actions.locate(cid)) {
        btn.classList.add("ecd-miss");
        btn.title = t("nat.notInGrid");
      }
    }
  }, icon("target", 13), compact ? null : t("ds.locate"));
  return btn;
}
function primaryCard(c, ctx, actions) {
  const info = ctx.cat.champion(c.cid);
  const sources = [c.lane && "LoLalytics", c.team && "iTero"].filter(Boolean).join(" + ");
  return h(
    "div",
    { class: "ecd-main", "data-primary": c.cid },
    h(
      "div",
      { class: "ecd-who" },
      pic(info, "ecp-ico"),
      h("div", { class: "ecd-name" }, h("b", null, info.name), h("span", { class: "ecd-sub", "data-sources": sources }, sources)),
      confTag(c.confidence)
    ),
    h(
      "ul",
      { class: "ecd-rs", "aria-label": t("ds.whyFor", info.name) },
      c.reasons.slice(0, 3).map((r) => reasonItem(r, ctx)),
      c.tradeoffs.slice(0, 1).map((r) => reasonItem(r, ctx))
    ),
    h("div", { class: "ecp-line" }, locateButton(c.cid, info.name, actions))
  );
}
function altRow(c, ctx, actions) {
  const info = ctx.cat.champion(c.cid);
  const lead = c.reasons[0] ?? c.tradeoffs[0] ?? null;
  return h(
    "div",
    { class: "ecd-alt", "data-alt": c.cid, "data-why": c.why },
    pic(info, "ecp-ico"),
    h(
      "div",
      { class: "ecd-name" },
      h("b", null, info.name, " ", h("span", { class: "ecd-why" }, "\u2014 " + t("ds.why." + c.why))),
      lead ? h("span", { class: "ecd-sub", "data-reason": lead.type }, SIGN[lead.polarity] + " " + reasonText(lead, ctx)) : null
    ),
    locateButton(c.cid, info.name, actions, true)
  );
}
function draftSummaryBlock(summary, ctx, actions) {
  if (!(summary == null ? void 0 : summary.primary)) return null;
  ensureStyle4();
  const ctxT = { ...ctx, rival: ctx.rival ?? t("ds.yourRival") };
  const seg = h(
    "div",
    { class: "ecd-seg", role: "group", "aria-label": t("ds.perspective") },
    PERSPECTIVES.map((p) => {
      const off = p !== "auto" && !summary.available[p];
      return h("button", {
        type: "button",
        "data-perspective": p,
        "aria-pressed": String(summary.requested === p),
        disabled: off ? "disabled" : null,
        title: off ? t("ds.p.offTip") : t("ds.p." + p + "Tip"),
        onclick: () => actions.perspective(p)
      }, t("ds.p." + p));
    })
  );
  return h(
    "div",
    { class: "ecd", "data-draft-summary": summary.perspective },
    h(
      "div",
      { class: "ecd-top" },
      h("span", { class: "ecd-cap" }, t("ds.title")),
      h("span", { class: "ecd-sub", "data-resolved": summary.perspective, title: t("ds.p." + summary.perspective + "Tip") }, "\xB7 " + t("ds.p." + summary.perspective))
    ),
    seg,
    primaryCard(summary.primary, ctxT, actions),
    summary.alternatives.length ? h("div", { class: "ecd-alts", "data-alts": "draft" }, h("span", { class: "ecd-cap" }, t("ds.alts")), summary.alternatives.map((c) => altRow(c, ctxT, actions))) : null
  );
}
var ROLE_OF_LANE = { TOP: 0, JUNGLE: 1, MIDDLE: 2, BOTTOM: 3, UTILITY: 4 };
function teamContextBlock({ cat, context, roles }) {
  if (!context) return null;
  const s = teamSlots({ me: context.championId, myRole: context.role, allies: context.allies ?? [], enemies: context.enemies ?? [], enemyRoles: roles });
  if (![...s.allies, ...s.enemies].some((x) => x.cid && x.status !== "self") && !s.unplacedEnemies.length && !s.unplacedAllies.length) return null;
  ensureStyle4();
  const slot = (x) => {
    const lane = t("role." + ROLE_OF_LANE[x.lane]);
    const label = x.cid ? t("tc.slot", lane, cat.champion(x.cid).name, t("tc.st." + x.status)) : t("tc.empty", lane);
    return h(
      "div",
      { class: "ect-slot", "data-lane": x.lane, "data-status": x.status, "data-cid": x.cid ?? "", role: "img", "aria-label": label, title: label },
      x.cid ? pic(cat.champion(x.cid), "ecp-ico", label) : h("div", { class: "ect-void" }),
      h("b", null, t("role.s." + ROLE_OF_LANE[x.lane]))
    );
  };
  const row = (cls, lab, list, extra) => h(
    "div",
    { class: "ect-row " + cls },
    h("span", { class: "ect-lab" }, lab),
    list.map(slot),
    extra.length ? h("span", { class: "ect-more", "data-unplaced": extra.length, title: extra.map((c) => cat.champion(c).name).join(", ") }, t("tc.unplaced", extra.length)) : null
  );
  return h(
    "div",
    { class: "ect", "data-team-context": "", title: t("tc.legend") },
    row("ect-ally", t("tc.allies"), s.allies, s.unplacedAllies),
    row("ect-foe", t("tc.enemies"), s.enemies, s.unplacedEnemies)
  );
}

// src/presentation/panel.js
var STYLE_ID6 = "draftsage-panel-style";
var CSS5 = `
.ecp{position:fixed;z-index:2147483000;width:292px;box-sizing:border-box;background:linear-gradient(var(--ds-surface),var(--ds-bg) 60px);color:var(--ds-text);border:1px solid var(--ds-gold-dim);box-shadow:0 0 18px #000;font:13px/1.4 sans-serif;user-select:none;animation:ecp-in .2s ease-out;-webkit-app-region:no-drag}
.ecp *{-webkit-app-region:no-drag}
.ecp-head{display:flex;align-items:center;gap:4px;padding:6px 8px;cursor:move;border-bottom:1px solid var(--ds-border)}
.ecp-title{flex:1;display:flex;align-items:center;gap:7px;min-width:0}
.ecp-por{width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--ds-gold);background:var(--ds-surface-2);flex:none;box-sizing:border-box}
.ecp-por.ecp-foe{border-color:var(--ds-rival);width:26px;height:26px}
.ecp-vs{color:var(--ds-rival);display:flex}
.ecp-role{margin-left:2px;padding:1px 7px;border:1px solid var(--ds-border);border-radius:9px;font-size:10px;letter-spacing:.08em;color:var(--ds-meta);background:var(--ds-bg)}
.ecp-x{display:flex;align-items:center;justify-content:center;width:22px;height:22px;background:none;border:0;color:var(--ds-mute);cursor:pointer;padding:0}
.ecp-x:hover:not(:disabled){color:var(--ds-text-hi)}
.ecp-x:disabled{opacity:.3;cursor:default}
.ecp-up{transform:rotate(180deg)}
.ecp-body{padding:10px 10px 8px;display:flex;flex-direction:column;gap:9px;max-height:calc(100vh - 150px);overflow-y:auto;scrollbar-width:thin}
.ecp-stale{display:flex;flex-direction:column;gap:9px;opacity:.4;pointer-events:none;transition:opacity .15s}
.ecp-line{display:flex;align-items:center;gap:7px}
.ecp-grow{flex:1}
.ecp-tree{width:22px;height:22px;flex:none;border-radius:50%;opacity:.85;object-fit:cover}
.ecp-it{position:relative;display:flex;flex-direction:column;align-items:center;width:40px;text-align:center}
.ecp-ico{width:34px;height:34px;border-radius:50%;background:var(--ds-surface-2);border:1px solid var(--ds-border);object-fit:cover;box-sizing:border-box;transition:transform .12s}
.ecp-it:hover .ecp-ico{transform:scale(1.12);border-color:var(--ds-gold)}
.ecp-ico.ecp-big{width:44px;height:44px;border:2px solid var(--ds-gold);box-shadow:0 0 12px rgba(200,170,110,.45)}
.ecp-ico.ecp-sq{border-radius:4px}
.ecp-ico.ecp-sm{width:24px;height:24px}
.ecp-ico.ecp-xs{width:24px;height:24px}
.ecp-ico.ecp-low{opacity:.55;border-style:dashed}
.ecp.ecp-game{width:340px}
.ecp-icons{display:flex;flex-wrap:wrap;align-items:flex-start;gap:4px;flex:1;min-width:0}
.ecp-irow{align-items:flex-start}
.ecp-cell{display:flex;flex-direction:column;align-items:center;min-width:32px}
.ecp-ico.ecp-itm{width:32px;height:32px;border-radius:4px}
.ecp-cell:hover .ecp-ico.ecp-itm{transform:scale(1.12);border-color:var(--ds-gold)}
.ecp-ico.ecp-itm.ecp-core{border:2px solid var(--ds-gold);box-shadow:0 0 8px rgba(200,170,110,.35)}
.ecp-game .ecp-ico.ecp-itm{width:40px;height:40px}
.ecp-game .ecp-cell{min-width:40px}
@keyframes ecp-glow{0%,100%{box-shadow:0 0 4px rgba(10,200,185,.4)}50%{box-shadow:0 0 12px rgba(10,200,185,.9)}}
.ecp-cell{position:relative}
.ecp-cell.ecp-own .ecp-ico.ecp-itm{border-color:var(--ds-teal);box-shadow:0 0 6px rgba(10,200,185,.45)}
.ecp-badge{position:absolute;top:-4px;right:-3px;width:14px;height:14px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--ds-teal-bg);border:1px solid var(--ds-teal);color:var(--ds-teal)}
.ecp-prog{width:100%;height:3px;margin-top:2px;background:var(--ds-surface-2);border-radius:2px;overflow:hidden}
.ecp-prog i{display:block;height:100%;background:var(--ds-amber)}
.ecp-cell.ecp-afford .ecp-prog i{background:var(--ds-teal)}
.ecp-cell.ecp-afford .ecp-ico.ecp-itm{border-color:var(--ds-teal);animation:ecp-glow 1.4s ease-in-out infinite}
.ecp-miss{font-size:10px;line-height:12px;color:var(--ds-amber)}
.ecp-ready{display:flex;color:var(--ds-teal)}
.ecp-coin{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:bold;color:var(--ds-amber)}
.ecp-arrow{display:flex;align-items:center;height:32px;color:var(--ds-mute-2)}
.ecp-game .ecp-arrow{height:40px}
.ecp-items{display:flex;flex-direction:column;gap:7px}
.ecp-ihead{gap:6px}
.ecp-tier{display:flex;align-items:center;justify-content:center;width:22px;height:22px;box-sizing:border-box;border-radius:50%;border:2px solid;font:bold 11px/1 sans-serif;flex:none}
.ecp-tier-S{color:var(--ds-gold-hi);border-color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-tier-A{color:var(--ds-teal);border-color:var(--ds-teal);background:var(--ds-teal-bg)}
.ecp-tier-B{color:var(--ds-meta);border-color:var(--ds-mute-2);background:var(--ds-surface-2)}
.ecp-wr{font-size:12px;font-weight:bold;color:var(--ds-text-hi)}
.ecp-ph{display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--ds-meta)}
.ecp-w{font-size:10px;line-height:12px;color:var(--ds-meta);margin-top:1px}
.ecp-w.ecp-pos{color:var(--ds-teal)}.ecp-w.ecp-neg{color:var(--ds-red)}
.ecp-keycap{position:absolute;right:0;top:-3px;min-width:14px;padding:0 3px;box-sizing:border-box;text-align:center;font:bold 10px/14px sans-serif;color:var(--ds-text-hi);background:#3b3119;border:1px solid var(--ds-gold);border-bottom-width:2px;border-radius:3px}
.ecp-chip{padding:0;margin:0;background:none;border:2px solid transparent;border-radius:50%;cursor:pointer;line-height:0;transition:.12s}
.ecp-chip:hover{border-color:var(--ds-gold-dim)}
.ecp-chip.ecp-on{border-color:var(--ds-gold);box-shadow:0 0 8px rgba(200,170,110,.5)}
.ecp-chip .ecp-ico{width:28px;height:28px}
.ecp-lead{color:var(--ds-rival);display:flex}
.ecp-lead.ecp-mute{color:var(--ds-mute-2)}
.ecp-alts{gap:4px;margin:-2px 0}
.ecp-alt{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:36px;padding:3px 0 1px;background:none;border:1px solid transparent;border-radius:6px;cursor:pointer;line-height:0;color:var(--ds-mute);transition:.12s}
.ecp-alt:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecp-alt.ecp-on{border-color:var(--ds-gold);background:rgba(200,170,110,.08);cursor:default}
.ecp-alt[data-auto]::after{content:'';position:absolute;top:1px;right:4px;width:5px;height:5px;border-radius:50%;background:var(--ds-gold)}
.ecp-alt .ecp-w{line-height:11px;margin-top:2px}
.ecp-spalts{gap:2px}
.ecp-spalts .ecp-alt{min-width:30px;padding:3px 0}
.ecp-wr{color:var(--ds-meta)}
.ecp-tags{display:flex;flex-wrap:wrap;gap:5px}
.ecp-tag{display:flex;align-items:center;gap:4px;padding:1px 7px;border:1px solid var(--ds-border-soft);border-radius:9px;font-size:10px;color:var(--ds-mute);background:var(--ds-surface)}
.ecp-tag.ecp-gold{border-color:var(--ds-gold-dim);color:var(--ds-gold)}
.ecp-tag.ecp-warn{border-color:#8a6a1f;color:var(--ds-amber);cursor:help}
.ecp-bars{display:inline-flex;align-items:flex-end;gap:1px;height:10px}
.ecp-bars i{width:3px;background:var(--ds-border);border-radius:1px}
.ecp-bars i:nth-child(1){height:4px}.ecp-bars i:nth-child(2){height:7px}.ecp-bars i:nth-child(3){height:10px}
.ecp-lv1 .ecp-bars i.on{background:var(--ds-red)}.ecp-lv2 .ecp-bars i.on{background:var(--ds-amber)}.ecp-lv3 .ecp-bars i.on{background:var(--ds-teal)}
.ecp-lv1{border-color:#6b2a35}.ecp-lv2{border-color:#6b5420}
.ecp-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;background:var(--ds-surface-2);color:var(--ds-text);border:1px solid var(--ds-gold-dim);padding:5px 12px;cursor:pointer;font:inherit;transition:.12s}
.ecp-btn:hover:not(:disabled){border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ecp-btn:disabled{opacity:.4;cursor:default}
.ecp-apply{display:flex;gap:6px}
.ecp-apply .ecp-btn{height:32px}
.ecp-apply .ecp-main{flex:1;border-color:var(--ds-gold);color:var(--ds-text-hi);background:linear-gradient(var(--ds-gold-bg),#17130a);font-weight:bold;letter-spacing:.08em;text-transform:uppercase;font-size:12px}
.ecp-apply .ecp-sec{width:36px;padding:0}
.ecp-btn.ecp-done{border-color:var(--ds-teal);color:var(--ds-teal);background:var(--ds-teal-bg)}
.ecp-btn.ecp-done .ec-ico{animation:ecp-pop .3s ease-out}
.ecp-btn.ecp-pinned{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-btn.ecp-pinned .ec-ico{fill:currentColor;animation:ecp-pop .3s ease-out}
.ecp-spin{width:14px;height:14px;border:2px solid var(--ds-gold-dim);border-top-color:var(--ds-text-hi);border-radius:50%;animation:ecp-rot .7s linear infinite;display:inline-block}
.ecp-msg{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--ds-red);line-height:1.3}
.ecp-center{display:flex;flex-direction:column;align-items:center;gap:8px;padding:6px 0;color:var(--ds-meta);text-align:center;font-size:12px}
.ecp-pulse{color:var(--ds-gold);animation:ecp-pulse 1.4s ease-in-out infinite}
.ecp-sk{width:34px;height:34px;border-radius:50%;background:linear-gradient(90deg,var(--ds-surface-2),#2b3036,var(--ds-surface-2));background-size:200% 100%;animation:ecp-shimmer 1.2s linear infinite}
.ecp-sk.ecp-still{animation:none;opacity:.5}
.ecp-fab{position:fixed;z-index:2147483000;left:10px;bottom:10px;width:30px;height:30px;border-radius:50%;border:1px solid var(--ds-gold-dim);background:var(--ds-bg);color:var(--ds-gold);font:bold 11px sans-serif;cursor:pointer;opacity:.55;transition:.15s;-webkit-app-region:no-drag}
.ecp-fab:hover{opacity:1;box-shadow:0 0 10px rgba(200,170,110,.5)}
.ecp-adv{display:flex;flex-direction:column;gap:6px;padding-bottom:9px;border-bottom:1px solid var(--ds-border-soft)}
.ecp-dim{opacity:.4;pointer-events:none;transition:opacity .15s}
.ecp-pk{position:relative;display:flex;flex-direction:column;align-items:center;width:40px;padding:0;background:none;border:0;cursor:pointer;color:inherit;font:inherit}
.ecp-pk .ecp-ico{width:36px;height:36px}
.ecp-pk:hover .ecp-ico{transform:scale(1.08);border-color:var(--ds-gold)}
.ecp-pk.ecp-on .ecp-ico{border:2px solid var(--ds-gold);box-shadow:0 0 8px rgba(200,170,110,.45)}
.ecp-badge.ecp-bad{background:#2a2108;border-color:var(--ds-amber);color:var(--ds-amber)}
.ecp-reasons{display:flex;flex-wrap:wrap;gap:4px;min-height:22px}
.ecp-ch{display:inline-flex;align-items:center;gap:3px;padding:1px 6px 1px 4px;border:1px solid var(--ds-border-soft);border-radius:9px;font-size:11px;color:var(--ds-meta);background:var(--ds-surface);cursor:help}
.ecp-ch img{width:16px;height:16px;border-radius:50%;object-fit:cover}
.ecp-ch.ecp-pos{color:var(--ds-teal);border-color:#0b4a46}
.ecp-ch.ecp-neg{color:var(--ds-red);border-color:#6b2a35}
.ecp-foes{display:flex;flex-direction:column;gap:5px}
.ecp-foe{display:flex;flex-direction:column;align-items:center;gap:2px}
.ecp-rb{min-width:22px;height:15px;padding:0 3px;box-sizing:border-box;background:var(--ds-surface);border:1px solid var(--ds-border);border-radius:8px;color:var(--ds-mute-2);font:bold 10px/13px sans-serif;cursor:pointer;transition:.12s}
.ecp-rb:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecp-rb.ecp-src-manual{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-rb.ecp-src-position{border-color:var(--ds-mute-2);color:var(--ds-text)}
.ecp-rb.ecp-src-auto{border-style:dashed;color:var(--ds-meta)}
.ecp-rolepick{gap:4px;padding:3px 4px;background:var(--ds-surface);border:1px solid var(--ds-border-soft);border-radius:6px}
.ecp-rp{min-width:26px;height:20px;padding:0 4px;box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;background:var(--ds-surface-2);border:1px solid var(--ds-border);border-radius:4px;color:var(--ds-meta);font:bold 10px/1 sans-serif;cursor:pointer}
.ecp-rp:hover{border-color:var(--ds-gold);color:var(--ds-text-hi)}
.ecp-rp.ecp-on{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-flt{display:flex;flex-direction:column;gap:5px}
.ecp-fbtn{position:relative;display:inline-flex;align-items:center;gap:4px;padding:2px 8px;background:var(--ds-surface-2);border:1px solid var(--ds-border);border-radius:10px;color:var(--ds-meta);font:inherit;font-size:11px;cursor:pointer;transition:.12s}
.ecp-fbtn:hover{border-color:var(--ds-gold-dim);color:var(--ds-text)}
.ecp-fbtn[aria-pressed=true]{border-color:var(--ds-gold);color:var(--ds-gold-hi);background:var(--ds-gold-bg)}
.ecp-fbtn[aria-disabled=true]{opacity:.4;cursor:not-allowed}
.ecp-fbtn[data-inactive]{border-style:dashed}
.ecp-fgroup{display:flex;align-items:center;gap:4px;flex-wrap:wrap}
.ecp-fcap{width:54px;flex:none;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--ds-mute)}
.ecp-fcount{display:inline-flex;align-items:center;justify-content:center;min-width:14px;height:14px;padding:0 3px;box-sizing:border-box;border-radius:7px;background:var(--ds-gold);color:#1a1408;font:bold 10px/14px sans-serif}
.ecp-sec-t{display:flex;align-items:center;gap:6px}
.ecp-sec-t .ecp-tag{margin-left:0}
.ecp.ecp-docked{z-index:2147483200;width:340px;animation:ecp-dock .16s ease-out;box-shadow:0 10px 30px rgba(0,0,0,.85),0 0 0 1px var(--ds-bg)}
.ecp.ecp-docked .ecp-head{cursor:default}
.ecp.ecp-docked .ecp-body{max-height:var(--ecp-maxh,70vh)}
.ecp.ecp-docked.ecp-v-picks{border-top-color:var(--ds-gold)}.ecp.ecp-docked.ecp-v-build{border-bottom-color:var(--ds-gold)}
@keyframes ecp-dock{from{opacity:0;transform:translateY(var(--ecp-dy,6px)) scale(.98)}to{opacity:1;transform:none}}
@keyframes ecp-in{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:none}}
@keyframes ecp-rot{to{transform:rotate(360deg)}}
@keyframes ecp-pop{0%{transform:scale(.4)}70%{transform:scale(1.25)}100%{transform:scale(1)}}
@keyframes ecp-pulse{0%,100%{opacity:.45;transform:scale(.94)}50%{opacity:1;transform:scale(1.06)}}
@keyframes ecp-shimmer{to{background-position:-200% 0}}
`;
var NOTICE_ICONS = {
  "matchup-requires-premium": "crown",
  "matchup-low-sample": "warn",
  "filters-downgraded": "warn",
  "patch-low-sample": "warn",
  "patch-range-requires-premium": "crown",
  "spells-adjusted": "spark",
  "lola-tier-fallback": "warn",
  "source-fallback": "warn"
};
function ensureStyle5() {
  ensureTheme();
  if (document.getElementById(STYLE_ID6)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID6;
  s.textContent = CSS5;
  document.head.append(s);
}
var arrow = () => h("span", { class: "ecp-arrow" }, icon("next", 12));
function itemCell(id, cat, { stat = null, cls = "", track = null } = {}) {
  var _a;
  const info = cat.item(id);
  const hasWpa = !!stat && stat.wpa != null;
  const own = !!(track == null ? void 0 : track.owned.has(id));
  const nx = ((_a = track == null ? void 0 : track.next) == null ? void 0 : _a.item) === id ? track.next : null;
  const tip = own ? t("live.own", info.name) : nx ? t(nx.ready ? "live.ready" : "live.next", info.name, nx.missing) : hasWpa ? statTip(info.name, stat) : info.name;
  return h(
    "div",
    { class: "ecp-cell" + (own ? " ecp-own" : "") + (nx ? " ecp-next" + (nx.ready ? " ecp-afford" : "") : ""), "data-item": id, ...own && { "data-own": "" } },
    pic(info, "ecp-ico ecp-itm " + cls + (isLowData(stat) ? " ecp-low" : ""), tip),
    own && h("span", { class: "ecp-badge" }, icon("check", 9)),
    nx && h("div", { class: "ecp-prog" }, h("i", { style: `width:${Math.round(nx.progress * 100)}%` })),
    nx && (nx.ready ? h("div", { class: "ecp-ready", "data-ready": "" }, icon("check", 12)) : h("div", { class: "ecp-miss", "data-missing": nx.missing }, "\u2212" + nx.missing)),
    !nx && hasWpa && h("div", { class: "ecp-w " + (stat.wpa >= 0 ? "ecp-pos" : "ecp-neg") }, fmtWpa(stat.wpa)),
    !nx && !hasWpa && stat && Number.isFinite(stat.wr) && h("div", { class: "ecp-w ecp-wr" }, Math.round(stat.wr) + "%")
  );
}
function itemsHeader(L, live2) {
  const letter = tierLetter(L.tier);
  const wr = Number.isFinite(L.winrate) ? L.winrate : null;
  const gold = live2 ? Math.floor(live2.gold) : null;
  if (!letter && wr == null && !L.games && L.keystoneMatch && gold == null) return null;
  const tip = wr == null ? "" : t(letter ? "items.tip" : "items.tipNoTier", letter ?? "", wr.toFixed(1), L.games.toLocaleString(getLang()));
  return h(
    "div",
    { class: "ecp-line ecp-ihead", "data-row": "head", title: tip },
    letter && h("span", { class: "ecp-tier ecp-tier-" + letter }, letter),
    wr != null && h("span", { class: "ecp-wr" }, wr.toFixed(1) + "%"),
    L.games > 0 && h("span", { class: "ecp-w" }, fmtN(L.games)),
    h("div", { class: "ecp-grow" }),
    gold != null && h("span", { class: "ecp-coin", "data-gold": gold, title: t("live.gold", gold.toLocaleString(getLang())) }, icon("coin", 13), gold.toLocaleString(getLang())),
    !L.keystoneMatch && h("span", { class: "ecp-tag ecp-warn ecp-ifb", title: t("items.fallback") }, icon("warn", 11))
  );
}
var itemRow = (key2, ico, cells) => {
  const list = cells.flat().filter(Boolean);
  return list.length ? h(
    "div",
    { class: "ecp-line ecp-irow", "data-row": key2, title: t("items." + key2) },
    h("span", { class: "ecp-lead ecp-mute" }, icon(ico, 16)),
    h("div", { class: "ecp-icons" }, list)
  ) : null;
};
function itemsBlock(d, cat, { game = false, live: live2 = null } = {}) {
  const L = layoutItems(d.items, { isBoots: (id) => cat.isBoots(id), compact: !game });
  if (!hasItems(L)) return null;
  const track = game && live2 && (live2.status === "live" || live2.status === "offline" && live2.level != null) ? trackBuild(L, live2.items, live2.gold, (id) => cat.recipe(id)) : null;
  const core = [];
  L.core.forEach((id, i) => {
    if (i) core.push(arrow());
    core.push(itemCell(id, cat, { cls: "ecp-core", track }));
  });
  if (L.next.length) {
    if (core.length) core.push(arrow());
    L.next.forEach((s) => core.push(itemCell(s.item, cat, { stat: s, track })));
  }
  const stats2 = (list) => list.map((s) => itemCell(s.item, cat, { stat: s, track }));
  return h(
    "div",
    { class: "ecp-sect ecp-items", "data-items": game ? "game" : "compact" },
    itemsHeader(L, track ? live2 : null),
    itemRow("starters", "cart", L.starters.map((id) => itemCell(id, cat, { track }))),
    itemRow("early", "recall", stats2(L.early)),
    itemRow("boots", "boots", stats2(L.boots)),
    itemRow("core", "sword", core),
    itemRow("options", "swap", stats2(L.options)),
    itemRow("situational", "target", stats2(L.situational))
  );
}
function titleOf(state, cat) {
  const c = state.context;
  if (!(c == null ? void 0 : c.championId)) return "Draftsage";
  const me = cat.champion(c.championId).name;
  const rival = state.status === "ready" ? state.data.meta.opponent : c.opponentChampionId;
  const vs = rival ? ` vs ${cat.champion(rival).name}` : "";
  return `${me}${vs} \xB7 ${t("role." + c.role)}`;
}
function titleNode(state, cat) {
  const c = state.context;
  if (!(c == null ? void 0 : c.championId)) return h("div", { class: "ecp-title", title: "Draftsage" }, h("div", { class: "ecp-por ecp-ph" }, "?"));
  const rival = state.status === "ready" ? state.data.meta.opponent : c.opponentChampionId;
  const roleName = t("role." + c.role);
  return h(
    "div",
    { class: "ecp-title", title: titleOf(state, cat) },
    pic(cat.champion(c.championId), "ecp-por"),
    rival && h("span", { class: "ecp-vs" }, icon("swords", 14)),
    rival && pic(cat.champion(rival), "ecp-por ecp-foe"),
    roleName !== "role." + c.role && h("span", { class: "ecp-role" }, roleName)
  );
}
function rivalsBlock(state, cat, actions, ui, roles) {
  const c = state.context;
  const enemies = (c == null ? void 0 : c.enemies) ?? [];
  if (!enemies.length) return null;
  const used = c.opponentChampionId ?? null;
  const manual = c.enemyRoles ?? {};
  const byChampion = (roles == null ? void 0 : roles.byChampion) ?? {};
  const laneIndex = (lane) => LANES.indexOf(lane);
  const open = ui.roleOpen != null && enemies.some((e) => e.championId === ui.roleOpen) ? ui.roleOpen : null;
  const cells = enemies.map((e) => {
    const info = cat.champion(e.championId);
    const on = e.championId === used;
    const r = byChampion[e.championId] ?? null;
    const tip = r ? t("er.tip." + r.source, info.name, t("role." + laneIndex(r.lane))) : t("er.tip.none", info.name);
    return h(
      "div",
      { class: "ecp-foe", "data-foe": e.championId },
      h("button", {
        type: "button",
        class: "ecp-chip" + (on ? " ecp-on" : ""),
        title: info.name + (on ? " " + t("panel.inUse") : ""),
        onclick: () => actions.pick(on && c.opponentSource === "manual" ? null : e.championId)
      }, pic(info, "ecp-ico")),
      h("button", {
        type: "button",
        class: "ecp-rb ecp-src-" + ((r == null ? void 0 : r.source) ?? "none"),
        "data-role-of": e.championId,
        "data-lane": (r == null ? void 0 : r.lane) ?? "",
        "data-source": (r == null ? void 0 : r.source) ?? "",
        title: tip,
        onclick: () => actions.roleMenu(e.championId)
      }, r ? t("role.s." + laneIndex(r.lane)) : "\xB7")
    );
  });
  const picker = open == null ? null : h(
    "div",
    { class: "ecp-line ecp-rolepick", "data-rolepick": open, title: t("er.pickFor", cat.champion(open).name) },
    LANES.map((lane, i) => {
      var _a;
      return h("button", {
        type: "button",
        class: "ecp-rp" + (((_a = byChampion[open]) == null ? void 0 : _a.lane) === lane ? " ecp-on" : ""),
        "data-lane": lane,
        title: t("role." + i),
        onclick: () => actions.setRole(open, lane)
      }, t("role.s." + i));
    }),
    manual[open] ? h("button", { type: "button", class: "ecp-rp", "data-act": "role-reset", title: t("er.reset"), onclick: () => actions.setRole(open, null) }, icon("refresh", 11)) : null
  );
  return h(
    "div",
    { class: "ecp-foes", "data-foes": "" },
    h("div", { class: "ecp-line ecp-rivals", title: t("panel.rival") + " \xB7 " + t("er.title") }, h("span", { class: "ecp-lead" }, icon("swords", 16)), cells),
    picker
  );
}
var runesKey = (d) => JSON.stringify([d.keystone.rune, d.primaryPicks.map((p) => p == null ? void 0 : p.rune), d.secondaryPicks.map((p) => p.rune), d.shards]);
var spellsKey = (d) => JSON.stringify(d.spells.map((s) => s.spell));
function applyBlock(state, actions, ui) {
  var _a;
  const d = state.data;
  const canRunes = d.primaryPicks.length === 3 && d.secondaryPicks.length === 2 && d.shards.length === 3 && d.primaryPicks.every(Boolean);
  const canSpells = d.spells.length === 2;
  const inChampSelect = ((_a = state.context) == null ? void 0 : _a.source) === "lcu";
  const doneRunes = ui.applied.runes === runesKey(d);
  const doneSpells = canSpells && ui.applied.spells === spellsKey(d);
  const mk = (kind, ico, label, disabled, title, done, busy, cls) => h("button", {
    type: "button",
    class: `ecp-btn ${cls}` + (done ? " ecp-done" : ""),
    "data-apply": kind,
    disabled: disabled || ui.busy ? "disabled" : null,
    title,
    onclick: () => actions.apply(kind)
  }, busy ? h("span", { class: "ecp-spin" }) : icon(done ? "check" : ico, cls === "ecp-main" ? 16 : 17), label && (done ? t("apply.done") : label));
  const all = doneRunes && (doneSpells || !canSpells || !inChampSelect);
  return h(
    "div",
    { class: "ecp-sect" },
    h(
      "div",
      { class: "ecp-apply" },
      mk("all", "bolt", t("apply.btn"), !canRunes && !(canSpells && inChampSelect), t("apply.all"), all, ui.busy, "ecp-main"),
      mk("runes", "page", "", !canRunes, canRunes ? t("apply.runes") : t("apply.noRunes"), doneRunes, ui.busy && ui.kind === "runes", "ecp-sec"),
      canSpells ? mk("spells", "spark", "", !inChampSelect, inChampSelect ? t("apply.spells") : t("apply.champSelect"), doneSpells, ui.busy && ui.kind === "spells", "ecp-sec") : null,
      h("button", {
        type: "button",
        class: "ecp-btn ecp-sec" + (state.pinned ? " ecp-pinned" : ""),
        "data-act": "pin",
        "aria-pressed": String(!!state.pinned),
        title: state.pinned ? t("pin.on") : t("pin.off"),
        onclick: () => actions.pin()
      }, icon("pin", 17))
    ),
    ui.msg ? h("div", { class: "ecp-msg ecp-err" }, icon("warn", 13), ui.msg.text) : null
  );
}
function confidenceTag(sample) {
  const lv = confidenceLevel(sample);
  return h(
    "span",
    { class: "ecp-tag ecp-conf ecp-lv" + lv, "data-level": lv, title: t("conf.tip", sample.toLocaleString(getLang()), t("conf." + lv)) },
    h("span", { class: "ecp-bars" }, [1, 2, 3].map((i) => h("i", { class: i <= lv ? "on" : null }))),
    fmtN(sample)
  );
}
function tagsBlock(state) {
  var _a, _b, _c;
  const m = state.data.meta;
  const tierNames = Object.fromEntries([3, 4, 5, 6, 7].map((n) => [n, t("tier." + n)]));
  return h(
    "div",
    { class: "ecp-tags" },
    h("span", { class: "ecp-tag" + (m.patchSource === "manual" ? " ecp-gold" : ""), "data-patch-range": m.patchRange ?? 0, title: t("tag.patch") }, m.patchSpan ?? m.patch),
    h("span", { class: "ecp-tag" + (m.tierSource === "manual" ? " ecp-gold" : ""), "data-tier-source": m.tierSource ?? "lobby", title: t(m.tierSource === "manual" ? "tag.tierManual" : "tag.tier") }, tiersLabel(m.tiers, tierNames)),
    m.regionSource === "manual" && ((_a = m.regions) == null ? void 0 : _a.length) > 0 && h(
      "span",
      { class: "ecp-tag ecp-gold", "data-regions": m.regions.join(","), title: t("tag.regions", m.regions.map(regionCode).join(", ")) },
      m.regions.length <= 2 ? m.regions.map(regionCode).join(" ") : regionCode(m.regions[0]) + " +" + (m.regions.length - 1)
    ),
    m.source === "lolalytics" && h("span", { class: "ecp-tag ecp-gold", "data-source": "lolalytics", title: t("tag.lola") }, "LoLalytics"),
    confidenceTag(m.sample),
    m.matchup && h("span", { class: "ecp-tag ecp-gold ecp-tag-matchup", title: t("tag.matchup") }, icon("swords", 11)),
    ((_b = state.context) == null ? void 0 : _b.source) === "manual" && h("span", { class: "ecp-tag ecp-gold ecp-tag-sim", title: t("tag.sim") }, icon("target", 11)),
    ((_c = state.context) == null ? void 0 : _c.phase) === "game" && h("span", { class: "ecp-tag ecp-gold ecp-tag-game", title: t("items.game") }, icon("play", 11)),
    m.notices.map((n) => NOTICE_ICONS[n] ? h("span", { class: "ecp-tag ecp-warn", title: t("notice." + n) }, icon(NOTICE_ICONS[n], 11)) : null)
  );
}
var skeleton = (still = false) => [
  line(...Array.from({ length: 5 }, () => h("div", { class: "ecp-sk" + (still ? " ecp-still" : "") }))),
  line(...Array.from({ length: 2 }, () => h("div", { class: "ecp-sk" + (still ? " ecp-still" : "") })))
];
function readyBody(state, cat, actions, ui, flashKey, roles) {
  var _a;
  if (((_a = state.context) == null ? void 0 : _a.phase) === "game") return [itemsBlock(state.data, cat, { game: true, live: ui.live }), runeSummary(state.data, cat, flashKey), tagsBlock(state)];
  return [
    runePage(state.data, cat, flashKey, actions, state),
    applyBlock(state, actions, ui),
    itemsBlock(state.data, cat),
    rivalsBlock(state, cat, actions, ui, roles),
    tagsBlock(state)
  ];
}
function bodyOf(state, cat, actions, ui, flashKey, roles) {
  switch (state.status) {
    // Antes de elegir campeón ya se pueden asignar las líneas de los rivales (alimentan al consejero de draft).
    case "waiting":
      return [h("div", { class: "ecp-center", title: t("panel.pick") }, h("span", { class: "ecp-pulse" }, icon("target", 28))), ...skeleton(true), rivalsBlock(state, cat, actions, ui, roles)];
    // Mientras llega la nueva recomendación del mismo campeón se sigue viendo la anterior, atenuada y sin botones activos.
    case "loading":
      return state.stale ? [h("div", { class: "ecp-stale" }, readyBody({ ...state, status: "ready", data: state.stale }, cat, actions, ui, flashKey, roles))] : [...skeleton(), rivalsBlock(state, cat, actions, ui, roles)];
    case "needs-login":
      return [h("div", { class: "ecp-center" }, icon("user", 26), h("button", { class: "ecp-btn", type: "button", title: t("panel.login"), onclick: actions.login }, icon("user", 14), t("panel.enter")))];
    case "error": {
      const auth = state.reason === "auth";
      return [
        h(
          "div",
          { class: "ecp-center" },
          h("span", { style: "color:var(--ds-amber)" }, icon("warn", 26)),
          known("err.", state.reason),
          h("button", { class: "ecp-btn", type: "button", title: auth ? t("panel.login") : t("panel.retry"), onclick: auth ? actions.login : actions.retry }, icon(auth ? "user" : "refresh", 15))
        ),
        rivalsBlock(state, cat, actions, ui, roles)
      ];
    }
    case "ready":
      return readyBody(state, cat, actions, ui, flashKey, roles);
    default:
      return [];
  }
}
var LANE_ROLE2 = { TOP: 0, JUNGLE: 1, MIDDLE: 2, BOTTOM: 3, UTILITY: 4 };
var laneName = (l) => t("role." + LANE_ROLE2[l]);
var DMG_ICON = { ad: "sword", ap: "spark", balanced: "check" };
var CHIP_ICON = { syn: "users", ctr: "swords", weak: "swords", scale: "trend" };
function reasonChip(chip, meta, cat) {
  var _a;
  const who = chip.lane ? (_a = meta[chip.kind === "syn" ? "allies" : "enemies"]) == null ? void 0 : _a[chip.lane] : null;
  const name = who ? cat.champion(who).name : chip.lane ? laneName(chip.lane) : "";
  const v = typeof chip.value === "number" ? (chip.value >= 0 ? "+" : "") + chip.value : "";
  const tip = chip.kind === "syn" ? t("adv.syn", name, v) : chip.kind === "ctr" ? t("adv.ctr", name, v) : chip.kind === "weak" ? t("adv.weak", name, v) : chip.kind === "scale" ? t("adv.scale", t("adv.phase." + chip.phase), v) : t("adv.dmg." + chip.value);
  const neg = chip.kind === "weak";
  const pos = chip.kind === "syn" || chip.kind === "ctr" || chip.kind === "scale" || chip.value === "balanced";
  return h(
    "span",
    { class: "ecp-ch" + (neg ? " ecp-neg" : pos ? " ecp-pos" : ""), "data-chip": chip.kind, title: tip },
    who && cat.champion(who).icon ? h("img", { src: cat.champion(who).icon, alt: name, draggable: "false" }) : icon(CHIP_ICON[chip.kind] ?? DMG_ICON[chip.value] ?? "spark", 12),
    v ? h("span", null, v) : null
  );
}
var masteryTip = (mastery2, cid) => {
  const pts = mastery2 == null ? void 0 : mastery2.pointsOf(cid);
  return pts == null ? "" : " \u2014 " + t("adv.mastery", pts.toLocaleString(getLang()));
};
function pickTip(p, info, meta, cat, mastery2) {
  const parts = [t("adv.pickTip", info.name, signed(p.score), p.games.toLocaleString(getLang()))];
  if (p.matchup && meta.rival) parts.push(t("adv.vs", cat.champion(meta.rival).name, p.matchup.wr.toFixed(1), p.matchup.edge != null ? signed(p.matchup.edge) : "\u2013", p.matchup.n));
  if (p.agree) parts.push(t("adv." + p.agree));
  return parts.join(" \u2014 ") + masteryTip(mastery2, p.championId);
}
function advisorBlock(adv, cat, ui, actions, filters, mastery2) {
  var _a;
  if (!adv || adv.status === "idle") return null;
  if (adv.status === "error") {
    if (adv.reason === "no-lane" || adv.reason === "mode") return null;
    return h(
      "div",
      { class: "ecp-adv", "data-advisor": "error", "data-reason": adv.reason },
      h(
        "div",
        { class: "ecp-msg" },
        icon("warn", 13),
        known("adv.err.", adv.reason),
        adv.reason !== "limit" && h("button", { class: "ecp-x", type: "button", "data-act": "adv-retry", title: t("panel.retry"), onclick: actions.advRetry }, icon("refresh", 14))
      )
    );
  }
  const d = adv.data;
  if (!d) return h("div", { class: "ecp-adv", "data-advisor": "loading" }, line(h("span", { class: "ecp-lead" }, icon("spark", 16)), ...Array.from({ length: 5 }, () => h("div", { class: "ecp-sk" }))));
  const m = d.meta;
  const picks = filters ? filters.draftPicks() : d.picks;
  const sel = picks.find((p) => p.championId === ui.advSel) ?? picks[0];
  const mst = mastery2 == null ? void 0 : mastery2.getState();
  const tags = h(
    "div",
    { class: "ecp-tags" },
    h("span", { class: "ecp-tag ecp-gold", "data-source": "itero", title: t("adv.tagTip") }, t("adv.tag")),
    m.contrasted && h("span", { class: "ecp-tag", "data-contrast": "", title: t("adv.tagLola") }, "LoLalytics"),
    m.mastery && h("span", { class: "ecp-tag ecp-gold", "data-mastery": "on", title: t("adv.masteryOn") }, icon("user", 11)),
    !m.mastery && (mst == null ? void 0 : mst.status) === "error" && h("span", { class: "ecp-tag ecp-warn", "data-mastery": "error", title: t("adv.masteryErr", known("mastery.err.", mst.reason)) }, icon("user", 11), icon("warn", 11)),
    ((_a = m.unrecognized) == null ? void 0 : _a.length) ? h("span", { class: "ecp-tag ecp-warn", "data-warn": "names", title: t("adv.unrecognized") }, icon("warn", 11)) : null,
    m.sideKnown ? null : h("span", { class: "ecp-tag ecp-warn", "data-warn": "side", title: t("adv.sideAssumed") }, icon("warn", 11))
  );
  const cell = (p) => {
    const info = cat.champion(p.championId);
    return h(
      "button",
      {
        type: "button",
        class: "ecp-pk" + (p.championId === (sel == null ? void 0 : sel.championId) ? " ecp-on" : ""),
        "data-pick": p.championId,
        "data-agree": p.agree,
        title: pickTip(p, info, m, cat, mastery2),
        onclick: () => actions.advSelect(p.championId)
      },
      pic(info, "ecp-ico"),
      p.agree ? h("span", { class: "ecp-badge" + (p.agree === "conflict" ? " ecp-bad" : "") }, icon(p.agree === "agree" ? "check" : "warn", 9)) : null,
      h("div", { class: "ecp-w " + (p.score >= 0 ? "ecp-pos" : "ecp-neg") }, signed(p.score))
    );
  };
  return h(
    "div",
    { class: "ecp-adv" + (adv.status === "loading" ? " ecp-dim" : ""), "data-advisor": adv.status },
    picks.length ? [
      line(h("span", { class: "ecp-lead", title: t("adv.tagTip") }, icon("spark", 16)), ...picks.map(cell)),
      h("div", { class: "ecp-reasons", "data-reasons": sel.championId }, sel.chips.map((c) => reasonChip(c, m, cat)))
    ] : h("div", { class: "ecp-msg", style: "color:var(--ds-meta)", "data-advisor-empty": "" }, t("adv.none")),
    tags
  );
}
function matchupBlock(ov, cat, filters, mastery2) {
  const d = ov == null ? void 0 : ov.data;
  if (!d) return null;
  if (!d.rival) {
    return h(
      "div",
      { class: "ecp-adv ecp-mu", "data-matchup": "norival" },
      line(h("span", { class: "ecp-lead ecp-mute", title: t("mu.noRival") }, icon("swords", 16)), h("span", { class: "ecp-msg", style: "color:var(--ds-mute)" }, t("mu.noRivalShort")))
    );
  }
  const picks = filters ? filters.matchupPicks() : d.counters.map((c) => ({ cid: c.cid, wr: c.wr, edge: c.edge, n: c.n, counter: null }));
  const rivalName = cat.champion(d.rival).name;
  const cell = (c) => {
    const info = cat.champion(c.cid);
    return h(
      "div",
      { class: "ecp-pk", "data-mu-pick": c.cid, title: t("mu.pickTip", info.name, c.wr.toFixed(1), rivalName, c.edge != null ? signed(c.edge) : "\u2013", c.n) + masteryTip(mastery2, c.cid) },
      pic(info, "ecp-ico"),
      h("div", { class: "ecp-w " + (c.edge == null || c.edge >= 0 ? "ecp-pos" : "ecp-neg") }, c.wr.toFixed(0) + "%"),
      // Ventaja sobre su media en la línea (spec §2.1): un % alto con ventaja ~0 es fuerza general, no un counter.
      c.edge != null && h("div", { class: "ecp-w", "data-edge": c.edge, style: "color:var(--ds-meta)" }, signed(c.edge))
    );
  };
  return h(
    "div",
    { class: "ecp-adv ecp-mu" + (ov.status === "loading" ? " ecp-dim" : ""), "data-matchup": String(d.rival), title: t("mu.tip", rivalName) },
    picks.length ? line(h("span", { class: "ecp-lead", title: t("mu.tip", rivalName) }, icon("swords", 16)), ...picks.map(cell)) : h("div", { class: "ecp-msg", style: "color:var(--ds-meta)", "data-matchup-empty": "" }, icon("swords", 13), t("mu.none")),
    h(
      "div",
      { class: "ecp-tags" },
      h("span", { class: "ecp-tag ecp-gold", "data-source": "lolalytics-mu", title: t("mu.tagTip", rivalName) }, t("mu.tag")),
      d.vsReason ? h("span", { class: "ecp-tag ecp-warn", title: t("mu.vsReason") }, icon("warn", 11)) : null
    )
  );
}
var FILTER_GROUPS = [
  { key: "mastery", steps: MASTERY_STEPS, off: "flt.off.mastery", src: "mastery" },
  { key: "matchup", steps: MATCHUP_STEPS, off: "flt.off.matchup", src: "matchup" },
  { key: "meta", steps: META_STEPS, off: "flt.off.meta", src: "meta" },
  { key: "phase", steps: PHASE_STEPS, off: "flt.off.itero", src: "itero" },
  { key: "damage", steps: DAMAGE_STEPS, off: "flt.off.itero", src: "itero" }
];
function filtersBlock(filters, ui, actions) {
  if (!filters) return null;
  const f = filters.get();
  const avail = filters.availability();
  const n = filters.activeCount();
  const head = line(
    h(
      "button",
      { type: "button", class: "ecp-fbtn", "data-act": "filters-toggle", "aria-pressed": String(!!ui.filtersOpen), title: n ? t("flt.active", n) : t("flt.title"), onclick: actions.filtersToggle },
      icon("target", 12),
      t("flt.btn"),
      n > 0 && h("span", { class: "ecp-fcount", "data-count": n }, n)
    ),
    n > 0 && h("button", { type: "button", class: "ecp-fbtn", "data-act": "filters-reset", title: t("flt.reset"), onclick: actions.filtersReset }, icon("close", 11))
  );
  if (!ui.filtersOpen) return h("div", { class: "ecp-flt", "data-filters": "closed" }, head);
  const btn = (key2, value, label, pressed, disabled, tip) => h("button", {
    type: "button",
    class: "ecp-fbtn",
    "data-flt": key2,
    "data-value": value,
    "aria-pressed": String(pressed),
    "aria-disabled": disabled ? "true" : null,
    "data-inactive": pressed && disabled ? "" : null,
    title: tip,
    onclick: () => actions.filterSet(key2, value, disabled)
  }, label);
  const classes = h(
    "div",
    { class: "ecp-fgroup", "data-group": "classes" },
    h("span", { class: "ecp-fcap" }, t("flt.class")),
    CLASSES.map((c) => btn("classes", c, t("flt.class." + c), f.classes.includes(c), false, t("flt.class." + c)))
  );
  const groups = FILTER_GROUPS.map((g) => {
    const ok = evaluable(g.key, avail);
    return h(
      "div",
      { class: "ecp-fgroup", "data-group": g.key },
      h("span", { class: "ecp-fcap", title: ok ? "" : t(g.off) }, t("flt." + g.key)),
      g.steps.map((v) => btn(
        g.key,
        v,
        v === "any" ? t("flt.any") : t("flt." + g.key + "." + v),
        f[g.key] === v,
        !ok && v !== "any",
        !ok && v !== "any" ? t(g.off) : g.key === "mastery" && v !== "any" ? t("flt.mastery.tip", MASTERY_POINTS[v].toLocaleString(getLang())) : t("flt.tip." + v)
      ))
    );
  });
  return h("div", { class: "ecp-flt", "data-filters": "open" }, head, classes, ...groups);
}
function webUrl(state, cat) {
  var _a, _b, _c, _d;
  const c = state.context;
  if (!(c == null ? void 0 : c.championId)) return null;
  const rival = c.opponentChampionId ?? ((_b = (_a = state.data) == null ? void 0 : _a.meta) == null ? void 0 : _b.opponent) ?? null;
  if (((_d = (_c = state.data) == null ? void 0 : _c.meta) == null ? void 0 : _d.source) === "lolalytics") return lolalyticsUrl({ champion: championSlug(cat.champion(c.championId)), lane: laneOfRole2(c.role), opponent: rival ? championSlug(cat.champion(rival)) : null });
  return buildsUrl({ champion: championSlug(cat.champion(c.championId)), role: c.role, opponent: rival ? championSlug(cat.champion(rival)) : null });
}
async function mountPanel({ controller: controller2, catalog: catalog2, applier: applier2, live: live2, overlay: overlay2, advisor: advisor2, enemyRoles: enemyRoles2, filters, mastery: mastery2, onEnableApply, onLogin, onMenu }) {
  await whenReady();
  ensureStyle5();
  let lastHidden = null;
  let dismissedKey = null;
  const keyOf = (st) => st.context ? `${st.context.championId}|${st.context.opponentChampionId ?? 0}|${st.context.source ?? ""}|${st.context.phase ?? ""}` : null;
  let prefs = getPanelPrefs();
  const ui = { busy: false, kind: null, msg: null, applied: { runes: null, spells: null }, live: null, advSel: null, roleOpen: null, filtersOpen: prefs.filtersOpen === true };
  let uiKey = null;
  let locator = null;
  const dock = { on: false, view: null, anchor: null, raf: 0, placed: "" };
  const listeners = /* @__PURE__ */ new Set();
  const root = h("div", { class: "ecp", style: "display:none" });
  const fab = h("button", { class: "ecp-fab", type: "button", title: "Draftsage (Ctrl+Shift+E)", onclick: () => reopen() || onMenu() }, "DS");
  const reopen = () => {
    if (dismissedKey === null) return false;
    dismissedKey = null;
    render(controller2.getState());
    return true;
  };
  const attach = () => {
    if (!document.body) return;
    if (!root.isConnected) document.body.append(root);
    if (!fab.isConnected) document.body.append(fab);
    if (!probe.isConnected) document.body.append(probe);
  };
  const place = () => {
    const maxX = Math.max(0, window.innerWidth - 60);
    const maxY = Math.max(0, window.innerHeight - 40);
    root.style.right = prefs.x == null ? "16px" : "auto";
    root.style.left = prefs.x == null ? "auto" : Math.min(Math.max(0, prefs.x), maxX) + "px";
    root.style.top = Math.min(Math.max(0, prefs.y ?? 96), maxY) + "px";
  };
  const actions = {
    login: () => onLogin(),
    retry: () => controller2.refresh(),
    pick: (id) => controller2.setOpponent(id),
    keystone: (rune) => controller2.setKeystone(rune),
    spells: (pair) => controller2.setSpells(pair),
    pin: () => controller2.togglePin(),
    web: () => {
      const url = webUrl(controller2.getState(), catalog2);
      if (url) openExternal(url);
    },
    apply: (kind) => apply(kind),
    advSelect: (id) => {
      ui.advSel = id;
      render(controller2.getState());
    },
    advRetry: () => advisor2 == null ? void 0 : advisor2.refresh(),
    // Línea de un rival: abrir/cerrar su selector y elegirla (null = volver a la automática).
    roleMenu: (cid) => {
      ui.roleOpen = ui.roleOpen === cid ? null : cid;
      render(controller2.getState());
    },
    setRole: (cid, lane) => {
      ui.roleOpen = null;
      controller2.setEnemyRole(cid, lane);
      render(controller2.getState());
    },
    // Filtros de la selección. Un filtro sin fuente de datos no se puede activar (sí quitar).
    filtersToggle: () => {
      ui.filtersOpen = !ui.filtersOpen;
      prefs = setPanelPrefs({ filtersOpen: ui.filtersOpen });
      render(controller2.getState());
    },
    filtersReset: () => filters == null ? void 0 : filters.reset(),
    // Recomendación principal: cambiar de perspectiva (auto / línea / equipo) y localizar una ficha.
    perspective: (p) => {
      prefs = setPanelPrefs({ perspective: p });
      render(controller2.getState());
    },
    filterSet: (key2, value, disabled) => {
      if (!filters || disabled) return;
      if (key2 === "classes") filters.toggleClass(value);
      else filters.set({ [key2]: filters.get()[key2] === value ? "any" : value });
    }
  };
  const applyStatus = (state) => {
    var _a;
    const d = state.status === "ready" ? state.data : null;
    const doneRunes = !!d && ui.applied.runes === runesKey(d);
    const doneSpells = !!d && d.spells.length === 2 && ui.applied.spells === spellsKey(d);
    const inChampSelect = ((_a = state.context) == null ? void 0 : _a.source) === "lcu";
    return { busy: ui.busy, kind: ui.kind, done: !!d && doneRunes && (doneSpells || d.spells.length !== 2 || !inChampSelect), failed: !!ui.msg };
  };
  const probe = h("div", { style: "position:fixed;left:0;top:0;width:100px;height:1px;visibility:hidden;pointer-events:none" });
  const scaleOf = () => {
    const w = probe.isConnected ? probe.getBoundingClientRect().width : 0;
    return w > 0 ? w / 100 : 1;
  };
  const placeDocked = () => {
    const a = dock.anchor;
    if (!(a == null ? void 0 : a.isConnected)) return false;
    const r = a.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    const s = scaleOf() || 1;
    const vw = window.innerWidth / s, vh = window.innerHeight / s;
    const below = dock.view === "picks";
    const left = Math.round(Math.min(Math.max(8, r.left / s), Math.max(8, vw - 340 - 8)));
    const avail = Math.max(160, Math.floor(below ? vh - r.bottom / s - 16 : r.top / s - 16));
    const edge = below ? Math.round(r.bottom / s + 8) : Math.round(vh - r.top / s + 8);
    const key2 = `${left}|${below}|${edge}|${avail}`;
    if (key2 === dock.placed) return true;
    dock.placed = key2;
    root.style.left = left + "px";
    root.style.right = "auto";
    root.style.top = below ? edge + "px" : "auto";
    root.style.bottom = below ? "auto" : edge + "px";
    root.style.setProperty("--ecp-maxh", Math.max(120, avail - 52) + "px");
    root.style.setProperty("--ecp-dy", below ? "-6px" : "6px");
    return true;
  };
  const followAnchor = () => {
    cancelAnimationFrame(dock.raf);
    const loop = () => {
      if (!dock.view) return;
      if (!placeDocked()) closeDock();
      else dock.raf = requestAnimationFrame(loop);
    };
    dock.raf = requestAnimationFrame(loop);
  };
  const onDocDown = (e) => {
    var _a, _b, _c;
    if (!dock.view || root.contains(e.target) || ((_a = dock.anchor) == null ? void 0 : _a.contains(e.target)) || ((_c = (_b = e.target).closest) == null ? void 0 : _c.call(_b, ".ecx, .ec-overlay"))) return;
    closeDock();
  };
  const onDocKey = (e) => {
    if (e.key === "Escape" && dock.view) {
      closeDock();
      e.stopPropagation();
    }
  };
  function closeDock(redraw = true) {
    if (!dock.view && !dock.anchor) return;
    dock.view = null;
    dock.anchor = null;
    dock.placed = "";
    cancelAnimationFrame(dock.raf);
    document.removeEventListener("mousedown", onDocDown, true);
    document.removeEventListener("keydown", onDocKey, true);
    if (redraw) render(controller2.getState());
  }
  function openDock(view, anchor) {
    if (!dock.on || !anchor) return false;
    const switching = dock.view !== view;
    dock.view = view;
    dock.anchor = anchor;
    dock.placed = "";
    document.removeEventListener("mousedown", onDocDown, true);
    document.removeEventListener("keydown", onDocKey, true);
    document.addEventListener("mousedown", onDocDown, true);
    document.addEventListener("keydown", onDocKey, true);
    if (switching) root.style.animation = "none";
    render(controller2.getState());
    if (switching) {
      void root.offsetWidth;
      root.style.animation = "";
    }
    followAnchor();
    return true;
  }
  const render = (state) => {
    renderPanel(state);
    for (const fn of listeners) {
      try {
        fn();
      } catch (e) {
        log.warn("suscriptor del panel:", String(e));
      }
    }
  };
  const renderPanel = (state) => {
    var _a, _b, _c, _d;
    attach();
    if (state.status === "idle") {
      dismissedKey = null;
      ui.roleOpen = null;
      if (dock.view) closeDock(false);
    }
    fab.style.display = dock.on ? "none" : "";
    const docked = dock.on && ((_a = state.context) == null ? void 0 : _a.phase) !== "game";
    const show2 = docked ? prefs.enabled && !!dock.view && state.status !== "idle" : prefs.enabled && dismissedKey !== keyOf(state) && state.status !== "idle";
    root.style.display = show2 ? "block" : "none";
    if (!show2) {
      if (!docked && state.status !== "idle" && state.status !== lastHidden) log.info("panel oculto", prefs.enabled ? "(cerrado con \xD7)" : "(desactivado: men\xFA \u2192 \xABPanel\xBB)");
      lastHidden = state.status;
      return;
    }
    lastHidden = null;
    const view = docked ? dock.view : "all";
    root.classList.toggle("ecp-game", ((_b = state.context) == null ? void 0 : _b.phase) === "game");
    root.classList.toggle("ecp-docked", docked);
    root.classList.toggle("ecp-v-picks", docked && view === "picks");
    root.classList.toggle("ecp-v-build", docked && view === "build");
    if (docked) placeDocked();
    else {
      root.style.removeProperty("bottom");
      root.style.removeProperty("--ecp-maxh");
      dock.placed = "";
      place();
    }
    const toggle = () => {
      prefs = setPanelPrefs({ collapsed: !prefs.collapsed });
      render(controller2.getState());
    };
    const url = webUrl(state, catalog2);
    const head = h(
      "div",
      { class: "ecp-head" },
      titleNode(state, catalog2),
      ((_c = state.context) == null ? void 0 : _c.championId) ? h("button", { class: "ecp-x", type: "button", "data-act": "web", title: t("panel.web"), disabled: url ? null : "disabled", onclick: actions.web }, icon("link", 14)) : null,
      docked ? null : h("button", { class: "ecp-x", type: "button", title: prefs.collapsed ? t("panel.unfold") : t("panel.fold"), onclick: toggle }, icon("chevron", 15, prefs.collapsed ? "" : "ecp-up")),
      h("button", {
        class: "ecp-x",
        type: "button",
        "data-act": "close",
        title: docked ? t("nat.close") : t("panel.close"),
        onclick: () => {
          if (docked) closeDock();
          else {
            dismissedKey = keyOf(controller2.getState());
            render(controller2.getState());
          }
        }
      }, icon("close", 14))
    );
    if (!docked) enableDrag(head);
    if (state.status !== "ready" || runesKey(state.data) !== uiKey) {
      ui.msg = null;
      uiKey = state.status === "ready" ? runesKey(state.data) : null;
    }
    ui.live = (live2 == null ? void 0 : live2.getState()) ?? null;
    const inGame = ((_d = state.context) == null ? void 0 : _d.phase) === "game";
    const picksTop = inGame || view === "build" ? [] : [decisionBlock(), teamContextBlock({ cat: catalog2, context: state.context, roles: enemyRoles2 == null ? void 0 : enemyRoles2.getState() }), filtersBlock(filters, ui, actions), matchupBlock(overlay2 == null ? void 0 : overlay2.getState(), catalog2, filters, mastery2), advisorBlock(advisor2 == null ? void 0 : advisor2.getState(), catalog2, ui, actions, filters, mastery2)];
    const main = view === "picks" ? [rivalsBlock(state, catalog2, actions, ui, enemyRoles2 == null ? void 0 : enemyRoles2.getState())] : bodyOf(state, catalog2, actions, ui, applier2.getSettings().flashKey, enemyRoles2 == null ? void 0 : enemyRoles2.getState());
    const body = !docked && prefs.collapsed ? null : h("div", { class: "ecp-body", "data-view": view }, [...picksTop, ...main]);
    root.replaceChildren(head, ...body ? [body] : []);
  };
  function decisionBlock() {
    var _a, _b;
    if (!filters) return null;
    const ov = overlay2 == null ? void 0 : overlay2.getState(), adv = advisor2 == null ? void 0 : advisor2.getState();
    const summary = buildDraftSummary({ lanePicks: filters.matchupPicks(), teamPicks: filters.draftPicks(), perspective: prefs.perspective, masteryOf: (cid) => (mastery2 == null ? void 0 : mastery2.pointsOf(cid)) ?? null });
    return draftSummaryBlock(
      summary,
      { cat: catalog2, rival: ((_a = ov == null ? void 0 : ov.data) == null ? void 0 : _a.rival) ? catalog2.champion(ov.data.rival).name : null, meta: ((_b = adv == null ? void 0 : adv.data) == null ? void 0 : _b.meta) ?? null },
      { perspective: actions.perspective, locate: locator }
    );
  }
  async function apply(kind) {
    var _a;
    const st = controller2.getState();
    if (st.status !== "ready" || ui.busy || ((_a = st.context) == null ? void 0 : _a.phase) === "game") return;
    if (!applier2.canApply() && !await onEnableApply()) return;
    const d = st.data;
    const names = { champion: catalog2.champion(st.context.championId).name, opponent: d.meta.opponent ? catalog2.champion(d.meta.opponent).name : null };
    ui.busy = true;
    ui.kind = kind;
    ui.msg = null;
    render(controller2.getState());
    const problems = [];
    if (kind !== "spells") {
      const r = await applier2.applyRunes(d, names);
      if (r.ok) {
        ui.applied.runes = runesKey(d);
        if (!r.verified) problems.push(t("apply.probRunes", t("apply.unconfirmed")));
      } else problems.push(t("apply.probRunes", known("applyErr.", r.reason)));
    }
    if (kind !== "runes" && d.spells.length === 2 && (kind === "spells" || st.context.source === "lcu")) {
      const r = await applier2.applySpells(d);
      if (r.ok) ui.applied.spells = spellsKey(d);
      else problems.push(t("apply.probSpells", known("applyErr.", r.reason)));
    }
    ui.busy = false;
    ui.kind = null;
    ui.msg = problems.length ? { text: problems.join(" \xB7 ") } : null;
    render(controller2.getState());
  }
  function enableDrag(head) {
    head.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) return;
      const r = root.getBoundingClientRect();
      const dx = e.clientX - r.left;
      const dy = e.clientY - r.top;
      const move = (ev) => {
        const x = Math.max(0, Math.min(window.innerWidth - 60, ev.clientX - dx));
        const y = Math.max(0, Math.min(window.innerHeight - 40, ev.clientY - dy));
        prefs = { ...prefs, x, y };
        place();
      };
      const up = () => {
        removeEventListener("mousemove", move);
        removeEventListener("mouseup", up);
        setPanelPrefs({ x: prefs.x, y: prefs.y });
      };
      addEventListener("mousemove", move);
      addEventListener("mouseup", up);
      e.preventDefault();
    });
  }
  const guard = setInterval(attach, 5e3);
  const onPrefs = () => {
    prefs = getPanelPrefs();
    render(controller2.getState());
  };
  addEventListener("draftsage:prefs", onPrefs);
  const onShow = () => {
    dismissedKey = null;
    render(controller2.getState());
  };
  addEventListener("draftsage:show-panel", onShow);
  const onKey = (e) => {
    if (!e.ctrlKey || !e.shiftKey) return;
    if (e.key === "E" || e.key === "e") {
      e.preventDefault();
      onMenu();
    } else if (e.key === "A" || e.key === "a") {
      e.preventDefault();
      apply("all");
    }
  };
  addEventListener("keydown", onKey);
  catalog2.load().then(() => render(controller2.getState())).catch((e) => log.warn("cat\xE1logo:", String(e)));
  const off = controller2.subscribe(render);
  const offLive = live2 == null ? void 0 : live2.subscribe(() => render(controller2.getState()));
  const offOv = overlay2 == null ? void 0 : overlay2.subscribe(() => render(controller2.getState()));
  const offAdv = advisor2 == null ? void 0 : advisor2.subscribe(() => render(controller2.getState()));
  const offRoles = enemyRoles2 == null ? void 0 : enemyRoles2.subscribe(() => render(controller2.getState()));
  const offFlt = filters == null ? void 0 : filters.subscribe(() => render(controller2.getState()));
  const offMst = mastery2 == null ? void 0 : mastery2.subscribe(() => render(controller2.getState()));
  attach();
  return {
    destroy() {
      closeDock(false);
      off();
      offLive == null ? void 0 : offLive();
      offOv == null ? void 0 : offOv();
      offAdv == null ? void 0 : offAdv();
      offRoles == null ? void 0 : offRoles();
      offFlt == null ? void 0 : offFlt();
      offMst == null ? void 0 : offMst();
      clearInterval(guard);
      listeners.clear();
      removeEventListener("keydown", onKey);
      removeEventListener("draftsage:prefs", onPrefs);
      removeEventListener("draftsage:show-panel", onShow);
      root.remove();
      fab.remove();
      probe.remove();
    },
    // ---- Interfaz integrada (la usa presentation/native.js) ----
    /** Activa/desactiva el modo anclado. Al desactivarlo se cierra el popover y vuelve el panel flotante. */
    setDocked(on) {
      on = !!on;
      if (dock.on === on) return;
      dock.on = on;
      if (!on) closeDock(false);
      render(controller2.getState());
    },
    isDocked: () => dock.on,
    /** Abre la vista ('build' | 'picks') colgada de `anchor`; false si el modo anclado no está activo. */
    open: (view, anchor) => openDock(view, anchor),
    close: () => closeDock(),
    /** Abre la vista o, si ya está abierta con ese ancla, la cierra. */
    toggle(view, anchor) {
      if (dock.view === view && dock.anchor === anchor) {
        closeDock();
        return false;
      }
      return openDock(view, anchor);
    },
    view: () => dock.view,
    /** 'all' | 'runes' | 'spells': igual que el botón «Aplicar» del panel (pide aceptar el aviso la primera vez). */
    apply: (kind = "all") => apply(kind),
    /** { busy, kind, done, failed } del botón de aplicar para lo que se ve ahora. */
    status: () => applyStatus(controller2.getState()),
    /** native.js da la forma de localizar una ficha de la cuadrícula: (cid) => boolean. */
    setLocator(fn) {
      locator = typeof fn === "function" ? fn : null;
      render(controller2.getState());
    },
    /** Se llama tras cada repintado del panel (aunque esté oculto). Devuelve la función para cancelar. */
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
}

// src/presentation/overlay.js
var STYLE_ID7 = "draftsage-overlay-style";
var ICON_RE = /champion-icons\/(\d+)\.(?:png|jpg|webp)/i;
var MIN_GRID = 20;
var CSS6 = `
.ecb-layer{position:fixed;inset:0;z-index:2147483000;pointer-events:none}
.ecb{position:fixed;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:2px;padding:0 3px;height:14px;min-width:30px;border-radius:2px;background:rgba(1,10,19,.88);border:1px solid var(--ds-border);color:var(--ds-text);font:bold 10px/12px sans-serif;white-space:nowrap}
.ecb-up{color:var(--ds-teal)}.ecb-down{color:var(--ds-red)}
.ecb-low{opacity:.6;font-style:italic}
.ecb-top{border-color:var(--ds-teal);box-shadow:0 0 6px rgba(10,200,185,.6);color:var(--ds-text-hi)}
.ecb-top b{color:var(--ds-teal)}
.ecb-rival{border-color:var(--ds-red);box-shadow:0 0 6px rgba(232,64,87,.6)}
.ecb-veil{position:fixed;box-sizing:border-box;background:rgba(1,10,19,.72);-webkit-backdrop-filter:grayscale(1);backdrop-filter:grayscale(1)}
`;
var fmt = (x) => typeof x === "number" ? x.toFixed(1) : "\u2013";
var sign = (x) => (x >= 0 ? "+" : "") + x.toFixed(1);
function ensureStyle6() {
  ensureTheme();
  if (document.getElementById(STYLE_ID7)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID7;
  s.textContent = CSS6;
  document.head.append(s);
}
var championIdOf = (el) => {
  var _a;
  const img = el.tagName === "IMG" ? el : (_a = el.querySelector) == null ? void 0 : _a.call(el, "img");
  const m = ICON_RE.exec((img == null ? void 0 : img.getAttribute("src")) ?? (img == null ? void 0 : img.src) ?? "");
  return m ? Number(m[1]) : null;
};
function findGrid(root = document, minCount = MIN_GRID) {
  const imgs = [...root.querySelectorAll("img")].filter((i) => ICON_RE.test(i.getAttribute("src") ?? ""));
  const count = /* @__PURE__ */ new Map();
  for (const img of imgs) for (let a = img.parentElement; a; a = a.parentElement) count.set(a, (count.get(a) ?? 0) + 1);
  let best = null;
  for (const [el, n] of count) if (n >= minCount && (!best || best.contains(el))) best = el;
  return best ? { grid: best, imgs: imgs.filter((i) => best.contains(i)) } : null;
}
function nativeTiles(root = document) {
  return [...root.querySelectorAll(".grid-champion[data-id]")].map((el) => ({ el, id: Number(el.getAttribute("data-id")) })).filter((x) => x.id > 0 && !x.el.classList.contains("grid-champion-banned"));
}
function findTiles(selector = "", root = document) {
  if (selector) {
    try {
      return [...root.querySelectorAll(selector)].map((el) => ({ el, id: championIdOf(el) })).filter((x) => x.id);
    } catch {
      return [];
    }
  }
  const native = nativeTiles(root);
  if (native.length) return native;
  const g = findGrid(root);
  return g ? g.imgs.map((el) => ({ el, id: championIdOf(el) })).filter((x) => x.id) : [];
}
function probeGrid(root = document) {
  const all = [...root.querySelectorAll("img")].filter((i) => ICON_RE.test(i.getAttribute("src") ?? ""));
  const g = findGrid(root);
  const nativas = root.querySelectorAll(".grid-champion[data-id]").length;
  const path = (el) => {
    var _a;
    const p = [];
    for (let a = el; a && p.length < 6; a = a.parentElement) p.push(a.tagName.toLowerCase() + (((_a = a.classList) == null ? void 0 : _a[0]) ? "." + a.classList[0] : ""));
    return p.join(" < ");
  };
  const r = { fichasNativas: nativas, imagenesDeCampeon: all.length, cuadricula: g ? { casillas: g.imgs.length, ruta: path(g.grid) } : null, ejemplo: all[0] ? { src: (all[0].getAttribute("src") ?? "").slice(-60), ruta: path(all[0]) } : null };
  log.info("overlayProbe", JSON.stringify(r));
  return r;
}
function tipOf(name, c) {
  const lines = [name];
  if (c) {
    lines.push(t("ov.wr", fmt(c.wr), c.grade ?? "\u2013"));
    if (c.pr != null) lines.push(t("ov.pr", fmt(c.pr)));
    if (c.vs) lines.push(t(c.vs.low ? "ov.vsLow" : "ov.vs", fmt(c.vs.wr), c.vs.edge != null ? sign(c.vs.edge) : "\u2013", c.vs.n));
    if (c.counter) lines.push(t("ov.counter", c.counter));
  }
  return lines.join("\n");
}
function badgeOf(c, rival) {
  var _a;
  if (!c) return null;
  const vs = c.vs && !c.vs.low ? c.vs : null;
  const value = vs ? vs.wr : c.wr;
  if (typeof value !== "number") return null;
  const cls = ["ecb"];
  if (vs && vs.edge != null) cls.push(vs.edge >= 0 ? "ecb-up" : "ecb-down");
  if (c.counter) cls.push("ecb-top");
  if ((_a = c.vs) == null ? void 0 : _a.low) cls.push("ecb-low");
  if (rival === c.cid) cls.push("ecb-rival");
  return { value, rank: c.counter, cls: cls.join(" ") };
}
async function mountOverlay({ overlay: overlay2, catalog: catalog2, getPrefs, filters = null, inSelection = () => false }) {
  await whenReady();
  ensureStyle6();
  const layer = h("div", { class: "ecb-layer", style: "display:none" });
  let scheduled = false;
  let observer = null;
  const attach = () => {
    if (document.body && !layer.isConnected) document.body.append(layer);
  };
  const paint = () => {
    scheduled = false;
    attach();
    const st = overlay2.getState();
    const prefs = getPrefs();
    const badges = prefs.enabled && !!st.data;
    const veils = !!filters && inSelection() && filters.isActive();
    if (!badges && !veils) {
      layer.style.display = "none";
      layer.replaceChildren();
      return;
    }
    const tiles = findTiles(prefs.selector);
    const f = veils ? filters.get() : null;
    const avail = veils ? filters.availability() : null;
    const nodes = [];
    for (const { el, id } of tiles) {
      const r = el.getBoundingClientRect();
      if (r.width < 16 || r.height < 16 || r.bottom < 0 || r.top > window.innerHeight) continue;
      if (veils && !filters.matches(id, f, avail)) {
        nodes.push(h("div", { class: "ecb-veil", "data-veil": String(id), style: `left:${Math.round(r.left)}px;top:${Math.round(r.top)}px;width:${Math.round(r.width)}px;height:${Math.round(r.height)}px` }));
      }
      if (!badges) continue;
      const b = badgeOf(st.data.champions[id] && { ...st.data.champions[id], cid: id }, st.data.rival);
      if (!b) continue;
      const c = st.data.champions[id];
      nodes.push(h(
        "div",
        { class: b.cls, "data-cid": String(id), title: tipOf(catalog2.champion(id).name, c), style: `left:${Math.round(r.left + r.width / 2 - 15)}px;top:${Math.round(r.top - 7)}px` },
        h("span", null, b.value.toFixed(1)),
        b.rank && h("b", null, "#" + b.rank)
      ));
    }
    layer.style.display = nodes.length ? "block" : "none";
    layer.replaceChildren(...nodes);
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(paint);
    }
  };
  catalog2.load().then(schedule).catch(() => {
  });
  overlay2.subscribe(schedule);
  filters == null ? void 0 : filters.subscribe(schedule);
  addEventListener("resize", schedule);
  addEventListener("scroll", schedule, true);
  addEventListener("draftsage:prefs", schedule);
  if (typeof MutationObserver !== "undefined") {
    observer = new MutationObserver((recs) => {
      if ((overlay2.getState().data || (filters == null ? void 0 : filters.isActive()) && inSelection()) && recs.some((r) => !layer.contains(r.target))) schedule();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  const guard = setInterval(() => {
    attach();
    if (overlay2.getState().data || (filters == null ? void 0 : filters.isActive()) && inSelection()) schedule();
  }, 1500);
  log.info("estad\xEDsticas de selecci\xF3n listas");
  return { destroy() {
    clearInterval(guard);
    observer == null ? void 0 : observer.disconnect();
    layer.remove();
  }, repaint: schedule };
}

// src/presentation/native.js
var STYLE_ID8 = "draftsage-native-style";
var MAX_PICKS = 5;
var CSS7 = `
.ecx{box-sizing:border-box;display:inline-flex;align-items:center;gap:6px;vertical-align:middle;font:12px/1.3 sans-serif;color:var(--ds-text);user-select:none;-webkit-app-region:no-drag}
.ecx *{-webkit-app-region:no-drag;box-sizing:border-box}
.ecx button{font:inherit;color:inherit;cursor:pointer;padding:0;margin:0}
.ecx button:focus:not(:focus-visible){outline:none}
.ecx svg{display:block}
.ecx-loadout{flex:none;margin:0 10px}
.ecx-key{position:relative;width:38px;height:38px;border-radius:50%;background:var(--ds-bg);border:2px solid var(--ds-gold-dim);display:flex;align-items:center;justify-content:center;color:var(--ds-meta);transition:border-color .15s,box-shadow .15s,transform .15s}
.ecx-key:hover{border-color:var(--ds-gold);box-shadow:0 0 10px rgba(200,170,110,.55);transform:scale(1.05)}
.ecx-key.ecx-open{border-color:var(--ds-text-hi);box-shadow:0 0 12px rgba(240,230,210,.6)}
.ecx-key img.ecx-k{width:100%;height:100%;border-radius:50%;object-fit:cover}
.ecx-key .ecx-tree{position:absolute;right:-5px;bottom:-5px;width:18px;height:18px;border-radius:50%;background:var(--ds-bg);border:1px solid var(--ds-gold-dim);object-fit:cover}
.ecx-key .ecx-dot{position:absolute;left:-3px;top:-3px;width:12px;height:12px;border-radius:50%;background:var(--ds-surface-2);border:1px solid var(--ds-gold-dim);display:flex;align-items:center;justify-content:center}
.ecx-key[data-state=loading]{border-color:var(--ds-gold-dim);animation:ecx-pulse 1.2s ease-in-out infinite}
.ecx-key[data-state=waiting]{opacity:.7}
.ecx-key[data-state=error]{border-color:#8a6a1f;color:var(--ds-amber)}
.ecx-key.ecx-pop{animation:ecx-pop .6s ease-out}
.ecx-ap{width:28px;height:28px;border-radius:50%;background:linear-gradient(var(--ds-gold-bg),#17130a);border:1px solid var(--ds-gold);color:var(--ds-text-hi);display:flex;align-items:center;justify-content:center;transition:.15s}
.ecx-ap:hover:not(:disabled){box-shadow:0 0 10px rgba(200,170,110,.6);transform:scale(1.08)}
.ecx-ap:disabled{opacity:.35;cursor:default;border-color:var(--ds-mute-2)}
.ecx-ap.ecx-done{border-color:var(--ds-teal);color:var(--ds-teal);background:var(--ds-teal-bg)}
.ecx-ap.ecx-fail{border-color:var(--ds-amber);color:var(--ds-amber)}
.ecx-ap.ecx-done svg{animation:ecx-pop .3s ease-out}
.ecx-spin{width:14px;height:14px;border:2px solid var(--ds-gold-dim);border-top-color:var(--ds-text-hi);border-radius:50%;animation:ecx-rot .7s linear infinite;display:inline-block}
.ecx-picks{flex:0 1 auto;min-width:0;max-width:100%;margin:0 8px;gap:4px;overflow:hidden}
.ecx-ib{flex:none;position:relative;width:26px;height:26px;border-radius:50%;background:var(--ds-bg);border:1px solid var(--ds-gold-dim);color:var(--ds-gold);display:flex;align-items:center;justify-content:center;transition:.15s}
.ecx-ib:hover{border-color:var(--ds-gold);color:var(--ds-text-hi);box-shadow:0 0 8px rgba(200,170,110,.5)}
.ecx-ib.ecx-open{border-color:var(--ds-text-hi);color:var(--ds-text-hi)}
.ecx-ib .ecx-n{position:absolute;right:-5px;top:-5px;min-width:14px;height:14px;padding:0 3px;border-radius:7px;background:var(--ds-gold);color:#1a1408;font:bold 10px/14px sans-serif;text-align:center}
.ecx-pk{flex:none;position:relative;display:flex;flex-direction:column;align-items:center;width:30px;background:none;border:0}
.ecx-pk img{width:26px;height:26px;border-radius:50%;object-fit:cover;border:1px solid var(--ds-border);background:var(--ds-surface-2);transition:.12s}
.ecx-pk:hover img{border-color:var(--ds-gold);transform:scale(1.12)}
.ecx-pk b{display:block;margin-top:1px;font:bold 10px/11px sans-serif;color:var(--ds-meta)}
.ecx-pk b.ecx-pos{color:var(--ds-teal)}.ecx-pk b.ecx-neg{color:var(--ds-red)}
.ecx-pk.ecx-top img{border:2px solid var(--ds-gold);box-shadow:0 0 6px rgba(200,170,110,.55)}
.ecx-pk.ecx-shake{animation:ecx-shake .35s}
.ecx-hint{flex:0 1 auto;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:11px;color:var(--ds-mute)}
.ecx-launch{position:fixed;right:14px;bottom:14px;z-index:2147483100;pointer-events:auto;cursor:pointer;justify-content:center;width:34px;height:34px;border-radius:50%;background:var(--ds-bg);border:1px solid var(--ds-gold-dim);color:var(--ds-gold);font:bold 11px/1 sans-serif;transition:.15s}
.ecx-launch:hover{border-color:var(--ds-gold);color:var(--ds-text-hi);box-shadow:0 0 10px rgba(200,170,110,.5)}
.grid-champion.ecx-flash .grid-champion-hitbox{animation:ecx-flash .5s ease-in-out 3;box-shadow:inset 0 0 0 2px var(--ds-gold-hi),0 0 14px var(--ds-gold-hi)}
@keyframes ecx-pulse{0%,100%{box-shadow:0 0 0 rgba(200,170,110,0)}50%{box-shadow:0 0 12px rgba(200,170,110,.7)}}
@keyframes ecx-pop{0%{transform:scale(.7)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
@keyframes ecx-rot{to{transform:rotate(360deg)}}
@keyframes ecx-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}
@keyframes ecx-flash{0%,100%{filter:none}50%{filter:brightness(1.7)}}
`;
function ensureStyle7() {
  ensureTheme();
  if (document.getElementById(STYLE_ID8)) return;
  const s = document.createElement("style");
  s.id = STYLE_ID8;
  s.textContent = CSS7;
  document.head.append(s);
}
function isShown(el) {
  if (!el || !el.isConnected) return false;
  const r = el.getBoundingClientRect();
  if (r.width < 1 || r.height < 1) return false;
  const cs = getComputedStyle(el);
  return cs.visibility !== "hidden" && cs.display !== "none";
}
function findAnchors(root = document) {
  const loadout = root.querySelector(".loadouts-edit-component");
  const header = root.querySelector(".champion-grid-header");
  const buttons = root.querySelector(".bottom-right-buttons");
  const child = (p, sel) => p.querySelector(":scope > " + sel);
  return {
    loadout: loadout ? { parent: loadout, before: child(loadout, ".loadoutsSpacer") ?? child(loadout, ".ward-skin-select-component") } : null,
    header: header ? { parent: header, before: child(header, ".spacer") } : null,
    buttons: buttons ? { parent: buttons, before: buttons.firstElementChild } : null
  };
}
function probeNative(root = document) {
  const a = findAnchors(root);
  const r = Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v ? { visible: isShown(v.parent), before: v.before ? v.before.className : null } : null]));
  r.fichas = root.querySelectorAll(".grid-champion[data-id]").length;
  log.info("nativeProbe", JSON.stringify(r));
  return r;
}
function flashTile(id, root = document) {
  var _a;
  const tile = root.querySelector(`.grid-champion[data-id="${Number(id)}"]`);
  if (!tile) return false;
  (_a = tile.scrollIntoView) == null ? void 0 : _a.call(tile, { block: "nearest", inline: "nearest" });
  tile.classList.add("ecx-flash");
  setTimeout(() => tile.classList.remove("ecx-flash"), 1700);
  return true;
}
async function mountNative({ panel, controller: controller2, catalog: catalog2, overlay: overlay2, advisor: advisor2, filters, onMenu, root = document }) {
  var _a;
  await whenReady();
  ensureStyle7();
  const el = {
    loadout: h("div", { class: "ecx ecx-loadout", "data-ecx": "loadout" }),
    picks: h("div", { class: "ecx ecx-picks", "data-ecx": "picks" }),
    launch: h("button", { class: "ecx ecx-launch", type: "button", "data-ecx": "launcher", title: t("nat.launch"), onclick: () => onMenu() }, "DS")
  };
  const sig = { loadout: "", picks: "" };
  let docked = false;
  let warned = false;
  let timer = 0;
  let popTimer = 0;
  let lastKey = "";
  function paintLoadout(st) {
    var _a2, _b, _c, _d, _e;
    const d = st.status === "ready" ? st.data : st.status === "loading" ? st.stale : null;
    const ps = panel.status();
    const state = st.status === "ready" ? "ready" : st.status === "loading" ? d ? "ready" : "loading" : st.status;
    const open = panel.view() === "build";
    const key2 = d ? `${d.keystone.rune}|${d.secondaryTree ?? ""}` : "";
    const s = JSON.stringify([state, key2, st.status === "loading" && !!d, open, ps.busy, ps.done, ps.failed, (_a2 = st.context) == null ? void 0 : _a2.championId, ((_b = st.context) == null ? void 0 : _b.opponentChampionId) ?? 0, ((_c = catalog2.isLoaded) == null ? void 0 : _c.call(catalog2)) ?? true]);
    if (s === sig.loadout) return;
    sig.loadout = s;
    const champ = ((_d = st.context) == null ? void 0 : _d.championId) ? catalog2.champion(st.context.championId).name : "";
    const rival = st.status === "ready" ? st.data.meta.opponent : (_e = st.context) == null ? void 0 : _e.opponentChampionId;
    const head = champ + (rival ? " vs " + catalog2.champion(rival).name : "");
    let tip = t("nat.buildOpen");
    let face;
    if (d) {
      const ks = catalog2.rune(d.keystone.rune);
      const tree = d.secondaryTree ? catalog2.rune(d.secondaryTree) : null;
      tip = `${head}
${ks.name}${tree ? " + " + tree.name : ""}
${tip}`;
      face = [
        ks.icon ? h("img", { class: "ecx-k", src: ks.icon, alt: ks.name, draggable: "false" }) : icon("target", 20),
        (tree == null ? void 0 : tree.icon) ? h("img", { class: "ecx-tree", src: tree.icon, alt: tree.name, draggable: "false" }) : null
      ];
    } else if (state === "loading") {
      face = [h("span", { class: "ecx-spin" })];
      tip = `${head}
\u2026`;
    } else if (state === "needs-login") {
      face = [icon("user", 20)];
      tip = t("panel.login");
    } else if (state === "error") {
      face = [icon("warn", 20)];
      tip = `${head}
${t("panel.retry")}`;
    } else {
      face = [icon("target", 20)];
      tip = t("panel.pick");
    }
    const keyBtn = h("button", {
      type: "button",
      class: "ecx-key" + (open ? " ecx-open" : ""),
      "data-state": state,
      "data-ecx": "build",
      "aria-pressed": String(open),
      title: tip,
      onclick: () => panel.toggle("build", el.loadout)
      // el ancla es el contenedor (estable); los botones se regeneran al repintar
    }, face);
    const canApply = !!d && st.status === "ready";
    const apBtn = h("button", {
      type: "button",
      class: "ecx-ap" + (ps.done ? " ecx-done" : ps.failed ? " ecx-fail" : ""),
      "data-ecx": "apply",
      disabled: canApply && !ps.busy ? null : "disabled",
      title: ps.done ? t("apply.done") : t("apply.all"),
      onclick: () => panel.apply("all")
    }, ps.busy ? h("span", { class: "ecx-spin" }) : icon(ps.done ? "check" : ps.failed ? "warn" : "bolt", 15));
    el.loadout.replaceChildren(keyBtn, apBtn);
    if (key2 && key2 !== lastKey) {
      if (lastKey) {
        keyBtn.classList.add("ecx-pop");
        clearTimeout(popTimer);
        popTimer = setTimeout(() => keyBtn.classList.remove("ecx-pop"), 700);
      }
      lastKey = key2;
    } else if (!key2) lastKey = "";
  }
  const signed2 = (n) => (n >= 0 ? "+" : "") + n.toFixed(1);
  function picksModel() {
    var _a2, _b;
    const ov = overlay2 == null ? void 0 : overlay2.getState();
    const adv0 = advisor2 == null ? void 0 : advisor2.getState();
    const lane = !!((_a2 = ov == null ? void 0 : ov.data) == null ? void 0 : _a2.rival) && (filters ? filters.matchupPicks().length > 0 : ov.data.counters.length > 0);
    const team = !!(adv0 == null ? void 0 : adv0.data) && (filters ? filters.draftPicks().length > 0 : adv0.data.picks.length > 0);
    const p = resolvePerspective(getPanelPrefs().perspective, { lane, team });
    if (p === "lane" || !p && ((_b = ov == null ? void 0 : ov.data) == null ? void 0 : _b.rival)) {
      const list = (filters ? filters.matchupPicks() : ov.data.counters.map((c) => ({ cid: c.cid, wr: c.wr, edge: c.edge, n: c.n }))).slice(0, MAX_PICKS);
      const rival = catalog2.champion(ov.data.rival).name;
      return {
        mode: "matchup",
        tip: t("nat.picksRival", rival),
        items: list.map((c) => ({ cid: c.cid, label: Math.round(c.wr) + "%", good: c.edge == null || c.edge >= 0, tip: t("mu.pickTip", catalog2.champion(c.cid).name, c.wr.toFixed(1), rival, c.edge != null ? signed2(c.edge) : "\u2013", c.n) }))
      };
    }
    const adv = adv0;
    if (adv == null ? void 0 : adv.data) {
      const list = (filters ? filters.draftPicks() : adv.data.picks).slice(0, MAX_PICKS);
      return {
        mode: "draft",
        tip: t("nat.picksDraft"),
        items: list.map((p2) => ({ cid: p2.championId, label: signed2(p2.score), good: p2.score >= 0, tip: pickTip(p2, catalog2.champion(p2.championId), adv.data.meta, catalog2, null) }))
      };
    }
    return { mode: "none", tip: t("nat.picksNone"), items: [] };
  }
  function paintPicks() {
    var _a2, _b;
    const m = picksModel();
    const n = ((_a2 = filters == null ? void 0 : filters.activeCount) == null ? void 0 : _a2.call(filters)) ?? 0;
    const open = panel.view() === "picks";
    const s = JSON.stringify([m.mode, m.items.map((i) => [i.cid, i.label]), n, open, ((_b = catalog2.isLoaded) == null ? void 0 : _b.call(catalog2)) ?? true]);
    if (s === sig.picks) return;
    sig.picks = s;
    const toggle = () => panel.toggle("picks", el.picks);
    const head = h(
      "button",
      { type: "button", class: "ecx-ib" + (open ? " ecx-open" : ""), "data-ecx": "picks-open", "aria-pressed": String(open), title: m.mode === "none" ? m.tip : t("nat.picksOpen") + "\n" + m.tip, onclick: toggle },
      icon(m.mode === "matchup" ? "target" : "spark", 15),
      n > 0 && h("span", { class: "ecx-n", "data-count": n }, n)
    );
    const cells = m.items.map((i, k) => {
      const info = catalog2.champion(i.cid);
      const btn = h(
        "button",
        {
          type: "button",
          class: "ecx-pk" + (k === 0 ? " ecx-top" : ""),
          "data-pick": i.cid,
          "data-primary": k === 0 ? "" : null,
          "aria-label": (k === 0 ? t("ds.title") + ": " : "") + info.name + " \u2014 " + i.label,
          title: (k === 0 ? t("ds.title") + " \u2014 " : "") + i.tip + "\n" + t("nat.find"),
          onclick: () => {
            if (!flashTile(i.cid, root)) {
              btn.classList.add("ecx-shake");
              btn.title = t("nat.notInGrid");
              setTimeout(() => btn.classList.remove("ecx-shake"), 400);
            }
          }
        },
        info.icon ? h("img", { src: info.icon, alt: info.name, draggable: "false" }) : h("div", { style: "width:26px;height:26px;border-radius:50%;background:var(--ds-surface-2)" }),
        h("b", { class: i.good ? "ecx-pos" : "ecx-neg" }, i.label)
      );
      return btn;
    });
    el.picks.replaceChildren(head, ...cells);
  }
  function put(node, anchor) {
    const ok = !!anchor && isShown(anchor.parent);
    if (!ok) {
      if (node.isConnected) node.remove();
      return false;
    }
    const inPlace = node.parentElement === anchor.parent && (anchor.before ? node.nextElementSibling === anchor.before : true);
    if (!inPlace) anchor.parent.insertBefore(node, anchor.before ?? null);
    return true;
  }
  function sync() {
    clearTimeout(timer);
    timer = 0;
    const st = controller2.getState();
    const live2 = st.status !== "idle" && !!st.context && st.context.phase !== "game" && st.context.source !== "manual";
    const enabled = getPanelPrefs().enabled !== false;
    const a = live2 && enabled ? findAnchors(root) : { loadout: null, header: null, buttons: null };
    const hasLoadout = put(el.loadout, a.loadout);
    const hasHeader = put(el.picks, a.header);
    const on = hasLoadout || hasHeader;
    const hasButtons = on;
    if (hasButtons) {
      if (el.launch.parentElement !== root.body) root.body.append(el.launch);
    } else if (el.launch.isConnected) el.launch.remove();
    if (on !== docked) {
      docked = on;
      panel.setDocked(on);
      if (on) {
        warned = false;
        log.info("interfaz integrada en Champion Select:", [hasLoadout && "barra de runas", hasHeader && "cabecera de la cuadr\xEDcula", hasButtons && "bot\xF3n DS"].filter(Boolean).join(", "));
      } else log.info("interfaz integrada desactivada (panel flotante)");
    }
    if (live2 && enabled && !on && !warned) {
      warned = true;
      log.warn("Champion Select sin puntos de anclaje reconocidos: se usa el panel flotante (draftsage.nativeProbe() muestra qu\xE9 falta)");
    }
    if (hasLoadout) paintLoadout(st);
    if (hasHeader) paintPicks();
    if (!on) {
      sig.loadout = "";
      sig.picks = "";
      lastKey = "";
    }
  }
  const schedule = () => {
    if (!timer) timer = setTimeout(sync, 80);
  };
  (_a = panel.setLocator) == null ? void 0 : _a.call(panel, (cid) => flashTile(cid, root));
  const offs = [controller2.subscribe(schedule), panel.subscribe(schedule), overlay2 == null ? void 0 : overlay2.subscribe(schedule), advisor2 == null ? void 0 : advisor2.subscribe(schedule), filters == null ? void 0 : filters.subscribe(schedule)].filter(Boolean);
  addEventListener("draftsage:prefs", schedule);
  addEventListener("resize", schedule);
  catalog2.load().then(schedule).catch(() => {
  });
  let observer = null;
  if (typeof MutationObserver !== "undefined" && root.body) {
    observer = new MutationObserver((recs) => {
      var _a2, _b;
      if (controller2.getState().status === "idle" && !docked) return;
      for (const r of recs) if (!(r.target.nodeType === 1 && ((_b = (_a2 = r.target).closest) == null ? void 0 : _b.call(_a2, ".ecx, .ecp")))) {
        schedule();
        return;
      }
    });
    observer.observe(root.body, { childList: true, subtree: true });
  }
  const guard = setInterval(schedule, 1500);
  sync();
  log.info("integraci\xF3n con Champion Select lista");
  return {
    sync,
    destroy() {
      clearInterval(guard);
      clearTimeout(timer);
      clearTimeout(popTimer);
      observer == null ? void 0 : observer.disconnect();
      offs.forEach((f) => f == null ? void 0 : f());
      removeEventListener("draftsage:prefs", schedule);
      removeEventListener("resize", schedule);
      panel.setDocked(false);
      Object.values(el).forEach((n) => n.remove());
    }
  };
}

// src/application/bootstrap.js
window.draftsage = Object.assign(window.draftsage ?? {}, {
  menu: () => mainMenu(),
  loginMenu: () => loginMenu(),
  simulateMenu: () => simulateMenu(),
  // Si el panel quedó fuera de alcance: draftsage.resetPanel() lo devuelve arriba a la derecha.
  resetPanel: () => resetPanelPosition(),
  simulate: (ctx) => app.controller.simulate(ctx),
  state: () => app.controller.getState(),
  // Fuente de las recomendaciones: draftsage.source() la muestra; draftsage.source('lolalytics' | 'coachless' | 'auto') la cambia.
  source: (mode) => mode ? app.source.set(mode) : app.source.get(),
  // Estadísticas sobre los campeones de Champion Select: estado, diagnóstico de la detección de la cuadrícula y selector manual.
  overlayState: () => app.overlay.getState(),
  overlayProbe: () => probeGrid(),
  overlaySelector: (css2 = "") => {
    setOverlayPrefs({ selector: css2 });
    return getOverlayPrefs();
  },
  // Interfaz integrada en Champion Select: qué anclas del DOM del cliente encuentra y si se ven (para informar si no aparece).
  nativeProbe: () => probeNative(),
  // Consejero de picks (iTero + LoLalytics): estado y diagnóstico de iTero (para activarlo está el interruptor de Ajustes → Más).
  advisorState: () => ({ ...app.advisor.getState(), itero: app.advisor.iteroStatus() }),
  // Línea de cada rival (manual / cliente / deducida), maestría (sin los puntos) y filtros activos de la selección.
  enemyRoles: () => app.enemyRoles.getState(),
  masteryState: () => {
    const { points, ...rest } = app.mastery.getState();
    return { ...rest, campeones: points ? Object.keys(points).length : 0 };
  },
  pickFilters: () => app.pickFilters.get()
});
function watchUpdates() {
  var _a, _b;
  const build = (_b = (_a = window.draftsage) == null ? void 0 : _a.build) == null ? void 0 : _b.call(_a);
  if ((build == null ? void 0 : build.source) === "remote" && build.version !== getUpdatePrefs().lastNotified) {
    setUpdatePrefs({ lastNotified: build.version });
    notify.success(t("upd.updated", build.version));
  }
  window.addEventListener("draftsage:update", (e) => {
    const d = e.detail ?? {};
    if (d.kind === "downloaded") notify.success(t("upd.ready", d.version));
    else if (d.kind === "reinstall") notify.error(t("upd.reinstall"));
  });
}
async function start() {
  initLanguage();
  log.info("plugin cargado | men\xFA: draftsage.menu() o Ctrl+Shift+E");
  if (!await ensureApiAccess()) {
    log.warn("sin acceso a la API; a la espera de que el usuario configure Pengu");
    return;
  }
  const openLogin = () => loginMenu();
  mountPanel({ controller: app.controller, catalog: app.catalog, applier: app.applier, live: app.live, overlay: app.overlay, advisor: app.advisor, enemyRoles: app.enemyRoles, filters: app.pickFilters, mastery: app.mastery, onEnableApply: enableApplyFlow, onLogin: openLogin, onMenu: () => mainMenu() }).then((panel) => mountNative({ panel, controller: app.controller, catalog: app.catalog, overlay: app.overlay, advisor: app.advisor, filters: app.pickFilters, onMenu: () => mainMenu() }).catch((e) => log.error("no se pudo montar la interfaz integrada (sigue el panel flotante):", e))).catch((e) => log.error("no se pudo montar el panel:", e));
  mountOverlay({ overlay: app.overlay, catalog: app.catalog, getPrefs: getOverlayPrefs, filters: app.pickFilters, inSelection: () => {
    const st = app.controller.getState();
    return st.status !== "idle" && !!st.context && st.context.phase !== "game";
  } }).catch((e) => log.error("no se pudo montar las estad\xEDsticas de la selecci\xF3n:", e));
  if (await restoreSession()) {
    log.info("sesi\xF3n recuperada");
  } else if (needsLogin(getSourcePrefs().mode)) {
    log.info("sin sesi\xF3n v\xE1lida; la fuente elegida (\xAB" + getSourcePrefs().mode + "\xBB) la necesita: el panel ofrece iniciar sesi\xF3n");
  } else {
    log.info("sin sesi\xF3n de Coachless (opcional): la fuente elegida (\xAB" + getSourcePrefs().mode + "\xBB) no la necesita");
  }
  app.controller.start();
  app.overlay.start();
  app.advisor.start();
  app.enemyRoles.start();
  app.mastery.start();
  app.pickFilters.start();
  watchUpdates();
  log.info("listo: se mostrar\xE1 la recomendaci\xF3n al entrar en Champion Select");
}
export {
  start
};
