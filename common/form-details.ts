import { isElement } from "./guards.ts";

export interface FormDetails {
  formData: FormData;
  request: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: FormData | URLSearchParams;
  };
}

export function getFormDetails(
  node?: EventTarget | null,
  event?: Event,
): FormDetails | undefined {
  const form = isElement<HTMLFormElement>(node, "form")
    ? node
    : node && "form" in node && isElement<HTMLFormElement>(node.form, "form")
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
    let body: BodyInit = formData;

    const headers: Record<string, string> = {};

    if (enctype === "application/x-www-form-urlencoded") {
      // deno-lint-ignore no-explicit-any
      body = new URLSearchParams(formData as any);
      headers["content-type"] = enctype;
    }

    return { formData, request: { url, method, headers, body } };
  }
}
