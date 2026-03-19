import Dashboard from "./pages/Dashboard";
import { HashRouter, Routes, Route } from "react-router-dom";
import { WpabProvider } from "./store/wpabStore";
import { ToastProvider } from "./store/toast/use-toast";
import Logs from "./pages/Logs";
import Components from "./pages/Components";
import ClassicShowcase from "./pages/ClassicShowcase";
import Settings from "./pages/Settings";
import AddonList from "./pages/AddonList";
import AddonBuilder from "./pages/AddonBuilder";
import { ToastContainer } from "./components/common/ToastContainer";
import { useMenuSync } from "./utils/useMenuSync";
import { ClassicLayout } from "./components/classics";
// import AppLayout from "./components/common/AppLayout"; // Keep modern layout for future use

function App() {
  return (
    <WpabProvider>
      <ToastProvider>
        <ToastContainer />
        <HashRouter>
          <MenuSyncProvider>
            <Routes>
              {/* 
                BOILERPLATE NOTE: 
                - Use <ClassicLayout /> for native WordPress/WooCommerce aesthetics.
                - Use <AppLayout /> (from components/common) for modern, custom dashboard aesthetics.
              */}
              <Route element={<ClassicLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="logs" element={<Logs />} />
                <Route path="components" element={<Components />} />
                <Route
                  path="components-classic"
                  element={<ClassicShowcase />}
                />
                <Route path="settings" element={<Settings />} />
                <Route path="option-groups" element={<AddonList />} />
                <Route path="option-groups/new" element={<AddonBuilder />} />
                <Route path="option-groups/:id" element={<AddonBuilder />} />
                {/* Add your routes here */}
              </Route>
            </Routes>
          </MenuSyncProvider>
        </HashRouter>
      </ToastProvider>
    </WpabProvider>
  );
}

export default App;

const MenuSyncProvider = ({ children }: { children: React.ReactNode }) => {
  useMenuSync();
  return <>{children}</>;
};
