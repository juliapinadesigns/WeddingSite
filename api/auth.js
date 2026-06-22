/* =========================================================
   Login endpoint for the wedding-site password gate.
   Runs as a Vercel Serverless Function (Node), which — unlike
   edge middleware — can read the POST body. Verifies the
   password, sets the unlock cookie, and redirects home.

   SET THE PASSWORD: in Vercel → Project → Settings →
   Environment Variables, add SITE_PASSWORD = LINCOLN (then
   redeploy). Falls back to the literal below if unset.
   ========================================================= */

const COOKIE = "wedding_gate";
const TOKEN = "jl-0408-2028-ok"; // must match middleware.js
const PASSWORD = process.env.SITE_PASSWORD || "LINCOLN";

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method Not Allowed");
    return;
  }

  let entered = "";
  try {
    let body = req.body;
    if (body == null) {
      // body wasn't auto-parsed — read the raw stream
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks).toString("utf8");
    }
    if (typeof body === "string") {
      entered = new URLSearchParams(body).get("password") || "";
      if (!entered) {
        try { entered = (JSON.parse(body) || {}).password || ""; } catch (e) {}
      }
    } else if (body && typeof body === "object") {
      entered = body.password || "";
    }
  } catch (e) { /* ignore */ }

  const isHttps = (req.headers["x-forwarded-proto"] || "").indexOf("https") !== -1;
  const secure = isHttps ? "; Secure" : "";

  if (entered === PASSWORD) {
    res.setHeader(
      "Set-Cookie",
      COOKIE + "=" + TOKEN + "; Path=/; Max-Age=2592000; HttpOnly" + secure + "; SameSite=Lax"
    );
    res.statusCode = 303;
    res.setHeader("Location", "/");
    res.end();
    return;
  }

  res.statusCode = 303;
  res.setHeader("Location", "/?error=1");
  res.end();
};
