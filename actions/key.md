# Keyboard actions

## `key [dispatch] <...key-names>`

Filter
[KeyboardEvents](https://developer.mozilla.org/docs/Web/API/KeyboardEvent) based
on the key property, allowing the pipeline to continue only for the specified
key names.

If the `dispatch` flag is given, a new event is dispatched based on the current
event but with the key name appended. For example:
`on-keyup="key dispatch Enter"` will result in a `keyup-Enter` event being
dispatch for the Enter key, allowing individual keys to have their own handlers,
eg. `on-keyup-Enter="..."`.
