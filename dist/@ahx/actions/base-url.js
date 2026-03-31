

export const baseUrl = (...args) => {
  const [baseURL] = args;

  if (!baseURL) {
    throw new TypeError("A url or keyword (@control, @target) is required");
  }

  return () => {
    return { baseURL };
  };
};

export default baseUrl;
