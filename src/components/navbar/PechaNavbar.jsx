import React from "react";
import {
  Navbar,
  Nav,
  Container,
  Form,
  Button,
  Dropdown,
  InputGroup,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaQuestionCircle, FaGlobe } from "react-icons/fa";
import "./PechaNavbar.scss";
import { useTranslation } from "react-i18next";

const PechaNavbar = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <Navbar bg="light" expand="lg" className="custom-navbar" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <span role="img" aria-label="flower" className="flower-icon">
            🌸
          </span>
          <span className="ms-2 fw-bold">Pecha</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-links" />
        <Navbar.Collapse id="navbar-links">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/texts">
              {t("texts")}
            </Nav.Link>
            <Nav.Link as={Link} to="/topics">
              {t("topics")}
            </Nav.Link>
            <Nav.Link as={Link} to="/community">
              {t("community")}
            </Nav.Link>
          </Nav>

          <Nav>
            <Form className="d-flex me-3">
              <InputGroup>
                <Form.Control
                  type="search"
                  placeholder={t("searchPlaceholder")}
                  aria-label="Search"
                />
                <Button variant="outline-secondary">Go</Button>
              </InputGroup>
            </Form>

            <Button
              as={Link}
              to="/login"
              variant="outline-dark"
              className="me-2"
            >
              {t("login")}
            </Button>
            <Button as={Link} to="/register" variant="dark" className="me-3">
              {t("signup")}
            </Button>

            <Nav.Link
              as={Link}
              to="/help"
              className="d-flex align-items-center"
            >
              <FaQuestionCircle size={20} />
            </Nav.Link>

            <Dropdown align="end">
              <Dropdown.Toggle variant="light" id="dropdown-basic">
                <FaGlobe size={20} />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => changeLanguage("en")}>
                  English
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage("bo")}>
                  བོད་ཡིག
                </Dropdown.Item>
                <Dropdown.Item onClick={() => changeLanguage("he")}>
                  עברית
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PechaNavbar;
