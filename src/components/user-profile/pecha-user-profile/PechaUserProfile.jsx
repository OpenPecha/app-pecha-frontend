import React, { useState } from "react";
import "./PechaUserProfile.scss";

const PechaUserProfile = () => {
  const [profilePicture, setProfilePicture] = useState(null);

  const handlePictureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setProfilePicture(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pecha-user-profile">
      <div className="profile-left">
        <h2 className="profile-name">John Doe</h2>
        <p className="profile-job-title">Senior Software Engineer</p>
        <p className="profile-details">
          <span className="location">Bangalore</span>
          <span className="separator">·</span>
          <span className="degree">Master of Computer ApplIcation (MCA)</span>
          <span className="separator">·</span>
          <span className="bachelor">Bachelor of Science, Physics</span>
        </p>
        <div className="actions-row">
          <button className="edit-profile-btn">Edit Profile</button>
          <button className="settings-btn">
            <span className="icon">⚙️</span> Settings
          </button>
          <p className="logout-text">Logout</p>
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
  );
};

export default PechaUserProfile;
