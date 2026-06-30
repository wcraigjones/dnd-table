import type { OptionalFeature } from "./types";

const allVariations = [
  "wood-underframe",
  "steel-subframe",
  "half-modules",
  "central-insert",
  "segmented-rails",
  "trestle-base",
] as const;

export const optionalFeatures: OptionalFeature[] = [
  {
    id: "trays",
    label: "Accessory trays",
    description: "Clip-on or rail-mounted trays on the long player sides.",
    reusableAcross: [...allVariations],
  },
  {
    id: "drink-holders",
    label: "Drink holders",
    description: "Purchased removable cup holders mounted outside the table edge.",
    reusableAcross: [...allVariations],
  },
  {
    id: "power",
    label: "DM power module",
    description: "A small flush power/USB block near the DM zone.",
    reusableAcross: ["wood-underframe", "steel-subframe", "central-insert", "segmented-rails", "trestle-base"],
  },
  {
    id: "dice-rail",
    label: "Dice rail",
    description: "A low perimeter lip to keep dice and tokens on the table.",
    reusableAcross: ["wood-underframe", "steel-subframe", "central-insert", "segmented-rails"],
  },
];
