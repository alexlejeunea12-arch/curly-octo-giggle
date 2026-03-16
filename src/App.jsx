import React, { useEffect, useMemo, useRef, useState } from "react";

// Repère 1/6 — constantes, helpers et thèmes
const STORAGE_KEY = "potager_v34_control_tower";

const structures = {
  none: { label: "Vide", icon: "·", color: "rgba(255,255,255,0.06)", border: "rgba(255,255,255,0.10)" },
  soil: { label: "Culture", icon: "▦", color: "rgba(88, 58, 35, 0.50)", border: "rgba(255,214,170,0.18)" },
  path: { label: "Allée", icon: "⋯", color: "rgba(145, 133, 123, 0.42)", border: "rgba(255,255,255,0.12)" },
  wall: { label: "Mur", icon: "▌", color: "rgba(67, 79, 110, 0.65)", border: "rgba(171,194,255,0.18)" },
  fence: { label: "Clôture", icon: "║", color: "rgba(109, 76, 51, 0.50)", border: "rgba(255,219,180,0.20)" },
  terrace: { label: "Terrasse", icon: "▤", color: "rgba(94, 77, 61, 0.55)", border: "rgba(255,225,194,0.20)" },
  grass: { label: "Pelouse", icon: "✦", color: "rgba(44, 116, 63, 0.44)", border: "rgba(170,255,190,0.16)" },
  greenhouse: { label: "Serre", icon: "△", color: "rgba(78, 150, 162, 0.46)", border: "rgba(170,255,255,0.20)" },
  shade: { label: "Ombre", icon: "◐", color: "rgba(51, 59, 88, 0.62)", border: "rgba(210,210,255,0.16)" },
};

const crops = {
  none: { label: "Aucune", icon: "", color: "transparent", sunMin: 0, sunMax: 3, pot: false },
  tomato: { label: "Tomate", icon: "🍅", color: "#ff7367", sunMin: 2, sunMax: 3, pot: true },
  cherry: { label: "Tomate cerise", icon: "🍅", color: "#ff9d7e", sunMin: 2, sunMax: 3, pot: true },
  pepper: { label: "Poivron", icon: "🫑", color: "#ffc14d", sunMin: 2, sunMax: 3, pot: true },
  chili: { label: "Piment", icon: "🌶️", color: "#ff5c5c", sunMin: 2, sunMax: 3, pot: true },
  lettuce: { label: "Laitue", icon: "🥬", color: "#86e57c", sunMin: 1, sunMax: 2, pot: false },
  basil: { label: "Basilic", icon: "🌿", color: "#70e8a2", sunMin: 2, sunMax: 3, pot: true },
  parsley: { label: "Persil", icon: "🌱", color: "#7ed27c", sunMin: 1, sunMax: 2, pot: true },
  flowers: { label: "Fleurs utiles", icon: "🌼", color: "#ffe471", sunMin: 1, sunMax: 3, pot: true },
  strawberry: { label: "Fraise", icon: "🍓", color: "#ff7ca9", sunMin: 2, sunMax: 3, pot: true },
};

const screenDefs = {
  hub: { label: "Tour de contrôle", icon: "✦" },
  diagnostic: { label: "Diagnostic", icon: "◎" },
  structure: { label: "Structure", icon: "▦" },
  planting: { label: "Planter", icon: "❋" },
  pots: { label: "Pots", icon: "◉" },
  follow: { label: "Suivi", icon: "↻" },
};

const templates = {
  compact: { label: "Compact 4×4", rows: 4, cols: 4 },
  square: { label: "Carré 6×6", rows: 6, cols: 6 },
  long: { label: "Long 4×10", rows: 4, cols: 10 },
  big: { label: "Grand 8×10", rows: 8, cols: 10 },
};

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function makeCell(index, row, col) {
  return {
    id: uid(),
    index,
    row,
    col,
    structure: "none",
    crop: "none",
    sun: 2,
    note: "",
    potIds: [],
  };
}

function buildGrid(rows, cols) {
  return Array.from({ length: rows * cols }, (_, index) => makeCell(index, Math.floor(index / cols), index % cols));
}

function templateGrid(name) {
  const t = templates[name] || templates.compact;
  return { rows: t.rows, cols: t.cols, cells: buildGrid(t.rows, t.cols) };
}

function makePot(diameter = 30) {
  return {
    id: uid(),
    diameter,
    cropSuggestion: suggestPotCrop(diameter),
    placedOn: null,
  };
}

function suggestPotCrop(diameter) {
  if (diameter <= 20) return "basil";
  if (diameter <= 30) return "strawberry";
  return "tomato";
}

function suggestCellScore(cell, state) {
  let score = 0;
  const crop = crops[state.builder.crop] || crops.none;
  if (cell.structure === "soil" || cell.structure === "none" || cell.structure === "grass") score += 2;
  if (cell.structure === "path" || cell.structure === "terrace" || cell.structure === "wall") score -= 4;
  if (cell.sun >= crop.sunMin && cell.sun <= crop.sunMax) score += 6;
  if (cell.sun < crop.sunMin) score -= 3;
  if (cell.structure === "greenhouse" && ["tomato", "chili", "pepper"].includes(state.builder.crop)) score += 2;
  if (cell.structure === "shade" && ["lettuce", "parsley"].includes(state.builder.crop)) score += 2;
  if (cell.crop !== "none") score -= 1;
  return score;
}

function labelFromCell(cell) {
  return `Case ${cell.row + 1}.${cell.col + 1}`;
}

function saveSnapshot(state) {
  return {
    version: 34,
    savedAt: new Date().toISOString(),
    plan: state.plan,
    pots: state.pots,
    reminders: state.reminders,
    photo: state.photo,
  };
}

function loadInitial() {
  const fallbackPlan = templateGrid("square");
  const fallback = {
    currentScreen: "hub",
    plan: fallbackPlan,
    selectedCellId: null,
    builder: { structure: "soil", crop: "none", sun: 2, note: "" },
    brush: null,
    pots: [],
    pendingPotIds: [],
    reminders: [
      { id: uid(), level: "today", label: "Observer la reprise des tomates", due: "Aujourd’hui" },
      { id: uid(), level: "watch", label: "Vérifier le vent sur les jeunes plants", due: "Ce soir" },
    ],
    ai: {
      orientation: "Sud-est estimé",
      summary: "Le côté bas-droit semble plus lumineux ; garder salades et persil en zone plus calme.",
      confidence: "Moyenne",
      primaryAdvice: "Déplacer 2 pots vers la zone sud-est.",
    },
    photo: null,
    weather: { temp: 18, wind: 14, text: "Nuit douce" },
    saveState: { dirty: false, savedAt: null },
    infoOpen: null,
    contextCellId: null,
  };
  return safeRead(STORAGE_KEY, fallback);
}

function GlowInfoButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 24,
        height: 24,
        borderRadius: 999,
        border: "1px solid rgba(180,200,255,0.24)",
        background: "rgba(255,255,255,0.08)",
        color: "#f3f6ff",
        fontSize: 13,
        cursor: "pointer",
      }}
      title="Information"
    >
      i
    </button>
  );
}

// Repère 2/6 — styles et composants visuels
const css = `
*{box-sizing:border-box}
html,body,#root{margin:0;min-height:100%;background:#050b18;color:#eef3ff;font-family:Inter,Arial,sans-serif}
button,input,select,textarea{font:inherit}
body{overflow:auto}
@keyframes floaty{0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}
@keyframes pulseGlow{0%,100%{opacity:.35}50%{opacity:.75}}
@keyframes drift{0%{transform:translate3d(0,0,0)}50%{transform:translate3d(15px,-12px,0)}100%{transform:translate3d(0,0,0)}}
@keyframes firefly{0%{transform:translateY(0) scale(1);opacity:.12}50%{transform:translateY(-14px) scale(1.12);opacity:.9}100%{transform:translateY(0) scale(1);opacity:.2}}
.potager-shell{position:relative;min-height:100vh;overflow:hidden;background:
radial-gradient(circle at 20% 15%, rgba(86,126,255,.18), transparent 20%),
radial-gradient(circle at 75% 18%, rgba(255,183,99,.16), transparent 18%),
radial-gradient(circle at 50% 70%, rgba(60,255,220,.08), transparent 22%),
linear-gradient(180deg,#071227 0%,#09172f 35%,#0a1225 65%,#060a12 100%)}
.back-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.blob{position:absolute;border-radius:999px;filter:blur(40px);opacity:.45;animation:drift 12s ease-in-out infinite}
.blob.a{width:280px;height:280px;left:6%;top:8%;background:rgba(111,85,255,.28)}
.blob.b{width:220px;height:220px;right:8%;top:20%;background:rgba(255,177,102,.18);animation-duration:14s}
.blob.c{width:320px;height:320px;left:35%;bottom:8%;background:rgba(48,220,195,.11);animation-duration:16s}
.firefly{position:absolute;width:6px;height:6px;border-radius:50%;background:#ffddb1;box-shadow:0 0 14px #ffddb1,0 0 30px rgba(255,231,170,.4);animation:firefly 6s ease-in-out infinite}
.main-wrap{position:relative;z-index:2;max-width:1460px;margin:0 auto;padding:28px 20px 34px}
.glass{background:linear-gradient(180deg,rgba(12,22,43,.72),rgba(8,12,24,.74));backdrop-filter:blur(14px);border:1px solid rgba(157,190,255,.14);box-shadow:0 18px 50px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.04)}
.panel{border-radius:26px}
.title{font-size:48px;letter-spacing:.08em;font-weight:800;text-transform:uppercase}
.subtitle{color:#adc2e9;opacity:.95;line-height:1.45}
.topbar{display:grid;grid-template-columns:1.35fr .9fr;gap:18px;align-items:stretch}
.quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.quick-card{padding:16px 18px;border-radius:20px;min-height:112px;cursor:pointer;transition:.22s transform,.22s box-shadow,.22s border-color}
.quick-card:hover{transform:translateY(-2px);box-shadow:0 16px 34px rgba(0,0,0,.25)}
.quick-card h4{margin:0 0 8px;font-size:16px;letter-spacing:.03em;text-transform:uppercase}
.quick-card p{margin:0;color:#dce6ff;line-height:1.35;font-size:14px}
.row{display:grid;grid-template-columns:1.35fr .9fr;gap:18px;margin-top:18px}
.card{padding:18px}
.section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
.section-head h3{margin:0;font-size:20px;letter-spacing:.04em;text-transform:uppercase}
.plan-frame{position:relative;border-radius:28px;padding:18px;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.03));border:1px solid rgba(154,182,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.06), 0 12px 40px rgba(0,0,0,.25)}
.plan-surface{position:relative;border-radius:22px;padding:18px;min-height:520px;background:linear-gradient(180deg,rgba(5,13,28,.85),rgba(11,18,32,.88));border:1px solid rgba(164,191,255,.14);overflow:auto}
.plan-grid{display:grid;gap:7px;min-width:max-content}
.cell{position:relative;border-radius:12px;min-width:48px;min-height:48px;border:1px solid rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:.18s transform,.18s box-shadow,.18s border-color;overflow:hidden}
.cell:hover{transform:translateY(-1px);box-shadow:0 8px 20px rgba(0,0,0,.24)}
.cell.selected{outline:2px solid rgba(255,230,155,.88);box-shadow:0 0 0 3px rgba(255,221,135,.13),0 10px 28px rgba(0,0,0,.3)}
.cell-sun{position:absolute;left:4px;top:3px;font-size:9px;color:rgba(255,245,202,.88)}
.cell-pot{position:absolute;right:4px;bottom:3px;font-size:9px;color:#9fe5ff}
.cell-icon{font-size:14px;line-height:1}
.cell-crop{position:absolute;bottom:3px;left:5px;font-size:10px;text-shadow:0 0 10px rgba(0,0,0,.6)}
.premium-strip{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}
.dock{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:16px}
.dock-btn{min-width:92px;min-height:82px;border-radius:22px;padding:14px 12px;border:1px solid rgba(177,198,255,.16);background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.03));color:#eef4ff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;box-shadow:0 14px 28px rgba(0,0,0,.25)}
.dock-btn.active{border-color:rgba(255,224,145,.42);box-shadow:0 0 0 1px rgba(255,224,145,.26),0 16px 34px rgba(0,0,0,.3)}
.dock-btn span:first-child{font-size:25px}
.widget-stack{display:grid;gap:12px}
.widget{padding:16px;border-radius:22px}
.widget h4{margin:0 0 10px;font-size:15px;letter-spacing:.04em;text-transform:uppercase}
.widget p{margin:0;color:#dbe5ff;line-height:1.38}
.primary{background:linear-gradient(180deg,#334fbe,#223884);color:#fff;border:none;padding:12px 18px;border-radius:16px;cursor:pointer;box-shadow:0 10px 25px rgba(46,79,197,.34)}
.secondary{background:rgba(255,255,255,.06);color:#eef3ff;border:1px solid rgba(170,190,255,.16);padding:12px 18px;border-radius:16px;cursor:pointer}
.field{width:100%;background:rgba(7,12,24,.72);color:#f3f7ff;border:1px solid rgba(175,196,255,.16);padding:12px 14px;border-radius:16px;outline:none}
.field option{color:#111;background:#f8fbff}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.context{position:absolute;z-index:8;width:280px;padding:14px;border-radius:20px}
.context-menu{display:grid;gap:8px}
.chip-row{display:flex;gap:8px;flex-wrap:wrap}
.chip{padding:9px 12px;border-radius:999px;border:1px solid rgba(174,198,255,.16);background:rgba(255,255,255,.06);color:#eef4ff;cursor:pointer}
.chip.on{background:rgba(103,124,255,.2);border-color:rgba(151,176,255,.38)}
.info-pop{margin-top:8px;padding:12px 14px;border-radius:16px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#dbe7ff;line-height:1.42}
.step-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}
.step-title{font-size:28px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;margin:0}
.back-btn{padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.06);border:1px solid rgba(174,198,255,.16);color:#f1f5ff;cursor:pointer}
.footer-note{margin-top:8px;color:#b8c6e7;font-size:13px}
@media (max-width: 980px){
  .topbar,.row{grid-template-columns:1fr}
  .title{font-size:34px}
  .quick-grid{grid-template-columns:1fr 1fr}
}
@media (max-width: 720px){
  .main-wrap{padding:18px 12px 28px}
  .quick-grid{grid-template-columns:1fr}
  .grid2{grid-template-columns:1fr}
  .plan-surface{min-height:430px}
  .dock-btn{min-width:76px;min-height:74px;padding:10px}
  .context{width:calc(100vw - 48px);left:12px !important;right:12px}
}
`;

function StageLayout({ title, onBack, children, info, onInfo }) {
  return (
    <div className="glass panel card">
      <div className="step-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="back-btn" onClick={onBack}>← Retour</button>
          <h2 className="step-title">{title}</h2>
        </div>
        <GlowInfoButton onClick={onInfo} />
      </div>
      {info}
      {children}
    </div>
  );
}

// Repère 3/6 — composant principal
export default function App() {
  const initial = loadInitial();
  const [state, setState] = useState(initial);
  const [fireflies] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 6}s`,
      duration: `${5 + Math.random() * 7}s`,
      size: 4 + Math.random() * 4,
    }))
  );
  const planRef = useRef(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const handler = (e) => {
      if (!state.saveState.dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [state.saveState.dirty]);

  const selectedCell = useMemo(
    () => state.plan.cells.find((cell) => cell.id === state.selectedCellId) || null,
    [state.plan.cells, state.selectedCellId]
  );

  const hubCards = useMemo(() => {
    const planted = state.plan.cells.filter((c) => c.crop !== "none").length;
    const structuresCount = state.plan.cells.filter((c) => c.structure !== "none").length;
    const pendingPots = state.pendingPotIds.length;
    return [
      { key: "diagnostic", title: "Diagnostic", text: `${state.ai.orientation} • ${state.ai.confidence}`, icon: "◎", screen: "diagnostic" },
      { key: "structure", title: "Structure", text: `${structuresCount} cases structurées`, icon: "▦", screen: "structure" },
      { key: "planting", title: "Cultures", text: `${planted} cases plantées`, icon: "❋", screen: "planting" },
      { key: "pots", title: "Pots", text: `${pendingPots} pot(s) à placer`, icon: "◉", screen: "pots" },
      { key: "follow", title: "Suivi", text: `${state.reminders.length} rappels actifs`, icon: "↻", screen: "follow" },
      { key: "plan", title: "Plan", text: `${state.plan.rows} × ${state.plan.cols}`, icon: "⬚", screen: "structure" },
    ];
  }, [state]);

  const suggestedCellId = useMemo(() => {
    if (state.currentScreen !== "planting" || state.builder.crop === "none") return null;
    const ranked = [...state.plan.cells]
      .map((cell) => ({ id: cell.id, score: suggestCellScore(cell, state) }))
      .sort((a, b) => b.score - a.score);
    return ranked[0]?.id || null;
  }, [state]);

  const potSuggestion = useMemo(() => {
    const pending = state.pots.filter((p) => state.pendingPotIds.includes(p.id));
    if (!pending.length) return "Aucun pot en attente";
    const diam = pending[0].diameter;
    return `Créer des pots de ${diam} cm près d'une zone lumineuse et protégée.`;
  }, [state.pots, state.pendingPotIds]);

  const weatherBadge = `${state.weather.temp}°C • vent ${state.weather.wind} km/h • ${state.weather.text}`;

  const todayLine = useMemo(() => {
    if (state.pendingPotIds.length) return `${state.pendingPotIds.length} pot(s) à placer`;
    if (selectedCell && selectedCell.crop !== "none") {
      return `Observer ${crops[selectedCell.crop].label.toLowerCase()} sur la case active`;
    }
    if (state.weather.wind >= 30) return "Vent fort : attention aux jeunes plants";
    return "Plan prêt pour conception et placement";
  }, [state.pendingPotIds.length, selectedCell, state.weather.wind]);

  function patch(updater) {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }

  function markDirty(prev) {
    return {
      ...prev,
      saveState: { ...prev.saveState, dirty: true },
    };
  }

  function setScreen(screen) {
    patch((prev) => ({ ...prev, currentScreen: screen, infoOpen: null, contextCellId: null }));
  }

  function updateCell(cellId, updater) {
    patch((prev) => {
      const next = {
        ...prev,
        plan: {
          ...prev.plan,
          cells: prev.plan.cells.map((cell) => {
            if (cell.id !== cellId) return cell;
            const patched = updater(cell);
            return { ...patched, sun: clamp(Number(patched.sun ?? 2), 0, 3) };
          }),
        },
      };
      return markDirty(next);
    });
  }

  function applyBuilderToCell(cellId) {
    updateCell(cellId, (cell) => ({
      ...cell,
      structure: state.builder.structure,
      crop: state.builder.crop,
      sun: state.builder.sun,
      note: state.builder.note,
    }));
  }

  function saveNow() {
    patch((prev) => ({ ...prev, saveState: { dirty: false, savedAt: new Date().toLocaleTimeString() } }));
  }

  function restoreLastSaved() {
    const loaded = loadInitial();
    setState(loaded);
  }

  function createPots(count, diameter) {
    patch((prev) => {
      const newPots = Array.from({ length: count }, () => makePot(diameter));
      const next = {
        ...prev,
        pots: [...prev.pots, ...newPots],
        pendingPotIds: [...prev.pendingPotIds, ...newPots.map((p) => p.id)],
      };
      return markDirty(next);
    });
  }

  function placePotOnCell(cellId) {
    if (!state.pendingPotIds.length) return;
    const potId = state.pendingPotIds[0];
    updateCell(cellId, (cell) => ({ ...cell, potIds: [...cell.potIds, potId] }));
    patch((prev) =>
      markDirty({
        ...prev,
        pots: prev.pots.map((pot) => (pot.id === potId ? { ...pot, placedOn: cellId } : pot)),
        pendingPotIds: prev.pendingPotIds.filter((id) => id !== potId),
      })
    );
  }

  function createBrushFromSelected() {
    if (!selectedCell) return;
    patch((prev) => ({
      ...prev,
      brush: {
        structure: selectedCell.structure,
        crop: selectedCell.crop,
        sun: selectedCell.sun,
        note: selectedCell.note,
      },
    }));
  }

  function paintWithBrush(cellId) {
    if (!state.brush) return;
    updateCell(cellId, (cell) => ({ ...cell, ...state.brush }));
  }

  // Repère 4/6 — rendu du plan et écrans
  function renderPlan({ editable = true, placingPots = false }) {
    return (
      <div className="plan-frame glass">
        <div className="plan-surface" ref={planRef}>
          <div
            className="plan-grid"
            style={{ gridTemplateColumns: `repeat(${state.plan.cols}, 54px)` }}
          >
            {state.plan.cells.map((cell) => {
              const structure = structures[cell.structure];
              const crop = crops[cell.crop];
              const isSelected = cell.id === state.selectedCellId;
              const isSuggested = cell.id === suggestedCellId;
              const hasPendingPot = placingPots && !cell.potIds.length;
              return (
                <div
                  key={cell.id}
                  className={`cell ${isSelected ? "selected" : ""}`}
                  onClick={() => {
                    patch((prev) => ({ ...prev, selectedCellId: cell.id, contextCellId: null }));
                    if (placingPots) placePotOnCell(cell.id);
                  }}
                  onDoubleClick={() => {
                    patch((prev) => ({ ...prev, selectedCellId: cell.id, currentScreen: "planting" }));
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    patch((prev) => ({ ...prev, selectedCellId: cell.id, contextCellId: cell.id }));
                  }}
                  style={{
                    background: `${structure.color}`,
                    borderColor: isSuggested ? "rgba(255,228,143,0.56)" : structure.border,
                    boxShadow: isSuggested
                      ? "0 0 0 1px rgba(255,228,143,.28), 0 0 28px rgba(255,216,113,.18)"
                      : crop.color !== "transparent"
                        ? `inset 0 -10px 18px rgba(0,0,0,.18), 0 0 16px ${crop.color}20`
                        : undefined,
                  }}
                  title={labelFromCell(cell)}
                >
                  <div className="cell-sun">☼ {cell.sun}</div>
                  <div className="cell-icon">{structure.icon}</div>
                  {cell.crop !== "none" ? <div className="cell-crop">{crop.icon}</div> : null}
                  {!!cell.potIds.length ? <div className="cell-pot">◉ {cell.potIds.length}</div> : null}
                  {hasPendingPot ? (
                    <div style={{ position: "absolute", inset: 0, borderRadius: 12, background: "linear-gradient(180deg, rgba(140,214,255,.08), rgba(103,170,255,.02))" }} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {state.contextCellId && editable ? (() => {
          const cell = state.plan.cells.find((c) => c.id === state.contextCellId);
          if (!cell) return null;
          return (
            <div className="context glass panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <strong>{labelFromCell(cell)}</strong>
                <button className="back-btn" onClick={() => patch((prev) => ({ ...prev, contextCellId: null }))}>✕</button>
              </div>
              <div className="context-menu">
                <button className="secondary" onClick={() => { applyBuilderToCell(cell.id); patch((prev) => ({ ...prev, contextCellId: null })); }}>Appliquer l'atelier</button>
                <button className="secondary" onClick={() => { patch((prev) => ({ ...prev, selectedCellId: cell.id, currentScreen: "planting", contextCellId: null })); }}>Modifier cette case</button>
                <button className="secondary" onClick={() => { createBrushFromSelected(); patch((prev) => ({ ...prev, contextCellId: null })); }}>Copier comme pinceau</button>
                <button className="secondary" onClick={() => { paintWithBrush(cell.id); patch((prev) => ({ ...prev, contextCellId: null })); }}>Coller le pinceau</button>
                <button className="secondary" onClick={() => { updateCell(cell.id, (c) => ({ ...c, structure: "none", crop: "none", note: "", potIds: [] })); patch((prev) => ({ ...prev, contextCellId: null })); }}>Vider la case</button>
              </div>
            </div>
          );
        })() : null}
      </div>
    );
  }

  function infoBlock(key, text) {
    return state.infoOpen === key ? <div className="info-pop">{text}</div> : null;
  }

  function renderHub() {
    return (
      <>
        <div className="topbar">
          <div className="glass panel card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
              <div>
                <div className="title">Mon Potager</div>
                <div className="subtitle" style={{ marginTop: 8, maxWidth: 720 }}>
                  Tour de contrôle vivante : tout est synthétisé ici, puis chaque clic t’emmène dans une étape dédiée avant retour automatique au hub.
                </div>
              </div>
              <GlowInfoButton onClick={() => patch((prev) => ({ ...prev, infoOpen: prev.infoOpen === "hub" ? null : "hub" }))} />
            </div>
            {infoBlock("hub", "Le hub central te donne la météo, l’état du plan, les conseils IA, les pots à placer et les rappels. Clique une carte pour entrer dans l’étape dédiée.")}
            <div className="premium-strip" style={{ marginTop: 18 }}>
              <div className="chip">{weatherBadge}</div>
              <div className="chip">{todayLine}</div>
              <div className={`chip ${!state.saveState.dirty ? "on" : ""}`}>{state.saveState.dirty ? "Modifications non sauvegardées" : `Sauvé ${state.saveState.savedAt || "—"}`}</div>
            </div>
          </div>

          <div className="quick-grid">
            {hubCards.map((card) => (
              <div key={card.key} className="glass quick-card" onClick={() => setScreen(card.screen)}>
                <h4>{card.icon} {card.title}</h4>
                <p>{card.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="row">
          <div className="glass panel card">
            <div className="section-head">
              <h3>Aperçu du plan</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="secondary" onClick={() => setScreen("structure")}>Tracer</button>
                <button className="secondary" onClick={() => setScreen("planting")}>Planter</button>
                <button className="secondary" onClick={() => setScreen("pots")}>Pots</button>
              </div>
            </div>
            {renderPlan({ editable: true, placingPots: false })}
            <div className="dock">
              <button className="dock-btn" onClick={() => setScreen("diagnostic")}><span>◎</span><span>Diagnostic</span></button>
              <button className={`dock-btn ${state.brush ? "active" : ""}`} onClick={createBrushFromSelected}><span>🪄</span><span>Pinceau</span></button>
              <button className="dock-btn" onClick={saveNow}><span>💾</span><span>Sauver</span></button>
            </div>
          </div>

          <div className="widget-stack">
            <div className="glass widget">
              <div className="section-head" style={{ marginBottom: 10 }}>
                <h3 style={{ fontSize: 17 }}>IA suggestion</h3>
                <GlowInfoButton onClick={() => patch((prev) => ({ ...prev, infoOpen: prev.infoOpen === "ai" ? null : "ai" }))} />
              </div>
              <p>{state.ai.primaryAdvice}</p>
              {infoBlock("ai", "Le conseil IA résume l’action la plus rentable à faire maintenant selon météo, exposition et état du plan.")}
            </div>
            <div className="glass widget">
              <h4>Aujourd’hui</h4>
              <p>{todayLine}</p>
            </div>
            <div className="glass widget">
              <h4>Statut</h4>
              <p>{state.saveState.dirty ? "Modifications non sauvegardées" : "Plan enregistré"}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="primary" onClick={saveNow}>Sauvegarder</button>
                <button className="secondary" onClick={restoreLastSaved}>Restaurer</button>
              </div>
            </div>
            <div className="glass widget">
              <h4>Case active</h4>
              <p>
                {selectedCell
                  ? `${labelFromCell(selectedCell)} • ${structures[selectedCell.structure].label} • ${crops[selectedCell.crop].label}`
                  : "Clique une case du plan pour inspecter."}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  function renderDiagnostic() {
    return (
      <StageLayout
        title="Diagnostic du jardin"
        onBack={() => setScreen("hub")}
        onInfo={() => patch((prev) => ({ ...prev, infoOpen: prev.infoOpen === "diagnostic" ? null : "diagnostic" }))}
        info={infoBlock("diagnostic", "Charge une photo du jardin, confirme l’orientation et affine la lecture IA des zones chaudes, calmes ou ombrées.")}
      >
        <div className="grid2">
          <div className="glass panel card">
            <div className="section-head"><h3>Photo / ambiance</h3></div>
            <input
              className="field"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => patch((prev) => markDirty({ ...prev, photo: String(reader.result) }));
                reader.readAsDataURL(file);
              }}
            />
            <div className="footer-note">La photo sert de support de diagnostic assisté et d’ambiance de fond si tu l’actives ensuite.</div>
            {state.photo ? <img src={state.photo} alt="diagnostic" style={{ width: "100%", marginTop: 14, borderRadius: 18, border: "1px solid rgba(255,255,255,.12)" }} /> : null}
          </div>
          <div className="glass panel card">
            <div className="section-head"><h3>Lecture IA</h3></div>
            <div className="grid2">
              <label>
                <div className="footer-note">Orientation estimée</div>
                <select className="field" value={state.ai.orientation} onChange={(e) => patch((prev) => markDirty({ ...prev, ai: { ...prev.ai, orientation: e.target.value } }))}>
                  <option>Sud-est estimé</option>
                  <option>Sud</option>
                  <option>Est</option>
                  <option>Ouest</option>
                  <option>Nord</option>
                </select>
              </label>
              <label>
                <div className="footer-note">Confiance</div>
                <select className="field" value={state.ai.confidence} onChange={(e) => patch((prev) => markDirty({ ...prev, ai: { ...prev.ai, confidence: e.target.value } }))}>
                  <option>Faible</option><option>Moyenne</option><option>Élevée</option>
                </select>
              </label>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="footer-note">Résumé IA</div>
              <textarea className="field" rows={4} value={state.ai.summary} onChange={(e) => patch((prev) => markDirty({ ...prev, ai: { ...prev.ai, summary: e.target.value } }))} />
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="footer-note">Conseil principal</div>
              <textarea className="field" rows={3} value={state.ai.primaryAdvice} onChange={(e) => patch((prev) => markDirty({ ...prev, ai: { ...prev.ai, primaryAdvice: e.target.value } }))} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="primary" onClick={() => setScreen("hub")}>Valider et revenir</button>
              <button className="secondary" onClick={() => setScreen("structure")}>Tracer ensuite</button>
            </div>
          </div>
        </div>
      </StageLayout>
    );
  }

  // Repère 5/6 — écrans structure, plantation, pots, suivi
  function renderStructure() {
    return (
      <StageLayout
        title="Tracer la structure"
        onBack={() => setScreen("hub")}
        onInfo={() => patch((prev) => ({ ...prev, infoOpen: prev.infoOpen === "structure" ? null : "structure" }))}
        info={infoBlock("structure", "Peins les zones du terrain : mur, clôture, terrasse, allée, serre, pelouse. Le pinceau permet de répéter une configuration sur plusieurs cases.")}
      >
        <div className="grid2" style={{ alignItems: "start" }}>
          <div>
            {renderPlan({ editable: true, placingPots: false })}
            <div className="dock">
              {Object.keys(structures).map((key) => (
                <button key={key} className={`dock-btn ${state.builder.structure === key ? "active" : ""}`} onClick={() => patch((prev) => ({ ...prev, builder: { ...prev.builder, structure: key } }))}>
                  <span>{structures[key].icon}</span><span>{structures[key].label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="glass panel card">
            <div className="section-head"><h3>Atelier structure</h3></div>
            <div className="chip-row">
              <button className="chip on">Structure : {structures[state.builder.structure].label}</button>
              <button className={`chip ${state.brush ? "on" : ""}`} onClick={createBrushFromSelected}>Copier comme pinceau</button>
            </div>
            <div className="footer-note" style={{ marginTop: 12 }}>Clique une case pour la sélectionner, clic droit pour le menu contextuel, double clic pour aller au détail culture.</div>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="primary" onClick={() => selectedCell && applyBuilderToCell(selectedCell.id)}>Appliquer à la case active</button>
              <button className="secondary" onClick={() => setScreen("hub")}>Terminer</button>
            </div>
          </div>
        </div>
      </StageLayout>
    );
  }

  function renderPlanting() {
    return (
      <StageLayout
        title="Planter"
        onBack={() => setScreen("hub")}
        onInfo={() => patch((prev) => ({ ...prev, infoOpen: prev.infoOpen === "planting" ? null : "planting" }))}
        info={infoBlock("planting", "Sélectionne une culture puis clique les cases du plan. La meilleure case suggérée reçoit un halo discret.")}
      >
        <div className="grid2" style={{ alignItems: "start" }}>
          <div>{renderPlan({ editable: true, placingPots: false })}</div>
          <div className="glass panel card">
            <div className="section-head"><h3>Atelier culture</h3></div>
            <div className="chip-row">
              {Object.keys(crops).map((key) => (
                <button key={key} className={`chip ${state.builder.crop === key ? "on" : ""}`} onClick={() => patch((prev) => ({ ...prev, builder: { ...prev.builder, crop: key } }))}>
                  {crops[key].icon || "·"} {crops[key].label}
                </button>
              ))}
            </div>
            <div className="grid2" style={{ marginTop: 12 }}>
              <label>
                <div className="footer-note">Soleil</div>
                <input className="field" type="range" min={0} max={3} value={state.builder.sun} onChange={(e) => patch((prev) => ({ ...prev, builder: { ...prev.builder, sun: Number(e.target.value) } }))} />
              </label>
              <label>
                <div className="footer-note">Case active</div>
                <div className="field" style={{ display: "flex", alignItems: "center" }}>{selectedCell ? labelFromCell(selectedCell) : "Aucune"}</div>
              </label>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="footer-note">Note</div>
              <textarea className="field" rows={3} value={state.builder.note} onChange={(e) => patch((prev) => ({ ...prev, builder: { ...prev.builder, note: e.target.value } }))} />
            </div>
            <div className="info-pop" style={{ marginTop: 14 }}>
              Suggestion IA : {suggestedCellId ? `la meilleure zone actuelle pour ${crops[state.builder.crop].label.toLowerCase()} est ${labelFromCell(state.plan.cells.find((c) => c.id === suggestedCellId))}.` : "choisis d’abord une culture."}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="primary" onClick={() => selectedCell && applyBuilderToCell(selectedCell.id)}>Planter sur la case active</button>
              <button className="secondary" onClick={() => setScreen("hub")}>Valider et revenir</button>
            </div>
          </div>
        </div>
      </StageLayout>
    );
  }

  function renderPots() {
    const [count, diam] = [3, 30];
    return (
      <StageLayout
        title="Ajouter des pots"
        onBack={() => setScreen("hub")}
        onInfo={() => patch((prev) => ({ ...prev, infoOpen: prev.infoOpen === "pots" ? null : "pots" }))}
        info={infoBlock("pots", "Crée un lot de pots, récupère une suggestion IA de plantation, puis place-les sur le plan en cliquant les cases souhaitées.")}
      >
        <div className="grid2" style={{ alignItems: "start" }}>
          <div>{renderPlan({ editable: false, placingPots: true })}</div>
          <div className="glass panel card">
            <div className="section-head"><h3>Atelier pots</h3></div>
            <div className="chip-row">
              <button className="chip" onClick={() => createPots(1, 20)}>1 pot • 20 cm</button>
              <button className="chip" onClick={() => createPots(3, 30)}>3 pots • 30 cm</button>
              <button className="chip" onClick={() => createPots(5, 40)}>5 pots • 40 cm</button>
            </div>
            <div className="info-pop" style={{ marginTop: 14 }}>
              Suggestion : {potSuggestion}
            </div>
            <div className="widget-stack" style={{ marginTop: 14 }}>
              {state.pots.slice(-6).map((pot) => (
                <div key={pot.id} className="glass widget">
                  <h4>Pot {pot.diameter} cm</h4>
                  <p>{pot.placedOn ? `Placée sur ${labelFromCell(state.plan.cells.find((c) => c.id === pot.placedOn))}` : `Suggestion : ${crops[pot.cropSuggestion].label}`}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="primary" onClick={() => setScreen("hub")}>Valider et revenir</button>
              <button className="secondary" onClick={() => patch((prev) => markDirty({ ...prev, pendingPotIds: prev.pots.filter((p) => !p.placedOn).map((p) => p.id) }))}>Reprendre placement</button>
            </div>
          </div>
        </div>
      </StageLayout>
    );
  }

  function renderFollow() {
    return (
      <StageLayout
        title="Suivi et rappels"
        onBack={() => setScreen("hub")}
        onInfo={() => patch((prev) => ({ ...prev, infoOpen: prev.infoOpen === "follow" ? null : "follow" }))}
        info={infoBlock("follow", "Valide ici les observations et actions ; le hub central ne te montre ensuite que l’essentiel à surveiller.")}
      >
        <div className="widget-stack">
          {state.reminders.map((rem) => (
            <div key={rem.id} className="glass widget">
              <h4>{rem.level === "today" ? "Aujourd’hui" : "À surveiller"}</h4>
              <p>{rem.label} • {rem.due}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button className="primary" onClick={() => patch((prev) => markDirty({ ...prev, reminders: prev.reminders.filter((r) => r.id !== rem.id) }))}>Valider</button>
                <button className="secondary" onClick={() => patch((prev) => markDirty({ ...prev, ai: { ...prev.ai, primaryAdvice: rem.label } }))}>Envoyer au hub</button>
              </div>
            </div>
          ))}
          <button className="secondary" onClick={() => setScreen("hub")}>Retour à la tour de contrôle</button>
        </div>
      </StageLayout>
    );
  }

  // Repère 6/6 — rendu final
  return (
    <div className="potager-shell">
      <div className="back-layer">
        <div className="blob a" />
        <div className="blob b" />
        <div className="blob c" />
        {fireflies.map((f) => (
          <div
            key={f.id}
            className="firefly"
            style={{
              left: f.left,
              top: f.top,
              animationDelay: f.delay,
              animationDuration: f.duration,
              width: f.size,
              height: f.size,
            }}
          />
        ))}
      </div>

      <div className="main-wrap">
        {state.currentScreen === "hub" && renderHub()}
        {state.currentScreen === "diagnostic" && renderDiagnostic()}
        {state.currentScreen === "structure" && renderStructure()}
        {state.currentScreen === "planting" && renderPlanting()}
        {state.currentScreen === "pots" && renderPots()}
        {state.currentScreen === "follow" && renderFollow()}
      </div>
    </div>
  );
}
