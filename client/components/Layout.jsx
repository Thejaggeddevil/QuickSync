import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DeployModal from "@/components/DeployModal.jsx";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/lib/api.js";
import TargetCursor from "@/components/TargetCursor.jsx";
import {
  Home,
  Settings,
  Zap,
  Code2,
  Book,
  Menu,
  X,
  ChevronDown,
  Network,
  Terminal,
  Sun,
  Moon,
  Rocket,
} from "lucide-react";

export default function Layout({ children }) {
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [baseChain, setBaseChain] = useState("Ethereum");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [currentDeployId, setCurrentDeployId] = useState(null);
  const [currentDeployUrl, setCurrentDeployUrl] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    { id: "config", label: "Config Editor", icon: Settings, path: "/config" },
    { id: "plugins", label: "Plugins", icon: Zap, path: "/plugins" },
    { id: "simulation", label: "Simulation", icon: Code2, path: "/simulation" },
    { id: "analytics", label: "Analytics", icon: Network, path: "/analytics" },
    { id: "proof", label: "Proof Viewer", icon: Code2, path: "/proof-viewer" },
    { id: "deployments", label: "Deployments", icon: Network, path: "/deployments" },
    { id: "scripts", label: "Scripts", icon: Code2, path: "/scripts" },
  ];

  const chains = ["Ethereum", "Polygon", "Base"];

  const handleNavClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={cn("min-h-screen", darkMode ? "dark" : "")}>
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border/30 backdrop-blur-md z-40 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <div className="text-xl font-bold text-primary-foreground">⚡</div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-primary">
                  QuickSync
                </h1>
                <p className="text-xs text-muted-foreground">Playground</p>
              </div>
            </div>
          </div>

          {/* Top Right Status Bar */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-lg border border-border/30">
                <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></div>
                <span className="text-sm text-foreground">Active</span>
              </div>
            </div>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun size={18} className="text-neon-purple" />
              ) : (
                <Moon size={18} className="text-neon-blue" />
              )}
            </button>

            <button
              onClick={() => setTerminalOpen(!terminalOpen)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              title="Open Terminal"
            >
              <Terminal size={18} className="text-neon-purple" />
            </button>

            <Button
              onClick={async () => {
                try {
                  setDeploying(true);
                  setDeployModalOpen(true);
                  setCurrentDeployId(null);
                  setCurrentDeployUrl("");
                  const res = await api.postDeploy();
                  const id = res?.id || res?.deploymentId || res?.deployId;
                  const url = res?.url || res?.deploymentUrl || res?.link;
                  if (id) setCurrentDeployId(id);
                  if (url) setCurrentDeployUrl(url);
                  toast({ title: "Deployment started", description: id ? `ID: ${id}` : "" });
                } catch (e) {
                  toast({ title: "Deployment failed", description: e.message, variant: "destructive" });
                  setDeployModalOpen(false);
                } finally {
                  setDeploying(false);
                }
              }}
              disabled={deploying}
              className="bg-primary text-primary-foreground gap-2 h-9 text-sm"
            >
              <Rocket size={16} />
              <span className="hidden sm:inline">{deploying ? "Deploying..." : "Deploy"}</span>
            </Button>

            <div className="relative group">
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9"
                onClick={() => {
                  const newChain =
                    chains[(chains.indexOf(baseChain) + 1) % chains.length];
                  setBaseChain(newChain);
                }}
              >
                <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
                <span className="text-sm">{baseChain}</span>
                <ChevronDown size={16} />
              </Button>
              <div className="absolute right-0 mt-2 w-32 bg-card border border-border/30 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                {chains.map((chain) => (
                  <button
                    key={chain}
                    onClick={() => {
                      setBaseChain(chain);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {chain}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="flex pt-16">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border/30 backdrop-blur-sm transition-all duration-300 z-30 lg:relative lg:translate-x-0",
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <nav className="p-4 space-y-2 h-full overflow-y-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                      active
                        ? "bg-primary/20 border border-primary text-primary shadow-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                    )}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}

              {/* Docs Link at Bottom */}
              <div className="mt-8 pt-4 border-t border-border/30">
                <button
                  onClick={() => navigate("/docs")}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive("/docs")
                      ? "bg-primary/20 border border-primary text-primary shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                  )}
                >
                  <Book size={18} />
                  <span className="text-sm font-medium">Docs & Tutorials</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main
            className={cn(
              "flex-1 min-h-[calc(100vh-4rem)] overflow-auto",
              "bg-background"
            )}
          >
            {children}
          </main>
        </div>

        {/* Floating Terminal */}
        {terminalOpen && (
          <div className="fixed bottom-6 right-6 w-96 bg-card border border-neon-blue/30 rounded-lg shadow-2xl backdrop-blur-md z-50 animate-slide-in max-h-80">
            <div className="flex items-center justify-between p-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Terminal size={18} className="text-neon-cyan" />
                <span className="text-sm font-mono text-neon-cyan">zerosync@playground:~$</span>
              </div>
              <button
                onClick={() => setTerminalOpen(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto bg-background/50 font-mono text-xs text-neon-cyan max-h-64">
              <div className="text-muted-foreground">
                $ <span className="text-neon-cyan">zerosync</span> init myrollup
              </div>
              <div className="text-green-400">
                ✓ Project initialized at ./myrollup
              </div>
              <div className="text-muted-foreground">$ <span className="text-neon-cyan">cd</span> myrollup</div>
              <div className="text-muted-foreground">
                $ <span className="text-neon-cyan">zerosync</span> simulate
              </div>
              <div className="text-green-400">
                ✓ Simulation started. Running 42 transactions...
              </div>
              <div className="text-green-400">
                ✓ Proof generated in 3.2s
              </div>
              <div className="text-muted-foreground">
                $ <span className="text-neon-cyan">zerosync</span> deploy --chain sepolia
              </div>
              <div className="text-neon-blue">
                ⟳ Deploying to Sepolia testnet...
              </div>
            </div>
            <div className="p-3 border-t border-border/30 bg-background/30">
              <div className="text-xs text-muted-foreground">
                Tip: Use <code className="text-neon-cyan">zerosync --help</code> for more commands
              </div>
            </div>
          </div>
        )}
        {/* Global custom cursor - targets cards, buttons, tabs, and explicit markers */}
        <TargetCursor
          hideDefaultCursor={true}
          targetSelector={
            'a, button, [role="button"], [class*="rounded-lg"][class*="border"], [data-cursor-target], .cursor-target'
          }
          spinDuration={4}
        />
        {deployModalOpen && (
          <DeployModal
            isOpen={deployModalOpen}
            onClose={() => setDeployModalOpen(false)}
            deployId={currentDeployId}
            deployedUrl={currentDeployUrl}
          />
        )}
      </div>
    </div>
  );
}
