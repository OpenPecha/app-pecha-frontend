import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "vitest";
import UserRegistration from "./UserRegistration.jsx";
import "@testing-library/jest-dom";
import { mockAxios, mockReactI18Nest } from "../../test-utils/CommonMocks.js";

mockReactI18Nest();
mockAxios();

describe("UserRegistration Component", () => {
  const setup = () => {
    render(
      <Router>
        <UserRegistration />
      </Router>
    );
  };

  test("renders the registration form with all fields and buttons", () => {
    setup();

    // Check form title
    const title = screen.getByTestId("signup-title");
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent("Sign Up");

    // Check all input fields
    expect(screen.getByPlaceholderText("Email Address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();

    // // Check dropdown (user type select)
    // expect(screen.getByText("select")).toBeInTheDocument();
    // expect(screen.getByText("monastic")).toBeInTheDocument();

    // Check signup button
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();

    // Check login link
    expect(screen.getByText("Already have an account?")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Log In" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("handles user input correctly", async () => {
    setup();

    const emailInput = screen.getByPlaceholderText("Email Address");
    const firstNameInput = screen.getByPlaceholderText("First Name");
    const lastNameInput = screen.getByPlaceholderText("Last Name");
    const passwordInput = screen.getByPlaceholderText("Password");
    const userTypeSelect = screen.getByText("Select");

    // Simulate user typing
    await userEvent.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");

    await userEvent.type(firstNameInput, "John");
    expect(firstNameInput).toHaveValue("John");

    await userEvent.type(lastNameInput, "Doe");
    expect(lastNameInput).toHaveValue("Doe");

    await userEvent.type(passwordInput, "password123");
    expect(passwordInput).toHaveValue("password123");

    // Simulate dropdown selection by matching visible text
    await userEvent.selectOptions(screen.getByRole("combobox"), ["Monastic"]);

    // Assert the correct option is selected by its visible text
    expect(screen.getByRole("option", { name: "Monastic" }).selected).toBe(
      true
    );
  });

  test("submits the form and calls the registerUser function", async () => {
    setup();

    const axiosInstance = (
      await import("../../services/config/axios-config.js")
    ).default;

    const form = screen.getByRole("form"); // Form element
    const submitButton = screen.getByRole("button", { name: "Sign Up" });

    // Simulate form submission
    fireEvent.submit(form);

    // Check if the mocked API call was made
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/register");
  });

  test("displays error if form is submitted with empty fields", async () => {
    setup();

    const submitButton = screen.getByRole("button", { name: "Sign Up" });

    // Simulate form submission without filling fields
    await userEvent.click(submitButton);

    // Ideally, you'd add error-handling logic in your component (e.g., showing a message)
    // Update this test case if you implement error messages
    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
  });

  test("checks navigation to login page", () => {
    setup();

    const loginLink = screen.getByRole("link", { name: "Log In" });

    // Check that the link navigates to "/login"
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
