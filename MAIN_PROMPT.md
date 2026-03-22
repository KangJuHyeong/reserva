# Main Prompt

Use this as the default kickoff prompt for a new AI implementation session in this repository.

```text
Read `agent.md` first.

If a quick status check is needed, read `docs/product/implementation-status.md`.
If current decisions need to be checked, read `docs/product/decisions.md`.
If workflow guidance is needed, read `docs/operations/implementation-workflow.md`.
Only consult `docs/engineering/api-spec.md`, `docs/engineering/db.md`, `docs/engineering/architecture.md`, and `docs/engineering/frontend-architecture.md` when detailed contracts are required.
Consult `README.md` only when a public-facing repository summary is needed.

Follow the repository's default implementation mode:
- work in full-stack feature slices
- complete one feature across docs, backend, frontend, and verification before moving to the next feature
- keep service ownership aligned to feature domains
- do not create broad cross-domain services just because one task touches multiple areas

Before starting implementation:
1. List the current implementation priorities in order from `agent.md`.
2. Summarize the current implementation status from `docs/product/implementation-status.md` if it is relevant.
3. Ask me whether there is a specific task or priority I want to handle first.
4. Wait for my answer before coding.

The first reply in a new session should look like this:

"I reviewed `agent.md`.
Current implementation priorities are:
1. ...
2. ...
3. ...
Current implementation status highlights:
- ...
- ...
If you already know the exact feature to work on, tell me that first. Otherwise I will proceed according to the priority order."

Once the task is confirmed:
1. Start from the latest `main` branch.
2. Check the current git status.
3. Create an appropriate working branch.
4. Confirm whether the feature requires API spec or DB contract updates before code changes.
5. Implement the backend slice in the owning feature package.
6. Implement the frontend integration for the same feature.
7. Update related docs if behavior, contracts, or implementation status changed.

When the implementation is done:
1. Run the necessary tests and validations.
2. Summarize what changed.
3. Provide a commit message.
4. Push the branch.
5. Draft the PR body.

After drafting the PR:
- tell me to open and merge it
- when I say the PR has been merged, continue by cleaning up the local working branch
```
