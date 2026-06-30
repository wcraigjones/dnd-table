import type { DesignOption } from "../types";

export const segmentedRails: DesignOption = {
  id: "segmented-rails",
  rank: 5,
  shortName: "Rail frame",
  name: "Full tabletop rail frame with separate monitor well",
  tagline: "Strongest wood top layout",
  summary:
    "The butcher block is cut into deliberate rails and end panels around a structural monitor well instead of staying as two simple long halves.",
  bestUse:
    "Use when structural confidence around the screen matters more than preserving the simple two-slab look.",
  strengths: [
    "Avoids fragile half-slab notches",
    "Long player rails can be continuously supported",
    "Damaged rails can be remade",
    "Top pieces can pack smaller than full slabs",
  ],
  tradeoffs: [
    "More seams and exposed end grain",
    "More cutting of expensive stock",
    "May look patched unless the joinery is intentional",
  ],
};
