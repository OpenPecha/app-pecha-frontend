import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/i18next/i18n'
import {BrowserRouter as Router} from "react-router-dom";
import {Auth0ProviderWithNavigate} from "./config/Auth0ProviderWithNavigate.jsx";
import {QueryClient, QueryClientProvider} from "react-query";
import {PechaAuthProvider} from "./config/AuthContext.jsx";

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <Router>
    <QueryClientProvider client={queryClient}>
      <Auth0ProviderWithNavigate>
        <PechaAuthProvider>
          <App/>
        </PechaAuthProvider>
      </Auth0ProviderWithNavigate>
    </QueryClientProvider>
  </Router>
)
