// Base URL the Next.js server uses to reach the API. Inside Docker the browser-facing
// NEXT_PUBLIC_API_URL points at localhost, which the web container cannot reach.
export const serverApiUrl =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5500";
