import React from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./UserRegistration.scss"; // Import the SCSS file for custom styling

const UserRegistration = () => {
    return (
        <Container fluid className="register-container d-flex align-items-center justify-content-center">
            <Row>
                <Col xs={12} md={18} lg={25} className="register-box">
                    {/* Registration Heading */}
                    <h2 className="text-center register-title">Sign Up</h2>

                    {/* Registration Form */}
                    <Form>
                        {/* Email Input */}
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="email"
                                placeholder="Email Address"
                                className="form-input"
                            />
                        </Form.Group>

                        {/* First Name Input */}
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="First Name"
                                className="form-input"
                            />
                        </Form.Group>

                        {/* Last Name Input */}
                        <Form.Group className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Last Name"
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

                        {/* Dropdown for User Type */}
                        <Form.Group className="mb-3">
                            <Form.Select className="form-input">
                                <option>Select</option>
                                <option>Monastic</option>
                                <option>Teacher</option>
                                <option>Student</option>
                                <option>Educated* / Dr / Prof</option>
                                <option>Regular User</option>
                            </Form.Select>
                        </Form.Group>

                        {/* Sign Up Button */}
                        <Button type="submit" className="register-button w-100">
                            Sign Up
                        </Button>

                        {/* Link to Log In */}
                        <div className="register-links text-center mt-3">
                            <span>Already have an account? </span>
                            <Link to="/login" className="login-link">
                                Log in
                            </Link>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default UserRegistration;