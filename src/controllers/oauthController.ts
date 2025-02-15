import { Request, Response } from "express";
import { generateUniqueCode } from "../utils/codeGenerator";
import {
  storeAuthorizationCode,
  validateAuthorizationCode,
} from "../services/authService";
import { generateAccessToken } from "../services/tokenService";

const refreshTokens: Record<string, string> = {}; // In-memory storage for refresh tokens

export const authorize = (req: Request, res: Response): void => {
  const response_type = req.query.response_type as string;
  const client_id = req.query.client_id as string;
  const redirect_uri = req.query.redirect_uri as string;
  const state = req.query.state as string | undefined;

  if (
    response_type !== "code" ||
    client_id !== "upfirst" ||
    redirect_uri !== "http://localhost:8081/process"
  ) {
    res.status(400).send("Invalid request parameters");
    return;
  }

  const code = generateUniqueCode();
  storeAuthorizationCode(code, { client_id, redirect_uri });

  let redirectURL = `${redirect_uri}?code=${code}`;
  if (state) {
    redirectURL += `&state=${state}`;
  }

  res.redirect(302, redirectURL);
};

export const token = async (req: Request, res: Response): Promise<void> => {
  const { grant_type, code, client_id, redirect_uri, refresh_token } = req.body;

  if (grant_type === "authorization_code") {
    if (
      client_id !== "upfirst" ||
      redirect_uri !== "http://localhost:8081/process"
    ) {
      res.status(400).json({ error: "Invalid request parameters" });
      return;
    }

    if (!validateAuthorizationCode(code)) {
      res.status(400).json({ error: "Invalid or expired authorization code" });
      return;
    }

    try {
      const accessToken = await generateAccessToken({ sub: "user-id" });
      const newRefreshToken = generateUniqueCode();
      refreshTokens[newRefreshToken] = client_id;

      res.json({
        access_token: accessToken,
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: newRefreshToken,
      });
    } catch (error) {
      console.error("Error generating token:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else if (grant_type === "refresh_token") {
    if (!refresh_token || !refreshTokens[refresh_token]) {
      res.status(400).json({ error: "Invalid or expired refresh token" });
      return;
    }

    try {
      const accessToken = await generateAccessToken({ sub: "user-id" });

      res.json({
        access_token: accessToken,
        token_type: "bearer",
        expires_in: 3600,
      });
    } catch (error) {
      console.error("Error generating token:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  } else {
    res.status(400).json({ error: "Unsupported grant type" });
  }
};
