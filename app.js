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

const MOTIVATIONS = [
  "Stay focused. Every day counts.",
  "You're building something amazing, one day at a time.",
  "Great scores are made in these quiet practice sessions.",
  "Consistency beats cramming — keep going!",
  "Each day of prep is confidence for exam day.",
  "You've got this. The clock is your ally.",
  "Hard work compounds. Trust the process.",
  "Progress, not perfection. Show up today.",
  "The exam is coming — so is your success.",
  "Believe in the version of you who passes this test.",
];

const EXAM_LABELS = {
  moreThan100: "Set your countdown and begin!",
  exactly0: "🎉 Today is your exam day! Good luck!",
  past: "Exam day has passed. Time for results!",
};

// ---- DOM Elements ----
const examDateInput = document.getElementById('exam-date-input');
const setDateBtn = document.getElementById('set-date-btn');
const dateSection = document.getElementById('date-section');
const countdownSection = document.getElementById('countdown-section');
const changeDateBtn = document.getElementById('change-date-btn');
const themeSwitch = document.getElementById('theme-switch');

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
  return date.toLocaleDateString('en-US', {
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
  if (daysLeft <= 0) return "You made it to exam day! 🎓 Best of luck!";
  if (daysLeft <= 7) return "Final stretch! Review, rest, and believe in yourself.";
  if (daysLeft <= 14) return "Two weeks left — sharpen those weak spots!";
  if (daysLeft <= 25) return "Final sprint mode ON. Mock tests are your best friend.";
  if (daysLeft <= 50) return "Halfway done. Your hard work is compounding.";
  if (daysLeft <= 75) return "You're building solid foundations. Keep the pace!";
  return MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)];
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

  dateSection.hidden = true;
  countdownSection.hidden = false;

  updateCountdown();

  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateCountdown, 1000); // update every 1s
}

// ---- Show Date Setter ----
function showDateSetter() {
  examDate = null;
  if (intervalId) clearInterval(intervalId);
  dateSection.hidden = false;
  countdownSection.hidden = true;
  lastDays = -1;
}

// ---- Set Date Button ----
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

// ---- Change Date ----
changeDateBtn.addEventListener('click', () => {
  showDateSetter();
});

// ---- Enter key on date input ----
examDateInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') setDateBtn.click();
});

// ---- Theme Switcher ----
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem(THEME_KEY, next);
}

themeSwitch.addEventListener('click', toggleTheme);

// ---- Initialize ----
function init() {
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
  examDateInput.min = `${ty}-${tm}-${td}`;

  if (stored) {
    const [year, month, day] = stored.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    examDateInput.value = stored;
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
    examDateInput.value = futureStr;
    localStorage.setItem(STORAGE_KEY, futureStr);
    showCountdown(future);
  }

  createParticles();
}

init();
