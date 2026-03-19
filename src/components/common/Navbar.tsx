import { useState, useEffect, FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";
import { useWpabStore } from "../../store/wpabStore";

interface MenuLink {
  label: string;
  path: string;
}

const Navbar: FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const store = useWpabStore();

  const menus: MenuLink[] = [
    {
      label: __("Dashboard", "optionbay"),
      path: "/",
    },
    // Add your menu items here
    {
      label: __("Logs", "optionbay"),
      path: "/logs",
    },
    {
      label: __("Components", "optionbay"),
      path: "/components",
    },
    {
      label: __("Components (Classic)", "optionbay"),
      path: "/components-classic",
    },
    // {
    //   label: __("Settings", "optionbay"),
    //   path: "/settings",
    // },
  ];

  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();

  useEffect(() => {
    const basePath = "/" + (currentPath.split("/")[1] || "");
    setActiveTab(basePath);
  }, [currentPath]);

  return (
    <>
      <div className="optionbay-bg-white optionbay-p-0 !optionbay-border-0 !optionbay-border-b !optionbay-border-gray-300 optionbay-z-50 optionbay-relative">
        <div className="optionbay-flex optionbay-px-[12px] optionbay-justify-between optionbay-items-center optionbay-flex-wrap md:optionbay-flex-nowrap optionbay-gap-[4px] optionbay-relative">
          <div className="optionbay-flex optionbay-items-center optionbay-gap-[4px] optionbay-py-[12px]">
            <span className="optionbay-font-[700] optionbay-text-[16px] optionbay-text-gray-900">
              {store.pluginData?.plugin_name || "OptionBay"}
            </span>
          </div>
          <div
            className={`optionbay-flex-1 md:optionbay-flex-none optionbay-flex-col md:optionbay-flex-row optionbay-justify-stretch md:optionbay-items-center optionbay-absolute md:optionbay-relative optionbay-top-[102%] md:optionbay-top-auto optionbay-left-0 optionbay-w-full md:optionbay-w-auto optionbay-gap-0 md:optionbay-gap-[6px] optionbay-bg-white !optionbay-border-0 ${
              isMobileMenuOpen
                ? "optionbay-flex"
                : "optionbay-hidden md:optionbay-flex"
            }`}
          >
            <nav className="optionbay-items-stretch md:optionbay-items-center optionbay-gap-0 optionbay-flex optionbay-flex-col md:optionbay-flex-row optionbay-w-full">
              {menus.map((menu) => (
                <span
                  key={menu.path}
                  className={`optionbay-text-default optionbay-font-[700]
                    optionbay-cursor-pointer optionbay-py-[8px] optionbay-px-[16px] optionbay-border-b md:optionbay-border-b-0 optionbay-border-gray-300 last:optionbay-border-gray-300 ${
                      activeTab === menu.path
                        ? "optionbay-text-blue-800 optionbay-bg-gray-100 optionbay-rounded-[0] md:optionbay-rounded-[8px]"
                        : "optionbay-text-gray-800 hover:optionbay-text-blue-800"
                    }`}
                  onClick={() => {
                    navigate(menu.path);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {menu.label}
                </span>
              ))}
            </nav>
          </div>
          <button
            className="optionbay-flex md:optionbay-hidden optionbay-items-center optionbay-gap-[2px] optionbay-text-gray-800 hover:optionbay-text-blue-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="optionbay-transition-all optionbay-duration-300 optionbay-ease-in-out"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <>
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 18L18 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              ) : (
                <>
                  <path
                    d="M3 12H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 6H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 18H21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          className="optionbay-fixed optionbay-top-0 optionbay-left-0 optionbay-w-full optionbay-h-full optionbay-bg-black optionbay-opacity-60 optionbay-z-40 md:optionbay-hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;
