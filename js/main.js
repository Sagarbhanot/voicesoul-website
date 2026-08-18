// ===========================================================
// VoiceSoul — Interactions
// ===========================================================

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Mobile nav ---------- */
const navBurger = document.getElementById('navBurger');
const mobileNav = document.getElementById('mobileNav');

navBurger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('is-open');
  navBurger.classList.toggle('is-open', isOpen);
  navBurger.setAttribute('aria-expanded', String(isOpen));
});

mobileNav.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('click', () => {
    mobileNav.classList.remove('is-open');
    navBurger.classList.remove('is-open');
    navBurger.setAttribute('aria-expanded', 'false');
  });
});

/* ---------- Demo request modal ---------- */
const demoOverlay = document.getElementById('demoModalOverlay');
const demoClose = document.getElementById('demoModalClose');
const demoForm = document.getElementById('demoForm');
const demoNote = document.getElementById('demoFormNote');

function openDemoModal() {
  demoOverlay.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  const firstField = document.getElementById('dfName');
  if (firstField) firstField.focus();
}

function closeDemoModal() {
  demoOverlay.classList.remove('is-open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.js-open-demo').forEach(btn => {
  btn.addEventListener('click', openDemoModal);
});

demoClose.addEventListener('click', closeDemoModal);
demoOverlay.addEventListener('click', (e) => {
  if (e.target === demoOverlay) closeDemoModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && demoOverlay.classList.contains('is-open')) closeDemoModal();
});
demoForm.addEventListener('submit', () => {
  demoNote.style.color = 'var(--primary-ink)';
  demoNote.textContent = 'Sending your request…';
});

/* ---------- Sticky nav shadow ---------- */
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => {
  navEl.style.boxShadow = window.scrollY > 12 ? '0 4px 24px rgba(0,0,0,0.3)' : 'none';
}, { passive: true });

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ---------- FAQ accordion ---------- */
document.querySelectorAll('.faq-item__q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item.is-open').forEach(open => {
      open.classList.remove('is-open');
      open.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
    });
    if (!wasOpen) {
      item.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ---------- Animated counters (dashboard) ---------- */
const counters = document.querySelectorAll('.dashboard__num');
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.4 });

counters.forEach(el => counterObserver.observe(el));

/* ---------- Simulated live demo ---------- */
const callBtn = document.getElementById('callBtn');
const callBtnLabel = document.getElementById('callBtnLabel');
const demoStatus = document.getElementById('demoStatus');
const demoTranscript = document.getElementById('demoTranscript');
const demoWave = document.getElementById('demoWave');

const dName = document.getElementById('dName');
const dInterest = document.getElementById('dInterest');
const dBudget = document.getElementById('dBudget');
const qIntent = document.getElementById('qIntent');
const qBudget = document.getElementById('qBudget');
const qTimeline = document.getElementById('qTimeline');
const aStatus = document.getElementById('aStatus');

const demoScript = [
  { t: 900,  status: 'Incoming call connecting…' },
  { t: 1600, status: 'VoiceSoul answered the call.', msg: { side: 'in', channel: '📞 Customer', text: 'Hi, I need a dental checkup and maybe a cleaning, sometime this week.' } },
  { t: 1400, status: 'AI is responding…', msg: { side: 'out', text: 'Of course! Have you visited our clinic before, and is there a specific day that works best for you?' } },
  { t: 1600, status: 'Listening…', msg: { side: 'in', text: 'First time. Maybe Thursday afternoon?' }, fill: { name: 'New Patient', interest: 'Checkup + Cleaning' } },
  { t: 1400, status: 'Qualifying the lead…', qual: 'intent' },
  { t: 1000, status: 'Checking availability…', qual: 'timeline' },
  { t: 1500, status: 'AI is responding…', msg: { side: 'out', text: 'I have an opening this Thursday at 3:30 PM with Dr. Sharma. Shall I book that for you?' } },
  { t: 1600, status: 'Listening…', msg: { side: 'in', text: 'Yes, please book it.' }, fill: { budget: 'Standard visit' } },
  { t: 1200, status: 'Confirming appointment…', qual: 'budget' },
  { t: 1200, status: 'Appointment booked.', system: '✅ Appointment booked · Reminder scheduled', appt: true },
];

let demoRunning = false;

function resetDemo() {
  demoTranscript.innerHTML = '';
  demoStatus.textContent = 'Ready when you are.';
  demoWave.classList.add('is-idle');
  [dName, dInterest, dBudget].forEach(el => el.textContent = '—');
  [qIntent, qBudget, qTimeline].forEach(el => { el.textContent = 'Pending'; el.className = 'pending'; });
  aStatus.textContent = 'Not booked';
  aStatus.className = 'pending';
}

function appendMsg({ side, channel, text }) {
  const div = document.createElement('div');
  div.className = `chat__msg chat__msg--${side}`;
  if (channel) {
    const span = document.createElement('span');
    span.className = 'chat__channel';
    span.textContent = channel;
    div.appendChild(span);
    div.appendChild(document.createTextNode(text));
  } else {
    div.textContent = text;
  }
  demoTranscript.appendChild(div);
  demoTranscript.scrollTop = demoTranscript.scrollHeight;
}

function appendSystem(text) {
  const div = document.createElement('div');
  div.className = 'chat__system';
  div.textContent = text;
  demoTranscript.appendChild(div);
  demoTranscript.scrollTop = demoTranscript.scrollHeight;
}

async function runDemo() {
  if (demoRunning) return;
  demoRunning = true;
  resetDemo();
  callBtnLabel.textContent = 'End Call';
  callBtn.classList.add('is-active');
  demoWave.classList.remove('is-idle');

  for (const step of demoScript) {
    await new Promise(res => setTimeout(res, step.t));
    if (!demoRunning) return;
    demoStatus.textContent = step.status;
    if (step.msg) appendMsg(step.msg);
    if (step.fill) {
      if (step.fill.name) dName.textContent = step.fill.name;
      if (step.fill.interest) dInterest.textContent = step.fill.interest;
      if (step.fill.budget) dBudget.textContent = step.fill.budget;
    }
    if (step.qual === 'intent') { qIntent.textContent = 'Confirmed'; qIntent.className = 'done'; }
    if (step.qual === 'timeline') { qTimeline.textContent = 'Confirmed'; qTimeline.className = 'done'; }
    if (step.qual === 'budget') { qBudget.textContent = 'Confirmed'; qBudget.className = 'done'; }
    if (step.system) appendSystem(step.system);
    if (step.appt) { aStatus.textContent = 'Booked — Thu 3:30 PM'; aStatus.className = 'done'; }
  }

  demoStatus.textContent = 'Call complete.';
  demoWave.classList.add('is-idle');
  callBtnLabel.textContent = 'Try VoiceSoul';
  callBtn.classList.remove('is-active');
  demoRunning = false;
}

callBtn.addEventListener('click', () => {
  if (demoRunning) {
    demoRunning = false;
    callBtnLabel.textContent = 'Try VoiceSoul';
    callBtn.classList.remove('is-active');
    demoStatus.textContent = 'Call ended.';
    demoWave.classList.add('is-idle');
    return;
  }
  runDemo();
});

resetDemo();
