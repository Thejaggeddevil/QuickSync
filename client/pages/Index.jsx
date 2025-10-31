import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout.jsx";
import Dashboard from "@/components/Dashboard.jsx";
import ConfigEditor from "@/components/ConfigEditor.jsx";
import Plugins from "@/components/Plugins.jsx";
import Simulation from "@/components/Simulation.jsx";
import Analytics from "@/components/Analytics.jsx";
import ProofViewer from "@/components/ProofViewer.jsx";
import Docs from "@/components/Docs.jsx";
import NotFound from "./NotFound";
import Deployments from "@/components/Deployments.jsx";
import Scripts from "@/components/Scripts.jsx";

export default function Index() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/config" element={<ConfigEditor />} />
        <Route path="/plugins" element={<Plugins />} />
        <Route path="/simulation" element={<Simulation />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/proof-viewer" element={<ProofViewer />} />
        <Route path="/deployments" element={<Deployments />} />
        <Route path="/scripts" element={<Scripts />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
