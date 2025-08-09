import { Handlers } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";
import { verifyJWT } from "../lib/jwt.ts";

export const handler: Handlers = {
  async GET(req, ctx) {
    const cookies = getCookies(req.headers);
    const token = cookies.auth;
    const payload = token ? await verifyJWT(token) : null;
    
    // prevent the authenticated user from accessing this page
    if (payload) {
      return Response.redirect(new URL("/", req.url));
    }

    return await ctx.render();
  },
};

const Login = (props: { url: URL }) => {
  const error = props.url.searchParams.get("error");

  return (
    <>
      <h1>Log in to Wolly</h1>
      <form method="post" action="/api/login">
        <input name="username" value="" placeholder="username" required />
        <input
          name="password"
          type="password"
          value=""
          placeholder="password"
          required
        />
        {error ? <p className="text-red-500">Incorrect credentials</p> : null}
        <button type="submit">Log in</button>
      </form>
    </>
  );
};

export default Login;
