// Sample dataset — replace or extend as needed

const BANK_SAMPLE = [
  { id: "BNK-001", desc: "Stripe Inc. — subscription revenue",   amt: 14500.00, cur: "USD", date: "2025-06-01" },
  { id: "BNK-002", desc: "AWS Cloud Services",                    amt:  3280.50, cur: "USD", date: "2025-06-03" },
  { id: "BNK-003", desc: "Payroll — June batch",                  amt: 67200.00, cur: "EUR", date: "2025-06-05" },
  { id: "BNK-004", desc: "Office rent Q2",                        amt:  9000.00, cur: "EUR", date: "2025-06-07" },
  { id: "BNK-005", desc: "Google Workspace renewal",              amt:  1440.00, cur: "USD", date: "2025-06-10" },
  { id: "BNK-006", desc: "Vendor refund — Salesforce",            amt:  2100.00, cur: "USD", date: "2025-06-12" },
  { id: "BNK-007", desc: "Intercompany transfer",                 amt: 50000.00, cur: "EUR", date: "2025-06-14" },
  { id: "BNK-008", desc: "Wire — unknown sender TRX-98821",       amt:  7750.00, cur: "USD", date: "2025-06-15" },
  { id: "BNK-010", desc: "Consulting fees — TechPartner",         amt:  5500.00, cur: "USD", date: "2025-06-20" },
];

const ACC_SAMPLE = [
  { id: "ACC-001", desc: "Stripe — monthly SaaS revenue",         amt: 14500.00, cur: "USD", date: "2025-06-01" },
  { id: "ACC-002", desc: "Amazon Web Services",                   amt:  3280.50, cur: "USD", date: "2025-06-03" },
  { id: "ACC-003", desc: "June 2025 payroll run",                 amt: 67200.00, cur: "EUR", date: "2025-06-05" },
  { id: "ACC-004", desc: "Quarterly office lease payment",        amt:  9000.00, cur: "EUR", date: "2025-06-08" },
  { id: "ACC-005", desc: "G Suite — annual licence",              amt:  1440.00, cur: "USD", date: "2025-06-10" },
  { id: "ACC-006", desc: "Salesforce credit note refund",         amt:  2100.00, cur: "USD", date: "2025-06-12" },
  { id: "ACC-007", desc: "Interco transfer — NL entity",          amt: 50000.00, cur: "EUR", date: "2025-06-14" },
  { id: "ACC-009", desc: "Accrued interest expense June",         amt:   320.00, cur: "EUR", date: "2025-06-18" },
  { id: "ACC-010", desc: "IT consulting — June",                  amt:  5000.00, cur: "USD", date: "2025-06-20" },
];
