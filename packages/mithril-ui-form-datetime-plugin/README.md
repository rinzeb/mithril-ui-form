# A datetime plugin for Mithril-ui-form

[Mithril-ui-form](https://www.npmjs.com/package/mithril-ui-form) is a declarative framwork to create forms using the front-end [Mithril framework](https://mithril.js.org/) and [mithril-materialized](https://www.npmjs.com/package/mithril-materialized) components using the [materialize-css](http://materializecss.com/) design theme.

A simple datetime control, i.e. a date and time combination

## Include datetime control

```ts
import { datetimePlugin } from "mithril-ui-form-datetime-plugin";

...

registerPlugin("datetime", datetimePlugin);
```

## Optional CSS style

Please include the following CSS style to make it look good.


```json
{ 
  "id": "myTimeOfBirth", 
  "type": "datetime",
  "label": "Time of birth?"
},
```
