# Render Blueprint Setup

This repository is ready for Render Blueprint deployment. The Render CLI is
installed, but `api.render.com` may be blocked on this network, so the
dashboard flow below is the supported path.

## Step 1: Open Blueprint creation

Open the Render Blueprint creation page:

```text
https://dashboard.render.com/blueprints/new
```

## Step 2: Connect the repository

Select the GitHub repository:

```text
piprot/quanbian-zhilu
```

Render reads `render.yaml` and creates:

- Web Service `adaptive-ascent-server`
- PostgreSQL `adaptive-ascent-db`
- Generated `JWT_SECRET`

## Step 3: Start the first deploy

Confirm these environment values on the web service:

- `DATABASE_URL` is linked from `adaptive-ascent-db`
- `DATABASE_SSL=true`
- `JWT_SECRET` is generated

Then start or wait for the first deploy.

## Step 4: Copy the deploy hook

Open the web service, then Deploy Hooks. Copy the deploy hook URL.

## Step 5: Set the GitHub secret

Run this from the repo root after replacing the URL:

```powershell
gh secret set RENDER_DEPLOY_HOOK_URL --repo piprot/quanbian-zhilu --body "<hook-url>"
```

## Step 6: Verify the service

Expected health response:

```powershell
curl.exe -k -sS "https://adaptive-ascent-server.onrender.com/"
```

Full public acceptance:

```bash
npm run test:live
npm run test:rtc:public
```

## Current status

The service is not created yet: the public URL returns 404 `no-server`.
