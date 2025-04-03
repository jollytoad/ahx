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
  const form = node instanceof HTMLFormElement
    ? node
    : node && "form" in node && node.form instanceof HTMLFormElement
    ? node.form
    : node instanceof Element
    ? node.closest("form")
    : null;

  if (form) {
    const submitter = event instanceof SubmitEvent && event.submitter
      ? event.submitter
      : node instanceof Element
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
