import React, { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
// Prism is loaded dynamically to avoid bundling issues and keep initial bundle smaller

const LANGS = [
  { value: "js", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "shell", label: "Shell" },
];

const LIBRARY = [
  {
    id: "deploy-mock-rollup",
    title: "Deploy Mock Rollup",
    description: "Uses ZeroSync CLI to deploy a mock L2 to a testnet.",
    language: "bash",
    code: "" +
      "# Deploy a mock rollup to Sepolia\n" +
      "npx zerosync init myrollup\n" +
      "cd myrollup\n" +
      "npx zerosync deploy --chain sepolia --optimistic\n",
    tags: ["deploy", "optimistic"],
  },
  {
    id: "verify-proof",
    title: "Verify Proof",
    description: "Verifies a generated zk proof using the verifier contract.",
    language: "javascript",
    code: "" +
      "import { ethers } from 'ethers';\n" +
      "const abi = ['function verify(bytes proof, bytes32 publicInput) view returns (bool)'];\n" +
      "const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);\n" +
      "const verifier = new ethers.Contract(process.env.VERIFIER_ADDR, abi, provider);\n" +
      "const ok = await verifier.verify(proofBytes, publicInputHash);\n" +
      "console.log('Verified:', ok);\n",
    tags: ["zk", "proof"],
  },
  {
    id: "batch-transactions",
    title: "Batch Transactions",
    description: "Submits a batch of L2 transactions to the sequencer.",
    language: "javascript",
    code: "" +
      "import { JsonRpcProvider, Wallet } from 'ethers';\n" +
      "const provider = new JsonRpcProvider(process.env.L2_RPC);\n" +
      "const wallet = new Wallet(process.env.PRIVATE_KEY, provider);\n" +
      "const txs = [/* ... */];\n" +
      "for (const tx of txs) {\n" +
      "  const r = await wallet.sendTransaction(tx);\n" +
      "  await r.wait();\n" +
      "}\n",
    tags: ["l2", "batch"],
  },
  {
    id: "generate-zk-proof",
    title: "Generate zkSNARK Proof",
    description: "Runs proof generation using a local prover binary.",
    language: "bash",
    code: "" +
      "# Generate proof\n" +
      "./prover --circuit rollup.r1cs --witness witness.wtns --pk proving_key.pk --out proof.bin\n",
    tags: ["zk", "prover"],
  },
  {
    id: "monitor-l2-status",
    title: "Monitor L2 Status",
    description: "Polls L2 node metrics and prints health status.",
    language: "javascript",
    code: "" +
      "const url = process.env.L2_METRICS;\n" +
      "setInterval(async () => {\n" +
      "  const r = await fetch(url);\n" +
      "  const m = await r.json();\n" +
      "  console.log('[L2]', m.sync_status, 'TPS', m.tps);\n" +
      "}, 5000);\n",
    tags: ["monitor", "metrics"],
  },
  {
    id: "bridge-deposit",
    title: "Bridge Deposit (L1→L2)",
    description: "Sends a deposit through the canonical bridge.",
    language: "typescript",
    code: "" +
      "import { Bridge } from '@zerosync/bridge';\n" +
      "const bridge = new Bridge({ l1Rpc: process.env.L1_RPC, l2Rpc: process.env.L2_RPC });\n" +
      "await bridge.deposit({ to: '0x...', amount: '0.1' });\n",
    tags: ["bridge", "l1", "l2"],
  },
];

export default function Scripts() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", language: "js", code: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [query, setQuery] = useState("");
  const codeBlocksRef = useRef(null);

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [items]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getScripts();
        if (mounted) setItems(Array.isArray(data) ? data : data?.items || []);
      } catch (e) {
        setError(e.message || "Failed to load scripts");
        toast({ title: "Failed to load scripts", description: e.message, variant: "destructive" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const Prism = (await import("prismjs")).default || (await import("prismjs"));
        await Promise.all([
          import("prismjs/components/prism-javascript"),
          import("prismjs/components/prism-typescript"),
          import("prismjs/components/prism-python"),
          import("prismjs/components/prism-bash"),
          import("prismjs/themes/prism-tomorrow.css"),
        ]);
        if (!cancelled) {
          const root = codeBlocksRef.current || document;
          // Some builds expose Prism as a module object; find highlightAllUnder (JS-safe, no TS cast)
          const highlighter = (Prism && Prism.highlightAllUnder) || (Prism && Prism.default && Prism.default.highlightAllUnder);
          if (typeof highlighter === "function") {
            highlighter.call(Prism, root);
          }
        }
      } catch {
        // no-op; highlighting is non-critical
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query]);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const created = await api.createScript(form);
      setItems((prev) => [created, ...prev]);
      setForm({ name: "", language: "js", code: "", description: "" });
      toast({ title: "Script created" });
    } catch (e) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(id, payload) {
    try {
      const updated = await api.updateScript(id, payload);
      setItems((prev) => prev.map((s) => (String(s.id) === String(id) ? { ...s, ...updated } : s)));
      toast({ title: "Script updated" });
    } catch (e) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteScript(id);
      setItems((prev) => prev.filter((s) => String(s.id) !== String(id)));
      toast({ title: "Script deleted" });
    } catch (e) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    }
  }

  function copyScript(code) {
    navigator.clipboard.writeText(code).then(
      () => toast({ title: "Copied to clipboard" }),
      () => toast({ title: "Copy failed", variant: "destructive" })
    );
  }

  const filteredLibrary = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LIBRARY;
    return LIBRARY.filter((s) =>
      s.title.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      (s.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">Loading scripts...</CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-destructive">{error}</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" ref={codeBlocksRef}>
      <TooltipProvider>
        <Card className="backdrop-blur-md border-neon-blue/30">
          <CardHeader>
            <CardTitle>Scripts Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <Input
                placeholder="Search scripts (deploy, zk, bridge, batch...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="md:max-w-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[48rem] overflow-auto pr-1">
              {filteredLibrary.map((s, idx) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  className="rounded-2xl border border-border/30 bg-card/60 shadow-glow p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{s.title}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => copyScript(s.code)}>Copy</Button>
                        </TooltipTrigger>
                        <TooltipContent>Copy script to clipboard</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  <pre className={`language-${s.language} mt-3 rounded-xl overflow-auto`}>
                    <code className={`language-${s.language}`}>{s.code}</code>
                  </pre>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>New Script</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
              <Select value={form.language} onValueChange={(v) => setForm((f) => ({ ...f, language: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Creating..." : "Create"}
              </Button>
            </div>
            <Input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
            <Textarea
              placeholder="Enter script code..."
              className="min-h-[140px] font-mono"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
            />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scripts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.length === 0 ? (
            <div className="text-muted-foreground">No scripts yet.</div>
          ) : (
            sorted.map((s) => (
              <div key={s.id} className="p-4 border border-border/30 rounded-lg bg-card/60">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.language?.toUpperCase() || "JS"} • {s.createdAt || "—"}
                    </div>
                    {s.description && (
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyScript(s.code || "")}>Copy</Button>
                    <Button variant="secondary" size="sm" onClick={() => handleUpdate(s.id, { name: s.name, language: s.language, code: s.code, description: s.description })}>Save</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(s.id)}>Delete</Button>
                  </div>
                </div>
                <Textarea
                  className="mt-3 font-mono"
                  value={s.code || ""}
                  onChange={(e) => setItems((prev) => prev.map((it) => (String(it.id) === String(s.id) ? { ...it, code: e.target.value } : it)))}
                />
                <Input
                  className="mt-2"
                  placeholder="Description"
                  value={s.description || ""}
                  onChange={(e) => setItems((prev) => prev.map((it) => (String(it.id) === String(s.id) ? { ...it, description: e.target.value } : it)))}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}


