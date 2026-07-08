export type ApiErrorItem = {
  message: string;
  code?: string;
  field?: string;
};

export type ApiErrorEnvelope = {
  success?: false;
  status?: "error";
  errors?: ApiErrorItem[];
};

export type AppApiError = {
  status: number;
  message: string;
  code?: string;
  field?: string;
  raw: unknown;
};
