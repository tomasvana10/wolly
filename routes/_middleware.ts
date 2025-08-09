import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { verifyJWT } from "@/lib/jwt.ts";
import { cookieNames } from "../lib/cookies.ts";

export async function handler(req: Request, ctx: FreshContext) {
  const url = new URL(req.url);

  if (
    ctx.destination !== "route" || // allows access to static files
    // required to actually authenticate the user
    url.pathname.startsWith("/api/login") ||
    url.pathname.startsWith("/login")
  ) return await ctx.next();

  const cookies = getCookies(req.headers);
  const token = cookies[cookieNames.authCookie];

  const redirectToLogin = () => Response.redirect(new URL("/login", req.url));

  if (!token) return redirectToLogin();

  const payload = await verifyJWT(token);
  if (!payload) return redirectToLogin();

  return await ctx.next();
}
