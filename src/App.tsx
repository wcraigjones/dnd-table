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
import { TableScene, type SceneOptionId } from "./TableScene";

type DesignOption = {
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

const designOptions: DesignOption[] = [
  {
    id: "wood-underframe",
    rank: 1,
    shortName: "Wood cassette",
    name: "Split top with knock-down wood underframe",
    tagline: "Recommended baseline",
    summary:
      "Two 25 in x 98 in butcher-block halves stay removable. A bolted ladder frame carries the top, aligns the seam, accepts four large legs, and supports an adjustable monitor cassette.",
    bestUse:
      "Best balance of furniture appearance, woodworking feasibility, disassembly, and flush monitor control.",
    strengths: [
      "Natural match to the two-slab top",
      "Four large removable legs remain practical",
      "No mandatory welding or metal fabrication",
      "Monitor cassette can be serviced and leveled",
    ],
    tradeoffs: [
      "Requires accurate seam registration",
      "Narrow side rails need continuous support",
      "Wood movement around the opening must be managed",
    ],
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    id: "trestle-base",
    rank: 6,
    shortName: "Trestle base",
    name: "Pedestal or trestle base with independent cradle",
    tagline: "Strong alternate",
    summary:
      "Two knock-down trestles and a stretcher replace corner legs. The top still splits, and the monitor cradle remains independent.",
    bestUse:
      "Use if four corner legs prove too flexible or awkward and stability outweighs the stated leg preference.",
    strengths: [
      "Stable if the trestles are placed well",
      "Long-side knee clearance can improve",
      "Fewer corner obstructions",
      "Classic furniture language is possible",
    ],
    tradeoffs: [
      "Conflicts with the preferred four-leg look",
      "Pedestal placement must avoid DM and player knees",
      "More visible base design",
    ],
  },
];

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
  const [selectedId, setSelectedId] = useState<SceneOptionId>("wood-underframe");
  const [explode, setExplode] = useState(0.15);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showCables, setShowCables] = useState(true);
  const [showHardware, setShowHardware] = useState(true);
  const [activePhase, setActivePhase] = useState(buildSequence[0].id);

  const selected = useMemo(
    () => designOptions.find((option) => option.id === selectedId) ?? designOptions[0],
    [selectedId]
  );

  const phase = buildSequence.find((item) => item.id === activePhase) ?? buildSequence[0];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Knock-down gaming table</p>
          <h1>D&D Table Design Explorer</h1>
        </div>
        <div className="topbar-badges" aria-label="Project summary">
          <span>Flush 55 in touch monitor</span>
          <span>Two slab top</span>
          <span>Upstairs assembly</span>
        </div>
      </header>

      <main className="workspace">
        <aside className="control-panel" aria-label="Design controls">
          <section className="control-section">
            <div className="section-heading">
              <Layers3 size={18} />
              <h2>Design Variation</h2>
            </div>
            <div className="option-list" role="tablist" aria-label="Table design options">
              {designOptions.map((option) => (
                <button
                  key={option.id}
                  className={`option-button ${option.id === selectedId ? "active" : ""}`}
                  onClick={() => setSelectedId(option.id)}
                  role="tab"
                  aria-selected={option.id === selectedId}
                >
                  <span className="rank">{option.rank}</span>
                  <span>
                    <strong>{option.shortName}</strong>
                    <small>{option.tagline}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="control-section">
            <div className="section-heading">
              <SlidersHorizontal size={18} />
              <h2>Model Layers</h2>
            </div>
            <div className="toggle-row">
              <ToggleButton
                active={showDimensions}
                label="Dimensions"
                icon={Ruler}
                onClick={() => setShowDimensions((value) => !value)}
              />
              <ToggleButton
                active={showHardware}
                label="Hardware"
                icon={Wrench}
                onClick={() => setShowHardware((value) => !value)}
              />
              <ToggleButton
                active={showCables}
                label="Cables"
                icon={Cable}
                onClick={() => setShowCables((value) => !value)}
              />
            </div>
            <label className="range-control">
              <span>Exploded view</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={explode}
                onChange={(event) => setExplode(Number(event.target.value))}
              />
            </label>
          </section>

          <section className="selected-brief">
            <p className="eyebrow">Selected option</p>
            <h2>{selected.name}</h2>
            <p>{selected.summary}</p>
            <dl>
              <div>
                <dt>Best use</dt>
                <dd>{selected.bestUse}</dd>
              </div>
            </dl>
          </section>
        </aside>

        <section className="viewer-shell" aria-label="Interactive 3D table model">
          <TableScene
            optionId={selected.id}
            explode={explode}
            showDimensions={showDimensions}
            showCables={showCables}
            showHardware={showHardware}
          />
          <div className="viewer-hud">
            <div>
              <p className="eyebrow">Current model</p>
              <strong>{selected.shortName}</strong>
            </div>
            <div className="hud-metrics">
              <span>Top: {dimensions.tableWidth} x {dimensions.tableLength} in</span>
              <span>Surface: {dimensions.tableHeight} in high</span>
              <span>Opening: {dimensions.monitorOpeningLength} x {dimensions.monitorOpeningWidth} in</span>
            </div>
          </div>
        </section>
      </main>

      <section className="content-band">
        <div className="metric-grid">
          {metricCards.map((card) => (
            <article className="metric-card" key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="content-grid">
        <article className="panel plan-panel">
          <div className="section-heading">
            <Monitor size={18} />
            <h2>Plan Coordinates</h2>
          </div>
          <PlanView />
        </article>

        <article className="panel">
          <div className="section-heading">
            <ShieldCheck size={18} />
            <h2>Non-negotiables</h2>
          </div>
          <ul className="rule-list">
            {criticalRules.map((rule) => (
              <li key={rule}>
                <AlertTriangle size={16} />
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="content-grid wide-left">
        <article className="panel">
          <div className="section-heading">
            <PackageOpen size={18} />
            <h2>Build Sequence</h2>
          </div>
          <div className="phase-tabs" role="tablist" aria-label="Build phases">
            {buildSequence.map((item) => (
              <button
                key={item.id}
                className={item.id === activePhase ? "active" : ""}
                onClick={() => setActivePhase(item.id)}
                role="tab"
                aria-selected={item.id === activePhase}
              >
                {item.label}
              </button>
            ))}
          </div>
          <ol className="step-list">
            {phase.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </article>

        <article className="panel">
          <div className="section-heading">
            <ClipboardList size={18} />
            <h2>Measure Before CAD</h2>
          </div>
          <div className="compact-groups">
            {measurementGroups.map((group) => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>
      </section>

      <section className="variation-section">
        <div className="section-heading">
          <Layers3 size={18} />
          <h2>Variation Matrix</h2>
        </div>
        <div className="variation-grid">
          {designOptions.map((option) => (
            <article
              className={`variation-card ${option.id === selectedId ? "active" : ""}`}
              key={option.id}
              onClick={() => setSelectedId(option.id)}
            >
              <div className="variation-title">
                <span>{option.rank}</span>
                <h3>{option.name}</h3>
              </div>
              <p>{option.summary}</p>
              <h4>Advantages</h4>
              <ul>
                {option.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <h4>Tradeoffs</h4>
              <ul>
                {option.tradeoffs.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="section-heading">
            <Hammer size={18} />
            <h2>Hardware Palette</h2>
          </div>
          <div className="compact-groups hardware-groups">
            {hardwareGroups.map((group) => (
              <section key={group.label}>
                <h3>{group.label}</h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="section-heading">
            <AlertTriangle size={18} />
            <h2>Risk Register</h2>
          </div>
          <ol className="risk-list">
            {riskItems.map((risk) => (
              <li key={risk}>{risk}</li>
            ))}
          </ol>
        </article>
      </section>

      <footer className="footer-note">
        <CheckCircle2 size={16} />
        <span>
          Default target: split acacia top, four removable legs, movement-friendly top fasteners,
          independent adjustable cassette, exposed flush touch glass, and DM-side cable access.
        </span>
      </footer>
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
