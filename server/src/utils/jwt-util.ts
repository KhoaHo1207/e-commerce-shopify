import { SignJWT, jwtVerify } from "jose";

import { jwtConfig } from "@/config/jwt-config.js";
import type { JwtPayload } from "@/types/auth-type.js";

const accessSecret = new TextEncoder().encode(jwtConfig.accessSecret);

const refreshSecret = new TextEncoder().encode(jwtConfig.refreshSecret);

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setIssuer(jwtConfig.issuer)
    .setAudience(jwtConfig.audience)
    .setSubject(payload.userId)
    .setExpirationTime(jwtConfig.accessExpiresIn)
    .sign(accessSecret);
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, accessSecret, {
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });

  return payload as JwtPayload;
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setIssuer(jwtConfig.issuer)
    .setAudience(jwtConfig.audience)
    .setSubject(payload.userId)
    .setExpirationTime(jwtConfig.refreshExpiresIn)
    .sign(refreshSecret);
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, refreshSecret, {
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience,
  });

  return payload as JwtPayload;
}
