import React from "react";
import {render, screen, fireEvent} from "@testing-library/react";
import {BrowserRouter as Router} from "react-router-dom";
import {Tabs, Tab} from "react-bootstrap";
import "@testing-library/jest-dom";
import PechaUserProfile from "./PechaUserProfile";
import {QueryClient, QueryClientProvider} from "react-query";

describe("PechaUserProfile Component", () => {
  const queryClient = new QueryClient();


  const mockUserInfo = {
    name: "John Doe",
    jobTitle: "Senior Software Engineer",
    location: "Bangalore",
    education: {
      degree: "Master of Computer Application (MCA)",
      bachelor: "Bachelor of Science, Physics",
    },
  };

  const setup = () => {
    render(
      <Router>
        <QueryClientProvider client={queryClient}>
          <PechaUserProfile userInfo={mockUserInfo}/>
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
    expect(screen.getByText("Master of Computer Application (MCA)")).toBeInTheDocument();
    expect(screen.getByText("Bachelor of Science, Physics")).toBeInTheDocument();
  });

  test("Edit profile button", () => {
    setup();
    expect(screen.getByText("Edit Profile")).toBeInTheDocument()
  });

  test("renders all social media links with correct attributes", () => {
    setup();

    // Check social media links
    const twitterLink = screen.getByLabelText("Twitter");
    const youtubeLink = screen.getByLabelText("Youtube");
    const linkedInLink = screen.getByLabelText("LinkedIn");
    const facebookLink = screen.getByLabelText("Facebook");

    expect(twitterLink).toBeInTheDocument();
    expect(twitterLink).toHaveAttribute("href", "https://twitter.com/dummy");

    expect(youtubeLink).toBeInTheDocument();
    expect(youtubeLink).toHaveAttribute("href", "https://youtube.com/dummy");

    expect(linkedInLink).toBeInTheDocument();
    expect(linkedInLink).toHaveAttribute("href", "https://linkedin.com/in/dummy");

    expect(facebookLink).toBeInTheDocument();
    expect(facebookLink).toHaveAttribute("href", "https://facebook.com/dummy");
  });

  test("renders tab components and displays their content", () => {
    setup();

    // Check if the tabs are rendered
    expect(screen.getAllByText("Sheets")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Collections")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Notes")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Buddhist Text Tracker")[0]).toBeInTheDocument();

    // Check default tab content
    expect(screen.getByText("Manage your sheets and documents here.")).toBeInTheDocument();
  });

});
