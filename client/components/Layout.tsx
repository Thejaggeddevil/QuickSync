import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export default function Layout({
  children,
  currentView,
  onViewChange,
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [baseChain, setBaseChain] = useState("Ethereum");

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "config", label: "Config Editor", icon: Settings },
    { id: "plugins", label: "Plugins", icon: Zap },
    { id: "simulation", label: "Simulation", icon: Code2 },
    { id: "analytics", label: "Analytics", icon: Network },
  ];

  const chains = ["Ethereum", "Polygon", "Base"];

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center">
              <div className="text-xl font-bold text-white">⚡</div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
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
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-blue/40 text-neon-blue shadow-glow"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border border-transparent"
                  )}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent border-t border-border/30">
            <Button
              variant="outline"
              className="w-full gap-2 h-9 text-xs"
              onClick={() => onViewChange("docs")}
            >
              <Book size={16} />
              Docs & Tutorials
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 min-h-[calc(100vh-4rem)] overflow-auto",
            "bg-gradient-to-br from-background via-background to-background"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
