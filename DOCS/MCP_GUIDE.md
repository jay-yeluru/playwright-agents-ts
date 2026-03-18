# Playwright MCP Comprehensive Guide

This document provides detailed information about configuring and using the Playwright MCP servers.

## 🔌 MCP Configuration Basics

MCP (Model Context Protocol) is an open standard that lets AI tools interact with external services. Playwright provides two MCP servers for different purposes.

### Playwright MCP vs Playwright-Test MCP

| Feature | **Playwright MCP** | **Playwright-Test MCP** |
|---------|-------------------|------------------------|
| **Package** | `@playwright/mcp` | Built into Playwright Test Agents |
| **Purpose** | Browser automation & exploration | Test execution & generation |
| **What it does** | Controls a live browser (click, type, navigate) | Runs tests, creates files, analyzes results |
| **Best for** | Exploratory testing, discovering UI elements | Generating test code, healing broken tests |
| **Interface** | Accessibility snapshots, screenshots | Test runner, file system |

---

## 🛠 Setting Up Playwright MCP

The Playwright MCP server lets AI tools control a real browser to explore your app.

### Standard Configuration

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

### Configuration by Tool

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

#### VS Code (Manual)
**Location:** `.vscode/mcp.json`
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

---

## ⚙️ Advanced Options

| Option | Description | Example |
|--------|-------------|---------|
| `--headless` | Run browser without visible window | `--headless` |
| `--browser <name>` | Use specific browser: `chromium`, `firefox`, `webkit` | `--browser firefox` |
| `--caps=vision` | Enable screenshot-based interactions | `--caps=vision` |
| `--caps=devtools` | Enable Chrome DevTools features | `--caps=devtools` |
| `--output-mode file` | Save snapshots to files instead of console | `--output-mode file` |
| `--isolated` | Keep browser session in memory only | `--isolated` |
| `--viewport-size` | Set browser viewport (e.g., `1280x720`) | `--viewport-size 1920x1080` |
| `--device` | Emulate device (e.g., `iPhone 15`) | `--device "iPhone 15"` |

### Docker Setup

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

---

## 🧰 Available Tools

AI agents can use these tools once connected:

| Tool Category | Key Tools |
|---------------|-----------|
| **Navigation** | `browser_navigate`, `browser_snapshot`, `browser_tabs` |
| **Interaction** | `browser_click`, `browser_type`, `browser_fill_form`, `browser_hover` |
| **Verification** | `browser_take_screenshot`, `browser_evaluate`, `browser_console_messages` |
| **Network** | `browser_network_requests`, `browser_route` |

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| "Browser not found" | Run `npx playwright install` |
| "Connection refused" | Restart the AI tool and try again |
| "Timeout on actions" | Increase timeout: `--timeout-action 30000` |
| "Wrong element clicked" | Be more specific in your prompt to the AI |

For more help, see the [Playwright MCP GitHub Issues](https://github.com/microsoft/playwright-mcp/issues).
