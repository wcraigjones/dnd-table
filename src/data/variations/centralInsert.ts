import type { DesignOption } from "../types";

export const centralInsert: DesignOption = {
  id: "central-insert",
  rank: 4,
  shortName: "Drop-in insert",
  name: "Removable central monitor insert",
  tagline: "Best serviceability",
  summary:
    "A separate monitor module drops into a larger central bay. The insert controls the visible reveal, leveling hardware, and service access.",
  bestUse:
    "Use when future monitor replacement and reducing risk before cutting expensive butcher block are the top priorities.",
  strengths: [
    "Monitor module can be bench-tested",
    "Future screen replacement is easier",
    "Trim precision can be handled by a replaceable part",
    "Wood movement is less likely to pinch the screen",
  ],
  tradeoffs: [
    "Adds a visible border around the monitor",
    "More parts and design work",
    "Insert still has to land perfectly flush",
  ],
};
