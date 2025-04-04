# Input actions

## `input <op> <input-name> [...<value>]`

This action will perform an operation for the named form input element on all
target form elements within the current action context.

Operations that mutate the input value will obtain the value from the remaining
args of the action (joined by space), or from the first `texts` value of the
action context.

### `input get <input-name>`

Retrieve the values of the named input from all target form elements.

**Output**

- `texts`: the input values
- `nodes`: the actual input nodes

### `input remove <input-name>`

Remove the named hidden input element from all target form elements.

### `input join <input-name> [...<value>]`

If the input already exists, join the value to the existing input value,
separated by a space. If the input doesn't exist, it behaves like `append`.

### `input append <input-name> [...<value>]`

Create a new hidden input element with the given name and value, and append it
to the target form element. Multiple append operations will create multiple
input elements.
