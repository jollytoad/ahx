

export function dispatchToAll(
  targets,
  createEvent,
) {
  if (!targets?.length) return;

  let shouldBreak = false;

  for (const target of targets) {
    const event = createEvent(target);

    if (target.dispatchEvent(event) === false) {
      shouldBreak = true;
    }
  }

  return shouldBreak ? { break: true } : undefined;
}
