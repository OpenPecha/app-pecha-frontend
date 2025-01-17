import {mockAxios, mockReactI18Nest, mockUseAuth} from "../../test-utils/CommonMocks.js";
import {QueryClient, QueryClientProvider} from "react-query";
import {render, screen} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import "@testing-library/jest-dom";


import UserProfile from "./UserProfile.jsx";


mockReactI18Nest();
mockAxios();
mockUseAuth()

describe("UserProfile Component", () => {

  const queryClient = new QueryClient();
  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <UserProfile/>
        </QueryClientProvider>
      </Router>
    );
  };
  test("renders the registration form with all fields and buttons", async () => {
    setup();
    await expect(screen.getByTestId("user-profile")).toBeInTheDocument()
  })
});