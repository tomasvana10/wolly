import { Handlers } from "$fresh/server.ts";
import { setCookie } from "$std/http/cookie.ts";
import { createJWT } from "@/lib/jwt.ts";
import { cookieNames } from "@/lib/cookies.ts";
import { compare } from "bcrypt";

export const handler: Handlers = {
  async POST(req) {
    const url = new URL(req.url);
    const form = await req.formData();

    const username = form.get("username")?.toString();
    const pass = form.get("password")?.toString();

    // user entered correct details, create JWT
    if (
      username === Deno.env.get("USERNAME") && pass &&
      await compare(pass, Deno.env.get("PASSWORD_HASH")!)
    ) {
      const headers = new Headers();
      const token = await createJWT({ username });

      setCookie(headers, {
        name: cookieNames.authCookie,
        value: token,
        maxAge: 3600 * 24 * 30, // 30 days
        sameSite: "Strict",
        domain: url.hostname,
        path: "/",
        secure: Deno.env.get("DENO_ENV") === "production",
      });
      headers.set("location", "/");
      return new Response(null, { status: 303, headers });
    }

    const headers = new Headers();
    headers.set("Location", "/login?error=1");
    return new Response(null, {
      status: 303,
      headers,
    });
  },
};
