import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Rocket, Search, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_ACTIVITIES = [
  {
    id: 1,
    batch: "Batch #12",
    txCount: 22,
    status: "Anchored",
    gasSaved: 92,
    finality: 14.2,
    chain: "Sepolia",
    timestamp: "2 min ago",
  },
  {
    id: 2,
    batch: "Batch #11",
    txCount: 18,
    status: "Verified",
    gasSaved: 89,
    finality: 13.8,
    chain: "Sepolia",
    timestamp: "5 min ago",
  },
  {
    id: 3,
    batch: "Batch #10",
    txCount: 25,
    status: "Anchored",
    gasSaved: 94,
    finality: 15.1,
    chain: "Ethereum",
    timestamp: "8 min ago",
  },
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    batches: 142,
    gasSaved: 92.3,
    finality: 14.2,
    sequencer: "Active",
  });

  const [animatedBatch, setAnimatedBatch] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedBatch((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          QuickSync Playground
        </h2>
        <p className="text-muted-foreground text-lg">
          The Hardhat for Rollups — Spin up, simulate, and deploy rollups with one SDK
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Batches Processed",
            value: metrics.batches.toLocaleString(),
            unit: "total",
            
          },
          {
            label: "Gas Saved",
            value: metrics.gasSaved.toFixed(1),
            unit: "%",
            
          },
          {
            label: "Avg Finality Time",
            value: metrics.finality.toFixed(1),
            unit: "s",
            
          },
          {
            label: "Sequencer Status",
            value: metrics.sequencer,
            unit: "",
            
            highlight: true,
          },
        ].map((metric, idx) => (
          <Card
            key={idx}
            className={cn(
              "bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm",
              metric.highlight &&
                "border-neon-blue/50 shadow-glow"
            )}
          >
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <p className="text-sm text-muted-foreground font-medium">
                    {metric.label}
                  </p>
                  {/* reserved for future metric icon */}
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-neon-blue">
                    {metric.value}
                  </p>
                  {metric.unit && (
                    <span className="text-sm text-muted-foreground">
                      {metric.unit}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Visualization */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Pipeline Flow</span>
            <span className="inline-block w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
          </CardTitle>
          <CardDescription>
            Current transaction batching and proof generation pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center justify-between min-w-max gap-4 px-2">
              {[
                { step: "Pending Transactions", count: "45", index: 0 },
                { step: "Batched", count: "142", index: 1 },
                { step: "Proof Generated", count: "140", index: 2 },
                { step: "Anchored on L1", count: "139", index: 3 },
              ].map((stage, idx) => (
                <React.Fragment key={idx}>
                  <div
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg transition-all duration-500 min-w-max",
                      animatedBatch === idx
                        ? "bg-gradient-to-r from-neon-blue/30 to-neon-purple/30 border border-neon-blue/50 shadow-glow"
                        : "bg-secondary/50 border border-border/30"
                    )}
                  >
                    <div className="text-2xl font-bold text-neon-blue">
                      {stage.count}
                    </div>
                    <div className="text-xs text-muted-foreground text-center font-medium">
                      {stage.step}
                    </div>
                  </div>
                  {idx < 3 && (
                    <div className="flex items-center gap-2">
                      <ArrowRight
                        size={20}
                        className={cn(
                          "transition-all duration-300",
                          animatedBatch > idx
                            ? "text-neon-cyan"
                            : "text-muted-foreground/50"
                        )}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Pipeline Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "Throughput", value: "2,450 tx/min" },
              { label: "Proof Time", value: "3.2s avg" },
              { label: "L1 Cost", value: "-87% saved" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="p-3 bg-secondary/30 border border-border/30 rounded-lg text-center"
              >
                {/* reserved for stat icon */}
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-sm font-bold text-neon-cyan mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Activity Log */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Live Activity</span>
            <span className="inline-block w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
          </CardTitle>
          <CardDescription>
            Recent simulation and batching events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {SAMPLE_ACTIVITIES.map((activity) => (
              <div
                key={activity.id}
                className="p-4 bg-secondary/30 border border-border/30 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-neon-blue">
                        {activity.batch}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {activity.txCount} tx batched
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-2 py-1 bg-neon-blue/20 text-neon-blue rounded border border-neon-blue/30 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Proof verified
                      </span>
                      <span className="px-2 py-1 bg-neon-purple/20 text-neon-purple rounded border border-neon-purple/30 font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Anchored on {activity.chain}
                      </span>
                    </div>
                  </div>
                  <div className="text-right space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 justify-end">
                      <span>{activity.gasSaved}% gas saved</span>
                      
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <span>{activity.finality.toFixed(1)}s</span>
                      <Clock size={12} />
                    </div>
                    <div className="text-muted-foreground/70">
                      {activity.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Start Simulation",
            icon: Play,
            gradient: "from-neon-blue to-neon-cyan",
            description: "Run a local test",
          },
          {
            label: "Deploy Anchor",
            icon: Rocket,
            gradient: "from-neon-purple to-neon-blue",
            description: "Deploy to L1",
          },
          {
            label: "View Proof",
            icon: Search,
            gradient: "from-neon-cyan to-neon-purple",
            description: "Inspect details",
          },
          {
            label: "Simulate Audit",
            icon: CheckCircle2,
            gradient: "from-neon-purple to-neon-blue",
            description: "Security check",
          },
        ].map((btn, idx) => {
          const Icon = btn.icon;
          return (
            <Button
              key={idx}
              className={cn(
                "h-auto p-4 flex flex-col items-start gap-2 bg-gradient-to-br hover:shadow-glow transition-all duration-300",
                `${btn.gradient}`,
                "text-white border-0"
              )}
            >
              <Icon size={24} />
              <div className="flex flex-col gap-1 text-left">
                <p className="font-semibold text-sm">{btn.label}</p>
                <p className="text-xs opacity-90">{btn.description}</p>
              </div>
            </Button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t border-border/30">
        <p className="text-sm text-muted-foreground">
          Powered by QuickSync SDK — unified framework for rollup devs
        </p>
      </div>
    </div>
  );
}
