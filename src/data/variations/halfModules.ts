import type { DesignOption } from "../types";

export const halfModules: DesignOption = {
  id: "half-modules",
  rank: 3,
  shortName: "Half modules",
  name: "Two half-tables with removable monitor bridge",
  tagline: "Most transportable",
  summary:
    "Each 25 in side becomes a narrow structural module. The halves register together upstairs, then a removable bridge or cassette spans the monitor bay.",
  bestUse:
    "Use if stair turns are severe or the table may move again and each carried piece needs to stay narrow.",
  strengths: [
    "Excellent portability",
    "Each side can be repaired or refinished separately",
    "Most assembly work can happen on shop-sized modules",
    "Central bridge locks the monitor area after setup",
  ],
  tradeoffs: [
    "Harder to keep both halves co-planar",
    "More fasteners and assembly steps",
    "Four-leg visual requirement needs careful corner blocks",
  ],
};
