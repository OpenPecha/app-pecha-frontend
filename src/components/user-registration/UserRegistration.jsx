import React, { useState } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./UserRegistration.scss";
import axiosInstance from "../../services/config/axios-config.js";

const UserRegistration = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("Select");

    const register = (e) => {
        e.preventDefault();
        axiosInstance.get("/api/register")
    };

    return (
        <Container
            fluid
            className="register-container d-flex align-items-center justify-content-center"
        >
            <Row>
                <Col xs={ 12 } md={ 18 } lg={ 25 } className="register-box">
                    <h2 className="text-center register-title">{ t("signup") }</h2>

                    <Form onSubmit={ register }>
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder={ t("emailAddress") }
                                className="form-input"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder={ t("firstName") }
                                className="form-input"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder={ t("lastName") }
                                className="form-input"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder={ t("password") }
                                className="form-input"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Select className="form-input">
                                <option>{ t("select") }</option>
                                <option>{ t("monastic") }</option>
                                <option>{ t("teacher") }</option>
                                <option>{ t("student") }</option>
                                <option>{ t("educated") }</option>
                                <option>{ t("regularUser") }</option>
                            </Form.Select>
                        </Form.Group>

                        <Button type="submit" className="register-button w-100">
                            { t("signup") }
                        </Button>

                        <div className="register-links text-center mt-3">
                            <span>{ t("alreadyHaveAccount") } </span>
                            <Link to="/login" className="login-link">
                                { t("login") }
                            </Link>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default UserRegistration;
