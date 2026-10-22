const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const storeKey = 'englishPathProgressV2';
let progress = JSON.parse(localStorage.getItem(storeKey) || '{"xp":0,"correct":0,"streak":0,"lastDate":""}');
let questions = [], current = 0, selected = null, checked = false, quizCorrect = 0;

function saveProgress() {
  localStorage.setItem(storeKey, JSON.stringify(progress));
  updateDashboard();
}
function updateDashboard() {
  $('#xp').textContent = progress.xp;
  $('#correctCount').textContent = progress.correct;
  $('#streak').textContent = progress.streak;
  $('#xpBar').style.width = `${progress.xp % 100}%`;
}
function trackStudy() {
  const today = new Date().toISOString().slice(0,10);
  if (progress.lastDate !== today) {
    const yesterday = new Date(Date.now()-86400000).toISOString().slice(0,10);
    progress.streak = progress.lastDate === yesterday ? progress.streak + 1 : 1;
    progress.lastDate = today;
  }
}
function showView(id) {
  $$('.view').forEach(v => v.classList.toggle('active', v.id === id));
  $$('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.view === id));
  $('#nav').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
  if (id === 'practice' && !questions.length) loadQuestions();
}
$$('[data-view]').forEach(b => b.addEventListener('click', () => showView(b.dataset.view)));
$$('[data-go]').forEach(b => b.addEventListener('click', () => showView(b.dataset.go)));
$('#menuToggle').addEventListener('click', () => $('#nav').classList.toggle('open'));

const lessons = {
 grammar: `<div class="eyebrow">LESSON 01 · A1</div><h2>Cómo formar una frase en inglés</h2><p>Empieza por una frase corta. En inglés, el orden suele ser <b>sujeto + verbo + complemento</b>. En español a veces omitimos el sujeto, pero en inglés normalmente lo decimos.</p><div class="lesson-example"><strong>I study English.</strong><br>Yo estudio inglés.<br><strong>She likes music.</strong><br>A ella le gusta la música.<br><strong>We are at home.</strong><br>Estamos en casa.</div><h3>Tu fórmula</h3><ul><li><b>Sujeto:</b> quién hace o vive algo (I, you, he, she, we, they).</li><li><b>Verbo:</b> la acción o el estado (work, study, am, like).</li><li><b>Complemento:</b> información extra (English, at home, every day).</li></ul><p>Reto: escribe tres frases sobre ti. Por ejemplo: “I study English”, “I live in Spain”, “I like music”.</p>`,
 tobe: `<div class="eyebrow">LESSON 02 · A1</div><h2>El verbo “to be”</h2><p><i>To be</i> significa ser o estar. Es una de las primeras estructuras que necesitas dominar.</p><div class="lesson-example"><strong>I am</strong> ready. — Estoy preparado.<br><strong>You are</strong> happy. — Estás contento.<br><strong>He / She is</strong> at home. — Él / Ella está en casa.<br><strong>We / They are</strong> students. — Somos / Son estudiantes.</div><h3>Negativas y preguntas</h3><ul><li>Negativa: I am not tired. / She isn't here.</li><li>Pregunta: Are you ready? / Is he at home?</li><li>Respuestas cortas: Yes, I am. / No, she isn't.</li></ul><p>Error típico: no digas “I happy”. Necesitas el verbo: “I am happy”.</p>`,
 present: `<div class="eyebrow">LESSON 03 · A1</div><h2>Hablar de rutinas</h2><p>Usa el presente simple para hábitos y hechos. Con <b>he, she, it</b>, el verbo normalmente lleva <b>-s</b>.</p><div class="lesson-example"><strong>I work every day.</strong> — Trabajo todos los días.<br><strong>She works in a shop.</strong> — Ella trabaja en una tienda.<br><strong>They study English.</strong> — Ellos estudian inglés.</div><h3>Cómo hacer preguntas</h3><ul><li>I / you / we / they: Do you work?</li><li>He / she / it: Does she work?</li><li>Después de does, el verbo vuelve a su forma base: “Does she work?”, no “Does she works?”.</li></ul><p>Practica hablando de tu día: “I wake up… I have breakfast… I study…”.</p>`,
 questions: `<div class="eyebrow">LESSON 04 · A1</div><h2>Preguntas y frases negativas</h2><p>En presente simple usamos <b>do / don't</b> con I, you, we, they y <b>does / doesn't</b> con he, she, it.</p><div class="lesson-example"><strong>I don't understand.</strong> — No entiendo.<br><strong>She doesn't work here.</strong> — Ella no trabaja aquí.<br><strong>Do you speak English?</strong> — ¿Hablas inglés?<br><strong>Does he live here?</strong> — ¿Él vive aquí?</div><h3>Regla clave</h3><p>Con <i>does</i> y <i>doesn't</i>, el verbo principal no lleva -s: “He doesn't like coffee”.</p><p>Reto: crea una pregunta y una negativa sobre algo que haces cada día.</p>`,
 vocabulary: `<div class="eyebrow">LESSON 05 · A1–A2</div><h2>Vocabulario que puedes usar hoy</h2><p>Aprende expresiones completas, no solo palabras aisladas.</p><div class="lesson-example"><strong>I'm learning English.</strong> — Estoy aprendiendo inglés.<br><strong>Could you repeat that, please?</strong> — ¿Podrías repetirlo, por favor?<br><strong>I don't understand.</strong> — No lo entiendo.<br><strong>How do you say … in English?</strong> — ¿Cómo se dice … en inglés?<br><strong>I'm looking for…</strong> — Estoy buscando…</div><h3>Cómo memorizar</h3><ul><li>Aprende 5–8 expresiones al día.</li><li>Di cada frase en voz alta tres veces.</li><li>Escribe una frase propia y repásala mañana.</li></ul><p>Más adelante añadiremos collocations y expresiones avanzadas para B2–C1.</p>`,
 c1: `<div class="eyebrow">YOUR LONG-TERM GOAL</div><h2>Cómo llegar hacia C1</h2><p>El C1 no consiste solo en hacer test: significa comprender inglés exigente y expresarte con precisión en distintos contextos.</p><div class="lesson-example"><strong>Ahora:</strong> I think it's good.<br><strong>Más adelante:</strong> I believe this approach is particularly effective because…</div><h3>El camino</h3><ul><li><b>A1–A2:</b> frases, preguntas, tiempos básicos y vocabulario frecuente.</li><li><b>B1:</b> contar experiencias, explicar opiniones y escribir textos conectados.</li><li><b>B2:</b> argumentar con claridad y entender materiales más complejos.</li><li><b>C1:</b> captar matices, usar registros adecuados y expresarte con flexibilidad.</li></ul><p>No necesitas estudiar gramática avanzada hoy. Tu objetivo inmediato es formar frases correctas y entenderlas. Después elegiremos el examen que encaje contigo.</p>`
};
function showLesson(id) {
  $('#lessonContent').innerHTML = lessons[id] || lessons.grammar;
  $$('.lesson-choice').forEach(b => b.classList.toggle('selected', b.dataset.lesson === id));
}
$$('[data-lesson]').forEach(b => b.addEventListener('click', () => showLesson(b.dataset.lesson)));
$$('[data-topic]').forEach(b => b.addEventListener('click', () => {
  showView('learn');
  showLesson(b.dataset.topic === 'vocabulary' ? 'vocabulary' : b.dataset.topic === 'exam' ? 'c1' : 'grammar');
}));

async function loadQuestions() {
  try {
    const res = await fetch('/api/questions');
    questions = await res.json();
    current = 0; quizCorrect = 0; renderQuestion();
  } catch (e) {
    $('#questionText').textContent = 'No se han podido cargar las preguntas. Comprueba que el servidor Python esté iniciado.';
  }
}
function renderQuestion() {
  if (!questions.length) return;
  if (current >= questions.length) {
    $('#questionText').textContent = `¡Bloque terminado! Has acertado ${quizCorrect} de ${questions.length}.`;
    $('#questionHint').textContent = 'Repite la práctica para afianzar lo aprendido.';
    $('#options').innerHTML = '';
    $('#feedback').hidden = true;
    $('#checkBtn').textContent = 'Repetir práctica';
    $('#checkBtn').onclick = () => {current=0;quizCorrect=0;renderQuestion();};
    $('#skipBtn').textContent = 'Volver al inicio';
    $('#skipBtn').onclick = () => showView('dashboard');
    $('#questionCounter').textContent = 'Completado';
    $('#quizBar').style.width = '100%';
    return;
  }
  const q = questions[current];
  selected = null; checked = false;
  $('#quizCategory').textContent = q.category.toUpperCase();
  $('#questionCounter').textContent = `Pregunta ${current+1} de ${questions.length}`;
  $('#quizBar').style.width = `${current/questions.length*100}%`;
  $('#questionText').textContent = q.question;
  $('#questionHint').textContent = q.hint;
  $('#feedback').hidden = true; $('#feedback').className = 'feedback';
  $('#checkBtn').textContent = 'Comprobar respuesta →';
  $('#checkBtn').onclick = checkAnswer;
  $('#skipBtn').textContent = 'Saltar';
  $('#skipBtn').onclick = () => {current++;renderQuestion();};
  $('#options').innerHTML = '';
  q.options.forEach((option,i) => {
    const button = document.createElement('button');
    button.className = 'option';
    button.innerHTML = `<span class="option-letter">${String.fromCharCode(65+i)}</span><span></span>`;
    button.querySelector('span:last-child').textContent = option;
    button.addEventListener('click', () => {
      if (checked) return;
      selected = i;
      $$('.option').forEach(x => x.classList.remove('selected'));
      button.classList.add('selected');
    });
    $('#options').appendChild(button);
  });
}
async function checkAnswer() {
  if (current >= questions.length) return;
  if (checked) {current++;renderQuestion();return;}
  if (selected === null) {
    $('#feedback').textContent = 'Elige una respuesta antes de comprobar.';
    $('#feedback').hidden = false; return;
  }
  const q = questions[current];
  try {
    const res = await fetch('/api/check', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:q.id,answer:selected})});
    const result = await res.json();
    checked = true;
    $$('.option').forEach((b,i) => {
      b.disabled = true;
      if (i === q.answer) b.classList.add('correct');
      if (i === selected && !result.correct) b.classList.add('wrong');
    });
    $('#feedback').textContent = `${result.correct ? '¡Correcto! +10 XP. ' : 'Casi. La respuesta correcta es: ' + result.correctAnswer + '. '}${result.explanation}`;
    $('#feedback').classList.toggle('bad', !result.correct);
    $('#feedback').hidden = false;
    if (result.correct) {
      quizCorrect++; progress.xp += 10; progress.correct += 1; trackStudy(); saveProgress();
    }
    $('#checkBtn').textContent = current === questions.length-1 ? 'Ver resultado →' : 'Siguiente pregunta →';
  } catch (e) {
    $('#feedback').textContent = 'No se ha podido comprobar. Asegúrate de iniciar el servidor con python app.py.';
    $('#feedback').hidden = false;
  }
}

const translations = {
  "I|am|happy": "Yo estoy feliz.",
  "I|am|English": "Yo soy inglés / inglesa. (Para decir que estudio inglés: I study English.)",
  "I|am|at home": "Estoy en casa.",
  "I|am|a student": "Soy estudiante.",
  "I|am|every day": "Esta combinación no es natural; prueba “I study every day”.",
  "You|like|happy": "Te gusta estar feliz. (Más natural: You are happy.)",
  "You|like|English": "Te gusta el inglés.",
  "You|like|at home": "Te gusta estar en casa. (Más natural: You like being at home.)",
  "You|like|a student": "Esta combinación no es natural.",
  "You|like|every day": "Te gusta hacerlo todos los días; falta decir qué cosa.",
  "He|like|English": "A él le gusta el inglés. La forma correcta es “He likes English”.",
  "She|like|English": "A ella le gusta el inglés. La forma correcta es “She likes English”.",
};
function updateBuilder() {
  const subject = $('#builderSubject')?.value || 'I';
  const verb = $('#builderVerb')?.value || 'am';
  const object = $('#builderObject')?.value || 'happy';
  let actualVerb = verb;
  if (['He','She'].includes(subject) && ['like','work','study'].includes(verb)) {
    actualVerb = verb === 'study' ? 'studies' : verb + 's';
  }
  if (['He','She'].includes(subject) && verb === 'have') actualVerb = 'has';
  let sentence = `${subject} ${actualVerb} ${object}.`;
  if (verb === 'am' && subject !== 'I') {
    actualVerb = ['He','She'].includes(subject) ? 'is' : 'are';
    sentence = `${subject} ${actualVerb} ${object}.`;
  }
  if (verb === 'am' && ['English','every day'].includes(object)) {
    sentence = object === 'English' ? `${subject} study English.` : `${subject} study every day.`;
    if (['He','She'].includes(subject)) sentence = object === 'English' ? `${subject} studies English.` : `${subject} studies every day.`;
    if (['You','We','They'].includes(subject)) sentence = `${subject} study ${object === 'English' ? 'English' : 'every day'}.`;
  }
  if (verb === 'like' && object === 'happy') sentence = `${subject} ${actualVerb} being happy.`;
  if (verb === 'like' && object === 'at home') sentence = `${subject} ${actualVerb} being at home.`;
  if (verb === 'work' && ['happy','English','a student'].includes(object)) sentence = `${subject} ${actualVerb} ${object}.`;
  if (verb === 'study' && object === 'happy') sentence = `${subject} ${actualVerb} hard.`;
  if (verb === 'have' && object === 'happy') sentence = `${subject} ${actualVerb} a good day.`;
  if (verb === 'have' && object === 'English') sentence = `${subject} ${actualVerb} an English lesson.`;
  if (verb === 'have' && object === 'at home') sentence = `${subject} ${actualVerb} time at home.`;
  if (verb === 'have' && object === 'every day') sentence = `${subject} ${actualVerb} lessons every day.`;
  $('#builderSentence').textContent = sentence;
  let translation = translations[`${subject}|${verb}|${object}`];
  if (!translation) {
    const map = {am:'ser/estar',like:'gustar',work:'trabajar',study:'estudiar',have:'tener'};
    translation = `Pista: “${subject}” + “${actualVerb}” (${map[verb]}) + complemento. Di la frase en voz alta y comprueba su sentido.`;
  }
  $('#builderTranslation').textContent = translation;
}
['builderSubject','builderVerb','builderObject'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('change', updateBuilder);
});

showLesson('grammar');
updateBuilder();
updateDashboard();
