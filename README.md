# LaunchOps product application

This directory contains the Next.js application under development. The existing `../dist` directory remains the currently configured static landing page. Do not point production hosting at this app until the release gates in `../IMPLEMENTATION_STATUS.md` pass.

## Local setup

1. Install Node.js 24 or a supported Node.js release and run `npm ci`.
2. The public Firebase web app configuration is in `firebase-web-config.json` and uses `smoke-529c6`. Optional `.env.local` overrides apply only when `NEXT_PUBLIC_FIREBASE_PROJECT_ID` matches that project, so old test-project settings cannot change the app identity.
3. Enable Google sign-in and Cloud Firestore in a **development** Firebase project. Add the local and preview domains to the Firebase authorized domains.
4. Deploy `firestore.rules` to that development project before creating user data. Keep preview and production Firebase projects separate.
5. Run `npm run dev`, then open `/` (Korean landing page) or `/en`.

### Windows PowerShell

From the workspace root, start the app in the `product` directory:

```powershell
Set-Location .\launchops-site\product
npm run dev
```

The app starts from `product`, where `package.json` lives; there is no need to enter a route folder first.

To open the route source directory in PowerShell, use a literal path because `[locale]` is treated as a wildcard pattern by ordinary path commands:

```powershell
Set-Location -LiteralPath '.\src\app\[locale]'
Get-ChildItem
```

The route file is named `page.tsx`. Next.js uses `[locale]` for the `/ko` and `/en` URL segment.

The landing page includes a sample-data simulation. Its **Try it** action opens `/experience/login.html`, where Google sign-in creates or opens a Firebase account. `/experience/projects.html` opens the browser-local demo without signing in. The signed-in workspace stores projects, experiment plans and manually entered metrics, validation settings, outlet selections, release drafts, and distribution records in `users/{uid}` in Firestore. The browser-local demo and signed-in data are separate.

`predev`, `prebuild`, and `build:preview` generate the ignored `public/experience/js/firebase-config.js` from `firebase-web-config.json`. Matching `NEXT_PUBLIC_FIREBASE_*` values can override it. The local `.env.local` is ignored by Git. Deploy `firestore.rules` to the configured Firebase project before relying on signed-in writes. Google sign-in also requires the app domain in Firebase Authentication's authorized domains.

The Meta, YouTube, and Reddit integration page accurately shows disconnected services. Experiment metrics are entered manually. The release page can open a mail draft and record outcomes, but cannot verify delivery or send automatically.

## Commands

- `npm run dev`: local app
- `npm run lint`: ESLint
- `npm test`: domain and demo history tests
- `npm run test:browser`: desktop/mobile browser workflows in a separate headless Chrome profile (start the dev server first; installed Google Chrome is required). Signed-in persistence tests use isolated fixtures and do not write cloud data.
- `npm run build`: production build
- `npm run build:preview`: export the public demo under `../dist/preview` for the existing private Sites project
- `py -m unittest discover -s worker -p 'test_*.py'`: ZIP scanner and runtime detection checks

## Current routes

- `/ko`, `/en`: localized product introduction
- `/ko/workspace`, `/en/workspace`: interactive sample validation decision
- `/ko/experiments`, `/en/experiments`: deterministic mock campaign and channel comparison
- `/ko/intake`, `/en/intake`: browser-only ZIP name, size, and header preflight; no upload or execution
- `/ko/projects`, `/en/projects`: entry points to the unified `/experience/projects.html` workspace; legacy top-level project records are retained, not automatically migrated
- `/`: Korean solution landing page with an interactive sample-data simulation
- `/experience/login.html`: Google login or account creation, with a guest demo option
- `/experience/*.html`: complete account-scoped workflow based on the `test` reference

The static preview routes are prefixed with `/preview` (for example, `/preview/ko/experiments/`). The exported experience contains public Firebase web configuration when it is set for the build. Authentication and persistence still require authorized domains and deployed Firestore rules.

Mock experiment history stores at most 10 runs in the current browser's local storage. Reopening a run recalculates the result with the current demo rule version; older versions are discarded. These records are sample data and are not a server-side audit trail or live evidence.

`src/lib/pr-release.ts` contains domain checks for verified evidence and approval. These checks must also run after server-side authentication and role verification when a real delivery endpoint is added.

Firebase login and database access require a real development Firebase project for end-to-end verification. Do not use production credentials in the demo or sandbox.

`worker/archive_scan.py` is a prototype for the future isolated worker. It must never process untrusted uploads inside the Next.js web process.
`worker/product_detect.py` reads a ZIP after archive inspection to suggest static or Node runtime settings. These suggestions do not run package scripts; all extraction and execution still require the isolated worker architecture in `../docs/11-product-sandbox-preview.md`.

`src/lib/preview-run.ts` defines guarded preview-job transitions and idempotency before the storage, queue, and isolated worker adapters are connected. It is not an API endpoint; a real endpoint must repeat role checks and use an atomic data transaction.
`src/lib/artifact-intake.ts` checks upload reservations and trusted storage metadata. The browser does not receive upload credentials until an authenticated server adapter and private store are configured.
