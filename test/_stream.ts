export function stream(
  render: (req: Request) => Iterable<string> | AsyncIterable<string>,
) {
  return (req: Request) =>
    new Response(
      // @ts-expect-error ReadableStream.from seems to be missing!
      ReadableStream.from(render(req)).pipeThrough(new TextEncoderStream()),
      {
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
}
