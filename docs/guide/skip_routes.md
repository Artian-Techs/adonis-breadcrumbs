# Skip routes from Breadcrumbs

The `skip()` method allows you to exclude specific routes from the breadcrumbs when they have a defined name. This method returns an array of breadcrumb items without the skipped routes and does not work for breadcrumbs generated automatically (i.e, when using the BreadcrumbsMiddleware or passing the Breadcrumbs to Inertia). If you don't want to fully control the Breadcrumbs, use the `remove()` method.

This method accepts either a single name or an array of names as its argument.

## Skipping a single route

```typescript
import router from '@adonisjs/core/services/router'

const UsersController = () => import('#controllers/backoffice/users_controller')

router
  .get('/', () => async ({ view }) => {
    return view.render('home')
  })
  .title('Home')
  .as('home')
router
  .get('/admin/dashboard', async ({ view }) => {
    return view.render('admin/dasboard')
  })
  .title('Dashboard')
  .as('admin.dashboard')
router
  .get('/admin/dashboard/users', [UsersController, 'show'])
  .title('Dashboard - Users')
  .as('admin.dashboard.users')
```

```typescript
import { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async show({ breadcrumbs }: HttpContext) {
    return breadcrumbs.skip(['admin.dashboard'])
  }
}
```

When visiting the URL `https://your-site.com/admin/dashboard/users`, the breadcrumbs generated will exclude the route named `admin.dashboard`. The resulting breadcrumbs array would look like this:

```json
[
  { "url": "/", "title": "Home", "name": "home" },
  { "url": "/admin/dashboard/users", "title": "Dashboard - Users", "name": "admin.dashboard.users" }
]
```

## Skip multiple routes

To remove multiple routes simultaneously, you can pass an array of route names to the `skip()` method.

```typescript
import { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async show({ breadcrumbs }: HttpContext) {
    return breadcrumbs.skip(['home', 'admin.dashboard'])
  }
}
```

When visiting the URL `https://your-site.com/admin/dashboard/users`, the breadcrumbs generated will exclude the routes named home and `admin.dashboard`. The resulting breadcrumbs array would look like this:

```json
[{ "url": "/admin/dashboard/users", "title": "Dashboard - Users", "name": "admin.dashboard.users" }]
```
