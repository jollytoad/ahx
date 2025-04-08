# part of ahx

_VERY Experimental WIP_

## Pre-render on-ready controls

This is an experiment into server-side/build-time execution of `on-ready`
controls.

It's currently very limited, allowing only `get` and `swap` actions.

It will parse HTML to DOM and perform a feature initialization for `on-ready`
attribute only (and recursive decent).

As it find this, it creates the control and executes the pipeline immediately
awaiting completion, and then removes the attribute.

It does not currently handle `--on-ready` CSS properties.

To try out pre-render mode in the demo:

```sh
deno task start:prerender
```
