import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect } from "vitest";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import ResetPassword from "./ResetPassword.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { mockAxios, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import { TolgeeProvider } from "@tolgee/react";

mockAxios();
mockUseAuth()

const queryClient = new QueryClient();

describe("ResetPassword Component", () => {
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={ queryClient }>
          <TolgeeProvider fallback={ "Loading tolgee..." } tolgee={ mockTolgee }>
            <ResetPassword />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  }
  it("renders the component with required fields", () => {
    setup();
    expect(screen.getByLabelText("New Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    expect(screen.getByText("Reset Password")).toBeInTheDocument();
  });

  // it("shows validation errors when required fields are empty", async () => {
  //   setup();
  //   fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));
  //   expect(screen.getAllByText("Required")[0]).toBeInTheDocument();
  // });

  // it("validates password length", async () => {
  //   setup();
  //
  //   fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "short" } });
  //   fireEvent.click(screen.getByRole("button", { name: "Reset Password" }));
  //
  //   await waitFor(() => {
  //     expect(screen.getByText("Invalid password")).toBeInTheDocument();
  //   });
  // });

  // it("validates password confirmation", async () => {
  //   setup()
  //   fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "Password123" } });
  //   fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "Different123" } });
  //   fireEvent.click(screen.getByText("Reset Password"));
  //
  //   await waitFor(() => {
  //     expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
  //   });
  // });

  it("toggles password visibility", () => {
    setup()
    const toggleButton = screen.getAllByRole("button", { name: "toggle-password" });

    expect(screen.getByLabelText("New Password").type).toBe("password");

    fireEvent.click(toggleButton[0]);
    expect(screen.getByLabelText("New Password").type).toBe("text");

    fireEvent.click(toggleButton[0]);
    expect(screen.getByLabelText("New Password").type).toBe("password");
  });

  it("submits the form successfully with valid inputs", async () => {
    setup()
    fireEvent.change(screen.getByLabelText("New Password"), { target: { value: "NewPassword123" } });
    fireEvent.change(screen.getByLabelText("Confirm Password"), { target: { value: "NewPassword123" } });

    fireEvent.click(screen.getByText("Reset Password"));

    await waitFor(() => {
      expect(screen.queryByText("required")).not.toBeInTheDocument();
      expect(screen.queryByText("invalidPassword")).not.toBeInTheDocument();
      expect(screen.queryByText("passwordsDoNotMatch")).not.toBeInTheDocument();
    });
  });
});
