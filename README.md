# Dawbastion — AI Vulnerability Analysis Platform

A Next.js 14 + Shadcn/Tailwind UI for uploading files, saving them locally, and triggering a Python vulnerability agent.

---

## Quick Start

```bash
cd dawbastion
npm install
cp .env.example .env.local   # then edit paths
npm run dev
```

Open http://localhost:3000

---

## Configuration (.env.local)

| Variable | Default | Description |
|----------|---------|-------------|
| `UPLOAD_DIR` | `./uploads` | Where files are saved on disk. Use absolute path for Windows: `C:\Dawbastion\uploads` |
| `PYTHON_AGENT_PATH` | `./agent/vuln_agent.py` | Path to your Python agent script |
| `PYTHON_BIN` | `python` | Python binary (use `python3` or venv path) |

---

## Python Agent Contract

Your agent **must**:
1. Accept `--file <path>` argument
2. Print JSON to stdout in this shape:

```json
{
  "fileName": "example.py",
  "scannedAt": "2024-01-01T12:00:00Z",
  "summary": {
    "total": 3,
    "critical": 1,
    "high": 1,
    "medium": 1,
    "low": 0,
    "info": 0
  },
  "vulnerabilities": [
    {
      "id": "VLN-001",
      "severity": "critical",
      "title": "SQL Injection",
      "description": "...",
      "file": "example.py",
      "line": 42,
      "cwe": "CWE-89",
      "recommendation": "Use parameterized queries.",
      "snippet": "query = f'SELECT * FROM users WHERE id = {user_id}'"
    }
  ]
}
```

The included `agent/vuln_agent.py` is a **starter stub** with naive pattern matching. Replace `analyze_file()` with:
- **Bandit**: `bandit -f json <file>`
- **Semgrep**: `semgrep --json <file>`
- **LLM API**: Send file content to Claude/GPT for analysis
- Your own rules engine

---

## Project Structure

```
dawbastion/
├── app/
│   ├── api/
│   │   ├── upload/route.ts   ← saves file to UPLOAD_DIR
│   │   └── scan/route.ts     ← calls Python agent
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              ← main UI
├── components/
│   ├── FileUploadZone.tsx
│   ├── ScanProgress.tsx
│   ├── SummaryStats.tsx
│   ├── VulnerabilityCard.tsx
│   ├── ResultsPanel.tsx
│   └── SeverityBadge.tsx
├── lib/
│   ├── types.ts
│   └── utils.ts
├── agent/
│   └── vuln_agent.py         ← replace with your agent
├── uploads/                  ← files saved here (git-ignored)
└── .env.example
```
