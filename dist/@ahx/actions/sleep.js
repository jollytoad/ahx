

export const sleep = (...args) => {
  const [durationStr = "0"] = args;
  const duration = parseInt(durationStr);

  return ({ signal }) => {
    if (signal?.aborted) return Promise.resolve({ break: true });

    return new Promise((resolve) => {
      function abort() {
        clearTimeout(handle);
        resolve({ break: true });
      }

      function done() {
        signal?.removeEventListener("abort", abort);
        resolve({});
      }

      const handle = setTimeout(done, duration);
      signal?.addEventListener("abort", abort, { once: true });
    });
  };
};
