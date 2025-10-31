import { useState } from "react";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import ConfigEditor from "@/components/ConfigEditor";
import Workspace from "@/components/Workspace";

export default function Index() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "config":
        return <ConfigEditor />;
      case "plugins":
      case "simulation":
      case "analytics":
      case "proof":
      case "docs":
        return <Workspace />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
}
