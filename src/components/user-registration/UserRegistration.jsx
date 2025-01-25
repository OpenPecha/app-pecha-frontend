import { useState } from "react";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./UserRegistration.scss";
import axiosInstance from "../../config/axios-config.js";
import { useMutation } from "react-query";
import eyeOpen from "../../assets/icons/eye-open.svg";
import eyeClose from "../../assets/icons/eye-closed.svg";
import { useAuth } from "../../config/AuthContext.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import { useTranslate } from "@tolgee/react";

const UserRegistration = () => {
  const { t } = useTranslate();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState("");
  const { login, isLoggedIn } = useAuth();
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  if (isLoggedIn || isAuthenticated) {
    navigate("/texts")
  }

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
        setRegistrationError("");
        const { access_token, refresh_token } = data;
        login(access_token, refresh_token);
        navigate('/texts')
      },
      onError: (error) => {
        setRegistrationError(error.response.data.detail);
        console.error("Registration failed", error);
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

    if (!firstName) {
      validationErrors.firstName = t("user.validation.required");
    }

    if (!lastName) {
      validationErrors.lastName = t("user.validation.required");
    }

    if (!password) {
      validationErrors.password = t("user.validation.required");
    }
    if (!validatePassword(password)) {
      validationErrors.password = t("user.validation.invalid_password");
    }
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.password_do_not_match");
    }

    if (!confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.required");
    }

    return validationErrors;
  };

  const registerUser = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      registerMutation.mutate({
        email,
        firstname: firstName,
        lastname: lastName,
        password
      });
    }
  };
  const loginWithSocial = async () => {
    try {
      await loginWithRedirect({
        appState: {
          returnTo: "/texts",
        },
      })
    } catch (error) {
      console.error("Social login failed:", error);
    }
  };

  return (
    <Container
      fluid
      className="register-container d-flex align-items-center justify-content-center"
    >
      <Row>
        <Col xs={ 12 } md={ 18 } lg={ 25 } className="register-box">
          <h2 className="title text-center register-title" data-testid="signup-title">
            { t("common.sign_up") }
          </h2>

          <Form onSubmit={ registerUser }>
            {/* Email Field */ }
            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Control
                type="email"
                placeholder={ t("common.email") }
                className="form-input"
                value={ email }
                onChange={ (e) => setEmail(e.target.value) }
                isInvalid={ !!errors.email }
              />
              <Form.Control.Feedback type="invalid">
                { errors.email }
              </Form.Control.Feedback>
            </Form.Group>

            {/* First Name Field */ }
            <Form.Group className="mb-3" controlId="formFirstName">
              <Form.Control
                type="text"
                placeholder={ t("sign_up.form.first_name") }
                className="form-input"
                value={ firstName }
                onChange={ (e) => setFirstName(e.target.value) }
                isInvalid={ !!errors.firstName }
              />
              <Form.Control.Feedback type="invalid">
                { errors.firstName }
              </Form.Control.Feedback>
            </Form.Group>

            {/* Last Name Field */ }
            <Form.Group className="mb-3" controlId="formLastName">
              <Form.Control
                type="text"
                placeholder={ t("sign_up.form.last_name") }
                className="form-input"
                value={ lastName }
                onChange={ (e) => setLastName(e.target.value) }
                isInvalid={ !!errors.lastName }
              />
              <Form.Control.Feedback type="invalid">
                { errors.lastName }
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password Field */ }
            <Form.Group
              className="mb-3 position-relative"
              controlId="formPassword"
            >
              <Form.Control
                type={ showPassword ? "text" : "password" }
                placeholder={ t("common.password") }
                className="form-input"
                value={ password }
                onChange={ (e) => setPassword(e.target.value) }
                isInvalid={ !!errors.password }
              />
              <Form.Control.Feedback type="invalid">
                { errors.password }
              </Form.Control.Feedback>

              {/* Password Toggle Icon */ }
              <button
                onClick={ (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                } } className="position-absolute"
                aria-label="toggle-password"
                style={ {
                  all: "unset",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                } }
              >
                { showPassword ? (
                  <img src={ eyeOpen } alt="Eye Icon" width="16" height="16" />
                ) : (
                  <img src={ eyeClose } alt="Eye Slash Icon" width="16" height="16" />
                ) }
              </button>
            </Form.Group>

            {/* Confirm Password Field */ }
            <Form.Group
              className="mb-3 position-relative"
              controlId="formConfirmPassword"
            >
              <Form.Control
                type={ showConfirmPassword ? "text" : "password" }
                placeholder={ t("common.confirm_password") }
                className="form-input"
                value={ confirmPassword }
                onChange={ (e) => setConfirmPassword(e.target.value) }
                isInvalid={ !!errors.confirmPassword }
              />
              <Form.Control.Feedback type="invalid">
                { errors.confirmPassword }
              </Form.Control.Feedback>
              {/* Password Toggle Icon */ }
              <button
                onClick={ (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowConfirmPassword(!showConfirmPassword);
                } } className="position-absolute"
                style={ {
                  all: "unset",
                  top: "50%",
                  right: "10px",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                } }
              >
                { showConfirmPassword ? (
                  <img src={ eyeOpen } alt="Eye Icon" width="16" height="16" />
                ) : (
                  <img src={ eyeClose } alt="Eye Slash Icon" width="16" height="16" />
                ) }
              </button>
            </Form.Group>

            {/* Submit Button */ }
            <Button type="submit" className="register-button w-100">
              { t("common.sign_up") }
            </Button>

            {/* Link to Login */ }
            <div className="content register-links text-center mt-3">
              <span>{ t("sign_up.already_have_account") } </span>
              <br />
              <Link to={ "/login" } className="login-link">
                { t("login.form.button.login_in") }
              </Link>
            </div>
            <hr />
            <div className="social-login-buttons">
              <Button variant="outline-dark" className="w-100 mb-2" onClick={ loginWithSocial }>
                { t("login.social_logins") }
              </Button>
            </div>
            { registrationError && <div className="content registration-error">
              { registrationError }
            </div> }
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default UserRegistration;
