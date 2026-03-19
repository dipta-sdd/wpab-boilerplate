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
    if (path === "/option-groups/new")
      return __("New Option Group", "optionbay");
    if (path.startsWith("/option-groups/"))
      return __("Edit Option Group", "optionbay");
    if (path === "/option-groups") return __("Option Groups", "optionbay");
    if (path === "/components")
      return __("Modern Components Showcase", "optionbay");
    if (path === "/components-classic")
      return __("Classic Components Showcase", "optionbay");
    if (path === "/settings") return __("Settings", "optionbay");
    return store.pluginData?.plugin_name || __("OptionBay", "optionbay");
  };

  return (
    <div className="">
      <h1 className="optionbay-ignore-preflight optionbay-font-[600] optionbay-text-[16px] optionbay-p-x-page-default optionbay-bg-white optionbay-m-0 optionbay-py-[18px]">
        {getPageTitle()}
      </h1>
      <ClassicNavbar />
      <div className="optionbay-mt-2 optionbay-p-x-page-default">
        <Outlet />
      </div>
    </div>
  );
};

export default ClassicLayout;
