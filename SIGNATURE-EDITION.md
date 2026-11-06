# Ashbound — Signature Edition (0.12.0)

Continues the sprite size fix. Includes all artwork, audio, source and server files.

## Run

Stop the old server and Vite terminals with Ctrl+C. Extract this ZIP into a new folder, then from the folder containing package.json:

```powershell
npm ci
npm run build
npm run server
```

In a second terminal in that folder, run `npm run dev`. Both online players should use the updated version; the server must also be updated for signature moves.

## Kidou

Click Arsenal of Echoes to open a scrollable, keyboard-accessible chooser. Click a technique to equip it. The current technique is marked Equipped. Escape closes the panel. The old dropdown below the action bar is removed. Copying remains free and preserves the shared cooldown.

## Full-energy signatures

Every roster character has one additional signature alongside their three core moves. Tourgen shares Dan's signature strength. Signatures require 5/5 energy and spend all five, consume a turn, and have four own turns of recovery. They work before Bankai and become stronger afterward. Hannibal has no Bankai; his signature instead scales with open eyes.

| Character | Signature effect |
| --- | --- |
| Dan / Tourgen | Black-flame strike plus two turns of burn |
| Afrodi | Piercing black dimensional cut |
| Blade | Portal strike; Bankai can imprison a survivor |
| Drake | Piercing destruction blast |
| Gin | Damage and energy drain into Reserve |
| Hannibal | Kinetic strike, stronger with each open eye |
| Kami | Concentrated explosive damage |
| Kidou | Piercing white dimensional cut and speed boost |
| Lane | Core-energy strike and personal barrier |
| Tomamaru | Thunder strike; Static/Bankai enables charge interruption |

Damage previews use the combat engine. Phase, evasion and other defensive rules still apply. Numbers are an initial tuning pass for playtesting, not a claim of final competitive balance.

## Cinematics

Accepted signature attacks trigger a 3.2-second illustrated sequence with the caster, target, technique name, result and themed effects. Both online players share a server-controlled pause. Escape or Skip visuals closes the presentation without shortening the shared pause. Reconnecting does not replay an old attack. Effects Off and reduced-motion settings show a still presentation. Existing Bankai awakening music remains unchanged.

## Validation

Build and lint pass. 65 tests cover existing combat, online play, signature energy/cooldown/defense/forecast behavior and shared cinematic deadlines across reconnects. Browser checks cover the chooser, equip action, Escape/focus restoration, signature targeting, cinematic playback and the mobile chooser.
