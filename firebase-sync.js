// ===== FIREBASE SYNC =====
// Firebase config (same project as Jacked Challenges)
const firebaseConfig = {
  apiKey: "AIzaSyA_ajqyKXXOiKeHa3oc7QpMn9h3jO7WhJ8",
  authDomain: "jacked-10by400.firebaseapp.com",
  projectId: "jacked-10by400",
  storageBucket: "jacked-10by400.firebasestorage.app",
  messagingSenderId: "670451147396",
  appId: "1:670451147396:web:d9aaaf663aa227142898d1",
};

const GOOGLE_CLIENT_ID =
  "670451147396-b7rv5vtuk5bidobn6qlddnj2erq51e0b.apps.googleusercontent.com";
const APP_ID = "set-tracker";

// --- Initialize Firebase ---
const fbApp = firebase.initializeApp(firebaseConfig);
const fbAuth = firebase.auth();
const fbDb = firebase.firestore();

// --- Auth State ---
let currentUser = null;
let authReadyResolve;
const authReady = new Promise((r) => (authReadyResolve = r));
let onAuthChangeCallbacks = [];

function onAuthChange(cb) {
  onAuthChangeCallbacks.push(cb);
}

fbAuth.onAuthStateChanged(
  (user) => {
    if (user) {
      currentUser = user;
      authReadyResolve();
      onAuthChangeCallbacks.forEach((cb) => cb(user));
    } else {
      fbAuth.signInAnonymously().catch((err) => {
        console.warn("[Auth] Anonymous sign-in failed:", err.message);
        currentUser = null;
        authReadyResolve();
        onAuthChangeCallbacks.forEach((cb) => cb(null));
      });
    }
  },
  (error) => {
    console.warn("[Auth] Auth state error:", error.message);
    currentUser = null;
    authReadyResolve();
  },
);

// --- Google Sign-In ---
function signInWithGoogle() {
  if (window.location.protocol === "file:") {
    alert("Google Sign-In requires serving from localhost or a deployed URL.");
    return Promise.reject(new Error("file: protocol"));
  }
  if (typeof google === "undefined" || !google.accounts) {
    console.error("[Auth] GIS SDK not loaded");
    return Promise.reject(new Error("GIS not loaded"));
  }

  return new Promise((resolve, reject) => {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const credential = firebase.auth.GoogleAuthProvider.credential(
            response.credential,
          );
          if (fbAuth.currentUser?.isAnonymous) {
            try {
              const result =
                await fbAuth.currentUser.linkWithCredential(credential);
              resolve(result.user);
            } catch (linkError) {
              if (linkError.code === "auth/credential-already-in-use") {
                const result = await fbAuth.signInWithCredential(credential);
                resolve(result.user);
              } else {
                throw linkError;
              }
            }
          } else {
            const result = await fbAuth.signInWithCredential(credential);
            resolve(result.user);
          }
        } catch (error) {
          console.error("[Auth] Google Auth Error:", error);
          reject(error);
        } finally {
          // Always remove the overlay
          const overlay = document.getElementById("gsi-button-container");
          if (overlay) overlay.remove();
        }
      },
      auto_select: false,
      cancel_on_tap_outside: false,
      use_fedcm_for_prompt: true,
    });

    // Render button in modal overlay
    const existing = document.getElementById("gsi-button-container");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "gsi-button-container";
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;z-index:9999;";
    overlay.innerHTML = `
      <div style="background:#111;border:1px solid #333;border-radius:12px;padding:24px;text-align:center;max-width:320px;width:100%;margin:16px;">
        <p style="color:#aaa;font-size:14px;margin-bottom:16px;">Sign in with your Google account</p>
        <div id="gsi-button" style="display:flex;justify-content:center;"></div>
        <button id="gsi-cancel" style="margin-top:16px;color:#666;font-size:12px;text-decoration:underline;background:none;border:none;cursor:pointer;">Cancel</button>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });
    document
      .getElementById("gsi-cancel")
      ?.addEventListener("click", () => overlay.remove());
    google.accounts.id.renderButton(document.getElementById("gsi-button"), {
      theme: "filled_black",
      size: "large",
      shape: "pill",
      text: "signin_with",
      width: 250,
    });
  });
}

async function signOutUser() {
  try {
    if (typeof google !== "undefined" && google.accounts) {
      google.accounts.id.disableAutoSelect();
    }
    await fbAuth.signOut();
    await fbAuth.signInAnonymously();
  } catch (error) {
    console.error("[Auth] Sign out error", error);
  }
}

// --- Auth UI ---
function renderAuthUI(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  function update(user) {
    if (!user || user.isAnonymous) {
      container.innerHTML = `<button class="auth-sign-in-btn" id="auth-sign-in">
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign In
      </button>`;
      document
        .getElementById("auth-sign-in")
        ?.addEventListener("click", signInWithGoogle);
    } else {
      const name = user.displayName || user.email || "Signed In";
      container.innerHTML = `
        <span class="auth-user-name">${name}</span>
        <button class="auth-sign-out-btn" id="auth-sign-out">Sign Out</button>`;
      document
        .getElementById("auth-sign-out")
        ?.addEventListener("click", signOutUser);
    }
  }

  // Initial render
  update(currentUser);
  // Listen for changes
  onAuthChange(update);
}

// --- Firestore Helpers ---
function getUserDocPath(subPath) {
  const uid = fbAuth.currentUser?.uid;
  if (!uid) return null;
  return `artifacts/${APP_ID}/users/${uid}/${subPath}`;
}

// Debounce timers
const _debounceTimers = {};
function debouncedSave(key, path, data, delayMs = 1000) {
  if (_debounceTimers[key]) clearTimeout(_debounceTimers[key]);
  _debounceTimers[key] = setTimeout(async () => {
    try {
      await fbDb.doc(path).set(data, { merge: true });
    } catch (err) {
      console.error("[Firestore] Save error:", err);
    }
  }, delayMs);
}

// Save nav state
function saveTrackerState(stateData) {
  const path = getUserDocPath("tracker-state/current");
  if (!path) return;
  debouncedSave("trackerState", path, {
    month: stateData.month,
    workoutIdx: stateData.workoutIdx,
    exerciseIdx: stateData.exerciseIdx,
    pass: stateData.pass,
    mode: stateData.mode,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// Load nav state
async function loadTrackerState() {
  await authReady;
  const path = getUserDocPath("tracker-state/current");
  if (!path) return null;
  try {
    const snap = await fbDb.doc(path).get();
    return snap.exists ? snap.data() : null;
  } catch (err) {
    console.error("[Firestore] Load state error:", err);
    return null;
  }
}

// Save workout session (full set-by-set log)
function saveWorkoutSession(
  month,
  workoutIdx,
  workoutName,
  exerciseStates,
  allItems,
) {
  const path = getUserDocPath(
    `workout-sessions/${month}-${workoutIdx}-${Date.now()}`,
  );
  if (!path) return;

  const exercises = allItems
    .map((item, i) => {
      const es = exerciseStates[i];
      if (!es) return null;
      return {
        name: item.name,
        isCorrective: !!item.isCorrective,
        ignitorReps: es.ignitorReps || null,
        path: es.path || null,
        setsLog: es.setsLog || [],
        totalReps: es.totalReps || 0,
        sets: es.sets || 0,
        boxScore: es.boxScore || null,
        weight: es.weight || 0,
      };
    })
    .filter(Boolean);

  // Only save if there's meaningful data
  if (exercises.every((e) => e.sets === 0)) return;

  const data = {
    month,
    workoutIdx,
    workoutName,
    date: new Date().toISOString(),
    exercises,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  // Use set (not debounced) for session saves — these are one-shot
  fbDb
    .doc(path)
    .set(data)
    .catch((err) => {
      console.error("[Firestore] Save session error:", err);
    });
}

// Get exercise history across all sessions
async function getExerciseHistory(exerciseName, limit = 50) {
  await authReady;
  const uid = fbAuth.currentUser?.uid;
  if (!uid) return [];

  try {
    const sessionsRef = fbDb
      .collection(`artifacts/${APP_ID}/users/${uid}/workout-sessions`)
      .orderBy("createdAt", "desc")
      .limit(limit);

    const snapshot = await sessionsRef.get();
    const results = [];

    snapshot.forEach((doc) => {
      const session = doc.data();
      const match = session.exercises?.find(
        (e) => e.name === exerciseName && e.sets > 0,
      );
      if (match) {
        results.push({
          date: session.date,
          workoutName: session.workoutName,
          month: session.month,
          exerciseName: match.name,
          ignitorReps: match.ignitorReps,
          path: match.path,
          setsLog: match.setsLog || [],
          totalReps: match.totalReps,
          sets: match.sets,
          boxScore: match.boxScore,
          weight: match.weight || 0,
        });
      }
    });

    return results;
  } catch (err) {
    console.error("[Firestore] History query error:", err);
    return [];
  }
}

function isSignedIn() {
  return currentUser && !currentUser.isAnonymous;
}
