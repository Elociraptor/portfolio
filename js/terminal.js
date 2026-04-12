/* ============================================================
   terminal.js — Typewriter effect for Hero terminal window
   22ms per char, 60ms pause between lines
   ============================================================ */

const TERMINAL_LINES = {
  de: [
    { type: 'cmd',   text: '$ cat about.md' },
    { type: 'blank', text: '' },
    { type: 'kv',    key: 'name',    val: 'Ole Marwede' },
    { type: 'kv',    key: 'degree',  val: 'B.Sc. Medieninformatik' },
    { type: 'kv',    key: 'school',  val: 'HTW Berlin' },
    { type: 'kv',    key: 'gpa',     val: '1.15' },
    { type: 'blank', text: '' },
    { type: 'text',  text: 'Medieninformatik-Student an der HTW Berlin' },
    { type: 'text',  text: 'mit einer Leidenschaft für Coding, Computer und Sport.' },
    { type: 'text',  text: 'Ich liebe es, Probleme zu lösen und' },
    { type: 'text',  text: 'neue Dinge auszuprobieren.' },
    { type: 'blank', text: '' },
    { type: 'kv',    key: 'status',  val: 'available · Berlin' },
    { type: 'kv',    key: 'github',  val: 'Elociraptor' },
    { type: 'blank', text: '' },
  ],
  en: [
    { type: 'cmd',   text: '$ cat about.md' },
    { type: 'blank', text: '' },
    { type: 'kv',    key: 'name',    val: 'Ole Marwede' },
    { type: 'kv',    key: 'degree',  val: 'B.Sc. Media Informatics' },
    { type: 'kv',    key: 'school',  val: 'HTW Berlin' },
    { type: 'kv',    key: 'gpa',     val: '1.15' },
    { type: 'blank', text: '' },
    { type: 'text',  text: 'Media Computer Science student at HTW Berlin' },
    { type: 'text',  text: 'with a passion for coding, computers, and sports.' },
    { type: 'text',  text: 'I love solving problems and trying out new things.' },
    { type: 'blank', text: '' },
    { type: 'kv',    key: 'status',  val: 'available · Berlin' },
    { type: 'kv',    key: 'github',  val: 'Elociraptor' },
    { type: 'blank', text: '' },
  ],
};

const CHAR_DELAY  = 22;
const LINE_DELAY  = 60;

let termTimeout = null;
let currentLang = 'de';

function buildLineHTML(line) {
  switch (line.type) {
    case 'cmd':
      return `<span class="t-cmd">${escHtml(line.text)}</span>`;
    case 'blank':
      return '&nbsp;';
    case 'kv': {
      const pad = 8 - line.key.length;
      const spaces = '&nbsp;'.repeat(Math.max(pad, 1));
      return `<span class="t-indent"><span class="t-key">${escHtml(line.key)}:</span>${spaces}<span class="t-val">${escHtml(line.val)}</span></span>`;
    }
    case 'text':
      return `<span class="t-indent t-line">${escHtml(line.text)}</span>`;
    default:
      return escHtml(line.text);
  }
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function typewriterLine(container, lineHTML, callback) {
  // Create a temporary div to render HTML, then get textContent for typing
  // For lines with HTML tags, we type the visible text and reveal the span afterwards
  const span = document.createElement('div');
  span.style.display = 'block';
  container.appendChild(span);

  // For blank lines, just add immediately
  if (lineHTML === '&nbsp;') {
    span.innerHTML = '&nbsp;';
    setTimeout(callback, LINE_DELAY);
    return;
  }

  // Extract visible text from HTML
  const tmp = document.createElement('div');
  tmp.innerHTML = lineHTML;
  const visibleText = tmp.textContent;

  let i = 0;
  function typeChar() {
    if (i < visibleText.length) {
      // Build partial visible text, wrapped in original structure
      const partial = visibleText.slice(0, i + 1);
      span.textContent = partial;
      i++;
      termTimeout = setTimeout(typeChar, CHAR_DELAY);
    } else {
      // Replace with proper highlighted HTML
      span.innerHTML = lineHTML;
      setTimeout(callback, LINE_DELAY);
    }
  }
  typeChar();
}

function runTerminal(lang) {
  currentLang = lang;
  const output = document.getElementById('term-output');
  if (!output) return;

  // Clear previous
  if (termTimeout) clearTimeout(termTimeout);
  output.innerHTML = '';

  const lines = TERMINAL_LINES[lang];
  let idx = 0;

  function nextLine() {
    if (idx >= lines.length) {
      // Add final prompt with cursor
      const prompt = document.createElement('div');
      prompt.innerHTML = `<span class="t-cmd">$ </span><span class="t-cursor"></span>`;
      output.appendChild(prompt);
      return;
    }
    const line = lines[idx++];
    typewriterLine(output, buildLineHTML(line), nextLine);
  }

  nextLine();
}

// Expose for main.js to call on language switch
window.runTerminal = runTerminal;

document.addEventListener('DOMContentLoaded', () => {
  runTerminal('de');
});
