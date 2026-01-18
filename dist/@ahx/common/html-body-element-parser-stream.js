export class HTMLBodyElementParserStream
  extends TransformStream {
    constructor(document, template) {
    let parser;
    let container;

    super({
      start() {
                parser = document.implementation.createHTMLDocument();
      },

      transform(chunk, controller) {
                parser.write(chunk);

                if (!container && parser.body?.childElementCount > 0) {
          const element = parser.body.children[0];
          if (template && element instanceof HTMLTemplateElement) {
                        container = element.content;
          } else {
                        container = parser.body;
          }
        }

                        while (container && container.childElementCount > 1) {
                    const element = container.children[0];

                              document.adoptNode(element);

                    controller.enqueue(element);
        }
      },

      flush(controller) {
                for (const element of [...container?.children ?? []]) {
          document.adoptNode(element);
          controller.enqueue(element);
        }
                parser.close();
        (parser) = undefined;
        container = undefined;
      },
    });
  }
}
