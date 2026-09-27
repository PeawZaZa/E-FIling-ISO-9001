# ER diagram — E-Filing Phase 1

This maintained Chapter 3 figure set reflects all **38 current Prisma models / PostgreSQL tables**. The editable source for each figure is its `.html` file in this directory; the matching `.svg` and `.png` files are generated exports. The authoritative model inventory, keys, constraints, and historical comparison are in [`Database_Design.md`](../../../../Database_Design.md); the implemented schema is [`prisma/schema.prisma`](../../../../prisma/schema.prisma).

`request_due_status` is a SQL view, not a table. Dashboard summaries are computed from persisted records and have no separate dashboard table.

## Figures

| Figure | Scope | Current models added since ERD v0.1 |
|---|---|---|
| [Master](er_00_master.svg) | All 38 tables; use on screen or at large print size | All five in the lower refinement band |
| [1. Overview](er_01_overview.svg) | Main Record → Finding → Request → Plan trace | Conceptual subset only |
| [2. Shared and settings](er_02_shared_config.svg) | User, role, department, settings, numbering | `document_code_sequence` |
| [3. Documents](er_03_document.svg) | Document, version, file, distribution, acknowledgement | `document_import_source` |
| [4. DAR](er_04_dar.svg) | DAR, target, decision, status and submitted rounds/files | `dar_round`, `dar_file` |
| [5. Records and audit](er_05_record_audit.svg) | Record, evidence, audit round, finding | None |
| [6. Request cycle](er_06_request_cycle.svg) | CAR/NCR request, plan, activity, verification, closure | `activity_record_link` |
| [7. Append-only](er_07_append_only.svg) | Audit event and status histories | None |

The master retains the original structural relationship lines. The five later tables are shown in a labeled refinement band with their FK destinations stated in each card. The domain figures show those tables in more readable detail. The master is too dense for a normal 14.5 cm Chapter 3 insertion; use the seven smaller domain figures there.

`dar_file.dar_id` and `dar_round.dar_id` are enforced FKs to `dar`. `dar_file.round_no` is a logical round association, **not** an FK to `dar_round`: files can be uploaded before a submitted round row exists. `activity_record_link` bridges action plan activities and quality records. `document_code_sequence` is a separate counter from `number_sequence`.

The diagrams are entity-level views. They omit some columns, indexes, checks, and cross-figure lines for legibility. The complete physical details are in `Database_Design.md`, the Prisma schema, and the current migrations. `closure` is a real persisted table, although its current MVP write path is deferred. Settings tables do not imply an approved automatic stage-deadline policy.

## Editing and export

Edit the `.html` source, then regenerate its two exports:

```powershell
python scripts/export_diagram.py "Project report/figures/ch3/er/er_04_dar.html"
```

Check the exported figures visually before placing them in Chapter 3. Use the report's figure dimensions and caption rules in `docs/REPORT_RULES.md`.
