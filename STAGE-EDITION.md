# Ashbound — Stage Edition 0.9.0

## What changed
- Full-body 2D fighters stand directly in the arena. All ten selectable characters and summoned Tourgen have transparent artwork.
- Tomamaru, Blade, Gin and Hannibal use the supplied full-body designs as references. The remaining fighters extend the existing portraits.
- Soul Society uses a new crimson-eclipse temple courtyard inspired by the reference. Las Noches and the Living World keep their existing artwork and bonuses. Arena selection is still random.
- Compact health/energy panels, a bottom command bar with technique symbols, and persistent readable move descriptions.
- Breathing motion, active-character glow, target highlighting and subdued defeat states. Reduced-motion preferences disable breathing.
- No Dan–Tourgen connection line. Temporary attack layers are removed after 1.8 seconds; recent ground marks age out.
- Room & settings returns to the surrounding page; Fullscreen is optional. Small screens use two separated team rows and horizontally scrollable techniques.

## What this version is
This is a playable 2D illustrated stage, not a 3D renderer. Fighters use front/three-quarter standing artwork, not separate rear-facing or frame-by-frame attack animations. Existing attack effects and Bankai cinematics remain. Bankai changes the HUD/cinematic portrait and strengthens the stage aura; dedicated full-body Bankai outfits are not included in this art pass.

No character stats, damage values, turn rules, online protocol or arena bonuses were changed.

## Install the complete project
1. Stop the previous server and Vite terminals with Ctrl+C.
2. Extract this ZIP into a new folder; open a terminal in the folder containing package.json.
3. Run `npm ci`, then `npm run build`.
4. Run `npm run server`. In a second terminal run `npm run dev`.
5. Both players refresh and start a new room. Use your existing network/server setup for remote access.

Do not copy only the CSS: this edition includes new components, image references, and public assets.

## Artwork
Generated with the built-in image tool. Generation briefs and roster prompt is in `STAGE-ART-PROMPTS.json`. Assets are under `public/fighters/` and `public/stage/`. Existing portraits and audio are preserved.
