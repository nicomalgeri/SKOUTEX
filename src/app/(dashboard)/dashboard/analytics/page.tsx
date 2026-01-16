"use client";

import { useState } from "react";
import Header from "@/components/dashboard/Header";
import {
  LazyDistributionChart as DistributionChart,
  LazyLineChart as LineChart,
  LazyBarChart as BarChart,
} from "@/components/charts/LazyCharts";
import {
  TrendingUp,
  Target,
  Users,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Info,
} from "lucide-react";

// Generate Monte Carlo simulation data
function generateDistributionData(meanBefore: number, meanAfter: number) {
  const data = [];
  for (let x = 30; x <= 90; x += 2) {
    const beforeProb = Math.exp(-Math.pow(x - meanBefore, 2) / (2 * 100)) * 100;
    const afterProb = Math.exp(-Math.pow(x - meanAfter, 2) / (2 * 100)) * 100;
    data.push({ x, before: beforeProb, after: afterProb });
  }
  return data;
}

export default function AnalyticsPage() {
  const [selectedPlayer, setSelectedPlayer] = useState("Marcus Okonkwo");
  const [simulations, setSimulations] = useState(10000);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulated Monte Carlo results
  const beforeMean = 58;
  const afterMean = 64;
  const distributionData = generateDistributionData(beforeMean, afterMean);

  const improvementProb = 72;
  const pointsChange = "+6.2";
  const positionChange = "+2.1";

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1500);
  };

  // Season projection data
  const projectionData = [
    { name: "Current", without: 58, with: 58 },
    { name: "+5 Games", without: 56, with: 62 },
    { name: "+10 Games", without: 55, with: 65 },
    { name: "+15 Games", without: 54, with: 66 },
    { name: "+20 Games", without: 55, with: 68 },
    { name: "End Season", without: 56, with: 70 },
  ];

  // Squad impact by area
  const impactData = [
    { name: "Defending", value: 12, color: "#0031FF" },
    { name: "Possession", value: 8, color: "#00C896" },
    { name: "Attacking", value: 5, color: "#FF6B35" },
    { name: "Set Pieces", value: 15, color: "#8B5CF6" },
  ];

  return (
    <>
      <Header
        title="Squad Impact Analytics"
        subtitle="Monte Carlo simulations & projections"
      />

      <div className="p-4 lg:p-6 space-y-6">
        {/* Controls */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#2C2C2C] mb-1">
                Impact Simulation
              </h2>
              <p className="text-sm text-gray-500">
                Analyze how a signing would affect squad performance
              </p>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="px-4 py-2 bg-[#f6f6f6] border border-gray-300 rounded-xl text-[#2C2C2C] text-sm focus:outline-none focus:border-[#0031FF]"
              >
                <option>Marcus Okonkwo</option>
                <option>Lucas Ferreira</option>
                <option>Alejandro Martinez</option>
                <option>Giovanni Rossi</option>
              </select>

              <select
                value={simulations}
                onChange={(e) => setSimulations(parseInt(e.target.value))}
                className="px-4 py-2 bg-[#f6f6f6] border border-gray-300 rounded-xl text-[#2C2C2C] text-sm focus:outline-none focus:border-[#0031FF]"
              >
                <option value={1000}>1,000 simulations</option>
                <option value={5000}>5,000 simulations</option>
                <option value={10000}>10,000 simulations</option>
                <option value={50000}>50,000 simulations</option>
              </select>

              <button
                onClick={runSimulation}
                disabled={isSimulating}
                className="px-4 py-2 bg-[#0031FF] text-white text-sm font-medium rounded-xl hover:bg-[#0028cc] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Improvement Probability"
            value={`${improvementProb}%`}
            change="High confidence"
            positive
          />
          <SummaryCard
            icon={<Target className="w-5 h-5" />}
            label="Projected Points Change"
            value={pointsChange}
            change="Based on 10k simulations"
            positive
          />
          <SummaryCard
            icon={<Users className="w-5 h-5" />}
            label="Position Change"
            value={positionChange}
            change="Expected league position"
            positive
          />
          <SummaryCard
            icon={<ArrowUp className="w-5 h-5" />}
            label="Best Case Scenario"
            value="+12 pts"
            change="95th percentile"
            positive
          />
        </div>

        {/* Distribution Chart */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[#2C2C2C]">
                Points Distribution
              </h3>
              <p className="text-sm text-gray-500">
                Probability distribution of season-end points
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF6B35]" />
                <span className="text-gray-500">Without {selectedPlayer}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#00C896]" />
                <span className="text-gray-500">With {selectedPlayer}</span>
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <DistributionChart
              data={distributionData}
              beforeLabel="Without Player"
              afterLabel="With Player"
              meanBefore={beforeMean}
              meanAfter={afterMean}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Season Projection */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">
              Season Projection
            </h3>
            <div className="h-[300px]">
              <LineChart
                data={projectionData}
                lines={[
                  { dataKey: "without", color: "#FF6B35", name: "Without Player" },
                  { dataKey: "with", color: "#00C896", name: "With Player" },
                ]}
              />
            </div>
          </div>

          {/* Impact by Area */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#2C2C2C] mb-4">
              Performance Impact by Area
            </h3>
            <div className="h-[300px]">
              <BarChart data={impactData} horizontal />
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-[#2C2C2C] mb-6">
            Simulation Details
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Mean Points (Before)"
              value={beforeMean.toString()}
              sublabel="Expected value"
            />
            <StatCard
              label="Mean Points (After)"
              value={afterMean.toString()}
              sublabel="Expected value"
            />
            <StatCard
              label="Std Deviation"
              value="8.4"
              sublabel="Uncertainty measure"
            />
            <StatCard
              label="Confidence Interval"
              value="±4.2 pts"
              sublabel="95% CI"
            />
          </div>

          <div className="mt-6 p-4 bg-[#f6f6f6] rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-[#0031FF] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-600">
                This simulation is based on {simulations.toLocaleString()} Monte Carlo iterations,
                using historical performance data, team dynamics, and player-specific metrics.
                Results should be used as one input among many in transfer decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`text-${positive ? "green" : "red"}-500`}>{icon}</div>
        <span className="text-gray-500 text-sm">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${positive ? "text-green-500" : "text-red-500"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{change}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
}: {
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#2C2C2C]">{value}</p>
      <p className="text-xs text-gray-500">{sublabel}</p>
    </div>
  );
}
