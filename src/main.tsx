import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { analytics } from "./lib/analytics";

// Inicializar Google Analytics
analytics.init({
  gaId: 'G-VEYHZYGFCF',
  gtmId: 'GTM-KH8ZDRGN',
  enabled: true
});

// Limpa localStorage para garantir dados corretos
localStorage.removeItem('site-config');
localStorage.removeItem('config-version');
localStorage.setItem('config-version', '2.0');

createRoot(document.getElementById("root")!).render(<App />);
