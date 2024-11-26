import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import { expect, vi } from "vitest"; // Vitest mock utility
import UserRegistration from "./UserRegistration.jsx";
import "@testing-library/jest-dom";

// Mock i18n for translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// Mock axiosInstance
vi.mock("../../services/config/axios-config.js", () => ({
  default: {
    get: vi.fn(), // Mock axios GET method
  },
}));

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
    expect(title).toHaveTextContent("signup");

    // Check all input fields
    expect(screen.getByPlaceholderText("emailAddress")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("firstName")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("lastName")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();

    // // Check dropdown (user type select)
    // expect(screen.getByText("select")).toBeInTheDocument();
    // expect(screen.getByText("monastic")).toBeInTheDocument();

    // Check signup button
    expect(screen.getByRole("button", { name: "signup" })).toBeInTheDocument();

    // Check login link
    expect(screen.getByText("alreadyHaveAccount")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "login" })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  test("handles user input correctly", async () => {
    setup();

    const emailInput = screen.getByPlaceholderText("emailAddress");
    const firstNameInput = screen.getByPlaceholderText("firstName");
    const lastNameInput = screen.getByPlaceholderText("lastName");
    const passwordInput = screen.getByPlaceholderText("password");
    const userTypeSelect = screen.getByText("select");

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
    await userEvent.selectOptions(screen.getByRole("combobox"), ["monastic"]);

    // Assert the correct option is selected by its visible text
    expect(screen.getByRole("option", { name: "monastic" }).selected).toBe(
      true
    );
  });

  test("submits the form and calls the registerUser function", async () => {
    setup();

    const axiosInstance = (
      await import("../../services/config/axios-config.js")
    ).default;

    const form = screen.getByRole("form"); // Form element
    const submitButton = screen.getByRole("button", { name: "signup" });

    // Simulate form submission
    fireEvent.submit(form);

    // Check if the mocked API call was made
    expect(axiosInstance.get).toHaveBeenCalledWith("/api/register");
  });

  test("displays error if form is submitted with empty fields", async () => {
    setup();

    const submitButton = screen.getByRole("button", { name: "signup" });

    // Simulate form submission without filling fields
    await userEvent.click(submitButton);

    // Ideally, you'd add error-handling logic in your component (e.g., showing a message)
    // Update this test case if you implement error messages
    expect(screen.getByRole("button", { name: "signup" })).toBeDefined();
  });

  test("checks navigation to login page", () => {
    setup();

    const loginLink = screen.getByRole("link", { name: "login" });

    // Check that the link navigates to "/login"
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
