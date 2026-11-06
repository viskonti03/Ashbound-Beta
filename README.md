# Dan animation update

Version 0.14 adds an illustrated Bankai katana strike for Dan and replaces Blade's voice recording. See DAN-ANIMATION-REVIEW.md for setup, replay URL, scope and art requirements.

# Ashbound — Stage Edition 0.9.0

See `STAGE-EDITION.md` for the new full-body battlefield and installation steps.

# Ashbound — Cinematic edition

Complete React/TypeScript project: ten original characters, 3v3 selection, practice AI, local two-player battles and private online rooms. Includes all portraits, Tourgen's new portrait, arena illustrations, animation effects and source files.

## Cinematic update

Full-screen staged Bankai reveals, a shared six-second combat pause, a step-based offline lobby, character preview dialogs and compact battle layouts. Wide screens put commands beside the field; phones keep them below it. Tourgen now shares his team’s row. See **CINEMATIC-UPDATE.md** for controls, accessibility and validation.

## Arena Heart mode

**Choose how you win.** Arena Heart adds a contested objective: from round 2, spend a turn to channel a seal. Survive to your next turn to secure it; three seals win. Opponents can interrupt with 24 cumulative HP damage or imprisonment. Defeating the enemy team still wins. Elimination remains selectable.

Includes online host rule selection, both-player readiness reset on rule changes, objective-aware AI, damage previews, clickable channel inspectors, match-point feedback and an objective victory screen. Existing character art, Bankai effects, arenas and music are retained. Read **ARENA-HEART.md** for the rules, strategy and test results.

## Install or update on Windows

1. Stop both old terminals with Ctrl+C. Keep your existing folder as a backup.
2. Extract this complete ZIP into a new folder. Open the folder containing `package.json` in VS Code; there is no extra inner project folder.
3. In that folder run:

```powershell
npm ci
npm run build
```

4. Start the backend in terminal 1:

```powershell
npm run server
```

5. Start the frontend in terminal 2:

```powershell
npm run dev
```

Open `http://localhost:5173`. Practice/local modes only require the frontend. Online requires both terminals. Start a new room after this update so both players use the same updated server. If ports 3001 or 5173 are occupied, stop the old server terminal before restarting.

Use Node.js 22.12+ or 24. Dependencies are unchanged from the previous edition. You can alternatively replace matching files in your existing project with every file in this ZIP, then restart both processes.

This edition continues this conversation’s Living Battlefield update. It adds a battlefield that remembers attacks, persistent character powers, and a documented balance pass. All existing art and the two supplied music tracks are preserved. See BALANCE.md for exact gameplay changes and simulation limits.

## A world that remembers

- Up to four faint recent battlefield marks remain visible from the current and previous round, then disappear.
- Hannibal’s open eyes drain colour from the scenery; health bars, targets and character portraits remain readable. The effect follows his current presence and eyes.
- Battlefield deaths reveal Afrodi’s handprints and Hell gate. His awakened portrait carries reaching hands.
- Lane’s charge brings planetary bodies and converging energy overhead. Cancelling the charge removes the scene.
- Gin’s Reserve strengthens visible energy streams; damaged Gin shows glowing cracks. Bankai characters keep their own aura and motifs after the reveal ends.
- Dan begins with two shadows. After separation, the equally strong Tourgen has his own card, without a connection line.
- Phase, evasion, barriers, absorption and imprisonment have distinct brief reactions. Awakened specials receive a short portrait cut-in. Presentation never blocks a turn or adds hidden damage.
- Reduced motion and Effects off stop the moving layers while retaining static information about the battlefield.

## Battlefield polish

- Wide character cards over animated petals, desert dust or city rain; action controls below the battlefield and a collapsible combat log. Compact view is the default; Full artwork expands portraits.
- Black flames engulf targets, portals open on Blade attacks, Drake tears away a dark target silhouette and Tomamaru chains lightning between actual target cards. Earth and energy effects remain distinct. Original synthesized impacts, rumble and dimensional cuts have an independent sound toggle.
- Subtle portrait breathing, wounded highlights, defeat treatment and existing character auras. Effects off and reduced-motion preferences suppress movement.
- Hover or select an attack to preview immediate damage and added statuses. Area and self-targeted core abilities require confirmation, including Gin’s allocation choices. Forecasts use a cloned battle state and exclude effects from the following turn.
- Click a character to open a status dialog with durations, targeting restrictions and ability availability. Escape closes it or cancels targeting. Forecasts warn about immunity, evasion and retaliation; the action banner explains the latest outcome.
- Shikai/Bankai portrait toggle in roster details and portrait lineups in the arena introduction.
- Victory lineup and per-character actual damage, healing, absorbed barrier damage and defeats. Statistics are recorded as actions resolve.

## Visual and sound update

- Three detailed generated arena backgrounds: Soul Society, Las Noches and World of the Living. Shown in arena selection, the arena banner and behind the battlefield.
- Nine new Bankai portraits preserve each character’s identity. Cards, initiative portraits and the active character panel switch to the new form. The roster’s Bankai preview also shows it. Hannibal has no Bankai and keeps his five-eye Shikai; Tourgen retains his separate portrait.
- Accepted Bankai actions trigger a six-second base-to-Bankai portrait transition with the awakening name and character name. Dismiss reveal hides the animation without changing the music sequence. Effects off or system reduced-motion shows a static reveal. Presentation never changes battle rules or delays the server’s turn.
- `public/audio/awakening.mp3` is the supplied **1.mp3**. Its opening six seconds play during the reveal, then crossfade for 0.7 seconds into `public/audio/battle-theme.mp3`, supplied **2.mp3**. The second track loops until battle end or leaving the battle. Another Bankai restarts this sequence and cancels the prior announcement.
- Open **Sound off → Enable sound** once in each browser. Separate Music and Spoken Bankai names controls, master mute and volume are available. Sound starts off on page load to respect browser playback restrictions. Enabling it in an already-awakened battle resumes the current music phase. Reconnecting restores the transformed art and resumes the battle theme after sound is enabled, without replaying an old awakening.
- Spoken announcements use the browser/OS text-to-speech voice: “Bankai. [Awakening name].” These are not actor recordings; voice availability and pronunciation vary by device. Subtitles remain visible if speech is unavailable.

The tracks are bundled locally; no YouTube player, stream or external audio service is required. The uploaded originals are included unchanged under their descriptive filenames. `src/game/media.ts` sets the reveal duration; `src/audio/sound.ts` controls playback. Generated art prompts and output paths are in `ART-PROMPTS.json`; the built-in image generator produced the artwork, with WebP copies for efficient loading.

## Kidou update

Kidou no longer chooses two prepared styles. His third core move is a copy slot with every Shinigami core technique from both starting teams. Use the **Copied Shinigami ability** dropdown during his turn, then use the third action to cast it. Switching is free, keeps the shared cooldown and cannot interrupt his own charge. His signature attack and white-magic Arrancar move remain separate.

The library includes allies and enemies, deduplicates mirror picks and remains available after a source is defeated. It does not include characters absent from this match or another Kidou’s copied moves. His own signature remains available in its usual slot. Guard, transformation buttons, automatic passives, base stats and Tourgen summoning are not copied combat techniques.

Copies use Kidou’s form: Shikai before his Bankai and upgraded forms afterward, regardless of whether the original character has transformed. Hannibal’s techniques remain Shikai and still require opening the five eyes. All costs and requirements apply to Kidou: copy Drake’s signature to build Focus for Hakai, Gin’s siphon to earn Reserve for allocation, and Hannibal’s eye summon to unlock Spectrum/Reality Break. Hell still needs two original-character deaths. Lane’s charge must finish before switching. Copied Shinigami moves use Kidou’s 6% Soul Society bonus; his white magic uses the Las Noches bonus.

## Retained v4 features

- Exactly three core moves for each character: one signature attack and two specials. Guard, Bankai and character-specific utility controls are separate.
- Bankai permanently changes and strengthens all three core moves. It costs 100 Awakening, takes an action, is once per battle and does not reset cooldowns. Hannibal retains his five-eye Shikai progression and has no Bankai.
- Afrodi, Kami and Kidou each have two Shinigami moves and one Arrancar move, in both forms. Origin labels and arena-adjusted numbers appear on the action controls.
- Separated Tourgen has his own portrait and a player-controlled turn. He matches separated Dan's maximum HP, base attack, speed and upgraded core moves. He starts at Dan's current HP and energy when separated and enters the next round's queue. Defeating his Dan removes him. Separation sacrifices Dan's armor.
- Each match draws one arena. Online, the server chooses once after both teams lock; both players see the same animated reveal and must click **Enter arena** before combat. Reconnecting preserves the arena. Offline matches draw an arena too.
- Empty selection, Random Team, Clear team, rematches, attack effects and reduced-motion support are retained.

## Arenas and heritage

| Arena               | Effect                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Soul Society        | Shinigami moves gain 12% damage, healing and barriers for pure Shinigami, or 6% for half-Shinigami. Tourgen inherits Dan's 6%. |
| Las Noches          | Afrodi, Kami and Kidou gain 12% damage on their Arrancar move.                                                                 |
| World of the Living | Neutral; no bonuses.                                                                                                           |

Dan is half Shinigami / half Berserker. Afrodi, Kami and Kidou are half Arrancar / half Shinigami. Blade, Drake, Gin, Hannibal, Lane and Tomamaru are Shinigami. Arena bonuses never extend immunity, imprisonment or execution thresholds. Numbers round to the nearest integer. These percentages are an initial balance proposal.

## Character identities

| Character  | Core strategy and Bankai evolution                                                                                                                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dan Jerald | Black flame, lasting burns and an area strike that grants a personal barrier. Bankai strengthens all three moves and grants armor; separation trades armor for equally strong Tourgen. |
| Afrodi     | Attack while phased, then use a piercing black-magic cut. After two original characters die, Bankai unlocks Hell imprisonment or execution at 25% HP.                                  |
| Blade      | Teleport strikes and single-target evasion. Bankai adds contact capture, energy drain into permanent blade damage, and two evasion charges.                                            |
| Drake      | Basic attacks build Focus for Hakai. Bankai raises damage and erasure threshold, lowers Focus cost, and grants destruction immunity; his area move renews it.                          |
| Gin        | Drain energy into Reserve, then spend it on healing, strength or speed. Bankai doubles absorption capacity and improves every allocation.                                              |
| Hannibal   | Summon five closed eyes; one opens each own turn. At five, the first special becomes an area Reality Break. No Bankai.                                                                 |
| Kami       | Attack while invisible and use Arrancar explosions. Bankai signature becomes a piercing erasure shot, concealment lasts longer, explosions hit harder.                                 |
| Kidou      | White dimensional cut plus any Shinigami core move from either team. Bankai upgrades the cut, signature and eligible copies. Shared copied cooldown survives switching.                |
| Lane       | Team barriers and earth damage. Bankai strengthens protection and changes the third slot into a planetary charge, then a free release on the next own turn.                            |
| Tomamaru   | Lightning hat hits two targets; Static enables interruption. Bankai uses weaponless thunder, stronger hits and unconditional charge interruption.                                      |

Sword, Mira and Tensei remain deferred. Damage, cooldowns, immunity windows and erasure thresholds translate story powers into a playable prototype; they are not lore power limits. Balance has simulation coverage but still needs human playtesting.

## Playing

Choose three unique characters per side manually or with **Random Team**. Online: **Save team**, then **Lock team & ready**. After the arena reveal, both players enter. Choose a move and a highlighted target; area and self-targeted core abilities show a preview and require confirmation. Two-target moves allow an optional secondary target. Inspect roster details for base and upgraded moves.

Use Guard to reduce incoming damage and regain energy. Bankai needs 100 Awakening; Afrodi additionally needs two original character deaths. Existing cooldowns persist after transformation. The action descriptions and in-game **Battle rules & prototype balance** panel explain exact timing.

Online rematches require both players and return to empty selection. Offline **Rematch same teams** preserves teams and draws a new arena. **Return to roster** clears teams. Refreshing the same browser tab restores your online seat; disconnected battles pause. Server restarts clear rooms, and abandoned rooms expire after 30 minutes.

On another PC on the same network, open the Network URL printed by Vite, such as `http://192.168.1.20:5173`. Both players must use the same host URL. An existing tunnel/host must forward `/socket.io` HTTP and WebSocket traffic to the backend. This ZIP does not deploy a public server. `npm run preview` alone does not host the online backend.

## Checks and editing

`npm run balance:audit` reruns the seeded automated matchup audit. This is exploratory validation, not a claim of competitive balance.

```powershell
npm test
npm run lint
npm run build
```

Forty automated tests cover every eligible copy in both forms, copied resource requirements, forbidden copy rejection, AI switching, and core-move structure, all characters across all arenas, Bankai, immunity, capture, interruption, Tourgen parity and real two-client online selection, arena gates, reconnects and rematches. Browser checks cover desktop/mobile action placement, attack forecasts, area confirmation, status-dialog dismissal, four signature attack effects and actual lightning links, effects-off and reduced motion, synthesized sound, victory statistics, role labels, versus lineups and portrait switching. The supplied Bankai MP3 transition and permanent portrait change were also rechecked in this edition. Earlier browser checks cover actual MP3 decoding/playback, the awakening-to-loop transition, replacing an existing theme, mute and battle-end cleanup, voice invocation, portrait changes, reconnects and reduced-motion mobile layout. Prior checks cover online selection, enemy technique copying, Focus requirements and synchronized casting. The previous edition also passed shared arena reveal and entry-gate checks.

- `src/game/kits.ts`: move names, base/Bankai values and descriptions.
- `src/game/arenas.ts`: arenas, heritage and bonuses.
- `src/game/engine.ts`: battle rules shared by offline and server.
- `src/game/roster.ts`: character metadata and stats.
- `src/components/ArenaReveal.tsx`: arena reveal and image display.
- `src/components/Awakening.tsx`: Bankai portrait transition.
- `src/audio/sound.ts`: two-track playback and browser announcements.
- `src/components/BattleBoard.tsx`: combat UI.
- `src/Visuals.css`, `src/BattlePolish.css`, `src/LivingWorld.css`: presentation layers.
- `src/components/LivingBattlefield.tsx`: persistent character powers and scene marks.
- `src/game/world.ts`: presentation state derived from the match.
- `server/index.ts`: authoritative online rooms and arena choice.
- `public/portraits`: all character art, including Tourgen.

Online rooms are an in-memory private prototype without accounts, ranked matchmaking or saved matches. Effects can be disabled in the top navigation; system reduced-motion preferences are respected.


## Publishing online

See [GITHUB-DEPLOY.md](GITHUB-DEPLOY.md) for safe GitHub publishing and required Vercel `VITE_SERVER_URL` / Render `CLIENT_ORIGINS` setup.
