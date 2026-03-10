import Dashboard from "./pages/Dashboard";
import { HashRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/common/AppLayout";
import { WpabProvider } from "./store/wpabStore";
import { ToastProvider } from "./store/toast/use-toast";
import Logs from "./pages/Logs";
import Components from "./pages/Components";
import ClassicShowcase from "./pages/ClassicShowcase";

function App() {
  return (
    <WpabProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="logs" element={<Logs />} />
              <Route path="components" element={<Components />} />
              <Route path="components-classic" element={<ClassicShowcase />} />
              {/* Add your routes here */}
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </WpabProvider>
  );
}

export default App;

