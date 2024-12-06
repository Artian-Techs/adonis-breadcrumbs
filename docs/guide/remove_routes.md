# Removing Routes from Breadcrumbs

The `remove()` method allows you to exclude specific routes from the breadcrumbs when they have a defined name. This is particularly useful when generating breadcrumbs automatically, as it enables precise filtering of breadcrumb items. Unlike the `skip()` method, which excludes routes and returns a new array of breadcrumb items, the `remove()` method does not return anything.

This method accepts either a single name or an array of names as its argument.

## Removing a single route

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
    breadcrumbs.remove('admin.dashboard')

    return {}
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

## Removing multiple routes

To remove multiple routes simultaneously, you can pass an array of route names to the `remove()` method.

```typescript
import { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async show({ breadcrumbs }: HttpContext) {
    breadcrumbs.remove(['home', 'admin.dashboard'])

    return {}
  }
}
```

When visiting the URL `https://your-site.com/admin/dashboard/users`, the breadcrumbs generated will exclude the routes named home and `admin.dashboard`. The resulting breadcrumbs array would look like this:

```json
[{ "url": "/admin/dashboard/users", "title": "Dashboard - Users", "name": "admin.dashboard.users" }]
```
