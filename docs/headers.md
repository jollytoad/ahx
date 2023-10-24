# Custom Request and Response Headers

Like _htmx_, we support various custom request/response headers. These follow
_htmx_ where practical.

## Request Headers

| Header          | Description                        |
| --------------- | ---------------------------------- |
| AHX-Current-URL | the current URL of the browser     |
| AHX-Request     | present in all requests from _ahx_ |

## Response Headers

| Header      | Description                                        |
| ----------- | -------------------------------------------------- |
| AHX-Refresh | if present the browser will do a full page refresh |
