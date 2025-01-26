import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import "./ResetPassword.scss";
import eyeOpen from "../../assets/icons/eye-open.svg";
import eyeClose from "../../assets/icons/eye-closed.svg";
import { useMutation } from "react-query";
import axiosInstance from "../../config/axios-config.js";
import { useLocation } from "react-router-dom";
import { RESET_PASSWORD_TOKEN } from "../../utils/Constants.js";
import { useTranslate } from "@tolgee/react";

const ResetPassword = () => {
  const { t } = useTranslate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const resetPasswordToken = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
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
        setFormData({ newPassword: "", confirmPassword: "" });
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

    if (!formData.newPassword) {
      validationErrors.newPassword = t("user.validation.required");
    } else if (!validatePassword(formData.newPassword)) {
      validationErrors.newPassword = t("user.validation.invalid_password");
    }

    if (!formData.confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.required");
    } else if (formData.newPassword !== formData.confirmPassword) {
      validationErrors.confirmPassword = t("user.validation.password_do_not_match");
    }

    return validationErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
      sessionStorage.setItem(RESET_PASSWORD_TOKEN, resetPasswordToken)
      resetPasswordMutation.mutate({ password: formData.newPassword });
    }
  };

  // Reusable Field Component
  const renderInputField = (label, name) => (
    <Form.Group className="content mb-3 reset-password-form" controlId={ name }>
      <Form.Label>{ label }</Form.Label>
      <div className="password-input-container position-relative">
        <Form.Control
          type={ showPassword[name] ? "text" : "password" }
          name={ name }
          value={ formData[name] }
          onChange={ handleInputChange }
          isInvalid={ !!errors[name] }
        />
        <button
          onClick={ (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePasswordVisibility(name);
          } }
          className="password-toggle-button"
          aria-label="toggle-password"
        >
          { showPassword[name] ? (
            <img src={ eyeOpen } alt="Eye Icon" width="16" height="16" />
          ) : (
            <img src={ eyeClose } alt="Eye Slash Icon" width="16" height="16" />
          ) }
        </button>
        { errors[name] && <div className="error-message">{ errors[name] }</div> }
      </div>
    </Form.Group>
  );

  return (
    <div className="reset-password-container">
      <Form onSubmit={ handleSubmit }>
        { renderInputField("New Password", "newPassword") }
        { renderInputField("Confirm Password", "confirmPassword") }
        <Button type="submit" className="reset-button w-100">
          Reset Password
        </Button>
      </Form>
    </div>
  );
};

export default ResetPassword;
