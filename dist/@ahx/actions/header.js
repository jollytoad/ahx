

export const header = (...args) => {
  if (!args[0] && !args[1]) {
    throw new TypeError("A header name and value is required");
  }
  const name = args[0];
  const value = args.slice(1).join(" ");

  return ({ request }) => {
    if (request instanceof Request) {
      request = undefined;
    }
    request ??= {};
    request.headers ??= new Headers();
    if (!(request.headers instanceof Headers)) {
      request.headers = new Headers(request.headers);
    }
    request.headers.append(name, value);

    return { request };
  };
};
