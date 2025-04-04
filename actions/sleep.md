# Sleep action

## `sleep [<duration>]`

This action pauses the execution of the action pipeline for the specified
duration in milliseconds.

If no duration is provided, it defaults to 0 milliseconds (which effectively
yields to the event loop).
