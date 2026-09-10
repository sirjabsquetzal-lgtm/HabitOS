// HabitOS — JABS habit tracker.
// Vanilla JS, no build step. All data lives on-device (localStorage + IndexedDB for the meditation track).
// Installable as a PWA (see manifest.webmanifest + sw.js) so it can be "added to Home screen" from Brave.
(function () {
'use strict';

var STORAGE_KEY = 'habitos-jabs-v1';
var IDB_NAME = 'habitos-jabs-db';
var IDB_STORE = 'files';
var MUSIC_KEY = 'meditation-track';

var HABITS = [
  { k: 'meditation', en: 'Meditation', es: 'Meditación' },
  { k: 'reading', en: 'Reading & Learning', es: 'Lectura y aprendizaje' },
  { k: 'exercise', en: 'Exercise', es: 'Ejercicio' },
  { k: 'investment', en: 'Investment', es: 'Inversión' },
  { k: 'projects', en: 'Proyects', es: 'Proyectos' },
  { k: 'family', en: 'Family', es: 'Familia' },
  { k: 'contribute', en: 'Contribute', es: 'Contribuir' },
  { k: 'gratitude', en: 'Gratitude', es: 'Gratitud' }
];

var PRINCIPLES = [
  'Honro mi símbolo con el fuego de mi espíritu.\n- Es el mantra más poderoso y eficaz.\n- Me ayuda a ser fiel a mi "ultimate version".\n- Me aterriza en el aquí y ahora.\n- Empodera mi fuego interno.\n- Reconecta con mi guía Quetzalcóatl.\n- Recupero control y genero confianza interna.',
  'Domino la elocuencia y el pensamiento.\n- Facilidad de palabra.\n- Enriquecimiento de léxico.\n- Mejora en las lenguas que domino.\n- Conecta con mi yo más sabio.\n- Escucho mucho y hablo poco, pero con gran fuerza.\n- Analizo con facilidad y actúo con precisión.\n- Refino mis movimientos y genero confianza externa.',
  'La grandeza de mi cuerpo refleja disciplina, fuerza y gracia.\n- Superó límites físicos.\n- Entreno con pasión y dedicación.\n- Genero inspiración.\n- Disfruto de excelente salud.\n- Me siento cómodo con mi estado y apariencia física.\n- Reconozco mi grandeza.',
  'Construyo con estrategia libertad plena y estable.\n- Soy un trader rentable gracias a mi disciplina y consistencia.\n- Sé cuándo operar y cuándo retirarme.\n- Soy experto en cuidar mi dinero y hacerlo crecer.\n- Mis metas financieras se cumplen.\n- Disfruto de libertad financiera.\n- El dinero no tiene poder sobre mí.\n- No persigo dinero; el dinero viene a mí.\n- Mis negocios tienen éxito.\n- El dinero trabaja para mí y se incrementa.\n- Disfruto de la sensación de "tener suficiente" para el estilo de vida que merezco.',
  'Mi legado trasciende y enriquece vidas.\n- Trabajo en mis sueños y ellos impactan vidas.\n- Soy un reconocido desarrollador de videojuegos.\n- Mi estudio Quetzal-Studios desarrolla videojuegos que marcan personas y trascienden de manera cultural.\n- Desarrollamos mundos, historias y experiencias únicas y de gran resonancia cultural.\n- Desarrollé mi mejor obra llamada "Sons of Earth", juego que tuvo adaptación al mundo del entretenimiento audiovisual y el personaje principal fue invitado como personaje jugable en Smash Bros.\n- Somos un estudio privado que trabaja sin presiones, somos totalmente autosuficientes y apasionados.',
  'Soy presencia, amor y protección para mi familia.\n- Estoy en preparado para proteger a mi familia en cualquier ámbito.\n- Soy capaz de trabajar y estar con mi familia la mayoría del tiempo.\n- Demuestro amor siempre a mi familia.\n- Soy un referente de cómo debe ser sentirse "amada", mi hija dándole el ejemplo con su madre.\n- Nuestra familia es sólida, llena de amor, seguridad y compromiso.\n- No hay nada en esta vida que entorpezca el crecimiento de mi familia.\n- Nada puede separar a esta familia.\n- Apoyo los sueños de mi hija y de mi esposa, hasta verlos realizados.\n- Todo sacrificio realizado con el fin de favorecer a mi familia da muchos frutos.\n- La familia prospera de manera abundante.\n- El amor que tengo por mi hija y mi esposa puede con cualquier otra circunstancia.',
  'Desde la gratitud, contribuyo al crecimiento de los míos.\n- Todos aquellos que nos apoyaron cuando más lo necesitamos reciben nuestro apoyo incondicional.\n- Duplicamos el valor y apoyo que nos dieron al apoyarnos, siempre todo desde la gratitud.\n- Amor recíproco para aquellos que nos aman de vuelta sin malas intenciones.',
  'Prospero con gratitud, paciencia y equilibrio.\n- Mis esfuerzos y avances suman todos los días, independientemente del tamaño de los mismos.\n- Cada día que pasa es un día más cerca de ser mi "ultimate" me.\n- Agradezco cada avance, enseñanza, victoria, fallo y aprendizaje que se presenta en mi camino.\n- Mi proceso es único, lleno de aprendizaje y enriquece mi vida.\n- En mi vida, el equilibrio es parte esencial.\n- Actúo con paciencia y siempre a expectativa.\n- Controlo mis emociones, por lo que es sencillo mantener paciencia en todo momento.\n- Soy muy agradecido con la vida.\n- Mi fortuna y libertad son producto de mi paciencia.'
];

var LEGEND = 'Recuerda: no hace falta sacrificar ni pedir. No lo mires desde la carencia. No hay requisitos, no hay que esforzarse por merecerlo. Ya son tuyos, porque ya lo tienes todo. Siéntelo, tómalo y vibra en esa frecuencia.';
var LEGEND_EN = 'Remember: there is nothing to sacrifice and nothing to ask for. Do not look at this from lack. There are no requirements, no effort to prove. They are already yours, because you already have it all. Feel it, take it and vibrate at that frequency.';

var STR = {
  es: {
    menu: 'Menú principal', registros: 'Registros', destacados: 'Destacados', principios: 'Principios',
    meditacion: 'Meditación', deseos: 'Deseos', settings: 'Ajustes',
    subRegistros: 'Highlights · check-list · points · score', subDestacados: 'Tus días favoritos',
    subPrincipios: 'Los 8 mantras', subMeditacion: 'Temporizador y música', subDeseos: 'Metas por cumplir',
    generalScore: 'Score general', dailyHighlights: 'Daily highlights', checklist: 'Check-list',
    points: 'Points', score: 'Score', highlights: 'Highlights',
    tapHint: 'Toca para marcar Y / N',
    monthThought: 'Pensamiento del mes', monthNotePlaceholder: 'Se desbloquea el último día del mes',
    monthNoteOpen: 'Escribe tu comentario sobre el mes vivido',
    dayPlaceholder: 'Lo más destacado del día', lockedPlaceholder: 'Bloqueado',
    favs: 'destacados', noFavs: 'Aún no hay días destacados. Marca un día con la estrella en Daily highlights.',
    all: 'General', byYear: 'Año',
    principlesIntro: 'Ocho principios, ocho hábitos. Cada mantra sostiene un registro diario del check-list.',
    neverForget: 'Never forget...', neverForgetSub: 'Notas que no se negocian',
    nfPlaceholder: 'Algo que nunca debo olvidar…', accept: 'Aceptar', edit: 'Editar contenido', done: 'Listo',
    stop: 'Detener', noMusic: 'No hay música cargada. Súbela en Ajustes › Música.',
    start: 'Iniciar', running: 'En sesión', pick: 'Elige tu tiempo',
    beforeStart: 'Antes de empezar', silence: 'Silencia tus notificaciones',
    silenceBody: 'Pon el dispositivo en no molestar. Al dar Listo empieza la cuenta regresiva y la música en loop.',
    ready: 'Listo', cancel: 'Cancelar',
    appearance: 'Apariencia', language: 'Lenguaje', music: 'Música', data: 'Datos',
    paper: 'Paper', dark: 'Oscuro', export: 'Exportar datos', import: 'Importar datos',
    uploadMusic: 'Subir canción', remove: 'Quitar', noMusicSet: 'Sin canción seleccionada',
    add: 'Agregar deseo', newWish: 'Nuevo deseo', wishPlaceholder: 'Título del deseo o meta',
    badgesEarned: 'Insignias obtenidas', wishTitleLabel: 'Título', wishDescLabel: 'Descripción',
    wishDescPlaceholder: 'Descripción: cómo se ve, cómo se siente…',
    wishLegend: LEGEND, noWishes: 'Sin deseos registrados todavía.',
    fAll: 'Todos', fOpen: 'Por cumplir', fDone: 'Cumplidos',
    streak: 'Racha', pts: 'pts',
    months: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    monthsShort: ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'],
    dows: ['D','L','M','M','J','V','S'],
    exportOk: 'Datos exportados ✓', exportErr: 'No se pudo exportar', importOk: 'Datos importados ✓', importErr: 'Archivo inválido',
    musicOk: 'Canción guardada ✓', musicErr: 'No se pudo guardar la canción', installTitle: 'Instalar HabitOS',
    installBody: 'Instala la app desde el menú de Brave para usarla como aplicación y guardar tus datos en este dispositivo.'
  },
  en: {
    menu: 'Main menu', registros: 'Records', destacados: 'Featured', principios: 'Principles',
    meditacion: 'Meditation', deseos: 'Wishes', settings: 'Settings',
    subRegistros: 'Highlights · check-list · points · score', subDestacados: 'Your favorite days',
    subPrincipios: 'The 8 mantras', subMeditacion: 'Timer and music', subDeseos: 'Goals to fulfill',
    generalScore: 'General score', dailyHighlights: 'Daily highlights', checklist: 'Check-list',
    points: 'Points', score: 'Score', highlights: 'Highlights',
    tapHint: 'Tap to mark Y / N',
    monthThought: 'Thought of the month', monthNotePlaceholder: 'Unlocks on the last day of the month',
    monthNoteOpen: 'Write your comment about the month you lived',
    dayPlaceholder: "The day's highlight", lockedPlaceholder: 'Locked',
    favs: 'featured', noFavs: 'No featured days yet. Star a day in Daily highlights.',
    all: 'All time', byYear: 'Year',
    principlesIntro: 'Eight principles, eight habits. Each mantra holds one daily check-list record.',
    neverForget: 'Never forget...', neverForgetSub: 'Non-negotiable notes',
    nfPlaceholder: 'Something I must never forget…', accept: 'Accept', edit: 'Edit content', done: 'Done',
    stop: 'Stop', noMusic: 'No music loaded. Upload it in Settings › Music.',
    start: 'Start', running: 'In session', pick: 'Pick your time',
    beforeStart: 'Before you start', silence: 'Silence your notifications',
    silenceBody: 'Set the device to do-not-disturb. Tapping Ready starts the countdown and the looping music.',
    ready: 'Ready', cancel: 'Cancel',
    appearance: 'Appearance', language: 'Language', music: 'Music', data: 'Data',
    paper: 'Paper', dark: 'Dark', export: 'Export data', import: 'Import data',
    uploadMusic: 'Upload song', remove: 'Remove', noMusicSet: 'No song selected',
    add: 'Add wish', newWish: 'New wish', wishPlaceholder: 'Title of the wish or goal',
    badgesEarned: 'Badges earned', wishTitleLabel: 'Title', wishDescLabel: 'Description',
    wishDescPlaceholder: 'Description: how it looks, how it feels…',
    wishLegend: LEGEND_EN, noWishes: 'No wishes recorded yet.',
    fAll: 'All', fOpen: 'To fulfill', fDone: 'Fulfilled',
    streak: 'Streak', pts: 'pts',
    months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    monthsShort: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
    dows: ['S','M','T','W','T','F','S'],
    exportOk: 'Data exported ✓', exportErr: 'Could not export', importOk: 'Data imported ✓', importErr: 'Invalid file',
    musicOk: 'Song saved ✓', musicErr: 'Could not save the song', installTitle: 'Install HabitOS',
    installBody: 'Install the app from Brave’s menu to use it standalone and keep your data on this device.'
  }
};

// menu-tile / principle glyphs (geometric line icons, viewBox 0 0 48 48)
var SYM = {
  registros: ['M 8 10 H 40 M 8 17 H 30', 'M 8 34 L 16 26 L 24 40 L 32 24 L 40 32'],
  destacados: ['M 24 6 L 30 20 L 44 22 L 33 31 L 37 44 L 24 36 L 11 44 L 15 31 L 4 22 L 18 20 Z'],
  principios: ['M 24 4 L 40 12 L 44 28 L 34 42 L 14 42 L 4 28 L 8 12 Z', 'M 24 16 L 32 24 L 24 32 L 16 24 Z'],
  meditacion: ['M 24 4 V 12 M 44 24 H 36 M 24 44 V 36 M 4 24 H 12', 'M 24 12 L 36 24 L 24 36 L 12 24 Z', 'M 24 22 L 26 24 L 24 26 L 22 24 Z'],
  deseos: ['M 24 4 L 34 26 L 24 20 L 14 26 Z', 'M 24 26 L 30 44 L 24 38 L 18 44 Z']
};
var PSYM = [
  ['M 26 4 L 38 22 L 36 34 L 26 44 L 12 40 L 10 26 L 20 16 L 18 28 L 26 22 Z'],
  ['M 6 12 L 24 18 V 42 L 6 36 Z', 'M 42 12 L 24 18 V 42 L 42 36 Z'],
  ['M 4 16 H 12 V 32 H 4 Z', 'M 36 16 H 44 V 32 H 36 Z', 'M 12 20 H 36 V 28 H 12 Z'],
  ['M 8 40 H 16 V 30 H 8 Z', 'M 20 40 H 28 V 20 H 20 Z', 'M 32 40 H 40 V 8 H 32 Z'],
  ['M 24 6 L 42 16 V 34 L 24 44 L 6 34 V 16 Z', 'M 24 6 V 24 L 42 34 M 24 24 L 6 34'],
  ['M 6 38 L 12 16 L 24 30 L 36 16 L 42 38 Z', 'M 24 8 L 27 14 H 21 Z'],
  ['M 4 24 L 20 24 L 14 18 M 20 24 L 14 30', 'M 44 32 L 28 32 L 34 26 M 28 32 L 34 38'],
  ['M 34 8 A 18 18 0 1 0 34 40 A 14 14 0 1 1 34 8 Z', 'M 12 14 L 14 18 L 10 18 Z']
];

// ---------- helpers ----------
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function r1(v) { return Math.round(v * 10) / 10; }
function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function paths(arr) { return arr.map(function (d) { return '<path d="' + d + '"></path>'; }).join(''); }

// ---------- tiny IndexedDB wrapper (meditation track, kept off localStorage so a multi-MB file never blows the quota) ----------
function idbOpen() {
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) { reject(new Error('no-idb')); return; }
    var req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = function () { req.result.createObjectStore(IDB_STORE); };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}
function idbSet(key, val) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE).put(val, key);
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}
function idbGet(key) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(IDB_STORE, 'readonly');
      var req = tx.objectStore(IDB_STORE).get(key);
      req.onsuccess = function () { resolve(req.result || null); };
      req.onerror = function () { reject(req.error); };
    });
  });
}
function idbDel(key) {
  return idbOpen().then(function (db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction(IDB_STORE, 'readwrite');
      tx.objectStore(IDB_STORE)['delete'](key);
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error); };
    });
  });
}

// ---------- state ----------
var now = new Date();
var state = {
  screen: 'menu', tab: 'highlights', settingsOpen: false, monthPicker: false,
  editing: false, nfDraft: '', wishDraft: '', wishDesc: '',
  favMode: 'all', favYear: now.getFullYear(), wishFilter: 'all', status: '', anim: '0', wishModal: false,
  med: { dur: 10, left: 0, running: false, ask: false, prevTheme: null },
  year: now.getFullYear(), month: now.getMonth(),
  lang: 'es', theme: 'paper',
  data: { days: {}, notes: {}, wishes: [], never: [], principles: PRINCIPLES.slice(), music: null }
};
var medTick = null;
var medAudio = null;
var persistTimer = null;

function loadState() {
  var raw = null;
  try { raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { raw = null; }
  if (raw && raw.lang) state.lang = raw.lang;
  if (raw && raw.theme) state.theme = raw.theme;
  var d = (raw && raw.data) || {};
  var wishes = (d.wishes || []).map(function (w) { return { title: w.title || w.text || '', desc: w.desc || '', done: !!w.done }; });
  state.data = {
    days: d.days || {}, notes: d.notes || {}, wishes: wishes, never: d.never || [],
    principles: d.principles || PRINCIPLES.slice(), music: d.music || null
  };
}

function persistNow() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lang: state.lang, theme: state.theme, data: state.data }));
    return true;
  } catch (e) { return false; }
}
function persistSoon() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(persistNow, 250);
}

function todayKey() { var n = new Date(); return n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate()); }
function dayKey(d) { return state.year + '-' + pad(state.month + 1) + '-' + pad(d); }
function dayRec(k) { return state.data.days[k] || { text: '', fav: false, h: [] }; }
function isLocked(d) { return dayKey(d) > todayKey(); }

function monthStats(y, m) {
  var n = daysInMonth(y, m);
  var total = 0;
  var per = HABITS.map(function () { return 0; });
  for (var d = 1; d <= n; d++) {
    var rec = state.data.days[y + '-' + pad(m + 1) + '-' + pad(d)];
    if (!rec || !rec.h) continue;
    for (var i = 0; i < 8; i++) if (rec.h[i]) { total++; per[i]++; }
  }
  return { total: total, max: n * 8, per: per, days: n };
}
function rankFor(pct) {
  if (pct >= 80) return 'A';
  if (pct >= 64) return 'B';
  if (pct >= 48) return 'C';
  if (pct >= 32) return 'D';
  return 'E';
}
function badge(rank) {
  return { rank: rank, src: 'assets/insignia/' + rank + '-' + (state.theme === 'dark' ? 'dark' : 'light') + '.png' };
}

// ---------- meditation ----------
function stopAudio() {
  if (medAudio) { try { medAudio.pause(); } catch (e) {} medAudio = null; }
}
function startMed() {
  var dur = state.med.dur;
  var wasPaper = state.theme === 'paper';
  state.med = Object.assign({}, state.med, { running: true, ask: false, left: dur * 60, prevTheme: wasPaper ? 'paper' : 'dark' });
  state.anim = '1';
  state.theme = 'dark';
  idbGet(MUSIC_KEY).then(function (blob) {
    if (blob) {
      var url = URL.createObjectURL(blob);
      medAudio = new Audio(url);
      medAudio.loop = true;
      medAudio.volume = 0.85;
      medAudio.play()['catch'](function () {});
    }
  });
  if (medTick) clearInterval(medTick);
  medTick = setInterval(function () {
    state.med.left -= 1;
    if (state.med.left <= 0) { endMed(false); return; }
    render();
  }, 1000);
  render();
}
function endMed(cancelled) {
  if (medTick) { clearInterval(medTick); medTick = null; }
  stopAudio();
  var back = state.med.prevTheme === 'paper' ? 'paper' : 'dark';
  state.theme = back;
  state.med = Object.assign({}, state.med, { running: false, left: 0 });
  render();
  setTimeout(function () { state.anim = '0'; render(); }, 1600);
  persistSoon();
  if (!cancelled && navigator.vibrate) { try { navigator.vibrate([400, 150, 400, 150, 600]); } catch (e) {} }
}

// ---------- data export / import ----------
function exportData() {
  try {
    var payload = JSON.stringify({ lang: state.lang, theme: state.theme, data: state.data }, null, 2);
    var url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
    var a = document.createElement('a');
    a.href = url;
    a.download = 'habitos-jabs-' + todayKey() + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    state.status = STR[state.lang].exportOk;
  } catch (e) { state.status = STR[state.lang].exportErr; }
  render();
}
function importFile(file) {
  var fr = new FileReader();
  fr.onload = function () {
    try {
      var parsed = JSON.parse(fr.result);
      var d = parsed.data || parsed;
      var wishes = (d.wishes || []).map(function (w) { return { title: w.title || w.text || '', desc: w.desc || '', done: !!w.done }; });
      state.data = { days: d.days || {}, notes: d.notes || {}, wishes: wishes, never: d.never || [], principles: d.principles || PRINCIPLES.slice(), music: d.music || null };
      if (parsed.lang) state.lang = parsed.lang;
      if (parsed.theme) state.theme = parsed.theme;
      state.status = STR[state.lang].importOk;
      persistNow();
    } catch (err) { state.status = STR[state.lang].importErr; }
    render();
  };
  fr.readAsText(file);
}
function musicFile(file) {
  idbSet(MUSIC_KEY, file).then(function () {
    state.data.music = { name: file.name };
    state.status = STR[state.lang].musicOk;
    persistNow();
    render();
  })['catch'](function () {
    state.status = STR[state.lang].musicErr;
    render();
  });
}

// ---------- render ----------
function render() {
  var s = state;
  var t = STR[s.lang];
  var L = s.lang;
  var nowD = new Date();
  var nDays = daysInMonth(s.year, s.month);
  var stats = monthStats(s.year, s.month);
  var pct = stats.max ? Math.round((stats.total / stats.max) * 100) : 0;
  var titles = { menu: t.menu, registros: t.registros, destacados: t.destacados, principios: t.principios, meditacion: t.meditacion, deseos: t.deseos };
  var todayK = todayKey();
  var screenTitle = titles[s.screen] || t.menu;

  var html = '';
  html += '<div class="app-shell" data-theme="' + s.theme + '" data-anim="' + s.anim + '">';
  html += '<div class="app-container">';

  // header
  html += '<header class="app-header">';
  html += '<div class="app-header__row">';
  if (s.screen !== 'menu') {
    html += '<button class="icon-btn" data-action="nav-back" aria-label="back"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 5l-7 7 7 7"></path></svg></button>';
  } else {
    html += '<span class="icon-btn icon-btn--ghost"></span>';
  }
  html += '<div class="brand"><span class="brand__dot"></span><span class="brand__name">HabitOS</span></div>';
  html += '<button class="icon-btn" data-action="settings-open" aria-label="Settings"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6h.09A1.65 1.65 0 0 0 10 3.09V3a2 2 0 0 1 4 0v.09A1.65 1.65 0 0 0 15 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg></button>';
  html += '</div>';
  html += '<div class="header-sub"><div class="header-sub__title">' + esc(screenTitle) + '</div><span class="header-sub__rule"></span></div>';
  html += '</header>';

  if (s.screen === 'menu') html += renderMenu(t, L, s, nowD);
  else if (s.screen === 'registros') html += renderRegistros(t, L, s, nDays, stats, pct, todayK);
  else if (s.screen === 'destacados') html += renderDestacados(t, s, nowD);
  else if (s.screen === 'principios') html += renderPrincipios(t, L, s);
  else if (s.screen === 'meditacion') html += renderMeditacion(t, s);
  else if (s.screen === 'deseos') html += renderDeseos(t, s);

  html += '</div>'; // app-container

  if (s.settingsOpen) html += renderSettingsModal(t, s);
  if (s.wishModal) html += renderWishModal(t, s);
  if (s.med.ask) html += renderMedAskModal(t);

  html += '</div>'; // app-shell

  var root = document.getElementById('app');
  root.innerHTML = html;
}

function renderMenu(t, L, s, nowD) {
  var nav = ['registros', 'destacados', 'principios', 'meditacion', 'deseos'];
  var subs = { registros: t.subRegistros, destacados: t.subDestacados, principios: t.subPrincipios, meditacion: t.subMeditacion, deseos: t.subDeseos };
  var html = '<nav class="menu-grid">';
  nav.forEach(function (k) {
    var wide = k === 'principios';
    html += '<button class="menu-tile' + (wide ? ' menu-tile--wide' : '') + '" data-action="menu-nav" data-screen="' + k + '">';
    html += '<svg class="menu-tile__icon" viewBox="0 0 48 48" fill="none" stroke="var(--red)" stroke-width="1.6" stroke-linejoin="miter" stroke-linecap="butt">' + paths(SYM[k]) + '</svg>';
    html += '<span class="menu-tile__labels"><span class="menu-tile__label">' + esc(t[k]) + '</span><span class="menu-tile__sub">' + esc(subs[k]) + '</span></span>';
    html += '</button>';
  });
  html += '</nav>';

  var yTotal = 0, yMax = 0;
  for (var m = 0; m < 12; m++) {
    var st = monthStats(s.year, m);
    yTotal += st.total;
    if (s.year < nowD.getFullYear()) yMax += st.max;
    else if (s.year === nowD.getFullYear() && m < nowD.getMonth()) yMax += st.max;
    else if (s.year === nowD.getFullYear() && m === nowD.getMonth()) yMax += nowD.getDate() * 8;
  }
  var yPct = yMax ? Math.round((yTotal / yMax) * 100) : 0;
  var yearBadge = badge(rankFor(yPct));

  html += '<section class="score-card corners" data-glow="1">';
  html += '<span class="corner corner--tl"></span><span class="corner corner--tr"></span><span class="corner corner--bl"></span><span class="corner corner--br"></span>';
  html += '<div class="score-card__label">' + esc(t.generalScore) + '</div>';
  html += '<div class="year-picker">';
  html += '<button class="year-picker__btn" data-action="year-prev" aria-label="prev year"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 5l-7 7 7 7"></path></svg></button>';
  html += '<div class="year-picker__val">' + s.year + '</div>';
  html += '<button class="year-picker__btn" data-action="year-next" aria-label="next year"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 5l7 7-7 7"></path></svg></button>';
  html += '</div>';
  html += '<div class="score-badge-wrap"><img class="badge-img" src="' + esc(yearBadge.src) + '" alt="">';
  html += '<div class="rank-line"><div class="rank-line__num">' + yearBadge.rank + '</div>';
  html += '<div class="rank-line__meta"><span class="rank-line__rule"></span><span class="rank-line__pct">' + yPct + '% · ' + yTotal + ' ' + esc(t.pts) + '</span></div></div></div>';
  html += '</section>';

  var tally = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  for (var mm = 0; mm < 12; mm++) {
    var stm = monthStats(s.year, mm);
    if (!stm.total) continue;
    var monthOver = s.year < nowD.getFullYear() || (s.year === nowD.getFullYear() && mm <= nowD.getMonth());
    if (!monthOver) continue;
    var cap = (s.year === nowD.getFullYear() && mm === nowD.getMonth()) ? nowD.getDate() * 8 : stm.max;
    tally[rankFor(Math.round((stm.total / cap) * 100))]++;
  }
  html += '<section class="badges-card"><div class="badges-card__label">' + esc(t.badgesEarned) + '</div><div class="rank-tally">';
  [['A', '80%'], ['B', '64%'], ['C', '48%'], ['D', '32%'], ['E', '16%']].forEach(function (o) {
    var rank = o[0], count = tally[rank], got = !!count;
    var b = badge(rank);
    html += '<div class="rank-tally__item" style="border-color:' + (got ? 'var(--red)' : 'var(--line)') + ';background:' + (got ? 'rgba(236,48,19,.09)' : 'transparent') + '">';
    html += '<img class="badge-img badge-img--sm" src="' + esc(b.src) + '" alt="" style="opacity:' + (got ? 1 : 0.32) + '">';
    html += '<span class="rank-tally__letter" style="color:' + (got ? 'var(--ink)' : 'var(--dim)') + '">' + rank + '</span>';
    html += '<span class="rank-tally__rule" style="background:' + (got ? 'var(--red)' : 'var(--line)') + '"></span>';
    html += '<span class="rank-tally__count" style="color:' + (got ? 'var(--red)' : 'var(--line)') + '">' + count + '</span>';
    html += '<span class="rank-tally__threshold">' + o[1] + '</span>';
    html += '</div>';
  });
  html += '</div></section>';
  return html;
}

function renderRegistros(t, L, s, nDays, stats, pct, todayK) {
  var html = '<div>';
  html += '<div class="registros-toolbar">';
  html += '<button class="month-btn" data-action="month-toggle"><span>' + esc(t.months[s.month]) + '</span> <span class="month-btn__year">' + s.year + '</span> <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"></path></svg></button>';
  html += '<div class="month-total"><span class="month-total__dot"></span><span>' + stats.total + ' / ' + stats.max + ' ' + esc(t.pts) + '</span></div>';
  html += '</div>';

  if (s.monthPicker) {
    html += '<div class="month-picker"><div class="month-picker__head">';
    html += '<button class="month-picker__yrbtn" data-action="year-prev">‹</button><div class="month-picker__year">' + s.year + '</div><button class="month-picker__yrbtn" data-action="year-next">›</button>';
    html += '</div><div class="month-picker__grid">';
    t.monthsShort.forEach(function (mm, i) {
      var active = s.month === i;
      html += '<button class="month-picker__opt" data-action="month-pick" data-month="' + i + '" style="background:' + (active ? 'var(--red)' : 'transparent') + ';color:' + (active ? '#fff' : 'var(--ink)') + '">' + mm + '</button>';
    });
    html += '</div></div>';
  }

  html += '<div class="tabs">';
  [['highlights', t.highlights], ['checklist', t.checklist], ['points', t.points], ['score', t.score]].forEach(function (td) {
    var active = s.tab === td[0];
    html += '<button class="tabs__btn" data-action="tab-pick" data-tab="' + td[0] + '" style="background:' + (active ? 'var(--ink)' : 'transparent') + ';color:' + (active ? 'var(--paper)' : 'var(--ink)') + '">' + esc(td[1]) + '</button>';
  });
  html += '</div>';

  if (s.tab === 'highlights') html += renderHighlights(t, L, s, nDays, todayK);
  else if (s.tab === 'checklist') html += renderChecklist(t, L, s, nDays, stats, todayK);
  else if (s.tab === 'points') html += renderPoints(t, s, nDays, stats, pct);
  else if (s.tab === 'score') html += renderScoreTab(t, L, s, nDays, stats, pct);

  html += '</div>';
  return html;
}

function renderHighlights(t, L, s, nDays, todayK) {
  var favCount = 0;
  var html = '<div><div class="section-heading"><h2 class="section-heading__title">' + esc(t.dailyHighlights) + '</h2>';
  var favCountPlaceholder = '<span class="section-heading__sub" id="fav-count-label"></span></div>';
  html += favCountPlaceholder;
  html += '<div class="day-list">';
  for (var d = 1; d <= nDays; d++) {
    var k = dayKey(d);
    var rec = dayRec(k);
    var locked = isLocked(d);
    var isToday = k === todayK;
    if (rec.fav) favCount++;
    var edge = rec.fav ? 'var(--red)' : (isToday ? 'var(--hard)' : 'transparent');
    var rowBg = rec.fav ? 'rgba(236,48,19,.10)' : 'transparent';
    var numColor = rec.fav ? 'var(--red)' : (locked ? 'var(--line)' : 'var(--ink)');
    var favBorder = rec.fav ? 'var(--red)' : 'var(--line)';
    var favColor = rec.fav ? 'var(--red)' : 'var(--dim)';
    var favFill = rec.fav ? 'var(--red)' : 'none';
    var dow = t.dows[new Date(s.year, s.month, d).getDay()];
    html += '<div class="day-row" style="border-left-color:' + edge + ';background:' + rowBg + '">';
    html += '<span class="day-row__num"><span class="day-row__num-val" style="color:' + numColor + '">' + pad(d) + '</span><span class="day-row__dow">' + dow + '</span></span>';
    html += '<input class="day-row__input" data-field="day-text" data-day="' + d + '" value="' + esc(rec.text) + '"' + (locked ? ' disabled' : '') + ' placeholder="' + esc(locked ? t.lockedPlaceholder : t.dayPlaceholder) + '">';
    html += '<button class="day-row__fav" data-action="day-fav" data-day="' + d + '"' + (locked ? ' disabled' : '') + ' aria-label="favorite" style="border-color:' + favBorder + ';color:' + favColor + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="' + favFill + '" stroke="currentColor" stroke-width="2"><path d="M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.2L12 17.7 6.4 20.2l1.2-6.2L3 9.6l6.3-.8z"></path></svg></button>';
    html += '</div>';
  }
  html += '</div>';

  var noteKey = s.year + '-' + pad(s.month + 1);
  var noteOpen = (s.year + '-' + pad(s.month + 1) + '-' + pad(nDays)) <= todayK;
  html += '<div class="month-note"><div class="month-note__label">' + esc(t.monthThought) + '</div>';
  html += '<textarea class="month-note__area" data-field="month-note" rows="4"' + (noteOpen ? '' : ' disabled') + ' placeholder="' + esc(noteOpen ? t.monthNoteOpen : t.monthNotePlaceholder) + '">' + esc(state.data.notes[noteKey] || '') + '</textarea></div>';
  html += '</div>';
  // fill in fav count label (built after loop since count is known only afterwards)
  html = html.replace('<span class="section-heading__sub" id="fav-count-label"></span>', favCount ? '<span class="section-heading__sub">' + favCount + ' ' + esc(t.favs) + '</span>' : '');
  return html;
}

function axisDayCell(d, todayK, topFirst) {
  var lab = pad(d);
  var color = dayKey(d) === todayK ? 'var(--red)' : 'var(--dim)';
  var tick = (d % 5 === 0 || d === 1) ? 'var(--hard)' : 'transparent';
  if (topFirst) {
    return '<span class="axis-day" style="color:' + color + '"><span class="axis-day__tick axis-day__tick--top" style="background:' + tick + '"></span><span>' + lab[0] + '</span><span>' + lab[1] + '</span></span>';
  }
  return '<span class="axis-day" style="color:' + color + '"><span>' + lab[0] + '</span><span>' + lab[1] + '</span><span class="axis-day__tick" style="background:' + tick + '"></span></span>';
}

function renderChecklist(t, L, s, nDays, stats, todayK) {
  var refDay = (s.year === new Date().getFullYear() && s.month === new Date().getMonth()) ? new Date().getDate() : nDays;
  var streaks = HABITS.map(function (h, hi) {
    var st = 0;
    for (var d = refDay; d >= 1; d--) { var rec = dayRec(dayKey(d)); if (rec.h && rec.h[hi]) st++; else break; }
    return st;
  });
  var html = '<div><div class="section-heading"><h2 class="section-heading__title">' + esc(t.checklist) + '</h2><span class="section-heading__sub">' + esc(t.tapHint) + '</span></div>';
  html += '<div class="checklist"><div class="checklist__axis">';
  for (var d1 = 1; d1 <= nDays; d1++) html += axisDayCell(d1, todayK, true);
  html += '</div>';
  HABITS.forEach(function (h, hi) {
    html += '<div class="checklist-row"><div class="checklist-row__head"><div class="checklist-row__left">';
    html += '<span class="checklist-row__num">' + pad(hi + 1) + '</span><span class="checklist-row__name">' + esc(h[L]) + '</span>';
    html += '<span class="checklist-row__streak">' + (streaks[hi] >= 2 ? '▲ ' + streaks[hi] : '') + '</span></div>';
    html += '<span class="checklist-row__score">' + stats.per[hi] + '/' + nDays + '</span></div>';
    html += '<div class="checklist-row__cells">';
    for (var d = 1; d <= nDays; d++) {
      var k = dayKey(d);
      var rec = dayRec(k);
      var on = !!(rec.h && rec.h[hi]);
      var locked = isLocked(d);
      html += '<button class="checklist-cell" data-action="checklist-cell" data-day="' + d + '" data-habit="' + hi + '"' + (locked ? ' disabled' : '') + ' aria-label="' + esc(h[L]) + ' ' + pad(d) + (on ? ' Y' : ' N') + '" style="background:' + (on ? 'var(--red)' : 'transparent') + ';border-color:' + (on ? 'var(--red)' : (locked ? 'var(--line)' : 'var(--hard)')) + '"></button>';
    }
    html += '</div></div>';
  });
  html += '</div></div>';
  return html;
}

function renderPoints(t, s, nDays, stats, pct) {
  var H = 200;
  var html = '<div><div class="section-heading"><h2 class="section-heading__title">' + esc(t.points) + '</h2>';
  html += '<div class="points-total"><span class="points-total__num">' + stats.total + ' / ' + stats.max + '</span><span class="points-total__pct">' + pct + '% · ' + t.monthsShort[s.month] + ' ' + s.year + '</span></div></div>';
  html += '<div class="points-chart"><div class="points-yaxis">';
  for (var v = 8; v >= 0; v--) html += '<span class="points-yaxis__val">' + v + '</span>';
  html += '</div><div class="points-plot"><div class="points-plot__area">';
  for (var g = 8; g >= 0; g--) html += '<span class="points-gridline' + (g === 0 ? '' : ' points-gridline--dashed') + '" style="top:' + r1((1 - g / 8) * 100) + '%"></span>';
  html += '<div class="points-bars">';
  var todayK = todayKey();
  for (var d = 1; d <= nDays; d++) {
    var locked = isLocked(d);
    var rec = dayRec(dayKey(d));
    var p = locked ? 0 : (rec.h || []).filter(Boolean).length;
    var fill = p >= 8 ? 'var(--red)' : (p >= 5 ? 'var(--hard)' : 'var(--line)');
    html += '<span class="points-bar" style="height:' + r1((p / 8) * 100) + '%;background:' + fill + '"></span>';
  }
  html += '</div></div>';
  html += '<div class="points-xaxis">';
  for (var d2 = 1; d2 <= nDays; d2++) html += axisDayCell(d2, todayK, false);
  html += '</div></div></div></div>';
  return html;
}

function renderScoreTab(t, L, s, nDays, stats, pct) {
  var refDay = (s.year === new Date().getFullYear() && s.month === new Date().getMonth()) ? new Date().getDate() : nDays;
  var streaks = HABITS.map(function (h, hi) {
    var st = 0;
    for (var d = refDay; d >= 1; d--) { var rec = dayRec(dayKey(d)); if (rec.h && rec.h[hi]) st++; else break; }
    return st;
  });
  var monthBadge = badge(rankFor(pct));
  var html = '<div><div class="score-tab-card corners">';
  html += '<span class="corner corner--tl"></span><span class="corner corner--br"></span>';
  html += '<img class="badge-img badge-img--md" src="' + esc(monthBadge.src) + '" alt="">';
  html += '<div class="rank-line"><div class="rank-line__num">' + monthBadge.rank + '</div>';
  html += '<div class="rank-line__meta"><span class="rank-line__rule"></span><span style="font-family:Doto,Archivo,sans-serif;font-size:16px;font-weight:800">' + stats.total + ' / ' + stats.max + '</span><span class="rank-line__pct">' + pct + '% · ' + t.monthsShort[s.month] + ' ' + s.year + '</span></div></div>';
  html += '</div>';
  html += '<div class="habit-scores">';
  HABITS.forEach(function (h, hi) {
    var hot = streaks[hi] >= 2;
    var p = Math.round((stats.per[hi] / nDays) * 100);
    html += '<div class="habit-score-row" style="border-left-color:' + (hot ? 'var(--red)' : 'transparent') + ';background:' + (hot ? 'rgba(236,48,19,.09)' : 'transparent') + '">';
    html += '<span class="habit-score-row__num">' + pad(hi + 1) + '</span>';
    html += '<span class="habit-score-row__body"><span class="habit-score-row__top"><span class="habit-score-row__name" style="color:' + (hot ? 'var(--red)' : 'var(--ink)') + '">' + esc(h[L]) + '</span><span class="habit-score-row__streak">' + (hot ? t.streak + ' ' + streaks[hi] : '') + '</span></span>';
    html += '<span class="habit-score-row__bar"><span class="habit-score-row__bar-fill" style="width:' + p + '%;background:' + (hot ? 'var(--red)' : 'var(--hard)') + '"></span></span></span>';
    html += '<span class="habit-score-row__val" style="color:' + (hot ? 'var(--red)' : 'var(--ink)') + '">' + stats.per[hi] + ' / ' + nDays + '</span>';
    html += '</div>';
  });
  html += '</div></div>';
  return html;
}

function renderDestacados(t, s, nowD) {
  var favKeys = Object.keys(s.data.days).filter(function (k) { return s.data.days[k].fav; });
  var favYears = {};
  favKeys.forEach(function (k) { favYears[k.slice(0, 4)] = true; });
  var yearList = Object.keys(favYears).sort().reverse();
  if (!yearList.length) yearList.push(String(nowD.getFullYear()));

  var html = '<div><div class="fav-modes">';
  [['all', t.all], ['year', t.byYear]].forEach(function (o) {
    var active = s.favMode === o[0];
    html += '<button class="fav-mode-btn" data-action="fav-mode" data-mode="' + o[0] + '" style="background:' + (active ? 'var(--ink)' : 'transparent') + ';color:' + (active ? 'var(--paper)' : 'var(--ink)') + '">' + esc(o[1]) + '</button>';
  });
  html += '</div>';

  if (s.favMode === 'year') {
    html += '<div class="fav-years">';
    yearList.forEach(function (y) {
      var active = String(s.favYear) === y;
      html += '<button class="fav-year-btn" data-action="fav-year" data-year="' + y + '" style="background:' + (active ? 'var(--red)' : 'transparent') + ';color:' + (active ? '#fff' : 'var(--ink)') + '">' + y + '</button>';
    });
    html += '</div>';
  }

  var favList = favKeys.filter(function (k) { return s.favMode === 'all' || k.slice(0, 4) === String(s.favYear); })
    .sort().reverse().map(function (k) { return { date: k.slice(8, 10) + '/' + k.slice(5, 7), year: k.slice(0, 4), text: s.data.days[k].text || '—' }; });

  if (favList.length) {
    html += '<div class="fav-list">';
    favList.forEach(function (f) {
      html += '<div class="fav-item"><span class="fav-item__dt"><span class="fav-item__date">' + f.date + '</span><span class="fav-item__year">' + f.year + '</span></span><span class="fav-item__text">' + esc(f.text) + '</span></div>';
    });
    html += '</div>';
  } else {
    html += '<p class="empty-note">' + esc(t.noFavs) + '</p>';
  }
  html += '</div>';
  return html;
}

function renderPrincipios(t, L, s) {
  var html = '<div><p class="principles-intro">' + esc(t.principlesIntro) + '</p><div>';
  s.data.principles.forEach(function (raw, i) {
    var lines = String(raw).split('\n').filter(function (x) { return x.trim(); });
    var title = lines.length ? lines[0].replace(/^[-•]\s*/, '') : '';
    var bullets = lines.slice(1).map(function (x, bi) { return { i: pad(bi + 1), text: x.replace(/^[-•]\s*/, '') }; });
    html += '<article class="principle"><div class="principle__head">';
    html += '<span class="principle__num">' + pad(i + 1) + '</span>';
    html += '<svg class="principle__icon" viewBox="0 0 48 48" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="miter">' + paths(PSYM[i]) + '</svg>';
    html += '<span class="principle__rule"></span><span class="principle__habit">' + esc(HABITS[i][L]) + '</span></div>';
    if (s.editing) {
      var rows = Math.min(18, lines.length + 2);
      html += '<textarea class="principle__edit" data-field="principle-edit" data-index="' + i + '" rows="' + rows + '">' + esc(raw) + '</textarea>';
    } else {
      html += '<div><h3 class="principle__title">' + esc(title) + '</h3><ul class="principle__bullets">';
      bullets.forEach(function (b) { html += '<li class="principle__bullet"><span class="principle__bullet-i">' + b.i + '</span><span>' + esc(b.text) + '</span></li>'; });
      html += '</ul></div>';
    }
    html += '</article>';
  });
  html += '</div>';

  html += '<section class="never-section"><h2 class="never-section__title">' + esc(t.neverForget) + '</h2><div class="never-section__sub">' + esc(t.neverForgetSub) + '</div>';
  html += '<div class="never-list">';
  s.data.never.forEach(function (n, i) {
    var at = (n.at || '').slice(5).replace('-', '/');
    html += '<div class="never-item"><span class="never-item__at">' + at + '</span><span class="never-item__text">' + esc(n.text) + '</span><button class="never-item__del" data-action="never-del" data-index="' + i + '">×</button></div>';
  });
  html += '</div>';
  html += '<div class="never-form"><textarea class="never-form__area" data-field="never-draft" rows="2" placeholder="' + esc(t.nfPlaceholder) + '">' + esc(s.nfDraft) + '</textarea>';
  html += '<button class="accept-btn" data-action="never-add">' + esc(t.accept) + '</button></div></section>';

  html += '<button class="edit-toggle-btn" data-action="principles-edit-toggle">' + esc(s.editing ? t.done : t.edit) + '</button>';
  html += '</div>';
  return html;
}

function renderMeditacion(t, s) {
  var durs = [3, 5, 10, 15, 20, 25, 30, 45, 60];
  var left = s.med.running ? s.med.left : s.med.dur * 60;
  var clock = Math.floor(left / 60) + ':' + pad(left % 60);
  var elapsed = s.med.running ? 1 - left / (s.med.dur * 60) : 0;
  var C = 2 * Math.PI * 84;
  var handA = (-90 + 360 * elapsed) * Math.PI / 180;
  var handX = r1(100 + 74 * Math.cos(handA));
  var handY = r1(100 + 74 * Math.sin(handA));

  var html = '<div class="med-screen"><div class="med-pick-label">' + esc(t.pick) + '</div><div class="med-durations">';
  durs.forEach(function (d) {
    var active = s.med.dur === d;
    html += '<button class="med-dur-btn" data-action="med-dur" data-dur="' + d + '"' + (s.med.running ? ' disabled' : '') + ' style="background:' + (active ? 'var(--red)' : 'transparent') + ';color:' + (active ? '#fff' : 'var(--ink)') + ';border-color:' + (active ? 'var(--red)' : 'var(--line)') + '">' + (d === 60 ? '1 hr' : d + "'") + '</button>';
  });
  html += '</div><div class="med-stage">';
  html += '<button class="med-clock" data-action="med-clock" data-glow="1"><svg class="med-clock__svg" viewBox="0 0 200 200">';
  html += '<circle cx="100" cy="100" r="94" fill="none" stroke="var(--line)" stroke-width="1"></circle>';
  html += '<circle cx="100" cy="100" r="84" fill="none" stroke="var(--line)" stroke-width="6" stroke-dasharray="1 5"></circle>';
  html += '<circle cx="100" cy="100" r="84" fill="none" stroke="var(--red)" stroke-width="6" stroke-dasharray="' + r1(C * elapsed) + ' ' + r1(C) + '" transform="rotate(-90 100 100)"></circle>';
  html += '<line x1="100" y1="4" x2="100" y2="18" stroke="var(--ink)" stroke-width="2"></line>';
  html += '<line x1="100" y1="182" x2="100" y2="196" stroke="var(--ink)" stroke-width="2"></line>';
  html += '<line x1="4" y1="100" x2="18" y2="100" stroke="var(--ink)" stroke-width="2"></line>';
  html += '<line x1="182" y1="100" x2="196" y2="100" stroke="var(--ink)" stroke-width="2"></line>';
  html += '<line x1="100" y1="100" x2="' + handX + '" y2="' + handY + '" stroke="var(--red)" stroke-width="2" opacity="' + (s.med.running ? 1 : 0) + '"></line>';
  html += '</svg><span class="med-clock__center"><span class="med-clock__time">' + clock + '</span><span class="med-clock__hint">' + esc(s.med.running ? t.running : t.start) + '</span></span></button>';
  if (s.med.running) html += '<button class="med-stop-btn" data-action="med-stop">' + esc(t.stop) + '</button>';
  if (!s.data.music) html += '<p class="med-no-music">' + esc(t.noMusic) + '</p>';
  html += '</div></div>';
  return html;
}

function renderDeseos(t, s) {
  var wf = s.wishFilter || 'all';
  var wishes = s.data.wishes.map(function (w, i) {
    var keep = wf === 'all' || (wf === 'done' ? !!w.done : !w.done);
    return { i: i, title: w.title, desc: w.desc || '', done: w.done, keep: keep };
  }).filter(function (w) { return w.keep; });

  var html = '<div style="padding-top:18px">';
  html += '<div class="wish-legend"><span class="wish-legend__rule"></span><blockquote class="wish-legend__quote">' + esc(t.wishLegend) + '</blockquote><span class="wish-legend__rule"></span></div>';
  html += '<div class="wish-toolbar"><div class="wish-filters">';
  [['all', t.fAll], ['open', t.fOpen], ['done', t.fDone]].forEach(function (o) {
    var active = wf === o[0];
    html += '<button class="wish-filter-btn" data-action="wish-filter" data-filter="' + o[0] + '" style="background:' + (active ? 'var(--ink)' : 'transparent') + ';color:' + (active ? 'var(--paper)' : 'var(--ink)') + '">' + esc(o[1]) + '</button>';
  });
  html += '</div><button class="wish-add-btn" data-action="wish-modal-open"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6"><path d="M12 5v14M5 12h14"></path></svg><span>' + esc(t.add) + '</span></button></div>';

  html += '<div class="wish-list">';
  wishes.forEach(function (w) {
    html += '<div class="wish-item"><button class="wish-item__toggle' + (w.done ? ' wish-item__toggle--done' : '') + '" data-action="wish-toggle" data-index="' + w.i + '" style="border-color:' + (w.done ? 'var(--red)' : 'var(--hard)') + '"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" opacity="' + (w.done ? 1 : 0) + '"><path d="M5 13l4 4 10-11"></path></svg></button>';
    html += '<span class="wish-item__body"><span class="wish-item__title' + (w.done ? ' wish-item__title--done' : '') + '">' + esc(w.title) + '</span><span class="wish-item__desc">' + esc(w.desc) + '</span></span>';
    html += '<button class="wish-item__del" data-action="wish-del" data-index="' + w.i + '">×</button></div>';
  });
  html += '</div>';
  if (!wishes.length) html += '<p class="empty-note">' + esc(t.noWishes) + '</p>';
  html += '</div>';
  return html;
}

function renderSettingsModal(t, s) {
  var html = '<div class="modal-overlay"><div class="modal-sheet">';
  html += '<div class="modal-sheet__head"><h2 class="modal-sheet__title">' + esc(t.settings) + '</h2><button class="modal-close" data-action="settings-close">×</button></div>';

  html += '<div class="settings-section"><div class="settings-section__label">' + esc(t.appearance) + '</div><div class="settings-toggle">';
  [['paper', t.paper], ['dark', t.dark]].forEach(function (o) {
    var active = s.theme === o[0];
    html += '<button class="settings-toggle__btn" data-action="theme-set" data-theme-value="' + o[0] + '" style="background:' + (active ? 'var(--ink)' : 'transparent') + ';color:' + (active ? 'var(--paper)' : 'var(--ink)') + '">' + esc(o[1]) + '</button>';
  });
  html += '</div></div>';

  html += '<div class="settings-section"><div class="settings-section__label">' + esc(t.language) + '</div><div class="settings-toggle">';
  [['es', 'Español'], ['en', 'English']].forEach(function (o) {
    var active = s.lang === o[0];
    html += '<button class="settings-toggle__btn" data-action="lang-set" data-lang="' + o[0] + '" style="background:' + (active ? 'var(--ink)' : 'transparent') + ';color:' + (active ? 'var(--paper)' : 'var(--ink)') + '">' + esc(o[1]) + '</button>';
  });
  html += '</div></div>';

  html += '<div class="settings-section"><div class="settings-section__label">' + esc(t.music) + '</div>';
  html += '<div class="settings-music__label">' + esc(s.data.music ? s.data.music.name : t.noMusicSet) + '</div>';
  html += '<div class="settings-row"><label class="upload-btn">' + esc(t.uploadMusic) + '<input class="file-input" type="file" accept="audio/*" data-action="music-file"></label>';
  if (s.data.music) html += '<button class="remove-btn" data-action="music-clear">' + esc(t.remove) + '</button>';
  html += '</div></div>';

  html += '<div class="settings-section settings-section--last"><div class="settings-section__label">' + esc(t.data) + '</div>';
  html += '<div class="settings-row"><button class="export-btn" data-action="data-export">' + esc(t.export) + '</button>';
  html += '<label class="import-label">' + esc(t.import) + '<input class="file-input" type="file" accept="application/json,.json" data-action="import-file"></label></div>';
  html += '<div class="status-msg">' + esc(s.status) + '</div></div>';

  html += '</div></div>';
  return html;
}

function renderWishModal(t, s) {
  var html = '<div class="modal-overlay"><div class="modal-sheet modal-sheet--wish corners"><span class="corner corner--tl"></span>';
  html += '<div class="modal-sheet__head"><div class="modal-sheet__title--accent">' + esc(t.newWish) + '</div><button class="modal-close" data-action="wish-modal-close">×</button></div>';
  html += '<div class="wish-modal-body">';
  html += '<label class="wish-field"><span class="wish-field__label">' + esc(t.wishTitleLabel) + '</span><input class="wish-field__input" data-field="wish-draft" value="' + esc(s.wishDraft) + '" placeholder="' + esc(t.wishPlaceholder) + '"></label>';
  html += '<label class="wish-field"><span class="wish-field__label">' + esc(t.wishDescLabel) + '</span><textarea class="wish-field__area" data-field="wish-desc" rows="4" placeholder="' + esc(t.wishDescPlaceholder) + '">' + esc(s.wishDesc) + '</textarea></label>';
  html += '<div class="wish-modal-actions"><button class="accept-btn" data-action="wish-add">' + esc(t.accept) + '</button><button class="cancel-btn" data-action="wish-modal-close">' + esc(t.cancel) + '</button></div>';
  html += '</div></div></div>';
  return html;
}

function renderMedAskModal(t) {
  var html = '<div class="center-overlay"><div class="center-card">';
  html += '<div class="center-card__kicker">' + esc(t.beforeStart) + '</div>';
  html += '<h3 class="center-card__title">' + esc(t.silence) + '</h3>';
  html += '<p class="center-card__body">' + esc(t.silenceBody) + '</p>';
  html += '<div class="center-card__actions"><button class="accept-btn" data-action="med-ready">' + esc(t.ready) + '</button><button class="cancel-btn" data-action="med-cancel">' + esc(t.cancel) + '</button></div>';
  html += '</div></div>';
  return html;
}

// ---------- event delegation ----------
var actions = {
  'nav-back': function () { if (state.med.running) endMed(true); state.screen = 'menu'; state.monthPicker = false; render(); },
  'menu-nav': function (el) { state.screen = el.getAttribute('data-screen'); state.monthPicker = false; render(); },
  'settings-open': function () { state.settingsOpen = true; render(); },
  'settings-close': function () { state.settingsOpen = false; state.status = ''; render(); },
  'year-prev': function () { state.year -= 1; render(); },
  'year-next': function () { state.year += 1; render(); },
  'month-toggle': function () { state.monthPicker = !state.monthPicker; render(); },
  'month-pick': function (el) { state.month = parseInt(el.getAttribute('data-month'), 10); state.monthPicker = false; render(); },
  'tab-pick': function (el) { state.tab = el.getAttribute('data-tab'); render(); },
  'day-fav': function (el) {
    var d = el.getAttribute('data-day'); var k = dayKey(parseInt(d, 10));
    var r = state.data.days[k] || { text: '', fav: false, h: [] };
    r.fav = !r.fav; state.data.days[k] = r; persistNow(); render();
  },
  'checklist-cell': function (el) {
    var d = parseInt(el.getAttribute('data-day'), 10), hi = parseInt(el.getAttribute('data-habit'), 10);
    var k = dayKey(d);
    var r = state.data.days[k] || { text: '', fav: false, h: [] };
    r.h = r.h || []; r.h[hi] = !r.h[hi]; state.data.days[k] = r; persistNow(); render();
  },
  'principles-edit-toggle': function () { state.editing = !state.editing; render(); },
  'never-add': function () {
    var v = (state.nfDraft || '').trim(); if (!v) return;
    state.data.never.unshift({ text: v, at: todayKey() }); state.nfDraft = ''; persistNow(); render();
  },
  'never-del': function (el) { var i = parseInt(el.getAttribute('data-index'), 10); state.data.never.splice(i, 1); persistNow(); render(); },
  'wish-modal-open': function () { state.wishModal = true; render(); },
  'wish-modal-close': function () { state.wishModal = false; render(); },
  'wish-add': function () {
    var v = (state.wishDraft || '').trim(); if (!v) return;
    state.data.wishes.unshift({ title: v, desc: (state.wishDesc || '').trim(), done: false });
    state.wishDraft = ''; state.wishDesc = ''; state.wishModal = false; persistNow(); render();
  },
  'wish-toggle': function (el) { var i = parseInt(el.getAttribute('data-index'), 10); state.data.wishes[i].done = !state.data.wishes[i].done; persistNow(); render(); },
  'wish-del': function (el) { var i = parseInt(el.getAttribute('data-index'), 10); state.data.wishes.splice(i, 1); persistNow(); render(); },
  'wish-filter': function (el) { state.wishFilter = el.getAttribute('data-filter'); render(); },
  'fav-mode': function (el) { state.favMode = el.getAttribute('data-mode'); render(); },
  'fav-year': function (el) { state.favYear = el.getAttribute('data-year'); render(); },
  'med-dur': function (el) { if (state.med.running) return; state.med.dur = parseInt(el.getAttribute('data-dur'), 10); render(); },
  'med-clock': function () { if (state.med.running) endMed(true); else { state.med.ask = true; render(); } },
  'med-ready': function () { startMed(); },
  'med-cancel': function () { state.med.ask = false; render(); },
  'med-stop': function () { endMed(true); },
  'theme-set': function (el) { state.theme = el.getAttribute('data-theme-value'); persistNow(); render(); },
  'lang-set': function (el) { state.lang = el.getAttribute('data-lang'); persistNow(); render(); },
  'data-export': function () { exportData(); },
  'music-clear': function () {
    idbDel(MUSIC_KEY)['finally'](function () { state.data.music = null; persistNow(); render(); });
  }
};

function onAppClick(e) {
  var el = e.target.closest('[data-action]');
  if (!el || el.disabled) return;
  var action = actions[el.getAttribute('data-action')];
  if (action) action(el);
}

function onAppChange(e) {
  var el = e.target;
  var action = el.getAttribute('data-action');
  if (action === 'music-file') {
    var f = el.files && el.files[0];
    if (f) musicFile(f);
  } else if (action === 'import-file') {
    var f2 = el.files && el.files[0];
    if (f2) importFile(f2);
  }
}

// text inputs mutate state directly and persist debounced — no re-render, so focus/caret stay put.
function onAppInput(e) {
  var el = e.target;
  var field = el.getAttribute('data-field');
  if (!field) return;
  var v = el.value;
  if (field === 'day-text') {
    var d = parseInt(el.getAttribute('data-day'), 10);
    var k = dayKey(d);
    var r = state.data.days[k] || { text: '', fav: false, h: [] };
    r.text = v; state.data.days[k] = r; persistSoon();
  } else if (field === 'month-note') {
    var noteKey = state.year + '-' + pad(state.month + 1);
    state.data.notes[noteKey] = v; persistSoon();
  } else if (field === 'principle-edit') {
    var i = parseInt(el.getAttribute('data-index'), 10);
    state.data.principles[i] = v; persistSoon();
  } else if (field === 'never-draft') {
    state.nfDraft = v;
  } else if (field === 'wish-draft') {
    state.wishDraft = v;
  } else if (field === 'wish-desc') {
    state.wishDesc = v;
  }
}

// ---------- boot ----------
function boot() {
  loadState();
  var root = document.getElementById('app');
  root.addEventListener('click', onAppClick);
  root.addEventListener('input', onAppInput);
  root.addEventListener('change', onAppChange);
  render();

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    // reload once when a new service worker takes over, so a shipped fix (new CSS/JS) shows up
    // immediately instead of waiting for the visitor to notice and hard-refresh themselves.
    var reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (reloading) return;
      reloading = true;
      location.reload();
    });
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js')['catch'](function () {});
    });
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
