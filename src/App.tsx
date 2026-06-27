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

type DepartmentCut = {
  id: string;
  name: string;
  saving: number;
  productivityImpact: number;
  consequence: string;
  icon: string;
  priority?: boolean;
};

type TaxMeasure = {
  id: string;
  name: string;
  revenue: number;
  productivityImpact: number;
  taxBurdenImpact: number;
  consequence: string;
  icon: string;
};

type SelectionMap = Record<string, boolean>;

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

const departmentCuts: DepartmentCut[] = [
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
    id: "prisons",
    name: "Prisons",
    saving: 4,
    productivityImpact: -1,
    consequence: "Prison overcrowding worsens.",
    icon: "PRS",
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
    id: "transport",
    name: "Transport",
    saving: 6,
    productivityImpact: -3,
    consequence: "Infrastructure projects delayed.",
    icon: "TRN",
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
    id: "floods",
    name: "Flood Defences",
    saving: 4,
    productivityImpact: -1,
    consequence: "Flood resilience weakened.",
    icon: "FLD",
  },
  {
    id: "farming",
    name: "Farming",
    saving: 3,
    productivityImpact: -1,
    consequence: "Rural support reduced.",
    icon: "FRM",
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
    id: "culture",
    name: "Culture",
    saving: 3,
    productivityImpact: 0,
    consequence: "Arts and heritage budgets cut.",
    icon: "ART",
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

const taxMeasures: TaxMeasure[] = [
  {
    id: "income-tax",
    name: "Raise Income Tax",
    revenue: 12,
    productivityImpact: -8,
    taxBurdenImpact: 18,
    consequence: "Working people pay more.",
    icon: "PAYE",
  },
  {
    id: "national-insurance",
    name: "Raise National Insurance",
    revenue: 10,
    productivityImpact: -9,
    taxBurdenImpact: 16,
    consequence: "Jobs and wages squeezed.",
    icon: "NI",
  },
  {
    id: "vat",
    name: "Raise VAT",
    revenue: 14,
    productivityImpact: -7,
    taxBurdenImpact: 22,
    consequence: "Everyday shopping costs more.",
    icon: "VAT",
  },
  {
    id: "wealth-tax",
    name: "Wealth Tax",
    revenue: 8,
    productivityImpact: -6,
    taxBurdenImpact: 4,
    consequence: "Investment confidence falls.",
    icon: "WLT",
  },
  {
    id: "corporation-tax",
    name: "Corporation Tax Rise",
    revenue: 12,
    productivityImpact: -10,
    taxBurdenImpact: 8,
    consequence: "Business investment slows.",
    icon: "CORP",
  },
  {
    id: "capital-gains",
    name: "Capital Gains Tax Rise",
    revenue: 6,
    productivityImpact: -5,
    taxBurdenImpact: 3,
    consequence: "Investment incentives weaken.",
    icon: "CGT",
  },
  {
    id: "dividend-tax",
    name: "Dividend Tax Rise",
    revenue: 4,
    productivityImpact: -3,
    taxBurdenImpact: 2,
    consequence: "Savers and investors hit.",
    icon: "DIV",
  },
  {
    id: "fuel-duty",
    name: "Fuel Duty Rise",
    revenue: 5,
    productivityImpact: -4,
    taxBurdenImpact: 8,
    consequence: "Drivers pay more.",
    icon: "FUEL",
  },
  {
    id: "stamp-duty",
    name: "Stamp Duty Rise",
    revenue: 4,
    productivityImpact: -3,
    taxBurdenImpact: 3,
    consequence: "Housing market slows.",
    icon: "SDLT",
  },
  {
    id: "windfall-tax",
    name: "Windfall Tax",
    revenue: 6,
    productivityImpact: -3,
    taxBurdenImpact: 1,
    consequence: "One-off raid on industry.",
    icon: "WND",
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

function getHeadline(
  commitment: SpendingCommitment,
  selectedCuts: DepartmentCut[],
  selectedTaxes: TaxMeasure[],
  productivity: number,
  taxBurden: number,
) {
  const cutIds = new Set(selectedCuts.map((cut) => cut.id));
  const cutTotal = selectedCuts.reduce((total, cut) => total + cut.saving, 0);
  const taxTotal = selectedTaxes.reduce((total, tax) => total + tax.revenue, 0);

  if (productivity < 55) {
    return "Productivity Falls as Tax Rises Hit Economy";
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

  if (taxTotal > cutTotal) {
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
  const [cutSelections, setCutSelections] = useState<SelectionMap>({});
  const [taxSelections, setTaxSelections] = useState<SelectionMap>({});

  const stats = useMemo(() => {
    const selectedCuts = departmentCuts.filter((cut) => cutSelections[cut.id]);
    const selectedTaxes = taxMeasures.filter((tax) => taxSelections[tax.id]);
    const cutTotal = selectedCuts.reduce((total, cut) => total + cut.saving, 0);
    const taxTotal = selectedTaxes.reduce((total, tax) => total + tax.revenue, 0);
    const productivityImpact =
      selectedCuts.reduce((total, cut) => total + cut.productivityImpact, 0) +
      selectedTaxes.reduce((total, tax) => total + tax.productivityImpact, 0);
    const productivity = Math.round(clamp(100 + productivityImpact, 0, 100));
    const taxBurden = Math.round(
      clamp(
        selectedTaxes.reduce((total, tax) => total + tax.taxBurdenImpact, 0),
        0,
        100,
      ),
    );
    const priorityCutPenalty = selectedCuts.reduce((total, cut) => total + (servicePenalty[cut.id] ?? 0), 0);
    const score = Math.round(clamp(100 - taxBurden - (100 - productivity) - priorityCutPenalty, 0, 100));
    const fundingFound = cutTotal + taxTotal;

    return {
      cutTotal,
      fundingFound,
      priorityCutPenalty,
      productivity,
      score,
      selectedCuts,
      selectedTaxes,
      taxBurden,
      taxTotal,
    };
  }, [cutSelections, taxSelections]);

  const isBalanced = stats.fundingFound >= commitment.cost;
  const headline = getHeadline(commitment, stats.selectedCuts, stats.selectedTaxes, stats.productivity, stats.taxBurden);
  const rating = getRating(stats.score);

  useLayoutEffect(() => {
    window.scrollTo({ left: 0, top: 0 });
  }, [hasStarted, isDelivered]);

  const resetGame = () => {
    setCommitment(getRandomCommitment());
    setCutSelections({});
    setTaxSelections({});
    setHasStarted(false);
    setIsDelivered(false);
  };

  const toggleCut = (departmentId: string) => {
    setCutSelections((current) => ({
      ...current,
      [departmentId]: !current[departmentId],
    }));
  };

  const toggleTax = (taxId: string) => {
    setTaxSelections((current) => ({
      ...current,
      [taxId]: !current[taxId],
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
      isBalanced={isBalanced}
      stats={stats}
      cutSelections={cutSelections}
      taxSelections={taxSelections}
      onDeliver={() => setIsDelivered(true)}
      onReset={resetGame}
      onToggleCut={toggleCut}
      onToggleTax={toggleTax}
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
            <div className="summary-card p-4">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-100">Next promise</p>
              <p className="mt-2 font-mono text-2xl font-black uppercase text-yellow-100">{commitment.title}</p>
              <p className="mt-1 text-sm text-lime-100">Estimated cost: {formatMoney(commitment.cost)}</p>
            </div>
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
  cutSelections,
  isBalanced,
  onDeliver,
  onReset,
  onToggleCut,
  onToggleTax,
  stats,
  taxSelections,
}: {
  commitment: SpendingCommitment;
  cutSelections: SelectionMap;
  isBalanced: boolean;
  onDeliver: () => void;
  onReset: () => void;
  onToggleCut: (departmentId: string) => void;
  onToggleTax: (taxId: string) => void;
  stats: {
    fundingFound: number;
    productivity: number;
    selectedCuts: DepartmentCut[];
    selectedTaxes: TaxMeasure[];
    taxBurden: number;
  };
  taxSelections: SelectionMap;
}) {
  return (
    <main className="retro-screen min-h-screen pb-40 text-white">
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

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[0.85fr_1.45fr_0.95fr]">
        <aside className="space-y-5">
          <SpendingCommitmentCard commitment={commitment} />
          <CharacterPanel mood={stats.taxBurden >= 70 ? "panic" : stats.productivity < 50 ? "worried" : "ready"} />
          <DecisionLog selectedCuts={stats.selectedCuts} selectedTaxes={stats.selectedTaxes} />
        </aside>

        <section className="space-y-4">
          <div className="pixel-panel p-4">
            <p className="mega-chip">department cuts</p>
            <h2 className="pixel-title mt-3 font-mono text-2xl font-black uppercase text-yellow-200">
              Cut core services to fund the pledge
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {departmentCuts.map((department) => (
              <DepartmentCutCard
                department={department}
                isSelected={Boolean(cutSelections[department.id])}
                key={department.id}
                onToggle={() => onToggleCut(department.id)}
              />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="pixel-panel p-4">
            <p className="mega-chip">raise taxes</p>
            <h2 className="pixel-title mt-3 font-mono text-2xl font-black uppercase text-yellow-200">Make taxpayers pay</h2>
            <p className="mt-3 font-mono text-sm text-lime-100">Each tax can be selected once. Burden hits working people hardest.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {taxMeasures.map((tax) => (
              <TaxMeasureCard
                isSelected={Boolean(taxSelections[tax.id])}
                key={tax.id}
                onToggle={() => onToggleTax(tax.id)}
                tax={tax}
              />
            ))}
          </div>
        </aside>
      </section>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t-4 border-cyan-300 bg-[#080014]/95 px-4 py-4 shadow-[0_-8px_0_#020617]">
        <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <p className="font-mono text-sm uppercase tracking-[0.16em] text-cyan-100">
            {isBalanced ? "Funding found. The Treasury report is ready." : "Find enough money to unlock the budget."}
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
    selectedCuts: DepartmentCut[];
    selectedTaxes: TaxMeasure[];
    taxBurden: number;
    taxTotal: number;
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

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SummaryCard label="Spending Commitment" value={commitment.title} />
          <SummaryCard label="Cost" value={formatMoney(commitment.cost)} />
          <SummaryCard label="Funding Found" value={formatMoney(stats.fundingFound)} />
          <SummaryCard label="Productivity" value={`${stats.productivity}%`} />
          <SummaryCard label="Tax Burden" value={`${stats.taxBurden}% ${getTaxBurdenLabel(stats.taxBurden)}`} />
          <SummaryCard label="Treasury Rating" value={rating} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ReportList
            emptyText="No departments cut."
            items={stats.selectedCuts.map((cut) => `${cut.name} cut by ${formatMoney(cut.saving)}`)}
            title="Cuts Made"
          />
          <ReportList
            emptyText="No tax rises selected."
            items={stats.selectedTaxes.map((tax) => tax.name)}
            title="Taxes Raised"
          />
        </div>

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

function SpendingCommitmentCard({ commitment }: { commitment: SpendingCommitment }) {
  return (
    <section className="pixel-panel p-4">
      <p className="mega-chip">spending promise</p>
      <div className="mt-4 flex items-start gap-3">
        <span className="border-4 border-slate-950 bg-yellow-200 px-3 py-2 font-mono font-black text-slate-950 shadow-[4px_4px_0_#020617]">
          {commitment.icon}
        </span>
        <div>
          <h1 className="font-mono text-2xl font-black uppercase text-yellow-100">{commitment.title}</h1>
          <p className="mt-2 font-mono text-sm text-lime-100">{commitment.description}</p>
        </div>
      </div>
      <div className="crt-copy mt-4 p-4 font-mono text-lime-100">
        <p>Prime Minister, your new {commitment.title} will cost {formatMoney(commitment.cost)}.</p>
        <p className="mt-2 text-yellow-100">Every promise has a price.</p>
      </div>
    </section>
  );
}

function DepartmentCutCard({
  department,
  isSelected,
  onToggle,
}: {
  department: DepartmentCut;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.article className={`department-card p-4 ${department.priority ? "priority-card" : ""}`} layout>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-200">{department.icon}</p>
          <h3 className="mt-1 text-xl font-black text-white">{department.name}</h3>
        </div>
        <p className="border-2 border-slate-950 bg-yellow-200 px-3 py-2 font-mono font-black text-slate-950 shadow-[4px_4px_0_#020617]">
          Save {formatMoney(department.saving)}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs uppercase text-cyan-100">
        <p>Productivity</p>
        <p className="text-right text-orange-200">{department.productivityImpact > 0 ? "+" : ""}{department.productivityImpact}%</p>
      </div>
      <p className="mt-3 min-h-12 border-2 border-cyan-900 bg-black/50 p-3 font-mono text-sm text-lime-100">
        {department.consequence}
      </p>
      <button
        className={`cut-button mt-4 w-full px-3 py-3 font-mono text-sm font-black uppercase ${
          isSelected ? "cut-button--selected" : ""
        }`}
        onClick={onToggle}
      >
        {isSelected ? "Undo Cut" : `Cut ${department.name}`}
      </button>
    </motion.article>
  );
}

function TaxMeasureCard({
  isSelected,
  onToggle,
  tax,
}: {
  isSelected: boolean;
  onToggle: () => void;
  tax: TaxMeasure;
}) {
  return (
    <motion.article className="tax-card p-4" layout>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-200">{tax.icon}</p>
          <h3 className="mt-1 font-mono text-lg font-black uppercase text-white">{tax.name}</h3>
        </div>
        <p className="border-2 border-slate-950 bg-lime-200 px-3 py-2 font-mono font-black text-slate-950 shadow-[4px_4px_0_#020617]">
          +{formatMoney(tax.revenue)}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs uppercase text-cyan-100">
        <p>Productivity</p>
        <p className="text-right text-orange-200">{tax.productivityImpact}%</p>
        <p>Tax Burden</p>
        <p className="text-right text-red-200">+{tax.taxBurdenImpact}%</p>
      </div>
      <p className="mt-3 border-2 border-cyan-900 bg-black/50 p-3 font-mono text-sm text-lime-100">{tax.consequence}</p>
      <button
        className={`cut-button mt-4 w-full px-3 py-3 font-mono text-sm font-black uppercase ${
          isSelected ? "cut-button--selected" : ""
        }`}
        onClick={onToggle}
      >
        {isSelected ? "Cancel Tax" : tax.name}
      </button>
    </motion.article>
  );
}

function DecisionLog({
  selectedCuts,
  selectedTaxes,
}: {
  selectedCuts: DepartmentCut[];
  selectedTaxes: TaxMeasure[];
}) {
  const decisions = [
    ...selectedCuts.map((cut) => `Cut ${cut.name}: ${formatMoney(cut.saving)}`),
    ...selectedTaxes.map((tax) => `${tax.name}: ${formatMoney(tax.revenue)}`),
  ];

  return (
    <section className="pixel-panel p-4">
      <p className="mega-chip">decision log</p>
      <ul className="mt-4 space-y-2 font-mono text-sm text-lime-100">
        {decisions.length > 0 ? decisions.map((decision) => <li key={decision}>- {decision}</li>) : <li>- No savings chosen yet.</li>}
      </ul>
    </section>
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
    <section className="summary-card p-5">
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
      <p className="mt-2 font-mono text-2xl font-black text-yellow-100 sm:text-3xl">{value}</p>
    </div>
  );
}

export default App;
