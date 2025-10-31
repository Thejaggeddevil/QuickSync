import React, { useEffect, useState } from "react";
import { api } from "@/lib/api.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Deployments() {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await api.getDeployments();
        if (mounted) setItems(Array.isArray(data) ? data : data?.items || []);
      } catch (e) {
        setError(e.message || "Failed to load deployments");
        toast({ title: "Failed to load deployments", description: e.message, variant: "destructive" });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">Loading deployments...</CardContent>
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

  const statusBadge = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("success")) return <Badge className="bg-green-600/30 text-green-300">Success</Badge>;
    if (s.includes("fail")) return <Badge className="bg-red-600/30 text-red-300">Failed</Badge>;
    return <Badge className="bg-yellow-600/30 text-yellow-300">In Progress</Badge>;
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="text-muted-foreground">No deployments found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Project</th>
                    <th className="py-2 pr-4">URL</th>
                    <th className="py-2 pr-4">Environment</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Commit</th>
                    <th className="py-2 pr-4">Timestamp</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((d, idx) => (
                    <motion.tr
                      key={d.id || idx}
                      className="border-t border-border/30"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.03 }}
                    >
                      <td className="py-2 pr-4">{d.project || d.projectName || "—"}</td>
                      <td className="py-2 pr-4">
                        {d.url ? (
                          <a href={d.url} target="_blank" rel="noreferrer" className="text-neon-blue underline">
                            {d.url}
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 pr-4">{d.environment || "—"}</td>
                      <td className="py-2 pr-4">{statusBadge(d.status)}</td>
                      <td className="py-2 pr-4">{d.commitId || d.commit || "—"}</td>
                      <td className="py-2 pr-4">{d.timestamp || d.createdAt || "—"}</td>
                      <td className="py-2 pr-4">
                        {d.url && (
                          <Button size="sm" onClick={() => window.open(d.url, "_blank")}>View</Button>
                        )}
                        {d.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="ml-2"
                            onClick={async () => {
                              try {
                                await api.retryDeployment(d.id);
                                toast({ title: "Retry triggered" });
                              } catch (e) {
                                toast({ title: "Retry failed", description: e.message, variant: "destructive" });
                              }
                            }}
                          >
                            Retry
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


