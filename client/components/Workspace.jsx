import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Copy,
  ExternalLink,
  Download as DownloadIcon,
  Play,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Code2,
  PlusCircle,
  CheckCheck,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
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

export default function Workspace() {
  const [activeTab, setActiveTab] = useState("plugins");
  const [copyProof, setCopyProof] = useState(false);
  const { toast } = useToast();

  // Plugins Data
  const PLUGINS = [
    {
      name: "Polygon CDK",
      description: "Full-featured rollup framework for Polygon ecosystem",
      version: "2.1.0",
      compatibility: "EVM",
      installed: true,
    },
    {
      name: "zkSync ZK Stack",
      description: "zkSync's modular rollup construction kit",
      version: "1.8.3",
      compatibility: "EVM",
      installed: true,
    },
    {
      name: "Optimism Orbit",
      description: "Optimism's layer-2 scaling solution",
      version: "3.0.1",
      compatibility: "EVM",
      installed: false,
    },
    {
      name: "Scroll",
      description: "Ethereum's native scaling solution with zero-knowledge proofs",
      version: "1.2.0",
      compatibility: "EVM",
      installed: false,
    },
    {
      name: "StarkNet",
      description: "STARK-based rollup framework (coming soon)",
      version: "0.1.0",
      compatibility: "Non-EVM",
      installed: false,
      comingSoon: true,
    },
  ];

  // Simulation Logs
  const SIMULATION_LOGS = [
    { status: "success", message: "Deploying mock rollup contracts" },
    { status: "success", message: "Sequencer started on port 9000" },
    { status: "success", message: "Batching 22 transactions" },
    { status: "success", message: "Proof generated in 3.2s" },
    { status: "success", message: "Proof anchored on L1 (Sepolia)" },
    { status: "info", message: "Simulation complete - no warnings" },
  ];

  // Analytics Data
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
  ];

  // Chart data for Batches over time
  const BATCHES_OVER_TIME = [
    { time: "12:00", batches: 10 },
    { time: "12:30", batches: 25 },
    { time: "13:00", batches: 45 },
    { time: "13:30", batches: 65 },
    { time: "14:00", batches: 89 },
    { time: "14:30", batches: 112 },
    { time: "15:00", batches: 142 },
  ];

  // Chart data for proof generation time
  const PROOF_GEN_TIME = [
    { batch: "B1", time: 3.5, efficiency: 85 },
    { batch: "B2", time: 3.2, efficiency: 88 },
    { batch: "B3", time: 3.1, efficiency: 90 },
    { batch: "B4", time: 2.9, efficiency: 92 },
    { batch: "B5", time: 3.0, efficiency: 91 },
    { batch: "B6", time: 2.8, efficiency: 93 },
    { batch: "B7", time: 2.7, efficiency: 94 },
  ];

  // Chart data for gas efficiency
  const GAS_EFFICIENCY = [
    { batch: "B1", rollup: 45, l1: 85, saved: 40 },
    { batch: "B2", rollup: 42, l1: 85, saved: 43 },
    { batch: "B3", rollup: 40, l1: 85, saved: 45 },
    { batch: "B4", rollup: 38, l1: 85, saved: 47 },
    { batch: "B5", rollup: 36, l1: 85, saved: 49 },
    { batch: "B6", rollup: 34, l1: 85, saved: 51 },
    { batch: "B7", rollup: 32, l1: 85, saved: 53 },
  ];

  // Proof Data
  const PROOF_DATA = {
    batchId: 4,
    proofHash: "0xabc123def456xyz789uvwpqrst012345678901244567890",
    publicInputs: ["0x1234...5678", "0x9abc...def0", "0x1111...2222"],
    verificationStatus: "verified",
    timestamp: "2024-10-27T14:32:00Z",
    circuitType: "Plonk",
  };

  const handlePluginInstall = (pluginName) => {
    toast({
      title: `${pluginName} Installed`,
      description: `Successfully installed ${pluginName} plugin`,
      duration: 3000,
    });
  };

  const handleRunSimulation = () => {
    toast({
      title: "Simulation Started",
      description: "Running full simulation... this may take a minute",
      duration: 4000,
    });
  };

  const handleCopyProof = () => {
    navigator.clipboard.writeText(JSON.stringify(PROOF_DATA, null, 2));
    setCopyProof(true);
    setTimeout(() => setCopyProof(false), 2000);
    toast({
      title: "Proof Copied",
      description: "Proof JSON copied to clipboard",
      duration: 2000,
    });
  };

  const handleExportProof = () => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(PROOF_DATA, null, 2))}`
    );
    element.setAttribute("download", `proof-${PROOF_DATA.batchId}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Proof Exported",
      description: `Proof downloaded as JSON`,
      duration: 2000,
    });
  };

  return (
    <div className="p-6 md:p-8">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5 bg-secondary/30 border border-border/30 p-1">
          <TabsTrigger value="plugins" className="gap-2">
            <Puzzle size={16} />
            <span className="hidden sm:inline">Plugins</span>
          </TabsTrigger>
          <TabsTrigger value="simulation" className="gap-2">
            <Play size={16} />
            <span className="hidden sm:inline">Simulation</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 size={16} />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="proof" className="gap-2">
            <Code2 size={16} />
            <span className="hidden sm:inline">Proof</span>
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <CheckCheck size={16} />
            <span className="hidden sm:inline">Docs</span>
          </TabsTrigger>
        </TabsList>

        {/* Plugins Tab */}
        <TabsContent value="plugins" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">QuickSync Plugins</h3>
              <p className="text-muted-foreground">
                Install and manage rollup framework plugins
              </p>
            </div>
            <Button className="bg-gradient-to-r from-neon-blue to-neon-purple gap-2">
              <PlusCircle size={16} />
              Install Custom Plugin
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PLUGINS.map((plugin, idx) => (
              <Card
                key={idx}
                className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm hover:border-border/60 transition-all duration-200"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-lg">{plugin.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {plugin.description}
                      </p>
                    </div>
                    {plugin.installed && (
                      <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                        Installed
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      v{plugin.version}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        plugin.compatibility === "EVM"
                          ? "border-neon-blue/30 text-neon-blue"
                          : "border-neon-purple/30 text-neon-purple"
                      )}
                    >
                      {plugin.compatibility}
                    </Badge>
                  </div>

                  <Button
                    className="w-full"
                    variant={plugin.installed ? "outline" : "default"}
                    disabled={plugin.comingSoon}
                    onClick={() => !plugin.comingSoon && handlePluginInstall(plugin.name)}
                  >
                    {plugin.comingSoon
                      ? "Coming Soon"
                      : plugin.installed
                        ? "Reinstall"
                        : "Install"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Simulation & Audit Tab */}
        <TabsContent value="simulation" className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Simulation & Audit</h3>
            <p className="text-muted-foreground">
              Run and monitor rollup simulations
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simulation Log */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Simulation Log
                    <span className="inline-block w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {SIMULATION_LOGS.map((log, idx) => (
                      <div key={idx} className="flex gap-3 p-3 bg-secondary/30 rounded-lg border border-border/30">
                        {log.status === "success" ? (
                          <CheckCircle2 className="text-neon-cyan flex-shrink-0 mt-0.5" size={18} />
                        ) : (
                          <AlertCircle className="text-neon-purple flex-shrink-0 mt-0.5" size={18} />
                        )}
                        <p className="text-sm font-mono text-foreground">
                          {log.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Panel */}
            <div>
              <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm h-full">
                <CardHeader>
                  <CardTitle className="text-base">Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Gas Saved", value: "92%", icon: "⛽" },
                    { label: "Finality Time", value: "14.2s", icon: "⏱️" },
                    { label: "Proof Latency", value: "3.2s", icon: "⚡" },
                    { label: "Warnings", value: "None", icon: "✅" },
                  ].map((result, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">{result.label}</p>
                        <span className="text-lg">{result.icon}</span>
                      </div>
                      <p className="text-2xl font-bold text-neon-blue">
                        {result.value}
                      </p>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-border/30 space-y-2">
                    <Button 
                      className="w-full bg-gradient-to-r from-neon-blue to-neon-cyan gap-2"
                      onClick={handleRunSimulation}
                    >
                      <Play size={16} />
                      Run Full Simulation
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Summary Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">History & Analytics</h3>
            <p className="text-muted-foreground">
              Track simulation runs and performance metrics
            </p>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Batches Processed Over Time */}
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Batches Processed Over Time</CardTitle>
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
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #00ffff" }} />
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

            {/* Proof Generation Time & Efficiency */}
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Proof Generation Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={PROOF_GEN_TIME}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="batch" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #a855f7" }} />
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

            {/* Gas Efficiency Comparison */}
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle>Gas Efficiency vs L1 Baseline</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={GAS_EFFICIENCY}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="batch" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip contentStyle={{ backgroundColor: "#1a1a2e", border: "1px solid #0080FF" }} />
                    <Legend />
                    <Bar dataKey="rollup" fill="#0080FF" name="Rollup Cost" />
                    <Bar dataKey="l1" fill="#666" name="L1 Cost" />
                    <Bar dataKey="saved" fill="#06b6d4" name="Gas Saved" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Data Table */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm overflow-hidden">
            <CardHeader>
              <CardTitle>Past Simulation Runs</CardTitle>
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
                        <td className="p-3 font-mono text-neon-blue">
                          #{row.batch}
                        </td>
                        <td className="p-3">{row.txCount}</td>
                        <td className="p-3 text-neon-cyan font-semibold">
                          {row.gasSaved}
                        </td>
                        <td className="p-3">{row.finality}</td>
                        <td className="p-3">{row.status}</td>
                        <td className="p-3 text-muted-foreground">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Proof Viewer Tab */}
        <TabsContent value="proof" className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Proof Viewer</h3>
            <p className="text-muted-foreground">
              Inspect and analyze generated proofs
            </p>
          </div>

          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
            <CardHeader>
              <div>
                <CardTitle>Batch #{PROOF_DATA.batchId} Proof</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <CardDescription>Verification Status:</CardDescription>
                  <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                    {PROOF_DATA.verificationStatus}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Proof JSON */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Proof Structure</label>
                <div className="bg-gradient-to-br from-background to-background/50 border border-border/40 rounded-lg p-4 overflow-x-auto">
                  <pre className="font-mono text-xs text-neon-cyan whitespace-pre-wrap break-all">
                    {JSON.stringify(PROOF_DATA, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
                <Button
                  onClick={handleCopyProof}
                  variant="outline"
                  className={cn(
                    "gap-2",
                    copyProof && "bg-neon-cyan/20 border-neon-cyan/50"
                  )}
                >
                  <Copy size={16} />
                  {copyProof ? "Copied!" : "Copy Proof"}
                </Button>
                <Button variant="outline" className="gap-2" onClick={handleExportProof}>
                  <DownloadIcon size={16} />
                  Export JSON
                </Button>
                <Button variant="outline" className="gap-2">
                  <ExternalLink size={16} />
                  View On Explorer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Proof Details */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Proof Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Proof Hash", value: PROOF_DATA.proofHash },
                { label: "Circuit Type", value: PROOF_DATA.circuitType },
                { label: "Generated At", value: new Date(PROOF_DATA.timestamp).toLocaleString() },
              ].map((detail, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-secondary/30 rounded-lg border border-border/30"
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {detail.label}
                  </p>
                  <p className="font-mono text-sm text-neon-cyan truncate">
                    {detail.value}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Docs Tab */}
        <TabsContent value="docs" className="space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Documentation</h3>
            <p className="text-muted-foreground">
              Guides and tutorials for QuickSync SDK
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Getting Started with QuickSync CLI",
                description:
                  "Learn how to initialize and configure your first rollup project",
                cmd: "npx zerosync init myrollup",
              },
              {
                title: "How ProofEngine Works",
                description:
                  "Understanding the proof generation and verification pipeline",
                cmd: "zerosync prove --config config.json",
              },
              {
                title: "Adding Custom Plugins",
                description:
                  "Extend QuickSync with custom rollup implementations",
                cmd: "zerosync plugin install ./my-plugin",
              },
              {
                title: "Running a Local Simulation",
                description:
                  "Test your rollup configuration before deployment",
                cmd: "zerosync simulate --local",
              },
            ].map((doc, idx) => (
              <Card
                key={idx}
                className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm hover:border-border/60 transition-all"
              >
                <CardContent className="p-6 space-y-4">
                  <h4 className="font-bold text-lg">{doc.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {doc.description}
                  </p>
                  <div className="bg-secondary/50 border border-border/30 rounded-lg p-3">
                    <p className="font-mono text-xs text-neon-cyan">
                      {doc.cmd}
                    </p>
                  </div>
                  <Button variant="outline" className="w-full">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* External Links */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: "GitHub Repository", url: "#" },
                { label: "API Documentation", url: "#" },
                { label: "Community Discord", url: "#" },
              ].map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/30 hover:bg-secondary/50 transition-colors group"
                >
                  <span className="text-sm font-medium">{link.label}</span>
                  <ExternalLink
                    size={16}
                    className="text-muted-foreground group-hover:text-neon-blue transition-colors"
                  />
                </a>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
