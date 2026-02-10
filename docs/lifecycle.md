# ahx lifecycle

This is an overview of the whole lifecycle of _ahx_ from page load to pipeline
execution, to handling of changes within the page.

## Assumptions

This document assumes that we are making use of import maps, and dynamic loading
of modules on demand via `import()`, and possibly using
[ES Module Shims](https://github.com/guybedford/es-module-shims) to support
multiple import maps and/or typescript on-the-fly.

Here is an example of the head elements required for this situation:

```html
<head>
  <script
    async
    src="https://ga.jspm.io/npm:es-module-shims@2.8.0/dist/es-module-shims.js"
  ></script>
  <script type="importmap-shim">
    {
      "imports": {
        "@ahx/": "https://cdn.jsdelivr.net/gh/jollytoad/ahx@0.5.0-alpha.13/"
      }
    }
  </script>
  <script type="module-shim">
    import "@ahx/init/mod.ts";
  </script>
</head>
```

Mapping of the `@ahx/` module scope is central to the lifecycle discussed here.

Alternative ways to load/bundle ahx maybe possible but beyond the scope of this
particular document at this point in time.

## Init

So the main entry point, as we can see above is
[`@ahx/init/mod.ts`](../init/mod.ts).

The `src` attribute of the `<script>` element is not mapped via the import map,
and so we use a static import from an inline script instead to kick things off.

This init module is very simple:

```ts
import { start } from "@ahx/core/start.ts";

start(document);
```

(you could just inline this if you prefer, instead of the init module)

`start()` is also incredibly simple...

```ts
const { initFeatures } = await import("./init-features.ts");
await initFeatures(document);
```

This is where we first encounter this concept of the **_Feature_**, and here we
are going to initialize all _Features_ found in the `document`.

## Features

_Features_ are things like custom attributes, custom elements, custom CSS
properties, that may introduce new behaviours into the document, and these
behaviours can be loaded and initialized on-demand, only when required.

_Features_ are responsible for all further aspects of _ahx_, including amongst
other things, the loading of dynamic modules, walking through the DOM and
stylesheets, registering event listeners, defining custom elements, and starting
a `MutationObserver` to find future _Features_.

_Feature_ setup consists of three stages: Finding, Loading, Initialization. All
performed within the `initFeatures()` call.

_Features_ are discovered by a set of **_Feature Detectors_**, and the set of
these is loaded from a constant bare module specifier
[`@ahx/custom/detectors`](../custom/detectors.ts), by the `initFeatures()`
function.

There is an out-of-the-box [`@ahx/custom/detectors`](../custom/detectors.ts)
module, but the convention is that any module under `@ahx/custom/` may be
remapped to an alternative module if you wish to customize something within
_ahx_. You could think of this as dependency injection via import map.

For example, to use the set of detectors without support for custom CSS
properties:

```json
{
  "imports": {
    ...
    "@ahx/custom/detectors.ts": "https://cdn.jsdelivr.net/gh/jollytoad/ahx@0.5.0-alpha.13/custom/detectors-no-css.ts"
  }
}
```

Let's delve a bit further into `initFeatures()`...

### Load the detectors

```ts
const { default: detectors } = await import("@ahx/custom/detectors.ts");
```

### Finding features

First we find _Features_ by creating a **_Feature Finder_**, giving it the set
of detectors...

```ts
finder = await createFeatureFinder(detectors);
```

The _finder_ takes a set of things (generally DOM nodes), and a context
(generally a root node), and will attempt to call each detector for each thing
it has been given (along with the context), and the detector may yield any
number of `Feature` declarations that represent the thing it has found and/or
indicators of what the finder should do next.

A declaration containing the `ignore: true` property, tells the finder that it
should stop processing the current node and move onto the next without calling
any further detectors.

A `children` property tells the finder to recurse into this new set of nodes
before continuing, and a `context` property can also change the context passed
within this recursion.

The declaration may contain many other properties to describe the _Feature_, a
common and important one, used later at the loading stage is the `bindings`
property, we'll cover this later.

At our point in time the finder is given the `document` as it's context, and as
a one node set of things.

So, effectively we are doing:

```ts
const features = finder([document], document);
```

So we need to hope there is a _Feature Detector_ that can handle a `Document`
node. For that we have
[`@ahx/detectors/recurse-document`](../detectors/recurse-document.ts)...

```ts
if (node instanceof Document) {
  yield {
    kind: "recurse",
    context: document.body,
    children: [document.documentElement],
  };
}
```

So this informs the finder to set the context to the `<body>` element, and
recurse into the first element of the document (ie. `<html>`), and again we need
to hope there is a detector that can handle this element. For which we have
[`@ahx/detectors/recurse-element`](../detectors/recurse-element.ts)...

```ts
if (node instanceof Element) {
  yield {
    kind: "recurse",
    context,
    children: node.childNodes,
  };
}
```

Again, this sends the finder into the child nodes of this element, and so the
process of finding continues, with each detector testing the given node, and
yielding the appropriate _Features_.

Sometimes many detectors may apply to a single node and therefore yield multiple
_Features_, in fact a single detector may itself yield multiple _Features_.

Things start to get interesting when we reach the `<body>`,
`<style>`/`<link rel="stylesheet">`, an element with a custom attribute, a
custom element, or a declarative shadow dom. I'll leave you to peruse the
default detectors to see most of these, but let's look at the
[`@ahx/detectors/custom-attr`](../detectors/custom-attr.ts) detector first...

```ts
if (node instanceof Element && node.hasAttributes()) {
  for (const attr of node.attributes) {
    if (attr.name.includes("-")) {
      yield {
        kind: "attr",
        context,
        attr,
        element: node,
        name: attr.name,
        value: attr.value,
        bindings: potentialBindings(attr.name.split("-")),
      };
    }
  }
}
```

This yields a _Feature_ for each attribute that contains a `-`, which we'll
consider as potential custom attributes that potentially have some associated
behaviour that can be dynamically loaded. The important details to note here are
the `kind: "attr"` and the `bindings`, let say we found the attribute
`on-magic-unicorn="..."`, the potential bindings for this will be:

```json
[
  ["on", "magic", "unicorn"],
  ["on", "magic"],
  ["on"]
]
```

And this will be used later by the loading stage.

So once, finder has exhausted all the things it was given to start with and to
recurse over, we return back into `initFeatures()` with a populated array of
`features`.

Note that the whole of the finding stage was entirely synchronous.

### Loading features

Next we need to load the new behaviours for all these discovered _Features_, and
we'll do that by creating a **_Feature Loader_**...

```ts
loader = createFeatureLoader();
```

and call the `loader` for each _Feature_ we now have.

The _Feature Loader_ will attempt to load the most appropriate module for each
_Feature_ and choose the most appropriate exported member of that module.

The _Feature Loader_ can be used independently of this lifecycle, and
reconfigured in variety of ways, in fact we will use it again later when
attempting to load action modules, but for now we will be describing the default
configuration.

A _Feature_ can only be loaded if specifies one or more `bindings` and a `kind`.

The loader will attempt to resolve a module for each binding using the following
pattern:

`@ahx/features/<kind>/<binding>`

So taking our `on-magic-unicorn` attribute example from above, it will try
resolving and then importing the module specifiers in order:

1. `@ahx/features/attr/on/magic/unicorn`
2. `@ahx/features/attr/on/magic`
3. `@ahx/features/attr/on`

(These binding can be filtered using an `allowBinding` function, loaded from
[`@ahx/custom/filter`](../custom/filter.ts), avoiding attempts to load modules
that are known to not exist)

If it manages to resolve and import one of these, it then looks for an exported
function with a name matching these bindings too, but also prioritising any name
supplied in the hash of the resolve module url, and then falling back to the
default export. So in our case, assuming no hash:

1. `on_magic_unicorn`
2. `on_magic`
3. `on`
4. `default`

If it fails to find an exported function, it'll still try the next module
specifier.

If a hash was supplied, then it looks for that and only that function in the
module.

Much of this is done asynchronously and concurrently, but ultimately results in
a `FeatureOutcome` for each `Feature`.

A `FeatureOutcome` may represent a successfully loaded feature (`FeatureLoaded`)
or a failure (`FeatureFailed`).

Failures are simply ignored, as the found _Features_ are really just potential
features, and don't necessarily have any associated behaviour that needs
loading. (maybe FeatureFailed is a bad name!)

### Initializing features

Each successfully loaded feature (`FeatureLoaded`) should have an `exportValue`
(the function that was found), this is the initialization function for the
feature, so we simply call the function and pass it the feature...

```ts
await exportValue(feature);
```

`initFeatures()` is an async function and will await the loading and
initializing of all features before returning, but it doesn't actually return
anything.

And that is the end of line for the initialization of _ahx_.

### Now what?

Where are event handlers registered, where do the pipelines get processed and
executed, where are the pipeline actions loaded, where are DOM mutations
handled?

Well all of these things are implemented as _Features_. It's _Features_ all the
way down.

So we need to back up a little and take a look at specific _Feature_ modules and
the [`@ahx/features/`](../features/) scope.

## 'on-' attributes (event handler pipelines)

Let's look at the [`@ahx/features/attr/on`](../features/attr/on.ts) module to
begin with, it exports a single default function, and it's this function that is
responsible for initializing each `on-` attribute discovered by the
`custom-attr` detector.

Once it determines that it is actually an _ahx_ `on` attribute, it creates or
updates a hypermedia control for the feature:

```ts
updateControl({
  root: feature.context,
  source: feature.element,
  eventType,
  pipelineStr: feature.value ?? "",
});
```

You'll find `updateControl` in
[`@ahx/core/update-control`](../core/update-control.ts), and we'll take a look
at that now...

### Hypermedia Controls

Each `on-*` attribute or `--on-*` css property creates a **_Control_**, defined
from a **_Pipeline_** of **_Actions_**.

Created _Controls_ are kept in a cache indexed by their **_Control Source_**,
which is the `Element` or `CSSStyleRule` in which they were defined, and the
**_Event Type_** that triggers them.

At our point in time (page loading) there shouldn't already be any existing
_Controls_, so we'll focus on the creation of the new _Control_.

There are a few main steps involved in creating the new _Control_:

1. Parse the _Pipeline_ string into individual _Actions_
2. Load the _Action_ modules
3. Construct the _Action_ functions
4. Create the `Control` object
5. Register the `EventListener`
6. Cache the _Control_
7. Dispatch a `ready` event

### Parsing

This is pretty simple, performed by
[`parsePipeline()`](../core/parse-pipeline.ts). The string is split on `|>` into
action strings, and these are split on whitespace, taking the first item as the
action name and the rest as action arguments.

### Loading Actions

Perform by [`createAction()`](../core/action.ts). We use our
[`createFeatureLoader()`](../core/feature-loader.ts) from earlier, but with a
slightly different configuration of the module pattern:

`@ahx/actions/<binding>` (but where binding uses `_` as a separator)

Potential bindings for an action are derived from the action name and simple
'name' arguments (ie. args that contain a restricted set of identifier friendly
characters).

So the action: `load stuff from https://foo.example.com quickly` will have the
potential bindings:

```json
[
  ["load", "stuff", "from"],
  ["load", "stuff"],
  ["load"]
]
```

The URL is deemed too complex, so it and the following args are discounted.

Now, like in the earlier feature loading stage, it will attempt to resolve and
load the following modules:

1. `@ahx/actions/load_stuff_from`
2. `@ahx/actions/load_stuff`
3. `@ahx/actions/load`

and then choose an exported function:

1. module hash (skipping further checks if the hash is present)
2. `load_stuff_from`
3. `load_stuff`
4. `load`
5. `default`

Again, this results in a `FeatureOutcome` as earlier, only failures are not
simply ignored, they will be throw as errors and cause the creation of the
_Control_ to fail.

### Constructing Actions

The function we now have, isn't the action _Action_, it's a construction
function for the _Action_. It will be called given the arguments and expected to
return a function that will eventually perform the actual _Action_. The
construction function should validate the args as best it can and immediately
throw an error if invalid.

```ts
const action = await exportValue(...args);
```

### Create the Control object

Once the _Pipeline_ of _Actions_ for a _Control_ have been loaded and
constructed, an actual `Control` object can be create (holding the array of
_Actions_). An internal class is used to represent the `Control` that exposes a
number of public methods.

### Registering the EventListener

The `Control` object implements the `EventListenerObject` interface, exposing a
`handleEvent()` function. It also exposes an `eventTarget` and `eventType`
property, so registering the event listener is simply a case of:

```ts
control.eventTarget.addEventListener(control.eventType, control);
```

We also dispatch a `setup` lifecycle event immediately following this.

(The `setup` and `teardown` events are mainly for auditing purposes, they should
not be used to trigger any major side-effects, the `ready` event is meant for
that purpose).

### Cache the Control

The created _Control_ (or rather the `Promise` of it) is stored in a map to
allow later update and teardown, and to prevent concurrent initialization of the
same _Control_.

### Dispatching the `ready` event

Once all _Controls_ have been created, a set of nodes is obtained from each
_Control_, these will be the elements on which the `on-*` attribute appeared, or
in the case of `--on-*` properties in CSS rules, these will be all elements that
currently match the CSS selector of the rule.

The `ready` event should only ever trigger once per _Control_, and is the
preferred event to listen for to perform initial actions within the document,
eg. loading some external content.

For example:

```html
<div on-ready="get lorem-ipsum |> swap inner"></div>
```

### Now what?

Ok, so what happens when an event occurs triggering the event listeners on our
_Controls_? And what about changes to the document, how are they handled?

First, let's address the event handling itself...

## Event Handling

If we go back to [`handleEvent()`](../core/control.ts), and the steps of the
execution of our _Pipeline_ of _Actions_:

1. Find the initial target
2. Create an initial `ActionContext`
3. Execute the _Pipeline_

### The initial target

First we determine if the pipeline should actually be executed at this time,
this depends on the type of the control (whether an 'element' control or 'rule'
control). And then find the actual initial target for the _Pipeline_.

For element controls (created via `on-*` attributes), the event listener would
have been registered on the element itself, and the initial target would be this
element.

For rule controls (created via `--on-*` css properties), the event listener was
added to a root node (generally `<body>` or a shadow root), and so we need to
check whether the rule actually applies to the current event target.

### Create an ActionContext

The `ActionContext` is the object that is passed from _Action_ to _Action_ in
the _Pipeline_, so we need to start with an initial value which contains our
initial `targets`. It also contains the `event` itself and the `control` object
amongst other things.

### Pipeline Execution

We are now ready to perform the actual execution of the _Pipeline_ by
[`execPipeline()`](../core/exec-pipeline.ts).

This really is just a loop, calling each _Action_, passing in the current
`ActionContext`.

An _Action_ function may return an `ActionResult` which determines what to do
next, either:

- merge the `ActionResult` into the `ActionContext` for the next _Action_,
  and/or
- initialise some new _Features_, or
- break the _Pipeline_ loop

The loop can be broken by returning a result of `{ break: true }`, or by
`abort()`'ing the `signal` within the `ActionContext`.

If you're looking at the code, you'll notice it also dispatches a couple of
events, `before` and `after` the actual _Action_ call. These are special events
that can be handled by rule controls to inject additional behaviour into all
pipelines, for example to sanitize content, or to prevent reading certain data
with the DOM or prevent modifications to certain areas within the DOM.

There are also logging calls made throughout the execution too.

But once the loop reaches the end of the _Pipeline_, or if it was broken that is
it.

_Oh_, wait, what about the new _Features_?

### Initialising new Features

If an `ActionResult` contains an `init` property (an array of things), the whole
`initFeatures()` lifecycle is kicked off for those things, exactly as we covered
earlier. This `init` property is not passed onto the next _Action_ though.

This is rarely needed though, as the majority of changes that would require the
finding of new _Features_ is handled by a `MutationObserver`.

One specific situation that isn't is the attachment of a shadow DOM, and so
`attach-shadow` is the only action that currently makes use of this.

And this brings us neatly onto...

## Mutations and new Features

When an _Action_ or maybe a script outside of _ahx_ control makes changes to the
DOM we need to scan for any new or changed _Features_.

We can make use of a
[`MutationObserver`](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
to watch for these changes, and as I've said before it's _Features_ all the way
down, so we create ours in a _Feature_.

Let's back up yet again to the feature finding stage, where we employ our
_Feature Detectors_. This time we'll look at
[`@ahx/detectors/observe-body`](../detectors/observe-body.ts):

```ts
if (node instanceof Element && node.localName === "body") {
  yield {
    kind: "observe",
    context: node,
    bindings: [[node.localName]],
  };
}
```

Which will result in the loading of the module:
[`@ahx/features/observe/body`](../features/observe/body.ts), which ultimately
creates a `MutationObserver`.

This `MutationObserver` doesn't attempt to process the mutations itself,
remember, it's _Features_ all the way down, so it simply passes all the
`MutationRecord`s to `initFeatures()` and relies on the detectors to handle
them.

[`@ahx/detectors/mutation-record`](../detectors/mutation-record.ts) will yield
the appropriate _Features_ for the changes it finds, eg. `recurse` into nodes,
an `attr` feature (including the old value this time).

This new _Features_ will continue through the same lifecycle as described above.

We've now reached the end of our lifecycle tour.
