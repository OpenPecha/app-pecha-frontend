import "./App.css";
import UserRegistration from "./components/user-registration/UserRegistration.jsx";
import {Route, Routes} from "react-router-dom";
import HomePage from "./components/home/HomePage.jsx";
import UserLogin from "./components/user-login/UserLogin.jsx";
import NavigationBar from "./components/navbar/NavigationBar.jsx";
import {QueryClient, QueryClientProvider} from "react-query";
import {PechaAuthProvider} from "./components/config/AuthContext.jsx";
import {AuthenticationGuard} from "./components/config/AuthGuard.jsx";

const queryClient = new QueryClient();

function App() {
    return (
        <PechaAuthProvider>
            <QueryClientProvider client={queryClient}>
                <NavigationBar/>
                <Routes>
                    <Route path="/" element={<HomePage/>}/>
                    <Route path="/texts" element={<AuthenticationGuard component={HomePage}/>}/>
                    <Route path="/register" element={<UserRegistration/>}/>
                    <Route path="/login" element={<UserLogin/>}/>
                </Routes>
            </QueryClientProvider>
        </PechaAuthProvider>
    );
}

export default App;
