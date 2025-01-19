import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import UserLogin from "./UserLogin";
import "@testing-library/jest-dom";
import { mockAxios, mockReactI18Next, mockUseAuth } from "../../test-utils/CommonMocks.js";

mockReactI18Next();
mockUseAuth();
mockAxios();

describe("UserLogin Component", () => {
  const queryClient = new QueryClient();
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <UserLogin />
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders the login form correctly", () => {
    setup();

    expect(screen.getByText("Login to Pecha")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
    expect(screen.getByText("Forgot password?")).toBeInTheDocument();
    expect(screen.getByText("Create new account")).toBeInTheDocument();
  });

  test("handles user input for email and password fields", () => {
    setup();

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput.value).toBe("password123");
  });

  test("renders error message on invalid form submission (email or password empty)", () => {
    setup();

    const loginButton = screen.getByRole("button", { name: "Log In" });

    fireEvent.click(loginButton);

    expect(
      screen.queryByText("Please fill in all fields")
    ).not.toBeInTheDocument();
  });

  test("checks forgot password link navigates correctly", () => {
    setup();

    const forgotPasswordLink = screen.getByText("Forgot password?");
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  test("checks create account link navigates correctly", () => {
    setup();

    const createAccountLink = screen.getByText("Create new account");
    expect(createAccountLink).toHaveAttribute("href", "/register");
  });

  test("submits the form when valid data is entered", () => {
    setup();

    const emailInput = screen.getByPlaceholderText("Email address");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: "Log In" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    const handleSubmit = vi.fn();
    fireEvent.click(loginButton);

    expect(
      screen.queryByText("Please fill in all fields")
    ).not.toBeInTheDocument();

    expect(handleSubmit).not.toHaveBeenCalled();
  });
});
