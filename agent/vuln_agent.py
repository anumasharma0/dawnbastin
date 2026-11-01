#!/usr/bin/env python3
"""
Dawbastion Python Agent — Vulnerability detection stub.
Replace the `analyze_file()` function with your actual analysis logic.

Usage:
    python vuln_agent.py --file <path_to_file>

Output:
    JSON to stdout matching the ScanResult schema consumed by the Next.js API.
"""

import argparse
import json
import sys
import os
from datetime import datetime


def analyze_file(file_path: str) -> dict:
    """
    Replace this function with your real vulnerability detection logic.
    
    Options:
    - Call Bandit (Python): subprocess.run(["bandit", "-f", "json", file_path])
    - Call Semgrep: subprocess.run(["semgrep", "--json", file_path])
    - Use your own ML model or rules engine
    - Call an LLM API (e.g. Anthropic Claude) with the file content
    """
    vulnerabilities = []
    summary = {"total": 0, "critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}

    # ── Example: naive pattern matching ──────────────────────────────────────
    if os.path.exists(file_path):
        with open(file_path, "r", errors="replace") as f:
            lines = f.readlines()

        PATTERNS = [
            ("eval(", "critical", "Use of eval() — arbitrary code execution risk", "CWE-95"),
            ("exec(", "high", "Use of exec() — code injection risk", "CWE-78"),
            ("pickle.loads", "high", "Insecure deserialization with pickle", "CWE-502"),
            ("shell=True", "high", "subprocess with shell=True", "CWE-78"),
            ("SECRET_KEY", "medium", "Possible hardcoded secret", "CWE-798"),
            ("password =", "medium", "Possible hardcoded password", "CWE-259"),
            ("DEBUG = True", "low", "Debug mode enabled", "CWE-489"),
        ]

        for i, line in enumerate(lines, start=1):
            for pattern, severity, title, cwe in PATTERNS:
                if pattern.lower() in line.lower():
                    vuln_id = f"VLN-{len(vulnerabilities)+1:03d}"
                    vulnerabilities.append({
                        "id": vuln_id,
                        "severity": severity,
                        "title": title,
                        "description": f"Pattern '{pattern}' found in file.",
                        "file": os.path.basename(file_path),
                        "line": i,
                        "cwe": cwe,
                        "recommendation": "Review this code for security implications.",
                        "snippet": line.strip(),
                    })
                    summary[severity] += 1
                    summary["total"] += 1

    return {
        "fileName": os.path.basename(file_path),
        "scannedAt": datetime.utcnow().isoformat() + "Z",
        "summary": summary,
        "vulnerabilities": vulnerabilities,
    }


def main():
    parser = argparse.ArgumentParser(description="Dawbastion Python Agent")
    parser.add_argument("--file", required=True, help="Path to file to analyze")
    args = parser.parse_args()

    if not os.path.exists(args.file):
        print(json.dumps({"error": f"File not found: {args.file}"}))
        sys.exit(1)

    result = analyze_file(args.file)
    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
