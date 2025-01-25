import "./UserProfile.scss";
import { Tab, Tabs } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import { useTranslate } from "@tolgee/react";
import { ACCESS_TOKEN, LOGGED_IN_VIA, REFRESH_TOKEN } from "../../utils/Constants.js";
import { useAuth } from "../../config/AuthContext.jsx";
import { useAuth0 } from "@auth0/auth0-react";


const fetchUserInfo = async () => {
  const { data } = await axiosInstance.get("/api/v1/users/info");
  return data;
};

const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axiosInstance.post("api/v1/users/upload", formData);
  return data
}


const UserProfile = () => {
  const navigate = useNavigate();
  const {
    data: userInfo,
    isLoading: userInfoIsLoading,
    refetch: userInfoRefetch
  } = useQuery("userInfo", fetchUserInfo, { refetchOnWindowFocus: false });
  const { t } = useTranslate();
  const { isLoggedIn, logout: pechaLogout } = useAuth();
  const { isAuthenticated, logout } = useAuth0();

  const uploadProfileImageMutation = useMutation(uploadProfileImage, {
    onSuccess: async () => {
      alert("Image uploaded successfully!");
      await userInfoRefetch()

    },
    onError: (error) => {
      alert("Failed to upload image. Please try again.");
      console.error("Error:", error);
    }
  })

  const handlePictureUpload = async (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const maxSizeInBytes = 1024 * 1024;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        alert("Allowed file types are PNG, JPEG, and JPG.");
        fileInput.value = "";
        return;
      }

      if (file.size > maxSizeInBytes) {
        alert("File size should be less than 1MB.");
        fileInput.value = "";
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      uploadProfileImageMutation.mutateAsync(file)
    }
  };


  const handleEditProfile = () => {
    navigate("/edit-profile", { state: { userInfo } });
  };

  function handleLogout(e) {
    e.preventDefault()
    localStorage.removeItem(LOGGED_IN_VIA);
    sessionStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN)
    isLoggedIn && pechaLogout()
    isAuthenticated && logout({
      logoutParams: {
        returnTo: window.location.origin + "/texts",
      },
    });
  }

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
        style={ {
          marginTop: "15px",
          display: "flex",
          gap: "10px",
        } }
      >
        { socialProfiles.map((profile) => {
          const icon = socialIcons[profile.account] || {};
          return (
            <a
              key={ profile.account }
              href={ profile.account === "email" ? "mailto:" + profile.url : profile.url }
              target="_blank"
              rel="noopener noreferrer"
              aria-label={ profile.account }
            >
              <i
                className={ icon.class }
                style={ { fontSize: "20px", color: icon.color } }
              ></i>
            </a>
          );
        }) }
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
                  <button className="edit-profile-btn"
                          onClick={ handleEditProfile }>{ t("profile.edit_profile") }</button>
                  <button className="settings-btn">
                    <span className="icon">⚙️</span> { t("profile.setting") }
                  </button>
                  <p onClick={ handleLogout } className="logout-text">{ t("profile.log_out") }</p>
                </div>
                <div className="followers">
                  <span className="number-followers">{ userInfo?.followers } { t("common.followers") }</span>
                  <span className="number-following">{ userInfo?.following } { t("common.following") }</span>
                </div>
                { userInfo?.social_profiles?.length > 0 && renderSocialLinks(userInfo?.social_profiles) }
              </div>
              <div className="profile-right">
                <div className="profile-picture">
                  { userInfo?.avatar_url ? (
                    <img src={ userInfo.avatar_url } alt="Profile" className="profile-image" />
                  ) : (
                    <label className="add-picture-btn">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={ handlePictureUpload }
                        style={ { display: "none" } }
                      />
                      { t("profile.picture.add_picture") }
                    </label>
                  ) }
                </div>
              </div>
            </div>

            <div className="section2">
              <Tabs defaultActiveKey="sheets" id="user-profile-tabs" className="mb-3">
                <Tab
                  eventKey="sheets"
                  title={
                    <>
                      <i className="bi bi-file-earmark"></i> { t("profile.sheets.title") }
                    </>
                  }
                >
                  <div className="tab-content">
                    <h3>{ t("profile.sheets.title") }</h3>
                    <p>{ t("profile.sheets.description") }</p>
                  </div>
                </Tab>
                <Tab
                  eventKey="collections"
                  title={
                    <>
                      <i className="bi bi-stack"></i> { t("profile.collections.title") }
                    </>
                  }
                >
                  <div className="tab-content">
                    <h3>{ t("profile.collections.title") }</h3>
                    <p>{ t("profile.collections.description") }</p>
                  </div>
                </Tab>
                <Tab
                  eventKey="notes"
                  title={
                    <>
                      <i className="bi bi-pencil"></i> { t("profile.notes.title") }
                    </>
                  }
                >
                  <div className="tab-content">
                    <h3>{ t("profile.notes.title") }</h3>
                    <p>{ t("profile.notes.description") }</p>
                  </div>
                </Tab>
                <Tab
                  eventKey="tracker"
                  title={
                    <>
                      <i className="bi bi-reception-4"></i> { t("profile.text_tracker.title") }
                    </>
                  }
                >
                  <div className="tab-content">
                    <h3>{ t("profile.text_tracker.title") }</h3>
                    <p>{ t("profile.text_tracker.descriptions") }</p>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
        : <p>Loading...</p> }
    </>
  );
};

export default UserProfile;
