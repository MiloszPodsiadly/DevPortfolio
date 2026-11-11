# Dependency audit runbook

Use the committed lockfile and a clean install when reviewing dependency health:

```powershell
npm ci
npm audit
```

Review each reported advisory against the installed package version, affected usage, upstream fix, and severity. Treat a concrete exploitable vulnerability separately from deprecation notices or generic audit warnings. Do not apply major upgrades automatically; update the dependency and lockfile in a reviewed change, then run the full CI sequence. Dependabot opens bounded update pull requests, but those changes still require review.
