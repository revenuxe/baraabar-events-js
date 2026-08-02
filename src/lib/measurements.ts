// Ported from the old app's src/components/GuidedMeasure.tsx + src/lib/garments.ts.
// Consolidated into one pure, framework-free module (no React/Supabase
// imports) so it's easy to unit test and reusable from both the booking
// flow (Phase 3) and the profile measurements page (Phase 4) without
// pulling in either.

export type MField =
  | "chest"
  | "shoulder"
  | "sleeve"
  | "waist"
  | "hip"
  | "neck"
  | "inseam"
  | "thigh"
  | "shirtLength"
  | "kurtaLength"
  | "blouseLength"
  | "lehengaLength"
  | "dressLength";

export const M_META: Record<
  MField,
  { label: string; how: string; tip: string; rangeCm: [number, number] }
> = {
  chest: {
    label: "Chest",
    how: "Wrap the tape around the fullest part of your chest, under the arms.",
    tip: "Keep the tape parallel to the floor — not tilted.",
    rangeCm: [70, 140],
  },
  shoulder: {
    label: "Shoulder",
    how: "Measure straight across the back, from one shoulder tip to the other.",
    tip: "Stand relaxed — don't hunch or square up.",
    rangeCm: [35, 60],
  },
  sleeve: {
    label: "Sleeve length",
    how: "From the tip of the shoulder to just past the wrist bone.",
    tip: "Arm slightly bent, palm facing the thigh.",
    rangeCm: [45, 75],
  },
  waist: {
    label: "Waist",
    how: "Around the narrowest part, roughly at the belly button.",
    tip: "Breathe out normally — don't suck in.",
    rangeCm: [55, 130],
  },
  hip: {
    label: "Hip",
    how: "Around the fullest part of the hips, feet together.",
    tip: "Tape should just skim the body, not press in.",
    rangeCm: [75, 140],
  },
  neck: {
    label: "Neck",
    how: "Around the base of the neck where a collar would sit.",
    tip: "Slip one finger under the tape for breathing room.",
    rangeCm: [30, 50],
  },
  inseam: {
    label: "Inseam",
    how: "From the crotch seam down to the ankle bone.",
    tip: "Wear the shoes you'd usually pair with these trousers.",
    rangeCm: [60, 100],
  },
  thigh: {
    label: "Thigh",
    how: "Around the fullest part of the thigh.",
    tip: "Keep weight evenly on both feet.",
    rangeCm: [40, 80],
  },
  shirtLength: {
    label: "Shirt length",
    how: "From the base of the neck down to where you want the hem.",
    tip: "For tuck-in, add 2 cm of extra length.",
    rangeCm: [60, 90],
  },
  kurtaLength: {
    label: "Kurta length",
    how: "From the shoulder point straight down to the desired hem.",
    tip: "Knee-length is standard for men; adjust to taste.",
    rangeCm: [80, 130],
  },
  blouseLength: {
    label: "Blouse length",
    how: "From shoulder to where you want the blouse to end.",
    tip: "Typical is 14–16 inches (36–41 cm).",
    rangeCm: [30, 55],
  },
  lehengaLength: {
    label: "Lehenga length",
    how: "From waist down to the top of the foot (wearing heels if applicable).",
    tip: "Add 1 cm if you plan to wear heels.",
    rangeCm: [90, 120],
  },
  dressLength: {
    label: "Dress length",
    how: "From shoulder down to the desired hemline.",
    tip: "Sit down midway — the hem shouldn't ride up uncomfortably.",
    rangeCm: [80, 160],
  },
};

/** A broadly useful default set for editing measurements outside the
 * context of a specific garment (e.g. from the profile page). */
export const GENERAL_MEASUREMENT_FIELDS: MField[] = [
  "chest",
  "shoulder",
  "sleeve",
  "waist",
  "hip",
  "neck",
];

export const GARMENTS = [
  "Shirt",
  "Kurta",
  "Sherwani",
  "Suit",
  "Blazer",
  "Trouser",
  "Blouse",
  "Lehenga",
  "Saree Fall",
  "Dress",
  "Other",
];

export const MEASUREMENT_FIELDS_BY_GARMENT: Record<string, MField[]> = {
  Shirt: ["chest", "shoulder", "sleeve", "waist", "shirtLength", "neck"],
  Kurta: ["chest", "shoulder", "sleeve", "waist", "kurtaLength"],
  Sherwani: ["chest", "shoulder", "sleeve", "waist", "kurtaLength"],
  Suit: ["chest", "shoulder", "sleeve", "waist", "hip", "inseam"],
  Blazer: ["chest", "shoulder", "sleeve", "waist"],
  Trouser: ["waist", "hip", "inseam", "thigh"],
  Blouse: ["chest", "shoulder", "sleeve", "blouseLength", "neck"],
  Lehenga: ["waist", "hip", "lehengaLength"],
  "Saree Fall": ["waist", "hip"],
  Dress: ["chest", "shoulder", "sleeve", "waist", "hip", "dressLength"],
  Other: ["chest", "shoulder", "waist", "hip"],
};
// Aliases for garment_types names that differ from the keys above.
MEASUREMENT_FIELDS_BY_GARMENT.Kurti = MEASUREMENT_FIELDS_BY_GARMENT.Kurta;
MEASUREMENT_FIELDS_BY_GARMENT["Saree fall & pico"] = MEASUREMENT_FIELDS_BY_GARMENT["Saree Fall"];
MEASUREMENT_FIELDS_BY_GARMENT["Bridal Lehenga"] = MEASUREMENT_FIELDS_BY_GARMENT.Lehenga;
MEASUREMENT_FIELDS_BY_GARMENT["Formal Shirt"] = MEASUREMENT_FIELDS_BY_GARMENT.Shirt;
MEASUREMENT_FIELDS_BY_GARMENT["Formal Trouser"] = MEASUREMENT_FIELDS_BY_GARMENT.Trouser;

export function fieldsForGarment(garment: string): MField[] {
  return MEASUREMENT_FIELDS_BY_GARMENT[garment] ?? ["chest", "waist"];
}
