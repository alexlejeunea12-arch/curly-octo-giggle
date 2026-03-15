import React, { useEffect, useMemo, useState } from "react";

// Repère 1/6 — constantes, helpers, modèles
const CITY = "Saint-Germain-lès-Arpajon (91180)";
const LAT = 48.616;
const LON = 2.258;
const STORAGE = "potager_multi_v2";

const plants = {
  vide: {
    name: "Vide",
    icon: "⬜",
    color: "#f3f4f6",
    water: 0,
    yield: 0,
    sunNeed: 0,
    tasks: {},
  },
  tomate: {
    name: "Tomate",
    icon: "🍅",
    color: "#ef4444",
    water: 1.2,
    yield: 3,
    sunNeed: 3,
    tasks: {
      3: "Semer",
      5: "Planter / repiquer",
      7: "Tuteurer",
      8: "Récolter",
    },
  },
  tomateCerise: {
    name: "Tomate cerise",
    icon: "🍅",
    color: "#fb7a59",
    water: 1,
    yield: 2,
    sunNeed: 3,
    tasks: {
      3: "Semer",
      5: "Planter / repiquer",
      7: "Tuteurer",
      8: "Récolter",
    },
  },
  piment: {
    name: "Piment",
    icon: "🌶️",
    color: "#dc2626",
    water: 0.8,
    yield: 0.6,
    sunNeed: 3,
    tasks: {
      2: "Semer",
      5: "Planter / repiquer",
      7: "Surveiller",
      8: "Récolter",
    },
  },
  poivron: {
    name: "Poivron",
    icon: "🫑",
    color: "#f59e0b",
    water: 0.8,
    yield: 1,
    sunNeed: 3,
    tasks: {
      2: "Semer",
      5: "Planter / repiquer",
      7: "Surveiller",
      8: "Récolter",
    },
  },
  salade: {
    name: "Salade",
    icon: "🥬",
    color: "#84cc16",
    water: 0.5,
    yield: 0.3,
    sunNeed: 1,
    tasks: { 3: "Semer", 4: "Éclaircir", 5: "Récolter", 9: "Ressemer" },
  },
  basilic: {
    name: "Basilic",
    icon: "🌿",
    color: "#22c55e",
    water: 0.4,
    yield: 0.2,
    sunNeed: 2,
    tasks: { 4: "Semer", 5: "Planter", 7: "Pincer", 8: "Récolter" },
  },
  persil: {
    name: "Persil",
    icon: "🌱",
    color: "#15803d",
    water: 0.3,
    yield: 0.2,
    sunNeed: 1,
    tasks: { 3: "Semer", 5: "Éclaircir", 6: "Récolter", 9: "Récolter" },
  },
  fleurs: {
    name: "Fleurs utiles",
    icon: "🌼",
    color: "#fde047",
    water: 0.2,
    yield: 0,
    sunNeed: 2,
    tasks: { 4: "Semer", 6: "Floraison", 7: "Attirer les pollinisateurs" },
  },
};

const zoneMeta = {
  plant: { label: "Culture", color: "#ffffff", icon: "🪴" },
  grass: { label: "Pelouse", color: "#65a30d", icon: "🟩" },
  terrace: { label: "Terrasse", color: "#8b5e3c", icon: "🟫" },
  tree: { label: "Arbre / ombre", color: "#4b5563", icon: "🌳" },
  empty: { label: "Vide", color: "#e5e7eb", icon: "⬜" },
};

const field = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  padding: "10px 12px",
  outline: "none",
  fontSize: 14,
  background: "#fff",
  boxSizing: "border-box",
};
const area = {
  ...field,
  minHeight: 82,
  resize: "vertical",
  fontFamily: "Arial, sans-serif",
};
const softBtn = {
  background: "#fff",
  color: "#111827",
  border: "1px solid #d1d5db",
  borderRadius: 12,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
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
function b(bg, color = "#fff") {
  return {
    background: bg,
    color,
    border: "none",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(15,23,42,0.12)",
  };
}
function m(bg = "#fff", color = "#111827") {
  return {
    background: bg,
    color,
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 10,
    padding: "6px 10px",
    fontWeight: 700,
    cursor: "pointer",
    minWidth: 42,
  };
}
function cardStyle() {
  return {
    background: "#fff",
    borderRadius: 18,
    padding: 18,
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

function makeCell(label = "Nouvelle case", zoneType = "empty", extra = {}) {
  return {
    id: uid(),
    label,
    zoneType,
    plant: zoneType === "plant" ? "tomate" : "vide",
    count: zoneType === "plant" ? 1 : 0,
    sunBase: 2,
    note: "",
    ...extra,
  };
}
function defaultCells() {
  return [
    makeCell("Bande piments / poivrons", "plant", {
      plant: "piment",
      count: 4,
      sunBase: 3,
    }),
    makeCell("Tomates fond gauche", "plant", {
      plant: "tomate",
      count: 3,
      sunBase: 3,
    }),
    makeCell("Tomates fond droit", "plant", {
      plant: "tomateCerise",
      count: 3,
      sunBase: 3,
    }),
    makeCell("Pelouse centrale 1", "grass", { sunBase: 2 }),
    makeCell("Pelouse centrale 2", "grass", { sunBase: 2 }),
    makeCell("Salades / herbes", "plant", {
      plant: "salade",
      count: 6,
      sunBase: 2,
    }),
    makeCell("Aromatiques", "plant", { plant: "persil", count: 4, sunBase: 2 }),
    makeCell("Terrasse", "terrace", { sunBase: 3 }),
  ];
}
function createPotager(name = "Nouveau potager") {
  const cells = defaultCells();
  return {
    id: uid(),
    name,
    cells,
    cols: 4,
    selectedId: cells[0]?.id || null,
    quickPlant: "tomate",
    orientation: "south",
    sunMode: 2,
    zoom: 100,
    journal: [],
  };
}
function normalizePotager(raw, index = 0) {
  const sourceCells =
    Array.isArray(raw?.cells) && raw.cells.length ? raw.cells : defaultCells();
  const cells = sourceCells.map((cell) => ({
    id: cell?.id || uid(),
    label: cell?.label || "Nouvelle case",
    zoneType: zoneMeta[cell?.zoneType] ? cell.zoneType : "empty",
    plant: cell?.zoneType === "plant" ? cell?.plant || "tomate" : "vide",
    count:
      cell?.zoneType === "plant" ? Math.max(0, Number(cell?.count || 0)) : 0,
    sunBase: clamp(Number(cell?.sunBase || 0), 0, 3),
    note: cell?.note || "",
  }));
  const selectedId = cells.some((x) => x.id === raw?.selectedId)
    ? raw.selectedId
    : cells[0]?.id || null;
  return {
    id: raw?.id || uid(),
    name: raw?.name || `Potager ${index + 1}`,
    cells,
    cols: clamp(Number(raw?.cols || 4), 2, 8),
    selectedId,
    quickPlant: plants[raw?.quickPlant] ? raw.quickPlant : "tomate",
    orientation: ["south", "north", "west", "east"].includes(raw?.orientation)
      ? raw.orientation
      : "south",
    sunMode: clamp(Number(raw?.sunMode || 2), 1, 3),
    zoom: clamp(Number(raw?.zoom || 100), 60, 150),
    journal: Array.isArray(raw?.journal) ? raw.journal : [],
  };
}
function getInitialData() {
  const fallback = createPotager("Potager principal");
  const saved = safeRead(STORAGE, null);
  if (!saved?.potagers?.length)
    return { potagers: [fallback], activePotagerId: fallback.id };
  const potagers = saved.potagers.map((p, i) => normalizePotager(p, i));
  const activePotagerId = potagers.some((p) => p.id === saved.activePotagerId)
    ? saved.activePotagerId
    : potagers[0].id;
  return { potagers, activePotagerId };
}
function terraceText(orientation) {
  if (orientation === "north") return "Terrasse en haut";
  if (orientation === "south") return "Terrasse en bas";
  if (orientation === "west") return "Terrasse à gauche";
  return "Terrasse à droite";
}
function zoomText(zoom) {
  if (zoom <= 75) return "Très dézoomé";
  if (zoom <= 90) return "Dézoomé";
  if (zoom <= 110) return "Normal";
  if (zoom <= 130) return "Zoomé";
  return "Très zoomé";
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
function Metric({ icon, label, value, subtitle }) {
  return (
    <div style={metricStyle()}>
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: "#6b7280", marginTop: 4, fontSize: 13 }}>
        {label}
      </div>
      <div style={{ fontWeight: 800, fontSize: 30, marginTop: 6 }}>{value}</div>
      <div style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
        {subtitle}
      </div>
    </div>
  );
}

// Repère 2/6 — composant principal, multi-potagers, météo
export default function App() {
  const initial = getInitialData();
  const [potagers, setPotagers] = useState(initial.potagers);
  const [activePotagerId, setActivePotagerId] = useState(
    initial.activePotagerId
  );
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE,
      JSON.stringify({ potagers, activePotagerId })
    );
  }, [potagers, activePotagerId]);

  useEffect(() => {
    if (!potagers.length) {
      const fresh = createPotager("Potager principal");
      setPotagers([fresh]);
      setActivePotagerId(fresh.id);
      return;
    }
    if (!potagers.some((x) => x.id === activePotagerId))
      setActivePotagerId(potagers[0].id);
  }, [potagers, activePotagerId]);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.current_weather)
          setWeather({
            temperature: data.current_weather.temperature,
            windspeed: data.current_weather.windspeed,
          });
      })
      .catch(() => setWeather(null));
  }, []);

  const activePotager = useMemo(
    () => potagers.find((p) => p.id === activePotagerId) || potagers[0] || null,
    [potagers, activePotagerId]
  );
  const cells = activePotager?.cells || [];
  const cols = activePotager?.cols || 4;
  const selectedId = activePotager?.selectedId || null;
  const quickPlant = activePotager?.quickPlant || "tomate";
  const orientation = activePotager?.orientation || "south";
  const sunMode = activePotager?.sunMode || 2;
  const zoom = activePotager?.zoom || 100;
  const journal = activePotager?.journal || [];

  function updateActivePotager(updater) {
    if (!activePotager) return;
    setPotagers((prev) =>
      prev.map((potager) => {
        if (potager.id !== activePotager.id) return potager;
        const updated = updater(potager);
        const safeCells =
          Array.isArray(updated.cells) && updated.cells.length
            ? updated.cells
            : [makeCell()];
        const safeSelectedId = safeCells.some(
          (x) => x.id === updated.selectedId
        )
          ? updated.selectedId
          : safeCells[0]?.id || null;
        return {
          ...updated,
          cells: safeCells,
          cols: clamp(Number(updated.cols || 4), 2, 8),
          selectedId: safeSelectedId,
          quickPlant: plants[updated.quickPlant]
            ? updated.quickPlant
            : "tomate",
          orientation: ["south", "north", "west", "east"].includes(
            updated.orientation
          )
            ? updated.orientation
            : "south",
          sunMode: clamp(Number(updated.sunMode || 2), 1, 3),
          zoom: clamp(Number(updated.zoom || 100), 60, 150),
          journal: Array.isArray(updated.journal) ? updated.journal : [],
        };
      })
    );
  }

  function log(text) {
    updateActivePotager((potager) => ({
      ...potager,
      journal: [
        { id: uid(), date: new Date().toLocaleString(), text },
        ...potager.journal,
      ],
    }));
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
          count:
            zoneType === "plant" ? Math.max(0, Number(next.count || 0)) : 0,
          sunBase: clamp(Number(next.sunBase || 0), 0, 3),
          note: next.note || "",
        };
      }),
    }));
  }

  const activeCell = useMemo(
    () => cells.find((cell) => cell.id === selectedId) || null,
    [cells, selectedId]
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
    if (zoom <= 70) return 110;
    if (zoom <= 80) return 122;
    if (zoom <= 90) return 135;
    if (zoom <= 100) return 150;
    if (zoom <= 110) return 165;
    if (zoom <= 125) return 185;
    return 210;
  }, [zoom]);

  const cellMinHeight = useMemo(() => {
    if (zoom <= 70) return 130;
    if (zoom <= 80) return 145;
    if (zoom <= 90) return 160;
    if (zoom <= 100) return 185;
    if (zoom <= 110) return 205;
    if (zoom <= 125) return 225;
    return 250;
  }, [zoom]);

  const iconSize = useMemo(() => {
    if (zoom <= 80) return 28;
    if (zoom <= 100) return 38;
    if (zoom <= 125) return 46;
    return 54;
  }, [zoom]);

  const titleSize = useMemo(() => {
    if (zoom <= 80) return 13;
    if (zoom <= 100) return 15;
    if (zoom <= 125) return 17;
    return 18;
  }, [zoom]);

  const textSize = useMemo(() => {
    if (zoom <= 80) return 12;
    if (zoom <= 100) return 14;
    if (zoom <= 125) return 15;
    return 16;
  }, [zoom]);

  // Repère 3/6 — actions potagers et grille
  function createNewPotager() {
    const next = createPotager(`Potager ${potagers.length + 1}`);
    setPotagers((prev) => [...prev, next]);
    setActivePotagerId(next.id);
  }

  function duplicateActivePotager() {
    if (!activePotager) return;
    const duplicate = {
      ...activePotager,
      id: uid(),
      name: `${activePotager.name} copie`,
      cells: activePotager.cells.map((cell) => ({ ...cell, id: uid() })),
      journal: [
        {
          id: uid(),
          date: new Date().toLocaleString(),
          text: `📄 Copie créée depuis ${activePotager.name}`,
        },
        ...activePotager.journal,
      ],
    };
    duplicate.selectedId = duplicate.cells[0]?.id || null;
    setPotagers((prev) => [...prev, duplicate]);
    setActivePotagerId(duplicate.id);
  }

  function deleteActivePotager() {
    if (!activePotager || potagers.length <= 1) return;
    const nextList = potagers.filter((p) => p.id !== activePotager.id);
    setPotagers(nextList);
    setActivePotagerId(nextList[0].id);
  }

  function renameActivePotager(name) {
    updateActivePotager((potager) => ({ ...potager, name }));
  }

  function selectCell(id) {
    updateActivePotager((potager) => ({ ...potager, selectedId: id }));
  }

  function addCase() {
    const next = makeCell("Nouvelle case", "empty");
    updateActivePotager((potager) => ({
      ...potager,
      cells: [...potager.cells, next],
      selectedId: next.id,
    }));
    log("➕ Case ajoutée");
  }

  function insertAfterSelected() {
    if (!activeCell) return addCase();
    const next = makeCell("Nouvelle case", "empty");
    const index = cells.findIndex((x) => x.id === activeCell.id);
    updateActivePotager((potager) => {
      const copy = [...potager.cells];
      copy.splice(index + 1, 0, next);
      return { ...potager, cells: copy, selectedId: next.id };
    });
    log(`➕ Case insérée après ${activeCell.label}`);
  }

  function addRow() {
    const row = Array.from({ length: Math.max(1, cols) }, (_, i) =>
      makeCell(`Nouvelle case ${i + 1}`, "empty")
    );
    updateActivePotager((potager) => ({
      ...potager,
      cells: [...potager.cells, ...row],
      selectedId: row[0].id,
    }));
    log(`🧱 Ligne de ${row.length} cases ajoutée`);
  }

  function duplicateSelected() {
    if (!activeCell) return;
    const copy = {
      ...activeCell,
      id: uid(),
      label: `${activeCell.label} copie`,
    };
    updateActivePotager((potager) => ({
      ...potager,
      cells: [...potager.cells, copy],
      selectedId: copy.id,
    }));
    log(`📄 Copie de ${activeCell.label}`);
  }

  function deleteSelected() {
    if (!activeCell || cells.length <= 1) return;
    updateActivePotager((potager) => ({
      ...potager,
      cells: potager.cells.filter((x) => x.id !== activeCell.id),
    }));
    log(`🗑 Suppression de ${activeCell.label}`);
  }

  function moveSelected(direction) {
    if (!activeCell) return;
    const index = cells.findIndex((x) => x.id === activeCell.id);
    let target = index;
    if (direction === "left") target = index - 1;
    if (direction === "right") target = index + 1;
    if (direction === "up") target = index - cols;
    if (direction === "down") target = index + cols;
    if (target < 0 || target >= cells.length) return;
    updateActivePotager((potager) => {
      const copy = [...potager.cells];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return { ...potager, cells: copy };
    });
    log(`↔ Déplacement de ${activeCell.label}`);
  }

  function resetCurrentPotager() {
    const freshCells = defaultCells();
    updateActivePotager((potager) => ({
      ...potager,
      cells: freshCells,
      cols: 4,
      selectedId: freshCells[0]?.id || null,
      quickPlant: "tomate",
      orientation: "south",
      sunMode: 2,
      zoom: 100,
      journal: [],
    }));
  }

  function clearJournal() {
    updateActivePotager((potager) => ({ ...potager, journal: [] }));
  }

  function deleteJournalEntry(id) {
    updateActivePotager((potager) => ({
      ...potager,
      journal: potager.journal.filter((entry) => entry.id !== id),
    }));
  }

  function setSelectedZoneType(value) {
    if (!activeCell) return;
    updateCell(activeCell.id, (cell) => ({
      ...cell,
      zoneType: value,
      plant:
        value === "plant"
          ? cell.plant === "vide"
            ? quickPlant
            : cell.plant
          : "vide",
      count: value === "plant" ? Math.max(1, Number(cell.count || 0) || 1) : 0,
    }));
    log(`🧩 Type modifié pour ${activeCell.label}`);
  }

  function addPlant(cell, forcedPlant = null) {
    const nextPlant =
      forcedPlant || (cell.zoneType === "plant" ? cell.plant : quickPlant);
    updateCell(cell.id, (current) => ({
      ...current,
      zoneType: "plant",
      plant: nextPlant,
      count: Math.max(0, Number(current.count || 0)) + 1,
    }));
    selectCell(cell.id);
    log(`➕ ${plants[nextPlant].name} dans ${cell.label}`);
  }

  function removePlant(cell) {
    if (cell.zoneType !== "plant") return;
    updateCell(cell.id, (current) => ({
      ...current,
      count: Math.max(0, Number(current.count || 0) - 1),
    }));
    selectCell(cell.id);
    log(`➖ Retrait d’un plant dans ${cell.label}`);
  }

  function applyQuick(cell) {
    updateCell(cell.id, (current) => ({
      ...current,
      zoneType: "plant",
      plant: quickPlant,
      count: Math.max(1, Number(current.count || 0) || 1),
    }));
    selectCell(cell.id);
    log(`🌱 ${plants[quickPlant].name} appliqué dans ${cell.label}`);
  }

  // Repère 4/6 — calculs, zoom, alertes
  const totalPlants = useMemo(
    () => cells.reduce((sum, cell) => sum + Number(cell.count || 0), 0),
    [cells]
  );
  const waterNeed = useMemo(
    () =>
      cells
        .reduce(
          (sum, cell) =>
            sum +
            Number(cell.count || 0) * Number(plants[cell.plant]?.water || 0),
          0
        )
        .toFixed(1),
    [cells]
  );
  const harvestEstimate = useMemo(
    () =>
      cells
        .reduce(
          (sum, cell) =>
            sum +
            Number(cell.count || 0) * Number(plants[cell.plant]?.yield || 0),
          0
        )
        .toFixed(1),
    [cells]
  );

  const plantBreakdown = useMemo(() => {
    const out = {};
    cells.forEach((cell) => {
      if (cell.zoneType !== "plant" || Number(cell.count || 0) <= 0) return;
      out[cell.plant] = (out[cell.plant] || 0) + Number(cell.count || 0);
    });
    return Object.entries(out).sort((a, b) => b[1] - a[1]);
  }, [cells]);

  const alerts = useMemo(() => {
    const list = [];
    cells.forEach((cell) => {
      if (cell.zoneType !== "plant" || Number(cell.count || 0) <= 0) return;
      const plant = plants[cell.plant];
      if (plant.sunNeed > sunOf(cell))
        list.push(`☀️ ${plant.name} manque de soleil dans ${cell.label}`);
      if (Number(cell.count || 0) >= 8)
        list.push(`📏 ${cell.label} semble chargé : surveiller l’espacement`);
      list.push(`💧 Arroser ${plant.name} dans ${cell.label}`);
    });
    if (weather) {
      if (weather.temperature >= 28)
        list.push("🔥 Forte chaleur : arroser le soir");
      if (weather.temperature <= 5)
        list.push("❄️ Risque de froid pour les jeunes plants");
      if (weather.windspeed >= 35)
        list.push("💨 Vent fort : protéger les plants");
    }
    return [...new Set(list)];
  }, [cells, weather, sunMode]);

  const calendarTasks = useMemo(() => {
    const month = new Date().getMonth() + 1;
    const tasks = [];
    cells.forEach((cell) => {
      if (cell.zoneType !== "plant" || Number(cell.count || 0) <= 0) return;
      const plant = plants[cell.plant];
      const monthTask = plant.tasks[month];
      if (monthTask)
        tasks.push(
          `${plant.icon} ${plant.name} — ${monthTask} (${cell.label})`
        );
      tasks.push(`💧 ${plant.name} — vérifier l’arrosage (${cell.label})`);
    });
    if (weather?.temperature >= 24)
      tasks.push("🌤 Temps chaud : surveiller les zones les plus exposées");
    return [...new Set(tasks)];
  }, [cells, weather]);

  const zoomRecommendation = useMemo(() => {
    if (cells.length >= 40) return "Beaucoup de cases : pense à dézoomer";
    if (cells.length >= 24)
      return "Grille déjà dense : un léger dézoom peut aider";
    return "Taille confortable";
  }, [cells.length]);

  // Repère 5/6 — rendu
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "linear-gradient(180deg, #edf4f8 0%, #f7fafc 100%)",
        minHeight: "100vh",
        padding: 24,
        color: "#111827",
        boxSizing: "border-box",
      }}
    >
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 42 }}>🌱 Assistant Potager</h1>
            <div style={{ marginTop: 6, color: "#4b5563" }}>
              Multi-potagers • sauvegarde locale • zoom de grille • édition
              complète • météo
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={createNewPotager} style={b("#2563eb")}>
              Nouveau potager
            </button>
            <button onClick={duplicateActivePotager} style={b("#0f766e")}>
              Dupliquer le potager
            </button>
            <button
              onClick={deleteActivePotager}
              style={b(potagers.length > 1 ? "#b91c1c" : "#9ca3af")}
              disabled={potagers.length <= 1}
            >
              Supprimer le potager
            </button>
            <button onClick={resetCurrentPotager} style={b("#111827")}>
              Réinitialiser ce potager
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(900px, 1fr) 430px",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            <Card title="🗂 Gestion des potagers">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "220px 1fr",
                  gap: 12,
                  alignItems: "end",
                }}
              >
                <label>
                  <div
                    style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}
                  >
                    Potager actif
                  </div>
                  <select
                    value={activePotagerId}
                    onChange={(e) => setActivePotagerId(e.target.value)}
                    style={field}
                  >
                    {potagers.map((potager) => (
                      <option key={potager.id} value={potager.id}>
                        {potager.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <div
                    style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}
                  >
                    Nom du potager
                  </div>
                  <input
                    value={activePotager?.name || ""}
                    onChange={(e) => renameActivePotager(e.target.value)}
                    style={field}
                    placeholder="Nom du potager"
                  />
                </label>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                {potagers.map((potager) => {
                  const selected = potager.id === activePotagerId;
                  return (
                    <button
                      key={potager.id}
                      onClick={() => setActivePotagerId(potager.id)}
                      style={{
                        border: selected
                          ? "2px solid #111827"
                          : "1px solid #d1d5db",
                        background: selected ? "#eef2ff" : "#fff",
                        borderRadius: 12,
                        padding: "10px 12px",
                        cursor: "pointer",
                        fontWeight: 700,
                      }}
                    >
                      🌿 {potager.name}
                    </button>
                  );
                })}
              </div>
            </Card>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <Metric
                icon="🌿"
                label="Plants au total"
                value={totalPlants}
                subtitle="Dans le potager actif"
              />
              <Metric
                icon="💧"
                label="Arrosage estimé / jour"
                value={`${waterNeed} L`}
                subtitle="Estimation théorique"
              />
              <Metric
                icon="🧺"
                label="Récolte estimée"
                value={`${harvestEstimate} kg`}
                subtitle="Potentiel global approximatif"
              />
            </div>

            <Card
              title="🗺 Plan du jardin"
              right={
                <div
                  style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}
                >
                  {terraceText(orientation)}
                </div>
              }
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 250px",
                  gap: 16,
                  marginBottom: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "end",
                  }}
                >
                  <label style={{ minWidth: 120 }}>
                    <div
                      style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}
                    >
                      Colonnes
                    </div>
                    <select
                      value={cols}
                      onChange={(e) =>
                        updateActivePotager((potager) => ({
                          ...potager,
                          cols: clamp(Number(e.target.value) || 4, 2, 8),
                        }))
                      }
                      style={field}
                    >
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                      <option value={6}>6</option>
                      <option value={7}>7</option>
                      <option value={8}>8</option>
                    </select>
                  </label>

                  <label style={{ minWidth: 170 }}>
                    <div
                      style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}
                    >
                      Orientation
                    </div>
                    <select
                      value={orientation}
                      onChange={(e) =>
                        updateActivePotager((potager) => ({
                          ...potager,
                          orientation: e.target.value,
                        }))
                      }
                      style={field}
                    >
                      <option value="south">Terrasse en bas</option>
                      <option value="north">Terrasse en haut</option>
                      <option value="west">Terrasse à gauche</option>
                      <option value="east">Terrasse à droite</option>
                    </select>
                  </label>

                  <label style={{ minWidth: 150 }}>
                    <div
                      style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}
                    >
                      Soleil global
                    </div>
                    <select
                      value={sunMode}
                      onChange={(e) =>
                        updateActivePotager((potager) => ({
                          ...potager,
                          sunMode: Number(e.target.value),
                        }))
                      }
                      style={field}
                    >
                      <option value={1}>Matin / ombre</option>
                      <option value={2}>Normal</option>
                      <option value={3}>Plein soleil</option>
                    </select>
                  </label>

                  <label style={{ minWidth: 170 }}>
                    <div
                      style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}
                    >
                      Plante rapide
                    </div>
                    <select
                      value={quickPlant}
                      onChange={(e) =>
                        updateActivePotager((potager) => ({
                          ...potager,
                          quickPlant: e.target.value,
                        }))
                      }
                      style={field}
                    >
                      {Object.keys(plants)
                        .filter((k) => k !== "vide")
                        .map((k) => (
                          <option key={k} value={k}>
                            {plants[k].icon} {plants[k].name}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label style={{ minWidth: 180 }}>
                    <div
                      style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}
                    >
                      Zoom de la grille
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={150}
                      step={5}
                      value={zoom}
                      onChange={(e) =>
                        updateActivePotager((potager) => ({
                          ...potager,
                          zoom: Number(e.target.value),
                        }))
                      }
                      style={{ width: "100%" }}
                    />
                    <div
                      style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
                    >
                      {zoom}% • {zoomText(zoom)}
                    </div>
                  </label>
                </div>

                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 14,
                    padding: 12,
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>
                    Repères
                  </div>
                  <div
                    style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}
                  >
                    <div>• Clic sur une case = sélection</div>
                    <div>• Boutons + / - = gérer les plants</div>
                    <div>• Bouton plante rapide = transformer une case</div>
                    <div>• {zoomRecommendation}</div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 16,
                }}
              >
                <button onClick={addCase} style={b("#2563eb")}>
                  Ajouter une case
                </button>
                <button onClick={insertAfterSelected} style={b("#1d4ed8")}>
                  Insérer après la sélection
                </button>
                <button onClick={addRow} style={b("#059669")}>
                  Ajouter une ligne
                </button>
                <button onClick={duplicateSelected} style={b("#0f766e")}>
                  Dupliquer la case
                </button>
                <button
                  onClick={deleteSelected}
                  style={b(cells.length > 1 ? "#b91c1c" : "#9ca3af")}
                  disabled={cells.length <= 1}
                >
                  Supprimer la case
                </button>
              </div>

              <div style={{ overflowX: "auto", paddingBottom: 6 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${cols}, minmax(${cellMinWidth}px, 1fr))`,
                    gap: 14,
                    minWidth: "max-content",
                  }}
                >
                  {cells.map((cell) => {
                    const selected = selectedId === cell.id;
                    const isPlant = cell.zoneType === "plant";
                    return (
                      <div
                        key={cell.id}
                        onClick={() => selectCell(cell.id)}
                        style={{
                          background: bgOf(cell),
                          borderRadius: 16,
                          minHeight: cellMinHeight,
                          padding: zoom <= 85 ? 10 : 14,
                          cursor: "pointer",
                          color:
                            cell.zoneType === "terrace" ||
                            cell.zoneType === "tree"
                              ? "#fff"
                              : "#111827",
                          boxShadow: selected
                            ? "0 0 0 3px #111827 inset, 0 10px 24px rgba(0,0,0,0.16)"
                            : "0 10px 24px rgba(0,0,0,0.08)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          userSelect: "none",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 8,
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                fontWeight: 800,
                                lineHeight: 1.25,
                                fontSize: titleSize,
                              }}
                            >
                              {cell.label}
                            </div>
                            <div
                              style={{
                                fontSize: Math.max(11, textSize - 2),
                                opacity: 0.95,
                                background: "rgba(255,255,255,0.22)",
                                borderRadius: 999,
                                padding: "4px 8px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {zoneMeta[cell.zoneType]?.label || "Zone"}
                            </div>
                          </div>
                          <div style={{ fontSize: iconSize, marginTop: 8 }}>
                            {iconOf(cell)}
                          </div>
                          <div
                            style={{
                              marginTop: 6,
                              fontWeight: 700,
                              fontSize: textSize,
                            }}
                          >
                            {isPlant
                              ? plants[cell.plant]?.name || "Culture"
                              : zoneMeta[cell.zoneType]?.label || "Zone"}
                          </div>
                          {cell.note ? (
                            <div
                              style={{
                                marginTop: 8,
                                fontSize: Math.max(11, textSize - 2),
                                opacity: 0.95,
                                lineHeight: 1.45,
                                background: "rgba(255,255,255,0.18)",
                                borderRadius: 10,
                                padding: "6px 8px",
                              }}
                            >
                              {cell.note}
                            </div>
                          ) : null}
                        </div>

                        <div style={{ fontSize: textSize, lineHeight: 1.5 }}>
                          <div>
                            Plants : {isPlant ? Number(cell.count || 0) : "—"}
                          </div>
                          <div>☀ Soleil : {sunOf(cell)}/3</div>
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              marginTop: 10,
                            }}
                          >
                            {isPlant ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePlant(cell);
                                  }}
                                  style={m()}
                                >
                                  -1
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addPlant(cell);
                                  }}
                                  style={m()}
                                >
                                  +1
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyQuick(cell);
                                  }}
                                  style={m("rgba(255,255,255,0.88)")}
                                >
                                  {plants[quickPlant].icon}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  applyQuick(cell);
                                }}
                                style={m()}
                              >
                                Passer en culture
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <Card title="⚙️ Éditeur de case">
              {activeCell ? (
                <>
                  <div style={{ display: "grid", gap: 12 }}>
                    <label>
                      <div
                        style={{
                          fontSize: 13,
                          marginBottom: 6,
                          fontWeight: 700,
                        }}
                      >
                        Nom
                      </div>
                      <input
                        value={activeCell.label}
                        onChange={(e) =>
                          updateCell(activeCell.id, (cell) => ({
                            ...cell,
                            label: e.target.value,
                          }))
                        }
                        style={field}
                      />
                    </label>

                    <label>
                      <div
                        style={{
                          fontSize: 13,
                          marginBottom: 6,
                          fontWeight: 700,
                        }}
                      >
                        Type de zone
                      </div>
                      <select
                        value={activeCell.zoneType}
                        onChange={(e) => setSelectedZoneType(e.target.value)}
                        style={field}
                      >
                        <option value="plant">Culture</option>
                        <option value="grass">Pelouse</option>
                        <option value="terrace">Terrasse</option>
                        <option value="tree">Arbre / ombre</option>
                        <option value="empty">Vide</option>
                      </select>
                    </label>

                    {activeCell.zoneType === "plant" ? (
                      <>
                        <label>
                          <div
                            style={{
                              fontSize: 13,
                              marginBottom: 6,
                              fontWeight: 700,
                            }}
                          >
                            Plante
                          </div>
                          <select
                            value={activeCell.plant}
                            onChange={(e) =>
                              updateCell(activeCell.id, (cell) => ({
                                ...cell,
                                plant: e.target.value,
                              }))
                            }
                            style={field}
                          >
                            {Object.keys(plants)
                              .filter((k) => k !== "vide")
                              .map((k) => (
                                <option key={k} value={k}>
                                  {plants[k].icon} {plants[k].name}
                                </option>
                              ))}
                          </select>
                        </label>

                        <label>
                          <div
                            style={{
                              fontSize: 13,
                              marginBottom: 6,
                              fontWeight: 700,
                            }}
                          >
                            Nombre de plants
                          </div>
                          <input
                            type="number"
                            min={0}
                            value={activeCell.count}
                            onChange={(e) =>
                              updateCell(activeCell.id, (cell) => ({
                                ...cell,
                                count: Math.max(0, Number(e.target.value) || 0),
                              }))
                            }
                            style={field}
                          />
                        </label>
                      </>
                    ) : null}

                    <label>
                      <div
                        style={{
                          fontSize: 13,
                          marginBottom: 6,
                          fontWeight: 700,
                        }}
                      >
                        Soleil de base
                      </div>
                      <select
                        value={activeCell.sunBase}
                        onChange={(e) =>
                          updateCell(activeCell.id, (cell) => ({
                            ...cell,
                            sunBase: Number(e.target.value),
                          }))
                        }
                        style={field}
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                    </label>

                    <label>
                      <div
                        style={{
                          fontSize: 13,
                          marginBottom: 6,
                          fontWeight: 700,
                        }}
                      >
                        Note
                      </div>
                      <textarea
                        value={activeCell.note}
                        onChange={(e) =>
                          updateCell(activeCell.id, (cell) => ({
                            ...cell,
                            note: e.target.value,
                          }))
                        }
                        style={area}
                        placeholder="Exemple : serre, rang sud, variété précise..."
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      Déplacer la case
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: 8,
                      }}
                    >
                      <div />
                      <button
                        onClick={() => moveSelected("up")}
                        style={softBtn}
                      >
                        ↑
                      </button>
                      <div />
                      <button
                        onClick={() => moveSelected("left")}
                        style={softBtn}
                      >
                        ←
                      </button>
                      <button
                        onClick={() => moveSelected("down")}
                        style={softBtn}
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => moveSelected("right")}
                        style={softBtn}
                      >
                        →
                      </button>
                    </div>

                    {activeCell.zoneType === "plant" ? (
                      <div
                        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                      >
                        <button
                          onClick={() => removePlant(activeCell)}
                          style={softBtn}
                        >
                          -1 plant
                        </button>
                        <button
                          onClick={() => addPlant(activeCell)}
                          style={softBtn}
                        >
                          +1 plant
                        </button>
                        <button
                          onClick={() =>
                            updateCell(activeCell.id, (cell) => ({
                              ...cell,
                              count: 0,
                            }))
                          }
                          style={softBtn}
                        >
                          Vider les plants
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => applyQuick(activeCell)}
                        style={softBtn}
                      >
                        Transformer en {plants[quickPlant].name}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: "#6b7280" }}>
                  Sélectionne une case pour l’éditer.
                </div>
              )}
            </Card>

            <Card
              title="☁️ Météo locale"
              right={
                <div style={{ color: "#6b7280", fontSize: 13 }}>{CITY}</div>
              }
            >
              {weather ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 14,
                      padding: 14,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ color: "#6b7280", fontSize: 13 }}>
                      Température
                    </div>
                    <div style={{ fontSize: 30, fontWeight: 800 }}>
                      {weather.temperature}°C
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 14,
                      padding: 14,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ color: "#6b7280", fontSize: 13 }}>Vent</div>
                    <div style={{ fontSize: 30, fontWeight: 800 }}>
                      {weather.windspeed} km/h
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>
                  Météo indisponible pour le moment.
                </div>
              )}
            </Card>

            <Card title="🚨 Alertes">
              {alerts.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {alerts.map((alert, i) => (
                    <div
                      key={`${alert}-${i}`}
                      style={{
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        borderRadius: 12,
                        padding: "10px 12px",
                        fontSize: 14,
                        lineHeight: 1.45,
                      }}
                    >
                      {alert}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>
                  Aucune alerte pour l’instant.
                </div>
              )}
            </Card>

            <Card title="🗓️ Tâches du moment">
              {calendarTasks.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {calendarTasks.map((task, i) => (
                    <div
                      key={`${task}-${i}`}
                      style={{
                        background: "#ecfeff",
                        border: "1px solid #a5f3fc",
                        borderRadius: 12,
                        padding: "10px 12px",
                        fontSize: 14,
                        lineHeight: 1.45,
                      }}
                    >
                      {task}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>Aucune tâche détectée.</div>
              )}
            </Card>

            <Card title="📊 Répartition des plants">
              {plantBreakdown.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {plantBreakdown.map(([key, count]) => (
                    <div
                      key={key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        background: "#f8fafc",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
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

            <Card
              title="📝 Journal"
              right={
                <button onClick={clearJournal} style={softBtn}>
                  Vider
                </button>
              }
            >
              {journal.length ? (
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    maxHeight: 320,
                    overflow: "auto",
                  }}
                >
                  {journal.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        background: "#f8fafc",
                        border: "1px solid #e5e7eb",
                        borderRadius: 12,
                        padding: "10px 12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 12,
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, color: "#6b7280" }}>
                            {entry.date}
                          </div>
                          <div style={{ marginTop: 4, lineHeight: 1.45 }}>
                            {entry.text}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteJournalEntry(entry.id)}
                          style={m()}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>Le journal est vide.</div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Repère 6/6 — fin du fichier
