import axios, { AxiosError, type AxiosResponse } from "axios";
import { env } from "@/lib/env";
import { ApiErrorEnvelope, AppApiError } from "@/types/api-type";
export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 10_000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Response interceptor
 * Normalize every error into AppApiError
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,

  (error: AxiosError<ApiErrorEnvelope>) => {
    // Network error / timeout / CORS...
    if (!error.response) {
      return Promise.reject<AppApiError>({
        status: 0,
        message: error.message || "Network error",
        raw: error,
      });
    }

    const { status, data } = error.response;

    const firstError = data.errors?.[0];

    return Promise.reject<AppApiError>({
      status,
      message: firstError?.message ?? error.message ?? "Request failed",
      code: firstError?.code,
      field: firstError?.field,
      raw: data,
    });
  }
);

export function setApiBaseUrl(baseURL: string): void {
  api.defaults.baseURL = baseURL;
}
