# Cloudflare Pages setup checklist

This project is prepared for a static Cloudflare Pages deployment. No account configuration or deployment has been performed by this repository change.

## Owner setup

1. Create or connect a Cloudflare Pages project to the intended GitHub repository.
2. Select `main` as the production branch after the repository's main branch exists and is protected.
3. Set build command to `npm run build` and output directory to `dist`.
4. Confirm build logs use Node.js `26.13.0` from `.node-version`. Set `NODE_VERSION=26.13.0` only if Pages does not honor that file.
5. Choose which branches receive preview deployments. Review preview URLs for unintended content before sharing them; do not add secrets to this static site.
6. Keep production deployments limited to protected `main` after required CI checks pass.
7. After a preview deployment exists, verify in a browser and with HTTP requests:
   - `/` responds with a 302 redirect to `/en/`;
   - `/en/` and `/pl/` load directly and after refresh;
   - a nonexistent path returns HTTP 404, not a 200 SPA fallback;
   - all hashed assets load without errors;
   - the build output contains no runtime server or unexpected files.
8. Record the actual preview URL and, later, production URL only after Cloudflare provides them.

`public/_redirects` contains `/ /en/ 302`. The build also emits a top-level `404.html`. Local output checks verify those files and their contents; only a hosted Pages preview can verify Cloudflare's HTTP behavior. Root redirect and hosted 404 status are **PENDING MANUAL VERIFICATION**.

## Cost and scope assumptions

The plan targets Cloudflare Pages Free and a fully static `dist/` deployment. No paid domain, Functions, Workers, analytics, storage, or backend is configured here. Product limits and prices can change; check the current Cloudflare account and plan before launch.
