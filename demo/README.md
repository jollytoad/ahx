# part of ahx

_Experimental WIP_

See the [main blurb](https://github.com/jollytoad/ahx) for the bigger picture.

## Demo app

This a Deno based app for demonstrating and testing **ahx**.

```sh
deno task start
```

### TypeScript or JavaScript mode

By default examples will display in 'TypeScript' mode, this uses
[ES Module Shims](https://github.com/guybedford/es-module-shims) to strip types
directly in the browser, but it allow you to hack around in the source modules
without any need to rebuild the code. This does introduce a noticeable delay in
loading modules and rendering the page.

For a more production like experience, you can instead generate the JS ahead of
time with:

```sh
deno task build
```

And then switch to 'JavaScript' mode by adding `#js` to a URL and reloading, and
also switch back using `#ts`. The browser session will remember which mode you
have switched to, so you are free to navigated and stay in the same mode. The
mode is logged to the dev console when each page loads.

Atm, you need to continually re-run the build though to see the changes in JS
mode.
