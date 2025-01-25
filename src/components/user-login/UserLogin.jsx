import { useState } from "react";
import { useMutation } from "react-query";
import { Button, Col, Container, Form, Row, Toast, ToastContainer } from "react-bootstrap";
import "./UserLogin.scss";
import axiosInstance from "../../config/axios-config";
import { Link, useNavigate } from "react-router-dom";
import eyeOpen from "../../assets/icons/eye-open.svg";
import eyeClose from "../../assets/icons/eye-closed.svg";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth } from "../../config/AuthContext.jsx";
import { useTranslate } from "@tolgee/react";

const UserLogin = () => {
    const { t } = useTranslate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const { loginWithRedirect, isAuthenticated } = useAuth0();
    const { login, isLoggedIn } = useAuth();
    const navigate = useNavigate();

    if (isLoggedIn || isAuthenticated) {
        navigate("/texts")
    }
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
                const accessToken = data.auth.access_token;
                const refreshToken = data.auth.refresh_token;
                login(accessToken, refreshToken);
                navigate("/texts");
            },
            onError: (error) => {
                console.error("Login failed", error);
                setErrors({ error: error.response.data.message });
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
            validationErrors.email = t("user.validation.required");
        } else if (!validateEmail(email)) {
            validationErrors.email = t("user.validation.invalid_email");
        }

        if (!password) {
            validationErrors.password = t("user.validation.required");
        } else if (!validatePassword(password)) {
            validationErrors.password = t("user.validation.invalid_password");
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
            loginMutation.mutate({email, password});
        }
    };

    const loginWithSocial = async () => {
        try {
            await loginWithRedirect({
                appState: {
                    returnTo: "/texts",
                },
            });
        } catch (error) {
            console.error("Social login failed:", error);
        }
    };

    return (
        <Container
            fluid
            className="login-container d-flex align-items-center justify-content-center"
        >
            { errors.error && <ToastContainer position="top-end">
                <Toast bg={ "danger" } onClose={ () => setErrors({ error: null }) }>
                    <Toast.Header>
                        <strong className="me-auto">Error!</strong>
                    </Toast.Header>
                    <Toast.Body>{ errors.error }</Toast.Body>
                </Toast>
            </ToastContainer> }
            <Row>
                <Col xs={12} md={18} lg={25} className="login-box">
                    <h2 className="title text-center login-title">{ t("login.form.button.login_in") }</h2>
                    <Form onSubmit={handleSubmit}>
                        {/* Email Field */}
                        <Form.Group className="mb-3" controlId="formEmail">
                            <Form.Control
                                type="email"
                                placeholder={ t("common.email") }
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
                                placeholder={ t("common.password") }
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
                                }} className="position-absolute"
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
                                    <img src={eyeOpen} alt="Eye Icon" width="16" height="16"/>
                                ) : (
                                    <img src={eyeClose} alt="Eye Slash Icon" width="16" height="16"/>
                                )}
                            </button>
                        </Form.Group>

                        {/* Login Button */}
                        <Button
                            type="submit"
                            className="login-button w-100"
                            // disabled={loginMutation.isLoading}
                        >
                            { t("login.form.button.login_in") }
                        </Button>

                        {/* Links */}
                        <div className="login-links text-center mt-3">
                            <Link to={ "/forgot-password" } className="content forgot-password">
                                { t("login.forget_password") }
                            </Link>
                            <br/>
                            <Link to={ "/register" } className="content create-account">
                                { t("login.create_account") }
                            </Link>
                            <hr/>
                            <div className="social-login-buttons">
                                <Button variant="outline-dark" className="w-100 mb-2" onClick={loginWithSocial}>
                                    { t("login.social_logins") }
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default UserLogin;
