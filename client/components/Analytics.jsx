import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

const BATCHES_OVER_TIME = [
  { time: "12:00", batches: 10 },
  { time: "12:30", batches: 25 },
  { time: "13:00", batches: 45 },
  { time: "13:30", batches: 65 },
  { time: "14:00", batches: 89 },
  { time: "14:30", batches: 112 },
  { time: "15:00", batches: 142 },
];

const PROOF_GEN_TIME = [
  { batch: "B1", time: 3.5, efficiency: 85 },
  { batch: "B2", time: 3.2, efficiency: 88 },
  { batch: "B3", time: 3.1, efficiency: 90 },
  { batch: "B4", time: 2.9, efficiency: 92 },
  { batch: "B5", time: 3.0, efficiency: 91 },
  { batch: "B6", time: 2.8, efficiency: 93 },
  { batch: "B7", time: 2.7, efficiency: 94 },
];

const GAS_EFFICIENCY = [
  { batch: "B1", rollup: 45, l1: 85, saved: 40 },
  { batch: "B2", rollup: 42, l1: 85, saved: 43 },
  { batch: "B3", rollup: 40, l1: 85, saved: 45 },
  { batch: "B4", rollup: 38, l1: 85, saved: 47 },
  { batch: "B5", rollup: 36, l1: 85, saved: 49 },
  { batch: "B6", rollup: 34, l1: 85, saved: 51 },
  { batch: "B7", rollup: 32, l1: 85, saved: 53 },
];

const ANALYTICS_DATA = [
  {
    batch: 12,
    txCount: 18,
    gasSaved: "92%",
    finality: "13.4s",
    status: "✅ Verified",
    date: "Oct 27, 2024",
  },
  {
    batch: 11,
    txCount: 22,
    gasSaved: "94%",
    finality: "14.1s",
    status: "✅ Verified",
    date: "Oct 27, 2024",
  },
  {
    batch: 10,
    txCount: 19,
    gasSaved: "89%",
    finality: "12.8s",
    status: "✅ Verified",
    date: "Oct 27, 2024",
  },
  {
    batch: 9,
    txCount: 25,
    gasSaved: "95%",
    finality: "15.2s",
    status: "✅ Verified",
    date: "Oct 26, 2024",
  },
  {
    batch: 8,
    txCount: 21,
    gasSaved: "91%",
    finality: "13.9s",
    status: "✅ Verified",
    date: "Oct 26, 2024",
  },
];

export default function Analytics() {
  const [filters, setFilters] = useState({
    chain: "all",
    plugin: "all",
    dateRange: "week",
  });

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">History & Analytics</h2>
        <p className="text-muted-foreground">
          Track simulation runs and performance metrics
        </p>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium block mb-2">Chain</label>
          <select
            value={filters.chain}
            onChange={(e) => setFilters({ ...filters, chain: e.target.value })}
            className="w-full px-4 py-2 bg-card border border-border/30 rounded-lg text-foreground"
          >
            <option value="all">All Chains</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="base">Base</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Plugin</label>
          <select
            value={filters.plugin}
            onChange={(e) => setFilters({ ...filters, plugin: e.target.value })}
            className="w-full px-4 py-2 bg-card border border-border/30 rounded-lg text-foreground"
          >
            <option value="all">All Plugins</option>
            <option value="polygon-cdk">Polygon CDK</option>
            <option value="zksync">zkSync ZK Stack</option>
            <option value="optimism">Optimism Orbit</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-2">Date Range</label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="w-full px-4 py-2 bg-card border border-border/30 rounded-lg text-foreground"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batches Over Time */}
        <Card className="bg-gradient-to-br from-neon-blue/5 to-neon-cyan/5 border border-neon-blue/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Batches Processed Over Time</CardTitle>
            <CardDescription>Cumulative batch processing trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={BATCHES_OVER_TIME}>
                <defs>
                  <linearGradient id="colorBatches" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0080FF" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0080FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #0080FF",
                    borderRadius: "8px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="batches"
                  stroke="#0080FF"
                  fillOpacity={1}
                  fill="url(#colorBatches)"
                  name="Batches"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Proof Generation Performance */}
        <Card className="bg-gradient-to-br from-neon-purple/5 to-neon-blue/5 border border-neon-purple/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Proof Generation Performance</CardTitle>
            <CardDescription>Time and efficiency metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={PROOF_GEN_TIME}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="batch" stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a2e",
                    border: "1px solid #a855f7",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#a855f7"
                  strokeWidth={2}
                  name="Time (s)"
                  dot={{ fill: "#a855f7", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  name="Efficiency %"
                  dot={{ fill: "#06b6d4", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gas Efficiency Chart */}
      <Card className="bg-gradient-to-br from-neon-cyan/5 to-neon-blue/5 border border-neon-cyan/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Gas Efficiency vs L1 Baseline</CardTitle>
          <CardDescription>Cost comparison across batches</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={GAS_EFFICIENCY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="batch" stroke="rgba(255,255,255,0.5)" />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1a1a2e",
                  border: "1px solid #0080FF",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="rollup" fill="#0080FF" name="Rollup Cost" />
              <Bar dataKey="l1" fill="#666" name="L1 Cost" />
              <Bar dataKey="saved" fill="#06b6d4" name="Gas Saved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Batches", value: "142", icon: "📊" },
          { label: "Avg Gas Efficiency", value: "92.3%", icon: "⛽" },
          { label: "Avg Finality", value: "13.9s", icon: "⏱️" },
        ].map((stat, idx) => (
          <Card
            key={idx}
            className="bg-gradient-to-br from-neon-blue/10 to-neon-purple/10 border-neon-blue/40"
          >
            <CardContent className="p-6 text-center space-y-2">
              <span className="text-3xl">{stat.icon}</span>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-neon-blue">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Table */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle>Past Simulation Runs</CardTitle>
          <CardDescription>Complete history of all batches</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-3 text-muted-foreground font-medium">
                    Batch
                  </th>
                  <th className="text-left p-3 text-muted-foreground font-medium">
                    Tx Count
                  </th>
                  <th className="text-left p-3 text-muted-foreground font-medium">
                    Gas Saved
                  </th>
                  <th className="text-left p-3 text-muted-foreground font-medium">
                    Finality
                  </th>
                  <th className="text-left p-3 text-muted-foreground font-medium">
                    Status
                  </th>
                  <th className="text-left p-3 text-muted-foreground font-medium">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {ANALYTICS_DATA.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="p-3 font-mono text-neon-blue">#{row.batch}</td>
                    <td className="p-3">{row.txCount}</td>
                    <td className="p-3 text-neon-cyan font-semibold">
                      {row.gasSaved}
                    </td>
                    <td className="p-3">{row.finality}</td>
                    <td className="p-3">{row.status}</td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {row.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
