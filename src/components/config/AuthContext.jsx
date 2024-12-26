import React, { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ACCESS_TOKEN, LOGGED_IN_VIA, REFRESH_TOKEN } from "../../utils/Constants.js";

const AuthContext = createContext();

export const PechaAuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = (accessToken, refreshToken = null) => {
        sessionStorage.setItem(ACCESS_TOKEN, accessToken);
        if (refreshToken) {
            localStorage.setItem(REFRESH_TOKEN, refreshToken);
        }
        localStorage.setItem(LOGGED_IN_VIA, "pecha");
        setIsLoggedIn(true);
    };

    const logout = () => {
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsLoggedIn(false);
    };
    const contextValue = useMemo(() => ({ isLoggedIn, login, logout }), [isLoggedIn]);


    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

PechaAuthProvider.propTypes = {
    children: PropTypes.any,
};
