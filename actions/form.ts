import type { ActionConstruct } from "@ahx/types";

const formRequest: ActionConstruct = () => {
  return ({ event }) => {
    const submitter = event instanceof SubmitEvent ? event.submitter : null;
    const form = event.target instanceof HTMLFormElement ? event.target : null;

    if (form) {
      const method = submitter?.getAttribute("formmethod") ?? form.method;
      const url = submitter?.getAttribute("formaction") ?? form.action;
      const formData = new FormData(form);

      const request = new Request(url, {
        method: method,
        body: formData,
      });

      return { formData, request };
    }
  };
};

export default formRequest;
