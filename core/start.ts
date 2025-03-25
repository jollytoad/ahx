/**
 * Start the observer and find all hypermedia controls.
 */
export async function start(
  doc: Document,
): Promise<void> {
  const { initFeatures } = await import("./init-features.ts");
  await initFeatures(doc);
}
