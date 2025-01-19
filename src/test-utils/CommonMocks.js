import { vi } from "vitest";
import { resources } from "../components/i18next/i18n.js";

export const mockReactI18Next = () => {
  vi.mock("react-i18next", async () => {
    const actual = await vi.importActual("react-i18next");
    return {
      ...actual,
      useTranslation: () => ({
        t: (key) => resources.en.translation[key],
        i18n: {
          changeLanguage: vi.fn(),
        },
      }),
      initReactI18next: {
        type: "3rdParty",
        init: vi.fn(),
      },
    };
  });
};

export const mockAxios = () => {
  vi.mock("../services/config/axios-config.js", () => ({
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  }));
};

export const mockUseAuth = () => {
  vi.mock("../config/AuthContext.jsx", () => ({
    useAuth: () => ({
      isLoggedIn: false,
      login: vi.fn(),
      logout: vi.fn(),
    }),
  }));
}

export const mockUseQuery = () => {
  vi.mock("react-query", async () => {
    const actual = await vi.importActual("react-query");
    return {
      ...actual,
      useQuery: vi.fn(),
    };
  });
}
