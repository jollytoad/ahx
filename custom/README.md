# part of ahx

_Experimental WIP_

See the [main blurb](https://github.com/jollytoad/ahx) for the bigger picture.

## Customisation surface

The modules in this package are designed to be overridden if necessary to allow
customisation of **ahx**, by remapping via an import map.

Example:

```json
{
  "imports": {
    "@ahx/": "https://cdn.jsdelivr.net/gh/jollytoad/ahx/",
    "@ahx/custom/config": "https://somewhere.else.com/ahx/config"
  }
}
```

### detectors.ts

Exports the list of _Feature Detector_ modules to be used by the core of
**ahx**.

#### detectors-no-css.ts

Provides the standard detectors for the DOM only, without any CSS features.

```json
{
  "imports": {
    "@ahx/": "https://cdn.jsdelivr.net/gh/jollytoad/ahx/",
    "@ahx/custom/detectors.ts": "https://cdn.jsdelivr.net/gh/jollytoad/ahx/custom/detectors-no-css.ts"
  }
}
```

### config.ts

This module provides configuration to other parts of **ahx**.

#### config-meta.ts

Alternative config to allow configuration via meta elements.
