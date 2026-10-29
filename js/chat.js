/* ---------- VoiceSoul chat assistant ----------
   Answers common questions from the FAQ, and sends visitor messages
   to the team by email (FormSubmit) with a copy saved in Netlify Forms. */
(function () {
  const ANSWERS = [
    { keys: ['what is', 'voicesoul', 'about', 'kya hai'], label: 'What is VoiceSoul?',
      text: 'VoiceSoul is an AI conversational workforce. It answers calls and WhatsApp messages, qualifies leads, follows up and books appointments for your business.' },
    { keys: ['price', 'pricing', 'cost', 'charge', 'plan', 'kitna', 'paisa'], label: 'Pricing',
      text: 'Pricing is based on conversation volume and your business requirements. Leave your details and our team will share a plan made for you.' },
    { keys: ['real estate', 'property', 'realtor', 'builder', 'broker'], label: 'Real estate',
      text: 'For real estate, VoiceSoul handles property enquiries, qualifies buyers and renters, and schedules site visits.' },
    { keys: ['dental', 'dentist', 'clinic', 'patient', 'doctor'], label: 'Dental clinics',
      text: 'For dental clinics, VoiceSoul handles patient enquiries, appointment booking, rescheduling and reminders.' },
    { keys: ['whatsapp'], text: 'Yes. VoiceSoul handles WhatsApp conversations end-to-end, from first message to booking.' },
    { keys: ['call', 'phone', 'voice'], text: 'Yes. VoiceSoul can answer inbound calls and hold natural conversations with your customers, 24/7.' },
    { keys: ['hindi', 'hinglish', 'language'], text: 'Yes. VoiceSoul can talk in Hinglish as well as English.' },
    { keys: ['appointment', 'booking', 'schedule'], text: 'Yes. VoiceSoul can schedule, confirm and reschedule appointments right inside the conversation.' },
    { keys: ['crm', 'integrat', 'calendar'], text: 'VoiceSoul is designed to connect with common CRMs and calendars, so qualified leads reach your existing systems.' },
    { keys: ['human', 'transfer', 'handoff', 'agent'], text: 'Yes. VoiceSoul hands the conversation to your team whenever a human touch is needed.' },
    { keys: ['how long', 'setup', 'implement', 'time'], text: 'Timelines depend on your setup and channels. Our team will walk you through it on a demo call.' }
  ];
  const MENU = ['What is VoiceSoul?', 'Pricing', 'Real estate', 'Dental clinics', 'Book a demo', 'Talk to our team'];

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button type="button" class="vs-chat-btn" aria-label="Open chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
    <div class="vs-chat" role="dialog" aria-label="VoiceSoul chat">
      <div class="vs-chat__head">
        <div class="vs-chat__avatar">VS</div>
        <div><p class="vs-chat__title">VoiceSoul Assistant</p><p class="vs-chat__status">Usually replies within 24 hours by email</p></div>
        <button type="button" class="vs-chat__close" aria-label="Close chat">✕</button>
      </div>
      <div class="vs-chat__body" aria-live="polite"></div>
      <form class="vs-chat__form"><input class="vs-chat__input" placeholder="Type your message…" autocomplete="off"><button class="vs-chat__send" type="submit">Send</button></form>
    </div>`;
  document.body.appendChild(wrap);

  const btn = wrap.querySelector('.vs-chat-btn');
  const box = wrap.querySelector('.vs-chat');
  const body = wrap.querySelector('.vs-chat__body');
  const form = wrap.querySelector('.vs-chat__form');
  const input = wrap.querySelector('.vs-chat__input');
  let started = false;
  let step = null;          // null = free chat; otherwise collecting contact details
  const lead = {};
  const transcript = [];

  function add(text, who) {
    const d = document.createElement('div');
    d.className = 'vs-msg vs-msg--' + who;
    d.textContent = text;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
    transcript.push((who === 'bot' ? 'Bot: ' : 'Visitor: ') + text);
  }
  function chips(list) {
    const d = document.createElement('div');
    d.className = 'vs-chips';
    list.forEach(l => {
      const c = document.createElement('button');
      c.type = 'button'; c.className = 'vs-chip'; c.textContent = l;
      c.onclick = () => { d.remove(); handle(l); };
      d.appendChild(c);
    });
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function bot(text, next) {
    const t = document.createElement('div');
    t.className = 'vs-typing'; t.textContent = 'typing…';
    body.appendChild(t); body.scrollTop = body.scrollHeight;
    setTimeout(() => { t.remove(); add(text, 'bot'); if (next) next(); }, 600);
  }
  function startContact() {
    step = 'name';
    bot("Sure! I'll pass your message to our team. What's your name?");
  }
  async function sendLead() {
    const data = {
      'Name': lead.name, 'Email': lead.email, 'Contact Number': lead.phone,
      'Message': lead.message, 'Chat Transcript': transcript.join('\n')
    };
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'chat-message', ...data }).toString()
      });
    } catch (e) {}
    fetch('https://formsubmit.co/ajax/mrktfox.india@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ ...data, _subject: '💬 New Chat Message — VoiceSoul Website', _template: 'table', _captcha: 'false', _replyto: lead.email })
    }).catch(() => {});
  }
  function handle(text) {
    add(text, 'user');
    const t = text.toLowerCase();
    if (step === 'name') { lead.name = text; step = 'email'; return bot(`Thanks ${text}! What's your email address? Our team will reply there.`); }
    if (step === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return bot('That email doesn’t look right. Could you type it again?');
      lead.email = text; step = 'phone'; return bot('And your phone number?');
    }
    if (step === 'phone') {
      if (text.replace(/\D/g, '').length < 7) return bot('Please share a valid phone number.');
      lead.phone = text; step = 'message'; return bot('Got it. What would you like to tell our team?');
    }
    if (step === 'message') {
      lead.message = text; step = null; sendLead();
      return bot(`Thank you, ${lead.name}! Your message has been sent. Our team will reply to ${lead.email} within 24 hours.`, () => chips(['What is VoiceSoul?', 'Pricing']));
    }
    if (t.includes('demo') || t.includes('book')) {
      return bot('Happy to set up a demo! Opening the booking form for you.', () => {
        box.classList.remove('is-open');
        const b = document.querySelector('.js-open-demo'); if (b) b.click();
      });
    }
    if (t.includes('team') || t.includes('talk') || t.includes('contact') || t.includes('message') || t.includes('baat')) return startContact();
    const hit = ANSWERS.find(a => (a.label && a.label.toLowerCase() === t) || a.keys.some(k => t.includes(k)));
    if (hit) return bot(hit.text, () => chips(['Book a demo', 'Talk to our team']));
    if (/^(hi|hello|hey|hii+|namaste)\b/.test(t)) return bot('Hello! How can I help you today?', () => chips(MENU));
    bot("I'm not sure about that one. Leave your details and our team will answer you by email.", () => chips(['Talk to our team', 'Book a demo']));
  }

  btn.onclick = () => {
    box.classList.toggle('is-open');
    if (!started) { started = true; bot('Hi! 👋 I’m the VoiceSoul assistant. How can I help you?', () => chips(MENU)); }
    if (box.classList.contains('is-open')) setTimeout(() => input.focus(), 250);
  };
  wrap.querySelector('.vs-chat__close').onclick = () => box.classList.remove('is-open');
  form.onsubmit = (e) => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ''; handle(v); };
})();
