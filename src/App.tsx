import Dashboard from "./pages/Dashboard";
import { HashRouter, Route, Routes } from "react-router-dom";
import AppLayout from "./components/common/AppLayout";
import { WpabProvider } from "./store/wpabStore";
import { ToastProvider } from "./store/toast/use-toast";
import Logs from "./pages/Logs";

function App() {
  return (
    <WpabProvider>
      <ToastProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="logs" element={<Logs />} />
              {/* Add your routes here */}
            </Route>
          </Routes>
        </HashRouter>
      </ToastProvider>
    </WpabProvider>
  );
}

export default App;
