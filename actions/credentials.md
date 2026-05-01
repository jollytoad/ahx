# Credential Management & Web Authentication API Actions

This action is a wrapper around the `navigator.credentials` functions.

## `credentials create publickey`

Create a Passkey using the Web Authentication API.

**Input**

- `jsonData` or `response` (with JSON data) - the public key option data for
  passing to `navigator.credentials.create()`, this is generally obtained from a
  GET request to the 'Rely Party' server.

**Output**

- `jsonData` - the `Credential` returned, this is generally passed into a POST
  request for verification.

## `credentials get publickey`

Get a Passkey using the Web Authentication API.

**Input**

- `jsonData` or `response` (with JSON data) - the public key option data for
  passing to `navigator.credentials.create()`, this is generally obtained from a
  GET request to the 'Rely Party' server.

**Output**

- `jsonData` - the `Credential` returned, this is generally passed into a POST
  request for verification.

## References

- [Credential Management API](https://developer.mozilla.org/en-US/docs/Web/API/Credential_Management_API)
- [Web Authentication API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API)
- [MDN Authentication Guides](https://developer.mozilla.org/en-US/docs/Web/Security/Authentication)
- [PublicKeyCredentialCreationOptions](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions)
