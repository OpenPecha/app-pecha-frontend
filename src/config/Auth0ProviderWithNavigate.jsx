import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { LOGGED_IN_VIA } from "../utils/Constants.js";
import PropTypes from "prop-types";

export const Auth0ProviderWithNavigate = ({ children }) => {
    const navigate = useNavigate();

    const domain = import.meta.env.VITE_DOMAIN;
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const redirectUri =  window.location.origin

    const onRedirectCallback = (appState) => {
        localStorage.setItem(LOGGED_IN_VIA, "okta");
        navigate(appState?.returnTo || window.location.pathname);
    };

    if (!(domain && clientId && redirectUri)) {
        return null;
    }

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri,
            }}
            onRedirectCallback={onRedirectCallback}
            useRefreshTokens={ true }
            cacheLocation={ "localstorage" }
        >
            {children}
        </Auth0Provider>
    );
};

Auth0ProviderWithNavigate.propTypes = {
    children: PropTypes.any,
};
