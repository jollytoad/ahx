import { isElement } from "./guards.js";

export function getFormDetails(
  node,
  event,
) {
  const form = isElement(node, "form")
    ? node
    : node && "form" in node && isElement(node.form, "form")
    ? node.form
    : isElement(node)
    ? node.closest("form")
    : null;

  if (form) {
    const submitter = event instanceof SubmitEvent && event.submitter
      ? event.submitter
      : isElement(node)
      ? node
      : null;
    const method = submitter?.getAttribute("formmethod") ?? form.method;
    const url = submitter?.getAttribute("formaction") ?? form.action;
    const enctype = submitter?.getAttribute("formenctype") ?? form.enctype;

    const formData = new FormData(form);
    let body = formData;

    const headers = {};

    if (enctype === "application/x-www-form-urlencoded") {
            body = new URLSearchParams(formData);
      headers["content-type"] = enctype;
    }

    return { formData, request: { url, method, headers, body } };
  }
}
