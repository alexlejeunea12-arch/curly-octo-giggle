import React, { useEffect, useMemo, useState } from "react";

const MOBILE_BREAKPOINT = 900;

const initialPlots = [
  {
    id: 1,
    name: "Potager principal",
    zones: [
      {
        id: 101,
        name: "Bande piments / poivrons",
        type: "Culture",
        plant: "Piment",
        count: 4,
        sun: 3,
        note: "",
        color: "#ef4444",
      },
      {
        id: 102,
        name: "Tomates fond gauche",
        type: "Culture",
        plant: "Tomate",
        count: 6,
        sun: 3,
        note: "",
        color: "#f97316",
      },
      {
        id: 103,
        name: "Tomates fond droit",
        type: "Culture",
        plant: "Tomate cerise",
        count: 6,
        sun: 3,
        note: "",
        color: "#fb923c",
      },
      {
        id: 104,
        name: "Pelouse centrale 1",
        type: "Pelouse",
        plant: "Pelouse",
        count: 0,
        sun: 2,
        note: "",
        color: "#84cc16",
      },
    ],
  },
];

function getAutoMode() {
  if (typeof window === "undefined") return "desktop";
  return window.innerWidth < MOBILE_BREAKPOINT ? "mobile" : "desktop";
}

function App() {
  const [plots, setPlots] = useState(() => {
    try {
      const saved = localStorage.getItem("assistant-potager-plots");
      return saved ? JSON.parse(saved) : initialPlots;
    } catch {
      return initialPlots;
    }
  });

  const [activePlotId, setActivePlotId] = useState(() => {
    try {
      const saved = localStorage.getItem("assistant-potager-active-plot");
      return saved ? Number(saved) : initialPlots[0].id;
    } catch {
      return initialPlots[0].id;
    }
  });

  const [selectedZoneId, setSelectedZoneId] = useState(() => {
    try {
      const saved = localStorage.getItem("assistant-potager-selected-zone");
      return saved ? Number(saved) : initialPlots[0].zones[0].id;
    } catch {
      return initialPlots[0].zones[0].id;
    }
  });

  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem("assistant-potager-view-mode") || "auto";
    } catch {
      return "auto";
    }
  });

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const [columns, setColumns] = useState(4);
  const [orientation, setOrientation] = useState("Terrasse en bas");
  const [globalSun, setGlobalSun] = useState("Normal");
  const [quickPlant, setQuickPlant] = useState("Tomate");
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    localStorage.setItem("assistant-potager-plots", JSON.stringify(plots));
  }, [plots]);

  useEffect(() => {
    localStorage.setItem("assistant-potager-active-plot", String(activePlotId));
  }, [activePlotId]);

  useEffect(() => {
    localStorage.setItem("assistant-potager-selected-zone", String(selectedZoneId));
  }, [selectedZoneId]);

  useEffect(() => {
    localStorage.setItem("assistant-potager-view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const effectiveMode = viewMode === "auto" ? getAutoMode() : viewMode;
  const isMobile = effectiveMode === "mobile";

  const activePlot =
    plots.find((plot) => plot.id === activePlotId) || plots[0];

  const selectedZone =
    activePlot?.zones.find((zone) => zone.id === selectedZoneId) ||
    activePlot?.zones?.[0] ||
    null;

  const totalPlants = useMemo(() => {
    if (!activePlot) return 0;
    return activePlot.zones.reduce((sum, zone) => sum + (Number(zone.count) || 0), 0);
  }, [activePlot]);

  const estimatedWater = useMemo(() => {
    return (totalPlants * 0.7).toFixed(1);
  }, [totalPlants]);

  const estimatedHarvest = useMemo(() => {
    return (totalPlants * 1.0).toFixed(1);
  }, [totalPlants]);

  function updateSelectedZone(patch) {
    setPlots((current) =>
      current.map((plot) => {
        if (plot.id !== activePlotId) return plot;
        return {
          ...plot,
          zones: plot.zones.map((zone) =>
            zone.id === selectedZoneId ? { ...zone, ...patch } : zone
          ),
        };
      })
    );
  }

  function createNewPlot() {
    const id = Date.now();
    const newPlot = {
      id,
      name: `Potager ${plots.length + 1}`,
      zones: [
        {
          id: id + 1,
          name: "Nouvelle zone",
          type: "Culture",
          plant: "Tomate",
          count: 1,
          sun: 3,
          note: "",
          color: "#22c55e",
        },
      ],
    };
    setPlots((current) => [...current, newPlot]);
    setActivePlotId(newPlot.id);
    setSelectedZoneId(newPlot.zones[0].id);
  }

  function duplicatePlot() {
    if (!activePlot) return;
    const base = Date.now();
    const duplicated = {
      ...activePlot,
      id: base,
      name: `${activePlot.name} copie`,
      zones: activePlot.zones.map((zone, index) => ({
        ...zone,
        id: base + index + 1,
      })),
    };
    setPlots((current) => [...current, duplicated]);
    setActivePlotId(duplicated.id);
    setSelectedZoneId(duplicated.zones[0]?.id || 0);
  }

  function deletePlot() {
    if (plots.length <= 1) return;
    const nextPlots = plots.filter((plot) => plot.id !== activePlotId);
    setPlots(nextPlots);
    setActivePlotId(nextPlots[0].id);
    setSelectedZoneId(nextPlots[0].zones[0]?.id || 0);
  }

  function resetPlot() {
    if (!activePlot) return;
    setPlots((current) =>
      current.map((plot) =>
        plot.id === activePlotId ? initialPlots[0] : plot
      )
    );
    setSelectedZoneId(initialPlots[0].zones[0].id);
  }

  function addZone() {
    const id = Date.now();
    const newZone = {
      id,
      name: `Nouvelle zone ${activePlot.zones.length + 1}`,
      type: "Culture",
      plant: quickPlant,
      count: 1,
      sun: 3,
      note: "",
      color: "#3b82f6",
    };

    setPlots((current) =>
      current.map((plot) =>
        plot.id === activePlotId
          ? { ...plot, zones: [...plot.zones, newZone] }
          : plot
      )
    );
    setSelectedZoneId(id);
  }

  function duplicateZone() {
    if (!selectedZone) return;
    const id = Date.now();
    const copy = {
      ...selectedZone,
      id,
      name: `${selectedZone.name} copie`,
    };
    setPlots((current) =>
      current.map((plot) =>
        plot.id === activePlotId
          ? { ...plot, zones: [...plot.zones, copy] }
          : plot
      )
    );
    setSelectedZoneId(id);
  }

  function deleteZone() {
    if (!activePlot || activePlot.zones.length <= 1) return;
    const nextZones = activePlot.zones.filter((zone) => zone.id !== selectedZoneId);
    setPlots((current) =>
      current.map((plot) =>
        plot.id === activePlotId ? { ...plot, zones: nextZones } : plot
      )
    );
    setSelectedZoneId(nextZones[0]?.id || 0);
  }

  function moveZone(direction) {
    if (!activePlot || !selectedZone) return;
    const currentIndex = activePlot.zones.findIndex((z) => z.id === selectedZone.id);
    const nextIndex =
      direction === "left" ? currentIndex - 1 : direction === "right" ? currentIndex + 1 : currentIndex;

    if (nextIndex < 0 || nextIndex >= activePlot.zones.length) return;

    const reordered = [...activePlot.zones];
    [reordered[currentIndex], reordered[nextIndex]] = [
      reordered[nextIndex],
      reordered[currentIndex],
    ];

    setPlots((current) =>
      current.map((plot) =>
        plot.id === activePlotId ? { ...plot, zones: reordered } : plot
      )
    );
  }

  const appShellStyle = {
    minHeight: "100vh",
    background: "#f6f7f5",
    color: "#111827",
    fontFamily: "Arial, sans-serif",
    padding: isMobile ? 12 : 24,
  };

  const topBarStyle = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    alignItems: isMobile ? "stretch" : "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  };

  const titleWrapStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const actionsWrapStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: isMobile ? "stretch" : "flex-end",
  };

  const modeWrapStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  };

  const buttonStyle = (bg, color = "#fff") => ({
    border: "none",
    borderRadius: 10,
    padding: isMobile ? "12px 14px" : "10px 14px",
    background: bg,
    color,
    fontWeight: 700,
    cursor: "pointer",
    minHeight: isMobile ? 44 : "auto",
  });

  const cardStyle = {
    background: "#fff",
    borderRadius: 18,
    padding: isMobile ? 14 : 18,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  };

  const mainGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.5fr) minmax(320px, 420px)",
    gap: 16,
    alignItems: "start",
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
    gap: 12,
  };

  const fieldsGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
    gap: 12,
  };

  const controlsGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, minmax(120px, 1fr))",
    gap: 10,
    marginBottom: 12,
  };

  const zonesGridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile
      ? "1fr"
      : `repeat(${Math.max(1, Math.min(columns, 6))}, minmax(180px, 1fr))`,
    gap: 12,
    transform: `scale(${zoom / 100})`,
    transformOrigin: "top left",
    width: isMobile ? "100%" : `${100 / (zoom / 100)}%`,
  };

  return (
    <div style={appShellStyle}>
      <div style={topBarStyle}>
        <div style={titleWrapStyle}>
          <h1 style={{ margin: 0, fontSize: isMobile ? 34 : 48 }}>🌱 Assistant Potager</h1>
          <div style={{ color: "#6b7280", fontSize: isMobile ? 14 : 16 }}>
            Multi-potagers • sauvegarde locale • zoom de grille • édition complète • météo
          </div>

          <div style={modeWrapStyle}>
            <span style={{ fontWeight: 700, alignSelf: "center" }}>Affichage :</span>
            <button
              style={buttonStyle(viewMode === "auto" ? "#1d4ed8" : "#d1d5db", viewMode === "auto" ? "#fff" : "#111")}
              onClick={() => setViewMode("auto")}
            >
              Auto
            </button>
            <button
              style={buttonStyle(viewMode === "mobile" ? "#059669" : "#d1d5db", viewMode === "mobile" ? "#fff" : "#111")}
              onClick={() => setViewMode("mobile")}
            >
              Mobile
            </button>
            <button
              style={buttonStyle(viewMode === "desktop" ? "#7c3aed" : "#d1d5db", viewMode === "desktop" ? "#fff" : "#111")}
              onClick={() => setViewMode("desktop")}
            >
              Ordinateur
            </button>
            <span style={{ color: "#6b7280", alignSelf: "center", fontSize: 13 }}>
              Mode actif : {effectiveMode} • largeur : {windowWidth}px
            </span>
          </div>
        </div>

        <div style={actionsWrapStyle}>
          <button style={buttonStyle("#2563eb")} onClick={createNewPlot}>
            Nouveau potager
          </button>
          <button style={buttonStyle("#059669")} onClick={duplicatePlot}>
            Dupliquer le potager
          </button>
          <button style={buttonStyle("#6b7280")} onClick={deletePlot}>
            Supprimer le potager
          </button>
          <button style={buttonStyle("#111827")} onClick={resetPlot}>
            Réinitialiser ce potager
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>📁 Gestion des potagers</h2>
        <div style={fieldsGridStyle}>
          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Potager actif</label>
            <select
              value={activePlotId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setActivePlotId(id);
                const plot = plots.find((p) => p.id === id);
                setSelectedZoneId(plot?.zones?.[0]?.id || 0);
              }}
              style={inputStyle(isMobile)}
            >
              {plots.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Nom du potager</label>
            <input
              value={activePlot?.name || ""}
              onChange={(e) =>
                setPlots((current) =>
                  current.map((plot) =>
                    plot.id === activePlotId ? { ...plot, name: e.target.value } : plot
                  )
                )
              }
              style={inputStyle(isMobile)}
            />
          </div>
        </div>
      </div>

      <div style={{ ...statsGridStyle, marginBottom: 16 }}>
        <StatCard title="Plants au total" value={totalPlants} subtitle="Dans le potager actif" />
        <StatCard title="Arrosage estimé / jour" value={`${estimatedWater} L`} subtitle="Estimation théorique" />
        <StatCard title="Récolte estimée" value={`${estimatedHarvest} kg`} subtitle="Potentiel global approximatif" />
      </div>

      <div style={mainGridStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>🪴 Plan du jardin</h2>

            <div style={controlsGridStyle}>
              <SelectField
                label="Colonnes"
                value={columns}
                onChange={(e) => setColumns(Number(e.target.value))}
                options={[1, 2, 3, 4, 5, 6]}
                isMobile={isMobile}
              />
              <SelectField
                label="Orientation"
                value={orientation}
                onChange={(e) => setOrientation(e.target.value)}
                options={["Terrasse en bas", "Terrasse à gauche", "Terrasse à droite", "Terrasse en haut"]}
                isMobile={isMobile}
              />
              <SelectField
                label="Soleil global"
                value={globalSun}
                onChange={(e) => setGlobalSun(e.target.value)}
                options={["Faible", "Normal", "Fort"]}
                isMobile={isMobile}
              />
              <SelectField
                label="Plante rapide"
                value={quickPlant}
                onChange={(e) => setQuickPlant(e.target.value)}
                options={["Tomate", "Tomate cerise", "Piment", "Poivron", "Basilic", "Pelouse"]}
                isMobile={isMobile}
              />
              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                  Zoom de la grille ({zoom}%)
                </label>
                <input
                  type="range"
                  min="70"
                  max="130"
                  step="5"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              <button style={buttonStyle("#2563eb")} onClick={addZone}>
                Ajouter une case
              </button>
              <button style={buttonStyle("#16a34a")} onClick={duplicateZone}>
                Dupliquer la case
              </button>
              <button style={buttonStyle("#dc2626")} onClick={deleteZone}>
                Supprimer la case
              </button>
              <button style={buttonStyle("#6b7280")} onClick={() => moveZone("left")}>
                ← Déplacer
              </button>
              <button style={buttonStyle("#6b7280")} onClick={() => moveZone("right")}>
                Déplacer →
              </button>
            </div>

            <div
              style={{
                overflowX: "auto",
                overflowY: "hidden",
                paddingBottom: 8,
              }}
            >
              <div style={zonesGridStyle}>
                {activePlot?.zones.map((zone) => {
                  const active = zone.id === selectedZoneId;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => setSelectedZoneId(zone.id)}
                      style={{
                        textAlign: "left",
                        border: active ? "3px solid #111827" : "1px solid #d1d5db",
                        borderRadius: 16,
                        padding: 14,
                        background: zone.color,
                        color: "#111",
                        minHeight: isMobile ? 120 : 140,
                        cursor: "pointer",
                        boxShadow: active ? "0 6px 18px rgba(0,0,0,0.18)" : "none",
                      }}
                    >
                      <div style={{ fontWeight: 800, marginBottom: 8 }}>{zone.name}</div>
                      <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 6 }}>{zone.type}</div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{zone.plant}</div>
                      <div style={{ marginTop: 8 }}>{zone.count} plant(s)</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>⚙️ Éditeur de case</h2>

          {selectedZone ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field
                label="Nom"
                value={selectedZone.name}
                onChange={(e) => updateSelectedZone({ name: e.target.value })}
                isMobile={isMobile}
              />

              <SelectField
                label="Type de zone"
                value={selectedZone.type}
                onChange={(e) => updateSelectedZone({ type: e.target.value })}
                options={["Culture", "Pelouse", "Allée", "Serre", "Bac"]}
                isMobile={isMobile}
              />

              <SelectField
                label="Plante"
                value={selectedZone.plant}
                onChange={(e) => updateSelectedZone({ plant: e.target.value })}
                options={["Tomate", "Tomate cerise", "Piment", "Poivron", "Basilic", "Pelouse"]}
                isMobile={isMobile}
              />

              <Field
                label="Nombre de plants"
                type="number"
                value={selectedZone.count}
                onChange={(e) => updateSelectedZone({ count: Number(e.target.value) || 0 })}
                isMobile={isMobile}
              />

              <SelectField
                label="Soleil de base"
                value={selectedZone.sun}
                onChange={(e) => updateSelectedZone({ sun: Number(e.target.value) })}
                options={[
                  { label: "1", value: 1 },
                  { label: "2", value: 2 },
                  { label: "3", value: 3 },
                ]}
                isMobile={isMobile}
              />

              <div>
                <label style={{ display: "block", fontSize: 13, marginBottom: 6 }}>Note</label>
                <textarea
                  value={selectedZone.note}
                  onChange={(e) => updateSelectedZone({ note: e.target.value })}
                  style={{
                    ...inputStyle(isMobile),
                    min
