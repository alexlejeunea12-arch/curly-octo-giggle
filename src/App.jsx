import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Droplets,
  Home,
  LayoutGrid,
  Leaf,
  Map,
  MoonStar,
  Pencil,
  Plus,
  Settings2,
  Shield,
  Sparkles,
  Sprout,
  Sun,
  Thermometer,
  Trash2,
  Triangle,
} from "lucide-react";

const STORAGE_KEYS = {
  beds: "potager-v35-beds",
  seedlings: "potager-v35-seedlings",
  alerts: "potager-v35-alerts",
  notes: "potager-v35-notes",
};

const initialBeds = [
  {
    id: crypto.randomUUID(),
    name: "Case 1",
    zone: "Mur gauche",
    exposure: "Mi-ombre / soleil progressif",
    status: "Préparation",
    crop: "À définir",
    note: "Zone pratique pour les cultures à surveiller de près.",
  },
  {
    id: crypto.randomUUID(),
    name: "Case 2",
    zone: "Centre",
    exposure: "Bonne lumière",
    status: "Disponible",
    crop: "Tomates",
    note: "Bonne candidate pour les tomates si tuteurage vertical.",
  },
  {
    id: crypto.randomUUID(),
    name: "Case 3",
    zone: "Près de la serre",
    exposure: "Chaud / protégé",
    status: "Surveillance",
    crop: "Poivrons / piments",
    note: "Zone logique pour les cultures aimant la chaleur.",
  },
];

const initialSeedlings = [
  {
    id: crypto.randomUUID(),
    name: "Piments",
    variety: "À préciser",
    sowingDate: "2026-03-08",
    location: "Serre de semis intérieure",
    status: "Semé",
    humidity: "Humide",
    light: "LED prioritaire",
    note: "Semis déjà lancés. À surveiller : chaleur, condensation, fonte des semis.",
  },
  {
    id: crypto.randomUUID(),
    name: "Poivrons",
    variety: "À préciser",
    sowingDate: "2026-03-08",
    location: "Serre de semis intérieure",
    status: "Semé",
    humidity: "Humide",
    light: "LED prioritaire",
    note: "Conserver une chaleur stable et aérer si condensation excessive.",
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
    note: "À ajouter quand le semis est réellement lancé.",
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
    title: "Préparer la future zone tomates",
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
      // ignore storage errors
    }
  }, [key, value]);

  return [value, setValue];
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <motion.div
      layout
      className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_40px_rgba(0,0,0,0.25)] backdrop-blur-xl"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-2 text-emerald-200">
          <Icon size={18} />
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-white/35">Live</span>
      </div>
      <div className="text-xs uppercase tracking-[0.25em] text-white/45">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-sm text-white/50">{hint}</div>
    </motion.div>
  );
}

function DockButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-3xl border px-4 py-4 text-left transition-all duration-300",
        active
          ? "border-emerald-300/40 bg-emerald-300/15 shadow-[0_0_40px_rgba(52,211,153,0.16)]"
          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "rounded-2xl p-2 transition-all duration-300",
            active ? "bg-emerald-200/20 text-emerald-200" : "bg-white/10 text-white/80"
          )}
        >
          <Icon size={18} />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          <div className="text-xs text-white/40">Accès direct</div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_40%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </button>
  );
}

function SectionCard({ title, subtitle, right, children, className = "" }) {
  return (
    <motion.section
      layout
      className={cn(
        "rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.25)]",
        className
      )}
    >
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-white/50">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      {children}
    </motion.section>
  );
}

function Badge({ children, tone = "default" }) {
  const tones = {
    default: "border-white/10 bg-white/5 text-white/70",
    green: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
    amber: "border-amber-300/20 bg-amber-400/10 text-amber-200",
    red: "border-rose-300/20 bg-rose-400/10 text-rose-200",
    blue: "border-sky-300/20 bg-sky-400/10 text-sky-200",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs", tones[tone])}>
      {children}
    </span>
  );
}

function Fireflies() {
  const dots = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 5,
        size: 3 + Math.random() * 6,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((dot) => (
        <motion.span
          key={dot.id}
          className="absolute rounded-full bg-white/70 blur-[1px]"
          style={{
            left: `${dot.left}%`,
            top: `${dot.top}%`,
            width: dot.size,
            height: dot.size,
            boxShadow: "0 0 18px rgba(255,255,255,0.45)",
          }}
          animate={{
            y: [0, -20, 12, 0],
            x: [0, 12, -8, 0],
            opacity: [0.2, 0.9, 0.45, 0.2],
            scale: [1, 1.25, 0.95, 1],
          }}
          transition={{
            duration: dot.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}

function Header({ view, setView }) {
  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(255,255,255,0.04),rgba(99,102,241,0.08))] p-6 shadow-[0_20px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.16),transparent_35%)]" />
      <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/55">
            <Sparkles size={14} className="text-emerald-200" />
            Potager V35 · Tour de contrôle immersive
          </div>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
            Un tableau de bord plus vivant, plus lisible, plus proche du réel.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
            Priorité au suivi concret : semis, humidité, lumière, cases, zones, alertes et décisions utiles.
            Le menu principal sert de centre de commandement, chaque icône ouvre une vue dédiée.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:w-[520px]">
          <DockButton icon={Home} label="Tour" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <DockButton icon={Map} label="Plan" active={view === "plan"} onClick={() => setView("plan")} />
          <DockButton icon={LayoutGrid} label="Cases" active={view === "beds"} onClick={() => setView("beds")} />
          <DockButton icon={Sprout} label="Semis" active={view === "seedlings"} onClick={() => setView("seedlings")} />
        </div>
      </div>
    </div>
  );
}

function Dashboard({ seedlings, beds, alerts, notes, setView, setNotes }) {
  const activeSeedlings = seedlings.filter((s) => s.status !== "Récolté");
  const urgentAlerts = alerts.filter((a) => !a.done && a.priority === "Haute");
  const availableBeds = beds.filter((b) => b.status === "Disponible");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Sprout}
          label="Semis suivis"
          value={activeSeedlings.length}
          hint="Ce qui est en cours ou planifié"
        />
        <StatCard
          icon={LayoutGrid}
          label="Cases"
          value={beds.length}
          hint={`${availableBeds.length} encore disponibles`}
        />
        <StatCard
          icon={Bell}
          label="Alertes"
          value={urgentAlerts.length}
          hint="Priorité haute à traiter"
        />
        <StatCard
          icon={Droplets}
          label="Surveillance"
          value={seedlings.filter((s) => s.humidity === "Humide").length}
          hint="Semis humides actuellement"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
        <SectionCard
          title="Centre de commandement"
          subtitle="La vue synthèse pour comprendre immédiatement ce qui demande ton attention"
        >
          <div className="grid gap-4 md:grid-cols-3">
            <button
              onClick={() => setView("seedlings")}
              className="rounded-3xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-left transition hover:bg-emerald-400/15"
            >
              <div className="mb-3 flex items-center gap-2 text-emerald-200">
                <Sprout size={18} />
                <span className="text-sm font-medium">Gestion semis</span>
              </div>
              <div className="text-sm leading-6 text-white/70">
                Suivre les dates, l’état, la lumière et l’humidité des semis de l’année.
              </div>
            </button>

            <button
              onClick={() => setView("beds")}
              className="rounded-3xl border border-sky-300/20 bg-sky-400/10 p-4 text-left transition hover:bg-sky-400/15"
            >
              <div className="mb-3 flex items-center gap-2 text-sky-200">
                <LayoutGrid size={18} />
                <span className="text-sm font-medium">Gestion des cases</span>
              </div>
              <div className="text-sm leading-6 text-white/70">
                Créer, modifier, supprimer et affecter les zones du jardin en quelques clics.
              </div>
            </button>

            <button
              onClick={() => setView("alerts")}
              className="rounded-3xl border border-amber-300/20 bg-amber-400/10 p-4 text-left transition hover:bg-amber-400/15"
            >
              <div className="mb-3 flex items-center gap-2 text-amber-200">
                <Bell size={18} />
                <span className="text-sm font-medium">Alarmes & vigilance</span>
              </div>
              <div className="text-sm leading-6 text-white/70">
                Aération, humidité, condensation, zones chaudes, préparation du terrain.
              </div>
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Notes de terrain" subtitle="Toujours reliées au réel avant le reste">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex : condensation forte le matin, terreau encore humide, lumière correcte sur l’étagère haute…"
            className="min-h-[220px] w-full rounded-3xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none placeholder:text-white/25"
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <SectionCard title="Priorités immédiates" subtitle="Ce qui mérite une action concrète aujourd’hui">
          <div className="space-y-3">
            {urgentAlerts.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
                Aucune alerte haute pour l’instant.
              </div>
            ) : (
              urgentAlerts.map((alert) => (
                <div key={alert.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">{alert.title}</div>
                      <div className="mt-1 text-xs text-white/45">{alert.category}</div>
                    </div>
                    <Badge tone="red">Priorité haute</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Semis récents / en vue" subtitle="Le module que tu voulais vraiment mettre en avant dans cette version">
          <div className="space-y-3">
            {seedlings.slice(0, 4).map((seedling) => (
              <div key={seedling.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-medium text-white">{seedling.name}</div>
                  <Badge tone={seedling.status === "Semé" ? "green" : seedling.status === "Prévu" ? "amber" : "blue"}>
                    {seedling.status}
                  </Badge>
                </div>
                <div className="mt-2 text-sm text-white/50">
                  {seedling.sowingDate ? `Date : ${seedling.sowingDate}` : "Date non renseignée"} · {seedling.location}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function PlanView() {
  const zones = [
    {
      title: "Mur gauche",
      desc: "Zone pratique pour serre, surveillance rapprochée et cultures fragiles.",
      tone: "from-emerald-400/20 to-transparent",
    },
    {
      title: "Centre du jardin",
      desc: "Zone lisible pour cultures majeures, circulation et vision d’ensemble.",
      tone: "from-sky-400/20 to-transparent",
    },
    {
      title: "Près des protections",
      desc: "Espace à relier aux systèmes anti-nuisibles et à l’observation météo.",
      tone: "from-amber-400/20 to-transparent",
    },
    {
      title: "Zone serre / semis",
      desc: "Point chaud pour ce qui a besoin d’un meilleur contrôle lumière + humidité.",
      tone: "from-fuchsia-400/20 to-transparent",
    },
  ];

  return (
    <div className="space-y-6">
      <SectionCard title="Plan du jardin" subtitle="Vue conceptuelle en attendant les emplacements réels peaufinés avec tes photos">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
            <div className="grid h-[420px] grid-cols-3 gap-3 rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.10),rgba(255,255,255,0.02),rgba(0,0,0,0.15))] p-3">
              <div className="col-span-1 rounded-[24px] border border-emerald-300/20 bg-emerald-500/10 p-4">
                <div className="text-sm font-medium text-emerald-200">Mur gauche</div>
                <div className="mt-2 text-xs leading-6 text-white/60">
                  Surveillances, semis, accès rapide, zone stratégique.
                </div>
              </div>
              <div className="col-span-2 rounded-[24px] border border-sky-300/20 bg-sky-500/10 p-4">
                <div className="text-sm font-medium text-sky-200">Grand espace principal</div>
                <div className="mt-2 text-xs leading-6 text-white/60">
                  Cases majeures, cultures structurantes, futur plan détaillé.
                </div>
              </div>
              <div className="col-span-2 rounded-[24px] border border-amber-300/20 bg-amber-500/10 p-4">
                <div className="text-sm font-medium text-amber-200">Zone protections / vigilance</div>
                <div className="mt-2 text-xs leading-6 text-white/60">
                  Nuisibles, barrières, filets, surveillance spécifique.
                </div>
              </div>
              <div className="rounded-[24px] border border-fuchsia-300/20 bg-fuchsia-500/10 p-4">
                <div className="text-sm font-medium text-fuchsia-200">Serre / appui</div>
                <div className="mt-2 text-xs leading-6 text-white/60">
                  Zone chaude et technique.
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {zones.map((zone) => (
              <div key={zone.title} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className={`mb-3 h-16 rounded-2xl bg-gradient-to-br ${zone.tone}`} />
                <div className="text-sm font-medium text-white">{zone.title}</div>
                <div className="mt-2 text-sm leading-6 text-white/50">{zone.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function BedsView({ beds, setBeds }) {
  const [form, setForm] = useState({
    name: "",
    zone: "",
    exposure: "",
    status: "Disponible",
    crop: "",
    note: "",
  });
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setForm({
      name: "",
      zone: "",
      exposure: "",
      status: "Disponible",
      crop: "",
      note: "",
    });
    setEditingId(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      setBeds((current) => current.map((bed) => (bed.id === editingId ? { ...bed, ...form } : bed)));
    } else {
      setBeds((current) => [...current, { id: crypto.randomUUID(), ...form }]);
    }
    resetForm();
  }

  function startEdit(bed) {
    setEditingId(bed.id);
    setForm({
      name: bed.name,
      zone: bed.zone,
      exposure: bed.exposure,
      status: bed.status,
      crop: bed.crop,
      note: bed.note,
    });
  }

  function removeBed(id) {
    setBeds((current) => current.filter((bed) => bed.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <SectionCard
        title="Créer / modifier une case"
        subtitle="Tu voulais pouvoir les créer et les supprimer proprement : c’est intégré dans cette version"
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input label="Nom" value={form.name} onChange={(value) => setForm((f) => ({ ...f, name: value }))} />
          <Input label="Zone" value={form.zone} onChange={(value) => setForm((f) => ({ ...f, zone: value }))} />
          <Input
            label="Exposition"
            value={form.exposure}
            onChange={(value) => setForm((f) => ({ ...f, exposure: value }))}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Select
              label="Statut"
              value={form.status}
              onChange={(value) => setForm((f) => ({ ...f, status: value }))}
              options={["Disponible", "Préparation", "Planté", "Surveillance"]}
            />
            <Input label="Culture" value={form.crop} onChange={(value) => setForm((f) => ({ ...f, crop: value }))} />
          </div>
          <TextArea label="Note" value={form.note} onChange={(value) => setForm((f) => ({ ...f, note: value }))} />

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 transition hover:bg-emerald-400/15">
              <Plus size={16} />
              {editingId ? "Enregistrer la modification" : "Ajouter la case"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition hover:bg-white/10"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Cases du jardin" subtitle="Vue manipulable et orientée action">
        <div className="grid gap-4">
          {beds.map((bed) => (
            <motion.div
              layout
              key={bed.id}
              className="rounded-[26px] border border-white/10 bg-white/5 p-4"
              whileHover={{ y: -2 }}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-sm font-semibold text-white">{bed.name}</div>
                    <Badge tone={bed.status === "Disponible" ? "blue" : bed.status === "Planté" ? "green" : "amber"}>
                      {bed.status}
                    </Badge>
                  </div>
                  <div className="mt-2 text-sm text-white/50">
                    {bed.zone} · {bed.exposure}
                  </div>
                  <div className="mt-2 text-sm text-white/70">Culture : {bed.crop || "—"}</div>
                  <div className="mt-3 text-sm leading-6 text-white/45">{bed.note || "Aucune note."}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(bed)}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => removeBed(bed.id)}
                    className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-rose-200 transition hover:bg-rose-400/15"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function SeedlingsView({ seedlings, setSeedlings }) {
  const emptyForm = {
    name: "",
    variety: "",
    sowingDate: "",
    location: "",
    status: "Prévu",
    humidity: "",
    light: "",
    note: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      setSeedlings((current) => current.map((item) => (item.id === editingId ? { ...item, ...form } : item)));
    } else {
      setSeedlings((current) => [{ id: crypto.randomUUID(), ...form }, ...current]);
    }
    resetForm();
  }

  function edit(seedling) {
    setEditingId(seedling.id);
    setForm({
      name: seedling.name,
      variety: seedling.variety,
      sowingDate: seedling.sowingDate,
      location: seedling.location,
      status: seedling.status,
      humidity: seedling.humidity,
      light: seedling.light,
      note: seedling.note,
    });
  }

  function remove(id) {
    setSeedlings((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <SectionCard
        title="Gestion semis"
        subtitle="Le vrai sous-menu demandé : date, emplacement, statut, humidité, lumière, notes"
        right={<Badge tone="green">Suivi 2026</Badge>}
      >
        <form onSubmit={submit} className="space-y-3">
          <Input label="Culture" value={form.name} onChange={(value) => setForm((f) => ({ ...f, name: value }))} />
          <Input label="Variété" value={form.variety} onChange={(value) => setForm((f) => ({ ...f, variety: value }))} />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Date du semis"
              type="date"
              value={form.sowingDate}
              onChange={(value) => setForm((f) => ({ ...f, sowingDate: value }))}
            />
            <Input label="Emplacement" value={form.location} onChange={(value) => setForm((f) => ({ ...f, location: value }))} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Select
              label="Statut"
              value={form.status}
              onChange={(value) => setForm((f) => ({ ...f, status: value }))}
              options={["Prévu", "Semé", "Levée", "Repiqué", "Planté", "Récolté"]}
            />
            <Input label="Humidité" value={form.humidity} onChange={(value) => setForm((f) => ({ ...f, humidity: value }))} />
            <Input label="Lumière" value={form.light} onChange={(value) => setForm((f) => ({ ...f, light: value }))} />
          </div>
          <TextArea label="Note" value={form.note} onChange={(value) => setForm((f) => ({ ...f, note: value }))} />

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 transition hover:bg-emerald-400/15">
              <Plus size={16} />
              {editingId ? "Mettre à jour le semis" : "Ajouter le semis"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 transition hover:bg-white/10"
            >
              Réinitialiser
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Liste des semis" subtitle="Pensée pour le suivi réel, pas seulement pour faire joli">
        <div className="space-y-4">
          {seedlings.map((seedling) => {
            const tone =
              seedling.status === "Semé"
                ? "green"
                : seedling.status === "Prévu"
                ? "amber"
                : seedling.status === "Levée"
                ? "blue"
                : "default";

            return (
              <motion.div
                layout
                key={seedling.id}
                className="rounded-[26px] border border-white/10 bg-white/5 p-4"
                whileHover={{ y: -2 }}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-white">{seedling.name}</div>
                      <Badge tone={tone}>{seedling.status}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-white/50">
                      {seedling.variety || "Variété non précisée"}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge tone="default">Date : {seedling.sowingDate || "—"}</Badge>
                      <Badge tone="default">Lieu : {seedling.location || "—"}</Badge>
                      <Badge tone="default">Humidité : {seedling.humidity || "—"}</Badge>
                      <Badge tone="default">Lumière : {seedling.light || "—"}</Badge>
                    </div>
                    <div className="mt-3 text-sm leading-6 text-white/45">{seedling.note || "Aucune note pour le moment."}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => edit(seedling)}
                      className="rounded-2xl border border-white/10 bg-white/5 p-3 text-white/70 transition hover:bg-white/10"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remove(seedling.id)}
                      className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-rose-200 transition hover:bg-rose-400/15"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </SectionCard>
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
    setAlerts((current) => [
      { id: crypto.randomUUID(), title: title.trim(), category, priority, done: false },
      ...current,
    ]);
    setTitle("");
    setCategory("Semis");
    setPriority("Moyenne");
  }

  function toggleDone(id) {
    setAlerts((current) => current.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }

  function remove(id) {
    setAlerts((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <SectionCard title="Nouvelle alarme" subtitle="Pour rester dans le thème tour de contrôle et vigilance">
        <form onSubmit={addAlert} className="space-y-3">
          <Input label="Titre" value={title} onChange={setTitle} />
          <div className="grid gap-3 md:grid-cols-2">
            <Select label="Catégorie" value={category} onChange={setCategory} options={["Semis", "Humidité", "Lumière", "Jardin", "Protection"]} />
            <Select label="Priorité" value={priority} onChange={setPriority} options={["Basse", "Moyenne", "Haute"]} />
          </div>
          <button className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100 transition hover:bg-amber-400/15">
            <Bell size={16} />
            Ajouter l’alarme
          </button>
        </form>
      </SectionCard>

      <SectionCard title="Mur des alertes" subtitle="Ce qui demande ton attention concrète">
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-[26px] border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className={cn("text-sm font-medium", alert.done ? "text-white/35 line-through" : "text-white")}>
                      {alert.title}
                    </div>
                    <Badge tone={alert.priority === "Haute" ? "red" : alert.priority === "Moyenne" ? "amber" : "blue"}>
                      {alert.priority}
                    </Badge>
                    <Badge tone="default">{alert.category}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleDone(alert.id)}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/70 transition hover:bg-white/10"
                  >
                    {alert.done ? "Réactiver" : "Terminé"}
                  </button>
                  <button
                    onClick={() => remove(alert.id)}
                    className="rounded-2xl border border-rose-300/20 bg-rose-400/10 p-3 text-rose-200 transition hover:bg-rose-400/15"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function ProtectionView() {
  const items = [
    {
      icon: Shield,
      title: "Protection générale",
      text: "Prévoir la logique filets / barrières / surveillance avant la mise en place définitive des cultures les plus sensibles.",
    },
    {
      icon: Droplets,
      title: "Humidité & condensation",
      text: "Si la mini-serre perle trop, aérer progressivement pour éviter un environnement trop fermé.",
    },
    {
      icon: Sun,
      title: "Lumière",
      text: "Prioriser les LED sur piments et poivrons, et réserver les meilleurs emplacements lumineux aux semis exigeants.",
    },
    {
      icon: Thermometer,
      title: "Chaleur",
      text: "Stabilité avant tout : éviter les gros écarts de température si les semis viennent d’être lancés.",
    },
  ];

  return (
    <SectionCard title="Protection & stratégie" subtitle="Une section plus immersive pour tout ce qui touche à la vigilance du potager">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/10 p-3 text-white/80">
                <Icon size={18} />
              </div>
              <div className="text-base font-medium text-white">{item.title}</div>
              <div className="mt-2 text-sm leading-6 text-white/50">{item.text}</div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

function CalendarView({ seedlings }) {
  const entries = seedlings
    .filter((item) => item.sowingDate)
    .sort((a, b) => a.sowingDate.localeCompare(b.sowingDate));

  return (
    <SectionCard title="Chronologie réelle" subtitle="Pour garder une logique de suivi chronologique claire">
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
            Aucun événement daté pour le moment.
          </div>
        ) : (
          entries.map((entry, index) => (
            <div key={entry.id} className="flex gap-4">
              <div className="flex w-10 flex-col items-center">
                <div className="mt-1 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.8)]" />
                {index !== entries.length - 1 ? <div className="mt-2 w-px flex-1 bg-white/10" /> : null}
              </div>
              <div className="w-full rounded-[26px] border border-white/10 bg-white/5 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold text-white">{entry.sowingDate}</div>
                  <Badge tone="green">{entry.status}</Badge>
                </div>
                <div className="mt-2 text-sm text-white/70">{entry.name}</div>
                <div className="mt-1 text-sm text-white/45">{entry.location || "Emplacement non précisé"}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </SectionCard>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-900 text-white">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.22em] text-white/40">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[110px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
      />
    </label>
  );
}

export default function App() {
  const [view, setView] = useState("dashboard");
  const [beds, setBeds] = useLocalStorageState(STORAGE_KEYS.beds, initialBeds);
  const [seedlings, setSeedlings] = useLocalStorageState(STORAGE_KEYS.seedlings, initialSeedlings);
  const [alerts, setAlerts] = useLocalStorageState(STORAGE_KEYS.alerts, initialAlerts);
  const [notes, setNotes] = useLocalStorageState(STORAGE_KEYS.notes, "");

  const navigation = [
    { key: "dashboard", label: "Tour de contrôle", icon: Home },
    { key: "plan", label: "Plan du jardin", icon: Map },
    { key: "beds", label: "Cases", icon: LayoutGrid },
    { key: "seedlings", label: "Gestion semis", icon: Sprout },
    { key: "alerts", label: "Alarmes", icon: Bell },
    { key: "protection", label: "Protection", icon: Shield },
    { key: "timeline", label: "Chronologie", icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-[#07110f] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.10),transparent_25%),radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.10),transparent_25%),linear-gradient(180deg,#07110f,#091715,#081111)]" />
      <Fireflies />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-4 md:px-6 md:py-6 xl:px-8">
        <Header view={view} setView={setView} />

        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="h-fit rounded-[30px] border border-white/10 bg-white/5 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl">
            <div className="mb-4 flex items-center gap-3 px-2">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-2 text-emerald-200">
                <Leaf size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Navigation V35</div>
                <div className="text-xs text-white/40">Menus accessibles en un clic</div>
              </div>
            </div>

            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setView(item.key)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-300",
                      view === item.key
                        ? "border-emerald-300/30 bg-emerald-400/10 text-white shadow-[0_0_40px_rgba(52,211,153,0.12)]"
                        : "border-white/8 bg-black/10 text-white/65 hover:border-white/15 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-xl p-2",
                        view === item.key ? "bg-emerald-400/15 text-emerald-200" : "bg-white/5 text-white/60"
                      )}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <MoonStar size={16} className="text-white/70" />
                Ambiance
              </div>
              <div className="mt-2 text-sm leading-6 text-white/45">
                Fond obscur, lueurs discrètes, cartes vitrées, logique de contrôle central et sections spécialisées.
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {view === "dashboard" && (
                  <Dashboard
                    seedlings={seedlings}
                    beds={beds}
                    alerts={alerts}
                    notes={notes}
                    setView={setView}
                    setNotes={setNotes}
                  />
                )}
                {view === "plan" && <PlanView />}
                {view === "beds" && <BedsView beds={beds} setBeds={setBeds} />}
                {view === "seedlings" && <SeedlingsView seedlings={seedlings} setSeedlings={setSeedlings} />}
                {view === "alerts" && <AlertsView alerts={alerts} setAlerts={setAlerts} />}
                {view === "protection" && <ProtectionView />}
                {view === "timeline" && <CalendarView seedlings={seedlings} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
