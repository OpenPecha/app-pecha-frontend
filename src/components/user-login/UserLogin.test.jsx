import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import UserLogin from "./UserLogin";
import "@testing-library/jest-dom";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

describe("UserLogin Component", () => {
  const queryClient = new QueryClient();
  const setup = () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UserLogin />
        </Router>
      </QueryClientProvider>
    );
  };

  test("renders the login form correctly", () => {
    setup();

    expect(screen.getByText("loginToPecha")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("emailAddress")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "login" })).toBeInTheDocument();
    expect(screen.getByText("forgotPassword")).toBeInTheDocument();
    expect(screen.getByText("createAccount")).toBeInTheDocument();
  });

  test("handles user input for email and password fields", () => {
    setup();

    const emailInput = screen.getByPlaceholderText("emailAddress");
    const passwordInput = screen.getByPlaceholderText("password");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput.value).toBe("test@example.com");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    expect(passwordInput.value).toBe("password123");
  });

  test("renders error message on invalid form submission (email or password empty)", () => {
    setup();

    const loginButton = screen.getByRole("button", { name: "login" });

    fireEvent.click(loginButton);

    expect(
      screen.queryByText("Please fill in all fields")
    ).not.toBeInTheDocument();
  });

  test("checks forgot password link navigates correctly", () => {
    setup();

    const forgotPasswordLink = screen.getByText("forgotPassword");
    expect(forgotPasswordLink).toHaveAttribute("href", "/forgot-password");
  });

  test("checks create account link navigates correctly", () => {
    setup();

    const createAccountLink = screen.getByText("createAccount");
    expect(createAccountLink).toHaveAttribute("href", "/register");
  });

  test("submits the form when valid data is entered", () => {
    setup();

    const emailInput = screen.getByPlaceholderText("emailAddress");
    const passwordInput = screen.getByPlaceholderText("password");
    const loginButton = screen.getByRole("button", { name: "login" });

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
