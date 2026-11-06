# Ashbound 0.14 — Dan's animated katana strike

Complete project update based on Voice Edition 0.13. Blade's new recording is included unchanged, without the previous mixing/cuts.

## Install and replay

Extract into a fresh folder. Run `npm ci` and `npm run build`. Stop the previous dev server and game server. Start `npm run server` and `npm run dev` in separate terminals. Refresh both online players.

Open the Vite URL with `/?preview=dan-strike` appended, usually:
http://localhost:5173/?preview=dan-strike

Click Replay attack. Switch Player 1/Player 2, choose a target, test Phase or Final blow, and try Motion OFF. Enable sound for preparation and impact sounds. This is an isolated animation review, not a new gameplay arena. Return to game opens the usual lobby.

In a real match: activate Dan's Bankai, stay armored (do not separate Tourgen), reach 5 energy, and use Black Sun: Shogun’s Judgment. Damage, burn, cost, cooldown and target rules remain unchanged. Base/separated Dan, Tourgen and other characters retain their existing effects.

## Rendering choice

The existing React battlefield uses single full-body PNGs and CSS effects, not rigs or animation poses. Moving those images with GSAP or rendering them with PixiJS would not create actual arm/leg movement.

This proof uses Canvas 2D, a 16-pose illustrated sprite sheet and a single cancellable requestAnimationFrame timeline. React retains the battlefield, interface and gameplay. Native Web Animations provide brief enemy recoil and camera shake. No new runtime dependencies.

PixiJS is a sensible later migration for many simultaneous sprite atlases or GPU effects; GSAP can help with complex camera authoring. The immediate quality improvement comes from real pose artwork. The absolute-time timeline could drive either renderer later.

## Choreography

0–730ms: stance change, knee bend, sword wind-up.
730–1160ms: dash toward the selected opponent with trailing cloak.
1160–1610ms: diagonal slash with black flame drawn along the blade.
1370ms: display authoritative HP/barrier/burn changes, impact sound and target reaction.
1610–2060ms: follow-through.
2060–2760ms: return to original position.
2760–3200ms: settle into the existing idle artwork.

The server resolves each move once. Accepted Dan attacks carry a bounded pre-impact display snapshot. Both clients display that snapshot until impact, then the actual result. No animation callback deals damage. A final blow waits until the recovery ends before the victory layout appears. Blocked attacks show a blocked response, not false damage.

The shared cinematic deadline locks player input and automatic companion turns. Reconnecting clients use remaining time rather than replaying from the beginning. Small network-transit differences remain; this is not frame-perfect lockstep. Timers, observers, frame loops, CSS hiding and native animations are cleaned up on completion/unmount. Missing artwork cannot block gameplay. Reduced motion/Effects OFF disables travel and camera shake. Canvas pixel ratio is capped at 1.5.

## Art and limitations

public/animations/dan/bankai-slash.png contains 16 distinct illustrated poses in a 4×4 grid, generated from public/fighters/bankai/dan.png. Body, arms, legs, sword and cloak change position. It is a keyframe proof of concept, not a finished commercial fighting-game animation or a skeleton rig. Fine armor and blade contours vary between generated frames. Enemies currently recoil using their existing full-body image; bespoke hurt poses are not part of this Dan-only pass.

For production polish, clean the contours and add in-betweens. Deliver transparent 512×512 frames with fixed feet anchor (256,492), consistent scale and fully visible sword tips. Target 24–32 total frames at 24fps:

- 3 idle/transition frames.
- 4 anticipation frames: crouch, hip coil, two-handed overhead wind-up.
- 4 launch/dash frames: push-off, rear leg extending, cloak trailing.
- 6–8 strike frames: plant foot, rotate hips/shoulders, extend arms, continuous diagonal sword arc.
- 3–4 contact/follow-through frames: blade low, weight forward, cape overtaking torso.
- 4–6 recovery frames: backward step/dash, guard, return to idle.

For base/separated Dan, create a separate axe sheet matching that outfit and weapon. Other characters need their own action sheets or separated body/weapon/clothing layers and authored rigs. Enemy hurt sets should include brace, impact, stagger, recover and defeat.

## Main files

src/game/combatAnimation.ts — timing and display projection.
src/game/engine.ts and types.ts — presentation metadata only.
src/animation/CombatSpriteLayer.tsx — pose rendering, travel and reactions.
src/animation/assets.ts — cached sheet preload.
src/animation/useCombatPresentation.ts — HP/status/victory timing.
src/animation/DanAttackPreview.tsx — isolated replay page.
src/CombatAnimation.css — overlay, idle replacement, review controls.

Blade's exact replacement is public/audio/voices/blade-v2.mp3. The distinct URL prevents caching the old mix. Its cinematic lasts 19.792 seconds. English Eternal Vow dialogue and theme restarting after every awakening remain intact.
