import { SignJWT, JWTPayload } from "jose";

const secret = new TextEncoder().encode("your-256-bit-secret");

export const generateAccessToken = async (payload: JWTPayload): Promise<string> => {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
  return token;
};
