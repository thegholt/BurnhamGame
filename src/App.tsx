import { motion } from "framer-motion";
import { useMemo, useState } from "react";

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
    amber: "from-amber-300 to-orange-500",
    emerald: "from-emerald-300 to-lime-400",
    sky: "from-sky-300 to-cyan-400",
  }[tone];

  return (
    <div className="h-3 overflow-hidden rounded-full border border-white/20 bg-slate-950/70">
      <motion.div
        className={`h-full rounded-full bg-linear-to-r ${color}`}
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
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
        <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-5xl items-center">
          <motion.div
            className="grid gap-6 rounded-[2rem] border-4 border-amber-300 bg-slate-900 p-5 shadow-[0_0_0_8px_rgba(15,23,42,0.9)] sm:grid-cols-[1.15fr_0.85fr] sm:p-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-6">
              <p className="font-mono text-sm uppercase tracking-[0.35em] text-amber-200">Treasury emergency</p>
              <div className="space-y-3">
                <h1 className="font-mono text-4xl font-black uppercase leading-tight text-amber-300 sm:text-6xl">
                  Congratulations!
                </h1>
                <p className="text-2xl font-bold sm:text-3xl">You are now Prime Minister, Andy Burnham.</p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/10 p-5 text-lg leading-relaxed">
                <p>"Prime Minister...</p>
                <p>Your new spending package will cost <strong>{formatMoney(FUNDING_TARGET)}</strong>.</p>
                <p>Unfortunately, the Treasury has no spare money.</p>
                <p>You'll have to find it."</p>
              </div>
              <button
                className="w-full rounded-2xl bg-amber-300 px-6 py-4 font-mono text-lg font-black uppercase text-slate-950 shadow-[0_6px_0_#b45309] transition hover:-translate-y-0.5 hover:shadow-[0_8px_0_#b45309] active:translate-y-1 active:shadow-[0_3px_0_#b45309] sm:w-auto"
                onClick={() => setHasStarted(true)}
              >
                Balance the Budget
              </button>
            </div>
            <div className="rounded-[1.5rem] border-4 border-slate-700 bg-linear-to-b from-sky-500 to-indigo-800 p-4">
              <div className="flex h-full min-h-80 flex-col justify-end rounded-2xl bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.35),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.1),rgba(15,23,42,0.8))] p-4">
                <div className="mx-auto h-36 w-28 rounded-t-full border-4 border-slate-950 bg-amber-200 shadow-[0_12px_0_#1e293b]">
                  <div className="mx-auto mt-12 h-4 w-16 rounded-full bg-slate-950" />
                  <div className="mx-auto mt-5 h-5 w-20 rounded-full bg-red-500" />
                </div>
                <div className="mt-8 rounded-xl border-4 border-slate-950 bg-red-700 p-4 text-center font-mono text-xl font-black uppercase">
                  No. 10
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
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
        <motion.section
          className="mx-auto max-w-3xl rounded-[2rem] border-4 border-emerald-300 bg-slate-900 p-5 shadow-[0_0_0_8px_rgba(15,23,42,0.9)] sm:p-8"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="font-mono text-sm uppercase tracking-[0.35em] text-emerald-200">Budget summary</p>
          <h1 className="mt-3 font-mono text-3xl font-black uppercase text-emerald-300 sm:text-5xl">
            {headline}
          </h1>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <SummaryCard label="Money raised through taxes" value={formatMoney(stats.taxRevenue)} />
            <SummaryCard label="Department cuts" value={formatMoney(stats.cutTotal)} />
            <SummaryCard label="Final productivity" value={`${stats.productivity}%`} />
            <SummaryCard label="Public approval" value={`${stats.approval}%`} />
          </div>
          <div className="mt-6 rounded-3xl border border-white/15 bg-white/10 p-5 text-center">
            <p className="font-mono text-sm uppercase tracking-[0.25em] text-amber-200">Final score</p>
            <p className="mt-2 font-mono text-7xl font-black text-amber-300">{stats.score}</p>
            <p className="mt-2 text-lg">Budget balanced.</p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button className="rounded-2xl bg-white px-6 py-4 font-mono font-black uppercase text-slate-950" onClick={resetGame}>
              Play Again
            </button>
            <button
              className="rounded-2xl border border-white/30 px-6 py-4 font-mono font-black uppercase text-white"
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
    <main className="min-h-screen bg-slate-950 pb-36 text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 px-4 py-4 backdrop-blur">
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
        <div className="mb-5 rounded-3xl border border-white/10 bg-white/10 p-4">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber-200">Prime Minister's desk</p>
          <h1 className="mt-2 text-2xl font-black sm:text-4xl">Find {formatMoney(FUNDING_TARGET)} before the lobby notices.</h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((department) => {
            const selectedCut = cutSelections[department.id] ?? 0;

            return (
              <motion.article
                className="rounded-3xl border-4 border-slate-700 bg-slate-900 p-4 shadow-lg"
                key={department.id}
                layout
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-[0.25em] text-slate-400">{department.icon}</p>
                    <h2 className="mt-1 text-xl font-black">{department.name}</h2>
                  </div>
                  <p className="rounded-xl bg-white px-3 py-2 font-mono font-black text-slate-950">
                    {formatMoney(department.budget)}
                  </p>
                </div>
                <p className="mt-4 text-sm text-slate-300">Budget</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {department.cuts.map((cut) => (
                    <button
                      className={`rounded-xl px-2 py-3 text-sm font-black transition ${
                        selectedCut === cut
                          ? "bg-red-400 text-slate-950"
                          : "bg-slate-800 text-white hover:bg-slate-700"
                      }`}
                      key={cut}
                      onClick={() => selectCut(department.id, cut)}
                    >
                      Cut {formatMoney(cut)}
                    </button>
                  ))}
                </div>
                <div className="mt-4 min-h-14 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-amber-100">
                  {selectedCut > 0 ? `Warning: ${department.consequence}` : "No cuts selected."}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block rounded-2xl border border-white/10 bg-white/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-mono text-sm uppercase tracking-[0.25em] text-amber-200">Income tax</span>
              <strong className="font-mono text-2xl">{taxRate}%</strong>
            </div>
            <input
              aria-label="Income tax rate"
              className="mt-4 w-full accent-amber-300"
              max={MAX_TAX_RATE}
              min={BASE_TAX_RATE}
              onChange={(event) => setTaxRate(Number(event.target.value))}
              step={1}
              type="range"
              value={taxRate}
            />
            <div className="mt-2 flex justify-between font-mono text-xs text-slate-400">
              <span>{BASE_TAX_RATE}%</span>
              <span>{MAX_TAX_RATE}%</span>
            </div>
          </label>
          <button
            className={`rounded-2xl px-6 py-5 font-mono font-black uppercase transition ${
              isBalanced
                ? "bg-emerald-300 text-slate-950 shadow-[0_6px_0_#047857] hover:-translate-y-0.5"
                : "cursor-not-allowed bg-slate-800 text-slate-500"
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
    <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-slate-300">{label}</span>
        <strong className="font-mono text-sm">{value}</strong>
      </div>
      <ProgressBar tone={tone} value={percent} />
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 font-mono text-3xl font-black text-white">{value}</p>
    </div>
  );
}

export default App;
