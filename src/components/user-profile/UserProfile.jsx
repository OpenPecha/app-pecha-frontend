import React, { useState } from "react";
import "./UserProfile.scss";
import { Tab, Tabs } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import axiosInstance from "../../config/axios-config.js";

const UserProfile = () => {
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();
  const {data: userInfo, isLoading: userInfoIsLoading} = useQuery("userInfo",async () => {
    const { data } = await axiosInstance.get("/api/v1/users/info");
    return data;
  });

  const handlePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePicture(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const handleEditProfile = () => {
    navigate("/edit-profile", { state: { userInfo } });
  };
  function renderSocialLinks(socialProfiles) {
    const socialIcons = {
      linkedin: { class: "bi bi-linkedin", color: "#0A66C2" },
      "x.com": { class: "bi bi-twitter", color: "#1DA1F2" },
      facebook: { class: "bi bi-facebook", color: "#4267B2" },
      youtube: { class: "bi bi-youtube", color: "#FF0000" },
      email: { class: "bi bi-envelope", color: "#FF0000" },
    };

    return (
      <div
        className="social-links"
        style={{
          marginTop: "15px",
          display: "flex",
          gap: "10px",
        }}
      >
        {socialProfiles.map((profile) => {
          const icon = socialIcons[profile.account] || {};
          return (
            <a
              key={profile.account}
              href={ profile.account === "email" ? "mailto:" + profile.url : profile.url }
              target="_blank"
              rel="noopener noreferrer"
              aria-label={profile.account}
            >
              <i
                className={icon.class}
                style={{ fontSize: "20px", color: icon.color }}
              ></i>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <>
      { !userInfoIsLoading ?
        <div className="user-profile">
          <div className="pecha-user-profile">
            <div className="section1">
              <div className="profile-left">
                <h2 className="profile-name">{ userInfo?.firstname + " " + userInfo?.lastname }</h2>
                <p className="profile-job-title">{ userInfo?.title }</p>
                <p className="profile-details">
                  { userInfo?.location && <><span className="location">{ userInfo?.location }</span> <span
                      className="separator">·</span></> }
                  { userInfo?.educations?.length ? <><span
                      className="degree">{ userInfo.educations.reduce((acc, curr) => acc + " " + curr) }</span> <span
                      className="separator">·</span></> : <></> }
                </p>
                <div className="actions-row">
                  <button className="edit-profile-btn" onClick={handleEditProfile}>Edit Profile</button>
                  <button className="settings-btn">
                    <span className="icon">⚙️</span> Settings
                  </button>
                  <p className="logout-text">Logout</p>
                </div>
                <div className="followers">
                  <span className="number-followers">{ userInfo?.followers } Followers</span>
                  <span className="number-following">{ userInfo?.following } Following</span>
                </div>
                { userInfo?.social_profiles?.length > 0 && renderSocialLinks(userInfo?.social_profiles) }
              </div>
              <div className="profile-right">
                <div className="profile-picture">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="profile-image" />
                  ) : (
                    <label className="add-picture-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePictureUpload}
                        style={{ display: "none" }}
                      />
                      Add Picture
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="section2">
              <Tabs defaultActiveKey="sheets" id="user-profile-tabs" className="mb-3">
                <Tab
                  eventKey="sheets"
                  title={
                    <>
                      <i className="bi bi-file-earmark"></i> Sheets
                    </>
                  }
                >
                  <div className="tab-content">
                    <h3>Sheets</h3>
                    <p>Manage your sheets and documents here.</p>
                  </div>
                </Tab>
                <Tab
                  eventKey="collections"
                  title={
                    <>
                      <i className="bi bi-stack"></i> Collections
                    </>
                  }
                >
                  <div className="tab-content">
                    <h3>Collections</h3>
                    <p>Manage your data collections here.</p>
                  </div>
                </Tab>
                <Tab
                  eventKey="notes"
                  title={
                    <>
                      <i className="bi bi-pencil"></i> Notes
                    </>
                  }
                >
                  <div className="tab-content">
                    <h3>Notes</h3>
                    <p>Write and manage your notes here.</p>
                  </div>
                </Tab>
                <Tab
                  eventKey="tracker"
                  title={
                    <>
                      <i className="bi bi-reception-4"></i> Buddhist Text Tracker
                    </>
                  }
                >
                  <div className="tab-content">
                    <h3>Buddhist Text Tracker</h3>
                    <p>Track your progress in Buddhist texts here.</p>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
        : <p>Loading...</p>}
    </>
  );
};

export default UserProfile;
