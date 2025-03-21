export function stream(
  render: (req: Request) => Iterable<string> | AsyncIterable<string>,
) {
  return (req: Request) =>
    new Response(
      ReadableStream.from(render(req)).pipeThrough(new TextEncoderStream()),
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
}
