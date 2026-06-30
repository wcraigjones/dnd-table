import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type OptionalFeatureId = "trays" | "drink-holders" | "power" | "dice-rail";

export type SceneOptionId =
  | "wood-underframe"
  | "steel-subframe"
  | "half-modules"
  | "central-insert"
  | "segmented-rails"
  | "trestle-base";

type TableSceneProps = {
  optionId: SceneOptionId;
  explode: number;
  showDimensions: boolean;
  showCables: boolean;
  showHardware: boolean;
  optionalFeatures?: Record<OptionalFeatureId, boolean>;
};

const MODEL = {
  length: 98,
  width: 50,
  height: 29,
  topThickness: 1.5,
  underside: 27.5,
  openingX1: 17.875 - 49,
  openingX2: 68 - 49,
  openingZ1: 10.375 - 25,
  openingZ2: 39.625 - 25,
  monitorLength: 49.8,
  monitorWidth: 29,
  monitorThickness: 3,
};

const X_MIN = -MODEL.length / 2;
const X_MAX = MODEL.length / 2;
const Z_MIN = -MODEL.width / 2;
const Z_MAX = MODEL.width / 2;
const TOP_Y = MODEL.height - MODEL.topThickness / 2;
const TOP_SURFACE_Y = MODEL.height;

export function TableScene({
  optionId,
  explode,
  showDimensions,
  showCables,
  showHardware,
  optionalFeatures = { trays: false, "drink-holders": false, power: false, "dice-rail": false },
}: TableSceneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e9ebe6");
    scene.fog = new THREE.Fog("#e9ebe6", 130, 235);

    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 500);
    camera.position.set(96, 78, 112);
    camera.lookAt(0, 18, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.28;
    controls.minDistance = 70;
    controls.maxDistance = 180;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.target.set(0, 16, 0);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      const narrow = width < 620;
      camera.aspect = width / height;
      camera.fov = narrow ? 48 : 40;
      camera.position.set(narrow ? 118 : 96, narrow ? 84 : 78, narrow ? 132 : 112);
      camera.updateProjectionMatrix();
      controls.update();
      renderer.setSize(width, height, false);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const ambient = new THREE.HemisphereLight("#f8fbff", "#6a5847", 1.6);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight("#ffffff", 2.1);
    keyLight.position.set(-48, 92, 54);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.left = -90;
    keyLight.shadow.camera.right = 90;
    keyLight.shadow.camera.top = 90;
    keyLight.shadow.camera.bottom = -90;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight("#c2e3ff", 0.7);
    fillLight.position.set(64, 48, -68);
    scene.add(fillLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(170, 125),
      new THREE.MeshStandardMaterial({ color: "#d8ddd4", roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.05;
    floor.receiveShadow = true;
    scene.add(floor);

    const materials = createMaterials();
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    buildTableModel(modelGroup, materials, optionId, explode, showCables, showHardware, showDimensions, optionalFeatures);

    const clock = new THREE.Clock();
    let frame = 0;
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const pulse = 0.08 + Math.sin(elapsed * 1.6) * 0.025;
      materials.monitor.emissiveIntensity = pulse;
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      disposeObject(scene);
      container.replaceChildren();
    };
  }, [optionId, explode, showDimensions, showCables, showHardware, optionalFeatures]);

  return <div className="table-scene" ref={containerRef} />;
}

type SceneMaterials = ReturnType<typeof createMaterials>;

function createMaterials() {
  const woodTexture = createWoodTexture();
  const screenTexture = createScreenTexture();

  const wood = new THREE.MeshStandardMaterial({
    color: "#b77943",
    map: woodTexture,
    roughness: 0.58,
    metalness: 0.02,
  });
  const woodDark = new THREE.MeshStandardMaterial({
    color: "#5e3821",
    roughness: 0.64,
  });
  const woodAlt = new THREE.MeshStandardMaterial({
    color: "#93663d",
    map: woodTexture,
    roughness: 0.62,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: "#46525a",
    metalness: 0.65,
    roughness: 0.34,
  });
  const steelDark = new THREE.MeshStandardMaterial({
    color: "#252c31",
    metalness: 0.55,
    roughness: 0.42,
  });
  const black = new THREE.MeshStandardMaterial({
    color: "#050607",
    roughness: 0.5,
  });
  const gasket = new THREE.MeshStandardMaterial({
    color: "#050505",
    roughness: 0.78,
  });
  const monitor = new THREE.MeshStandardMaterial({
    color: "#0a1215",
    map: screenTexture,
    emissive: "#0a4d64",
    emissiveMap: screenTexture,
    emissiveIntensity: 0.08,
    roughness: 0.18,
    metalness: 0.05,
  });
  const hardware = new THREE.MeshStandardMaterial({
    color: "#d1c072",
    metalness: 0.65,
    roughness: 0.28,
  });
  const cable = new THREE.MeshStandardMaterial({
    color: "#1b1e23",
    roughness: 0.55,
  });
  const labelLine = new THREE.LineBasicMaterial({ color: "#1b262d", transparent: true, opacity: 0.76 });
  const highlight = new THREE.MeshStandardMaterial({
    color: "#2f9e73",
    metalness: 0.18,
    roughness: 0.3,
  });

  return {
    wood,
    woodDark,
    woodAlt,
    steel,
    steelDark,
    black,
    gasket,
    monitor,
    hardware,
    cable,
    labelLine,
    highlight,
  };
}

function buildTableModel(
  root: THREE.Group,
  materials: SceneMaterials,
  optionId: SceneOptionId,
  explode: number,
  showCables: boolean,
  showHardware: boolean,
  showDimensions: boolean,
  optionalFeatures: Record<OptionalFeatureId, boolean>
) {
  const isSteel = optionId === "steel-subframe";
  const isHalf = optionId === "half-modules";
  const isInsert = optionId === "central-insert";
  const isRails = optionId === "segmented-rails";
  const isTrestle = optionId === "trestle-base";

  const frameMaterial = isSteel ? materials.steel : materials.woodDark;
  const accentMaterial = isSteel || isInsert ? materials.steelDark : materials.highlight;

  if (isRails) {
    buildSegmentedRailTop(root, materials, explode);
  } else {
    buildSplitTop(root, materials, explode, isHalf);
  }

  addMonitorAssembly(root, materials, explode, isInsert);

  if (isInsert) {
    addInsertFrame(root, materials, explode);
  }

  if (isTrestle) {
    addTrestleBase(root, materials, explode);
  } else {
    addUnderframe(root, frameMaterial, accentMaterial, explode, isHalf, isSteel);
    addCornerLegs(root, materials.woodDark, explode, isHalf);
  }

  if (showHardware) {
    addHardware(root, materials, explode, isSteel);
  }

  if (showCables) {
    addCableRun(root, materials, explode);
  }

  addOptionalFeatures(root, materials, optionalFeatures, explode);

  if (showDimensions) {
    addDimensionGuides(root, materials);
  }
}

function buildSplitTop(root: THREE.Group, materials: SceneMaterials, explode: number, emphasizeHalves: boolean) {
  const split = explode * (emphasizeHalves ? 8.5 : 3.2);
  const lift = explode * 1.6;

  const leftOffset = { x: emphasizeHalves ? -explode * 1.5 : 0, y: lift, z: -split };
  const rightOffset = { x: emphasizeHalves ? explode * 1.5 : 0, y: lift, z: split };

  const leftMat = emphasizeHalves ? materials.woodAlt : materials.wood;
  const rightMat = materials.wood;

  addTopSegment(root, X_MIN, MODEL.openingX1, Z_MIN, 0, leftMat, leftOffset);
  addTopSegment(root, MODEL.openingX2, X_MAX, Z_MIN, 0, leftMat, leftOffset);
  addTopSegment(root, MODEL.openingX1, MODEL.openingX2, Z_MIN, MODEL.openingZ1, leftMat, leftOffset);

  addTopSegment(root, X_MIN, MODEL.openingX1, 0, Z_MAX, rightMat, rightOffset);
  addTopSegment(root, MODEL.openingX2, X_MAX, 0, Z_MAX, rightMat, rightOffset);
  addTopSegment(root, MODEL.openingX1, MODEL.openingX2, MODEL.openingZ2, Z_MAX, rightMat, rightOffset);

  addSeamLines(root, materials.gasket, explode, emphasizeHalves);
}

function buildSegmentedRailTop(root: THREE.Group, materials: SceneMaterials, explode: number) {
  const lift = explode * 1.6;
  const spread = explode * 2.4;

  addTopSegment(root, X_MIN, X_MAX, Z_MIN, MODEL.openingZ1, materials.wood, {
    x: 0,
    y: lift,
    z: -spread,
  });
  addTopSegment(root, X_MIN, X_MAX, MODEL.openingZ2, Z_MAX, materials.wood, {
    x: 0,
    y: lift,
    z: spread,
  });
  addTopSegment(root, X_MIN, MODEL.openingX1, MODEL.openingZ1, MODEL.openingZ2, materials.woodAlt, {
    x: -spread,
    y: lift,
    z: 0,
  });
  addTopSegment(root, MODEL.openingX2, X_MAX, MODEL.openingZ1, MODEL.openingZ2, materials.woodAlt, {
    x: spread,
    y: lift,
    z: 0,
  });

  addBox(root, {
    center: [MODEL.openingX1, TOP_SURFACE_Y + 0.03 + lift, 0],
    size: [0.16, 0.08, MODEL.openingZ2 - MODEL.openingZ1],
    material: materials.gasket,
  });
  addBox(root, {
    center: [MODEL.openingX2, TOP_SURFACE_Y + 0.03 + lift, 0],
    size: [0.16, 0.08, MODEL.openingZ2 - MODEL.openingZ1],
    material: materials.gasket,
  });
}

function addTopSegment(
  root: THREE.Group,
  x1: number,
  x2: number,
  z1: number,
  z2: number,
  material: THREE.Material,
  offset: { x: number; y: number; z: number }
) {
  addBox(root, {
    center: [(x1 + x2) / 2 + offset.x, TOP_Y + offset.y, (z1 + z2) / 2 + offset.z],
    size: [x2 - x1, MODEL.topThickness, z2 - z1],
    material,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
}

function addSeamLines(root: THREE.Group, material: THREE.Material, explode: number, emphasizeHalves: boolean) {
  const lift = explode * 1.6 + 0.04;
  const spread = explode * (emphasizeHalves ? 8.5 : 3.2);
  const gap = 0.12 + explode * 0.08;

  addBox(root, {
    center: [(-49 + MODEL.openingX1) / 2, TOP_SURFACE_Y + lift, -spread / 2],
    size: [MODEL.openingX1 - X_MIN, 0.07, gap],
    material,
  });
  addBox(root, {
    center: [(MODEL.openingX2 + 49) / 2, TOP_SURFACE_Y + lift, -spread / 2],
    size: [X_MAX - MODEL.openingX2, 0.07, gap],
    material,
  });
}

function addMonitorAssembly(root: THREE.Group, materials: SceneMaterials, explode: number, insertMode: boolean) {
  const monitorDrop = explode * 3.8;
  const trayDrop = explode * 6;
  const ringWidth = insertMode ? 1.25 : 0.42;

  addBox(root, {
    center: [(MODEL.openingX1 + MODEL.openingX2) / 2, TOP_SURFACE_Y - 0.03 - monitorDrop, 0],
    size: [MODEL.monitorLength, 0.1, MODEL.monitorWidth],
    material: materials.monitor,
    castShadow: false,
    receiveShadow: true,
    edges: true,
  });

  addBox(root, {
    center: [(MODEL.openingX1 + MODEL.openingX2) / 2, TOP_SURFACE_Y - 1.58 - monitorDrop, 0],
    size: [MODEL.monitorLength + 0.45, MODEL.monitorThickness, MODEL.monitorWidth + 0.45],
    material: materials.black,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });

  addGasketRing(root, materials.gasket, ringWidth, TOP_SURFACE_Y + 0.02, explode * 1.1);

  const trayY = TOP_SURFACE_Y - MODEL.monitorThickness - 1.25 - trayDrop;
  addBox(root, {
    center: [(MODEL.openingX1 + MODEL.openingX2) / 2, trayY, 0],
    size: [MODEL.monitorLength + 5.5, 0.45, 2.2],
    material: materials.steelDark,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
  addBox(root, {
    center: [MODEL.openingX1 - 1.9, trayY, 0],
    size: [1.2, 0.45, MODEL.monitorWidth + 4.5],
    material: materials.steelDark,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
  addBox(root, {
    center: [MODEL.openingX2 + 1.9, trayY, 0],
    size: [1.2, 0.45, MODEL.monitorWidth + 4.5],
    material: materials.steelDark,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
}

function addGasketRing(
  root: THREE.Group,
  material: THREE.Material,
  width: number,
  y: number,
  extraLift: number
) {
  const xCenter = (MODEL.openingX1 + MODEL.openingX2) / 2;
  const zCenter = (MODEL.openingZ1 + MODEL.openingZ2) / 2;
  const openingLength = MODEL.openingX2 - MODEL.openingX1;
  const openingWidth = MODEL.openingZ2 - MODEL.openingZ1;

  addBox(root, {
    center: [xCenter, y + extraLift, MODEL.openingZ1 - width / 2],
    size: [openingLength + width * 2, 0.1, width],
    material,
  });
  addBox(root, {
    center: [xCenter, y + extraLift, MODEL.openingZ2 + width / 2],
    size: [openingLength + width * 2, 0.1, width],
    material,
  });
  addBox(root, {
    center: [MODEL.openingX1 - width / 2, y + extraLift, zCenter],
    size: [width, 0.1, openingWidth],
    material,
  });
  addBox(root, {
    center: [MODEL.openingX2 + width / 2, y + extraLift, zCenter],
    size: [width, 0.1, openingWidth],
    material,
  });
}

function addInsertFrame(root: THREE.Group, materials: SceneMaterials, explode: number) {
  const y = TOP_SURFACE_Y + 0.18 + explode * 1.9;
  addGasketRing(root, materials.steelDark, 1.65, y, 0);
  addBox(root, {
    center: [(MODEL.openingX1 + MODEL.openingX2) / 2, y - 1.8, MODEL.openingZ1 - 2.05],
    size: [MODEL.openingX2 - MODEL.openingX1 + 5.8, 2.8, 0.8],
    material: materials.steel,
    edges: true,
  });
  addBox(root, {
    center: [(MODEL.openingX1 + MODEL.openingX2) / 2, y - 1.8, MODEL.openingZ2 + 2.05],
    size: [MODEL.openingX2 - MODEL.openingX1 + 5.8, 2.8, 0.8],
    material: materials.steel,
    edges: true,
  });
}

function addUnderframe(
  root: THREE.Group,
  material: THREE.Material,
  accent: THREE.Material,
  explode: number,
  emphasizeHalves: boolean,
  steel: boolean
) {
  const y = MODEL.underside - 1.75 - explode * 1.25;
  const railDepth = steel ? 2.25 : 3.5;
  const railThickness = steel ? 1.15 : 1.6;
  const halfSpread = emphasizeHalves ? explode * 5 : 0;

  addBox(root, {
    center: [0, y, Z_MIN + 3.2 - halfSpread],
    size: [90, railDepth, railThickness],
    material,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
  addBox(root, {
    center: [0, y, Z_MAX - 3.2 + halfSpread],
    size: [90, railDepth, railThickness],
    material,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
  addBox(root, {
    center: [X_MIN + 4, y, 0],
    size: [railThickness, railDepth, 43],
    material,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
  addBox(root, {
    center: [X_MAX - 4, y, 0],
    size: [railThickness, railDepth, 43],
    material,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });

  addBox(root, {
    center: [(MODEL.openingX1 + MODEL.openingX2) / 2, y + 0.15, MODEL.openingZ1 - 1.1],
    size: [MODEL.openingX2 - MODEL.openingX1 + 3, railDepth * 0.78, railThickness],
    material: accent,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
  addBox(root, {
    center: [(MODEL.openingX1 + MODEL.openingX2) / 2, y + 0.15, MODEL.openingZ2 + 1.1],
    size: [MODEL.openingX2 - MODEL.openingX1 + 3, railDepth * 0.78, railThickness],
    material: accent,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
  addBox(root, {
    center: [MODEL.openingX1 - 0.8, y + 0.15, 0],
    size: [railThickness, railDepth * 0.78, MODEL.openingZ2 - MODEL.openingZ1 + 3],
    material: accent,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
  addBox(root, {
    center: [MODEL.openingX2 + 0.8, y + 0.15, 0],
    size: [railThickness, railDepth * 0.78, MODEL.openingZ2 - MODEL.openingZ1 + 3],
    material: accent,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });

  if (steel) {
    addBox(root, {
      center: [0, y - 0.35, 0],
      size: [73, 0.85, 1.2],
      material,
      castShadow: true,
      receiveShadow: true,
      edges: true,
    });
  }
}

function addCornerLegs(root: THREE.Group, material: THREE.Material, explode: number, emphasizeHalves: boolean) {
  const legSpread = emphasizeHalves ? explode * 5 : 0;
  const y = MODEL.underside / 2 - explode * 0.7;
  const zLeft = -20.8 - legSpread;
  const zRight = 20.8 + legSpread;
  const xNear = X_MIN + 5;
  const xFar = X_MAX - 5;

  for (const x of [xNear, xFar]) {
    for (const z of [zLeft, zRight]) {
      addBox(root, {
        center: [x, y, z],
        size: [4.2, MODEL.underside, 4.2],
        material,
        castShadow: true,
        receiveShadow: true,
        edges: true,
      });
    }
  }
}

function addTrestleBase(root: THREE.Group, materials: SceneMaterials, explode: number) {
  const y = MODEL.underside / 2 - explode * 0.7;
  const railY = MODEL.underside - 1.5 - explode * 1.1;

  for (const x of [-25, 29]) {
    addBox(root, {
      center: [x, y, 0],
      size: [5.2, MODEL.underside, 5.2],
      material: materials.woodDark,
      castShadow: true,
      receiveShadow: true,
      edges: true,
    });
    addBox(root, {
      center: [x, 1.2, 0],
      size: [17, 2.4, 38],
      material: materials.woodDark,
      castShadow: true,
      receiveShadow: true,
      edges: true,
    });
    addBox(root, {
      center: [x, railY, 0],
      size: [18, 3, 34],
      material: materials.woodDark,
      castShadow: true,
      receiveShadow: true,
      edges: true,
    });
  }

  addBox(root, {
    center: [2, 11, 0],
    size: [63, 3.2, 3.2],
    material: materials.steelDark,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });

  addUnderframe(root, materials.woodDark, materials.highlight, explode, false, false);
}

function addHardware(root: THREE.Group, materials: SceneMaterials, explode: number, steel: boolean) {
  const y = TOP_SURFACE_Y + 0.28 + explode * 1.65;
  const drawBoltXs = [6, 14, 74, 86, 94].map((value) => value - 49);

  for (const x of drawBoltXs) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 3.5, 24), materials.hardware);
    pin.rotation.x = Math.PI / 2;
    pin.position.set(x, y, 0);
    pin.castShadow = true;
    root.add(pin);
  }

  const trayDrop = explode * 6;
  const padY = TOP_SURFACE_Y - MODEL.monitorThickness - 0.58 - trayDrop;
  const supportXs = [
    MODEL.openingX1 + 4,
    (MODEL.openingX1 + MODEL.openingX2) / 2,
    MODEL.openingX2 - 4,
  ];
  const supportZs = [MODEL.openingZ1 + 2.1, MODEL.openingZ2 - 2.1];

  for (const x of supportXs) {
    for (const z of supportZs) {
      const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.2, 20), materials.hardware);
      bolt.position.set(x, padY, z);
      bolt.castShadow = true;
      root.add(bolt);
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.18, 28), steel ? materials.steel : materials.black);
      pad.position.set(x, padY + 1.18, z);
      pad.castShadow = true;
      root.add(pad);
    }
  }
}

function addCableRun(root: THREE.Group, materials: SceneMaterials, explode: number) {
  const drop = explode * 3.8;
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3((MODEL.openingX1 + MODEL.openingX2) / 2 + 16, 25 - drop, MODEL.openingZ2 - 4),
    new THREE.Vector3(21, 22 - drop * 0.5, 18),
    new THREE.Vector3(33, 20, 14),
    new THREE.Vector3(44, 22, 5),
  ]);

  const cable = new THREE.Mesh(new THREE.TubeGeometry(curve, 32, 0.28, 9, false), materials.cable);
  cable.castShadow = true;
  root.add(cable);

  addBox(root, {
    center: [38.5, 21.2, 4],
    size: [17, 1.4, 4.2],
    material: materials.steelDark,
    castShadow: true,
    receiveShadow: true,
    edges: true,
  });
}

function addOptionalFeatures(
  root: THREE.Group,
  materials: SceneMaterials,
  optionalFeatures: Record<OptionalFeatureId, boolean>,
  explode: number
) {
  const y = TOP_SURFACE_Y + 0.35 + explode * 1.2;

  if (optionalFeatures.trays) {
    for (const z of [Z_MIN - 5.2, Z_MAX + 5.2]) {
      addBox(root, {
        center: [-7, y, z],
        size: [34, 0.8, 7.2],
        material: materials.woodAlt,
        castShadow: true,
        receiveShadow: true,
        edges: true,
      });
      addBox(root, {
        center: [-7, y + 0.45, z],
        size: [31, 0.18, 4.6],
        material: materials.gasket,
        edges: true,
      });
    }
  }

  if (optionalFeatures["drink-holders"]) {
    for (const x of [-35, -18, 18, 35]) {
      for (const z of [Z_MIN - 4.8, Z_MAX + 4.8]) {
        const holder = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 1, 36), materials.steelDark);
        holder.position.set(x, y + 0.25, z);
        holder.castShadow = true;
        root.add(holder);
        const recess = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 1.08, 36), materials.black);
        recess.position.set(x, y + 0.32, z);
        root.add(recess);
      }
    }
  }

  if (optionalFeatures.power) {
    addBox(root, {
      center: [35, TOP_SURFACE_Y + 0.42 + explode, Z_MAX - 6.2],
      size: [10, 0.7, 3.6],
      material: materials.steelDark,
      castShadow: true,
      receiveShadow: true,
      edges: true,
    });
    addBox(root, {
      center: [35, TOP_SURFACE_Y + 0.84 + explode, Z_MAX - 6.2],
      size: [6.2, 0.16, 1.6],
      material: materials.black,
    });
  }

  if (optionalFeatures["dice-rail"]) {
    addBox(root, { center: [0, TOP_SURFACE_Y + 0.55 + explode, Z_MIN + 1.1], size: [89, 1.1, 1.1], material: materials.highlight, edges: true });
    addBox(root, { center: [0, TOP_SURFACE_Y + 0.55 + explode, Z_MAX - 1.1], size: [89, 1.1, 1.1], material: materials.highlight, edges: true });
    addBox(root, { center: [X_MIN + 1.1, TOP_SURFACE_Y + 0.55 + explode, 0], size: [1.1, 1.1, 43], material: materials.highlight, edges: true });
    addBox(root, { center: [X_MAX - 1.1, TOP_SURFACE_Y + 0.55 + explode, 0], size: [1.1, 1.1, 43], material: materials.highlight, edges: true });
  }
}

function addDimensionGuides(root: THREE.Group, materials: SceneMaterials) {
  const group = new THREE.Group();
  root.add(group);

  const y = TOP_SURFACE_Y + 4.2;
  const zLength = Z_MIN - 8;
  addLine(group, materials.labelLine, [new THREE.Vector3(X_MIN, y, zLength), new THREE.Vector3(X_MAX, y, zLength)]);
  addLine(group, materials.labelLine, [new THREE.Vector3(X_MIN, y - 1.5, zLength), new THREE.Vector3(X_MIN, y + 1.5, zLength)]);
  addLine(group, materials.labelLine, [new THREE.Vector3(X_MAX, y - 1.5, zLength), new THREE.Vector3(X_MAX, y + 1.5, zLength)]);
  group.add(createLabel("98 in overall length", new THREE.Vector3(0, y + 2.1, zLength)));

  const xWidth = X_MIN - 8;
  addLine(group, materials.labelLine, [new THREE.Vector3(xWidth, y, Z_MIN), new THREE.Vector3(xWidth, y, Z_MAX)]);
  addLine(group, materials.labelLine, [new THREE.Vector3(xWidth, y - 1.5, Z_MIN), new THREE.Vector3(xWidth, y + 1.5, Z_MIN)]);
  addLine(group, materials.labelLine, [new THREE.Vector3(xWidth, y - 1.5, Z_MAX), new THREE.Vector3(xWidth, y + 1.5, Z_MAX)]);
  group.add(createLabel("50 in width", new THREE.Vector3(xWidth - 1.5, y + 2.1, 0)));

  const xOpenCenter = (MODEL.openingX1 + MODEL.openingX2) / 2;
  const zOpenCenter = (MODEL.openingZ1 + MODEL.openingZ2) / 2;
  addLine(group, materials.labelLine, [
    new THREE.Vector3(MODEL.openingX1, TOP_SURFACE_Y + 2, MODEL.openingZ2 + 3.2),
    new THREE.Vector3(MODEL.openingX2, TOP_SURFACE_Y + 2, MODEL.openingZ2 + 3.2),
  ]);
  group.add(createLabel("Monitor opening 50.125 x 29.25 in", new THREE.Vector3(xOpenCenter, TOP_SURFACE_Y + 5.3, zOpenCenter)));

  group.add(createLabel("DM zone 30 in", new THREE.Vector3(34, TOP_SURFACE_Y + 3.4, -10)));
  group.add(createLabel("Top surface 29 in", new THREE.Vector3(X_MAX + 5.8, MODEL.height / 2, Z_MAX - 2)));
}

function addBox(
  root: THREE.Group,
  {
    center,
    size,
    material,
    castShadow = false,
    receiveShadow = false,
    edges = false,
  }: {
    center: [number, number, number];
    size: [number, number, number];
    material: THREE.Material;
    castShadow?: boolean;
    receiveShadow?: boolean;
    edges?: boolean;
  }
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.position.set(center[0], center[1], center[2]);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  root.add(mesh);

  if (edges) {
    const line = new THREE.LineSegments(
      new THREE.EdgesGeometry(mesh.geometry),
      new THREE.LineBasicMaterial({ color: "#15191b", transparent: true, opacity: 0.22 })
    );
    line.position.copy(mesh.position);
    root.add(line);
  }

  return mesh;
}

function addLine(root: THREE.Group, material: THREE.LineBasicMaterial, points: THREE.Vector3[]) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, material);
  root.add(line);
}

function createLabel(text: string, position: THREE.Vector3) {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 192;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.Sprite();
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "rgba(250, 250, 247, 0.9)";
  roundRect(context, 22, 42, canvas.width - 44, 108, 26);
  context.fill();
  context.strokeStyle = "rgba(33, 43, 48, 0.28)";
  context.lineWidth = 3;
  context.stroke();
  context.fillStyle = "#172026";
  context.font = "700 42px system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(24, 6, 1);
  return sprite;
}

function createWoodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#b5773f";
  context.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height; y += 10) {
    const wave = Math.sin(y * 0.065) * 24;
    context.fillStyle = y % 30 === 0 ? "rgba(76, 39, 21, 0.26)" : "rgba(255, 225, 170, 0.16)";
    context.beginPath();
    context.moveTo(0, y);
    for (let x = 0; x <= canvas.width; x += 22) {
      const offset = Math.sin(x * 0.027 + y * 0.05) * 5 + wave;
      context.lineTo(x, y + offset * 0.08);
    }
    context.lineTo(canvas.width, y + 6);
    context.lineTo(0, y + 6);
    context.closePath();
    context.fill();
  }

  for (let x = 0; x < canvas.width; x += 46) {
    context.fillStyle = "rgba(62, 34, 20, 0.11)";
    context.fillRect(x, 0, 2, canvas.height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.2, 1.1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 576;
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#0a1215";
  context.fillRect(0, 0, canvas.width, canvas.height);

  const grid = 48;
  context.strokeStyle = "rgba(68, 179, 190, 0.28)";
  context.lineWidth = 2;
  for (let x = 0; x < canvas.width; x += grid) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, canvas.height);
    context.stroke();
  }
  for (let y = 0; y < canvas.height; y += grid) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(canvas.width, y);
    context.stroke();
  }

  context.fillStyle = "rgba(47, 158, 115, 0.4)";
  context.beginPath();
  context.moveTo(130, 380);
  context.bezierCurveTo(240, 260, 345, 415, 470, 260);
  context.bezierCurveTo(560, 145, 720, 170, 855, 95);
  context.lineTo(900, 180);
  context.bezierCurveTo(730, 240, 630, 300, 540, 410);
  context.bezierCurveTo(390, 540, 245, 450, 130, 512);
  context.closePath();
  context.fill();

  context.strokeStyle = "rgba(226, 214, 137, 0.55)";
  context.lineWidth = 5;
  context.beginPath();
  context.arc(735, 230, 54, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.arc(285, 360, 38, 0, Math.PI * 2);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Sprite) {
      child.geometry?.dispose();
      const material = child.material;
      if (Array.isArray(material)) {
        material.forEach(disposeMaterial);
      } else if (material) {
        disposeMaterial(material);
      }
    }
  });
}

function disposeMaterial(material: THREE.Material) {
  const mapMaterial = material as THREE.Material & {
    map?: THREE.Texture;
    emissiveMap?: THREE.Texture;
  };
  mapMaterial.map?.dispose();
  mapMaterial.emissiveMap?.dispose();
  material.dispose();
}
