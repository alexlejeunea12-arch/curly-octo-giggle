import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Mail,
  PencilLine,
  Save,
  Search,
  Sparkles,
  Sprout,
  Wand2,
  Waves,
  Flower2,
  PlusCircle,
  X,
} from "lucide-react";

const REF_BG = "/background-home.jpg";
const STORAGE_KEY = "potager-v41-cases";

const initialCases = [
  { id: "1", name: "Parcelle A", crop: "Laitue", zone: "Mur gauche", exposure: "Mi-ombre", note: "Zone simple à surveiller." },
  { id: "2", name: "Parcelle B", crop: "Basilic", zone: "Avant plan", exposure: "Mi-ombre", note: "Compagnon des tomates." },
  { id: "3", name: "Parcelle C", crop: "Piments", zone: "Zone chaude", exposure: "Chaud / protégé", note: "LED prioritaire en semis." },
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

function shell(extra = {}) {
  return {
    background: "linear-gradient(180deg, rgba(10,15,36,0.68), rgba(6,9,22,0.82))",
    border: "1px solid rgba(182,204,255,0.13)",
    borderRadius: 22,
    boxShadow: "0 22px 80px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.05)",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    ...extra,
  };
}

function soft(extra = {}) {
  return shell({
    background: "linear-gradient(180deg, rgba(14,20,42,0.78), rgba(7,10,22,0.90))",
    borderRadius: 16,
    ...extra,
  });
}

function titleCaps(size = 16) {
  return {
    textTransform: "uppercase",
    letterSpacing: 3.2,
    fontWeight: 800,
    color: "rgba(242,245,255,0.96)",
    fontSize: size,
  };
}

function fieldStyle() {
  return {
    width: "100%",
    height: 44,
    borderRadius: 12,
    border: "1px solid rgba(182,204,255,0.12)",
    background: "linear-gradient(180deg, rgba(23,30,64,0.74), rgba(9,12,25,0.92))",
    color: "#eef2ff",
    outline: "none",
    padding: "0 14px",
    fontSize: 14,
  };
}

function Fireflies() {
  const dots = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    left: (i * 17) % 100,
    top: (i * 23) % 100,
    size: 2 + (i % 4),
    duration: 6 + (i % 7),
    delay: (i % 5) * 0.5,
  }));

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
            background: "rgba(255,221,148,0.95)",
            boxShadow: "0 0 20px rgba(255,213,122,0.78)",
          }}
          animate={{ opacity: [0.15, 0.95, 0.35, 0.15], y: [0, -16, 10, 0], x: [0, 10, -8, 0] }}
          transition={{ duration: d.duration, repeat: Infinity, ease: "easeInOut", delay: d.delay }}
        />
      ))}
    </div>
  );
}

function Hotspot({ style, onClick, title }) {
  return <button title={title} onClick={onClick} style={{ position: "absolute", background: "transparent", border: "none", cursor: "pointer", ...style }} />;
}

function HomeOverlay({ onOpenPanel, onOpenCreate }) {
  const ref = useRef(null);

  function handleContextMenu(e) {
    e.preventDefault();
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    onOpenCreate({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }

  return (
    <div style={shell({ padding: 18 })}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ width: 36 }} />
        <div style={{ flex: 1, textAlign: "center", ...titleCaps(20), letterSpacing: 4.2 }}>MON POTAGER</div>
        <div style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: "linear-gradient(180deg, rgba(25,32,66,0.84), rgba(9,12,24,0.94))", border: "1px solid rgba(182,204,255,0.12)" }}>
          <Mail size={18} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 246px", gap: 16, alignItems: "start" }}>
        <div
          ref={ref}
          onContextMenu={handleContextMenu}
          style={{
            position: "relative",
            height: 360,
            borderRadius: 18,
            overflow: "hidden",
            border: "1px solid rgba(182,204,255,0.11)",
            background: "linear-gradient(180deg, rgba(14,20,44,0.22), rgba(7,10,20,0.36))",
          }}
        >
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 30, height: 185, borderRadius: 14, border: "1px solid rgba(181,202,255,0.20)", background: "linear-gradient(180deg, rgba(9,13,24,0.22), rgba(9,13,24,0.04))" }} />
          <div style={{ position: "absolute", left: "11%", top: "12%", width: "58%", height: "52%", borderRadius: 14, border: "1px solid rgba(181,202,255,0.18)", background: "rgba(10,16,30,0.18)" }} />

          <Hotspot title="Plan" onClick={() => onOpenPanel("plan")} style={{ left: "12%", top: "13%", width: "56%", height: "50%" }} />
          <Hotspot title="Suggestion" onClick={() => onOpenPanel("suggestion")} style={{ left: "31%", top: "69%", width: 90, height: 76 }} />
          <Hotspot title="Pots" onClick={() => onOpenPanel("pots")} style={{ left: "46.2%", top: "69%", width: 90, height: 76 }} />
          <Hotspot title="Statut" onClick={() => onOpenPanel("status")} style={{ left: "61.4%", top: "69%", width: 90, height: 76 }} />
        </div>

        <div style={shell({ padding: 14, width: 246 })}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(255,255,255,0.90)", boxShadow: "0 0 10px rgba(255,255,255,0.26)" }} />
            <span style={titleCaps(13)}>Zone actuelle</span>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ position: "relative" }}>
              <input value="Parcelle" readOnly style={{ ...fieldStyle(), paddingLeft: 36 }} />
              <Search size={16} style={{ position: "absolute", left: 12, top: 14, color: "rgba(234,239,255,0.72)" }} />
              <ChevronDown size={16} style={{ position: "absolute", right: 12, top: 14, color: "rgba(234,239,255,0.72)" }} />
            </div>

            <div style={soft({ padding: 12 })}>
              <div style={{ color: "#f1f4ff", fontSize: 16, fontWeight: 800 }}>Mi-ombre</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, gap: 10 }}>
                <div style={{ color: "#f1f4ff", fontSize: 15, fontWeight: 800 }}>Laitue</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <LeafBadge color="#6fbf63" />
                  <LeafBadge color="#6fbf63" />
                  <LeafBadge color="#d94f4f" />
                </div>
              </div>
            </div>

            <button onClick={() => onOpenPanel("zone")} style={{ ...fieldStyle(), display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}><Waves size={16} /> Arroser</span>
              <span>›</span>
            </button>
            <button onClick={() => onOpenPanel("zone")} style={{ ...fieldStyle(), display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800 }}><PencilLine size={16} /> Modifier</span>
              <span>›</span>
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 18 }}>
        {[
          { key: "suggestion", icon: Wand2, label: "" },
          { key: "pots", icon: Sprout, label: "IA" },
          { key: "status", icon: Save, label: "Sauver" },
        ].map(({ key, icon: Icon, label }, i) => (
          <motion.button
            key={key}
            whileHover={{ y: -2 }}
            onClick={() => onOpenPanel(key)}
            style={{
              height: 76,
              width: 90,
              borderRadius: 18,
              border: i === 1 ? "1px solid rgba(255,214,140,0.28)" : "1px solid rgba(182,204,255,0.11)",
              background: i === 1 ? "linear-gradient(180deg, rgba(92,101,188,0.84), rgba(28,34,75,0.94))" : "linear-gradient(180deg, rgba(22,28,56,0.84), rgba(8,11,24,0.96))",
              color: "#eef2ff",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 10px 28px rgba(0,0,0,0.30)",
              cursor: "pointer",
            }}
          >
            <Icon size={26} />
            <span style={{ fontSize: 14, fontWeight: 800 }}>{label}</span>
          </motion.button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14, marginTop: 18 }}>
        <button onClick={() => onOpenPanel("suggestion")} style={{ ...soft({ padding: 18, textAlign: "left", cursor: "pointer" }) }}>
          <div style={{ ...titleCaps(14), color: "#c8ffd6", display: "flex", alignItems: "center", gap: 8 }}><Flower2 size={18} /> IA Suggestion</div>
          <div style={{ marginTop: 14, color: "#eef2ff", fontSize: 15, lineHeight: 1.62 }}>Déplacer 3 pots vers la zone Est.</div>
        </button>
        <button onClick={() => onOpenPanel("today")} style={{ ...soft({ padding: 18, textAlign: "left", cursor: "pointer" }) }}>
          <div style={{ ...titleCaps(14), color: "#d9c6ff", display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={18} /> Aujourd’hui</div>
          <div style={{ marginTop: 14, color: "#eef2ff", fontSize: 15, lineHeight: 1.62 }}>Tailler les fraises.</div>
        </button>
        <button onClick={() => onOpenPanel("status")} style={{ ...soft({ padding: 18, textAlign: "left", cursor: "pointer" }) }}>
          <div style={{ ...titleCaps(14) }}>Statut</div>
          <div style={{ marginTop: 14, color: "#eef2ff", fontSize: 15, lineHeight: 1.62 }}>Enregistré • Restaurer</div>
        </button>
      </div>
    </div>
  );
}

function LeafBadge({ color }) {
  return <span style={{ width: 24, height: 16, borderRadius: 10, background: `radial-gradient(circle at 30% 30%, ${color}, rgba(34,68,34,0.96))`, boxShadow: "inset 0 0 8px rgba(255,255,255,0.06)" }} />;
}

function CreateCaseModal({ openAt, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", crop: "Nouvelle culture", zone: "Nouvelle zone", exposure: "Mi-ombre", note: "" });

  useEffect(() => {
    if (openAt) {
      setForm({ name: "", crop: "Nouvelle culture", zone: "Nouvelle zone", exposure: "Mi-ombre", note: "" });
    }
  }, [openAt]);

  if (!openAt) return null;

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, x: openAt.x, y: openAt.y });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(4,7,16,0.56)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", zIndex: 60, display: "grid", placeItems: "center", padding: 20 }}>
      <div style={{ ...shell({ padding: 20, width: "100%", maxWidth: 520 }) }}>
        <div style={{ ...titleCaps(18), marginBottom: 8 }}>Nouvelle case</div>
        <div style={{ color: "rgba(214,222,255,0.62)", lineHeight: 1.6, marginBottom: 18 }}>Tu as cliqué sur le plan. On enregistre d’abord la case ici, puis on la branchera exactement où il faut.</div>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={fieldStyle()} placeholder="Nom de la case" />
            <input value={form.crop} onChange={(e) => setForm((f) => ({ ...f, crop: e.target.value }))} style={fieldStyle()} placeholder="Culture" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
            <input value={form.zone} onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))} style={fieldStyle()} placeholder="Zone" />
            <select value={form.exposure} onChange={(e) => setForm((f) => ({ ...f, exposure: e.target.value }))} style={fieldStyle()}>
              {["Mi-ombre", "Bonne lumière", "Chaud / protégé"].map((o) => <option key={o} value={o} style={{ background: "#0b1022", color: "#eef2ff" }}>{o}</option>)}
            </select>
          </div>
          <textarea value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} style={{ ...fieldStyle(), height: 90, marginTop: 12, paddingTop: 12, resize: "vertical" }} placeholder="Note" />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <button type="button" onClick={onClose} style={{ ...fieldStyle(), width: 120, cursor: "pointer", fontWeight: 700 }}>Annuler</button>
            <button type="submit" style={{ width: 160, height: 46, borderRadius: 12, border: "1px solid rgba(138,160,255,0.26)", background: "linear-gradient(180deg, rgba(86,100,190,0.90), rgba(35,42,95,0.95))", color: "#fff8ef", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>Créer la case</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SidePanel({ mode, cases, onClose }) {
  if (!mode) return null;

  const texts = {
    zone: { title: "Zone actuelle", body: "Lecture de la zone sélectionnée. Ici on branchera plus tard les vraies actions contextuelles." },
    plan: { title: "Plan du jardin", body: "Espace dédié au plan. On le détaillera ensuite avec tes vrais placements, cases et outils." },
    suggestion: { title: "IA Suggestion", body: "Déplacer 3 pots vers la zone Est et garder la zone chaude pour les piments." },
    today: { title: "Aujourd’hui", body: "Tailler les fraises, surveiller l’humidité du matin et vérifier la lumière des semis prioritaires." },
    status: { title: "Statut", body: `Enregistré • ${cases.length} case(s) • restauration locale active.` },
    pots: { title: "Ajouter des pots", body: "Panneau secondaire inspiré du mobile, ouvert depuis l’accueil et non affiché en permanence." },
  };

  const info = texts[mode] || texts.status;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 55, background: "rgba(3,6,14,0.36)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "flex", justifyContent: "flex-end" }}>
      <motion.div initial={{ x: 420, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 420, opacity: 0 }} transition={{ duration: 0.22 }} style={{ width: 410, maxWidth: "100%", padding: 18, display: "flex", alignItems: "center" }}>
        <div style={{ ...shell({ width: "100%", padding: 18, minHeight: 640, display: "flex", flexDirection: "column" }) }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={titleCaps(18)}>{info.title}</div>
            <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: 12, border: "1px solid rgba(182,204,255,0.10)", background: "linear-gradient(180deg, rgba(23,30,64,0.74), rgba(9,12,25,0.92))", color: "#eef2ff", cursor: "pointer" }}><X size={18} /></button>
          </div>
          <div style={{ ...soft({ padding: 18, marginBottom: 14 }) }}>
            <div style={{ ...titleCaps(15), marginBottom: 12 }}>{mode === "pots" ? "Ajouter des pots" : "Détail"}</div>
            {mode === "pots" ? (
              <div style={{ color: "#eef2ff", fontSize: 14, lineHeight: 1.86 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                  <span>Nombre de pots:</span>
                  <div style={{ display: "flex", gap: 8 }}>{[1, 3, 5].map((n) => <span key={n} style={{ ...soft({ padding: "6px 10px", borderRadius: 10, minWidth: 18, textAlign: "center" }), fontWeight: 800 }}>{n}</span>)}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <span>Diamètre du pot</span>
                  <div style={{ display: "flex", gap: 8 }}>{["20 cm", "30 cm", "40 cm"].map((d) => <span key={d} style={{ ...soft({ padding: "6px 8px", borderRadius: 10 }), fontWeight: 800, fontSize: 12 }}>{d}</span>)}</div>
                </div>
                <div style={{ marginTop: 10, textAlign: "center" }}>Suggestion : Planter du Basilic</div>
              </div>
            ) : (
              <div style={{ color: "#eef2ff", lineHeight: 1.7 }}>{info.body}</div>
            )}
          </div>
          <button style={{ width: "100%", height: 48, marginTop: "auto", borderRadius: 14, border: "1px solid rgba(138,160,255,0.26)", background: "linear-gradient(180deg, rgba(86,100,190,0.90), rgba(35,42,95,0.95))", color: "#fff8ef", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>
            {mode === "pots" ? "Créer les pots" : "Continuer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [cases, setCases] = useLocalStorageState(STORAGE_KEY, initialCases);
  const [createAt, setCreateAt] = useState(null);
  const [panelMode, setPanelMode] = useState(null);
  const [showUi, setShowUi] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowUi(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  function saveCase(data) {
    setCases((current) => [...current, { id: crypto.randomUUID(), ...data }]);
    setCreateAt(null);
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", color: "#eef2ff", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${REF_BG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,8,18,0.12), rgba(4,8,18,0.30))" }} />
      <Fireflies />

      <AnimatePresence>
        {showUi ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ maxWidth: 980, margin: "0 auto", padding: "38px 24px 28px", position: "relative", zIndex: 1 }}>
            <HomeOverlay onOpenPanel={setPanelMode} onOpenCreate={setCreateAt} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>{createAt ? <CreateCaseModal openAt={createAt} onClose={() => setCreateAt(null)} onSave={saveCase} /> : null}</AnimatePresence>
      <AnimatePresence>{panelMode ? <SidePanel mode={panelMode} cases={cases} onClose={() => setPanelMode(null)} /> : null}</AnimatePresence>
    </div>
  );
}
