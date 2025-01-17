import React from "react";
import "./UserProfile.scss";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslation } from "react-i18next";
import PechaUserProfile from "./pecha-user-profile/PechaUserProfile.jsx";
import {useQuery} from "react-query";
import axiosInstance from "../config/axios-config.js";

function UserProfile() {
    const {user, isAuthenticated} = useAuth0();
    const {t} = useTranslation();
    const userInfo = useQuery("userInfo",async () => {
        return await axiosInstance.get("/api/v1/users/info");
    })
    console.log(userInfo)

    function renderProfileViaSocialLogin() {
        return (
            <PechaUserProfile userInfo ={user}/>
        )
    }

    function renderProfileViaPechaLogin() {
        return (
          <PechaUserProfile userInfo = {user}/>
        )
    }

    return (
        <div className="user-profile" data-testid="user-profile">
            {
                isAuthenticated ? renderProfileViaSocialLogin() : renderProfileViaPechaLogin()
            }
        </div>
    );
}

export default UserProfile;
