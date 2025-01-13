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
            <Card className="profile-card">
                <Card.Body>
                    <div className="profile-header">
                        <img src={user.picture} alt={`${user.name}'s profile`} className="profile-picture"/>
                        <h2>{user.given_name} {user.family_name}</h2>
                        <h5>Nickname: {user.nickname}</h5>
                    </div>
                    <Card.Text>
                        <strong>Email:</strong> {user.email}<br/>
                        <strong>Email Verified:</strong> {user.email_verified ? 'Yes' : 'No'}<br/>
                        <strong>Last Updated:</strong> {new Date(user.updated_at).toLocaleString()}<br/>
                        <Link to="/reset-password" className="reset-password">
                            {t("resetPassword")}
                        </Link>
                    </Card.Text>
                </Card.Body>
            </Card>
        )
    }

    function renderProfileViaPechaLogin() {
        return (
          <PechaUserProfile/>
        )
    }

    return (
        <div className="user-profile">
            {
                false ? renderProfileViaSocialLogin() : renderProfileViaPechaLogin()
            }
        </div>
    );
}

export default UserProfile;
