# Testing the AHX library

As this library is very much intended to run in browser and across different
browsers, all tests are implemented using [Playwright](https://playwright.dev/)
to ensure test conditions are as realistic as possible.

## Pre-requisites

Unfortunately Playwright
[doesn't work](https://github.com/denoland/deno/issues/16899) with Deno yet, so
we have to rely on Node still.

## Using pkgx (optional)

If you don't already have node available I highly recommend using
[pkgx](https://pkgx.sh/) and it's [dev](https://docs.pkgx.sh/using-dev/dev)
environment.

After [installing pkg](https://docs.pkgx.sh/run-anywhere/terminals), you need to
integrate it will your shell (you only need to do this once)...

```sh
pkgx integrate
```

And then activate the development environment, in the root of this project...

```sh
dev
```

This will ensure all necessary tools (eg. `node`) are available from your shell
whenever you visit this project.

Now the tools are available, first you may need to run:

```sh
yarn install
```

but thanks to yarn
[zero installs](https://yarnpkg.com/features/caching#zero-installs) this should
be pretty much instantaneous.

## Running tests

The simplest way to run all tests is...

```sh
deno task test
```

and you can open the Playwright test UI with...

```sh
deno task test --ui
```
