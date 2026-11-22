# Claude ↔ Cursor handoff (Art of Raziel)

Claude and Cursor do not talk directly. They talk through this folder.

- `briefs/NNN-name.md`: one task per file. The first lines say `Status: open | in-progress (who) | done | blocked` and `For: cursor | claude`.
- `status.md`: a shared log, newest entry first. Add one entry when you start or finish a brief.
- Questions go under `## Questions` in the brief. Answers go under `## Answers`.

## Ownership (launch sprint, from 2026-11-22)

| Area | Owner |
| --- | --- |
| `client/src/**` (components, App, CSS, utils) | Cursor |
| `client/index.html`, `client/public/**` | Cursor |
| `client/src/content/**` (legal and site texts) | Claude writes, Cursor renders |
| `server/**` | Claude |
| Root `package.json`, `.env.example`, deploy files, `README.md` | Claude |
| `docs/agents/**` | Claude (Cursor appends to `status.md` and answers in briefs) |

Rules:
- Nobody edits a file the other side owns. If you need a change there, write it in the brief under `## Questions`.
- Claude does not commit. The user (or Cursor, when the user asks) commits.
- Claude does not run `vite build` while Cursor is working on the client.
- API contract changes are written in the brief before either side relies on them.
