import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import React from "react";
import { useAuth } from "./AuthContext.jsx";
import { Navigate } from "react-router-dom";

export const AuthenticationGuard = ({component}) => {
    const {isLoggedIn} = useAuth();
    const {isAuthenticated} = useAuth0();

    const ViaSocialLogin = withAuthenticationRequired(component, {
        onRedirecting: () => (
            <div className="page-layout">
                Loading... {/* TODO: Create a loading component, mostly a spinner using React suspense */}
            </div>
        ),
    });

    const ViaPechaLogin = () => {
        const Component = component;
        return isLoggedIn ? <Component /> : <Navigate to="/login" />;
    };

    return (
        <>
            {
                isAuthenticated
                    ? <ViaSocialLogin/>
                    : <ViaPechaLogin/>
            }
        </>
    );
};
