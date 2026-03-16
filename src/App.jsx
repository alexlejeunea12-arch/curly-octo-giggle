import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Minus,
  Maximize2,
} from "lucide-react";

const REF_BG = "/background-home.jpg";
const STORAGE_KEY = "potager-v42-cases";

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
    background: "linear-gradient(180deg, rgba(8,14,34,0.70), rgba(5,9,22,0.84))",
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
    background: "linear-gradient(180deg, rgba(12,18,40,0.78), rgba(7,10,22,0.90))",
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
  const dots = useMemo(() => {
    const edgeBands = [
      () => ({ left: Math.random() * 18, top: Math.random() * 100 }),
      () => ({ left: 82 + Math.random() * 18, top: Math.random() * 100 }),
      () => ({ left: Math.random() * 100, top: Math.random() * 14 }),
      () => ({ left: Math.random() * 100, top: 86 + Math.random() * 14 }),
    ];

    return Array.from({ length: 42 }).map((_, i) => {
      const pick = edgeBands[i % edgeBands.length]();
      return {
        id: i,
        left: pick.left,
        top: pick.top,
        size: 1.4 + Math.random() * 3.6,
        duration: 4 + Math.random() * 8,
        delay: Math.random() * 5,
        driftX: -8 + Math.random() * 16,
        driftY: -10 + Math.random() * 14,
      };
    });
  }, []);

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
            background: "rgba(255,229,170,0.96)",
            boxShadow: "0 0 14px rgba(255,216,128,0.72), 0 0 30px rgba(255,216,128,0.18)",
            filter: "blur(0.15px)",
          }}
          animate={{
            opacity: [0.06, 0.78, 0.16, 0.06],
            y: [0, d.driftY, d.driftY * -0.35, 0],
            x: [0, d.driftX, d.driftX * -0.45, 0],
            scale: [1, 1.24, 0.92, 1],
          }}
          transition={{ duration: d.duration, repeat: Infinity, ease: "easeInOut", delay: d.delay }}
        />
      ))}
    </div>
  );
}

function AmbientGlow() {
  return (
    <>
      <motion.div
        style={{
          position: "absolute",
          inset: "6% 8% auto 8%",
          height: 360,
          borderRadius: 60,
          background: "radial-gradient(circle, rgba(108,138,255,0.16), rgba(108,138,255,0.06) 38%, transparent 68%)",
          filter: "blur(26px)",
          pointerEvents: "none",
        }}
        animate={{ opacity: [0.42, 0.72, 0.42] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          bottom: "6%",
          height: 210,
          background: "radial-gradient(ellipse at center, rgba(255,201,106,0.16), rgba(255,201,106,0.05) 40%, transparent 74%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
        animate={{ opacity: [0.28, 0.56, 0.28] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          left: "-6%",
          top: "18%",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(90,134,255,0.12), transparent 72%)",
          filter: "blur(34px)",
          pointerEvents: "none",
        }}
        animate={{ opacity: [0.16, 0.34, 0.16] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          right: "-4%",
          top: "16%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,184,92,0.14), transparent 72%)",
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
        animate={{ opacity: [0.14, 0.32, 0.14] }}
        transition={{ duration: 7.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          inset: "0",
          background: "radial-gradient(circle at 85% 42%, rgba(255,174,94,0.10), transparent 18%), radial-gradient(circle at 18% 54%, rgba(98,129,255,0.08), transparent 18%)",
          filter: "blur(18px)",
          pointerEvents: "none",
        }}
        animate={{ opacity: [0.2, 0.36, 0.2] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function HouseWindowGlow({ left, top, width, height, delay = 0 }) {
  return (
    <motion.div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        borderRadius: 3,
        background: "linear-gradient(180deg, rgba(255,214,150,0.32), rgba(255,169,92,0.18))",
        boxShadow: "0 0 10px rgba(255,182,95,0.10)",
        mixBlendMode: "screen",
        pointerEvents: "none",
      }}
      animate={{ opacity: [0.14, 0.3, 0.18, 0.34, 0.14] }}
      transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

function HouseLights() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      <HouseWindowGlow left="80.3%" top="38.6%" width="1.55%" height="2.35%" delay={0.2} />
      <HouseWindowGlow left="82.55%" top="38.55%" width="1.55%" height="2.35%" delay={1.1} />
      <HouseWindowGlow left="79.9%" top="42.5%" width="2.45%" height="3.2%" delay={0.6} />
      <HouseWindowGlow left="83.15%" top="42.45%" width="2.45%" height="3.2%" delay={1.4} />
    </div>
  );
}

function Hotspot({ style, onClick, title }) {
  return <button title={title} onClick={onClick} style={{ position: "absolute", background: "transparent", border: "none", cursor: "pointer", ...style }} />;
}

function LeafBadge({ color }) {
  return <span style={{ width: 24, height: 16, borderRadius: 10, background: `radial-gradient(circle at 30% 30%, ${color}, rgba(34,68,34,0.96))`, boxShadow: "inset 0 0 8px rgba(255,255,255,0.06)" }} />;
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
    <div style={shell({ padding: 18, boxShadow: "0 32px 90px rgba(0,0,0,0.42), 0 0 60px rgba(90,120,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)" })}>
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
            background: "linear-gradient(180deg, rgba(14,20,44,0.18), rgba(7,10,20,0.30))",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.02)",
          }}
        >
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 30, height: 185, borderRadius: 14, border: "1px solid rgba(181,202,255,0.20)", background: "linear-gradient(180deg, rgba(9,13,24,0.16), rgba(9,13,24,0.03))" }} />
          <div style={{ position: "absolute", left: "11%", top: "12%", width: "58%", height: "52%", borderRadius: 14, border: "1px solid rgba(181,202,255,0.18)", background: "rgba(10,16,30,0.10)" }} />

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

function FloatingWindow({ win, isActive, onFocus, onClose, onMinimize, onMove, onResize, children }) {
  const dragRef = useRef(null);
  const resizeRef = useRef(null);

  function startDrag(e) {
    if (e.target.closest("button")) return;
    e.preventDefault();
    onFocus(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const baseX = win.x;
    const baseY = win.y;

    function move(ev) {
      onMove(win.id, {
        x: baseX + (ev.clientX - startX),
        y: baseY + (ev.clientY - startY),
      });
    }

    function up() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    }

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  function startResize(e) {
    e.preventDefault();
    e.stopPropagation();
    onFocus(win.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const baseW = win.width;
    const baseH = win.height;

    function move(ev) {
      onResize(win.id, {
        width: Math.max(320, baseW + (ev.clientX - startX)),
        height: Math.max(220, baseH + (ev.clientY - startY)),
      });
    }

    function up() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    }

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 10 }}
      transition={{ duration: 0.18 }}
      onMouseDown={() => onFocus(win.id)}
      style={{
        position: "fixed",
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.minimized ? 54 : win.height,
        zIndex: isActive ? 90 : 70,
        ...shell({
          overflow: "hidden",
          boxShadow: isActive
            ? "0 28px 90px rgba(0,0,0,0.42), 0 0 36px rgba(96,120,255,0.10), inset 0 1px 0 rgba(255,255,255,0.06)"
            : "0 18px 60px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04)",
        }),
      }}
    >
      <div
        ref={dragRef}
        onMouseDown={startDrag}
        style={{
          height: 54,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "0 12px 0 14px",
          borderBottom: win.minimized ? "none" : "1px solid rgba(255,255,255,0.06)",
          cursor: "grab",
          background: "linear-gradient(180deg, rgba(18,24,50,0.92), rgba(9,12,24,0.92))",
        }}
      >
        <div style={{ ...titleCaps(13), letterSpacing: 2.4 }}>{win.title}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onMinimize(win.id)} style={miniButtonStyle()}><Minus size={15} /></button>
          <button style={miniButtonStyle()}><Maximize2 size={14} /></button>
          <button onClick={() => onClose(win.id)} style={miniButtonStyle()}><X size={15} /></button>
        </div>
      </div>

      {!win.minimized ? (
        <>
          <div style={{ height: `calc(100% - 54px)`, overflow: "auto", padding: 14 }}>{children}</div>
          <div
            ref={resizeRef}
            onMouseDown={startResize}
            style={{
              position: "absolute",
              right: 6,
              bottom: 6,
              width: 18,
              height: 18,
              cursor: "nwse-resize",
              background: "linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.28) 55%, transparent 55%)",
              opacity: 0.8,
            }}
          />
        </>
      ) : null}
    </motion.div>
  );
}

function miniButtonStyle() {
  return {
    width: 30,
    height: 30,
    borderRadius: 10,
    border: "1px solid rgba(182,204,255,0.10)",
    background: "linear-gradient(180deg, rgba(23,30,64,0.74), rgba(9,12,25,0.92))",
    color: "#eef2ff",
    cursor: "pointer",
    display: "grid",
    placeItems: "center",
  };
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

function renderWindowContent(mode, cases) {
  const texts = {
    zone: "Lecture de la zone sélectionnée. Ici on branchera plus tard les vraies actions contextuelles.",
    plan: "Espace dédié au plan. On le détaillera ensuite avec tes vrais placements, cases et outils.",
    suggestion: "Déplacer 3 pots vers la zone Est et garder la zone chaude pour les piments.",
    today: "Tailler les fraises, surveiller l’humidité du matin et vérifier la lumière des semis prioritaires.",
    status: `Enregistré • ${cases.length} case(s) • restauration locale active.`,
  };

  if (mode === "pots") {
    return (
      <div style={{ display: "grid", gap: 14 }}>
        <div style={soft({ padding: 18 })}>
          <div style={{ ...titleCaps(15), marginBottom: 12 }}>Ajouter des pots</div>
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
        </div>
        <button style={{ width: "100%", height: 48, borderRadius: 14, border: "1px solid rgba(138,160,255,0.26)", background: "linear-gradient(180deg, rgba(86,100,190,0.90), rgba(35,42,95,0.95))", color: "#fff8ef", fontWeight: 800, fontSize: 16, cursor: "pointer" }}>Créer les pots</button>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={soft({ padding: 18 })}>
        <div style={{ color: "#eef2ff", lineHeight: 1.72 }}>{texts[mode] || texts.status}</div>
      </div>
      <div style={soft({ padding: 14, maxHeight: 220, overflow: "auto" })}>
        <div style={{ ...titleCaps(14), marginBottom: 10 }}>Cases enregistrées</div>
        <div style={{ display: "grid", gap: 8 }}>
          {cases.map((c) => (
            <div key={c.id} style={{ display: "grid", gap: 2, padding: "8px 10px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <strong style={{ color: "#eef2ff", fontSize: 14 }}>{c.name}</strong>
              <span style={{ color: "rgba(214,222,255,0.62)", fontSize: 13 }}>{c.crop} · {c.zone}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function createWindow(mode, existingCount) {
  const titleMap = {
    zone: "Zone actuelle",
    plan: "Plan du jardin",
    suggestion: "IA Suggestion",
    today: "Aujourd’hui",
    status: "Statut",
    pots: "Ajouter des pots",
  };
  return {
    id: crypto.randomUUID(),
    mode,
    title: titleMap[mode] || "Fenêtre",
    x: 220 + existingCount * 26,
    y: 120 + existingCount * 22,
    width: mode === "pots" ? 430 : 420,
    height: mode === "pots" ? 380 : 340,
    minimized: false,
  };
}

export default function App() {
  const [cases, setCases] = useLocalStorageState(STORAGE_KEY, initialCases);
  const [createAt, setCreateAt] = useState(null);
  const [showUi, setShowUi] = useState(false);
  const [windows, setWindows] = useState([]);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowUi(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);

  function saveCase(data) {
    setCases((current) => [...current, { id: crypto.randomUUID(), ...data }]);
    setCreateAt(null);
  }

  function openWindow(mode) {
    setWindows((current) => {
      const next = [...current, createWindow(mode, current.length)];
      setActiveId(next[next.length - 1].id);
      return next;
    });
  }

  function closeWindow(id) {
    setWindows((current) => current.filter((w) => w.id !== id));
    setActiveId((prev) => (prev === id ? null : prev));
  }

  function minimizeWindow(id) {
    setWindows((current) => current.map((w) => (w.id === id ? { ...w, minimized: !w.minimized } : w)));
    setActiveId(id);
  }

  function moveWindow(id, pos) {
    setWindows((current) => current.map((w) => (w.id === id ? { ...w, ...pos } : w)));
  }

  function resizeWindow(id, size) {
    setWindows((current) => current.map((w) => (w.id === id ? { ...w, ...size } : w)));
  }

  function focusWindow(id) {
    setActiveId(id);
    setWindows((current) => {
      const target = current.find((w) => w.id === id);
      if (!target) return current;
      return [...current.filter((w) => w.id !== id), target];
    });
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", overflow: "hidden", color: "#eef2ff", fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <img
        src={REF_BG}
        alt="Fond potager"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 50%",
          transform: "scale(1.01)",
          filter: "saturate(1.06) contrast(1.06) brightness(0.99)",
          display: "block",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,8,18,0.02), rgba(4,8,18,0.14))" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at center, rgba(255,255,255,0.035), transparent 46%)" }} />
      <AmbientGlow />
      <HouseLights />
      <Fireflies />

      <AnimatePresence>
        {showUi ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ maxWidth: 980, margin: "0 auto", padding: "38px 24px 28px", position: "relative", zIndex: 20 }}>
            <HomeOverlay onOpenPanel={openWindow} onOpenCreate={setCreateAt} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {windows.map((win) => (
          <FloatingWindow
            key={win.id}
            win={win}
            isActive={activeId === win.id}
            onFocus={focusWindow}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onMove={moveWindow}
            onResize={resizeWindow}
          >
            {renderWindowContent(win.mode, cases)}
          </FloatingWindow>
        ))}
      </AnimatePresence>

      <AnimatePresence>{createAt ? <CreateCaseModal openAt={createAt} onClose={() => setCreateAt(null)} onSave={saveCase} /> : null}</AnimatePresence>
    </div>
  );
}
