import { render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import "@testing-library/jest-dom";
import UserProfile from "./UserProfile.jsx";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { mockAxios, mockReactI18Next, mockTolgee, mockUseAuth, mockUseQuery } from "../../test-utils/CommonMocks.js";
import { TolgeeProvider } from "@tolgee/react";


mockReactI18Next();
mockAxios();
mockUseAuth()
mockUseQuery()

describe("UserProfile Component", () => {
  const queryClient = new QueryClient();
  const mockUserInfo = {
    firstname: "John",
    lastname: "Doe",
    title: "Senior Software Engineer",
    location: "Bangalore",
    educations: ["Master of Computer Application (MCA)", "Bachelor of Science, Physics",],
    organization: "pecha org",
    following: 1,
    followers: 1,
    social_profiles: [
      { account: "x.com", url: "https://x.com" },
      { account: "email", url: "test@pecha.com" },
      { account: "linkedin", url: "https://linkedin.com" },
      { account: "facebook", url: "https://facebook.com" },
      { account: "youtube", url: "https://youtube.com" },
    ]
  };

  beforeEach(() => {
    useQuery.mockImplementation(() => ({
      data: mockUserInfo,
      isLoading: false,
    }));
  });

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={ queryClient }>
          <TolgeeProvider fallback={ "Loading tolgee..." } tolgee={ mockTolgee }>
            <UserProfile />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  test("renders the user profile with all details", () => {
    setup();

    // Check if name and job title are rendered
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Senior Software Engineer")).toBeInTheDocument();

    // Check if location and education details are rendered
    expect(screen.getByText("Bangalore")).toBeInTheDocument();
    expect(screen.getByText("Master of Computer Application (MCA) Bachelor of Science, Physics")).toBeInTheDocument();
  });

  test("Edit profile button", () => {
    setup();
    expect(screen.getByText("Edit Profile")).toBeInTheDocument()
  });

  test("renders all social media links with correct attributes", () => {
    setup();

    // Check social media links
    const twitterLink = screen.getByLabelText("x.com");
    const youtubeLink = screen.getByLabelText("youtube");
    const linkedInLink = screen.getByLabelText("linkedin");
    const facebookLink = screen.getByLabelText("facebook");
    const email = screen.getByLabelText("email");

    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute("href", "https://x.com");

    expect(youtubeLink).toBeInTheDocument();
    expect(youtubeLink).toHaveAttribute("href", "https://youtube.com");

    expect(linkedInLink).toBeInTheDocument();
    expect(linkedInLink).toHaveAttribute("href", "https://linkedin.com");

    expect(facebookLink).toBeInTheDocument();
    expect(facebookLink).toHaveAttribute("href", "https://facebook.com");

    expect(email).toBeInTheDocument();
    expect(email).toHaveAttribute("href", "mailto:test@pecha.com");
  });

  //todo - fix or delte after translation update in tolgee
  // test("renders tab components and displays their content", () => {
  //   setup();
  //
  //   // Check if the tabs are rendered
  //   expect(screen.getAllByText("Sheets")[0]).toBeInTheDocument();
  //   expect(screen.getAllByText("Collections")[0]).toBeInTheDocument();
  //   expect(screen.getAllByText("Notes")[0]).toBeInTheDocument();
  //   expect(screen.getAllByText("Buddhist Text Tracker")[0]).toBeInTheDocument();
  //
  //   // Check default tab content
  //   expect(screen.getByText("Manage your sheets and documents here.")).toBeInTheDocument();
  // });

});
