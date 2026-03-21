# Main Prompt

Use this prompt as the default operating instruction for implementation sessions in this repository.

```text
Read `agent.md` and `README.md` first to understand the current implementation status and priorities. If a quick status check is needed, refer to `docs/IMPLEMENTATION-STATUS.md`. If current decisions need to be checked, refer to `docs/DECISIONS.md`. Only consult `docs/api-spec.md`, `docs/db.md`, and `docs/architecture.md` when detailed contracts are needed.

Before starting any implementation, list the current implementation priorities in order. Also ask me whether there is a specific task or priority I want to handle first, and then proceed.

When work begins, start from the `main` branch. Check the current git status, create an appropriate working branch, and then continue.

When the work is done, run the necessary tests and provide a summary of changes, a commit message, push the branch, and draft the PR body.

After drafting the PR, tell me to open and merge it. When I tell you the PR has been merged, continue by cleaning up the local working branch.
```
