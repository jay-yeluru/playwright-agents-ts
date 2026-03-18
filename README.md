# Playwright Agents - TodoMVC Demo

A hands-on guide to using Playwright's AI-powered test generation with the TodoMVC app.

**What you'll learn:** How to use AI agents to automatically generate, run, and fix Playwright tests.

> **New to MCP?** Check out the [MCP Configuration section](#-mcp-configuration) for setup instructions.

---

## 🎯 What Are Playwright Test Agents?

Think of Playwright Agents as your AI testing assistants. Instead of writing tests manually (which takes time and can be error-prone), you tell these agents what you want to test, and they:

1. **Explore your app** and understand how it works
2. **Generate test code** that you can run immediately
3. **Fix broken tests** automatically when the app changes

### The Three Agents

| Agent | What it does | You give it | It gives you |
|-------|--------------|-------------|--------------|
| **🎭 Planner** | Explores your app and creates a test plan | What to test | A roadmap in Markdown |
| **🎭 Generator** | Turns the plan into actual test code | The roadmap | Working test files |
| **🎭 Healer** | Fixes tests when they break | A broken test | A fixed test |

### How They Work Together

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Planner   │ ───▶ │  Generator  │ ───▶ │   Healer   │
│  (Plan)     │      │  (Code)     │      │  (Fix)     │
└─────────────┘      └─────────────┘      └─────────────┘
      │                    │                    │
      ▼                    ▼                    ▼
  specs/*.md          tests/*.spec.ts       (when tests fail)
```

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites

Before starting, make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **An AI coding tool** - VS Code, Claude Code, or OpenCode
- Basic understanding of what a website is

### Step 1: Clone & Install

```bash
# Clone this repository
git clone <repo-url>
cd playwright-agents-ts

# Install all dependencies
npm install
```

### Step 2: Initialize the Agents

This step sets up the AI agents to understand how to work with Playwright:

```bash
# Choose one based on your AI tool:

# For VS Code (recommended, requires v1.105+):
npx playwright init-agents --loop=vscode

# For Claude Code:
npx playwright init-agents --loop=claude

# For OpenCode:
npx playwright init-agents --loop=opencode
```

You'll see new files created in `.github/` and `specs/` folders.

### Step 3: Create a Seed Test (Template)

The seed test tells the agents how to access your app. Create a file called `tests/seed.spec.ts`:

```typescript
import { test, expect } from './fixtures';

test('seed', async ({ page }) => {
  // Navigate to the TodoMVC app
  await page.goto('https://demo.playwright.dev/todomvc');
  
  // Wait for the app to load
  await expect(page.getByPlaceholder('What needs to be done?')).toBeVisible();
});
```

### Step 4: Run the Planner

The Planner explores your app and creates a testing roadmap.

**In your AI tool, activate the Planner agent and paste:**

```
Create a test plan for the TodoMVC app covering:
- Adding new todos
- Marking todos as complete
- Filtering todos (All/Active/Completed)
- Deleting todos
- Editing existing todos

Reference: tests/seed.spec.ts
```

The Planner will output a file like `specs/todomvc-plan.md`.

### Step 5: Run the Generator

The Generator turns that roadmap into actual test code.

**In your AI tool, activate the Generator agent and paste:**

```
Generate Playwright tests for all scenarios in specs/todomvc-plan.md

Reference: tests/seed.spec.ts
```

The Generator will create test files in the `tests/` folder.

### Step 6: Run Your Tests

```bash
# Run all tests (headless - no browser window)
npm test

# Run with visible browser (great for learning)
npm run test:headed

# Run in interactive UI mode
npm run test:ui
```

### Step 7: See the Healer in Action

Let's intentionally break a test to see how the Healer fixes it:

1. Open any generated test file
2. Change a text assertion (e.g., change `'1 item left'` to `'X items left'`)
3. Run the test - it should fail
4. **Activate the Healer agent** and paste:
   ```
   Fix the failing test: tests/<your-test-file>.spec.ts
   ```

Watch the Healer analyze the failure and automatically fix it!

---

## 🔌 MCP Configuration

MCP (Model Context Protocol) is an open standard that lets AI tools interact with external services. Playwright provides two MCP servers for different purposes.

### Playwright MCP vs Playwright-Test MCP

| Feature | **Playwright MCP** | **Playwright-Test MCP** |
|---------|-------------------|------------------------|
| **Package** | `@playwright/mcp` | Built into Playwright Test Agents |
| **Purpose** | Browser automation & exploration | Test execution & generation |
| **What it does** | Controls a live browser (click, type, navigate) | Runs tests, creates files, analyzes results |
| **Best for** | Exploratory testing, discovering UI elements | Generating test code, healing broken tests |
| **Interface** | Accessibility snapshots, screenshots | Test runner, file system |

**In simple terms:**
- **Playwright MCP** = "Open a browser and click around"
- **Playwright-Test MCP** = "Run these tests and create/modify test files"

### Setting Up Playwright MCP

The Playwright MCP server lets AI tools control a real browser to explore your app.

**Standard Configuration (for most AI tools):**

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

**For OpenCode**, add to `~/.config/opencode/opencode.json`:

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

**For Claude Desktop**, edit `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

**For Claude Code CLI:**

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

### Playwright MCP Options

| Option | Description | Example |
|--------|-------------|---------|
| `--headless` | Run browser without visible window (default) | `--headless` |
| `--browser <name>` | Use specific browser: `chromium`, `firefox`, `webkit` | `--browser firefox` |
| `--caps=vision` | Enable screenshot-based interactions | `--caps=vision` |
| `--caps=devtools` | Enable Chrome DevTools features | `--caps=devtools` |
| `--output-mode file` | Save snapshots to files instead of console | `--output-mode file` |
| `--isolated` | Keep browser session in memory only | `--isolated` |
| `--viewport-size` | Set browser viewport (e.g., `1280x720`) | `--viewport-size 1920x1080` |
| `--device` | Emulate device (e.g., `iPhone 15`) | `--device "iPhone 15"` |
| `--timeout-action` | Action timeout in milliseconds | `--timeout-action 10000` |
| `--timeout-navigation` | Navigation timeout in milliseconds | `--timeout-navigation 30000` |
| `--save-session` | Save session data to output directory | `--save-session` |
| `--allowed-origins` | Whitelist specific domains | `--allowed-origins https://example.com` |
| `--blocked-origins` | Blacklist specific domains | `--blocked-origins https://ads.com` |
| `--storage-state` | Path to storage state file (cookies, localStorage) | `--storage-state ./auth.json` |
| `--init-page` | TypeScript file to run on page load | `--init-page ./setup.ts` |
| `--codegen` | Code generation language (`typescript`, `none`) | `--codegen typescript` |
| `--no-sandbox` | Disable sandbox (needed in some environments) | `--no-sandbox` |
| `--extension` | Connect to existing browser via extension | `--extension` |

### MCP Configuration Files by AI Tool

The MCP configuration file location and format varies by AI tool. Below are examples for each supported tool.

#### OpenCode

**Location:** `~/.config/opencode/opencode.json`

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

**With options:**

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "playwright": {
      "type": "local",
      "command": ["npx", "@playwright/mcp@latest", "--headless", "--browser", "chromium"],
      "enabled": true
    }
  }
}
```

#### Claude Desktop

**Location:** 
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

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

**With options:**

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",
        "--browser",
        "chromium",
        "--timeout-action",
        "10000"
      ]
    }
  }
}
```

#### Claude Code CLI

```bash
# Basic
claude mcp add playwright npx @playwright/mcp@latest

# With options
claude mcp add playwright -- npx @playwright/mcp@latest --headless --browser chromium
```

#### Cursor

**Location:** `~/.cursor/mcp.json` or project `.cursor/mcp.json`

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

**Or via Cursor Settings:**
1. Go to `Cursor Settings` → `MCP` → `Add new MCP Server`
2. Name: `playwright`
3. Type: `command`
4. Command: `npx @playwright/mcp@latest`

#### VS Code

**Location:** `.vscode/mcp.json` (project) or `settings.json` (global)

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

**Via CLI:**
```bash
code --add-mcp '{"name":"playwright","command":"npx","args":["@playwright/mcp@latest"]}'
```

#### Windsurf

**Location:** `.windsurf/mcp.json`

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

#### Cline

**Location:** `~/.cline/cline_mcp_settings.json`

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

#### Codex

**Location:** `~/.codex/config.toml`

```toml
[mcp_servers.playwright]
command = "npx"
args = ["@playwright/mcp@latest"]
```

#### GitHub Copilot

**Location:** `~/.copilot/mcp-config.json`

```json
{
  "mcpServers": {
    "playwright": {
      "type": "local",
      "command": "npx",
      "tools": ["*"],
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### Using a Configuration File

You can also use a JSON config file to configure Playwright MCP with all options:

**config.json:**
```json
{
  "browser": {
    "browserName": "chromium",
    "isolated": true
  },
  "capabilities": ["core", "devtools"],
  "timeouts": {
    "action": 10000,
    "navigation": 30000
  },
  "viewport": {
    "width": 1280,
    "height": 720
  },
  "outputMode": "stdout",
  "network": {
    "allowedOrigins": ["https://demo.playwright.dev"]
  }
}
```

**Run with config:**
```bash
npx @playwright/mcp@latest --config ./config.json
```

### Docker Setup

Run Playwright MCP in a container:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "--init", "--pull=always", "mcr.microsoft.com/playwright/mcp"]
    }
  }
}
```

**Long-running container:**
```bash
docker run -d -i --rm --init \
  --name playwright-mcp \
  -p 8931:8931 \
  mcr.microsoft.com/playwright/mcp \
  cli.js --headless --browser chromium --no-sandbox --port 8931 --host 0.0.0.0
```

Then connect via HTTP:
```json
{
  "mcpServers": {
    "playwright": {
      "url": "http://localhost:8931/mcp"
    }
  }
}
```

### Environment Variables

All options can be set via environment variables:

| Environment Variable | Description |
|---------------------|-------------|
| `PLAYWRIGHT_MCP_BROWSER` | Browser to use |
| `PLAYWRIGHT_MCP_HEADLESS` | Run headless (true/false) |
| `PLAYWRIGHT_MCP_CAPS` | Capabilities (comma-separated) |
| `PLAYWRIGHT_MCP_TIMEOUT_ACTION` | Action timeout (ms) |
| `PLAYWRIGHT_MCP_TIMEOUT_NAVIGATION` | Navigation timeout (ms) |
| `PLAYWRIGHT_MCP_VIEWPORT_SIZE` | Viewport (e.g., 1280x720) |
| `PLAYWRIGHT_MCP_ALLOWED_ORIGINS` | Allowed origins |
| `PLAYWRIGHT_MCP_BLOCKED_ORIGINS` | Blocked origins |
| `PLAYWRIGHT_MCP_OUTPUT_MODE` | Output mode (file/stdout) |
| `PLAYWRIGHT_MCP_OUTPUT_DIR` | Output directory |

```bash
export PLAYWRIGHT_MCP_BROWSER=chromium
export PLAYWRIGHT_MCP_HEADLESS=true
export PLAYWRIGHT_MCP_CAPS=devtools,vision

npx @playwright/mcp@latest
```

### Common Use Cases

#### 1. Basic Exploration (Default)

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

#### 2. Headless CI Mode

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--headless",
        "--browser",
        "chromium",
        "--isolated"
      ]
    }
  }
}
```

#### 3. Authenticated Testing

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--storage-state",
        "./auth-state.json"
      ]
    }
  }
}
```

#### 4. Mobile Testing

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--device",
        "iPhone 15",
        "--headless"
      ]
    }
  }
}
```

#### 5. Restricted Access (Production Safety)

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--allowed-origins",
        "https://your-app.com",
        "--blocked-origins",
        "https://ads.example.com",
        "--isolated"
      ]
    }
  }
}
```

#### 6. Development with DevTools

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": [
        "@playwright/mcp@latest",
        "--caps=devtools",
        "--save-session",
        "--output-mode",
        "file"
      ]
    }
  }
}
```

### What Playwright MCP Tools Are Available

When connected, the AI can use these tools to interact with the browser:

#### Navigation & Page Control

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `browser_navigate` | Open a URL | Navigate to any webpage |
| `browser_navigate_back` | Go back in browser history | Test browser back button |
| `browser_snapshot` | Get accessibility tree | Understand page structure |
| `browser_tabs` | List, create, close tabs | Handle multiple pages |
| `browser_close` | Close the browser | Clean up session |

#### Element Interaction

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `browser_click` | Click an element | Click buttons, links |
| `browser_type` | Type text into a field | Fill forms, search boxes |
| `browser_fill_form` | Fill multiple fields | Complete entire forms |
| `browser_select_option` | Select dropdown options | Choose from `<select>` |
| `browser_hover` | Hover over an element | Trigger hover effects |
| `browser_drag` | Drag and drop | Reorder items |
| `browser_press_key` | Press keyboard keys | Enter, Tab, Escape |
| `browser_file_upload` | Upload files | Attach documents |

#### Verification & Debugging

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `browser_take_screenshot` | Capture the page | Visual verification |
| `browser_evaluate` | Run JavaScript | Custom logic, data extraction |
| `browser_run_code` | Run Playwright code | Advanced automation |
| `browser_console_messages` | Get console logs | Debug JavaScript errors |
| `browser_network_requests` | See network traffic | Monitor API calls |
| `browser_wait_for` | Wait for text/element | Handle async content |

#### Advanced (Requires `--caps`)

| Tool | Capability Required | Description |
|------|-------------------|-------------|
| `browser_network_state_set` | network | Set offline/online mode |
| `browser_route` | network | Mock network requests |
| `browser_get_config` | config | View resolved config |
| PDF tools | pdf | Generate PDFs |

**Example conversation with AI:**

```
You: "Open https://example.com and find the login form"
AI uses: browser_navigate → browser_snapshot

You: "Fill in the email field with test@example.com"
AI uses: browser_type

You: "Click the submit button"
AI uses: browser_click

You: "Take a screenshot to verify success"
AI uses: browser_take_screenshot
```

### Playwright-Test MCP (Built-in)

The Test Agents (Planner, Generator, Healer) use the **Playwright-Test MCP** internally through the agent definitions created by `npx playwright init-agents`. This MCP server:

- Executes Playwright tests
- Creates and modifies `.spec.ts` files
- Reads test reports and trace files
- Analyzes test failures

You don't need to configure this separately - it's automatically set up when you run `npx playwright init-agents`.

### Troubleshooting MCP Connection Issues

| Problem | Solution |
|---------|----------|
| "Browser not found" | Run `npx playwright install` to download browsers |
| "MCP server won't start" | Check Node.js version (requires 18+): `node --version` |
| "Connection refused" | Restart the AI tool and try again |
| "Timeout on actions" | Increase timeout: `--timeout-action 30000` |
| "Wrong element clicked" | Be more specific in your prompt to the AI |
| "file:// URLs blocked" | Use `--allow-unrestricted-file-access` flag |
| "Session state persists" | Use `--isolated` for clean sessions |
| "Docker: session not found" | Use `stdio` transport instead of HTTP |

**Debug tips:**
1. Check if Playwright browsers are installed: `npx playwright install --dry-run`
2. Test MCP server directly: `npx @playwright/mcp@latest --help`
3. View verbose logs: Check your AI tool's console/output
4. Clear old sessions: Close all browser windows, restart MCP

For more help, see the [Playwright MCP GitHub Issues](https://github.com/microsoft/playwright-mcp/issues).

---

## 📁 Project Structure Explained

Don't worry if this looks complex - you mainly work in `tests/`:

```
playwright-agents-ts/
├── .github/              # Agent instructions (auto-generated)
│   └── agents/           # Don't edit these files
├── specs/                # Test plans from Planner
│   └── *.md             # Human-readable test roadmap
├── fixtures/             # Test setup helpers
│   └── index.ts         # Custom test configurations
├── pages/               # Page Object Models (reusable components)
│   ├── todo.page.ts     # Functions for interacting with TodoMVC
│   └── pomanager.ts     # Manages all page objects
├── tests/               # YOUR TEST FILES LIVE HERE
│   ├── seed.spec.ts     # Template for new tests
│   └── *.spec.ts        # Generated and custom tests
├── playwright.config.ts # Test settings
└── package.json         # Project dependencies
```

---

## 🧪 Running Tests

| Command | What it does | Best for |
|---------|--------------|----------|
| `npm test` | Runs tests invisibly | CI/CD, quick checks |
| `npm run test:headed` | Shows browser window | Learning, debugging |
| `npm run test:ui` | Interactive test runner | Exploring tests |
| `npm run test:debug` | Pause and inspect | Finding bugs |
| `npm run report` | Open HTML report | Reviewing results |
| `npm run clean` | Remove test artifacts | Fresh start |

---

## 🤔 Common Questions

### "I don't see any agent option in my AI tool"

Make sure you ran `npx playwright init-agents --loop=<your-tool>`. This creates the agent definitions your tool needs.

### "The Planner didn't explore my app correctly"

Double-check your seed test has the correct URL and waits for key elements to load.

### "Generated tests are failing immediately"

This is normal! Run the Healer to fix them. The Generator creates tests quickly, and the Healer refines them.

### "Can I edit the generated tests?"

Absolutely. Generated tests are regular Playwright tests - feel free to modify them.

### "What's the difference between MCP and Playwright CLI?"

- **MCP** streams data directly to the AI (easier setup, higher token usage)
- **Playwright CLI** saves files to disk (~4x more token efficient for coding agents)

### "Can I use Playwright MCP and Playwright-Test MCP together?"

Yes! They're complementary:
1. Use **Playwright MCP** to explore and understand the app
2. Use **Playwright-Test MCP** (via agents) to generate and run tests

### "How do I keep my login state across sessions?"

Save authentication state to a file:

```bash
# First, log in manually with storage state
npx @playwright/mcp@latest --storage-state ./auth.json

# Then use the saved state for subsequent sessions
npx @playwright/mcp@latest --storage-state ./auth.json
```

---

## 📚 Learn More

### Official Documentation
- [Playwright Test Agents](https://playwright.dev/docs/test-agents) - Planner, Generator, Healer
- [Getting Started with Playwright](https://playwright.dev/docs/intro) - Basics
- [Writing Tests Guide](https://playwright.dev/docs/writing-tests) - Best practices
- [Page Object Models](https://playwright.dev/docs/pom) - Organizing code
- [Locators](https://playwright.dev/docs/locators) - Finding elements

### MCP & AI Integration
- [Playwright MCP GitHub](https://github.com/microsoft/playwright-mcp) - Browser automation server
- [MCP Documentation](https://modelcontextprotocol.io) - Protocol specification
- [VS Code MCP Setup](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) - IDE integration

### Tools & Extensions
- [VS Code Extension](https://playwright.dev/docs/getting-started-vscode) - Playwright in VS Code
- [Playwright CLI](https://github.com/microsoft/playwright-cli) - Token-efficient alternative to MCP

---

## 🧱 Code Philosophy

If you're curious about the code structure:

1. **Tests stay clean** - `tests/*.spec.ts` files only describe what to do
2. **Assertions are encapsulated** - Page Objects handle expectations
3. **Fixtures provide context** - Setup logic lives in `fixtures/`

This separation makes tests easier to read and maintain.

---

## License

MIT
