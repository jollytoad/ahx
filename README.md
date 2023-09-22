# ahx - Augmented Hypermedia Extensions

**ahx** is a set of HTML & CSS extensions to allow _augmentation_ of a web app,
by an untrusted third party HTTP service. It forms part of a larger addon
system.

It is heavily based on [htmx], but is much more restrictive, in that it does NOT
allow any kind of scripting.

_ahx_ is not designed as an alternative for _htmx_, it's a system to allow third
party hypermedia to be seamlessly integrated into a host web application, using
the declarative concepts of _htmx_.

So if you aren't familiar with [htmx], it's worth checking it out first, and
then come back here.

I also recommend reading [Hypermedia Systems].

[htmx]: https://htmx.org
[Hypermedia Systems]: https://hypermedia.systems

## CSS extensions

The main way for a third party to declare it's intentions and provide it's
_augmentations_ is via a set of CSS rule extensions. This is where _ahx_ really
diverges from regular _htmx_ behaviour.

This is easiest to explain with an example, here we have a snippet of CSS
supplied from a third party that declares that it want's to load some additional
content appended into the table row.

```css
table.stuff tbody tr {
  --ahx-trigger: load once;
  --ahx-get: url("./extra-stuff-td");
  --ahx-swap: beforeend;
}
```

## Why not just use htmx?

Well we did initially use _htmx_ in our proof of concept, but we had to add
extensions to deal with CSS rules and mutations from other frameworks. _htmx_ is
designed to provide the rich hypermedia experience to the host app, and has a
certain degree of configurability built in. If we used _htmx_ itself for the
_augmented_ hypermedia we'd need to lock down the configuration, this would be
problematic if the host app wanted to also use _htmx_. We wouldn't want to clash
with that.

Also, our system relies heavily on applying hypermedia controls via rules and
not just attributes, and needs to work seamless with any other frontend
frameworks, relying heavily on observation of DOM mutations.

## Is this a fork of htmx?

No, the core of _ahx_ has been written from the ground up. It does attempt to
follow _htmx_ concepts and conventions as closely as possible where appropriate.
So some code, mainly attribute parsing, has been copied directly from _htmx_ and
adapted to our codebase.

_ahx_ is written in modular TypeScript, and uses Deno for tooling.
