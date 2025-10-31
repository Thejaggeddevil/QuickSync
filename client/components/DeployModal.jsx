import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api.js";

const DEPLOYMENT_LOGS = [
  "🔄 Initializing deployment...",
  "⚙️ Building modules...",
  "📦 Uploading artifacts...",
  "🧠 Generating zero-knowledge proofs...",
  "🚀 Finalizing deployment on L2...",
];

export default function DeployModal({ isOpen, onClose, deployId: externalDeployId, deployedUrl: externalUrl }) {
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const [deployId, setDeployId] = useState(null);
  const [finalUrl, setFinalUrl] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setLogs([]);
      setIsComplete(false);
      setDeployId(null);
      setFinalUrl("");
      return;
    }

    // If a deploy id is passed from caller, use it; otherwise we cannot poll
    setDeployId(externalDeployId || null);

    if (externalDeployId) {
      // Poll status every 2s
      const poll = async () => {
        try {
          const status = await api.getDeployStatus(externalDeployId);
          const pct = Math.max(0, Math.min(100, Number(status?.progress ?? 0)));
          setProgress(pct);
          if (Array.isArray(status?.logs)) {
            setLogs(status.logs);
          }
          if (status?.url) setFinalUrl(status.url);
          if (pct >= 100 || status?.status === "success") {
            setIsComplete(true);
            if (pollRef.current) clearInterval(pollRef.current);
          }
          if (status?.status === "failed") {
            setIsComplete(true);
            if (pollRef.current) clearInterval(pollRef.current);
          }
        } catch (e) {
          // stop polling on error to avoid noisy loops
          if (pollRef.current) clearInterval(pollRef.current);
          setIsComplete(true);
          setLogs((prev) => [...prev, `❌ ${e.message || "Deployment status failed"}`]);
        }
      };
      pollRef.current = setInterval(poll, 2000);
      // initial immediate poll
      poll();
      return () => pollRef.current && clearInterval(pollRef.current);
    }
  }, [isOpen, externalDeployId]);

  const handleRunAgain = () => {
    // Caller should trigger a new deploy and pass a new id; we just reset UI
    setProgress(0);
    setLogs([]);
    setIsComplete(false);
  };

  if (!isOpen) return null;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-card to-card/50 border border-neon-blue/30 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-xl font-bold text-foreground">Deployment Console</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Circular Progress Ring */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg
                className="absolute inset-0"
                width="128"
                height="128"
                viewBox="0 0 128 128"
              >
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="4"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r={radius}
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 0.3s ease",
                    transform: "rotate(-90deg)",
                    transformOrigin: "center",
                  }}
                />
                {/* Gradient */}
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00BFFF" />
                    <stop offset="100%" stopColor="#A855F7" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Progress Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-blue">
                    {progress}%
                  </div>
                  {isComplete && (
                    <div className="text-2xl mt-2 animate-pulse">✅</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {isComplete ? "Deployment Complete" : "Deploying..."}
            </p>
            {isComplete && (finalUrl || externalUrl) && (
              <div className="mt-2">
                <a
                  href={finalUrl || externalUrl}
                  className="text-neon-blue underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open App
                </a>
              </div>
            )}
          </div>

          {/* Deployment Log Console */}
          <div className="bg-background/50 rounded-lg border border-border/30 p-4 max-h-48 overflow-y-auto space-y-2 font-mono text-xs">
            {logs.length === 0 ? (
              <p className="text-muted-foreground">Starting deployment...</p>
            ) : (
              logs.map((log, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "animate-slide-in",
                    log.includes("✅")
                      ? "text-green-400"
                      : log.includes("❌")
                        ? "text-destructive"
                        : "text-neon-cyan"
                  )}
                >
                  {log}
                </div>
              ))
            )}
            {/* Live cursor animation */}
            {!isComplete && logs.length > 0 && (
              <div className="text-neon-cyan animate-pulse">▊</div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-border/30">
            {isComplete && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRunAgain}
              >
                Run Again
              </Button>
            )}
            <Button
              className={cn(
                "flex-1",
                isComplete
                  ? "bg-secondary hover:bg-secondary/80"
                  : "bg-secondary/50 cursor-not-allowed"
              )}
              onClick={onClose}
              disabled={!isComplete}
            >
              {isComplete ? "Close" : "Running..."}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
