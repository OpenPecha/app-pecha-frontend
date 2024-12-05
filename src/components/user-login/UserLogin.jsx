import React, { useState } from "react";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./UserLogin.scss";
import axiosInstance from "../../services/config/axios-config";
import { Link } from "react-router-dom";
import eyeOpen from "../../assets/icon/eye-open.svg";
import eyeClose from "../../assets/icon/eye-closed.svg";

const UserLogin = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation(
    async (loginData) => {
      const response = await axiosInstance.post(
        "/api/v1/auth/login",
        loginData
      );
      return response.data;
    },
    {
      onSuccess: (data) => {
        console.log("Login successful", data);
      },
      onError: (error) => {
        console.error("Login failed", error);
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

    if (!password) {
      validationErrors.password = t("required");
    } else if (!validatePassword(password)) {
      validationErrors.password = t("invalidPassword");
    }

    return validationErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      loginMutation.mutate({ email, password });
    }
  };

  return (
    <Container
      fluid
      className="login-container d-flex align-items-center justify-content-center"
    >
      <Row>
        <Col xs={12} md={18} lg={25} className="login-box">
          <h2 className="text-center login-title">{t("loginToPecha")}</h2>

          <Form onSubmit={handleSubmit}>
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

              {/* Eye Button */}
              <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowPassword(!showPassword);
                  }}                                className="position-absolute"
                  style={{
                    all: "unset",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
              >
                {showPassword ? (
                    <img src={eyeOpen} alt="Eye Icon" width="16" height="16" />
                ) : (
                    <img src={eyeClose} alt="Eye Slash Icon" width="16" height="16" />
                )}
              </button>
            </Form.Group>

            {/* Login Button */}
            <Button
              type="submit"
              className="login-button w-100"
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? t("loggingIn") : t("login")}
            </Button>

            {/* Links */}
            <div className="login-links text-center mt-3">
              <Link to="/forgot-password" className="forgot-password">
                {t("forgotPassword")}
              </Link>
              <br />
              <Link to="/register" className="create-account">
                {t("createAccount")}
              </Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default UserLogin;
