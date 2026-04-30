import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SettingsProvider } from "./contexts/SettingsContext.tsx";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </BrowserRouter>
)