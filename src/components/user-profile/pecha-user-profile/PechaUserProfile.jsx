import React, { useState } from "react";
import "./PechaUserProfile.scss";
import { Tabs, Tab } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import {useNavigate} from "react-router-dom";

const PechaUserProfile = ({userInfo}) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const navigate = useNavigate();

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

  return (
    <div className="pecha-user-profile">
      <div className="section1">
        <div className="profile-left">
          <h2 className="profile-name">John Doe</h2>
          <p className="profile-job-title">Senior Software Engineer</p>
          <p className="profile-details">
            <span className="location">Bangalore</span>
            <span className="separator">·</span>
            <span className="degree">Master of Computer Application (MCA)</span>
            <span className="separator">·</span>
            <span className="bachelor">Bachelor of Science, Physics</span>
          </p>
          <div className="actions-row">
            <button className="edit-profile-btn" onClick={handleEditProfile}>Edit Profile</button>
            <button className="settings-btn">
              <span className="icon">⚙️</span> Settings
            </button>
            <p className="logout-text">Logout</p>
          </div>
          <div className="followers">
            <span className="number-followers">0 Followers</span>
            <span className="number-following">0 Following</span>
          </div>
          {/* Social Media Icons */}
          <div className="social-links" style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <a href="https://twitter.com/dummy" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="bi bi-twitter" style={{ fontSize: '20px', color: '#1DA1F2' }}></i>
            </a>
            <a href="https://youtube.com/dummy" target="_blank" rel="noopener noreferrer" aria-label="Youtube">
              <i className="bi bi-youtube" style={{ fontSize: '20px', color: '#333' }}></i>
            </a>
            <a href="https://linkedin.com/in/dummy" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="bi bi-linkedin" style={{ fontSize: '20px', color: '#0A66C2' }}></i>
            </a>
            <a href="https://facebook.com/dummy" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="bi bi-facebook" style={{ fontSize: '20px', color: '#4267B2' }}></i>
            </a>
          </div>
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
  );
};

export default PechaUserProfile;