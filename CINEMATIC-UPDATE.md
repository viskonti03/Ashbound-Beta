# Cinematic Bankai and compact navigation

## Bankai is a six-second event

Every new accepted Bankai opens a full-screen sequence: monochrome close-up, BANKAI declaration, pressure and dimensional fractures, transformed character artwork, then the awakening title. The effect uses the character’s own palette and motifs: black flame, rifts, annihilation geometry, energy streams, planetary rings or lightning. The existing character portraits, awakening track, battle theme and spoken-name settings remain in use.

The reveal is a keyboard-accessible modal. Skip visuals or Escape closes it; combat resumes after the shared six-second release. In offline play, the AI waits too. Online, the server rejects moves during the release so one player cannot skip and attack while the other watches. Client display timing accounts for the server clock; network latency can produce small visual timing differences. Reconnecting resumes the current battle and theme without replaying an old announcement.

Effects off and reduced motion show a still transformed portrait and title. They suppress the animated camera, fractures and particle movement. Music and voice remain controlled by the existing sound settings. Sound must be enabled by the player to satisfy browser autoplay restrictions.

## Less scrolling in the lobby

Offline selection now has three steps: match rules, Player 1 and opponent. Picks remain saved when moving between steps. Only one roster appears at a time. Start battle stays in the sticky navigation bar and enables when both teams contain three characters.

All ten portraits appear in a compact grid. Click a character to open their detail dialog, inspect Shikai/Bankai artwork and moves, and add them to the team. Adding or removing closes the dialog. Escape closes it without changing the team. Full descriptions and lore scroll within this optional dialog rather than extending the lobby page. The Bankai preview also shows the upgraded move values.

Online rooms use the same compact picker. Match rules, room controls and the opponent lineup open as drawers. Save/lock controls remain together in a sticky ready bar. Both teams must still review and lock after the host changes rules.

## Less scrolling in battle

On wide screens (1050px and above), controls sit beside the battlefield. At smaller widths they sit below it, with sticky controls on phones. Compact mode reduces decorative headers, card spacing and resource labels while keeping HP, names, targeting, turn order and actions available. Click any character for full status information.

Tourgen shares his team’s row instead of creating another row. Arena Heart retains score and channel information in a compact panel, with detailed rules behind How to contest. Full artwork remains an optional expanded view. Combat log and battle rules open as overlays in compact mode; Escape closes them. Short screens, expanded artwork and long detail panels can still require scrolling.

## Verification

The build, lint and 51 automated tests pass. The new server test verifies the Bankai input lock, reconnect preservation and resuming combat after the deadline. Existing combat, objective, roster and room tests remain intact.

Browser checks cover offline team steps, add/remove preview dialogs, online room rules and team saving, cinematic playback, skip/Escape, reconnection without replay, mobile layout, Tourgen layout and reduced motion. At 1366×768, the complete team picker fits the viewport and the battle targets/actions are visible together. At 390×844, the tested lobby fits without horizontal overflow and battle controls remain close to the field.

## Install

Use the complete project ZIP. Stop both old processes, extract into a new folder and open the folder containing package.json. Run `npm ci` and `npm run build`, then `npm run server` and `npm run dev` in separate terminals. Both online players should reload the updated client and start a new room against the updated server.
