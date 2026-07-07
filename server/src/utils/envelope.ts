export type ApiErrorItem = {
  message: string;
  code?: string;
  field?: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  status: "success" | "error";
  data: T;
  meta?: Record<string, unknown>;
  errors?: ApiErrorItem[];
};

export function ok<T>(data: T, meta?: Record<string, unknown>): ApiEnvelope<T> {
  return {
    success: true,
    status: "success",
    data,
    ...(meta !== undefined ? { meta } : {}),
  };
}

export function failErrors(errors: ApiErrorItem[]): ApiEnvelope<null> {
  return {
    success: false,
    status: "error",
    data: null,
    errors,
  };
}

export function fail(message: string, code?: string): ApiEnvelope<null> {
  return failErrors([
    {
      message,
      ...(code !== undefined ? { code } : {}),
    },
  ]);
}
