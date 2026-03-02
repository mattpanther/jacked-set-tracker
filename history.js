// ===== EXERCISE HISTORY =====
// Renders a collapsible history card showing past session data for the current exercise.

const HISTORY_INITIAL_SHOW = 5;

function formatHistoryDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}

function formatPathLabel(path) {
  const labels = {
    jacked: 'Jacked',
    jackedToMax: 'Jacked to Max',
    jackedUp: 'Jacked Up',
    jackedDown: 'Jacked Down',
    corrective: 'Corrective',
  };
  return labels[path] || path || '—';
}

/**
 * Render exercise history into a container element.
 * @param {HTMLElement} container - The .history-card element inside the player panel
 * @param {string} exerciseName - Name of the current exercise
 */
async function renderExerciseHistory(container, exerciseName) {
  if (!container) return;

  // Show loading state
  container.innerHTML = `<div class="history-loading">Loading history…</div>`;
  container.style.display = '';

  // Check if signed in
  if (typeof isSignedIn === 'undefined' || !isSignedIn()) {
    container.innerHTML = `<div class="history-empty">Sign in to see exercise history</div>`;
    return;
  }

  try {
    const history = await getExerciseHistory(exerciseName);

    if (!history || history.length === 0) {
      container.innerHTML = `<div class="history-empty">No previous sessions</div>`;
      return [];
    }

    let expanded = false;
    const initialItems = history.slice(0, HISTORY_INITIAL_SHOW);
    const hasMore = history.length > HISTORY_INITIAL_SHOW;

    function renderItems(items, showAll) {
      const rows = items
        .map((h) => {
          // Handle both old format (plain numbers) and new format ({reps, weight})
          let setsStr;
          let weightDisplay = '';
          if (h.setsLog && h.setsLog.length > 0) {
            if (typeof h.setsLog[0] === 'object') {
              // New format: [{reps, weight}, ...]
              setsStr = h.setsLog.map((s) => s.reps).join(', ');
              // Show weight if any set has weight > 0
              const weights = [...new Set(h.setsLog.map((s) => s.weight).filter((w) => w > 0))];
              if (weights.length === 1) {
                weightDisplay = `<span class="history-weight">@ ${weights[0]} lbs</span>`;
              } else if (weights.length > 1) {
                weightDisplay = `<span class="history-weight">@ ${weights.join('/')}</span>`;
              }
            } else {
              // Old format: [reps, reps, ...]
              setsStr = h.setsLog.join(', ');
            }
          } else {
            setsStr = `${h.sets} set${h.sets !== 1 ? 's' : ''}`;
          }
          // Also show top-level weight if present and no per-set weight shown
          if (!weightDisplay && h.weight && h.weight > 0) {
            weightDisplay = `<span class="history-weight">@ ${h.weight} lbs</span>`;
          }
          const ignitor =
            h.ignitorReps != null ? `${h.ignitorReps} rep ignitor` : '';
          const pathLabel = formatPathLabel(h.path);

          return `<div class="history-row">
            <div class="history-row-header">
              <span class="history-date">${formatHistoryDate(h.date)}</span>
              <span class="history-path">${pathLabel}</span>
              ${ignitor ? `<span class="history-ignitor">${ignitor}</span>` : ''}
              ${weightDisplay}
            </div>
            <div class="history-sets">
              <span class="history-sets-label">Sets:</span>
              <span class="history-sets-values">${setsStr}</span>
              <span class="history-total">(${h.totalReps}${h.boxScore ? '/' + h.boxScore : ''})</span>
            </div>
          </div>`;
        })
        .join('');

      const showMoreBtn =
        hasMore && !showAll
          ? `<button class="history-show-more" id="history-show-more">Show all (${history.length})</button>`
          : hasMore && showAll
            ? `<button class="history-show-less" id="history-show-less">Show less</button>`
            : '';

      container.innerHTML = `
        <div class="history-header" id="history-toggle">
          <span class="history-title">📊 LAST SESSIONS</span>
          <span class="history-count">${history.length}</span>
        </div>
        <div class="history-body" id="history-body">
          ${rows}
          ${showMoreBtn}
        </div>`;

      // Toggle collapse
      const toggle = container.querySelector('#history-toggle');
      const body = container.querySelector('#history-body');
      toggle?.addEventListener('click', () => {
        body.classList.toggle('collapsed');
        toggle.classList.toggle('collapsed');
      });

      // Show more/less
      const moreBtn = container.querySelector('#history-show-more');
      moreBtn?.addEventListener('click', () => {
        renderItems(history, true);
      });
      const lessBtn = container.querySelector('#history-show-less');
      lessBtn?.addEventListener('click', () => {
        renderItems(initialItems, false);
      });
    }

    renderItems(initialItems, false);
    return history;
  } catch (err) {
    console.error('[History] Render error:', err);
    container.innerHTML = `<div class="history-empty">Could not load history</div>`;
    return [];
  }
}
