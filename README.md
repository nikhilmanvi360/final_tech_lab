<div align="center">

<img src="https://img.shields.io/badge/Tech%20Detective-The%20Digital%20Crime%20Lab-d4a017?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZDRhMDE3IiBzdHJva2Utd2lkdGg9IjIiPjxjaXJjbGUgY3g9IjExIiBjeT0iMTEiIHI9IjgiLz48cGF0aCBkPSJNMjEgMjFsLTQuMzUtNC4zNSIvPjwvc3ZnPg==&labelColor=140e06" alt="Tech Detective Banner"/>

# 🔍 Tech Detective: The Digital Crime Lab

### *A web-based cybersecurity investigation game for competitive events*

[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat-square&logo=socket.io)](https://socket.io)
[![License](https://img.shields.io/badge/License-Private-red?style=flat-square)](.)

<br/>

> *"He submitted a clean report. He was doing two jobs."*
> 
> **— AUDIT AI**

</div>

---

## 📖 Overview

**Tech Detective: The Digital Crime Lab** is a fully-featured, multiplayer cybersecurity investigation game designed for college events, hackathons, and cybersecurity training workshops. Teams race against each other to solve a multi-round digital crime scenario using real forensic analysis techniques — log analysis, code debugging, evidence synthesis, and logical deduction.

The current storyline — **"Operation: The Rehearsal"** — places teams inside Meridian Bank, where they must investigate a consultant named Karan Sehgal who ran 4,247 simulations under the guise of a penetration test, but was actually planning a ₹4.2 crore bank robbery.

The platform runs as a unified full-stack application: a Vite + React SPA served by an Express server, with real-time competition via Socket.IO, durable state in Supabase, and an AI game companion powered by Google Gemini.

---

## ✨ Features at a Glance

| Feature | Description |
|---|---|
| 🎭 **Multi-Round Narrative** | Three structured investigation phases with cinematic transitions |
| 🤖 **AUDIT AI Companion** | Gemini-powered AI that gives contextual, narrative-aware hints |
| ⚡ **Real-time Scoreboard** | Live leaderboard updates via WebSockets on every solve |
| 🗺️ **Interactive Campaign Map** | Tiled exploration map with NPCs, terminals, and item inventory |
| 🔬 **Evidence Synthesis** | Combine clues across evidence types to unlock new leads |
| 🕹️ **In-browser Code Sandbox** | Monaco editor with Python/JS execution via Pyodide or BullMQ workers |
| 👁️ **Adversary AI Engine** | Dynamic NPC that helps struggling teams and challenges the leader |
| 🛒 **Black Market Shop** | Spend XP on tactical items (Intel Drafts, EMP Jammers, Data Shields) |
| 🛡️ **Role-Based Access** | Separate `detective`, `analyst`, and `admin` roles with different evidence views |
| 📊 **Admin Dashboard** | Full event control: team management, scoring, adversary triggers, analytics |
| 🐳 **Docker Ready** | One-command deployment with Docker Compose (app + Redis) |
| 🔒 **Security First** | JWT auth, bcrypt passwords, rate limiting, HTTP-only cookies |

---

## 🎮 The Investigation: "Operation: The Rehearsal"

The game is structured as a three-round investigation. Each round unlocks after the previous one is completed by teams or opened by the admin.

```
ROUND 0 ──► ROUND 1 ──► ROUND 2 ──► ROUND 3
  │             │            │           │
Briefing     Archive      Campus      Verdict
(Coding)   (Log Analysis) (Map)     (Case Filing)
```

### Round 0 — The Briefing *(Coding Shell)*
Teams repair three corrupted AUDIT system files to gain access to the investigation:
- **Task 1 (HTML):** Rebuild a broken evidence table structure
- **Task 2 (CSS):** Override a CSS blur filter to reveal redacted simulation data
- **Task 3 (Python):** Fix a status string to confirm the batch archive count

### Round 1 — The Archive *(Log Analysis)*
A split-pane document viewer presents Karan Sehgal's official 47-page penetration test report alongside AUDIT's raw simulation archive. Teams must cross-reference the two documents to identify the discrepancy: 94% of 4,247 simulation runs targeted guard rotations, vault timing, and camera blind spots — not security vulnerabilities. Teams use Evidence Codes (e.g., `EV-01`) to query the database and extract timestamped logs.

### Round 2 — The Campus *(Interactive Map)*
Teams explore a tiled map of the Meridian Bank building across four zones:
- **Bank Lobby** — Security guard NPC, badge entry logs
- **Compliance Archive** — AUDIT backup terminal, junior analyst NPC
- **Server Room** — Simulation node terminals (Python/CSS debugging puzzles)
- **AUDIT Core** — Final firewall, Director NPC, hidden file `batch_087/run_31`

Teams collect items, talk to NPCs, solve terminal puzzles, and synthesize evidence to unlock the AUDIT Core and confirm the `LIVE_RUN_PARAMS` file.

### Round 3 — The Verdict *(Case Filing)*
Three-phase final round:
- **Phase A:** Drag-and-drop evidence chain — arrange 5 of 12 cards in the exact order proving intent
- **Phase B:** Radio-choice case dossier — identify the suspect, their motive, and required urgency
- **Phase C:** Enter the AUDIT Override Code to transmit the evidence package to law enforcement

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ React 19 │  │ Tailwind │  │ Motion   │  │ Socket.IO      │  │
│  │ + Router │  │  CSS v4  │  │ (Anim.)  │  │ Client         │  │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / WebSocket
┌──────────────────────────▼──────────────────────────────────────┐
│                     Express Server (server.ts)                  │
│                                                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │ REST API      │  │ Socket.IO     │  │ Vite Dev Proxy    │   │
│  │ (Auth, Cases, │  │ (Live events, │  │ (Dev mode only)   │   │
│  │  Puzzles,     │  │  Scoreboard,  │  └───────────────────┘   │
│  │  Submissions) │  │  Adversary)   │                           │
│  └───────────────┘  └───────────────┘                           │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Engine Layer                          │ │
│  │  caseEngine │ eventStore │ adversary │ shopEngine │ ...    │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────┬───────────────────────────────────────┬──────────────┘
           │                                       │
┌──────────▼──────────┐               ┌────────────▼────────────┐
│  Supabase           │               │  Redis (Optional)       │
│  (PostgreSQL)       │               │  BullMQ Job Queue       │
│                     │               │  for code execution     │
│  • teams            │               └─────────────────────────┘
│  • cases / evidence │
│  • puzzles          │               ┌─────────────────────────┐
│  • submissions      │               │  Google Gemini AI       │
│  • score_events     │               │  (AUDIT AI Companion)   │
│  • adversary_*      │               └─────────────────────────┘
│  • shop purchases   │
└─────────────────────┘
```

---

## 🧩 Component Map

### Frontend (`src/`)

| Path | Purpose |
|---|---|
| `src/pages/LandingPage.tsx` | Public home page with event branding |
| `src/pages/Login.tsx` | Team login / auto-registration |
| `src/pages/CampaignMap.tsx` | Round 2 interactive tile map |
| `src/pages/CaseDetail.tsx` | Case investigation view with evidence + puzzles |
| `src/pages/EvidenceViewer.tsx` | Evidence viewer (chat, HTML, logs, code, email) |
| `src/pages/InvestigationBoard.tsx` | Evidence synthesis and relationship graph |
| `src/pages/BlackMarket.tsx` | In-game item shop (spend XP) |
| `src/pages/Profile.tsx` | Team profile, score history, badges |
| `src/pages/MissionWorkstation.tsx` | Mission coding workstation |
| `src/pages/ScanPage.tsx` | Evidence code scanner (Round 1) |
| `src/pages/round0/` | Round 0 — AUDIT Briefing coding tasks |
| `src/pages/round1/` | Round 1 — Archive / log analysis viewer |
| `src/pages/round3/` | Round 3 — Verdict / case filing |
| `src/pages/admin/` | Full admin dashboard suite |
| `src/components/DetectiveHUD.tsx` | Heads-up display with score, round, alerts |
| `src/components/GameAdvisor.tsx` | AUDIT AI assistant chat panel |
| `src/components/LiveTicker.tsx` | Real-time event ticker (solves, badges, alerts) |
| `src/components/Layout.tsx` | Global layout shell |

### Backend Engine (`src/engine/`)

| File | Purpose |
|---|---|
| `caseEngine.ts` | Case state machine — locks, unlocks, mutations |
| `eventStore.ts` | Event-sourced scoring with multiplier support |
| `adversary.ts` | Adversary AI — engagement-driven NPC actions |
| `shopEngine.ts` | Black Market purchase processing |
| `campaignStore.ts` | Campaign map state persistence |
| `sandboxEngine.ts` | Code output validation engine |
| `gameStateManager.ts` | Global round state and Socket.IO sync |
| `caseLoader.ts` | JSON-based mission file loader |
| `round0Manager.ts` | Round 0 completion state |
| `round1Manager.ts` | Round 1 phase state |
| `round3Manager.ts` | Round 3 phase-A/B/C state + majority verdict |

### Database (`database/`)

| File | Purpose |
|---|---|
| `schema.sql` | Full PostgreSQL schema (tables, RPC functions, indexes) |
| `schema_round1.sql` | Additional schema for Round 1 evidence codes |
| `init.ts` | Database seeder — cases, puzzles, admin account |
| `round1_seed.ts` | Evidence code seed data for Round 1 |

---

## 🛠️ Technology Stack

### Frontend
| Technology | Version | Role |
|---|---|---|
| **React** | 19 | UI framework |
| **Vite** | 6 | Build tool + dev server |
| **TypeScript** | 5.8 | Type safety |
| **Tailwind CSS** | v4 | Utility-first styling |
| **Motion** | 12 | Animations and transitions |
| **React Router** | 7 | Client-side routing |
| **Recharts** | 3 | Admin analytics charts |
| **ReactFlow** | 11 | Evidence relationship graph |
| **Monaco Editor** | 4 | In-browser code editor |
| **Lucide React** | 0.546 | Icon system |
| **Pyodide** | 0.25 | In-browser Python execution |

### Backend
| Technology | Version | Role |
|---|---|---|
| **Express** | 4 | HTTP server + REST API |
| **Socket.IO** | 4 | Real-time WebSocket events |
| **JWT** | 9 | Authentication tokens |
| **bcryptjs** | 3 | Password hashing |
| **BullMQ** | 5 | Redis-backed job queue for code execution |
| **ioredis** | 5 | Redis client |
| **tsx** | 4 | TypeScript execution in development |

### Data & AI
| Technology | Role |
|---|---|
| **Supabase** (PostgreSQL) | Primary database — all persistent state |
| **Google Gemini AI** | AUDIT AI companion (contextual hints) |
| **Puter.js** | Fallback AI provider |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v22.x ([download](https://nodejs.org/))
- **npm** v10+
- A **[Supabase](https://supabase.com/)** project (free tier works)
- A **[Google Gemini API Key](https://aistudio.google.com/)** (optional, for AI advisor)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/tech-detective-the-digital-crime-lab.git
cd tech-detective-the-digital-crime-lab
```

### 2. Install Dependencies

```bash
npm install
```

> **Note:** The `postinstall` script automatically copies Pyodide runtime files to `public/pyodide/` for in-browser Python execution.

### 3. Configure Environment Variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# ── Required ──────────────────────────────────────────────────────
# Supabase (get from: Project Settings > API)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Secret — generate with: openssl rand -base64 32
JWT_SECRET=your-strong-random-secret

# ── Optional ──────────────────────────────────────────────────────
# Google Gemini AI (for the AUDIT AI companion)
GEMINI_API_KEY=your-gemini-api-key

# Redis (for BullMQ code execution workers — falls back to sync without it)
REDIS_URL=redis://localhost:6379

# App URL (set in production)
APP_URL=http://localhost:3000

# Allow teams to self-register (set to 'true' for open events)
ALLOW_REGISTRATION=true
```

### 4. Initialize the Database

Run the schema SQL in your Supabase project (Project > SQL Editor), then seed the initial data:

```bash
npm run db:seed
```

This creates:
- All game tables and RPC functions
- Initial cases, evidence, and puzzles
- The default admin account (`CCU_ADMIN` / `admin123`)

### 5. Start the Development Server

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## 🏛️ Admin Dashboard

Log in with the admin credentials to access the full event control panel:

| Field | Value |
|---|---|
| **Team Name** | `CCU_ADMIN` |
| **Password** | `admin123` |

> ⚠️ **Change this password before any public-facing event!**

### Admin Capabilities

- **Overview** — Live scoreboard, score distribution charts, recent events
- **Teams** — Create, disable, reset, or adjust scores for any team
- **Round Control** — Advance the game through rounds, trigger phase transitions
- **Round 3 Director** — Configure the AUDIT opening monologue, suspect answer, red herring
- **Adversary Control** — Set intensity, enable/disable actions, manually trigger events
- **Builder** — Create and edit cases, evidence, and puzzles
- **Submissions** — Review all team submissions with correct/incorrect status
- **System** — Score multipliers, event log, database health

---

## 📦 Production Deployment

### Option 1: Render.com (Recommended for simplicity)

The repository includes a `render.yaml` for one-click deployment:

1. Connect your GitHub repo to [Render](https://render.com)
2. Render will detect `render.yaml` automatically
3. Set the required environment variables in the Render dashboard:
   - `JWT_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy — build runs `npm install && npm run build`, start runs `npm start`

### Option 2: Docker Compose (Self-hosted)

Includes both the app and a Redis instance:

```bash
# Set your environment variables first
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
export JWT_SECRET=...

# Build and launch
docker compose up --build -d
```

The app will be available at **http://localhost:3000**.

### Option 3: Manual VPS / Cloud Run

```bash
# 1. Build
npm install --include=dev
npm run build

# 2. Set environment variables on your host

# 3. Start
npm start
```

The build process:
1. **Vite** compiles the React SPA to `dist/client/`
2. **esbuild** bundles `server.ts` to `dist/server/server.js`
3. The Express server serves the static frontend and handles all API routes

---

## 🎯 Scoring System

Tech Detective uses **event-sourced scoring** — every point change is recorded as an immutable event, making scores auditable and reversible.

### Score Events

| Event Type | Base Points | Notes |
|---|---|---|
| `puzzle_solve` | Varies per puzzle | Deducted if hints used |
| `case_solve` | Varies per case | Awards on correct submission |
| `first_blood` | 50 / 25 / 10 | 1st / 2nd / 3rd solver bonus |
| `hint_penalty` | −(puzzle points × 0.5) | Applied when hint is revealed |
| `r3_phase_a_fix` | 150 | Correct evidence chain |
| `r3_phase_b_submission` | Up to 250 | 50 + 75 + 125 per correct answer |
| `admin_adjust` | Manual | Admin score corrections |
| `adversary_action` | Variable | Adversary penalties (rare) |
| `shop_purchase` | −(item cost) | XP deducted on purchase |

### Score Multipliers
Admins can activate time-limited score multipliers (e.g., 2× XP for 10 minutes) via the Admin System panel. All events during the window earn multiplied points.

### First Blood Bonuses
The first three teams to solve any case receive automatic bonus XP:
- 🥇 1st solve: **+50 XP**
- 🥈 2nd solve: **+25 XP**
- 🥉 3rd solve: **+10 XP**

---

## 🤖 Adversary AI System

The Adversary is a server-side NPC that dynamically responds to the competition state after every score update. It is **engagement-focused, not punitive** — designed to keep the event exciting.

### Adversary Actions

| Action | Target | Effect |
|---|---|---|
| `signal_interference` | Leading team | Fun visual "glitch" animation (cosmetic) |
| `guidance_hint` | Struggling team | Helpful contextual hint delivered via Socket.IO |
| `evidence_encrypt` | Selected team | Locks an evidence item (can be unlocked via shop) |
| `puzzle_scramble` | Selected team | Temporarily scrambles puzzle display |

### Intensity Levels
- **Low** — 1 action per 3 minutes, gentle interference
- **Medium** — 2 actions per 3 minutes, moderate guidance  
- **High** — 3 actions per 3 minutes, direct hints and active interference

Admins can manually trigger any action against any team, or adjust intensity live during the event.

---

## 🛒 Black Market (In-game Shop)

Teams can spend earned XP on tactical items:

| Item | Cost | Effect |
|---|---|---|
| 🔍 **Intel_Draft** | 40 XP | Reveal a puzzle hint without score penalty |
| 🔓 **Evidence_Decrypter** | 80 XP | Bypass the lock on any evidence item |
| ⚡ **EMP_Jammer** | 150 XP | 10-second glitch animation on a rival's terminal |
| 🛡️ **Data_Shield** | 300 XP | Block the next Adversary or EMP attack |

All purchases are atomic — XP is deducted and the item is activated in a single Supabase RPC transaction.

---

## 🗄️ Database Schema

Key tables in the Supabase PostgreSQL database:

```
teams                  — Registered teams with scores and roles
cases                  — Investigation cases (title, difficulty, correct answer)
evidence               — Evidence items linked to cases (chat/log/html/code/email)
puzzles                — Puzzles within cases with hints and dependencies
submissions            — All case solve attempts (correct/incorrect)
solved_puzzles         — Track which puzzles each team has solved
used_hints             — Hint usage log for penalty tracking
score_events           — Immutable scoring event log (event sourcing)
score_multipliers      — Time-bounded score multiplier configurations
team_badges            — Earned badges (e.g., "Lone Wolf" — solved without hints)
case_team_state        — Per-team dynamic case state (lockouts, mutations)
adversary_config       — Adversary intensity and action configuration
adversary_actions      — Log of adversary actions and resolution status
purchases              — Shop purchase records
```

---

## 🧪 Event Management Workflow

### Before the Event

1. Deploy the application and seed the database
2. Create teams in the Admin dashboard (or enable `ALLOW_REGISTRATION=true`)
3. Test all three rounds end-to-end
4. Set the Admin Round 3 configuration (suspect, red herring, monologue text)
5. Configure Adversary intensity

### During the Event

1. Teams log in and begin Round 0
2. Monitor the Admin Overview for live score and submission data
3. Advance rounds manually when ready: Admin > Round Control
4. Use the Adversary panel to maintain engagement
5. Watch the Live Ticker for real-time events

### After the Event

```bash
# Reset all team progress while keeping the admin account
npx tsx scripts/reinitialize_system.ts
```

---

## 🔐 Security Notes

- All API routes except `/api/auth/login` and `/api/health` require a valid JWT
- JWTs are stored as **HTTP-only, SameSite=Strict cookies** — not accessible to JavaScript
- Login is rate-limited to **5 attempts per minute** per IP
- Puzzle/case submissions are rate-limited to **10 per minute** per team
- Admin role is verified server-side on every request via the `requireAdmin` middleware
- Token invalidation is supported — admins can revoke individual team sessions via `token_version`
- Bcrypt is used for password hashing (cost factor 10)

---

## 📁 Project Structure

```
tech-detective-the-digital-crime-lab/
├── 📄 server.ts                  # Main Express server (API + Socket.IO)
├── 📄 vite.config.ts             # Vite build config
├── 📄 tsconfig.json              # TypeScript config (frontend)
├── 📄 tsconfig.server.json       # TypeScript config (backend)
├── 📄 docker-compose.yml         # Docker deployment (app + Redis)
├── 📄 render.yaml                # Render.com deployment config
├── 📄 Dockerfile                 # Docker image definition
├── 📄 .env.example               # Environment variable template
│
├── 📁 src/
│   ├── 📄 main.tsx               # React entry point
│   ├── 📄 App.tsx                # Router and route definitions
│   ├── 📄 types.ts               # Shared TypeScript types
│   ├── 📁 pages/                 # Page-level React components
│   ├── 📁 components/            # Shared UI components
│   ├── 📁 engine/                # Server-side game logic modules
│   ├── 📁 lib/                   # Supabase client, queue config
│   ├── 📁 hooks/                 # Custom React hooks
│   ├── 📁 data/                  # Static campaign/map data
│   └── 📁 utils/                 # Utilities (fuzzy match, etc.)
│
├── 📁 database/
│   ├── 📄 schema.sql             # Full PostgreSQL schema
│   ├── 📄 schema_round1.sql      # Round 1 additional tables
│   ├── 📄 init.ts                # Database seeder
│   └── 📄 round1_seed.ts         # Round 1 evidence seed data
│
├── 📁 cases/
│   ├── 📄 mission-01.json        # JSON-based mission definition
│   ├── 📄 mission-02.json
│   └── 📄 mission-03.json
│
├── 📁 scripts/
│   ├── 📄 build-server.ts        # esbuild server bundler
│   └── 📄 reinitialize_system.ts # Event reset utility
│
└── 📁 public/
    └── 📁 pyodide/               # Pyodide runtime (auto-populated on install)
```

---

## 🤝 Contributing

This project was built for the **CCU Tech Detective** event. If you are building your own event instance:

1. Fork the repository
2. Update the storyline content in `AGENT_HANDOFF.md` and the relevant component files
3. Seed your own cases, evidence, and puzzles via `database/init.ts`
4. Deploy and customize the admin dashboard as needed

---

## 📜 License

Private repository — built for educational and event use by **Chandigarh College University**.

---

<div align="center">

**Built with ☕ and a healthy suspicion of everyone's alibi.**

*Tech Detective: The Digital Crime Lab — where every byte of data leaves a trace.*

</div>

