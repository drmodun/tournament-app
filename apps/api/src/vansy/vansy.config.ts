// Settings for the Vansy exam platform. Without VANSY_URL and VANSY_PRIVATE_KEY the integration is
// off and its endpoints answer 503.
export interface VansyConfig {
  // Vansy's API as this server reaches it, e.g. http://vansy-api:5600 or https://quiz.example/api
  url: string;
  tenantId: string;
  // This app's Ed25519 private JWK; its public half is registered in Vansy's tenant file
  privateKey: string;
  // Vansy's public JWK for webhook signatures; fetched from Vansy's JWKS when not set
  publicKey: string | null;
  // Where launches send people back to
  frontendUrl: string;
}

export const VANSY_CONFIG = Symbol('VANSY_CONFIG');

export function readVansyConfig(env = process.env): VansyConfig | null {
  if (!env.VANSY_URL || !env.VANSY_PRIVATE_KEY) {
    return null;
  }

  return {
    url: env.VANSY_URL.replace(/\/$/, ''),
    tenantId: env.VANSY_TENANT_ID || 'tournaments',
    privateKey: env.VANSY_PRIVATE_KEY,
    publicKey: env.VANSY_PUBLIC_KEY || null,
    frontendUrl: (env.FRONTEND_URL || 'http://localhost:3000').replace(
      /\/$/,
      '',
    ),
  };
}
