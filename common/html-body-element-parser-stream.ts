/**
 * Parse a stream of HTML into Elements.
 *
 * Only emits child elements of the body once the parser moves
 * onto the next child element. All head elements are ignored,
 * as are non-element child nodes of the body (eg. comments, character data).
 *
 * The stream can be a series of individual HTML elements, not necessarily
 * enclosed within `<html>`/`<body>` tags, but proceeded by `<!DOCTYPE html>`,
 * and this would be a perfectly valid HTML5 document (as far as the parser
 * is concerned at least).
 *
 * @example
 * response.body
 *   .pipeThrough(new TextDecoderStream())
 *   .pipeThrough(new HTMLBodyElementParserStream(document));
 */
export class HTMLBodyElementParserStream
  extends TransformStream<string, Element> {
  /**
   * @param document will own the emitted elements
   * @param template extract content out of a template element
   */
  constructor(document: Document, template: boolean) {
    let parser: Document;
    let container: ParentNode | undefined;

    super({
      start() {
        // Create a temporary empty document to perform the parsing
        parser = document.implementation.createHTMLDocument();
      },

      transform(chunk, controller) {
        // Write each chunk into the document
        parser.write(chunk);

        // Determine the container once the first element is written
        if (!container && parser.body?.childElementCount > 0) {
          const element = parser.body.children[0];
          if (template && element instanceof HTMLTemplateElement) {
            // Set the container to the DocumentFragment in the template
            container = element.content;
          } else {
            // Set the container to the body
            container = parser.body;
          }
        }

        // Once we have more than one element in the body we
        // assume that all but the last element are complete
        while (container && container.childElementCount > 1) {
          // Get the first element from the body
          const element = container.children[0]!;

          // Transfer the element ownership to the target document,
          // this will also remove it from the body of the parser document
          document.adoptNode(element);

          // Emit the Element from the transformer
          controller.enqueue(element);
        }
      },

      flush(controller) {
        // Transfer and emit any remaining elements from the body
        for (const element of [...container?.children ?? []]) {
          document.adoptNode(element);
          controller.enqueue(element);
        }
        // Close the document for writing
        parser.close();
        (parser as unknown) = undefined;
        container = undefined;
      },
    });
  }
}
