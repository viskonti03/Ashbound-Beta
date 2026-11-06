# Ashbound 0.8.1 — Battlefield fixes

Battles fill the browser viewport by default, with larger portraits and the arena behind the whole interface. Room & settings returns to the normal page. Fullscreen optionally hides browser chrome. Very short landscape screens can scroll inside the battle.

Temporary attack effects are removed after 1.8 seconds. Hover and reconnect do not replay old effects. Recent battlefield residue is smaller, fainter and expires. The Dan–Tourgen connection line is removed.

Technique descriptions and target previews use stable spaces to prevent hover layout jumps. Hover state resets with the acting character and battle revision.

No combat stats or ability mechanics were changed.

## Install
Stop the old game and server terminals. Extract this complete project into a new folder, run `npm ci` and `npm run build`, then run `npm run server` and `npm run dev` in separate terminals. Both players should refresh and start a new room.
