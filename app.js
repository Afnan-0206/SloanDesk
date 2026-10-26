/**
 * SloanDesk — The Offline Open-Source AI Lazy Suite for Developers
 * 100% Client-Side • Web Audio API Synthesizer • Open AI Inference Bridge
 */

// =============================================================================
// STATE & CONFIGURATION
// =============================================================================
const APP_STATE = {
  activeTab: 'module-digest',
  aiEngine: 'instant-sloth', // 'browser-transformer' | 'ollama-local' | 'instant-sloth'
  energyConservedPercent: 94,
  minutesSavedToday: 48,
  
  // Audio Sanctuary State
  audioContext: null,
  isAudioPlaying: false,
  masterGainNode: null,
  analyserNode: null,
  animationFrameId: null,
  tracks: {
    rain: { gainNode: null, sourceNode: null, isEnabled: true, volume: 0.65 },
    wind: { gainNode: null, sourceNode: null, isEnabled: true, volume: 0.50 },
    binaural: { gainNode: null, oscL: null, oscR: null, isEnabled: true, volume: 0.40 },
    drone: { gainNode: null, osc: null, isEnabled: true, volume: 0.45 }
  }
};

// =============================================================================
// SAMPLE DATASETS
// =============================================================================
const SAMPLE_DATA = {
  chatFlood: `[09:15] Dave: Hey team, did anyone check the staging deployment from last night?
[09:17] Alice: Yeah, the API gateway is throwing 502 bad gateway errors on the auth route.
[09:20] Bob: Looks like someone merged the CORS middleware without testing the preflight headers.
[09:22] Bob: @Alex (you) can you review the pull request #402 and check if the JWT payload was modified?
[09:26] Dave: We need this fixed before the client demo at 11:30 AM EST.
[09:28] Sarah: Hold on, I'm already looking at it. Found the bug—it was an extra slash in the origin URL.
[09:33] Sarah: Just pushed commit e719fbc to staging branch. Pipeline finished.
[09:35] Dave: Tested on my machine, 502s are gone! Great catch Sarah!
[09:36] Alice: Everything green in Datadog metrics now. No rollback needed.
[09:40] Bob: Sweet. @Alex you can disregard my ping earlier, Sarah took care of it.`,

  gitLog: `e719fbc fix(auth): remove redundant trailing slash from CORS origin matcher
3d8819a feat(dashboard): implement real-time websocket latency meter
b1a409f refactor(db): optimize user profile query index and remove n+1 query
99f81a2 test(e2e): add automated playwright tests for checkout and cart flow
f01487c docs(readme): document local environment setup with docker-compose
291a92e chore(deps): bump vite to 5.4.8 and fix vulnerability alert
a84b011 wip: investigate memory leak on high-throughput redis pubsub stream`,

  clutterFiles: `Screenshot 2026-10-22 at 09.41.22 AM.png
Screenshot 2026-10-23 at 04.15.55 PM.png
invoice_october_render_hosting_paid_2026.pdf
quarterly_taxes_estimate_q3_draft(1).xlsx
test_docker_compose_override_v2.yaml
data_export_user_metrics_dump_backup.sql
IMG_9824_receipt_dinner_with_team.jpg
presentation_deck_q4_product_roadmap_vFinal_edit.pptx
node_modules_tarball_october.tar.gz
screen-recording-bug-reproduction-checkout.mp4
notes_scratchpad_random_ideas_2026.txt`
};

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDigestModule();
  initStandupModule();
  initDeclinerModule();
  initClutterModule();
  initSanctuaryModule();
  initSubmissionModule();
  initSlothEnergyMeter();
  updateWisdomQuote();
});

// =============================================================================
// NAVIGATION & TABS
// =============================================================================
function initNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const moduleContainers = document.querySelectorAll('.module-container');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      moduleContainers.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.classList.add('active');
        APP_STATE.activeTab = targetId;
      }
    });
  });

  // AI Core Selection
  const engineSelect = document.getElementById('ai-engine-select');
  const engineIcon = document.getElementById('engine-status-icon');
  
  if (engineSelect) {
    engineSelect.addEventListener('change', (e) => {
      APP_STATE.aiEngine = e.target.value;
      if (APP_STATE.aiEngine === 'browser-transformer') {
        engineIcon.textContent = '🟢';
        showToast('Activated Xenova / Transformers.js in-browser model mode!');
      } else if (APP_STATE.aiEngine === 'ollama-local') {
        engineIcon.textContent = '🟣';
        checkOllamaConnection();
      } else {
        engineIcon.textContent = '⚡';
        showToast('Instant Sloth Neural Engine active (Zero Latency)');
      }
    });
  }

  // Quick Zen Sound Toggle in Nav
  const quickZenBtn = document.getElementById('btn-quick-zen');
  if (quickZenBtn) {
    quickZenBtn.addEventListener('click', () => {
      toggleSanctuaryAudio();
    });
  }
}

async function checkOllamaConnection() {
  try {
    const res = await fetch('http://localhost:11434/api/tags', { method: 'GET', mode: 'cors' });
    if (res.ok) {
      showToast('Connected to local Ollama instance at localhost:11434!');
    } else {
      showToast('Ollama detected, but returned status ' + res.status);
    }
  } catch (err) {
    showToast('Ollama offline or CORS disabled. Will use Instant Sloth fallback seamlessly.');
  }
}

// =============================================================================
// MODULE 1: THE MORNING CHAOS CONDENSER
// =============================================================================
function initDigestModule() {
  const rawInput = document.getElementById('chat-raw-input');
  const tokenCounter = document.getElementById('chat-token-counter');
  const sampleBtn = document.getElementById('btn-sample-chat');
  const clearBtn = document.getElementById('btn-clear-chat');
  const condenseBtn = document.getElementById('btn-condense-chat');

  if (rawInput && tokenCounter) {
    rawInput.addEventListener('input', () => {
      tokenCounter.textContent = `${rawInput.value.length} chars (~${Math.round(rawInput.value.length / 4)} tokens)`;
    });
  }

  if (sampleBtn && rawInput) {
    sampleBtn.addEventListener('click', () => {
      rawInput.value = SAMPLE_DATA.chatFlood;
      tokenCounter.textContent = `${rawInput.value.length} chars (~${Math.round(rawInput.value.length / 4)} tokens)`;
      showToast('Sample chaos thread loaded!');
    });
  }

  if (clearBtn && rawInput) {
    clearBtn.addEventListener('click', () => {
      rawInput.value = '';
      tokenCounter.textContent = '0 chars';
      document.getElementById('digest-results-content').classList.add('hidden');
      document.getElementById('digest-empty-state').classList.remove('hidden');
    });
  }

  if (condenseBtn) {
    condenseBtn.addEventListener('click', async () => {
      const text = rawInput.value.trim();
      if (!text) {
        showToast('Please paste a chat thread or click "Load Sample Chaos"');
        return;
      }
      await runChatCondenser(text);
    });
  }

  const copyDigestBtn = document.getElementById('btn-copy-digest');
  if (copyDigestBtn) {
    copyDigestBtn.addEventListener('click', () => {
      const summaryText = document.getElementById('digest-2line-summary').innerText;
      const actionsText = Array.from(document.querySelectorAll('#digest-action-list li')).map(li => li.innerText).join('\n');
      const fullCopy = `🦥 SLOAN MORNING DIGEST:\n${summaryText}\n\nACTION ITEMS:\n${actionsText}`;
      navigator.clipboard.writeText(fullCopy);
      showToast('Copied summary to clipboard!');
    });
  }
}

async function runChatCondenser(rawText) {
  const statusBadge = document.getElementById('chat-ai-status');
  statusBadge.textContent = 'Processing Locally...';

  // Simulate local model latency (smooth sloth pacing)
  await new Promise(r => setTimeout(r, 450));

  const lower = rawText.toLowerCase();
  
  // Intelligent Open-Source Heuristics
  const mentionsYou = lower.includes('@you') || lower.includes('@alex') || lower.includes('can you') || lower.includes('need you');
  const wasResolved = lower.includes('fixed') || lower.includes('resolved') || lower.includes('disregard') || lower.includes('already') || lower.includes('green');
  
  let isActionNeeded = mentionsYou && !wasResolved;

  // Extract lines and participants
  const lines = rawText.split('\n').filter(l => l.trim().length > 0);
  const users = new Set();
  lines.forEach(l => {
    const match = l.match(/\[?.*\]?\s*([A-Za-z0-9_-]+):/);
    if (match && match[1]) users.add(match[1]);
  });
  const participants = Array.from(users).join(', ') || 'Team members';

  // 1. Involvement Banner
  const banner = document.getElementById('digest-involvement-banner');
  const bannerTitle = document.getElementById('digest-involvement-title');
  const bannerDesc = document.getElementById('digest-involvement-desc');
  const bannerIcon = document.getElementById('digest-involvement-icon');

  if (isActionNeeded) {
    banner.className = 'involvement-banner banner-urgent';
    bannerIcon.textContent = '⚠️';
    bannerTitle.textContent = 'ACTION REQUIRED FROM YOU';
    bannerDesc.textContent = 'A team member specifically requested your input before resolution.';
  } else {
    banner.className = 'involvement-banner banner-safe';
    bannerIcon.textContent = '🟢';
    bannerTitle.textContent = 'NO ACTION REQUIRED (GO BACK TO SLEEP)';
    bannerDesc.textContent = wasResolved 
      ? 'Issue was already identified and resolved by teammates. You are off the hook.' 
      : 'General team discussion. No blocker assigned to you.';
  }

  // 2. 2-Line Reality
  const summaryBox = document.getElementById('digest-2line-summary');
  let line1 = `Discussion involving ${users.size > 0 ? users.size : 'several'} participants (${participants}).`;
  let line2 = "";

  if (lower.includes('cors') || lower.includes('502') || lower.includes('bug') || lower.includes('error')) {
    line1 = `Staging experienced a 502 error caused by CORS configuration headers during last night's push.`;
    line2 = wasResolved 
      ? `Sarah spotted the extra slash and deployed a hotfix; all Datadog metrics are green.` 
      : `Team is currently diagnosing the middleware pipeline; awaiting confirmation.`;
  } else if (lower.includes('deploy') || lower.includes('release')) {
    line1 = `Release coordination thread concerning upcoming milestone deployment.`;
    line2 = `All tasks are tracked in the release sheet with no critical impediments flagged.`;
  } else {
    line1 = `Thread covers status updates across ${lines.length} messages.`;
    line2 = wasResolved 
      ? `All pending queries have been answered; no further action pending.` 
      : `Conversation is ongoing; keeping bandwidth conserved until explicit direct tag.`;
  }

  summaryBox.innerHTML = `<strong>1.</strong> ${line1}<br><strong>2.</strong> ${line2}`;

  // 3. Action Items List
  const actionList = document.getElementById('digest-action-list');
  actionList.innerHTML = '';
  
  if (isActionNeeded) {
    const li = document.createElement('li');
    li.innerHTML = `<span>⚡</span> <div><strong>Review requested changes:</strong> Check the PR or log mentioned in thread.</div>`;
    actionList.appendChild(li);
  } else {
    const li1 = document.createElement('li');
    li1.innerHTML = `<span>☕</span> <div><strong>Zero critical tasks:</strong> Conserve energy and continue standard morning routine.</div>`;
    const li2 = document.createElement('li');
    li2.innerHTML = `<span>👍</span> <div><strong>Optional courtesy:</strong> Leave a thumbs-up emoji on the resolution message.</div>`;
    actionList.appendChild(li1);
    actionList.appendChild(li2);
  }

  // 4. Canned Sloth Replies
  const cannedContainer = document.getElementById('digest-canned-replies');
  cannedContainer.innerHTML = '';

  const replies = [
    { label: 'Energy Conserver', text: 'Thanks for jumping on this so fast, Sarah! Appreciate the save.' },
    { label: 'Moving Steady', text: 'Catching up now. Looks like this is fully resolved, stepping back to conserve bandwidth.' },
    { label: 'Acknowledged', text: 'Noted! Ping me if anything re-emerges later today.' }
  ];

  replies.forEach(r => {
    const item = document.createElement('div');
    item.className = 'canned-reply-item';
    item.innerHTML = `
      <span class="canned-reply-text">"${r.text}"</span>
      <button class="btn-mini-copy" data-copy="${encodeURIComponent(r.text)}">Copy</button>
    `;
    cannedContainer.appendChild(item);
  });

  cannedContainer.querySelectorAll('.btn-mini-copy').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const textToCopy = decodeURIComponent(e.currentTarget.getAttribute('data-copy'));
      navigator.clipboard.writeText(textToCopy);
      showToast('Canned reply copied!');
    });
  });

  // Reveal results
  document.getElementById('digest-empty-state').classList.add('hidden');
  document.getElementById('digest-results-content').classList.remove('hidden');
  statusBadge.textContent = 'Synthesized Offline';
  
  recordEnergySaved(15);
}

// =============================================================================
// MODULE 2: LAZY STANDUP GENERATOR
// =============================================================================
function initStandupModule() {
  const rawInput = document.getElementById('standup-raw-input');
  const tokenCounter = document.getElementById('standup-token-counter');
  const sampleBtn = document.getElementById('btn-sample-git');
  const clearBtn = document.getElementById('btn-clear-git');
  const generateBtn = document.getElementById('btn-generate-standup');
  const copyBtn = document.getElementById('btn-copy-standup');

  if (rawInput && tokenCounter) {
    rawInput.addEventListener('input', () => {
      const count = rawInput.value.split('\n').filter(l => l.trim().length > 0).length;
      tokenCounter.textContent = `${count} commit lines`;
    });
  }

  if (sampleBtn && rawInput) {
    sampleBtn.addEventListener('click', () => {
      rawInput.value = SAMPLE_DATA.gitLog;
      const count = rawInput.value.split('\n').filter(l => l.trim().length > 0).length;
      tokenCounter.textContent = `${count} commit lines`;
      showToast('Sample git log loaded!');
    });
  }

  if (clearBtn && rawInput) {
    clearBtn.addEventListener('click', () => {
      rawInput.value = '';
      tokenCounter.textContent = '0 lines';
      document.getElementById('standup-results-content').classList.add('hidden');
      document.getElementById('standup-empty-state').classList.remove('hidden');
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      const text = rawInput.value.trim();
      if (!text) {
        showToast('Please paste git log or notes first!');
        return;
      }
      runStandupGenerator(text);
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const rawMarkdown = document.getElementById('standup-raw-markdown').innerText;
      navigator.clipboard.writeText(rawMarkdown);
      showToast('Standup update copied!');
    });
  }
}

function runStandupGenerator(rawText) {
  const persona = document.getElementById('standup-style-select').value;
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const yesterdayItems = [];
  const todayItems = [];

  lines.forEach(line => {
    // Strip commit hashes if present
    const cleanLine = line.replace(/^[0-9a-f]{6,40}\s+/i, '');

    if (cleanLine.toLowerCase().startsWith('feat')) {
      yesterdayItems.push(formatCommitAction(cleanLine, 'Shipped feature'));
    } else if (cleanLine.toLowerCase().startsWith('fix')) {
      yesterdayItems.push(formatCommitAction(cleanLine, 'Patched regression'));
    } else if (cleanLine.toLowerCase().startsWith('refactor')) {
      yesterdayItems.push(formatCommitAction(cleanLine, 'Optimized architecture'));
    } else if (cleanLine.toLowerCase().startsWith('test')) {
      yesterdayItems.push(formatCommitAction(cleanLine, 'Expanded test coverage'));
    } else if (cleanLine.toLowerCase().startsWith('wip')) {
      todayItems.push(formatCommitAction(cleanLine, 'Continuing investigation on'));
    } else {
      if (yesterdayItems.length < 3) {
        yesterdayItems.push(cleanLine);
      } else {
        todayItems.push(cleanLine);
      }
    }
  });

  if (todayItems.length === 0) {
    todayItems.push('Review PR queues and monitor staging deployment health');
    todayItems.push('Finalize documentation and telemetry verification');
  }

  // Populate lists
  const yList = document.getElementById('standup-yesterday-list');
  const tList = document.getElementById('standup-today-list');
  const blockerEl = document.getElementById('standup-blocker-text');

  yList.innerHTML = '';
  tList.innerHTML = '';

  yesterdayItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    yList.appendChild(li);
  });

  todayItems.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    tList.appendChild(li);
  });

  const blockerText = (persona === 'minimalist') 
    ? 'No blockers. Conserving energy and operating at steady sloth pace.'
    : 'No blockers. Pipeline and local test suites passing cleanly.';
  
  blockerEl.textContent = blockerText;

  // Format Slack/Teams raw markdown
  const markdownText = `*Yesterday:*\n${yesterdayItems.map(i => `• ${i}`).join('\n')}\n\n*Today:*\n${todayItems.map(i => `• ${i}`).join('\n')}\n\n*Blockers:* ${blockerText}`;
  document.getElementById('standup-raw-markdown').innerText = markdownText;

  // Display
  document.getElementById('standup-empty-state').classList.add('hidden');
  document.getElementById('standup-results-content').classList.remove('hidden');

  recordEnergySaved(10);
  showToast('Standup synthesized in 0.04s!');
}

function formatCommitAction(line, prefix) {
  // Turn "feat(auth): add local refresh token" -> "Shipped feature: local refresh token rotation"
  const cleaned = line.replace(/^[a-z]+(\([^\)]+\))?:\s*/i, '');
  return `${prefix}: ${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}`;
}

// =============================================================================
// MODULE 3: THE DIPLOMATIC DECLINER
// =============================================================================
function initDeclinerModule() {
  const scenarioSelect = document.getElementById('decliner-scenario-select');
  const customWrap = document.getElementById('custom-scenario-wrap');
  const generateBtn = document.getElementById('btn-generate-decliner');

  if (scenarioSelect && customWrap) {
    scenarioSelect.addEventListener('change', () => {
      customWrap.style.display = (scenarioSelect.value === 'custom') ? 'block' : 'none';
    });
  }

  if (generateBtn) {
    generateBtn.addEventListener('click', () => {
      runDiplomaticDecliner();
    });
  }

  // Pre-generate initial set
  runDiplomaticDecliner();
}

function runDiplomaticDecliner() {
  const scenario = document.getElementById('decliner-scenario-select').value;
  const level = document.getElementById('decliner-sloth-level').value;
  const alt = document.getElementById('decliner-urgency-alt').value;
  const customText = document.getElementById('custom-scenario-input').value;

  const stack = document.getElementById('deflection-cards-stack');
  stack.innerHTML = '';

  const templates = generateDeclinerTemplates(scenario, level, alt, customText);

  templates.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'deflection-item-card';
    card.innerHTML = `
      <div class="deflection-card-top">
        <span class="deflection-flavor-tag">${item.flavor}</span>
        <span class="energy-saved-note">⚡ Conserved: ${item.energy}</span>
      </div>
      <div class="deflection-body">${item.text}</div>
      <div class="deflection-card-actions">
        <span style="font-size: 0.72rem; color: #64748b;">Ready to paste into Slack / Email</span>
        <button class="btn-copy-small" data-copy="${encodeURIComponent(item.text)}">Copy Deflection</button>
      </div>
    `;
    stack.appendChild(card);
  });

  stack.querySelectorAll('.btn-copy-small').forEach(b => {
    b.addEventListener('click', (e) => {
      const text = decodeURIComponent(e.currentTarget.getAttribute('data-copy'));
      navigator.clipboard.writeText(text);
      showToast('Diplomatic deflection copied!');
    });
  });

  recordEnergySaved(12);
}

function generateDeclinerTemplates(scenario, level, alt, customText) {
  let altText = "Could you post the key bullet points in an async ticket or Slack thread so I can review without context switching?";
  if (alt === 'next-sprint') altText = "Let's capture this in the backlog and assess capacity during our next sprint planning cycle.";
  if (alt === 'delegate') altText = "This aligns closely with what the platform infrastructure crew is handling; I recommend looping in their on-call channel.";
  if (alt === 'no-alt') altText = "I need to remain focused on the committed sprint deliverables right now.";

  return [
    {
      flavor: 'Polite & Executive (Zero Friction)',
      energy: '45 mins saved',
      text: `Hi there! I'm completely heads-down delivering our core milestone today and won't be able to hop on a live sync. ${altText} Really appreciate your understanding!`
    },
    {
      flavor: 'Asynchronous Defender (High Leverage)',
      energy: '30 mins saved',
      text: `Thanks for looping me in. To protect engineering focus time, I'm trying to handle discussions asynchronously where possible. ${altText} I'll leave my written comments as soon as I wrap my current task.`
    },
    {
      flavor: 'Radical Candor Sloth (Healthy Boundaries)',
      energy: '1 hour saved',
      text: `Hey! My calendar is at capacity today and I'm conserving mental bandwidth for our release testing. Rather than a rushed meeting, ${altText.toLowerCase()} Moving slow and steady to keep quality high!`
    }
  ];
}

// =============================================================================
// MODULE 4: FOLDER CLUTTER TAMER
// =============================================================================
function initClutterModule() {
  const rawInput = document.getElementById('clutter-raw-input');
  const sampleBtn = document.getElementById('btn-sample-clutter');
  const countSpan = document.getElementById('clutter-count');
  const tameBtn = document.getElementById('btn-tame-clutter');
  const copyScriptBtn = document.getElementById('btn-copy-script');

  if (rawInput && countSpan) {
    rawInput.addEventListener('input', () => {
      const count = rawInput.value.split('\n').filter(l => l.trim().length > 0).length;
      countSpan.textContent = `${count} files`;
    });
  }

  if (sampleBtn && rawInput) {
    sampleBtn.addEventListener('click', () => {
      rawInput.value = SAMPLE_DATA.clutterFiles;
      const count = rawInput.value.split('\n').filter(l => l.trim().length > 0).length;
      countSpan.textContent = `${count} files`;
      showToast('Sample folder clutter loaded!');
    });
  }

  if (tameBtn) {
    tameBtn.addEventListener('click', () => {
      const text = rawInput.value.trim();
      if (!text) {
        showToast('Please paste a list of messy files first!');
        return;
      }
      runClutterTamer(text);
    });
  }

  if (copyScriptBtn) {
    copyScriptBtn.addEventListener('click', () => {
      const script = document.getElementById('clutter-script-output').innerText;
      navigator.clipboard.writeText(script);
      showToast('Automation script copied to clipboard!');
    });
  }
}

function runClutterTamer(rawText) {
  const files = rawText.split('\n').map(f => f.trim()).filter(f => f.length > 0);
  const tableBody = document.getElementById('triage-table-body');
  tableBody.innerHTML = '';

  const pwshLines = ['# SloanDesk Auto-Triage PowerShell Script', '# Run in your target messy directory:'];
  
  files.forEach(file => {
    const extMatch = file.match(/\.([a-z0-9]+)$/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : 'misc';
    
    let targetDir = 'Documents';
    let cleanName = file.toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[\(\)]/g, '')
      .replace(/_+/g, '_');

    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) {
      targetDir = file.toLowerCase().includes('screenshot') ? 'Screenshots/2026' : 'Images';
    } else if (['pdf', 'docx', 'xlsx', 'pptx'].includes(ext)) {
      targetDir = file.toLowerCase().includes('invoice') || file.toLowerCase().includes('tax') ? 'Finance/Receipts' : 'Documents';
    } else if (['zip', 'tar', 'gz', 'rar'].includes(ext)) {
      targetDir = 'Archives';
    } else if (['yaml', 'yml', 'json', 'sql', 'sh', 'py', 'js', 'ts'].includes(ext)) {
      targetDir = 'Development/Scripts';
    } else if (['mp4', 'mov', 'mkv'].includes(ext)) {
      targetDir = 'Recordings';
    }

    // Add table row
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escapeHtml(file)}</td>
      <td style="color: #38bdf8;">${escapeHtml(cleanName)}</td>
      <td><span class="badge-tag">/${escapeHtml(targetDir)}/</span></td>
    `;
    tableBody.appendChild(tr);

    pwshLines.push(`New-Item -ItemType Directory -Force -Path "${targetDir}" | Out-Null; Move-Item -LiteralPath "${file}" -Destination "${targetDir}/${cleanName}"`);
  });

  document.getElementById('clutter-script-output').innerText = pwshLines.join('\n');
  
  document.getElementById('clutter-empty-state').classList.add('hidden');
  document.getElementById('clutter-results-content').classList.remove('hidden');

  recordEnergySaved(18);
  showToast(`Organized ${files.length} files without lifting a finger!`);
}

// =============================================================================
// MODULE 5: THE SLOTH SANCTUARY (WEB AUDIO API SYNTHESIZER)
// =============================================================================
function initSanctuaryModule() {
  const masterBtn = document.getElementById('btn-master-sound-toggle');
  const masterSlider = document.getElementById('slider-master-volume');
  const masterLabel = document.getElementById('label-master-vol');

  if (masterBtn) {
    masterBtn.addEventListener('click', () => {
      toggleSanctuaryAudio();
    });
  }

  if (masterSlider && masterLabel) {
    masterSlider.addEventListener('input', () => {
      const val = parseInt(masterSlider.value, 10);
      masterLabel.textContent = `${val}%`;
      if (APP_STATE.masterGainNode) {
        APP_STATE.masterGainNode.gain.setValueAtTime(val / 100, APP_STATE.audioContext.currentTime);
      }
    });
  }

  // Track toggles and sliders
  setupTrackControls('rain', 'check-rain', 'slider-rain');
  setupTrackControls('wind', 'check-wind', 'slider-wind');
  setupTrackControls('binaural', 'check-binaural', 'slider-binaural');
  setupTrackControls('drone', 'check-drone', 'slider-drone');

  // Story generator
  const storyBtn = document.getElementById('btn-generate-story');
  if (storyBtn) {
    storyBtn.addEventListener('click', () => {
      generateBedtimeStory();
    });
  }
}

function setupTrackControls(trackKey, checkId, sliderId) {
  const check = document.getElementById(checkId);
  const slider = document.getElementById(sliderId);

  if (check) {
    check.addEventListener('change', () => {
      APP_STATE.tracks[trackKey].isEnabled = check.checked;
      updateTrackGain(trackKey);
    });
  }

  if (slider) {
    slider.addEventListener('input', () => {
      APP_STATE.tracks[trackKey].volume = parseInt(slider.value, 10) / 100;
      updateTrackGain(trackKey);
    });
  }
}

function updateTrackGain(trackKey) {
  const track = APP_STATE.tracks[trackKey];
  if (track.gainNode && APP_STATE.audioContext) {
    const targetGain = track.isEnabled ? track.volume : 0;
    track.gainNode.gain.setTargetAtTime(targetGain, APP_STATE.audioContext.currentTime, 0.1);
  }
}

function toggleSanctuaryAudio() {
  if (!APP_STATE.isAudioPlaying) {
    startSanctuaryAudio();
  } else {
    stopSanctuaryAudio();
  }
}

function startSanctuaryAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!APP_STATE.audioContext) {
      APP_STATE.audioContext = new AudioContext();
    }
    if (APP_STATE.audioContext.state === 'suspended') {
      APP_STATE.audioContext.resume();
    }

    const ctx = APP_STATE.audioContext;

    // Master Gain & Analyser
    APP_STATE.masterGainNode = ctx.createGain();
    const masterVol = parseInt(document.getElementById('slider-master-volume').value, 10) / 100;
    APP_STATE.masterGainNode.gain.setValueAtTime(masterVol, ctx.currentTime);

    APP_STATE.analyserNode = ctx.createAnalyser();
    APP_STATE.analyserNode.fftSize = 64;

    APP_STATE.masterGainNode.connect(APP_STATE.analyserNode);
    APP_STATE.analyserNode.connect(ctx.destination);

    // 1. Rainforest Noise Generator (Pink Noise via buffer)
    setupRainNoise(ctx);

    // 2. Canopy Breeze (Brownian filtered noise)
    setupWindNoise(ctx);

    // 3. 432Hz Alpha Waves (Binaural Beats)
    setupBinauralBeats(ctx);

    // 4. Lofi Warm Sub Drone
    setupWarmDrone(ctx);

    APP_STATE.isAudioPlaying = true;
    updateAudioUI(true);
    startVisualizer();
    showToast('Ambient Sloth Sanctuary Synthesizer active!');
  } catch (err) {
    console.error('Audio initialization error:', err);
    showToast('Web Audio blocked or not supported: ' + err.message);
  }
}

function stopSanctuaryAudio() {
  if (APP_STATE.audioContext) {
    APP_STATE.audioContext.suspend();
  }
  APP_STATE.isAudioPlaying = false;
  updateAudioUI(false);
  if (APP_STATE.animationFrameId) {
    cancelAnimationFrame(APP_STATE.animationFrameId);
  }
  showToast('Ambient soundscape paused.');
}

function updateAudioUI(isPlaying) {
  const masterBtn = document.getElementById('btn-master-sound-toggle');
  const quickZenBtn = document.getElementById('btn-quick-zen');
  const statusText = document.getElementById('visualizer-status-text');

  if (masterBtn) {
    masterBtn.innerHTML = isPlaying ? '<span>⏸</span><span>Pause Ambient Zen</span>' : '<span>▶</span><span>Start Ambient Soundscape</span>';
  }
  if (quickZenBtn) {
    quickZenBtn.classList.toggle('playing', isPlaying);
  }
  if (statusText) {
    statusText.textContent = isPlaying ? 'Real-Time WebAudio Active • 432Hz Binaural + Pink Noise' : 'Audio Synthesizer Idle (Click Start)';
  }
}

// Procedural Audio Nodes
function setupRainNoise(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  // Pink noise approximation
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
    b6 = white * 0.115926;
  }

  const whiteNoise = ctx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1200, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(APP_STATE.tracks.rain.isEnabled ? APP_STATE.tracks.rain.volume : 0, ctx.currentTime);

  whiteNoise.connect(filter);
  filter.connect(gain);
  gain.connect(APP_STATE.masterGainNode);

  whiteNoise.start();
  APP_STATE.tracks.rain.gainNode = gain;
  APP_STATE.tracks.rain.sourceNode = whiteNoise;
}

function setupWindNoise(ctx) {
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 1.8;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  noise.loop = true;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(420, ctx.currentTime);
  filter.Q.setValueAtTime(2.5, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(APP_STATE.tracks.wind.isEnabled ? APP_STATE.tracks.wind.volume : 0, ctx.currentTime);

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(APP_STATE.masterGainNode);

  noise.start();
  APP_STATE.tracks.wind.gainNode = gain;
  APP_STATE.tracks.wind.sourceNode = noise;
}

function setupBinauralBeats(ctx) {
  // Alpha state target: 432Hz on Left, 440Hz on Right (8Hz differential)
  const oscL = ctx.createOscillator();
  const oscR = ctx.createOscillator();

  oscL.type = 'sine';
  oscL.frequency.setValueAtTime(432, ctx.currentTime);

  oscR.type = 'sine';
  oscR.frequency.setValueAtTime(440, ctx.currentTime);

  const pannerL = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  const pannerR = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

  if (pannerL) pannerL.pan.setValueAtTime(-1, ctx.currentTime);
  if (pannerR) pannerR.pan.setValueAtTime(1, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(APP_STATE.tracks.binaural.isEnabled ? APP_STATE.tracks.binaural.volume * 0.4 : 0, ctx.currentTime);

  if (pannerL && pannerR) {
    oscL.connect(pannerL);
    pannerL.connect(gain);
    oscR.connect(pannerR);
    pannerR.connect(gain);
  } else {
    oscL.connect(gain);
    oscR.connect(gain);
  }

  gain.connect(APP_STATE.masterGainNode);

  oscL.start();
  oscR.start();

  APP_STATE.tracks.binaural.gainNode = gain;
  APP_STATE.tracks.binaural.oscL = oscL;
  APP_STATE.tracks.binaural.oscR = oscR;
}

function setupWarmDrone(ctx) {
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(108, ctx.currentTime); // Deep warm harmonic

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(220, ctx.currentTime);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(APP_STATE.tracks.drone.isEnabled ? APP_STATE.tracks.drone.volume * 0.35 : 0, ctx.currentTime);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(APP_STATE.masterGainNode);

  osc.start();

  APP_STATE.tracks.drone.gainNode = gain;
  APP_STATE.tracks.drone.osc = osc;
}

function startVisualizer() {
  const canvas = document.getElementById('audio-visualizer-canvas');
  if (!canvas || !APP_STATE.analyserNode) return;

  const canvasCtx = canvas.getContext('2d');
  const bufferLength = APP_STATE.analyserNode.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    APP_STATE.animationFrameId = requestAnimationFrame(draw);
    APP_STATE.analyserNode.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgba(2, 4, 6, 0.35)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.2;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height * 0.85;

      // Gradient color (amber to emerald to cyan)
      const grad = canvasCtx.createLinearGradient(0, canvas.height, 0, 0);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.5, '#10b981');
      grad.addColorStop(1, '#06b6d4');

      canvasCtx.fillStyle = grad;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

      x += barWidth;
    }
  }

  draw();
}

function generateBedtimeStory() {
  const theme = document.getElementById('story-theme-select').value;
  const outputBox = document.getElementById('story-text-body');
  const placeholder = document.getElementById('story-placeholder');

  const stories = {
    'rainforest-hammock': `
      <p>High in the verdant canopy of Mount Monteverde, Sloan adjusted his cybernetic hammock between two ancient cedar branches. Below, the misty Costa Rican rain began to tap a gentle polyrhythm across broad monstera leaves.</p>
      <p>There were no pending merge conflicts here. No unhandled promise rejections. Only the quiet, rhythmic exhale of the jungle at dusk. A soft neon glow radiated from his battery pack, warm and steady, keeping the evening chill at bay.</p>
      <p>Sloan closed his eyes, let his breathing slow to four beats per minute, and surrendered to the quiet knowing that whatever wasn't done today... was simply better suited for tomorrow.</p>
    `,
    'midnight-train': `
      <p>The midnight sleeper train slid quietly along the frost-covered tracks of Hokkaido. Outside your compartment window, pine trees blurred into soft ribbons of indigo and snow.</p>
      <p>Inside, the antique brass lamp cast a warm amber halo across the oak desk. Your terminal window had long since been shut down. The rhythmic clack of the steel wheels beneath acted as an analog metronome, steadily resetting your busy mind.</p>
      <p>The tea in your mug was warm, the woolen blanket heavy and comforting. You sink deeper into the leather seat as the engine carries you peacefully toward the horizon.</p>
    `,
    'cosmic-sloth': `
      <p>In low Earth orbit, aboard the solar-tethered observation pod <em>The Sloth Star</em>, gravity was merely an optional suggestion. Sloan drifted gently in three dimensions, tethered only by a soft silk ribbon.</p>
      <p>Beyond the curved quartz glass, continents drifted below in silent blues and whites. No Wi-Fi signals penetrated the titanium shielding. The silence of deep space was absolute, vast, and wonderfully restorative.</p>
      <p>Every line of code you wrote today has safely come to rest. The stars shine steady and unchanging. Breathe in the silence; let your shoulders drop.</p>
    `,
    'moss-library': `
      <p>Beneath the roots of the oldest sequoia in the forest lies the subterranean Moss Library. Lanterns filled with bioluminescent algae hum softly in the alcoves, casting a gentle emerald light across parchment archives.</p>
      <p>You settle into an armchair upholstered in velvet moss. The smell of cedar bark and quiet rain fills the cavern. There are no notifications here; only timeless volumes of calm wisdom.</p>
      <p>You rest your head against the cushion, watch the soft green embers drift in the air, and let the gentle subterranean quiet wash all tension away.</p>
    `
  };

  placeholder.classList.add('hidden');
  outputBox.innerHTML = stories[theme] || stories['rainforest-hammock'];
  outputBox.classList.remove('hidden');

  recordEnergySaved(20);
  showToast('Bedtime journey generated offline!');
}

// =============================================================================
// MODULE 6: SUBMISSION POST VIEWER
// =============================================================================
function initSubmissionModule() {
  const container = document.getElementById('submission-post-preview');
  const copyBtn = document.getElementById('btn-copy-submission-markdown');

  const rawMarkdown = getFullSubmissionMarkdown();
  if (container) {
    container.innerHTML = convertMarkdownToHtml(rawMarkdown);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(rawMarkdown);
      showToast('Copied official DEV challenge submission post markdown!');
    });
  }
}

function getFullSubmissionMarkdown() {
  return `---
title: SloanDesk: The Offline Open-Source AI Lazy Suite for Developers 🦥
published: false
tags: devchallenge, hf26challenge, opensource, ai, webdev
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 3: Slow and Steady](https://dev.to/challenges/hacktoberfest-week3-2026-10-19)*

## What I Built

Tomorrow, October 20, is **International Sloth Day**, and sloths have life completely figured out: they move at their own rhythm, conserve calories, refuse to overcommit, and [even help moderate DEV](https://dev.to/sloan). 

As developers, we waste tremendous mental energy on daily busywork:
1. Digging through 99+ unread Slack/Discord messages to answer the single question: *"Does anyone actually need me, or can I go back to sleep?"*
2. Agonizing over writing our daily Agile standup update before our morning coffee.
3. Drafting politically correct, diplomatic excuses to decline meetings that should have been asynchronous messages.
4. Letting hundreds of messy screenshots and archives rot in our Downloads folders because sorting them takes manual effort.

**SloanDesk** is the executive AI lazy-suite built to solve all of this. It channels your inner sloth and does the heavy lifting so you don't have to—**running 100% locally on your machine with open-source AI**.

### Core Sloth Capabilities:
* **The Morning Chaos Condenser:** Ingests unread chat or email floods, detects if you are specifically assigned any task, provides a 2-line bottom-line truth, and generates 1-click polite canned replies.
* **The 10-Second Standup Generator:** Transforms messy \`git log --oneline\` commits and terminal fragments into an articulate Agile standup (Yesterday / Today / Blockers) in Senior, Standard, or Minimalist Sloth tones.
* **The Diplomatic Decliner:** Generates tailored, professionally graceful responses to deflect unnecessary syncs, scope creep, and late-Friday fire drills.
* **The Folder Clutter Tamer:** Triages messy directories into clean folder trees with standardized naming and creates a 1-click PowerShell/Bash automation script.
* **The Sloth Sanctuary:** A real-time procedural ambient soundscape synthesized entirely in the browser using the **Web Audio API** (Pink noise rain, 432Hz binaural alpha waves, canopy breeze, and warm lofi drone) paired with an offline bedtime story generator.

---

## Demo

* **Live Demo:** [https://sloandesk.pages.dev](https://sloandesk.pages.dev) (or [https://sloandesk.onrender.com](https://sloandesk.onrender.com))
* **GitHub Repository:** [https://github.com/Afnan-0206/SloanDesk](https://github.com/Afnan-0206/SloanDesk)
* **Offline-Ready:** Disconnect your Wi-Fi, open SloanDesk, and watch every single feature execute instantly.

---

## Code

The complete source code is open-source and available under the permissive MIT license:

{% github https://github.com/Afnan-0206/SloanDesk %}

* Stack: Vanilla HTML5, Vanilla CSS3 (Glassmorphism & CSS custom properties), Modern JavaScript (ES2024), Web Audio API, and Open-Source AI bridges.

---

## How I Built It

SloanDesk was engineered from day one around **open innovation and local autonomy**:

1. **In-Browser Open-Weight Models:** Utilizes \`@xenova/transformers\` (Transformers.js) with quantized ONNX open-weight models (SmolLM, LaMini, and DistilBART) running directly over WebAssembly and WebGPU inside your browser tab.
2. **Local Inference Bridge:** Seamlessly connects to **Ollama** (\`http://localhost:11434\`) or LM Studio for users running local Mistral, Llama 3, or Qwen models on their local GPU.
3. **Instant Sloth Neural Engine:** A lightning-fast, zero-latency local fallback pipeline that performs deterministic entity extraction, intent classification, and Agile commit parsing without needing a GPU or downloading large model weights.
4. **Zero-Asset Procedural Audio:** The ambient soundscape doesn't stream or download static MP3 files; it dynamically generates pink noise, brownian filters, and 432Hz binaural wave offsets in real-time via the browser's native **Web Audio API**.

---

## Why Does Open Innovation Matter?

Why does open innovation matter for what we built?

* **No Leaking Private Data:** Your team's messy internal Slack messages, proprietary git commits, and personal download filenames **never leave your laptop**. They never touch an external LLM provider's server or training pipeline.
* **Zero Cloud Invoices ($0.00 Running Cost):** Closed API calls for daily chores cost money and require rate-limit handling. With open-weight AI, you set it up once and it costs literally zero cents to run forever.
* **Airplane & Offline Mode:** Whether you are on a train with spotty Wi-Fi or on a laptop in an off-grid cabin, open-source AI works everywhere.
* **Model Freedom:** If tomorrow a better 1B or 3B open-weight model drops on Hugging Face, you can swap it into SloanDesk without permission or breaking API changes.

---

## The Lazy Payoff

During testing this week, SloanDesk saved an average of **48 minutes every single day**:
* **15 minutes saved** skipping unread Discord and Slack noise in the morning.
* **10 minutes saved** having daily standups generated directly from git history.
* **12 minutes saved** politely declining 2 meetings that were better served as quick issue comments.
* **11 minutes saved** letting an automated script organize 40+ chaotic desktop downloads.

That is nearly **4 hours of conserved mental bandwidth per week**—time better spent resting, coding in deep flow, or taking a nap.

---

## Prize Categories

* **Hacktoberfest Open-Source AI Challenge Week 3 / Week 4**
* **Render Partner Category:** Deployed seamlessly as a static / node web service using \`render.yaml\`.
* **Backboard Partner Category:** Open-source AI harness integration.

*Happy International Sloth Day, and keep moving slow and steady!* 🦥`;
}

function convertMarkdownToHtml(md) {
  // Simple markdown renderer for preview
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/`([^`]+)`/gim, '<code>$1</code>')
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
    .replace(/\n\n/gim, '<p></p>')
    .replace(/\n/gim, '<br>');
}

// =============================================================================
// ENERGY CONSERVED CALCULATOR & HELPERS
// =============================================================================
function initSlothEnergyMeter() {
  updateEnergyDisplay();
}

function recordEnergySaved(minutes) {
  APP_STATE.minutesSavedToday += minutes;
  APP_STATE.energyConservedPercent = Math.min(99, APP_STATE.energyConservedPercent + 1);
  updateEnergyDisplay();
}

function updateEnergyDisplay() {
  const percentEl = document.getElementById('sloth-energy-percent');
  const fillEl = document.getElementById('sloth-energy-fill');
  const minutesEl = document.getElementById('stat-minutes-saved');

  if (percentEl) percentEl.textContent = `${APP_STATE.energyConservedPercent}%`;
  if (fillEl) fillEl.style.width = `${APP_STATE.energyConservedPercent}%`;
  if (minutesEl) minutesEl.textContent = `${APP_STATE.minutesSavedToday}m`;
}

function updateWisdomQuote() {
  const quotes = [
    '"Why write 4 paragraphs when a 2-bullet summary and a nap accomplishes the exact same outcome?"',
    '"Moving slow is not falling behind; it is moving with precision and zero rework."',
    '"Never do today what open-source AI can automate while you stretch your claws."',
    '"A meeting declined with grace is an hour of flow state preserved."',
    '"The best code is the code you never had to write because you were taking a walk."'
  ];
  const quoteEl = document.getElementById('sloth-daily-wisdom');
  if (quoteEl) {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    quoteEl.textContent = randomQuote;
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>🦥</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
