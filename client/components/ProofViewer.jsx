import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const PROOF_DATA = {
  batchId: 4,
  proofHash: "0xabc123def456xyz789uvwpqrst012345678901244567890",
  publicInputs: [12, 34, 56, 78, 90],
  verificationStatus: "verified",
  timestamp: "2024-10-27T14:32:00Z",
  circuitType: "Plonk",
  proverTime: "3.2s",
  verifierTime: "0.8s",
  constraintCount: 2048,
};

export default function ProofViewer() {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { toast } = useToast();

  const handleCopyProof = () => {
    navigator.clipboard.writeText(JSON.stringify(PROOF_DATA, null, 2));
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
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

  const isVerified = PROOF_DATA.verificationStatus === "verified";

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Proof Viewer</h2>
        <p className="text-muted-foreground">
          Inspect and analyze generated proofs
        </p>
      </div>

      {/* Main Proof Card */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle>Batch #{PROOF_DATA.batchId} Proof</CardTitle>
              <CardDescription>
                Circuit Type: {PROOF_DATA.circuitType}
              </CardDescription>
            </div>
            <Badge
              className={cn(
                "text-sm",
                isVerified
                  ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"
                  : "bg-destructive/20 text-destructive border-destructive/30"
              )}
            >
              {isVerified ? "✅ Verified" : "❌ Failed"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* JSON Viewer */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Proof Structure</label>
            <div className="bg-gradient-to-br from-background to-background/50 border border-border/40 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
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
                copyFeedback && "bg-neon-cyan/20 border-neon-cyan/50"
              )}
            >
              <Copy size={16} />
              {copyFeedback ? "Copied!" : "Copy Proof"}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportProof}>
              <Download size={16} />
              Export JSON
            </Button>
            <Button variant="outline" className="gap-2">
              <ExternalLink size={16} />
              View On Explorer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Proof Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Details */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Proof Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Proof Hash", value: PROOF_DATA.proofHash, mono: true },
              { label: "Circuit Type", value: PROOF_DATA.circuitType },
              { label: "Constraint Count", value: PROOF_DATA.constraintCount.toLocaleString() },
            ].map((detail, idx) => (
              <div key={idx} className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                <p className="text-xs text-muted-foreground mb-1">{detail.label}</p>
                <p className={cn("text-sm break-all", detail.mono && "font-mono text-neon-cyan")}>
                  {detail.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Right Performance */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Prover Time", value: PROOF_DATA.proverTime, icon: "⚡" },
              { label: "Verifier Time", value: PROOF_DATA.verifierTime, icon: "✓" },
              { label: "Generated At", value: new Date(PROOF_DATA.timestamp).toLocaleString(), icon: "🕐" },
            ].map((detail, idx) => (
              <div key={idx} className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-muted-foreground">{detail.label}</p>
                  <span className="text-lg">{detail.icon}</span>
                </div>
                <p className="text-sm font-semibold text-neon-cyan">{detail.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Public Inputs */}
      <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base">Public Inputs</CardTitle>
          <CardDescription>Publicly known inputs to the proof circuit</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {PROOF_DATA.publicInputs.map((input, idx) => (
              <div
                key={idx}
                className="p-3 bg-secondary/30 rounded-lg border border-border/30 text-center"
              >
                <p className="text-xs text-muted-foreground mb-1">Input {idx}</p>
                <p className="font-mono text-sm text-neon-cyan font-bold">{input}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification Info */}
      <Card
        className={cn(
          "bg-gradient-to-br backdrop-blur-sm",
          isVerified
            ? "from-neon-cyan/10 to-neon-blue/10 border border-neon-cyan/30"
            : "from-destructive/10 to-destructive/10 border border-destructive/30"
        )}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{isVerified ? "✅" : "❌"}</span>
            <div>
              <h3 className="font-semibold mb-2">
                Proof {isVerified ? "Verified" : "Verification Failed"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isVerified
                  ? "This proof has been successfully verified on-chain. All constraints are satisfied and the proof is valid."
                  : "Proof verification failed. Please check the circuit and inputs."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
