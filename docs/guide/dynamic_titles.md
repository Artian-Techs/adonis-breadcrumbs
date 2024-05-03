# Dynamic titles

Dynamic titles are an excellent choice for routes using a translatable title, route model bindings, or if you need to access the current HTTP context to get some information.

::: warning
When a route has one parent or more, bear in mind that the HTTP context of the current route will be passed to **_all_** parents. Which means that when you define a title for one of the parents, which is using a callback as argument instead of a string, and calling for example `ctx.request.url()`, it will return the URL of the current request and not the URL of the parent.
:::

## Define dynamic titles

### Without route model bindings

As mentioned before, the `title` method also accepts a callback as argument. This callback always has the current route HTTP context as first argument.

#### Basic example

The following example will return the text for `home` property in your lang files based on the detected locale.

```ts
import router from '@adonisjs/core/services/router'

router
  .get('/', () => {})
  .title(({ i18n }: HttpContext) => {
    return i18n.t('home')
  })
```

#### Get breadcrumbs

To generate breadcrumbs for the current route, you must access the `breadcrumbs` property within the HTTP context and call the `get` method.

```typescript
import { HttpContext } from '@adonisjs/core/http'
import { bind } from '@adonisjs/route-model-binding'

import Order from '#models/order'

export default class OrdersController {
  @bind()
  async show({ breadcrumbs }: HttpContext, user: Order) {
    return breadcrumbs.get()
  }
}
```

The `https://your-site.com/` url should return an array containing the breadcrumbs of the current route.

```json
[
  { "url": "/", "title": "Home", "name": undefined } // Only if "Home" is actually defined in my lang file
]
```

### With route model bindings

#### Requirements

Make sure to install `@adonisjs/route-model-bindings` package.

```sh
node ace add @adonisjs/route-model-bindings
```

#### Basic example

The other remaining arguments of the callback of the `title` method (after the first one, which is the HTTP context), are the models defined in the according controller methods of the routes using the `@bind` decorator (from route model bindings).

```typescript
import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

import User from '#models/user'
import Order from '#models/order'

const OrdersController = () => import('#controllers/orders_controller')

router.get('/', () => {}).title('Home')
router.get('/admin/dashboard', () => {}).title('Admin dashboard')
router.get('/admin/dashboard/users', () => {}).title('Users')
router
  .get('/admin/dashboard/users/:user', () => {})
  .title((ctx: HttpContext, user: User) => user.fullname)
router
  .get('/admin/dashboard/users/:user/orders/:order', [OrdersController, 'show'])
  .title((ctx: HttpContext, user: User, order: Order) => `Order - ${order.id}`)
```

::: tip
The title's callback of the route `/admin/dashboard/users/:user` will receive the same `User` instance as `/admin/dashboard/users/:user/orders/:order`.
:::

::: warning
The params and models are connected using the order they appear and not the name. This is because TypeScript decorators have no way to know the names of the arguments accepted by a method.
:::

#### Get breadcrumbs

To generate breadcrumbs for the current route, you must access the `breadcrumbs` property within the HTTP context and call the `get` method.

```typescript
import { HttpContext } from '@adonisjs/core/http'
import { bind } from '@adonisjs/route-model-binding'

import Order from '#models/order'

export default class OrdersController {
  @bind()
  async show({ breadcrumbs }: HttpContext, user: Order) {
    return breadcrumbs.get()
  }
}
```

The `https://your-site.com/admin/dashboard/users/5/orders/1` url should return an ordered array containing the breadcrumbs of the current route.

```json
[
  { "url": "/", "title": "Home", "name": undefined },
  { "url": "/admin/dashboard", "title": "Admin dashboard", "name": undefined },
  { "url": "/admin/dashboard/users", "title": "Users", "name": undefined },
  {
    "url": "/admin/dashboard/users/5",
    "title": "...", // Dynamic title: User fullname from database
    "name": undefined
  },
  {
    "url": "/admin/dashboard/users/5/orders/1",
    "title": "Order - 1", // Dynamic title
    "name": undefined
  }
]
```
