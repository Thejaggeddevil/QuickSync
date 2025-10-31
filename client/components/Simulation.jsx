import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const INITIAL_LOGS = [
  { status: "success", message: "Deploying mock rollup contracts" },
  { status: "success", message: "Sequencer started on port 9000" },
  { status: "success", message: "Batching 22 transactions" },
  { status: "success", message: "Proof generated in 3.2s" },
  { status: "success", message: "Proof anchored on L1 (Sepolia)" },
];

export default function Simulation() {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState({
    gasSaved: "92%",
    finalityTime: "14.2s",
    proofLatency: "3.2s",
    warnings: "None",
  });
  const { toast } = useToast();

  const handleRunSimulation = () => {
    setIsRunning(true);
    setLogs(INITIAL_LOGS);

    toast({
      title: "Simulation Started",
      description: "Running full simulation... this may take a minute",
      duration: 4000,
    });

    // Simulate adding logs
    const messages = [
      "Initializing blockchain state...",
      "Loading contracts...",
      "Starting sequencer...",
      "Processing 42 transactions...",
      "Generating proofs...",
      "Verifying proofs...",
      "Anchoring to L1...",
      "Simulation complete!",
    ];

    let delay = 1000;
    messages.forEach((msg, idx) => {
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          {
            status: idx === messages.length - 1 ? "success" : "success",
            message: msg,
          },
        ]);
      }, delay);
      delay += 800;
    });

    setTimeout(() => {
      setIsRunning(false);
      setSimulationResults({
        gasSaved: "94%",
        finalityTime: "13.8s",
        proofLatency: "3.1s",
        warnings: "None",
      });
      toast({
        title: "Simulation Complete",
        description: "All batches processed successfully",
        duration: 3000,
      });
    }, delay);
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Simulation & Audit</h2>
        <p className="text-muted-foreground">
          Run and monitor rollup simulations in real-time
        </p>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Simulation Log */}
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Simulation Log
                <span
                  className={cn(
                    "inline-block w-2 h-2 rounded-full",
                    isRunning ? "bg-neon-cyan animate-pulse" : "bg-muted-foreground"
                  )}
                ></span>
              </CardTitle>
              <CardDescription>
                {isRunning ? "Running..." : "Ready to execute"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden flex flex-col">
              <div className="flex-1 space-y-2 overflow-y-auto bg-background/30 rounded-lg p-4 border border-border/20 font-mono text-sm">
                {logs.length === 0 ? (
                  <p className="text-muted-foreground">
                    No logs yet. Click "Run Full Simulation" to start.
                  </p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      {log.status === "success" ? (
                        <CheckCircle2 className="text-neon-cyan flex-shrink-0 mt-0.5" size={16} />
                      ) : log.status === "warning" ? (
                        <AlertCircle className="text-yellow-400 flex-shrink-0 mt-0.5" size={16} />
                      ) : (
                        <AlertCircle className="text-destructive flex-shrink-0 mt-0.5" size={16} />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          log.status === "success" && "text-green-400",
                          log.status === "warning" && "text-yellow-400",
                          log.status === "error" && "text-destructive"
                        )}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                {isRunning && (
                  <div className="flex gap-2 items-center animate-pulse">
                    <div className="w-1 h-1 bg-neon-cyan rounded-full animate-pulse"></div>
                    <span className="text-neon-cyan text-sm">Processing...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Results */}
        <div>
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Simulation Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-4">
                {[
                  { label: "Gas Saved", value: simulationResults.gasSaved, icon: "⛽" },
                  { label: "Finality Time", value: simulationResults.finalityTime, icon: "⏱️" },
                  { label: "Proof Latency", value: simulationResults.proofLatency, icon: "⚡" },
                  { label: "Warnings", value: simulationResults.warnings, icon: "✅" },
                ].map((result, idx) => (
                  <div key={idx} className="p-3 bg-secondary/30 rounded-lg border border-border/20">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">{result.label}</p>
                      <span className="text-lg">{result.icon}</span>
                    </div>
                    <p className="text-2xl font-bold text-neon-blue">
                      {result.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border/30 space-y-2 mt-auto">
                <Button
                  className="w-full bg-gradient-to-r from-neon-blue to-neon-cyan gap-2"
                  onClick={handleRunSimulation}
                  disabled={isRunning}
                >
                  <Play size={16} />
                  {isRunning ? "Running..." : "Run Full Simulation"}
                </Button>
                <Button variant="outline" className="w-full">
                  View Summary Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Glowing Divider Info */}
      <Card className="bg-gradient-to-r from-neon-blue/10 via-neon-purple/10 to-neon-cyan/10 border border-neon-blue/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="text-neon-cyan flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h3 className="font-semibold mb-2">Simulation Tips</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Run simulations to test your rollup configuration before deployment</li>
                <li>• Check the logs for any warnings or errors</li>
                <li>• Export the simulation report for analysis and auditing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
