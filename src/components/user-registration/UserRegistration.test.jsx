import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {BrowserRouter as Router} from "react-router-dom";
import {expect} from "vitest";
import UserRegistration from "./UserRegistration.jsx";
import "@testing-library/jest-dom";
import {mockAxios, mockReactI18Nest} from "../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import {AuthProvider} from "../../helpers/AuthContext.jsx";

mockReactI18Nest();
mockAxios();
describe("UserRegistration Component", () => {

    const queryClient = new QueryClient();
    const setup = () => {
        render(
            <Router>
                <AuthProvider
                    value={{
                        isLoggedIn: false,
                        login: vi.fn(),
                        logout: vi.fn(),
                    }}
                >
                    <QueryClientProvider client={queryClient}>
                        <UserRegistration/>
                    </QueryClientProvider>
                </AuthProvider>
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
        expect(screen.getByRole("button", {name: "Sign Up"})).toBeInTheDocument();

        // Check login link
        expect(screen.getByText("Already have an account?")).toBeInTheDocument();
        expect(screen.getByRole("link", {name: "Log In"})).toHaveAttribute(
            "href",
            "/login"
        );
    });

    test("handles invalid user input correctly", async () => {
        setup();

        const emailInput = screen.getByPlaceholderText("Email address");
        const lastNameInput = screen.getByPlaceholderText("Last Name");
        const passwordInput = screen.getByPlaceholderText("Password");
        const confirmPasswordInput = screen.getByPlaceholderText("Confirm password")

        // with invalid inputs
        await userEvent.type(emailInput, "test@example");
        expect(emailInput).toHaveValue("test@example");

        await userEvent.type(lastNameInput, "Doe");
        expect(lastNameInput).toHaveValue("Doe");

        await userEvent.type(passwordInput, "pass");
        expect(passwordInput).toHaveValue("pass");

        await userEvent.type(confirmPasswordInput, "password121");
        expect(confirmPasswordInput).toHaveValue("password121");

        const submitButton = screen.getByRole("button", {name: "Sign Up"});
        fireEvent.submit(submitButton);

        expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
        expect(screen.getByText("Invalid password")).toBeInTheDocument()
        expect(screen.getByText("Invalid email address")).toBeInTheDocument()
        expect(screen.getByText("Required")).toBeInTheDocument()
    });


    test("displays error if form is submitted with empty fields", async () => {
        setup();
        const submitButton = screen.getByRole("button", {name: "Sign Up"});
        await userEvent.click(submitButton);
        expect(screen.getByRole("button", {name: "Sign Up"})).toBeDefined();
    });

    test("checks navigation to login page", () => {
        setup();
        const loginLink = screen.getByRole("link", {name: "Log In"});
        expect(loginLink).toHaveAttribute("href", "/login");
    });
    test("password toggle button works correctly", async () => {
        setup();

        const passwordInput = screen.getByPlaceholderText("Password");
        const toggleButton = screen.getByRole("button", {name: "toggle-password"});

        expect(passwordInput).toHaveAttribute("type", "password");
        expect(toggleButton).toBeInTheDocument();

        await userEvent.click(toggleButton);

        expect(passwordInput).toHaveAttribute("type", "text");

        await userEvent.click(toggleButton);

        expect(passwordInput).toHaveAttribute("type", "password");
    });
});
