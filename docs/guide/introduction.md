# Introduction

I have always thought that breadcrumbs should be closely tied to routers. This is why I have created this package, which extends some router classes to define titles (static or dynamic) when defining routes by chaining methods. These titles will then be used to generate breadcrumbs automatically.

Titles can also be defined for (**_only_**) named routes, in a separate file that will be preloaded at the time of booting your AdonisJS application.

# Example

1 - Install and configure the package by following the [installation instructions](./instructions).

2 - Define routes and titles.

```typescript
// start/routes.ts

import router from '@adonisjs/core/services/router'

router
  .get('/admin', () => async ({ view }) => {
    return view.render('admin')
  })
  .title('Admin')
router
  .get('/admin/dashboard', async ({ view }) => {
    return view.render('admin/dasboard')
  })
  .title('Dashboard')
```

3 - Create `resources/views/admin/dashboard.edge` file.

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>{{ breadcrumbs.get().at(-1).title }}</title>
  </head>
  <body>
    <h1>
      <ol>
        @each((breadcrumb, index) in breadcrumbs.get())
        <li>
          <span><a href="{{ breadcrumb.url }}">{{ breadcrumb.title }}</a></span>

          @if(index < breadcrumbs.get().length - 1)
          <span>/</span>
          @end
        </li>
        @end
      </ol>
    </h1>
  </body>
</html>
```

4 - Enjoy!

::: tip
It is better to write the code that renders the breadcrumbs within a layout file that is used by all your pages.
:::
