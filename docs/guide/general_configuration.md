# General configuration

Breadcrumbs configuration is located in the `config/breadcrumbs.ts` file. By default, the file looks like this:

```ts
import { defineConfig } from '@artian-techs/adonis-breadcrumbs'

export default defineConfig({
  prefix: null,
})
```

## Prefix

The `prefix` is the prefix used by all the routes. It can be a string, an object (`BreadcrumbItem`), a callback, or `null` (default value, to disable the prefix). The prefix will be the highest parent (i.e: the first item in the breadcrumbs array). If the current route is the same as the prefix, the latter is not added, so you don't have to perform any check.

This is useful in situations where for example an admin has a dashboard page (`/admin/dashboard`), and other pages (e.g: `admin/users`), and you want to include the dashboard title and URL in the breadcrumbs of `admin/users`.

### Prefix as a string

```ts
import { defineConfig } from '@artian-techs/adonis-breadcrumbs'

export default defineConfig({
  prefix: '/admin/dashboard',
})
```

If you have registered a title for the route `/admin/dashboard`, it will be added. Otherwise, an exception is raised.

---

### Prefix as an object

```ts
import { defineConfig } from '@artian-techs/adonis-breadcrumbs'

export default defineConfig({
  prefix: {
    url: '/admin/dashboard',
    title: 'Dashboard',
    name: 'backoffice.dashboard', // This field is optional
  },
})
```

---

### Prefix as a callback that returns a string

The callback takes two arguments: the current `HttpContext`, and the `Router` instance.

```ts
import type { HttpRouterService } from '@adonisjs/core/types'
import type { HttpContext } from '@adonisjs/core/http'

import { defineConfig } from '@artian-techs/adonis-breadcrumbs'

export default defineConfig({
  prefix: (ctx: HttpContext, { request }: HttpRouterService) => {
    if (request.url().startsWith('/admin')) {
      return '/admin/dashboard'
    }
  },
})
```

---

### Prefix as a callback that returns an object

The callback takes two arguments: the current `HttpContext`, and the `Router` instance.

```ts
import type { HttpRouterService } from '@adonisjs/core/types'
import type { HttpContext } from '@adonisjs/core/http'

import { defineConfig } from '@artian-techs/adonis-breadcrumbs'

export default defineConfig({
  prefix: (ctx: HttpContext, router: HttpRouterService) => ({
    url: '/admin/dashboard',
    title: 'Dashboard',
    name: 'backoffice.dashboard', // This field is optional
  }),
})
```
