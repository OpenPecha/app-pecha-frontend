import {useState} from "react";
import {Button, Col, Form, Row, Tab, Tabs} from "react-bootstrap";
import {useLocation, useNavigate} from "react-router-dom";
import "./EditUserProfile.scss";
import {useMutation} from "react-query";
import axiosInstance from "../../config/axios-config.js";

const EditUserProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userInfo = location.state?.userInfo || {};
  const updateProfileMutation = useMutation(async (updateProfileData) => {
      const response = await axiosInstance.post("/api/v1/users/info", updateProfileData)
      return response.data;
    },
    {
      onSuccess:(data) => {
        navigate("/profile")
      }
    }
  )

  // Initialize state with default values or data from userInfo
  const [formData, setFormData] = useState({
    firstname: userInfo.firstname || "",
    lastname: userInfo.lastname || "",
    title: userInfo.title || "",
    organization: userInfo.organization || "",
    location: userInfo.location || "",
    educations: userInfo.educations?.length > 0 ? userInfo.educations : [""],
    about_me: userInfo.about_me || "",
    avatar_url: userInfo.avatar_url || "",
    social_profiles: [
      {account: "email", url: userInfo.email || ""},
      {account: "x.com", url: userInfo["x.com"] || ""},
      {account: "linkedin", url: userInfo.linkedIn || ""},
      {account: "facebook", url: userInfo.facebook || ""},
      {account: "youtube", url: userInfo.youtube || ""},
    ],
  });

  // Handle input change for simple fields
  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData({...formData, [name]: value});
  };

  // Handle education changes
  const handleEducationChange = (index, value) => {
    const updatedEducation = [...formData.educations];
    updatedEducation[index] = value;
    setFormData({...formData, educations: updatedEducation});
  };

  const addEducation = () => {
    setFormData({...formData, educations: [...formData.educations, ""]});
  };

  // Handle social profile changes
  const handleSocialProfileChange = (account, value) => {
    const updatedProfiles = formData.social_profiles.map((profile) =>
      profile.account === account ? {...profile, url: value} : profile
    );
    setFormData({...formData, social_profiles: updatedProfiles});
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    updateProfileMutation.mutateAsync(formData)
    // You can perform the API call or any other processing here
  };

  return (
    <div className="edit-user-profile">
      <h2>Edit Your Profile</h2>
      <hr/>
      <Form onSubmit={handleSubmit}>
        <Tabs defaultActiveKey="personalDetails" id="edit-profile-tabs" className="mb-4">
          {/* Personal Details Tab */}
          <Tab eventKey="personalDetails" title="Personal Details">
            <Row>
              <Col md={6}>
                <Form.Group controlId="formFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formLastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="formTitle">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter your title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formOrganization">
                  <Form.Label>Organization</Form.Label>
                  <Form.Control
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    placeholder="Enter your organization"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="formLocation">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter your location"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="formEducation">
              <Form.Label>Education</Form.Label>
              {formData.educations.map((edu, index) => (
                <Row key={index} className="mb-2 align-items-center">
                  <Col md={10}>
                    <Form.Control
                      type="text"
                      value={edu}
                      onChange={(e) => handleEducationChange(index, e.target.value)}
                      placeholder="Enter your education"
                    />
                  </Col>
                  <Col md={2} className="d-flex justify-content-between">
                    <Button
                      variant="outline-dark"
                      size="sm"
                      onClick={addEducation}
                      className="me-2"
                    >
                      +
                    </Button>
                    {index !== 0 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          const updatedEducation = formData.educations.filter((_, i) => i !== index);
                          setFormData({...formData, educations: updatedEducation});
                        }}
                      >
                        ×
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
            </Form.Group>

            <Row>
              <Form.Group controlId="formAboutMe">
                <Form.Label>About Me</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="about_me"
                  value={formData.about_me}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                />
              </Form.Group>
            </Row>
          </Tab>

          {/* Contact Details Tab */}
          <Tab eventKey="contactDetails" title="Contact Details">
            <Row>
              {formData.social_profiles.map((profile) => (
                <Col md={6} key={profile.account}>
                  <Form.Group controlId={`form${profile.account}`}>
                    <Form.Label>{profile.account.charAt(0).toUpperCase() + profile.account.slice(1)}</Form.Label>
                    <Form.Control
                      type="text"
                      value={profile.url}
                      onChange={(e) => handleSocialProfileChange(profile.account, e.target.value)}
                      placeholder={`Enter your ${profile.account}`}
                    />
                  </Form.Group>
                </Col>
              ))}
            </Row>
          </Tab>
        </Tabs>

        <div className="form-buttons">
          <Button variant="outline-danger" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button variant="outline-success" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditUserProfile;
