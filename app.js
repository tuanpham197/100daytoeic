/* ================================================
   TOEIC 100-Day Countdown — app.js
   Handles: date input, countdown logic, ring, bars,
   milestones, motivation messages, particles, storage
   ================================================ */

'use strict';

// ---- Constants ----
const TOTAL_DAYS = 100;
const STORAGE_KEY = 'toeic_exam_date';
const THEME_KEY = 'toeic_theme';
const LANG_KEY = 'toeic_lang';

let currentLang = 'en';

const TRANSLATIONS = {
  en: {
    'badge-text': "Your TOEIC Journey Begins Now",
    'hero-line': "100 Days to",
    'hero-sub': "Excellence",
    'hero-desc': "Every great score starts with a single day. Set your exam date and watch the clock tick toward your triumph.",
    'set-date-label': "Set Your Exam Date",
    'start-btn': "Start Countdown",
    'days-left-label': "days left",
    'exam-label': "Your TOEIC Exam Date",
    'unit-weeks': "Weeks",
    'unit-days': "Days",
    'unit-hours': "Hours",
    'unit-minutes': "Minutes",
    'unit-seconds': "Seconds",
    'prog-title': "Journey Progress",
    'prog-start': "Day 1",
    'prog-end': "Exam Day",
    'ms-title': "Study Milestones",
    'change-btn': "Change Exam Date",
    'footer-text': "Made with",
    'footer-text-2': "for your TOEIC success — 2026",

    // Milestones
    'ms1-label': "Day 25 reached",
    'ms1-desc': "Vocabulary foundations solid",
    'ms1-badge': "75 days left",
    'ms2-label': "Halfway There!",
    'ms2-desc': "Listening practice in full swing",
    'ms2-badge': "50 days left",
    'ms3-label': "Final Sprint!",
    'ms3-desc': "Full mock tests every other day",
    'ms3-badge': "25 days left",
    'ms4-label': "Last Week!",
    'ms4-desc': "Review strategies & get good sleep",
    'ms4-badge': "7 days left",

    // Dynamic Dates
    'format-locale': 'en-US',
  },
  vi: {
    'badge-text': "Hành trình TOEIC của bạn bắt đầu",
    'hero-line': "100 Ngày đến",
    'hero-sub': "Thành công",
    'hero-desc': "Mọi điểm số tuyệt vời đều bắt đầu từ một ngày. Hãy đặt ngày thi và theo dõi đồng hồ đếm ngược.",
    'set-date-label': "Đặt Ngày Thi Của Bạn",
    'start-btn': "Bắt đầu Đếm Ngược",
    'days-left-label': "ngày còn lại",
    'exam-label': "Ngày Thi TOEIC Của Bạn",
    'unit-weeks': "Tuần",
    'unit-days': "Ngày",
    'unit-hours': "Giờ",
    'unit-minutes': "Phút",
    'unit-seconds': "Giây",
    'prog-title': "Tiến Độ Hành Trình",
    'prog-start': "Ngày 1",
    'prog-end': "Ngày Thi",
    'ms-title': "Cột Mốc Học Tập",
    'change-btn': "Thay Đổi Ngày Thi",
    'footer-text': "Làm với",
    'footer-text-2': "vì thành công TOEIC của bạn — 2026",

    // Milestones
    'ms1-label': "Đạt ngày 25",
    'ms1-desc': "Nền tảng từ vựng vững chắc",
    'ms1-badge': "Còn 75 ngày",
    'ms2-label': "Được Nửa Đường!",
    'ms2-desc': "Luyện nghe đang diễn ra mạnh mẽ",
    'ms2-badge': "Còn 50 ngày",
    'ms3-label': "Chạy Nước Rút!",
    'ms3-desc': "Làm đề thi thử cách ngày",
    'ms3-badge': "Còn 25 ngày",
    'ms4-label': "Tuần Cuối Cùng!",
    'ms4-desc': "Ôn lại chiến lược & ngủ đủ giấc",
    'ms4-badge': "Còn 7 ngày",

    // Dynamic Dates
    'format-locale': 'vi-VN',
  }
};

const MOTIVATIONS = {
  en: [
    "Stay focused. Every day counts.",
    "You're building something amazing, one day at a time.",
    "Great scores are made in these quiet practice sessions.",
    "Consistency beats cramming — keep going!",
    "Each day of prep is confidence for exam day.",
    "You've got this. The clock is your ally.",
    "Hard work compounds. Trust the process.",
    "Progress, not perfection. Show up today.",
    "The exam is coming — so is your success.",
  ],
  vi: [
    "Hãy tập trung. Mỗi ngày đều quý giá.",
    "Bạn đang xây dựng một điều tuyệt vời, từng ngày một.",
    "Điểm số cao được tạo ra từ những buổi luyện tập yên tĩnh này.",
    "Sự kiên trì đánh bại sự nhồi nhét — tiếp tục đi!",
    "Mỗi ngày chuẩn bị là sự tự tin cho ngày thi.",
    "Bạn làm được mà. Thời gian là đồng minh của bạn.",
    "Sự chăm chỉ tích luỹ dần. Hãy tin vào quá trình.",
    "Tiến bộ, không phải sự hoàn hảo. Hãy cố gắng ngay hôm nay.",
    "Kỳ thi đang đến gần — và thành công của bạn cũng vậy.",
    "Hãy tin vào phiên bản vượt qua kỳ thi này của chính bạn."
  ]
};

const EXAM_LABELS = {
  en: {
    moreThan100: "Set your countdown and begin!",
    exactly0: "🎉 Today is your exam day! Good luck!",
    past: "Exam day has passed. Time for results!",
  },
  vi: {
    moreThan100: "Đặt thời gian và bắt đầu!",
    exactly0: "🎉 Hôm nay là ngày thi của bạn! Chúc may mắn!",
    past: "Ngày thi đã qua. Đã đến lúc chờ kết quả!",
  }
};

// ---- DOM Elements ----
const examDateInput = document.getElementById('exam-date-input');
const setDateBtn = document.getElementById('set-date-btn');
const dateSection = document.getElementById('date-section');
const countdownSection = document.getElementById('countdown-section');
const changeDateBtn = document.getElementById('change-date-btn');
const themeSwitch = document.getElementById('theme-switch');
const langSwitch = document.getElementById('lang-switch');

const daysNumber = document.getElementById('days-number');
const examDateDisplay = document.getElementById('exam-date-display');
const motivationText = document.getElementById('motivation-text');

const ringFill = document.getElementById('ring-fill');
const timeWeeks = document.getElementById('time-weeks');
const timeDays = document.getElementById('time-days');
const timeHours = document.getElementById('time-hours');
const timeMinutes = document.getElementById('time-minutes');
const timeSeconds = document.getElementById('time-seconds');
const barWeeks = document.getElementById('bar-weeks');
const barDays = document.getElementById('bar-days');
const barHours = document.getElementById('bar-hours');
const barMinutes = document.getElementById('bar-minutes');
const barSeconds = document.getElementById('bar-seconds');
const progressBarInner = document.getElementById('progress-bar-inner');
const progressPct = document.getElementById('progress-pct');
const progressBarOuter = document.getElementById('progress-bar-outer');

// ---- State ----
let examDate = null;
let intervalId = null;
let lastDays = -1;

// ---- Particles ----
function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#818CF8', '#F97316', '#2DD4BF', '#F472B6'];
  const count = window.innerWidth < 600 ? 15 : 30;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.width = p.style.height = (Math.random() * 3 + 1) + 'px';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (Math.random() * 20 + 15) + 's';
    p.style.animationDelay = (Math.random() * -20) + 's';
    p.style.borderRadius = '50%';
    container.appendChild(p);
  }
}

// ---- Dates & Time ----
function getTodayMidnight() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function getDaysRemaining(target) {
  const today = getTodayMidnight();
  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatExamDate(date) {
  const locale = TRANSLATIONS[currentLang]['format-locale'];
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ---- Ring Progress ----
const RING_CIRCUMFERENCE = 2 * Math.PI * 96; // r=96 => 603.19

function setRingProgress(pct) {
  const offset = RING_CIRCUMFERENCE * (1 - Math.min(Math.max(pct, 0), 1));
  ringFill.style.strokeDashoffset = offset.toFixed(2);
}

// ---- Flip Number Animation ----
function flipValue(el, newValue) {
  if (el.textContent === String(newValue)) return;
  el.classList.remove('flip');
  // Force reflow
  void el.offsetWidth;
  el.textContent = newValue;
  el.classList.add('flip');
}

// ---- Motivation ----
function getMotivation(daysLeft) {
  const m = MOTIVATIONS[currentLang];
  if (currentLang === 'vi') {
    if (daysLeft <= 0) return "Bạn đã đến ngày thi! 🎓 Chúc may mắn!";
    if (daysLeft <= 7) return "Chặng đường cuối! Ôn tập, nghỉ ngơi và tin vào bản thân.";
    if (daysLeft <= 14) return "Còn hai tuần — hãy cải thiện những điểm yếu!";
    if (daysLeft <= 25) return "Bật chế độ chạy nước rút. Đề thi thử là bạn tốt nhất.";
    if (daysLeft <= 50) return "Đã đi được nửa chặng đường. Công sức của bạn đang tích tụ.";
    if (daysLeft <= 75) return "Bạn đang xây dựng nền tảng vững chắc. Giữ vững nhịp độ!";
  } else {
    if (daysLeft <= 0) return "You made it to exam day! 🎓 Best of luck!";
    if (daysLeft <= 7) return "Final stretch! Review, rest, and believe in yourself.";
    if (daysLeft <= 14) return "Two weeks left — sharpen those weak spots!";
    if (daysLeft <= 25) return "Final sprint mode ON. Mock tests are your best friend.";
    if (daysLeft <= 50) return "Halfway done. Your hard work is compounding.";
    if (daysLeft <= 75) return "You're building solid foundations. Keep the pace!";
  }
  return m[Math.floor(Math.random() * m.length)];
}

// ---- Milestones ----
function updateMilestones(daysLeft) {
  const milestones = [
    { id: 'ms-75', day: 75, clsAchieved: 'achieved' },
    { id: 'ms-50', day: 50, clsAchieved: 'achieved-orange' },
    { id: 'ms-25', day: 25, clsAchieved: 'achieved-teal' },
    { id: 'ms-7', day: 7, clsAchieved: 'achieved-pink' },
  ];

  milestones.forEach(({ id, day, clsAchieved }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const achieved = daysLeft <= day;
    el.classList.toggle(clsAchieved, achieved);

    // Add/remove check icon
    let check = el.querySelector('.ms-check');
    if (achieved && !check) {
      check = document.createElement('div');
      check.className = 'ms-check';
      check.setAttribute('aria-label', 'Milestone achieved');
      check.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      el.appendChild(check);
    } else if (!achieved && check) {
      check.remove();
    }
  });
}

// ---- Main Update ----
function updateCountdown() {
  if (!examDate) return;

  const now = new Date();
  const daysLeft = getDaysRemaining(examDate);

  // Calculate real-time hours/minutes from now to exam midnight
  const examMidnight = new Date(examDate);
  examMidnight.setHours(0, 0, 0, 0);
  const totalMs = examMidnight - now;

  let weeks = 0, days = 0, hours = 0, minutes = 0, seconds = 0;

  if (totalMs > 0) {
    const totalMinutesLeft = Math.floor(totalMs / 60000);
    const totalHoursLeft = Math.floor(totalMs / 3600000);
    weeks = Math.floor(daysLeft / 7);
    days = daysLeft;
    hours = Math.floor((totalMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    seconds = Math.floor((totalMs % (1000 * 60)) / 1000);
  }

  // Days number
  const displayDays = Math.max(daysLeft, 0);
  flipValue(daysNumber, displayDays);

  // Time cards
  flipValue(timeWeeks, weeks);
  flipValue(timeDays, days > 0 ? days : 0);
  flipValue(timeHours, hours);
  flipValue(timeMinutes, minutes);
  flipValue(timeSeconds, seconds);

  // Time bars
  barWeeks.style.width = Math.min((weeks / 14) * 100, 100) + '%';
  barDays.style.width = Math.min((days / TOTAL_DAYS) * 100, 100) + '%';
  barHours.style.width = Math.min((hours / 24) * 100, 100) + '%';
  barMinutes.style.width = Math.min((minutes / 60) * 100, 100) + '%';
  barSeconds.style.width = Math.min((seconds / 60) * 100, 100) + '%';

  // Progress & ring
  const daysPassed = TOTAL_DAYS - Math.max(daysLeft, 0);
  const pct = Math.min(Math.max(daysPassed / TOTAL_DAYS, 0), 1);
  const pctDisplay = Math.round(pct * 100);

  progressBarInner.style.width = pct * 100 + '%';
  progressPct.textContent = pctDisplay + '%';
  progressBarOuter.setAttribute('aria-valuenow', pctDisplay);
  setRingProgress(pct);

  // Motivation (update only when day changes)
  if (daysLeft !== lastDays) {
    motivationText.textContent = getMotivation(daysLeft);
    motivationText.parentElement.style.animation = 'none';
    void motivationText.offsetWidth;
    motivationText.parentElement.style.animation = 'motivationFade 0.6s ease-out';
    lastDays = daysLeft;
  }

  // Milestones
  updateMilestones(daysLeft);
}

// ---- Show Countdown ----
function showCountdown(date) {
  examDate = date;
  examDateDisplay.textContent = formatExamDate(date);

  if (dateSection) dateSection.hidden = true;
  countdownSection.hidden = false;

  updateCountdown();

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateCountdown, 1000); // update every 1s
}

// ---- Show Date Setter ----
function showDateSetter() {
  examDate = null;
  if (intervalId) clearInterval(intervalId);
  if (dateSection) dateSection.hidden = false;
  countdownSection.hidden = true;
  lastDays = -1;
}

// ---- Set Date Button ----
if (setDateBtn) {
  setDateBtn.addEventListener('click', () => {
    const value = examDateInput.value;
    if (!value) {
      examDateInput.focus();
      examDateInput.style.borderColor = '#F97316';
      setTimeout(() => (examDateInput.style.borderColor = ''), 1500);
      return;
    }

    // Parse as local date
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);

    localStorage.setItem(STORAGE_KEY, value);
    showCountdown(date);
  });
}

// ---- Change Date ----
if (changeDateBtn) {
  changeDateBtn.addEventListener('click', () => {
    showDateSetter();
  });
}

// ---- Enter key on date input ----
if (examDateInput) {
  examDateInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') setDateBtn.click();
  });
}

// ---- Theme Switcher ----
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
}

themeSwitch.addEventListener('click', toggleTheme);

// ---- Language Switcher ----
function updateDOMTexts() {
  const elements = document.querySelectorAll('[data-i18n]');
  const t = TRANSLATIONS[currentLang];
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      // Avoid replacing SVG/HTML in buttons if we just target a span
      // For the button, we should wrap the text in a span in HTML,
      // but if we are just setting innerText it will overwrite the SVG.
      // Easiest is to target specific spans in the HTML.
      el.textContent = t[key];
    }
  });

  // Re-format existing date display
  if (examDate) {
    examDateDisplay.textContent = formatExamDate(examDate);
  }

  // Re-roll motivation
  if (lastDays >= 0) {
    motivationText.textContent = getMotivation(lastDays);
  }
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  updateDOMTexts();

  // Update toggle button text
  if (langSwitch) {
    langSwitch.textContent = lang === 'en' ? 'EN' : 'VI';
  }
}

if (langSwitch) {
  langSwitch.addEventListener('click', () => {
    setLang(currentLang === 'en' ? 'vi' : 'en');
  });
}

// ---- Initialize ----
function init() {
  // Setup lang
  const storedLang = localStorage.getItem(LANG_KEY);
  if (storedLang && TRANSLATIONS[storedLang]) {
    setLang(storedLang);
  } else {
    setLang('en');
  }

  // Setup theme
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Set default date to 100 days from now if no stored date
  const stored = localStorage.getItem(STORAGE_KEY);

  // Set min date to tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const ty = tomorrow.getFullYear();
  const tm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const td = String(tomorrow.getDate()).padStart(2, '0');
  if (examDateInput) examDateInput.min = `${ty}-${tm}-${td}`;

  if (stored) {
    const [year, month, day] = stored.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    if (examDateInput) examDateInput.value = stored;
    showCountdown(date);
  } else {
    // Default to 100 days from today and start countdown automatically
    const future = new Date();
    future.setDate(future.getDate() + 100);
    future.setHours(0, 0, 0, 0);
    const y = future.getFullYear();
    const m = String(future.getMonth() + 1).padStart(2, '0');
    const d = String(future.getDate()).padStart(2, '0');
    const futureStr = `${y}-${m}-${d}`;
    if (examDateInput) examDateInput.value = futureStr;
    localStorage.setItem(STORAGE_KEY, futureStr);
    showCountdown(future);
  }

  createParticles();
}

init();
