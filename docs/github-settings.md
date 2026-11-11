# GitHub repository settings checklist

These controls are owner-run GitHub settings. A workflow file alone does not enforce branch protection, and no GitHub dashboard configuration has been verified.

1. Ensure the repository has a `main` branch and that the first successful workflow run registers the required status check.
2. Protect `main` and require changes to arrive through pull requests.
3. Require the uniquely named status check `portfolio-ci` after it has run successfully at least once.
4. Block force pushes and branch deletion.
5. Require review where available, dismiss stale approvals after new commits, and avoid routine administrator bypass where the account permits it.
6. Confirm Cloudflare production deploys only from protected `main`.

The current local repository has no commits yet, so there is no registered remote check and no branch protection status to report.
