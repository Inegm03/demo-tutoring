# DEPLOY.md — Publish this demo on GitHub (repo + free live site)

Everything is already prepared in this folder:

- ✅ Git repository initialized, all 51 files committed on `main`
- ✅ Remote preconfigured: `https://github.com/Inegm03/demo-tutoring.git`
- ✅ GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds the
  app and deploys it to **GitHub Pages automatically on every push**
- ✅ App configured for Pages subpath hosting (router basename + SPA 404 fallback)

Only two things require your GitHub login, so they are your steps:

## Step 1 — Create the empty repository (≈30 seconds)

1. Open https://github.com/new (sign in as **Inegm03**).
2. Repository name: **demo-tutoring** (must match exactly — the live URL and
   build base path use this name).
3. Public (required for free GitHub Pages) — leave everything else unticked
   (no README, no .gitignore, no license; the repo must stay empty).
4. Click **Create repository**.

## Step 2 — Push (one command)

From this folder (`demo-tutoring`), run:

```bash
git push -u origin main
```

The first time, Git Credential Manager opens a browser window asking you to
sign in to GitHub — approve it once and the push completes. (No tokens to
copy; credentials are stored securely in Windows Credential Manager.)

## Step 3 — Watch it go live (automatic)

- The push triggers the **"Deploy demo to GitHub Pages"** workflow
  (repo → **Actions** tab). It takes ~1–2 minutes.
- The workflow enables GitHub Pages by itself. When it finishes, your demo
  is live at:

  **https://inegm03.github.io/demo-tutoring/**

If the very first run fails with a Pages-permission error (rare), go to
repo → **Settings → Pages → Source: GitHub Actions**, then
**Actions → the failed run → Re-run all jobs**.

## Updating the live site later

Any commit pushed to `main` redeploys automatically:

```bash
git add -A
git commit -m "your change"
git push
```

## If you rename the repo

The live URL and asset paths follow the repo name automatically (the workflow
passes `--base=/<repo-name>/`), but old links will break — nothing else to change.

## Notes

- The site is a static demo: all data stays in each visitor's browser
  (localStorage). Two of **your** tabs sync with each other; two different
  visitors do not share state.
- No secrets are involved anywhere; the workflow uses only the automatic
  `GITHUB_TOKEN`.
