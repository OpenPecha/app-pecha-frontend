import axios from "axios";

const axiosInstance = axios.create({});
axiosInstance.interceptors.request.use(
    (config) => {
        const token = window.location.href.includes("reset-password") ? sessionStorage.getItem("resetPasswordToken") : sessionStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${ token }`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error); 
    }
);

export default axiosInstance;
