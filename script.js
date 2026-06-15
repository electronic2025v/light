// ── LIGHT — UI controller ──

let allResults   = [];
let currentFilter = "all";

// ── DOM refs ──
const tableWrap  = document.getElementById("tableWrap");
const tableBody  = document.getElementById("tableBody");
const uploadZone = document.getElementById("uploadZone");
const emptyState = document.getElementById("emptyState");
const fileInput  = document.getElementById("fileInput");
const resetBtn   = document.getElementById("resetBtn");
const exportBtn  = document.getElementById("exportBtn");

// ── Badge config ──
const BADGE = {
  matched:      ["b-matched",      "✅ Matched"],
  probable:     ["b-probable",     "🔶 Probable"],
  review:       ["b-review",       "⚠️ Review"],
  "missing-acc":  ["b-missing-acc",  "❌ Missing in acc"],
  "missing-bank": ["b-missing-bank", "🏦 Missing in bank"],
};

// ── Render helpers ──

function badge(status) {
  const [cls, label] = BADGE[status] || ["b-review", status];
  return `<span class="badge ${cls}">${label}</span>`;
}

function scoreBar(score) {
  return `
    <div class="score-bar">
      <div class="score-track">
        <div class="score-fill" style="width:${score}%"></div>
      </div>
      <span class="score-num">${score}%</span>
    </div>`;
}

function renderRow(r) {
  return `
    <tr>
      <td class="mono">${r.bankId}</td>
      <td class="mono">${r.accId}</td>
      <td style="font-weight:500;">${r.amount}</td>
      <td class="mono">${r.date}</td>
      <td title="${r.bankDesc}" style="color:#555;">${r.bankDesc}</td>
      <td title="${r.accDesc}"  style="color:#555;">${r.accDesc}</td>
      <td>${badge(r.status)}</td>
      <td>${scoreBar(r.score)}</td>
    </tr>`;
}

// ── Filter & render ──

function applyFilter(results) {
  if (currentFilter === "all") return results;
  return results.filter(r => {
    if (currentFilter === "matched")  return r.status === "matched";
    if (currentFilter === "probable") return r.status === "probable";
    if (currentFilter === "review")   return r.status === "review";
    if (currentFilter === "missing")  return r.status === "missing-acc" || r.status === "missing-bank";
    return true;
  });
}

function renderTable() {
  const rows = applyFilter(allResults);

  if (!rows.length) {
    tableWrap.style.display  = "none";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  tableWrap.style.display  = "block";
  tableBody.innerHTML = rows.map(renderRow).join("");
}

// ── Metrics ──

function updateMetrics(results) {
  document.getElementById("m-total").textContent    = results.length;
  document.getElementById("m-matched").textContent  = results.filter(r => r.status === "matched").length;
  document.getElementById("m-probable").textContent = results.filter(r => r.status === "probable").length;
  document.getElementById("m-review").textContent   = results.filter(r => r.status === "review").length;
  document.getElementById("m-missing").textContent  = results.filter(r => r.status === "missing-acc" || r.status === "missing-bank").length;
}

// ── Show results ──

function showResults(results) {
  allResults = results;
  updateMetrics(results);
  uploadZone.style.display = "none";
  resetBtn.style.display   = "inline-block";
  exportBtn.style.display  = "inline-block";
  renderTable();
}

// ── Reset ──

function reset() {
  allResults   = [];
  currentFilter = "all";
  uploadZone.style.display = "block";
  tableWrap.style.display  = "none";
  emptyState.style.display = "none";
  resetBtn.style.display   = "none";
  exportBtn.style.display  = "none";
  fileInput.value          = "";
  ["m-total","m-matched","m-probable","m-review","m-missing"].forEach(id => {
    document.getElementById(id).textContent = "0";
  });
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  document.querySelector("[data-filter='all']").classList.add("active");
}

// ── Export CSV ──

function exportCSV() {
  const rows = applyFilter(allResults);
  const headers = ["Bank ID","Acc ID","Amount","Date","Bank Description","Accounting Description","Status","Score"];
  const lines = [
    headers.join(","),
    ...rows.map(r => [
      r.bankId, r.accId, `"${r.amount}"`, r.date,
      `"${r.bankDesc}"`, `"${r.accDesc}"`, r.status, r.score + "%"
    ].join(","))
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "light_reconciliation.csv";
  a.click();
}

// ── File upload ──

function handleFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const wb = XLSX.read(ev.target.result, { type: "array" });

      // Accept "Banco" / "Contabilidad" or fall back to first two sheets
      const bankSheet = wb.Sheets["Banco"]          || wb.Sheets[wb.SheetNames[0]];
      const accSheet  = wb.Sheets["Contabilidad"]   || wb.Sheets[wb.SheetNames[1]];

      if (!bankSheet || !accSheet) {
        alert("Could not find the required sheets.\nMake sure your file has a \"Banco\" and a \"Contabilidad\" sheet.");
        return;
      }

      const bank = XLSX.utils.sheet_to_json(bankSheet);
      const acc  = XLSX.utils.sheet_to_json(accSheet);

      showResults(reconcile(bank, acc));
    } catch (err) {
      alert("Error reading file: " + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
}

// ── Event listeners ──

// Filter buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    if (allResults.length) renderTable();
  });
});

// File input
fileInput.addEventListener("change", e => handleFile(e.target.files[0]));

// Demo button
document.getElementById("runDemo").addEventListener("click", () => {
  showResults(reconcile(BANK_SAMPLE, ACC_SAMPLE));
});

// Reset
resetBtn.addEventListener("click", reset);

// Export
exportBtn.addEventListener("click", exportCSV);

// Drag & drop
uploadZone.addEventListener("dragover", e => {
  e.preventDefault();
  uploadZone.classList.add("drag-over");
});
uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("drag-over"));
uploadZone.addEventListener("drop", e => {
  e.preventDefault();
  uploadZone.classList.remove("drag-over");
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
