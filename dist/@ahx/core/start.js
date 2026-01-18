export async function start(
  doc,
) {
  const { initFeatures } = await import("./init-features.js");
  await initFeatures(doc);
}
