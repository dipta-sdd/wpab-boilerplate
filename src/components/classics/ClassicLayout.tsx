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
    if (path === "/") return __("Dashboard", "optionbay");
    if (path === "/logs") return __("Logs", "optionbay");
    if (path === "/option-groups/new") return __("New Option Group", "optionbay");
    if (path.startsWith("/option-groups/")) return __("Edit Option Group", "optionbay");
    if (path === "/option-groups") return __("Option Groups", "optionbay");
    if (path === "/components") return __("Modern Components Showcase", "optionbay");
    if (path === "/components-classic") return __("Classic Components Showcase", "optionbay");
    if (path === "/settings") return __("Settings", "optionbay");
    return store.pluginData?.plugin_name || __("OptionBay", "optionbay");
  };

  return (
    <div className="">
      <h1 className="wpab-ignore-preflight wpab-font-[600] wpab-text-[16px] wpab-p-x-page-default wpab-bg-white wpab-m-0 wpab-py-[18px]">
        {getPageTitle()}
      </h1>
      <ClassicNavbar />
      <div className="wpab-mt-2 wpab-p-x-page-default">
        <Outlet />
      </div>
    </div>
  );
};

export default ClassicLayout;
