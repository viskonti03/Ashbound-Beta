# Living Battlefield — gameplay review

This pass retains three connected core moves per character, permanent Bankai upgrades, hybrid ability origins, all heritage bonuses, free Kidou switching, and Dan/Tourgen parity. Visual scenery has no hidden combat effects.

## Concrete changes

Numbers below are before arena bonuses. Base / Bankai values are shown together.

| Character/system | Previous | Now | Reason |
|---|---|---|---|
| Dan / Tourgen flame | 48 / 76 direct, plus burn | 44 / 68 direct, same 8 / 12 burn | Preserve burn pressure while reducing front-loaded damage. |
| Dan / Tourgen area strike | 32 / 52 per enemy | 28 / 46 per enemy; barriers unchanged | Temper strong team-wide damage plus protection. |
| Tourgen separation | 0 energy | 3 energy, still spends the turn and gives up armor | Creating an equal independent unit requires preparation. Dan and Tourgen still have equal current HP, maximum HP, attack, speed and energy at separation. |
| Blade | 185 HP; blink 42 / 66 | 190 HP; blink 48 / 74 | Support his single-target duelist role. |
| Blade evasion | 1 / 2 evasions | Same evasions, plus +10 / +18 to the next basic through the next own turn end | A defensive setup can lead into a counterattack. Area attacks remain the response. Kidou can copy the setup. |
| Drake | 175 HP; Hakai 68 / 104, normally mitigated | 185 HP; Hakai 64 / 92, ignores Guard, armor and barriers | Make destruction dependable, with lower raw damage. Focus cost, cooldown, 20% / 35% erasure thresholds, phase and evasion counters stay intact. |
| Gin siphon | 38 / 62 | 42 / 70 | Give the resource builder more offensive purpose. |
| Gin redistribution | Heal 45 / 75; spend 20 / 15 Reserve; no recovery | Heal 40 / 65; spend 30 / 25 Reserve; two future own turns of recovery | Break indefinite heal loops. Strength/speed allocations share the recovery, requiring a meaningful choice. |
| Gin absorption | Absorbed even at 60 Reserve | Cannot absorb more than unused Reserve space | Full capacity is a vulnerability; excess damage goes to HP. Capacity growth and Bankai amplification remain. |
| Kami | 165 HP | 175 HP | A small survivability increase against area pressure. Invisibility, hidden damage, explosion and erasure remain unchanged. |
| Lane | 220 HP, 11 speed, 22 basic; barriers 28 / 48; planetary release 110 | 230 HP, 13 speed, 24 basic; barriers 30 / 52; planetary release 120 | Give the defender earlier influence and make the vulnerable charge worth protecting. Interrupts still work. |
| Tomamaru thunder | 3 energy; marked Shikai target had no bonus damage | 2 energy; Static adds 10 damage in Shikai, 20 in Bankai | A 3-energy returning-blade setup from 4 energy now leaves enough for thunder after the next regeneration. Static is consumed, and marked charges are interrupted. |
| Guard | Damage reduction only | Same reduction plus 1 energy, capped at 5 | A deliberate defensive recovery action. Waiting during a charge does not grant this bonus. |
| Shield ownership | Weaker barriers could refresh a stronger barrier’s expiry and owner | Weaker barriers leave the stronger one untouched | Preserve the real source, duration and protection statistics. |

Afrodi, Hannibal and Kidou retain their base stats and core values. Kidou inherits the revised effects of the Shinigami moves he copies, pays his own resources, and keeps the shared cooldown. No extra passive or base stats are inherited. Hannibal still has no Bankai.

## Evidence and limits

`balance/before.json` and `balance/after.json` record the same 60 seeded roster pairs, played in both seat orders across all three arenas: 120 matches per run. The cutoff is 400 decisions per match. The practice AI controls both sides; its current version also recognizes Blade’s new counterattack opportunity.

Before this pass, 14 matches reached the cutoff. A captured example was a Gin mirror that was still healing and absorbing at round 190. After this pass, none of the 120 matches reached the cutoff. The updated run averaged 9.73 rounds and 37.66 non-switch actions per match.

These are regression and pacing indicators, not human win rates. Teams share characters, the sample is small, and the AI has fixed preferences. Character win shares in the JSON are correlated with teammates and AI decisions. Kami and Kidou need particular attention in human matches; Drake and Tomamaru should be watched for excessive pressure. Do not interpret the figures as a tier list.

Forty tests cover combat rules, both forms of Kidou’s eligible copies, energy/cooldown constraints, capped Reserve, the Static follow-up, Counterstep, shield ownership, Tourgen parity, action forecasts, world-state purity, bounded scar history, and two-client room selection/reconnection/rematches. Browser checks cover the visible scene and motion controls.

## Human playtest priorities

1. Try Static → thunder on a charging Lane; confirm the energy and timing are understandable.
2. Fight Gin when his Reserve is full, then test whether redistribution’s recovery creates useful attack windows.
3. Compare Dan keeping armor against saving 3 energy to separate Tourgen.
4. Use area attacks against Blade/Kami and timed attacks between Drake/Afrodi protection windows.
5. Test Kidou in several team compositions; check adaptability rather than only raw damage.
