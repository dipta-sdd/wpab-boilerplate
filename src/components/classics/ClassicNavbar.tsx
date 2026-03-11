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
      label: __("Dashboard", "wpab-boilerplate"),
      path: "/",
    },
    {
      label: __("Logs", "wpab-boilerplate"),
      path: "/logs",
    },
    {
      label: __("Components", "wpab-boilerplate"),
      path: "/components",
    },
    {
      label: __("Components (Classic)", "wpab-boilerplate"),
      path: "/components-classic",
    },
  ];

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="nav-tab-wrapper wpab-mb-6 wpab-ignore-preflight">
      {menus.map((menu) => (
        <a
          key={menu.path}
          href={`#${menu.path}`}
          className={`nav-tab ${isActive(menu.path) ? "nav-tab-active" : ""}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(menu.path);
          }}
        >
          {menu.label}
        </a>
      ))}
    </nav>
  );
};

export default ClassicNavbar;
