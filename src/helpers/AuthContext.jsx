import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const login = (accessToken, refreshToken) => {
        sessionStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        setIsLoggedIn(true);
    };

    const logout = () => {
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
