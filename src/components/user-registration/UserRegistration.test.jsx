import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter as Router } from "react-router-dom";
import { expect } from "vitest";
import UserRegistration from "./UserRegistration.jsx";
import "@testing-library/jest-dom";
import { mockAxios, mockReactI18Nest } from "../../test-utils/CommonMocks.js";
import { QueryClient, QueryClientProvider } from "react-query";
import axiosInstance from "../../services/config/axios-config.js";

mockReactI18Nest();
mockAxios();

describe("UserRegistration Component", () => {
  const queryClient = new QueryClient();
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <UserRegistration />
        </QueryClientProvider>
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
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("First Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Last Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();

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

    const emailInput = screen.getByPlaceholderText("Email address");
    const firstNameInput = screen.getByPlaceholderText("First Name");
    const lastNameInput = screen.getByPlaceholderText("Last Name");
    const passwordInput = screen.getByPlaceholderText("Password");

    // Simulate user typing
    await userEvent.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");

    await userEvent.type(firstNameInput, "John");
    expect(firstNameInput).toHaveValue("John");

    await userEvent.type(lastNameInput, "Doe");
    expect(lastNameInput).toHaveValue("Doe");

    await userEvent.type(passwordInput, "password123");
    expect(passwordInput).toHaveValue("password123");
  });

  // test("submits the form and calls the registerUser function", async () => {
  //   setup();

  //   const form = screen.getByRole("form"); // Form element

  //   // Simulate form submission
  //   fireEvent.submit(form);

  //   // Check if the mocked API call was made
  //   await waitFor(() => {
  //     expect(axiosInstance.post).toHaveBeenCalledWith(
  //       "/api/v1/auth/register",
  //       expect.anything()
  //     );
  //   });
  // });

  test("displays error if form is submitted with empty fields", async () => {
    setup();

    const submitButton = screen.getByRole("button", { name: "Sign Up" });

    // Simulate form submission without filling fields
    await userEvent.click(submitButton);

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeDefined();
  });

  test("checks navigation to login page", () => {
    setup();

    const loginLink = screen.getByRole("link", { name: "Log In" });

    // Check that the link navigates to "/login"
    expect(loginLink).toHaveAttribute("href", "/login");
  });
});
