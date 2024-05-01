# Dynamic titles

Dynamic titles are an excellent choice for routes using route model bindings, as it will abstract a lot of logic.

## Define dynamic titles

As mentioned before, the `title` method also accepts a callback as argument. This callback always has the current route HTTP context as first argument. The other remaining arguments are the models defined in according controller methods of the routes using the `@bind` decorator from route model binding.

```typescript
import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

import User from '#models/user'

router.get('/', () => {}).title('Home')
router.get('/admin/dashboard', () => {}).title('Admin dashboard')
router.get('/admin/dashboard/users', () => {}).title('Users')
router
  .get('/admin/dashboard/users/:user', () => {})
  .title((ctx: HttpContext, user: User) => user.fullname)
```

::: warning
The params and models are connected using the order they appear and not the name. This is because TypeScript decorators have no way to know the names of the arguments accepted by a method.
:::

## Get breadcrumbs

To get breadcrumbs for the current route, you need to access `breadcrumbs` property from the HTTP context.

```typescript
import { HttpContext } from '@adonisjs/core/http'
import { bind } from '@adonisjs/route-model-binding'

import User from '#models/user'

export default class UsersController {
  @bind()
  async show({ breadcrumbs }: HttpContext, user: User) {
    return breadcrumbs.get()
  }
}
```

The `https://your-site.com/admin/dashboard/users/5` url should return an object containing the breadcrumbs of the current route.

```json
{
  "url": "/admin/dashboard/users/5",
  "title": "...", // Dynamic title: User fullname from database
  "name": undefined,
  "parent": {
    "url": "/admin/dashboard/users",
    "title": "Users",
    "name": undefined,
    "parent": {
      "url": "/admin/dashboard",
      "title": "Admin dashboard",
      "name": undefined,
      "parent": {
        "url": "/",
        "title": "Home",
        "name": undefined
      }
    }
  }
}
```
