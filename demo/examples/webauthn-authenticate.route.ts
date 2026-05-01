import {
  type AuthenticationResponseJSON,
  generateAuthenticationOptions,
  type GenerateAuthenticationOptionsOpts,
  type VerifiedAuthenticationResponse,
  verifyAuthenticationResponse,
  type VerifyAuthenticationResponseOpts,
  type WebAuthnCredential,
} from "@simplewebauthn/server";
import {
  addSession,
  expectedOrigin,
  getSession,
  inMemoryUserDB,
  loggedInUserId,
  rpID,
} from "./_webauthn.ts";
import { getBodyAsObject } from "@http/request/body-as-object";

export async function GET(req: Request): Promise<Response> {
  let session = getSession(req);

  // You need to know the user by this point
  const user = inMemoryUserDB[loggedInUserId];

  const opts: GenerateAuthenticationOptionsOpts = {
    timeout: 60000,
    allowCredentials: user?.credentials.map((cred) => ({
      id: cred.id,
      type: "public-key",
      transports: cred.transports,
    })),
    /**
     * Wondering why user verification isn't required? See here:
     *
     * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
     */
    userVerification: "preferred",
    rpID,
  };

  const options = await generateAuthenticationOptions(opts);

  let headers: Headers | undefined = undefined;

  if (!session) {
    session = {};
    headers = addSession(session);
  }

  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify the authentication response.
   */
  session.currentChallenge = options.challenge;

  return Response.json(options, { headers });
}

export async function POST(req: Request): Promise<Response> {
  const body: AuthenticationResponseJSON = await getBodyAsObject(req);

  const user = inMemoryUserDB[loggedInUserId]!;

  const session = getSession(req);

  const expectedChallenge = session?.currentChallenge;

  let dbCredential: WebAuthnCredential | undefined;

  // "Query the DB" here for a credential matching `cred.id`
  for (const cred of user.credentials) {
    if (cred.id === body.id) {
      dbCredential = cred;
      break;
    }
  }

  if (!dbCredential) {
    return Response.json({
      error: "Authenticator is not registered with this site",
    }, { status: 400 });
  }

  let verification: VerifiedAuthenticationResponse;
  try {
    const opts: VerifyAuthenticationResponseOpts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      credential: dbCredential,
      requireUserVerification: false,
    };
    verification = await verifyAuthenticationResponse(opts);
  } catch (error) {
    const _error = error as Error;
    console.error(_error);
    return Response.json({ error: _error.message }, { status: 400 });
  }

  const { verified, authenticationInfo } = verification;

  if (verified) {
    // Update the credential's counter in the DB to the newest count in the authentication
    dbCredential.counter = authenticationInfo.newCounter;
  }

  if (session) {
    delete session.currentChallenge;
  }

  return Response.json({ verified });
}
