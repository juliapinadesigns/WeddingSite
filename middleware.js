import { next } from "@vercel/edge";

/* =========================================================
   Password gate for the wedding site (Vercel Edge Middleware)
   - Serves a custom, on-brand password page when locked.
   - Verifies the password server-side and sets a cookie.

   SET THE PASSWORD:
   Best practice (keeps it out of the repo): in Vercel →
   Project → Settings → Environment Variables, add
   SITE_PASSWORD = LINCOLN  (then redeploy).
   If no env var is set, it falls back to the literal below.
   ========================================================= */

export const config = { matcher: "/:path*" };

const COOKIE = "wedding_gate";
const TOKEN = "jl-0408-2028-ok"; // cookie value once unlocked
const PASSWORD = (typeof process !== "undefined" && process.env && process.env.SITE_PASSWORD) || "LINCOLN";

export default async function middleware(request) {
  const url = new URL(request.url);

  // --- Handle the login form submission ---
  if (request.method === "POST" && url.pathname === "/__auth") {
    let entered = "";
    try {
      const form = await request.formData();
      entered = (form.get("password") || "").toString();
    } catch (e) { /* ignore */ }

    if (entered === PASSWORD) {
      // Only flag the cookie Secure on https — browsers drop Secure cookies
      // over http://localhost, which would break local testing.
      var proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
      var secure = proto === "https" ? "; Secure" : "";
      return new Response(null, {
        status: 303,
        headers: {
          Location: "/",
          "Set-Cookie": COOKIE + "=" + TOKEN +
            "; Path=/; Max-Age=2592000; HttpOnly" + secure + "; SameSite=Lax",
        },
      });
    }
    // wrong password -> re-show the gate with an error
    return new Response(gateHtml(true), {
      status: 401,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  // --- Already unlocked? let the request through ---
  const cookie = request.headers.get("cookie") || "";
  const authed = cookie
    .split(";")
    .map(function (c) { return c.trim(); })
    .indexOf(COOKIE + "=" + TOKEN) !== -1;
  if (authed) return next();

  // --- Locked: show the custom gate ---
  return new Response(gateHtml(false), {
    status: 401,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function gateHtml(error) {
  return '<!DOCTYPE html><html lang="en"><head>' +
'<meta charset="UTF-8" />' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0" />' +
'<meta name="robots" content="noindex, nofollow" />' +
'<title>Julia &amp; Louis</title>' +
'<link rel="preconnect" href="https://fonts.googleapis.com" />' +
'<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />' +
'<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />' +
'<style>' +
':root{--ivory:#FAF7F2;--ivory-soft:#F4F1E9;--lavender-soft:#E3DAEE;--sage:#AEB9A0;--sage-deep:#6F7E5E;--blue-accent:#8FB3D9;--ink:#3A463C;--ink-soft:#5C685A;--serif:"Cormorant Garamond",Georgia,serif;--sans:"Jost",system-ui,sans-serif;}' +
'*{box-sizing:border-box;}' +
'html,body{height:100%;}' +
'body{margin:0;font-family:var(--sans);font-weight:300;color:var(--ink);' +
'background:radial-gradient(120% 120% at 50% 0%,var(--lavender-soft),var(--ivory) 55%);' +
'display:flex;align-items:center;justify-content:center;padding:24px;-webkit-font-smoothing:antialiased;}' +
'.gate{width:100%;max-width:440px;text-align:center;background:rgba(255,255,255,.55);' +
'border:1px solid rgba(111,126,94,.16);border-radius:22px;padding:54px 40px 46px;' +
'box-shadow:0 40px 80px -46px rgba(58,70,60,.5);backdrop-filter:blur(6px);' +
'animation:rise .9s cubic-bezier(.22,.61,.36,1) both;}' +
'@keyframes rise{from{opacity:0;transform:translateY(22px);}to{opacity:1;transform:none;}}' +
'.gate__mono{font-family:var(--serif);font-size:1.5rem;letter-spacing:.14em;margin:0;}' +
'.gate__mono span{color:var(--blue-accent);padding:0 .12em;}' +
'.gate h1{font-family:var(--serif);font-weight:500;font-size:2.2rem;margin:18px 0 6px;line-height:1.15;}' +
'.gate p{color:var(--ink-soft);font-size:.98rem;margin:0 0 26px;}' +
'.gate form{display:flex;flex-direction:column;gap:16px;}' +
'.gate input{font-family:var(--sans);font-size:1rem;text-align:center;letter-spacing:.04em;' +
'padding:14px 16px;border:1px solid rgba(111,126,94,.3);border-radius:12px;background:var(--ivory);' +
'color:var(--ink);outline:none;transition:border-color .3s,box-shadow .3s;}' +
'.gate input:focus{border-color:var(--sage-deep);box-shadow:0 0 0 3px rgba(111,126,94,.15);}' +
'.gate button{font-family:var(--sans);font-size:.82rem;letter-spacing:.18em;text-transform:uppercase;' +
'padding:14px 18px;border:none;border-radius:12px;background:var(--sage-deep);color:var(--ivory);' +
'cursor:pointer;transition:background .3s,letter-spacing .3s,transform .3s;}' +
'.gate button:hover{background:var(--ink);letter-spacing:.24em;transform:translateY(-1px);}' +
'.gate__err{color:#b4604f;font-size:.86rem;margin:0;}' +
'</style></head><body>' +
'<main class="gate">' +
'<p class="gate__mono">J <span>&#10022;</span> L</p>' +
'<h1>Enter Site Password</h1>' +
'<p>hint: it&rsquo;s our dog&rsquo;s name in all caps</p>' +
'<form method="POST" action="/__auth" autocomplete="off">' +
'<input type="password" name="password" placeholder="Password" aria-label="Password" autofocus required />' +
(error ? '<p class="gate__err">That&rsquo;s not quite it &mdash; try again.</p>' : "") +
'<button type="submit">Enter</button>' +
'</form>' +
'</main></body></html>';
}
