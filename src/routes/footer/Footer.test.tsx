import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";

const translateMock = vi.fn((key: string) => `translated-${key}`);

vi.mock("@tolgee/react", async () => {
  const actual = await vi.importActual("@tolgee/react");
  return {
    ...actual,
    useTranslate: () => ({
      t: translateMock,
    }),
  };
});

import Footer from "./Footer";

const expectedColumnLinks: { href: string; label: string }[] = [
  { href: "https://dharmaduta.in/about", label: "About Us" },
  { href: "https://dharmaduta.in/team", label: "Team" },
  { href: "https://dharmaduta.in/projects", label: "Products" },
  { href: "https://buddhistai.tools/", label: "Buddhist AI Studio" },
  { href: "https://sherab.org/", label: "Sherab" },
  { href: "https://github.com/OpenPecha", label: "Fork us on GitHub" },
  { href: "https://discord.com/invite/7GFpPFSTeA", label: "Discord" },
];

const expectedSocialLinks: { href: string }[] = [
  { href: "https://www.instagram.com/we.buddhist/" },
  { href: "https://www.facebook.com/profile.php?id=61578322432088" },
  { href: "mailto:contact@dharmaduta.in" },
  { href: "https://www.linkedin.com/company/webuddhist/" },
  { href: "https://www.youtube.com/@WeBuddhistmedia" },
];

describe("Footer", () => {
  const setup = (initialEntry = "/") =>
    render(
      <MemoryRouter initialEntries={[initialEntry]}>
        <Footer />
      </MemoryRouter>,
    );

  beforeEach(() => {
    translateMock.mockClear();
  });

  test("renders footer landmark and headings", () => {
    setup();

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getByText("translated-footer.about")).toBeInTheDocument();
    expect(screen.getByText("translated-footer.tools")).toBeInTheDocument();
    expect(
      screen.getByText("translated-footer.developers"),
    ).toBeInTheDocument();
  });

  test("renders all column links with correct attributes", () => {
    setup();

    expectedColumnLinks.forEach(({ href, label }) => {
      const link = screen.getByRole("link", { name: label });

      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test("renders all social media links with correct attributes", () => {
    setup();

    expectedSocialLinks.forEach(({ href }) => {
      const links = screen.getAllByRole("link");
      const socialLink = links.find((l) => l.getAttribute("href") === href);

      expect(socialLink).toBeInTheDocument();
      expect(socialLink).toHaveAttribute("href", href);
      expect(socialLink).toHaveAttribute("target", "_blank");
      expect(socialLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test("renders correct total number of links", () => {
    setup();
    const links = screen.getAllByRole("link");
    // +2 for the Privacy Policy and Terms of Service internal links
    expect(links).toHaveLength(
      expectedColumnLinks.length + expectedSocialLinks.length + 2,
    );
  });

  test("renders Privacy Policy and Terms of Service footer links", () => {
    setup();
    const privacyLink = screen.getByRole("link", { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute("href", "/privacy-policy");

    const tosLink = screen.getByRole("link", { name: /terms of service/i });
    expect(tosLink).toHaveAttribute("href", "/terms-of-service");
  });

  test("uses translation helper for column headings", () => {
    setup();

    expect(translateMock).toHaveBeenCalledWith("footer.about");
    expect(translateMock).toHaveBeenCalledWith("footer.tools");
    expect(translateMock).toHaveBeenCalledWith("footer.developers");
  });
  test("pins to the window on the home page, so it needs no scrolling to reach", () => {
    const { container } = setup("/");

    // In normal flow it sat at the end of the document: you had to scroll the
    // whole page before there was anything to hover.
    expect(container.querySelector("footer")?.className).toContain("lg:fixed");
    expect(container.querySelector("footer")?.className).toContain(
      "lg:bottom-0",
    );
  });

  test("collapses to a peek on the home page, opening on hover or focus", () => {
    const { container } = setup("/");

    // The columns collapse to nothing and open on hover; the row is only
    // collapsed from lg up, since a touch device has no hover to open it with.
    const collapsible = container.querySelector(
      "[class*='grid-template-rows']",
    );
    expect(collapsible?.className).toContain("lg:grid-rows-[0fr]");
    expect(collapsible?.className).toContain("lg:group-hover:grid-rows-[1fr]");
    expect(collapsible?.className).toContain(
      "lg:group-focus-within:grid-rows-[1fr]",
    );
  });

  test("keeps the footer open on every other page", () => {
    const { container } = setup("/collections");

    expect(container.innerHTML).not.toContain("grid-rows-[0fr]");
    expect(container.querySelector("footer")?.className).not.toContain(
      "lg:fixed",
    );
  });

  test("still renders its links while collapsed, so they stay reachable", () => {
    setup("/");

    // Collapsed by CSS only - the content is in the document and tabbable,
    // which is what opens it on focus.
    expect(
      screen.getByRole("link", { name: /Privacy Policy/i }),
    ).toBeInTheDocument();
  });
});
