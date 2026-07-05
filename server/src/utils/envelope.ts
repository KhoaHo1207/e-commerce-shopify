export type ApiEnvelope<T> = {
  success: boolean;
  status: "success" | "error";
  data: T;
  meta?: Record<string, unknown>;
  errors?: Array<{
    message: string;
    code?: string;
  }>;
};

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiEnvelope<T> {
  return {
    success: true,
    status: "success",
    data,
    ...(meta !== undefined ? { meta } : {}),
  };
}

export function fail(message: string, code?: string): ApiEnvelope<null> {
  return {
    success: false,
    status: "error",
    data: null,
    errors: [
      {
        message,
        ...(code !== undefined ? { code } : {}),
      },
    ],
  };
}
