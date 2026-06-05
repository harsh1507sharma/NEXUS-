# 🪐 NEXUS: Autonomous AI Agent Suite with Deterministic Guardrails

NEXUS is an enterprise-grade, multi-interface AI Agent framework engineered to bridge the gap between autonomous Large Language Model (LLM) execution and strict local system security. Built on top of **Bun** and **TypeScript**, NEXUS enforces runtime observability, transactional isolation, and sandboxed safety via an advanced Virtual File System (VFS) and a real-time Audit Trail Ledger.

---

## 🚀 Core Architectural Pillars

### 1. The Secure Runtime & VFS Layer
Unlike unconstrained agents that modify systems blindly, NEXUS routes all disk operations through a restrictive **Virtual File System (VFS)** layer. System boundaries are enforced using `resolveSafe` patterns, guaranteeing the model can never perform out-of-bounds directory traversals or illegal filesystem injections.

### 2. Transactional Auditing (`ActionTracker`)
Every programmatic tool invocation, network call (`web_search`, `web_crawl`), or file mutation is trapped by a central, read-only ledger. 
* **State Immutability:** Once an action state transitions beyond `pending`, it is structurally locked down to prevent dynamic transaction tampering.
* **Telemetry Blackout Prevention:** Maintains complete terminal and background logs, ensuring zero opacity in multi-step agent reasoning cycles.

### 3. Human-in-the-Loop Approval Pipelines
High-risk structural mutations (such as file updates or structural disk deletions) are automatically quarantined. The system traps the payload using a pre-execution approval loop (`runapproval`), requiring explicit user confirmation before committing state to the physical workspace.

### 4. Omnichannel Deployment Engine
NEXUS natively supports asymmetric client runtime interaction through two primary runtime loops:
* **The Continuous CLI Suite:** Houses specialized operational loops — **Agent CLI** (full tool execution), **Plan CLI** (checkbox-driven dependency matrix planning), and **Ask CLI** (read-only secure querying).
* **The Telegram Bot Engine:** Implements an asynchronous, event-driven gateway utilizing `telegraf` long-polling runtimes, allowing remote system tracking and query execution straight from mobile interfaces.

---

## 📂 Codebase Architecture

```text
├── src/
│   ├── agents/
│   │   ├── action-tracker.ts   # Central transaction register (Audit Trail Ledger)
│   │   ├── tool_executor.ts    # Secure core execution engine & tool injection
│   │   ├── approvalflow.ts     # Pre-commit gatekeeper & safe state management
│   │   └── types.ts            # Core TypeScript abstractions & configurations
│   ├── ask/
│   │   └── orchestrator.ts     # Contextual read-only querying layer 
│   ├── modes/
│   │   ├── cli.ts              # Terminal state machine & main orchestrator 
│   │   └── telegram.ts         # Long-polling messaging bot gateway
│   ├── plan/
│   │   ├── generate.ts         # Zod structural validation (planSchema)
│   │   └── printplan.ts        # UI Select Matrix generation pipeline
│   └── index.ts                # Application bootstrapper and entry-point
