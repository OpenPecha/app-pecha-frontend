import React from "react";
import "./UserProfile.scss";
import { useAuth0 } from "@auth0/auth0-react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PechaUserProfile from "./pecha-user-profile/PechaUserProfile.jsx";

function UserProfile() {
    const {user, isAuthenticated} = useAuth0();
    const {t} = useTranslation();

    console.log(user);

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
        <div className="user-profile">
            {
                isAuthenticated ? renderProfileViaSocialLogin() : renderProfileViaPechaLogin()
            }
        </div>
    );
}

export default UserProfile;
