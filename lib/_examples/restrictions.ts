// Example of how a host app could listen for events and veto operations

export function setupRestrictions(document: Document) {
  document.addEventListener("ahx:handleTrigger", (event) => {
    const { targetOwner, originOwner } = event.detail;
    if (targetOwner !== originOwner) {
      veto(
        event,
        `Target element is not owned by trigger origin: ${targetOwner} != ${originOwner}`,
      );
    }
  });
}

function veto(event: CustomEvent, reason: string) {
  event.detail.reason = reason;
  event.preventDefault();
}
