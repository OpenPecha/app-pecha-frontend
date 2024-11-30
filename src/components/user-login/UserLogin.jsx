import React, { useState } from "react";
import { useMutation } from "react-query";
import { useTranslation } from "react-i18next";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./UserLogin.scss";
import axiosInstance from "../../services/config/axios-config";

const UserLogin = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        alert(t("loginFailed"));
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
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
                type="password"
                placeholder={t("password")}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button
              type="submit"
              className="login-button w-100"
              disabled={loginMutation.isLoading}
            >
              {loginMutation.isLoading ? t("loggingIn") : t("login")}
            </Button>

            <div className="login-links text-center mt-3">
              <a href="/forgot-password" className="forgot-password">
                {t("forgotPassword")}
              </a>
              <br />
              <a href="/register" className="create-account">
                {t("createAccount")}
              </a>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default UserLogin;

