Defining titles is easy. All you have to do, is to use the `title` method when you define `GET` routes. Routes are registered in a breadcrumbs registry using their pattern. I `title` method is used with a non-`GET` route, an exception will be thrown.

## Define titles

```typescript
import router from '@adonisjs/core/services/router'

router.get('/', () => {}).title('Home')
router.get('/admin/dashboard', () => {}).title('Admin dashboard')
```

::: tip
The `title` method accepts also a callback as the only argument. This callback always has the current route HTTP context as the first argument, just like controller methods.
:::

::: warning
Please, be aware that if a route and its parent/ancestors route(s) are using a callback as argument for `title` method, the HTTP context of the current route will be shared with the parent/ancestors, which makes sense as a request cannot have more than one HTTP context at the same time.
:::

## Get breadcrumbs

To get breadcrumbs for the current route, you need to access `breadcrumbs` property from the HTTP context.

```typescript{5}
import { HttpContext } from '@adonisjs/core/http'

export default class AdminDashboardController {
  async show({ breadcrumbs }: HttpContext) {
    return breadcrumbs.get()
  }
}
```

The `https://your-site.com/admin/dashboard` url should return an object containing the breadcrumbs of the current route.

```json
{
  "url": "/admin/dashboard",
  "title": "Admin dashboard",
  "name": undefined,
  "parent": {
    "url": "/",
    "title": "Home",
    "name": undefined
  }
}
```