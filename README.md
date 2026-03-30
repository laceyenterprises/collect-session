# collect-session

An [OpenClaw](https://openclaw.ai) AgentSkill that automatically captures session telemetry whenever `/new` or `/reset` is issued.

## What it does

Every time you start a new session, the hook fires on the previous one and:

1. Parses the session JSONL — turns, tool calls, model usage, token counts
2. Derives cost from a built-in pricing table (Anthropic, OpenAI, Google)
3. Calls an LLM via LiteLLM to generate a session name, keywords, and 2–3 sentence summary
4. Writes a rich Markdown file to `<output-dir>/sessions/YYYY-MM-DD-<slug>.md`
5. Appends a row to `SESSION-INDEX.md` and a record to `session-log.jsonl`

## Requirements

- [OpenClaw](https://openclaw.ai) with a `workspace.dir` configured
- [LiteLLM](https://github.com/BerriAI/litellm) running locally (for cost data and LLM enrichment)
- Node.js (`node` in PATH)

## Files

| File | Purpose |
|---|---|
| `collect-session.mjs` | Main script — run standalone or invoked by the hook |
| `hook-handler.ts` | OpenClaw hook handler — fires on `command:new` / `command:reset` |
| `SKILL.md` | Agent-readable install guide (for OpenClaw agents) |

## Quick start

See [SKILL.md](./SKILL.md) for full setup instructions, including:
- How to configure LiteLLM credentials and output paths
- How to register the hook in OpenClaw
- CLI reference and troubleshooting

## CLI usage

```bash
# Collect most recent completed session
node collect-session.mjs

# Collect a specific session
node collect-session.mjs <session-id>

# Backfill all uncollected sessions
node collect-session.mjs --sweep

# Skip LLM enrichment (faster, heuristic names)
node collect-session.mjs --no-llm

# Override output directory
node collect-session.mjs --output-dir ~/my-workspace/memory
```

## Configuration

Edit the `CONFIG` block at the top of `collect-session.mjs`, or set environment variables:

| Env var | Default | Description |
|---|---|---|
| `COLLECT_SESSION_OUTPUT_DIR` | `~/workspace/memory` | Where to write session files |
| `LITELLM_BASE_URL` | `http://localhost:4000` | LiteLLM proxy URL |
| `LITELLM_API_KEY` | *(required)* | LiteLLM virtual key |
| `COLLECT_SESSION_LLM_MODEL` | `gemini-2.0-flash` | Model for session naming/summarization |

## License

MIT — Lacey Enterprises LLC
