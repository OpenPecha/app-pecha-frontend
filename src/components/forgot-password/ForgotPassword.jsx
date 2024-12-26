import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import "./ForgotPassword.scss";

const ForgotPassword = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            setError(t("required"));
        } else if (!validateEmail(email)) {
            setError(t("invalidEmail"));
        } else {
            setError(""); // Clear any previous errors
            console.log("Email submitted:", email);
        }
    };

    return (
        <div className="forgot-password-container">
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>{t("emailAddress")}</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        isInvalid={!!error}
                    />
                    {error && <div className="error-message">{error}</div>}
                </Form.Group>
                <Button type="submit" className="w-100">
                    {t("submit")}
                </Button>
            </Form>
        </div>
    );
};

export default ForgotPassword;
