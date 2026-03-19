# 🔌 The Complete Playwright MCP Guide

A comprehensive, production-ready reference covering every MCP variant in the Playwright ecosystem — from quick setup to advanced configuration, CI/CD usage, and agent workflows.

---

## 📑 Table of Contents

1. [What is MCP?](#1-what-is-mcp)
2. [The Three Playwright MCP Variants](#2-the-three-playwright-mcp-variants)
3. [@playwright/mcp — The Official Microsoft MCP Server](#3-playwrightmcp--the-official-microsoft-mcp-server)
4. [playwright-test MCP — The Agent Loop Server](#4-playwright-test-mcp--the-agent-loop-server)
5. [@executeautomation/playwright-mcp-server — The Community Server](#5-executeautomationplaywright-mcp-server--the-community-server)
6. [Playwright CLI (SKILLS Mode)](#6-playwright-cli-skills-mode)
7. [Client Setup by Tool](#7-client-setup-by-tool)
8. [Transport Modes: stdio vs HTTP vs SSE](#8-transport-modes-stdio-vs-http-vs-sse)
9. [Browser Profiles & Session Management](#9-browser-profiles--session-management)
10. [Environment Variables & Configuration File](#10-environment-variables--configuration-file)
11. [Capabilities: Vision, PDF, DevTools](#11-capabilities-vision-pdf-devtools)
12. [Docker Setup](#12-docker-setup)
13. [Playwright Test Agents (Planner / Generator / Healer)](#13-playwright-test-agents-planner--generator--healer)
14. [Full Tool Reference](#14-full-tool-reference)
15. [Troubleshooting](#15-troubleshooting)
16. [Choosing the Right Tool](#16-choosing-the-right-tool)

---

## 1. What is MCP?

**Model Context Protocol (MCP)** is an open standard that lets AI agents communicate with external tools and services in a structured, consistent way. Think of it as a universal adapter: just as USB lets any device plug into any port, MCP lets any AI (Claude, Copilot, Cursor, etc.) plug into any supported tool.

In the Playwright context, an MCP server:

- Exposes browser automation actions as discrete **tools** (e.g., `browser_click`, `browser_navigate`)
- Accepts commands from an AI client via **JSON-RPC** messages
- Drives a real browser using Playwright under the hood
- Returns structured results — page snapshots, success/failure signals, screenshots — back to the AI

The AI never touches the browser directly. It reasons over the structured data and issues commands to the server.

```
┌─────────────┐        JSON-RPC        ┌──────────────────────┐      CDP     ┌─────────┐
│  AI Client  │ ─────────────────────► │  Playwright MCP/CLI  │ ───────────► │ Browser │
│  (Claude,   │ ◄───────────────────── │  Server              │ ◄─────────── │         │
│  Copilot…)  │   structured results   └──────────────────────┘              └─────────┘
└─────────────┘
```

### Why use accessibility snapshots instead of screenshots?

By default, `@playwright/mcp` reads the browser's **accessibility tree** rather than pixels. This gives the AI:

- **Speed** — no computer vision processing required
- **Determinism** — element references are stable symbolic IDs, not coordinates
- **Efficiency** — far fewer tokens than describing raw pixel data
- **Vision-model independence** — any LLM can drive the browser, not just multimodal ones

---

## 2. The Three Playwright MCP Variants

| Package | Maintainer | Best For | Transport |
|---|---|---|---|
| `@playwright/mcp` | Microsoft (official) | General-purpose browser automation, AI agent workflows | stdio / HTTP |
| `npx playwright run-test-mcp-server` | Microsoft (built-in) | Playwright Test Agent loop (Planner/Generator/Healer) | stdio |
| `@executeautomation/playwright-mcp-server` | ExecuteAutomation (community) | API testing + browser, Claude Desktop, Cline | stdio / HTTP |
| `playwright-cli` (SKILLS) | Microsoft (official) | Coding agents with filesystem access, token efficiency | CLI (shell) |

---

## 3. @playwright/mcp — The Official Microsoft MCP Server

**Package:** [`@playwright/mcp`](https://npmjs.com/package/@playwright/mcp)
**Repo:** [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)
**Docker:** `mcr.microsoft.com/playwright/mcp`
**License:** Apache 2.0

### 3.1 Quick Install

```bash
# Run directly (no global install needed)
npx @playwright/mcp@latest

# Or install globally
npm install -g @playwright/mcp
```

### 3.2 Minimal mcp.json (stdio)

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

### 3.3 HTTP Transport (headed browser on headless server)

When running a headed browser on a machine without a display (e.g., CI worker processes), start the server separately with `--port` to enable HTTP transport:

```bash
# Terminal 1 — start the server
DISPLAY=:1 npx @playwright/mcp@latest --port 8931
```

Then point your client at it:

```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:8931/mcp"
    }
  }
}
```

### 3.4 CLI Arguments Reference

All arguments can be passed in the `"args"` array of your `mcp.json`:

```bash
npx @playwright/mcp@latest --help
```

| Argument | Description |
|---|---|
| `--browser <browser>` | Browser to use: `chrome`, `firefox`, `webkit`, `msedge`. Default: `chromium` |
| `--headless` | Run in headless mode (headed by default) |
| `--port <port>` | Enable HTTP transport on this port |
| `--host <host>` | Host to bind to. Default: `localhost`. Use `0.0.0.0` for all interfaces |
| `--device <device>` | Emulate a device, e.g. `"iPhone 15"`, `"Pixel 7"` |
| `--user-data-dir <path>` | Path to a persistent browser profile |
| `--storage-state <path>` | Path to a `storageState.json` for pre-authenticated sessions |
| `--init-page <path>` | Path to a TS file evaluated on every new page (for geolocation, permissions, etc.) |
| `--config <path>` | Path to a JSON config file (mirrors CLI args) |
| `--caps <caps>` | Comma-separated extra capabilities: `vision`, `pdf`, `devtools` |
| `--cdp-endpoint <url>` | Connect to an existing browser via CDP |
| `--extension` | Connect to a running Edge/Chrome tab via the MCP Bridge extension |
| `--isolated` | Use an isolated browser context (ephemeral, no persistent state) |
| `--executable-path <path>` | Custom browser binary path |
| `--allowed-origins <origins>` | Semicolon-separated trusted origins the browser may request |
| `--blocked-origins <origins>` | Semicolon-separated origins to block |
| `--allowed-hosts <hosts>` | Comma-separated hosts the server may serve from |
| `--block-service-workers` | Block service workers |
| `--grant-permissions <perms>` | Permissions to grant: `geolocation`, `clipboard-read`, `clipboard-write` |
| `--ignore-https-errors` | Ignore TLS/SSL certificate errors |
| `--proxy-server <proxy>` | Proxy server URL |
| `--save-trace` | Save a Playwright trace for each session |
| `--output-dir <path>` | Directory to save screenshots and downloads |
| `--viewport-size <WxH>` | Browser viewport, e.g. `1280x720` |
| `--console-level <level>` | Console log level: `error`, `warning`, `info`, `debug` |
| `--image-responses <mode>` | `allow` (default) or `omit` to suppress screenshot responses |
| `--no-sandbox` | Disable browser sandbox (required in some Docker/CI environments) |

### 3.5 Example: Full-Featured Config

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--browser", "chrome",
        "--headless",
        "--caps", "vision,pdf",
        "--storage-state", ".auth/storageState.json",
        "--output-dir", "playwright-output",
        "--viewport-size", "1440x900"
      ]
    }
  }
}
```

### 3.6 init-page Setup (TypeScript)

Use `--init-page` to run setup code on every new page before any test action:

```typescript
// init-page.ts
export default async ({ page }) => {
  await page.context().grantPermissions(['geolocation', 'clipboard-read']);
  await page.context().setGeolocation({ latitude: 13.0827, longitude: 80.2707 });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.context().setExtraHTTPHeaders({ 'X-Custom-Header': 'test' });
};
```

Pass it via args:

```json
"args": ["@playwright/mcp@latest", "--init-page", "./init-page.ts"]
```

---

## 4. playwright-test MCP — The Agent Loop Server

This is the **built-in** MCP server that ships with `@playwright/test`. It is the backbone of the Planner / Generator / Healer agent loop.

### 4.1 What It Is

Unlike `@playwright/mcp` (which is for general browser automation), `playwright run-test-mcp-server` is purpose-built for the **Playwright Test Agent workflow**. It exposes tools for running Playwright tests, reading results, and working with the Playwright runner internals.

### 4.2 When It Is Used

This server is started automatically by your AI tool when you invoke an agent using `npx playwright init-agents`. You do not need to configure it manually in most cases — the init command generates the correct `.vscode/mcp.json` for you.

### 4.3 Generated mcp.json

```json
{
  "servers": {
    "playwright-test": {
      "type": "stdio",
      "command": "npx",
      "args": ["playwright", "run-test-mcp-server"]
    }
  }
}
```

> **Note:** This is specifically for agent loops (VS Code, Claude Code, OpenCode). Do not use this config with general-purpose AI tools like Claude Desktop — use `@playwright/mcp` instead.

### 4.4 Initialising Agents

```bash
# For VS Code + GitHub Copilot (requires VS Code v1.105+)
npx playwright init-agents --loop=vscode

# For Claude Code
npx playwright init-agents --loop=claude

# For OpenCode
npx playwright init-agents --loop=opencode
```

This generates:
- `.github/agents/` — Agent instruction files (planner, generator, healer)
- `.vscode/mcp.json` — MCP server configuration pointing to `run-test-mcp-server`

---

## 5. @executeautomation/playwright-mcp-server — The Community Server

**Package:** [`@executeautomation/playwright-mcp-server`](https://npmjs.com/package/@executeautomation/playwright-mcp-server)
**Repo:** [github.com/executeautomation/mcp-playwright](https://github.com/executeautomation/mcp-playwright)
**Docs:** [executeautomation.github.io/mcp-playwright](https://executeautomation.github.io/mcp-playwright)

### 5.1 Key Differentiators

This community server adds features not in the official package:

- **Native API testing tools** — make HTTP requests (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) without opening a browser
- **143-device emulation** — iPhone, iPad, Pixel, Galaxy, Desktop presets with proper viewport, touch, UA, and DPR
- **JavaScript execution** — `playwright_evaluate` runs arbitrary JS in the page context
- **Console log capture** — dedicated tool to retrieve page console output
- **Screenshot comparison** — built-in visual regression support

### 5.2 Install

```bash
npm install -g @executeautomation/playwright-mcp-server
```

### 5.3 Claude Desktop Config

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@executeautomation/playwright-mcp-server"]
    }
  }
}
```

### 5.4 VS Code (stdio)

```bash
code --add-mcp '{"name":"playwright","command":"npx","args":["@executeautomation/playwright-mcp-server"]}'
```

### 5.5 VS Code / HTTP Mode

For remote or CI use, start the server in HTTP mode first:

```bash
npx @executeautomation/playwright-mcp-server --port 8931
```

```json
{
  "github.copilot.chat.mcp.servers": {
    "playwright": {
      "url": "http://localhost:8931/mcp",
      "type": "http"
    }
  }
}
```

> ⚠️ The `"type": "http"` field is mandatory for HTTP mode. Without it, the connection will fail with a session error.

### 5.6 Install via Smithery

```bash
# Install and configure for Claude Desktop automatically
npx @smithery/cli install @executeautomation/playwright-mcp-server --client claude
```

### 5.7 Device Emulation Example

```
Prompt: "Run the login test on iPhone 13 in portrait and then on iPad Pro in landscape"
```

The server internally calls:

```typescript
await playwright_resize({ device: "iPhone 13" });
// ...test steps...
await playwright_resize({ device: "iPad Pro 11", orientation: "landscape" });
```

---

## 6. Playwright CLI (SKILLS Mode)

The **Playwright CLI** (`playwright-cli`) is the newest addition to the Playwright MCP family and represents the direction Microsoft is heading for **coding agents**.

### 6.1 Why CLI over MCP?

| Metric | MCP Server | Playwright CLI |
|---|---|---|
| Tokens per task (typical) | ~114,000 | ~27,000 |
| Accessibility tree in context | ✅ Always | ❌ Saved to disk |
| Suited for | Exploratory/agentic loops | High-throughput coding agents |
| Filesystem required | ❌ | ✅ |

> Use **CLI** when your agent has filesystem access (Claude Code, Copilot, Cursor).
> Use **MCP** when it doesn't, or when you need persistent state and rich introspection.

### 6.2 Install

```bash
npm install -g @playwright/mcp@latest
playwright-cli --help
```

### 6.3 Core Commands

```bash
# Navigation & Interaction
playwright-cli open https://example.com     # Opens a new incognito session
playwright-cli open https://example.com --persistent  # Persistent profile
playwright-cli open https://example.com --profile=./my-data  # Custom profile dir
playwright-cli click <element-ref>
playwright-cli type "text to type"
playwright-cli press Enter
playwright-cli screenshot

# Session Management
playwright-cli list                          # List all active sessions
playwright-cli -s=myapp open example.com    # Named session
playwright-cli -s=myapp click e5
playwright-cli -s=myapp close
playwright-cli -s=myapp delete-data
playwright-cli close-all                    # Close all browsers
playwright-cli kill-all                     # Force kill all browser processes

# Config
playwright-cli config --headed --config=config.json
playwright-cli config --isolated --browser=firefox --headed
playwright-cli install --browser=firefox

# State / Auth
playwright-cli state-save auth.json
playwright-cli state-load auth.json

# Cookies
playwright-cli cookie-list
playwright-cli cookie-get session_id
playwright-cli cookie-set session_id abc123 --domain=example.com
playwright-cli cookie-delete session_id
playwright-cli cookie-clear

# Storage
playwright-cli localstorage-list
playwright-cli localstorage-get theme
playwright-cli localstorage-set theme dark
playwright-cli localstorage-clear
playwright-cli sessionstorage-set wizardStep 3
playwright-cli sessionstorage-clear
```

### 6.4 Network Mocking from CLI

The CLI supports intercepting, mocking, and blocking network requests without a test harness:

```bash
playwright-cli mock-route "https://api.example.com/users" --status 200 --body '{"users":[]}'
playwright-cli block-route "https://analytics.example.com/*"
```

### 6.5 TodoMVC Quick Demo

```bash
playwright-cli open https://demo.playwright.dev/todomvc/ --headed
playwright-cli type "Buy groceries"
playwright-cli press Enter
playwright-cli type "Water flowers"
playwright-cli press Enter
playwright-cli check e21
playwright-cli screenshot
```

---

## 7. Client Setup by Tool

### 7.1 VS Code + GitHub Copilot

**Via Marketplace (easiest):**

1. Visit [github.com/microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) and click **Install in VS Code**
2. Open Command Palette → `>MCP: Open user configuration`
3. Verify `mcp.json` contains the playwright server entry
4. Open Copilot Chat → Agent Mode → Configure Tools → confirm `playwright` appears

**Via CLI:**

```bash
code --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

**Manual `mcp.json` (user-level):**

```json
{
  "servers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"],
      "type": "stdio"
    }
  },
  "inputs": []
}
```

> **Note:** GitHub Copilot's Coding Agent has `@playwright/mcp` **built in** — no configuration required for agent-mode workflows.

### 7.2 Claude Code

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

Or manually in `~/.claude.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "type": "stdio",
      "command": "npx",
      "timeout": 30,
      "args": ["-y", "@playwright/mcp@latest"],
      "disabled": false
    }
  }
}
```

After adding, say "Use playwright mcp to open a browser to example.com" to activate it.

> **Tip:** The `claude mcp add` command is scoped to the current working directory. Check `~/.claude.json` under the `"projects"` key to confirm.

### 7.3 Claude Desktop

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

Config file locations:

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

### 7.4 Cursor

Go to **Cursor Settings → MCP → Add new MCP Server**. Set type to `command` and enter:

```
npx @playwright/mcp@latest
```

Or directly in `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 7.5 Windsurf

Go to **Settings → AI → Manage MCP Servers → + Add** and use the standard config above.

### 7.6 OpenCode

In `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

### 7.7 Kiro

In `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 7.8 Warp Terminal

Use the `/add-mcp` slash command in your Warp prompt and paste the standard config.

---

## 8. Transport Modes: stdio vs HTTP vs SSE

| Mode | How it works | Best for |
|---|---|---|
| **stdio** | MCP client spawns the server as a subprocess; communicates over stdin/stdout | Local development, most AI tools |
| **HTTP (Streamable)** | Server runs independently on a port; client connects via HTTP URL | CI environments, headed browser on headless server, shared sessions |
| **SSE** | Legacy server-sent events transport; deprecated in favour of Streamable HTTP | Older integrations |

### stdio (default)

```json
{ "command": "npx", "args": ["@playwright/mcp@latest"] }
```

### HTTP

```bash
# Start server on port 8931
npx @playwright/mcp@latest --port 8931 --host 0.0.0.0
```

```json
{ "url": "http://localhost:8931/mcp" }
```

### Programmatic SSE (custom integration)

```typescript
import http from 'http';
import { createConnection } from '@playwright/mcp';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

http.createServer(async (req, res) => {
  const connection = await createConnection({
    browser: { launchOptions: { headless: true } }
  });
  const transport = new SSEServerTransport('/messages', res);
  await connection.connect(transport);
});
```

---

## 9. Browser Profiles & Session Management

### Persistent Profile (default)

State is saved across sessions. Profile locations:

| OS | Path |
|---|---|
| Windows | `%USERPROFILE%\AppData\Local\ms-playwright\mcp-{channel}-profile` |
| macOS | `~/Library/Caches/ms-playwright/mcp-{channel}-profile` |
| Linux | `~/.cache/ms-playwright/mcp-{channel}-profile` |

Override with `--user-data-dir`:

```bash
npx @playwright/mcp@latest --user-data-dir ./my-browser-profile
```

### Isolated Mode (ephemeral)

Each session starts fresh with no stored state:

```bash
npx @playwright/mcp@latest --isolated
```

### Pre-authenticated Sessions via storageState

Save your auth state once (using Playwright codegen or a setup script), then load it:

```bash
npx @playwright/mcp@latest --storage-state .auth/storageState.json
```

This injects cookies and localStorage from the file into every new isolated context.

### MCP Bridge Extension (Live Browser Tab)

For Edge or Chrome, install the **Playwright MCP Bridge** extension to connect to an existing, already-logged-in browser tab:

```bash
npx @playwright/mcp@latest --extension
```

This is the most convenient way to reuse your personal session without exporting auth state.

---

## 10. Environment Variables & Configuration File

All CLI arguments have `PLAYWRIGHT_MCP_*` environment variable equivalents, useful for CI:

| Env Var | Equivalent CLI arg |
|---|---|
| `PLAYWRIGHT_MCP_BROWSER` | `--browser` |
| `PLAYWRIGHT_MCP_HOST` | `--host` |
| `PLAYWRIGHT_MCP_ALLOWED_HOSTS` | `--allowed-hosts` |
| `PLAYWRIGHT_MCP_ALLOWED_ORIGINS` | `--allowed-origins` |
| `PLAYWRIGHT_MCP_BLOCKED_ORIGINS` | `--blocked-origins` |
| `PLAYWRIGHT_MCP_ALLOW_UNRESTRICTED_FILE_ACCESS` | `--allow-unrestricted-file-access` |
| `PLAYWRIGHT_MCP_CAPS` | `--caps` |
| `PLAYWRIGHT_MCP_CDP_ENDPOINT` | `--cdp-endpoint` |
| `PLAYWRIGHT_MCP_CDP_HEADER` | `--cdp-header` |
| `PLAYWRIGHT_MCP_CDP_TIMEOUT` | `--cdp-timeout` |
| `PLAYWRIGHT_MCP_CODEGEN` | `--codegen` |
| `PLAYWRIGHT_MCP_CONSOLE_LEVEL` | `--console-level` |
| `PLAYWRIGHT_MCP_EXTENSION` | `--extension` |
| `PLAYWRIGHT_MCP_GRANT_PERMISSIONS` | `--grant-permissions` |
| `PLAYWRIGHT_MCP_INIT_SCRIPT` | `--init-script` |

### Config File

Instead of long `args` arrays, use a JSON config file:

```json
// playwright-mcp.config.json
{
  "browser": "chrome",
  "headless": true,
  "caps": ["vision", "pdf"],
  "outputDir": "playwright-output",
  "storageState": ".auth/storageState.json",
  "viewportSize": "1440x900",
  "consoleLevel": "warning"
}
```

```json
"args": ["@playwright/mcp@latest", "--config", "./playwright-mcp.config.json"]
```

---

## 11. Capabilities: Vision, PDF, DevTools

Enable extra capabilities with `--caps`:

### Vision Mode

```bash
npx @playwright/mcp@latest --caps vision
```

Adds coordinate-based interaction tools alongside the default accessibility-tree tools. Use this when:
- The app has canvas elements with no accessibility attributes
- You need to interact with a visual area rather than a DOM element
- The AI needs to verify visual layouts

Available extra tools: `browser_screen_capture`, `browser_screen_move_mouse`, `browser_screen_click`, `browser_screen_type`

### PDF Mode

```bash
npx @playwright/mcp@latest --caps pdf
```

Adds `browser_pdf_save` — generates a PDF of the current page.

### DevTools Mode

```bash
npx @playwright/mcp@latest --caps devtools
```

Exposes browser DevTools Protocol tools for performance profiling and network inspection. Also available in the Playwright CLI with `--caps=devtools`.

### Combining Capabilities

```bash
npx @playwright/mcp@latest --caps vision,pdf,devtools
```

---

## 12. Docker Setup

### Official Image (headless Chromium only)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--init", "--pull=always",
               "mcr.microsoft.com/playwright/mcp"]
    }
  }
}
```

### Long-lived Container with HTTP Transport

```bash
docker run -d -i --rm --init --pull=always \
  --entrypoint node \
  --name playwright \
  -p 8931:8931 \
  mcr.microsoft.com/playwright/mcp \
  cli.js --headless --browser chromium --no-sandbox --port 8931 --host 0.0.0.0
```

Client config:

```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:8931/mcp"
    }
  }
}
```

### Build Your Own Image

```bash
git clone https://github.com/microsoft/playwright-mcp
cd playwright-mcp
docker build -t my-playwright-mcp .
```

> ⚠️ The official Docker image currently supports headless Chromium only.

---

## 13. Playwright Test Agents (Planner / Generator / Healer)

These are high-level AI agents that orchestrate the `playwright-test` MCP server to build and maintain your test suite automatically.

### 13.1 Agent Overview

| Agent | Input | Output | When to use |
|---|---|---|---|
| **🎭 Planner** | Natural language requirement + seed test | `specs/*.md` Markdown plan | Before writing any tests |
| **🎭 Generator** | Markdown plan | `tests/*.spec.ts` test files | After planning |
| **🎭 Healer** | Failing test file | Patched test code | After a UI change breaks tests |

### 13.2 Setup

```bash
# VS Code + GitHub Copilot (VS Code v1.105+ required)
npx playwright init-agents --loop=vscode

# Claude Code
npx playwright init-agents --loop=claude

# OpenCode
npx playwright init-agents --loop=opencode
```

### 13.3 The Seed Test

The seed test is the anchor for all agents. It encodes how to reach your app, including any custom fixtures, global setup, and auth:

```typescript
// tests/seed.spec.ts
import { test, expect } from './fixtures';

test('seed', async ({ page }) => {
  await page.goto('https://your-app.com');
  // agents will reference this to understand your app's entry point
  // and to discover available fixtures, hooks, and helpers
});
```

All three agents reference `seed.spec.ts` to understand the test context. Always keep it up to date.

### 13.4 Planner Prompts

```
"Create a test plan for the TodoMVC app covering: Adding, marking complete, filtering, and deleting todos."
```

Attach `tests/seed.spec.ts` to context. Output lands in `specs/<plan-name>.md`.

Example output structure:

```markdown
# TodoMVC - Basic Operations Test Plan

## Application Overview
...

## Test Scenarios
### 1. Adding New Todos
#### 1.1 Add Valid Todo
**Steps:**
1. Click the "What needs to be done?" input
2. Type "Buy groceries"
3. Press Enter

**Expected Results:**
- Todo appears in the list
- Counter shows "1 item left"
- Input field is cleared
```

### 13.5 Generator Prompts

```
"Generate Playwright tests for all scenarios in specs/todomvc-plan.md"
```

Output structure in `tests/`:

```typescript
// spec: specs/basic-operations.md
// seed: tests/seed.spec.ts

import { test, expect } from '../fixtures';

test.describe('Adding New Todos', () => {
  test('Add Valid Todo', async ({ page }) => {
    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    await todoInput.fill('Buy groceries');
    await todoInput.press('Enter');
    await expect(page.getByText('Buy groceries')).toBeVisible();
    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  });
});
```

### 13.6 Healer Prompts

First, intentionally break a test:

```typescript
// Change this
await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
// To this (wrong value)
await expect(page.getByTestId('todo-count')).toHaveText('99 items');
```

Run tests to confirm failure, then prompt the Healer:

```
"Fix the failing test: tests/add-valid-todo.spec.ts"
```

The Healer will:
1. Run the failing test
2. Navigate to the relevant page in a live browser
3. Inspect the actual DOM state
4. Patch the assertion to match reality
5. Re-run the test to confirm it passes

### 13.7 Effective Prompting Tips

| Do | Don't |
|---|---|
| Attach `seed.spec.ts` to every prompt | Describe the whole app in the prompt |
| Reference the plan file by name | Assume the agent knows your fixtures |
| Ask for one scenario at a time for complex flows | Ask to generate tests for 20 scenarios at once |
| Include a PRD for context when planning | Skip context on critical business rules |

---

## 14. Full Tool Reference

### @playwright/mcp Core Tools (Accessibility Mode)

| Tool | Description |
|---|---|
| `browser_snapshot` | Capture current page accessibility tree |
| `browser_navigate` | Navigate to a URL |
| `browser_navigate_back` | Press the Back button |
| `browser_navigate_forward` | Press the Forward button |
| `browser_click` | Click an element by accessibility reference |
| `browser_type` | Type text into an element |
| `browser_fill` | Fill a form field value directly |
| `browser_press_key` | Press a keyboard key |
| `browser_hover` | Hover over an element |
| `browser_select_option` | Select a dropdown option |
| `browser_check` | Check/uncheck a checkbox |
| `browser_scroll` | Scroll the page |
| `browser_wait_for` | Wait for a condition (text, selector, network idle) |
| `browser_network_requests` | List recent network requests |
| `browser_console_messages` | Retrieve console output |
| `browser_handle_dialog` | Accept or dismiss a browser dialog |
| `browser_file_upload` | Upload a file to a file input |
| `browser_close` | Close the current tab |
| `browser_tab_list` | List all open tabs |
| `browser_tab_new` | Open a new tab |
| `browser_tab_select` | Switch to a specific tab |
| `browser_tab_close` | Close a specific tab |
| `browser_resize` | Resize the browser viewport |
| `browser_generate_playwright_test` | Generate a Playwright test from session history |

### @playwright/mcp Vision Mode Tools (--caps vision)

| Tool | Description |
|---|---|
| `browser_screen_capture` | Take a screenshot |
| `browser_screen_move_mouse` | Move mouse to coordinates |
| `browser_screen_click` | Click at x/y coordinates |
| `browser_screen_drag` | Drag from one coordinate to another |
| `browser_screen_type` | Type text at current cursor position |

### @playwright/mcp PDF Tool (--caps pdf)

| Tool | Description |
|---|---|
| `browser_pdf_save` | Save the current page as a PDF file |

### @executeautomation/playwright-mcp-server Additional Tools

| Tool | Description |
|---|---|
| `playwright_navigate` | Navigate to a URL |
| `playwright_screenshot` | Take a screenshot (base64 or saved to disk) |
| `playwright_click` | Click an element by CSS selector |
| `playwright_fill` | Fill an input field |
| `playwright_select` | Select a dropdown option |
| `playwright_hover` | Hover over an element |
| `playwright_evaluate` | Execute arbitrary JavaScript in the page |
| `playwright_get_visible_text` | Extract visible text from the page |
| `playwright_get_visible_html` | Get the visible HTML |
| `playwright_console_logs` | Retrieve browser console logs |
| `playwright_resize` | Resize viewport or emulate a named device |
| `playwright_get_request` | HTTP GET request (API testing) |
| `playwright_post_request` | HTTP POST request |
| `playwright_put_request` | HTTP PUT request |
| `playwright_patch_request` | HTTP PATCH request |
| `playwright_delete_request` | HTTP DELETE request |
| `playwright_expect_response` | Assert on an API response |
| `playwright_assert_response` | Assert on response body/status |

---

## 15. Troubleshooting

### Browser doesn't open / connection refused

```bash
# Verify the MCP server is reachable
npx @playwright/mcp@latest --port 8931
curl http://localhost:8931/mcp   # should return an MCP handshake response
```

### Headed browser on a headless server

```bash
# Start Xvfb virtual display first (Linux)
Xvfb :1 -screen 0 1280x720x24 &
DISPLAY=:1 npx @playwright/mcp@latest --port 8931
```

Then configure your client to use the HTTP transport:

```json
{ "url": "http://localhost:8931/mcp" }
```

### 400 Bad Request: No transport found for sessionId

This occurs with `@executeautomation/playwright-mcp-server` in HTTP mode. Ensure you include `"type": "http"` in your client config.

```json
{
  "playwright": {
    "url": "http://localhost:8931/mcp",
    "type": "http"
  }
}
```

Watch the server console for the three-step handshake: `Incoming request` → `Transport registered` → `POST message received`.

### Agent uses bash instead of Playwright MCP

When using Claude Code, be explicit on first use:

```
"Use playwright mcp to open a browser to https://example.com"
```

After the first invocation, you can drop the qualifier.

### File system access is blocked

By default, `@playwright/mcp` restricts file access to the current workspace root and blocks `file://` URLs. To opt out:

```bash
npx @playwright/mcp@latest --allow-unrestricted-file-access
```

### Codegen output language

The server generates TypeScript code snippets by default. Change to `none` to suppress code generation:

```bash
npx @playwright/mcp@latest --codegen none
```

Or set `PLAYWRIGHT_MCP_CODEGEN=none`.

### System Requirements

- Node.js 18 or later
- Chromium (bundled with Playwright), or Firefox / WebKit for non-Docker setups
- Docker image supports headless Chromium only

---

## 16. Choosing the Right Tool

```
Do you need to automate a browser with an AI agent?
│
├── Does your AI tool have filesystem access? (Claude Code, Copilot, Cursor)
│   └── YES → Use playwright-cli (SKILLS mode) for 4x token efficiency
│
├── Is this for a Playwright test agent loop (Planner/Generator/Healer)?
│   └── YES → Use npx playwright init-agents → playwright run-test-mcp-server
│
├── Do you need API testing OR 143-device emulation?
│   └── YES → Use @executeautomation/playwright-mcp-server
│
├── Do you need exploratory automation, long-running sessions, or no filesystem?
│   └── YES → Use @playwright/mcp (official)
│       ├── With visual/canvas elements? → Add --caps vision
│       ├── In a container/CI? → Use Docker + --port for HTTP transport
│       └── With pre-authenticated state? → Use --storage-state or --extension
│
└── Are you integrating programmatically?
    └── Use createConnection() from '@playwright/mcp' with SSEServerTransport
```

---

## 📚 References

| Resource | URL |
|---|---|
| Official Playwright Agents Docs | https://playwright.dev/docs/test-agents |
| `@playwright/mcp` GitHub | https://github.com/microsoft/playwright-mcp |
| `@playwright/mcp` npm | https://npmjs.com/package/@playwright/mcp |
| ExecuteAutomation MCP GitHub | https://github.com/executeautomation/mcp-playwright |
| ExecuteAutomation MCP Docs | https://executeautomation.github.io/mcp-playwright |
| Model Context Protocol Spec | https://modelcontextprotocol.io |
| MCP Bridge Extension | https://github.com/microsoft/playwright-mcp/tree/main/packages/extension |
| Docker Image | `mcr.microsoft.com/playwright/mcp` |

---

*Last updated: March 2026 — covers `@playwright/mcp` v0.x with CLI support, agent loop, Docker, and all major MCP clients.*