# part of ahx

_Experimental WIP_

See the [main blurb](https://github.com/jollytoad/ahx) for the bigger picture.

## Feature finding and loading functionality

The modules here provide the dynamic finding and loading functionality of
**ahx**.

## What is its purpose?

This provides a general purpose way to discover potential 'features' within a
data structure and load modules that can handle those features.

A more concrete example of this is to find custom attributes or elements within
a DOM and dynamically loading the behaviour for those. Allowing you to implement
your own hypermedia extensions without the druggery of building an
initialization process.

In **ahx** it's used to recurse the DOM, and CSSOM, dealing with the
peculiarities of shadow DOMs, find `on-*`, and `ahx-ignore` attributes, and
equivalent CSS properties. To initialize a `MutationObserver`, and to handle
`MutationRecord`s. Also, it's used to find and load the actions use in event
handling pipelines.

More generally it provides a way to dynamically load behaviour for features of
any data structure.

## Usage

The finder and loader is automatically wired up for standard **ahx**
functionality by the `initFeatures` function, but you can wire it up yourself
however you want for whatever purpose.

See the [example.ts](./example/example.ts) of how to perform your own custom
initialization using the finder and loader.
