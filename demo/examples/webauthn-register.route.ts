import {
  generateRegistrationOptions,
  type GenerateRegistrationOptionsOpts,
  type RegistrationResponseJSON,
  type VerifiedRegistrationResponse,
  verifyRegistrationResponse,
  type VerifyRegistrationResponseOpts,
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

  const user = inMemoryUserDB[loggedInUserId]!;

  const {
    /**
     * The username can be a human-readable name, email, etc... as it is intended only for display.
     */
    username,
    credentials,
  } = user;

  const opts: GenerateRegistrationOptionsOpts = {
    rpName: "SimpleWebAuthn Example",
    rpID,
    userName: username,
    timeout: 60000,
    attestationType: "none",
    /**
     * Passing in a user's list of already-registered credential IDs here prevents users from
     * registering the same authenticator multiple times. The authenticator will simply throw an
     * error in the browser if it's asked to perform registration when it recognizes one of the
     * credential ID's.
     */
    excludeCredentials: credentials.map((cred) => ({
      id: cred.id,
      type: "public-key",
      transports: cred.transports,
    })),
    authenticatorSelection: {
      residentKey: "discouraged",
      /**
       * Wondering why user verification isn't required? See here:
       *
       * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
       */
      userVerification: "preferred",
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  };

  const options = await generateRegistrationOptions(opts);

  let headers: Headers | undefined = undefined;

  if (!session) {
    session = {};
    headers = addSession(session);
  }

  /**
   * The server needs to temporarily remember this value for verification, so don't lose it until
   * after you verify the registration response.
   */
  session.currentChallenge = options.challenge;

  return Response.json(options, { headers });
}

export async function POST(req: Request): Promise<Response> {
  const body: RegistrationResponseJSON = await getBodyAsObject(req);

  const user = inMemoryUserDB[loggedInUserId]!;

  const session = getSession(req);

  const expectedChallenge = session?.currentChallenge;

  let verification: VerifiedRegistrationResponse;
  try {
    const opts: VerifyRegistrationResponseOpts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    };
    verification = await verifyRegistrationResponse(opts);
  } catch (error) {
    const _error = error as Error;
    console.error(_error);
    return Response.json({ error: _error.message }, { status: 400 });
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credential } = registrationInfo;

    const existingCredential = user.credentials.find((cred) =>
      cred.id === credential.id
    );

    if (!existingCredential) {
      /**
       * Add the returned credential to the user's list of credentials
       */
      const newCredential: WebAuthnCredential = {
        id: credential.id,
        publicKey: credential.publicKey,
        counter: credential.counter,
        transports: body.response.transports,
      };
      user.credentials.push(newCredential);
    }
  }

  if (session) {
    session.currentChallenge = undefined;
  }

  return Response.json({ verified });
}
