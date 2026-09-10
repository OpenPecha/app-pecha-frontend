import axios, { AxiosError } from "axios";

/**
 * HTTP client for the WeBuddhist library (OpenPecha) API.
 *
 * Requests go to our own origin under /library and are forwarded upstream by a
 * proxy - the Vite dev server in development, nginx in production - the same
 * arrangement /api uses for the backend. So the library's host never appears in
 * a browser request, and the X-Application header it requires is attached by the
 * proxy instead of being shipped in the bundle. Point the proxy somewhere else
 * with VITE_LIBRARY_BASE_URL; nothing here needs to change.
 *
 * Deliberately a standalone axios instance rather than the app's shared
 * `axiosInstance`: that one attaches the user's access token to every request,
 * and none of these endpoints is user-specific.
 */
const BASE_URL = "/library";

export const libraryClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    accept: "application/json",
  },
});

export class LibraryError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "LibraryError";
    this.status = status;
  }
}

const statusOf = (error: unknown): number | undefined =>
  axios.isAxiosError(error)
    ? (error as AxiosError).response?.status
    : undefined;

export const isNotFound = (error: unknown): boolean =>
  error instanceof LibraryError
    ? error.status === 404
    : statusOf(error) === 404;

const wrap = (error: unknown, context: string): LibraryError => {
  const status = statusOf(error);
  return new LibraryError(
    status === 404 ? `${context} not found` : `Failed to fetch ${context}`,
    status,
  );
};

export const libraryGet = async <T>(
  path: string,
  params?: Record<string, unknown>,
  context = path,
): Promise<T> => {
  try {
    const { data } = await libraryClient.get<T>(path, { params });
    return data;
  } catch (error) {
    throw wrap(error, context);
  }
};

/** Same as libraryGet, but a 404 resolves to null instead of throwing. */
export const libraryGetOrNull = async <T>(
  path: string,
  params?: Record<string, unknown>,
  context = path,
): Promise<T | null> => {
  try {
    const { data } = await libraryClient.get<T>(path, { params });
    return data;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw wrap(error, context);
  }
};
