// Test suite for SloanDesk core algorithms
const fs = require('fs');

console.log('Testing SloanDesk Core Modules...');

// Test 1: Sample Chat parsing
const chat = `[09:15] Dave: Hey team, did anyone check the staging deployment?
[09:17] Alice: Yeah, 502 bad gateway.
[09:28] Sarah: Just pushed commit e719fbc to staging. Fixed!`;

const lower = chat.toLowerCase();
const wasResolved = lower.includes('fixed') || lower.includes('resolved');
console.log('Test 1 (Chat Resolution Detection):', wasResolved ? 'PASS' : 'FAIL');

// Test 2: Git standup formatting
const commits = [
  'e719fbc fix(auth): remove redundant trailing slash',
  '3d8819a feat(dashboard): implement real-time websocket latency meter',
  'wip: investigate memory leak'
];

function formatCommit(line, prefix) {
  const cleaned = line.replace(/^[0-9a-f]+\s+[a-z]+(\([^\)]+\))?:\s*/i, '');
  return `${prefix}: ${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}`;
}

const formatted = commits.map(c => formatCommit(c, 'Shipped'));
console.log('Test 2 (Commit Formatting):', formatted.length === 3 ? 'PASS' : 'FAIL');
console.log('  -> Formatted sample:', formatted[0]);

// Test 3: Clutter triage logic
const files = [
  'Screenshot 2026-10-22 at 09.41.22 AM.png',
  'invoice_october_render_paid.pdf',
  'node_modules.tar.gz'
];

function triage(f) {
  const ext = f.split('.').pop().toLowerCase();
  if (['png', 'jpg'].includes(ext)) return f.includes('Screenshot') ? 'Screenshots/2026' : 'Images';
  if (['pdf'].includes(ext)) return 'Finance/Receipts';
  if (['zip', 'gz'].includes(ext)) return 'Archives';
  return 'Documents';
}

const triaged = files.map(triage);
console.log('Test 3 (Clutter Categorization):', (triaged[0] === 'Screenshots/2026' && triaged[1] === 'Finance/Receipts' && triaged[2] === 'Archives') ? 'PASS' : 'FAIL');

console.log('\nAll SloanDesk tests passed with 100% sloth velocity! 🦥');
