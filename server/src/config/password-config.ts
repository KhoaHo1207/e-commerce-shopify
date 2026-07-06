import argon2 from "argon2";

export const passwordConfig: argon2.Options & { type: typeof argon2.argon2id } =
  {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  };
