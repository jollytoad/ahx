

const done = new WeakSet();

export const once = () => ({ control }) => {
  if (done.has(control)) {
    return { break: true };
  } else {
    done.add(control);
  }
};
