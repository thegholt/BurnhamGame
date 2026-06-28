import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useLayoutEffect, useMemo, useState } from "react";

type SpendingCommitment = {
  id: string;
  title: string;
  cost: number;
  description: string;
  icon: string;
};

type Department = {
  id: string;
  name: string;
  saving: number;
  productivityImpact: number;
  consequence: string;
  icon: string;
  priority?: boolean;
};

type DepartmentCuts = Record<string, number>;

const MAX_TAX_REVENUE = 45;
const MAX_TAX_PRODUCTIVITY_HIT = 45;
const MAX_TAX_BURDEN = 95;

const spendingCommitments: SpendingCommitment[] = [
  {
    id: "welfare-expansion",
    title: "Welfare Expansion Plan",
    cost: 15,
    description: "A bigger welfare settlement lands on the Treasury desk.",
    icon: "WEL",
  },
  {
    id: "net-zero",
    title: "Net Zero Acceleration Plan",
    cost: 20,
    description: "New targets, new subsidies, and a very large invoice.",
    icon: "NZ",
  },
  {
    id: "green-energy",
    title: "Green Energy Subsidies",
    cost: 12,
    description: "The grid gets greener, but the bill arrives today.",
    icon: "GRN",
  },
  {
    id: "care-service",
    title: "National Care Service",
    cost: 18,
    description: "A flagship care promise needs immediate funding.",
    icon: "CARE",
  },
  {
    id: "housing",
    title: "Social Housing Programme",
    cost: 14,
    description: "A national housebuilding push needs hard cash.",
    icon: "HOME",
  },
  {
    id: "free-transport",
    title: "Free Public Transport Scheme",
    cost: 10,
    description: "Free fares sound simple until the Treasury asks who pays.",
    icon: "BUS",
  },
  {
    id: "workers-rights",
    title: "Workers' Rights Package",
    cost: 6,
    description: "A new workplace package comes with implementation costs.",
    icon: "WRK",
  },
  {
    id: "infrastructure",
    title: "National Infrastructure Plan",
    cost: 30,
    description: "A mega-build pledge needs mega-money.",
    icon: "INF",
  },
  {
    id: "nhs-investment",
    title: "NHS Investment Package",
    cost: 15,
    description: "Hospitals get a boost, if you can find the funds.",
    icon: "NHS",
  },
  {
    id: "schools-investment",
    title: "School Investment Package",
    cost: 8,
    description: "Classrooms, roofs, and repairs need paying for.",
    icon: "SCH",
  },
];

const departments: Department[] = [
  {
    id: "defence",
    name: "Defence",
    saving: 10,
    productivityImpact: -2,
    consequence: "Armed Forces reduced.",
    icon: "DEF",
    priority: true,
  },
  {
    id: "police",
    name: "Police",
    saving: 6,
    productivityImpact: -2,
    consequence: "Fewer officers on the streets.",
    icon: "POL",
    priority: true,
  },
  {
    id: "justice",
    name: "Justice & Courts",
    saving: 5,
    productivityImpact: -1,
    consequence: "Court backlogs increase.",
    icon: "JUS",
    priority: true,
  },
  {
    id: "roads",
    name: "Roads",
    saving: 5,
    productivityImpact: -3,
    consequence: "Potholes and delays increase.",
    icon: "RD",
    priority: true,
  },
  {
    id: "local-government",
    name: "Local Government",
    saving: 6,
    productivityImpact: -2,
    consequence: "Councils cut local services.",
    icon: "LOC",
    priority: true,
  },
  {
    id: "transport",
    name: "Transport",
    saving: 6,
    productivityImpact: -3,
    consequence: "Infrastructure projects delayed.",
    icon: "TRN",
  },
  {
    id: "science",
    name: "Science & Innovation",
    saving: 6,
    productivityImpact: -5,
    consequence: "Investment and growth weaken.",
    icon: "SCI",
  },
  {
    id: "business",
    name: "Business Support",
    saving: 5,
    productivityImpact: -4,
    consequence: "Employers face less support.",
    icon: "BIZ",
  },
  {
    id: "foreign-aid",
    name: "Foreign Aid",
    saving: 8,
    productivityImpact: 0,
    consequence: "Overseas aid reduced.",
    icon: "AID",
  },
  {
    id: "civil-service",
    name: "Civil Service",
    saving: 6,
    productivityImpact: 1,
    consequence: "Whitehall efficiency savings claimed.",
    icon: "CS",
  },
];

const servicePenalty: Record<string, number> = {
  defence: 5,
  police: 5,
  justice: 4,
  roads: 3,
  "local-government": 3,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatMoney(value: number) {
  return `£${value.toFixed(value % 1 === 0 ? 0 : 1)}bn`;
}

function getRandomCommitment() {
  return spendingCommitments[Math.floor(Math.random() * spendingCommitments.length)];
}

function calculateTaxRevenue(taxSlider: number) {
  return Number((Math.pow(taxSlider / 100, 1.18) * MAX_TAX_REVENUE).toFixed(1));
}

function calculateTaxProductivityHit(taxSlider: number) {
  return Math.round(Math.pow(taxSlider / 100, 1.35) * MAX_TAX_PRODUCTIVITY_HIT);
}

function calculateTaxBurden(taxSlider: number) {
  return Math.round(Math.pow(taxSlider / 100, 1.12) * MAX_TAX_BURDEN);
}

function getTaxBurdenLabel(taxBurden: number) {
  if (taxBurden <= 20) {
    return "Low";
  }

  if (taxBurden <= 40) {
    return "Rising";
  }

  if (taxBurden <= 60) {
    return "High";
  }

  return "Punishing";
}

function getRating(score: number) {
  if (score >= 80) {
    return "Balanced Budget";
  }

  if (score >= 60) {
    return "Painful Trade-Offs";
  }

  if (score >= 40) {
    return "Risky Budget";
  }

  if (score >= 20) {
    return "Economic Warning";
  }

  return "Fiscal Meltdown";
}

function getHeadline({
  commitment,
  departmentCuts,
  productivity,
  taxBurden,
  taxRevenue,
}: {
  commitment: SpendingCommitment;
  departmentCuts: Array<{ department: Department; amount: number }>;
  productivity: number;
  taxBurden: number;
  taxRevenue: number;
}) {
  const cutIds = new Set(departmentCuts.map(({ department }) => department.id));
  const cutTotal = departmentCuts.reduce((total, cut) => total + cut.amount, 0);

  if (productivity < 55) {
    return "Productivity Falls as Budget Choices Hit Economy";
  }

  if (taxBurden >= 41) {
    return "Working People Face Higher Tax Burden After Budget";
  }

  if (cutIds.has("defence")) {
    return `Burnham Funds ${commitment.title} by Cutting Defence`;
  }

  if (cutIds.has("police") && cutIds.has("justice")) {
    return "Police and Justice Cut to Fund New Spending Plan";
  }

  if (taxRevenue > cutTotal) {
    return `Prime Minister Raises Taxes to Pay for ${commitment.title}`;
  }

  return "Treasury Warns: Every Promise Has a Price";
}

function ProgressBar({
  value,
  tone = "emerald",
}: {
  value: number;
  tone?: "emerald" | "amber" | "sky" | "rose";
}) {
  const color = {
    amber: "from-yellow-200 via-amber-300 to-orange-500",
    emerald: "from-lime-300 via-emerald-300 to-cyan-300",
    rose: "from-yellow-300 via-orange-400 to-red-500",
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
  const [commitment, setCommitment] = useState(getRandomCommitment);
  const [departmentCuts, setDepartmentCuts] = useState<DepartmentCuts>({});
  const [taxSlider, setTaxSlider] = useState(0);

  const stats = useMemo(() => {
    const selectedDepartmentCuts = departments
      .map((department) => ({
        amount: departmentCuts[department.id] ?? 0,
        department,
      }))
      .filter(({ amount }) => amount > 0);
    const cutTotal = selectedDepartmentCuts.reduce((total, cut) => total + cut.amount, 0);
    const departmentProductivityImpact = selectedDepartmentCuts.reduce(
      (total, { amount, department }) => total + department.productivityImpact * (amount / department.saving),
      0,
    );
    const taxRevenue = calculateTaxRevenue(taxSlider);
    const taxProductivityHit = calculateTaxProductivityHit(taxSlider);
    const taxBurden = calculateTaxBurden(taxSlider);
    const fundingFound = Number((cutTotal + taxRevenue).toFixed(1));
    const productivity = Math.round(clamp(100 + departmentProductivityImpact - taxProductivityHit, 0, 100));
    const priorityCutPenalty = selectedDepartmentCuts.reduce(
      (total, { amount, department }) => total + (servicePenalty[department.id] ?? 0) * (amount / department.saving),
      0,
    );
    const score = Math.round(clamp(100 - taxBurden - (100 - productivity) - priorityCutPenalty, 0, 100));

    return {
      cutTotal,
      fundingFound,
      priorityCutPenalty,
      productivity,
      score,
      selectedDepartmentCuts,
      taxBurden,
      taxRevenue,
      taxSlider,
    };
  }, [departmentCuts, taxSlider]);

  const isBalanced = stats.fundingFound >= commitment.cost;
  const headline = getHeadline({
    commitment,
    departmentCuts: stats.selectedDepartmentCuts,
    productivity: stats.productivity,
    taxBurden: stats.taxBurden,
    taxRevenue: stats.taxRevenue,
  });
  const rating = getRating(stats.score);

  useLayoutEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
  }, [hasStarted, isDelivered]);

  const resetGame = () => {
    setCommitment(getRandomCommitment());
    setDepartmentCuts({});
    setTaxSlider(0);
    setHasStarted(false);
    setIsDelivered(false);
  };

  const setDepartmentCut = (departmentId: string, amount: number) => {
    setDepartmentCuts((current) => ({
      ...current,
      [departmentId]: amount,
    }));
  };

  if (!hasStarted) {
    return <OpeningScreen commitment={commitment} onStart={() => setHasStarted(true)} />;
  }

  if (isDelivered) {
    return (
      <EndScreen
        commitment={commitment}
        headline={headline}
        rating={rating}
        stats={stats}
        onReset={resetGame}
      />
    );
  }

  return (
    <GameScreen
      commitment={commitment}
      departmentCuts={departmentCuts}
      isBalanced={isBalanced}
      stats={stats}
      taxSlider={taxSlider}
      onDeliver={() => setIsDelivered(true)}
      onReset={resetGame}
      onSetDepartmentCut={setDepartmentCut}
      onSetTaxSlider={setTaxSlider}
    />
  );
}

function OpeningScreen({
  commitment,
  onStart,
}: {
  commitment: SpendingCommitment;
  onStart: () => void;
}) {
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
              <p className="text-2xl font-black text-cyan-100 sm:text-3xl">Andy Burnham has entered Downing Street.</p>
            </div>
            <div className="crt-copy space-y-3 p-5 font-mono text-base leading-relaxed text-lime-100 sm:text-lg">
              <p>The new Prime Minister has announced a major spending package.</p>
              <p>Unfortunately, the Treasury says there is no spare money.</p>
              <p>You must now find the money.</p>
            </div>
            <CommitmentMiniCard commitment={commitment} />
            <PixelButton onClick={onStart} tone="yellow">
              Find the Money
            </PixelButton>
          </div>
          <CharacterPanel mood="ready" />
        </motion.div>
      </section>
    </main>
  );
}

function GameScreen({
  commitment,
  departmentCuts,
  isBalanced,
  onDeliver,
  onReset,
  onSetDepartmentCut,
  onSetTaxSlider,
  stats,
  taxSlider,
}: {
  commitment: SpendingCommitment;
  departmentCuts: DepartmentCuts;
  isBalanced: boolean;
  onDeliver: () => void;
  onReset: () => void;
  onSetDepartmentCut: (departmentId: string, amount: number) => void;
  onSetTaxSlider: (amount: number) => void;
  stats: {
    cutTotal: number;
    fundingFound: number;
    productivity: number;
    selectedDepartmentCuts: Array<{ department: Department; amount: number }>;
    taxBurden: number;
    taxRevenue: number;
  };
  taxSlider: number;
}) {
  return (
    <main className="retro-screen min-h-screen pb-36 text-white">
      <header className="sticky top-0 z-10 border-b-4 border-fuchsia-500 bg-[#080014]/95 px-4 py-4 shadow-[0_6px_0_#020617]">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-3">
          <MetricBar
            label="Funding Found"
            value={`${formatMoney(stats.fundingFound)} / ${formatMoney(commitment.cost)}`}
            percent={(stats.fundingFound / commitment.cost) * 100}
            tone="emerald"
          />
          <MetricBar label="Productivity" value={`${stats.productivity}%`} percent={stats.productivity} tone="sky" />
          <MetricBar
            label="Tax Burden"
            value={`${stats.taxBurden}% ${getTaxBurdenLabel(stats.taxBurden)}`}
            percent={stats.taxBurden}
            tone="rose"
          />
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 py-6 lg:grid-cols-[0.95fr_1.55fr]">
        <aside className="space-y-5">
          <section className="pixel-panel p-4">
            <p className="mega-chip">spending promise</p>
            <h1 className="pixel-title mt-4 font-mono text-3xl font-black uppercase text-yellow-100">{commitment.title}</h1>
            <p className="mt-2 font-mono text-lime-100">{commitment.description}</p>
            <div className="mt-4 border-4 border-slate-950 bg-yellow-200 p-4 font-mono text-slate-950 shadow-[6px_6px_0_#020617]">
              <p className="text-sm font-black uppercase">Target</p>
              <p className="text-4xl font-black">{formatMoney(commitment.cost)}</p>
            </div>
          </section>
          <TaxSliderPanel
            taxBurden={stats.taxBurden}
            taxRevenue={stats.taxRevenue}
            taxSlider={taxSlider}
            onChange={onSetTaxSlider}
          />
          <CharacterPanel mood={stats.taxBurden >= 70 ? "panic" : stats.productivity < 50 ? "worried" : "ready"} />
        </aside>

        <section className="pixel-panel p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mega-chip">department sliders</p>
              <h2 className="pixel-title mt-3 font-mono text-2xl font-black uppercase text-yellow-200">
                Slide cuts up or down
              </h2>
            </div>
            <div className="font-mono text-sm uppercase text-cyan-100">
              Cuts: <strong className="text-yellow-100">{formatMoney(stats.cutTotal)}</strong>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {departments.map((department) => (
              <DepartmentSlider
                amount={departmentCuts[department.id] ?? 0}
                department={department}
                key={department.id}
                onChange={(amount) => onSetDepartmentCut(department.id, amount)}
              />
            ))}
          </div>
        </section>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t-4 border-cyan-300 bg-[#080014]/95 px-4 py-4 shadow-[0_-8px_0_#020617]">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-cyan-100">
            {isBalanced ? "Funding found. The Treasury report is ready." : "Use the sliders until the promise is paid for."}
          </p>
          <PixelButton onClick={onReset} tone="blue">
            Reset
          </PixelButton>
          <button
            className={`px-6 py-5 font-mono font-black uppercase ${
              isBalanced
                ? "pixel-button pixel-button--green"
                : "cursor-not-allowed border-4 border-slate-700 bg-slate-950 text-slate-500 shadow-[6px_6px_0_#020617]"
            }`}
            disabled={!isBalanced}
            onClick={onDeliver}
          >
            Deliver Budget
          </button>
        </div>
      </footer>
    </main>
  );
}

function EndScreen({
  commitment,
  headline,
  onReset,
  rating,
  stats,
}: {
  commitment: SpendingCommitment;
  headline: string;
  onReset: () => void;
  rating: string;
  stats: {
    cutTotal: number;
    fundingFound: number;
    productivity: number;
    score: number;
    selectedDepartmentCuts: Array<{ department: Department; amount: number }>;
    taxBurden: number;
    taxRevenue: number;
    taxSlider: number;
  };
}) {
  return (
    <main className="retro-screen min-h-screen px-4 py-6 text-white sm:px-6">
      <motion.section
        className="pixel-panel mx-auto max-w-4xl p-5 sm:p-8"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mega-chip">treasury report</p>
            <h1 className="pixel-title mt-3 pt-2 font-mono text-3xl font-black uppercase leading-tight text-lime-200 sm:text-5xl">
              {headline}
            </h1>
          </div>
          <div className="shrink-0">
            <CharacterPanel mood={stats.taxBurden >= 70 ? "panic" : stats.productivity < 50 ? "worried" : "happy"} />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <SummaryCard label="Spending Commitment" value={commitment.title} />
          <SummaryCard label="Cost" value={formatMoney(commitment.cost)} />
          <SummaryCard label="Funding Found" value={formatMoney(stats.fundingFound)} />
          <SummaryCard label="Tax Slider" value={`${stats.taxSlider}%`} />
          <SummaryCard label="Productivity" value={`${stats.productivity}%`} />
          <SummaryCard label="Tax Burden" value={`${stats.taxBurden}% ${getTaxBurdenLabel(stats.taxBurden)}`} />
          <SummaryCard label="Department Cuts" value={formatMoney(stats.cutTotal)} />
          <SummaryCard label="Tax Revenue" value={formatMoney(stats.taxRevenue)} />
          <SummaryCard label="Treasury Rating" value={rating} />
        </div>

        <ReportList
          emptyText="No departments cut."
          items={stats.selectedDepartmentCuts.map(({ amount, department }) => `${department.name}: ${formatMoney(amount)} cut`)}
          title="Slider Choices"
        />

        <div className="score-card mt-6 p-5 text-center">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-cyan-100">Final score</p>
          <p className="pixel-title mt-2 font-mono text-7xl font-black text-yellow-200">{stats.score}</p>
          <p className="mt-2 font-mono text-lg text-lime-100">Promises are easy. Paying for them is the hard part.</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <PixelButton onClick={onReset} tone="yellow">
            Play Again
          </PixelButton>
          <PixelButton
            onClick={() =>
              void navigator.clipboard?.writeText(
                `I scored ${stats.score}/100 on Find the Money: ${headline} (${rating})`,
              )
            }
            tone="blue"
          >
            Share My Result
          </PixelButton>
        </div>
      </motion.section>
    </main>
  );
}

function CommitmentMiniCard({ commitment }: { commitment: SpendingCommitment }) {
  return (
    <div className="summary-card p-4">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-100">Next promise</p>
      <p className="mt-2 font-mono text-2xl font-black uppercase text-yellow-100">{commitment.title}</p>
      <p className="mt-1 text-sm text-lime-100">Estimated cost: {formatMoney(commitment.cost)}</p>
    </div>
  );
}

function TaxSliderPanel({
  onChange,
  taxBurden,
  taxRevenue,
  taxSlider,
}: {
  onChange: (value: number) => void;
  taxBurden: number;
  taxRevenue: number;
  taxSlider: number;
}) {
  return (
    <section className="slider-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="mega-chip">tax slider</p>
          <h2 className="mt-3 font-mono text-2xl font-black uppercase text-yellow-100">Raise taxes</h2>
        </div>
        <p className="border-2 border-slate-950 bg-lime-200 px-3 py-2 font-mono font-black text-slate-950 shadow-[4px_4px_0_#020617]">
          {formatMoney(taxRevenue)}
        </p>
      </div>
      <input
        aria-label="Tax rises"
        className="tax-slider mt-5 w-full"
        max={100}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        step={1}
        type="range"
        value={taxSlider}
      />
      <div className="mt-3 flex justify-between font-mono text-xs uppercase text-cyan-100">
        <span>0%</span>
        <span>Tax pressure {taxSlider}%</span>
        <span>100%</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-sm uppercase">
        <p className="text-cyan-100">Tax Burden</p>
        <p className="text-right text-red-200">{taxBurden}% {getTaxBurdenLabel(taxBurden)}</p>
      </div>
    </section>
  );
}

function DepartmentSlider({
  amount,
  department,
  onChange,
}: {
  amount: number;
  department: Department;
  onChange: (amount: number) => void;
}) {
  const productivityImpact = department.saving === 0 ? 0 : department.productivityImpact * (amount / department.saving);

  return (
    <article className={`slider-row ${department.priority ? "priority-card" : ""}`}>
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="border-2 border-slate-950 bg-yellow-200 px-2 py-1 font-mono text-xs font-black text-slate-950 shadow-[3px_3px_0_#020617]">
              {department.icon}
            </span>
            <h3 className="font-mono text-lg font-black uppercase text-white">{department.name}</h3>
            {department.priority ? <span className="font-mono text-xs uppercase text-orange-200">Core service</span> : null}
          </div>
          <p className="mt-2 font-mono text-sm text-lime-100">{amount > 0 ? department.consequence : "No cut selected."}</p>
        </div>
        <p className="font-mono text-xl font-black text-yellow-100">{formatMoney(amount)}</p>
      </div>
      <input
        aria-label={`${department.name} cut`}
        className="tax-slider mt-4 w-full"
        max={department.saving}
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        step={1}
        type="range"
        value={amount}
      />
      <div className="mt-2 flex justify-between font-mono text-xs uppercase text-cyan-100">
        <span>£0bn</span>
        <span>Productivity {productivityImpact >= 0 ? "+" : ""}{productivityImpact.toFixed(1)}%</span>
        <span>{formatMoney(department.saving)}</span>
      </div>
    </article>
  );
}

function CharacterPanel({ mood }: { mood: "happy" | "panic" | "ready" | "worried" }) {
  const mouth = {
    happy: "bg-lime-500",
    panic: "bg-fuchsia-500",
    ready: "bg-red-500",
    worried: "bg-orange-500",
  }[mood];
  const label = {
    happy: "Budget balanced",
    panic: "Tax panic",
    ready: "No. 10 HQ",
    worried: "Growth warning",
  }[mood];

  return (
    <div className="portrait-stage border-4 border-cyan-200 p-4">
      <div className="speed-lines flex min-h-72 flex-col justify-end p-4">
        <div className="pixel-sprite mx-auto h-36 w-28 border-4 border-slate-950 bg-yellow-200 shadow-[8px_8px_0_#0f172a]">
          <div className="mx-auto mt-10 grid w-16 grid-cols-2 gap-6">
            <span className="h-4 bg-slate-950" />
            <span className="h-4 bg-slate-950" />
          </div>
          <div className={`mx-auto mt-5 h-5 w-20 ${mouth}`} />
          <div className="mx-auto mt-5 grid w-20 grid-cols-4 gap-1">
            <span className="h-3 bg-blue-800" />
            <span className="h-3 bg-blue-800" />
            <span className="h-3 bg-blue-800" />
            <span className="h-3 bg-blue-800" />
          </div>
        </div>
        <div className="mt-8 border-4 border-slate-950 bg-red-600 p-4 text-center font-mono text-xl font-black uppercase text-yellow-100 shadow-[6px_6px_0_#020617]">
          {label}
        </div>
      </div>
    </div>
  );
}

function MetricBar({
  label,
  percent,
  tone,
  value,
}: {
  label: string;
  percent: number;
  tone: "emerald" | "amber" | "sky" | "rose";
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

function PixelButton({
  children,
  onClick,
  tone,
}: {
  children: ReactNode;
  onClick: () => void;
  tone: "blue" | "yellow";
}) {
  return (
    <button
      className={`pixel-button w-full px-6 py-4 font-mono text-lg font-black uppercase ${
        tone === "yellow" ? "pixel-button--yellow" : "pixel-button--blue"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function ReportList({ emptyText, items, title }: { emptyText: string; items: string[]; title: string }) {
  return (
    <section className="summary-card mt-6 p-5">
      <p className="font-mono text-sm uppercase text-cyan-100">{title}</p>
      <ul className="mt-3 space-y-2 font-mono text-sm text-lime-100">
        {items.length > 0 ? items.map((item) => <li key={item}>- {item}</li>) : <li>{emptyText}</li>}
      </ul>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-card p-5">
      <p className="font-mono text-sm uppercase text-cyan-100">{label}</p>
      <p className="mt-2 font-mono text-2xl font-black text-yellow-100">{value}</p>
    </div>
  );
}

export default App;
