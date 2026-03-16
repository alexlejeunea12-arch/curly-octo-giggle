import React, { useEffect, useMemo, useRef, useState } from "react";

// Repère 1/6 — constantes, catalogue, helpers
const CITY = "Saint-Germain-lès-Arpajon (91180)";
const LAT = 48.616;
const LON = 2.258;
const STORAGE = "potager_v221_focus_builder_background";

const plants = {
  vide: { name: "Vide", icon: "⬜", color: "#f3f4f6", water: 0, yield: 0, sunNeed: 0 },
  tomate: { name: "Tomate", icon: "🍅", color: "#ef4444", water: 1.2, yield: 3, sunNeed: 3 },
  tomateCerise: { name: "Tomate cerise", icon: "🍅", color: "#fb7a59", water: 1.0, yield: 2, sunNeed: 3 },
  piment: { name: "Piment", icon: "🌶️", color: "#dc2626", water: 0.8, yield: 0.6, sunNeed: 3 },
  poivron: { name: "Poivron", icon: "🫑", color: "#f59e0b", water: 0.8, yield: 1, sunNeed: 3 },
  salade: { name: "Salade", icon: "🥬", color: "#84cc16", water: 0.5, yield: 0.3, sunNeed: 1 },
  basilic: { name: "Basilic", icon: "🌿", color: "#22c55e", water: 0.4, yield: 0.2, sunNeed: 2 },
  persil: { name: "Persil", icon: "🌱", color: "#15803d", water: 0.3, yield: 0.2, sunNeed: 1 },
  fleurs: { name: "Fleurs utiles", icon: "🌼", color: "#fde047", water: 0.2, yield: 0, sunNeed: 2 },
};

const zoneMeta = {
  plant: { label: "Culture", icon: "🪴", color: "#ffffff" },
  greenhouse: { label: "Serre", icon: "🏕️", color: "#99f6e4" },
  path: { label: "Allée", icon: "🪨", color: "#d6d3d1" },
  wall: { label: "Mur", icon: "🧱", color: "#94a3b8" },
  terrace: { label: "Terrasse", icon: "🟫", color: "#8b5e3c" },
  tree: { label: "Ombre", icon: "🌳", color: "#4b5563" },
  grass: { label: "Pelouse", icon: "🟩", color: "#65a30d" },
  empty: { label: "Vide", icon: "⬜", color: "#eef2f7" },
};

const presets = [
  { key: "2x3", label: "2 × 3", rows: 2, cols: 3 },
  { key: "3x3", label: "3 × 3", rows: 3, cols: 3 },
  { key: "3x4", label: "3 × 4", rows: 3, cols: 4 },
  { key: "4x4", label: "4 × 4", rows: 4, cols: 4 },
  { key: "4x5", label: "4 × 5", rows: 4, cols: 5 },
  { key: "long", label: "2 × 6", rows: 2, cols: 6 },
];

const mobileTabs = [
  { key: "plan", label: "Plan", icon: "🗺️" },
  { key: "builder", label: "Créer", icon: "🧩" },
  { key: "assistant", label: "Assistant", icon: "🧭" },
  { key: "case", label: "Case", icon: "📌" },
  { key: "follow", label: "Suivi", icon: "⏰" },
];

const exposureOptions = [
  { key: "chaud", label: "Chaud" },
  { key: "standard", label: "Standard" },
  { key: "frais", label: "Frais" },
  { key: "ombre", label: "Ombré" },
];

const actionTemplates = {
  semis: {
    label: "Semis",
    icon: "🌱",
    reminders: [
      { offset: 7, title: "Contrôler la levée", average: "5 à 10 jours", signs: ["premières pousses", "levée homogène", "substrat humide sans excès"], advice: "Garder humide et lumineux sans détremper." },
      { offset: 14, title: "Vérifier densité / éclaircir", average: "10 à 20 jours", signs: ["vraies feuilles", "plants serrés", "croissance régulière"], advice: "Éclaircir ou repiquer si les plantules se touchent." },
    ],
  },
  repiquage: {
    label: "Repiquage",
    icon: "🪴",
    reminders: [
      { offset: 3, title: "Surveiller la reprise", average: "2 à 4 jours", signs: ["feuilles moins molles", "port redressé", "pas de jaunissement massif"], advice: "Arroser modérément et éviter le plein stress." },
      { offset: 7, title: "Valider reprise visible", average: "5 à 8 jours", signs: ["nouvelle pousse", "tige stable", "croissance repart"], advice: "Ajuster lumière et espacement si besoin." },
    ],
  },
  miseEnTerre: {
    label: "Mise en terre",
    icon: "🌤️",
    reminders: [
      { offset: 2, title: "Arrosage de reprise", average: "1 à 3 jours", signs: ["terre fraîche", "pas de flétrissement prolongé", "plante stable"], advice: "Arroser si le sol sèche vite, protéger du vent si besoin." },
      { offset: 7, title: "Contrôler installation", average: "5 à 10 jours", signs: ["croissance reprend", "feuillage sain", "pas de stress prolongé"], advice: "Vérifier exposition et tuteurage éventuel." },
    ],
  },
  tuteurage: {
    label: "Tuteurage",
    icon: "🪵",
    reminders: [
      { offset: 5, title: "Vérifier attaches", average: "3 à 7 jours", signs: ["attache non serrée", "tige bien maintenue", "pas de frottement"], advice: "Desserrer ou repositionner si la tige grossit." },
    ],
  },
  recolte: {
    label: "Récolte",
    icon: "🧺",
    reminders: [
      { offset: 4, title: "Vérifier nouvelle récolte", average: "3 à 7 jours", signs: ["nouveaux fruits", "floraison active", "feuillage sain"], advice: "Continuer entretien et récolter régulièrement." },
    ],
  },
};

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function uid() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateStr, offset) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + offset);
  return d.toISOString();
}

function formatDate(value) {
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch {
    return "";
  }
}

function shortText(text, limit = 15) {
  if (!text) return "";
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

function inputStyle() {
  return {
    width: "100%",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    padding: "10px 12px",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    minHeight: 42,
    background: "#fff",
  };
}

function areaStyle() {
  return { ...inputStyle(), minHeight: 92, resize: "vertical", fontFamily: "Arial, sans-serif" };
}

function buttonStyle(bg, color = "#fff") {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 42,
    boxShadow: "0 8px 18px rgba(15,23,42,0.10)",
  };
}

function softButton(active = false) {
  return {
    background: active ? "#e0e7ff" : "#fff",
    color: "#111827",
    border: active ? "2px solid #111827" : "1px solid #d1d5db",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 42,
  };
}

function ghostButton() {
  return {
    background: "rgba(255,255,255,0.82)",
    color: "#111827",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 42,
    backdropFilter: "blur(6px)",
  };
}

function cardStyle() {
  return {
    background: "#fff",
    borderRadius: 20,
    padding: 16,
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  };
}

function metricStyle() {
  return {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  };
}

function createEmptyCell(index) {
  return {
    id: uid(),
    slotIndex: index,
    label: `Case ${index + 1}`,
    zoneType: "empty",
    plant: "vide",
    count: 0,
    sunBase: 2,
    note: "",
    exposureTag: "standard",
    actions: [],
    validated: false,
  };
}

function createGrid(rows, cols) {
  return Array.from({ length: rows * cols }, (_, i) => createEmptyCell(i));
}

function createDraft() {
  return {
    label: "Nouvelle case",
    zoneType: "plant",
    plant: "tomate",
    count: 1,
    sunBase: 3,
    note: "",
    exposureTag: "chaud",
  };
}

function createPotager(name = "Potager principal", rows = 3, cols = 4) {
  return {
    id: uid(),
    name,
    rows,
    cols,
    cells: createGrid(rows, cols),
    selectedCellId: null,
    planValidated: false,
    diagnosis: {
      orientation: "south",
      warmSide: "bottom",
      shadeSide: "top",
      windSide: "left",
      notes: "",
      photoName: "",
      photoData: "",
    },
  };
}

function normalizeCell(raw, index) {
  const zoneType = zoneMeta[raw?.zoneType] ? raw.zoneType : "empty";
  const plant = zoneType === "plant" ? (plants[raw?.plant] ? raw.plant : "tomate") : "vide";
  return {
    id: raw?.id || uid(),
    slotIndex: index,
    label: raw?.label || `Case ${index + 1}`,
    zoneType,
    plant,
    count: zoneType === "plant" ? Math.max(0, Number(raw?.count || 0)) : 0,
    sunBase: clamp(Number(raw?.sunBase ?? 2), 0, 3),
    note: raw?.note || "",
    exposureTag: raw?.exposureTag || "standard",
    actions: Array.isArray(raw?.actions) ? raw.actions : [],
    validated: Boolean(raw?.validated),
  };
}

function normalizePotager(raw, index = 0) {
  const rows = clamp(Number(raw?.rows || 3), 1, 8);
  const cols = clamp(Number(raw?.cols || 4), 1, 8);
  const defaults = createGrid(rows, cols);
  const source = Array.isArray(raw?.cells) && raw.cells.length ? raw.cells : defaults;
  const cells = Array.from({ length: rows * cols }, (_, i) => normalizeCell(source[i] || defaults[i], i));
  const selectedCellId = cells.some((c) => c.id === raw?.selectedCellId) ? raw.selectedCellId : null;
  return {
    id: raw?.id || uid(),
    name: raw?.name || `Potager ${index + 1}`,
    rows,
    cols,
    cells,
    selectedCellId,
    planValidated: Boolean(raw?.planValidated),
    diagnosis: {
      orientation: ["north", "south", "east", "west"].includes(raw?.diagnosis?.orientation) ? raw.diagnosis.orientation : "south",
      warmSide: ["top", "right", "bottom", "left"].includes(raw?.diagnosis?.warmSide) ? raw.diagnosis.warmSide : "bottom",
      shadeSide: ["top", "right", "bottom", "left"].includes(raw?.diagnosis?.shadeSide) ? raw.diagnosis.shadeSide : "top",
      windSide: ["top", "right", "bottom", "left"].includes(raw?.diagnosis?.windSide) ? raw.diagnosis.windSide : "left",
      notes: raw?.diagnosis?.notes || "",
      photoName: raw?.diagnosis?.photoName || "",
      photoData: raw?.diagnosis?.photoData || "",
    },
  };
}

function getInitialState() {
  const fallback = createPotager();
  const saved = safeRead(STORAGE, null);
  if (!saved?.potagers?.length) {
    return { potagers: [fallback], activePotagerId: fallback.id };
  }
  const potagers = saved.potagers.map((p, i) => normalizePotager(p, i));
  const activePotagerId = potagers.some((p) => p.id === saved.activePotagerId) ? saved.activePotagerId : potagers[0].id;
  return { potagers, activePotagerId };
}

function getCellIcon(cell) {
  if (cell.zoneType === "plant") return plants[cell.plant]?.icon || "🪴";
  return zoneMeta[cell.zoneType]?.icon || "⬜";
}

function getCellColor(cell) {
  if (cell.zoneType === "plant") return plants[cell.plant]?.color || "#fff";
  return zoneMeta[cell.zoneType]?.color || "#eef2f7";
}

function buildCellLabel(cell) {
  if (cell.zoneType === "plant") return plants[cell.plant]?.name || "Culture";
  return zoneMeta[cell.zoneType]?.label || "Zone";
}

function sideScore(rows, cols, index, side) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const top = row;
  const left = col;
  const right = cols - 1 - col;
  const bottom = rows - 1 - row;
  if (side === "top") return top;
  if (side === "right") return right;
  if (side === "bottom") return bottom;
  return left;
}

function isNearSide(rows, cols, index, side) {
  return sideScore(rows, cols, index, side) === 0;
}

function recommendedExposureForPlant(plantKey) {
  if (["tomate", "tomateCerise", "piment", "poivron", "basilic"].includes(plantKey)) return "chaud";
  if (["salade", "persil"].includes(plantKey)) return "frais";
  return "standard";
}

function createRemindersFromAction(cell, action) {
  const template = actionTemplates[action.type];
  if (!template) return [];
  return template.reminders.map((r) => ({
    id: uid(),
    sourceActionId: action.id,
    cellId: cell.id,
    cellLabel: cell.label,
    plant: cell.plant,
    zoneType: cell.zoneType,
    quantity: action.quantity,
    dueDate: addDaysISO(action.date, r.offset),
    title: r.title,
    averageDelay: r.average,
    signs: r.signs,
    advice: r.advice,
    done: false,
  }));
}

function getPlantAdvice(cell, potager, weather) {
  if (!cell || cell.zoneType !== "plant") return [];
  const advice = [];
  const plant = plants[cell.plant];
  const warm = isNearSide(potager.rows, potager.cols, cell.slotIndex, potager.diagnosis.warmSide);
  const shade = isNearSide(potager.rows, potager.cols, cell.slotIndex, potager.diagnosis.shadeSide);
  const windy = isNearSide(potager.rows, potager.cols, cell.slotIndex, potager.diagnosis.windSide);

  if (plant.sunNeed >= 3 && !warm) advice.push(`Cette ${plant.name.toLowerCase()} serait souvent mieux vers le côté ${potager.diagnosis.warmSide}.`);
  if (["salade", "persil"].includes(cell.plant) && shade) advice.push(`${plant.name} apprécie bien cette zone plus douce / ombrée.`);
  if (["tomate", "tomateCerise", "piment", "poivron"].includes(cell.plant) && windy) advice.push(`Prévoir protection du vent ou tuteurage côté ${potager.diagnosis.windSide}.`);
  if (weather?.temperature <= 5 && ["tomate", "tomateCerise", "piment", "poivron", "basilic"].includes(cell.plant)) advice.push(`Froid annoncé : prudence pour ${plant.name.toLowerCase()} si déjà en extérieur.`);
  if (weather?.temperature >= 28 && ["salade", "persil"].includes(cell.plant)) advice.push(`${plant.name} peut souffrir d'un après-midi trop chaud.`);
  if (cell.sunBase < plant.sunNeed) advice.push(`Soleil déclaré ${cell.sunBase}/3, alors que ${plant.name.toLowerCase()} préfère ${plant.sunNeed}/3.`);
  return advice;
}

function scorePlacementForDraft(draft, potager, slotIndex, weather) {
  if (!potager) return { score: 0, level: "neutral", reasons: [] };
  const reasons = [];
  let score = 50;
  const nearWarm = isNearSide(potager.rows, potager.cols, slotIndex, potager.diagnosis.warmSide);
  const nearShade = isNearSide(potager.rows, potager.cols, slotIndex, potager.diagnosis.shadeSide);
  const nearWind = isNearSide(potager.rows, potager.cols, slotIndex, potager.diagnosis.windSide);

  if (draft.zoneType !== "plant") {
    if (draft.zoneType === "path") {
      if (nearWarm || nearShade) score += 2;
      reasons.push("Une allée reste facile à placer tant qu'elle garde un accès clair.");
    }
    if (draft.zoneType === "greenhouse") {
      score += nearWarm ? 22 : 8;
      reasons.push(nearWarm ? "La serre profite bien du côté le plus chaud." : "Une serre est souvent meilleure dans la zone chaude.");
    }
    if (draft.zoneType === "wall") {
      score += nearWarm ? 15 : 9;
      reasons.push("Le mur sert bien de repère d'orientation et de zone abritée.");
    }
    return { score: clamp(score, 0, 100), level: score >= 70 ? "ideal" : score >= 55 ? "good" : "ok", reasons };
  }

  const plant = plants[draft.plant];
  const expectedExposure = recommendedExposureForPlant(draft.plant);

  score += draft.sunBase * 6;
  if (draft.sunBase >= plant.sunNeed) {
    score += 12;
    reasons.push("Le niveau de soleil déclaré est cohérent.");
  } else {
    score -= 16;
    reasons.push(`Cette plante préfère ${plant.sunNeed}/3 de soleil.`);
  }

  if (expectedExposure === "chaud") {
    if (nearWarm) {
      score += 20;
      reasons.push("Ce slot est sur le côté le plus chaud, bon choix.");
    } else {
      score -= 8;
      reasons.push("Tu peux viser une zone plus chaude pour cette culture.");
    }
  }

  if (expectedExposure === "frais") {
    if (nearShade) {
      score += 18;
      reasons.push("Ce slot plus doux / ombré convient bien.");
    } else {
      score -= 4;
      reasons.push("Une zone plus douce serait encore meilleure.");
    }
  }

  if (["tomate", "tomateCerise", "piment", "poivron"].includes(draft.plant) && nearWind) {
    score -= 10;
    reasons.push("Zone exposée au vent : prévoir protection ou tuteur.");
  }

  if (["salade", "persil"].includes(draft.plant) && weather?.temperature >= 28 && !nearShade) {
    score -= 12;
    reasons.push("Par forte chaleur, cette culture préférera une zone plus douce.");
  }

  if (["tomate", "tomateCerise", "piment", "poivron", "basilic"].includes(draft.plant) && weather?.temperature <= 5) {
    score -= 8;
    reasons.push("La météo froide demande prudence si cette zone est extérieure.");
  }

  if (draft.exposureTag === expectedExposure) {
    score += 8;
    reasons.push("L'ambiance choisie colle bien à la culture.");
  }

  const finalScore = clamp(score, 0, 100);
  const level = finalScore >= 78 ? "ideal" : finalScore >= 62 ? "good" : finalScore >= 48 ? "ok" : "weak";
  return { score: finalScore, level, reasons: reasons.slice(0, 3) };
}

function placementBadge(level) {
  if (level === "ideal") return { label: "★ idéal", bg: "#dcfce7", color: "#166534" };
  if (level === "good") return { label: "✓ bon", bg: "#dbeafe", color: "#1d4ed8" };
  if (level === "ok") return { label: "△ possible", bg: "#fef3c7", color: "#92400e" };
  return { label: "✕ moyen", bg: "#fee2e2", color: "#991b1b" };
}

function renderMiniPlanGrid(potager, compact = false) {
  if (!potager) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${potager.cols}, minmax(${compact ? 14 : 18}px, 1fr))`, gap: compact ? 4 : 6 }}>
      {potager.cells.map((cell) => (
        <div
          key={cell.id}
          title={`${cell.label} — ${buildCellLabel(cell)}`}
          style={{
            height: compact ? 14 : 18,
            borderRadius: 4,
            background: cell.zoneType === "empty" ? "rgba(255,255,255,0.4)" : getCellColor(cell),
            border: cell.zoneType === "empty" ? "1px dashed rgba(255,255,255,0.45)" : "1px solid rgba(15,23,42,0.10)",
          }}
        />
      ))}
    </div>
  );
}

function Card({ title, right, children, style }) {
  return (
    <div style={{ ...cardStyle(), ...style }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 20 }}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function Metric({ icon, label, value, subtitle }) {
  return (
    <div style={metricStyle()}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: "#6b7280", marginTop: 4, fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, marginTop: 6 }}>{value}</div>
      <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{subtitle}</div>
    </div>
  );
}

// Repère 2/6 — composant principal et état
export default function App() {
  const initial = getInitialState();
  const [potagers, setPotagers] = useState(initial.potagers);
  const [activePotagerId, setActivePotagerId] = useState(initial.activePotagerId);
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
  const [weather, setWeather] = useState(null);
  const [mobileTab, setMobileTab] = useState("plan");
  const [placementMode, setPlacementMode] = useState(true);
  const [draftCase, setDraftCase] = useState(createDraft());
  const [actionForm, setActionForm] = useState({ type: "miseEnTerre", quantity: 1, date: today(), note: "" });
  const [planFullscreen, setPlanFullscreen] = useState(false);
  const [showBuilderPanel, setShowBuilderPanel] = useState(true);
  const [showCasePanel, setShowCasePanel] = useState(true);
  const photoInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify({ potagers, activePotagerId }));
  }, [potagers, activePotagerId]);

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.current_weather) {
          setWeather({
            temperature: data.current_weather.temperature,
            windspeed: data.current_weather.windspeed,
          });
        }
      })
      .catch(() => setWeather(null));
  }, []);

  useEffect(() => {
    if (!potagers.length) {
      const fallback = createPotager();
      setPotagers([fallback]);
      setActivePotagerId(fallback.id);
      return;
    }
    if (!potagers.some((p) => p.id === activePotagerId)) {
      setActivePotagerId(potagers[0].id);
    }
  }, [potagers, activePotagerId]);

  const isMobile = screenWidth <= 920;

  const activePotager = useMemo(
    () => potagers.find((p) => p.id === activePotagerId) || potagers[0] || null,
    [potagers, activePotagerId]
  );

  const selectedCell = useMemo(() => {
    if (!activePotager) return null;
    return activePotager.cells.find((c) => c.id === activePotager.selectedCellId) || null;
  }, [activePotager]);

  function updateActivePotager(updater) {
    if (!activePotager) return;
    setPotagers((prev) =>
      prev.map((p) => {
        if (p.id !== activePotager.id) return p;
        const next = updater(p);
        return normalizePotager(next);
      })
    );
  }

  function selectCell(cellId) {
    updateActivePotager((p) => ({ ...p, selectedCellId: cellId }));
    if (isMobile) setMobileTab("case");
  }

  function applyPreset(rows, cols) {
    const cells = createGrid(rows, cols);
    updateActivePotager((p) => ({ ...p, rows, cols, cells, selectedCellId: null, planValidated: false }));
  }

  function createNewPotager() {
    const next = createPotager(`Potager ${potagers.length + 1}`);
    setPotagers((prev) => [...prev, next]);
    setActivePotagerId(next.id);
  }

  function duplicatePotager() {
    if (!activePotager) return;
    const clone = normalizePotager({
      ...activePotager,
      id: uid(),
      name: `${activePotager.name} copie`,
      cells: activePotager.cells.map((c) => ({ ...c, id: uid(), actions: c.actions.map((a) => ({ ...a, id: uid() })) })),
    });
    setPotagers((prev) => [...prev, clone]);
    setActivePotagerId(clone.id);
  }

  function deletePotager() {
    if (!activePotager || potagers.length <= 1) return;
    const next = potagers.filter((p) => p.id !== activePotager.id);
    setPotagers(next);
    setActivePotagerId(next[0].id);
  }

  function resetPlan() {
    if (!activePotager) return;
    applyPreset(activePotager.rows, activePotager.cols);
  }

  function placeDraftAt(index) {
    updateActivePotager((p) => ({
      ...p,
      cells: p.cells.map((cell, i) =>
        i !== index
          ? cell
          : {
              ...cell,
              label: draftCase.label || `Case ${i + 1}`,
              zoneType: draftCase.zoneType,
              plant: draftCase.zoneType === "plant" ? draftCase.plant : "vide",
              count: draftCase.zoneType === "plant" ? Math.max(0, Number(draftCase.count || 0)) : 0,
              sunBase: clamp(Number(draftCase.sunBase || 0), 0, 3),
              note: draftCase.note || "",
              exposureTag: draftCase.exposureTag || "standard",
              validated: true,
            }
      ),
      selectedCellId: p.cells[index]?.id || null,
    }));
  }

  function clearSlot(index) {
    updateActivePotager((p) => ({
      ...p,
      cells: p.cells.map((cell, i) => (i === index ? createEmptyCell(i) : cell)),
      selectedCellId: p.cells[index]?.id === p.selectedCellId ? null : p.selectedCellId,
      planValidated: false,
    }));
  }

  function copySelectedToDraft() {
    if (!selectedCell) return;
    setDraftCase({
      label: selectedCell.label,
      zoneType: selectedCell.zoneType === "empty" ? "plant" : selectedCell.zoneType,
      plant: selectedCell.zoneType === "plant" ? selectedCell.plant : "tomate",
      count: selectedCell.zoneType === "plant" ? selectedCell.count : 1,
      sunBase: selectedCell.sunBase,
      note: selectedCell.note,
      exposureTag: selectedCell.exposureTag || recommendedExposureForPlant(selectedCell.plant),
    });
    if (isMobile) setMobileTab("builder");
  }

  function updateSelectedCell(patch) {
    if (!selectedCell) return;
    updateActivePotager((p) => ({
      ...p,
      cells: p.cells.map((cell) => (cell.id === selectedCell.id ? normalizeCell({ ...cell, ...patch }, cell.slotIndex) : cell)),
      planValidated: false,
    }));
  }

  function registerAction() {
    if (!selectedCell) return;
    const action = {
      id: uid(),
      type: actionForm.type,
      date: new Date(actionForm.date).toISOString(),
      quantity: Math.max(1, Number(actionForm.quantity || 1)),
      note: actionForm.note || "",
    };
    updateActivePotager((p) => ({
      ...p,
      cells: p.cells.map((cell) => (cell.id === selectedCell.id ? { ...cell, actions: [action, ...(cell.actions || [])] } : cell)),
    }));
    setActionForm((prev) => ({ ...prev, note: "" }));
  }

  function removeAction(actionId) {
    if (!selectedCell) return;
    updateActivePotager((p) => ({
      ...p,
      cells: p.cells.map((cell) => (cell.id === selectedCell.id ? { ...cell, actions: (cell.actions || []).filter((a) => a.id !== actionId) } : cell)),
    }));
  }

  function updateDiagnosis(patch) {
    updateActivePotager((p) => ({ ...p, diagnosis: { ...p.diagnosis, ...patch }, planValidated: false }));
  }

  function validatePlanAndEnableBackground() {
    updateActivePotager((p) => ({ ...p, planValidated: true }));
  }

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateDiagnosis({ photoName: file.name, photoData: String(reader.result || "") });
    reader.readAsDataURL(file);
  }

  const metrics = useMemo(() => {
    if (!activePotager) return { totalPlants: 0, waterNeed: 0, harvest: 0 };
    const totalPlants = activePotager.cells.reduce((sum, c) => sum + Number(c.count || 0), 0);
    const waterNeed = activePotager.cells.reduce((sum, c) => sum + Number(c.count || 0) * Number(plants[c.plant]?.water || 0), 0);
    const harvest = activePotager.cells.reduce((sum, c) => sum + Number(c.count || 0) * Number(plants[c.plant]?.yield || 0), 0);
    return { totalPlants, waterNeed: waterNeed.toFixed(1), harvest: harvest.toFixed(1) };
  }, [activePotager]);

  const validatedPotagers = useMemo(() => potagers.filter((p) => p.planValidated), [potagers]);

  const allReminders = useMemo(() => {
    if (!activePotager) return [];
    const out = [];
    activePotager.cells.forEach((cell) => {
      (cell.actions || []).forEach((action) => out.push(...createRemindersFromAction(cell, action)));
    });
    return out.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [activePotager]);

  const selectedReminders = useMemo(() => {
    if (!selectedCell) return [];
    return (selectedCell.actions || []).flatMap((action) => createRemindersFromAction(selectedCell, action));
  }, [selectedCell]);

  const alerts = useMemo(() => {
    if (!activePotager) return [];
    const items = [];
    activePotager.cells.forEach((cell) => {
      if (cell.zoneType !== "plant") return;
      const plant = plants[cell.plant];
      if (cell.sunBase < plant.sunNeed) items.push(`☀️ ${plant.name} semble sous-exposé dans ${cell.label}`);
      if (weather?.temperature <= 5 && ["tomate", "tomateCerise", "piment", "poivron", "basilic"].includes(cell.plant)) items.push(`❄️ Froid : protéger ${plant.name.toLowerCase()} dans ${cell.label}`);
      if (weather?.windspeed >= 35 && isNearSide(activePotager.rows, activePotager.cols, cell.slotIndex, activePotager.diagnosis.windSide)) items.push(`💨 Vent probable sur ${cell.label} côté ${activePotager.diagnosis.windSide}`);
    });
    allReminders.slice(0, 4).forEach((r) => items.push(`⏰ ${r.title} — ${r.cellLabel} (${formatDate(r.dueDate)})`));
    return [...new Set(items)].slice(0, 8);
  }, [activePotager, allReminders, weather]);

  const draftAdvice = useMemo(() => {
    if (!activePotager) return [];
    const pseudoCell = { ...draftCase, slotIndex: 0, zoneType: draftCase.zoneType, plant: draftCase.zoneType === "plant" ? draftCase.plant : "vide", count: draftCase.zoneType === "plant" ? draftCase.count : 0 };
    const advice = [];
    if (draftCase.zoneType === "plant") {
      const expected = recommendedExposureForPlant(draftCase.plant);
      if (draftCase.exposureTag !== expected) advice.push(`Pour ${plants[draftCase.plant].name.toLowerCase()}, l'exposition la plus logique est plutôt "${expected}".`);
      advice.push(...getPlantAdvice(pseudoCell, { ...activePotager, rows: 1, cols: 1 }, weather));
    } else if (draftCase.zoneType === "path") {
      advice.push("Une allée se lit mieux si elle reste simple et cohérente d'un bout à l'autre.");
    } else if (draftCase.zoneType === "wall") {
      advice.push("Le mur aide à mémoriser l'orientation et crée souvent une zone chaude ou abritée.");
    }
    if (activePotager.diagnosis.photoName) advice.push(`Photo chargée : garde les zones les plus chaudes côté ${activePotager.diagnosis.warmSide} si cela correspond à ton observation réelle.`);
    return [...new Set(advice)].slice(0, 5);
  }, [draftCase, activePotager, weather]);

  const selectedAdvice = useMemo(() => {
    if (!selectedCell || !activePotager) return [];
    return getPlantAdvice(selectedCell, activePotager, weather);
  }, [selectedCell, activePotager, weather]);

  const slotSuggestions = useMemo(() => {
    if (!activePotager) return [];
    return activePotager.cells
      .map((cell, index) => ({
        index,
        cell,
        result: scorePlacementForDraft(draftCase, activePotager, index, weather),
      }))
      .sort((a, b) => b.result.score - a.result.score);
  }, [draftCase, activePotager, weather]);

  const bestSuggestions = slotSuggestions.slice(0, 6);

  // Repère 3/6 — composants plan, créateur, widget
  function PlanCell({ cell, index, compact = false, allowSuggestion = true, onClick, onDoubleClick }) {
    const selected = selectedCell?.id === cell.id;
    const empty = cell.zoneType === "empty";
    const suggestion = allowSuggestion ? scorePlacementForDraft(draftCase, activePotager, index, weather) : null;
    const badge = suggestion ? placementBadge(suggestion.level) : null;
    const previewCell = empty && placementMode ? { ...cell, zoneType: draftCase.zoneType, plant: draftCase.plant, sunBase: draftCase.sunBase, count: draftCase.count } : cell;
    const title = empty && placementMode ? (draftCase.label || `Case ${index + 1}`) : cell.label;
    const bodyLabel = empty && placementMode ? buildCellLabel({ zoneType: draftCase.zoneType, plant: draftCase.plant }) : buildCellLabel(cell);
    const icon = empty && placementMode ? getCellIcon({ zoneType: draftCase.zoneType, plant: draftCase.plant }) : getCellIcon(cell);
    const background = empty ? "#ffffff" : getCellColor(cell);

    return (
      <button
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        style={{
          textAlign: "left",
          border: selected ? "3px solid #111827" : empty ? "2px dashed #cbd5e1" : "1px solid rgba(0,0,0,0.08)",
          background,
          borderRadius: compact ? 18 : 22,
          minHeight: compact ? 118 : 158,
          padding: compact ? 12 : 14,
          cursor: "pointer",
          boxShadow: selected ? "0 10px 24px rgba(0,0,0,0.14)" : "0 8px 20px rgba(0,0,0,0.05)",
          color: cell.zoneType === "tree" || cell.zoneType === "wall" ? "#fff" : "#111827",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: compact ? 14 : 16 }}>{shortText(title, compact ? 13 : 16)}</div>
            <div style={{ fontSize: compact ? 12 : 13, opacity: 0.78, marginTop: 4 }}>{bodyLabel}</div>
          </div>
          <div style={{ fontSize: 11, opacity: 0.76 }}>#{index + 1}</div>
        </div>

        <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", gap: 10, marginTop: 8 }}>
          <div style={{ fontSize: compact ? 30 : 40 }}>{icon}</div>
          {badge && empty ? (
            <div style={{ background: badge.bg, color: badge.color, borderRadius: 999, padding: "5px 8px", fontWeight: 800, fontSize: 11 }}>
              {badge.label}
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 4, marginTop: 8, fontSize: compact ? 12 : 13, lineHeight: 1.35 }}>
          <div>☀ {empty && placementMode ? draftCase.sunBase : cell.sunBase}/3</div>
          <div>
            {empty && placementMode
              ? draftCase.zoneType === "plant"
                ? `${draftCase.count} plant(s)`
                : exposureOptions.find((x) => x.key === draftCase.exposureTag)?.label || draftCase.exposureTag
              : cell.zoneType === "plant"
              ? `${cell.count} plant(s)`
              : exposureOptions.find((x) => x.key === cell.exposureTag)?.label || cell.exposureTag}
          </div>
        </div>
      </button>
    );
  }

  function renderPlanGrid(compact = false) {
    if (!activePotager) return null;
    return (
      <div style={{ border: compact ? "none" : "2px dashed #cbd5e1", borderRadius: 22, padding: compact ? 0 : isMobile ? 10 : 16, background: compact ? "transparent" : "#f8fafc" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${activePotager.cols}, minmax(${compact ? 96 : isMobile ? 104 : 146}px, 1fr))`, gap: compact ? 8 : isMobile ? 10 : 14 }}>
          {activePotager.cells.map((cell, index) => (
            <PlanCell
              key={cell.id}
              cell={cell}
              index={index}
              compact={compact}
              onClick={() => {
                if (placementMode) placeDraftAt(index);
                else selectCell(cell.id);
              }}
              onDoubleClick={() => selectCell(cell.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  function renderPlanToolbar() {
    if (!activePotager) return null;
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setPlacementMode(true)} style={softButton(placementMode)}>Placement</button>
        <button onClick={() => setPlacementMode(false)} style={softButton(!placementMode)}>Lecture</button>
        <button onClick={() => setPlanFullscreen(true)} style={buttonStyle("#2563eb")}>Plein écran</button>
        <button onClick={validatePlanAndEnableBackground} style={buttonStyle(activePotager.planValidated ? "#0f766e" : "#16a34a")}>{activePotager.planValidated ? "Plan validé" : "Valider ce plan"}</button>
        <button onClick={resetPlan} style={buttonStyle("#111827")}>Vider le plan</button>
      </div>
    );
  }

  function renderPlanArea() {
    if (!activePotager) return null;
    return (
      <Card title="🗺️ Plan du potager" right={renderPlanToolbar()} style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
          <div style={{ color: "#6b7280", lineHeight: 1.5 }}>Plan plus lisible : tu crées d'abord une case, tu la poses ensuite. Double-clic pour ouvrir une case et affiner son suivi.</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {presets.map((preset) => (
              <button key={preset.key} onClick={() => applyPreset(preset.rows, preset.cols)} style={softButton(activePotager.rows === preset.rows && activePotager.cols === preset.cols)}>
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        {renderPlanGrid(false)}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          <button onClick={copySelectedToDraft} disabled={!selectedCell} style={buttonStyle(selectedCell ? "#2563eb" : "#9ca3af")}>Copier la case vers le créateur</button>
          <button onClick={() => selectedCell && clearSlot(selectedCell.slotIndex)} disabled={!selectedCell} style={buttonStyle(selectedCell ? "#b91c1c" : "#9ca3af")}>Effacer la case</button>
          <button onClick={() => selectedCell && setPlacementMode(false)} disabled={!selectedCell} style={buttonStyle(selectedCell ? "#0f766e" : "#9ca3af")}>Lire / suivre cette case</button>
        </div>
      </Card>
    );
  }

  function renderBuilder() {
    return (
      <Card title="🧩 Créateur de case" right={<div style={{ color: "#6b7280", fontSize: 13 }}>Créer → vérifier → poser</div>}>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nom visible</div>
            <input value={draftCase.label} onChange={(e) => setDraftCase((d) => ({ ...d, label: e.target.value }))} style={inputStyle()} />
          </label>

          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Type de case</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(zoneMeta).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setDraftCase((d) => ({ ...d, zoneType: key, plant: key === "plant" ? d.plant : "vide", count: key === "plant" ? Math.max(1, d.count) : 0 }))}
                  style={softButton(draftCase.zoneType === key)}
                >
                  {value.icon} {value.label}
                </button>
              ))}
            </div>
          </div>

          {draftCase.zoneType === "plant" ? (
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 110px", gap: 12 }}>
              <label>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Culture</div>
                <select value={draftCase.plant} onChange={(e) => setDraftCase((d) => ({ ...d, plant: e.target.value, exposureTag: recommendedExposureForPlant(e.target.value) }))} style={inputStyle()}>
                  {Object.keys(plants).filter((key) => key !== "vide").map((key) => (
                    <option key={key} value={key}>{plants[key].icon} {plants[key].name}</option>
                  ))}
                </select>
              </label>
              <label>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Qté</div>
                <input type="number" min={1} value={draftCase.count} onChange={(e) => setDraftCase((d) => ({ ...d, count: Math.max(1, Number(e.target.value) || 1) }))} style={inputStyle()} />
              </label>
            </div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Soleil déclaré</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                {[0, 1, 2, 3].map((n) => (
                  <button key={n} onClick={() => setDraftCase((d) => ({ ...d, sunBase: n }))} style={softButton(draftCase.sunBase === n)}>☀ {n}</button>
                ))}
              </div>
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Ambiance</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                {exposureOptions.map((option) => (
                  <button key={option.key} onClick={() => setDraftCase((d) => ({ ...d, exposureTag: option.key }))} style={softButton(draftCase.exposureTag === option.key)}>{option.label}</button>
                ))}
              </div>
            </label>
          </div>

          <label>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Note</div>
            <textarea value={draftCase.note} onChange={(e) => setDraftCase((d) => ({ ...d, note: e.target.value }))} style={areaStyle()} placeholder="Exemple : près du mur, zone très chaude, accès facile..." />
          </label>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginTop: 14 }}>
          <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 18, padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Case lisible avant placement</div>
            <PlanCell cell={{ ...draftCase, id: "preview", slotIndex: 0 }} index={0} compact={true} allowSuggestion={false} onClick={() => {}} onDoubleClick={() => {}} />
          </div>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 18, padding: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Conseil IA pendant la création</div>
            <div style={{ display: "grid", gap: 8 }}>
              {draftAdvice.length ? draftAdvice.map((item, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 12, padding: "10px 12px", lineHeight: 1.5 }}>{item}</div>
              )) : <div style={{ color: "#475569" }}>Choisis une plante ou un type de case pour obtenir un conseil.</div>}
            </div>
            <button onClick={() => { setPlacementMode(true); if (isMobile) setMobileTab("plan"); }} style={{ ...buttonStyle("#2563eb"), width: "100%", marginTop: 12 }}>Je place cette case sur le plan</button>
          </div>
        </div>

        <div style={{ marginTop: 16, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 18, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <div style={{ fontWeight: 800 }}>Suggestion de placement case par case</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>Les meilleures zones sont classées selon soleil, côté chaud, ombre, vent et météo.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            {bestSuggestions.map((item) => {
              const badge = placementBadge(item.result.level);
              return (
                <button key={item.index} onClick={() => { setPlacementMode(true); placeDraftAt(item.index); if (isMobile) setMobileTab("plan"); }} style={{ textAlign: "left", background: "#fff", border: "1px solid #dbeafe", borderRadius: 14, padding: 12, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                    <strong>Slot #{item.index + 1}</strong>
                    <span style={{ background: badge.bg, color: badge.color, borderRadius: 999, padding: "4px 8px", fontWeight: 800, fontSize: 12 }}>{badge.label}</span>
                  </div>
                  <div style={{ marginTop: 8, color: "#475569", lineHeight: 1.45 }}>{item.result.reasons.join(" • ")}</div>
                </button>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  function renderPlanWidget() {
    if (!activePotager?.planValidated) return null;
    return (
      <Card title="🪟 Widget plan" right={<div style={{ color: "#64748b", fontSize: 13 }}>Vue rapide</div>} style={{ padding: 14 }}>
        <div style={{ display: "grid", gap: 10 }}>
          {renderMiniPlanGrid(activePotager)}
          <div style={{ color: "#64748b", lineHeight: 1.5 }}>Ce widget garde ton plan accessible pendant que tu te concentres sur les rappels, le diagnostic et les actions.</div>
        </div>
      </Card>
    );
  }

  // Repère 4/6 — panneaux assistant, case, suivi
  function renderAssistant() {
    if (!activePotager) return null;
    const d = activePotager.diagnosis;
    return (
      <Card title="🧭 Assistant jardin + diagnostic" right={<div style={{ color: "#6b7280", fontSize: 13 }}>{CITY}</div>}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
          <div style={{ display: "grid", gap: 12 }}>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Orientation générale du jardin</div>
              <select value={d.orientation} onChange={(e) => updateDiagnosis({ orientation: e.target.value })} style={inputStyle()}>
                <option value="north">Nord</option>
                <option value="south">Sud</option>
                <option value="east">Est</option>
                <option value="west">Ouest</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Côté le plus chaud / lumineux</div>
              <select value={d.warmSide} onChange={(e) => updateDiagnosis({ warmSide: e.target.value })} style={inputStyle()}>
                <option value="top">Haut du plan</option>
                <option value="right">Droite du plan</option>
                <option value="bottom">Bas du plan</option>
                <option value="left">Gauche du plan</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Côté le plus ombragé</div>
              <select value={d.shadeSide} onChange={(e) => updateDiagnosis({ shadeSide: e.target.value })} style={inputStyle()}>
                <option value="top">Haut du plan</option>
                <option value="right">Droite du plan</option>
                <option value="bottom">Bas du plan</option>
                <option value="left">Gauche du plan</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Côté le plus exposé au vent</div>
              <select value={d.windSide} onChange={(e) => updateDiagnosis({ windSide: e.target.value })} style={inputStyle()}>
                <option value="top">Haut du plan</option>
                <option value="right">Droite du plan</option>
                <option value="bottom">Bas du plan</option>
                <option value="left">Gauche du plan</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Note de diagnostic</div>
              <textarea value={d.notes} onChange={(e) => updateDiagnosis({ notes: e.target.value })} style={areaStyle()} placeholder="Exemple : soleil fort côté mur à partir de midi, zone gauche fraîche..." />
            </label>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ background: "#f8fafc", borderRadius: 18, padding: 14, border: "1px solid #e5e7eb" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Photo du jardin</div>
              {d.photoData ? <img src={d.photoData} alt="Jardin" style={{ width: "100%", borderRadius: 14, maxHeight: 260, objectFit: "cover" }} /> : <div style={{ color: "#64748b", lineHeight: 1.5 }}>Ajoute une photo pour garder un support visuel du diagnostic. La vraie lecture IA multi-utilisateur demandera un backend, mais ici on prépare déjà le bon flux.</div>}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <button onClick={() => photoInputRef.current?.click()} style={buttonStyle("#7c3aed")}>{d.photoName ? "Changer la photo" : "Ajouter une photo"}</button>
                {d.photoName ? <div style={{ alignSelf: "center", color: "#64748b", fontSize: 13 }}>{d.photoName}</div> : null}
              </div>
            </div>

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 18, padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Conseils du diagnostic</div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ background: "#fff", borderRadius: 12, padding: 12 }}>Le côté le plus chaud semble être <strong>{d.warmSide}</strong> : réserve-le plutôt aux tomates, piments, poivrons ou basilic.</div>
                <div style={{ background: "#fff", borderRadius: 12, padding: 12 }}>Le côté plus ombragé semble être <strong>{d.shadeSide}</strong> : plus doux pour salade, persil et zones de repos.</div>
                <div style={{ background: "#fff", borderRadius: 12, padding: 12 }}>Vent probable côté <strong>{d.windSide}</strong> : pense protection, tuteurage ou cultures plus basses.</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  function renderCasePanel() {
    return (
      <Card title="📌 Case sélectionnée" right={selectedCell ? <div style={{ color: "#64748b", fontSize: 13 }}>Double-clic sur le plan pour ouvrir</div> : null}>
        {selectedCell ? (
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 14 }}>
              <div style={{ background: getCellColor(selectedCell), borderRadius: 18, padding: 14, minHeight: 170 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div style={{ fontWeight: 800 }}>{selectedCell.label}</div>
                  <div style={{ fontSize: 12 }}>{buildCellLabel(selectedCell)}</div>
                </div>
                <div style={{ fontSize: 40, marginTop: 10 }}>{getCellIcon(selectedCell)}</div>
                <div style={{ marginTop: 8 }}>☀ {selectedCell.sunBase}/3</div>
                <div style={{ marginTop: 4 }}>{selectedCell.zoneType === "plant" ? `${selectedCell.count} plant(s)` : exposureOptions.find((x) => x.key === selectedCell.exposureTag)?.label || selectedCell.exposureTag}</div>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <label>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nom</div>
                  <input value={selectedCell.label} onChange={(e) => updateSelectedCell({ label: e.target.value })} style={inputStyle()} />
                </label>
                <label>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Type</div>
                  <select value={selectedCell.zoneType} onChange={(e) => updateSelectedCell({ zoneType: e.target.value, plant: e.target.value === "plant" ? selectedCell.plant : "vide", count: e.target.value === "plant" ? Math.max(1, selectedCell.count || 1) : 0 })} style={inputStyle()}>
                    {Object.entries(zoneMeta).map(([key, value]) => <option key={key} value={key}>{value.icon} {value.label}</option>)}
                  </select>
                </label>
                {selectedCell.zoneType === "plant" ? (
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 110px", gap: 12 }}>
                    <select value={selectedCell.plant} onChange={(e) => updateSelectedCell({ plant: e.target.value, exposureTag: recommendedExposureForPlant(e.target.value) })} style={inputStyle()}>
                      {Object.keys(plants).filter((key) => key !== "vide").map((key) => <option key={key} value={key}>{plants[key].icon} {plants[key].name}</option>)}
                    </select>
                    <input type="number" min={1} value={selectedCell.count} onChange={(e) => updateSelectedCell({ count: Math.max(1, Number(e.target.value) || 1) })} style={inputStyle()} />
                  </div>
                ) : null}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <label>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Soleil</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                  {[0, 1, 2, 3].map((n) => (
                    <button key={n} onClick={() => updateSelectedCell({ sunBase: n })} style={softButton(selectedCell.sunBase === n)}>☀ {n}</button>
                  ))}
                </div>
              </label>
              <label>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Ambiance</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                  {exposureOptions.map((option) => (
                    <button key={option.key} onClick={() => updateSelectedCell({ exposureTag: option.key })} style={softButton(selectedCell.exposureTag === option.key)}>{option.label}</button>
                  ))}
                </div>
              </label>
            </div>

            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Note</div>
              <textarea value={selectedCell.note} onChange={(e) => updateSelectedCell({ note: e.target.value })} style={areaStyle()} placeholder="Exemple : accès facile, mur chaud, surveillance du vent..." />
            </label>

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 16, padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Conseils IA pour cette case</div>
              {selectedAdvice.length ? <div style={{ display: "grid", gap: 8 }}>{selectedAdvice.map((item, i) => <div key={i} style={{ background: "#fff", borderRadius: 12, padding: 12 }}>{item}</div>)}</div> : <div style={{ color: "#475569" }}>Sélectionne une culture pour obtenir un conseil de placement ou de suivi.</div>}
            </div>

            <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Valider une action → générer des rappels</div>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 110px 160px", gap: 10 }}>
                <select value={actionForm.type} onChange={(e) => setActionForm((f) => ({ ...f, type: e.target.value }))} style={inputStyle()}>
                  {Object.entries(actionTemplates).map(([key, value]) => <option key={key} value={key}>{value.icon} {value.label}</option>)}
                </select>
                <input type="number" min={1} value={actionForm.quantity} onChange={(e) => setActionForm((f) => ({ ...f, quantity: Math.max(1, Number(e.target.value) || 1) }))} style={inputStyle()} />
                <input type="date" value={actionForm.date} onChange={(e) => setActionForm((f) => ({ ...f, date: e.target.value }))} style={inputStyle()} />
              </div>
              <textarea value={actionForm.note} onChange={(e) => setActionForm((f) => ({ ...f, note: e.target.value }))} style={{ ...areaStyle(), marginTop: 10 }} placeholder="Note optionnelle" />
              <button onClick={registerAction} style={{ ...buttonStyle("#2563eb"), marginTop: 10 }}>Valider cette action</button>
            </div>

            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 16, padding: 14 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Rappels générés</div>
              {selectedReminders.length ? (
                <div style={{ display: "grid", gap: 10 }}>
                  {selectedReminders.map((r) => (
                    <div key={r.id} style={{ background: "#fff", borderRadius: 12, padding: 12 }}>
                      <div style={{ fontWeight: 800 }}>{r.title}</div>
                      <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>Pour le {formatDate(r.dueDate)} • Quantité : {r.quantity}</div>
                      <div style={{ marginTop: 8 }}><strong>Délai moyen :</strong> {r.averageDelay}</div>
                      <div style={{ marginTop: 6 }}><strong>Signes :</strong> {r.signs.join(" • ")}</div>
                      <div style={{ marginTop: 6 }}><strong>Conseil :</strong> {r.advice}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ color: "#475569" }}>Aucun rappel pour cette case tant qu’aucune action n’est validée.</div>}
            </div>

            {(selectedCell.actions || []).length ? (
              <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 16, padding: 14 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Historique des actions</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {selectedCell.actions.map((a) => (
                    <div key={a.id} style={{ background: "#fff", borderRadius: 12, padding: 12, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{actionTemplates[a.type]?.icon} {actionTemplates[a.type]?.label}</div>
                        <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{formatDate(a.date)} • Quantité : {a.quantity}</div>
                        {a.note ? <div style={{ marginTop: 6 }}>{a.note}</div> : null}
                      </div>
                      <button onClick={() => removeAction(a.id)} style={buttonStyle("#b91c1c")}>Suppr.</button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ color: "#64748b", lineHeight: 1.6 }}>Sélectionne une case sur le plan en mode lecture, ou double-clique une case après placement pour ouvrir son suivi.</div>
        )}
      </Card>
    );
  }

  function renderFollowPanel() {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {renderPlanWidget()}
        <Card title="🚨 Alertes du moment" right={weather ? <div style={{ color: "#6b7280", fontSize: 13 }}>{weather.temperature}°C • {weather.windspeed} km/h</div> : null}>
          {alerts.length ? <div style={{ display: "grid", gap: 8 }}>{alerts.map((item, i) => <div key={i} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "10px 12px" }}>{item}</div>)}</div> : <div style={{ color: "#64748b" }}>Aucune alerte détectée pour le moment.</div>}
        </Card>
        <Card title="⏰ Rappels globaux">
          {allReminders.length ? (
            <div style={{ display: "grid", gap: 8, maxHeight: 420, overflow: "auto" }}>
              {allReminders.map((r) => (
                <div key={r.id} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 800 }}>{r.title}</div>
                  <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{r.cellLabel} • {formatDate(r.dueDate)} • {r.quantity} unité(s)</div>
                  <div style={{ marginTop: 6 }}><strong>Délai moyen :</strong> {r.averageDelay}</div>
                  <div style={{ marginTop: 6 }}><strong>Signes :</strong> {r.signs.join(" • ")}</div>
                </div>
              ))}
            </div>
          ) : <div style={{ color: "#64748b" }}>Valide une action sur une case pour générer des rappels intelligents.</div>}
        </Card>
      </div>
    );
  }

  // Repère 5/6 — rendu principal
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: activePotager?.planValidated ? "linear-gradient(180deg, #dbeafe 0%, #eff6ff 28%, #f8fafc 100%)" : "linear-gradient(180deg, #edf4f8 0%, #f7fafc 100%)", minHeight: "100vh", padding: isMobile ? 12 : 24, color: "#111827", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <input ref={photoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />

        {activePotager?.planValidated ? (
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 28, padding: isMobile ? 16 : 22, marginBottom: 16, background: "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(29,78,216,0.82))", color: "#fff", boxShadow: "0 18px 36px rgba(15,23,42,0.18)" }}>
            <div style={{ position: "absolute", inset: 0, opacity: 0.18, pointerEvents: "none", padding: 18 }}>{renderMiniPlanGrid(activePotager, true)}</div>
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr", gap: 18, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.2, opacity: 0.8 }}>Fond stylisé du potager validé</div>
                <h1 style={{ margin: "8px 0 0", fontSize: isMobile ? 34 : 52 }}>🌱 {activePotager.name}</h1>
                <div style={{ marginTop: 10, maxWidth: 760, lineHeight: 1.55, opacity: 0.95 }}>Ton plan devient l'arrière-plan visuel du suivi. Tu construis d'abord, tu valides ensuite, puis tu pilotes surtout les conseils, les rappels et les actions.</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                  <button onClick={() => setPlanFullscreen(true)} style={ghostButton()}>Ouvrir le plan en plein écran</button>
                  <button onClick={() => updateActivePotager((p) => ({ ...p, planValidated: false }))} style={ghostButton()}>Repasser en mode construction</button>
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.10)", borderRadius: 20, padding: 14, backdropFilter: "blur(8px)" }}>
                <div style={{ fontWeight: 800, marginBottom: 10 }}>Mur local des plans validés</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {validatedPotagers.slice(0, 4).map((potager) => (
                    <button key={potager.id} onClick={() => setActivePotagerId(potager.id)} style={{ textAlign: "left", background: potager.id === activePotagerId ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 16, padding: 10, color: "#fff", cursor: "pointer" }}>
                      <div style={{ fontWeight: 800, marginBottom: 6 }}>{potager.name}</div>
                      {renderMiniPlanGrid(potager, true)}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: 12, opacity: 0.78, marginTop: 10 }}>Vue locale des plans enregistrés dans ce navigateur. Le vrai mode multi-utilisateur demandera un backend.</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ flex: "1 1 340px" }}>
              <h1 style={{ margin: 0, fontSize: isMobile ? 34 : 52 }}>🌱 Assistant Potager 2.2.1</h1>
              <div style={{ color: "#4b5563", marginTop: 6, lineHeight: 1.4 }}>Case plus lisible • plein écran du plan • widget de suivi • fond stylisé après validation • suggestion de placement case par case.</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={createNewPotager} style={buttonStyle("#2563eb")}>Nouveau potager</button>
              <button onClick={duplicatePotager} style={buttonStyle("#0f766e")}>Dupliquer</button>
              <button onClick={deletePotager} disabled={potagers.length <= 1} style={buttonStyle(potagers.length > 1 ? "#b91c1c" : "#9ca3af")}>Supprimer</button>
            </div>
          </div>
        )}

        <Card title="🗂 Gestion des potagers" right={activePotager?.planValidated ? <div style={{ color: "#0f766e", fontWeight: 800, fontSize: 13 }}>Plan validé</div> : null}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "240px 1fr", gap: 12 }}>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Potager actif</div>
              <select value={activePotagerId} onChange={(e) => setActivePotagerId(e.target.value)} style={inputStyle()}>
                {potagers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nom</div>
              <input value={activePotager?.name || ""} onChange={(e) => updateActivePotager((p) => ({ ...p, name: e.target.value }))} style={inputStyle()} />
            </label>
          </div>
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(180px, 1fr))", gap: 14, marginTop: 16, marginBottom: 16 }}>
          <Metric icon="🌿" label="Plants au total" value={metrics.totalPlants} subtitle="Dans le potager actif" />
          <Metric icon="💧" label="Arrosage estimé / jour" value={`${metrics.waterNeed} L`} subtitle="Estimation théorique" />
          <Metric icon="🧺" label="Récolte estimée" value={`${metrics.harvest} kg`} subtitle="Potentiel global" />
        </div>

        {isMobile ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
              {mobileTabs.map((tab) => (
                <button key={tab.key} onClick={() => setMobileTab(tab.key)} style={softButton(mobileTab === tab.key)}>{tab.icon} {tab.label}</button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 14 }}>
              {mobileTab === "plan" ? renderPlanArea() : null}
              {mobileTab === "builder" ? renderBuilder() : null}
              {mobileTab === "assistant" ? renderAssistant() : null}
              {mobileTab === "case" ? renderCasePanel() : null}
              {mobileTab === "follow" ? renderFollowPanel() : null}
            </div>
          </>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: activePotager?.planValidated ? "minmax(860px, 1.65fr) minmax(300px, 0.72fr)" : "minmax(820px, 1.45fr) minmax(360px, 0.95fr)", gap: 20, alignItems: "start" }}>
            <div style={{ display: "grid", gap: 16 }}>
              {renderPlanArea()}
              {renderAssistant()}
              {renderFollowPanel()}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <Card title="🎛 Panneaux latéraux" right={<div style={{ color: "#64748b", fontSize: 13 }}>Réduis le bruit visuel</div>}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button onClick={() => setShowBuilderPanel((v) => !v)} style={softButton(showBuilderPanel)}>{showBuilderPanel ? "Masquer créateur" : "Afficher créateur"}</button>
                  <button onClick={() => setShowCasePanel((v) => !v)} style={softButton(showCasePanel)}>{showCasePanel ? "Masquer case" : "Afficher case"}</button>
                </div>
              </Card>
              {showBuilderPanel ? renderBuilder() : null}
              {showCasePanel ? renderCasePanel() : null}
              {activePotager?.planValidated ? renderPlanWidget() : null}
            </div>
          </div>
        )}

        {planFullscreen && activePotager ? (
          <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,23,42,0.74)", backdropFilter: "blur(8px)", padding: isMobile ? 10 : 20, overflow: "auto" }}>
            <div style={{ maxWidth: 1700, margin: "0 auto", background: "#f8fafc", borderRadius: 28, padding: isMobile ? 12 : 18, boxShadow: "0 20px 40px rgba(15,23,42,0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: isMobile ? 26 : 34 }}>🗺️ Plan plein écran</h2>
                  <div style={{ color: "#64748b", marginTop: 4 }}>Grand mode de création : le plan passe avant tout le reste.</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {renderPlanToolbar()}
                  <button onClick={() => setPlanFullscreen(false)} style={buttonStyle("#111827")}>Fermer</button>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.4fr 0.6fr", gap: 18, alignItems: "start" }}>
                <div>{renderPlanGrid(false)}</div>
                <div style={{ display: "grid", gap: 16 }}>
                  <Card title="Case en cours" style={{ padding: 14 }}>
                    <PlanCell cell={{ ...draftCase, id: "fullscreen-preview", slotIndex: 0 }} index={0} compact={true} allowSuggestion={false} onClick={() => {}} onDoubleClick={() => {}} />
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                      <button onClick={() => { setPlanFullscreen(false); setMobileTab("builder"); }} style={softButton()}>Modifier la case</button>
                      <button onClick={() => setPlacementMode(true)} style={softButton(placementMode)}>Utiliser cette case</button>
                    </div>
                  </Card>
                  <Card title="Meilleurs emplacements" style={{ padding: 14 }}>
                    <div style={{ display: "grid", gap: 8 }}>
                      {bestSuggestions.slice(0, 5).map((item) => {
                        const badge = placementBadge(item.result.level);
                        return (
                          <button key={item.index} onClick={() => placeDraftAt(item.index)} style={{ textAlign: "left", background: "#fff", border: "1px solid #d1d5db", borderRadius: 14, padding: 12, cursor: "pointer" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                              <strong>Slot #{item.index + 1}</strong>
                              <span style={{ background: badge.bg, color: badge.color, borderRadius: 999, padding: "4px 8px", fontWeight: 800, fontSize: 12 }}>{badge.label}</span>
                            </div>
                            <div style={{ marginTop: 6, color: "#475569", lineHeight: 1.45 }}>{item.result.reasons.join(" • ")}</div>
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Repère 6/6 — fin du fichier
