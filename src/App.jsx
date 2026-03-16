import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  CalendarDays,
  Droplets,
  Home,
  LayoutGrid,
  Leaf,
  Map,
  Moon,
  Pencil,
  Plus,
  Save,
  Shield,
  Sparkles,
  Sprout,
  Trash2,
  Wand2,
} from "lucide-react";

const STORAGE_KEYS = {
  beds: "potager-v351-beds",
  seedlings: "potager-v351-seedlings",
  alerts: "potager-v351-alerts",
  notes: "potager-v351-notes",
};

const initialBeds = [
  {
    id: crypto.randomUUID(),
    name: "Parcelle 1",
    zone: "Mur gauche",
    exposure: "Mi-ombre",
    status: "Préparation",
    crop: "Laitue",
    note: "Zone proche de l’habitation, facile à surveiller.",
  },
  {
    id: crypto.randomUUID(),
    name: "Parcelle 2",
    zone: "Centre",
    exposure: "Bonne lumière",
    status: "Disponible",
    crop: "Tomates",
    note: "Bonne candidate pour culture verticale.",
  },
  {
    id: crypto.randomUUID(),
    name: "Parcelle 3",
    zone: "Près de la serre",
    exposure: "Chaud / protégé",
    status: "Surveillance",
    crop: "Poivrons / piments",
    note: "Contrôle chaleur et humidité prioritaire.",
  },
];

const initialSeedlings = [
  {
    id: crypto.randomUUID(),
    name: "Piments",
    variety: "À préciser",
    sowingDate: "2026-03-08",
    location: "Serre intérieure",
    status: "Semé",
    humidity: "Humide",
    light: "LED prioritaire",
    note: "Surveiller condensation et levée.",
  },
  {
    id: crypto.randomUUID(),
    name: "Poivrons",
    variety: "À préciser",
    sowingDate: "2026-03-08",
    location: "Serre intérieure",
    status: "Semé",
    humidity: "Humide",
    light: "LED prioritaire",
    note: "Aération douce si excès d’humidité.",
  },
  {
    id: crypto.randomUUID(),
    name: "Tomate cerise noire",
    variety: "Cherry / cerise noire",
    sowingDate: "",
    location: "À planifier",
    status: "Prévu",
    humidity: "—",
    light: "À définir",
    note: "À passer en actif au lancement réel du semis.",
  },
];

const initialAlerts = [
  {
    id: crypto.randomUUID(),
    title: "Aérer les mini-serres",
    priority: "Haute",
    category: "Humidité",
    done: false,
  },
  {
    id: crypto.randomUUID(),
    title: "Contrôler l’humidité du terreau",
    priority: "Haute",
    category: "Semis",
    done: false,
  },
  {
    id: crypto.randomUUID(),
    title: "Préparer la zone tomates",
    priority: "Moyenne",
    category: "Jardin",
    done: false,
  },
];

function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue];
}

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1400);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
}

function panelStyle(extra = {}) {
  return {
    background: "linear-gradient(180deg, rgba(18,26,58,0.70), rgba(7,10,24,0.78))",
    border: "1px solid rgba(180, 210, 255, 0.12)",
    boxShadow: "0 18px 60px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.06)",
    borderRadius: 22,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    ...extra,
  };
}

function thinPanelStyle(extra = {}) {
  return panelStyle({
    background: "linear-gradient(180deg, rgba(20,28,62,0.54), rgba(6,9,18,0.72))",
    borderRadius: 18,
    ...extra,
  });
}

function iconButtonStyle(active = false) {
  return {
    width: 110,
    minHeight: 86,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    borderRadius: 18,
    border: active ? "1px solid rgba(255,215,140,0.30)" : "1px solid rgba(180,210,255,0.12)",
    background: active
      ? "linear-gradient(180deg, rgba(90,105,180,0.42), rgba(28,36,82,0.78))"
      : "linear-gradient(180deg, rgba(32,42,84,0.42), rgba(10,14,28,0.68))",
    color: "#f1f3ff",
    boxShadow: active
      ? "0 8px 26px rgba(255,190,90,0.16), inset 0 1px 0 rgba(255,255,255,0.10)"
      : "0 8px 24px rgba(0,0,0,0.26)",
  };
}

function cardTitle(text, sub) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, letterSpacing: 1.4, color: "rgba(235,242,255,0.95)", fontWeight: 700, textTransform: "uppercase" }}>{text}</div>
      {sub ? <div style={{ marginTop: 6, fontSize: 12.5, color: "rgba(208,220,255,0.58)", lineHeight: 1.5 }}>{sub}</div> : null}
    </div>
  );
}

function Badge({ children, tone = "default" }) {
  const tones = {
    default: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(240,244,255,0.78)" },
    green: { background: "rgba(88, 255, 165, 0.12)", border: "1px solid rgba(88,255,165,0.22)", color: "#b9ffd9" },
    amber: { background: "rgba(255, 195, 102, 0.12)", border: "1px solid rgba(255,195,102,0.22)", color: "#ffe2a6" },
    blue: { background: "rgba(110, 170, 255, 0.12)", border: "1px solid rgba(110,170,255,0.24)", color: "#c8dcff" },
    red: { background: "rgba(255, 105, 105, 0.12)", border: "1px solid rgba(255,105,105,0.24)", color: "#ffc6c6" },
  };
  const toneStyle = tones[tone] || tones.default;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        ...toneStyle,
      }}
    >
      {children}
    </span>
  );
}

function Fireflies() {
  const dots = useMemo(
    () =>
      Array.from({ length: 28 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2 + Math.random() * 5,
        delay: Math.random() * 4,
        duration: 6 + Math.random() * 9,
      })),
    []
  );

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {dots.map((d) => (
        <motion.div
          key={d.id}
          style={{
            position: "absolute",
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            background: "rgba(255,219,138,0.9)",
            boxShadow: "0 0 18px rgba(255,210,120,0.8)",
          }}
          animate={{
            opacity: [0.15, 0.9, 0.35, 0.15],
            y: [0, -18, 10, 0],
            x: [0, 10, -8, 0],
            scale: [1, 1.2, 0.95, 1],
          }}
          transition={{ duration: d.duration, repeat: Infinity, ease: "easeInOut", delay: d.delay }}
        />
      ))}
    </div>
  );
}

function MoonGlow() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: 70,
          right: 330,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "radial-gradient(circle at 30% 30%, rgba(250,246,220,1), rgba(225,225,215,0.85) 46%, rgba(170,180,220,0.18) 72%, transparent 74%)",
          boxShadow: "0 0 40px rgba(216,224,255,0.18)",
          opacity: 0.95,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 52,
          right: 290,
          width: 240,
          height: 160,
          background: "radial-gradient(circle, rgba(174,190,255,0.10), transparent 70%)",
          filter: "blur(12px)",
        }}
      />
    </>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(205,218,255,0.55)", marginBottom: 6 }}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid rgba(180,210,255,0.12)",
          background: "rgba(6,9,20,0.50)",
          color: "#edf1ff",
          outline: "none",
          fontSize: 14,
        }}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(205,218,255,0.55)", marginBottom: 6 }}>{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid rgba(180,210,255,0.12)",
          background: "rgba(6,9,20,0.50)",
          color: "#edf1ff",
          outline: "none",
          fontSize: 14,
        }}
      >
        {options.map((option) => (
          <option key={option} value={option} style={{ background: "#0a1024", color: "#edf1ff" }}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <div style={{ fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", color: "rgba(205,218,255,0.55)", marginBottom: 6 }}>{label}</div>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          minHeight: 88,
          padding: "12px 14px",
          borderRadius: 14,
          border: "1px solid rgba(180,210,255,0.12)",
          background: "rgba(6,9,20,0.50)",
          color: "#edf1ff",
          outline: "none",
          fontSize: 14,
          resize: "vertical",
        }}
      />
    </label>
  );
}

function ActionTile({ icon: Icon, label, active, onClick }) {
  return (
    <motion.button whileHover={{ y: -2 }} style={iconButtonStyle(active)} onClick={onClick}>
      <Icon size={24} />
      <div style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.15, textAlign: "center" }}>{label}</div>
    </motion.button>
  );
}

function SideMiniCard({ icon: Icon, title, children }) {
  return (
    <div style={thinPanelStyle({ padding: 14, marginBottom: 10 })}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#eef2ff", fontWeight: 700, fontSize: 13, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.1 }}>
        <Icon size={15} />
        {title}
      </div>
      {children}
    </div>
  );
}

function OverviewPanel({ setView, seedlings, alerts, notes, setNotes }) {
  const urgent = alerts.filter((a) => !a.done && a.priority === "Haute").length;
  const activeSeedlings = seedlings.filter((s) => s.status !== "Récolté").length;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
      <SideMiniCard icon={Moon} title="Zone actuelle">
        <div style={{ display: "grid", gap: 10 }}>
          <div style={selectorLineStyle()}>
            <span>Parcelle</span>
            <span style={{ opacity: 0.75 }}>▾</span>
          </div>
          <div style={selectorLineStyle()}>
            <span>Mi-ombre</span>
            <span style={{ opacity: 0.75 }}>🥬</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={actionLineStyle()} onClick={() => setView("alerts")}>Arroser</button>
            <button style={actionLineStyle()} onClick={() => setView("beds")}>Modifier</button>
          </div>
        </div>
      </SideMiniCard>

      <SideMiniCard icon={Sprout} title="Suivi vivant">
        <div style={{ display: "grid", gap: 8 }}>
          <div style={metricRowStyle()}><span>Semis suivis</span><strong>{activeSeedlings}</strong></div>
          <div style={metricRowStyle()}><span>Alertes hautes</span><strong>{urgent}</strong></div>
          <div style={metricRowStyle()}><span>Condensation</span><strong>À surveiller</strong></div>
        </div>
      </SideMiniCard>

      <SideMiniCard icon={Pencil} title="Note terrain">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Condensation forte le matin, terreau encore humide, lumière correcte..."
          style={{
            width: "100%",
            minHeight: 110,
            borderRadius: 14,
            border: "1px solid rgba(180,210,255,0.12)",
            background: "rgba(5,8,18,0.56)",
            color: "#edf1ff",
            padding: 12,
            outline: "none",
            resize: "vertical",
          }}
        />
      </SideMiniCard>
    </div>
  );
}

function selectorLineStyle() {
  return {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(180,210,255,0.11)",
    background: "linear-gradient(180deg, rgba(42,52,98,0.54), rgba(9,12,24,0.72))",
    color: "#eef2ff",
    fontSize: 14,
    fontWeight: 600,
  };
}

function actionLineStyle() {
  return {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 14,
    cursor: "pointer",
    border: "1px solid rgba(180,210,255,0.11)",
    background: "linear-gradient(180deg, rgba(68,78,140,0.58), rgba(16,20,38,0.78))",
    color: "#f5f0ff",
    fontSize: 14,
    fontWeight: 700,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
  };
}

function metricRowStyle() {
  return {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "rgba(233,241,255,0.82)",
    fontSize: 14,
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };
}

function BigBoard({ setView }) {
  const cells = [
    ["#79b9ff", "#7fda91", "#6aa9ff", "#78d95a"],
    ["#67d8a8", "#edb166", "#958ae8", "#67d48b"],
    ["#b4ff8c", "#e1aa6f", "#6caee7", "#95d267"],
  ];

  return (
    <div style={panelStyle({ padding: 20, position: "relative", overflow: "hidden" })}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00) 30%, rgba(8,10,18,0.24))" }} />
      {cardTitle("Mon potager", "Centre de commande visuel inspiré de l’image de référence, en restant piloté par tes menus réels.")}

      <div
        style={{
          position: "relative",
          height: 360,
          borderRadius: 26,
          overflow: "hidden",
          border: "1px solid rgba(180,210,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(26,35,84,0.24), rgba(8,11,25,0.70)), radial-gradient(circle at 20% 80%, rgba(245,195,96,0.12), transparent 24%), radial-gradient(circle at 70% 24%, rgba(118,120,255,0.10), transparent 26%), linear-gradient(180deg, rgba(9,14,34,0.88), rgba(5,9,22,0.96))",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
        }}
      >
        <div style={{ position: "absolute", top: 12, left: 16, color: "rgba(232,239,255,0.75)", fontSize: 12, letterSpacing: 1.1 }}>Vue parcelle immersive</div>
        <div style={{ position: "absolute", inset: 24, display: "grid", placeItems: "center" }}>
          <div
            style={{
              width: "82%",
              maxWidth: 650,
              aspectRatio: "16 / 8.6",
              transform: "perspective(1200px) rotateX(52deg)",
              borderRadius: 12,
              padding: 8,
              background: "linear-gradient(180deg, rgba(68,49,34,0.95), rgba(36,23,16,0.95))",
              border: "1px solid rgba(255,220,185,0.16)",
              boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(3, 1fr)", gap: 8, width: "100%", height: "100%" }}>
              {cells.flatMap((row, rowIndex) =>
                row.map((color, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    style={{
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.07)",
                      background: `radial-gradient(circle at 40% 35%, ${color}, rgba(20,30,20,0.96) 62%)`,
                      boxShadow: "inset 0 0 18px rgba(255,255,255,0.06)",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span
                        key={i}
                        style={{
                          position: "absolute",
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.18)",
                          left: 12 + (i % 2) * 28,
                          top: 14 + Math.floor(i / 2) * 24,
                          boxShadow: "0 0 8px rgba(255,255,255,0.12)",
                        }}
                      />
                    ))}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 18, left: 22, right: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "radial-gradient(circle at 30% 30%, rgba(255,230,170,0.95), rgba(162,123,58,0.88))",
                  boxShadow: "0 0 20px rgba(255,215,120,0.35)",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { icon: Wand2, label: "IA" },
              { icon: Pencil, label: "Modifier" },
              { icon: Save, label: "Sauver" },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => setView(label === "Modifier" ? "beds" : label === "IA" ? "seedlings" : "dashboard")}
                style={{
                  width: 92,
                  height: 86,
                  borderRadius: 18,
                  border: "1px solid rgba(190,210,255,0.15)",
                  background: "linear-gradient(180deg, rgba(25,30,61,0.85), rgba(9,10,20,0.90))",
                  color: "#f1f3ff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 9,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.32)",
                  cursor: "pointer",
                }}
              >
                <Icon size={22} />
                <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusStrip({ alerts }) {
  const urgent = alerts.filter((a) => !a.done && a.priority === "Haute").length;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 }}>
      <div style={thinPanelStyle({ padding: 18 })}>
        <div style={{ color: "#b9ffd9", fontWeight: 800, marginBottom: 10, fontSize: 15, letterSpacing: 0.6 }}>IA SUGGESTION</div>
        <div style={{ color: "#eef3ff", fontSize: 15, lineHeight: 1.5 }}>Déplacer 3 pots vers la zone Est et surveiller l’humidité du matin.</div>
      </div>
      <div style={thinPanelStyle({ padding: 18 })}>
        <div style={{ color: "#d9c0ff", fontWeight: 800, marginBottom: 10, fontSize: 15, letterSpacing: 0.6 }}>AUJOURD’HUI</div>
        <div style={{ color: "#eef3ff", fontSize: 15, lineHeight: 1.5 }}>Aération douce des mini-serres, contrôle lumière et repérage zones chaudes.</div>
      </div>
      <div style={thinPanelStyle({ padding: 18 })}>
        <div style={{ color: "#f6f0ff", fontWeight: 800, marginBottom: 10, fontSize: 15, letterSpacing: 0.6 }}>STATUT</div>
        <div style={{ color: "#eef3ff", fontSize: 15, lineHeight: 1.5 }}>Enregistré · {urgent} alerte(s) haute(s) à traiter.</div>
      </div>
    </div>
  );
}

function SectionShell({ title, subtitle, children, right }) {
  return (
    <div style={panelStyle({ padding: 18 })}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#f2f4ff" }}>{title}</div>
          {subtitle ? <div style={{ marginTop: 6, fontSize: 13.5, color: "rgba(213,222,255,0.62)", lineHeight: 1.5 }}>{subtitle}</div> : null}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function BedsView({ beds, setBeds }) {
  const [form, setForm] = useState({ name: "", zone: "", exposure: "", status: "Disponible", crop: "", note: "" });
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setForm({ name: "", zone: "", exposure: "", status: "Disponible", crop: "", note: "" });
    setEditingId(null);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      setBeds((current) => current.map((bed) => (bed.id === editingId ? { ...bed, ...form } : bed)));
    } else {
      setBeds((current) => [...current, { id: crypto.randomUUID(), ...form }]);
    }
    resetForm();
  }

  function edit(bed) {
    setEditingId(bed.id);
    setForm({ name: bed.name, zone: bed.zone, exposure: bed.exposure, status: bed.status, crop: bed.crop, note: bed.note });
  }

  function remove(id) {
    setBeds((current) => current.filter((bed) => bed.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 16 }}>
      <SectionShell title="Gestion des cases" subtitle="Créer, modifier et supprimer tes parcelles tout en restant dans la logique visuelle sombre et immersive.">
        <form onSubmit={submit}>
          <Input label="Nom" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Input label="Zone" value={form.zone} onChange={(v) => setForm((f) => ({ ...f, zone: v }))} />
          <Input label="Exposition" value={form.exposure} onChange={(v) => setForm((f) => ({ ...f, exposure: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Statut" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={["Disponible", "Préparation", "Planté", "Surveillance"]} />
            <Input label="Culture" value={form.crop} onChange={(v) => setForm((f) => ({ ...f, crop: v }))} />
          </div>
          <TextArea label="Note" value={form.note} onChange={(v) => setForm((f) => ({ ...f, note: v }))} placeholder="Ex : zone à fort potentiel pour tomates ou parcelle à protéger en priorité." />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="submit" style={actionPrimaryStyle()}>{editingId ? "Enregistrer" : "Ajouter la case"}</button>
            <button type="button" style={actionSecondaryStyle()} onClick={resetForm}>Réinitialiser</button>
          </div>
        </form>
      </SectionShell>

      <SectionShell title="Parcelles" subtitle="Vue opérationnelle des cases du jardin.">
        <div style={{ display: "grid", gap: 12 }}>
          {beds.map((bed) => (
            <div key={bed.id} style={thinPanelStyle({ padding: 14 })}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f4ff" }}>{bed.name}</div>
                    <Badge tone={bed.status === "Disponible" ? "blue" : bed.status === "Planté" ? "green" : "amber"}>{bed.status}</Badge>
                  </div>
                  <div style={{ marginTop: 6, color: "rgba(214,222,255,0.62)", fontSize: 13 }}>{bed.zone} · {bed.exposure}</div>
                  <div style={{ marginTop: 8, color: "#edf1ff", fontSize: 14 }}>Culture : {bed.crop || "—"}</div>
                  <div style={{ marginTop: 8, color: "rgba(214,222,255,0.60)", fontSize: 13.5, lineHeight: 1.5 }}>{bed.note || "Aucune note."}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={iconSmallButtonStyle()} onClick={() => edit(bed)}><Pencil size={16} /></button>
                  <button style={iconSmallDangerStyle()} onClick={() => remove(bed.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}

function SeedlingsView({ seedlings, setSeedlings }) {
  const empty = { name: "", variety: "", sowingDate: "", location: "", status: "Prévu", humidity: "", light: "", note: "" };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setForm(empty);
    setEditingId(null);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      setSeedlings((current) => current.map((s) => (s.id === editingId ? { ...s, ...form } : s)));
    } else {
      setSeedlings((current) => [{ id: crypto.randomUUID(), ...form }, ...current]);
    }
    resetForm();
  }

  function edit(seedling) {
    setEditingId(seedling.id);
    setForm({ ...seedling });
  }

  function remove(id) {
    setSeedlings((current) => current.filter((s) => s.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "0.92fr 1.08fr", gap: 16 }}>
      <SectionShell title="Gestion semis" subtitle="Date, emplacement, statut, humidité, lumière et notes, avec un vrai habillage proche du modèle visuel.">
        <form onSubmit={submit}>
          <Input label="Culture" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} />
          <Input label="Variété" value={form.variety} onChange={(v) => setForm((f) => ({ ...f, variety: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input type="date" label="Date du semis" value={form.sowingDate} onChange={(v) => setForm((f) => ({ ...f, sowingDate: v }))} />
            <Input label="Emplacement" value={form.location} onChange={(v) => setForm((f) => ({ ...f, location: v }))} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Select label="Statut" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={["Prévu", "Semé", "Levée", "Repiqué", "Planté", "Récolté"]} />
            <Input label="Humidité" value={form.humidity} onChange={(v) => setForm((f) => ({ ...f, humidity: v }))} />
            <Input label="Lumière" value={form.light} onChange={(v) => setForm((f) => ({ ...f, light: v }))} />
          </div>
          <TextArea label="Note" value={form.note} onChange={(v) => setForm((f) => ({ ...f, note: v }))} placeholder="Ex : LED prioritaire, terreau encore humide, légère condensation le matin." />
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="submit" style={actionPrimaryStyle()}>{editingId ? "Mettre à jour" : "Ajouter le semis"}</button>
            <button type="button" style={actionSecondaryStyle()} onClick={resetForm}>Réinitialiser</button>
          </div>
        </form>
      </SectionShell>

      <SectionShell title="Suivi des semis" subtitle="Conçu pour ton suivi réel et chronologique.">
        <div style={{ display: "grid", gap: 12 }}>
          {seedlings.map((seedling) => (
            <div key={seedling.id} style={thinPanelStyle({ padding: 14 })}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f4ff" }}>{seedling.name}</div>
                    <Badge tone={seedling.status === "Semé" ? "green" : seedling.status === "Prévu" ? "amber" : "blue"}>{seedling.status}</Badge>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 13, color: "rgba(214,222,255,0.62)" }}>{seedling.variety || "Variété non précisée"}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                    <Badge>Date : {seedling.sowingDate || "—"}</Badge>
                    <Badge>Lieu : {seedling.location || "—"}</Badge>
                    <Badge>Humidité : {seedling.humidity || "—"}</Badge>
                    <Badge>Lumière : {seedling.light || "—"}</Badge>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.5, color: "rgba(214,222,255,0.62)" }}>{seedling.note || "Aucune note."}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={iconSmallButtonStyle()} onClick={() => edit(seedling)}><Pencil size={16} /></button>
                  <button style={iconSmallDangerStyle()} onClick={() => remove(seedling.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}

function AlertsView({ alerts, setAlerts }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Semis");
  const [priority, setPriority] = useState("Moyenne");

  function addAlert(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setAlerts((current) => [{ id: crypto.randomUUID(), title: title.trim(), category, priority, done: false }, ...current]);
    setTitle("");
    setCategory("Semis");
    setPriority("Moyenne");
  }

  function toggleDone(id) {
    setAlerts((current) => current.map((a) => (a.id === id ? { ...a, done: !a.done } : a)));
  }

  function remove(id) {
    setAlerts((current) => current.filter((a) => a.id !== id));
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "0.86fr 1.14fr", gap: 16 }}>
      <SectionShell title="Alarmes" subtitle="Pour conserver la logique tour de contrôle et vigilance concrète.">
        <form onSubmit={addAlert}>
          <Input label="Titre" value={title} onChange={setTitle} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Catégorie" value={category} onChange={setCategory} options={["Semis", "Humidité", "Lumière", "Jardin", "Protection"]} />
            <Select label="Priorité" value={priority} onChange={setPriority} options={["Basse", "Moyenne", "Haute"]} />
          </div>
          <button type="submit" style={actionPrimaryStyle()}>Ajouter l’alarme</button>
        </form>
      </SectionShell>

      <SectionShell title="Mur des alertes" subtitle="Ce qui demande ton attention réelle.">
        <div style={{ display: "grid", gap: 12 }}>
          {alerts.map((alert) => (
            <div key={alert.id} style={thinPanelStyle({ padding: 14 })}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: alert.done ? "rgba(241,244,255,0.38)" : "#f1f4ff", textDecoration: alert.done ? "line-through" : "none" }}>{alert.title}</div>
                    <Badge tone={alert.priority === "Haute" ? "red" : alert.priority === "Moyenne" ? "amber" : "blue"}>{alert.priority}</Badge>
                    <Badge>{alert.category}</Badge>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={actionSecondaryStyle()} onClick={() => toggleDone(alert.id)}>{alert.done ? "Réactiver" : "Terminé"}</button>
                  <button style={iconSmallDangerStyle()} onClick={() => remove(alert.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </div>
  );
}

function PlanView() {
  return (
    <SectionShell title="Plan du jardin" subtitle="Vue conceptuelle fidèle à la logique immersive : scène centrale, pilotage latéral, lecture rapide des zones.">
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 16 }}>
        <div style={thinPanelStyle({ padding: 18 })}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, minHeight: 360 }}>
            <div style={zoneBoxStyle("rgba(100,160,255,0.18)", "Mur gauche", "Zone de contrôle rapproché, adaptée au suivi et aux cultures délicates.")} />
            <div style={zoneBoxStyle("rgba(112,255,162,0.16)", "Centre", "Cases principales, circulation et vision d’ensemble du potager.")} />
            <div style={zoneBoxStyle("rgba(255,198,109,0.16)", "Serre / chaleur", "Point technique pour les besoins les plus sensibles en lumière et humidité.")} />
          </div>
        </div>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            ["Mur gauche", "Mi-ombre, accès pratique, zone stratégique."],
            ["Centre du jardin", "Cultures majeures et structure globale."],
            ["Zone protections", "Nuisibles, barrières, surveillance spécifique."],
            ["Serre / appui", "Zone chaude et technique pour tes semis."],
          ].map(([title, text]) => (
            <div key={title} style={thinPanelStyle({ padding: 14 })}>
              <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f4ff" }}>{title}</div>
              <div style={{ marginTop: 8, fontSize: 13.5, color: "rgba(214,222,255,0.62)", lineHeight: 1.5 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

function zoneBoxStyle(color, title, text) {
  return {
    ...thinPanelStyle({ padding: 16, background: `linear-gradient(180deg, ${color}, rgba(6,9,18,0.78))` }),
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };
}

function ProtectionView() {
  return (
    <SectionShell title="Protection & stratégie" subtitle="Bloc pensé comme une console d’aide à la décision.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          [Shield, "Protection générale", "Prévoir filets, barrières et logique anti-nuisibles avant mise en place définitive."],
          [Droplets, "Humidité & condensation", "Aération progressive si les mini-serres perlaient trop le matin."],
          [Leaf, "Lumière", "Prioriser les LED sur piments et poivrons, garder les zones lumineuses pour les semis exigeants."],
          [CalendarDays, "Chronologie utile", "Chaque décision doit rester liée à l’état réel du potager, pas seulement au tableau de bord."],
        ].map(([Icon, title, text]) => (
          <div key={title} style={thinPanelStyle({ padding: 16 })}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#f1f4ff", fontWeight: 800, fontSize: 15 }}>
              <Icon size={18} />
              {title}
            </div>
            <div style={{ marginTop: 10, fontSize: 13.5, color: "rgba(214,222,255,0.62)", lineHeight: 1.6 }}>{text}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

function TimelineView({ seedlings }) {
  const entries = seedlings.filter((s) => s.sowingDate).sort((a, b) => a.sowingDate.localeCompare(b.sowingDate));
  return (
    <SectionShell title="Chronologie réelle" subtitle="Le site reste un support du réel : dates, étapes et suivi utile.">
      <div style={{ display: "grid", gap: 14 }}>
        {entries.length === 0 ? (
          <div style={thinPanelStyle({ padding: 16, color: "rgba(214,222,255,0.62)" })}>Aucune entrée datée pour le moment.</div>
        ) : (
          entries.map((entry, index) => (
            <div key={entry.id} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 14, alignItems: "stretch" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(255,214,120,0.96)", boxShadow: "0 0 14px rgba(255,214,120,0.65)" }} />
                {index !== entries.length - 1 ? <div style={{ width: 2, flex: 1, marginTop: 6, background: "rgba(255,255,255,0.08)" }} /> : null}
              </div>
              <div style={thinPanelStyle({ padding: 14 })}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ color: "#f1f4ff", fontWeight: 800 }}>{entry.sowingDate}</div>
                  <Badge tone="green">{entry.status}</Badge>
                </div>
                <div style={{ marginTop: 8, color: "#edf1ff", fontSize: 14.5 }}>{entry.name}</div>
                <div style={{ marginTop: 4, color: "rgba(214,222,255,0.62)", fontSize: 13 }}>{entry.location || "Emplacement non précisé"}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionShell>
  );
}

function Dashboard({ seedlings, alerts, notes, setNotes, setView }) {
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.65fr 0.72fr", gap: 16 }}>
        <BigBoard setView={setView} />
        <OverviewPanel setView={setView} seedlings={seedlings} alerts={alerts} notes={notes} setNotes={setNotes} />
      </div>
      <StatusStrip alerts={alerts} />
    </div>
  );
}

function actionPrimaryStyle() {
  return {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,215,140,0.24)",
    background: "linear-gradient(180deg, rgba(100,110,200,0.72), rgba(35,42,95,0.84))",
    color: "#fff8ed",
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 10px 28px rgba(29,35,82,0.28)",
  };
}

function actionSecondaryStyle() {
  return {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(180,210,255,0.12)",
    background: "linear-gradient(180deg, rgba(25,30,60,0.72), rgba(9,12,24,0.82))",
    color: "#edf1ff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  };
}

function iconSmallButtonStyle() {
  return {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(180,210,255,0.12)",
    background: "linear-gradient(180deg, rgba(28,36,72,0.72), rgba(8,11,24,0.84))",
    color: "#edf1ff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  };
}

function iconSmallDangerStyle() {
  return {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid rgba(255,120,120,0.16)",
    background: "linear-gradient(180deg, rgba(82,28,38,0.72), rgba(24,8,12,0.84))",
    color: "#ffd2d2",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  };
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [beds, setBeds] = useLocalStorageState(STORAGE_KEYS.beds, initialBeds);
  const [seedlings, setSeedlings] = useLocalStorageState(STORAGE_KEYS.seedlings, initialSeedlings);
  const [alerts, setAlerts] = useLocalStorageState(STORAGE_KEYS.alerts, initialAlerts);
  const [notes, setNotes] = useLocalStorageState(STORAGE_KEYS.notes, "");
  const width = useWindowWidth();
  const mobile = width < 980;

  const nav = [
    { key: "dashboard", label: "Tour", icon: Home },
    { key: "plan", label: "Plan", icon: Map },
    { key: "beds", label: "Cases", icon: LayoutGrid },
    { key: "seedlings", label: "Semis", icon: Sprout },
    { key: "alerts", label: "Alarmes", icon: Bell },
    { key: "protection", label: "Protection", icon: Shield },
    { key: "timeline", label: "Chronologie", icon: CalendarDays },
  ];

  function renderView() {
    if (view === "plan") return <PlanView />;
    if (view === "beds") return <BedsView beds={beds} setBeds={setBeds} />;
    if (view === "seedlings") return <SeedlingsView seedlings={seedlings} setSeedlings={setSeedlings} />;
    if (view === "alerts") return <AlertsView alerts={alerts} setAlerts={setAlerts} />;
    if (view === "protection") return <ProtectionView />;
    if (view === "timeline") return <TimelineView seedlings={seedlings} />;
    return <Dashboard seedlings={seedlings} alerts={alerts} notes={notes} setNotes={setNotes} setView={setView} />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#eef2ff",
        background:
          "radial-gradient(circle at 18% 18%, rgba(42,58,138,0.26), transparent 25%), radial-gradient(circle at 80% 22%, rgba(122,112,255,0.16), transparent 22%), radial-gradient(circle at 48% 80%, rgba(255,196,92,0.08), transparent 18%), linear-gradient(180deg, #040713 0%, #07111f 35%, #07131b 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 16%), linear-gradient(180deg, rgba(0,0,0,0.00), rgba(0,0,0,0.22))",
        }}
      />
      <Fireflies />
      <MoonGlow />

      <div style={{ maxWidth: 1500, margin: "0 auto", padding: mobile ? "18px 14px 100px" : "30px 26px 28px", position: "relative", zIndex: 1 }}>
        <div style={panelStyle({ padding: mobile ? 18 : 24, marginBottom: 18, overflow: "hidden", position: "relative" })}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,0.05), transparent 30%, rgba(255,224,160,0.03))" }} />
          <div style={{ display: "flex", flexDirection: mobile ? "column" : "row", justifyContent: "space-between", alignItems: mobile ? "flex-start" : "center", gap: 18, position: "relative" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 999, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", fontSize: 12, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", color: "rgba(233,239,255,0.82)" }}>
                <Sparkles size={14} />
                Mon Potager
              </div>
              <div style={{ marginTop: 16, fontSize: mobile ? 32 : 42, lineHeight: 1.05, fontWeight: 900, maxWidth: 920, letterSpacing: 0.6 }}>
                Tour de contrôle nocturne inspirée de ton visuel de référence.
              </div>
              <div style={{ marginTop: 14, maxWidth: 940, fontSize: mobile ? 14 : 16, lineHeight: 1.65, color: "rgba(215,223,255,0.66)" }}>
                On reste sur l’idée centrale de l’image : ambiance sombre, lueurs discrètes, panneau principal immersif, commandes centrales, colonne latérale et accès direct aux vrais modules du potager.
              </div>
            </div>
            {!mobile ? (
              <div style={thinPanelStyle({ padding: 14, minWidth: 250 })}>
                <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2, color: "#eef2ff", marginBottom: 8 }}>Ambiance visuelle</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(214,222,255,0.62)" }}>
                  Nuit bleutée, verre sombre, dorures légères, centre de commande et logique immersive avant tout.
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {!mobile ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 4 }}>
              {nav.map(({ key, label, icon: Icon }) => (
                <ActionTile key={key} icon={Icon} label={label} active={view === key} onClick={() => setView(key)} />
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
                {renderView()}
              </motion.div>
            </AnimatePresence>
            <div
              style={{
                position: "fixed",
                left: 12,
                right: 12,
                bottom: 10,
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: 8,
                padding: 10,
                zIndex: 30,
                ...panelStyle({ borderRadius: 22, background: "linear-gradient(180deg, rgba(18,24,52,0.92), rgba(8,11,22,0.96))" }),
              }}
            >
              {nav.slice(0, 5).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  style={{
                    height: 58,
                    borderRadius: 16,
                    border: view === key ? "1px solid rgba(255,215,140,0.24)" : "1px solid rgba(180,210,255,0.10)",
                    background: view === key ? "linear-gradient(180deg, rgba(90,105,180,0.56), rgba(28,36,82,0.84))" : "linear-gradient(180deg, rgba(22,28,56,0.72), rgba(8,11,20,0.84))",
                    color: "#eef2ff",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
