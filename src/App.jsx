import React, { useEffect, useMemo, useRef, useState } from "react";

// Repère 1/6 — catalogue, helpers, modèles
const CITY = "Saint-Germain-lès-Arpajon (91180)";
const LAT = 48.616;
const LON = 2.258;
const STORAGE = "potager_v224_game_builder";

const plants = {
  tomate: { name: "Tomate", icon: "🍅", color: "#ef4444", water: 1.2, yield: 3, sunNeed: 3 },
  tomateCerise: { name: "Tomate cerise", icon: "🍅", color: "#fb7185", water: 1, yield: 2, sunNeed: 3 },
  piment: { name: "Piment", icon: "🌶️", color: "#dc2626", water: 0.8, yield: 0.6, sunNeed: 3 },
  poivron: { name: "Poivron", icon: "🫑", color: "#f59e0b", water: 0.8, yield: 1, sunNeed: 3 },
  salade: { name: "Salade", icon: "🥬", color: "#84cc16", water: 0.5, yield: 0.3, sunNeed: 1 },
  basilic: { name: "Basilic", icon: "🌿", color: "#22c55e", water: 0.4, yield: 0.2, sunNeed: 2 },
  persil: { name: "Persil", icon: "🌱", color: "#16a34a", water: 0.3, yield: 0.2, sunNeed: 1 },
  fleurs: { name: "Fleurs utiles", icon: "🌼", color: "#fde047", water: 0.2, yield: 0, sunNeed: 2 },
};

const slotKinds = {
  plant: { label: "Culture", icon: "🪴", color: "#ffffff" },
  greenhouse: { label: "Serre", icon: "🏕️", color: "#99f6e4" },
  lawn: { label: "Pelouse", icon: "🟩", color: "#86efac" },
  path: { label: "Allée", icon: "🪨", color: "#d6d3d1" },
  border: { label: "Bordure", icon: "🪵", color: "#cbd5e1" },
  shade: { label: "Ombre", icon: "🌳", color: "#64748b" },
  empty: { label: "Vide", icon: "⬜", color: "#eef2f7" },
};

const presets = [
  { key: "3x3", label: "3×3", rows: 3, cols: 3 },
  { key: "3x4", label: "3×4", rows: 3, cols: 4 },
  { key: "4x4", label: "4×4", rows: 4, cols: 4 },
  { key: "4x6", label: "4×6", rows: 4, cols: 6 },
  { key: "5x5", label: "5×5", rows: 5, cols: 5 },
  { key: "5x8", label: "5×8", rows: 5, cols: 8 },
  { key: "6x6", label: "6×6", rows: 6, cols: 6 },
  { key: "6x10", label: "6×10", rows: 6, cols: 10 },
  { key: "8x8", label: "8×8", rows: 8, cols: 8 },
  { key: "12x6", label: "12×6", rows: 12, cols: 6 },
];

const quickKinds = ["plant", "greenhouse", "lawn", "path", "border", "shade"];
const exposureSteps = [
  { key: "ombre", label: "Ombré", sun: 0 },
  { key: "frais", label: "Frais", sun: 1 },
  { key: "equilibre", label: "Équilibré", sun: 2 },
  { key: "chaud", label: "Très ensoleillé", sun: 3 },
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
        advice: "Garder humide et lumineux sans détremper.",
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
        title: "Valider reprise visible",
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
        advice: "Continuer entretien et récolter régulièrement.",
      },
    ],
  },
};

const tabs = [
  { key: "plan", label: "Plan", icon: "🗺️" },
  { key: "assistant", label: "Assistant", icon: "🧭" },
  { key: "follow", label: "Suivi", icon: "⏰" },
];

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

function today() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(dateStr, offset) {
  const d = new Date(dateStr || today());
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

function small(text, limit = 15) {
  if (!text) return "";
  return text.length <= limit ? text : `${text.slice(0, limit - 1)}…`;
}

function getInputStyle() {
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

function getAreaStyle() {
  return { ...getInputStyle(), minHeight: 88, resize: "vertical", fontFamily: "Arial, sans-serif" };
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

function ghost(active = false) {
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

function floatingButton(active = false) {
  return {
    background: active ? "#111827" : "rgba(255,255,255,0.9)",
    color: active ? "#fff" : "#111827",
    border: "1px solid rgba(15,23,42,0.10)",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 42,
    backdropFilter: "blur(8px)",
  };
}

function compactTool(active = false, color = "#111827") {
  return {
    background: active ? color : "#fff",
    color: active ? "#fff" : "#111827",
    border: active ? "1px solid transparent" : "1px solid #d1d5db",
    borderRadius: 12,
    padding: "8px 10px",
    fontWeight: 700,
    cursor: "pointer",
    minHeight: 38,
    fontSize: 13,
    boxShadow: active ? "0 8px 18px rgba(15,23,42,0.10)" : "none",
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

function makeSlot(extra = {}) {
  return {
    id: uid(),
    kind: "empty",
    plant: "",
    label: "",
    count: 0,
    sun: 2,
    exposure: "equilibre",
    note: "",
    ...extra,
  };
}

function buildGrid(rows, cols) {
  return Array.from({ length: rows * cols }, () => makeSlot());
}

function createPotager(name = "Potager principal") {
  return {
    id: uid(),
    name,
    rows: 4,
    cols: 4,
    slots: buildGrid(4, 4),
    reminders: [],
    actions: [],
    diagnosis: {
      photoDataUrl: "",
      photoName: "",
      orientation: "south",
      brightSide: "south",
      shadeSide: "north",
      windSide: "west",
      confidence: "moyenne",
      note: "",
    },
  };
}

function resizeGrid(slots, oldRows, oldCols, newRows, newCols) {
  const next = buildGrid(newRows, newCols);
  for (let r = 0; r < Math.min(oldRows, newRows); r += 1) {
    for (let c = 0; c < Math.min(oldCols, newCols); c += 1) {
      next[r * newCols + c] = { ...slots[r * oldCols + c] };
    }
  }
  return next;
}

function normalizePotager(raw, index = 0) {
  const rows = clamp(Number(raw?.rows || 4), 2, 16);
  const cols = clamp(Number(raw?.cols || 4), 2, 16);
  const baseSlots = Array.isArray(raw?.slots) ? raw.slots : buildGrid(rows, cols);
  const slots = resizeGrid(
    baseSlots.map((slot) =>
      makeSlot({
        kind: slotKinds[slot?.kind] ? slot.kind : "empty",
        plant: plants[slot?.plant] ? slot.plant : "",
        label: slot?.label || "",
        count: Number(slot?.count || 0),
        sun: clamp(Number(slot?.sun ?? 2), 0, 3),
        exposure: exposureSteps.some((x) => x.key === slot?.exposure) ? slot.exposure : "equilibre",
        note: slot?.note || "",
      })
    ),
    rows,
    cols,
    rows,
    cols
  );

  return {
    id: raw?.id || uid(),
    name: raw?.name || `Potager ${index + 1}`,
    rows,
    cols,
    slots,
    reminders: Array.isArray(raw?.reminders) ? raw.reminders : [],
    actions: Array.isArray(raw?.actions) ? raw.actions : [],
    diagnosis: {
      photoDataUrl: raw?.diagnosis?.photoDataUrl || "",
      photoName: raw?.diagnosis?.photoName || "",
      orientation: ["north", "south", "east", "west"].includes(raw?.diagnosis?.orientation) ? raw.diagnosis.orientation : "south",
      brightSide: ["north", "south", "east", "west"].includes(raw?.diagnosis?.brightSide) ? raw.diagnosis.brightSide : "south",
      shadeSide: ["north", "south", "east", "west"].includes(raw?.diagnosis?.shadeSide) ? raw.diagnosis.shadeSide : "north",
      windSide: ["north", "south", "east", "west"].includes(raw?.diagnosis?.windSide) ? raw.diagnosis.windSide : "west",
      confidence: raw?.diagnosis?.confidence || "moyenne",
      note: raw?.diagnosis?.note || "",
    },
  };
}

function getInitialData() {
  const fallback = createPotager("Potager principal");
  const saved = safeRead(STORAGE, null);
  if (!saved?.potagers?.length) {
    return { potagers: [fallback], activePotagerId: fallback.id };
  }
  const potagers = saved.potagers.map((x, i) => normalizePotager(x, i));
  const activePotagerId = potagers.some((x) => x.id === saved.activePotagerId) ? saved.activePotagerId : potagers[0].id;
  return { potagers, activePotagerId };
}

function getOrientationText(side) {
  if (side === "north") return "Nord";
  if (side === "south") return "Sud";
  if (side === "east") return "Est";
  return "Ouest";
}

function sideStrength(side, rowRatio, colRatio) {
  if (side === "south") return rowRatio;
  if (side === "north") return 1 - rowRatio;
  if (side === "east") return colRatio;
  return 1 - colRatio;
}

function computeSuggestedSun(index, rows, cols, diagnosis) {
  const row = Math.floor(index / cols);
  const col = index % cols;
  const rowRatio = rows <= 1 ? 0.5 : row / (rows - 1);
  const colRatio = cols <= 1 ? 0.5 : col / (cols - 1);
  const bright = sideStrength(diagnosis?.brightSide || "south", rowRatio, colRatio);
  const shade = sideStrength(diagnosis?.shadeSide || "north", rowRatio, colRatio);
  const wind = sideStrength(diagnosis?.windSide || "west", rowRatio, colRatio);
  const raw = 1.2 + bright * 2.1 - shade * 1.3 - wind * 0.3;
  return clamp(Math.round(raw), 0, 3);
}

function rankPlantsForSlot(index, rows, cols, diagnosis, weather) {
  const suggestedSun = computeSuggestedSun(index, rows, cols, diagnosis);
  return Object.entries(plants)
    .map(([key, plant]) => {
      let score = 100 - Math.abs(plant.sunNeed - suggestedSun) * 25;
      if (weather?.temperature >= 28 && suggestedSun >= 3 && (key === "salade" || key === "persil")) score -= 15;
      if (weather?.temperature <= 7 && (key === "piment" || key === "poivron" || key === "basilic")) score -= 10;
      if (diagnosis?.windSide && suggestedSun >= 3 && (key === "tomate" || key === "piment" || key === "poivron")) score += 2;
      return { key, score, suggestedSun };
    })
    .sort((a, b) => b.score - a.score);
}

function getSuggestionForSlot(index, potager, weather, draft) {
  const suggestedSun = computeSuggestedSun(index, potager.rows, potager.cols, potager.diagnosis);
  const ranked = rankPlantsForSlot(index, potager.rows, potager.cols, potager.diagnosis, weather);
  const best = ranked[0];
  const draftPlant = draft?.kind === "plant" && draft?.plant ? plants[draft.plant] : null;
  let verdict = "zone correcte";
  let detail = `Cette zone semble proche de ${suggestedSun}/3 en soleil.`;
  if (draftPlant) {
    const diff = draftPlant.sunNeed - suggestedSun;
    if (diff >= 2) verdict = "trop peu de soleil";
    else if (diff === 1) verdict = "plutôt juste";
    else if (diff <= -1) verdict = "plus ensoleillé que nécessaire";
    else verdict = "très cohérent";
    detail = `${draftPlant.name} aime ${draftPlant.sunNeed}/3. Ici, l'estimation est ${suggestedSun}/3.`;
  } else {
    detail = `La meilleure culture probable ici : ${plants[best.key].name}.`;
  }
  return {
    suggestedSun,
    bestKeys: ranked.slice(0, 3).map((x) => x.key),
    verdict,
    detail,
  };
}

function getPlanBackgroundThumbnail(slots, cols) {
  const colors = slots.slice(0, 40).map((slot) => {
    if (slot.kind === "plant" && plants[slot.plant]) return plants[slot.plant].color;
    return slotKinds[slot.kind]?.color || slotKinds.empty.color;
  });
  return `linear-gradient(135deg, ${colors.join(", ")})`;
}

function Metric({ icon, label, value, subtitle }) {
  return (
    <div style={metricStyle()}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: "#6b7280", marginTop: 4, fontSize: 13 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 30, marginTop: 6 }}>{value}</div>
      <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>{subtitle}</div>
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div style={cardStyle()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 20 }}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function StepPill({ index, current, label }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 10px",
      borderRadius: 999,
      background: current === index ? "#111827" : "#f3f4f6",
      color: current === index ? "#fff" : "#111827",
      fontWeight: 700,
      fontSize: 12,
    }}>
      <span>{index + 1}</span>
      <span>{label}</span>
    </div>
  );
}

// Repère 2/6 — éditeur flottant et mini composants
function SlotChip({ active, icon, label, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      ...ghost(active),
      display: "flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
      width: "100%",
      background: active ? color || "#e0e7ff" : "#fff",
    }}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function PlantBadge({ plantKey, active, onClick }) {
  const plant = plants[plantKey];
  return (
    <button onClick={onClick} style={{
      ...ghost(active),
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: active ? plant.color : "#fff",
      color: active ? "#111827" : "#111827",
      width: "100%",
      justifyContent: "center",
    }}>
      <span>{plant.icon}</span>
      <span>{plant.name}</span>
    </button>
  );
}

function SunDots({ sun }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: i <= sun - 1 ? "#f59e0b" : "#d1d5db",
          display: "inline-block",
        }} />
      ))}
    </div>
  );
}

function CompactPalette({
  mobile,
  paintMode,
  setPaintMode,
  draft,
  setDraft,
  selectedSlot,
  onTakeSelected,
  onEditSelected,
}) {
  const favoritePlants = ["tomate", "piment", "salade", "basilic"];
  return (
    <div style={{
      position: "sticky",
      top: 0,
      zIndex: 12,
      display: "grid",
      gap: 10,
      padding: 10,
      borderRadius: 18,
      border: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(10px)",
      boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
      marginBottom: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontWeight: 800 }}>Palette rapide</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setPaintMode(false)} style={compactTool(!paintMode, "#111827")}>✏️ Éditer</button>
          <button onClick={() => setPaintMode(true)} style={compactTool(paintMode, "#2563eb")}>🎨 Peindre</button>
          {selectedSlot ? <button onClick={onTakeSelected} style={compactTool(false)}>📋 Prendre modèle</button> : null}
          {selectedSlot ? <button onClick={onEditSelected} style={compactTool(false)}>🛠 Modifier</button> : null}
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>1. Type de case</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {quickKinds.map((key) => (
            <button
              key={key}
              onClick={() => setDraft((prev) => ({
                ...prev,
                kind: key,
                plant: key === "plant" ? (prev.plant || "tomate") : "",
                count: key === "plant" ? Math.max(1, Number(prev.count || 1)) : 0,
                label: key === "plant" ? (prev.label && plants[prev.plant] ? prev.label : plants[prev.plant || "tomate"].name) : slotKinds[key].label,
              }))}
              style={compactTool(draft.kind === key, "#0f766e")}
            >
              {slotKinds[key].icon} {slotKinds[key].label}
            </button>
          ))}
        </div>
      </div>

      {draft.kind === "plant" ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>2. Culture favorite</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {favoritePlants.map((key) => (
              <button key={key} onClick={() => setDraft((prev) => ({ ...prev, plant: key, label: plants[key].name }))} style={compactTool(draft.plant === key, plants[key].color)}>
                {plants[key].icon} {plants[key].name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>3. Soleil et quantité</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {exposureSteps.map((item) => (
            <button key={item.key} onClick={() => setDraft((prev) => ({ ...prev, exposure: item.key, sun: item.sun }))} style={compactTool(draft.exposure === item.key, "#f59e0b")}>
              {item.label}
            </button>
          ))}
          {draft.kind === "plant" ? (
            <>
              {[1,2,4,6].map((n) => (
                <button key={n} onClick={() => setDraft((prev) => ({ ...prev, count: n }))} style={compactTool(draft.count === n)}>{n} plants</button>
              ))}
            </>
          ) : null}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: "#6b7280" }}>
          {paintMode ? "Mode pinceau actif : clique une case pour poser immédiatement le modèle." : "Mode édition : clique une case pour ouvrir l’éditeur flottant."}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, borderRadius: 999, background: "#f8fafc", padding: "6px 10px", border: "1px solid #e5e7eb" }}>
          <span style={{ fontSize: 20 }}>{draft.kind === "plant" ? plants[draft.plant]?.icon : slotKinds[draft.kind]?.icon}</span>
          <strong style={{ fontSize: 13 }}>{draft.kind === "plant" ? plants[draft.plant]?.name : slotKinds[draft.kind]?.label}</strong>
          {draft.kind === "plant" ? <span style={{ fontSize: 12, color: "#6b7280" }}>× {draft.count}</span> : null}
          <SunDots sun={draft.sun} />
        </div>
      </div>
    </div>
  );
}

function FloatingBuilder({
  open,
  mobile,
  draft,
  setDraft,
  step,
  setStep,
  onApply,
  onCancel,
  onClear,
  suggestion,
  anchor,
  slotFilled,
}) {
  if (!open) return null;

  const panelWidth = mobile ? "calc(100vw - 24px)" : 340;
  const floatingStyle = mobile
    ? {
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 60,
        maxHeight: "78vh",
        overflow: "auto",
      }
    : {
        position: "absolute",
        left: anchor.left,
        top: anchor.top,
        zIndex: 50,
        width: panelWidth,
        maxHeight: 540,
        overflow: "auto",
      };

  const kindChosen = draft.kind && draft.kind !== "empty";
  const plantNeeded = draft.kind === "plant";
  const canGoToStep2 = kindChosen;
  const canGoToStep3 = !plantNeeded || !!draft.plant;
  const canFinish = canGoToStep3 && typeof draft.sun === "number";

  return (
    <div style={{ ...floatingStyle, background: "#fff", borderRadius: 20, boxShadow: "0 18px 60px rgba(0,0,0,0.18)", border: "1px solid rgba(15,23,42,0.08)" }}>
      <div style={{ padding: 14, borderBottom: "1px solid #e5e7eb", position: "sticky", top: 0, background: "#fff", zIndex: 2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{slotFilled ? "Modifier cette case" : "Créer cette case"}</div>
            <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>Tu peux soit régler ici, soit peindre directement avec la palette compacte.</div>
          </div>
          <button onClick={onCancel} style={ghost(false)}>Fermer</button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {["Type", "Culture", "Exposition", "Placement"].map((label, index) => (
            <StepPill key={label} index={index} current={step} label={label} />
          ))}
        </div>
      </div>

      <div style={{ padding: 14, display: "grid", gap: 14 }}>
        {step === 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700 }}>1. Quel genre de case veux-tu créer ?</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
              {quickKinds.map((key) => (
                <SlotChip
                  key={key}
                  active={draft.kind === key}
                  icon={slotKinds[key].icon}
                  label={slotKinds[key].label}
                  color={slotKinds[key].color}
                  onClick={() => setDraft((prev) => ({
                    ...prev,
                    kind: key,
                    plant: key === "plant" ? (prev.plant || "tomate") : "",
                    count: key === "plant" ? Math.max(1, Number(prev.count || 1)) : 0,
                    label: prev.label || (key === "plant" ? "" : slotKinds[key].label),
                  }))}
                />
              ))}
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700 }}>
              {plantNeeded ? "2. Quelle culture mets-tu ici ?" : "2. Nom ou note rapide de la case"}
            </div>
            {plantNeeded ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                {Object.keys(plants).map((key) => (
                  <PlantBadge key={key} plantKey={key} active={draft.plant === key} onClick={() => setDraft((prev) => ({ ...prev, plant: key, label: prev.label || plants[key].name }))} />
                ))}
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                <input value={draft.label} onChange={(e) => setDraft((prev) => ({ ...prev, label: e.target.value }))} style={getInputStyle()} placeholder={`Exemple : ${slotKinds[draft.kind].label}`} />
                <textarea value={draft.note} onChange={(e) => setDraft((prev) => ({ ...prev, note: e.target.value }))} style={getAreaStyle()} placeholder="Détail utile si besoin..." />
              </div>
            )}
          </div>
        ) : null}

        {step === 2 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700 }}>3. Quelle exposition pour cette case ?</div>
            <div style={{ display: "grid", gap: 10 }}>
              {exposureSteps.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setDraft((prev) => ({ ...prev, exposure: item.key, sun: item.sun }))}
                  style={{ ...ghost(draft.exposure === item.key), display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span>{item.label}</span>
                  <SunDots sun={item.sun} />
                </button>
              ))}
            </div>
            {draft.kind === "plant" ? (
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Combien de plants ?</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
                  {[1, 2, 3, 4, 6, 8, 10, 12].map((value) => (
                    <button key={value} onClick={() => setDraft((prev) => ({ ...prev, count: value }))} style={ghost(draft.count === value)}>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {step === 3 ? (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ fontWeight: 700 }}>4. Vérifie puis place</div>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, background: "#f8fafc" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 32 }}>
                  {draft.kind === "plant" ? plants[draft.plant]?.icon : slotKinds[draft.kind]?.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 800 }}>
                    {draft.kind === "plant" ? (draft.label || plants[draft.plant]?.name) : (draft.label || slotKinds[draft.kind]?.label)}
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>
                    {draft.kind === "plant" ? `${plants[draft.plant]?.name} • ${draft.count} plants` : slotKinds[draft.kind]?.label}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontSize: 13 }}>Exposition</span>
                <SunDots sun={draft.sun} />
              </div>
              {draft.note ? <div style={{ marginTop: 8, fontSize: 13, color: "#374151" }}>{draft.note}</div> : null}
            </div>

            {suggestion ? (
              <div style={{ border: "1px solid #dbeafe", borderRadius: 16, padding: 12, background: "#eff6ff" }}>
                <div style={{ fontWeight: 800 }}>Conseil IA pour ce point du plan</div>
                <div style={{ marginTop: 6, fontSize: 14 }}>{suggestion.verdict}</div>
                <div style={{ color: "#4b5563", marginTop: 6, fontSize: 13 }}>{suggestion.detail}</div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  Idées très cohérentes ici :{" "}
                  <strong>{suggestion.bestKeys.map((key) => plants[key].name).join(", ")}</strong>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {step > 0 ? <button onClick={() => setStep(step - 1)} style={ghost(false)}>Retour</button> : null}
            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={(step === 0 && !canGoToStep2) || (step === 1 && !canGoToStep3) || (step === 2 && !canFinish)}
                style={button("#111827")}
              >
                Suivant
              </button>
            ) : (
              <button onClick={onApply} disabled={!canFinish} style={button("#2563eb")}>
                Placer sur le plan
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {slotFilled ? <button onClick={onClear} style={button("#b91c1c")}>Vider</button> : null}
            <button onClick={onCancel} style={ghost(false)}>Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Repère 3/6 — composant principal et états
export default function App() {
  const initial = getInitialData();
  const [potagers, setPotagers] = useState(initial.potagers);
  const [activePotagerId, setActivePotagerId] = useState(initial.activePotagerId);
  const [weather, setWeather] = useState(null);
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
  const [activeTab, setActiveTab] = useState("plan");
  const [planFullscreen, setPlanFullscreen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderStep, setBuilderStep] = useState(0);
  const [builderAnchor, setBuilderAnchor] = useState({ left: 12, top: 12 });
  const [builderDraft, setBuilderDraft] = useState(makeSlot({ kind: "plant", plant: "tomate", count: 1, label: "Tomate" }));
  const [paintMode, setPaintMode] = useState(false);
  const [paintFlash, setPaintFlash] = useState(null);
  const [customSize, setCustomSize] = useState({ rows: 6, cols: 8 });
  const [photoMessage, setPhotoMessage] = useState("");
  const planRef = useRef(null);
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
      const next = createPotager("Potager principal");
      setPotagers([next]);
      setActivePotagerId(next.id);
      return;
    }
    if (!potagers.some((x) => x.id === activePotagerId)) {
      setActivePotagerId(potagers[0].id);
    }
  }, [potagers, activePotagerId]);

  const isMobile = screenWidth <= 940;
  const activePotager = useMemo(() => potagers.find((x) => x.id === activePotagerId) || potagers[0] || null, [potagers, activePotagerId]);

  function updateActivePotager(updater) {
    if (!activePotager) return;
    setPotagers((prev) =>
      prev.map((potager) => {
        if (potager.id !== activePotager.id) return potager;
        const next = updater(potager);
        return normalizePotager(next);
      })
    );
  }

  const rows = activePotager?.rows || 4;
  const cols = activePotager?.cols || 4;
  const slots = activePotager?.slots || buildGrid(4, 4);
  const selectedSlot = selectedIndex != null ? slots[selectedIndex] : null;

  const totals = useMemo(() => {
    const totalPlants = slots.reduce((sum, slot) => sum + Number(slot.kind === "plant" ? slot.count : 0), 0);
    const waterNeed = slots.reduce((sum, slot) => sum + Number(slot.kind === "plant" ? slot.count : 0) * Number(plants[slot.plant]?.water || 0), 0);
    const harvestEstimate = slots.reduce((sum, slot) => sum + Number(slot.kind === "plant" ? slot.count : 0) * Number(plants[slot.plant]?.yield || 0), 0);
    return {
      totalPlants,
      waterNeed: waterNeed.toFixed(1),
      harvestEstimate: harvestEstimate.toFixed(1),
    };
  }, [slots]);

  const dueReminders = useMemo(() => {
    const now = new Date();
    return (activePotager?.reminders || []).map((reminder) => ({
      ...reminder,
      statusLabel: reminder.done ? "Terminé" : new Date(reminder.dueDate) < now ? "En retard" : "À venir",
    }));
  }, [activePotager]);

  const planWidgetBackground = useMemo(() => getPlanBackgroundThumbnail(slots, cols), [slots, cols]);

  function normalizeDraftForPlacement(draft) {
    return makeSlot({
      ...draft,
      kind: draft.kind,
      plant: draft.kind === "plant" ? draft.plant : "",
      label:
        draft.kind === "plant"
          ? draft.label || plants[draft.plant]?.name || ""
          : draft.label || slotKinds[draft.kind]?.label || "",
      count: draft.kind === "plant" ? Math.max(1, Number(draft.count || 1)) : 0,
      sun: clamp(Number(draft.sun ?? 2), 0, 3),
      exposure: draft.exposure || "equilibre",
      note: draft.note || "",
    });
  }

  function applyDraftAtIndex(index, overrideDraft = null) {
    const source = overrideDraft || builderDraft;
    updateActivePotager((potager) => {
      const nextSlots = [...potager.slots];
      nextSlots[index] = normalizeDraftForPlacement(source);
      return { ...potager, slots: nextSlots };
    });
    setSelectedIndex(index);
    setPaintFlash(index);
    setTimeout(() => setPaintFlash((current) => (current === index ? null : current)), 450);
  }

  function takeSelectedAsBrush() {
    if (!selectedSlot || selectedIndex == null) return;
    setBuilderDraft({ ...selectedSlot, id: uid() });
    setPaintMode(true);
    setBuilderOpen(false);
  }

  function openBuilderForSlot(index, event) {

    setSelectedIndex(index);
    const slot = slots[index];
    const baseDraft =
      slot.kind === "empty"
        ? makeSlot({ kind: "plant", plant: "tomate", count: 1, label: "Tomate", sun: computeSuggestedSun(index, rows, cols, activePotager.diagnosis), exposure: "equilibre" })
        : { ...slot };
    setBuilderDraft(baseDraft);
    setBuilderStep(0);
    setBuilderOpen(true);

    if (planRef.current && event?.currentTarget) {
      const box = planRef.current.getBoundingClientRect();
      const target = event.currentTarget.getBoundingClientRect();
      const width = 340;
      const height = 460;
      const left = clamp(target.left - box.left + 6, 12, Math.max(12, box.width - width - 12));
      const top = clamp(target.top - box.top + target.height + 8, 12, Math.max(12, box.height - height - 12));
      setBuilderAnchor({ left, top });
    } else {
      setBuilderAnchor({ left: 12, top: 12 });
    }
  }

  function closeBuilder() {
    setBuilderOpen(false);
  }

  function applyBuilderToSelected() {
    if (selectedIndex == null) return;
    applyDraftAtIndex(selectedIndex);
    setBuilderOpen(false);
  }

  function clearSelectedSlot() {
    if (selectedIndex == null) return;
    updateActivePotager((potager) => {
      const nextSlots = [...potager.slots];
      nextSlots[selectedIndex] = makeSlot();
      return { ...potager, slots: nextSlots };
    });
    setBuilderOpen(false);
  }

  function createPotagerAction() {
    const next = createPotager(`Potager ${potagers.length + 1}`);
    setPotagers((prev) => [...prev, next]);
    setActivePotagerId(next.id);
  }

  function duplicatePotager() {
    if (!activePotager) return;
    const next = normalizePotager({ ...activePotager, id: uid(), name: `${activePotager.name} copie` });
    setPotagers((prev) => [...prev, next]);
    setActivePotagerId(next.id);
  }

  function deletePotager() {
    if (!activePotager || potagers.length <= 1) return;
    const next = potagers.filter((x) => x.id !== activePotager.id);
    setPotagers(next);
    setActivePotagerId(next[0].id);
  }

  function applyPreset(rowsValue, colsValue) {
    updateActivePotager((potager) => ({
      ...potager,
      rows: rowsValue,
      cols: colsValue,
      slots: resizeGrid(potager.slots, potager.rows, potager.cols, rowsValue, colsValue),
    }));
    setSelectedIndex(null);
    setBuilderOpen(false);
  }

  function growPlan(addRows, addCols) {
    updateActivePotager((potager) => {
      const rowsValue = clamp(potager.rows + addRows, 2, 16);
      const colsValue = clamp(potager.cols + addCols, 2, 16);
      return {
        ...potager,
        rows: rowsValue,
        cols: colsValue,
        slots: resizeGrid(potager.slots, potager.rows, potager.cols, rowsValue, colsValue),
      };
    });
  }

  function createRemindersForAction(actionType) {
    if (selectedIndex == null || !selectedSlot || selectedSlot.kind !== "plant") return;
    const template = actionTemplates[actionType];
    const actionDate = today();
    const slotTitle = selectedSlot.label || plants[selectedSlot.plant]?.name || "Culture";
    const newAction = {
      id: uid(),
      type: actionType,
      date: actionDate,
      slotIndex: selectedIndex,
      slotTitle,
      plant: selectedSlot.plant,
      count: selectedSlot.count,
    };
    const generated = template.reminders.map((item) => ({
      id: uid(),
      actionId: newAction.id,
      title: `${template.icon} ${item.title}`,
      dueDate: addDaysISO(actionDate, item.offset),
      plant: selectedSlot.plant,
      count: selectedSlot.count,
      slotTitle,
      average: item.average,
      signs: item.signs,
      advice: item.advice,
      done: false,
    }));
    updateActivePotager((potager) => ({
      ...potager,
      actions: [newAction, ...potager.actions],
      reminders: [...generated, ...potager.reminders],
    }));
  }

  function toggleReminderDone(id) {
    updateActivePotager((potager) => ({
      ...potager,
      reminders: potager.reminders.map((reminder) => (reminder.id === id ? { ...reminder, done: !reminder.done } : reminder)),
    }));
  }

  function handlePhotoImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateActivePotager((potager) => ({
        ...potager,
        diagnosis: {
          ...potager.diagnosis,
          photoDataUrl: String(reader.result || ""),
          photoName: file.name,
        },
      }));
      setPhotoMessage("Photo ajoutée. Tu peux maintenant affiner le diagnostic avec les curseurs ci-dessous.");
      event.target.value = "";
    };
    reader.readAsDataURL(file);
  }

  const suggestion = useMemo(() => {
    if (selectedIndex == null || !activePotager) return null;
    return getSuggestionForSlot(selectedIndex, activePotager, weather, builderDraft);
  }, [selectedIndex, activePotager, weather, builderDraft]);

  const planContent = (
    <Card
      title="🗺️ Plan du jardin"
      right={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setPlanFullscreen((x) => !x)} style={floatingButton(false)}>
            {planFullscreen ? "Quitter le plein écran" : "Plein écran"}
          </button>
        </div>
      }
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {presets.map((preset) => (
            <button key={preset.key} onClick={() => applyPreset(preset.rows, preset.cols)} style={ghost(rows === preset.rows && cols === preset.cols)}>
              {preset.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))", gap: 10 }}>
          <label>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Lignes</div>
            <input type="number" min={2} max={16} value={customSize.rows} onChange={(e) => setCustomSize((prev) => ({ ...prev, rows: clamp(Number(e.target.value || 2), 2, 16) }))} style={getInputStyle()} />
          </label>
          <label>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Colonnes</div>
            <input type="number" min={2} max={16} value={customSize.cols} onChange={(e) => setCustomSize((prev) => ({ ...prev, cols: clamp(Number(e.target.value || 2), 2, 16) }))} style={getInputStyle()} />
          </label>
          <div style={{ display: "flex", alignItems: "end" }}>
            <button onClick={() => applyPreset(customSize.rows, customSize.cols)} style={button("#2563eb")}>Appliquer la taille</button>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "end", flexWrap: "wrap" }}>
            <button onClick={() => growPlan(1, 0)} style={ghost(false)}>+1 ligne</button>
            <button onClick={() => growPlan(0, 1)} style={ghost(false)}>+1 colonne</button>
          </div>
        </div>

        <div style={{ position: "relative", borderRadius: 22, border: "2px dashed #cbd5e1", background: "linear-gradient(180deg,#f8fbff 0%, #eef5f8 100%)", padding: 14 }}>
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 800 }}>Construis comme un jeu</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>
                Choisis ton modèle dans la palette, puis clique une case pour peindre. En mode édition, clique une case pour ouvrir l’éditeur flottant exactement dessus.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Plan {rows} × {cols}</span>
              <span style={{ fontSize: 13, color: paintMode ? "#2563eb" : "#6b7280", fontWeight: 700 }}>{paintMode ? "Mode pinceau" : "Mode édition"}</span>
            </div>
          </div>

          <CompactPalette
            mobile={isMobile}
            paintMode={paintMode}
            setPaintMode={setPaintMode}
            draft={builderDraft}
            setDraft={setBuilderDraft}
            selectedSlot={selectedSlot}
            onTakeSelected={takeSelectedAsBrush}
            onEditSelected={() => {
              if (selectedIndex != null) {
                setPaintMode(false);
                setBuilderOpen(true);
                setBuilderStep(3);
              }
            }}
          />

          <div ref={planRef} style={{ position: "relative", overflow: "auto", maxHeight: planFullscreen ? "calc(100vh - 280px)" : 560 }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(${isMobile ? 110 : 128}px, 1fr))`, gap: 10, minWidth: "max-content", padding: 4 }}>
              {slots.map((slot, index) => {
                const selected = index === selectedIndex;
                const slotColor = slot.kind === "plant" && plants[slot.plant] ? plants[slot.plant].color : slotKinds[slot.kind]?.color || slotKinds.empty.color;
                const slotTitle = slot.kind === "plant" ? (slot.label || plants[slot.plant]?.name || "Culture") : (slot.label || slotKinds[slot.kind]?.label || "Vide");
                const showGhostPreview = paintMode && builderDraft.kind && builderDraft.kind !== "empty";
                const emptySlot = slot.kind === "empty";
                return (
                  <button
                    key={`${index}-${slot.id}`}
                    onClick={(e) => openBuilderForSlot(index, e)}
                    style={{
                      background: slotColor,
                      borderRadius: 18,
                      border: selected ? "3px solid #111827" : paintFlash === index ? "3px solid #2563eb" : "1px solid rgba(15,23,42,0.08)",
                      minHeight: isMobile ? 110 : 126,
                      padding: 10,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "start",
                      justifyContent: "space-between",
                      textAlign: "left",
                      cursor: "pointer",
                      boxShadow: selected ? "0 10px 24px rgba(0,0,0,0.16)" : "0 8px 18px rgba(15,23,42,0.08)",
                      color: slot.kind === "shade" ? "#fff" : "#111827",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {showGhostPreview && emptySlot ? (
                      <div style={{
                        position: "absolute",
                        inset: 8,
                        borderRadius: 14,
                        border: "2px dashed rgba(37,99,235,0.55)",
                        background: "rgba(255,255,255,0.45)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 4,
                        pointerEvents: "none",
                      }}>
                        <div style={{ fontSize: 22, opacity: 0.9 }}>{builderDraft.kind === "plant" ? plants[builderDraft.plant]?.icon : slotKinds[builderDraft.kind]?.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 800 }}>{builderDraft.kind === "plant" ? plants[builderDraft.plant]?.name : slotKinds[builderDraft.kind]?.label}</div>
                        {builderDraft.kind === "plant" ? <div style={{ fontSize: 10, color: "#334155" }}>× {builderDraft.count}</div> : null}
                      </div>
                    ) : null}

                    <div style={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 28, zIndex: 1 }}>
                        {slot.kind === "plant" ? plants[slot.plant]?.icon : slotKinds[slot.kind]?.icon}
                      </span>
                      <div style={{ zIndex: 1 }}><SunDots sun={slot.sun} /></div>
                    </div>
                    <div style={{ width: "100%", zIndex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{small(slotTitle, 18)}</div>
                      <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>
                        {slot.kind === "plant" ? `${plants[slot.plant]?.name || ""} • ${slot.count}` : slotKinds[slot.kind]?.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <FloatingBuilder
              open={builderOpen}
              mobile={isMobile}
              draft={builderDraft}
              setDraft={setBuilderDraft}
              step={builderStep}
              setStep={setBuilderStep}
              onApply={applyBuilderToSelected}
              onCancel={closeBuilder}
              onClear={clearSelectedSlot}
              suggestion={suggestion}
              anchor={builderAnchor}
              slotFilled={selectedSlot?.kind !== "empty"}
            />
          </div>
        </div>
      </div>
    </Card>
  );

  // Repère 4/6 — panneaux assistant, case et suivi
  const assistantPanel = (
    <div style={{ display: "grid", gap: 16 }}>
      <Card title="🧭 Diagnostic jardin">
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => photoRef.current?.click()} style={button("#7c3aed")}>Ajouter une photo</button>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoImport} />
            {activePotager?.diagnosis?.photoName ? <span style={{ alignSelf: "center", color: "#6b7280", fontSize: 13 }}>{activePotager.diagnosis.photoName}</span> : null}
          </div>
          {photoMessage ? <div style={{ color: "#4338ca", fontSize: 13 }}>{photoMessage}</div> : null}
          {activePotager?.diagnosis?.photoDataUrl ? (
            <img src={activePotager.diagnosis.photoDataUrl} alt="Photo jardin" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", objectFit: "cover", maxHeight: 220 }} />
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: 10 }}>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Orientation générale</div>
              <select value={activePotager?.diagnosis?.orientation || "south"} onChange={(e) => updateActivePotager((potager) => ({ ...potager, diagnosis: { ...potager.diagnosis, orientation: e.target.value } }))} style={getInputStyle()}>
                <option value="north">Nord</option>
                <option value="south">Sud</option>
                <option value="east">Est</option>
                <option value="west">Ouest</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Côté le plus lumineux</div>
              <select value={activePotager?.diagnosis?.brightSide || "south"} onChange={(e) => updateActivePotager((potager) => ({ ...potager, diagnosis: { ...potager.diagnosis, brightSide: e.target.value } }))} style={getInputStyle()}>
                <option value="north">Nord</option>
                <option value="south">Sud</option>
                <option value="east">Est</option>
                <option value="west">Ouest</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Côté le plus ombré</div>
              <select value={activePotager?.diagnosis?.shadeSide || "north"} onChange={(e) => updateActivePotager((potager) => ({ ...potager, diagnosis: { ...potager.diagnosis, shadeSide: e.target.value } }))} style={getInputStyle()}>
                <option value="north">Nord</option>
                <option value="south">Sud</option>
                <option value="east">Est</option>
                <option value="west">Ouest</option>
              </select>
            </label>
            <label>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Vent dominant</div>
              <select value={activePotager?.diagnosis?.windSide || "west"} onChange={(e) => updateActivePotager((potager) => ({ ...potager, diagnosis: { ...potager.diagnosis, windSide: e.target.value } }))} style={getInputStyle()}>
                <option value="north">Nord</option>
                <option value="south">Sud</option>
                <option value="east">Est</option>
                <option value="west">Ouest</option>
              </select>
            </label>
          </div>

          <textarea
            value={activePotager?.diagnosis?.note || ""}
            onChange={(e) => updateActivePotager((potager) => ({ ...potager, diagnosis: { ...potager.diagnosis, note: e.target.value } }))}
            style={getAreaStyle()}
            placeholder="Exemple : mur haut au nord, soleil fort à droite dès midi, vent latéral fréquent..."
          />
        </div>
      </Card>

      <Card title="🤖 Conseils immédiats">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ border: "1px solid #dbeafe", borderRadius: 16, background: "#eff6ff", padding: 12 }}>
            <div style={{ fontWeight: 800 }}>Lecture synthétique</div>
            <div style={{ marginTop: 6, fontSize: 14 }}>
              Orientation déclarée : <strong>{getOrientationText(activePotager?.diagnosis?.orientation || "south")}</strong> • côté lumineux : <strong>{getOrientationText(activePotager?.diagnosis?.brightSide || "south")}</strong> • côté ombré : <strong>{getOrientationText(activePotager?.diagnosis?.shadeSide || "north")}</strong>.
            </div>
            <div style={{ marginTop: 6, color: "#4b5563", fontSize: 13 }}>
              L’IA se base sur ces informations, la photo fournie et la météo du moment pour recommander les emplacements.
            </div>
          </div>
          {weather ? (
            <div style={{ border: "1px solid #fde68a", borderRadius: 16, background: "#fffbeb", padding: 12 }}>
              <div style={{ fontWeight: 800 }}>Météo locale</div>
              <div style={{ marginTop: 6 }}>{CITY} • {weather.temperature}°C • vent {weather.windspeed} km/h</div>
              <div style={{ marginTop: 6, fontSize: 13, color: "#4b5563" }}>
                {weather.temperature >= 28 ? "Forte chaleur : attention aux zones les plus exposées." : null}
                {weather.temperature < 8 ? " Températures fraîches : prudence pour basilic, piment, poivron." : null}
                {weather.windspeed >= 30 ? " Vent sensible : prévoir protection ou tuteurage." : null}
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );

  const casePanel = (
    <Card title="📌 Case sélectionnée">
      {selectedSlot ? (
        <div style={{ display: "grid", gap: 12 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, background: "#f8fafc" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 34 }}>{selectedSlot.kind === "plant" ? plants[selectedSlot.plant]?.icon : slotKinds[selectedSlot.kind]?.icon}</div>
              <div>
                <div style={{ fontWeight: 800 }}>{selectedSlot.kind === "plant" ? (selectedSlot.label || plants[selectedSlot.plant]?.name) : (selectedSlot.label || slotKinds[selectedSlot.kind]?.label)}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>
                  {selectedSlot.kind === "plant" ? `${plants[selectedSlot.plant]?.name} • ${selectedSlot.count} plants` : slotKinds[selectedSlot.kind]?.label}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <span style={{ color: "#6b7280", fontSize: 13 }}>Exposition</span>
              <SunDots sun={selectedSlot.sun} />
            </div>
            {selectedSlot.note ? <div style={{ marginTop: 8, fontSize: 13 }}>{selectedSlot.note}</div> : null}
          </div>

          {selectedSlot.kind === "plant" && suggestion ? (
            <div style={{ border: "1px solid #dbeafe", borderRadius: 16, padding: 12, background: "#eff6ff" }}>
              <div style={{ fontWeight: 800 }}>Suggestion de placement</div>
              <div style={{ marginTop: 6 }}>{suggestion.verdict}</div>
              <div style={{ color: "#4b5563", fontSize: 13, marginTop: 6 }}>{suggestion.detail}</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>
                Alternatives très adaptées ici : <strong>{suggestion.bestKeys.map((key) => plants[key].name).join(", ")}</strong>
              </div>
            </div>
          ) : null}

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => { setPaintMode(false); setBuilderOpen(true); setBuilderStep(3); }} style={button("#2563eb")}>Modifier sur le plan</button>
            <button onClick={takeSelectedAsBrush} style={button("#0f766e")}>Dupliquer comme pinceau</button>
            <button onClick={clearSelectedSlot} style={button("#b91c1c")}>Vider</button>
          </div>

          {selectedSlot.kind === "plant" ? (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 800 }}>Actions de suivi</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
                {Object.entries(actionTemplates).map(([key, value]) => (
                  <button key={key} onClick={() => createRemindersForAction(key)} style={ghost(false)}>
                    {value.icon} {value.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ color: "#6b7280" }}>Clique une case pour la créer ou la modifier directement sur le plan.</div>
      )}
    </Card>
  );

  const followPanel = (
    <div style={{ display: "grid", gap: 16 }}>
      <Card title="⏰ Rappels">
        {dueReminders.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {dueReminders.map((reminder) => (
              <div key={reminder.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, padding: 12, background: reminder.done ? "#f0fdf4" : "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{reminder.title}</div>
                    <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
                      {plants[reminder.plant]?.name} • {reminder.count} plants • {reminder.slotTitle}
                    </div>
                  </div>
                  <button onClick={() => toggleReminderDone(reminder.id)} style={ghost(reminder.done)}>
                    {reminder.done ? "Fait" : "À faire"}
                  </button>
                </div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <strong>Échéance :</strong> {formatDate(reminder.dueDate)} • <strong>Délai moyen :</strong> {reminder.average}
                </div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <strong>Signes :</strong> {reminder.signs.join(", ")}
                </div>
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <strong>Conseil :</strong> {reminder.advice}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: "#6b7280" }}>Pas encore de rappels. Valide une action sur une case de culture pour lancer le suivi intelligent.</div>
        )}
      </Card>

      <Card title="🧱 Widget plan">
        <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid #e5e7eb" }}>
          <div style={{ height: 120, background: planWidgetBackground }} />
          <div style={{ padding: 12, background: "#fff" }}>
            <div style={{ fontWeight: 800 }}>{activePotager?.name}</div>
            <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>Le plan validé reste visible comme fond stylisé léger, sans être invasif.</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const desktopLayout = (
    <div style={{ display: "grid", gridTemplateColumns: planFullscreen ? "1fr" : "minmax(840px, 1fr) 380px", gap: 20, alignItems: "start" }}>
      <div style={{ display: "grid", gap: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(180px, 1fr))", gap: 14 }}>
          <Metric icon="🌿" label="Plants au total" value={totals.totalPlants} subtitle="Toutes zones de culture" />
          <Metric icon="💧" label="Arrosage estimé" value={`${totals.waterNeed} L`} subtitle="Par jour environ" />
          <Metric icon="🧺" label="Récolte potentielle" value={`${totals.harvestEstimate} kg`} subtitle="Estimation grossière" />
        </div>
        {planContent}
      </div>
      {!planFullscreen ? (
        <div style={{ display: "grid", gap: 16 }}>
          {assistantPanel}
          {casePanel}
          {followPanel}
        </div>
      ) : null}
    </div>
  );

  // Repère 5/6 — rendu principal
  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "linear-gradient(180deg, #eef5f8 0%, #f7fafc 100%)", minHeight: "100vh", padding: isMobile ? 12 : 24, color: "#111827", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1640, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "center", gap: 14, flexWrap: "wrap", marginBottom: 16, position: "sticky", top: 0, zIndex: 20, background: "rgba(238,245,248,0.92)", backdropFilter: "blur(8px)", padding: "6px 0 8px" }}>
          <div style={{ flex: "1 1 340px" }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 28 : 42 }}>🌱 Potager Builder 2.2.4</h1>
            <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.4 }}>
              Palette compacte + mode pinceau + prévisualisation avant pose.
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={activePotagerId} onChange={(e) => setActivePotagerId(e.target.value)} style={{ ...getInputStyle(), minWidth: 180 }}>
              {potagers.map((potager) => (
                <option key={potager.id} value={potager.id}>{potager.name}</option>
              ))}
            </select>
            <button onClick={createPotagerAction} style={button("#2563eb")}>Nouveau</button>
            <button onClick={duplicatePotager} style={button("#0f766e")}>Dupliquer</button>
            <button onClick={deletePotager} disabled={potagers.length <= 1} style={button(potagers.length <= 1 ? "#9ca3af" : "#b91c1c")}>Supprimer</button>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <input value={activePotager?.name || ""} onChange={(e) => updateActivePotager((potager) => ({ ...potager, name: e.target.value }))} style={{ ...getInputStyle(), maxWidth: 420 }} placeholder="Nom du potager" />
        </div>

        {isMobile ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8, marginBottom: 14 }}>
              {tabs.map((tab) => (
                <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={ghost(activeTab === tab.key)}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
                <Metric icon="🌿" label="Plants" value={totals.totalPlants} subtitle="Total" />
                <Metric icon="💧" label="Arrosage" value={`${totals.waterNeed} L`} subtitle="Jour" />
                <Metric icon="🧺" label="Récolte" value={`${totals.harvestEstimate} kg`} subtitle="Est." />
              </div>
              {activeTab === "plan" ? planContent : null}
              {activeTab === "assistant" ? assistantPanel : null}
              {activeTab === "assistant" ? casePanel : null}
              {activeTab === "follow" ? followPanel : null}
            </div>
          </>
        ) : (
          desktopLayout
        )}
      </div>
    </div>
  );
}

// Repère 6/6 — fin du fichier
