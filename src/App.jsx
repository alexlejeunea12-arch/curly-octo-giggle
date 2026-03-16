import React, { useEffect, useMemo, useRef, useState } from "react";

// Repère 1/6 — constantes, helpers, catalogue
const CITY = "Saint-Germain-lès-Arpajon (91180)";
const LAT = 48.616;
const LON = 2.258;
const STORAGE = "potager_mobile_clean_v1";

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
    minHeight: 90,
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
    makeCell("Bande piments / poivrons", "plant", { plant: "piment", count: 4, sunBase: 3 }),
    makeCell("Tomates fond gauche", "plant", { plant: "tomate", count: 3, sunBase: 3 }),
    makeCell("Tomates fond droit", "plant", { plant: "tomateCerise", count: 3, sunBase: 3 }),
    makeCell("Serre", "greenhouse", { sunBase: 3 }),
    makeCell("Allée centrale", "path", { sunBase: 2 }),
    makeCell("Salades / herbes", "plant", { plant: "salade", count: 6, sunBase: 2 }),
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
  };
}

function normalizePotager(raw, index = 0) {
  const cells = (Array.isArray(raw?.cells) && raw.cells.length ? raw.cells : defaultCells()).map(
    (cell) => {
      const zoneType = zoneMeta[cell?.zoneType] ? cell.zoneType : "empty";
      return {
        id: cell?.id || uid(),
        label: cell?.label || "Nouvelle case",
        zoneType,
        plant: zoneType === "plant" ? (plants[cell?.plant] ? cell.plant : "tomate") : "vide",
        count: zoneType === "plant" ? Math.max(0, Number(cell?.count || 0)) : 0,
        sunBase: clamp(Number(cell?.sunBase || 0), 0, 3),
        note: cell?.note || "",
      };
    }
  );

  return {
    id: raw?.id || uid(),
    name: raw?.name || `Potager ${index + 1}`,
    cells,
    cols: clamp(Number(raw?.cols || 4), 1, 8),
    selectedId: cells.some((cell) => cell.id === raw?.selectedId)
      ? raw.selectedId
      : cells[0]?.id || null,
    quickPlant: plants[raw?.quickPlant] ? raw.quickPlant : "tomate",
    orientation: ["south", "north", "west", "east"].includes(raw?.orientation)
      ? raw.orientation
      : "south",
    sunMode: clamp(Number(raw?.sunMode || 2), 1, 3),
    zoom: clamp(Number(raw?.zoom || 100), 60, 150),
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

// Repère 2/6 — composant principal et états
export default function App() {
  const initial = getInitialData();
  const [potagers, setPotagers] = useState(initial.potagers);
  const [activePotagerId, setActivePotagerId] = useState(initial.activePotagerId);
  const [weather, setWeather] = useState(null);
  const [screenWidth, setScreenWidth] = useState(() => window.innerWidth);
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const importRef = useRef(null);
  useEffect(() => {
    localStorage.setItem(STORAGE, JSON.stringify({ potagers, activePotagerId }));
  }, [potagers, activePotagerId]);

  useEffect(() => {
    const onResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`
    )
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
  const isVerySmall = screenWidth <= 560;

  const activePotager = useMemo(
    () => potagers.find((potager) => potager.id === activePotagerId) || potagers[0] || null,
    [potagers, activePotagerId]
  );

  const cells = activePotager?.cells || [];
  const cols = activePotager?.cols || 4;
  const selectedId = activePotager?.selectedId || null;
  const quickPlant = activePotager?.quickPlant || "tomate";
  const orientation = activePotager?.orientation || "south";
  const sunMode = activePotager?.sunMode || 2;
  const zoom = activePotager?.zoom || 100;

  function updateActivePotager(updater) {
    if (!activePotager) return;

    setPotagers((prev) =>
      prev.map((potager) => {
        if (potager.id !== activePotager.id) return potager;

        const next = updater(potager);
        const nextCells = Array.isArray(next.cells) && next.cells.length ? next.cells : [makeCell()];

        return {
          ...next,
          cells: nextCells,
          cols: clamp(Number(next.cols || 4), 1, 8),
          selectedId: nextCells.some((cell) => cell.id === next.selectedId)
            ? next.selectedId
            : nextCells[0]?.id || null,
          quickPlant: plants[next.quickPlant] ? next.quickPlant : "tomate",
          orientation: ["south", "north", "west", "east"].includes(next.orientation)
            ? next.orientation
            : "south",
          sunMode: clamp(Number(next.sunMode || 2), 1, 3),
          zoom: clamp(Number(next.zoom || 100), 60, 150),
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
    if (isMobile) {
      if (zoom <= 80) return 120;
      if (zoom <= 100) return 150;
      if (zoom <= 120) return 175;
      return 195;
    }
    if (zoom <= 80) return 125;
    if (zoom <= 100) return 150;
    if (zoom <= 125) return 185;
    return 210;
  }, [zoom, isMobile]);

  const cellMinHeight = useMemo(() => {
    if (isMobile) {
      if (zoom <= 80) return 150;
      if (zoom <= 100) return 178;
      if (zoom <= 120) return 204;
      return 225;
    }
    if (zoom <= 80) return 145;
    if (zoom <= 100) return 185;
    if (zoom <= 125) return 225;
    return 250;
  }, [zoom, isMobile]);

  const iconSize = zoom <= 80 ? 28 : zoom <= 100 ? 38 : zoom <= 125 ? 46 : 54;
  const titleSize = zoom <= 80 ? 13 : zoom <= 100 ? 15 : zoom <= 125 ? 17 : 18;
  const textSize = zoom <= 80 ? 12 : zoom <= 100 ? 14 : zoom <= 125 ? 15 : 16;
  const mobileGridCols = isVerySmall ? 1 : zoom <= 85 ? 2 : 1;
  const planGridCols = isMobile ? mobileGridCols : cols;

  // Repère 3/6 — actions potagers, partage, import/export
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
      [
        JSON.stringify(
          {
            type: "assistant-potager-single",
            potager: activePotager,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(activePotager.name || "potager")
      .replace(/\s+/g, "-")
      .toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function exportAllPotagers() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            type: "assistant-potager-all",
            potagers,
            activePotagerId,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        ),
      ],
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
          const nextPotagers = parsed.potagers.map((potager, index) =>
            normalizePotager(potager, index)
          );
          if (!nextPotagers.length) throw new Error("empty");

          setPotagers(nextPotagers);
          setActivePotagerId(
            nextPotagers.some((potager) => potager.id === parsed.activePotagerId)
              ? parsed.activePotagerId
              : nextPotagers[0].id
          );
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
      `Plants : ${totalPlants}`,
      `Arrosage estimé : ${waterNeed} L / jour`,
      `Récolte estimée : ${harvestEstimate} kg`,
      `Lien actuel : ${window.location.href}`,
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({
          title: activePotager.name,
          text: summary,
          url: window.location.href,
        });
      } catch {
        // partage annulé
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
  // Repère 4/6 — actions grille, calculs, météo
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
  }

  function insertAfterSelected() {
    if (!activeCell) {
      addCase();
      return;
    }

    const next = makeCell("Nouvelle case", "empty");
    const index = cells.findIndex((cell) => cell.id === activeCell.id);

    updateActivePotager((potager) => {
      const copy = [...potager.cells];
      copy.splice(index + 1, 0, next);
      return { ...potager, cells: copy, selectedId: next.id };
    });
  }

  function addRow() {
    const row = Array.from(
      { length: Math.max(1, isMobile ? mobileGridCols : cols) },
      (_, index) => makeCell(`Nouvelle case ${index + 1}`, "empty")
    );

    updateActivePotager((potager) => ({
      ...potager,
      cells: [...potager.cells, ...row],
      selectedId: row[0].id,
    }));
  }

  function duplicateSelected() {
    if (!activeCell) return;

    const next = {
      ...activeCell,
      id: uid(),
      label: `${activeCell.label} copie`,
    };

    updateActivePotager((potager) => ({
      ...potager,
      cells: [...potager.cells, next],
      selectedId: next.id,
    }));
  }

  function deleteSelected() {
    if (!activeCell || cells.length <= 1) return;

    updateActivePotager((potager) => ({
      ...potager,
      cells: potager.cells.filter((cell) => cell.id !== activeCell.id),
    }));
  }

  function moveSelected(direction) {
    if (!activeCell) return;

    const step = isMobile ? mobileGridCols : cols;
    const index = cells.findIndex((cell) => cell.id === activeCell.id);

    let target = index;
    if (direction === "left") target = index - 1;
    if (direction === "right") target = index + 1;
    if (direction === "up") target = index - step;
    if (direction === "down") target = index + step;

    if (target < 0 || target >= cells.length) return;

    updateActivePotager((potager) => {
      const copy = [...potager.cells];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return { ...potager, cells: copy };
    });
  }

  function resetCurrentPotager() {
    const fresh = defaultCells();
    updateActivePotager((potager) => ({
      ...potager,
      cells: fresh,
      cols: 4,
      selectedId: fresh[0]?.id || null,
      quickPlant: "tomate",
      orientation: "south",
      sunMode: 2,
      zoom: 100,
    }));
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

  const totalPlants = useMemo(
    () => cells.reduce((sum, cell) => sum + Number(cell.count || 0), 0),
    [cells]
  );

  const waterNeed = useMemo(
    () =>
      cells
        .reduce(
          (sum, cell) =>
            sum + Number(cell.count || 0) * Number(plants[cell.plant]?.water || 0),
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
            sum + Number(cell.count || 0) * Number(plants[cell.plant]?.yield || 0),
          0
        )
        .toFixed(1),
    [cells]
  );

  const alerts = useMemo(() => {
    const list = [];

    cells.forEach((cell) => {
      if (cell.zoneType !== "plant" || Number(cell.count || 0) <= 0) return;
      const plant = plants[cell.plant];

      if (plant.sunNeed > sunOf(cell)) {
        list.push(`☀️ ${plant.name} manque de soleil dans ${cell.label}`);
      }
      if (Number(cell.count || 0) >= 8) {
        list.push(`📏 ${cell.label} semble chargé : surveiller l’espacement`);
      }

      list.push(`💧 Arroser ${plant.name} dans ${cell.label}`);
    });

    if (weather?.temperature >= 28) list.push("🔥 Forte chaleur : arroser le soir");
    if (weather?.temperature <= 5) list.push("❄️ Risque de froid pour les jeunes plants");
    if (weather?.windspeed >= 35) list.push("💨 Vent fort : protéger les plants");

    return [...new Set(list)];
  }, [cells, weather, sunMode]);

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

    if (weather?.temperature >= 24) {
      tasks.push("🌤 Vérifier les zones en plein soleil");
    }

    return [...new Set(tasks)];
  }, [cells, weather]);
  // Repère 5/6 — rendu principal
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
      <div style={{ maxWidth: 1550, margin: "0 auto" }}>
        <input
          ref={importRef}
          type="file"
          accept=".json,application/json"
          style={{ display: "none" }}
          onChange={importData}
        />

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
            <h1 style={{ margin: 0, fontSize: isMobile ? 30 : 42 }}>
              🌱 Assistant Potager Mobile
            </h1>
            <div style={{ marginTop: 6, color: "#4b5563", lineHeight: 1.4 }}>
              Version téléphone / PC responsive • multi-potagers • import / export • partage rapide
            </div>
          </div>

          {isMobile ? (
            <div style={{ width: "100%", display: "grid", gap: 10 }}>
              <button
                onClick={() => setMobileActionsOpen((value) => !value)}
                style={primaryBtn(mobileActionsOpen ? "#111827" : "#2563eb")}
              >
                {mobileActionsOpen ? "Fermer les actions" : "Ouvrir les actions"}
              </button>

              {mobileActionsOpen ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  <button onClick={createNewPotager} style={primaryBtn("#2563eb")}>Nouveau</button>
                  <button onClick={duplicateActivePotager} style={primaryBtn("#0f766e")}>Dupliquer</button>
                  <button onClick={importClick} style={primaryBtn("#7c3aed")}>Importer</button>
                  <button onClick={exportActivePotager} style={primaryBtn("#9333ea")}>Exporter</button>
                  <button onClick={shareActivePotager} style={primaryBtn("#ea580c")}>Partager</button>
                  <button onClick={resetCurrentPotager} style={primaryBtn("#111827")}>Reset</button>
                </div>
              ) : null}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={createNewPotager} style={primaryBtn("#2563eb")}>Nouveau potager</button>
              <button onClick={duplicateActivePotager} style={primaryBtn("#0f766e")}>Dupliquer</button>
              <button onClick={importClick} style={primaryBtn("#7c3aed")}>Importer</button>
              <button onClick={exportActivePotager} style={primaryBtn("#9333ea")}>Exporter ce potager</button>
              <button onClick={exportAllPotagers} style={primaryBtn("#6d28d9")}>Exporter tout</button>
              <button onClick={shareActivePotager} style={primaryBtn("#ea580c")}>Partager</button>
              <button onClick={resetCurrentPotager} style={primaryBtn("#111827")}>Réinitialiser</button>
            </div>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(860px, 1fr) 400px",
            gap: 20,
            alignItems: "start",
          }}
        >
          <div style={{ display: "grid", gap: 18 }}>
            <Card title="🗂 Potagers">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "220px 1fr auto",
                  gap: 12,
                  alignItems: "end",
                }}
              >
                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
                    Potager actif
                  </div>
                  <select
                    value={activePotagerId}
                    onChange={(e) => setActivePotagerId(e.target.value)}
                    style={fieldStyle()}
                  >
                    {potagers.map((potager) => (
                      <option key={potager.id} value={potager.id}>
                        {potager.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Nom</div>
                  <input
                    value={activePotager?.name || ""}
                    onChange={(e) => renameActivePotager(e.target.value)}
                    style={fieldStyle()}
                    placeholder="Nom du potager"
                  />
                </label>

                <button
                  onClick={deleteActivePotager}
                  disabled={potagers.length <= 1}
                  style={primaryBtn(potagers.length > 1 ? "#b91c1c" : "#9ca3af")}
                >
                  Supprimer
                </button>
              </div>

              <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {potagers.map((potager) => {
                  const selected = potager.id === activePotagerId;
                  return (
                    <button
                      key={potager.id}
                      onClick={() => setActivePotagerId(potager.id)}
                      style={{
                        border: selected ? "2px solid #111827" : "1px solid #d1d5db",
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
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(180px, 1fr))",
                gap: 14,
              }}
            >
              <StatCard icon="🌿" label="Plants au total" value={totalPlants} subtitle="Dans le potager actif" />
              <StatCard icon="💧" label="Arrosage estimé / jour" value={`${waterNeed} L`} subtitle="Estimation théorique" />
              <StatCard icon="🧺" label="Récolte estimée" value={`${harvestEstimate} kg`} subtitle="Potentiel global approximatif" />
            </div>

            <Card
              title="🗺 Plan du jardin"
              right={
                <div style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}>
                  {terraceText(orientation)}
                </div>
              }
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 250px",
                  gap: 16,
                  marginBottom: 18,
                }}
              >
                <div style={{ display: "grid", gap: 10 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile
                        ? "repeat(2, minmax(0, 1fr))"
                        : "repeat(4, minmax(140px, 1fr))",
                      gap: 10,
                    }}
                  >
                    <label>
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
                        Colonnes
                      </div>
                      <select
                        value={cols}
                        onChange={(e) =>
                          updateActivePotager((potager) => ({
                            ...potager,
                            cols: clamp(Number(e.target.value) || 4, 1, 8),
                          }))
                        }
                        style={fieldStyle()}
                      >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                        <option value={7}>7</option>
                        <option value={8}>8</option>
                      </select>
                    </label>

                    <label>
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
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
                        style={fieldStyle()}
                      >
                        <option value="south">Terrasse en bas</option>
                        <option value="north">Terrasse en haut</option>
                        <option value="west">Terrasse à gauche</option>
                        <option value="east">Terrasse à droite</option>
                      </select>
                    </label>

                    <label>
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
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
                        style={fieldStyle()}
                      >
                        <option value={1}>Matin / ombre</option>
                        <option value={2}>Normal</option>
                        <option value={3}>Plein soleil</option>
                      </select>
                    </label>

                    <label>
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
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
                        style={fieldStyle()}
                      >
                        {Object.keys(plants)
                          .filter((key) => key !== "vide")
                          .map((key) => (
                            <option key={key} value={key}>
                              {plants[key].icon} {plants[key].name}
                            </option>
                          ))}
                      </select>
                    </label>
                  </div>

                  <label>
                    <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
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
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      {zoom}% • {zoomText(zoom)} • {cells.length >= 24 ? "Dézoomer aide souvent" : "Taille confortable"}
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
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Repères</div>
                  <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.65 }}>
                    <div>• Le zoom agit sur la taille des cases</div>
                    <div>• Sur téléphone, la grille passe en 1 ou 2 colonnes</div>
                    <div>• Le bouton partager utilise si possible le menu natif</div>
                    <div>• Exporter crée un fichier JSON à transmettre</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                <button onClick={addCase} style={primaryBtn("#2563eb")}>Ajouter une case</button>
                <button onClick={insertAfterSelected} style={primaryBtn("#1d4ed8")}>Insérer après</button>
                <button onClick={addRow} style={primaryBtn("#059669")}>Ajouter une ligne</button>
                <button onClick={duplicateSelected} style={primaryBtn("#0f766e")}>Dupliquer la case</button>
                <button
                  onClick={deleteSelected}
                  disabled={cells.length <= 1}
                  style={primaryBtn(cells.length > 1 ? "#b91c1c" : "#9ca3af")}
                >
                  Supprimer la case
                </button>
              </div>

              <div style={{ overflowX: "auto", paddingBottom: 6 }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${planGridCols}, minmax(${cellMinWidth}px, 1fr))`,
                    gap: 14,
                    minWidth: isMobile ? "100%" : "max-content",
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
                            cell.zoneType === "terrace" || cell.zoneType === "tree"
                              ? "#fff"
                              : "#111827",
                          boxShadow: selected
                            ? "0 0 0 3px #111827 inset, 0 10px 24px rgba(0,0,0,0.16)"
                            : "0 10px 24px rgba(0,0,0,0.08)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
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
                            <div style={{ fontWeight: 800, lineHeight: 1.25, fontSize: titleSize }}>
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

                          <div style={{ fontSize: iconSize, marginTop: 8 }}>{iconOf(cell)}</div>

                          <div style={{ marginTop: 6, fontWeight: 700, fontSize: textSize }}>
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
                          <div>Plants : {isPlant ? Number(cell.count || 0) : "—"}</div>
                          <div>☀ Soleil : {sunOf(cell)}/3</div>

                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                            {isPlant ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removePlant(cell);
                                  }}
                                  style={miniBtn()}
                                >
                                  -1
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addPlant(cell);
                                  }}
                                  style={miniBtn()}
                                >
                                  +1
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    applyQuick(cell);
                                  }}
                                  style={miniBtn("rgba(255,255,255,0.88)")}
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
                                style={miniBtn()}
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
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Nom</div>
                      <input
                        value={activeCell.label}
                        onChange={(e) =>
                          updateCell(activeCell.id, (cell) => ({
                            ...cell,
                            label: e.target.value,
                          }))
                        }
                        style={fieldStyle()}
                      />
                    </label>

                    <label>
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
                        Type de zone
                      </div>
                      <select
                        value={activeCell.zoneType}
                        onChange={(e) => setSelectedZoneType(e.target.value)}
                        style={fieldStyle()}
                      >
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
                          <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
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
                            style={fieldStyle()}
                          >
                            {Object.keys(plants)
                              .filter((key) => key !== "vide")
                              .map((key) => (
                                <option key={key} value={key}>
                                  {plants[key].icon} {plants[key].name}
                                </option>
                              ))}
                          </select>
                        </label>

                        <label>
                          <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
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
                            style={fieldStyle()}
                          />
                        </label>
                      </>
                    ) : null}

                    <label>
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>
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
                        style={fieldStyle()}
                      >
                        <option value={0}>0</option>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                      </select>
                    </label>

                    <label>
                      <div style={{ fontSize: 13, marginBottom: 6, fontWeight: 700 }}>Note</div>
                      <textarea
                        value={activeCell.note}
                        onChange={(e) =>
                          updateCell(activeCell.id, (cell) => ({
                            ...cell,
                            note: e.target.value,
                          }))
                        }
                        style={areaStyle()}
                        placeholder="Exemple : serre, rang sud, variété précise..."
                      />
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

                    {activeCell.zoneType === "plant" ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={() => removePlant(activeCell)} style={softBtn()}>
                          -1 plant
                        </button>
                        <button onClick={() => addPlant(activeCell)} style={softBtn()}>
                          +1 plant
                        </button>
                        <button
                          onClick={() =>
                            updateCell(activeCell.id, (cell) => ({
                              ...cell,
                              count: 0,
                            }))
                          }
                          style={softBtn()}
                        >
                          Vider les plants
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => applyQuick(activeCell)} style={softBtn()}>
                        Transformer en {plants[quickPlant].name}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: "#6b7280" }}>Sélectionne une case pour l’éditer.</div>
              )}
            </Card>

            <Card title="📤 Partage rapide">
              <div style={{ display: "grid", gap: 10 }}>
                <button onClick={shareActivePotager} style={primaryBtn("#ea580c")}>
                  Partager le potager actif
                </button>
                <button onClick={exportActivePotager} style={primaryBtn("#9333ea")}>
                  Exporter le potager actif
                </button>
                <button onClick={exportAllPotagers} style={primaryBtn("#6d28d9")}>
                  Exporter tous les potagers
                </button>
                <button onClick={importClick} style={primaryBtn("#7c3aed")}>
                  Importer un fichier
                </button>
              </div>

              <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
                Sur téléphone, le bouton partager utilise si possible le menu de partage natif.
                Pour envoyer le travail facilement à quelqu’un, le plus simple reste souvent
                d’exporter le JSON ou de publier ensuite le projet sur une URL.
              </div>
            </Card>

            <Card
              title="☁️ Météo locale"
              right={<div style={{ color: "#6b7280", fontSize: 13 }}>{CITY}</div>}
            >
              {weather ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 14,
                      padding: 14,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div style={{ color: "#6b7280", fontSize: 13 }}>Température</div>
                    <div style={{ fontSize: 30, fontWeight: 800 }}>{weather.temperature}°C</div>
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
                    <div style={{ fontSize: 30, fontWeight: 800 }}>{weather.windspeed} km/h</div>
                  </div>
                </div>
              ) : (
                <div style={{ color: "#6b7280" }}>Météo indisponible pour le moment.</div>
              )}
            </Card>

            <Card title="🚨 Alertes">
              {alerts.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {alerts.map((alert, index) => (
                    <div
                      key={`${alert}-${index}`}
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
                <div style={{ color: "#6b7280" }}>Aucune alerte pour l’instant.</div>
              )}
            </Card>

            <Card title="🗓️ Tâches du mois">
              {monthTasks.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {monthTasks.map((task, index) => (
                    <div
                      key={`${task}-${index}`}
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
                <div style={{ color: "#6b7280" }}>Aucune tâche détectée pour le moment.</div>
              )}
            </Card>

            <Card title="📊 Répartition des plants">
              {breakdown.length ? (
                <div style={{ display: "grid", gap: 8 }}>
                  {breakdown.map(([key, count]) => (
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
        </div>
      </div>
    </div>
  );
}

// Repère 6/6 — fin du fichier
