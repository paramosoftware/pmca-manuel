import express from "express";
import jwt from "jsonwebtoken";
import getCookiePrefix from "~/utils/getCookiePrefix";
import decodeJwt from "~/utils/decodeJwt";
import { UnauthorizedError } from "../error";

const csrfHandler = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const exceptions = [
    "/api/auth/login",
    "/api/auth/refresh",
    "/api/auth/logout",
  ];

  if (req.method !== "GET" && !exceptions.includes(req.path)) {
    const csrf = req.headers["x-csrf-token"];

    const cookieName = getCookiePrefix() + "jwt";

    const token = req.cookies[cookieName];

    if (!token || !csrf) {
      throw new UnauthorizedError("Invalid CSRF token");
    }

    if (!decodeJwt(token, process.env.ACCESS_TOKEN_SECRET!, true, "5h")) {
      throw new UnauthorizedError("Invalid CSRF token");
    }

    const csrfToken = jwt.decode(token) as { csrf: string };

    if (csrfToken.csrf !== csrf) {
      throw new UnauthorizedError("Invalid CSRF token");
    }
  }

  next();
};

export default csrfHandler;
