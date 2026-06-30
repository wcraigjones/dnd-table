import { useMemo, useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  Cable,
  CheckCircle2,
  ClipboardList,
  Hammer,
  Layers3,
  Monitor,
  PackageOpen,
  Ruler,
  ShieldCheck,
  SlidersHorizontal,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { optionalFeatures } from "./data/optionalFeatures";
import { requirementGroups } from "./data/requirements";
import type { OptionalFeatureId, SceneOptionId } from "./data/types";
import { designOptions } from "./data/variations";
import { TableScene } from "./TableScene";

type SequencePhase = {
  id: string;
  label: string;
  steps: string[];
};

const dimensions = {
  tableLength: 98,
  tableWidth: 50,
  tableHeight: 29,
  topThickness: 1.5,
  underside: 27.5,
  openingX1: 17.875,
  openingX2: 68,
  openingY1: 10.375,
  openingY2: 39.625,
  monitorOpeningLength: 50.125,
  monitorOpeningWidth: 29.25,
  dmZone: 30,
  farZone: 17.875,
  sideRail: 10.375,
  monitorWeight: 66,
};

const criticalRules = [
  "Do not cut the final monitor opening from online dimensions alone.",
  "Do not cover the touch monitor with a separate glass sheet.",
  "Do not support the monitor from the butcher-block top or trim.",
  "Do not permanently glue the two top halves together.",
  "Do not trap the monitor behind permanent crossmembers.",
  "Do not rigidly fasten the butcher block in a way that blocks wood movement.",
  "Do not omit ventilation, cable bend relief, or service access.",
];

const measurementGroups = [
  {
    label: "Monitor",
    items: [
      "Outer body size",
      "Glass face size",
      "Active display area",
      "Thickest rear protrusion",
      "Port locations",
      "Cable bend radius",
      "VESA pattern",
      "Vent locations",
      "Button and sensor locations",
    ],
  },
  {
    label: "Butcher block",
    items: [
      "Actual length",
      "Actual width",
      "Actual thickness after sanding",
      "Flatness",
      "Cup or twist",
      "Squareness",
      "Best face",
      "Center seam edge quality",
    ],
  },
  {
    label: "Room and stairs",
    items: [
      "Minimum stair width",
      "Turn clearances",
      "Ceiling height at turns",
      "Maximum manageable part length",
      "Final room footprint",
      "Chair arm height",
      "Knee clearance",
    ],
  },
];

const hardwareGroups = [
  {
    label: "Alignment",
    items: [
      "Steel dowel pins and bushings",
      "Dry Domino keys or loose splines",
      "Countertop draw bolts",
      "Table leaf alignment pins",
    ],
  },
  {
    label: "Top attachment",
    items: [
      "Figure-eight fasteners",
      "Z-clips",
      "Tabletop buttons in grooves",
      "Machine screws through slotted brackets",
    ],
  },
  {
    label: "Legs",
    items: [
      "Bed bolts",
      "Threaded inserts",
      "Steel corner plates",
      "Cross dowel bolts",
      "Locating dowels plus bolts",
    ],
  },
  {
    label: "Monitor support",
    items: [
      "Fine-thread leveling bolts",
      "Jam nuts",
      "Rubber pads",
      "Aluminum or steel angle",
      "Safety stops or retention tabs",
    ],
  },
];

const buildSequence: SequencePhase[] = [
  {
    id: "prebuild",
    label: "Pre-build",
    steps: [
      "Acquire the monitor and butcher-block slabs.",
      "Measure the physical monitor and stock before final CAD.",
      "Confirm the stair path with a cardboard or plywood mockup.",
      "Decide the final opening size and underframe breakdown.",
      "Make test templates for the monitor cutout and trim.",
    ],
  },
  {
    id: "top",
    label: "Top fabrication",
    steps: [
      "Select best faces and mark left/right slab orientation.",
      "Dry clamp the slabs and mark the table coordinate system.",
      "Mark the monitor opening from verified dimensions.",
      "Rough cut and pattern-route the half openings.",
      "Ease the cutout edge, then seal all fresh cuts quickly.",
      "Machine underside pockets for draw bolts or alignment hardware.",
      "Sand and finish all faces, edges, and end grain.",
    ],
  },
  {
    id: "frame",
    label: "Underframe",
    steps: [
      "Mill rails and legs, then fabricate knock-down joinery.",
      "Dry assemble the frame and check it square.",
      "Add monitor bay rails and leg plates or brackets.",
      "Add movement-friendly top attachment slots or clips.",
      "Add cassette mounts, cable tray, and access features.",
      "Finish or seal all frame parts.",
    ],
  },
  {
    id: "cassette",
    label: "Monitor cassette",
    steps: [
      "Build the tray or cradle as a separate serviceable module.",
      "Add six to eight adjustable leveling points.",
      "Test monitor fit, port clearance, and ventilation.",
      "Add lateral safety stops and removable retention tabs.",
      "Bench test the monitor before final installation.",
    ],
  },
  {
    id: "assembly",
    label: "Final assembly",
    steps: [
      "Assemble the underframe upstairs and bolt on the legs.",
      "Install both top halves and register the center seam.",
      "Tighten seam connectors and attach the top with slotted fasteners.",
      "Install the cassette, monitor, cables, and gasket.",
      "Level the glass flush with the tabletop and test touch.",
      "Run the monitor long enough to check heat, then recheck flushness.",
    ],
  },
];

const riskItems = [
  "Actual monitor dimensions differ from listing data.",
  "Ports or vents conflict with the frame or cassette.",
  "The interrupted center seam is hard to align after cutting.",
  "Four-leg frame racks if rails and joints are underbuilt.",
  "Butcher-block movement pinches a too-tight monitor gap.",
  "Parts remain too large for the stair turns.",
  "The monitor cannot be removed after assembly.",
  "Flush height cannot be tuned without a real cradle.",
  "The 10-3/8 in player rails flex without support.",
  "Cut edges are not sealed quickly enough.",
];

const metricCards = [
  { label: "Finished size", value: "50 x 98 x 29 in" },
  { label: "Top system", value: "Two 25 x 98 x 1.5 in slabs" },
  { label: "Monitor opening", value: "50.125 x 29.25 in" },
  { label: "DM solid zone", value: "50 x 30 in" },
  { label: "Side rails", value: "10-3/8 in each" },
  { label: "Monitor load", value: "Approx. 66 lb" },
];

function App() {
  const [page, setPage] = useState<"requirements" | "variants" | "configuration">("requirements");
  const [selectedId, setSelectedId] = useState<SceneOptionId>("wood-underframe");
  const [explode, setExplode] = useState(0.15);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showCables, setShowCables] = useState(true);
  const [showHardware, setShowHardware] = useState(true);
  const [enabledFeatures, setEnabledFeatures] = useState<Record<OptionalFeatureId, boolean>>({
    trays: true,
    "drink-holders": true,
    power: false,
    "dice-rail": false,
  });

  const selected = useMemo(
    () => designOptions.find((option) => option.id === selectedId) ?? designOptions[0],
    [selectedId]
  );

  const openConfiguration = (id: SceneOptionId) => {
    setSelectedId(id);
    setPage("configuration");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const featureStateForModel = useMemo(() => {
    return optionalFeatures.reduce<Record<OptionalFeatureId, boolean>>(
      (state, feature) => {
        state[feature.id] = feature.reusableAcross.includes(selected.id) && enabledFeatures[feature.id];
        return state;
      },
      { trays: false, "drink-holders": false, power: false, "dice-rail": false }
    );
  }, [enabledFeatures, selected.id]);

  const toggleFeature = (id: OptionalFeatureId) => {
    setEnabledFeatures((features) => ({ ...features, [id]: !features[id] }));
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Knock-down gaming table</p>
          <h1>D&D Table Design Explorer</h1>
        </div>
        <nav className="page-tabs" aria-label="Explorer pages">
          <button className={page === "requirements" ? "active" : ""} onClick={() => setPage("requirements")}>1. Requirements</button>
          <button className={page === "variants" ? "active" : ""} onClick={() => setPage("variants")}>2. Variants</button>
          <button className={page === "configuration" ? "active" : ""} onClick={() => setPage("configuration")}>Configuration</button>
        </nav>
      </header>

      {page === "requirements" && (
        <main className="page-shell">
          <section className="hero-panel">
            <p className="eyebrow">Page 1</p>
            <h2>Requirements by priority</h2>
            <p>Start here to separate constraints that cannot move from preferences and upgrades that can be toggled per configuration.</p>
          </section>
          <section className="requirements-grid">
            {requirementGroups.map((group) => (
              <article className={`requirement-card ${group.tone}`} key={group.label}>
                <h3>{group.label}</h3>
                <ul>
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </section>
          <footer className="page-actions">
            <button className="primary-action" onClick={() => setPage("variants")}>Continue to variant table</button>
          </footer>
        </main>
      )}

      {page === "variants" && (
        <main className="page-shell">
          <section className="hero-panel">
            <p className="eyebrow">Page 2</p>
            <h2>Variant table</h2>
            <p>Click any row to drill into a dedicated configuration page with the live model and feature toggles.</p>
          </section>
          <section className="panel">
            <div className="variant-table-wrap">
              <table className="variant-table">
                <thead>
                  <tr><th>Rank</th><th>Variant</th><th>Best use</th><th>Strengths</th><th>Tradeoffs</th></tr>
                </thead>
                <tbody>
                  {designOptions.map((option) => (
                    <tr key={option.id} onClick={() => openConfiguration(option.id)} tabIndex={0} onKeyDown={(event) => event.key === "Enter" && openConfiguration(option.id)}>
                      <td><span className="rank">{option.rank}</span></td>
                      <td><strong>{option.name}</strong><small>{option.tagline}</small></td>
                      <td>{option.bestUse}</td>
                      <td>{option.strengths.slice(0, 2).join("; ")}</td>
                      <td>{option.tradeoffs.slice(0, 2).join("; ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}

      {page === "configuration" && (
        <main className="workspace">
          <aside className="control-panel" aria-label="Configuration controls">
            <button className="text-action" onClick={() => setPage("variants")}>← Back to variant table</button>
            <section className="selected-brief">
              <p className="eyebrow">Dedicated configuration</p>
              <h2>{selected.name}</h2>
              <p>{selected.summary}</p>
              <dl><div><dt>Best use</dt><dd>{selected.bestUse}</dd></div></dl>
            </section>

            <section className="control-section">
              <div className="section-heading"><Layers3 size={18} /><h2>Optional Features</h2></div>
              <div className="feature-list">
                {optionalFeatures.map((feature) => {
                  const available = feature.reusableAcross.includes(selected.id);
                  const active = available && enabledFeatures[feature.id];

                  return (
                    <button
                      key={feature.id}
                      className={`feature-button ${active ? "active" : ""}`}
                      onClick={() => available && toggleFeature(feature.id)}
                      aria-disabled={!available}
                      aria-pressed={active}
                    >
                      <strong>{available ? (active ? "Enabled" : "Disabled") : "Not compatible"}: {feature.label}</strong>
                      <span>{feature.description}</span>
                      <small>Reusable on: {feature.reusableAcross.length} variants</small>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="control-section">
              <div className="section-heading"><SlidersHorizontal size={18} /><h2>Model Layers</h2></div>
              <div className="toggle-row">
                <ToggleButton active={showDimensions} label="Dimensions" icon={Ruler} onClick={() => setShowDimensions((value) => !value)} />
                <ToggleButton active={showHardware} label="Hardware" icon={Wrench} onClick={() => setShowHardware((value) => !value)} />
                <ToggleButton active={showCables} label="Cables" icon={Cable} onClick={() => setShowCables((value) => !value)} />
              </div>
              <label className="range-control"><span>Exploded view</span><input type="range" min="0" max="1" step="0.01" value={explode} onChange={(event) => setExplode(Number(event.target.value))} /></label>
            </section>
          </aside>

          <section className="viewer-shell" aria-label="Interactive 3D table model">
            <TableScene optionId={selected.id} explode={explode} showDimensions={showDimensions} showCables={showCables} showHardware={showHardware} optionalFeatures={featureStateForModel} />
            <div className="viewer-hud"><div><p className="eyebrow">Current model</p><strong>{selected.shortName}</strong></div><div className="hud-metrics"><span>Top: {dimensions.tableWidth} x {dimensions.tableLength} in</span><span>Opening: {dimensions.monitorOpeningLength} x {dimensions.monitorOpeningWidth} in</span></div></div>
          </section>
        </main>
      )}
    </div>
  );
}

function ToggleButton({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button className={`toggle-button ${active ? "active" : ""}`} onClick={onClick} aria-pressed={active}>
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function PlanView() {
  const openingStyle: CSSProperties = {
    left: `${(dimensions.openingX1 / dimensions.tableLength) * 100}%`,
    width: `${(dimensions.monitorOpeningLength / dimensions.tableLength) * 100}%`,
    top: `${(dimensions.openingY1 / dimensions.tableWidth) * 100}%`,
    height: `${(dimensions.monitorOpeningWidth / dimensions.tableWidth) * 100}%`,
  };

  const dmStyle: CSSProperties = {
    left: `${(dimensions.openingX2 / dimensions.tableLength) * 100}%`,
    width: `${(dimensions.dmZone / dimensions.tableLength) * 100}%`,
  };

  const farStyle: CSSProperties = {
    width: `${(dimensions.farZone / dimensions.tableLength) * 100}%`,
  };

  return (
    <div className="plan-wrap">
      <div className="plan-surface" aria-label="Plan view of table">
        <div className="plan-zone far" style={farStyle}>
          <span>Far zone 17.875 in</span>
        </div>
        <div className="plan-zone dm" style={dmStyle}>
          <span>DM work zone 30 in</span>
        </div>
        <div className="plan-monitor" style={openingStyle}>
          <span>Flush monitor opening</span>
          <strong>50.125 x 29.25 in</strong>
        </div>
        <div className="plan-seam" />
        <div className="plan-edge-label length">98 in length</div>
        <div className="plan-edge-label width">50 in width</div>
      </div>
      <div className="plan-notes">
        <span>X = 0 at far end</span>
        <span>X = 98 at DM end</span>
        <span>Center seam at Y = 25</span>
      </div>
    </div>
  );
}

export default App;
