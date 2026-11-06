import type { CSSProperties } from "react";
import type { Battle, BattlefieldScar, Unit } from "../game/types";
import { worldState, visibleScars } from "../game/world";
import { THEMES } from "../game/presentation";
function Scar({ scar: s }: { scar: BattlefieldScar }) {
  const x = 30 + ((s.revision * 137) % 940),
    y = 30 + ((s.revision * 79) % 540);
  const scale = s.awakened ? 0.7 : 0.5;
  const common = {
    transform: `translate(${x} ${y}) scale(${scale})`,
    className: `world-scar scar-${s.effect}`,
  };
  switch (s.effect) {
    case "ruin":
      return (
        <g {...common}>
          <path
            d="M-40-26 0-8 14-43 8 2 57 14 11 12-8 50-7 7-48 33-14 0Z"
            fill="#02040b"
          />
          <path
            d="M-40-26 0-8 8 2 57 14M8 2-8 50M8 2-48 33"
            stroke="#c998ed"
            strokeWidth="1.3"
          />
        </g>
      );
    case "flame":
      return (
        <g {...common}>
          <ellipse rx="46" ry="20" fill="#02050b" />
          <path
            d="M-30 5Q-42-18-20-30Q-23-8-5-5Q-10-36 6-52Q2-24 18-16Q22-32 31-26Q41 3 28 15Z"
            fill="#05060c"
            stroke="#ae613c"
            strokeWidth="1.5"
          />
        </g>
      );
    case "rift":
    case "void":
      return (
        <g
          {...common}
          fill="none"
          stroke={s.effect === "rift" ? "#78d7e7" : "#bc84d4"}
        >
          <ellipse rx="16" ry="42" />
          <ellipse rx="22" ry="48" opacity=".35" />
          <path d="M-45 28 38-35" strokeWidth="2" />
        </g>
      );
    case "earth":
      return (
        <g {...common} stroke="#9dae77" fill="none">
          <path
            d="M0 40 3-6-14-34M3-6 29-30M0 18-26 1M0 18 31 6M-14-34-32-35M29-30 39-48"
            strokeWidth="3"
          />
        </g>
      );
    case "lightning":
      return (
        <g {...common} fill="none" stroke="#6ba9dc">
          <path d="M-35-30-2-12-12 3 24 13 8 33 42 48" strokeWidth="2" />
        </g>
      );
    case "kinetic":
      return (
        <g {...common} stroke="#e5ded2">
          <path d="M-70 15 70-15M-50 26 54 4M-60-8 38-32" />
        </g>
      );
    default:
      return (
        <g
          {...common}
          fill="none"
          stroke={s.effect === "pulse" ? "#65bfa2" : "#d5b68d"}
        >
          <ellipse rx="38" ry="15" />
          <ellipse rx="50" ry="23" opacity=".3" />
        </g>
      );
  }
}
export default function LivingBattlefield({ battle: b }: { battle: Battle }) {
  const w = worldState(b);
  return (
    <>
      <div
        className="living-backdrop"
        style={{ "--world-saturation": w.saturation } as CSSProperties}
        aria-hidden="true"
      />
      <svg
        className={`living-world ${w.hellAwakened ? "hell-awakened" : ""}`}
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {visibleScars(b).map((s) => (
          <Scar key={s.revision} scar={s} />
        ))}
        {w.deaths > 0 && b.units.some((u) => u.character === "afrodi") && (
          <g
            className="hell-marks"
            opacity={0.18 + Math.min(5, w.deaths) * 0.11}
          >
            {[0, 1, 2, 3, 4, 5].slice(0, Math.min(6, w.deaths + 1)).map((i) => (
              <g
                key={i}
                transform={`translate(${i % 2 ? 940 : 60} ${90 + Math.floor(i / 2) * 180}) rotate(${i % 2 ? 25 : -25})`}
              >
                <path d="M-15 37-20 7-28-9Q-30-17-24-16L-13-3-17-35Q-15-44-11-36L-4-12-3-45Q0-51 3-43L7-13 13-38Q17-43 18-34L15-7 24-23Q29-26 28-18L20 11 15 37Z" />
              </g>
            ))}
          </g>
        )}
        {w.hellReady && (
          <g className="world-hell-gate" transform="translate(500 300)">
            <ellipse rx="470" ry="265" />
            <ellipse rx="453" ry="249" />
            <path d="M-450 0H450M0-249V249" />
          </g>
        )}
        {w.charging.length > 0 && (
          <g className="planetary-system">
            {[0, 1, 2, 3, 4].map((i) => (
              <g
                key={i}
                transform={`translate(${70 + i * 215} ${i % 2 ? 72 : 34})`}
              >
                <circle r={18 + i * 3} />
                <ellipse rx={32 + i * 4} ry="7" transform="rotate(-25)" />
                <path
                  d={`M0 30Q${i % 2 ? 100 : -100} 140 ${500 - (70 + i * 215)} 270`}
                />
              </g>
            ))}
          </g>
        )}
      </svg>
      {w.sky && (
        <div
          className="world-eyes"
          aria-label={`Five Eyes: ${w.eyes} open; arena colour remaining ${Math.round(w.saturation * 100)} percent`}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <svg
              key={i}
              viewBox="0 0 100 38"
              className={i < w.eyes ? "eye-awake" : "eye-closed"}
              aria-hidden="true"
            >
              <path d="M3 19Q50-10 97 19Q50 48 3 19Z" />
              <ellipse cx="50" cy="19" rx="7" ry="13" />
              <path className="eyelid" d="M3 19Q50 33 97 19" />
            </svg>
          ))}
        </div>
      )}
      {w.labels.length > 0 && (
        <div className="world-caption" aria-live="polite">
          {w.labels.join(" · ")}
        </div>
      )}
    </>
  );
}
export function CharacterPresence({
  unit: u,
  deaths,
}: {
  unit: Unit;
  deaths: number;
}) {
  const color = THEMES[u.character].color;
  const active = u.hp > 0 && !u.prison;
  if (!active) return null;
  const gin = u.character === "gin";
  return (
    <div
      className={`character-presence presence-${u.character} ${u.bankaiUsed ? "awakened-presence" : ""} ${gin && u.hp < u.maxHp * 0.65 ? "pressure-cracks" : ""} ${u.charge ? "gathering-presence" : ""}`}
      style={
        {
          "--presence-color": color,
          "--reserve-strength": 0.15 + u.reserve / 80,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      {u.bankaiUsed && <div className="permanent-aura" />}
      <svg viewBox="0 0 200 180" preserveAspectRatio="none">
        {u.character === "dan" &&
          u.form !== "separated" &&
          [0, 1].map((i) => (
            <path
              key={i}
              className={`dan-shadow shadow-${i}`}
              d="M20 176 26 95 39 75 35 50Q35 29 49 28Q65 29 65 50L61 75 76 95 83 176Z"
              transform={i ? "translate(102 0)" : ""}
            />
          ))}
        {(u.character === "dan" || u.character === "tourgen") &&
          u.bankaiUsed && (
            <path
              className="black-flame-border"
              d="M0 180V94Q18 130 10 145Q38 116 28 155Q48 127 49 161Q66 137 75 168Q94 135 105 165Q122 131 134 164Q151 130 160 160Q184 123 183 150Q194 114 200 95V180Z"
            />
          )}
        {u.character === "gin" && (
          <g className="gin-pressure">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path
                key={i}
                className="pressure-stream"
                d={`M${i % 2 ? 210 : -10} ${10 + i * 29}Q${i % 2 ? 170 : 30} ${i * 20} 100 98`}
                style={{ animationDelay: `${i * 0.25}s` }}
              />
            ))}
            <path
              className="body-cracks"
              d="M78 12 82 41 74 55 83 73 77 96M129 30 120 49 128 62 117 84 123 110M69 119 85 132 77 150M131 117 120 139 139 160"
            />
          </g>
        )}
        {u.character === "blade" && u.bankaiUsed && (
          <g className="space-fold">
            <ellipse cx="100" cy="90" rx="94" ry="75" />
            <ellipse cx="100" cy="90" rx="74" ry="88" />
            <path d="M10 158 188 20M20 170 198 33" />
          </g>
        )}
        {u.character === "drake" && u.bankaiUsed && (
          <g className="annihilation-border">
            <path d="M4 140 19 120 4 80 22 60 8 12 54 22M146 10 184 22 171 58 196 88 180 122 197 167" />
            <path d="M20 170 60 155 100 177 140 159 180 171" />
          </g>
        )}
        {u.character === "afrodi" && deaths >= 2 && (
          <g className="damned-hands">
            {[0, 1, 2, 3].map((i) => (
              <path
                key={i}
                transform={`translate(${i * 50} ${i % 2 ? 4 : 0})`}
                d="M8 180 10 155 2 140 8 139 15 149 12 124 17 121 22 143 24 119 29 119 29 144 36 128 41 130 35 154 39 180Z"
              />
            ))}
          </g>
        )}
        {u.character === "lane" && (
          <g className="earth-roots">
            <path d="M5 180 21 146 12 124M21 146 53 131 67 110M53 131 74 141M195 180 178 147 189 119M178 147 149 129 130 108M149 129 127 139" />
          </g>
        )}
        {u.character === "kidou" && u.bankaiUsed && (
          <g className="white-dimensions">
            <path d="M-20 155 190-5M-10 180 210 12M-20 120 150-10" />
          </g>
        )}
        {u.character === "tomamaru" && u.bankaiUsed && (
          <g className="thunder-crown">
            <path d="M5 16 31 38 21 51 39 64M195 12 169 39 180 48 161 69M5 160 33 141 20 132M193 167 169 141 182 127" />
            <ellipse cx="100" cy="16" rx="70" ry="10" />
          </g>
        )}
        {u.character === "kami" && u.bankaiUsed && (
          <g className="erasure-sight">
            <circle cx="100" cy="90" r="72" />
            <path d="M100 7V34M100 146V173M17 90H44M156 90H183" />
          </g>
        )}
      </svg>
    </div>
  );
}
export function DefensiveReaction({
  kind,
  portrait,
}: {
  kind: string;
  portrait: string;
}) {
  return (
    <div className={`defense-reaction defense-${kind}`} aria-hidden="true">
      {(kind === "phase" || kind === "evade") && (
        <>
          <img src={portrait} alt="" />
          <img src={portrait} alt="" />
        </>
      )}
      <svg viewBox="0 0 200 180">
        <path
          className="reaction-shield"
          d="M100 8 181 39 167 115 100 174 33 115 19 39Z"
        />
        <path
          className="reaction-crack"
          d="M100 8 89 47 113 66 85 101 107 129 100 174M113 66 169 56M85 101 36 118"
        />
        <ellipse cx="100" cy="90" rx="72" ry="83" />
        <path
          className="reaction-stream"
          d="M0 30 100 90 200 12M0 162 100 90 200 160"
        />
      </svg>
      <span>
        {
          (
            {
              phase: "PHASED",
              evade: "EVADED",
              mantle: "ANNIHILATED",
              barrier: "BARRIER HIT",
              absorb: "ABSORBED",
              prison: "IMPRISONED",
            } as Record<string, string>
          )[kind]
        }
      </span>
    </div>
  );
}
