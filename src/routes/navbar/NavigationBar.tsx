import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { FaGlobe, FaSearch } from "react-icons/fa";
import { useAuth } from "../../config/AuthContext.tsx";
import { useAuth0 } from "@auth0/auth0-react";
import {
  ACCESS_TOKEN,
  LANGUAGE,
  LOGGED_IN_VIA,
  REFRESH_TOKEN,
} from "../../utils/constants.ts";
import { useTolgee, useTranslate } from "@tolgee/react";
import { setFontVariables } from "../../config/commonConfigs.ts";
import { useQueryClient } from "react-query";
import { useEffect, useState, type FormEvent } from "react";
import { useCollectionColor } from "../../context/CollectionColorContext.tsx";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import NavSmallerScreen from "./NavSmallerScreen.tsx";

export const invalidateQueries = async (queryClient: any) => {
  const queriesToInvalidate = [
    "texts",
    "topics",
    "sheets",
    "sidePanel",
    "works",
    "texts-versions",
    "texts-content",
    "sheets-user-profile",
    "table-of-contents",
    "collections",
    "sub-collections",
    "versions",
  ];
  await Promise.all(
    queriesToInvalidate.map((query) => queryClient.invalidateQueries(query)),
  );
};
export const changeLanguage = async (
  lng: string,
  queryClient: any,
  tolgee: any,
) => {
  await tolgee.changeLanguage(lng);
  sessionStorage.setItem("textLanguage", lng);
  localStorage.setItem(LANGUAGE, lng);
  setFontVariables(lng);
  await invalidateQueries(queryClient);
};
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslate();
  const {
    isLoggedIn,
    logout: pechaLogout,
    isAuthLoading,
  } = useAuth() as {
    isLoggedIn: boolean;
    logout: () => void;
    isAuthLoading: boolean;
  };
  const { isAuthenticated, logout, isLoading: isAuth0Loading } = useAuth0();
  const tolgee = useTolgee(["language"]);
  const queryClient = useQueryClient();
  const { collectionColor } = useCollectionColor();
  const [searchTerm, setSearchTerm] = useState("");
  const [, setParams] = useSearchParams();

  /**
   * On the home page the bar floats over the hero image, and its background
   * fades in once you scroll off it (or point at the bar itself). Everywhere
   * else it is an ordinary opaque bar in the flow.
   */
  // Only the front page has a hero for the bar to float over.
  const isHome = location.pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPointerOver, setIsPointerOver] = useState(false);

  useEffect(() => {
    if (!isHome) {
      setIsScrolled(false);
      return;
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  const isOverHero = isHome && !isScrolled && !isPointerOver;
  const navItems = [
    { to: "/plans", label: t("header.plans"), key: "plans" },
    { to: "/collections", label: t("header.text"), key: "collections" },
    { to: "/about-us", label: t("about.tag"), key: "about" },
  ];

  const currentLanguage = tolgee.getLanguage();
  const isTibetan = currentLanguage === "bo-IN";

  const routesWithoutColorBorder = [
    "/",
    "/collections",
    "/login",
    "/register",
    "/signup",
    "/community",
    "/user",
  ];
  const shouldHideColorBorder = routesWithoutColorBorder.includes(
    location.pathname,
  );

  const handleLogout = (e: any) => {
    e.preventDefault();
    localStorage.removeItem(LOGGED_IN_VIA);
    sessionStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    isLoggedIn && pechaLogout();
    isAuthenticated && logout();

    if (isLoggedIn && !isAuthenticated) {
      navigate("/login");
    }
  };
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const handleLangSelect = (lng: string) => {
    changeLanguage(lng, queryClient, tolgee);
    setParams((prev) => {
      prev.set("lang", lng);
      return prev;
    });
  };

  const renderAuthButtons = (variant: "desktop" | "mobile") => {
    if (isAuth0Loading || isAuthLoading) {
      return <div className="text-sm text-faded-grey">Loading...</div>;
    }
    if (!isLoggedIn && !isAuthenticated) {
      return (
        <div
          className={
            variant === "desktop"
              ? "hidden md:flex items-center gap-2.5 text-sm"
              : "flex flex-col gap-2 text-sm"
          }
        >
          <Button
            variant="outline"
            onClick={() => navigate("/login")}
            className="rounded text-faded-grey"
            aria-label="Go to login"
          >
            {t("login.form.button.login_in")}
          </Button>
          <Button
            variant="ghost"
            onClick={() => navigate("/register")}
            className="rounded text-faded-grey"
            aria-label="Go to sign up"
          >
            {t("common.sign_up")}
          </Button>
        </div>
      );
    }
    return (
      <Button
        variant="outline"
        className={
          variant === "desktop"
            ? "rounded text-faded-grey"
            : "w-full rounded text-faded-grey"
        }
        onClick={handleLogout}
      >
        {t("profile.log_out")}
      </Button>
    );
  };
  const renderLanguageDropdown = () => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center p-1.5 rounded hover:bg-accent transition-colors"
            aria-label="Change language"
          >
            <FaGlobe className="text-faded-grey" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[120px]">
          <DropdownMenuItem onClick={() => handleLangSelect("en")}>
            English
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLangSelect("bo-IN")}>
            བོད་ཡིག
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleLangSelect("zh-Hans-CN")}>
            中文
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div
      onMouseEnter={() => setIsPointerOver(true)}
      onMouseLeave={() => setIsPointerOver(false)}
      className={`${isTibetan && "text-sm"} overalltext bg-navbar h-[60px] flex justify-between items-center w-full px-4 md:px-7 transition-colors duration-300 ${
        isHome ? "fixed inset-x-0 top-0 z-50" : ""
      }`}
      style={
        {
          borderBottom: isOverHero
            ? "2px solid transparent"
            : `2px solid ${shouldHideColorBorder ? "#E7E5E4" : collectionColor || "#E7E5E4"}`,
          // The bar's colours are all CSS variables, so rebinding them here
          // recolours everything inside - including the mobile menu - without
          // every control needing to know where it is being rendered.
          ...(isOverHero && {
            "--navbar": "transparent",
            "--navbar-foreground": "#ffffff",
            "--custom-border": "rgba(255,255,255,0.35)",
            "--search-background": "rgba(255,255,255,0.12)",
          }),
        } as React.CSSProperties
      }
    >
      <div className="flex items-center gap-x-4">
        <Link
          to="/"
          className="flex items-center"
          onClick={(e) => {
            if (location.pathname === "/") {
              e.preventDefault();
              window.location.reload();
            }
          }}
        >
          <img
            className={`h-[30px] transition duration-300 `}
            src={
              !isOverHero
                ? "/img/light_mode_logo.svg"
                : "/img/dark_mode_logo.svg"
            }
            alt="Webuddhist"
          />
        </Link>
        <div className={`hidden md:flex space-x-8`}>
          {navItems.map((navItem) => (
            <Link
              key={navItem.key}
              className={`no-underline text-faded-grey font-medium ${isTibetan ? "text-sm" : "text-base"} hover:underline transition-all`}
              to={navItem.to}
            >
              {navItem.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <form
          className="hidden md:flex items-center rounded-lg border border-custom-border bg-search-background"
          onSubmit={handleSearchSubmit}
        >
          <FaSearch className="ml-1.5 text-faded-grey" />
          <input
            type="search"
            placeholder={t("common.placeholder.search")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-none bg-transparent outline-none px-1 py-1.5 content"
          />
        </form>
        {renderAuthButtons("desktop")}
        <div className="hidden md:block">
          {(isAuthenticated || isLoggedIn) && (
            <Button
              variant="ghost"
              onClick={() => navigate("/profile")}
              className="rounded text-faded-grey"
            >
              {t("header.profileMenu.profile")}
            </Button>
          )}
        </div>
        {renderLanguageDropdown()}
        <NavSmallerScreen
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          navItems={navItems}
          renderAuthButtons={renderAuthButtons}
          isAuthenticated={isAuthenticated}
          isLoggedIn={isLoggedIn}
          onProfileNavigate={() => navigate("/profile")}
          translate={t}
        />
      </div>
    </div>
  );
};

export default Navigation;
