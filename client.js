
const API_BASE_URL = 'https://haxreseller-production.up.railway.app';
const STORAGE_KEY = 'hax_non_root_client_access';
const DEVICE_KEY = 'hax_non_root_device_id';
const HAPP_URL = 'happ://crypt5/fzvd4YgqdTHtPvjHwhZcw54y24f7Dk0goBe2Fa1lwDobLeD1wJ/QO6q6l24H6Re0xAiw9PskIQB2kP+rco9tRM+3dKIoFMLXly9M+D4ldIR6piO1jP7rKBCMbFuluqrSjPTdvZ2GCrgAw2OdN9Z3smxJidBwT/Pp5nygdjj4WjatLy07EI3tGhREKTcj1lohQIQ4V8w/OxgmvwGOWRHsEYL2m2PjGST1R3JY/aHOV5x6R4X5OUqBwJMzCt9str+x4gOEen5haEsE33G4fLDuFio0JJrTwH5+J57flABwGFeJ6xUeHvMj3trh12dB6jUOikacLaWDr1K/iiFBmQ/49+Z7erc2SrSba4m7OLM+JytVfUKOcoLliCftLpHJrq3MqsOPstNkTvOx0uQZSTJ7mlsI38vWVjl/eSznEASBgSz8yViHbJuMJdocMub07L3xHO8aWMbln9vVzUlDyD2KaeD9qIQfbVXusHpuitOMCHwuGxWARZcRPA7MzW8D/BZMq4X1FqKBaJYzHBEYbzqGaT4J1fEZ3clHpeOgcdEB8z4fQ/IbdLlTpZFO2l+ueHhPzLRVpINU9aRXCDz3VFFAnJO8PZ5CFpT1N+ixLmQb2fEhyVexHC6MOnF8nRQ630G7z5ierJOGT6MlSVmdKh504SbEPIHCimLjDq6zWFD8WqmbIjEdl5kra6NnqjllRCOpZ9gLA5EHp3ItLgeYLheipP697OxUq/wLnZqrTEtOLrbjH7+aDudlSJrvNlWau7Ar2HWst3QvwP4o2hUVtQSal8jSc7cDJr53xBdEh3Ftba0/NNB4wCh1aP2hTvXeK/wkfgWbzhJwmkeu0rjGcXVUJBqH7lFuHd79qrXyLA2YPyrewPrqC1qbtG1ivYGcD1SQrG/hX+f6ZzI3oG5r7o96dM7Y5GDfdBlfV8oSrrAkz1VQsiqviGG19jWmfoE=ff';
const getDeviceId = () => {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) { id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'hax-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2); localStorage.setItem(DEVICE_KEY, id); }
  return id;
};
async function haxApi(path, body) {
  const response = await fetch(API_BASE_URL + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'تعذر الاتصال بالخادم');
  return data;
}
let timerInterval = null;
let currentLang = localStorage.getItem('hax_non_root_lang') || 'ar';

const translations = {
  ar: {
    subTitle: "مفتاحك الآمن للاتصال السريع",
    keyLabel: "مفتاح الدخول (Nacer-XXXXXXXX_XXXXXXXX-XXXXXXXX)",
    pasteBtn: "لصق",
    loginBtn: "دخول النظام",
    noKeyText: "لا تملك مفتاحاً؟ تواصل معنا عبر القناة",
    logoutBtn: "خروج",
    secureConnected: "متصل بأمان",
    timerLabel: "الوقت المتبقي للجلسة",
    activeKeyTitle: "مفتاح الدخول النشط",
    copyBtn: "نسخ",
    deviceLbl: "الجهاز",
    joinLbl: "تاريخ الانضمام",
    expiryLbl: "تاريخ الانتهاء",
    subscribeBtn: "إضافة الاشتراك",
    subscribeSub: "ربط مباشر مع تطبيق Happ VPN",
    appsAndCommunity: "التطبيقات والمجتمع",
    downloadHapp: "تحميل تطبيق HAPP",
    downloadHappSub: "احصل على عميل Happ الرسمي",
    telegramChannel: "قناة HAX_NON_ROOT",
    telegramJoinText: "اضغط للانضمام لقناتنا على تلغرام",
    accountSection: "الحساب",
    copyKeyTitle: "نسخ مفتاح الدخول",
    copyKeySub: "اضغط لنسخ مفتاحك",
    logoutTitle: "خروج",
    logoutSub: "مسح الجلسة المحفوظة",
    homeTab: "الرئيسية",
    settingsTab: "الإعدادات",
    errEmpty: "يرجى إدخال مفتاح الدخول",
    errFormat: "صيغة المفتاح غير صحيحة",
    errInvalid: "مفتاح غير صالح أو منتهي الصلاحية",
    errConn: "خطأ في الاتصال بالسيرفر",
    checking: "⏳ جاري التحقق...",
    pasted: "✔ تم اللصق",
    copied: "✔ تم نسخ المفتاح",
    launching: "🚀 جاري فتح تطبيق Happ..."
  },
  en: {
    subTitle: "Your Secure Connection Key",
    keyLabel: "Access Key (Nacer-XXXXXXXX_XXXXXXXX-XXXXXXXX)",
    pasteBtn: "Paste",
    loginBtn: "Login",
    noKeyText: "Don't have a key? Contact channel",
    logoutBtn: "Logout",
    secureConnected: "Secure",
    timerLabel: "Session Time Remaining",
    activeKeyTitle: "Active Access Key",
    copyBtn: "Copy",
    deviceLbl: "Device",
    joinLbl: "Joined",
    expiryLbl: "Expires",
    subscribeBtn: "Add Subscription",
    subscribeSub: "Direct link with Happ VPN app",
    appsAndCommunity: "Apps & Community",
    downloadHapp: "Download HAPP App",
    downloadHappSub: "Get the official Happ client",
    telegramChannel: "HAX_NON_ROOT Channel",
    telegramJoinText: "Tap to join our Telegram channel",
    accountSection: "Account",
    copyKeyTitle: "Copy Access Key",
    copyKeySub: "Click to copy your key",
    logoutTitle: "Logout",
    logoutSub: "Clear saved session",
    homeTab: "Home",
    settingsTab: "Settings",
    errEmpty: "Please enter access key",
    errFormat: "Invalid key format",
    errInvalid: "Invalid or expired key",
    errConn: "Server connection error",
    checking: "⏳ Checking...",
    pasted: "✔ Pasted",
    copied: "✔ Key Copied",
    launching: "🚀 Launching Happ..."
  }
};

window.addEventListener('DOMContentLoaded', async () => {
  applyLanguage(currentLang);
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (!savedData) return;
  try {
    const parsed = JSON.parse(savedData);
    if (!parsed.key || !parsed.deviceId) throw new Error('invalid_session');
    const check = await haxApi('/api/check', { code: parsed.key });
    if (!check.valid) throw new Error(check.reason || 'invalid_key');
    const deviceDetails = await getDeviceDetails();
    const verified = await haxApi('/api/verify', { code: parsed.key, device_id: parsed.deviceId, ...deviceDetails });
    if (!verified.valid) throw new Error(verified.reason || 'invalid_key');
    const expiry = Date.parse(verified.expires_at || check.expires_at);
    const created = Date.parse(check.created_at || Date.now());
    if (!Number.isFinite(expiry) || expiry <= Date.now()) throw new Error('expired');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: parsed.key, expiry, created, deviceId: parsed.deviceId }));
    openDashboard(parsed.key, expiry, created);
  } catch(e) { localStorage.removeItem(STORAGE_KEY); }
});

function toggleLanguage() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('hax_non_root_lang', currentLang);
  applyLanguage(currentLang);
}

function applyLanguage(lang) {
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);
  document.getElementById('langIndicator').innerText = lang === 'ar' ? 'EN' : 'AR';
  document.getElementById('langIndicator2').innerText = lang === 'ar' ? 'EN' : 'AR';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.innerText = translations[lang][key];
    }
  });
}

function showTab(tabName) {
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  if (tabName === 'home') {
    document.getElementById('homePane').classList.add('active');
    document.getElementById('navHome').classList.add('active');
  } else if (tabName === 'settings') {
    document.getElementById('settingsPane').classList.add('active');
    document.getElementById('navSettings').classList.add('active');
  }
}

async function pasteKeyFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      document.getElementById('accessKey').value = text.trim();
      showToast(translations[currentLang].pasted);
    }
  } catch (e) {
    showToast("⚠ Clipboard permission required");
  }
}

function toggleKeyVisibility() {
  const input = document.getElementById('accessKey');
  input.type = input.type === 'password' ? 'text' : 'password';
}

// زر التشويش أو إظهار المفتاح داخل لوحة التحكم
function toggleDisplayKeyMask() {
  const el = document.getElementById('displayKey');
  el.classList.toggle('blurred');
}

async function login() {
  const key = document.getElementById('accessKey').value.trim().toUpperCase();
  if (!key) { showError(translations[currentLang].errEmpty); return; }
  showToast(translations[currentLang].checking);
  try {
    const check = await haxApi('/api/check', { code: key });
    if (!check.valid) {
      if (check.reason === 'maintenance') throw new Error('الخدمة تحت الصيانة حالياً');
      if (check.reason === 'code_expired') throw new Error('الكود منتهي الصلاحية');
      if (check.reason === 'code_disabled') throw new Error('تم إيقاف هذا الكود');
      throw new Error(translations[currentLang].errInvalid);
    }
    const deviceId = getDeviceId();
    const deviceDetails = await getDeviceDetails();
    const verified = await haxApi('/api/verify', { code: key, device_id: deviceId, ...deviceDetails });
    if (!verified.valid) {
      if (verified.reason === 'max_devices_reached') throw new Error('تم بلوغ الحد الأقصى للأجهزة لهذا الكود');
      if (verified.reason === 'maintenance') throw new Error('الخدمة تحت الصيانة حالياً');
      throw new Error(translations[currentLang].errInvalid);
    }
    const expiryTime = Date.parse(verified.expires_at || check.expires_at);
    const createdTime = Date.parse(check.created_at || Date.now());
    if (!Number.isFinite(expiryTime) || expiryTime <= Date.now()) throw new Error('الكود منتهي الصلاحية');
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ key, expiry: expiryTime, created: createdTime, deviceId }));
    openDashboard(key, expiryTime, createdTime);
  } catch(e) { showError(e.message || translations[currentLang].errConn); }
}

async function getDeviceDetails() {
  const ua = navigator.userAgent || '';
  let model = '';
  let platform = navigator.userAgentData?.platform || navigator.platform || '';
  let browser = 'متصفح غير معروف';
  if (/EdgA?\//i.test(ua)) browser = 'Edge';
  else if (/SamsungBrowser\//i.test(ua)) browser = 'Samsung Internet';
  else if (/OPR\//i.test(ua)) browser = 'Opera';
  else if (/Firefox\//i.test(ua) || /FxiOS\//i.test(ua)) browser = 'Firefox';
  else if (/CriOS\//i.test(ua)) browser = 'Chrome';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Safari\//i.test(ua)) browser = 'Safari';

  try {
    if (navigator.userAgentData?.getHighEntropyValues) {
      const hints = await navigator.userAgentData.getHighEntropyValues(['model', 'platform']);
      model = String(hints.model || '').trim();
      platform = String(hints.platform || platform || '').trim();
    }
  } catch (_) {}

  if (!model) {
    const androidMatch = ua.match(/Android[^;)]*;\s*([^;)]+?)(?:\s+Build\/[^;)]+)?[;)]/i);
    if (androidMatch) {
      const candidate = androidMatch[1].replace(/\s+Build\/.*/i, '').trim();
      if (candidate && !/^(?:K|wv|mobile|linux|armv\d+|unknown)$/i.test(candidate)) model = candidate;
    }
  }

  if (!model) {
    if (/iPhone/i.test(ua)) model = 'iPhone · ' + browser;
    else if (/iPad/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) model = 'iPad · ' + browser;
    else if (/Android/i.test(ua) || /Android/i.test(platform)) model = 'Android phone · ' + browser;
    else if (/Windows/i.test(ua) || /Win/i.test(platform)) model = 'Windows PC · ' + browser;
    else if (/Macintosh|Mac OS X/i.test(ua) || /macOS|Mac/i.test(platform)) model = 'Mac · ' + browser;
    else if (/CrOS/i.test(ua)) model = 'Chromebook · ' + browser;
    else if (/Linux/i.test(ua) || /Linux/i.test(platform)) model = 'Linux device · ' + browser;
    else model = 'جهاز غير محدد · ' + browser;
  }

  return {
    device_model: model.slice(0, 80),
    device_platform: String(platform || (/Android/i.test(ua) ? 'Android' : /iPhone|iPad/i.test(ua) ? 'iOS' : 'غير معروف')).slice(0, 40)
  };
}

function detectDeviceLabel() {
  const ua = navigator.userAgent || '';
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  if (/iPad|iPhone|iPod/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'iPhone / iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Windows/i.test(ua) || /Win/i.test(platform)) return 'Windows';
  if (/CrOS/i.test(ua)) return 'ChromeOS';
  if (/Mac OS X|Macintosh/i.test(ua) || /Mac/i.test(platform)) return 'macOS';
  if (/Linux/i.test(ua) || /Linux/i.test(platform)) return 'Linux';
  return 'غير معروف';
}

function openDashboard(key, expiry, created) {
  document.getElementById('displayKey').textContent = key;
  document.getElementById('deviceOs').textContent = detectDeviceLabel();
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  document.getElementById('activationDate').textContent = new Date(created).toLocaleDateString('en-US', options);
  document.getElementById('expiryDate').textContent = new Date(expiry).toLocaleDateString('en-US', options);

  document.getElementById('loginView').classList.remove('active');
  document.getElementById('dashView').classList.add('active');

  startCountdown(expiry, created);
}


function updateDurationMeter(ratio) {
  const container = document.getElementById('timeProgressTicks');
  if (!container) return;
  // Custom HAX dial: an open 300-degree arc with 52 markers, not a full copied ring.
  const totalTicks = 52;
  if (!container.dataset.ready) {
    const ns = 'http://www.w3.org/2000/svg';
    for (let i = 0; i < totalTicks; i++) {
      const angle = (-150 + (i / (totalTicks - 1)) * 300) * Math.PI / 180;
      const major = i % 13 === 0 || i === totalTicks - 1;
      const inner = major ? 124 : 130;
      const outer = major ? 146 : (i % 4 === 0 ? 143 : 140);
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', (160 + Math.cos(angle) * inner).toFixed(2));
      line.setAttribute('y1', (160 + Math.sin(angle) * inner).toFixed(2));
      line.setAttribute('x2', (160 + Math.cos(angle) * outer).toFixed(2));
      line.setAttribute('y2', (160 + Math.sin(angle) * outer).toFixed(2));
      line.setAttribute('class', 'dial-tick' + (major ? ' major' : ''));
      container.appendChild(line);
    }
    container.dataset.ready = '1';
  }
  const elapsed = Math.max(0, Math.min(1, Number(ratio) || 0));
  const activeTicks = Math.round(elapsed * totalTicks);
  Array.from(container.children).forEach((tick, index) => {
    tick.classList.toggle('active', index < activeTicks);
  });
}

function startCountdown(expiryTime, startTime) {
  if (timerInterval) clearInterval(timerInterval);

  function updateTimer() {
    const now = Date.now();
    const diff = expiryTime - now;

    if (diff <= 0) {
      document.getElementById('mainTimerDisplay').innerHTML = '<span>00</span><span class="timer-unit">EXPIRED</span>';
      updateDurationMeter(1);
      clearInterval(timerInterval);
      return;
    }

    const totalDuration = Number(expiryTime) - Number(startTime);
    const elapsedRatio = Number.isFinite(totalDuration) && totalDuration > 0 ? Math.max(0, Math.min(1, 1 - (diff / totalDuration))) : 0;
    updateDurationMeter(elapsedRatio);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    document.getElementById('mainTimerDisplay').innerHTML = `
      <span>${sStr}</span><span class="timer-unit">S</span>
      <span>${mStr}</span><span class="timer-unit">M</span>
      <span>${hStr}</span><span class="timer-unit">H</span>
    `;
  }

  updateTimer();
  timerInterval = setInterval(updateTimer, 1000);
}

function showError(msg) {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 4000);
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function copyKey() {
  const key = document.getElementById('displayKey').textContent.trim();
  if (key && key !== '-') {
    navigator.clipboard.writeText(key);
    showToast(translations[currentLang].copied);
  }
}

function logout() {
  if (timerInterval) clearInterval(timerInterval);
  localStorage.removeItem(STORAGE_KEY);
  document.getElementById('dashView').classList.remove('active');
  document.getElementById('loginView').classList.add('active');
  document.getElementById('accessKey').value = '';
}

function launchVpnHub() {
  showToast(translations[currentLang].launching);
  setTimeout(() => {
    window.location.href = HAPP_URL;
  }, 1000);
}


// Measure real round-trip latency to the HAX service health endpoint.
// This reports server response time (ping), not download bandwidth.
let haxLatencyTimer = null;
let haxLatencyBusy = false;
async function updateConnectionLatency() {
  const el = document.getElementById('connectionLatency');
  if (!el || haxLatencyBusy || document.visibilityState === 'hidden') return;
  haxLatencyBusy = true;
  const started = performance.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);
  try {
    await fetch(API_BASE_URL.replace(/\/+$/, '') + '/health?ping=' + Date.now(), {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    });
    const elapsed = Math.max(1, Math.round(performance.now() - started));
    el.textContent = elapsed + ' ms';
    el.style.color = elapsed < 120 ? '#16d6a0' : elapsed < 300 ? '#ffbd59' : '#ff7185';
    el.title = 'زمن الاستجابة إلى خادم HAX: ' + elapsed + ' مللي ثانية';
  } catch (error) {
    el.textContent = '— ms';
    el.style.color = '#9ba8ba';
    el.title = 'تعذر قياس زمن الاستجابة إلى الخادم';
  } finally {
    clearTimeout(timeout);
    haxLatencyBusy = false;
  }
}
function startConnectionLatencyMonitor() {
  updateConnectionLatency();
  if (haxLatencyTimer) clearInterval(haxLatencyTimer);
  haxLatencyTimer = setInterval(updateConnectionLatency, 20000);
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') updateConnectionLatency();
});


document.addEventListener('click', event => {
  const control = event.target.closest('[data-hax-action], [data-hax-tab]');
  if (!control) return;
  if (control.dataset.haxTab) {
    showTab(control.dataset.haxTab);
    return;
  }
  switch (control.dataset.haxAction) {
    case 'toggle-language': toggleLanguage(); break;
    case 'toggle-key-visibility': toggleKeyVisibility(); break;
    case 'paste-key': pasteKeyFromClipboard(); break;
    case 'login': login(); break;
    case 'logout': logout(); break;
    case 'toggle-display-key': toggleDisplayKeyMask(); break;
    case 'copy-key': copyKey(); break;
    case 'launch-vpn': launchVpnHub(); break;
  }
});

startConnectionLatencyMonitor();
