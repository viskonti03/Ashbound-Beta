import { useEffect, useState } from "react";
import type { ActionCue } from "../game/types";
type Point = { x: number; y: number };
/** Measures actual cards so chains still connect after resizing or summoning. */
export default function CombatLinks({
  cue,
  field,
}: {
  cue: ActionCue;
  field: HTMLDivElement | null;
}) {
  const [geometry, setGeometry] = useState<{
    width: number;
    height: number;
    points: Point[];
  } | null>(null);
  useEffect(() => {
    if (!field) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = field.getBoundingClientRect();
        const ids = [
          cue.actor,
          ...cue.targets.filter((id) => id !== cue.actor),
        ];
        const points = ids.flatMap((id) => {
          const card = Array.from(
            field.querySelectorAll<HTMLElement>("[data-unit-id]"),
          ).find((node) => node.dataset.unitId === id);
          const art = card?.querySelector(".unit-art")?.getBoundingClientRect();
          return art
            ? [
                {
                  x: art.left - box.left + art.width / 2,
                  y: art.top - box.top + art.height / 2,
                },
              ]
            : [];
        });
        setGeometry({ width: box.width, height: box.height, points });
      });
    };
    const observer = new ResizeObserver(update);
    observer.observe(field);
    update();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [field, cue]);
  if (
    !geometry ||
    geometry.points.length < 2 ||
    cue.effect !== "lightning"
  )
    return null;
  const { points, width, height } = geometry;
  return (
    <svg
      className="combat-links"
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {points.slice(1).map((end, index) => {
        const start = points[index];
        const dx = end.x - start.x,
          dy = end.y - start.y,
          length = Math.hypot(dx, dy) || 1;
        const d = Array.from({ length: 11 }, (_, i) => {
          const t = i / 10,
            offset =
              i === 0 || i === 10 ? 0 : (i % 2 ? 1 : -1) * (8 + ((i * 7) % 17));
          return `${i ? "L" : "M"}${start.x + dx * t - (dy / length) * offset},${start.y + dy * t + (dx / length) * offset}`;
        }).join(" ");
        return (
          <g key={index} style={{ animationDelay: `${index * 0.12}s` }}>
            <path className="lightning-glow" d={d} />
            <path className="lightning-core" d={d} />
            <circle cx={end.x} cy={end.y} r="30" />
          </g>
        );
      })}
    </svg>
  );
}
