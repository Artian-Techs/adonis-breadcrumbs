# Standalone file

If you worry about clean routes files, you can define the titles in a separate file. However, it is preferable to define titles in the same file as the routes because if you are using a standalone file, you will have to write URLs manually.

## Create a new file

Create and register a preload file using the `node ace make:preload` command.

```sh
node ace make:preload breadcrumbs
```

## Define titles

Go to the newly created file in `start/breadcrumbs.ts` and define the titles for named routes.

```typescript
// start/routes.ts

import router from '@adonisjs/core/services/router'

router.get('/', () => {}).name('home')
router.get('/admin/dashboard', () => {}).name('admin.dashboard')
```

```typescript
// start/breadcrumbs.ts

import { HttpContext } from '@adonisjs/core/http'
import Breadcrumbs from '@artian-techs/adonis-breadcrumbs/services/main'

Breadcrumbs.for('home', ({ request }, trail) => {
  trail.push('Home', '/')
})

Breadcrumbs.for('admin.dashboard', (ctx, trail) => {
  trail.parent('home')
  trail.push('Admin dashboard', '/admin/dashboard')
})
```

In the example above, we have defined two titles for our two routes. The `Breadcrumbs.for` method accepts a route name as argument and if the route is not found, an exception will be thrown. The second argument is a callback that accepts an instance of `BreadcrumbsTrail` as first argument, the HTTP context as second argument, and the remaining arguments are the models if route binding model is used. The `trail.push` method adds a new pair of title and URL (it is important, it is not the route pattern but the URL for that route). The `trail.parent` method adds a breadcrumb parent to the current breadcrumb item.

::: warning
When a route has one parent or more, bear in mind that the HTTP context of the current route will be passed to **_all_** parents. Which means that when you define a title for one of the parents, and calling for example `ctx.request.url()`, it will return the URL of the current request and not the URL of the parent.
:::

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

The `https://your-site.com/admin/dashboard` url should return an ordered array containing the breadcrumbs of the current route.

```json
[
  { "url": "/", "title": "Home", "name": "home" },
  {
    "url": "/admin/dashboard",
    "title": "Admin dashboard",
    "name": "admin.dashboard"
  }
]
```

## Resource routes

Titles for resource routes can also be defined in a separate file. However, full routes names (i.e with all prefixes), must be used as keys.

```typescript
// start/routes.ts

import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

const PostsController = () => import('#controllers/posts_controller')

router.resource('posts', PostsController)
```

```typescript
// start/breadcrumbs.ts

import Breadcrumbs from '@artian-techs/adonis-breadcrumbs/services/main'

Breadcrumbs.for('posts.index', (ctx, trail) => {
  trail.push('All posts', '/posts')
})

Breadcrumbs.for('posts.create', (ctx, trail) => {
  trail.parent('posts.index')
  trail.push(ctx.i18n.t('posts.create'), '/posts/create')
})

/**
 * In case route model bindings package is used,
 * you can access to the post model
 */
Breadcrumbs.for('posts.show', (ctx, trail, post: Post) => {
  trail.parent('posts.index')
  trail.push(post.title, `/posts/${post.id}`)
})

/**
 * In case route model bindings package is used,
 * you can access to the post model
 */
Breadcrumbs.for('posts.edit', (ctx, trail, post: Post) => {
  trail.parent('posts.show')
  trail.push(post.title, `/posts/${post.id}`)
})
```
