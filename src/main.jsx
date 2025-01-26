import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/i18next/i18n'
import { BrowserRouter as Router } from "react-router-dom";
import { Auth0ProviderWithNavigate } from "./config/Auth0ProviderWithNavigate.jsx";
import { QueryClient, QueryClientProvider } from "react-query";
import { PechaAuthProvider } from "./config/AuthContext.jsx";
import { BackendFetch, DevTools, FormatSimple, Tolgee, TolgeeProvider } from "@tolgee/react";
import localeEn from "./i18n/en.json";
import localeBoIn from "./i18n/bo-IN.json";
import { LANGUAGE } from "./utils/Constants.js";

const queryClient = new QueryClient();
const defaultLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE || "bo-IN";
const tolgee = Tolgee()
  .use(DevTools())
  .use(FormatSimple())
  // replace with .use(FormatIcu()) for rendering plurals, formatted numbers, etc.
  .use(BackendFetch({
    prefix: "https://cdn.tolg.ee/300fa406912d362adee8a983f8f4682d/reactjs_json",
    fallbackOnFail: true
  }))
  .init({
    language: localStorage.getItem(LANGUAGE) || defaultLanguage,
    fallbackLanguage: 'en',
    staticData: {
      en: async () => localeEn,
      "bo-IN": async () => localeBoIn
    }
  });
createRoot(document.getElementById('root')).render(
  <Router>
    <QueryClientProvider client={ queryClient }>
      <TolgeeProvider tolgee={ tolgee } fallback={ "Loading..." }>
        <Auth0ProviderWithNavigate>
          <PechaAuthProvider>
            <App />
          </PechaAuthProvider>
        </Auth0ProviderWithNavigate>
      </TolgeeProvider>
    </QueryClientProvider>
  </Router>
)
