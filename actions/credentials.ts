import type { ActionConstruct } from "@ahx/types";

export const credentials_create_publickey: ActionConstruct = (..._args) => {
  if (!isWebAuthnSupported()) {
    throw new TypeError("Web Authentication is not supported by this browser");
  }

  return async ({ response, jsonData, signal }) => {
    const data = jsonData ?? await response?.json();

    const credential = await navigator.credentials.create({
      publicKey: PublicKeyCredential.parseCreationOptionsFromJSON(data),
      signal,
    });

    if (credential) {
      return { jsonData: credential, request: undefined, response: undefined };
    } else {
      return { break: true };
    }
  };
};

export const credentials_get_publickey: ActionConstruct = (..._args) => {
  if (!isWebAuthnSupported()) {
    throw new TypeError("Web Authentication is not supported by this browser");
  }

  return async ({ response, jsonData, signal }) => {
    const data = jsonData ?? await response?.json();

    const credential = await navigator.credentials.get({
      publicKey: PublicKeyCredential.parseRequestOptionsFromJSON(data),
      signal,
    });

    if (credential) {
      return { jsonData: credential, request: undefined, response: undefined };
    } else {
      return { break: true };
    }
  };
};

function isWebAuthnSupported(): boolean {
  return "PublicKeyCredential" in globalThis &&
    typeof globalThis.PublicKeyCredential === "function";
}
