# Ashbound 0.15 — roster signature animations

This complete project extends the Dan proof of concept with 160 new drawn poses across ten character atlases. There are 18 new sequences: base and Bankai for Afrodi, Blade, Drake, Gin, Kami, Kidou, Lane and Tomamaru; a single sequence each for Hannibal and Tourgen. Dan's existing armored Bankai sequence remains intact.

## Run

1. Extract the ZIP into a new folder.
2. `npm ci`
3. `npm run server` in one terminal (stop any older server on port 3001 first).
4. `npm run dev` in another terminal.
5. Open the displayed address. Append `/?preview=attacks` for the isolated animation review screen.

The review screen can replay every character, switch base/Bankai, reverse the player's view, and simulate phase or a final blow. Normal matches retain roster selection, all abilities, online play, awakening audio and theme music behavior.

## What changed

| Character | Signature performance |
|---|---|
| Afrodi | Black-magic sword windup, forward strike and recovery |
| Blade | Katana preparation, teleport strike and return |
| Drake | Destruction gathering and extended-hand release |
| Gin | Energy concentration, release and recovery |
| Hannibal | Kinetic windup, advancing punch and follow-through |
| Kami | Explosive palm preparation and blast |
| Kidou | White-magic katana draw and dimensional slash |
| Lane | Grounded channel, earth-power release and recovery |
| Tomamaru | Base bladed-hat strike; Bankai thunder command |
| Tourgen | Armored black-flame sword strike |

Character motion uses successive illustrated body poses; canvas renders the atlas while a reusable timeline handles movement. The existing React UI and battle reducer remain in place. No new rendering dependency was required. These sequences are attached to the full-energy signature move, not every basic attack or copied skill. Dan's base/separated attacks retain their previous presentation.

## Synchronization and cleanup

The reducer resolves gameplay exactly once. Both clients receive the same pre-impact snapshot and cinematic deadline. Visible HP and status changes switch at 1,370 ms; the sequence ends at 3,200 ms. Victory waits until the performance completes. Stale commands remain rejected. Timelines use absolute time so resuming a tab or reconnecting does not replay damage. RAF callbacks, observers, image visibility and transient target reactions are cleaned up on completion/unmount. Failed image loading leaves the original character visible and does not alter battle results.

Motion OFF and system reduced-motion settings suppress camera shake and travel and display only three held poses. Canvas resolution is capped at 1.5 device pixel ratio.

## Quality scope

These are sprite-animation prototypes with eight drawn poses per form (sixteen for Hannibal, Tourgen and the existing Dan sequence), not skeletal rigs or high-frame-count studio animation. Enemy reactions are still animated recoil of their existing artwork; dedicated enemy hurt frames are a future asset task. Generated frames can vary in proportions and fine costume details. Evaluate the review screen before commissioning smoother in-between frames or expanding to all ordinary techniques.

## Verification

Production build, ESLint, reducer/presentation tests and two-client server tests cover these changes. Browser review exercises all 19 sequences, animation cleanup, phased targets, delayed victory and reversed mobile presentation. Detailed status is reported with the delivered ZIP.
