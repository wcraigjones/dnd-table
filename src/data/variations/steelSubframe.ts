import type { DesignOption } from "../types";

export const steelSubframe: DesignOption = {
  id: "steel-subframe",
  rank: 2,
  shortName: "Steel spine",
  name: "Split top with hidden bolted steel subframe",
  tagline: "Maximum stiffness",
  summary:
    "The same two wood halves attach to a hidden bolted steel tube structure. Steel carries the monitor and resists sag without deep wood aprons.",
  bestUse:
    "Use when stiffness and repeatable disassembly matter more than keeping the build purely woodworking-oriented.",
  strengths: [
    "Highest sag and racking resistance",
    "Shallower apron can preserve knee clearance",
    "Precise monitor support is easier to tune",
    "Repeated teardown is durable",
  ],
  tradeoffs: [
    "Needs welding or careful metalwork",
    "Fabrication errors are harder to correct",
    "Top attachment must still allow wood movement",
  ],
};
