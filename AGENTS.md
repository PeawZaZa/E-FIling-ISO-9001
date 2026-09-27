# E-Filing ISO 9001

## Start here

1. Read `PROJECT_STATE.md`.
2. Read only the documents relevant to the current task.

Do not scan the whole repository automatically.

If `PROJECT_STATE.md` appears outdated or conflicts with the code,
verify only the affected files. Do not rescan the entire repository.

## Sources

- Current project state → `PROJECT_STATE.md`
- Project/file overview → `PROJECT_SUMMARY.md`
- Requirements → `SRS_v1.md`
- Architecture → `GroupB_Architecture_Decisions.md`
- Tool-specific notes → `docs/TOOL_NOTES.md`
- Report formatting → `docs/REPORT_RULES.md`
- Report rules → `docs/REPORT_RULES.md`

If something doesn't exist, scan related files if needed.

Use `PROJECT_SUMMARY.md` for navigation, not as guaranteed current state.
Prefer `PROJECT_STATE.md` and the relevant source files for current behavior.

## Requirements

`SRS_v1.md` is generated.
Do not edit it directly.

Before changing requirements, check the merge scripts
and the current instructions in `PROJECT_STATE.md`.

## Working rules

- Read only files needed for the task.
- Prefer targeted search over opening large files.
- Do not read all ISO PDFs automatically.
- Do not read `Archive/` unless historical context is required.
- Do not reread unchanged files within the same task.
- Prefer targeted tests for changed features/files.
- Do not run the full test suite unless necessary or requested.
- Do not perform broad refactors unless requested.
- Do not inspect unrelated modules just to "understand the project."
- Keep progress reports concise.
- Avoid repeating information already available in `PROJECT_STATE.md`.

## Report work

When creating or editing the project/thesis report:

- Read `docs/REPORT_RULES.md` first and `PROJECT_STATE.md` for current state.
- Use `docs/report-examples/` only as writing/structure references; read only
  the example relevant to the chapter being worked on.
- Use `SRS_v1.md` for requirements when relevant, and inspect architecture,
  source, or tests only as needed to verify claims. Do not scan the repository.
- Do not reread the original thesis manual unless `docs/REPORT_RULES.md` is
  incomplete, ambiguous, or requires verification.
- Never invent implementation details, test results, statistics, references,
  requirements, or unresolved business rules.
- Clearly distinguish requirements, design, implementation, testing/results,
  limitations, and TBD decisions.
- If an example conflicts with `docs/REPORT_RULES.md`, follow the rules; if it
  conflicts with verified E-Filing facts, follow the verified project sources.

## Project state updates

After completing a meaningful feature or changing project behavior:

- Update `PROJECT_STATE.md` with the new current state.
- Keep the update concise.
- Do not rewrite the entire file if only one section changed.
- Update `PROJECT_SUMMARY.md` only when the project structure,
  major modules, important files, or overall architecture changes.

Do not update state files for trivial formatting or comment-only changes.

## Testing

- Start with tests directly related to changed files/features.
- Expand testing only when targeted tests reveal integration issues.
- Run the full test suite only when necessary or explicitly requested.
- Do not repeatedly run unchanged passing tests without a reason.

## Safety

- Repository must remain private.
- Do not change locked architectural/business decisions
  without asking the user.
