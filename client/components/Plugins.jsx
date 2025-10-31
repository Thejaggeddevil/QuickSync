import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const PLUGINS = [
  {
    name: "Polygon CDK",
    description: "Full-featured rollup framework for Polygon ecosystem",
    version: "2.1.0",
    compatibility: "EVM",
    installed: true,
    glowColor: "from-violet-500/20 to-violet-600/20 border-violet-500/30",
  },
  {
    name: "zkSync ZK Stack",
    description: "zkSync's modular rollup construction kit",
    version: "1.8.3",
    compatibility: "EVM",
    installed: true,
    glowColor: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  },
  {
    name: "Optimism Orbit",
    description: "Optimism's layer-2 scaling solution",
    version: "3.0.1",
    compatibility: "EVM",
    installed: false,
    glowColor: "from-red-500/20 to-red-600/20 border-red-500/30",
  },
  {
    name: "Scroll",
    description: "Ethereum's native scaling solution with zero-knowledge proofs",
    version: "1.2.0",
    compatibility: "EVM",
    installed: false,
    glowColor: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30",
  },
  {
    name: "StarkNet",
    description: "STARK-based rollup framework (coming soon)",
    version: "0.1.0",
    compatibility: "Non-EVM",
    installed: false,
    comingSoon: true,
    glowColor: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
  },
];

export default function Plugins() {
  const [showModal, setShowModal] = useState(false);
  const [plugins, setPlugins] = useState(PLUGINS);
  const { toast } = useToast();

  const handleInstall = (pluginName) => {
    setPlugins(
      plugins.map((p) =>
        p.name === pluginName ? { ...p, installed: true } : p
      )
    );
    toast({
      title: "Plugin Installed",
      description: `${pluginName} has been installed successfully`,
      duration: 3000,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">QuickSync Plugins</h2>
          <p className="text-muted-foreground">
            Install and manage rollup framework plugins
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-neon-blue to-neon-purple gap-2 hidden md:flex"
        >
          <PlusCircle size={16} />
          Install Custom Plugin
        </Button>
      </div>

      {/* Mobile Install Button */}
      <div className="md:hidden">
        <Button
          onClick={() => setShowModal(true)}
          className="w-full bg-gradient-to-r from-neon-blue to-neon-purple gap-2"
        >
          <PlusCircle size={16} />
          Install Custom Plugin
        </Button>
      </div>

      {/* Plugin Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {plugins.map((plugin, idx) => (
          <Card
            key={idx}
            className={cn(
              "bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm hover:border-border/60 transition-all duration-200",
              plugin.glowColor
            )}
          >
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h4 className="font-bold text-lg">{plugin.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {plugin.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">v{plugin.version}</span>
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

              {plugin.installed && (
                <div className="text-xs text-neon-cyan font-semibold flex items-center gap-1">
                  ✓ Installed
                </div>
              )}

              <Button
                className="w-full"
                variant={plugin.installed ? "outline" : "default"}
                disabled={plugin.comingSoon}
                onClick={() => !plugin.comingSoon && !plugin.installed && handleInstall(plugin.name)}
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

      {/* Custom Plugin Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Install Custom Plugin</CardTitle>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X size={18} />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plugin Name</label>
                <input
                  type="text"
                  placeholder="e.g., my-custom-rollup"
                  className="w-full px-4 py-2 bg-background border border-border/30 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-neon-blue"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Plugin JSON</label>
                <div className="border-2 border-dashed border-border/50 rounded-lg p-6 text-center cursor-pointer hover:border-neon-blue/50 transition-colors">
                  <p className="text-sm text-muted-foreground">
                    Drag and drop or click to upload
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-border/30">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-neon-blue to-neon-cyan">
                  Install
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
