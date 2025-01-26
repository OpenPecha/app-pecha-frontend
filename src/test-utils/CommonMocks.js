import { vi } from "vitest";
import { Tolgee } from "@tolgee/react";
import localeEn from "../i18n/en.json";

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

export const mockTolgee = Tolgee()
  .init({
    language: 'en',
    fallbackLanguage: 'en',
    staticData: {
      en: localeEn
    }
  });
