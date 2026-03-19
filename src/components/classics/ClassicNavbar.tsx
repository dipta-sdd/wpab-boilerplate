import { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { __ } from "@wordpress/i18n";

interface MenuLink {
  label: string;
  path: string;
}

const ClassicNavbar: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const menus: MenuLink[] = [
    {
      label: __("Dashboard", "optionbay"),
      path: "/",
    },
    {
      label: __("Option Groups", "optionbay"),
      path: "/option-groups",
    },
    {
      label: __("Logs", "optionbay"),
      path: "/logs",
    },
    {
      label: __("Settings", "optionbay"),
      path: "/settings",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="optionbay-flex optionbay-items-center optionbay-gap-6 optionbay-border-b optionbay-border-gray-200 optionbay-mb-8 optionbay-ignore-preflight optionbay-p-x-page-default optionbay-bg-white">
      {menus.map((menu) => (
        <a
          key={menu.path}
          href={`#${menu.path}`}
          className={`
            optionbay-pb-3 optionbay-text-[14px] optionbay-transition-all optionbay-no-underline optionbay-relative focus:optionbay-outline-none
            focus:optionbay-border-t-0 focus:optionbay-border-l-0 focus:optionbay-border-r-0 focus:optionbay-shadow-none
            ${
              isActive(menu.path)
                ? "optionbay-text-gray-900 optionbay-font-bold"
                : "optionbay-text-gray-600 optionbay-font-normal hover:optionbay-text-[#2271b1]"
            }
          `}
          onClick={(e) => {
            e.preventDefault();
            navigate(menu.path);
          }}
        >
          {menu.label}
          {isActive(menu.path) && (
            <div className="optionbay-absolute optionbay-bottom-[-1px] optionbay-left-0 optionbay-w-full optionbay-h-[3px] optionbay-bg-[#2271b1]" />
          )}
        </a>
      ))}
    </nav>
  );
};

export default ClassicNavbar;
