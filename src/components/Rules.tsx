export default function Rules() {
  return (
    <details className="panel rules">
      <summary>Battle rules, heritage & transformations</summary>
      <ul>
        <li>Arena Heart mode adds an alternative victory: earn three seals. Attune opens in round 2, costs 1 energy and a full turn, and grants no Awakening. A seal resolves at the bearer’s next turn after burn. Taking 24 cumulative HP damage or imprisonment interrupts it. One attempt per team per round. Phase, invisibility, mantle and charging prevent starting; summons cannot attune. Both sides may channel at once. Elimination still wins immediately.</li>
        <li>
          Each character has three core moves: a signature attack and two
          specials. Guard and Bankai are separate controls. Afrodi, Kami and
          Kidou each have exactly one Arrancar move and two Shinigami moves,
          before and after Bankai.
        </li>
        <li>
          Both players lock three unique characters, then the server randomly
          selects one shared arena. Read the bonuses and press Enter arena;
          online combat waits for both players. Reconnecting never rerolls the
          arena.
        </li>
        <li>
          Soul Society: +12% Shinigami damage, healing and barriers for pure
          Shinigami; +6% for half-Shinigami, including Dan. Tourgen inherits
          Dan’s +6%. Las Noches: +12% to the hybrids’ Arrancar move damage.
          World of the Living is neutral. Power is rounded to the nearest HP;
          immunity, cooldowns, speed, execution thresholds and prison durations
          are unchanged.
        </li>
        <li>
          Move descriptions show arena-adjusted damage and barriers. Final HP
          loss can differ because of Guard, armor, immunity, evasion, barriers
          or absorption. Floating numbers show the immediate action result. Burn
          at the next turn is recorded separately.
        </li>
        <li>
          Start with 3 energy, gain 1 at each own turn, maximum 5. Guard
          recovers another 1. Rest N blocks the next N own turns. Gain 20
          Awakening per combat action (not Attune) and 10 when surviving direct damage. Bankai needs
          100 Awakening, uses the turn, and permanently upgrades the three
          moves. Existing cooldowns remain.
        </li>
        <li>
          Hannibal has no Bankai. Activate Five Eyes; one eye opens each
          subsequent own turn. At five eyes, the activation slot becomes Reality
          Break. His attacks also grow with each eye.
        </li>
        <li>
          Phase and Destruction Mantle block direct attacks and their hit
          effects, including erasure; existing burn still ticks. Mantle also
          deals 30 retaliation to contact attackers. Its protection lasts
          through the next own turn end; Drake can renew it with his Bankai
          burst.
        </li>
        <li>
          Invisible characters can attack without revealing themselves, but area
          attacks still hit them. Blade’s evasion blocks one single-target
          attack, or two in Bankai, before his next turn. Area attacks bypass
          evasion. Vanishing Step also prepares +10 basic damage (+18 in Bankai)
          through the next own turn end.
        </li>
        <li>
          Afrodi needs two main-character deaths to enter Bankai. His Hell move
          phases him and imprisons a target for two scheduled turns, or claims
          it at 25% HP or below. Prisoners stay alive, pause other timers, and
          return if their captor dies.
        </li>
        <li>
          Blade’s Bankai strike captures on a successful hit. Captives lose up
          to two energy per skipped turn, strengthening his blade. At 50% HP or
          higher they escape after one skipped turn; otherwise after two.
        </li>
        <li>
          Lane’s Bankai third move charges planetary power. Use the same slot
          next own turn to release it; release costs no additional energy. Wait
          maintains the charge. Thunderclap interrupts Static targets; in Bankai
          it always interrupts and detonates Static for bonus damage. Capture
          also interrupts. A cancelled charge keeps its cooldown.
        </li>
        <li>
          Kidou can freely select any Shinigami core move from either starting
          team for his third slot. His white magic remains Arrancar. Copies
          share one cooldown and use his own energy, Focus, Reserve and eyes.
          Copy Drake’s signature to build Focus, Gin’s siphon to build Reserve,
          or Hannibal’s Five Eyes to open eyes. Bankai uses the copied move’s
          Bankai form; Hannibal always stays Shikai. Hell requires two deaths.
          No inherited base stats, automatic passives, transformations or
          Tourgen summons. The library remains after a source falls. Switching
          does not consume a turn and is blocked during a charge.
        </li>
        <li>
          Dan can separate Tourgen after Bankai for 3 energy, losing his armor.
          Tourgen has Dan’s max HP, current HP, base attack, speed, energy and
          upgraded move strengths at separation, but fresh cooldowns and status
          effects. Control both independently. Tourgen joins next round, cannot
          summon another Tourgen and disappears if his Dan falls. His defeat
          does not unlock Afrodi’s Bankai.
        </li>
        <li>
          Gin can absorb only into unused Reserve capacity. At 60 Reserve,
          incoming damage overflows into HP. Redistribution costs 30 Reserve (25
          in Bankai), restores 40 HP (65 in Bankai), and blocks the slot for two
          future own turns. Strength and speed allocations share that recovery.
        </li>
        <li>
          Shikai Thunderclap detonates Static for 10 bonus damage; Bankai
          detonates for 20. Both cost 2 energy, so a returning-blade setup can
          lead into a follow-up. Hakai ignores Guard, armor and barriers;
          immunity and evasion still stop it.
        </li>
        <li>
          Battlefield scars, colour loss, spiritual pressure, hands and
          planetary scenery are visual records of battle state. They do not add
          hidden damage or change arena bonuses.
        </li>
      </ul>
    </details>
  );
}
