# Guide to harvesting data

## From the document

_ahx_ allows you to harvest data, into a form input, or an element attribute.

This harvesting of data is very similar to other HTTP requests within the
hypermedia control lifecycle.

You'll need to declare what triggers the harvesting, what value you want to
harvest, the target for the data, and how the data is 'swapped' into the target.

### Copying data into a form input

```css
.name {
  --ahx-trigger: load, mutate;
  --ahx-harvest: --prop(innerText);
  --ahx-target: closest form;
  --ahx-swap: input "name" append;
}
```

This rule watches any element with `class="name"`, and whenever it is first
loaded or later mutated, the `innerText` property of the element is harvested.
The closest form ancestor of the element is then selected as the target, and the
harvested value is appended to the form as a hidden input named `name`.
