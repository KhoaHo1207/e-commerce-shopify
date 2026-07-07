const {
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} = process.env;

if (!JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

if (!JWT_ACCESS_EXPIRES_IN) {
  throw new Error("JWT_ACCESS_EXPIRES_IN is not defined");
}

if (!JWT_REFRESH_EXPIRES_IN) {
  throw new Error("JWT_REFRESH_EXPIRES_IN is not defined");
}

export const jwtConfig = {
  accessSecret: JWT_ACCESS_SECRET,
  refreshSecret: JWT_REFRESH_SECRET,

  accessExpiresIn: JWT_ACCESS_EXPIRES_IN,
  refreshExpiresIn: JWT_REFRESH_EXPIRES_IN,

  issuer: "e-commerce-shopify-server",

  audience: "e-commerce-shopify-client",
} as const;

function parseDurationToMs(duration: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/i.exec(duration.trim());

  if (!match) {
    throw new Error(`Invalid JWT expiry duration: ${duration}`);
  }

  const value = Number(match[1]);
  const unit = match[2]!.toLowerCase();

  const unitMs: Record<string, number> = {
    ms: 1,
    s: 1_000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };

  return value * unitMs[unit]!;
}

const isProduction = process.env.NODE_ENV === "production";

export const accessTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
  maxAge: parseDurationToMs(jwtConfig.accessExpiresIn),
} as const;

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "lax",
  path: "/",
  maxAge: parseDurationToMs(jwtConfig.refreshExpiresIn),
} as const;
