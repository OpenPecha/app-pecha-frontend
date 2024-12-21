import axios from "axios";

const axiosInstance = axios.create({});
//todo - timer - access - 30min, refresh - 30d
axiosInstance.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("authToken");
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
