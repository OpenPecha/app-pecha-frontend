import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './components/i18next/i18n'
import {Auth0Provider} from "@auth0/auth0-react";


createRoot(document.getElementById('root')).render(
    <Auth0Provider
        domain="dev-ovhxzolnkcvpsbjb.us.auth0.com"
        clientId="w35y5jZBshmBFXJi2q3YLjzZzRSn53PJ"
        authorizationParams={{
            redirect_uri: window.location.origin
        }}
    >
    <App />
    </Auth0Provider>,
)
