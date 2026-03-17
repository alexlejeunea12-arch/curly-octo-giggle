import React, { useMemo, useState } from "react";
import {
  LayoutDashboard,
  Map,
  Sprout,
  Bell,
  Settings,
  Maximize2,
  Minimize2,
  PanelLeft,
  Search,
  CalendarDays,
  FolderKanban,
  Activity,
  ChevronRight,
  CircleAlert,
  Sparkles,
  Grid3X3,
  Eye,
} from "lucide-react";

export default function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [planExpanded, setPlanExpanded] = useState(false);
  const [leftCollapsed, setLeftCollapsed] = useState(false);

  const menu = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Tour de contrôle",
        icon: LayoutDashboard,
        description: "Vue centrale du potager",
      },
      {
        id: "plan",
        label: "Plan du jardin",
        icon: Map,
        description: "Vue spatiale et zones",
      },
      {
        id: "seedlings",
        label: "Gestion des semis",
        icon: Sprout,
        description: "Variétés, dates, état",
      },
      {
        id: "alerts",
        label: "Alarmes",
        icon: Bell,
        description: "Points de vigilance",
      },
      {
        id: "modules",
        label: "Modules",
        icon: Grid3X3,
        description: "Extensions futures",
      },
      {
        id: "settings",
        label: "Réglages",
        icon: Settings,
        description: "Personnalisation interface",
      },
    ],
    []
  );

  const quickAccess = [
    { title: "Plan du jardin", subtitle: "Ouvrir la carte principale", icon: Map, view: "plan" },
    { title: "Gestion des semis", subtitle: "Accéder aux variétés et dates", icon: Sprout, view: "seedlings" },
    { title: "Alarmes", subtitle: "Voir les priorités du tableau", icon: Bell, view: "alerts" },
    { title: "Modules", subtitle: "Ajouter des fonctions futures", icon: Grid3X3, view: "modules" },
  ];

  const alerts = [
    { level: "Élevée", label: "Bloc de suivi prioritaire", detail: "Zone dédiée aux alertes critiques" },
    { level: "Modérée", label: "Organisation des modules", detail: "Préparer la personnalisation future" },
    { level: "Faible", label: "Affinage visuel", detail: "Ajustements premium et transparence" },
  ];

  const seedlings = [
    { name: "Module variété", status: "Prêt", date: "À définir", note: "Bloc prévu pour les espèces" },
    { name: "Module calendrier", status: "Prêt", date: "À définir", note: "Dates et échéances futures" },
    { name: "Module état", status: "En attente", date: "À définir", note: "Suivi détaillé à brancher" },
    { name: "Module observations", status: "En attente", date: "À définir", note: "Commentaires et historique" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111a] text-white">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen">
        <aside
          className={`transition-all duration-300 border-r border-white/10 bg-white/5 backdrop-blur-2xl ${
            leftCollapsed ? "w-[88px]" : "w-[300px]"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="border-b border-white/10 p-4">
              <div className="flex items-center justify-between gap-3">
                {!leftCollapsed && (
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/15 ring-1 ring-emerald-300/20">
                        <Sparkles className="h-5 w-5 text-emerald-200" />
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                          Potager Control
                        </p>
                        <h1 className="text-lg font-semibold text-white/95">
                          Tableau de bord
                        </h1>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setLeftCollapsed(!leftCollapsed)}
                  className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  <PanelLeft className="h-4 w-4" />
                </button>
              </div>

              {!leftCollapsed && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-2 text-white/60">
                    <Search className="h-4 w-4" />
                    <span className="text-sm">Recherche interface</span>
                  </div>
                </div>
              )}
            </div>

            <nav className="flex-1 p-3">
              <div className="space-y-2">
                {menu.map((item) => {
                  const Icon = item.icon;
                  const active = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`group w-full rounded-2xl border p-3 text-left transition-all duration-200 ${
                        active
                          ? "border-emerald-300/30 bg-emerald-300/12 shadow-[0_0_0_1px_rgba(110,231,183,0.08)]"
                          : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                            active
                              ? "bg-emerald-300/15 text-emerald-100"
                              : "bg-white/6 text-white/75"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        {!leftCollapsed && (
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate font-medium text-white/95">
                                {item.label}
                              </p>
                              <ChevronRight
                                className={`h-4 w-4 transition ${
                                  active
                                    ? "translate-x-0 text-emerald-100"
                                    : "text-white/30 group-hover:translate-x-0.5"
                                }`}
                              />
                            </div>
                            <p className="truncate text-xs text-white/45">
                              {item.description}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </nav>

            {!leftCollapsed && (
              <div className="border-t border-white/10 p-4">
                <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">
                    Vision
                  </p>
                  <h3 className="mt-2 text-base font-semibold text-white/95">
                    Interface centrale premium
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    Base propre, modulaire, lisible et évolutive pour construire
                    une vraie tour de contrôle du potager.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>

        <main className="flex-1">
          <TopBar activeView={activeView} />

          <div className="p-5 md:p-6">
            {planExpanded ? (
              <ExpandedPlanView
                onClose={() => setPlanExpanded(false)}
                onGoDashboard={() => {
                  setPlanExpanded(false);
                  setActiveView("dashboard");
                }}
              />
            ) : (
              <div className="space-y-6">
                {activeView === "dashboard" && (
                  <>
                    <HeroPanel onOpenPlan={() => setActiveView("plan")} />

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                      <GlassPanel className="xl:col-span-8">
                        <SectionTitle
                          eyebrow="Accueil central"
                          title="Accès rapide"
                          subtitle="Structure claire pour piloter les grandes fonctions du site."
                        />
                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                          {quickAccess.map((item) => {
                            const Icon = item.icon;
                            return (
                              <button
                                key={item.title}
                                onClick={() => setActiveView(item.view)}
                                className="group rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-emerald-300/20 hover:bg-white/[0.06]"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-100">
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <ChevronRight className="mt-1 h-4 w-4 text-white/30 transition group-hover:translate-x-1 group-hover:text-white/70" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-white/95">
                                  {item.title}
                                </h3>
                                <p className="mt-1 text-sm text-white/55">
                                  {item.subtitle}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </GlassPanel>

                      <GlassPanel className="xl:col-span-4">
                        <SectionTitle
                          eyebrow="Synthèse"
                          title="Points de vigilance"
                          subtitle="Zone visuelle dédiée aux priorités et à l’organisation du tableau."
                        />
                        <div className="mt-5 space-y-3">
                          {alerts.map((item, index) => (
                            <div
                              key={index}
                              className="rounded-2xl border border-white/10 bg-black/20 p-4"
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5 rounded-xl bg-amber-300/10 p-2 text-amber-200">
                                  <CircleAlert className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs uppercase tracking-[0.22em] text-white/40">
                                    {item.level}
                                  </p>
                                  <p className="mt-1 font-medium text-white/90">
                                    {item.label}
                                  </p>
                                  <p className="mt-1 text-sm text-white/55">
                                    {item.detail}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassPanel>
                    </div>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
                      <GlassPanel className="xl:col-span-7">
                        <SectionTitle
                          eyebrow="Plan"
                          title="Fenêtre dédiée au jardin"
                          subtitle="Le plan doit pouvoir vivre séparément du reste, comme un vrai module indépendant."
                        />
                        <div className="mt-5">
                          <PlanPreview onExpand={() => setPlanExpanded(true)} />
                        </div>
                      </GlassPanel>

                      <GlassPanel className="xl:col-span-5">
                        <SectionTitle
                          eyebrow="Architecture"
                          title="Modules à brancher"
                          subtitle="Base prévue pour accueillir les futurs systèmes du site."
                        />
                        <div className="mt-5 grid grid-cols-1 gap-3">
                          {[
                            "Calendrier des étapes",
                            "Fiches variétés",
                            "Historique des observations",
                            "Organisation des fenêtres",
                            "Réagencement de l’accueil",
                            "Personnalisation de l’interface",
                          ].map((item) => (
                            <div
                              key={item}
                              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3"
                            >
                              <span className="text-sm text-white/75">{item}</span>
                              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-emerald-100">
                                Prévu
                              </span>
                            </div>
                          ))}
                        </div>
                      </GlassPanel>
                    </div>
                  </>
                )}

                {activeView === "plan" && (
                  <GlassPanel>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <SectionTitle
                          eyebrow="Vue dédiée"
                          title="Plan du jardin"
                          subtitle="Module indépendant, plus lisible et mieux isolé du reste de l’interface."
                        />
                      </div>

                      <button
                        onClick={() => setPlanExpanded(true)}
                        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/12 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/18"
                      >
                        <Maximize2 className="h-4 w-4" />
                        Isoler le plan
                      </button>
                    </div>

                    <div className="mt-6">
                      <PlanPreview onExpand={() => setPlanExpanded(true)} />
                    </div>
                  </GlassPanel>
                )}

                {activeView === "seedlings" && (
                  <GlassPanel>
                    <SectionTitle
                      eyebrow="Gestion"
                      title="Gestion des semis"
                      subtitle="Base d’interface pour accueillir variétés, dates, états, suivis et observations."
                    />

                    <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
                      <div className="grid grid-cols-4 border-b border-white/10 bg-white/[0.04] text-sm text-white/55">
                        <div className="px-4 py-3">Module</div>
                        <div className="px-4 py-3">État</div>
                        <div className="px-4 py-3">Date</div>
                        <div className="px-4 py-3">Note</div>
                      </div>

                      {seedlings.map((row) => (
                        <div
                          key={row.name}
                          className="grid grid-cols-1 border-b border-white/10 bg-black/10 last:border-b-0 md:grid-cols-4"
                        >
                          <div className="px-4 py-4 text-white/92">{row.name}</div>
                          <div className="px-4 py-4">
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70">
                              {row.status}
                            </span>
                          </div>
                          <div className="px-4 py-4 text-white/60">{row.date}</div>
                          <div className="px-4 py-4 text-white/55">{row.note}</div>
                        </div>
                      ))}
                    </div>
                  </GlassPanel>
                )}

                {activeView === "alerts" && (
                  <GlassPanel>
                    <SectionTitle
                      eyebrow="Priorités"
                      title="Alarmes et vigilance"
                      subtitle="Section prévue pour centraliser les alertes importantes du tableau de bord."
                    />

                    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                      {[
                        {
                          title: "Alertes critiques",
                          desc: "Bloc réservé aux éléments à traiter en priorité.",
                          icon: Bell,
                        },
                        {
                          title: "Suivi des anomalies",
                          desc: "Espace pour les écarts, oublis, retards et incohérences.",
                          icon: Activity,
                        },
                        {
                          title: "Journal d’actions",
                          desc: "Historique futur des interventions et validations du tableau.",
                          icon: FolderKanban,
                        },
                      ].map((card) => {
                        const Icon = card.icon;
                        return (
                          <div
                            key={card.title}
                            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                          >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-300/10 text-rose-100">
                              <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="mt-4 text-base font-semibold text-white/95">
                              {card.title}
                            </h3>
                            <p className="mt-2 text-sm leading-relaxed text-white/55">
                              {card.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </GlassPanel>
                )}

                {activeView === "modules" && (
                  <GlassPanel>
                    <SectionTitle
                      eyebrow="Extensions"
                      title="Modules et évolutions"
                      subtitle="Zone pensée pour brancher progressivement les fonctions futures du site."
                    />

                    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {[
                        "Calendrier",
                        "Fiches variétés",
                        "Suivis",
                        "Observations",
                        "Réorganisation des blocs",
                        "Fenêtres déplaçables",
                        "Disposition personnalisée",
                        "État général du tableau",
                        "Raccourcis contextuels",
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.025] p-5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-100">
                              <Grid3X3 className="h-4 w-4" />
                            </div>
                            <p className="font-medium text-white/90">{item}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassPanel>
                )}

                {activeView === "settings" && (
                  <GlassPanel>
                    <SectionTitle
                      eyebrow="Réglages"
                      title="Personnalisation future"
                      subtitle="Préparation de la modularité, du réagencement et des préférences visuelles."
                    />

                    <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                      {[
                        {
                          title: "Disposition",
                          desc: "Prévoir le déplacement et la réorganisation des blocs.",
                        },
                        {
                          title: "Fenêtres",
                          desc: "Préparer l’isolation et la gestion indépendante des vues.",
                        },
                        {
                          title: "Transparence",
                          desc: "Affiner l’effet premium et la profondeur visuelle.",
                        },
                        {
                          title: "Ambiance",
                          desc: "Ajuster le fond, les animations et le niveau de contraste.",
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="rounded-3xl border border-white/10 bg-white/[0.04] p-5"
                        >
                          <h3 className="text-base font-semibold text-white/95">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm text-white/55">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </GlassPanel>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function TopBar({ activeView }) {
  const titles = {
    dashboard: "Tour de contrôle",
    plan: "Plan du jardin",
    seedlings: "Gestion des semis",
    alerts: "Alarmes",
    modules: "Modules",
    settings: "Réglages",
  };

  return (
    <div className="sticky top-0 z-20 border-b border-white/10 bg-[#08121b]/60 backdrop-blur-2xl">
      <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
            Interface centrale
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white/95">
            {titles[activeView]}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusPill icon={Eye} label="Vue premium" />
          <StatusPill icon={CalendarDays} label="Base évolutive" />
          <StatusPill icon={Activity} label="Architecture propre" />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ icon: Icon, label }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/65">
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </div>
  );
}

function HeroPanel({ onOpenPlan }) {
  return (
    <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.08] via-white/[0.03] to-transparent p-6 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.10),transparent_28%)]" />

      <div className="relative z-10 grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-emerald-100/55">
            Tableau de bord premium
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white/95 md:text-5xl">
            Une vraie tour de contrôle visuelle, claire, modulaire et immersive.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
            Cette base recentre le projet sur une interface nette, élégante et
            évolutive. L’accueil reste fort visuellement, tandis que les grandes
            fonctions sont séparées proprement pour construire la suite sans
            repartir dans tous les sens.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onOpenPlan}
              className="rounded-2xl border border-emerald-300/20 bg-emerald-300/12 px-5 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/18"
            >
              Ouvrir le plan
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/[0.08]">
              Continuer la structure
            </button>
          </div>
        </div>

        <div className="xl:col-span-4">
          <div className="grid grid-cols-1 gap-4">
            <MiniMetric title="Accueil central" value="Actif" sub="Base propre lancée" />
            <MiniMetric title="Plan isolable" value="Oui" sub="Fenêtre dédiée prévue" />
            <MiniMetric title="Style premium" value="Renforcé" sub="Transparence plus fine" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ title, value, sub }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.22em] text-white/35">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-white/95">{value}</p>
      <p className="mt-1 text-sm text-white/50">{sub}</p>
    </div>
  );
}

function GlassPanel({ children, className = "" }) {
  return (
    <section
      className={`rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl md:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-white/95">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/55">
        {subtitle}
      </p>
    </div>
  );
}

function PlanPreview({ onExpand }) {
  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#08131c]/90">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white/85">Fenêtre plan</p>
          <p className="text-xs text-white/40">Module spatial indépendant</p>
        </div>

        <button
          onClick={onExpand}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        >
          <Maximize2 className="h-4 w-4" />
          Isoler
        </button>
      </div>

      <div className="grid grid-cols-12 gap-3 p-4">
        <MapZone className="col-span-12 h-28 md:col-span-8" label="Zone principale" tone="emerald" />
        <MapZone className="col-span-6 h-24 md:col-span-4" label="Accès" tone="cyan" />
        <MapZone className="col-span-6 h-24 md:col-span-4" label="Bloc A" tone="sky" />
        <MapZone className="col-span-6 h-24 md:col-span-4" label="Bloc B" tone="emerald" />
        <MapZone className="col-span-6 h-24 md:col-span-4" label="Bloc C" tone="violet" />
      </div>
    </div>
  );
}

function MapZone({ label, className, tone = "emerald" }) {
  const toneClass =
    tone === "cyan"
      ? "from-cyan-400/18 to-cyan-300/8 border-cyan-300/15"
      : tone === "sky"
      ? "from-sky-400/18 to-sky-300/8 border-sky-300/15"
      : tone === "violet"
      ? "from-violet-400/18 to-violet-300/8 border-violet-300/15"
      : "from-emerald-400/18 to-emerald-300/8 border-emerald-300/15";

  return (
    <div
      className={`rounded-[24px] border bg-gradient-to-br ${toneClass} p-4 ${className}`}
    >
      <div className="flex h-full flex-col justify-between">
        <span className="text-xs uppercase tracking-[0.24em] text-white/35">
          Zone
        </span>
        <p className="text-sm font-medium text-white/88">{label}</p>
      </div>
    </div>
  );
}

function ExpandedPlanView({ onClose, onGoDashboard }) {
  return (
    <div className="rounded-[32px] border border-white/10 bg-[#08131c]/85 p-5 backdrop-blur-2xl md:p-6">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/35">
            Fenêtre isolée
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white/95">
            Plan du jardin — vue indépendante
          </h2>
          <p className="mt-2 text-sm text-white/55">
            Le plan est ici séparé du reste de l’interface pour une lecture plus
            claire et un vrai fonctionnement modulaire.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={onGoDashboard}
            className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/75 transition hover:bg-white/[0.08]"
          >
            Retour accueil
          </button>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300/20 bg-emerald-300/12 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-300/18"
          >
            <Minimize2 className="h-4 w-4" />
            Réintégrer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <MapZone className="col-span-12 h-40 xl:col-span-8" label="Zone centrale du plan" tone="emerald" />
        <MapZone className="col-span-12 h-32 md:col-span-6 xl:col-span-4" label="Légende / repères" tone="cyan" />
        <MapZone className="col-span-12 h-32 md:col-span-4" label="Secteur 1" tone="sky" />
        <MapZone className="col-span-12 h-32 md:col-span-4" label="Secteur 2" tone="emerald" />
        <MapZone className="col-span-12 h-32 md:col-span-4" label="Secteur 3" tone="violet" />
        <MapZone className="col-span-12 h-28 md:col-span-3" label="Accès" tone="cyan" />
        <MapZone className="col-span-12 h-28 md:col-span-3" label="Repère A" tone="sky" />
        <MapZone className="col-span-12 h-28 md:col-span-3" label="Repère B" tone="emerald" />
        <MapZone className="col-span-12 h-28 md:col-span-3" label="Repère C" tone="violet" />
      </div>
    </div>
  );
}

function AnimatedBackground() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: 40 + (i % 5) * 18,
    left: `${(i * 13) % 100}%`,
    top: `${(i * 19) % 100}%`,
    delay: `${(i % 7) * 0.8}s`,
    duration: `${8 + (i % 5) * 3}s`,
  }));

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(26,43,60,0.65),transparent_40%),linear-gradient(180deg,#07111a_0%,#08131c_45%,#061019_100%)]" />
      <div className="absolute inset-0 opacity-40">
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full bg-white/10 blur-2xl animate-pulse"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.08]" />
    </div>
  );
}
