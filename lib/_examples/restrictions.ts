// Example of how a host app could listen for events and veto operations

export function setupRestrictions() {
  addEventListener("ahx:trigger", (event) => {
    const { targetOwner, controlOwner } = event.detail;
    if (targetOwner !== controlOwner) {
      veto(
        event,
        `The control owner does not own the target element: ${controlOwner} != ${targetOwner}`,
      );
    }
  });
}

function veto(event: CustomEvent, reason: string) {
  event.detail.reason = reason;
  event.preventDefault();
}
