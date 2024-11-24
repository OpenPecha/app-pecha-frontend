import React from "react";
import { Navbar, Nav, Container, Form, Button, Dropdown, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import { FaQuestionCircle, FaGlobe } from "react-icons/fa";
import "./PechaNavbar.scss";

const PechaNavbar = () => {
    return (
        <Navbar bg="light" expand="lg" className="custom-navbar" sticky="top">
            <Container>
                {/* Left Section */}
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    {/* Flower Icon */}
                    <span role="img" aria-label="flower" className="flower-icon">
            🌸
          </span>
                    <span className="ms-2 fw-bold">Pecha</span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbar-links" />
                <Navbar.Collapse id="navbar-links">
                    <Nav className="me-auto">
                        {/* Use Link instead of Nav.Link */}
                        <Nav.Link as={Link} to="/texts">
                            Texts
                        </Nav.Link>
                        <Nav.Link as={Link} to="/topics">
                            Topics
                        </Nav.Link>
                        <Nav.Link as={Link} to="/community">
                            Community
                        </Nav.Link>
                    </Nav>

                    {/* Right Section */}
                    <Nav>
                        {/* Search Bar */}
                        <Form className="d-flex me-3">
                            <InputGroup>
                                <Form.Control type="search" placeholder="Search" aria-label="Search" />
                                <Button variant="outline-secondary">Go</Button>
                            </InputGroup>
                        </Form>

                        {/* Login and Signup Buttons */}
                        <Button as={Link} to="/login" variant="outline-dark" className="me-2">
                            Login
                        </Button>
                        <Button as={Link} to="/register" variant="dark" className="me-3">
                            Signup
                        </Button>

                        {/* Question Mark Icon */}
                        <Nav.Link as={Link} to="/help" className="d-flex align-items-center">
                            <FaQuestionCircle size={20} />
                        </Nav.Link>

                        {/* Globe Icon with Dropdown */}
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="light" id="dropdown-basic">
                                <FaGlobe size={20} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item href="#action/1">English</Dropdown.Item>
                                <Dropdown.Item href="#action/2">Spanish</Dropdown.Item>
                                <Dropdown.Item href="#action/3">French</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default PechaNavbar;