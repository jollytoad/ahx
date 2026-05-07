# Sort action

## `sort children [<ascending|descending>] [<selector>]`

Sort the child elements of the current target element(s).

A CSS selector can be supplied to select an element under each child and use the
content of this as the value to sort by. Valid numbers will be parsed and
compared as numbers.

Each target element is sorted independently.

## `sort column [<toggle|ascending|descending>]`

Sort the column of a table where the target is the header cell.

This assumes the target is a `th` or `td` cell, and will determine it's index
within its parent, and then locate the parent `table` and sort the children of
the `tbody`, using the `td` cell at the same index of the target cell as the
sort value.

If `toggle` is specified (default), then it will check the `aria-sort` property
to determine if it should sort ascending or descending.

After sorting it will set the `aria-sort` of the target, and remove it from all
siblings of the target.
