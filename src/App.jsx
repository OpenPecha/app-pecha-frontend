import "./App.css";
import UserRegistration from "./components/user-registration/UserRegistration.jsx";
import { Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "./components/home/HomePage.jsx";
import UserLogin from "./components/user-login/UserLogin.jsx";
import NavigationBar from "./components/navbar/NavigationBar.jsx";
import { useMutation } from "react-query";
import { PechaAuthProvider } from "./components/config/AuthContext.jsx";
import { AuthenticationGuard } from "./components/config/AuthenticationGuard.jsx";
import UserProfile from "./components/user-profile/UserProfile.jsx";
import { useEffect } from "react";
import axiosInstance from "./components/config/axios-config.js";

function App() {
    const navigate = useNavigate();

    const loginMutation = useMutation(
        async (refreshToken) => {
            const response = await axiosInstance.post(
                "/api/v1/auth/refresh-Token",
                { 'token': refreshToken }
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                sessionStorage.setItem("accessToken", data.access_token);
                console.log("Login successful");
            },
            onError: () => {
                navigate("/login")
            },
        }
    );

    useEffect(() => {
        const performLogin = () => {
            const accessToken = sessionStorage.getItem("accessToken");
            loginMutation.mutate(accessToken);
        };
        const loginMethod = localStorage.getItem("loggedInVia") || 'okta';
        if (loginMethod === "okta") {

        } else if (loginMethod === "pecha") {
            performLogin();
        }
    }, []);

    return (
        <PechaAuthProvider>
                <NavigationBar/>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/texts" element={ <HomePage /> } />
                    <Route path="/profile" element={<AuthenticationGuard component={UserProfile}/>}/>
                    <Route path="/register" element={<UserRegistration/>}/>
                    <Route path="/login" element={<UserLogin/>}/>
                </Routes>
        </PechaAuthProvider>
    );
}

export default App;
