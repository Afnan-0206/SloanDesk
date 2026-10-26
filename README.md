# 🦥 SloanDesk — The Offline Open-Source AI Lazy Suite for Developers

> *"Never do today what open-source AI can do while you nap."*

A local-first, air-gapped productivity cockpit celebrating **International Sloth Day** and built for the **Hacktoberfest Open-Source AI Challenge: Week 3 & 4 (Slow and Steady)** on [DEV Community](https://dev.to/challenges/hf26).

![SloanDesk Hero](assets/sloan_mascot.jpg)

---

## 💡 What is SloanDesk?

Sloths move at their own rhythm, conserve energy, avoid unnecessary drama, and [even help moderate DEV](https://dev.to/sloan). 

As software developers, we expend tremendous cognitive fuel on daily logistical chores:
1. Sifting through 99+ unread Slack/Discord messages just to answer: *"Do I actually need to do anything, or can I stay asleep?"*
2. Writing daily standups before our morning coffee kicks in.
3. Drafting politically correct emails to decline 45-minute meetings that should have been 2-line async messages.
4. Letting cluttered downloads and screenshots pile up on our Desktop because sorting them takes manual effort.

**SloanDesk** channels your inner sloth and automates all of this—running **100% locally on your machine with open-source AI**.

---

## 🚀 Key Features

| Module | What It Does | Energy & Time Saved |
|---|---|---|
| **💬 The Morning Chaos Condenser** | Ingests unread chat & email floods, detects if you are directly tasked, extracts a 2-line bottom line, and drafts 1-click diplomatic replies. | ~15 min / day |
| **🚀 The 10-Second Standup Generator** | Parses raw `git log --oneline` commits and fragments into an impressive Agile standup (Yesterday / Today / Blockers) in Senior or Sloth persona. | ~10 min / day |
| **🛡️ The Diplomatic Decliner** | Deflects pointless syncs, scope creep, and late-Friday fires with 3 tailored diplomatic deflection variations. | ~12 min / day |
| **🗂️ The Folder Clutter Tamer** | Categorizes and cleans messy directories into structured folders with automated PowerShell & Bash script generation. | ~11 min / day |
| **🌿 The Sloth Sanctuary** | Real-time procedural ambient soundscape synthesized via the **Web Audio API** (Rainforest pink noise, 432Hz alpha binaural waves, canopy breeze, lofi drone) + offline bedtime story generator. | Pure Zen |

---

## 🏗️ System Architecture

```mermaid
graph TD
    A["User Input / Raw Clutter"] --> B["SloanDesk UI (Vanilla HTML5 & CSS3 Glassmorphism)"]
    
    subgraph "Local-First Open AI Execution Layer"
        B --> C{"AI Core Engine Selector"}
        C -->|In-Browser WebGPU/WASM| D["Transformers.js (Quantized ONNX Open-Weights)"]
        C -->|Local Daemon (localhost:11434)| E["Ollama Bridge (Llama 3 / Mistral / Qwen)"]
        C -->|Instant Sloth (Zero Latency)| F["Local NLP Intent & Pattern Synthesizer"]
    end

    subgraph "Client-Side Zero-Asset Synthesis"
        B --> G["Web Audio API Engine"]
        G --> H["Pink Noise Filter (Rain)"]
        G --> I["Brownian Oscillator (Canopy Breeze)"]
        G --> J["432Hz Detuned Sine Pair (Alpha Waves)"]
        G --> K["Warm Harmonic Drone (Lofi Sub-Sine)"]
    end

    D --> L["Structured Sloth Output"]
    E --> L
    F --> L

    L --> M["1-Click Clipboard Export & Automation Scripts"]
```

---

## 🛡️ Why Open Innovation Matters

1. **Air-Gapped & Offline:** Whether on an airplane, in a train tunnel, or off-grid in a cabin, SloanDesk requires **zero internet connection**. Everything runs on your laptop hardware.
2. **Absolute Privacy:** Internal company chat dumps, unreleased git commits, and personal financial filenames **never touch a third-party server**. Zero telemetry, zero tracking.
3. **Zero Running Cost ($0.00):** Closed proprietary APIs charge per token and cut you off when credit expires. Open-weight AI costs nothing to run forever.
4. **Model Freedom:** Easily connect any local open-weight model through Ollama (`llama3.2`, `mistral`, `smollm`, `phi3`) or in-browser WASM without vendor lock-in.

---

## 🏃 Quick Start (Run Locally in 10 Seconds)

SloanDesk is built with zero cumbersome build steps. You don't even need to install heavy npm dependencies!

### Option A: Direct Browser Preview
Simply double-click `index.html` in your file explorer, or run with any lightweight server:

```bash
# Using Python (built into Windows/Mac/Linux)
python -m http.server 3000

# Or using Node
npx serve .
```

Open `http://localhost:3000` in any modern web browser.

### Option B: Optional Local Ollama Acceleration
If you have [Ollama](https://ollama.com/) installed and want local LLM acceleration:

```bash
ollama run llama3.2
```

SloanDesk will automatically discover and connect to your local Ollama daemon at `http://localhost:11434`.

---

## ⚡ Deploy to Cloudflare Pages (Instant Edge Hosting)

SloanDesk is 100% pre-configured for Cloudflare Pages with `_headers`, `_redirects`, and `wrangler.toml`:

### Via Cloudflare Dashboard (Continuous Deployment):
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) ➔ **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
2. Select repository: `https://github.com/Afnan-0206/SloanDesk`.
3. Set build configuration:
   - **Framework preset:** `None`
   - **Build command:** (leave empty)
   - **Build output directory:** `.`
4. Click **Save and Deploy**. Your site will be live at `https://sloandesk.pages.dev` with global Cloudflare edge caching!

### Via Wrangler CLI:
```bash
npm run deploy:cf
```

---

## ☁️ Deploy to Render

SloanDesk also includes a turnkey `render.yaml` specification for Render:

1. Push your repository to GitHub: `https://github.com/Afnan-0206/SloanDesk`.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> **Blueprints**.
3. Connect your repository. Render will automatically detect `render.yaml` and deploy!

---

## 📄 License

MIT License — Copyright (c) 2026 SloanDesk Team. Feel free to use, modify, and sleep in peace! 🦥
