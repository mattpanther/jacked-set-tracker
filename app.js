// ===== STATE =====
const STATE_KEY = "jacked-tracker-state";
let state = {
  month: null,
  workoutIdx: null,
  exerciseIdx: 0,
  pass: 1,
  mode: "1p",
  exerciseStates: [], // per-exercise: { ignitorReps, path, setReps, totalReps, sets, boxScore, restTime, setsLog }
};
let players = []; // PlayerTracker instances
let sessionSaved = false; // flag to avoid double-saving a session

// ===== AUDIO =====
let audioReady = false,
  chimeSynth = null,
  pipSynth = null,
  ppDelay = null,
  tronSynth = null,
  tronFilter = null,
  tronReverb = null;
async function initAudio() {
  if (audioReady) return;
  try {
    await Tone.start();
    ppDelay = new Tone.PingPongDelay({
      delayTime: "8n",
      feedback: 0.6,
      wet: 0.5,
    }).toDestination();
    chimeSynth = new Tone.Synth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.2, release: 0.4 },
    }).connect(ppDelay);
    pipSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.001, decay: 0.03, sustain: 0, release: 0.03 },
    }).toDestination();
    tronReverb = new Tone.Reverb({ decay: 0.8, wet: 0.2 }).toDestination();
    tronSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.005, decay: 0.1, sustain: 0.05, release: 0.3 },
      volume: -12,
    }).connect(tronReverb);
    audioReady = true;
  } catch (e) {
    console.error("Audio init failed", e);
  }
}
function playChime(idx) {
  if (!audioReady) return;
  const now = Tone.now();
  if (idx === 0) {
    chimeSynth.triggerAttackRelease("C5", "16n", now);
    chimeSynth.triggerAttackRelease("A5", "16n", now + 0.15);
    chimeSynth.triggerAttackRelease("E6", "16n", now + 0.3);
  } else {
    chimeSynth.triggerAttackRelease("F4", "16n", now);
    chimeSynth.triggerAttackRelease("D4", "16n", now + 0.15);
    chimeSynth.triggerAttackRelease("Bb3", "16n", now + 0.3);
  }
}
function playPip() {
  if (audioReady) pipSynth.triggerAttackRelease("G3", "32n");
}
function playTronComplete() {
  if (!audioReady) return;
  const now = Tone.now();
  tronSynth.triggerAttackRelease("E4", "32n", now);
  tronSynth.triggerAttackRelease("G4", "32n", now + 0.06);
  tronSynth.triggerAttackRelease("C5", "16n", now + 0.12);
}

// ===== FIREWORKS =====
function launchFireworks(container) {
  const canvas = document.createElement("canvas");
  canvas.className = "fireworks-canvas";

  let w, h;
  if (container) {
    // 2P mode: scope to player panel
    container.style.position = "relative";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    container.appendChild(canvas);
    w = container.offsetWidth;
    h = container.offsetHeight;
  } else {
    // 1P mode: full screen overlay
    document.body.appendChild(canvas);
    w = window.innerWidth;
    h = window.innerHeight;
  }

  const dpr = window.devicePixelRatio || 1;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  const particles = [];
  const colors = [
    "#ff2d55", "#ff9500", "#ffcc00", "#34c759",
    "#00c7be", "#007aff", "#af52de", "#ff375f",
    "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff",
  ];

  // Launch several bursts across the area
  const burstCount = 6;
  for (let b = 0; b < burstCount; b++) {
    const cx = w * (0.1 + Math.random() * 0.8);
    const cy = h * (0.1 + Math.random() * 0.5);
    const count = 40 + Math.floor(Math.random() * 20);
    const burstDelay = b * 250;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = 3 + Math.random() * 5;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.006 + Math.random() * 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 3 + Math.random() * 3,
        delay: burstDelay,
        born: false,
      });
    }
  }

  const startTime = performance.now();
  function animate(now) {
    ctx.clearRect(0, 0, w, h);
    const elapsed = now - startTime;
    let alive = false;
    for (const p of particles) {
      if (elapsed < p.delay) { alive = true; continue; }
      if (!p.born) { p.born = true; }
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05; // gravity
      p.vx *= 0.99; // slight drag
      p.life -= p.decay;
      if (p.life <= 0) continue;
      alive = true;
      // Glow
      ctx.globalAlpha = p.life * 0.15;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life * 3, 0, Math.PI * 2);
      ctx.fill();
      // Core
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      // Trail
      ctx.globalAlpha = p.life * 0.4;
      ctx.beginPath();
      ctx.arc(p.x - p.vx, p.y - p.vy, p.size * p.life * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (alive) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }
  requestAnimationFrame(animate);
}

// ===== HELPERS =====
function getMonthData() {
  return WORKOUTS[state.month];
}
function getWorkout() {
  return getMonthData()?.schedule[state.workoutIdx];
}
function getAllItems() {
  const w = getWorkout();
  if (!w) return [];
  return [
    ...w.exercises,
    ...w.correctives.map((c) => ({ ...c, isCorrective: true })),
  ];
}
function getCurrentItem() {
  return getAllItems()[state.exerciseIdx];
}
function getExState(idx) {
  if (!state.exerciseStates[idx]) {
    const item = getAllItems()[idx];
    const defaultPath = item?.isCorrective
      ? "corrective"
      : state.month === 1
        ? "jacked"
        : "jackedToMax";
    const mid = item?.range
      ? Math.round((item.range[0] + item.range[1]) / 2)
      : 10;
    state.exerciseStates[idx] = {
      ignitorReps: null,
      ignitorInput: mid,
      ignitorWeight: 0,
      path: defaultPath,
      setReps: 0,
      totalReps: 0,
      sets: 0,
      boxScore: null,
      restTime: 90,
      btjActive: null,
      setsLog: [],
      weight: 0,
    };
  }
  return state.exerciseStates[idx];
}

function calcBoxScore(item, ignitorReps, path) {
  if (item.isCorrective) return item.target;
  const md = getMonthData();
  if (md.type === "fixed") {
    return item.base + (state.pass === 2 ? 5 : 0);
  }
  // Multiplier (Month 1)
  let paths;
  if (item.tier === "BW") paths = item.paths;
  else paths = item.tier === "A" ? TIER_A : TIER_B;
  const p = paths[path];
  if (!p) return ignitorReps * 3;
  if (p.multMap) return (p.multMap[ignitorReps] || 15) * ignitorReps;
  return Math.ceil(ignitorReps * p.mult);
}

function getRestForPath(item, path) {
  if (item.isCorrective) return 45;
  const md = getMonthData();
  if (md.type === "fixed") {
    if (path === "jackedToMax" || path === "jacked") return 90;
    if (path === "jackedUp") return 60;
    if (path === "jackedDown") return 150;
    return 90;
  }
  let paths;
  if (item.tier === "BW") paths = item.paths;
  else paths = item.tier === "A" ? TIER_A : TIER_B;
  return paths[path]?.rest || 90;
}

function detectPath(item, reps) {
  if (item.isCorrective) return "corrective";
  const md = getMonthData();
  if (md.type === "fixed") return state.month >= 2 ? "jackedToMax" : "jacked";
  let paths;
  if (item.tier === "BW") paths = item.paths;
  else paths = item.tier === "A" ? TIER_A : TIER_B;
  for (const [key, p] of Object.entries(paths)) {
    if (reps >= p.min && reps <= p.max) return key;
  }
  return "jacked";
}

function isDropSetNext(nextSet, month, item) {
  if (month === 2) return nextSet > 1 && nextSet % 2 === 0; // sets 2,4,6
  if (month === 3) {
    // 3-set exercises: drops on 1,3; 5-set exercises: drops on 1,3,5
    const targetSets = item?.jttmSets || 5;
    if (targetSets === 3) return [1, 3].includes(nextSet);
    return [1, 3, 5].includes(nextSet);
  }
  return false;
}

function saveState() {
  try {
    localStorage.setItem(
      STATE_KEY,
      JSON.stringify({
        month: state.month,
        workoutIdx: state.workoutIdx,
        exerciseIdx: state.exerciseIdx,
        pass: state.pass,
        mode: state.mode,
      }),
    );
  } catch (e) {}
  // Sync to Firestore
  if (typeof saveTrackerState === 'function') {
    saveTrackerState(state);
  }
}
function loadState() {
  try {
    const s = JSON.parse(localStorage.getItem(STATE_KEY));
    if (s) {
      state.month = s.month;
      state.workoutIdx = s.workoutIdx;
      state.exerciseIdx = s.exerciseIdx || 0;
      state.pass = s.pass || 1;
      state.mode = s.mode || "1p";
    }
  } catch (e) {}
}

async function loadStateFromFirestore() {
  if (typeof loadTrackerState !== 'function') return;
  try {
    const remote = await loadTrackerState();
    if (remote && remote.month != null) {
      state.month = remote.month;
      state.workoutIdx = remote.workoutIdx;
      state.exerciseIdx = remote.exerciseIdx || 0;
      state.pass = remote.pass || 1;
      state.mode = remote.mode || "1p";
      // Update localStorage to match
      try {
        localStorage.setItem(
          STATE_KEY,
          JSON.stringify({
            month: state.month,
            workoutIdx: state.workoutIdx,
            exerciseIdx: state.exerciseIdx,
            pass: state.pass,
            mode: state.mode,
          }),
        );
      } catch (e) {}
    }
  } catch (e) {
    console.warn('[App] Firestore state load failed, using localStorage:', e);
  }
}

function saveCurrentSession() {
  if (sessionSaved) return;
  if (state.month == null || state.workoutIdx == null) return;
  if (!state.exerciseStates.length) return;
  const w = getWorkout();
  if (!w || w.isRest) return;
  const items = getAllItems();
  if (typeof saveWorkoutSession === 'function') {
    saveWorkoutSession(state.month, state.workoutIdx, w.name, state.exerciseStates, items);
    sessionSaved = true;
  }
}

// ===== SETUP SCREEN =====
function showSetup() {
  document.getElementById("setup-screen").style.display = "";
  document.getElementById("tracker-screen").style.display = "none";
  loadState();
  renderContinueCard();
  document.querySelectorAll(".month-btn").forEach((btn) => {
    btn.classList.toggle("active", parseInt(btn.dataset.month) === state.month);
    btn.onclick = () => selectMonth(parseInt(btn.dataset.month));
  });
  if (state.month) renderDayGrid();
}

function renderContinueCard() {
  const card = document.getElementById("continue-card");
  if (state.month != null && state.workoutIdx != null) {
    const w = WORKOUTS[state.month]?.schedule[state.workoutIdx];
    if (w) {
      card.style.display = "flex";
      document.getElementById("continue-title").textContent =
        `Month ${state.month} — ${w.name}`;
      document.getElementById("continue-btn").onclick = () => startTracker();
      document.getElementById("next-day-btn").onclick = () => advanceDay();
      return;
    }
  }
  card.style.display = "none";
}

function selectMonth(m) {
  state.month = m;
  state.pass = 1;
  document
    .querySelectorAll(".month-btn")
    .forEach((b) =>
      b.classList.toggle("active", parseInt(b.dataset.month) === m),
    );
  document.getElementById("pass-toggle").style.display =
    m === 2 ? "flex" : "none";
  if (m === 2) {
    document.querySelectorAll(".pass-btn").forEach((b) => {
      b.classList.toggle("active", parseInt(b.dataset.pass) === state.pass);
      b.onclick = () => {
        state.pass = parseInt(b.dataset.pass);
        document
          .querySelectorAll(".pass-btn")
          .forEach((x) =>
            x.classList.toggle(
              "active",
              parseInt(x.dataset.pass) === state.pass,
            ),
          );
      };
    });
  }
  renderDayGrid();
}

function renderDayGrid() {
  const grid = document.getElementById("day-grid");
  const md = WORKOUTS[state.month];
  if (!md) {
    grid.innerHTML = "";
    return;
  }
  grid.innerHTML = md.schedule
    .map((w, i) => {
      if (w.isRest)
        return `<div class="day-card rest-day" data-idx="${i}"><div class="day-card-name">😴 Rest Day</div></div>`;
      return `
    <div class="day-card" data-idx="${i}">
      <div class="day-card-name">${w.name}</div>
      <div class="day-card-info">${w.exercises.length} exercises${w.correctives.length ? " + " + w.correctives.length + " corrective" + (w.correctives.length > 1 ? "s" : "") : ""}</div>
    </div>`;
    })
    .join("");
  grid.querySelectorAll(".day-card").forEach((c) => {
    c.onclick = () => {
      state.workoutIdx = parseInt(c.dataset.idx);
      state.exerciseIdx = 0;
      startTracker();
    };
  });
}

function advanceDay() {
  const md = WORKOUTS[state.month];
  if (!md) return;
  state.workoutIdx = (state.workoutIdx + 1) % md.schedule.length;
  state.exerciseIdx = 0;
  saveState();
  renderContinueCard();
}

function goBackDay() {
  const md = WORKOUTS[state.month];
  if (!md) return;
  state.workoutIdx =
    (state.workoutIdx - 1 + md.schedule.length) % md.schedule.length;
  state.exerciseIdx = 0;
  saveState();
  renderContinueCard();
}

// ===== TRACKER =====
function startTracker() {
  // Save previous session if any
  saveCurrentSession();
  saveState();
  state.exerciseStates = [];
  sessionSaved = false;
  document.getElementById("setup-screen").style.display = "none";
  document.getElementById("tracker-screen").style.display = "";
  const w = getWorkout();
  document.getElementById("workout-title").textContent = w.name;

  if (w.isRest) {
    // Rest day: hide players, show minimal UI
    document.getElementById("players-area").innerHTML =
      '<div style="text-align:center;padding:3rem;color:var(--muted);font-size:1.2rem;">😴 Rest and recover!<br><small>Use ⏮ ⏭ to navigate workouts</small></div>';
    document.getElementById("exercise-nav").style.display = "none";
    setupRestNavButtons();
    return;
  }

  document.getElementById("exercise-nav").style.display = "";
  setupPlayers();
  renderExercise();
  setupModeToggle();
}

function setupRestNavButtons() {
  document.getElementById("back-btn").onclick = () => showSetup();
  document.getElementById("next-workout-btn").onclick = () => {
    advanceDay();
    startTracker();
  };
  document.getElementById("prev-workout-btn").onclick = () => {
    goBackDay();
    startTracker();
  };
  setupModeToggle();
}

function setupPlayers() {
  const area = document.getElementById("players-area");
  area.innerHTML = "";
  area.className = "players-area" + (state.mode === "2p" ? " two-player" : "");
  const count = state.mode === "2p" ? 2 : 1;
  players = [];
  const tmpl = document.getElementById("player-template");
  for (let i = 0; i < count; i++) {
    const clone = tmpl.content.cloneNode(true);
    const panel = clone.querySelector(".player-panel");
    panel.querySelector(".player-tag").textContent = `Player ${i + 1}`;
    area.appendChild(clone);
    players.push(new PlayerTracker(area.children[i], i));
  }
}

function setupModeToggle() {
  const toggle = document.getElementById("mode-toggle");
  const m1p = document.getElementById("mode-1p");
  const m2p = document.getElementById("mode-2p");
  function updateMode() {
    m1p.classList.toggle("active-mode", state.mode === "1p");
    m2p.classList.toggle("active-mode", state.mode === "2p");
  }
  updateMode();
  toggle.onclick = async () => {
    await initAudio();
    state.mode = state.mode === "1p" ? "2p" : "1p";
    saveState();
    setupPlayers();
    renderExercise();
    updateMode();
  };
}

function renderExercise() {
  const items = getAllItems();
  const idx = state.exerciseIdx;
  const item = items[idx];
  if (!item) return;
  document.getElementById("exercise-name").textContent = item.name;
  document.getElementById("exercise-count").textContent =
    `(${idx + 1}/${items.length})`;
  players.forEach((p) => p.renderForExercise(item, idx));
  // Nav buttons
  document.getElementById("prev-ex").onclick = () => navigateExercise(-1);
  document.getElementById("next-ex").onclick = () => navigateExercise(1);
  document.getElementById("back-btn").onclick = () => {
    players.forEach((p) => p.stopTimer());
    showSetup();
  };
  document.getElementById("next-workout-btn").onclick = () => {
    players.forEach((p) => p.stopTimer());
    advanceDay();
    startTracker();
  };
  document.getElementById("prev-workout-btn").onclick = () => {
    players.forEach((p) => p.stopTimer());
    goBackDay();
    startTracker();
  };
}

function navigateExercise(delta) {
  const items = getAllItems();
  const newIdx = state.exerciseIdx + delta;
  if (newIdx < 0 || newIdx >= items.length) return;
  players.forEach((p) => p.saveCurrentState());
  state.exerciseIdx = newIdx;
  saveState();
  renderExercise();
}

// ===== PLAYER TRACKER =====
class PlayerTracker {
  constructor(el, id) {
    this.el = el;
    this.id = id;
    this.timerInterval = null;
    this.timeLeft = 0;
    this.userRestOverride = null; // sticky rest time chosen by user, persists across exercises
    this.dom = {
      ignitorCard: el.querySelector(".ignitor-card"),
      ignitorRange: el.querySelector(".ignitor-range"),
      ignitorValue: el.querySelector(".ignitor-value"),
      ignitorLogBtn: el.querySelector(".ignitor-log-btn"),
      ignitorResult: el.querySelector(".ignitor-result"),
      resultText: el.querySelector(".result-text"),
      stepUp: el.querySelector(".stepper-up"),
      stepDown: el.querySelector(".stepper-down"),
      ignitorWeightStepper: el.querySelector(".ignitor-weight-stepper"),
      ignitorWeightValue: el.querySelector(".ignitor-weight-value"),
      ignitorWeightUp: el.querySelector(".ignitor-weight-up"),
      ignitorWeightDown: el.querySelector(".ignitor-weight-down"),
      ignitorWeightBtns: el.querySelectorAll(".ignitor-weight-btn"),
      pathSelector: el.querySelector(".path-selector"),
      pathDropdown: el.querySelector(".path-dropdown"),
      boxCurrent: el.querySelector(".box-current"),
      boxTarget: el.querySelector(".box-target"),
      boxBar: el.querySelector(".box-bar-fill"),
      boxRemaining: el.querySelector(".box-remaining"),
      boxCard: el.querySelector(".box-score-card"),
      setInputValue: el.querySelector(".set-input-value"),
      setsValue: el.querySelector(".sets-value"),
      weightCard: el.querySelector(".weight-card"),
      weightValue: el.querySelector(".weight-input-value"),
      weightBtns: el.querySelectorAll(".weight-btn"),
      timerText: el.querySelector(".timer-text"),
      timerCard: el.querySelector(".timer-card"),
      dropBanner: el.querySelector(".drop-set-banner"),
      dropInfo: el.querySelector(".drop-set-info"),
      btjBanner: el.querySelector(".btj-banner"),
      btjText: el.querySelector(".btj-text"),
      commitRow: el.querySelector(".commit-row"),
      commitBtn: el.querySelector(".commit-btn"),
      setInputCard: el.querySelector(".set-input-card"),
      stopBtn: el.querySelector(".stop-btn"),
      resetBtn: el.querySelector(".reset-btn"),
      repBtns: el.querySelectorAll(".rep-btn"),
      restBtns: el.querySelectorAll(".rest-btn"),
      repsToast: el.querySelector(".reps-remaining-toast"),
      historyCard: el.querySelector(".history-card"),
    };
    this.bindEvents();
  }

  bindEvents() {
    this.dom.stepUp.onclick = () => {
      const es = this.getES();
      es.ignitorInput++;
      this.dom.ignitorValue.textContent = es.ignitorInput;
    };
    this.dom.stepDown.onclick = () => {
      const es = this.getES();
      es.ignitorInput = Math.max(1, es.ignitorInput - 1);
      this.dom.ignitorValue.textContent = es.ignitorInput;
    };
    // Ignitor weight steppers
    this.dom.ignitorWeightUp.onclick = () => {
      const es = this.getES();
      es.ignitorWeight = (es.ignitorWeight || 0) + 5;
      this.dom.ignitorWeightValue.textContent = es.ignitorWeight;
    };
    this.dom.ignitorWeightDown.onclick = () => {
      const es = this.getES();
      es.ignitorWeight = Math.max(0, (es.ignitorWeight || 0) - 5);
      this.dom.ignitorWeightValue.textContent = es.ignitorWeight;
    };
    this.dom.ignitorWeightBtns.forEach((btn) => {
      btn.onclick = () => {
        const es = this.getES();
        es.ignitorWeight = Math.max(0, (es.ignitorWeight || 0) + parseInt(btn.dataset.delta));
        this.dom.ignitorWeightValue.textContent = es.ignitorWeight;
      };
    });
    this.dom.ignitorLogBtn.onclick = async () => {
      await initAudio();
      this.logIgnitor();
    };
    this.dom.pathDropdown.onchange = () => this.changePath();
    this.dom.weightBtns.forEach((btn) => {
      btn.onclick = async () => {
        await initAudio();
        this.addWeight(parseInt(btn.dataset.delta));
      };
    });
    this.dom.repBtns.forEach((btn) => {
      btn.onclick = async () => {
        await initAudio();
        this.addReps(parseInt(btn.dataset.delta));
      };
    });
    this.dom.commitBtn.onclick = async () => {
      await initAudio();
      this.commitSet();
    };
    this.dom.stopBtn.onclick = () => this.stopTimer();
  this.dom.timerCard.onclick = async () => {
    if (this.dom.timerCard.classList.contains('done')) {
      await initAudio();
      this.commitSet();
    }
  };
    this.dom.resetBtn.onclick = () => this.resetExercise();
    this.dom.restBtns.forEach((btn) => {
      btn.onclick = async () => {
        await initAudio();
        playPip();
        const es = this.getES();
        const time = parseInt(btn.dataset.time);
        es.restTime = time;
        this.userRestOverride = time; // sticky: remember across exercises
        this.dom.restBtns.forEach((b) =>
          b.classList.toggle(
            "active",
            parseInt(b.dataset.time) === es.restTime,
          ),
        );
      };
    });
  }

  getES() {
    return getExState(state.exerciseIdx);
  }

  renderForExercise(item, idx) {
    const es = getExState(idx);
    // Ignitor
    if (item.isCorrective) {
      this.dom.ignitorCard.style.display = "none";
      this.dom.pathSelector.style.display = "none";
      this.dom.weightCard.style.display = "";
      es.boxScore = item.target;
      es.path = "corrective";
    } else {
      this.dom.ignitorCard.style.display = "";
      this.dom.ignitorRange.textContent = `Aim: ${item.range[0]}-${item.range[1]} reps`;
      this.dom.ignitorValue.textContent = es.ignitorInput;
      this.dom.ignitorWeightValue.textContent = es.ignitorWeight || 0;
      if (es.ignitorReps != null) {
        this.dom.ignitorCard.dataset.phase = "done";
        this.dom.ignitorLogBtn.style.display = "none";
        this.dom.ignitorResult.style.display = "";
        const weightStr = es.weight > 0 ? ` @ ${es.weight} lbs` : '';
        this.dom.resultText.textContent = `Logged ${es.ignitorReps} → ${formatPath(es.path)}${weightStr}`;
        this.dom.ignitorValue.textContent = es.ignitorReps;
        this.el.querySelector(".ignitor-stepper").style.display = "none";
        this.dom.ignitorWeightStepper.style.display = "none";
        this.dom.pathSelector.style.display = "";
        this.dom.pathDropdown.value = es.path;
        // Show workout components after ignitor
        this.dom.setInputCard.style.display = "";
        this.dom.weightCard.style.display = "";
        this.dom.commitRow.style.display = "";
        this.dom.boxCard.style.display = "";
      } else {
        this.dom.ignitorCard.dataset.phase = "ignitor";
        this.dom.ignitorLogBtn.style.display = "";
        this.dom.ignitorResult.style.display = "none";
        this.el.querySelector(".ignitor-stepper").style.display = "flex";
        this.dom.ignitorWeightStepper.style.display = "";
        this.dom.pathSelector.style.display = "none";
        // Hide workout components during ignitor phase
        this.dom.setInputCard.style.display = "none";
        this.dom.weightCard.style.display = "none";
        this.dom.commitRow.style.display = "none";
        this.dom.boxCard.style.display = "none";
      }
      // Show/hide path options based on month
      const dd = this.dom.pathDropdown;
      dd.innerHTML = "";
      if (state.month >= 2)
        dd.add(new Option("🔥 Jacked to the Max", "jackedToMax"));
      dd.add(new Option("✅ Jacked", "jacked"));
      dd.add(new Option("⬆️ Jacked Up", "jackedUp"));
      dd.add(new Option("⬇️ Jacked Down", "jackedDown"));
      dd.value = es.path;
    }
    // Box score
    this.updateBoxScore(es);
    // Set input
    this.dom.setInputValue.textContent = es.setReps;
    this.dom.setsValue.textContent = es.sets;
    // Weight
    this.dom.weightValue.textContent = es.weight || 0;
    // Apply sticky rest override if user chose one
    if (this.userRestOverride != null) {
      es.restTime = this.userRestOverride;
    }
    // Rest buttons
    this.dom.restBtns.forEach((b) =>
      b.classList.toggle("active", parseInt(b.dataset.time) === es.restTime),
    );
    // Timer
    this.dom.timerText.textContent = "--";
    this.dom.timerCard.className = "timer-card";
    // Drop set banner
    this.updateDropSet(es);
    // BTJ banner
    this.dom.btjBanner.style.display = "none";
    // Hide remaining toast on exercise switch
    this.dom.repsToast.style.display = "none";
    // Load exercise history + pull historical weight for ignitor default
    if (typeof renderExerciseHistory === 'function') {
      renderExerciseHistory(this.dom.historyCard, item.name).then((history) => {
        if (history && history.length > 0 && es.ignitorReps == null && es.ignitorWeight === 0) {
          // Pull last weight from history as default for ignitor
          const lastWeight = this._getLastWeightFromHistory(history);
          if (lastWeight > 0) {
            es.ignitorWeight = lastWeight;
            this.dom.ignitorWeightValue.textContent = lastWeight;
          }
        }
        // Also default the main weight card if no weight set yet
        if (history && history.length > 0 && (es.weight === 0 || es.weight == null)) {
          const lastWeight = this._getLastWeightFromHistory(history);
          if (lastWeight > 0) {
            es.weight = lastWeight;
            this.dom.weightValue.textContent = lastWeight;
          }
        }
      });
    }
  }

  _getLastWeightFromHistory(history) {
    // Find the most recent session with a weight > 0
    for (const h of history) {
      // Check per-set weights first
      if (h.setsLog && h.setsLog.length > 0) {
        const firstSet = h.setsLog[0];
        if (typeof firstSet === 'object' && firstSet.weight > 0) return firstSet.weight;
      }
      // Fall back to top-level weight
      if (h.weight && h.weight > 0) return h.weight;
    }
    return 0;
  }

  logIgnitor() {
    const es = this.getES();
    const item = getCurrentItem();
    if (!item || item.isCorrective) return;
    es.ignitorReps = es.ignitorInput;
    es.path = detectPath(item, es.ignitorReps);
    es.boxScore = calcBoxScore(item, es.ignitorReps, es.path);
    es.restTime = this.userRestOverride != null ? this.userRestOverride : getRestForPath(item, es.path);
    es.setReps = es.ignitorReps; // default first set to ignitor reps
    es.weight = es.ignitorWeight || 0; // flow ignitor weight to first set weight
    playPip();
    this.startTimer(es.restTime);
    this.renderForExercise(item, state.exerciseIdx);
  }

  changePath() {
    const es = this.getES();
    const item = getCurrentItem();
    if (!item) return;
    es.path = this.dom.pathDropdown.value;
    if (es.ignitorReps != null) {
      es.boxScore = calcBoxScore(item, es.ignitorReps, es.path);
      es.restTime = this.userRestOverride != null ? this.userRestOverride : getRestForPath(item, es.path);
    }
    this.updateBoxScore(es);
    this.dom.restBtns.forEach((b) =>
      b.classList.toggle("active", parseInt(b.dataset.time) === es.restTime),
    );
    this.dom.resultText.textContent = `Logged ${es.ignitorReps} → ${formatPath(es.path)}`;
    this.updateDropSet(es);
  }

  updateBoxScore(es) {
    const item = getCurrentItem();
    const useSetCount = this.isJttmSetMode(item, es);

    if (useSetCount) {
      // JttM Month 3: show sets X / Y instead of box score points
      const targetSets = item.jttmSets;
      this.dom.boxCard.querySelector(".box-score-header").textContent = "SETS";
      this.dom.boxCurrent.textContent = es.sets;
      this.dom.boxTarget.textContent = targetSets;
      const pct = Math.min(100, (es.sets / targetSets) * 100);
      this.dom.boxBar.style.width = pct + "%";
      const complete = es.sets >= targetSets;
      this.dom.boxBar.classList.toggle("complete", complete);
      this.dom.boxCard.classList.toggle("complete", complete);
      this.dom.boxRemaining.textContent = complete
        ? "✅ COMPLETE!"
        : `${targetSets - es.sets} sets remaining`;
    } else {
      // Normal box score mode
      this.dom.boxCard.querySelector(".box-score-header").textContent =
        "BOX SCORE";
      const target = es.boxScore || 0;
      this.dom.boxCurrent.textContent = es.totalReps;
      this.dom.boxTarget.textContent = target || "--";
      const pct = target ? Math.min(100, (es.totalReps / target) * 100) : 0;
      this.dom.boxBar.style.width = pct + "%";
      const complete = target > 0 && es.totalReps >= target;
      this.dom.boxBar.classList.toggle("complete", complete);
      this.dom.boxCard.classList.toggle("complete", complete);
      const remaining = target ? Math.max(0, target - es.totalReps) : "--";
      this.dom.boxRemaining.textContent = complete
        ? "✅ COMPLETE!"
        : `${remaining} remaining`;
    }
  }

  isJttmSetMode(item, es) {
    return (
      state.month === 3 &&
      es.path === "jackedToMax" &&
      item?.jttmSets &&
      !item?.isCorrective
    );
  }

  updateDropSet(es) {
    const md = getMonthData();
    const item = getCurrentItem();
    const isJttM = es.path === "jackedToMax";
    const hasDrops = item && !item.isCorrective && (item.drop || item.drops);

    if (isJttM && hasDrops && md?.backToJacked) {
      this.dom.dropBanner.style.display = "";
      const nextSet = es.sets + 1;
      const isNow = isDropSetNext(nextSet, state.month, item);
      if (isNow) {
        this.dom.dropBanner.querySelector("span").textContent =
          state.month === 3 ? "⚡ DOUBLE DROP SET NOW" : "⚡ DROP SET NOW";
        this.dom.dropBanner.classList.add("active-drop");
      } else {
        this.dom.dropBanner.querySelector("span").textContent =
          state.month === 3 ? "⬇️⬇️ Double Drop Set" : "⬇️ Drop Set";
        this.dom.dropBanner.classList.remove("active-drop");
      }
      // Show exercise names
      if (item.drops) {
        this.dom.dropInfo.innerHTML = `→ ${item.drops[0]}<br>→ ${item.drops[1]}`;
      } else if (item.drop) {
        this.dom.dropInfo.textContent = `→ ${item.drop}`;
      }
    } else {
      this.dom.dropBanner.style.display = "none";
      this.dom.dropBanner.classList.remove("active-drop");
    }
  }

  addWeight(delta) {
    const es = this.getES();
    es.weight = Math.max(0, (es.weight || 0) + delta);
    this.dom.weightValue.textContent = es.weight;
    playPip();
  }

  addReps(delta) {
    const es = this.getES();
    es.setReps = Math.max(0, es.setReps + delta);
    this.dom.setInputValue.textContent = es.setReps;
    playPip();
  }

  commitSet() {
    const es = this.getES();
    if (es.setReps === 0) return;
    // Log individual set reps + weight
    if (!es.setsLog) es.setsLog = [];
    es.setsLog.push({ reps: es.setReps, weight: es.weight || 0 });
    es.totalReps += es.setReps;
    es.sets++;
    // Mark session as unsaved so it gets persisted
    sessionSaved = false;
    // Back to Jacked check
    const md = getMonthData();
    const item = getCurrentItem();
    if (md?.backToJacked && !item?.isCorrective && item?.range) {
      if (es.setReps > item.range[1]) {
        es.restTime = 45;
        es.btjActive = "down";
        this.dom.btjBanner.style.display = "";
        this.dom.btjText.textContent = "⏬ REST ↓ 45s (Back to Jacked)";
      } else if (es.setReps < item.range[0]) {
        es.restTime = 150;
        es.btjActive = "up";
        this.dom.btjBanner.style.display = "";
        this.dom.btjText.textContent = "⏫ REST ↑ 2:30 (Back to Jacked)";
      } else if (es.btjActive) {
        es.btjActive = null;
        this.dom.btjBanner.style.display = "none";
        es.restTime = this.userRestOverride != null ? this.userRestOverride : getRestForPath(item, es.path);
      }
      this.dom.restBtns.forEach((b) =>
        b.classList.toggle("active", parseInt(b.dataset.time) === es.restTime),
      );
    }
    // setReps stays the same - default next set to last value
    this.dom.setInputValue.textContent = es.setReps;
    this.dom.setsValue.textContent = es.sets;
    this.updateBoxScore(es);
    this.updateDropSet(es);
    // Check completion
    const useSetCount = this.isJttmSetMode(item, es);
    let completed = false;
    if (useSetCount) {
      if (es.sets >= item.jttmSets) { playTronComplete(); completed = true; }
    } else if (es.boxScore && es.totalReps >= es.boxScore) {
      playTronComplete(); completed = true;
    }
    if (completed) {
      const fw = state.mode === "2p" ? this.el : null;
      launchFireworks(fw);
    }

    // Show remaining reps/sets toast
    this.showRemainingToast(es, item, useSetCount, completed);

    if (completed && state.exerciseIdx + 1 < getAllItems().length) {
      // Auto-advance after brief delay so user sees completion
      const restTime = es.restTime;
      const fromIdx = state.exerciseIdx;
      this.startTimer(restTime);
      setTimeout(() => {
        if (state.exerciseIdx !== fromIdx) return; // user already navigated
        players.forEach((p) => p.saveCurrentState());
        state.exerciseIdx = fromIdx + 1;
        saveState();
        renderExercise();
        // Timer continues running from commitSet — don't restart
      }, 1500);
    } else {
      this.startTimer(es.restTime);
    }
  }

  startTimer(duration) {
    this.stopTimer();
    this.timeLeft = duration;
    this.dom.timerText.textContent = this.timeLeft + "s";
    this.dom.timerCard.className = "timer-card active";
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.dom.timerText.textContent = this.timeLeft + "s";
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
        playChime(this.id);
        this.dom.timerText.textContent = "GO!";
        this.dom.timerCard.className = "timer-card active done";
      } else if (this.timeLeft <= 10) {
        this.dom.timerCard.className = "timer-card active urgent";
      } else if (this.timeLeft <= 30) {
        this.dom.timerCard.className = "timer-card active warning";
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.dom.timerCard.className = "timer-card";
    this.dom.timerText.textContent = "--";
  }

  resetExercise() {
    this.stopTimer();
    const es = this.getES();
    const item = getCurrentItem();
    es.setReps = 0;
    es.totalReps = 0;
    es.sets = 0;
    es.setsLog = [];
    es.weight = 0;
    es.ignitorReps = null;
    es.ignitorWeight = 0;
    es.boxScore = null;
    es.btjActive = null;
    const mid = item?.range
      ? Math.round((item.range[0] + item.range[1]) / 2)
      : 10;
    es.ignitorInput = mid;
    this.dom.repsToast.style.display = "none";
    es.path = item?.isCorrective
      ? "corrective"
      : state.month === 1
        ? "jacked"
        : "jackedToMax";
    this.renderForExercise(item, state.exerciseIdx);
  }

  showRemainingToast(es, item, useSetCount, completed) {
    const toast = this.dom.repsToast;
    if (completed) {
      toast.style.display = "none";
      return;
    }

    let msg;
    if (useSetCount) {
      const remaining = item.jttmSets - es.sets;
      msg = `${remaining} set${remaining !== 1 ? "s" : ""} to go`;
    } else if (es.boxScore && es.boxScore > 0) {
      const remaining = Math.max(0, es.boxScore - es.totalReps);
      if (remaining === 0) { toast.style.display = "none"; return; }
      // Estimate additional sets needed based on current set reps
      const avgReps = es.sets > 0 ? es.totalReps / es.sets : es.setReps;
      const estSets = avgReps > 0 ? Math.ceil(remaining / avgReps) : "?";
      msg = `${remaining} rep${remaining !== 1 ? "s" : ""} to go (~${estSets} more set${estSets !== 1 ? "s" : ""})`;
    } else {
      toast.style.display = "none";
      return;
    }

    toast.textContent = msg;
    toast.style.display = "";
    // Re-trigger animation
    toast.classList.remove("show");
    void toast.offsetWidth;
    toast.classList.add("show");

    // Auto-hide after 4s
    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => { toast.style.display = "none"; }, 300);
    }, 4000);
  }

  saveCurrentState() {
    /* state is already in exerciseStates */
  }
}

function formatPath(p) {
  const map = {
    jacked: "Jacked",
    jackedUp: "Jacked Up",
    jackedDown: "Jacked Down",
    jackedToMax: "Jacked to the Max",
    corrective: "Corrective",
    pinkDB: "Pink DB",
    hiLoad: "Hi-Load",
  };
  return map[p] || p;
}

// ===== INIT =====
document.addEventListener("DOMContentLoaded", async () => {
  loadState();
  // Render auth UI
  if (typeof renderAuthUI === 'function') {
    renderAuthUI('auth-container');
  }
  // Try loading state from Firestore (will update if newer data exists)
  await loadStateFromFirestore();
  showSetup();
  // Save session on page unload
  window.addEventListener('beforeunload', () => {
    saveCurrentSession();
  });
});
