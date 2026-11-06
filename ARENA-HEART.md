# Arena Heart — fight for the world

This edition adds a second route to victory without changing the three-move character kits. Choose **Arena Heart** or **Elimination** before selecting teams. Arena Heart is the new default in the UI; Elimination preserves the previous rules. Offline AI and shared-device play support both. In online rooms, the host chooses; changing rules unlocks both teams while preserving their picks. Both players must lock again.

## Rules

- The Heart opens in round 2. **Attune to the Heart** costs 1 energy and the character’s entire action. It does not grant Awakening or Guard.
- Each team may start one attempt per round and may have only one channel active. A failed attempt still spends that round’s opportunity. Both sides can channel simultaneously.
- The bearer earns one seal at the start of their next own turn, **after burn damage**. Opponents therefore get a response window. Three seals win, even if the enemy team survives.
- **24 cumulative HP damage** breaks the channel. The amount is counted after armor, barriers and Gin’s absorption. Burns count. Healing does not erase damage already counted. Imprisonment or death also breaks it.
- Phase, invisibility, destruction mantle and an active charged technique prevent starting a channel. Those powers remain unchanged in combat. Summoned Tourgen cannot attune; his attacks can protect Dan by threatening opposing fighters.
- Seals give no damage, energy, healing or heritage bonuses. Existing arena bonuses remain unchanged. Eliminating the opposing team still wins immediately.
- Free Kidou copy switches do not advance a channel. The bearer needs an actual next turn. Reconnecting preserves claims, damage, seals and the victory reason; a fresh battle resets them.

## Why choose an objective action?

Attuning trades immediate damage for a threat your opponent must address. A wounded opponent may still force you to spend an attack disrupting a channel instead of finishing another fighter. An ally’s barrier can help a bearer survive; a dimensional prison can interrupt without needing to reach the HP threshold. You can also ignore the objective and race for elimination.

These are strategic options, not guaranteed combinations. Consult the forecast and status inspector: barriers expire according to their owner’s turns, immunity can block attacks, and initiative determines your response window.

## Presentation

The compact objective panel shows both scores, each bearer, damage still needed to interrupt and the most recent objective event. Click a channel to inspect its bearer. Match point is highlighted at two seals. The Attune button requires confirmation, and attack forecasts explicitly show **Attunement broken** when appropriate. The arena reveal explains the chosen rules; the result screen distinguishes objective victory from elimination. The Heart has a quiet rising tone and reduced-motion support.

## Validation and limitations

50 automated tests cover the previous combat rules plus objective timing, energy, interruptions, barriers, burn, imprisonment, simultaneous channels, forbidden forms, stale commands, AI behavior and both victory paths. The two-client integration test covers host-only rule changes, stale lobby versions, unlocking teams on a mode change, reconnecting and rematching.

The seeded `balance/arena-heart.json` run plays 60 roster pairs in both seat orders across all three arenas (120 matches, 400-decision cap). All completed; 8 ended through the Heart and 112 through elimination. Mean duration was 11.04 rounds / 49.35 non-switch actions. This is a deterministic smoke test using a simple AI, not evidence of competitive balance or human win rates.

Reproduce with:

```sh
npm test
npm run balance:audit -- --heart
```

Human playtest priorities: whether 24 damage gives a fair interruption window; whether three seals create enough objective pressure; whether fast teams can pressure too reliably; whether shields and absorption become too dominant; whether players can read the objective without distracting from attacks. Change these thresholds only after observing actual matches.

This release implements Arena Heart. Clashing domains, a reserve slot and additional story encounters remain future design ideas; they are not included.
