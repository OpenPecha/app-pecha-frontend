import axios from "axios";
import { ACCESS_TOKEN, RESET_PASSWORD, RESET_PASSWORD_TOKEN } from "../../utils/Constants.js";

const axiosInstance = axios.create({});
axiosInstance.interceptors.request.use(
    (config) => {
        const token = window.location.href.includes(RESET_PASSWORD) ? sessionStorage.getItem(RESET_PASSWORD_TOKEN) : sessionStorage.getItem(ACCESS_TOKEN);
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
