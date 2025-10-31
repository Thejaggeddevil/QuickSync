import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Copy, Download, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

const DEFAULT_CONFIGS = {
  "zerosync.config.json": {
    rollup: "mock-zk",
    baseChain: "ethereum",
    rpcUrl: "https://sepolia.infura.io/v3/<key>",
    proofEngine: "mock",
    batchSize: 10,
    sequencerAddress: "0x742d35Cc6634C0532925a3b844Bc0e4f0f7cEF8c",
  },
  "plugin-config.json": {
    plugins: ["polygon-cdk", "scroll", "starknet"],
    enableAutoUpdate: true,
    updateInterval: 3600,
    logLevel: "info",
  },
};

export default function ConfigEditor() {
  const [selectedConfig, setSelectedConfig] = useState("zerosync.config.json");
  const [configs, setConfigs] = useState(DEFAULT_CONFIGS);
  const [errors, setErrors] = useState([]);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { toast } = useToast();

  const currentConfig = configs[selectedConfig];
  const currentConfigString = JSON.stringify(currentConfig, null, 2);

  const handleConfigChange = (newValue) => {
    try {
      const parsed = JSON.parse(newValue);
      setConfigs({
        ...configs,
        [selectedConfig]: parsed,
      });
      setErrors([]);
    } catch (e) {
      setErrors([e.message]);
    }
  };

  const handleValidate = () => {
    try {
      JSON.parse(currentConfigString);
      setErrors([]);
      toast({
        title: "Validation Successful",
        description: "Configuration is valid JSON",
        duration: 2000,
      });
    } catch (e) {
      setErrors([e.message]);
    }
  };

  const handleExport = () => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:application/json;charset=utf-8,${encodeURIComponent(currentConfigString)}`
    );
    element.setAttribute("download", selectedConfig);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Config Exported",
      description: `${selectedConfig} downloaded successfully`,
      duration: 2000,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentConfigString);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
    toast({
      title: "Copied",
      description: "Configuration copied to clipboard",
      duration: 1500,
    });
  };

  const handleSave = () => {
    toast({
      title: "Configuration Saved",
      description: `${selectedConfig} saved successfully`,
      duration: 2000,
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold">Config Editor</h2>
        <p className="text-muted-foreground">
          Edit and manage rollup configuration files
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Config List */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileJson size={18} />
                Configs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.keys(DEFAULT_CONFIGS).map((config) => (
                <button
                  key={config}
                  onClick={() => setSelectedConfig(config)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-all duration-200 text-sm border",
                    selectedConfig === config
                      ? "bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border-neon-blue/40 text-neon-blue"
                      : "bg-secondary/30 border-border/30 text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <p className="font-medium">{config.split(".")[0]}</p>
                  <p className="text-xs opacity-70">Config file</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedConfig}</CardTitle>
                  <CardDescription>
                    JSON configuration for {selectedConfig.split(".")[0]}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Editor */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Configuration JSON
                </label>
                <div className="bg-gradient-to-br from-background to-background/50 border border-border/40 rounded-lg overflow-hidden">
                  <textarea
                    value={currentConfigString}
                    onChange={(e) => handleConfigChange(e.target.value)}
                    className="w-full h-96 p-4 bg-transparent text-sm font-mono text-neon-cyan resize-none focus:outline-none focus:ring-0 placeholder-muted-foreground/50"
                    placeholder="Enter JSON configuration"
                  />
                </div>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg space-y-2">
                  {errors.map((error, idx) => (
                    <div key={idx} className="flex gap-2 text-sm text-destructive">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Success State */}
              {errors.length === 0 && currentConfigString && (
                <div className="p-4 bg-neon-cyan/10 border border-neon-cyan/30 rounded-lg flex gap-2 text-sm text-neon-cyan">
                  <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Configuration is valid</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-border/30">
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-neon-blue to-neon-cyan gap-2"
                >
                  Save Config
                </Button>
                <Button
                  onClick={handleValidate}
                  variant="outline"
                  className="gap-2"
                >
                  <CheckCircle2 size={16} />
                  Validate
                </Button>
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className={cn(
                    "gap-2 transition-all",
                    copyFeedback && "bg-neon-cyan/20 border-neon-cyan/50"
                  )}
                >
                  <Copy size={16} />
                  {copyFeedback ? "Copied!" : "Copy"}
                </Button>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="gap-2"
                >
                  <Download size={16} />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Config Info */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Configuration Properties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(currentConfig).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/30"
                  >
                    <div className="space-y-1">
                      <p className="font-mono text-sm text-neon-blue">{key}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeof value === "object" ? "array/object" : typeof value}
                      </p>
                    </div>
                    <p className="font-mono text-sm text-neon-cyan text-right">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
