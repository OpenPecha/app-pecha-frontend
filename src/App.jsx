import "./App.css";
import UserRegistration from "./components/user-registration/UserRegistration.jsx";
import { Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "./components/home/HomePage.jsx";
import UserLogin from "./components/user-login/UserLogin.jsx";
import NavigationBar from "./components/navbar/NavigationBar.jsx";
import { useMutation } from "react-query";
import { AuthenticationGuard } from "./config/AuthenticationGuard.jsx";
import ResetPassword from "./components/reset-password/ResetPassword.jsx";
import ForgotPassword from "./components/forgot-password/ForgotPassword.jsx";
import { useEffect, useState } from "react";
import axiosInstance from "./config/axios-config.js";
import { ACCESS_TOKEN, LOGGED_IN_VIA, REFRESH_TOKEN } from "./utils/Constants.js";
import { useAuth } from "./config/AuthContext.jsx";
import EditUserProfile from "./components/edit-user-profile/EditUserProfile.jsx";
import UserProfile from "./components/user-profile/UserProfile.jsx";

const tokenExpiryTime = import.meta.env.VITE_TOKEN_EXPIRY_TIME_SEC;

function App() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [intervalId, setIntervalId] = useState(null);

    const loginMutation = useMutation(
        async (refreshToken) => {
            const response = await axiosInstance.post(
                "/api/v1/auth/refresh-token",
                { 'token': refreshToken }
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                sessionStorage.setItem(ACCESS_TOKEN, data.access_token);
                login(data.access_token);
                if (!intervalId) {
                    startTokenRefreshCounter();
                }
            },
            onError: () => {
                navigate("/login")
            },
        }
    );

    const startTokenRefreshCounter = () => {
        const interval = setInterval(() => {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (refreshToken) {
                loginMutation.mutate(refreshToken);
            }
        }, tokenExpiryTime);
        setIntervalId(interval);
    }

    useEffect(() => {
        const loginMethod = localStorage.getItem(LOGGED_IN_VIA);
        if (loginMethod === "pecha") {
            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            if (refreshToken) {
                loginMutation.mutate(refreshToken);
            }
        }
    }, []);

    return (
        <>
            <NavigationBar />
            <Routes>
                <Route path="/" element={ <HomePage /> } />
                <Route path="/texts" element={ <HomePage /> } />
                <Route path="/profile" element={ <AuthenticationGuard component={ UserProfile } /> } />
                <Route path="/edit-profile" element={ <AuthenticationGuard component={ EditUserProfile } /> } />
                <Route path="/reset-password" element={ < ResetPassword /> } />
                <Route path="/forgot-password" element={ <ForgotPassword /> } />
                <Route path="/register" element={ <UserRegistration /> } />
                <Route path="/login" element={ <UserLogin /> } />
                <Route path="*" element={ <HomePage /> } />
            </Routes>
        </>
    );
}

export default App;
