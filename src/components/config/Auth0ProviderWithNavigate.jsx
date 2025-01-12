import { Auth0Provider } from "@auth0/auth0-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { LOGGED_IN_VIA } from "../../utils/Constants.js";

export const Auth0ProviderWithNavigate = ({ children }) => {
    const navigate = useNavigate();

    const domain = "dev-ovhxzolnkcvpsbjb.us.auth0.com"
    const clientId = "w35y5jZBshmBFXJi2q3YLjzZzRSn53PJ"
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
