import "./App.css";
import UserRegistration from "./components/user-registration/UserRegistration.jsx";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./components/home/HomePage.jsx";
import UserLogin from "./components/user-login/UserLogin.jsx";
import PechaNavbar from "./components/navbar/PechaNavbar.jsx";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <PechaNavbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/texts" element={<HomePage />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/login" element={<UserLogin />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
