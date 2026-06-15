// ── LIGHT Reconciliation Engine ──
// Pure matching logic, no DOM dependencies.

/**
 * Jaro-Winkler similarity between two strings.
 * Returns a value between 0 (no match) and 1 (identical).
 */
function similarity(a, b) {
  a = String(a).toLowerCase().trim();
  b = String(b).toLowerCase().trim();
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  const range = Math.max(0, Math.floor(Math.max(a.length, b.length) / 2) - 1);
  const aMatched = new Array(a.length).fill(false);
  const bMatched = new Array(b.length).fill(false);
  let matches = 0;

  for (let i = 0; i < a.length; i++) {
    const lo = Math.max(0, i - range);
    const hi = Math.min(i + range + 1, b.length);
    for (let j = lo; j < hi; j++) {
      if (!bMatched[j] && a[i] === b[j]) {
        aMatched[i] = bMatched[j] = true;
        matches++;
        break;
      }
    }
  }

  if (matches === 0) return 0;

  let transpositions = 0;
  let k = 0;
  for (let i = 0; i < a.length; i++) {
    if (aMatched[i]) {
      while (!bMatched[k]) k++;
      if (a[i] !== b[k]) transpositions++;
      k++;
    }
  }

  const jaro = (matches / a.length + matches / b.length + (matches - transpositions / 2) / matches) / 3;

  // Winkler prefix bonus
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(a.length, b.length)); i++) {
    if (a[i] === b[i]) prefix++; else break;
  }
  return jaro + prefix * 0.1 * (1 - jaro);
}

/**
 * Score a single bank row vs a single accounting row (0–100).
 *
 * Weights:
 *   Amount exact match   → 40 pts
 *   Currency match       → 20 pts
 *   Date within 2 days   → 20 pts
 *   Description similarity → up to 20 pts
 */
function matchScore(b, a) {
  const amtOk   = Math.abs(Number(b.amt) - Number(a.amt)) < 0.01 ? 1 : 0;
  const curOk   = String(b.cur).toUpperCase() === String(a.cur).toUpperCase() ? 1 : 0;
  const daysDiff = Math.abs((new Date(b.date) - new Date(a.date)) / 86_400_000);
  const dateOk  = daysDiff <= 2 ? 1 : 0;
  const descSim = similarity(b.desc, a.desc);

  return Math.round(amtOk * 40 + curOk * 20 + dateOk * 20 + descSim * 20);
}

/**
 * Determine status label from score.
 */
function scoreToStatus(score) {
  if (score >= 90) return "matched";
  if (score >= 65) return "probable";
  if (score >= 40) return "review";
  return "missing-acc";
}

/**
 * Run full reconciliation.
 * @param {Array} bank  - bank transaction rows
 * @param {Array} acc   - accounting record rows
 * @returns {Array}     - result rows ready for rendering
 */
function reconcile(bank, acc) {
  const results   = [];
  const usedAccIds = new Set();

  // Pass 1: match each bank row to its best accounting counterpart
  for (const b of bank) {
    let bestScore = 0;
    let bestAcc   = null;

    for (const a of acc) {
      if (usedAccIds.has(a.id)) continue;
      const s = matchScore(b, a);
      if (s > bestScore) { bestScore = s; bestAcc = a; }
    }

    const status = scoreToStatus(bestScore);

    // Only claim the accounting row if we actually matched it
    if (status !== "missing-acc" && bestAcc) {
      usedAccIds.add(bestAcc.id);
    } else {
      bestAcc = null;
    }

    const amt = Number(b.amt);
    results.push({
      bankId:   b.id,
      accId:    bestAcc ? bestAcc.id : "—",
      amount:   `${b.cur} ${amt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      date:     String(b.date).slice(0, 10),
      bankDesc: b.desc,
      accDesc:  bestAcc ? bestAcc.desc : "—",
      status,
      score:    bestScore,
    });
  }

  // Pass 2: accounting rows that were never matched → Missing in bank
  for (const a of acc) {
    if (!usedAccIds.has(a.id)) {
      const amt = Number(a.amt);
      results.push({
        bankId:   "—",
        accId:    a.id,
        amount:   `${a.cur} ${amt.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        date:     "—",
        bankDesc: "—",
        accDesc:  a.desc,
        status:   "missing-bank",
        score:    0,
      });
    }
  }

  return results;
}
