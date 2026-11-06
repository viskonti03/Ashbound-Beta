# Ashbound — Rear-view edition (0.10.0)

Complete project, including server and all artwork. Extract into a new folder; use the folder containing package.json.

1. Stop the previous server and Vite terminals with Ctrl+C.
2. Run npm ci and npm run build.
3. Run npm run server.
4. In a second terminal in this same folder, run npm run dev and open the printed URL.

## Changes
- Eleven rear-view transparent fighter illustrations, including Tourgen.
- Your team faces into the scene from the foreground; opponents face you from farther away.
- Online Player 2 automatically receives their own team's foreground perspective.
- Local battles have a View: Player 1 / Player 2 camera switch. Switching views does not change turns, permissions, health or targeting.
- Compact objective scores flank the centered Arena Heart and round display.
- Shorter bottom command bar, compact health panels and subtle reflected silhouettes.
- Existing attack effects, Bankai cinematics, rules, online rooms and rematches are retained.

The stage uses illustrated 2D cutouts rather than animated 3D models. Bankai still changes portraits and aura using the existing presentation; the new full-body rear artwork depicts base outfits. Separate full-body Bankai outfits are not included in this update.
