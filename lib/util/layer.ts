// NOTE: This isn't currently used

export function isInLayer(rule: CSSRule, layerName: string) {
  if (rule instanceof CSSLayerBlockRule) {
    if (rule.name === layerName) {
      return true;
    }
  } else if (rule instanceof CSSImportRule) {
    if (rule.layerName === layerName) {
      return true;
    }
  }
  if (rule.parentRule) {
    return isInLayer(rule.parentRule, layerName);
  }
  if (rule.parentStyleSheet && rule.parentStyleSheet.ownerRule) {
    return isInLayer(rule.parentStyleSheet.ownerRule, layerName);
  }
  return false;
}
