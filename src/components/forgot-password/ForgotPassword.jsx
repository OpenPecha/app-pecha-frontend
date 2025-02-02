import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import "./ForgotPassword.scss";
import { useMutation } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import { useNavigate } from "react-router-dom";
import { useTranslate } from "@tolgee/react";

const ForgotPassword = () => {
    const { t } = useTranslate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const forgotPasswordMutation = useMutation(async (email) => {
        const response = await axiosInstance.post("api/v1/auth/request-reset-password", email)
        return response.data
    }, {
        onSuccess: () => {
            alert("Email with reset password link is sent to your email address")
            navigate("/")
        },
        onError : (error) =>{
            setError(error.response.data.message);
        }
    })

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email) {
            setError(t("user.validation.required"));
        } else if (!validateEmail(email)) {
            setError(t("user.validation.invalid_email"));
        } else {
            setError(""); // Clear any previous errors
            console.log("Email submitted:", email);
            forgotPasswordMutation.mutate({email})
        }
    };

    return (
        <div className="forgot-password-container">
            <Form onSubmit={handleSubmit}>
                <Form.Group className="content mb-3" controlId="email">
                    <Form.Label>{ t("common.email") }</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        isInvalid={!!error}
                    />
                    {error && <div className="error-message">{error}</div>}
                </Form.Group>
                <Button type="submit" className="w-100">
                    { t("common.button.submit") }
                </Button>
            </Form>
        </div>
    );
};

export default ForgotPassword;
