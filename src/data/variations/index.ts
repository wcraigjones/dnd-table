import type { DesignOption } from "../types";
import { centralInsert } from "./centralInsert";
import { halfModules } from "./halfModules";
import { segmentedRails } from "./segmentedRails";
import { steelSubframe } from "./steelSubframe";
import { trestleBase } from "./trestleBase";
import { woodUnderframe } from "./woodUnderframe";

export const designOptions: DesignOption[] = [
  woodUnderframe,
  steelSubframe,
  halfModules,
  centralInsert,
  segmentedRails,
  trestleBase,
];
