import type { RequirementGroup } from "./types";

export const requirementGroups: RequirementGroup[] = [
  {
    label: "Hard requirements",
    tone: "hard",
    items: [
      "Finished table is approximately 50 x 98 x 29 in and fits the upstairs room.",
      "55 in touch monitor sits flush in the surface with no added cover glass.",
      "Top remains split into moveable parts; the two butcher-block halves are not permanently glued together.",
      "Monitor is carried by an independent adjustable cassette, not by trim or the butcher-block top.",
      "Assembly breaks down enough for stairs, service, and future monitor removal.",
      "Wood movement, ventilation, cable relief, and access are designed in from the start.",
    ],
  },
  {
    label: "Soft requirements",
    tone: "soft",
    items: [
      "Add a modular accessory system for trays and drink holders along the player edges.",
      "Tray and cup-holder parts may be purchased ready-made rather than fabricated in-house.",
      "Favor the four-corner-leg furniture look unless stability or transport issues force a trestle solution.",
      "Keep the monitor bay trim neat enough to look intentional in a living space.",
      "Make common controls, ports, and cables reachable from the DM side.",
    ],
  },
  {
    label: "Optional enhancements",
    tone: "optional",
    items: [
      "Clip-on player trays for dice, character sheets, tablets, and snacks.",
      "Removable drink holders mounted outside the playing surface.",
      "Flush power/USB module at the DM end.",
      "Low dice-retention rail around the perimeter.",
      "Decorative insert trim that can be replaced if a later monitor changes size.",
    ],
  },
];
