import type { Unit } from "./types";
export const AWAKENING_MS = 6000;
export const BANKAI_IDS = [
  "dan",
  "afrodi",
  "blade",
  "drake",
  "gin",
  "kami",
  "kidou",
  "lane",
  "tomamaru",
] as const;
export function battlePortrait(u: Pick<Unit, "character" | "bankaiUsed">) {
  return u.bankaiUsed && BANKAI_IDS.some((id) => id === u.character)
    ? `/portraits/bankai/${u.character}.webp`
    : `/portraits/${u.character}.png`;
}

export function battleSprite(u:Pick<Unit,'character'|'bankaiUsed'> & Partial<Pick<Unit,'form'>>,rear=false){
 const awakened=u.bankaiUsed&&BANKAI_IDS.some(id=>id===u.character)&&!(u.character==='dan'&&u.form==='separated');
 return `/fighters/${awakened?'bankai/':''}${rear?'back/':''}${u.character}.png`;
}
