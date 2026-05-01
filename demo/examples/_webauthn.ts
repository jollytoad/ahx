import type { WebAuthnCredential } from "@simplewebauthn/server";
import { getCookies, setCookie } from "@std/http/cookie";

export interface LoggedInUser {
  id: string;
  username: string;
  credentials: WebAuthnCredential[];
}

/**
 * RP ID represents the "scope" of websites on which a credential should be usable. The Origin
 * represents the expected URL from which registration or authentication occurs.
 */
export const rpID = "localhost";
// This value is set at the bottom of page as part of server initialization (the empty string is
// to appease TypeScript until we determine the expected origin based on whether or not HTTPS
// support is enabled)
export const expectedOrigin = "https://localhost:8000";

/**
 * 2FA and Passwordless WebAuthn flows expect you to be able to uniquely identify the user that
 * performs registration or authentication. The user ID you specify here should be your internal,
 * _unique_ ID for that user (uuid, etc...). Avoid using identifying information here, like email
 * addresses, as it may be stored within the credential.
 *
 * Here, the example server assumes the following user has completed login:
 */
export const loggedInUserId = "internalUserId";

export const inMemoryUserDB: { [loggedInUserId: string]: LoggedInUser } = {
  [loggedInUserId]: {
    id: loggedInUserId,
    username: `user@${rpID}`,
    credentials: [],
  },
};

export interface WebAuthnSession {
  currentChallenge?: string;
}

export const sessions = new Map<string, WebAuthnSession>();

export function getSession(req: Request): WebAuthnSession | undefined {
  const cookies = getCookies(req.headers);

  return cookies.sessionId ? sessions.get(cookies.sessionId) : undefined;
}

export function addSession(
  session: WebAuthnSession,
  headers = new Headers(),
): Headers {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, session);
  setCookie(headers, {
    name: "sessionId",
    value: sessionId,
    maxAge: 86_400_000,
    httpOnly: true,
  });
  return headers;
}
