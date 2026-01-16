Migration Plan: Move existing files into polyrepo layout

Overview
--------
This plan detects likely frontend and backend targets and provides a safe, reversible `git mv` script to move files into the new structure for review.

Proposed moves (preview)
- App.tsx -> apps/web-client/App.tsx
- App.test.tsx -> apps/web-client/App.test.tsx
- index.tsx -> apps/web-client/index.tsx
- index.html -> apps/web-client/index.html
- index.css -> apps/web-client/index.css
- public/ -> apps/web-client/public/
- components/ -> apps/web-client/components/
- hooks/ -> apps/web-client/hooks/
- backend/ -> services/school-service/legacy-backend/
- database/ -> services/school-service/database/

How to use
----------
1. Create a review branch and run `scripts/migrate-to-polyrepo.sh --dry-run` to preview changes.
2. If preview looks good, run `scripts/migrate-to-polyrepo.sh` to perform `git mv` and commit.
3. Open a PR from the migration branch, review, then merge.

Notes
-----
- This script does not modify package.json or CI files. After the move you'll need to update any relative import paths and CI workflows.
- If you prefer automated import rewrites, run `npx ts-migrate` or use codemods after the move.

Rollback
--------
If you need to revert, run `git reset --hard HEAD~1` on the branch (or use traditional revert process).

Contact: owner for approval before merging to `main`.
