/**
 * Start the observer and find all hypermedia controls.
 */
export async function start(
  doc: Document,
): Promise<void> {
  console.log("start");
  const { initFeatures } = await import("../common/init-features.ts");
  await initFeatures(doc);
}
