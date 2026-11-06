# Ashbound — Bankai Edition (0.11.1)

This complete project continues the Rear View Edition (0.10.0).

## Install

Extract into a new folder. Stop the old dev server and game server with Ctrl+C in their terminals to free ports 5173 and 3001. From the folder containing package.json:

```powershell
npm ci
npm run build
npm run server
```

Keep that terminal open. In a second terminal in the same folder:

```powershell
npm run dev
```

Open the address Vite prints. Both players should use this updated version.

## Bankai artwork

Nine characters have new transparent full-body Bankai illustrations in both front and rear views: Dan, Afrodi, Blade, Drake, Gin, Kami, Kidou, Lane and Tomamaru. Awakening reveals the full-body form, and the battlefield keeps that form after the cinematic and reconnects. The near team uses rear views; the far team uses front views.

Hannibal still has Five Eyes rather than Bankai. Tourgen retains his separate armored artwork. When Dan separates from Tourgen, Dan returns to his unarmored visual; his existing gameplay powers remain unchanged. These are illustrated 2D sprites, not rigged 3D models.

## Game controls

- Effects ON/OFF: shared between lobby and battlefield, with a saved preference.
- Sound ON/OFF: one click mutes or enables audio. Mute always works, including after playback errors.
- Fullscreen: enters/exits browser fullscreen; its state follows browser fullscreen events.
- Settings: separate music, announcement and attack-sound preferences, volume, visual effects, fullscreen, local camera and room controls.
- Escape closes settings and restores keyboard focus. Audio retry has its own button, separate from mute.

Browser audio requires an initial click. Unsupported fullscreen displays a message while the battlefield continues to fill the available window.

The ability controls, combat rules, character stats, online protocol and balance are unchanged.

## Validation

Production build, ESLint and 53 automated tests pass. Tests cover both sprite orientations and Dan's separated-form exception alongside existing engine and online integration coverage. Browser checks cover settings, fullscreen, camera switching, Bankai presentation and narrow-screen overflow.

## Sprite sizing fix

Battlefield sprites now scale by their height, preserving their original aspect ratio. Wide rear-view and Bankai canvases no longer shrink the character to fit a card width. Feet stay on the same baseline; reflections use the same sizing. This applies to both teams and mobile layouts.
