import { fireEvent, render, screen } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import EditUserProfile from "./EditUserProfile.jsx";
import { QueryClient, QueryClientProvider } from "react-query";
import { mockAxios, mockReactI18Next, mockTolgee, mockUseAuth } from "../../test-utils/CommonMocks.js";
import "@testing-library/jest-dom";
import { TolgeeProvider } from "@tolgee/react";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom"); // Import the actual module for non-mocked exports
  return {
    ...actual,
    useNavigate: vi.fn(), // Mock `useNavigate`
    useLocation: vi.fn(() => ({
      state: {
        userInfo: {
          firstname: "John",
          lastname: "Doe",
          title: "Developer",
          organization: "Tech Corp",
          website: "https://example.com",
          location: "New York",
          educations: ["B.Sc. Computer Science"],
          about_me: "Software Engineer with 5 years of experience.",
          email: "john.doe@example.com",
          avatar_url: "https://profile.example.com",
          twitterHandle: "@johndoe",
          linkedIn: "https://linkedin.com/in/johndoe",
          facebook: "https://facebook.com/johndoe",
          youtubeChannel: "https://youtube.com/johndoe",
        },
      },
    })),
  };
});

mockReactI18Next();
mockAxios();
mockUseAuth()

describe("EditUserProfile Component", () => {
  const queryClient = new QueryClient();

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={ queryClient }>
          <TolgeeProvider fallback={ "Loading tolgee..." } tolgee={ mockTolgee }>
            <EditUserProfile />
          </TolgeeProvider>
        </QueryClientProvider>
      </Router>
    );
  };

  it("renders the form with pre-filled values from userInfo", () => {
    setup();


    expect(screen.getByLabelText("First Name")).toHaveValue("John");
    expect(screen.getByLabelText("Last Name")).toHaveValue("Doe");
    expect(screen.getByLabelText("Title")).toHaveValue("Developer");
    expect(screen.getByLabelText("Organization")).toHaveValue("Tech Corp");
    expect(screen.getByLabelText("Website")).toHaveValue("https://example.com");
    expect(screen.getByLabelText("Location")).toHaveValue("New York");
    expect(screen.getByLabelText("Email")).toHaveValue("john.doe@example.com");
  });

  it("updates the form values when the user types in the input fields", () => {
    setup();


    const firstNameInput = screen.getByLabelText("First Name");
    fireEvent.change(firstNameInput, { target: { value: "Jane" } });

    expect(firstNameInput).toHaveValue("Jane");
  });

  it("adds a new education field when the '+' button is clicked", async () => {
    setup();


    const addButton = screen.getByText("+");
    fireEvent.click(addButton);

    const educationFields = screen.getAllByPlaceholderText("Enter your education");
    expect(educationFields).toHaveLength(2);
  });


  it("Cancel button", () => {
    setup();
    expect(screen.getByText("Cancel")).toBeInTheDocument()

  });

  it("Submit button", () => {
    setup();
    const submitButton = screen.getByText("Submit");
    fireEvent.click(submitButton);

    expect(screen.getByText("Submit")).toBeInTheDocument()
  });
});
