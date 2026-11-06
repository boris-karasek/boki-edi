// Answers /products and /contact (on printed material and in sent e-mails) with a permanent 308, as on
// Vercel, and sends /index.html to /. Netlify's redirect rules can't be relied on for 308: its docs list
// only 301, 302, 404 and 200, and call 307 unsupported. An edge function sets the status itself.
// If it fails, the request continues to the 301 rules in netlify.toml, so the old URLs still work.
const TARGETS = {
  "/products": "/#proizvodi",
  "/contact": "/#kontakt",
  "/index.html": "/",
};

export default (request) => {
  const { pathname, search } = new URL(request.url);
  const [target, hash] = TARGETS[pathname.replace(/\/$/, "")].split("#");
  return new Response(null, {
    status: 308,
    headers: {
      // Like Vercel: the query stays, and the browser asks again next time instead of caching the redirect
      Location: `${target}${search}${hash ? `#${hash}` : ""}`,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
};

export const config = {
  path: ["/products", "/products/", "/contact", "/contact/", "/index.html"],
  onError: "bypass",
};
