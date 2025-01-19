import React, { useState } from "react";
import { Button, Col, Form, Row } from "react-bootstrap";
import "./EditUserProfile.scss";
import { useLocation, useNavigate } from "react-router-dom";

const EditUserProfile = () => {

  const location = useLocation();
  const userInfo = location.state?.userInfo || {};
  const [formData, setFormData] = useState({
    firstName: userInfo.firstName || userInfo.given_name|| "",
    lastName: userInfo.lastName || userInfo.family_name || "",
    title: userInfo.title || "",
    organization: userInfo.organization || "",
    website: userInfo.website || "",
    location: userInfo.location || "",
    education: userInfo.education || [""],
    aboutMe: userInfo.aboutMe || "",
    public_email: userInfo.public_email || "",
    profile_pic_url: userInfo.profile_pic_url || "",
    twitter: userInfo.twitter || "",
    linkedIn: userInfo.linkedIn || "",
    facebook: userInfo.facebook || "",
    youtube: userInfo.youtube || "",
    followees : userInfo.followees || [],
    followers: userInfo.followers || []
  });
  const navigate = useNavigate()
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEducationChange = (index, value) => {
    const updatedEducation = [...formData.education];
    updatedEducation[index] = value;
    setFormData({ ...formData, education: updatedEducation });
  };

  const addEducation = () => {
    setFormData({ ...formData, education: [...formData.education, ""] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div className="edit-user-profile">
      <h2>Edit Your Profile</h2>
      <hr />
      <Form onSubmit={handleSubmit}>
        {/* Personal Details Section */}
        <h4>Personal Details</h4>
        <Row>
          <Col md={6}>
            <Form.Group controlId="formFirstName">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={formData.firstName}
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
                name="lastName"
                value={formData.lastName}
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
            <Form.Group controlId="formWebsite">
              <Form.Label>Website</Form.Label>
              <Form.Control
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="Enter your website"
              />
            </Form.Group>
          </Col>
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
          {formData.education.map((edu, index) => (
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
                {index !== 0 && <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {
                    const updatedEducation = formData.education.filter(
                      (_, i) => i !== index
                    );
                    setFormData({...formData, education: updatedEducation});
                  }}
                >
                  ×
                </Button>}
              </Col>
            </Row>
          ))}
        </Form.Group>

        <Form.Group controlId="formAboutMe">
          <Form.Label>About Me</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="aboutMe"
            value={formData.aboutMe}
            onChange={handleChange}
            placeholder="Tell us about yourself"
            className= "text-area"
          />
        </Form.Group>

        <hr />

        {/* Contact Section */}
        <h4>Contact</h4>
        <Row>
          <Col md={6}>
            <Form.Group controlId="formEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.public_email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formProfileUrl">
              <Form.Label>Profile URL</Form.Label>
              <Form.Control
                type="text"
                name="profileUrl"
                value={formData.profile_pic_url}
                onChange={handleChange}
                placeholder="Enter your profile URL"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group controlId="formTwitterHandle">
              <Form.Label>Twitter Handle</Form.Label>
              <Form.Control
                type="text"
                name="twitterHandle"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="Enter your Twitter handle"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formLinkedIn">
              <Form.Label>LinkedIn</Form.Label>
              <Form.Control
                type="text"
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleChange}
                placeholder="Enter your LinkedIn profile"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group controlId="formFacebook">
              <Form.Label>Facebook</Form.Label>
              <Form.Control
                type="text"
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                placeholder="Enter your Facebook profile"
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formYoutubeChannel">
              <Form.Label>YouTube Channel</Form.Label>
              <Form.Control
                type="text"
                name="youtubeChannel"
                value={formData.youtube}
                onChange={handleChange}
                placeholder="Enter your YouTube channel"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="form-buttons">
          <Button variant="secondary" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>

      </Form>
    </div>
  );
};

export default EditUserProfile;
