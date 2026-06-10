<div align="center">

# 🪐 NEXUS

### Autonomous AI Agent Framework — CLI · Telegram Bot

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Runtime-Bun-fbf0df?style=flat-square&logo=bun&logoColor=black)](https://bun.sh/)
[![OpenRouter](https://img.shields.io/badge/LLM-OpenRouter-6c47ff?style=flat-square)](https://openrouter.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

> A multi-interface AI agent you can run from your terminal or control remotely via Telegram — with deterministic guardrails so it never does something you didn't approve.

[Features](#-features) · [Modes](#-modes) · [Quick Start](#-quick-start) · [Architecture](#-architecture) · [Roadmap](#-roadmap)

</div>

---

## ✨ Features

- **2 Runtime Modes** — Interactive CLI and Telegram Bot
- **Multi-Model Support** via OpenRouter — swap between GPT-4o, Claude, Gemini, and more from one config
- **Human-in-the-Loop Approvals** — high-risk actions (file writes, deletes) are quarantined until you explicitly confirm
- **Virtual File System (VFS)** — sandboxed filesystem layer; the agent physically cannot escape your workspace
- **Immutable Audit Trail** — every tool call, web search, and file mutation is logged and locked
- **Web Intelligence** — Firecrawl-powered web crawling + search built in as native agent tools
- **Beautiful CLI UI** — interactive prompts via Clack, colored output with Chalk, ASCII banners with Figlet

---

## 🚀 Modes

### 1. 🖥️ CLI Mode
Run NEXUS directly in your terminal. Three sub-modes:

| Mode | Description |
|------|-------------|
| `agent` | Full tool execution — web search, file ops, code generation |
| `plan` | Breaks your goal into a checkbox-driven task matrix, then executes step by step |
| `ask` | Read-only querying — no side effects, no file writes |

### 2. 📱 Telegram Bot Mode
Control your agent remotely from your phone. Built on `telegraf` with long-polling — send tasks, get results, and approve actions straight from Telegram.

---

## ⚡ Quick Start

### Prerequisites
- [Bun](https://bun.sh/) v1.0+
- An [OpenRouter](https://openrouter.ai/) API key
- (Optional) Telegram Bot token — for Telegram mode
- (Optional) [Firecrawl](https://firecrawl.dev/) API key — for web crawling

### Installation

```bash
git clone https://github.com/harsh1507sharma/NEXUS-.git
cd NEXUS-
bun install
```

### Configuration

Create a `.env` file in the root:

```env
OPENROUTER_API_KEY=your_openrouter_key_here
TELEGRAM_BOT_TOKEN=your_telegram_token_here   # optional, needed for Telegram mode
FIRECRAWL_API_KEY=your_firecrawl_key_here     # optional, needed for web crawl tool
```

### Run

```bash
bun index.ts Start


---

## 🏗️ Architecture

```
NEXUS-/
├── index.ts                    # Entry point & mode router
├── ai/                         # LLM client & tool definitions
├── modes/
│   ├── cli.ts                  # Terminal state machine & orchestrator
│   └── telegram.ts             # Telegraf long-polling bot gateway
├── TUI/                        # Clack / Chalk / Figlet UI components
└── agents/
    ├── action-tracker.ts       # Immutable audit trail ledger
    ├── tool_executor.ts        # Sandboxed tool execution engine
    ├── approvalflow.ts         # Human-in-the-loop approval gate
    └── types.ts                # Core TypeScript types & configs
```

### Key Design Decisions

**Virtual File System (VFS)** — All disk operations are routed through `resolveSafe` patterns. The agent is physically incapable of directory traversal or out-of-bounds file access.

**Immutable ActionTracker** — Once an action moves past `pending` state, it's structurally locked. No dynamic tampering, zero opacity in multi-step reasoning chains.

**Approval Pipeline** — Destructive operations trigger a pre-execution gate. The agent prepares the payload, shows you exactly what it's about to do, and waits for your confirmation before committing.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun |
| Language | TypeScript |
| LLM Gateway | OpenRouter API |
| Telegram | Telegraf |
| Web Intelligence | Firecrawl |
| CLI UI | Clack + Chalk + Figlet |

---

## 🗺️ Roadmap

- [ ] MCP Server Mode — expose NEXUS tools natively inside Claude Desktop
- [ ] Memory persistence across sessions (vector store integration)
- [ ] Multi-agent coordination (Supervisor + Sub-agent pattern)
- [ ] Web UI dashboard for audit trail visualization
- [ ] Plugin system for custom tool injection

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m 'feat: add your feature'`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 👨‍💻 Author

**Harsh Sharma** — 3rd Year B.Tech Chemical Engineering @ MNNIT Allahabad

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/your-profile)
[![GitHub](https://img.shields.io/badge/GitHub-@harsh1507sharma-181717?style=flat-square&logo=github)](https://github.com/harsh1507sharma)

---

<div align="center">

If NEXUS helped you or you find it interesting, drop a ⭐ — it genuinely helps!

</div>
