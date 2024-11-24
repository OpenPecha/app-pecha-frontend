import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "./UserLogin.scss"; // Import the SCSS file for custom styling

const UserLogin = () => {

    return (
        <Container fluid className="login-container d-flex align-items-center justify-content-center">
            <Row>
                <Col xs={12} md={18} lg={25} className="login-box">
                    {/* Login Heading */}
                    <h2 className="text-center login-title">Log in to Pecha</h2>

                    {/* Login Form */}
                    <Form>
                        {/* Email Input */}
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email Address"
                                className="form-input"
                            />
                        </Form.Group>

                        {/* Password Input */}
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                className="form-input"
                            />
                        </Form.Group>

                        {/* Login Button */}
                        <Button type="submit" className="login-button w-100">
                            Log In
                        </Button>

                        {/* Links */}
                        <div className="login-links text-center mt-3">
                            <a href="/forgot-password" className="forgot-password">
                                Forgot Password?
                            </a>
                            <br />
                            <a href="/register" className="create-account">
                                Create new account
                            </a>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default UserLogin;