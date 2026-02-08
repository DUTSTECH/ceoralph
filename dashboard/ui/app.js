// CEO Ralph Dashboard — Vanilla JS

let ws = null;
let currentTab = "overview";

// --- WebSocket ---

function connectWs() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  ws = new WebSocket(`${proto}//${location.host}/ws`);

  ws.onopen = () => {
    document.getElementById("connection-badge").textContent = "live";
    document.getElementById("connection-badge").className =
      "text-xs px-2 py-0.5 rounded-full bg-green-900 text-green-300";
  };

  ws.onclose = () => {
    document.getElementById("connection-badge").textContent = "disconnected";
    document.getElementById("connection-badge").className =
      "text-xs px-2 py-0.5 rounded-full bg-red-900 text-red-300";
    setTimeout(connectWs, 3000);
  };

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    handleWsMessage(msg);
  };
}

function handleWsMessage(msg) {
  if (msg.type === "worker-start" || msg.type === "worker-stop") {
    refreshCurrentTab();
  } else if (msg.type === "session-stop") {
    refreshCurrentTab();
  }
}

// --- Tab Navigation ---

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll(".tab-content").forEach((el) => el.classList.add("hidden"));
  document.querySelectorAll(".tab-btn").forEach((el) => el.classList.remove("active"));

  document.getElementById(`tab-${tab}`).classList.remove("hidden");
  document.querySelector(`[data-tab="${tab}"]`).classList.add("active");

  refreshCurrentTab();
}

function refreshCurrentTab() {
  switch (currentTab) {
    case "overview": loadOverview(); break;
    case "workers": loadWorkers(); break;
    case "log": loadLog(); break;
    case "specs": loadSpecs(); break;
  }
}

// --- API Helpers ---

async function fetchJson(url) {
  const res = await fetch(url);
  return res.json();
}

// --- Overview ---

async function loadOverview() {
  const [stats, specs, workers] = await Promise.all([
    fetchJson("/api/stats"),
    fetchJson("/api/specs"),
    fetchJson("/api/workers"),
  ]);

  // Stats cards
  const activeSpec = specs.find((s) => !s.completed_at);
  document.getElementById("stat-spec").textContent = activeSpec?.name ?? "None";
  document.getElementById("stat-workers").textContent =
    `${stats.completed_workers ?? 0}/${stats.total_workers ?? 0}`;

  const total = (stats.completed_workers ?? 0) + (stats.failed_workers ?? 0);
  const rate = total > 0 ? Math.round(((stats.completed_workers ?? 0) / total) * 100) : 0;
  document.getElementById("stat-success").textContent = total > 0 ? `${rate}%` : "—";

  const avg = stats.avg_duration_ms;
  document.getElementById("stat-duration").textContent =
    avg ? `${(avg / 1000).toFixed(1)}s` : "—";

  // Worker tree
  renderWorkerTree(workers);

  // Progress (from active spec workers)
  renderProgress(workers);
}

function renderWorkerTree(workers) {
  const container = document.getElementById("worker-tree");
  if (!workers || workers.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">No workers spawned yet.</p>';
    return;
  }

  let html = '<div class="tree-node"><span class="text-blue-400 font-bold">CEO</span> (Opus) — Coordinator</div>';

  workers.forEach((w, i) => {
    const isLast = i === workers.length - 1;
    const prefix = isLast ? "└── " : "├── ";
    const statusHtml = workerStatusBadge(w);
    const executorBadge = `<span class="badge badge-${w.executor}">${w.executor}</span>`;
    const duration = w.duration_ms ? `(${(w.duration_ms / 1000).toFixed(0)}s)` : w.status === "running" ? "..." : "";

    html += `<div class="tree-node"><span class="tree-line">${prefix}</span>[${w.worker_id}] Task ${w.task_id}: ${w.task_title ?? "—"} ${executorBadge} ${statusHtml} ${duration}</div>`;
  });

  container.innerHTML = html;
}

function workerStatusBadge(w) {
  const cls = `badge badge-${w.status}`;
  const label = w.status.toUpperCase();
  return `<span class="${cls}">${label}</span>`;
}

function renderProgress(workers) {
  const container = document.getElementById("progress-bars");
  const completed = workers.filter((w) => w.status === "completed").length;
  const total = workers.length || 1;
  const pct = Math.round((completed / total) * 100);

  container.innerHTML = `
    <div class="mb-3">
      <div class="flex justify-between text-sm mb-1">
        <span>Overall Progress</span>
        <span>${completed}/${workers.length} tasks (${pct}%)</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill green" style="width: ${pct}%"></div>
      </div>
    </div>
    <div class="text-xs text-gray-500 mt-2">
      <span class="text-green-400">${completed} completed</span> ·
      <span class="text-blue-400">${workers.filter((w) => w.status === "running").length} running</span> ·
      <span class="text-red-400">${workers.filter((w) => w.status === "failed").length} failed</span> ·
      <span class="text-gray-400">${workers.filter((w) => w.status === "pending").length} pending</span>
    </div>
  `;
}

// --- Workers Tab ---

async function loadWorkers() {
  const status = document.getElementById("worker-filter-status").value;
  const executor = document.getElementById("worker-filter-executor").value;

  let url = "/api/workers?";
  if (status) url += `status=${status}&`;
  if (executor) url += `executor=${executor}&`;

  const workers = await fetchJson(url);
  const tbody = document.getElementById("workers-table");

  if (workers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-gray-500 py-4 text-center">No workers found</td></tr>';
    return;
  }

  tbody.innerHTML = workers
    .map(
      (w) => `
    <tr class="border-t border-gray-800">
      <td class="py-2 font-mono text-sm">${w.worker_id}</td>
      <td class="py-2">${w.task_id}: ${w.task_title ?? "—"}</td>
      <td class="py-2"><span class="badge badge-${w.executor}">${w.executor}</span></td>
      <td class="py-2">${workerStatusBadge(w)}</td>
      <td class="py-2 text-sm">${w.duration_ms ? (w.duration_ms / 1000).toFixed(1) + "s" : "—"}</td>
      <td class="py-2 text-sm font-mono">${w.result ?? "—"}</td>
    </tr>
  `
    )
    .join("");
}

// --- Log Tab ---

async function loadLog() {
  const logs = await fetchJson("/api/delegation-log?limit=50");
  const container = document.getElementById("delegation-log");

  if (logs.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">No events recorded yet.</p>';
    return;
  }

  container.innerHTML = logs
    .map(
      (log) => `
    <div class="log-entry">
      <div class="flex items-center gap-2">
        <span class="log-time">${formatTime(log.timestamp)}</span>
        <span class="badge badge-${log.event.includes("start") ? "running" : log.event.includes("stop") ? "completed" : "pending"}">${log.event}</span>
        ${log.worker_id ? `<span class="font-mono text-xs text-gray-400">${log.worker_id}</span>` : ""}
      </div>
    </div>
  `
    )
    .join("");
}

// --- Specs Tab ---

async function loadSpecs() {
  const specs = await fetchJson("/api/specs");
  const container = document.getElementById("specs-list");

  if (specs.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-sm">No specs created yet.</p>';
    return;
  }

  container.innerHTML = specs
    .map(
      (s) => `
    <div class="card">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold">${s.name} ${!s.completed_at ? '<span class="badge badge-running">ACTIVE</span>' : '<span class="badge badge-completed">DONE</span>'}</h3>
          <p class="text-sm text-gray-400 mt-1">${s.goal ?? "No goal set"}</p>
        </div>
        <div class="text-right text-sm">
          <div>Phase: <span class="text-white">${s.phase}</span></div>
          <div>Workers: ${s.completed_workers ?? 0}/${s.total_workers ?? 0}</div>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

// --- Helpers ---

function formatTime(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour12: false });
}

// --- Init ---

document.addEventListener("DOMContentLoaded", () => {
  connectWs();
  loadOverview();
  setInterval(refreshCurrentTab, 10000);
});
