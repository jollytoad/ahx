

export const url = (...args) => {
  if (!args[0]) {
    throw new TypeError("A HTTP method is required");
  }
  const method = args[0];

  return ({ request }) => {
    if (request instanceof Request) {
      request = undefined;
    }
    request ??= {};
    request.method = method;

    return { request };
  };
};
