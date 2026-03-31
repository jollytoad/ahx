# Method action

## `method <value>`

Set the HTTP method in the current action context for later use by request
actions.

There is no restriction on the method value, so this can be used for the more
unusual HTTP methods, such as WebDAV etc.

For the common methods you may find the dedicated actions easier to use (`get`,
`put`, `post`, `patch`, `delete`, and even `query`).

**Output**

- `request`: A new or modified [RequestInit] object with the given method
