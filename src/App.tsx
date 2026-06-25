import { motion } from "framer-motion";
import { useLayoutEffect, useMemo, useState } from "react";

const FUNDING_TARGET = 20;
const BASE_TAX_RATE = 20;
const MAX_TAX_RATE = 45;

type Department = {
  id: string;
  name: string;
  budget: number;
  icon: string;
  cuts: number[];
  consequence: string;
};

const departments: Department[] = [
  {
    id: "defence",
    name: "Defence",
    budget: 60,
    icon: "DEF",
    cuts: [5, 10, 15],
    consequence: "Armed Forces reduced.",
  },
  {
    id: "police",
    name: "Police",
    budget: 45,
    icon: "POL",
    cuts: [3, 6, 9],
    consequence: "Officer numbers reduced.",
  },
  {
    id: "roads",
    name: "Roads",
    budget: 22,
    icon: "RD",
    cuts: [2, 4, 6],
    consequence: "Road maintenance delayed.",
  },
  {
    id: "nhs-capital",
    name: "NHS Capital Investment",
    budget: 38,
    icon: "NHS",
    cuts: [3, 7, 11],
    consequence: "Hospital upgrades pushed back.",
  },
  {
    id: "schools",
    name: "Schools",
    budget: 58,
    icon: "SCH",
    cuts: [3, 6, 9],
    consequence: "Classroom repairs slowed.",
  },
  {
    id: "science",
    name: "Science",
    budget: 18,
    icon: "SCI",
    cuts: [2, 4, 6],
    consequence: "Innovation investment falls.",
  },
  {
    id: "transport",
    name: "Transport",
    budget: 35,
    icon: "TRN",
    cuts: [3, 6, 10],
    consequence: "Infrastructure projects delayed.",
  },
  {
    id: "floods",
    name: "Flood Defences",
    budget: 9,
    icon: "FLD",
    cuts: [1, 2, 4],
    consequence: "Flood resilience weakened.",
  },
];

type CutSelections = Record<string, number>;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(value: number) {
  return `£${value.toFixed(value % 1 === 0 ? 0 : 1)}bn`;
}

function calculateTaxRevenue(taxRate: number) {
  const taxPressure = (taxRate - BASE_TAX_RATE) / (MAX_TAX_RATE - BASE_TAX_RATE);
  return Number((Math.pow(taxPressure, 1.22) * 14).toFixed(1));
}

function calculateProductivity(taxRate: number) {
  const taxRise = taxRate - BASE_TAX_RATE;
  const drag = taxRise * 0.55 + Math.pow(taxRise, 2) * 0.055;
  return Math.round(clamp(100 - drag, 35, 100));
}

function calculateApproval(taxRate: number, cutTotal: number, cutSelections: CutSelections) {
  const largeCutCount = Object.values(cutSelections).filter((cut) => cut >= 9).length;
  const taxPenalty = Math.max(0, taxRate - 28) * 1.15;
  const cutPenalty = cutTotal * 1.25 + largeCutCount * 3;
  return Math.round(clamp(100 - taxPenalty - cutPenalty, 12, 100));
}

function getHeadline(taxRate: number, taxRevenue: number, cutTotal: number, productivity: number) {
  if (productivity < 70) {
    return "Tax Rises Hit Productivity";
  }

  if (taxRevenue > cutTotal) {
    return "Burnham Raises Taxes to Fund Spending";
  }

  if (cutTotal >= 15 && taxRate <= 27) {
    return "Departments Brace as Budget Balanced";
  }

  return "Treasury Finds the Money, Somehow";
}

function ProgressBar({ value, tone = "emerald" }: { value: number; tone?: "emerald" | "amber" | "sky" }) {
  const color = {
    amber: "from-yellow-200 via-amber-300 to-orange-500",
    emerald: "from-lime-300 via-emerald-300 to-cyan-300",
    sky: "from-cyan-200 via-sky-300 to-fuchsia-300",
  }[tone];

  return (
    <div className="h-4 overflow-hidden border-2 border-yellow-200 bg-black shadow-[inset_0_0_0_2px_rgba(255,255,255,0.1)]">
      <motion.div
        className={`h-full bg-linear-to-r ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${clamp(value, 0, 100)}%` }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      />
    </div>
  );
}

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isDelivered, setIsDelivered] = useState(false);
  const [taxRate, setTaxRate] = useState(BASE_TAX_RATE);
  const [cutSelections, setCutSelections] = useState<CutSelections>({});

  const stats = useMemo(() => {
    const taxRevenue = calculateTaxRevenue(taxRate);
    const cutTotal = Object.values(cutSelections).reduce((total, cut) => total + cut, 0);
    const fundingFound = Math.min(FUNDING_TARGET, taxRevenue + cutTotal);
    const productivity = calculateProductivity(taxRate);
    const approval = calculateApproval(taxRate, cutTotal, cutSelections);
    const score = Math.round(
      clamp(productivity * 0.42 + approval * 0.42 + (100 - (taxRate - BASE_TAX_RATE) * 2) * 0.16, 0, 100),
    );

    return {
      approval,
      cutTotal,
      fundingFound,
      productivity,
      score,
      taxRevenue,
    };
  }, [cutSelections, taxRate]);

  const isBalanced = stats.taxRevenue + stats.cutTotal >= FUNDING_TARGET;
  const headline = getHeadline(taxRate, stats.taxRevenue, stats.cutTotal, stats.productivity);

  useLayoutEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
  }, [hasStarted, isDelivered]);

  const resetGame = () => {
    setCutSelections({});
    setHasStarted(false);
    setIsDelivered(false);
    setTaxRate(BASE_TAX_RATE);
  };

  const selectCut = (departmentId: string, amount: number) => {
    setCutSelections((current) => ({
      ...current,
      [departmentId]: current[departmentId] === amount ? 0 : amount,
    }));
  };

  if (!hasStarted) {
    return (
      <main className="retro-screen min-h-screen px-4 py-6 text-white sm:px-6">
        <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center">
          <motion.div
            className="pixel-panel grid gap-6 p-5 sm:grid-cols-[1.15fr_0.85fr] sm:p-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-6">
              <p className="mega-chip">16-bit treasury emergency</p>
              <div className="space-y-3">
                <h1 className="pixel-title font-mono text-4xl font-black uppercase leading-tight text-yellow-200 sm:text-6xl">
                  Congratulations!
                </h1>
                <p className="text-2xl font-black text-cyan-100 sm:text-3xl">Player 1 is now Prime Minister, Andy Burnham.</p>
              </div>
              <div className="crt-copy p-5 font-mono text-base leading-relaxed text-lime-100 sm:text-lg">
                <p>"Prime Minister...</p>
                <p>Your new spending package will cost <strong>{formatMoney(FUNDING_TARGET)}</strong>.</p>
                <p>Unfortunately, the Treasury has no spare money.</p>
                <p>You'll have to find it."</p>
              </div>
              <button
                className="pixel-button pixel-button--yellow w-full px-6 py-4 font-mono text-lg font-black uppercase sm:w-auto"
                onClick={() => setHasStarted(true)}
              >
                Start budget quest
              </button>
            </div>
            <div className="portrait-stage border-4 border-cyan-200 p-4">
              <div className="speed-lines flex h-full min-h-80 flex-col justify-end p-4">
                <div className="pixel-sprite mx-auto h-36 w-28 border-4 border-slate-950 bg-yellow-200 shadow-[8px_8px_0_#0f172a]">
                  <div className="mx-auto mt-10 h-4 w-16 bg-slate-950" />
                  <div className="mx-auto mt-5 h-5 w-20 bg-red-500" />
                  <div className="mx-auto mt-5 grid w-20 grid-cols-4 gap-1">
                    <span className="h-3 bg-blue-800" />
                    <span className="h-3 bg-blue-800" />
                    <span className="h-3 bg-blue-800" />
                    <span className="h-3 bg-blue-800" />
                  </div>
                </div>
                <div className="mt-8 border-4 border-slate-950 bg-red-600 p-4 text-center font-mono text-xl font-black uppercase text-yellow-100 shadow-[6px_6px_0_#020617]">
                  No. 10 HQ
                </div>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    );
  }

  if (isDelivered) {
    return (
      <main className="retro-screen min-h-screen px-4 py-6 text-white sm:px-6">
        <motion.section
          className="pixel-panel mx-auto max-w-3xl p-5 sm:p-8"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="mega-chip">mission complete</p>
          <h1 className="pixel-title mt-3 pt-2 font-mono text-3xl font-black uppercase leading-tight text-lime-200 sm:text-5xl">
            {headline}
          </h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <SummaryCard label="Money raised through taxes" value={formatMoney(stats.taxRevenue)} />
            <SummaryCard label="Department cuts" value={formatMoney(stats.cutTotal)} />
            <SummaryCard label="Final productivity" value={`${stats.productivity}%`} />
            <SummaryCard label="Public approval" value={`${stats.approval}%`} />
          </div>
          <div className="score-card mt-6 p-5 text-center">
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-cyan-100">Final score</p>
            <p className="pixel-title mt-2 font-mono text-7xl font-black text-yellow-200">{stats.score}</p>
            <p className="mt-2 font-mono text-lg text-lime-100">Budget balanced. Cabinet bonus unlocked.</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button className="pixel-button pixel-button--yellow px-6 py-4 font-mono font-black uppercase" onClick={resetGame}>
              Play Again
            </button>
            <button
              className="pixel-button pixel-button--blue px-6 py-4 font-mono font-black uppercase"
              onClick={() => void navigator.clipboard?.writeText(`I scored ${stats.score}/100 on Find the Money: ${headline}`)}
            >
              Share My Result
            </button>
          </div>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="retro-screen min-h-screen pb-36 text-white">
      <header className="sticky top-0 z-10 border-b-4 border-fuchsia-500 bg-[#080014]/95 px-4 py-4 shadow-[0_6px_0_#020617]">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
          <HudMeter
            label="Funding Found"
            value={`${formatMoney(stats.fundingFound)} / ${formatMoney(FUNDING_TARGET)}`}
            percent={(stats.fundingFound / FUNDING_TARGET) * 100}
            tone="emerald"
          />
          <HudMeter label="Productivity" value={`${stats.productivity}%`} percent={stats.productivity} tone="sky" />
          <HudMeter label="Public Approval" value={`${stats.approval}%`} percent={stats.approval} tone="amber" />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-6">
        <div className="pixel-panel mb-5 p-4">
          <p className="mega-chip">prime minister's desk</p>
          <h1 className="pixel-title mt-3 font-mono text-2xl font-black uppercase text-yellow-200 sm:text-4xl">
            Find {formatMoney(FUNDING_TARGET)} before the lobby notices.
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((department) => {
            const selectedCut = cutSelections[department.id] ?? 0;

            return (
              <motion.article
                className="department-card p-4"
                key={department.id}
                layout
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-200">{department.icon}</p>
                    <h2 className="mt-1 text-xl font-black text-white">{department.name}</h2>
                  </div>
                  <p className="border-2 border-slate-950 bg-yellow-200 px-3 py-2 font-mono font-black text-slate-950 shadow-[4px_4px_0_#020617]">
                    {formatMoney(department.budget)}
                  </p>
                </div>
                <p className="mt-4 font-mono text-sm uppercase text-fuchsia-200">Budget sector</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {department.cuts.map((cut) => (
                    <button
                      className={`cut-button px-2 py-3 text-sm font-black ${
                        selectedCut === cut
                          ? "cut-button--selected"
                          : "bg-slate-950 text-white hover:bg-indigo-950"
                      }`}
                      key={cut}
                      onClick={() => selectCut(department.id, cut)}
                    >
                      Cut {formatMoney(cut)}
                    </button>
                  ))}
                </div>
                <div className="mt-4 min-h-14 border-2 border-cyan-900 bg-black/50 p-3 font-mono text-sm text-lime-100 shadow-[inset_0_0_18px_rgba(34,211,238,0.14)]">
                  {selectedCut > 0 ? `Warning: ${department.consequence}` : "No cuts selected."}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t-4 border-cyan-300 bg-[#080014]/95 px-4 py-4 shadow-[0_-8px_0_#020617]">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="pixel-panel block p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-sm uppercase tracking-[0.25em] text-cyan-100">Income tax</span>
              <strong className="font-mono text-2xl text-yellow-200">{taxRate}%</strong>
            </div>
            <input
              aria-label="Income tax rate"
              className="tax-slider mt-4 w-full"
              max={MAX_TAX_RATE}
              min={BASE_TAX_RATE}
              onChange={(event) => setTaxRate(Number(event.target.value))}
              step={1}
              type="range"
              value={taxRate}
            />
            <div className="mt-3 flex justify-between font-mono text-xs text-cyan-200">
              <span>{BASE_TAX_RATE}%</span>
              <span>{MAX_TAX_RATE}%</span>
            </div>
          </label>
          <button
            className={`px-6 py-5 font-mono font-black uppercase ${
              isBalanced
                ? "pixel-button pixel-button--green"
                : "cursor-not-allowed border-4 border-slate-700 bg-slate-950 text-slate-500 shadow-[6px_6px_0_#020617]"
            }`}
            disabled={!isBalanced}
            onClick={() => setIsDelivered(true)}
          >
            Deliver Budget
          </button>
        </div>
      </footer>
    </main>
  );
}

function HudMeter({
  label,
  percent,
  tone,
  value,
}: {
  label: string;
  percent: number;
  tone: "emerald" | "amber" | "sky";
  value: string;
}) {
  return (
    <div className="hud-meter p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-100">{label}</span>
        <strong className="font-mono text-sm text-yellow-100">{value}</strong>
      </div>
      <ProgressBar tone={tone} value={percent} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-card p-5">
      <p className="font-mono text-sm uppercase text-cyan-100">{label}</p>
      <p className="mt-2 font-mono text-3xl font-black text-yellow-100">{value}</p>
    </div>
  );
}

export default App;
