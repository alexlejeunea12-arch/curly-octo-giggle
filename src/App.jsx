import React, { useEffect, useMemo, useRef, useState } from "react";

// Repère 1/6 — design system, helpers, données
const WORKING_STORAGE = "potager_v33_working";
const SAVED_STORAGE = "potager_v33_saved";

const structures = {
  empty: { label: "Vide", icon: "·", tone: "rgba(255,255,255,0.10)", stroke: "rgba(255,255,255,0.12)" },
  soil: { label: "Terre / culture", icon: "🪴", tone: "rgba(67,47,34,0.86)", stroke: "rgba(255,190,150,0.26)" },
  path: { label: "Allée", icon: "🪨", tone: "rgba(96,88,86,0.82)", stroke: "rgba(255,255,255,0.13)" },
  grass: { label: "Pelouse", icon: "🌿", tone: "rgba(40,82,56,0.86)", stroke: "rgba(143,255,191,0.18)" },
  terrace: { label: "Terrasse", icon: "🟫", tone: "rgba(122,82,57,0.84)", stroke: "rgba(255,222,190,0.18)" },
  fence: { label: "Clôture bois", icon: "🪵", tone: "rgba(108,68,46,0.84)", stroke: "rgba(255,214,166,0.18)" },
  wall: { label: "Mur", icon: "🧱", tone: "rgba(74,82,96,0.86)", stroke: "rgba(226,232,240,0.15)" },
  greenhouse: { label: "Serre", icon: "🏕️", tone: "rgba(39,111,109,0.86)", stroke: "rgba(186,255,247,0.18)" },
  shade: { label: "Ombre", icon: "🌳", tone: "rgba(51,61,74,0.88)", stroke: "rgba(255,255,255,0.12)" },
};

const crops = {
  none: { label: "Aucune culture", icon: "", accent: "transparent", water: 0, sunNeed: 0, potMin: 0, potIdeal: [], vibe: "" },
  tomate: { label: "Tomate", icon: "🍅", accent: "#ff7a75", water: 1.2, sunNeed: 3, potMin: 30, potIdeal: [35, 40, 50], vibe: "chaud" },
  tomateCerise: { label: "Tomate cerise", icon: "🍅", accent: "#ffb277", water: 1.1, sunNeed: 3, potMin: 25, potIdeal: [30, 35, 40], vibe: "chaud" },
  piment: { label: "Piment", icon: "🌶️", accent: "#ff5f6d", water: 0.8, sunNeed: 3, potMin: 22, potIdeal: [25, 30, 35], vibe: "chaud" },
  poivron: { label: "Poivron", icon: "🫑", accent: "#ffc857", water: 0.9, sunNeed: 3, potMin: 25, potIdeal: [30, 35, 40], vibe: "chaud" },
  salade: { label: "Salade", icon: "🥬", accent: "#96dc82", water: 0.6, sunNeed: 1, potMin: 18, potIdeal: [20, 25], vibe: "frais" },
  basilic: { label: "Basilic", icon: "🌿", accent: "#6ce8a0", water: 0.5, sunNeed: 2, potMin: 16, potIdeal: [18, 20, 25], vibe: "mixte" },
  persil: { label: "Persil", icon: "🌱", accent: "#84d974", water: 0.4, sunNeed: 1, potMin: 16, potIdeal: [18, 20, 25], vibe: "frais" },
  fleurs: { label: "Fleurs utiles", icon: "🌼", accent: "#ffd56d", water: 0.3, sunNeed: 2, potMin: 18, potIdeal: [20, 25, 30], vibe: "mixte" },
};

const structureOptions = ["soil", "grass", "path", "terrace", "fence", "wall", "greenhouse", "shade", "empty"];
const cropOptions = ["none", "tomate", "tomateCerise", "piment", "poivron", "salade", "basilic", "persil", "fleurs"];
const sunlightOptions = [0, 1, 2, 3];
const orientations = ["south", "north", "east", "west"];

const presets = [
  { label: "4×4", rows: 4, cols: 4 },
  { label: "6×6", rows: 6, cols: 6 },
  { label: "4×10", rows: 4, cols: 10 },
  { label: "8×8", rows: 8, cols: 8 },
  { label: "10×12", rows: 10, cols: 12 },
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

function createGrid(rows, cols) {
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
    planTitle: "Mon Potager",
    rows: 6,
    cols: 8,
    orientation: "south",
    zoom: 50,
    aiEnabled: true,
    cells: createGrid(6, 8),
    selectedCellId: null,
    clipboard: null,
    brushMode: false,
    activeTool: { structure: "soil", crop: "none", sun: 2, note: "" },
    rightRailOpen: true,
    fullscreenPlan: false,
    contextMenu: null,
    infoOpen: null,
    liveWeather: { temp: 18, wind: 12, rain: 10, label: "Météo locale" },
    photoPreview: "",
    photoName: "",
    diagnosis: {
      brightSide: "south",
      shadedSide: "north",
      windSide: "west",
      confidence: "moyenne",
      note: "Lecture assistée. Ajuste la lumière et le vent selon ton terrain.",
    },
    pots: [],
    pendingPotIds: [],
    activePotId: null,
    potBuilder: { count: 3, diameter: 30 },
    savedAt: null,
    dirty: false,
  };
}

function normalizeState(raw) {
  const fallback = createDefaultState();
  const rows = clamp(Number(raw?.rows || fallback.rows), 2, 18);
  const cols = clamp(Number(raw?.cols || fallback.cols), 2, 18);
  const sourceCells = Array.isArray(raw?.cells) ? raw.cells : createGrid(rows, cols);
  const map = new Map();
  sourceCells.forEach((cell) => {
    const row = clamp(Number(cell.row || 0), 0, rows - 1);
    const col = clamp(Number(cell.col || 0), 0, cols - 1);
    map.set(`${row}-${col}`, {
      id: cell.id || uid(),
      row,
      col,
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
      cells.push(map.get(`${row}-${col}`) || createCell(row, col));
    }
  }
  const pots = Array.isArray(raw?.pots)
    ? raw.pots.map((pot) => ({
        id: pot.id || uid(),
        label: pot.label || "Pot",
        diameter: clamp(Number(pot.diameter || 30), 10, 100),
        crop: crops[pot.crop] ? pot.crop : "none",
        suggestedCrop: crops[pot.suggestedCrop] ? pot.suggestedCrop : "none",
        suggestedCellId: pot.suggestedCellId || null,
        placedCellId: pot.placedCellId || null,
      }))
    : [];
  return {
    ...fallback,
    ...raw,
    rows,
    cols,
    cells,
    pots,
    orientation: ["south", "north", "east", "west"].includes(raw?.orientation) ? raw.orientation : "south",
    zoom: clamp(Number(raw?.zoom || 50), 32, 72),
    activeTool: {
      structure: structures[raw?.activeTool?.structure] ? raw.activeTool.structure : "soil",
      crop: crops[raw?.activeTool?.crop] ? raw.activeTool.crop : "none",
      sun: clamp(Number(raw?.activeTool?.sun ?? 2), 0, 3),
      note: raw?.activeTool?.note || "",
    },
    infoOpen: null,
    contextMenu: null,
    savedAt: raw?.savedAt || null,
    dirty: !!raw?.dirty,
    pendingPotIds: Array.isArray(raw?.pendingPotIds) ? raw.pendingPotIds : [],
    diagnosis: {
      brightSide: ["south", "north", "east", "west"].includes(raw?.diagnosis?.brightSide) ? raw.diagnosis.brightSide : fallback.diagnosis.brightSide,
      shadedSide: ["south", "north", "east", "west"].includes(raw?.diagnosis?.shadedSide) ? raw.diagnosis.shadedSide : fallback.diagnosis.shadedSide,
      windSide: ["south", "north", "east", "west"].includes(raw?.diagnosis?.windSide) ? raw.diagnosis.windSide : fallback.diagnosis.windSide,
      confidence: raw?.diagnosis?.confidence || fallback.diagnosis.confidence,
      note: raw?.diagnosis?.note || fallback.diagnosis.note,
    },
  };
}

function structureTexture(structure) {
  if (structure === "fence") return "repeating-linear-gradient(90deg, rgba(255,214,166,0.12) 0 3px, transparent 3px 7px)";
  if (structure === "wall") return "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 10px)";
  if (structure === "terrace") return "repeating-linear-gradient(90deg, rgba(255,214,182,0.08) 0 4px, transparent 4px 10px)";
  if (structure === "path") return "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.05), transparent 55%)";
  if (structure === "grass") return "radial-gradient(circle at 30% 30%, rgba(163,255,191,0.07), transparent 60%)";
  if (structure === "soil") return "radial-gradient(circle at 30% 30%, rgba(255,195,149,0.07), transparent 60%)";
  if (structure === "greenhouse") return "linear-gradient(135deg, rgba(255,255,255,0.08), transparent 60%)";
  return "none";
}

function orientationBias(cell, rows, cols, brightSide, shadedSide) {
  const north = 1 - cell.row / Math.max(1, rows - 1);
  const south = cell.row / Math.max(1, rows - 1);
  const west = 1 - cell.col / Math.max(1, cols - 1);
  const east = cell.col / Math.max(1, cols - 1);
  const bySide = { north, south, east, west };
  return (bySide[brightSide] || 0) - (bySide[shadedSide] || 0);
}

function describeCellAdvice(cell, state) {
  const crop = crops[cell.crop];
  const brightBias = orientationBias(cell, state.rows, state.cols, state.diagnosis.brightSide, state.diagnosis.shadedSide);
  const warm = brightBias > 0.15 || cell.sun >= 3;
  if (cell.structure === "wall") return "Mur utile comme repère ou appui thermique, pas de pleine terre directe.";
  if (cell.structure === "fence") return "Bonne structure de bordure. Idéal pour tracer les limites et organiser le plan.";
  if (cell.structure === "terrace") return "Zone pratique pour pots et circulation, moins adaptée à la pleine terre.";
  if (cell.structure === "greenhouse") return "Très bon point chaud. Parfait pour semis, basilic, piments et jeunes plants.";
  if (cell.structure === "shade") return "Zone d’ombre. Privilégier salade, persil ou observation plutôt que cultures chaudes.";
  if (cell.crop !== "none") {
    if (crop.sunNeed >= 3 && warm) return `${crop.label} bien placé ici : zone plutôt chaude et lumineuse.`;
    if (crop.sunNeed >= 3 && !warm) return `${crop.label} risque d’être un peu juste ici. Chercher une zone plus chaude ou plus lumineuse.`;
    if (crop.sunNeed <= 1 && cell.sun <= 2) return `${crop.label} cohérent ici : exposition plus douce et plus fraîche.`;
    return `${crop.label} possible ici. À surveiller selon la météo et l’évolution du terrain.`;
  }
  if (cell.structure === "soil" && warm) return "Bonne zone chaude pour tomates, piments ou basilic.";
  if (cell.structure === "soil" && !warm) return "Bonne zone plus douce pour salades, persil ou fleurs utiles.";
  if (cell.structure === "grass") return "Pelouse / décor. À garder visuel ou à convertir plus tard en zone utile.";
  if (cell.structure === "path") return "Allée utile pour circulation et accès aux zones cultivées.";
  return "Case neutre. Structure-la d’abord, puis laisse l’IA suggérer une culture.";
}

function buildFireflies(count = 22) {
  return Array.from({ length: count }).map((_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: 2 + Math.random() * 5,
    duration: 8 + Math.random() * 16,
    delay: Math.random() * 8,
    blur: Math.random() > 0.5,
    opacity: 0.3 + Math.random() * 0.6,
  }));
}

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function getCellById(cells, id) {
  return cells.find((cell) => cell.id === id) || null;
}

function applyPreset(state, rows, cols) {
  return {
    ...state,
    rows,
    cols,
    cells: createGrid(rows, cols),
    selectedCellId: null,
    activePotId: null,
    pendingPotIds: [],
    dirty: true,
  };
}

function nearestSuggestedCell(state, pot) {
  const candidates = state.cells.filter((cell) => cell.structure === "soil" && !cell.potIds.length);
  if (!candidates.length) return null;
  return candidates
    .map((cell) => {
      const bright = orientationBias(cell, state.rows, state.cols, state.diagnosis.brightSide, state.diagnosis.shadedSide);
      const cropKey = pot.crop !== "none" ? pot.crop : pot.suggestedCrop;
      const crop = crops[cropKey] || crops.none;
      let score = bright + cell.sun * 0.2;
      if (crop.sunNeed >= 3) score += bright * 1.2;
      if (crop.sunNeed <= 1) score -= bright * 0.6;
      if (cell.structure === "greenhouse") score += 0.5;
      return { cell, score };
    })
    .sort((a, b) => b.score - a.score)[0]?.cell || null;
}

function getStatusForCell(cell, state) {
  const crop = crops[cell.crop];
  const bright = orientationBias(cell, state.rows, state.cols, state.diagnosis.brightSide, state.diagnosis.shadedSide);
  if (cell.potIds.length > 0 && state.pendingPotIds.some((id) => cell.potIds.includes(id))) return "today";
  if (crop.sunNeed >= 3 && cell.structure === "soil" && bright < -0.12) return "danger";
  if (state.liveWeather.wind >= 35 && ["greenhouse", "soil"].includes(cell.structure)) return "watch";
  if (cell.crop !== "none") return "good";
  return "calm";
}

function statusAccent(status) {
  if (status === "danger") return "rgba(255, 107, 107, 0.95)";
  if (status === "today") return "rgba(255, 193, 92, 0.95)";
  if (status === "watch") return "rgba(164, 128, 255, 0.95)";
  if (status === "good") return "rgba(80, 226, 160, 0.95)";
  return "rgba(255,255,255,0.22)";
}

function InfoDot({ id, openId, setOpenId, title, text }) {
  const open = openId === id;
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        onClick={() => setOpenId(open ? null : id)}
        style={{
          width: 22,
          height: 22,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.08)",
          color: "rgba(255,255,255,0.92)",
          fontSize: 12,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(0,0,0,0.18)",
        }}
      >
        i
      </button>
      {open ? (
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 0,
            width: 280,
            zIndex: 50,
            padding: 14,
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.16)",
            background: "rgba(10, 14, 30, 0.92)",
            color: "rgba(238,242,255,0.95)",
            boxShadow: "0 18px 40px rgba(0,0,0,0.35)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(226,232,240,0.88)" }}>{text}</div>
        </div>
      ) : null}
    </div>
  );
}

function SectionCard({ title, right, children, subtle = false }) {
  return (
    <div
      style={{
        borderRadius: 28,
        border: subtle ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.16)",
        background: subtle ? "rgba(14, 18, 36, 0.50)" : "rgba(12, 16, 34, 0.62)",
        backdropFilter: "blur(16px)",
        boxShadow: subtle ? "0 14px 34px rgba(3,7,18,0.18)" : "0 18px 40px rgba(3,7,18,0.28)",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 18px 10px" }}>
        <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.03em", color: "rgba(248,250,252,0.96)" }}>{title}</div>
        {right}
      </div>
      <div style={{ padding: "0 18px 18px" }}>{children}</div>
    </div>
  );
}

function PillButton({ active, onClick, children, tone = "rgba(255,255,255,0.08)" }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 16,
        border: active ? "1px solid rgba(255,228,193,0.34)" : "1px solid rgba(255,255,255,0.10)",
        background: active ? "linear-gradient(135deg, rgba(255,174,111,0.18), rgba(120,144,255,0.12))" : tone,
        color: "rgba(248,250,252,0.95)",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 180ms ease",
      }}
    >
      {children}
    </button>
  );
}

function PotBadge({ pot, active }) {
  return (
    <div
      style={{
        minWidth: 56,
        padding: "8px 10px",
        borderRadius: 16,
        border: active ? "1px solid rgba(255,211,119,0.35)" : "1px solid rgba(255,255,255,0.10)",
        background: active ? "rgba(255,211,119,0.12)" : "rgba(255,255,255,0.06)",
        color: "rgba(248,250,252,0.95)",
        display: "grid",
        gap: 3,
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.8 }}>{pot.label}</div>
      <div style={{ fontWeight: 700 }}>{pot.diameter} cm</div>
      <div style={{ fontSize: 12, color: "rgba(191,219,254,0.88)" }}>{pot.crop !== "none" ? crops[pot.crop].label : crops[pot.suggestedCrop].label}</div>
    </div>
  );
}

// Repère 2/6 — composant principal, persistance, météo, animation
export default function App() {
  const initial = normalizeState(safeRead(WORKING_STORAGE, createDefaultState()));
  const [state, setState] = useState(initial);
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
  const [fireflies] = useState(() => buildFireflies(28));
  const [hoverCellId, setHoverCellId] = useState(null);
  const [painting, setPainting] = useState(false);
  const photoInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(WORKING_STORAGE, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    function onResize() {
      setScreenWidth(window.innerWidth);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    function handleUp() {
      setPainting(false);
    }
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, []);

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=48.616&longitude=2.258&current_weather=true")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.current_weather) return;
        setState((prev) => ({
          ...prev,
          liveWeather: {
            temp: Math.round(data.current_weather.temperature),
            wind: Math.round(data.current_weather.windspeed),
            rain: prev.liveWeather.rain,
            label: "Saint-Germain-lès-Arpajon",
          },
        }));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function beforeUnload(event) {
      if (!state.dirty) return undefined;
      event.preventDefault();
      event.returnValue = "";
      return "";
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [state.dirty]);

  const isMobile = screenWidth <= 920;
  const selectedCell = useMemo(() => getCellById(state.cells, state.selectedCellId), [state.cells, state.selectedCellId]);
  const activePot = useMemo(() => state.pots.find((pot) => pot.id === state.activePotId) || null, [state.pots, state.activePotId]);

  const planMetrics = useMemo(() => {
    const cropsCount = state.cells.filter((cell) => cell.crop !== "none").length;
    const structureCount = state.cells.filter((cell) => cell.structure !== "empty").length;
    const warmCount = state.cells.filter((cell) => cell.sun >= 3).length;
    return { cropsCount, structureCount, warmCount };
  }, [state.cells]);

  // Repère 3/6 — lecture IA, conseil principal, actions plan
  const mainAdvice = useMemo(() => {
    if (selectedCell) return describeCellAdvice(selectedCell, state);
    if (state.pendingPotIds.length) return "Des pots attendent encore une position. Clique une zone de culture pour les placer.";
    if (state.aiEnabled) return "Commence par dessiner la structure du jardin, puis laisse l’IA orienter les cultures et les pots.";
    return "Active l’IA pour obtenir des suggestions plus précises selon lumière, météo et plan.";
  }, [selectedCell, state]);

  const todayLine = useMemo(() => {
    if (state.pendingPotIds.length) return `${state.pendingPotIds.length} pot(s) à placer`;
    if (selectedCell && selectedCell.crop !== "none") {
      return `Observer ${crops[selectedCell.crop].label.toLowerCase()} sur la case active`;
    }
    if (state.liveWeather.wind >= 30) return "Vent fort : attention aux jeunes plants";
    return "Plan prêt pour conception et placement";
  }, [state.pendingPotIds.length, selectedCell, state.liveWeather.wind]);

  const suggestedPotText = useMemo(() => {
    const diameter = state.potBuilder.diameter;
    const suggestion = cropOptions
      .filter((key) => key !== "none")
      .map((key) => ({ key, score: crops[key].potIdeal.includes(diameter) ? 2 : crops[key].potMin <= diameter ? 1 : -1 }))
      .sort((a, b) => b.score - a.score)[0];
    return suggestion && suggestion.score >= 0 ? crops[suggestion.key].label : "Culture légère / fleurs";
  }, [state.potBuilder.diameter]);

  function patch(next) {
    setState((prev) => ({ ...prev, ...next, dirty: true }));
  }

  function patchCells(updater) {
    setState((prev) => ({ ...prev, cells: updater(prev.cells), dirty: true }));
  }

  function selectCell(cellId) {
    setState((prev) => ({ ...prev, selectedCellId: cellId, activePotId: null, contextMenu: null }));
  }

  function updateSelectedCell(changes) {
    if (!state.selectedCellId) return;
    patchCells((cells) => cells.map((cell) => (cell.id === state.selectedCellId ? { ...cell, ...changes } : cell)));
  }

  function copyCellToClipboard(cell) {
    if (!cell) return;
    setState((prev) => ({
      ...prev,
      clipboard: {
        structure: cell.structure,
        crop: cell.crop,
        sun: cell.sun,
        note: cell.note,
      },
      activeTool: {
        structure: cell.structure,
        crop: cell.crop,
        sun: cell.sun,
        note: cell.note,
      },
      brushMode: true,
      dirty: prev.dirty,
    }));
  }

  function applyToolToCell(cellId, source = null) {
    const tool = source || state.clipboard || state.activeTool;
    patchCells((cells) =>
      cells.map((cell) =>
        cell.id === cellId
          ? {
              ...cell,
              structure: tool.structure,
              crop: tool.crop,
              sun: tool.sun,
              note: tool.note || cell.note,
            }
          : cell
      )
    );
  }

  function placePendingPot(cellId) {
    if (!state.pendingPotIds.length) return;
    const potId = state.pendingPotIds[0];
    setState((prev) => {
      const nextPots = prev.pots.map((pot) => (pot.id === potId ? { ...pot, placedCellId: cellId } : pot));
      const nextCells = prev.cells.map((cell) =>
        cell.id === cellId ? { ...cell, potIds: [...new Set([...cell.potIds, potId])] } : cell
      );
      return {
        ...prev,
        pots: nextPots,
        cells: nextCells,
        pendingPotIds: prev.pendingPotIds.slice(1),
        selectedCellId: cellId,
        dirty: true,
      };
    });
  }

  function removePotFromCell(potId, cellId) {
    setState((prev) => ({
      ...prev,
      pots: prev.pots.map((pot) => (pot.id === potId ? { ...pot, placedCellId: null } : pot)),
      cells: prev.cells.map((cell) =>
        cell.id === cellId ? { ...cell, potIds: cell.potIds.filter((id) => id !== potId) } : cell
      ),
      pendingPotIds: [...prev.pendingPotIds, potId],
      dirty: true,
    }));
  }

  function createPots() {
    const created = Array.from({ length: state.potBuilder.count }).map((_, index) => ({
      id: uid(),
      label: `Pot ${state.pots.length + index + 1}`,
      diameter: state.potBuilder.diameter,
      crop: "none",
      suggestedCrop: cropOptions
        .filter((key) => key !== "none")
        .sort((a, b) => {
          const as = crops[a].potIdeal.includes(state.potBuilder.diameter) ? 2 : crops[a].potMin <= state.potBuilder.diameter ? 1 : -1;
          const bs = crops[b].potIdeal.includes(state.potBuilder.diameter) ? 2 : crops[b].potMin <= state.potBuilder.diameter ? 1 : -1;
          return bs - as;
        })[0],
      suggestedCellId: null,
      placedCellId: null,
    }));
    setState((prev) => {
      const next = [...prev.pots, ...created];
      const withSuggestions = next.map((pot) => {
        if (pot.suggestedCellId) return pot;
        const suggested = nearestSuggestedCell({ ...prev, pots: next }, pot);
        return { ...pot, suggestedCellId: suggested?.id || null };
      });
      return {
        ...prev,
        pots: withSuggestions,
        pendingPotIds: [...prev.pendingPotIds, ...created.map((pot) => pot.id)],
        activePotId: created[0]?.id || prev.activePotId,
        dirty: true,
      };
    });
  }

  function handleCellAction(cell, eventType = "click", point = null) {
    if (state.pendingPotIds.length && cell.structure === "soil") {
      placePendingPot(cell.id);
      return;
    }
    if (eventType === "context") {
      setState((prev) => ({
        ...prev,
        selectedCellId: cell.id,
        contextMenu: {
          x: point?.x || 0,
          y: point?.y || 0,
          cellId: cell.id,
        },
      }));
      return;
    }
    if (state.brushMode) {
      applyToolToCell(cell.id);
      selectCell(cell.id);
      return;
    }
    selectCell(cell.id);
  }

  // Repère 4/6 — sauvegarde, import photo, calculs visuels
  function savePlan() {
    const snapshot = { ...state, savedAt: new Date().toISOString(), dirty: false, contextMenu: null, infoOpen: null };
    localStorage.setItem(SAVED_STORAGE, JSON.stringify(snapshot));
    setState(snapshot);
  }

  function restorePlan() {
    const restored = safeRead(SAVED_STORAGE, null);
    if (!restored) return;
    setState(normalizeState(restored));
  }

  function importPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setState((prev) => ({
        ...prev,
        photoPreview: String(reader.result || ""),
        photoName: file.name,
        dirty: true,
      }));
    };
    reader.readAsDataURL(file);
  }

  function planGlow() {
    if (state.liveWeather.wind >= 30) return "0 0 0 1px rgba(255,255,255,0.06), 0 0 120px rgba(120,112,255,0.14)";
    return "0 0 0 1px rgba(255,255,255,0.06), 0 0 140px rgba(108,190,255,0.10), 0 0 70px rgba(255,178,112,0.08)";
  }

  const planCellSize = clamp(state.zoom, 32, 72);

  // Repère 5/6 — rendu principal premium animé
  return (
    <div className="mp-root">
      <style>{`
        :root {
          color-scheme: dark;
          --fg: rgba(248,250,252,0.96);
          --muted: rgba(226,232,240,0.76);
          --line: rgba(255,255,255,0.12);
          --glass: rgba(11, 16, 32, 0.56);
          --glass-2: rgba(8, 12, 24, 0.72);
          --accent: #8fd8ff;
          --warm: #ffc48c;
          --violet: #7c8cff;
        }
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }
        body {
          margin: 0;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          background: #0b1020;
          color: var(--fg);
        }
        .mp-root {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(1100px 600px at 20% 5%, rgba(110,136,255,0.16), transparent 55%),
            radial-gradient(900px 640px at 80% 10%, rgba(255,180,105,0.12), transparent 55%),
            radial-gradient(900px 700px at 50% 100%, rgba(48,92,69,0.24), transparent 58%),
            linear-gradient(180deg, #060914 0%, #0a1020 44%, #0d1427 100%);
        }
        .mp-root::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(600px 220px at 50% 20%, rgba(255,171,116,0.08), transparent 70%),
            radial-gradient(500px 260px at 15% 75%, rgba(83,221,154,0.08), transparent 70%),
            radial-gradient(500px 300px at 86% 78%, rgba(130,149,255,0.08), transparent 70%);
          animation: breathe 14s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .landscape {
          position: absolute;
          inset: auto 0 0 0;
          height: 34vh;
          pointer-events: none;
          background:
            radial-gradient(60% 110% at 10% 100%, rgba(15,37,26,0.84), transparent 60%),
            radial-gradient(55% 90% at 50% 100%, rgba(13,32,30,0.86), transparent 60%),
            radial-gradient(60% 100% at 90% 100%, rgba(18,33,44,0.88), transparent 60%);
          filter: blur(4px);
          opacity: 0.85;
        }
        .hill-a, .hill-b, .hill-c {
          position: absolute;
          bottom: -80px;
          border-radius: 50%;
          filter: blur(12px);
          opacity: 0.55;
        }
        .hill-a { left: -10%; width: 46%; height: 240px; background: rgba(16,37,27,0.9); }
        .hill-b { left: 25%; width: 38%; height: 210px; background: rgba(13,28,24,0.94); }
        .hill-c { right: -5%; width: 46%; height: 250px; background: rgba(14,28,41,0.92); }
        .firefly {
          position: absolute;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,225,150,0.95) 0%, rgba(168,234,255,0.6) 44%, transparent 76%);
          box-shadow: 0 0 10px rgba(255,220,160,0.45), 0 0 22px rgba(120,184,255,0.25);
          animation: drift var(--dur) linear infinite, pulse 4.6s ease-in-out infinite;
          animation-delay: var(--delay);
          opacity: var(--op);
          pointer-events: none;
        }
        .firefly.blur {
          filter: blur(0.7px);
        }
        .shell {
          position: relative;
          z-index: 1;
          padding: 26px;
          max-width: 1680px;
          margin: 0 auto;
        }
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .brand {
          display: grid;
          gap: 4px;
        }
        .brand-title {
          font-size: ${isMobile ? "32px" : "56px"};
          line-height: 0.96;
          letter-spacing: 0.02em;
          font-weight: 800;
          margin: 0;
        }
        .brand-sub {
          color: rgba(226,232,240,0.78);
          font-size: 14px;
          max-width: 720px;
        }
        .info-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .hero-chip {
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: rgba(248,250,252,0.94);
          padding: 10px 14px;
          font-size: 13px;
          backdrop-filter: blur(12px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        .layout {
          display: grid;
          grid-template-columns: ${isMobile ? "1fr" : state.rightRailOpen ? "minmax(0, 1.35fr) 390px" : "1fr"};
          gap: 18px;
          align-items: start;
        }
        .plan-shell {
          border-radius: 34px;
          background: linear-gradient(180deg, rgba(11,16,32,0.48), rgba(11,16,32,0.70));
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: ${planGlow()};
          backdrop-filter: blur(14px);
          overflow: hidden;
        }
        .plan-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 16px 18px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .plan-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .plan-title h2 {
          margin: 0;
          font-size: 19px;
          letter-spacing: 0.04em;
        }
        .tool-dock {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 14px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .dock-btn, .ghost-btn, .primary-btn, .icon-btn, .context-btn, select, input, textarea {
          outline: none;
        }
        .dock-btn, .ghost-btn, .primary-btn, .icon-btn, .context-btn {
          color: rgba(248,250,252,0.96);
          cursor: pointer;
        }
        .dock-btn {
          min-width: 44px;
          min-height: 44px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 14px 26px rgba(0,0,0,0.18);
          padding: 10px 14px;
          font-weight: 700;
        }
        .dock-btn.active {
          background: linear-gradient(135deg, rgba(255,179,108,0.18), rgba(125,141,255,0.16));
          border-color: rgba(255,223,196,0.25);
        }
        .ghost-btn {
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          padding: 10px 13px;
          font-weight: 700;
        }
        .primary-btn {
          border-radius: 16px;
          border: 1px solid rgba(255,221,195,0.22);
          background: linear-gradient(135deg, rgba(255,167,95,0.24), rgba(116,136,255,0.20));
          padding: 10px 14px;
          font-weight: 800;
          box-shadow: 0 12px 24px rgba(0,0,0,0.18);
        }
        .icon-btn {
          min-width: 40px;
          min-height: 40px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.06);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .plan-stage {
          padding: 18px;
        }
        .plan-scroll {
          width: 100%;
          overflow: auto;
          padding: 8px;
        }
        .plan-grid {
          display: grid;
          gap: 8px;
          width: max-content;
          min-width: 100%;
        }
        .cell {
          position: relative;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.10);
          overflow: hidden;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 18px rgba(0,0,0,0.16);
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
          user-select: none;
        }
        .cell:hover {
          transform: translateY(-1px);
          border-color: rgba(255,255,255,0.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 14px 24px rgba(0,0,0,0.20);
        }
        .cell.selected {
          border-color: rgba(255,218,183,0.28);
          box-shadow: inset 0 0 0 1px rgba(255,218,183,0.18), 0 14px 28px rgba(0,0,0,0.24), 0 0 0 2px rgba(255,218,183,0.06);
        }
        .cell-veil {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.05), transparent 28%, rgba(0,0,0,0.14));
          pointer-events: none;
        }
        .cell-inner {
          position: relative;
          inset: 0;
          display: grid;
          grid-template-rows: auto 1fr auto;
          height: 100%;
          padding: 8px;
        }
        .cell-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          font-size: 11px;
          color: rgba(241,245,249,0.92);
        }
        .cell-mini {
          font-size: 10px;
          color: rgba(226,232,240,0.76);
        }
        .cell-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          box-shadow: 0 0 10px currentColor;
        }
        .cell-center {
          display: grid;
          align-content: center;
          justify-items: center;
          gap: 4px;
        }
        .cell-crop {
          font-size: 18px;
          line-height: 1;
        }
        .cell-struct {
          font-size: 11px;
          opacity: 0.88;
          text-align: center;
        }
        .cell-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          font-size: 10px;
          color: rgba(226,232,240,0.76);
        }
        .pot-dot {
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(255,223,140,1), rgba(255,172,89,0.88));
          box-shadow: 0 0 10px rgba(255,200,120,0.6);
        }
        .plan-widgets {
          display: grid;
          grid-template-columns: repeat(${isMobile ? 1 : 3}, minmax(0, 1fr));
          gap: 14px;
          padding: 0 18px 18px;
        }
        .widget-compact {
          border-radius: 22px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.05);
          box-shadow: 0 14px 28px rgba(0,0,0,0.16);
          padding: 14px 16px;
          min-height: 92px;
        }
        .widget-label {
          font-size: 12px;
          letter-spacing: 0.08em;
          color: rgba(191,219,254,0.82);
          text-transform: uppercase;
          margin-bottom: 8px;
        }
        .widget-text {
          line-height: 1.5;
          color: rgba(248,250,252,0.92);
        }
        .field, select, textarea {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          color: rgba(248,250,252,0.96);
          padding: 12px 13px;
          font-size: 14px;
          backdrop-filter: blur(12px);
        }
        select option {
          color: #111827;
          background: #f8fafc;
        }
        textarea { min-height: 90px; resize: vertical; }
        .field-row { display: grid; gap: 8px; }
        .field-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(226,232,240,0.84);
        }
        .right-rail {
          display: grid;
          gap: 18px;
        }
        .mini-grid {
          display: grid;
          gap: 10px;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        .context-menu {
          position: fixed;
          z-index: 60;
          width: 250px;
          border-radius: 20px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(8,12,24,0.92);
          box-shadow: 0 22px 44px rgba(0,0,0,0.45);
          backdrop-filter: blur(16px);
          padding: 10px;
        }
        .context-btn {
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          border-radius: 14px;
          padding: 11px 12px;
          color: rgba(248,250,252,0.95);
          font-weight: 700;
        }
        .context-btn:hover {
          background: rgba(255,255,255,0.08);
        }
        .small-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .mono { font-variant-numeric: tabular-nums; }
        .photo-thumb {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.10);
          box-shadow: 0 16px 28px rgba(0,0,0,0.18);
        }
        .rail-toggle {
          position: fixed;
          right: 18px;
          top: 18px;
          z-index: 55;
        }
        @keyframes drift {
          0% { transform: translate3d(0,0,0) scale(0.95); }
          25% { transform: translate3d(18px,-10px,0) scale(1); }
          50% { transform: translate3d(-10px,-22px,0) scale(0.92); }
          75% { transform: translate3d(14px,8px,0) scale(1.04); }
          100% { transform: translate3d(0,0,0) scale(0.95); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.95; }
        }
        @keyframes breathe {
          0% { transform: scale(1) translateY(0px); opacity: 0.92; }
          100% { transform: scale(1.03) translateY(-8px); opacity: 1; }
        }
        @media (max-width: 920px) {
          .shell { padding: 14px; }
          .plan-head { padding: 14px; }
          .tool-dock { padding: 12px 14px; }
          .plan-stage { padding: 12px; }
          .context-menu { width: min(280px, calc(100vw - 24px)); }
        }
      `}</style>

      {fireflies.map((fly) => (
        <span
          key={fly.id}
          className={cx("firefly", fly.blur && "blur")}
          style={{
            left: fly.left,
            top: fly.top,
            width: fly.size,
            height: fly.size,
            ["--dur"]: `${fly.duration}s`,
            ["--delay"]: `${fly.delay}s`,
            ["--op"]: fly.opacity,
          }}
        />
      ))}
      <div className="landscape">
        <div className="hill-a" />
        <div className="hill-b" />
        <div className="hill-c" />
      </div>

      <div className="shell" onClick={() => state.contextMenu && setState((prev) => ({ ...prev, contextMenu: null }))}>
        <div className="topbar">
          <div className="brand">
            <h1 className="brand-title">{state.planTitle}</h1>
            <div className="brand-sub">
              Planification premium du potager, structures du jardin, pots, suggestions IA et ambiance vivante. Les textes d’aide sont volontairement cachés derrière de petits boutons info.
            </div>
          </div>
          <div className="info-row">
            <div className="hero-chip">🌡 {state.liveWeather.temp}°C • vent {state.liveWeather.wind} km/h</div>
            <div className="hero-chip">🧠 {state.aiEnabled ? "IA active" : "IA inactive"}</div>
            <div className="hero-chip">💾 {state.dirty ? "modifs non sauvegardées" : state.savedAt ? "plan sauvegardé" : "brouillon"}</div>
            <button className="primary-btn" onClick={(e) => { e.stopPropagation(); savePlan(); }}>Sauvegarder</button>
            <button className="ghost-btn" onClick={(e) => { e.stopPropagation(); restorePlan(); }}>Restaurer</button>
            <button className="ghost-btn" onClick={(e) => { e.stopPropagation(); setState((prev) => ({ ...prev, fullscreenPlan: !prev.fullscreenPlan })); }}>{state.fullscreenPlan ? "Quitter plein écran" : "Plein écran"}</button>
          </div>
        </div>

        <div className="layout" style={state.fullscreenPlan && !isMobile ? { gridTemplateColumns: "1fr" } : undefined}>
          <div className="plan-shell">
            <div className="plan-head">
              <div className="plan-title">
                <div style={{ display: "grid", gap: 4 }}>
                  <h2>Plan vivant</h2>
                  <div style={{ fontSize: 13, color: "rgba(191,219,254,0.84)" }}>Clic gauche : sélectionner • clic droit : actions rapides • pinceau : tracer vite</div>
                </div>
                <InfoDot
                  id="plan-info"
                  openId={state.infoOpen}
                  setOpenId={(id) => setState((prev) => ({ ...prev, infoOpen: id }))}
                  title="Comment fonctionne le plan ?"
                  text="Le plan reste volontairement compact. La structure du jardin se pose d’abord, les cultures et les pots viennent ensuite. Les détails longs sont cachés ici pour laisser l’utilisateur découvrir l’outil sans surcharge visuelle."
                />
              </div>
              <div className="small-row">
                {presets.map((preset) => (
                  <button key={preset.label} className="ghost-btn" onClick={(e) => { e.stopPropagation(); setState((prev) => applyPreset(prev, preset.rows, preset.cols)); }}>{preset.label}</button>
                ))}
                {!isMobile ? (
                  <button className="ghost-btn" onClick={(e) => { e.stopPropagation(); setState((prev) => ({ ...prev, rightRailOpen: !prev.rightRailOpen })); }}>{state.rightRailOpen ? "Masquer rail" : "Afficher rail"}</button>
                ) : null}
              </div>
            </div>

            <div className="tool-dock">
              <button className={cx("dock-btn", state.brushMode && "active")} onClick={(e) => { e.stopPropagation(); setState((prev) => ({ ...prev, brushMode: !prev.brushMode })); }}>🖌️</button>
              <button className="dock-btn" onClick={(e) => { e.stopPropagation(); copyCellToClipboard(selectedCell || state.activeTool); }}>📋</button>
              <button className="dock-btn" onClick={(e) => { e.stopPropagation(); if (state.selectedCellId) applyToolToCell(state.selectedCellId); }}>🧩</button>
              <button className="dock-btn" onClick={(e) => { e.stopPropagation(); createPots(); }}>🪴</button>
              <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.08)" }} />
              <PillButton active={state.activeTool.structure === "soil"} onClick={() => patch({ activeTool: { ...state.activeTool, structure: "soil" } })}>Terre</PillButton>
              <PillButton active={state.activeTool.structure === "fence"} onClick={() => patch({ activeTool: { ...state.activeTool, structure: "fence" } })}>Clôture</PillButton>
              <PillButton active={state.activeTool.structure === "wall"} onClick={() => patch({ activeTool: { ...state.activeTool, structure: "wall" } })}>Mur</PillButton>
              <PillButton active={state.activeTool.structure === "terrace"} onClick={() => patch({ activeTool: { ...state.activeTool, structure: "terrace" } })}>Terrasse</PillButton>
              <PillButton active={state.activeTool.structure === "path"} onClick={() => patch({ activeTool: { ...state.activeTool, structure: "path" } })}>Allée</PillButton>
              <div style={{ flex: 1 }} />
              <div className="hero-chip mono">{state.rows} × {state.cols}</div>
              <div className="hero-chip mono">{planMetrics.structureCount} zones</div>
              <div className="hero-chip mono">{state.pots.length} pots</div>
            </div>

            <div className="plan-stage">
              <div className="plan-scroll">
                <div className="plan-grid" style={{ gridTemplateColumns: `repeat(${state.cols}, ${planCellSize}px)` }}>
                  {state.cells.map((cell) => {
                    const structure = structures[cell.structure];
                    const crop = crops[cell.crop];
                    const selected = state.selectedCellId === cell.id;
                    const status = getStatusForCell(cell, state);
                    const potPlaced = cell.potIds.map((potId) => state.pots.find((pot) => pot.id === potId)).filter(Boolean);
                    const pendingSuggestion = state.pendingPotIds.length && state.pots.find((pot) => pot.id === state.pendingPotIds[0])?.suggestedCellId === cell.id;
                    const hoverPreview = hoverCellId === cell.id && state.brushMode;
                    const sizeStyle = {
                      width: planCellSize,
                      height: planCellSize,
                      background: structure.tone,
                      backgroundImage: structureTexture(cell.structure),
                    };
                    return (
                      <div
                        key={cell.id}
                        className={cx("cell", selected && "selected")}
                        style={sizeStyle}
                        onMouseEnter={() => {
                          setHoverCellId(cell.id);
                          if (painting && state.brushMode) applyToolToCell(cell.id);
                        }}
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          if (event.button === 2) return;
                          setPainting(true);
                          handleCellAction(cell, "click");
                        }}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleCellAction(cell, "click");
                        }}
                        onContextMenu={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          handleCellAction(cell, "context", { x: event.clientX, y: event.clientY });
                        }}
                      >
                        <div className="cell-veil" />
                        <div className="cell-inner">
                          <div className="cell-top">
                            <div>{cell.row + 1}.{cell.col + 1}</div>
                            <div className="cell-status-dot" style={{ color: statusAccent(status), background: statusAccent(status) }} />
                          </div>
                          <div className="cell-center">
                            <div className="cell-crop">{crop.icon || structure.icon}</div>
                            <div className="cell-struct">{crop.label !== "Aucune culture" ? crop.label : structure.label}</div>
                          </div>
                          <div className="cell-bottom">
                            <div>☀ {cell.sun}</div>
                            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                              {potPlaced.slice(0, 2).map((pot) => <span key={pot.id} className="pot-dot" title={pot.label} />)}
                              {potPlaced.length > 2 ? <span>+{potPlaced.length - 2}</span> : null}
                            </div>
                          </div>
                        </div>
                        {pendingSuggestion ? (
                          <div style={{ position: "absolute", inset: 4, borderRadius: 12, boxShadow: "0 0 0 2px rgba(255,207,120,0.55), 0 0 24px rgba(255,207,120,0.22) inset" }} />
                        ) : null}
                        {hoverPreview ? (
                          <div style={{ position: "absolute", inset: 6, borderRadius: 12, background: "rgba(255,255,255,0.08)", boxShadow: "0 0 0 1px rgba(255,255,255,0.18) inset" }} />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="plan-widgets">
              <div className="widget-compact">
                <div className="widget-label">IA du moment</div>
                <div className="widget-text">{mainAdvice}</div>
              </div>
              <div className="widget-compact">
                <div className="widget-label">Aujourd’hui</div>
                <div className="widget-text">{todayLine}</div>
              </div>
              <div className="widget-compact">
                <div className="widget-label">Statut</div>
                <div className="widget-text">{state.savedAt ? `Dernière sauvegarde : ${new Date(state.savedAt).toLocaleString()}` : "Aucune sauvegarde manuelle pour le moment."}</div>
              </div>
            </div>
          </div>

          {(!isMobile || state.rightRailOpen) && !state.fullscreenPlan ? (
            <div className="right-rail">
              <SectionCard
                title="Case active"
                right={
                  <InfoDot
                    id="cell-info"
                    openId={state.infoOpen}
                    setOpenId={(id) => setState((prev) => ({ ...prev, infoOpen: id }))}
                    title="Pourquoi si peu de texte ?"
                    text="Les explications détaillées sont volontairement masquées derrière ces petits boutons. L’objectif est de laisser l’utilisateur découvrir l’outil et d’éviter un mur d’informations autour du plan."
                  />
                }
              >
                {selectedCell ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ color: "rgba(191,219,254,0.85)", fontSize: 13 }}>Position</div>
                      <div style={{ fontWeight: 700 }}>Case {selectedCell.row + 1}.{selectedCell.col + 1}</div>
                    </div>
                    <div className="field-row">
                      <div className="field-label">Structure</div>
                      <select value={selectedCell.structure} onChange={(e) => updateSelectedCell({ structure: e.target.value })}>
                        {structureOptions.map((key) => <option key={key} value={key}>{structures[key].label}</option>)}
                      </select>
                    </div>
                    <div className="field-row">
                      <div className="field-label">Culture</div>
                      <select value={selectedCell.crop} onChange={(e) => updateSelectedCell({ crop: e.target.value })}>
                        {cropOptions.map((key) => <option key={key} value={key}>{crops[key].label}</option>)}
                      </select>
                    </div>
                    <div className="mini-grid">
                      {sunlightOptions.map((value) => (
                        <PillButton key={value} active={selectedCell.sun === value} onClick={() => updateSelectedCell({ sun: value })}>☀ {value}</PillButton>
                      ))}
                    </div>
                    <div className="field-row">
                      <div className="field-label">Note</div>
                      <textarea value={selectedCell.note} onChange={(e) => updateSelectedCell({ note: e.target.value })} />
                    </div>
                    <div style={{ padding: 12, borderRadius: 18, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", lineHeight: 1.6, color: "rgba(226,232,240,0.90)" }}>
                      {describeCellAdvice(selectedCell, state)}
                    </div>
                    <div className="small-row">
                      <button className="ghost-btn" onClick={() => copyCellToClipboard(selectedCell)}>Copier comme pinceau</button>
                      <button className="ghost-btn" onClick={() => updateSelectedCell({ crop: "none", structure: "empty", note: "", sun: 2 })}>Vider</button>
                    </div>
                    {selectedCell.potIds.length ? (
                      <div style={{ display: "grid", gap: 8 }}>
                        <div style={{ fontSize: 13, color: "rgba(191,219,254,0.82)" }}>Pots sur cette case</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {selectedCell.potIds.map((potId) => {
                            const pot = state.pots.find((item) => item.id === potId);
                            if (!pot) return null;
                            return <PotBadge key={pot.id} pot={pot} active={pot.id === state.activePotId} />;
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div style={{ color: "rgba(226,232,240,0.82)", lineHeight: 1.7 }}>Sélectionne une case sur le plan pour ouvrir son atelier compact.</div>
                )}
              </SectionCard>

              <SectionCard title="Pots + IA" subtle>
                <div style={{ display: "grid", gap: 12 }}>
                  <div className="field-row">
                    <div className="field-label">Nombre de pots</div>
                    <div className="small-row">
                      {[1, 3, 5].map((n) => <PillButton key={n} active={state.potBuilder.count === n} onClick={() => patch({ potBuilder: { ...state.potBuilder, count: n } })}>{n}</PillButton>)}
                    </div>
                  </div>
                  <div className="field-row">
                    <div className="field-label">Diamètre</div>
                    <div className="small-row">
                      {[20, 30, 40].map((n) => <PillButton key={n} active={state.potBuilder.diameter === n} onClick={() => patch({ potBuilder: { ...state.potBuilder, diameter: n } })}>{n} cm</PillButton>)}
                    </div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 18, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    Suggestion : <strong>{suggestedPotText}</strong>
                  </div>
                  <button className="primary-btn" onClick={() => createPots()}>Créer les pots</button>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {state.pots.slice(-6).map((pot) => <PotBadge key={pot.id} pot={pot} active={pot.id === state.activePotId} />)}
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Diagnostic + photo" subtle>
                <div style={{ display: "grid", gap: 12 }}>
                  {state.photoPreview ? <img className="photo-thumb" src={state.photoPreview} alt="Diagnostic du jardin" /> : null}
                  <div className="small-row">
                    <button className="ghost-btn" onClick={() => photoInputRef.current?.click()}>Charger une photo</button>
                    {state.photoName ? <div className="hero-chip">{state.photoName}</div> : null}
                  </div>
                  <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={importPhoto} />
                  <div className="field-row">
                    <div className="field-label">Côté lumineux</div>
                    <select value={state.diagnosis.brightSide} onChange={(e) => patch({ diagnosis: { ...state.diagnosis, brightSide: e.target.value } })}>
                      {orientations.map((side) => <option key={side} value={side}>{side}</option>)}
                    </select>
                  </div>
                  <div className="field-row">
                    <div className="field-label">Côté ombragé</div>
                    <select value={state.diagnosis.shadedSide} onChange={(e) => patch({ diagnosis: { ...state.diagnosis, shadedSide: e.target.value } })}>
                      {orientations.map((side) => <option key={side} value={side}>{side}</option>)}
                    </select>
                  </div>
                  <div className="field-row">
                    <div className="field-label">Vent principal</div>
                    <select value={state.diagnosis.windSide} onChange={(e) => patch({ diagnosis: { ...state.diagnosis, windSide: e.target.value } })}>
                      {orientations.map((side) => <option key={side} value={side}>{side}</option>)}
                    </select>
                  </div>
                </div>
              </SectionCard>
            </div>
          ) : null}
        </div>
      </div>

      {state.contextMenu ? (() => {
        const target = getCellById(state.cells, state.contextMenu.cellId);
        if (!target) return null;
        return (
          <div className="context-menu" style={{ left: Math.min(state.contextMenu.x, window.innerWidth - 270), top: Math.min(state.contextMenu.y, window.innerHeight - 260) }} onClick={(e) => e.stopPropagation()}>
            <button className="context-btn" onClick={() => { copyCellToClipboard(target); setState((prev) => ({ ...prev, contextMenu: null })); }}>📋 Copier la case comme pinceau</button>
            <button className="context-btn" onClick={() => { applyToolToCell(target.id); setState((prev) => ({ ...prev, contextMenu: null })); }}>🖌️ Coller le pinceau ici</button>
            <button className="context-btn" onClick={() => { setState((prev) => ({ ...prev, selectedCellId: target.id, contextMenu: null })); }}>🧭 Ouvrir la case</button>
            <button className="context-btn" onClick={() => { patchCells((cells) => cells.map((cell) => cell.id === target.id ? { ...cell, structure: "empty", crop: "none", sun: 2, note: "", potIds: [] } : cell)); setState((prev) => ({ ...prev, contextMenu: null })); }}>🧹 Vider la case</button>
          </div>
        );
      })() : null}
    </div>
  );
}

// Repère 6/6 — fin du fichier
