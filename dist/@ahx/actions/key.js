

export const key = (...keyNames) => {
  if (!keyNames.length) {
    throw new TypeError("At least one key name is required");
  }

  return ({ event }) => {
    if (event instanceof KeyboardEvent && keyNames.includes(event.key)) {
      return;
    }
    return { break: true };
  };
};
