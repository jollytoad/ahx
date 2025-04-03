/**
 * The result object that an Action can return.
 * This is merged into the ActionContext before being
 * passed to the next action in a pipeline.
 */
export interface ActionResult {
  /**
   * The target for any DOM actions
   */
  targets?: Node[];
  /**
   * A text representation of the payload.
   */
  texts?: string[];
  /**
   * A DOM Nodes payload (should be accompanied by a text payload if possible)
   */
  nodes?: Array<Node> | NodeList | Iterable<Node> | AsyncIterable<Node>;
  /**
   * Prep for a future fetch request, or a Request that has been made.
   */
  request?: Request | (RequestInit & { url?: string | URL });
  /**
   * Response from a fetch.
   */
  response?: Response;
  /**
   * FormData for use in a fetch request.
   */
  formData?: FormData;
  /**
   * JSON data for use in a fetch request.
   */
  jsonData?: unknown; // should be json compatible
  /**
   * Stop processing the pipeline.
   */
  break?: boolean;
  /**
   * Things to be initialized.
   */
  init?: unknown[];
}
