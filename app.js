/* SAKTO shared script: storage, settings, nav, auth (demo), forms */
const SAKTO = (() => {
  const mem = {};
  const get = (k, d = null) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return k in mem ? mem[k] : d; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; } };
  const getJSON = (k, d) => { try { return JSON.parse(get(k)) ?? d; } catch (e) { return d; } };
  const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };
  return { get, set, getJSON, setJSON: (k, v) => set(k, JSON.stringify(v)), esc, cur: () => get('sakto-currency', '₱') };
})();

document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  // Settings shared by every page
  document.body.classList.toggle('dark-mode', SAKTO.get('sakto-dark-mode') === 'true');
  document.documentElement.style.fontSize = ({ small: '14px', medium: '16px', large: '19px' })[SAKTO.get('sakto-font-size', 'medium')] || '16px';

  // Auth guard (front-end demo only)
  const user = SAKTO.getJSON('sakto-users', []).find(u => u.username === SAKTO.get('sakto-current'));
  if (document.body.dataset.protected && !user) { location.replace('login.html'); return; }
  if ($('userName') && user) { $('userName').textContent = user.name; $('avatarInitial').textContent = user.name[0].toUpperCase(); }
  if ($('logoutLink')) $('logoutLink').addEventListener('click', () => SAKTO.set('sakto-current', ''));

  // Mobile nav
  const toggle = document.querySelector('.nav-toggle'), nav = $('siteNav');
  toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', nav.classList.toggle('open')));
  const here = location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a').forEach(a => { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });

  const msg = (el, text, ok) => { el.textContent = text; el.classList.toggle('ok', !!ok); };

  // Register
  const reg = $('registerForm');
  if (reg) reg.addEventListener('submit', e => {
    e.preventDefault();
    const [name, email, username, pw, cf] = [...reg.querySelectorAll('input')].map(i => i.value.trim());
    const err = $('formError'), users = SAKTO.getJSON('sakto-users', []);
    if (pw.length < 6) return msg(err, 'Password must be at least 6 characters.');
    if (pw !== cf) return msg(err, 'Passwords do not match.');
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) return msg(err, 'That username is already taken.');
    users.push({ name, email, username, password: pw });
    SAKTO.setJSON('sakto-users', users); SAKTO.set('sakto-current', username);
    location.href = 'dashboard.html';
  });

  // Login
  const login = $('loginForm');
  if (login) login.addEventListener('submit', e => {
    e.preventDefault();
    const [username, pw] = [...login.querySelectorAll('input')].map(i => i.value.trim());
    const u = SAKTO.getJSON('sakto-users', []).find(x => x.username.toLowerCase() === username.toLowerCase() && x.password === pw);
    if (!u) return msg($('formError'), 'Invalid username or password. New here? Register first.');
    SAKTO.set('sakto-current', u.username); location.href = 'dashboard.html';
  });

  // Contact form validation
  const contact = $('contactForm');
  if (contact) contact.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('cName').value.trim(), email = $('cEmail').value.trim(), text = $('cMessage').value.trim(), out = $('formError');
    if (name.length < 2) return msg(out, 'Please enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return msg(out, 'Please enter a valid email address.');
    if (text.length < 10) return msg(out, 'Your message should be at least 10 characters.');
    msg(out, 'Thanks, ' + name + '! Your message was received (demo form).', true); contact.reset();
  });

  // Daily allowance calculator (home page)
  const calc = $('calcForm');
  if (calc) calc.addEventListener('submit', e => {
    e.preventDefault();
    const a = parseFloat($('calcAllowance').value), d = parseInt($('calcDays').value, 10), out = $('calcResult');
    if (!(a > 0) || !(d > 0)) return msg(out, 'Enter an allowance and number of days above 0.');
    const per = a / d;
    msg(out, 'You can spend about ' + SAKTO.cur() + per.toFixed(2) + ' per day. Tip: aim for ' + SAKTO.cur() + (per * 0.9).toFixed(2) + ' to save 10%.', true);
  });
});
