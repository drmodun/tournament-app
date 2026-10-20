// CORS_ORIGIN is a comma-separated allow-list. Without it, production only allows the frontend
// (FRONTEND_URL) and development allows every origin.
export function getCorsOrigin(env: NodeJS.ProcessEnv = process.env) {
  const configured = env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configured?.length) {
    return configured;
  }

  if (env.MODE === 'production' && env.FRONTEND_URL) {
    return [env.FRONTEND_URL];
  }

  return true;
}
