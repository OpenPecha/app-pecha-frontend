import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./UserLogin.scss";

const UserLogin = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  return (
    <Container
      fluid
      className="login-container d-flex align-items-center justify-content-center"
    >
      <Row>
        <Col xs={12} md={18} lg={25} className="login-box">
          <h2 className="text-center login-title">{t("loginToPecha")}</h2>

          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                type="email"
                placeholder={t("emailAddress")}
                className="form-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Control
                type="password"
                placeholder={t("password")}
                className="form-input"
              />
            </Form.Group>

            <Button type="submit" className="login-button w-100">
              {t("login")}
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
