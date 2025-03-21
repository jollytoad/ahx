# _ahx_ - _A_ Hypermedia Extension library

**Experimental work in progress**

Heavily inspired by the amazing [htmx](https://htmx.org), this library explores
the idea of turning any element (or CSS rule) into a hypermedia control through
a declarative pipeline syntax.

The **A** can stand for:

- **Alternative** - an alternative to htmx.
- **Adaptable** - many parts of the system can be adapted and extended through
  the use of import maps, actions are dynamically loaded as needed, and can be
  composed in any order via the pipeline syntax, and new actions can be easily
  implemented as required.
- **Augmented** - augment a web app with new or third party features, with
  hypermedia controls declared via a set of rules rather than just inline within
  the document.
- **Auditing** - controls emit a series of lifecycle events, to allow auditing
  and restriction of actions.
- insert **Adjective** here (some suggestions: **Awesome**/**Amazing**)

## Shut up and show me an example

Turn any element into a hypermedia control using a single attribute:

```html
<span on-click="get /stuff.html |> swap outer">Click to load</span>
```

Or, apply behaviour to many elements by turning a CSS rule into a hypermedia
control:

```css
.load-me {
  --on-click: get /stuff.html |> swap outer;
}
```

## Generalizing the hypermedia control definition in a single string

htmx provides a set of attributes to define a hypermedia control, in which the
above example would be:

```html
<span
  hx-trigger="click"
  hx-get="/stuff.html"
  hx-swap="outerHTML"
  hx-target="this"
>Click to load</span>
```

This declares that on a click event, we should perform a get request and then
replace this element with the response.

Although some of the attributes given here could be omitted and implied by
default, and/or could be provided in any order.

Despite the declaration via attributes, under the covers htmx still has a
pipeline of actions happening, albeit these actions and their order is pretty
much hardcoded and inflexible.

Having separate attributes define parts of the pipeline means that you can
effectively only have one hypermedia control declared, although this can handle
multiple events, they can all only perform the same actions.

If we instead allow the pipeline of actions to be declared in a single
attribute, we can remove this hardcoding from the core of the system, and allow
multiple controls per element, performing different actions for different
events.

And by allowing controls to be declared as rules (in CSS for now), we can remove
the limitation of one control per event, and reduce repetition of code, and open
up the possibility of augmentation via hypermedia controls.

## Dynamic actions

The core of this new system deals only with finding these pipeline attributes
(at initializing and following DOM mutations), parsing them, and adding/updating
listeners that execute the pipeline.

The actions themselves can be supplied independently from the core, as
dynamically imported modules on demand, and only when required.

Rather than just performing requests and mutating the page, we can introduce
actions that do much more, such as harvest data from the page to pass into
requests, fetch non-html responses and feed them into templates or into further
requests, and utilize other web APIs, audio or history APIs for example, without
having special cases in the core, or additional attributes or extension
mechanisms.

Many actions can be implemented in a consist manner and used within a pipeline.

It also gives us room to experiment with behaviour and styles of composition.

For example, we could experiment by expressing the above example like this:

```html
<span on-click="url /stuff.html |> get |> target this |> replace outerHTML">
```

Without any core changes, just by mapping actions to alternative modules.

## Action arguments and context

Each action in the pipeline can accept a set of string arguments to configure
itself as necessary, these are just literal values, for example a URL, a mode of
operation, or a CSS selector.

What actually flows through the pipeline from action to action is a context
object, which can be updated/augmented by each action that it passes through.

Actions are generally considered to be side-effecting and can be synchronous or
asynchronous, the output from each action is awaited and merged into the
context, which is then passed to the next action in the pipeline.

Actions may throw errors, or just stop the pipeline early.

The `once` action for example, is implemented by remembering whether the
pipeline has already been called on the target element and either passing on, or
breaking the flow. This saves having a special case, or flag to register the
listener as _once_.

```html
<span on-click="once |> get /stuff.html |> swap">
```

Actions can return other useful information to the context, so for example, the
`get` request can return not just the `Response`, but also the `Request`. We
could then have another action in the pipeline that attempts retries of the
request if it fails:

```html
<span on-click="get /stuff.html |> retry 3 |> swap">
```

And/or triggers some other event on failure or even success:

```html
<span
  on-click="get /stuff.html |> retry 3 |> response-trigger success failed"
  on-success="replace this"
  on-failed="copy #response-failed-msg |> append-to #notifications |> sleep 5 |> remove">
```

(NOTE: These actions don't currently exist, they are just examples of what could
be implemented)

## Intercepting/auditing actions

The input and output of each action can also be intercepted. Special
`ActionEvent`s are dispatched before and after each action is perform, these
events can be cancelled, stopping the pipeline in its track, or alternative
results can be returned, overriding the context passed into the action or the
result returned from the action. This mechanism can be used to restrict the
abilities of controls supplied from third-party content. And because these are
simply events, pipelines for these can be declared via attributes or CSS rules,
`on-before-swap` for example.

NOTE: these events are dispatched on the root of the ahx instance, usually
`body`, and do **not** bubble. Also, actions within these pipelines will **not**
in turn dispatch before/after events, to avoid infinite loops.

## Simple parsing

The pipeline parser is incredibly simple, it just splits on `|>` to separate
each action, and then splits on whitespace to separate the action name and the
individual args.

There are no other operators, expressions, variables, quotes or grouping tokens.

URLs shouldn't contain whitespace, so can be a single arg. CSS selectors can be
reconstructed from the remaining args of an action.

Action names must match the regular expression: `[a-z][a-z0-9\-]*` (that's a
single letter `a-z`, followed by zero or more of `a-z`, `0-9`, or `-`, note that
only lowercase letters are permitted).

NOTE: the pipe token `|>` must have at least one whitespace either side.

## Action loading via Import maps

The dynamic loading of actions relies on an import map to declare what module
the action can be found in.

So for example:

```json
{
  "imports": {
    "$action/get": "http://example.com/actions/request.ts"
  }
}
```

Declares that the `get` action can be found by importing the given module URL,
and looking for an exported function named `get` or the `default` function. (A
hash may be added to the URL to explicitly declare which exported function to
use)

This means that actions that are not require won't get loaded, and stable
modules can be cached for a long time.

The action module loader will also attempt for look for more specialized
variants of an action based on it's arguments.

For example, given the following action:

`foo bar load /something.html other`

It'll take all initial args that match a 'name' token, in this case:
`foo bar load`, ignoring `/something.html` and following args.

Then try to resolve and import the following modules in order:

- `$action/foo_bar_load`
- `$action/foo_bar`
- `$action/foo`

relying on the native JS module loader to resolve these via an import map to a
real module URL. (NOTE: `$action/` prefix is configurable)

once it has a module, it'll again look for the functions of the same name in
order:

- `foo_bar_load()`
- `foo_bar()`
- `foo()`
- `default()` - falling back to the default export if present

unless a `#hash` was present on the resolved module URL, in which case it'll
look only for a function that exactly matches the hash value.
