If you worry about clean routes files, you can define the titles in a separate file.

## Create a new file

Create and register a preload file using the `node ace make:preload` command.

```sh
node ace make:preload breadcrumbs
```

## Define titles

Go to the newly created file in `start/breadcrumbs.ts` and start defining the titles for named routes.

```typescript
// start/routes.ts

import router from '@adonisjs/core/services/router'

router.get('/', () => {}).name('home')
router.get('/admin/dashboard', () => {}).name('admin.dashboard')
```

```typescript
// start/breadcrumbs.ts

import { HttpContext } from '@adonisjs/core/http'
import Breadcrumbs from '@artian-techs/adonis-breadcrumbs/services/registry'

Breadcrumbs.for('home', (trail, { request }: HttpContext) => {
  trail.push('Home', request.url())
})

Breadcrumbs.for('admin.dashboard', (trail, ctx: HttpContext) => {
  trail.parent('home')
  trail.push('Admin dashboard', 'https://your-site.com/admin/dashboard')
})
```

In the example above, we have defined two titles for our two routes. The `Breadcrumbs.for` method accepts a route name as argument and if the route is not found, an exception will be thrown. The second argument is a callback that accepts a `BreadcrumbsTrail` as first argument, the HTTP context as second argument and the remaining arguments are the models if route binding model is used. The `trail.push` method adds a new pair of title and URL (it is important, it is not the route pattern but the URL for that route). The `trail.parent` method adds a breadcrumb parent to the current breadcrumb item.

## Get breadcrumbs

Unlike before, you need to pass the route name as argument to `breadcrumbs.get` method.

```typescript{5}
import { HttpContext } from '@adonisjs/core/http'

export default class AdminDashboardController {
  async show({ breadcrumbs }: HttpContext) {
    return breadcrumbs.get('admin.dashboard')
  }
}
```

The `https://your-site.com/admin/dashboard` url should return an object containing the breadcrumbs of the current route.

```json
{
  "url": "https://your-site.com/admin/dashboard",
  "title": "Admin dashboard",
  "name": undefined,
  "parent": {
    "url": "/",
    "title": "Home",
    "name": undefined
  }
}
```
