import React from "react";
import {Button, Container, Dropdown, Form, InputGroup, Nav, Navbar,} from "react-bootstrap";
import {Link} from "react-router-dom";
import {FaGlobe, FaQuestionCircle} from "react-icons/fa";
import "./NavigationBar.scss";
import {useTranslation} from "react-i18next";
import {useAuth} from "../config/AuthContext.jsx";
import {useAuth0} from "@auth0/auth0-react";

const NavigationBar = () => {
    const {t, i18n} = useTranslation();
    const {isLoggedIn, logout: pechaLogout} = useAuth();
    const {isAuthenticated, logout} = useAuth0();

    const changeLanguage = async (lng) => {
        await i18n.changeLanguage(lng);
        localStorage.setItem("language", lng);
    };

    function handleLogout(e) {
        e.preventDefault()
        isLoggedIn && pechaLogout()
        isAuthenticated && logout({
            logoutParams: {
                returnTo: window.location.origin,
            },
        });
    }

    return (
        <Navbar bg="light" expand="lg" className="custom-navbar" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                    <img className={"logo"} src={"/img/pecha-logo.svg"} alt={"Pecha"}/>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbar-links"/>
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
                                <Button variant="outline-secondary">{t("go")}</Button>
                            </InputGroup>
                        </Form>

                        {
                            (!isLoggedIn && !isAuthenticated) ? <>
                                    <Button as={Link} to="/login" variant="outline-dark" className="me-2">
                                        {t("login")}
                                    </Button>
                                    <Button as={Link} to="/register" variant="dark" className="me-3">
                                        {t("signup")}
                                    </Button>
                                </> :
                                <Button
                                    // as={ Link }
                                    // to="/login"
                                    onClick={handleLogout}
                                    variant="outline-dark"
                                    className="me-2"
                                >
                                    {t("logout")}
                                </Button>
                        }
                        {/*
                        {
                            !isAuthenticated ? <><Button
                                // as={ Link }
                                // to="/login"
                                onClick={() => loginWithRedirect()}
                                variant="outline-dark"
                                className="me-2"
                            >
                                { t("login") }
                            </Button>
                                <Button as={ Link } to="/register" variant="dark" className="me-3">
                                    { t("signup") }
                                </Button>
                            </>:
                                <Button
                                    // as={ Link }
                                    // to="/login"
                                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                                    variant="outline-dark"
                                    className="me-2"
                                >
                                    { t("logout") }
                                </Button>
                        }
                        */}

                        <Nav.Link
                            as={Link}
                            to="/help"
                            className="d-flex align-items-center"
                        >
                            <FaQuestionCircle size={20}/>
                        </Nav.Link>

                        <Dropdown align="end">
                            <Dropdown.Toggle variant="light" id="dropdown-basic">
                                <FaGlobe size={20}/>
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                                <Dropdown.Item onClick={() => changeLanguage("en")}>
                                    English
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => changeLanguage("bo")}>
                                    བོད་ཡིག
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavigationBar;
