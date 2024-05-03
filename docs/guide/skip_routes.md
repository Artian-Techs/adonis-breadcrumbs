# Skip routes

If a route has a name, it can be skipped when generating breadcrumbs.

## Skip one route

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

In this example, the `https://your-site.com/admin/dashboard/users` URL should return an ordered array containing the breadcrumbs of the `/admin/dashboard/users` route without the route named `admin.dashboard`.

```json
[
  { "url": "/", "title": "Home", "name": "home" },
  { "url": "/admin/dashboard/users", "title": "Dashboard - Users", "name": "admin.dashboard.users" }
]
```

## Skip multiple routes

The `skip` method accepts a string or an array of strings.

If we take the same example as before and pass an array of route names as argument to the `skip` method, it will skip them when generating the breadcrumbs.

```typescript
import { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async show({ breadcrumbs }: HttpContext) {
    return breadcrumbs.skip(['home', 'admin.dashboard'])
  }
}
```

In this example, the `https://your-site.com/admin/dashboard/users` URL should return an ordered array containing the breadcrumbs of the `/admin/dashboard/users` route without the routes `home` and `admin.dashboard`.

```json
[{ "url": "/admin/dashboard/users", "title": "Dashboard - Users", "name": "admin.dashboard.users" }]
```
