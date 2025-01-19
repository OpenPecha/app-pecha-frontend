import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";
import { useAuth } from "./AuthContext.jsx";
import { Navigate } from "react-router-dom";
import { LOGGED_IN_VIA } from "../utils/Constants.js";
import PropTypes from "prop-types";

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
        return isLoggedIn || localStorage.getItem(LOGGED_IN_VIA) ? <Component /> : <Navigate to="/login" />;
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

AuthenticationGuard.propTypes = {
    component: PropTypes.func,
};
