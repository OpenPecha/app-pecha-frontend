import React, {useState} from "react";
import {Form, Button} from "react-bootstrap";
import "./ResetPassword.scss";
import {useTranslation} from "react-i18next";
import eyeOpen from "../../assets/icons/eye-open.svg";
import eyeClose from "../../assets/icons/eye-closed.svg";
import {useMutation} from "react-query";
import axiosInstance from "../config/axios-config.js";

const ResetPassword = () => {
    const {t} = useTranslation();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
    });

    const resetPasswordMutation = useMutation(
        async (resetPasswordData) => {
            const response = await axiosInstance.post(
                "/api/v1/auth/reset-password",
                resetPasswordData
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                console.log("Reset password successful", data);
                setFormData({currentPassword: "", newPassword: "", confirmPassword: ""});
            },
            onError: (error) => {
                console.error("Reset password failed", error);
            }
        }
    );

    // Validation Functions
    const validatePassword = (password) => password.length >= 8;

    const validateForm = () => {
        const validationErrors = {};

        if (!formData.currentPassword) {
            validationErrors.currentPassword = t("required");
        }

        if (!formData.newPassword) {
            validationErrors.newPassword = t("required");
        } else if (!validatePassword(formData.newPassword)) {
            validationErrors.newPassword = t("invalidPassword");
        }

        if (!formData.confirmPassword) {
            validationErrors.confirmPassword = t("required");
        } else if (formData.newPassword !== formData.confirmPassword) {
            validationErrors.confirmPassword = t("passwordsDoNotMatch");
        }

        return validationErrors;
    };

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData({...formData, [name]: value});
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prevState) => ({
            ...prevState,
            [field]: !prevState[field]
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
        } else {
            setErrors({});
            resetPasswordMutation.mutate(formData);
        }
    };

    // Reusable Field Component
    const renderInputField = (label, name) => (
        <Form.Group className="mb-3 reset-password-form" controlId={name}>
            <Form.Label>{label}</Form.Label>
            <div className="password-input-container position-relative">
                <Form.Control
                    type={showPassword[name] ? "text" : "password"}
                    name={name}
                    value={formData[name]}
                    onChange={handleInputChange}
                    isInvalid={!!errors[name]}
                />
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        togglePasswordVisibility(name);
                    }}
                    className="password-toggle-button"
                    aria-label={showPassword[name] ? "Hide Password" : "Show Password"}
                >
                    {showPassword[name] ? (
                        <img src={eyeOpen} alt="Eye Icon" width="16" height="16"/>
                    ) : (
                        <img src={eyeClose} alt="Eye Slash Icon" width="16" height="16"/>
                    )}
                </button>
                {errors[name] && <div className="error-message">{errors[name]}</div>}
            </div>
        </Form.Group>
    );

    return (
        <div className="reset-password-container">
            <Form onSubmit={handleSubmit}>
                {renderInputField("Current Password", "currentPassword")}
                {renderInputField("New Password", "newPassword")}
                {renderInputField("Confirm Password", "confirmPassword")}
                <Button type="submit" className="reset-button w-100">
                    Reset Password
                </Button>
            </Form>
        </div>
    );
};

export default ResetPassword;
