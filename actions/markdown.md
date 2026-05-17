# Markdown transformation action

## `markdown [...<extension>]`

Parse the text from context as markdown and transform to html.

Supported `extension`s: `gfm`, and `math`.

## Requirements

### micromark

An import mapping for the `micromark` bare module specifier must map to the
micromark module, eg:

```json
{
  "imports": {
    "micromark": "https://cdn.jsdelivr.net/npm/micromark@4.0.2/+esm"
  }
}
```

### extensions

Mappings are also required for each extension: `gfm` and `math`, eg:

```json
{
  "imports": {
    "micromark-extension-gfm": "https://cdn.jsdelivr.net/npm/micromark-extension-gfm@3.0.0/+esm",
    "micromark-extension-math": "https://cdn.jsdelivr.net/npm/micromark-extension-math@3.1.0/+esm"
  }
}
```

## References

- (micromark)[https://github.com/micromark/micromark]
- (gfm extension)[https://github.com/micromark/micromark-extension-gfm]
- (math extension)[https://github.com/micromark/micromark-extension-math]
