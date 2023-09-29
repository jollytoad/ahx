# Todo

## Data Harvesting

Augmentations need a way to 'harvest' data from the host app, this data could
come from several places:

- From the document
- From the host app, via the host app proxy
- From the host app API

The augmentation should be able to declare an identifiable bundle of data
combined from these sources.

The document sourced data could also feed into another UI element, eg a form.

Any trigger should be able to reference a bundle (or multiple?) to indicate the
data it wants.

## More htmx features

### Targets, out of band, swapping

I suspect out of band is going to be a very common pattern for augmentations,
I'd like to come up with something a bit more natural than the htmx oob
attributes... maybe a new swap style to distribute fetched elements based on ids
or selectors. Need to consider morph swaps and view transitions in the mix.

- transition?
- settle?
- scroll?
- show?

### Trigger modifiers

- changed (this also supports harvested data)
- delay
- throttle

### Fetch events

More events around fetch, to allow host more control

### Request/Response headers

Determine what augmentations may need here

### Special events

- revealed
- intersect
- every (polling)

### Request indicators

The host app should have some influence on these so we have a consistent UX,
need to review the needs before copy htmx blindly on this.

### Better module build

- export functions usable to the host app
- export types for host app
- move debugging fns into dynamic module (loaded only when required)
