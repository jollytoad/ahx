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

### config.ts _TODO_

This module provides configuration to other parts of **ahx**.
