import { objectsWithInternal } from "../internal.ts";

export function forms() {
  console.group("AHX Forms");

  for (const [form, formData] of objectsWithInternal("formData")) {
    if (form instanceof Element) {
      console.group(form);
      for (const [name, value] of formData) {
        console.log("%s: %c%s", name, "font-weight: bold", value);
      }
      console.groupEnd();
    }
  }

  console.groupEnd();
}
