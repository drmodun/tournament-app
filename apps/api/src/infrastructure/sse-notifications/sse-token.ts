import { JwtService } from '@nestjs/jwt';

// Tokens for the notification stream travel in the URL (EventSource cannot send headers), so they
// are short-lived and signed with their own secret: one copied from a log cannot be used as a login.
export const SSE_TOKEN_TTL = '5m';
const SSE_TOKEN_PURPOSE = 'sse';

const sseSecret = () =>
  process.env.SSE_TOKEN_SECRET || `${process.env.JWT_SECRET}:sse`;

export function signSseToken(jwtService: JwtService, userId: number) {
  return jwtService.signAsync(
    { sub: userId, purpose: SSE_TOKEN_PURPOSE },
    { secret: sseSecret(), expiresIn: SSE_TOKEN_TTL },
  );
}

// The user id the token was issued to, or null when it is invalid or expired
export async function verifySseToken(
  jwtService: JwtService,
  token: string,
): Promise<number | null> {
  try {
    const payload = await jwtService.verifyAsync<{
      sub: number;
      purpose: string;
    }>(token, { secret: sseSecret() });

    return payload.purpose === SSE_TOKEN_PURPOSE ? payload.sub : null;
  } catch {
    return null;
  }
}
