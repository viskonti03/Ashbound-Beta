# Ashbound: publish to the existing GitHub / Vercel / Render deployment

This project contains the Vite frontend and Node/Socket.IO backend under one root `package.json`.
**Do not upload this ZIP itself as a file in the GitHub repo.** Unzip it and commit its files.

## Publish safely on a feature branch

1. Back up your live version.
2. Clone the **existing** GitHub repository to a new directory and create a branch.
3. Copy all files located next to this `package.json` into the cloned repository root.
   Omit `.git`, `node_modules`, `dist`, local `.env` files, and temporary files.
4. Review `git status` and `git diff`. Remove stale files from the old version only if you
   have checked that the new version deliberately replaced them.
5. Run `npm ci`, `npm run build`, `npm test`.
6. Push the new branch and create a PR into `main` after validation.

PowerShell example (adjust the source directory to where you unzipped this project):

```powershell
cd C:\Users\luka.eradze\Projects
git clone https://github.com/viskonti03/ashbound.git ashbound-publish
cd ashbound-publish
git switch -c publish-new-animations

$from = "C:\Users\luka.eradze\Projects\ashbound-roster-animations\ashbound-roster"
robocopy $from . /E /XD .git node_modules dist build .vercel /XF .env .env.local *.log
# Robocopy status 0-7 indicates success, >=8 is an error.

git status --short
npm ci
npm run build
npm test

git add -A
git diff --cached --stat
git commit -m "Upgrade Ashbound animations and multiplayer deployment"
git push -u origin publish-new-animations
```

Open a GitHub Pull Request from `publish-new-animations` to `main` and merge only
when the hosting variables are configured and preview testing passes.

## Vercel frontend configuration

- Framework preset: Vite
- Root Directory: the root with `package.json`.
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_SERVER_URL=https://YOUR-RENDER-SERVICE.onrender.com`
- Replace the sample URL with your **actual HTTPS** Render service URL, no trailing slash.
- Redeploy after adding the variable; Vite embeds its value at build time.

## Render backend configuration

- Node Web Service, root at `package.json`.
- Build Command: `npm ci`
- Start Command: `npm run server`
- Environment Variable: `CLIENT_ORIGINS=https://YOUR-APP.vercel.app`
- Use the real Vercel domain; add other exact origins separated by commas if needed.
- Render automatically supplies `PORT`; the server binds `0.0.0.0`.
- `/` responds with a simple health message.

## Smoke test before switching live

1. Open the deployed frontend on two devices and enter Online rooms.
2. Create a room, join, select three fighters each, and begin the battle.
3. Use special attack animations, Bankai transformations and voice tracks.
4. Check that WebSocket/reconnection and rematches work across devices.
5. In browser DevTools → Network, confirm `/socket.io` connects to **Render**, not Vercel.

Both frontend and backend need compatible versions. Deploying the Render server will
restart its process and may drop in-progress rooms, which are stored in memory.
If the existing GitHub repository contains custom configuration files (e.g. Vercel
rewrites), inspect them before merging rather than deleting them blindly.
