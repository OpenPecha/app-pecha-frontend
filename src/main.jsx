import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/i18next/i18n'
import {BrowserRouter as Router} from "react-router-dom";
import {Auth0ProviderWithNavigate} from "./components/config/Auth0ProviderWithNavigate.jsx";


createRoot(document.getElementById('root')).render(
    <Router>
        <Auth0ProviderWithNavigate>
            <App/>
        </Auth0ProviderWithNavigate>
    </Router>
)
