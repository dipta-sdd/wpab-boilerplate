import { FC, ReactNode } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import ClassicNavbar from "./ClassicNavbar";
import { useWpabStore } from "../../store/wpabStore";

const ClassicLayout: FC = () => {
  const store = useWpabStore();
  const location = useLocation();

  // Determine page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return __("Dashboard", "wpab-boilerplate");
    if (path === "/logs") return __("Logs", "wpab-boilerplate");
    if (path === "/components") return __("Modern Components Showcase", "wpab-boilerplate");
    if (path === "/components-classic") return __("Classic Components Showcase", "wpab-boilerplate");
    return store.pluginData?.plugin_name || __("WPAB Boilerplate", "wpab-boilerplate");
  };

  return (
    <div className="wrap wpab-p-6">
      <h1 className="wpab-ignore-preflight wpab-mb-4">{getPageTitle()}</h1>
      <ClassicNavbar />
      <div className="wpab-mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ClassicLayout;
