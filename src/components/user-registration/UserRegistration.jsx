import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./UserRegistration.scss";
import axiosInstance from "../../services/config/axios-config.js";
import { useMutation } from "react-query";
import eyeOpen from "../../assets/icon/eye-open.svg";
import eyeClose from "../../assets/icon/eye-closed.svg";

const UserRegistration = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("Select");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useMutation(
    async (registerData) => {
      const response = await axiosInstance.post(
        "/api/v1/auth/register",
        registerData
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log("Registration successful", data);
      },
      onError: (error) => {
        console.error("Registration failed", error);
      },
    }
  );

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!email) {
      validationErrors.email = t("required");
    } else if (!validateEmail(email)) {
      validationErrors.email = t("invalidEmail");
    }

    if (!firstName) {
      validationErrors.firstName = t("required");
    }

    if (!lastName) {
      validationErrors.lastName = t("required");
    }

    if (!password) {
      validationErrors.password = t("required");
    } else if (!validatePassword(password)) {
      validationErrors.password = t("invalidPassword");
    }

    if (password !== confirmPassword) {
      validationErrors.confirmPassword = t("passwordsDoNotMatch");
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = t("required");
    }

    if (userType === "Select") {
      validationErrors.userType = t("required");
    }

    return validationErrors;
  };

  const registerUser = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      registerMutation.mutate({
        email,
        firstName,
        lastName,
        password,
        userType,
      });
    }
  };

  return (
    <Container
      fluid
      className="register-container d-flex align-items-center justify-content-center"
    >
      <Row>
        <Col xs={12} md={18} lg={25} className="register-box">
          <h2 className="text-center register-title" data-testid="signup-title">
            {t("signup")}
          </h2>

          <Form onSubmit={registerUser} role="form">
            {/* Email Field */}
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Control
                type="email"
                placeholder={t("emailAddress")}
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* First Name Field */}
            <Form.Group className="mb-3" controlId="formFirstName">
              <Form.Control
                type="text"
                placeholder={t("firstName")}
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                isInvalid={!!errors.firstName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.firstName}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Last Name Field */}
            <Form.Group className="mb-3" controlId="formLastName">
              <Form.Control
                type="text"
                placeholder={t("lastName")}
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                isInvalid={!!errors.lastName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.lastName}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password Field */}
            <Form.Group
              className="mb-3 position-relative"
              controlId="formPassword"
            >
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>

              {/* Password Toggle Icon */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="position-absolute"
                style={{
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? (
                  <img src={eyeOpen} alt="Eye Icon" width="16" height="16" />
                ) : (
                  <img
                    src={eyeClose}
                    alt="Eye Slash Icon"
                    width="16"
                    height="16"
                  />
                )}
              </span>
            </Form.Group>

            {/* Confirm Password Field */}
            <Form.Group
              className="mb-3 position-relative"
              controlId="formConfirmPassword"
            >
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t("confirmPassword")}
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
              {/* Password Toggle Icon */}
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="position-absolute"
                style={{
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showConfirmPassword ? (
                  <img src={eyeOpen} alt="Eye Icon" width="16" height="16" />
                ) : (
                  <img
                    src={eyeClose}
                    alt="Eye Slash Icon"
                    width="16"
                    height="16"
                  />
                )}
              </span>
            </Form.Group>

            {/* User Type Dropdown */}
            <Form.Group className="mb-3" controlId="formUserType">
              <Form.Select
                className="form-input"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
                isInvalid={!!errors.userType}
              >
                <option>{t("select")}</option>
                <option>{t("monastic")}</option>
                <option>{t("teacher")}</option>
                <option>{t("student")}</option>
                <option>{t("educated")}</option>
                <option>{t("regularUser")}</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.userType}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Submit Button */}
            <Button type="submit" className="register-button w-100">
              {t("signup")}
            </Button>

            {/* Link to Login */}
            <div className="register-links text-center mt-3">
              <span>{t("alreadyHaveAccount")} </span>
              <Link to="/login" className="login-link">
                {t("login")}
              </Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default UserRegistration;
