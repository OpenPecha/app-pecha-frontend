import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./UserRegistration.scss";
import axiosInstance from "../../services/config/axios-config.js";
import { useMutation } from "react-query";

const UserRegistration = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Select");

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

  const registerUser = (e) => {
    e.preventDefault();
    registerMutation.mutate({ email, firstName, lastName, password, userType });
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
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder={t("emailAddress")}
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder={t("firstName")}
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="text"
                placeholder={t("lastName")}
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder={t("password")}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Select
                className="form-input"
                value={userType}
                onChange={(e) => setUserType(e.target.value)}
              >
                <option>{t("select")}</option>
                <option>{t("monastic")}</option>
                <option>{t("teacher")}</option>
                <option>{t("student")}</option>
                <option>{t("educated")}</option>
                <option>{t("regularUser")}</option>
              </Form.Select>
            </Form.Group>

            <Button type="submit" className="register-button w-100">
              {t("signup")}
            </Button>

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
