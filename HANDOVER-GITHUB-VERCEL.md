# Handover: GitHub + Vercel access (DevRev)

## GitHub

| Field | Value |
|-------|--------|
| Repo | `findandreplacetwotimes/DevRev` |
| HTTPS | https://github.com/findandreplacetwotimes/DevRev |
| SSH remote | `git@github.com:findandreplacetwotimes/DevRev.git` |
| Default branch | `main` |
| Local account (gh) | `findandreplacetwotimes` |
| Permission | ADMIN |

### Auth

```bash
gh auth login
gh auth status
```

### Clone / remotes

```bash
git clone git@github.com:findandreplacetwotimes/DevRev.git
git remote -v
# origin → git@github.com:findandreplacetwotimes/DevRev.git
```

### Branches / worktrees

| Track | Branch | Worktree |
|-------|--------|----------|
| Production | `main` | `/Users/timcherny/DevRev` |
| conv-nav | `conv-nav` | `/Users/timcherny/DevRev-conv-nav` |
| tab-nav | `tab-nav` | `/Users/timcherny/DevRev-tab-nav` |
| computer | `computer` | `/Users/timcherny/DevRev-computer` |

```bash
git push -u origin HEAD
gh pr create --base main --head computer --title "..." --body "..."
```

### After deploy (git)

- Main deploy → push `main`
- `deploy:conv-nav` → push `conv-nav` only
- `deploy:tab-nav` → push `tab-nav` only
- `deploy:computer` → push `computer` only

---

## Vercel

| Field | Value |
|-------|--------|
| Team slug (`--scope`) | `tim-8121s-projects` |
| Org / team ID | `team_BXcGkLrDYnRRmIm0Km1R7UYS` |
| Dashboard | https://vercel.com/tim-8121s-projects |

### Auth

```bash
npx vercel login
npx vercel whoami
```

Optional token (https://vercel.com/account/tokens):

```bash
export VERCEL_TOKEN="YOUR_TOKEN"
npx vercel whoami --token "$VERCEL_TOKEN"
```

### Projects

| App | Project name | Project ID | Production URL |
|-----|--------------|------------|----------------|
| Main | `dev-rev-app` | `prj_j6VdXtz8tghVn056SHXDaLzEO0Hj` | https://dev-rev-app.vercel.app |
| conv-nav | `dev-rev-conv-nav` | `prj_qFbgEuzhDRliFSNgze1usVIzH4LF` | https://dev-rev-conv-nav.vercel.app |
| tab-nav | `dev-rev-tab-nav` | `prj_775psuMgM8IaI8vx7yl3RJjX8ZVe` | https://dev-rev-tab-nav.vercel.app |
| computer | `dev-rev-computer` | `prj_IsVCAAKaNwv6lr7CM1lYd3qOXvf4` | https://dev-rev-computer.vercel.app |
| Storybook | (components) | `prj_6OuZHRn0rtSVjn8Ztp4rpwz3WC2z` | Storybook deploy |

`.vercel/project.json` (computer worktree):

```json
{
  "projectId": "prj_IsVCAAKaNwv6lr7CM1lYd3qOXvf4",
  "orgId": "team_BXcGkLrDYnRRmIm0Km1R7UYS",
  "projectName": "dev-rev-computer"
}
```

### Deploy

```bash
# main — /Users/timcherny/DevRev
npm run deploy

# conv-nav — /Users/timcherny/DevRev-conv-nav
npm run deploy:conv-nav

# tab-nav — /Users/timcherny/DevRev-tab-nav
npm run deploy:tab-nav

# computer — /Users/timcherny/DevRev-computer
npm run deploy:computer

# Storybook
npm run deploy:storybook
```

Under the hood (computer):

```bash
npm run build \
  && vercel link --yes --scope tim-8121s-projects --project prj_IsVCAAKaNwv6lr7CM1lYd3qOXvf4 \
  && vercel deploy --prod -y -A vercel.app.json
```

`vercel.app.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
}
```

### Branch → Vercel → push

| Branch | Deploy | URL | Push after |
|--------|--------|-----|------------|
| `main` | `npm run deploy` | https://dev-rev-app.vercel.app | `git push origin main` |
| `conv-nav` | `npm run deploy:conv-nav` | https://dev-rev-conv-nav.vercel.app | `git push origin conv-nav` |
| `tab-nav` | `npm run deploy:tab-nav` | https://dev-rev-tab-nav.vercel.app | `git push origin tab-nav` |
| `computer` | `npm run deploy:computer` | https://dev-rev-computer.vercel.app | `git push origin computer` |

### Env vars (Vercel + local `.env.local`)

```
VITE_OPENAI_API_KEY=...
VITE_AI_BASE_URL=https://api.openai.com/v1
VITE_AI_MODEL=gpt-4o-mini
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

---

## Quick start on a new machine

```bash
gh auth login
git clone git@github.com:findandreplacetwotimes/DevRev.git
cd DevRev
npm install

npx vercel login
npx vercel link --yes --scope tim-8121s-projects --project prj_j6VdXtz8tghVn056SHXDaLzEO0Hj

git worktree add ../DevRev-computer computer
cd ../DevRev-computer && npm install
npm run deploy:computer
git push -u origin computer
```
