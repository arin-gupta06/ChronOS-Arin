const API = 'http://localhost:8001';

function fmtSeconds(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${Math.round(s)}s`;
}

async function loadData() {
  try {
    const res = await fetch(`${API}/focus-score/`);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();

    const scoreColor = d.focus_score >= 70 ? '#00b894' : d.focus_score >= 40 ? '#fdcb6e' : '#e17055';

    document.getElementById('content').innerHTML = `
      <div class="score-row">
        <div>
          <div class="score-label">Today's Focus Score</div>
          <div class="score-val" style="color:${scoreColor}">${d.focus_score}%</div>
        </div>
        <div style="font-size:32px">${d.streak_days > 0 ? '🔥' : '🎯'}</div>
      </div>
      <div class="stats-row">
        <div class="stat-mini">
          <div class="stat-mini-label">Productive</div>
          <div class="stat-mini-val" style="color:#00b894">${fmtSeconds(d.productive_time)}</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-label">Distracting</div>
          <div class="stat-mini-val" style="color:#e17055">${fmtSeconds(d.distracting_time)}</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-label">Total Tracked</div>
          <div class="stat-mini-val">${fmtSeconds(d.total_time)}</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini-label">🔥 Streak</div>
          <div class="stat-mini-val" style="color:#fdcb6e">${d.streak_days} days</div>
        </div>
      </div>
      <div class="suggestion">${d.suggestion}</div>
    `;

    document.getElementById('status-dot').className = 'dot';
    document.getElementById('status-text').textContent = 'Tracking active';

  } catch (e) {
    document.getElementById('content').innerHTML = `
      <div style="text-align:center;padding:20px;color:#8b89a0">
        <div style="font-size:32px;margin-bottom:8px">⚠️</div>
        <div style="font-size:12px">Cannot connect to backend.<br>Make sure FastAPI is running.</div>
      </div>
    `;
    document.getElementById('status-dot').className = 'dot error';
    document.getElementById('status-text').textContent = 'Backend offline';
  }
}

function openDashboard() {
  chrome.tabs.create({ url: 'http://localhost:3000' });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-open').addEventListener('click', openDashboard);
  loadData();
});
