/* ---------- VoiceSoul chat assistant ----------
   Collects name, email and phone before the chat starts, then sends the
   chat start and every visitor message to the team's Google Chat space,
   with a copy saved in Netlify Forms. */
(function () {
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <button type="button" class="vs-chat-btn" aria-label="Open chat">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
    <div class="vs-chat" role="dialog" aria-label="VoiceSoul chat">
      <div class="vs-chat__head">
        <div class="vs-chat__avatar">VS</div>
        <div><p class="vs-chat__title">VoiceSoul Assistant</p><p class="vs-chat__status">Chat with the VoiceSoul team</p></div>
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
  let step = 'name';        // name -> email -> phone -> chat
  let acked = false;
  const lead = {};

  function add(text, who) {
    const d = document.createElement('div');
    d.className = 'vs-msg vs-msg--' + who;
    d.textContent = text;
    body.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  function bot(text) {
    const t = document.createElement('div');
    t.className = 'vs-typing'; t.textContent = 'typing…';
    body.appendChild(t); body.scrollTop = body.scrollHeight;
    setTimeout(() => { t.remove(); add(text, 'bot'); }, 600);
  }
  const session = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  // Sends to the team's Google Chat (via /api/chat) and keeps a copy in Netlify Forms.
  function send(type, text) {
    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, text, session, name: lead.name, email: lead.email, phone: lead.phone })
    }).catch(() => {});
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'form-name': 'chat-message', 'Name': lead.name, 'Email': lead.email,
        'Contact Number': lead.phone, 'Message': type === 'start' ? 'Chat started' : text }).toString()
    }).catch(() => {});
  }
  function handle(text) {
    add(text, 'user');
    if (step === 'name') {
      lead.name = text; step = 'email';
      return bot(`Nice to meet you, ${text}! What's your email address?`);
    }
    if (step === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return bot('That email doesn’t look right. Please type it again.');
      lead.email = text; step = 'phone';
      return bot('Thanks! And your phone number?');
    }
    if (step === 'phone') {
      if (text.replace(/\D/g, '').length < 10) return bot('Please share a valid phone number with at least 10 digits.');
      lead.phone = text; step = 'chat';
      send('start');
      return bot(`Thank you, ${lead.name}! You're connected with the VoiceSoul team. Please type your question below and we'll get back to you shortly.`);
    }
    // step === 'chat': every message goes to the team
    send('message', text);
    if (!acked) { acked = true; bot(`Got it! Our team has received your message and will reply to you at ${lead.email} or on ${lead.phone} shortly.`); }
  }

  btn.onclick = () => {
    box.classList.toggle('is-open');
    if (!started) { started = true; bot('Hey there! 👋 Welcome to VoiceSoul. To start the chat, please tell me your name.'); }
    if (box.classList.contains('is-open')) setTimeout(() => input.focus(), 250);
  };
  wrap.querySelector('.vs-chat__close').onclick = () => box.classList.remove('is-open');
  form.onsubmit = (e) => { e.preventDefault(); const v = input.value.trim(); if (!v) return; input.value = ''; handle(v); };
})();
