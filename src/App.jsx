import React, { useEffect, useMemo, useRef, useState } from "react";

// Repère 1/6 — catalogue, helpers, modèles
const CITY = "Saint-Germain-lès-Arpajon (91180)";
const LAT = 48.616;
const LON = 2.258;
const STORAGE = "potager_v23_plan_minimaliste";

const structures = {
  empty: { label: "Vide", icon: "", color: "#f8fafc", border: "#cbd5e1", cultivable: false },
  soil: { label: "Potager", icon: "🪴", color: "#fef3c7", border: "#d97706", cultivable: true },
  greenhouse: { label: "Serre", icon: "🏕️", color: "#ccfbf1", border: "#0f766e", cultivable: true },
  lawn: { label: "Pelouse", icon: "🟩", color: "#dcfce7", border: "#22c55e", cultivable: false },
  path: { label: "Allée", icon: "🪨", color: "#e7e5e4", border: "#78716c", cultivable: false },
  terrace: { label: "Terrasse", icon: "🟫", color: "#e7d3c4", border: "#9a6c44", cultivable: false },
  wall: { label: "Mur", icon: "🧱", color: "#dbe4ee", border: "#64748b", cultivable: false },
  fence: { label: "Clôture", icon: "🪵", color: "#edd7c0", border: "#8b5a2b", cultivable: false },
  shade: { label: "Ombre", icon: "🌳", color: "#dbeafe", border: "#2563eb", cultivable: false },
};

const plants = {
  tomate: { name: "Tomate", icon: "🍅", color: "#ef4444", water: 1.2, yield: 3, sunNeed: 3 },
  tomateCerise: { name: "Tomate cerise", icon: "🍅", color: "#fb7185", water: 1, yield: 2, sunNeed: 3 },
  piment: { name: "Piment", icon: "🌶️", color: "#dc2626", water: 0.8, yield: 0.6, sunNeed: 3 },
  poivron: { name: "Poivron", icon: "🫑", color: "#f59e0b", water: 0.8, yield: 1, sunNeed: 3 },
  salade: { name: "Salade", icon: "🥬", color: "#84cc16", water: 0.5, yield: 0.3, sunNeed: 1 },
  basilic: { name: "Basilic", icon: "🌿", color: "#22c55e", water: 0.4, yield: 0.2, sunNeed: 2 },
  persil: { name: "Persil", icon: "🌱", color: "#15803d", water: 0.3, yield: 0.2, sunNeed: 1 },
  fleurs: { name: "Fleurs utiles", icon: "🌼", color: "#fde047", water: 0.2, yield: 0, sunNeed: 2 },
};

const presets = [
  { key: "3x4", label: "3×4", rows: 3, cols: 4 },
  { key: "4x6", label: "4×6", rows: 4, cols: 6 },
  { key: "5x8", label: "5×8", rows: 5, cols: 8 },
  { key: "6x10", label: "6×10", rows: 6, cols: 10 },
  { key: "8x12", label: "8×12", rows: 8, cols: 12 },
  { key: "10x12", label: "10×12", rows: 10, cols: 12 },
  { key: "long", label: "Longueur 4×12", rows: 4, cols: 12 },
  { key: "square", label: "Grand carré 8×8", rows: 8, cols: 8 },
];

const structureOrder = ["soil", "greenhouse", "lawn", "path", "terrace", "wall", "fence", "shade", "empty"];
const plantOrder = ["tomate", "tomateCerise", "piment", "poivron", "salade", "basilic", "persil", "fleurs"];
const sunOptions = [
  { value: 0, label: "Ombre" },
  { value: 1, label: "Frais" },
  { value: 2, label: "Équilibré" },
  { value: 3, label: "Très ensoleillé" },
];
const tabs = [
  { key: "plan", label: "Plan", icon: "🗺️" },
  { key: "assistant", label: "Assistant", icon: "🧭" },
  { key: "follow", label: "Suivi", icon: "⏰" },
];

const actionTemplates = {
  semis: {
    label: "Semis",
    icon: "🌱",
    reminders: [
      {
        offset: 7,
        title: "Contrôler la levée",
        average: "5 à 10 jours",
        signs: ["premières pousses", "substrat humide", "levée homogène"],
        advice: "Maintenir humide et lumineux sans détremper.",
      },
      {
        offset: 14,
        title: "Vérifier densité / éclaircir",
        average: "10 à 20 jours",
        signs: ["vraies feuilles", "plants serrés", "croissance régulière"],
        advice: "Éclaircir ou repiquer si les plantules se touchent.",
      },
    ],
  },
  repiquage: {
    label: "Repiquage",
    icon: "🪴",
    reminders: [
      {
        offset: 3,
        title: "Surveiller la reprise",
        average: "2 à 4 jours",
        signs: ["feuilles moins molles", "port redressé", "pas de jaunissement massif"],
        advice: "Arroser modérément et éviter le stress.",
      },
      {
        offset: 7,
        title: "Valider la reprise visible",
        average: "5 à 8 jours",
        signs: ["nouvelle pousse", "tige stable", "croissance repart"],
        advice: "Ajuster lumière et espacement si besoin.",
      },
    ],
  },
  miseEnTerre: {
    label: "Mise en terre",
    icon: "🌤️",
    reminders: [
      {
        offset: 2,
        title: "Arrosage de reprise",
        average: "1 à 3 jours",
        signs: ["terre fraîche", "pas de flétrissement prolongé", "plante stable"],
        advice: "Arroser si le sol sèche vite.",
      },
      {
        offset: 7,
        title: "Contrôler installation",
        average: "5 à 10 jours",
        signs: ["croissance reprend", "feuillage sain", "pas de stress durable"],
        advice: "Vérifier exposition et tuteurage éventuel.",
      },
    ],
  },
  tuteurage: {
    label: "Tuteurage",
    icon: "🪵",
    reminders: [
      {
        offset: 5,
        title: "Vérifier attaches",
        average: "3 à 7 jours",
        signs: ["attache non serrée", "tige bien maintenue", "pas de frottement"],
        advice: "Desserrer ou repositionner si la tige grossit.",
      },
    ],
  },
  recolte: {
    label: "Récolte",
    icon: "🧺",
    reminders: [
      {
        offset: 4,
        title: "Vérifier nouvelle récolte",
        average: "3 à 7 jours",
        signs: ["nouveaux fruits", "floraison active", "feuillage sain"],
        advice: "Continuer l’entretien et récolter régulièrement.",
      },
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function addDaysISO(dateStr, offset) {
  const d = new Date(dateStr || new Date().toISOString());
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

function small(text, limit = 14) {
  if (!text) return "";
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

function fieldStyle() {
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

function button(bg, color = "#fff") {
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
    border: `1px solid ${active ? "#6366f1" : "#d1d5db"}`,
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 40,
  };
}

function chipStyle(active, accent = "#111827") {
  return {
    background: active ? "#eef2ff" : "#fff",
    color: "#111827",
    border: `1px solid ${active ? accent : "#d1d5db"}`,
    borderRadius: 999,
    padding: "7px 10px",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 13,
    whiteSpace: "nowrap",
  };
}

function miniAction(active = false) {
  return {
    background: active ? "#111827" : "#fff",
    color: active ? "#fff" : "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: "8px 10px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 36,
  };
}

function cardStyle() {
  return {
    background: "#fff",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
  };
}

function createCell(overrides = {}) {
  return {
    id: uid(),
    structure: "empty",
    plant: "",
    count: 0,
    sun: 2,
    note: "",
    actions: [],
    reminders: [],
    ...overrides,
  };
}

function createGrid(rows, cols) {
  return Array.from({ length: rows * cols }, () => createCell());
}

function createPlan(name = "Potager principal", rows = 5, cols = 8) {
  return {
    id: uid(),
    name,
    rows,
    cols,
    cells: createGrid(rows, cols),
    orientation: "south",
    brightSide: "south",
    shadySide: "north",
    diagnosisNote: "",
    photoDataUrl: "",
    zoom: 100,
    backgroundValidated: false,
  };
}

function normalizePlan(raw, index = 0) {
  const rows = clamp(Number(raw?.rows || 5), 2, 20);
  const cols = clamp(Number(raw?.cols || 8), 2, 20);
  const expected = rows * cols;
  const rawCells = Array.isArray(raw?.cells) ? raw.cells : [];
  const cells = Array.from({ length: expected }, (_, i) => {
    const source = rawCells[i] || {};
    const structure = structures[source.structure] ? source.structure : "empty";
    const cultivable = structures[structure].cultivable;
    return createCell({
      id: source.id || uid(),
      structure,
      plant: cultivable && plants[source.plant] ? source.plant : "",
      count: cultivable ? Math.max(0, Number(source.count || 0)) : 0,
      sun: clamp(Number(source.sun ?? 2), 0, 3),
      note: source.note || "",
      actions: Array.isArray(source.actions) ? source.actions : [],
      reminders: Array.isArray(source.reminders) ? source.reminders : [],
    });
  });
  return {
    id: raw?.id || uid(),
    name: raw?.name || `Potager ${index + 1}`,
    rows,
    cols,
    cells,
    orientation: ["north", "south", "east", "west"].includes(raw?.orientation)
      ? raw.orientation
      : "south",
    brightSide: ["north", "south", "east", "west"].includes(raw?.brightSide)
      ? raw.brightSide
      : "south",
    shadySide: ["north", "south", "east", "west"].includes(raw?.shadySide)
      ? raw.shadySide
      : "north",
    diagnosisNote: raw?.diagnosisNote || "",
    photoDataUrl: raw?.photoDataUrl || "",
    zoom: clamp(Number(raw?.zoom || 100), 55, 150),
    backgroundValidated: Boolean(raw?.backgroundValidated),
  };
}

function getInitialState() {
  const fallback = createPlan();
  const saved = safeRead(STORAGE, null);
  if (!saved?.plans?.length) {
    return { plans: [fallback], activePlanId: fallback.id };
  }
  const plans = saved.plans.map((plan, index) => normalizePlan(plan, index));
  const activePlanId = plans.some((plan) => plan.id === saved.activePlanId)
    ? saved.activePlanId
    : plans[0].id;
  return { plans, activePlanId };
}

function Card({ title, right, children }) {
  return (
    <div style={cardStyle()}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 14,
        }}
      >
        <h3 style={{ margin: 0, fontSize: 20 }}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function sideToFrench(side) {
  if (side === "north") return "Nord";
  if (side === "south") return "Sud";
  if (side === "east") return "Est";
  return "Ouest";
}

function sunLabel(value) {
  return sunOptions.find((item) => item.value === value)?.label || "Équilibré";
}

function isLateReminder(reminder) {
  return !reminder.done && new Date(reminder.dueDate) < new Date(new Date().toDateString());
}

function isTodayReminder(reminder) {
  const todayStr = new Date().toDateString();
  return !reminder.done && new Date(reminder.dueDate).toDateString() === todayStr;
}

function getCellCoords(index, cols) {
  return { row: Math.floor(index / cols), col: index % cols };
}

function cellScore({ index, plan, cell, weather }) {
  const { row, col } = getCellCoords(index, plan.cols);
  let score = cell.sun;
  const maxRow = plan.rows - 1;
  const maxCol = plan.cols - 1;
  if (plan.brightSide === "south") score += row / Math.max(1, maxRow);
  if (plan.brightSide === "north") score += (maxRow - row) / Math.max(1, maxRow);
  if (plan.brightSide === "east") score += col / Math.max(1, maxCol);
  if (plan.brightSide === "west") score += (maxCol - col) / Math.max(1, maxCol);
  if (plan.shadySide === "south") score -= row / Math.max(1, maxRow);
  if (plan.shadySide === "north") score -= (maxRow - row) / Math.max(1, maxRow);
  if (plan.shadySide === "east") score -= col / Math.max(1, maxCol);
  if (plan.shadySide === "west") score -= (maxCol - col) / Math.max(1, maxCol);
  if (weather?.temperature >= 28 && cell.structure === "greenhouse") score += 0.2;
  if (weather?.windspeed >= 35 && ["wall", "fence"].includes(cell.structure)) score += 0.3;
  return score;
}

function getPlacementAdvice({ cell, index, plan, weather }) {
  const structure = structures[cell.structure];
  if (!structure.cultivable) {
    if (cell.structure === "wall") return "Mur utile pour lire l’orientation et couper le vent.";
    if (cell.structure === "terrace") return "Terrasse : pas de pleine terre ici, garde-la comme repère de circulation.";
    if (cell.structure === "fence") return "Clôture : bon repère de bord, utile pour fleurs compagnes ou brise-vent proche.";
    if (cell.structure === "shade") return "Zone ombrée : préfère salades, persil ou zone de repos visuel.";
    return "Zone structurelle : garde cette case pour lire le jardin avant de planter ailleurs.";
  }
  if (!cell.plant) return "Case cultivable : choisis une culture selon l’exposition et la météo.";
  const plant = plants[cell.plant];
  const score = cellScore({ index, plan, cell, weather });
  if (plant.sunNeed >= 3 && score >= 2.5) {
    return `Très bon emplacement pour ${plant.name.toLowerCase()} : chaud et lumineux.`;
  }
  if (plant.sunNeed >= 3 && score < 2) {
    return `${plant.name} risque de manquer de soleil ici. Essaie une zone plus exposée.`;
  }
  if (plant.sunNeed <= 1 && score <= 1.8) {
    return `${plant.name} tolère bien cette zone plus fraîche.`;
  }
  if (weather?.temperature >= 28 && plant.sunNeed <= 1) {
    return `${plant.name} profitera d’une zone moins brûlante pendant les fortes chaleurs.`;
  }
  if (weather?.windspeed >= 35 && ["tomate", "tomateCerise", "poivron", "piment"].includes(cell.plant)) {
    return `${plant.name} : surveille le vent, un tuteur ou une zone plus abritée peut aider.`;
  }
  return `${plant.name} : emplacement correct, surveille surtout l’arrosage et la reprise.`;
}

// Repère 2/6 — composant principal, état, persistance
export default function App() {
  const initial = getInitialState();
  const [plans, setPlans] = useState(initial.plans);
  const [activePlanId, setActivePlanId] = useState(initial.activePlanId);
  const [tab, setTab] = useState("plan");
  const [weather, setWeather] = useState(null);
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [editor, setEditor] = useState({ open: false, x: 0, y: 0 });
  const [builderStep, setBuilderStep] = useState(1);
  const [fullscreenPlan, setFullscreenPlan] = useState(false);
  const [focusOnlyPlan, setFocusOnlyPlan] = useState(true);
  const [photoUploading, setPhotoUploading] = useState(false);
  const planRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify({ plans, activePlanId }));
  }, [plans, activePlanId]);

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
    if (!plans.length) {
      const next = createPlan();
      setPlans([next]);
      setActivePlanId(next.id);
      return;
    }
    if (!plans.some((plan) => plan.id === activePlanId)) {
      setActivePlanId(plans[0].id);
    }
  }, [plans, activePlanId]);

  const isMobile = screenWidth <= 920;
  const activePlan = useMemo(
    () => plans.find((plan) => plan.id === activePlanId) || plans[0] || null,
    [plans, activePlanId]
  );

  const selectedCell = useMemo(
    () => (activePlan && selectedIndex !== null ? activePlan.cells[selectedIndex] : null),
    [activePlan, selectedIndex]
  );

  const pageBackground = useMemo(() => {
    if (!activePlan?.backgroundValidated) {
      return "linear-gradient(180deg, #edf4f8 0%, #f7fafc 100%)";
    }
    return [
      "radial-gradient(circle at 10% 10%, rgba(34,197,94,0.12), transparent 24%)",
      "radial-gradient(circle at 85% 20%, rgba(239,68,68,0.08), transparent 28%)",
      "radial-gradient(circle at 70% 80%, rgba(245,158,11,0.08), transparent 24%)",
      "linear-gradient(180deg, #edf4f8 0%, #f7fafc 100%)",
    ].join(",");
  }, [activePlan]);

  function updateActivePlan(updater) {
    if (!activePlan) return;
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id !== activePlan.id) return plan;
        const next = normalizePlan(updater(plan));
        return next;
      })
    );
  }

  function updateCell(index, updater) {
    if (!activePlan) return;
    updateActivePlan((plan) => ({
      ...plan,
      cells: plan.cells.map((cell, i) => {
        if (i !== index) return cell;
        const next = updater(cell);
        const structure = structures[next.structure] ? next.structure : "empty";
        const cultivable = structures[structure].cultivable;
        return {
          ...next,
          structure,
          plant: cultivable && plants[next.plant] ? next.plant : "",
          count: cultivable ? Math.max(0, Number(next.count || 0)) : 0,
          sun: clamp(Number(next.sun ?? 2), 0, 3),
          note: next.note || "",
          actions: Array.isArray(next.actions) ? next.actions : [],
          reminders: Array.isArray(next.reminders) ? next.reminders : [],
        };
      }),
    }));
  }

  function selectCell(index, event) {
    setSelectedIndex(index);
    const rect = event?.currentTarget?.getBoundingClientRect();
    const panelWidth = isMobile ? Math.min(screenWidth - 24, 420) : 340;
    if (isMobile) {
      setEditor({ open: true, x: 12, y: window.innerHeight - 420 });
      setBuilderStep(1);
      return;
    }
    const x = clamp((rect?.left || 120) + 10, 12, window.innerWidth - panelWidth - 16);
    const y = clamp((rect?.top || 120) + 10, 74, window.innerHeight - 430);
    setEditor({ open: true, x, y });
    setBuilderStep(1);
  }

  function closeEditor() {
    setEditor((prev) => ({ ...prev, open: false }));
  }

  function createNewPlan() {
    const next = createPlan(`Potager ${plans.length + 1}`);
    setPlans((prev) => [...prev, next]);
    setActivePlanId(next.id);
    setSelectedIndex(null);
    setEditor({ open: false, x: 0, y: 0 });
  }

  function duplicatePlan() {
    if (!activePlan) return;
    const next = normalizePlan({
      ...activePlan,
      id: uid(),
      name: `${activePlan.name} copie`,
      cells: activePlan.cells.map((cell) => ({ ...cell, id: uid() })),
    });
    setPlans((prev) => [...prev, next]);
    setActivePlanId(next.id);
    setSelectedIndex(null);
  }

  function deletePlan() {
    if (!activePlan || plans.length <= 1) return;
    const nextPlans = plans.filter((plan) => plan.id !== activePlan.id);
    setPlans(nextPlans);
    setActivePlanId(nextPlans[0].id);
    setSelectedIndex(null);
    setEditor({ open: false, x: 0, y: 0 });
  }

  function applyPreset(preset) {
    updateActivePlan((plan) => ({
      ...plan,
      rows: preset.rows,
      cols: preset.cols,
      cells: createGrid(preset.rows, preset.cols),
    }));
    setSelectedIndex(null);
    closeEditor();
  }

  function resizeGrid(rows, cols) {
    if (!activePlan) return;
    const safeRows = clamp(rows, 2, 20);
    const safeCols = clamp(cols, 2, 20);
    updateActivePlan((plan) => {
      const nextCells = [];
      for (let r = 0; r < safeRows; r += 1) {
        for (let c = 0; c < safeCols; c += 1) {
          if (r < plan.rows && c < plan.cols) {
            nextCells.push(plan.cells[r * plan.cols + c]);
          } else {
            nextCells.push(createCell());
          }
        }
      }
      return { ...plan, rows: safeRows, cols: safeCols, cells: nextCells };
    });
  }

  function markReminder(index, reminderId, done) {
    updateCell(index, (cell) => ({
      ...cell,
      reminders: cell.reminders.map((reminder) =>
        reminder.id === reminderId ? { ...reminder, done } : reminder
      ),
    }));
  }

  function validateAction(index, type) {
    const template = actionTemplates[type];
    if (!template) return;
    updateCell(index, (cell) => ({
      ...cell,
      actions: [
        {
          id: uid(),
          type,
          label: template.label,
          date: new Date().toISOString(),
          quantity: Math.max(1, Number(cell.count || 1)),
        },
        ...cell.actions,
      ],
      reminders: [
        ...template.reminders.map((reminder) => ({
          id: uid(),
          sourceType: type,
          title: reminder.title,
          dueDate: addDaysISO(new Date().toISOString(), reminder.offset),
          quantity: Math.max(1, Number(cell.count || 1)),
          average: reminder.average,
          signs: reminder.signs,
          advice: reminder.advice,
          done: false,
        })),
        ...cell.reminders,
      ],
    }));
  }

  function uploadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file || !activePlan) return;
    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      updateActivePlan((plan) => ({ ...plan, photoDataUrl: String(reader.result || "") }));
      setPhotoUploading(false);
    };
    reader.onerror = () => setPhotoUploading(false);
    reader.readAsDataURL(file);
  }

  // Repère 3/6 — métriques, diagnostic, conseils
  const zoom = activePlan?.zoom || 100;
  const cellSize = isMobile
    ? clamp(Math.round((zoom / 100) * 52), 38, 64)
    : clamp(Math.round((zoom / 100) * 58), 42, 72);

  const stats = useMemo(() => {
    if (!activePlan) {
      return { plants: 0, water: 0, harvest: 0, structures: {} };
    }
    const result = { plants: 0, water: 0, harvest: 0, structures: {} };
    activePlan.cells.forEach((cell) => {
      result.structures[cell.structure] = (result.structures[cell.structure] || 0) + 1;
      if (cell.plant && plants[cell.plant]) {
        result.plants += Number(cell.count || 0);
        result.water += Number(cell.count || 0) * plants[cell.plant].water;
        result.harvest += Number(cell.count || 0) * plants[cell.plant].yield;
      }
    });
    return result;
  }, [activePlan]);

  const allReminders = useMemo(() => {
    if (!activePlan) return [];
    const output = [];
    activePlan.cells.forEach((cell, index) => {
      cell.reminders.forEach((reminder) => {
        output.push({
          ...reminder,
          cellIndex: index,
          structure: cell.structure,
          plant: cell.plant,
        });
      });
    });
    return output.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }, [activePlan]);

  const alerts = useMemo(() => {
    if (!activePlan) return [];
    const list = [];
    activePlan.cells.forEach((cell, index) => {
      if (!cell.plant) return;
      const plant = plants[cell.plant];
      if (cell.sun < plant.sunNeed) {
        list.push(`☀️ ${plant.name} manque de soleil en case ${index + 1}.`);
      }
      if (weather?.temperature >= 28 && cell.sun >= 2) {
        list.push(`🔥 ${plant.name} en case ${index + 1} : surveiller l’arrosage du soir.`);
      }
      if (weather?.windspeed >= 35 && ["tomate", "tomateCerise", "poivron", "piment"].includes(cell.plant)) {
        list.push(`💨 ${plant.name} en case ${index + 1} : protéger ou tuteurer.`);
      }
    });
    const late = allReminders.filter(isLateReminder).length;
    const todayCount = allReminders.filter(isTodayReminder).length;
    if (late > 0) list.unshift(`⏰ ${late} rappel(s) en retard.`);
    if (todayCount > 0) list.unshift(`📌 ${todayCount} rappel(s) à faire aujourd’hui.`);
    return [...new Set(list)].slice(0, 8);
  }, [activePlan, weather, allReminders]);

  const selectedAdvice = useMemo(() => {
    if (!activePlan || selectedIndex === null || !selectedCell) return "";
    return getPlacementAdvice({ cell: selectedCell, index: selectedIndex, plan: activePlan, weather });
  }, [activePlan, selectedIndex, selectedCell, weather]);

  const bestSlots = useMemo(() => {
    if (!activePlan || !selectedCell?.plant) return [];
    return activePlan.cells
      .map((cell, index) => ({ cell, index, score: cellScore({ index, plan: activePlan, cell, weather }) }))
      .filter(({ cell }) => structures[cell.structure].cultivable)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [activePlan, selectedCell, weather]);

  const compactStructureSummary = useMemo(() => {
    return structureOrder
      .filter((key) => stats.structures[key])
      .map((key) => `${structures[key].label} ${stats.structures[key]}`)
      .slice(0, 6);
  }, [stats]);

  function quickFill(index, structureKey) {
    updateCell(index, (cell) => ({
      ...cell,
      structure: structureKey,
      plant: structures[structureKey].cultivable ? cell.plant : "",
      count: structures[structureKey].cultivable ? Math.max(1, Number(cell.count || 1)) : 0,
    }));
  }

  function duplicateSelectedInto(index) {
    if (!selectedCell || selectedIndex === null) return;
    const clone = { ...selectedCell, id: uid(), reminders: [], actions: [] };
    updateCell(index, () => clone);
  }

  const builderHint = useMemo(() => {
    if (!selectedCell) return "Clique une case pour l’éditer directement sur le plan.";
    if (builderStep === 1) return "Étape 1 : choisis la structure de terrain de cette case.";
    if (builderStep === 2) return structures[selectedCell.structure].cultivable
      ? "Étape 2 : choisis la culture à placer ou laisse vide."
      : "Étape 2 : cette structure ne reçoit pas de culture, passe au soleil ou à la note.";
    if (builderStep === 3) return "Étape 3 : règle l’exposition de base de cette case.";
    return "Étape 4 : ajuste quantité, note et rappels si besoin.";
  }, [builderStep, selectedCell]);

  function currentStructureStepDone() {
    return selectedCell && selectedCell.structure !== "empty";
  }

  function currentPlantStepDone() {
    if (!selectedCell) return false;
    if (!structures[selectedCell.structure].cultivable) return true;
    return Boolean(selectedCell.plant);
  }

  // Repère 4/6 — rendu plan minimal, cellules, panneau flottant
  function renderCell(cell, index, inFullscreen = false) {
    const isSelected = selectedIndex === index;
    const structure = structures[cell.structure];
    const plant = cell.plant ? plants[cell.plant] : null;
    const borderColor = isSelected ? "#111827" : structure.border;
    const contentColor = plant?.color || structure.border;
    return (
      <button
        key={`${inFullscreen ? "fs" : "base"}-${cell.id}-${index}`}
        onClick={(event) => selectCell(index, event)}
        title={`${structure.label}${plant ? ` • ${plant.name}` : ""}`}
        style={{
          width: cellSize,
          height: cellSize,
          borderRadius: 10,
          border: `1.5px solid ${borderColor}`,
          background: structure.color,
          position: "relative",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          boxShadow: isSelected ? "0 0 0 2px rgba(17,24,39,0.15)" : "none",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: cell.structure === "wall" ? 0.22 : 0.12 }}>
          {cell.structure === "path" ? (
            <div style={{ width: "100%", height: "100%", background: "repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0 6px, transparent 6px 12px)" }} />
          ) : null}
          {cell.structure === "terrace" ? (
            <div style={{ width: "100%", height: "100%", background: "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 10px, transparent 10px 20px)" }} />
          ) : null}
          {cell.structure === "fence" ? (
            <div style={{ width: "100%", height: "100%", background: "repeating-linear-gradient(90deg, rgba(0,0,0,0.10) 0 4px, transparent 4px 8px)" }} />
          ) : null}
          {cell.structure === "wall" ? (
            <div style={{ width: "100%", height: "100%", background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.10) 0 8px, transparent 8px 16px), repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 14px, transparent 14px 28px)" }} />
          ) : null}
        </div>

        {plant ? (
          <div
            style={{
              width: Math.max(20, cellSize - 28),
              height: Math.max(20, cellSize - 28),
              borderRadius: 999,
              background: "rgba(255,255,255,0.96)",
              border: `1px solid ${contentColor}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: Math.max(14, cellSize * 0.34),
              zIndex: 1,
            }}
          >
            {plant.icon}
          </div>
        ) : (
          <div style={{ fontSize: Math.max(10, cellSize * 0.22), opacity: 0.6, zIndex: 1 }}>{structure.icon}</div>
        )}

        {cell.count > 0 ? (
          <div
            style={{
              position: "absolute",
              right: 4,
              bottom: 4,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 999,
              background: "#111827",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
            }}
          >
            {cell.count}
          </div>
        ) : null}

        {cell.sun !== 2 ? (
          <div
            style={{
              position: "absolute",
              left: 4,
              top: 4,
              width: 14,
              height: 14,
              borderRadius: 999,
              background: ["#64748b", "#93c5fd", "#fcd34d", "#f59e0b"][cell.sun] || "#fcd34d",
              border: "1px solid rgba(255,255,255,0.9)",
              zIndex: 2,
            }}
          />
        ) : null}
      </button>
    );
  }

  function renderFloatingEditor() {
    if (!editor.open || selectedCell === null || !activePlan) return null;
    const content = (
      <div
        style={{
          width: isMobile ? "100%" : 336,
          background: "#ffffff",
          borderRadius: isMobile ? "18px 18px 0 0" : 18,
          boxShadow: "0 24px 54px rgba(15,23,42,0.18)",
          border: "1px solid rgba(0,0,0,0.08)",
          padding: 14,
          display: "grid",
          gap: 12,
          maxHeight: isMobile ? "70vh" : 430,
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Case {selectedIndex + 1}</div>
            <div style={{ color: "#6b7280", fontSize: 12 }}>{builderHint}</div>
          </div>
          <button onClick={closeEditor} style={softButton(false)}>Fermer</button>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[1, 2, 3, 4].map((step) => (
            <button key={step} onClick={() => setBuilderStep(step)} style={miniAction(builderStep === step)}>
              {step}
            </button>
          ))}
        </div>

        {builderStep === 1 ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Structure du jardin</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {structureOrder.map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    updateCell(selectedIndex, (cell) => ({
                      ...cell,
                      structure: key,
                      plant: structures[key].cultivable ? cell.plant : "",
                      count: structures[key].cultivable ? Math.max(1, Number(cell.count || 1)) : 0,
                    }));
                    setBuilderStep(2);
                  }}
                  style={chipStyle(selectedCell.structure === key, structures[key].border)}
                >
                  {structures[key].icon} {structures[key].label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {builderStep === 2 ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Culture</div>
            {structures[selectedCell.structure].cultivable ? (
              <>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {plantOrder.map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        updateCell(selectedIndex, (cell) => ({
                          ...cell,
                          plant: key,
                          count: Math.max(1, Number(cell.count || 1)),
                        }));
                        setBuilderStep(3);
                      }}
                      style={chipStyle(selectedCell.plant === key, plants[key].color)}
                    >
                      {plants[key].icon} {plants[key].name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => {
                    updateCell(selectedIndex, (cell) => ({ ...cell, plant: "", count: 0 }));
                    setBuilderStep(3);
                  }}
                  style={softButton(!selectedCell.plant)}
                >
                  Laisser sans culture pour l’instant
                </button>
              </>
            ) : (
              <div style={{ color: "#6b7280", lineHeight: 1.5 }}>
                Cette structure n’accueille pas de culture. Passe au soleil ou à la note.
              </div>
            )}
          </div>
        ) : null}

        {builderStep === 3 ? (
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontWeight: 700 }}>Exposition de base</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {sunOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    updateCell(selectedIndex, (cell) => ({ ...cell, sun: option.value }));
                    setBuilderStep(4);
                  }}
                  style={chipStyle(selectedCell.sun === option.value, "#f59e0b")}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {builderStep === 4 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700 }}>Finition rapide</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => updateCell(selectedIndex, (cell) => ({ ...cell, count: Math.max(0, cell.count - 1) }))} style={softButton(false)}>-1</button>
              <div style={{ minWidth: 54, textAlign: "center", fontWeight: 800 }}>{selectedCell.count}</div>
              <button onClick={() => updateCell(selectedIndex, (cell) => ({ ...cell, count: Math.max(0, cell.count + 1) }))} style={softButton(false)}>+1</button>
              <button onClick={() => updateCell(selectedIndex, (cell) => ({ ...cell, note: "" }))} style={softButton(false)}>Effacer note</button>
            </div>
            <textarea
              value={selectedCell.note}
              onChange={(e) => updateCell(selectedIndex, (cell) => ({ ...cell, note: e.target.value }))}
              placeholder="Note rapide sur cette case"
              style={{ ...fieldStyle(), minHeight: 86, resize: "vertical", fontFamily: "Arial, sans-serif" }}
            />
            <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #e5e7eb" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Conseil IA</div>
              <div style={{ color: "#334155", lineHeight: 1.5 }}>{selectedAdvice}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => updateCell(selectedIndex, () => createCell())} style={softButton(false)}>Vider case</button>
              <button onClick={closeEditor} style={button("#111827")}>Terminer</button>
            </div>
          </div>
        ) : null}
      </div>
    );

    if (isMobile) {
      return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.24)", zIndex: 50 }} onClick={closeEditor}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }} onClick={(e) => e.stopPropagation()}>
            {content}
          </div>
        </div>
      );
    }

    return (
      <div style={{ position: "fixed", left: editor.x, top: editor.y, zIndex: 60 }}>
        {content}
      </div>
    );
  }

  // Repère 5/6 — rendu principal
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: pageBackground,
        minHeight: "100vh",
        padding: isMobile ? 12 : 18,
        color: "#111827",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1680, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 14,
            position: "sticky",
            top: 0,
            zIndex: 20,
            padding: "6px 0 8px",
            backdropFilter: "blur(8px)",
            background: "rgba(237,244,248,0.85)",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 28 : 38 }}>🌱 Assistant Potager 2.3</h1>
            <div style={{ color: "#4b5563", marginTop: 6 }}>Plan minimaliste • micro-cases • structure + culture séparées • édition directe sur la case</div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={createNewPlan} style={button("#2563eb")}>Nouveau</button>
            <button onClick={duplicatePlan} style={button("#0f766e")}>Dupliquer</button>
            <button onClick={deletePlan} style={button(plans.length > 1 ? "#b91c1c" : "#9ca3af")} disabled={plans.length <= 1}>Supprimer</button>
            <button onClick={() => setFullscreenPlan(true)} style={button("#111827")}>Plein écran plan</button>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {tabs.map((item) => (
            <button key={item.key} onClick={() => setTab(item.key)} style={softButton(tab === item.key)}>
              {item.icon} {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : focusOnlyPlan && tab === "plan" ? "1fr" : "minmax(860px, 1fr) 390px", gap: 18, alignItems: "start" }}>
          <div style={{ display: "grid", gap: 16 }}>
            <Card
              title="🗺 Plan"
              right={
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setFocusOnlyPlan((v) => !v)} style={softButton(focusOnlyPlan)}>
                    {focusOnlyPlan ? "Plan seul" : "Plan + panneaux"}
                  </button>
                  <button onClick={() => updateActivePlan((plan) => ({ ...plan, backgroundValidated: !plan.backgroundValidated }))} style={softButton(activePlan?.backgroundValidated)}>
                    Fond stylisé
                  </button>
                </div>
              }
            >
              <div style={{ display: "grid", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: 10 }}>
                  <label>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Plan actif</div>
                    <select value={activePlanId} onChange={(e) => { setActivePlanId(e.target.value); setSelectedIndex(null); closeEditor(); }} style={fieldStyle()}>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>{plan.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Nom</div>
                    <input value={activePlan?.name || ""} onChange={(e) => updateActivePlan((plan) => ({ ...plan, name: e.target.value }))} style={fieldStyle()} />
                  </label>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {presets.map((preset) => (
                    <button key={preset.key} onClick={() => applyPreset(preset)} style={chipStyle(false, "#2563eb")}>{preset.label}</button>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(6, minmax(120px, 1fr))", gap: 10 }}>
                  <label>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Lignes</div>
                    <input type="number" min={2} max={20} value={activePlan?.rows || 5} onChange={(e) => resizeGrid(Number(e.target.value) || 5, activePlan?.cols || 8)} style={fieldStyle()} />
                  </label>
                  <label>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Colonnes</div>
                    <input type="number" min={2} max={20} value={activePlan?.cols || 8} onChange={(e) => resizeGrid(activePlan?.rows || 5, Number(e.target.value) || 8)} style={fieldStyle()} />
                  </label>
                  <label>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Orientation</div>
                    <select value={activePlan?.orientation || "south"} onChange={(e) => updateActivePlan((plan) => ({ ...plan, orientation: e.target.value }))} style={fieldStyle()}>
                      <option value="south">Sud</option>
                      <option value="north">Nord</option>
                      <option value="east">Est</option>
                      <option value="west">Ouest</option>
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Côté lumineux</div>
                    <select value={activePlan?.brightSide || "south"} onChange={(e) => updateActivePlan((plan) => ({ ...plan, brightSide: e.target.value }))} style={fieldStyle()}>
                      <option value="south">Sud</option>
                      <option value="north">Nord</option>
                      <option value="east">Est</option>
                      <option value="west">Ouest</option>
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Côté ombré</div>
                    <select value={activePlan?.shadySide || "north"} onChange={(e) => updateActivePlan((plan) => ({ ...plan, shadySide: e.target.value }))} style={fieldStyle()}>
                      <option value="north">Nord</option>
                      <option value="south">Sud</option>
                      <option value="east">Est</option>
                      <option value="west">Ouest</option>
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Zoom</div>
                    <input type="range" min={55} max={150} step={5} value={zoom} onChange={(e) => updateActivePlan((plan) => ({ ...plan, zoom: Number(e.target.value) }))} style={{ width: "100%" }} />
                    <div style={{ fontSize: 12, color: "#64748b" }}>{zoom}%</div>
                  </label>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {compactStructureSummary.map((item) => (
                    <div key={item} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", padding: "6px 10px", borderRadius: 999, fontSize: 13, color: "#475569" }}>{item}</div>
                  ))}
                </div>

                <div
                  ref={planRef}
                  style={{
                    background: "#ffffffc9",
                    borderRadius: 18,
                    padding: 14,
                    border: "1px solid rgba(0,0,0,0.07)",
                    overflow: "auto",
                    minHeight: isMobile ? 360 : 520,
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: `repeat(${activePlan?.cols || 1}, ${cellSize}px)`, gap: 6, width: "max-content", margin: "0 auto" }}>
                    {activePlan?.cells.map((cell, index) => renderCell(cell, index))}
                  </div>
                </div>

                {selectedCell ? (
                  <div style={{ background: "#f8fafc", borderRadius: 14, padding: 12, border: "1px solid #e5e7eb", display: "grid", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                      <div>
                        <strong>Case {selectedIndex + 1}</strong> • {structures[selectedCell.structure].label}{selectedCell.plant ? ` • ${plants[selectedCell.plant].name}` : ""}
                      </div>
                      <div style={{ color: "#64748b" }}>{sunLabel(selectedCell.sun)}</div>
                    </div>
                    <div style={{ color: "#334155", lineHeight: 1.5 }}>{selectedAdvice}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {structureOrder.map((key) => (
                        <button key={key} onClick={() => quickFill(selectedIndex, key)} style={chipStyle(selectedCell.structure === key, structures[key].border)}>
                          {structures[key].icon || "·"} {structures[key].label}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button onClick={() => setBuilderStep(1) || setEditor((prev) => ({ ...prev, open: true }))} style={button("#111827")}>Éditer la case</button>
                      <button onClick={() => updateCell(selectedIndex, () => createCell())} style={softButton(false)}>Vider</button>
                      <button onClick={() => {
                        const nextIndex = activePlan.cells.findIndex((cell, i) => i !== selectedIndex && cell.structure === "empty" && !cell.plant);
                        if (nextIndex !== -1) duplicateSelectedInto(nextIndex);
                      }} style={softButton(false)}>Dupliquer vers une case vide</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: "#64748b", fontSize: 14 }}>Clique une case du plan pour l’éditer directement avec le panneau flottant.</div>
                )}
              </div>
            </Card>

            {tab !== "plan" || !focusOnlyPlan ? (
              <Card title="📌 Alertes du moment">
                {alerts.length ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {alerts.map((alert, i) => (
                      <div key={`${alert}-${i}`} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "10px 12px", lineHeight: 1.45 }}>
                        {alert}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#64748b" }}>Aucune alerte forte pour l’instant.</div>
                )}
              </Card>
            ) : null}
          </div>

          {(!focusOnlyPlan || tab !== "plan") && (
            <div style={{ display: "grid", gap: 16 }}>
              {tab === "assistant" ? (
                <>
                  <Card title="🧭 Diagnostic du jardin">
                    <div style={{ display: "grid", gap: 12 }}>
                      <label>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Notes de diagnostic</div>
                        <textarea value={activePlan?.diagnosisNote || ""} onChange={(e) => updateActivePlan((plan) => ({ ...plan, diagnosisNote: e.target.value }))} style={{ ...fieldStyle(), minHeight: 94, resize: "vertical", fontFamily: "Arial, sans-serif" }} placeholder="Exemple : fond droit très chaud, bord gauche plus ombré, vent venant du côté est..." />
                      </label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={() => fileRef.current?.click()} style={button("#7c3aed")}>{photoUploading ? "Chargement..." : "Ajouter une photo"}</button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={uploadPhoto} />
                      </div>
                      {activePlan?.photoDataUrl ? (
                        <img src={activePlan.photoDataUrl} alt="Diagnostic potager" style={{ width: "100%", borderRadius: 14, border: "1px solid #e5e7eb" }} />
                      ) : (
                        <div style={{ color: "#64748b" }}>Ajoute une photo pour garder un support visuel de diagnostic dans l’application.</div>
                      )}
                      <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, lineHeight: 1.55 }}>
                        <div><strong>Orientation :</strong> {sideToFrench(activePlan?.orientation || "south")}</div>
                        <div><strong>Côté lumineux :</strong> {sideToFrench(activePlan?.brightSide || "south")}</div>
                        <div><strong>Côté ombré :</strong> {sideToFrench(activePlan?.shadySide || "north")}</div>
                        <div style={{ marginTop: 8, color: "#334155" }}>
                          Conseil : utilise mur, terrasse et clôture comme repères de terrain. Ensuite place tomates et piments du côté le plus chaud, salades et persil vers le côté plus frais.
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card title="🤖 Suggestion case par case">
                    {selectedCell ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, lineHeight: 1.55 }}>
                          {selectedAdvice}
                        </div>
                        {selectedCell.plant ? (
                          <>
                            <div style={{ fontWeight: 700 }}>Meilleures cases potentielles pour {plants[selectedCell.plant].name.toLowerCase()}</div>
                            <div style={{ display: "grid", gap: 8 }}>
                              {bestSlots.map((slot) => (
                                <div key={slot.index} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 12px", display: "flex", justifyContent: "space-between", gap: 12 }}>
                                  <div>Case {slot.index + 1} • {structures[slot.cell.structure].label}</div>
                                  <strong>{slot.score.toFixed(1)}</strong>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div style={{ color: "#64748b" }}>Choisis une culture sur la case sélectionnée pour obtenir un classement détaillé.</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: "#64748b" }}>Sélectionne une case pour voir les conseils ciblés.</div>
                    )}
                  </Card>
                </>
              ) : null}

              {tab === "follow" ? (
                <>
                  <Card title="⏰ Rappels">
                    {allReminders.length ? (
                      <div style={{ display: "grid", gap: 8 }}>
                        {allReminders.map((reminder) => (
                          <div key={reminder.id} style={{ background: reminder.done ? "#f0fdf4" : isLateReminder(reminder) ? "#fff7ed" : "#f8fafc", border: `1px solid ${reminder.done ? "#86efac" : isLateReminder(reminder) ? "#fed7aa" : "#e5e7eb"}`, borderRadius: 12, padding: "10px 12px", display: "grid", gap: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                              <strong>{reminder.title}</strong>
                              <span>{formatDate(reminder.dueDate)}</span>
                            </div>
                            <div>Case {reminder.cellIndex + 1}{reminder.plant ? ` • ${plants[reminder.plant].name}` : ""}</div>
                            <div>Délai moyen : {reminder.average}</div>
                            <div>Quantité concernée : {reminder.quantity}</div>
                            <div>Signes : {reminder.signs.join(" • ")}</div>
                            <div>Conseil : {reminder.advice}</div>
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <button onClick={() => markReminder(reminder.cellIndex, reminder.id, !reminder.done)} style={softButton(reminder.done)}>{reminder.done ? "Marquer à refaire" : "Marquer terminé"}</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ color: "#64748b" }}>Aucun rappel pour l’instant.</div>
                    )}
                  </Card>

                  <Card title="✅ Actions validées sur la case sélectionnée">
                    {selectedCell ? (
                      <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {Object.entries(actionTemplates).map(([key, template]) => (
                            <button key={key} onClick={() => validateAction(selectedIndex, key)} style={chipStyle(false, "#0f766e")}>
                              {template.icon} {template.label}
                            </button>
                          ))}
                        </div>
                        {selectedCell.actions.length ? (
                          <div style={{ display: "grid", gap: 8 }}>
                            {selectedCell.actions.map((action) => (
                              <div key={action.id} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 12px" }}>
                                {action.label} • {formatDate(action.date)} • quantité {action.quantity}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ color: "#64748b" }}>Aucune action encore validée sur cette case.</div>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: "#64748b" }}>Sélectionne une case pour générer des rappels intelligents.</div>
                    )}
                  </Card>
                </>
              ) : null}

              {tab === "plan" ? (
                <>
                  <Card title="📊 Vue rapide">
                    <div style={{ display: "grid", gap: 8 }}>
                      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #e5e7eb" }}>Plants totaux : <strong>{stats.plants}</strong></div>
                      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #e5e7eb" }}>Arrosage estimé : <strong>{stats.water.toFixed(1)} L / jour</strong></div>
                      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #e5e7eb" }}>Récolte estimée : <strong>{stats.harvest.toFixed(1)} kg</strong></div>
                      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 12, border: "1px solid #e5e7eb" }}>Météo {CITY} : <strong>{weather ? `${weather.temperature}°C • ${weather.windspeed} km/h` : "indisponible"}</strong></div>
                    </div>
                  </Card>

                  <Card title="🧱 Outils structurels express">
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {structureOrder.map((key) => (
                        <button key={key} onClick={() => selectedIndex !== null && quickFill(selectedIndex, key)} style={chipStyle(selectedCell?.structure === key, structures[key].border)}>
                          {structures[key].icon || "·"} {structures[key].label}
                        </button>
                      ))}
                    </div>
                    <div style={{ color: "#64748b", marginTop: 10, lineHeight: 1.5 }}>
                      Mur, terrasse et clôture sont conservés comme repères du jardin. Ils restent discrets dans le plan, mais améliorent beaucoup la lecture du terrain.
                    </div>
                  </Card>
                </>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {renderFloatingEditor()}

      {fullscreenPlan && activePlan ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.94)", zIndex: 80, padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff", marginBottom: 14, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{activePlan.name}</div>
              <div style={{ opacity: 0.8 }}>Plein écran plan • clique une case pour l’éditer</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button onClick={() => updateActivePlan((plan) => ({ ...plan, zoom: clamp(plan.zoom - 10, 55, 150) }))} style={softButton(false)}>- Zoom</button>
              <button onClick={() => updateActivePlan((plan) => ({ ...plan, zoom: clamp(plan.zoom + 10, 55, 150) }))} style={softButton(false)}>+ Zoom</button>
              <button onClick={() => setFullscreenPlan(false)} style={button("#111827")}>Fermer</button>
            </div>
          </div>
          <div style={{ background: "rgba(255,255,255,0.96)", borderRadius: 18, padding: 16, height: "calc(100vh - 120px)", overflow: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${activePlan.cols}, ${cellSize}px)`, gap: 6, width: "max-content", margin: "0 auto" }}>
              {activePlan.cells.map((cell, index) => renderCell(cell, index, true))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// Repère 6/6 — fin du fichier
