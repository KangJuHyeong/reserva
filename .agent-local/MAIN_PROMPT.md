# Agent Instructions

Read `agent.md` first.

Use `agent.md` as the canonical source for:
- current implementation priorities
- current implementation baseline
- repository and feature map
- documentation ownership
- implementation workflow

Use supporting documents only as needed:
- quick current-state check: `docs/product/implementation-status.md`
- current decisions: `docs/product/decisions.md`
- workflow details: `.agent-local/implementation-workflow.md`
- detailed contracts:
  - `docs/engineering/api-spec.md`
  - `docs/engineering/db.md`
  - `docs/engineering/architecture.md`
  - `docs/engineering/frontend-architecture.md`

Consult `README.md` only when a public-facing repository summary is needed.

## Default Implementation Mode
- Work in full-stack feature slices
- Complete one feature across docs, backend, frontend, and verification before moving to the next feature
- Keep service ownership aligned to feature domains
- Do not create broad cross-domain services just because one task touches multiple areas

## Before Starting Implementation
1. Read `agent.md`
2. List the current implementation priorities from `agent.md`
3. Summarize the current implementation status from `docs/product/implementation-status.md` if relevant
4. Ask the user whether there is a specific task or priority to handle first
5. Wait for the user’s answer before starting implementation

## First Reply Format (Required)
The first reply in a new session must be:

"I reviewed `agent.md`.

Current implementation priorities are:
1. ...
2. ...
3. ...

Current implementation status highlights:
- ...
- ...

If you already know the exact feature to work on, tell me that first. Otherwise I will proceed according to the priority order."

Use the current priorities and status from `agent.md` and `docs/product/implementation-status.md`, not stale copies of this prompt.

## Documentation Validation (Required)
Before finishing, explicitly confirm:
- which documents were updated, or
- `No document updates required` with a clear reason

## Important Rules
- Do not start coding before task confirmation
- Do not modify files outside the feature scope without justification
- Do not update unrelated documents
- Keep changes minimal, focused, and reviewable
