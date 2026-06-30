export type OptionalFeatureId = "trays" | "drink-holders" | "power" | "dice-rail";

export type SceneOptionId =
  | "wood-underframe"
  | "steel-subframe"
  | "half-modules"
  | "central-insert"
  | "segmented-rails"
  | "trestle-base";

export type DesignOption = {
  id: SceneOptionId;
  rank: number;
  shortName: string;
  name: string;
  tagline: string;
  summary: string;
  bestUse: string;
  strengths: string[];
  tradeoffs: string[];
};

export type RequirementGroup = {
  label: string;
  tone: "hard" | "soft" | "optional";
  items: string[];
};

export type OptionalFeature = {
  id: OptionalFeatureId;
  label: string;
  description: string;
  reusableAcross: SceneOptionId[];
};
