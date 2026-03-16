
import React, { useEffect, useMemo, useRef, useState } from "react";

// Repère 1/6 — constantes, helpers, catalogue, gabarits
const CITY = "Saint-Germain-lès-Arpajon (91180)";
const LAT = 48.616;
const LON = 2.258;
const STORAGE = "potager_mobile_v21_guided";

const plants = {
  vide: { name: "Vide", icon: "⬜", color: "#f3f4f6", water: 0, yield: 0, sunNeed: 0, tasks: {} },
  tomate: { name: "Tomate", icon: "🍅", color: "#ef4444", water: 1.2, yield: 3, sunNeed: 3, tasks: { 3: "Semer", 5: "Planter / repiquer", 7: "Tuteurer", 8: "Récolter" } },
  tomateCerise: { name: "Tomate cerise", icon: "🍅", color: "#fb7a59", water: 1, yield: 2, sunNeed: 3, tasks: { 3: "Semer", 5: "Planter / repiquer", 7: "Tuteurer", 8: "Récolter" } },
  piment: { name: "Piment", icon: "🌶️", color: "#dc2626", water: 0.8, yield: 0.6, sunNeed: 3, tasks: { 2: "Semer", 5: "Planter / repiquer", 7: "Surveiller", 8: "Récolter" } },
  poivron: { name: "Poivron", icon: "🫑", color: "#f59e0b", water: 0.8, yield: 1, sunNeed: 3, tasks: { 2: "Semer", 5: "Planter / repiquer", 7: "Surveiller", 8: "Récolter" } },
  salade: { name: "Salade", icon: "🥬", color: "#84cc16", water: 0.5, yield: 0.3, sunNeed: 1, tasks: { 3: "Semer", 4: "Éclaircir", 5: "Récolter", 9: "Ressemer" } },
  basilic: { name: "Basilic", icon: "🌿", color: "#22c55e", water: 0.4, yield: 0.2, sunNeed: 2, tasks: { 4: "Semer", 5: "Planter", 7: "Pincer", 8: "Récolter" } },
  persil: { name: "Persil", icon: "🌱", color: "#15803d", water: 0.3, yield: 0.2, sunNeed: 1, tasks: { 3: "Semer", 5: "Éclaircir", 6: "Récolter", 9: "Récolter" } },
  fleurs: { name: "Fleurs utiles", icon: "🌼", color: "#fde047", water: 0.2, yield: 0, sunNeed: 2, tasks: { 4: "Semer", 6: "Floraison", 7: "Attirer les pollinisateurs" } },
};

const zoneMeta = {
  plant: { label: "Culture", color: "#ffffff", icon: "🪴" },
  grass: { label: "Pelouse", color: "#65a30d", icon: "🟩" },
  terrace: { label: "Terrasse", color: "#8b5e3c", icon: "🟫" },
  tree: { label: "Arbre / ombre", color: "#4b5563", icon: "🌳" },
  greenhouse: { label: "Serre", color: "#99f6e4", icon: "🏕️" },
  path: { label: "Allée", color: "#d6d3d1", icon: "🪨" },
  wall: { label: "Mur", color: "#94a3b8", icon: "🧱" },
  empty: { label: "Vide", color: "#e5e7eb", icon: "⬜" },
};

const mobileTabs = [
  { key: "plan", label: "Plan", icon: "🗺️" },
  { key: "assistant", label: "Assistant", icon: "🧭" },
  { key: "reminders", label: "Rappels", icon: "⏰" },
  { key: "cell", label: "Case", icon: "🧩" },
];

const actionCatalog = {
  semis: { label: "Semis", icon: "🌱" },
  repiquage: { label: "Repiquage", icon: "🪴" },
  miseEnTerre: { label: "Mise en terre", icon: "🌤️" },
  tuteurage: { label: "Tuteurage", icon: "🪵" },
  recolte: { label: "Récolte", icon: "🧺" },
};

const sideOptions = [
  { key: "top", label: "Haut du plan" },
  { key: "right", label: "Droite du plan" },
  { key: "bottom", label: "Bas du plan" },
  { key: "left", label: "Gauche du plan" },
];

const planPresets = [
  { key: "2x3", label: "2 × 3", rows: 2, cols: 3, description: "Mini plan simple", layout: "blank" },
  { key: "3x3", label: "3 × 3", rows: 3, cols: 3, description: "Carré classique", layout: "blank" },
  { key: "3x4", label: "3 × 4", rows: 3, cols: 4, description: "Bon équilibre", layout: "blank" },
  { key: "4x4", label: "4 × 4", rows: 4, cols: 4, description: "Plan modulable", layout: "blank" },
  { key: "4x5", label: "4 × 5", rows: 4, cols: 5, description: "Grand potager", layout: "blank" },
  { key: "patio-3x4", label: "Terrasse 3 × 4", rows: 3, cols: 4, description: "Dernière rangée terrasse", layout: "patio" },
  { key: "serre-3x4", label: "Serre 3 × 4", rows: 3, cols: 4, description: "Serre + allée centrale", layout: "greenhouse" },
  { key: "long-2x5", label: "Longueur 2 × 5", rows: 2, cols: 5, description: "Jardin en bande", layout: "long" },
];


const quickZoneTools = [
  { key: "plant", label: "Culture", icon: "🪴" },
  { key: "greenhouse", label: "Serre", icon: "🏕️" },
  { key: "path", label: "Allée", icon: "🪨" },
  { key: "wall", label: "Mur", icon: "🧱" },
  { key: "tree", label: "Ombre", icon: "🌳" },
  { key: "empty", label: "Vide", icon: "⬜" },
];

const quickPlantFavorites = ["tomate", "tomateCerise", "piment", "poivron", "salade", "basilic", "persil", "fleurs"];
const quickPresetKeys = ["2x3", "3x3", "3x4", "4x4"];

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

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateValue) {
  try {
    return new Date(dateValue).toLocaleDateString("fr-FR");
  } catch {
    return "";
  }
}

function formatDateTime(dateValue) {
  try {
    return new Date(dateValue).toLocaleString("fr-FR");
  } catch {
    return "";
  }
}

function addDaysISO(baseDate, offsetDays) {
  const d = new Date(baseDate);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString();
}

function fieldStyle() {
  return {
    width: "100%",
    minHeight: 42,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    background: "#fff",
    boxSizing: "border-box",
  };
}

function areaStyle() {
  return {
    ...fieldStyle(),
    minHeight: 92,
    resize: "vertical",
    fontFamily: "Arial, sans-serif",
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

function primaryBtn(bg, color = "#fff") {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 44,
    boxShadow: "0 8px 18px rgba(15,23,42,0.12)",
  };
}

function softBtn() {
  return {
    background: "#fff",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 44,
  };
}

function miniBtn(bg = "#fff", color = "#111827") {
  return {
    background: bg,
    color,
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 10,
    padding: "7px 10px",
    fontWeight: 700,
    cursor: "pointer",
    minWidth: 42,
    minHeight: 40,
  };
}

function chipBtn(active) {
  return {
    border: active ? "2px solid #111827" : "1px solid #d1d5db",
    background: active ? "#eef2ff" : "#fff",
    borderRadius: 12,
    padding: "9px 12px",
    cursor: "pointer",
    fontWeight: 700,
  };
}

function terraceText(value) {
  if (value === "north") return "Terrasse en haut";
  if (value === "south") return "Terrasse en bas";
  if (value === "west") return "Terrasse à gauche";
  return "Terrasse à droite";
}

function zoomText(value) {
  if (value <= 75) return "Très dézoomé";
  if (value <= 90) return "Dézoomé";
  if (value <= 110) return "Normal";
  if (value <= 130) return "Zoomé";
  return "Très zoomé";
}

function sideLabel(sideKey) {
  return sideOptions.find((opt) => opt.key === sideKey)?.label || "—";
}

function makeCell(label = "Nouvelle case", zoneType = "empty", extra = {}) {
  return {
    id: uid(),
    label,
    zoneType,
    plant: zoneType === "plant" ? "tomate" : "vide",
    count: zoneType === "plant" ? 1 : 0,
    sunBase: 2,
    note: "",
    exposureTag: "standard",
    ...extra,
  };
}

function buildGridCells(rows, cols, layout = "blank") {
  const cells = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      cells.push(makeCell(`Case ${r + 1}.${c + 1}`, "empty"));
    }
  }

  if (layout === "patio") {
    for (let c = 0; c < cols; c += 1) {
      const idx = (rows - 1) * cols + c;
      cells[idx] = { ...cells[idx], zoneType: "terrace", plant: "vide", count: 0, label: `Terrasse ${c + 1}` };
    }
  }

  if (layout === "greenhouse") {
    if (cells[0]) cells[0] = { ...cells[0], zoneType: "greenhouse", label: "Serre" };
    const middleRow = Math.floor(rows / 2);
    for (let c = 0; c < cols; c += 1) {
      const idx = middleRow * cols + c;
      cells[idx] = { ...cells[idx], zoneType: "path", label: `Allée ${c + 1}` };
    }
  }

  if (layout === "long") {
    const hotCells = [0, 1].filter((idx) => idx < cells.length);
    hotCells.forEach((idx, i) => {
      cells[idx] = { ...cells[idx], zoneType: "plant", plant: i === 0 ? "tomate" : "piment", count: 2, label: `Culture chaude ${i + 1}` };
    });
    if (cells.length > cols) {
      cells[cols] = { ...cells[cols], zoneType: "path", label: "Passage" };
    }
  }

  return cells;
}

function defaultPlanPreset() {
  return planPresets.find((preset) => preset.key === "3x4") || planPresets[0];
}

function createPotager(name = "Nouveau potager") {
  const preset = defaultPlanPreset();
  const cells = buildGridCells(preset.rows, preset.cols, preset.layout);
  return {
    id: uid(),
    name,
    rows: preset.rows,
    cols: preset.cols,
    cells,
    selectedId: cells[0]?.id || null,
    quickPlant: "tomate",
    orientation: "south",
    sunMode: 2,
    zoom: 100,
    reminders: [],
    actions: [],
    mobileTab: "plan",
    activePresetKey: preset.key,
    assistantStep: "template",
    diagnostic: {
      source: "Manuel",
      confidence: "À confirmer",
      hotSide: "bottom",
      shadowSide: "top",
      windSide: "left",
      notes: "",
      photoName: "",
      lastAppliedAt: "",
    },
  };
}

function buildReminderBlueprints(actionType, plantKey, quantity, zoneLabel) {
  const plantName = plants[plantKey]?.name || "culture";
  const qtyText = `${quantity} ${quantity > 1 ? "plants" : "plant"}`;
  if (actionType === "semis") {
    return [
      {
        offsetDays: 7,
        title: `Contrôler la levée de ${qtyText}`,
        averageDelay: "5 à 10 jours selon chaleur et humidité",
        signs: ["levée visible ou début de germination", "substrat resté légèrement humide", "pas de fonte des semis"],
        advice: `Vérifier la levée de ${plantName} dans ${zoneLabel}.`,
      },
      {
        offsetDays: 14,
        title: "Vérifier homogénéité et éclaircissage",
        averageDelay: "10 à 15 jours",
        signs: ["plantules régulières", "premières vraies feuilles", "densité pas trop forte"],
        advice: "Éclaircir ou compléter si la levée est trop faible.",
      },
    ];
  }
  if (actionType === "repiquage") {
    return [
      {
        offsetDays: 3,
        title: "Surveiller la reprise après repiquage",
        averageDelay: "2 à 4 jours pour une reprise initiale",
        signs: ["feuilles qui se redressent", "tige stable", "pas de flétrissement prolongé"],
        advice: `Contrôler ${plantName} dans ${zoneLabel}, arroser seulement si le substrat sèche.`,
      },
      {
        offsetDays: 7,
        title: "Confirmer la reprise",
        averageDelay: "5 à 8 jours",
        signs: ["nouvelle pousse au centre", "croissance qui repart", "couleur du feuillage correcte"],
        advice: "Surveiller le stress, la lumière et l’espacement.",
      },
    ];
  }
  if (actionType === "miseEnTerre") {
    return [
      {
        offsetDays: 2,
        title: "Vérifier l’arrosage de reprise",
        averageDelay: "24 à 72 h",
        signs: ["sol légèrement frais", "pas d’affaissement brutal", "feuillage pas brûlé"],
        advice: "Arroser si le sol sèche trop vite, surtout avec vent ou chaleur.",
      },
      {
        offsetDays: 7,
        title: "Contrôler la reprise visible",
        averageDelay: "5 à 8 jours",
        signs: ["nouvelle pousse", "tige plus ferme", "moins de stress en journée"],
        advice: `Observer ${plantName} dans ${zoneLabel} et protéger si froid ou vent.`,
      },
      {
        offsetDays: 14,
        title: "Valider l’installation durable",
        averageDelay: "10 à 15 jours",
        signs: ["croissance active", "feuillage plus dense", "aucun stress prolongé"],
        advice: "Adapter arrosage, paillage ou tuteurage.",
      },
    ];
  }
  if (actionType === "tuteurage") {
    return [
      {
        offsetDays: 5,
        title: "Vérifier la tenue du tuteurage",
        averageDelay: "3 à 7 jours",
        signs: ["tige bien guidée", "pas de lien trop serré", "plant stable au vent"],
        advice: "Resserrer ou repositionner les liens si besoin.",
      },
    ];
  }
  if (actionType === "recolte") {
    return [
      {
        offsetDays: 4,
        title: "Surveiller la prochaine vague de récolte",
        averageDelay: "3 à 7 jours selon météo",
        signs: ["nouvelles fleurs ou fruits", "fruits qui se colorent", "pas d’épuisement marqué"],
        advice: "Continuer l’entretien et noter le rendement.",
      },
    ];
  }
  return [];
}

function normalizeReminder(raw) {
  return {
    id: raw?.id || uid(),
    sourceActionId: raw?.sourceActionId || null,
    cellId: raw?.cellId || null,
    cellLabel: raw?.cellLabel || "Zone",
    plant: plants[raw?.plant] ? raw.plant : "tomate",
    quantity: Math.max(1, Number(raw?.quantity || 1)),
    title: raw?.title || "Rappel",
    dueDate: raw?.dueDate || new Date().toISOString(),
    averageDelay: raw?.averageDelay || "",
    signs: Array.isArray(raw?.signs) ? raw.signs : [],
    advice: raw?.advice || "",
    actionType: raw?.actionType || "miseEnTerre",
    done: Boolean(raw?.done),
    note: raw?.note || "",
    createdAt: raw?.createdAt || new Date().toISOString(),
  };
}

function normalizeAction(raw) {
  return {
    id: raw?.id || uid(),
    type: raw?.type || "miseEnTerre",
    cellId: raw?.cellId || null,
    cellLabel: raw?.cellLabel || "Zone",
    plant: plants[raw?.plant] ? raw.plant : "tomate",
    quantity: Math.max(1, Number(raw?.quantity || 1)),
    date: raw?.date || new Date().toISOString(),
    note: raw?.note || "",
    createdAt: raw?.createdAt || new Date().toISOString(),
  };
}

function normalizeDiagnostic(raw) {
  return {
    source: raw?.source || "Manuel",
    confidence: raw?.confidence || "À confirmer",
    hotSide: ["top", "right", "bottom", "left"].includes(raw?.hotSide) ? raw.hotSide : "bottom",
    shadowSide: ["top", "right", "bottom", "left"].includes(raw?.shadowSide) ? raw.shadowSide : "top",
    windSide: ["top", "right", "bottom", "left"].includes(raw?.windSide) ? raw.windSide : "left",
    notes: raw?.notes || "",
    photoName: raw?.photoName || "",
    lastAppliedAt: raw?.lastAppliedAt || "",
  };
}

function normalizePotager(raw, index = 0) {
  const fallbackPreset = defaultPlanPreset();
  const rows = clamp(Number(raw?.rows || fallbackPreset.rows), 1, 8);
  const cols = clamp(Number(raw?.cols || fallbackPreset.cols), 1, 8);
  const fallbackCells = buildGridCells(rows, cols, raw?.activePresetKey === "blank" ? "blank" : fallbackPreset.layout);

  const cells = (Array.isArray(raw?.cells) && raw.cells.length ? raw.cells : fallbackCells).map((cell) => {
    const zoneType = zoneMeta[cell?.zoneType] ? cell.zoneType : "empty";
    return {
      id: cell?.id || uid(),
      label: cell?.label || "Nouvelle case",
      zoneType,
      plant: zoneType === "plant" ? (plants[cell?.plant] ? cell.plant : "tomate") : "vide",
      count: zoneType === "plant" ? Math.max(0, Number(cell?.count || 0)) : 0,
      sunBase: clamp(Number(cell?.sunBase || 0), 0, 3),
      note: cell?.note || "",
      exposureTag: cell?.exposureTag || "standard",
    };
  });

  return {
    id: raw?.id || uid(),
    name: raw?.name || `Potager ${index + 1}`,
    rows,
    cols,
    cells,
    selectedId: cells.some((cell) => cell.id === raw?.selectedId) ? raw.selectedId : cells[0]?.id || null,
    quickPlant: plants[raw?.quickPlant] ? raw.quickPlant : "tomate",
    orientation: ["south", "north", "west", "east"].includes(raw?.orientation) ? raw.orientation : "south",
    sunMode: clamp(Number(raw?.sunMode || 2), 1, 3),
    zoom: clamp(Number(raw?.zoom || 100), 60, 160),
    reminders: Array.isArray(raw?.reminders) ? raw.reminders.map(normalizeReminder) : [],
    actions: Array.isArray(raw?.actions) ? raw.actions.map(normalizeAction) : [],
    mobileTab: mobileTabs.some((tab) => tab.key === raw?.mobileTab) ? raw.mobileTab : "plan",
    activePresetKey: raw?.activePresetKey || fallbackPreset.key,
    assistantStep: ["template", "diagnostic", "placement", "followup"].includes(raw?.assistantStep) ? raw.assistantStep : "template",
    diagnostic: normalizeDiagnostic(raw?.diagnostic),
  };
}

function getInitialData() {
  const fallback = createPotager("Potager principal");
  const saved = safeRead(STORAGE, null);
  if (!saved?.potagers?.length) {
    return { potagers: [fallback], activePotagerId: fallback.id };
  }
  const potagers = saved.potagers.map((potager, index) => normalizePotager(potager, index));
  const activePotagerId = potagers.some((potager) => potager.id === saved.activePotagerId)
    ? saved.activePotagerId
    : potagers[0].id;
  return { potagers, activePotagerId };
}

function getReminderStatus(reminder) {
  if (reminder.done) return "done";
  const startToday = new Date();
  startToday.setHours(0, 0, 0, 0);
  const due = new Date(reminder.dueDate);
  due.setHours(0, 0, 0, 0);
  if (due.getTime() === startToday.getTime()) return "today";
  if (due.getTime() < startToday.getTime()) return "late";
  return "upcoming";
}

function reminderStatusMeta(status) {
  if (status === "today") return { label: "À faire aujourd’hui", bg: "#fef3c7", border: "#f59e0b" };
  if (status === "late") return { label: "En retard", bg: "#fee2e2", border: "#ef4444" };
  if (status === "done") return { label: "Terminé", bg: "#dcfce7", border: "#22c55e" };
  return { label: "À venir", bg: "#e0f2fe", border: "#38bdf8" };
}

function Card({ title, right, children, style = {} }) {
  return (
    <div style={{ ...cardStyle(), ...style }}>
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

function StatCard({ icon, label, value, subtitle }) {
  return (
    <div style={cardStyle()}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: "#6b7280", marginTop: 4, fontSize: 13 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 30, marginTop: 6 }}>{value}</div>
      <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{subtitle}</div>
    </div>
  );
}

function PresetCard({ preset, active, onApply }) {
  return (
    <button
      onClick={() => onApply(preset)}
      style={{
        textAlign: "left",
        border: active ? "2px solid #111827" : "1px solid #d1d5db",
        background: active ? "#eef2ff" : "#fff",
        borderRadius: 14,
        padding: 12,
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: 800 }}>{preset.label}</div>
      <div style={{ marginTop: 4, color: "#4b5563", fontSize: 13 }}>{preset.description}</div>
      <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>{preset.rows} lignes • {preset.cols} colonnes</div>
    </button>
  );
}

function ReminderCard({ reminder, onToggleDone, onDelete }) {
  const status = getReminderStatus(reminder);
  const meta = reminderStatusMeta(status);
  const plant = plants[reminder.plant];
  return (
    <div
      style={{
        border: `1px solid ${meta.border}`,
        background: meta.bg,
        borderRadius: 14,
        padding: 12,
        display: "grid",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div>
          <div style={{ fontWeight: 800, lineHeight: 1.35 }}>{reminder.title}</div>
          <div style={{ marginTop: 4, color: "#4b5563", fontSize: 13 }}>
            {actionCatalog[reminder.actionType]?.icon} {actionCatalog[reminder.actionType]?.label} • {plant?.icon} {plant?.name} • {reminder.cellLabel}
          </div>
        </div>
        <div
          style={{
            whiteSpace: "nowrap",
            background: "#fff",
            border: `1px solid ${meta.border}`,
            borderRadius: 999,
            padding: "4px 8px",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {meta.label}
        </div>
      </div>

      <div style={{ display: "grid", gap: 4, fontSize: 14 }}>
        <div><strong>Quantité :</strong> {reminder.quantity}</div>
        <div><strong>Échéance :</strong> {formatDate(reminder.dueDate)}</div>
        <div><strong>Délai moyen :</strong> {reminder.averageDelay || "—"}</div>
      </div>

      <div>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Signes à observer</div>
        <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.5 }}>
          {reminder.signs.map((sign, index) => <li key={`${reminder.id}-sign-${index}`}>{sign}</li>)}
        </ul>
      </div>

      {reminder.advice ? (
        <div
          style={{
            background: "rgba(255,255,255,0.78)",
            borderRadius: 10,
            padding: "8px 10px",
            lineHeight: 1.5,
          }}
        >
          {reminder.advice}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => onToggleDone(reminder.id)} style={softBtn()}>
          {reminder.done ? "Marquer à refaire" : "Marquer terminé"}
        </button>
        <button onClick={() => onDelete(reminder.id)} style={softBtn()}>Supprimer</button>
      </div>
    </div>
  );
}

function ActionCard({ action }) {
  const plant = plants[action.plant];
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontWeight: 800 }}>
        {actionCatalog[action.type]?.icon} {actionCatalog[action.type]?.label}
      </div>
      <div style={{ marginTop: 4, color: "#4b5563", fontSize: 13 }}>
        {plant?.icon} {plant?.name} • {action.quantity} • {action.cellLabel}
      </div>
      <div style={{ marginTop: 4, color: "#4b5563", fontSize: 13 }}>
        {formatDate(action.date)}
      </div>
      {action.note ? <div style={{ marginTop: 6, lineHeight: 1.45 }}>{action.note}</div> : null}
    </div>
  );
}

// Repère 2/6 — composant principal, états, diagnostic assisté
export default function App() {
  const initial = getInitialData();
  const [potagers, setPotagers] = useState(initial.potagers);
  const [activePotagerId, setActivePotagerId] = useState(initial.activePotagerId);
  const [weather, setWeather] = useState(null);
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const [actionDraft, setActionDraft] = useState({
    type: "miseEnTerre",
    quantity: 1,
    date: todayInputValue(),
    note: "",
  });
  const [photoPreview, setPhotoPreview] = useState("");
  const [planEditMode, setPlanEditMode] = useState("select");
  const [showPlanTools, setShowPlanTools] = useState(false);
  const [showDesktopSidebar, setShowDesktopSidebar] = useState(false);
  const [focusPlan, setFocusPlan] = useState(true);
  const [quickZoneType, setQuickZoneType] = useState("plant");
  const [quickSunBase, setQuickSunBase] = useState(2);
  const importRef = useRef(null);
  const photoRef = useRef(null);

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
      const fresh = createPotager("Potager principal");
      setPotagers([fresh]);
      setActivePotagerId(fresh.id);
      return;
    }
    if (!potagers.some((potager) => potager.id === activePotagerId)) {
      setActivePotagerId(potagers[0].id);
    }
  }, [potagers, activePotagerId]);

  const isMobile = screenWidth <= 920;

  const activePotager = useMemo(
    () => potagers.find((potager) => potager.id === activePotagerId) || potagers[0] || null,
    [potagers, activePotagerId]
  );

  const rows = activePotager?.rows || 3;
  const cols = activePotager?.cols || 4;
  const cells = activePotager?.cells || [];
  const selectedId = activePotager?.selectedId || null;
  const quickPlant = activePotager?.quickPlant || "tomate";
  const orientation = activePotager?.orientation || "south";
  const sunMode = activePotager?.sunMode || 2;
  const zoom = activePotager?.zoom || 100;
  const reminders = activePotager?.reminders || [];
  const actions = activePotager?.actions || [];
  const mobileTab = activePotager?.mobileTab || "plan";
  const activePresetKey = activePotager?.activePresetKey || defaultPlanPreset().key;
  const assistantStep = activePotager?.assistantStep || "template";
  const diagnostic = activePotager?.diagnostic || normalizeDiagnostic();

  useEffect(() => {
    setActionDraft((prev) => ({
      ...prev,
      quantity: Math.max(1, Number(cells.find((cell) => cell.id === selectedId)?.count || 1)),
      date: prev.date || todayInputValue(),
    }));
  }, [selectedId, cells]);

  function updateActivePotager(updater) {
    if (!activePotager) return;

    setPotagers((prev) =>
      prev.map((potager) => {
        if (potager.id !== activePotager.id) return potager;
        const next = updater(potager);
        const nextRows = clamp(Number(next.rows || 1), 1, 8);
        const nextCols = clamp(Number(next.cols || 1), 1, 8);
        const fallbackCells = buildGridCells(nextRows, nextCols, "blank");
        const nextCells = Array.isArray(next.cells) && next.cells.length ? next.cells : fallbackCells;
        return {
          ...next,
          rows: nextRows,
          cols: nextCols,
          cells: nextCells,
          selectedId: nextCells.some((cell) => cell.id === next.selectedId) ? next.selectedId : nextCells[0]?.id || null,
          quickPlant: plants[next.quickPlant] ? next.quickPlant : "tomate",
          orientation: ["south", "north", "west", "east"].includes(next.orientation) ? next.orientation : "south",
          sunMode: clamp(Number(next.sunMode || 2), 1, 3),
          zoom: clamp(Number(next.zoom || 100), 60, 160),
          reminders: Array.isArray(next.reminders) ? next.reminders.map(normalizeReminder) : [],
          actions: Array.isArray(next.actions) ? next.actions.map(normalizeAction) : [],
          mobileTab: mobileTabs.some((tab) => tab.key === next.mobileTab) ? next.mobileTab : "plan",
          activePresetKey: next.activePresetKey || defaultPlanPreset().key,
          assistantStep: ["template", "diagnostic", "placement", "followup"].includes(next.assistantStep) ? next.assistantStep : "template",
          diagnostic: normalizeDiagnostic(next.diagnostic),
        };
      })
    );
  }

  function updateCell(id, updater) {
    updateActivePotager((potager) => ({
      ...potager,
      cells: potager.cells.map((cell) => {
        if (cell.id !== id) return cell;
        const next = updater(cell);
        const zoneType = zoneMeta[next.zoneType] ? next.zoneType : "empty";
        return {
          ...next,
          zoneType,
          plant: zoneType === "plant" ? next.plant || "tomate" : "vide",
          count: zoneType === "plant" ? Math.max(0, Number(next.count || 0)) : 0,
          sunBase: clamp(Number(next.sunBase || 0), 0, 3),
          note: next.note || "",
          exposureTag: next.exposureTag || "standard",
        };
      }),
    }));
  }

  const activeCell = useMemo(
    () => cells.find((cell) => cell.id === selectedId) || null,
    [cells, selectedId]
  );

  const cellsWithPosition = useMemo(
    () => cells.map((cell, index) => ({ ...cell, row: Math.floor(index / cols), col: index % cols, index })),
    [cells, cols]
  );

  const activeCellPosition = useMemo(
    () => cellsWithPosition.find((cell) => cell.id === selectedId) || null,
    [cellsWithPosition, selectedId]
  );

  const sunOf = (cell) => clamp(Number(cell.sunBase || 0) + sunMode - 2, 0, 3);
  const bgOf = (cell) =>
    cell.zoneType === "plant"
      ? plants[cell.plant]?.color || "#f3f4f6"
      : zoneMeta[cell.zoneType]?.color || "#e5e7eb";
  const iconOf = (cell) =>
    cell.zoneType === "plant"
      ? plants[cell.plant]?.icon || "🪴"
      : zoneMeta[cell.zoneType]?.icon || "⬜";

  const cellMinWidth = useMemo(() => {
    if (zoom <= 80) return isMobile ? 100 : 120;
    if (zoom <= 100) return isMobile ? 118 : 145;
    if (zoom <= 125) return isMobile ? 135 : 170;
    return isMobile ? 155 : 190;
  }, [zoom, isMobile]);

  const cellMinHeight = useMemo(() => {
    if (zoom <= 80) return isMobile ? 125 : 145;
    if (zoom <= 100) return isMobile ? 145 : 175;
    if (zoom <= 125) return isMobile ? 165 : 205;
    return isMobile ? 185 : 230;
  }, [zoom, isMobile]);

  const iconSize = zoom <= 80 ? 26 : zoom <= 100 ? 34 : zoom <= 125 ? 42 : 50;
  const titleSize = zoom <= 80 ? 12 : zoom <= 100 ? 14 : zoom <= 125 ? 15 : 16;
  const textSize = zoom <= 80 ? 11 : zoom <= 100 ? 13 : zoom <= 125 ? 14 : 15;

  function setMobileTab(tabKey) {
    updateActivePotager((potager) => ({ ...potager, mobileTab: tabKey }));
  }

  function setAssistantStep(stepKey) {
    updateActivePotager((potager) => ({ ...potager, assistantStep: stepKey }));
  }

  function updateDiagnostic(patch) {
    updateActivePotager((potager) => ({
      ...potager,
      diagnostic: { ...potager.diagnostic, ...patch },
    }));
  }

  function photoInputClick() {
    photoRef.current?.click();
  }

  function handlePhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
    updateDiagnostic({ photoName: file.name, source: "Photo assistée" });
    event.target.value = "";
  }

  function clearPhotoPreview() {
    setPhotoPreview("");
    updateDiagnostic({ photoName: "", source: "Manuel" });
  }

  function applyPreset(preset) {
    const nextCells = buildGridCells(preset.rows, preset.cols, preset.layout);
    updateActivePotager((potager) => ({
      ...potager,
      rows: preset.rows,
      cols: preset.cols,
      cells: nextCells,
      selectedId: nextCells[0]?.id || null,
      activePresetKey: preset.key,
      assistantStep: "diagnostic",
      reminders: [],
      actions: [],
    }));
    if (isMobile) setMobileTab("assistant");
  }

  function regenerateLabels() {
    updateActivePotager((potager) => ({
      ...potager,
      cells: potager.cells.map((cell, index) => ({
        ...cell,
        label: `Case ${Math.floor(index / potager.cols) + 1}.${(index % potager.cols) + 1}`,
      })),
    }));
  }

  function scoreFromSide(row, col, side, totalRows, totalCols) {
    if (side === "top") return totalRows <= 1 ? 1 : 1 - row / (totalRows - 1);
    if (side === "bottom") return totalRows <= 1 ? 1 : row / (totalRows - 1);
    if (side === "left") return totalCols <= 1 ? 1 : 1 - col / (totalCols - 1);
    return totalCols <= 1 ? 1 : col / (totalCols - 1);
  }

  function autoMapExposure() {
    updateActivePotager((potager) => {
      const nextCells = potager.cells.map((cell, index) => {
        const row = Math.floor(index / potager.cols);
        const col = index % potager.cols;
        const hotScore = scoreFromSide(row, col, potager.diagnostic.hotSide, potager.rows, potager.cols);
        const shadowScore = scoreFromSide(row, col, potager.diagnostic.shadowSide, potager.rows, potager.cols);
        let sunBase = Math.round(clamp(1 + hotScore * 2 - shadowScore * 1.6, 0, 3));
        if (cell.zoneType === "tree" || cell.zoneType === "wall") sunBase = Math.min(sunBase, 1);
        if (cell.zoneType === "greenhouse") sunBase = Math.max(sunBase, 2);
        let exposureTag = "standard";
        if (sunBase >= 3) exposureTag = "chaud";
        else if (sunBase <= 1) exposureTag = "frais";
        return { ...cell, sunBase, exposureTag };
      });

      return {
        ...potager,
        cells: nextCells,
        assistantStep: "placement",
        diagnostic: { ...potager.diagnostic, lastAppliedAt: new Date().toISOString() },
      };
    });
  }

  function applyOrientationSuggestion() {
    let suggestedOrientation = orientation;
    if (diagnostic.hotSide === "bottom") suggestedOrientation = "south";
    if (diagnostic.hotSide === "top") suggestedOrientation = "north";
    if (diagnostic.hotSide === "left") suggestedOrientation = "west";
    if (diagnostic.hotSide === "right") suggestedOrientation = "east";

    updateActivePotager((potager) => ({
      ...potager,
      orientation: suggestedOrientation,
      diagnostic: {
        ...potager.diagnostic,
        confidence: potager.diagnostic.photoName ? "Moyenne, à confirmer" : "Manuelle confirmée",
      },
    }));
  }

  function createNewPotager() {
    const next = createPotager(`Potager ${potagers.length + 1}`);
    setPotagers((prev) => [...prev, next]);
    setActivePotagerId(next.id);
    setMobileActionsOpen(false);
  }

  function duplicateActivePotager() {
    if (!activePotager) return;
    const next = {
      ...activePotager,
      id: uid(),
      name: `${activePotager.name} copie`,
      cells: activePotager.cells.map((cell) => ({ ...cell, id: uid() })),
      reminders: activePotager.reminders.map((reminder) => ({ ...reminder, id: uid() })),
      actions: activePotager.actions.map((action) => ({ ...action, id: uid() })),
    };
    next.selectedId = next.cells[0]?.id || null;
    setPotagers((prev) => [...prev, next]);
    setActivePotagerId(next.id);
    setMobileActionsOpen(false);
  }

  function deleteActivePotager() {
    if (!activePotager || potagers.length <= 1) return;
    const nextPotagers = potagers.filter((potager) => potager.id !== activePotager.id);
    setPotagers(nextPotagers);
    setActivePotagerId(nextPotagers[0].id);
    setMobileActionsOpen(false);
  }

  function renameActivePotager(name) {
    updateActivePotager((potager) => ({ ...potager, name }));
  }

  function exportActivePotager() {
    if (!activePotager) return;
    const blob = new Blob(
      [JSON.stringify({ type: "assistant-potager-single", potager: activePotager, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(activePotager.name || "potager").replace(/\s+/g, "-").toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportAllPotagers() {
    const blob = new Blob(
      [JSON.stringify({ type: "assistant-potager-all", potagers, activePotagerId, exportedAt: new Date().toISOString() }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "assistant-potager-tous-les-potagers.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importClick() {
    importRef.current?.click();
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        if (parsed.type === "assistant-potager-all" && Array.isArray(parsed.potagers)) {
          const nextPotagers = parsed.potagers.map((potager, index) => normalizePotager(potager, index));
          if (!nextPotagers.length) throw new Error("empty");
          setPotagers(nextPotagers);
          setActivePotagerId(nextPotagers.some((potager) => potager.id === parsed.activePotagerId) ? parsed.activePotagerId : nextPotagers[0].id);
          return;
        }
        if (parsed.type === "assistant-potager-single" && parsed.potager) {
          const next = normalizePotager(parsed.potager, potagers.length);
          next.id = uid();
          next.name = `${next.name} importé`;
          next.cells = next.cells.map((cell) => ({ ...cell, id: uid() }));
          next.selectedId = next.cells[0]?.id || null;
          setPotagers((prev) => [...prev, next]);
          setActivePotagerId(next.id);
          return;
        }
        if (parsed?.cells || parsed?.name) {
          const next = normalizePotager(parsed, potagers.length);
          next.id = uid();
          next.name = `${next.name} importé`;
          next.cells = next.cells.map((cell) => ({ ...cell, id: uid() }));
          next.selectedId = next.cells[0]?.id || null;
          setPotagers((prev) => [...prev, next]);
          setActivePotagerId(next.id);
          return;
        }
        alert("Fichier non reconnu.");
      } catch {
        alert("Import impossible : fichier invalide.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  async function shareActivePotager() {
    if (!activePotager) return;
    const summary = [
      `🌱 ${activePotager.name}`,
      `Gabarit : ${rows} × ${cols}`,
      `Plants : ${totalPlants}`,
      `Arrosage estimé : ${waterNeed} L / jour`,
      `Récolte estimée : ${harvestEstimate} kg`,
      `Rappels actifs : ${pendingReminders.length}`,
      `Lien actuel : ${window.location.href}`,
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: activePotager.name, text: summary, url: window.location.href });
      } catch {
        // annulé
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(summary);
      alert("Résumé copié dans le presse-papiers.");
    } catch {
      alert("Partage non disponible sur ce navigateur.");
    }
  }

  function toggleReminderDone(reminderId) {
    updateActivePotager((potager) => ({
      ...potager,
      reminders: potager.reminders.map((reminder) => (reminder.id === reminderId ? { ...reminder, done: !reminder.done } : reminder)),
    }));
  }

  function deleteReminder(reminderId) {
    updateActivePotager((potager) => ({
      ...potager,
      reminders: potager.reminders.filter((reminder) => reminder.id !== reminderId),
    }));
  }

  function validateAction() {
    if (!activeCell) return;
    if (activeCell.zoneType !== "plant") {
      alert("Sélectionne une zone de culture pour valider une action.");
      return;
    }

    const quantity = Math.max(1, Number(actionDraft.quantity || 1));
    const actionDateISO = new Date(`${actionDraft.date}T09:00:00`).toISOString();
    const newAction = normalizeAction({
      id: uid(),
      type: actionDraft.type,
      cellId: activeCell.id,
      cellLabel: activeCell.label,
      plant: activeCell.plant,
      quantity,
      date: actionDateISO,
      note: actionDraft.note,
      createdAt: new Date().toISOString(),
    });

    const newReminders = buildReminderBlueprints(actionDraft.type, activeCell.plant, quantity, activeCell.label).map((blueprint) =>
      normalizeReminder({
        id: uid(),
        sourceActionId: newAction.id,
        cellId: activeCell.id,
        cellLabel: activeCell.label,
        plant: activeCell.plant,
        quantity,
        title: blueprint.title,
        dueDate: addDaysISO(actionDateISO, blueprint.offsetDays),
        averageDelay: blueprint.averageDelay,
        signs: blueprint.signs,
        advice: blueprint.advice,
        actionType: actionDraft.type,
        done: false,
        note: actionDraft.note,
        createdAt: new Date().toISOString(),
      })
    );

    updateActivePotager((potager) => ({
      ...potager,
      actions: [newAction, ...potager.actions],
      reminders: [...newReminders, ...potager.reminders],
      mobileTab: isMobile ? "reminders" : potager.mobileTab,
      assistantStep: "followup",
    }));

    setActionDraft({
      type: actionDraft.type,
      quantity: Math.max(1, Number(activeCell.count || 1)),
      date: todayInputValue(),
      note: "",
    });
  }

  // Repère 3/6 — manipulation du plan guidé
  function selectCell(id) {
    updateActivePotager((potager) => ({
      ...potager,
      selectedId: id,
      mobileTab: isMobile ? "cell" : potager.mobileTab,
    }));
  }

  function addCase() {
    const next = makeCell("Nouvelle case", "empty");
    const nextLen = cells.length + 1;
    const nextRows = Math.ceil(nextLen / cols);
    updateActivePotager((potager) => ({
      ...potager,
      rows: nextRows,
      cells: [...potager.cells, next],
      selectedId: next.id,
      activePresetKey: "custom",
    }));
  }

  function insertAfterSelected() {
    if (!activeCell) {
      addCase();
      return;
    }
    const next = makeCell("Nouvelle case", "empty");
    const index = cells.findIndex((cell) => cell.id === activeCell.id);
    const copy = [...cells];
    copy.splice(index + 1, 0, next);
    const nextRows = Math.ceil(copy.length / cols);
    updateActivePotager((potager) => ({
      ...potager,
      rows: nextRows,
      cells: copy,
      selectedId: next.id,
      activePresetKey: "custom",
    }));
  }

  function addRow() {
    const row = Array.from({ length: cols }, (_, index) => makeCell(`Case ${rows + 1}.${index + 1}`, "empty"));
    updateActivePotager((potager) => ({
      ...potager,
      rows: potager.rows + 1,
      cells: [...potager.cells, ...row],
      selectedId: row[0]?.id || potager.selectedId,
      activePresetKey: "custom",
    }));
  }

  function removeRow() {
    if (rows <= 1) return;
    const newCells = cells.slice(0, Math.max(1, (rows - 1) * cols));
    updateActivePotager((potager) => ({
      ...potager,
      rows: potager.rows - 1,
      cells: newCells,
      activePresetKey: "custom",
    }));
  }

  function addColumn() {
    const newCells = [];
    for (let r = 0; r < rows; r += 1) {
      const rowCells = cells.slice(r * cols, r * cols + cols);
      newCells.push(...rowCells);
      newCells.push(makeCell(`Case ${r + 1}.${cols + 1}`, "empty"));
    }
    updateActivePotager((potager) => ({
      ...potager,
      cols: potager.cols + 1,
      cells: newCells,
      selectedId: potager.selectedId || newCells[0]?.id || null,
      activePresetKey: "custom",
    }));
  }

  function removeColumn() {
    if (cols <= 1) return;
    const newCells = [];
    for (let r = 0; r < rows; r += 1) {
      const rowCells = cells.slice(r * cols, r * cols + cols);
      newCells.push(...rowCells.slice(0, cols - 1));
    }
    updateActivePotager((potager) => ({
      ...potager,
      cols: potager.cols - 1,
      cells: newCells,
      activePresetKey: "custom",
    }));
  }

  function duplicateSelected() {
    if (!activeCell) return;
    const next = { ...activeCell, id: uid(), label: `${activeCell.label} copie` };
    const copy = [...cells, next];
    updateActivePotager((potager) => ({
      ...potager,
      rows: Math.ceil(copy.length / potager.cols),
      cells: copy,
      selectedId: next.id,
      activePresetKey: "custom",
    }));
  }

  function deleteSelected() {
    if (!activeCell || cells.length <= 1) return;
    const nextCells = cells.filter((cell) => cell.id !== activeCell.id);
    updateActivePotager((potager) => ({
      ...potager,
      rows: Math.max(1, Math.ceil(nextCells.length / potager.cols)),
      cells: nextCells,
      reminders: potager.reminders.filter((reminder) => reminder.cellId !== activeCell.id),
      actions: potager.actions.filter((action) => action.cellId !== activeCell.id),
      activePresetKey: "custom",
    }));
  }

  function moveSelected(direction) {
    if (!activeCell) return;
    const index = cells.findIndex((cell) => cell.id === activeCell.id);

    let target = index;
    if (direction === "left") target = index - 1;
    if (direction === "right") target = index + 1;
    if (direction === "up") target = index - cols;
    if (direction === "down") target = index + cols;

    if (target < 0 || target >= cells.length) return;

    const sameRowLeft = Math.floor(index / cols) === Math.floor(target / cols);
    const sameRowRight = sameRowLeft;
    if ((direction === "left" || direction === "right") && !sameRowRight) return;

    updateActivePotager((potager) => {
      const copy = [...potager.cells];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return { ...potager, cells: copy, activePresetKey: "custom" };
    });
  }

  function resetCurrentPotager() {
    const fresh = createPotager(activePotager?.name || "Potager principal");
    updateActivePotager(() => ({ ...fresh, id: activePotager.id, name: activePotager.name }));
    setPhotoPreview("");
    setMobileActionsOpen(false);
  }

  function setSelectedZoneType(value) {
    if (!activeCell) return;
    updateCell(activeCell.id, (cell) => ({
      ...cell,
      zoneType: value,
      plant: value === "plant" ? (cell.plant === "vide" ? quickPlant : cell.plant) : "vide",
      count: value === "plant" ? Math.max(1, Number(cell.count || 0) || 1) : 0,
    }));
  }

  function quickAssignType(value) {
    if (!activeCell) return;
    setQuickZoneType(value);
    updateCell(activeCell.id, (cell) => ({
      ...cell,
      zoneType: value,
      plant: value === "plant" ? (cell.plant === "vide" ? quickPlant : cell.plant) : "vide",
      count: value === "plant" ? Math.max(1, Number(cell.count || 0) || 1) : 0,
      sunBase: quickSunBase,
    }));
  }

  function quickAssignPlant(plantKey) {
    if (!activeCell) return;
    updateCell(activeCell.id, (cell) => ({
      ...cell,
      zoneType: "plant",
      plant: plantKey,
      count: Math.max(1, Number(cell.count || 0) || 1),
    }));
  }

  function quickAssignSun(value) {
    setQuickSunBase(value);
    if (!activeCell) return;
    updateCell(activeCell.id, (cell) => ({ ...cell, sunBase: value }));
  }

  function applyBrushToCell(cell) {
    const zoneType = quickZoneType;
    updateCell(cell.id, (current) => ({
      ...current,
      zoneType,
      plant: zoneType === "plant" ? quickPlant : "vide",
      count: zoneType === "plant" ? Math.max(1, Number(current.count || 0) || 1) : 0,
      sunBase: quickSunBase,
    }));
    selectCell(cell.id);
  }

  function handlePlanCellTap(cell) {
    if (planEditMode === "paint") {
      applyBrushToCell(cell);
      return;
    }
    selectCell(cell.id);
  }

  function addPlant(cell, forcedPlant = null) {
    const nextPlant = forcedPlant || (cell.zoneType === "plant" ? cell.plant : quickPlant);
    updateCell(cell.id, (current) => ({
      ...current,
      zoneType: "plant",
      plant: nextPlant,
      count: Math.max(0, Number(current.count || 0)) + 1,
    }));
    selectCell(cell.id);
  }

  function removePlant(cell) {
    if (cell.zoneType !== "plant") return;
    updateCell(cell.id, (current) => ({
      ...current,
      count: Math.max(0, Number(current.count || 0) - 1),
    }));
    selectCell(cell.id);
  }

  function applyQuick(cell) {
    updateCell(cell.id, (current) => ({
      ...current,
      zoneType: "plant",
      plant: quickPlant,
      count: Math.max(1, Number(current.count || 0) || 1),
    }));
    selectCell(cell.id);
  }

  function paintSelectedHot() {
    if (!activeCell) return;
    updateCell(activeCell.id, (cell) => ({ ...cell, sunBase: 3, exposureTag: "chaud" }));
  }

  function paintSelectedShade() {
    if (!activeCell) return;
    updateCell(activeCell.id, (cell) => ({ ...cell, sunBase: 1, exposureTag: "frais" }));
  }

  // Repère 4/6 — calculs, recommandations, alertes, météo
  const totalPlants = useMemo(
    () => cells.reduce((sum, cell) => sum + Number(cell.count || 0), 0),
    [cells]
  );

  const waterNeed = useMemo(
    () =>
      cells
        .reduce((sum, cell) => sum + Number(cell.count || 0) * Number(plants[cell.plant]?.water || 0), 0)
        .toFixed(1),
    [cells]
  );

  const harvestEstimate = useMemo(
    () =>
      cells
        .reduce((sum, cell) => sum + Number(cell.count || 0) * Number(plants[cell.plant]?.yield || 0), 0)
        .toFixed(1),
    [cells]
  );

  const breakdown = useMemo(() => {
    const result = {};
    cells.forEach((cell) => {
      if (cell.zoneType !== "plant" || Number(cell.count || 0) <= 0) return;
      result[cell.plant] = (result[cell.plant] || 0) + Number(cell.count || 0);
    });
    return Object.entries(result).sort((a, b) => b[1] - a[1]);
  }, [cells]);

  const monthTasks = useMemo(() => {
    const month = new Date().getMonth() + 1;
    const tasks = [];
    cells.forEach((cell) => {
      if (cell.zoneType !== "plant" || Number(cell.count || 0) <= 0) return;
      const plant = plants[cell.plant];
      const task = plant.tasks[month];
      if (task) tasks.push(`${plant.icon} ${plant.name} — ${task} (${cell.label})`);
    });
    if (weather?.temperature >= 24) tasks.push("🌤 Vérifier les zones en plein soleil");
    if (weather?.temperature <= 6) tasks.push("🧤 Jeunes plants : prudence avec le froid nocturne");
    return [...new Set(tasks)];
  }, [cells, weather]);

  const categorizedReminders = useMemo(() => {
    const result = { today: [], late: [], upcoming: [], done: [] };
    reminders
      .map((reminder) => ({ ...reminder, status: getReminderStatus(reminder) }))
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .forEach((reminder) => {
        result[reminder.status].push(reminder);
      });
    return result;
  }, [reminders]);

  const pendingReminders = useMemo(
    () => [...categorizedReminders.late, ...categorizedReminders.today, ...categorizedReminders.upcoming],
    [categorizedReminders]
  );

  const smartAlerts = useMemo(() => {
    const list = [];
    cells.forEach((cell) => {
      if (cell.zoneType !== "plant" || Number(cell.count || 0) <= 0) return;
      const plant = plants[cell.plant];
      if (plant.sunNeed > sunOf(cell)) list.push(`☀️ ${plant.name} manque de soleil dans ${cell.label}`);
      if (Number(cell.count || 0) >= 8) list.push(`📏 ${cell.label} semble chargé : surveiller l’espacement`);
      list.push(`💧 Arroser ${plant.name} dans ${cell.label}`);
    });

    if (weather?.temperature >= 28) list.push("🔥 Forte chaleur : arroser le soir");
    if (weather?.temperature <= 5) list.push("❄️ Risque de froid pour les jeunes plants");
    if (weather?.windspeed >= 35) list.push("💨 Vent fort : protéger les plants");
    if (!diagnostic.lastAppliedAt) list.push("🧭 Lance le diagnostic guidé pour qualifier l’exposition du plan");

    categorizedReminders.late.slice(0, 3).forEach((reminder) => list.push(`⏰ En retard : ${reminder.title} (${reminder.cellLabel})`));
    categorizedReminders.today.slice(0, 3).forEach((reminder) => list.push(`📌 Aujourd’hui : ${reminder.title} (${reminder.cellLabel})`));

    return [...new Set(list)];
  }, [cells, weather, diagnostic, categorizedReminders]);

  const placementAdvice = useMemo(() => {
    const plantable = cellsWithPosition.filter((cell) => cell.zoneType === "empty" || cell.zoneType === "plant");
    const sortedBySun = [...plantable].sort((a, b) => sunOf(b) - sunOf(a));
    const sortedShade = [...plantable].sort((a, b) => sunOf(a) - sunOf(b));

    const hottest = sortedBySun.slice(0, Math.min(4, sortedBySun.length)).map((cell) => cell.label);
    const coolest = sortedShade.slice(0, Math.min(4, sortedShade.length)).map((cell) => cell.label);

    const tomatoCells = hottest.slice(0, 2);
    const pepperCells = hottest.slice(2, 4);
    const saladCells = coolest.slice(0, 2);
    const herbCells = sortedShade.filter((cell) => sunOf(cell) >= 1 && sunOf(cell) <= 2).slice(0, 2).map((cell) => cell.label);

    const notes = [];
    notes.push(`Tomates / tomates cerises : ${tomatoCells.length ? tomatoCells.join(", ") : "aucune zone évidente"}.`);
    notes.push(`Piments / poivrons : ${pepperCells.length ? pepperCells.join(", ") : "mêmes zones chaudes que les tomates"}.`);
    notes.push(`Salades / persil : ${saladCells.length ? saladCells.join(", ") : "viser les zones plus fraîches"}.`);
    notes.push(`Basilic / fleurs : ${herbCells.length ? herbCells.join(", ") : "zones intermédiaires bien accessibles"}.`);

    if (diagnostic.photoName) {
      notes.unshift(`Diagnostic photo assisté chargé : ${diagnostic.photoName}. Confiance actuelle : ${diagnostic.confidence}.`);
    }

    return notes;
  }, [cellsWithPosition, diagnostic]);

  const diagnosisSummary = useMemo(() => {
    const list = [];
    list.push(`Orientation retenue : ${terraceText(orientation)}.`);
    list.push(`Côté le plus lumineux estimé : ${sideLabel(diagnostic.hotSide)}.`);
    list.push(`Côté le plus ombragé estimé : ${sideLabel(diagnostic.shadowSide)}.`);
    list.push(`Vent dominant à surveiller : ${sideLabel(diagnostic.windSide)}.`);
    list.push(`Confiance : ${diagnostic.confidence}.`);
    if (diagnostic.lastAppliedAt) list.push(`Dernière application au plan : ${formatDateTime(diagnostic.lastAppliedAt)}.`);
    if (weather?.temperature >= 24) list.push("Contexte météo : chaleur actuelle, privilégier l’arrosage du soir et les zones chaudes pour tomates/piments.");
    if (weather?.temperature <= 8) list.push("Contexte météo : fraîcheur marquée, sécuriser les mises en terre et les jeunes plants.");
    if (weather?.windspeed >= 30) list.push("Contexte météo : vent notable, renforcer tuteurs et protections.");
    return list;
  }, [orientation, diagnostic, weather]);

  // Repère 5/6 — rendu des panneaux guidés
  function renderPotagerManager() {
    return (
      <Card title="🗂 Gestion des potagers">
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr auto", gap: 12, alignItems: "end" }}>
          <label>
            <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Potager actif</div>
            <select value={activePotagerId} onChange={(e) => setActivePotagerId(e.target.value)} style={fieldStyle()}>
              {potagers.map((potager) => (
                <option key={potager.id} value={potager.id}>{potager.name}</option>
              ))}
            </select>
          </label>

          <label>
            <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Nom</div>
            <input value={activePotager?.name || ""} onChange={(e) => renameActivePotager(e.target.value)} style={fieldStyle()} placeholder="Nom du potager" />
          </label>

          <button onClick={deleteActivePotager} disabled={potagers.length <= 1} style={primaryBtn(potagers.length > 1 ? "#b91c1c" : "#9ca3af")}>
            Supprimer
          </button>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {potagers.map((potager) => {
            const selected = potager.id === activePotagerId;
            return (
              <button key={potager.id} onClick={() => setActivePotagerId(potager.id)} style={chipBtn(selected)}>
                🌿 {potager.name}
              </button>
            );
          })}
        </div>
      </Card>
    );
  }


  function renderPlanCard() {
    const quickPresets = planPresets.filter((preset) => quickPresetKeys.includes(preset.key));
    const selectedCell = activeCellPosition;
    const compactDesktop = focusPlan && !isMobile;

    return (
      <Card
        title="🗺 Plan du jardin"
        right={
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {!isMobile ? (
              <button onClick={() => setFocusPlan((value) => !value)} style={chipBtn(focusPlan)}>
                {focusPlan ? "Mode focus" : "Mode complet"}
              </button>
            ) : null}
            {!isMobile ? (
              <button onClick={() => setShowDesktopSidebar((value) => !value)} style={chipBtn(showDesktopSidebar)}>
                {showDesktopSidebar ? "Masquer panneaux" : "Afficher panneaux"}
              </button>
            ) : null}
            <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 700 }}>
              {rows} × {cols} • {terraceText(orientation)}
            </div>
          </div>
        }
      >
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button onClick={() => setPlanEditMode("select")} style={chipBtn(planEditMode === "select")}>👆 Sélection</button>
            <button onClick={() => setPlanEditMode("paint")} style={chipBtn(planEditMode === "paint")}>🎨 Pinceau</button>
            <button onClick={() => setShowPlanTools((value) => !value)} style={softBtn()}>
              {showPlanTools ? "Masquer les outils" : "Ouvrir les outils"}
            </button>
            <button onClick={addCase} style={primaryBtn("#2563eb")}>+ case</button>
            <button onClick={addRow} style={primaryBtn("#059669")}>+ ligne</button>
            <button onClick={addColumn} style={primaryBtn("#0f766e")}>+ colonne</button>
          </div>

          <div style={{ color: "#6b7280", lineHeight: 1.55, fontSize: 13 }}>
            Le plan passe maintenant en priorité. Les détails de case et l’assistant restent accessibles, mais ils ne doivent plus écraser la grille.
          </div>

          {showPlanTools ? (
            <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, display: "grid", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                {quickPresets.map((preset) => (
                  <button key={preset.key} onClick={() => applyPreset(preset)} style={chipBtn(activePresetKey === preset.key)}>
                    {preset.label}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))", gap: 8 }}>
                {quickZoneTools.map((tool) => (
                  <button key={tool.key} onClick={() => setQuickZoneType(tool.key)} style={chipBtn(quickZoneType === tool.key)}>
                    {tool.icon} {tool.label}
                  </button>
                ))}
              </div>

              {quickZoneType === "plant" ? (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(4, minmax(0, 1fr))" : "repeat(8, minmax(0, 1fr))", gap: 8 }}>
                  {quickPlantFavorites.map((key) => (
                    <button key={key} onClick={() => updateActivePotager((potager) => ({ ...potager, quickPlant: key }))} style={chipBtn(quickPlant === key)}>
                      {plants[key].icon}
                    </button>
                  ))}
                </div>
              ) : null}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                {[0, 1, 2, 3].map((value) => (
                  <button key={value} onClick={() => setQuickSunBase(value)} style={chipBtn(quickSunBase === value)}>
                    ☀ {value}
                  </button>
                ))}
              </div>

              <label>
                <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Zoom du plan</div>
                <input
                  type="range"
                  min={60}
                  max={160}
                  step={5}
                  value={zoom}
                  onChange={(e) => updateActivePotager((potager) => ({ ...potager, zoom: Number(e.target.value) }))}
                  style={{ width: "100%" }}
                />
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{zoom}% • {zoomText(zoom)}</div>
              </label>
            </div>
          ) : null}

          <div style={{ background: compactDesktop ? "#eef2ff" : "#f8fafc", border: compactDesktop ? "1px solid #c7d2fe" : "1px solid #e5e7eb", borderRadius: 18, padding: compactDesktop ? 18 : 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 800 }}>Plan lisible</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>
                  {planEditMode === "paint" ? `Pinceau actif : ${quickZoneTools.find((tool) => tool.key === quickZoneType)?.label || quickZoneType} • soleil ${quickSunBase}` : "Clique une case pour la sélectionner"}
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#374151", background: "rgba(255,255,255,0.8)", border: "1px solid #e5e7eb", borderRadius: 12, padding: "8px 10px" }}>
                {selectedCell ? `${selectedCell.label} • ${selectedCell.exposureTag} • ☀ ${sunOf(selectedCell)}/3` : "Aucune case sélectionnée"}
              </div>
            </div>

            <div style={{ overflowX: "auto", paddingBottom: 6 }}>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(${cellMinWidth}px, 1fr))`, gap: compactDesktop ? 16 : 12, minWidth: isMobile ? "max-content" : "max-content" }}>
                {cellsWithPosition.map((cell) => {
                  const selected = selectedId === cell.id;
                  const isPlant = cell.zoneType === "plant";
                  const compactCell = isMobile || focusPlan;
                  return (
                    <div
                      key={cell.id}
                      onClick={() => handleGridCellClick(cell)}
                      style={{
                        background: bgOf(cell),
                        borderRadius: 18,
                        minHeight: compactDesktop ? Math.max(170, cellMinHeight - 14) : cellMinHeight,
                        padding: compactCell ? 12 : 14,
                        cursor: "pointer",
                        color: cell.zoneType === "terrace" || cell.zoneType === "tree" ? "#fff" : "#111827",
                        boxShadow: selected ? "0 0 0 3px #111827 inset, 0 10px 24px rgba(0,0,0,0.16)" : "0 8px 18px rgba(0,0,0,0.06)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        position: "relative",
                        transition: "transform 0.12s ease, box-shadow 0.12s ease",
                      }}
                    >
                      {selected ? (
                        <div style={{ position: "absolute", top: 10, right: 10, background: "#111827", color: "#fff", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 700 }}>
                          active
                        </div>
                      ) : null}

                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                          <div style={{ fontWeight: 800, lineHeight: 1.2, fontSize: titleSize }}>{compactCell ? cell.label : `${cell.label} · L${cell.row + 1}C${cell.col + 1}`}</div>
                        </div>

                        <div style={{ fontSize: compactDesktop ? Math.max(32, iconSize - 6) : iconSize, marginTop: 8 }}>{iconOf(cell)}</div>
                        <div style={{ marginTop: 6, fontWeight: 700, fontSize: textSize }}>{isPlant ? plants[cell.plant]?.name || "Culture" : zoneMeta[cell.zoneType]?.label || "Zone"}</div>
                        <div style={{ marginTop: 4, fontSize: Math.max(11, textSize - 2), color: cell.zoneType === "terrace" || cell.zoneType === "tree" ? "rgba(255,255,255,0.92)" : "#374151" }}>
                          ☀ {sunOf(cell)}/3 • {cell.exposureTag}
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 12 }}>
                        <div style={{ fontSize: Math.max(12, textSize - 1), fontWeight: 700 }}>
                          {isPlant ? `${Number(cell.count || 0)} plant${Number(cell.count || 0) > 1 ? "s" : ""}` : zoneMeta[cell.zoneType]?.label || "Zone"}
                        </div>
                        {selected ? (
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                            {isPlant ? (
                              <>
                                <button onClick={(e) => { e.stopPropagation(); removePlant(cell); }} style={miniBtn()}>-1</button>
                                <button onClick={(e) => { e.stopPropagation(); addPlant(cell); }} style={miniBtn()}>+1</button>
                              </>
                            ) : (
                              <button onClick={(e) => { e.stopPropagation(); applyQuick(cell); }} style={miniBtn()}>Culture</button>
                            )}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedCell ? (
            <div style={{ background: isMobile ? "#111827" : "#ffffff", color: isMobile ? "#fff" : "#111827", borderRadius: 16, border: isMobile ? "none" : "1px solid #e5e7eb", padding: 14, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 800 }}>{selectedCell.label}</div>
                  <div style={{ fontSize: 13, opacity: 0.9 }}>
                    {zoneMeta[selectedCell.zoneType]?.icon || "⬜"} {selectedCell.zoneType === "plant" ? plants[selectedCell.plant]?.name : zoneMeta[selectedCell.zoneType]?.label} • {selectedCell.exposureTag} • ☀ {sunOf(selectedCell)}/3
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {isMobile ? <button onClick={() => setMobileTab("cell")} style={softBtn()}>Ouvrir la case</button> : null}
                  {!isMobile && !showDesktopSidebar ? <button onClick={() => setShowDesktopSidebar(true)} style={softBtn()}>Ouvrir les panneaux</button> : null}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button onClick={() => applyBrushToCell(selectedCell)} style={softBtn()}>Appliquer l’outil</button>
                {selectedCell.zoneType === "plant" ? (
                  <>
                    <button onClick={() => addPlant(selectedCell)} style={softBtn()}>+1 plant</button>
                    <button onClick={() => removePlant(selectedCell)} style={softBtn()}>-1 plant</button>
                  </>
                ) : (
                  <button onClick={() => applyQuick(selectedCell)} style={softBtn()}>Passer en culture</button>
                )}
                <button onClick={() => setPlanEditMode(planEditMode === "paint" ? "select" : "paint")} style={softBtn()}>
                  {planEditMode === "paint" ? "Mode sélection" : "Mode pinceau"}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    );
  }


  function renderAssistantPanel() {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        {renderPotagerManager()}

        <Card title="🧭 Assistant guidé" right={<div style={{ color: "#6b7280", fontSize: 13 }}>{assistantStep}</div>}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { key: "template", label: "1. Gabarit" },
              { key: "diagnostic", label: "2. Diagnostic" },
              { key: "placement", label: "3. Placement" },
              { key: "followup", label: "4. Suivi" },
            ].map((step) => (
              <button key={step.key} onClick={() => setAssistantStep(step.key)} style={chipBtn(assistantStep === step.key)}>
                {step.label}
              </button>
            ))}
          </div>

          {assistantStep === "template" ? (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ color: "#4b5563", lineHeight: 1.55 }}>
                Commence par un format simple déjà prêt. Ensuite seulement on qualifie l’exposition et on te suggère où planter.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, minmax(0, 1fr))", gap: 10 }}>
                {planPresets.map((preset) => (
                  <PresetCard key={preset.key} preset={preset} active={activePresetKey === preset.key} onApply={applyPreset} />
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Lignes</div>
                  <input type="number" min={1} max={8} value={rows} onChange={(e) => updateActivePotager((potager) => ({ ...potager, rows: clamp(Number(e.target.value) || 1, 1, 8), activePresetKey: "custom" }))} style={fieldStyle()} />
                </label>
                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Colonnes</div>
                  <input type="number" min={1} max={8} value={cols} onChange={(e) => updateActivePotager((potager) => ({ ...potager, cols: clamp(Number(e.target.value) || 1, 1, 8), activePresetKey: "custom" }))} style={fieldStyle()} />
                </label>
                <div style={{ display: "flex", alignItems: "end" }}>
                  <button onClick={() => applyPreset({ key: "custom", rows, cols, layout: "blank" })} style={primaryBtn("#2563eb")}>
                    Recréer la grille
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {assistantStep === "diagnostic" ? (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ color: "#4b5563", lineHeight: 1.55 }}>
                Ici tu qualifies le jardin très simplement. Si tu as une photo, charge-la pour garder un support visuel. Le diagnostic reste à confirmer manuellement pour rester fiable.
              </div>

              <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={photoInputClick} style={primaryBtn("#7c3aed")}>Charger une photo</button>
                <button onClick={clearPhotoPreview} style={softBtn()}>Retirer la photo</button>
                <button onClick={applyOrientationSuggestion} style={softBtn()}>Déduire l’orientation</button>
                <button onClick={autoMapExposure} style={primaryBtn("#2563eb")}>Appliquer au plan</button>
              </div>

              {photoPreview ? (
                <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", background: "#f8fafc" }}>
                  <img src={photoPreview} alt="Diagnostic potager" style={{ width: "100%", display: "block", maxHeight: 260, objectFit: "cover" }} />
                </div>
              ) : null}

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Orientation générale</div>
                  <select value={orientation} onChange={(e) => updateActivePotager((potager) => ({ ...potager, orientation: e.target.value }))} style={fieldStyle()}>
                    <option value="south">Terrasse en bas</option>
                    <option value="north">Terrasse en haut</option>
                    <option value="west">Terrasse à gauche</option>
                    <option value="east">Terrasse à droite</option>
                  </select>
                </label>

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Soleil global</div>
                  <select value={sunMode} onChange={(e) => updateActivePotager((potager) => ({ ...potager, sunMode: Number(e.target.value) }))} style={fieldStyle()}>
                    <option value={1}>Matin / ombre</option>
                    <option value={2}>Normal</option>
                    <option value={3}>Plein soleil</option>
                  </select>
                </label>

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Confiance</div>
                  <select value={diagnostic.confidence} onChange={(e) => updateDiagnostic({ confidence: e.target.value })} style={fieldStyle()}>
                    <option>À confirmer</option>
                    <option>Faible</option>
                    <option>Moyenne, à confirmer</option>
                    <option>Bonne après validation visuelle</option>
                  </select>
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Côté le plus lumineux</div>
                  <select value={diagnostic.hotSide} onChange={(e) => updateDiagnostic({ hotSide: e.target.value })} style={fieldStyle()}>
                    {sideOptions.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                  </select>
                </label>

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Côté le plus ombragé</div>
                  <select value={diagnostic.shadowSide} onChange={(e) => updateDiagnostic({ shadowSide: e.target.value })} style={fieldStyle()}>
                    {sideOptions.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                  </select>
                </label>

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Vent à surveiller</div>
                  <select value={diagnostic.windSide} onChange={(e) => updateDiagnostic({ windSide: e.target.value })} style={fieldStyle()}>
                    {sideOptions.map((opt) => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                  </select>
                </label>
              </div>

              <label>
                <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Notes de diagnostic</div>
                <textarea value={diagnostic.notes} onChange={(e) => updateDiagnostic({ notes: e.target.value })} style={areaStyle()} placeholder="Exemple : ombre du mur le matin, fond droit très chaud, vent latéral..." />
              </label>

              <div style={{ display: "grid", gap: 8 }}>
                {diagnosisSummary.map((line, index) => (
                  <div key={`diag-${index}`} style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 12px", lineHeight: 1.45 }}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {assistantStep === "placement" ? (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ color: "#4b5563", lineHeight: 1.55 }}>
                L’idée est de rendre le placement presque automatique : l’app repère les cases les plus chaudes, intermédiaires et fraîches à partir du diagnostic.
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button onClick={autoMapExposure} style={primaryBtn("#2563eb")}>Recalculer l’exposition</button>
                <button onClick={() => setMobileTab("plan")} style={softBtn()}>Retour au plan</button>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {placementAdvice.map((line, index) => (
                  <div key={`placement-${index}`} style={{ background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 12, padding: "10px 12px", lineHeight: 1.45 }}>
                    {line}
                  </div>
                ))}
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, lineHeight: 1.55 }}>
                <strong>Conseil pratique :</strong> clique une case dans le plan, puis passe dans l’onglet <strong>Case</strong> pour la transformer en culture, serre, allée, mur ou zone d’ombre. Tu peux ensuite valider les actions pour déclencher les rappels.
              </div>
            </div>
          ) : null}

          {assistantStep === "followup" ? (
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ color: "#4b5563", lineHeight: 1.55 }}>
                Toute action validée crée automatiquement des rappels : délai moyen, signes à observer, quantité concernée et conseil pratique.
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {smartAlerts.slice(0, 6).map((alert, index) => (
                  <div key={`alert-${index}`} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "10px 12px", lineHeight: 1.45 }}>
                    {alert}
                  </div>
                ))}
              </div>

              <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, lineHeight: 1.55 }}>
                <strong>Rappel de logique :</strong> semis, repiquage, mise en terre, tuteurage et récolte produisent des rappels qui tiennent compte du contexte météo et de la culture concernée.
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    );
  }

  function renderCellPanel() {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Card title="⚙️ Case sélectionnée" right={activeCell ? <div style={{ color: "#6b7280", fontSize: 13 }}>{activeCell.label}</div> : null}>
          {activeCell ? (
            <>
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 14, padding: 12, display: "grid", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>Paramétrage express</div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, minmax(0, 1fr))" : "repeat(6, minmax(0, 1fr))", gap: 8 }}>
                    {quickZoneTools.map((tool) => (
                      <button key={tool.key} onClick={() => quickAssignType(tool.key)} style={chipBtn(activeCell.zoneType === tool.key)}>
                        {tool.icon} {tool.label}
                      </button>
                    ))}
                  </div>

                  {activeCell.zoneType === "plant" ? (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(4, minmax(0, 1fr))" : "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                      {quickPlantFavorites.map((key) => (
                        <button key={key} onClick={() => quickAssignPlant(key)} style={chipBtn(activeCell.plant === key)}>
                          {plants[key].icon} {isMobile ? "" : plants[key].name}
                        </button>
                      ))}
                    </div>
                  ) : null}

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                    {[0, 1, 2, 3].map((value) => (
                      <button key={value} onClick={() => quickAssignSun(value)} style={chipBtn(Number(activeCell.sunBase) === value)}>
                        ☀ {value}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={paintSelectedHot} style={softBtn()}>Marquer chaud</button>
                    <button onClick={paintSelectedShade} style={softBtn()}>Marquer frais</button>
                    <button onClick={() => setMobileTab("plan")} style={softBtn()}>Retour au plan</button>
                  </div>
                </div>

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Nom</div>
                  <input value={activeCell.label} onChange={(e) => updateCell(activeCell.id, (cell) => ({ ...cell, label: e.target.value }))} style={fieldStyle()} />
                </label>

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Type de zone</div>
                  <select value={activeCell.zoneType} onChange={(e) => setSelectedZoneType(e.target.value)} style={fieldStyle()}>
                    <option value="plant">Culture</option>
                    <option value="grass">Pelouse</option>
                    <option value="terrace">Terrasse</option>
                    <option value="tree">Arbre / ombre</option>
                    <option value="greenhouse">Serre</option>
                    <option value="path">Allée</option>
                    <option value="wall">Mur</option>
                    <option value="empty">Vide</option>
                  </select>
                </label>

                {activeCell.zoneType === "plant" ? (
                  <>
                    <label>
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Plante</div>
                      <select value={activeCell.plant} onChange={(e) => updateCell(activeCell.id, (cell) => ({ ...cell, plant: e.target.value }))} style={fieldStyle()}>
                        {Object.keys(plants).filter((key) => key !== "vide").map((key) => (
                          <option key={key} value={key}>{plants[key].icon} {plants[key].name}</option>
                        ))}
                      </select>
                    </label>

                    <label>
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Nombre de plants</div>
                      <input type="number" min={0} value={activeCell.count} onChange={(e) => updateCell(activeCell.id, (cell) => ({ ...cell, count: Math.max(0, Number(e.target.value) || 0) }))} style={fieldStyle()} />
                    </label>
                  </>
                ) : null}

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Soleil de base</div>
                  <select value={activeCell.sunBase} onChange={(e) => updateCell(activeCell.id, (cell) => ({ ...cell, sunBase: Number(e.target.value) }))} style={fieldStyle()}>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                  </select>
                </label>

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Note</div>
                  <textarea value={activeCell.note} onChange={(e) => updateCell(activeCell.id, (cell) => ({ ...cell, note: e.target.value }))} style={areaStyle()} placeholder="Exemple : zone chaude contre le mur, accès facile, serre temporaire..." />
                </label>
              </div>

              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Déplacer la case</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  <div />
                  <button onClick={() => moveSelected("up")} style={softBtn()}>↑</button>
                  <div />
                  <button onClick={() => moveSelected("left")} style={softBtn()}>←</button>
                  <button onClick={() => moveSelected("down")} style={softBtn()}>↓</button>
                  <button onClick={() => moveSelected("right")} style={softBtn()}>→</button>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {activeCell.zoneType === "plant" ? (
                    <>
                      <button onClick={() => removePlant(activeCell)} style={softBtn()}>-1 plant</button>
                      <button onClick={() => addPlant(activeCell)} style={softBtn()}>+1 plant</button>
                      <button onClick={() => updateCell(activeCell.id, (cell) => ({ ...cell, count: 0 }))} style={softBtn()}>Vider</button>
                    </>
                  ) : (
                    <button onClick={() => applyQuick(activeCell)} style={softBtn()}>Transformer en {plants[quickPlant].name}</button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: "#6b7280" }}>Sélectionne une case dans le plan.</div>
          )}
        </Card>

        <Card title="✅ Valider une action">
          {activeCell && activeCell.zoneType === "plant" ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ color: "#4b5563", lineHeight: 1.5 }}>
                Une validation crée automatiquement des rappels avec quantité, délai moyen et signes à observer.
              </div>

              <label>
                <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Action</div>
                <select value={actionDraft.type} onChange={(e) => setActionDraft((prev) => ({ ...prev, type: e.target.value }))} style={fieldStyle()}>
                  {Object.entries(actionCatalog).map(([key, meta]) => (
                    <option key={key} value={key}>{meta.icon} {meta.label}</option>
                  ))}
                </select>
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Quantité</div>
                  <input type="number" min={1} value={actionDraft.quantity} onChange={(e) => setActionDraft((prev) => ({ ...prev, quantity: Math.max(1, Number(e.target.value) || 1) }))} style={fieldStyle()} />
                </label>

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Date</div>
                  <input type="date" value={actionDraft.date} onChange={(e) => setActionDraft((prev) => ({ ...prev, date: e.target.value }))} style={fieldStyle()} />
                </label>
              </div>

              <label>
                <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Note</div>
                <textarea value={actionDraft.note} onChange={(e) => setActionDraft((prev) => ({ ...prev, note: e.target.value }))} style={areaStyle()} placeholder="Exemple : repiquage après 2 vraies feuilles, mise en terre après acclimatation..." />
              </label>

              <button onClick={validateAction} style={primaryBtn("#2563eb")}>
                Valider l’action et créer les rappels
              </button>
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>Sélectionne une culture pour valider une action logique.</div>
          )}
        </Card>
      </div>
    );
  }

  function renderRemindersPanel() {
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Card title="🚨 Alertes intelligentes">
          {smartAlerts.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {smartAlerts.map((alert, index) => (
                <div key={`${alert}-${index}`} style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "10px 12px", lineHeight: 1.45 }}>
                  {alert}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>Aucune alerte pour l’instant.</div>
          )}
        </Card>

        <Card title="📍 Aujourd’hui / en retard">
          {categorizedReminders.late.length || categorizedReminders.today.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {[...categorizedReminders.late, ...categorizedReminders.today].map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} onToggleDone={toggleReminderDone} onDelete={deleteReminder} />
              ))}
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>Aucun rappel urgent.</div>
          )}
        </Card>

        <Card title="🗓️ À venir">
          {categorizedReminders.upcoming.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {categorizedReminders.upcoming.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} onToggleDone={toggleReminderDone} onDelete={deleteReminder} />
              ))}
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>Aucun rappel à venir.</div>
          )}
        </Card>

        <Card title="🧾 Historique des actions">
          {actions.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {actions.map((action) => <ActionCard key={action.id} action={action} />)}
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>Aucune action validée pour le moment.</div>
          )}
        </Card>

        <Card title="✅ Terminés">
          {categorizedReminders.done.length ? (
            <div style={{ display: "grid", gap: 10 }}>
              {categorizedReminders.done.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} onToggleDone={toggleReminderDone} onDelete={deleteReminder} />
              ))}
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>Aucun rappel terminé.</div>
          )}
        </Card>
      </div>
    );
  }


  function renderDesktopLeft() {
    const secondaryPanels = (
      <div style={{ display: "grid", gridTemplateColumns: focusPlan ? "repeat(2, minmax(280px, 1fr))" : "repeat(3, minmax(260px, 1fr))", gap: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          {renderCellPanel()}
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          {renderRemindersPanel()}
        </div>
        {!focusPlan ? (
          <div style={{ display: "grid", gap: 16 }}>
            {renderAssistantPanel()}
          </div>
        ) : null}
      </div>
    );

    return (
      <div style={{ display: "grid", gap: 18 }}>
        {!focusPlan ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(180px, 1fr))", gap: 14 }}>
            <StatCard icon="🌿" label="Plants au total" value={totalPlants} subtitle="Dans le potager actif" />
            <StatCard icon="💧" label="Arrosage estimé / jour" value={`${waterNeed} L`} subtitle="Estimation théorique" />
            <StatCard icon="🧺" label="Récolte estimée" value={`${harvestEstimate} kg`} subtitle="Potentiel global approximatif" />
          </div>
        ) : null}

        {renderPlanCard()}

        {focusPlan ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(180px, 1fr))", gap: 14 }}>
            <StatCard icon="🌿" label="Plants au total" value={totalPlants} subtitle="Dans le potager actif" />
            <StatCard icon="💧" label="Arrosage estimé / jour" value={`${waterNeed} L`} subtitle="Estimation théorique" />
            <StatCard icon="🧺" label="Récolte estimée" value={`${harvestEstimate} kg`} subtitle="Potentiel global approximatif" />
          </div>
        ) : null}

        {!showDesktopSidebar ? secondaryPanels : null}

        <Card title="📊 Répartition des plants">
          {breakdown.length ? (
            <div style={{ display: "grid", gap: 8 }}>
              {breakdown.map(([key, count]) => (
                <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: 12, padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span>{plants[key].icon}</span>
                    <span>{plants[key].name}</span>
                  </div>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: "#6b7280" }}>Aucun plant enregistré.</div>
          )}
        </Card>
      </div>
    );
  }



  function renderDesktopRight() {
    if (!showDesktopSidebar) return null;
    return (
      <div style={{ display: "grid", gap: 16, position: "sticky", top: 86 }}>
        {renderAssistantPanel()}
        {renderCellPanel()}
        {renderRemindersPanel()}
      </div>
    );
  }



  function renderMobileTabContent() {
    if (mobileTab === "assistant") return renderAssistantPanel();
    if (mobileTab === "reminders") return renderRemindersPanel();
    if (mobileTab === "cell") return renderCellPanel();
    return renderPlanCard();
  }


  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(180deg, #edf4f8 0%, #f7fafc 100%)",
        minHeight: "100vh",
        padding: isMobile ? 12 : 24,
        color: "#111827",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1680, margin: "0 auto" }}>
        <input ref={importRef} type="file" accept=".json,application/json" style={{ display: "none" }} onChange={importData} />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isMobile ? "stretch" : "center",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 16,
            position: "sticky",
            top: 0,
            zIndex: 20,
            background: "rgba(237,244,248,0.92)",
            backdropFilter: "blur(8px)",
            paddingTop: 6,
            paddingBottom: 8,
          }}
        >
          <div style={{ flex: "1 1 340px" }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 30 : 42 }}>🌱 Assistant Potager 2.1.2 focus plan</h1>
            <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.4 }}>
              Plan prioritaire • panneaux secondaires repliables • cases simplifiées
            </div>
          </div>

          {isMobile ? (
            <div style={{ width: "100%", display: "grid", gap: 10 }}>
              <button onClick={() => setMobileActionsOpen((value) => !value)} style={primaryBtn(mobileActionsOpen ? "#111827" : "#2563eb")}>
                {mobileActionsOpen ? "Fermer les actions" : "Ouvrir les actions"}
              </button>

              {mobileActionsOpen ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                  <button onClick={createNewPotager} style={primaryBtn("#2563eb")}>Nouveau</button>
                  <button onClick={duplicateActivePotager} style={primaryBtn("#0f766e")}>Dupliquer</button>
                  <button onClick={importClick} style={primaryBtn("#7c3aed")}>Importer</button>
                  <button onClick={exportActivePotager} style={primaryBtn("#9333ea")}>Exporter</button>
                  <button onClick={shareActivePotager} style={primaryBtn("#ea580c")}>Partager</button>
                  <button onClick={resetCurrentPotager} style={primaryBtn("#111827")}>Reset</button>
                </div>
              ) : null}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                {mobileTabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setMobileTab(tab.key)}
                    style={{
                      border: mobileTab === tab.key ? "2px solid #111827" : "1px solid #d1d5db",
                      background: mobileTab === tab.key ? "#eef2ff" : "#fff",
                      borderRadius: 12,
                      padding: "10px 8px",
                      cursor: "pointer",
                      fontWeight: 700,
                      minHeight: 50,
                    }}
                  >
                    <div>{tab.icon}</div>
                    <div style={{ fontSize: 12, marginTop: 2 }}>{tab.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={createNewPotager} style={primaryBtn("#2563eb")}>Nouveau potager</button>
              <button onClick={duplicateActivePotager} style={primaryBtn("#0f766e")}>Dupliquer</button>
              <button onClick={importClick} style={primaryBtn("#7c3aed")}>Importer</button>
              <button onClick={exportActivePotager} style={primaryBtn("#9333ea")}>Exporter</button>
              <button onClick={exportAllPotagers} style={primaryBtn("#6d28d9")}>Tout exporter</button>
              <button onClick={shareActivePotager} style={primaryBtn("#ea580c")}>Partager</button>
              <button onClick={resetCurrentPotager} style={primaryBtn("#111827")}>Reset</button>
            </div>
          )}
        </div>

        {isMobile ? (
          renderMobileTabContent()
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: showDesktopSidebar ? "minmax(940px, 1fr) 420px" : "1fr", gap: 20, alignItems: "start" }}>
            {renderDesktopLeft()}
            {renderDesktopRight()}
          </div>
        )}
      </div>
    </div>
  );
}

// Repère 6/6 — fin du fichier
