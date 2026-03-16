import React, { useEffect, useMemo, useRef, useState } from "react";

// Repère 1/6 — constantes, design system, données et helpers
const WORKING_STORAGE = "potager_v3_premium_working";
const SAVED_STORAGE = "potager_v3_premium_saved";

const structures = {
  empty: {
    label: "Vide",
    icon: "·",
    color: "rgba(255,255,255,0.10)",
    stroke: "rgba(255,255,255,0.16)",
    priority: 0,
  },
  soil: {
    label: "Terre / culture",
    icon: "🪴",
    color: "rgba(72, 52, 37, 0.75)",
    stroke: "rgba(244, 192, 149, 0.45)",
    priority: 2,
  },
  path: {
    label: "Allée",
    icon: "🪨",
    color: "rgba(141, 127, 120, 0.68)",
    stroke: "rgba(255,255,255,0.22)",
    priority: 1,
  },
  grass: {
    label: "Pelouse",
    icon: "🌿",
    color: "rgba(59, 130, 98, 0.72)",
    stroke: "rgba(168, 255, 202, 0.32)",
    priority: 1,
  },
  terrace: {
    label: "Terrasse",
    icon: "🟫",
    color: "rgba(150, 95, 66, 0.74)",
    stroke: "rgba(255,214,182,0.32)",
    priority: 1,
  },
  fence: {
    label: "Clôture bois",
    icon: "🪵",
    color: "rgba(133, 84, 53, 0.76)",
    stroke: "rgba(255, 214, 166, 0.24)",
    priority: 1,
  },
  wall: {
    label: "Mur",
    icon: "🧱",
    color: "rgba(98, 107, 126, 0.82)",
    stroke: "rgba(226,232,240,0.18)",
    priority: 1,
  },
  greenhouse: {
    label: "Serre",
    icon: "🏕️",
    color: "rgba(58, 170, 158, 0.72)",
    stroke: "rgba(186,255,247,0.30)",
    priority: 2,
  },
  shade: {
    label: "Ombre",
    icon: "🌳",
    color: "rgba(68, 77, 94, 0.78)",
    stroke: "rgba(255,255,255,0.16)",
    priority: 1,
  },
};

const crops = {
  none: { label: "Aucune culture", icon: "", color: "transparent", water: 0, sunNeed: 0, potMin: 0, potIdeal: [], vibe: "" },
  tomate: { label: "Tomate", icon: "🍅", color: "#ff6b6b", water: 1.2, sunNeed: 3, potMin: 30, potIdeal: [35, 40, 50], vibe: "chaud" },
  tomateCerise: { label: "Tomate cerise", icon: "🍅", color: "#ff9b73", water: 1.1, sunNeed: 3, potMin: 25, potIdeal: [30, 35, 40], vibe: "chaud" },
  piment: { label: "Piment", icon: "🌶️", color: "#ff5a5f", water: 0.8, sunNeed: 3, potMin: 22, potIdeal: [25, 30, 35], vibe: "chaud" },
  poivron: { label: "Poivron", icon: "🫑", color: "#ffb84d", water: 0.9, sunNeed: 3, potMin: 25, potIdeal: [30, 35, 40], vibe: "chaud" },
  salade: { label: "Salade", icon: "🥬", color: "#90d26d", water: 0.6, sunNeed: 1, potMin: 18, potIdeal: [20, 25], vibe: "frais" },
  basilic: { label: "Basilic", icon: "🌿", color: "#5ed88d", water: 0.5, sunNeed: 2, potMin: 16, potIdeal: [18, 20, 25], vibe: "chaud" },
  persil: { label: "Persil", icon: "🌱", color: "#64c26a", water: 0.4, sunNeed: 1, potMin: 16, potIdeal: [18, 20, 25], vibe: "frais" },
  fleurs: { label: "Fleurs utiles", icon: "🌼", color: "#ffd166", water: 0.3, sunNeed: 2, potMin: 18, potIdeal: [20, 25, 30], vibe: "mixte" },
};

const structureOptions = ["soil", "grass", "path", "terrace", "fence", "wall", "greenhouse", "shade", "empty"];
const cropOptions = ["none", "tomate", "tomateCerise", "piment", "poivron", "salade", "basilic", "persil", "fleurs"];
const sunlightOptions = [0, 1, 2, 3];
const orientations = [
  { value: "south", label: "Terrasse en bas / lumière sud" },
  { value: "north", label: "Terrasse en haut / lumière nord" },
  { value: "east", label: "Terrasse à droite / lumière est" },
  { value: "west", label: "Terrasse à gauche / lumière ouest" },
];
const planPresets = [
  { label: "Petit 4×4", rows: 4, cols: 4 },
  { label: "Carré 6×6", rows: 6, cols: 6 },
  { label: "Longueur 4×10", rows: 4, cols: 10 },
  { label: "Jardin 8×8", rows: 8, cols: 8 },
  { label: "Grand 10×12", rows: 10, cols: 12 },
];

function uid() {
  return `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function createCell(row, col) {
  return {
    id: uid(),
    row,
    col,
    structure: "empty",
    crop: "none",
    sun: 2,
    note: "",
    potIds: [],
  };
}

function createGrid(rows = 6, cols = 8) {
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      cells.push(createCell(row, col));
    }
  }
  return cells;
}

function createDefaultState() {
  return {
    rows: 6,
    cols: 8,
    orientation: "south",
    zoom: 48,
    aiEnabled: true,
    photoPreview: "",
    photoName: "",
    diagnosis: {
      brightSide: "south",
      shadedSide: "north",
      windSide: "west",
      confidence: "moyenne",
      note: "Jardin encore en lecture assistée. Ajuste les côtés lumineux et ombragés si besoin.",
    },
    cells: createGrid(6, 8),
    selectedCellId: null,
    clipboard: null,
    brushMode: false,
    activeTool: {
      structure: "soil",
      crop: "none",
      sun: 2,
      note: "",
    },
    quickPanelOpen: true,
    rightRailOpen: true,
    fullscreenPlan: false,
    contextMenu: null,
    liveWeather: {
      temp: 18,
      wind: 12,
      label: "Météo locale simulée",
    },
    reminderSeed: [
      { id: uid(), level: "today", text: "Vérifier l’humidité de la zone la plus chaude." },
      { id: uid(), level: "watch", text: "Tour de plan rapide conseillé avant la tombée du jour." },
    ],
    pots: [],
    pendingPotIds: [],
    activePotId: null,
    potBuilder: {
      count: 3,
      diameter: 30,
    },
    savedAt: null,
    planTitle: "Mon potager premium",
  };
}

function normalizeState(raw) {
  const fallback = createDefaultState();
  const rows = clamp(Number(raw?.rows || fallback.rows), 2, 18);
  const cols = clamp(Number(raw?.cols || fallback.cols), 2, 18);
  const sourceCells = Array.isArray(raw?.cells) ? raw.cells : createGrid(rows, cols);
  const map = new Map();
  sourceCells.forEach((cell) => {
    const key = `${Number(cell.row)}-${Number(cell.col)}`;
    map.set(key, {
      id: cell.id || uid(),
      row: Number(cell.row),
      col: Number(cell.col),
      structure: structures[cell.structure] ? cell.structure : "empty",
      crop: crops[cell.crop] ? cell.crop : "none",
      sun: clamp(Number(cell.sun ?? 2), 0, 3),
      note: cell.note || "",
      potIds: Array.isArray(cell.potIds) ? cell.potIds : [],
    });
  });
  const cells = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const key = `${row}-${col}`;
      cells.push(
        map.get(key) || {
          id: uid(),
          row,
          col,
          structure: "empty",
          crop: "none",
          sun: 2,
          note: "",
          potIds: [],
        }
      );
    }
  }

  return {
    ...fallback,
    ...raw,
    rows,
    cols,
    orientation: orientations.some((item) => item.value === raw?.orientation)
      ? raw.orientation
      : fallback.orientation,
    zoom: clamp(Number(raw?.zoom || fallback.zoom), 28, 76),
    aiEnabled: raw?.aiEnabled ?? fallback.aiEnabled,
    photoPreview: raw?.photoPreview || "",
    photoName: raw?.photoName || "",
    diagnosis: {
      ...fallback.diagnosis,
      ...(raw?.diagnosis || {}),
    },
    cells,
    selectedCellId: cells.some((cell) => cell.id === raw?.selectedCellId)
      ? raw.selectedCellId
      : null,
    clipboard: raw?.clipboard
      ? {
          structure: structures[raw.clipboard.structure] ? raw.clipboard.structure : "soil",
          crop: crops[raw.clipboard.crop] ? raw.clipboard.crop : "none",
          sun: clamp(Number(raw.clipboard.sun ?? 2), 0, 3),
          note: raw.clipboard.note || "",
        }
      : null,
    brushMode: Boolean(raw?.brushMode),
    activeTool: {
      structure: structures[raw?.activeTool?.structure] ? raw.activeTool.structure : fallback.activeTool.structure,
      crop: crops[raw?.activeTool?.crop] ? raw.activeTool.crop : fallback.activeTool.crop,
      sun: clamp(Number(raw?.activeTool?.sun ?? fallback.activeTool.sun), 0, 3),
      note: raw?.activeTool?.note || "",
    },
    quickPanelOpen: raw?.quickPanelOpen ?? fallback.quickPanelOpen,
    rightRailOpen: raw?.rightRailOpen ?? fallback.rightRailOpen,
    fullscreenPlan: raw?.fullscreenPlan ?? fallback.fullscreenPlan,
    contextMenu: null,
    liveWeather: { ...fallback.liveWeather, ...(raw?.liveWeather || {}) },
    reminderSeed: Array.isArray(raw?.reminderSeed) ? raw.reminderSeed : fallback.reminderSeed,
    pots: Array.isArray(raw?.pots)
      ? raw.pots.map((pot) => ({
          id: pot.id || uid(),
          diameter: clamp(Number(pot.diameter || 20), 10, 120),
          cropSuggestion: crops[pot.cropSuggestion] ? pot.cropSuggestion : suggestCropForDiameter(pot.diameter || 20),
          placedCellId: pot.placedCellId || null,
          note: pot.note || "",
          label: pot.label || `Pot ${pot.diameter || 20} cm`,
        }))
      : [],
    pendingPotIds: Array.isArray(raw?.pendingPotIds) ? raw.pendingPotIds : [],
    activePotId: raw?.activePotId || null,
    potBuilder: {
      count: clamp(Number(raw?.potBuilder?.count || fallback.potBuilder.count), 1, 20),
      diameter: clamp(Number(raw?.potBuilder?.diameter || fallback.potBuilder.diameter), 12, 100),
    },
    savedAt: raw?.savedAt || null,
    planTitle: raw?.planTitle || fallback.planTitle,
  };
}

function serializeState(state) {
  return JSON.stringify({
    rows: state.rows,
    cols: state.cols,
    orientation: state.orientation,
    zoom: state.zoom,
    aiEnabled: state.aiEnabled,
    photoPreview: state.photoPreview,
    photoName: state.photoName,
    diagnosis: state.diagnosis,
    cells: state.cells,
    selectedCellId: state.selectedCellId,
    clipboard: state.clipboard,
    brushMode: state.brushMode,
    activeTool: state.activeTool,
    quickPanelOpen: state.quickPanelOpen,
    rightRailOpen: state.rightRailOpen,
    fullscreenPlan: state.fullscreenPlan,
    liveWeather: state.liveWeather,
    reminderSeed: state.reminderSeed,
    pots: state.pots,
    pendingPotIds: state.pendingPotIds,
    activePotId: state.activePotId,
    potBuilder: state.potBuilder,
    savedAt: state.savedAt,
    planTitle: state.planTitle,
  });
}

function buildGradientBackground() {
  return {
    background: `
      radial-gradient(circle at 12% 18%, rgba(255, 174, 188, 0.25), transparent 22%),
      radial-gradient(circle at 86% 22%, rgba(120, 119, 255, 0.30), transparent 24%),
      radial-gradient(circle at 48% 78%, rgba(255, 212, 126, 0.18), transparent 26%),
      linear-gradient(135deg, #101223 0%, #1b2651 28%, #5a2a7f 58%, #f06f83 82%, #ffd0a8 100%)
    `,
  };
}

function glassCardStyle(heavy = false) {
  return {
    background: heavy ? "rgba(16, 18, 35, 0.62)" : "rgba(18, 22, 42, 0.46)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 24,
    boxShadow: "0 16px 60px rgba(0,0,0,0.22)",
  };
}

function smallChip(active) {
  return {
    padding: "8px 10px",
    borderRadius: 999,
    border: active ? "1px solid rgba(255,255,255,0.28)" : "1px solid rgba(255,255,255,0.10)",
    background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: "nowrap",
  };
}

function strongButton(color = "#7c4dff") {
  return {
    background: `linear-gradient(135deg, ${color}, rgba(255,255,255,0.10))`,
    color: "white",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 14,
    padding: "11px 14px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 30px rgba(0,0,0,0.16)",
  };
}

function softButton() {
  return {
    background: "rgba(255,255,255,0.08)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
  };
}

function fieldStyle() {
  return {
    width: "100%",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.08)",
    color: "white",
    padding: "11px 12px",
    outline: "none",
    boxSizing: "border-box",
  };
}

function getOrientationScore(row, col, rows, cols, brightSide) {
  if (brightSide === "south") return row / Math.max(rows - 1, 1);
  if (brightSide === "north") return 1 - row / Math.max(rows - 1, 1);
  if (brightSide === "east") return col / Math.max(cols - 1, 1);
  return 1 - col / Math.max(cols - 1, 1);
}

function effectiveSun(cell, state) {
  const cellRow = cell.row;
  const cellCol = cell.col;
  const orient = getOrientationScore(
    cellRow,
    cellCol,
    state.rows,
    state.cols,
    state.diagnosis?.brightSide || state.orientation
  );
  const shadePenalty = getOrientationScore(
    cellRow,
    cellCol,
    state.rows,
    state.cols,
    state.diagnosis?.shadedSide || "north"
  );
  let score = Number(cell.sun || 0) + orient * 1.3 - shadePenalty * 0.8;
  if (cell.structure === "shade") score -= 1.2;
  if (cell.structure === "greenhouse") score += 0.7;
  if (cell.structure === "wall") score -= 0.8;
  return clamp(Math.round(score), 0, 3);
}

function scoreCellForCrop(cell, state, cropKey) {
  const crop = crops[cropKey] || crops.none;
  const sun = effectiveSun(cell, state);
  if (["wall", "fence"].includes(cell.structure)) return -999;
  if (cell.structure === "terrace" && cropKey !== "none") return -70;
  let score = 0;
  score += 30 - Math.abs(crop.sunNeed - sun) * 10;
  if (cell.structure === "soil") score += 18;
  if (cell.structure === "greenhouse" && crop.vibe === "chaud") score += 22;
  if (cell.structure === "shade" && crop.vibe === "frais") score += 10;
  if (cell.structure === "grass") score -= 3;
  if (state.aiEnabled) {
    if ((state.liveWeather.temp || 18) < 10 && crop.vibe === "chaud") score -= 8;
    if ((state.liveWeather.temp || 18) > 26 && crop.vibe === "frais") score -= 5;
  }
  if (cell.crop !== "none" && cell.crop !== cropKey) score -= 18;
  if (cell.potIds?.length) score += 2;
  return score;
}

function scoreCellForPot(cell, state, pot) {
  if (["wall", "fence"].includes(cell.structure)) return -999;
  let score = 0;
  if (["terrace", "path"].includes(cell.structure)) score += 18;
  if (["grass", "empty"].includes(cell.structure)) score += 6;
  if (cell.structure === "soil") score += 8;
  if (cell.structure === "greenhouse" && crops[pot.cropSuggestion]?.vibe === "chaud") score += 14;
  score += scoreCellForCrop(cell, state, pot.cropSuggestion) * 0.6;
  score -= (cell.potIds?.length || 0) * 8;
  return score;
}

function suggestCropForDiameter(diameter) {
  const size = Number(diameter || 20);
  if (size >= 35) return "tomate";
  if (size >= 30) return "poivron";
  if (size >= 24) return "piment";
  if (size >= 20) return "basilic";
  return "salade";
}

function getBestCellsForCrop(cells, state, cropKey, count = 6) {
  return [...cells]
    .map((cell) => ({ cell, score: scoreCellForCrop(cell, state, cropKey) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .filter((item) => item.score > -50);
}

function getBestCellsForPot(cells, state, pot, count = 6) {
  return [...cells]
    .map((cell) => ({ cell, score: scoreCellForPot(cell, state, pot) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .filter((item) => item.score > -50);
}

function buildCellTooltip(cell, state, potsById) {
  const structure = structures[cell.structure]?.label || "Structure";
  const crop = crops[cell.crop]?.label || "Culture";
  const sun = effectiveSun(cell, state);
  const pots = (cell.potIds || []).map((id) => potsById[id]).filter(Boolean);
  const potText = pots.length ? ` • ${pots.length} pot${pots.length > 1 ? "s" : ""}` : "";
  return `${structure}${crop !== "Aucune culture" ? ` • ${crop}` : ""} • soleil ${sun}/3${potText}`;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function Step({ index, title, active, done }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        opacity: active || done ? 1 : 0.55,
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          background: active ? "linear-gradient(135deg,#ffd166,#ef476f)" : done ? "rgba(89, 203, 145, 0.9)" : "rgba(255,255,255,0.12)",
          color: active || done ? "#111827" : "white",
          fontWeight: 900,
          fontSize: 12,
        }}
      >
        {index}
      </div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.86)", fontWeight: 700 }}>{title}</div>
    </div>
  );
}

function Pill({ children, color = "rgba(255,255,255,0.12)" }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: color,
        color: "white",
        border: "1px solid rgba(255,255,255,0.10)",
      }}
    >
      {children}
    </div>
  );
}

function RightContextMenu({ menu, onClose, onChoose }) {
  if (!menu) return null;
  return (
    <div
      style={{
        position: "fixed",
        left: menu.x,
        top: menu.y,
        zIndex: 80,
        width: 220,
        padding: 10,
        ...glassCardStyle(true),
      }}
      onMouseLeave={onClose}
    >
      <div style={{ display: "grid", gap: 6 }}>
        {menu.items.map((item) => (
          <button
            key={item.key}
            onClick={() => onChoose(item.key)}
            style={{
              ...softButton(),
              textAlign: "left",
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Repère 2/6 — composant principal, persistance, interactions globales
export default function App() {
  const [state, setState] = useState(() => normalizeState(safeRead(WORKING_STORAGE, createDefaultState())));
  const [savedSnapshot, setSavedSnapshot] = useState(() => safeRead(SAVED_STORAGE, serializeState(normalizeState(createDefaultState()))));
  const [mobileTab, setMobileTab] = useState("plan");
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
  const [planVersions, setPlanVersions] = useState(() => safeRead("potager_v3_saved_versions", []));
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(WORKING_STORAGE, serializeState(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(SAVED_STORAGE, savedSnapshot);
  }, [savedSnapshot]);

  useEffect(() => {
    localStorage.setItem("potager_v3_saved_versions", JSON.stringify(planVersions));
  }, [planVersions]);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    const beforeUnload = (event) => {
      if (serializeState(state) !== savedSnapshot) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const closeContext = () => setState((prev) => ({ ...prev, contextMenu: null }));

    window.addEventListener("resize", handleResize);
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("click", closeContext);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("click", closeContext);
    };
  }, [state, savedSnapshot]);

  const isMobile = screenWidth <= 980;
  const isCompact = screenWidth <= 700;
  const potsById = useMemo(() => Object.fromEntries(state.pots.map((pot) => [pot.id, pot])), [state.pots]);
  const selectedCell = useMemo(
    () => state.cells.find((cell) => cell.id === state.selectedCellId) || null,
    [state.cells, state.selectedCellId]
  );
  const activePot = useMemo(
    () => state.pots.find((pot) => pot.id === state.activePotId) || null,
    [state.pots, state.activePotId]
  );
  const unsaved = serializeState(state) !== savedSnapshot;

  function setField(patch) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  function patchCells(updater) {
    setState((prev) => ({ ...prev, cells: updater(prev.cells) }));
  }

  function updateCell(cellId, updater) {
    patchCells((cells) =>
      cells.map((cell) => {
        if (cell.id !== cellId) return cell;
        const next = updater(cell);
        return {
          ...cell,
          ...next,
          structure: structures[next.structure ?? cell.structure] ? next.structure ?? cell.structure : cell.structure,
          crop: crops[next.crop ?? cell.crop] ? next.crop ?? cell.crop : cell.crop,
          sun: clamp(Number(next.sun ?? cell.sun), 0, 3),
          note: next.note ?? cell.note,
          potIds: Array.isArray(next.potIds ?? cell.potIds) ? next.potIds ?? cell.potIds : cell.potIds,
        };
      })
    );
  }

  function savePlan() {
    const serialized = serializeState({ ...state, savedAt: new Date().toISOString() });
    setSavedSnapshot(serialized);
    setState((prev) => ({ ...prev, savedAt: new Date().toISOString() }));
    const nextVersion = {
      id: uid(),
      title: state.planTitle,
      savedAt: new Date().toLocaleString(),
      payload: serialized,
    };
    setPlanVersions((prev) => [nextVersion, ...prev].slice(0, 8));
  }

  function restorePlan() {
    setState(normalizeState(JSON.parse(savedSnapshot)));
  }

  function applyPreset(rows, cols) {
    const nextCells = createGrid(rows, cols);
    setState((prev) => ({
      ...prev,
      rows,
      cols,
      cells: nextCells,
      selectedCellId: null,
      activePotId: null,
      pendingPotIds: [],
    }));
  }

  function growGrid(addRows, addCols) {
    const rows = clamp(state.rows + addRows, 2, 18);
    const cols = clamp(state.cols + addCols, 2, 18);
    const oldMap = new Map(state.cells.map((cell) => [`${cell.row}-${cell.col}`, cell]));
    const nextCells = [];
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const found = oldMap.get(`${row}-${col}`);
        nextCells.push(
          found || {
            id: uid(),
            row,
            col,
            structure: "empty",
            crop: "none",
            sun: 2,
            note: "",
            potIds: [],
          }
        );
      }
    }
    setState((prev) => ({ ...prev, rows, cols, cells: nextCells }));
  }

  function buildClipboardFromTool() {
    setState((prev) => ({
      ...prev,
      clipboard: deepClone(prev.activeTool),
      brushMode: true,
      activePotId: null,
      pendingPotIds: [],
    }));
  }

  function copySelectedCell() {
    if (!selectedCell) return;
    setState((prev) => ({
      ...prev,
      clipboard: {
        structure: selectedCell.structure,
        crop: selectedCell.crop,
        sun: selectedCell.sun,
        note: selectedCell.note,
      },
      brushMode: true,
      activePotId: null,
    }));
  }

  function clearCell(cellId) {
    const cell = state.cells.find((item) => item.id === cellId);
    if (!cell) return;
    const detachedPotIds = cell.potIds || [];
    setState((prev) => ({
      ...prev,
      pots: prev.pots.map((pot) =>
        detachedPotIds.includes(pot.id) ? { ...pot, placedCellId: null } : pot
      ),
      pendingPotIds: [...new Set([...prev.pendingPotIds, ...detachedPotIds])],
      cells: prev.cells.map((item) =>
        item.id === cellId
          ? { ...item, structure: "empty", crop: "none", sun: 2, note: "", potIds: [] }
          : item
      ),
    }));
  }

  function placeClipboardOnCell(cellId) {
    if (!state.clipboard) return;
    updateCell(cellId, () => ({ ...state.clipboard }));
  }

  function createPots() {
    const count = clamp(Number(state.potBuilder.count || 1), 1, 20);
    const diameter = clamp(Number(state.potBuilder.diameter || 30), 12, 100);
    const created = Array.from({ length: count }, (_, index) => ({
      id: uid(),
      diameter,
      cropSuggestion: suggestCropForDiameter(diameter),
      placedCellId: null,
      note: "",
      label: `Pot ${index + 1} • ${diameter} cm`,
    }));
    setState((prev) => ({
      ...prev,
      pots: [...prev.pots, ...created],
      pendingPotIds: [...prev.pendingPotIds, ...created.map((pot) => pot.id)],
      activePotId: created[0]?.id || prev.activePotId,
      brushMode: false,
    }));
    if (isMobile) setMobileTab("pots");
  }

  function placePotOnCell(cellId) {
    if (!activePot) return;
    const cell = state.cells.find((item) => item.id === cellId);
    if (!cell || ["wall", "fence"].includes(cell.structure)) return;
    setState((prev) => ({
      ...prev,
      pots: prev.pots.map((pot) => (pot.id === activePot.id ? { ...pot, placedCellId: cellId } : pot)),
      pendingPotIds: prev.pendingPotIds.filter((id) => id !== activePot.id),
      activePotId: prev.pendingPotIds.filter((id) => id !== activePot.id)[0] || null,
      cells: prev.cells.map((item) => {
        if (item.id === cellId && !item.potIds.includes(activePot.id)) {
          return { ...item, potIds: [...item.potIds, activePot.id] };
        }
        return item;
      }),
    }));
  }

  function removePotFromCell(potId) {
    setState((prev) => ({
      ...prev,
      pots: prev.pots.map((pot) => (pot.id === potId ? { ...pot, placedCellId: null } : pot)),
      pendingPotIds: prev.pendingPotIds.includes(potId) ? prev.pendingPotIds : [...prev.pendingPotIds, potId],
      cells: prev.cells.map((cell) =>
        cell.potIds.includes(potId)
          ? { ...cell, potIds: cell.potIds.filter((id) => id !== potId) }
          : cell
      ),
    }));
  }

  function autoPlacePendingPots() {
    if (!state.pendingPotIds.length) return;
    let nextCells = [...state.cells];
    let nextPots = [...state.pots];
    const nextPending = [];
    state.pendingPotIds.forEach((potId) => {
      const pot = nextPots.find((item) => item.id === potId);
      if (!pot) return;
      const best = getBestCellsForPot(nextCells, state, pot, 1)[0];
      if (!best) {
        nextPending.push(potId);
        return;
      }
      nextPots = nextPots.map((item) => (item.id === potId ? { ...item, placedCellId: best.cell.id } : item));
      nextCells = nextCells.map((cell) =>
        cell.id === best.cell.id ? { ...cell, potIds: [...new Set([...(cell.potIds || []), potId])] } : cell
      );
    });
    setState((prev) => ({
      ...prev,
      pots: nextPots,
      cells: nextCells,
      pendingPotIds: nextPending,
      activePotId: nextPending[0] || null,
    }));
  }

  function openPhotoPicker() {
    fileInputRef.current?.click();
  }

  function loadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setState((prev) => ({
        ...prev,
        photoPreview: String(reader.result || ""),
        photoName: file.name,
        diagnosis: {
          ...prev.diagnosis,
          confidence: "assistée",
          note: "Photo chargée : le diagnostic reste guidé, mais les suggestions IA gagnent en contexte.",
        },
      }));
    };
    reader.readAsDataURL(file);
  }

  function onCellClick(cell) {
    if (state.activePotId) {
      placePotOnCell(cell.id);
      return;
    }
    if (state.brushMode && state.clipboard) {
      placeClipboardOnCell(cell.id);
      setState((prev) => ({ ...prev, selectedCellId: cell.id }));
      return;
    }
    setState((prev) => ({ ...prev, selectedCellId: cell.id }));
  }

  function onCellRightClick(event, cell) {
    event.preventDefault();
    event.stopPropagation();
    setState((prev) => ({
      ...prev,
      selectedCellId: cell.id,
      contextMenu: {
        cellId: cell.id,
        x: event.clientX,
        y: event.clientY,
        items: [
          { key: "copy", label: "Copier la case comme pinceau" },
          { key: "paste", label: prev.clipboard ? "Coller le pinceau ici" : "Aucun modèle à coller" },
          { key: "quick-soil", label: "Passer en terre / culture" },
          { key: "quick-wall", label: "Marquer mur" },
          { key: "quick-fence", label: "Tracer clôture" },
          { key: "quick-terrace", label: "Marquer terrasse" },
          { key: "erase", label: "Vider la case" },
        ],
      },
    }));
  }

  function handleContextAction(key) {
    const menu = state.contextMenu;
    if (!menu) return;
    const cellId = menu.cellId;
    if (key === "copy") copySelectedCell();
    if (key === "paste" && state.clipboard) placeClipboardOnCell(cellId);
    if (key === "quick-soil") updateCell(cellId, () => ({ structure: "soil", crop: "none" }));
    if (key === "quick-wall") updateCell(cellId, () => ({ structure: "wall", crop: "none" }));
    if (key === "quick-fence") updateCell(cellId, () => ({ structure: "fence", crop: "none" }));
    if (key === "quick-terrace") updateCell(cellId, () => ({ structure: "terrace", crop: "none" }));
    if (key === "erase") clearCell(cellId);
    setField({ contextMenu: null });
  }

  // Repère 3/6 — calculs, suggestions, états vivants et widgets
  const placedPots = useMemo(() => state.pots.filter((pot) => pot.placedCellId), [state.pots]);
  const pendingPots = useMemo(
    () => state.pendingPotIds.map((id) => state.pots.find((pot) => pot.id === id)).filter(Boolean),
    [state.pendingPotIds, state.pots]
  );
  const totalCultivatedCells = useMemo(
    () => state.cells.filter((cell) => cell.crop !== "none" || cell.structure === "soil").length,
    [state.cells]
  );
  const dailyWater = useMemo(
    () =>
      state.cells.reduce((sum, cell) => sum + (crops[cell.crop]?.water || 0), 0) +
      placedPots.reduce((sum, pot) => sum + (crops[pot.cropSuggestion]?.water || 0) * 0.6, 0),
    [state.cells, placedPots]
  );
  const planMood = useMemo(() => {
    if (pendingPots.length) return "Pots en attente de placement";
    if (unsaved) return "Plan modifié, pense à sauvegarder";
    if (state.aiEnabled) return "Assistant IA actif sur le plan";
    return "Plan stable";
  }, [pendingPots.length, unsaved, state.aiEnabled]);

  const selectedCellAdvice = useMemo(() => {
    if (!selectedCell) return null;
    const bestForCell = cropOptions
      .filter((key) => key !== "none")
      .map((key) => ({ key, score: scoreCellForCrop(selectedCell, state, key) }))
      .sort((a, b) => b.score - a.score)[0];
    const potsInCell = (selectedCell.potIds || []).map((id) => potsById[id]).filter(Boolean);
    const baseText = bestForCell
      ? `${crops[bestForCell.key].icon} Meilleure piste : ${crops[bestForCell.key].label}`
      : "Analyse indisponible";
    let why = "";
    if (bestForCell) {
      const sun = effectiveSun(selectedCell, state);
      why = `soleil ${sun}/3, structure ${structures[selectedCell.structure]?.label.toLowerCase()}`;
      if (state.photoName) why += ", photo prise en compte dans le diagnostic assisté";
    }
    return {
      baseText,
      why,
      potsInCell,
      bestForCell,
    };
  }, [selectedCell, state, potsById]);

  const activeHighlightCellIds = useMemo(() => {
    if (state.activePotId && activePot) {
      return getBestCellsForPot(state.cells, state, activePot, 8).map((item) => item.cell.id);
    }
    if (state.brushMode && state.clipboard?.crop && state.clipboard.crop !== "none") {
      return getBestCellsForCrop(state.cells, state, state.clipboard.crop, 8).map((item) => item.cell.id);
    }
    if (state.activeTool.crop !== "none") {
      return getBestCellsForCrop(state.cells, state, state.activeTool.crop, 6).map((item) => item.cell.id);
    }
    return [];
  }, [state, activePot]);

  const overdueCount = useMemo(() => {
    const hotCells = state.cells.filter((cell) => scoreCellForCrop(cell, state, cell.crop) < 0 && cell.crop !== "none").length;
    return hotCells;
  }, [state.cells, state]);

  const todayCount = useMemo(() => {
    const hotWeather = state.liveWeather.temp > 26 ? 2 : 0;
    return pendingPots.length + hotWeather;
  }, [pendingPots.length, state.liveWeather.temp]);

  const liveBanner = useMemo(() => {
    const parts = [];
    parts.push(`${state.liveWeather.temp}°C`);
    parts.push(`vent ${state.liveWeather.wind} km/h`);
    parts.push(overdueCount ? `${overdueCount} zone${overdueCount > 1 ? "s" : ""} à revoir` : "aucun retard critique");
    parts.push(todayCount ? `${todayCount} point${todayCount > 1 ? "s" : ""} à suivre` : "journée calme");
    parts.push(unsaved ? "modifs non sauvegardées" : "plan sauvegardé");
    return parts.join(" • ");
  }, [state.liveWeather.temp, state.liveWeather.wind, overdueCount, todayCount, unsaved]);

  function getCellStatus(cell) {
    const cropScore = cell.crop !== "none" ? scoreCellForCrop(cell, state, cell.crop) : 8;
    if (cropScore < -10) return "danger";
    if (cropScore < 6) return "warn";
    if (state.liveWeather.temp > 28 && effectiveSun(cell, state) >= 3) return "heat";
    if (cell.potIds?.length) return "pot";
    return "ok";
  }

  function cellStatusStyle(status, selected, highlighted) {
    const base = {
      ok: {
        ring: "rgba(255,255,255,0.10)",
        shadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      },
      warn: {
        ring: "rgba(255, 204, 102, 0.75)",
        shadow: "0 0 0 1px rgba(255,204,102,0.32), 0 0 18px rgba(255,204,102,0.20)",
      },
      danger: {
        ring: "rgba(255, 107, 107, 0.88)",
        shadow: "0 0 0 1px rgba(255,107,107,0.34), 0 0 18px rgba(255,107,107,0.22)",
      },
      heat: {
        ring: "rgba(255, 148, 91, 0.86)",
        shadow: "0 0 0 1px rgba(255,148,91,0.34), 0 0 18px rgba(255,148,91,0.22)",
      },
      pot: {
        ring: "rgba(132, 201, 255, 0.82)",
        shadow: "0 0 0 1px rgba(132,201,255,0.32), 0 0 18px rgba(132,201,255,0.20)",
      },
    }[status];
    return {
      border: selected ? "2px solid rgba(255,255,255,0.88)" : `1px solid ${highlighted ? "rgba(255,255,255,0.40)" : base.ring}`,
      boxShadow: highlighted
        ? "0 0 0 1px rgba(255,255,255,0.34), 0 0 24px rgba(255,255,255,0.18)"
        : selected
          ? "0 0 0 2px rgba(255,255,255,0.88), 0 0 28px rgba(255,255,255,0.16)"
          : base.shadow,
    };
  }

  // Repère 4/6 — rendu du plan, cellules, panneau flottant et menu de création/pinceau
  function renderPlan() {
    const cellSize = isCompact ? clamp(state.zoom - 4, 28, 60) : state.zoom;
    return (
      <div
        style={{
          position: "relative",
          padding: isMobile ? 12 : 16,
          minHeight: state.fullscreenPlan ? "calc(100vh - 110px)" : 520,
          ...glassCardStyle(true),
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `
              radial-gradient(circle at 16% 20%, rgba(255,255,255,0.14), transparent 18%),
              radial-gradient(circle at 86% 18%, rgba(255,255,255,0.10), transparent 18%),
              radial-gradient(circle at 50% 100%, rgba(255,209,143,0.18), transparent 26%)
            `,
          }}
        />

        <div style={{ display: "grid", gap: 14, position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ color: "white", fontWeight: 900, fontSize: isMobile ? 22 : 28 }}>
                {state.planTitle}
              </div>
              <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 13 }}>{liveBanner}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => setField({ quickPanelOpen: !state.quickPanelOpen })} style={softButton()}>
                {state.quickPanelOpen ? "Masquer outils" : "Outils"}
              </button>
              <button onClick={() => setField({ rightRailOpen: !state.rightRailOpen })} style={softButton()}>
                {state.rightRailOpen ? "Masquer rail" : "Rail"}
              </button>
              <button onClick={() => setField({ fullscreenPlan: !state.fullscreenPlan })} style={softButton()}>
                {state.fullscreenPlan ? "Quitter plein écran" : "Plein écran"}
              </button>
              <button onClick={savePlan} style={strongButton("#22c55e")}>💾 Sauvegarder</button>
            </div>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Pill color="rgba(255,255,255,0.14)">Orientation : {orientations.find((item) => item.value === state.orientation)?.label.split(" /")[0]}</Pill>
                <Pill color="rgba(255,255,255,0.14)">Mode : {state.brushMode ? "Pinceau actif" : state.activePotId ? "Placement pots" : "Sélection"}</Pill>
                <Pill color={unsaved ? "rgba(255,126,95,0.26)" : "rgba(46, 204, 113, 0.22)"}>{unsaved ? "Modifs non sauvegardées" : "Version enregistrée"}</Pill>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.78)", fontSize: 12 }}>Zoom</span>
                <input
                  type="range"
                  min={28}
                  max={76}
                  step={2}
                  value={state.zoom}
                  onChange={(e) => setField({ zoom: Number(e.target.value) })}
                />
              </div>
            </div>

            {state.quickPanelOpen ? (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: isMobile ? "1fr" : "1.3fr 1fr 1fr 1fr",
                }}
              >
                <div style={{ ...glassCardStyle(), padding: 12, display: "grid", gap: 10 }}>
                  <div style={{ color: "white", fontWeight: 800 }}>Atelier de case</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {structureOptions.map((key) => (
                      <button
                        key={key}
                        onClick={() => setState((prev) => ({ ...prev, activeTool: { ...prev.activeTool, structure: key } }))}
                        style={smallChip(state.activeTool.structure === key)}
                      >
                        {structures[key].icon} {structures[key].label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {cropOptions.map((key) => (
                      <button
                        key={key}
                        onClick={() => setState((prev) => ({ ...prev, activeTool: { ...prev.activeTool, crop: key } }))}
                        style={smallChip(state.activeTool.crop === key)}
                      >
                        {crops[key].icon || "•"} {crops[key].label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {sunlightOptions.map((value) => (
                      <button
                        key={value}
                        onClick={() => setState((prev) => ({ ...prev, activeTool: { ...prev.activeTool, sun: value } }))}
                        style={smallChip(state.activeTool.sun === value)}
                      >
                        ☀ {value}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={buildClipboardFromTool} style={strongButton("#7c3aed")}>Créer le pinceau</button>
                    <button onClick={() => setField({ brushMode: !state.brushMode, activePotId: null })} style={softButton()}>
                      {state.brushMode ? "Désactiver pinceau" : "Activer pinceau"}
                    </button>
                    <button onClick={copySelectedCell} style={softButton()} disabled={!selectedCell}>
                      Copier sélection
                    </button>
                  </div>
                </div>

                <div style={{ ...glassCardStyle(), padding: 12, display: "grid", gap: 10 }}>
                  <div style={{ color: "white", fontWeight: 800 }}>Formats rapides</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {planPresets.map((preset) => (
                      <button key={preset.label} onClick={() => applyPreset(preset.rows, preset.cols)} style={smallChip(false)}>
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
                    <button onClick={() => growGrid(1, 0)} style={softButton()}>+1 ligne</button>
                    <button onClick={() => growGrid(0, 1)} style={softButton()}>+1 colonne</button>
                    <button onClick={() => growGrid(2, 0)} style={softButton()}>+2 lignes</button>
                    <button onClick={() => growGrid(0, 2)} style={softButton()}>+2 colonnes</button>
                  </div>
                </div>

                <div style={{ ...glassCardStyle(), padding: 12, display: "grid", gap: 10 }}>
                  <div style={{ color: "white", fontWeight: 800 }}>Pots</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <label style={{ color: "rgba(255,255,255,0.76)", fontSize: 12 }}>
                      Nombre
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={state.potBuilder.count}
                        onChange={(e) => setState((prev) => ({ ...prev, potBuilder: { ...prev.potBuilder, count: Number(e.target.value) } }))}
                        style={fieldStyle()}
                      />
                    </label>
                    <label style={{ color: "rgba(255,255,255,0.76)", fontSize: 12 }}>
                      Diamètre (cm)
                      <input
                        type="number"
                        min={12}
                        max={100}
                        value={state.potBuilder.diameter}
                        onChange={(e) => setState((prev) => ({ ...prev, potBuilder: { ...prev.potBuilder, diameter: Number(e.target.value) } }))}
                        style={fieldStyle()}
                      />
                    </label>
                    <button onClick={createPots} style={strongButton("#f97316")}>Créer les pots</button>
                    <button onClick={autoPlacePendingPots} style={softButton()} disabled={!pendingPots.length}>Placement suggéré IA</button>
                  </div>
                </div>

                <div style={{ ...glassCardStyle(), padding: 12, display: "grid", gap: 10 }}>
                  <div style={{ color: "white", fontWeight: 800 }}>Diagnostic IA</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <button onClick={openPhotoPicker} style={softButton()}>
                      {state.photoName ? `📷 ${state.photoName}` : "Ajouter une photo du jardin"}
                    </button>
                    <label style={{ color: "rgba(255,255,255,0.76)", fontSize: 12 }}>
                      Côté lumineux
                      <select
                        value={state.diagnosis.brightSide}
                        onChange={(e) => setState((prev) => ({ ...prev, diagnosis: { ...prev.diagnosis, brightSide: e.target.value } }))}
                        style={fieldStyle()}
                      >
                        {orientations.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
                      </select>
                    </label>
                    <label style={{ color: "rgba(255,255,255,0.76)", fontSize: 12 }}>
                      Côté ombragé
                      <select
                        value={state.diagnosis.shadedSide}
                        onChange={(e) => setState((prev) => ({ ...prev, diagnosis: { ...prev.diagnosis, shadedSide: e.target.value } }))}
                        style={fieldStyle()}
                      >
                        {orientations.map((item) => <option key={item.value} value={item.value}>{item.value}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: !isMobile && state.rightRailOpen ? "1fr 320px" : "1fr",
                gap: 14,
                alignItems: "start",
              }}
            >
              <div
                style={{
                  position: "relative",
                  minHeight: 420,
                  padding: 12,
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                  overflow: "auto",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${state.cols}, ${cellSize}px)`,
                    gap: 6,
                    minWidth: "max-content",
                    paddingBottom: 8,
                  }}
                >
                  {state.cells.map((cell) => {
                    const structure = structures[cell.structure];
                    const crop = crops[cell.crop];
                    const selected = cell.id === state.selectedCellId;
                    const highlighted = activeHighlightCellIds.includes(cell.id);
                    const status = getCellStatus(cell);
                    const styleState = cellStatusStyle(status, selected, highlighted);
                    const sunValue = effectiveSun(cell, state);
                    const cellPots = (cell.potIds || []).map((id) => potsById[id]).filter(Boolean);
                    const opacity = cell.structure === "empty" && cell.crop === "none" && !cellPots.length ? 0.88 : 1;
                    return (
                      <button
                        key={cell.id}
                        title={buildCellTooltip(cell, state, potsById)}
                        onClick={() => onCellClick(cell)}
                        onDoubleClick={() => setField({ selectedCellId: cell.id, rightRailOpen: true })}
                        onContextMenu={(event) => onCellRightClick(event, cell)}
                        style={{
                          width: cellSize,
                          height: cellSize,
                          borderRadius: 16,
                          background: `linear-gradient(180deg, ${structure.color}, rgba(255,255,255,0.04))`,
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer",
                          opacity,
                          transition: "transform 120ms ease, box-shadow 160ms ease, border 160ms ease",
                          ...styleState,
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: crop.color !== "transparent"
                              ? `radial-gradient(circle at 70% 30%, ${crop.color}55, transparent 46%)`
                              : "transparent",
                            pointerEvents: "none",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            padding: 5,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            color: "white",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                            <span style={{ fontSize: 10, opacity: 0.9 }}>{structure.icon}</span>
                            <span style={{
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              background:
                                status === "danger" ? "#ff6b6b" :
                                status === "warn" ? "#ffd166" :
                                status === "heat" ? "#ff9f68" :
                                status === "pot" ? "#7bdff2" : "#59d98e",
                            }} />
                          </div>
                          <div style={{ display: "grid", placeItems: "center", gap: 2 }}>
                            <span style={{ fontSize: cellSize < 40 ? 14 : 16 }}>{crop.icon || (cellPots.length ? "🪴" : "")}</span>
                            {cellPots.length ? (
                              <div style={{ fontSize: 9, fontWeight: 900, lineHeight: 1, background: "rgba(255,255,255,0.12)", borderRadius: 999, padding: "2px 5px" }}>
                                {cellPots.length} pot
                              </div>
                            ) : null}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 9, fontWeight: 800, opacity: 0.86 }}>{sunValue}</span>
                            {cell.crop !== "none" ? <span style={{ fontSize: 9, opacity: 0.84 }}>{cell.crop.slice(0, 2).toUpperCase()}</span> : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {!isMobile && state.rightRailOpen ? renderRightRail() : null}
            </div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={loadPhoto} />
      </div>
    );
  }

  function renderRightRail() {
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ ...glassCardStyle(), padding: 14, display: "grid", gap: 10 }}>
          <div style={{ color: "white", fontWeight: 800, fontSize: 16 }}>Case sélectionnée</div>
          {selectedCell ? (
            <>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Pill color="rgba(255,255,255,0.12)">{structures[selectedCell.structure].icon} {structures[selectedCell.structure].label}</Pill>
                {selectedCell.crop !== "none" ? <Pill color="rgba(255,255,255,0.12)">{crops[selectedCell.crop].icon} {crops[selectedCell.crop].label}</Pill> : null}
                <Pill color="rgba(255,255,255,0.12)">☀ {effectiveSun(selectedCell, state)}/3</Pill>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label style={{ color: "rgba(255,255,255,0.76)", fontSize: 12 }}>
                  Structure
                  <select
                    value={selectedCell.structure}
                    onChange={(e) => updateCell(selectedCell.id, () => ({ structure: e.target.value }))}
                    style={fieldStyle()}
                  >
                    {structureOptions.map((key) => <option key={key} value={key}>{structures[key].label}</option>)}
                  </select>
                </label>
                <label style={{ color: "rgba(255,255,255,0.76)", fontSize: 12 }}>
                  Culture
                  <select
                    value={selectedCell.crop}
                    onChange={(e) => updateCell(selectedCell.id, () => ({ crop: e.target.value }))}
                    style={fieldStyle()}
                  >
                    {cropOptions.map((key) => <option key={key} value={key}>{crops[key].label}</option>)}
                  </select>
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {sunlightOptions.map((value) => (
                    <button key={value} onClick={() => updateCell(selectedCell.id, () => ({ sun: value }))} style={smallChip(selectedCell.sun === value)}>
                      ☀ {value}
                    </button>
                  ))}
                </div>
                <textarea
                  value={selectedCell.note}
                  onChange={(e) => updateCell(selectedCell.id, () => ({ note: e.target.value }))}
                  placeholder="Note rapide pour cette case"
                  style={{ ...fieldStyle(), minHeight: 74, resize: "vertical" }}
                />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={copySelectedCell} style={softButton()}>Copier comme pinceau</button>
                  <button onClick={() => clearCell(selectedCell.id)} style={softButton()}>Vider</button>
                </div>
              </div>

              {selectedCellAdvice ? (
                <div style={{ display: "grid", gap: 8, padding: 12, borderRadius: 18, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ color: "white", fontWeight: 800 }}>Suggestion IA</div>
                  <div style={{ color: "white", fontSize: 14 }}>{selectedCellAdvice.baseText}</div>
                  <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 12 }}>{selectedCellAdvice.why}</div>
                  {selectedCellAdvice.potsInCell.length ? (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {selectedCellAdvice.potsInCell.map((pot) => (
                        <button key={pot.id} onClick={() => removePotFromCell(pot.id)} style={smallChip(false)}>
                          🪴 {pot.diameter} cm
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.74)", fontSize: 13 }}>Clique une case pour l’éditer, la copier ou lancer le pinceau.</div>
          )}
        </div>

        <div style={{ ...glassCardStyle(), padding: 14, display: "grid", gap: 10 }}>
          <div style={{ color: "white", fontWeight: 800 }}>Pots en attente</div>
          {pendingPots.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {pendingPots.slice(0, 6).map((pot) => {
                const best = getBestCellsForPot(state.cells, state, pot, 1)[0];
                return (
                  <button
                    key={pot.id}
                    onClick={() => setField({ activePotId: pot.id, brushMode: false })}
                    style={{
                      ...softButton(),
                      textAlign: "left",
                      border: state.activePotId === pot.id ? "1px solid rgba(255,255,255,0.34)" : "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    🪴 {pot.label} • suggéré {crops[pot.cropSuggestion].label}
                    {best ? ` • meilleure case ${best.cell.row + 1}.${best.cell.col + 1}` : ""}
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.74)", fontSize: 13 }}>Aucun pot en attente. Crée un lot de pots ou utilise le placement IA.</div>
          )}
        </div>
      </div>
    );
  }

  // Repère 5/6 — layout premium desktop/mobile, widgets vivants, inspirations visuelles intégrées
  function renderTopHero() {
    return (
      <div
        style={{
          ...glassCardStyle(true),
          padding: isMobile ? 18 : 26,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -40,
            top: -30,
            width: 260,
            height: 260,
            background: "radial-gradient(circle, rgba(255,209,143,0.34) 0%, rgba(255,209,143,0) 70%)",
            filter: "blur(10px)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: -40,
            bottom: -90,
            width: 360,
            height: 220,
            background: "radial-gradient(circle, rgba(124,77,255,0.26) 0%, rgba(124,77,255,0) 70%)",
            filter: "blur(12px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "grid", gap: 6, maxWidth: 760 }}>
              <div style={{ color: "rgba(255,255,255,0.70)", textTransform: "uppercase", letterSpacing: 1.6, fontSize: 12, fontWeight: 800 }}>
                Version 3 premium avec pots • plan vivant • pinceau copier/coller
              </div>
              <div style={{ color: "white", fontWeight: 900, lineHeight: 1.02, fontSize: isMobile ? 34 : 56 }}>
                Un plan de potager
                <span style={{ display: "block", color: "#ffd8a8" }}>plus beau, plus rapide, plus vivant.</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.82)", maxWidth: 720, fontSize: isMobile ? 14 : 16, lineHeight: 1.6 }}>
                Le plan devient ton objet principal : tu poses tes structures, tu copies/colles comme un pinceau, tu ajoutes des pots,
                et l’assistant IA t’indique les meilleures zones selon l’exposition, la météo et le diagnostic assisté par photo.
              </div>
            </div>

            <div style={{ display: "grid", gap: 10, minWidth: isMobile ? "100%" : 280, alignContent: "start" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
                <div style={{ ...glassCardStyle(), padding: 14 }}>
                  <div style={{ color: "rgba(255,255,255,0.64)", fontSize: 12 }}>Cases</div>
                  <div style={{ color: "white", fontWeight: 900, fontSize: 28 }}>{state.rows * state.cols}</div>
                </div>
                <div style={{ ...glassCardStyle(), padding: 14 }}>
                  <div style={{ color: "rgba(255,255,255,0.64)", fontSize: 12 }}>Pots</div>
                  <div style={{ color: "white", fontWeight: 900, fontSize: 28 }}>{state.pots.length}</div>
                </div>
                <div style={{ ...glassCardStyle(), padding: 14 }}>
                  <div style={{ color: "rgba(255,255,255,0.64)", fontSize: 12 }}>Culture utile</div>
                  <div style={{ color: "white", fontWeight: 900, fontSize: 28 }}>{totalCultivatedCells}</div>
                </div>
                <div style={{ ...glassCardStyle(), padding: 14 }}>
                  <div style={{ color: "rgba(255,255,255,0.64)", fontSize: 12 }}>Eau / jour</div>
                  <div style={{ color: "white", fontWeight: 900, fontSize: 28 }}>{dailyWater.toFixed(1)}L</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={savePlan} style={strongButton("#22c55e")}>Sauvegarder</button>
                <button onClick={restorePlan} style={softButton()}>Restaurer</button>
                <button onClick={() => setField({ fullscreenPlan: !state.fullscreenPlan })} style={softButton()}>
                  {state.fullscreenPlan ? "Quitter focus" : "Focus plan"}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill color="rgba(255,255,255,0.10)">🌦 {state.liveWeather.temp}°C • vent {state.liveWeather.wind}</Pill>
            <Pill color="rgba(255,255,255,0.10)">🧠 {planMood}</Pill>
            <Pill color="rgba(255,255,255,0.10)">📷 {state.photoName ? "photo chargée" : "pas de photo"}</Pill>
            <Pill color="rgba(255,255,255,0.10)">🪴 {pendingPots.length} pot(s) à placer</Pill>
            <Pill color="rgba(255,255,255,0.10)">{unsaved ? "✍️ modifié" : "✅ sauvegardé"}</Pill>
          </div>
        </div>
      </div>
    );
  }

  function renderAssistantCards() {
    const aiTopCrop = state.activeTool.crop !== "none" ? state.activeTool.crop : "tomate";
    const bestCells = getBestCellsForCrop(state.cells, state, aiTopCrop, 5);
    return (
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr" }}>
        <div style={{ ...glassCardStyle(), padding: 14, display: "grid", gap: 8 }}>
          <div style={{ color: "white", fontWeight: 800 }}>Conseil IA principal</div>
          <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.5 }}>
            {state.aiEnabled
              ? `Pour ${crops[aiTopCrop].label}, l’assistant privilégie les cellules les plus ${crops[aiTopCrop].vibe === "chaud" ? "chaudes" : "fraîches"} et exposées sur le côté ${state.diagnosis.brightSide}.`
              : "L’assistant est désactivé : active-le pour obtenir des suggestions de placement et de pots."}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {bestCells.map((item) => (
              <Pill key={item.cell.id} color="rgba(255,255,255,0.10)">Case {item.cell.row + 1}.{item.cell.col + 1}</Pill>
            ))}
          </div>
        </div>

        <div style={{ ...glassCardStyle(), padding: 14, display: "grid", gap: 8 }}>
          <div style={{ color: "white", fontWeight: 800 }}>Diagnostic du jardin</div>
          <div style={{ color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.5 }}>
            Côté lumineux : <strong>{state.diagnosis.brightSide}</strong> • côté ombragé : <strong>{state.diagnosis.shadedSide}</strong> • vent probable : <strong>{state.diagnosis.windSide}</strong>.
          </div>
          <div style={{ color: "rgba(255,255,255,0.64)", fontSize: 13 }}>{state.diagnosis.note}</div>
        </div>

        <div style={{ ...glassCardStyle(), padding: 14, display: "grid", gap: 8 }}>
          <div style={{ color: "white", fontWeight: 800 }}>Suivi vivant</div>
          {state.reminderSeed.slice(0, 3).map((item) => (
            <div key={item.id} style={{ color: "rgba(255,255,255,0.80)", fontSize: 14, lineHeight: 1.45 }}>
              {item.level === "today" ? "🟠" : "🔵"} {item.text}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "white",
        fontFamily: "Inter, Arial, sans-serif",
        padding: isMobile ? 12 : 18,
        boxSizing: "border-box",
        ...buildGradientBackground(),
      }}
    >
      <div style={{ maxWidth: 1700, margin: "0 auto", display: "grid", gap: 16 }}>
        {renderTopHero()}

        {isMobile ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["plan", "Plan"],
              ["atelier", "Atelier"],
              ["pots", "Pots"],
              ["assistant", "Assistant"],
              ["case", "Case"],
            ].map(([value, label]) => (
              <button key={value} onClick={() => setMobileTab(value)} style={smallChip(mobileTab === value)}>
                {label}
              </button>
            ))}
          </div>
        ) : null}

        {!isMobile || mobileTab === "plan" ? renderPlan() : null}

        {!isMobile || mobileTab === "atelier" ? (
          <div style={{ display: isMobile && mobileTab !== "atelier" ? "none" : "grid", gap: 12 }}>
            {renderAssistantCards()}
          </div>
        ) : null}

        {isMobile && mobileTab === "pots" ? (
          <div style={{ ...glassCardStyle(true), padding: 16, display: "grid", gap: 12 }}>
            <div style={{ color: "white", fontWeight: 900, fontSize: 20 }}>Gestion des pots</div>
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.74)" }}>
                Nombre
                <input type="number" min={1} max={20} value={state.potBuilder.count} onChange={(e) => setState((prev) => ({ ...prev, potBuilder: { ...prev.potBuilder, count: Number(e.target.value) } }))} style={fieldStyle()} />
              </label>
              <label style={{ fontSize: 13, color: "rgba(255,255,255,0.74)" }}>
                Diamètre
                <input type="number" min={12} max={100} value={state.potBuilder.diameter} onChange={(e) => setState((prev) => ({ ...prev, potBuilder: { ...prev.potBuilder, diameter: Number(e.target.value) } }))} style={fieldStyle()} />
              </label>
              <button onClick={createPots} style={strongButton("#f97316")}>Créer les pots</button>
              <button onClick={autoPlacePendingPots} style={softButton()} disabled={!pendingPots.length}>Placement IA</button>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {state.pots.map((pot) => (
                <div key={pot.id} style={{ ...glassCardStyle(), padding: 12, display: "grid", gap: 4 }}>
                  <div style={{ fontWeight: 800 }}>{pot.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>Suggestion : {crops[pot.cropSuggestion].label}</div>
                  <div style={{ color: "rgba(255,255,255,0.62)", fontSize: 12 }}>{pot.placedCellId ? "Déjà placé" : "En attente"}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {isMobile && mobileTab === "assistant" ? renderAssistantCards() : null}

        {isMobile && mobileTab === "case" ? (
          <div style={{ ...glassCardStyle(true), padding: 16 }}>{renderRightRail()}</div>
        ) : null}
      </div>

      <RightContextMenu
        menu={state.contextMenu}
        onClose={() => setField({ contextMenu: null })}
        onChoose={handleContextAction}
      />
    </div>
  );
}

// Repère 6/6 — fin du fichier
