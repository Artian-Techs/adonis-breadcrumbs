# Resource routes

You can define titles for [resource routes](https://docs.adonisjs.com/guides/controllers#resource-driven-controllers) using the `titles` method. This method takes only one object as argument where the keys are the route names (which are generated automatically when you create resource routes; please refer to this [link](https://docs.adonisjs.com/guides/controllers#naming-resource-routes) for more information), without the resource prefix. You can use both static and dynamic titles. Only titles for `GET` routes will be registered.

::: warning
When a route has one parent or more, bear in mind that the HTTP context of the current route will be passed to **_all_** parents. Which means that when you define a title for one of the parents, which is using a callback as argument instead of a string, and calling for example `ctx.request.url()`, it will return the URL of the current request and not the URL of the parent.
:::

In this example, we are using dynamic titles from `@adonisjs/i18n` module and route model bindings.

```typescript
import { HttpContext } from '@adonisjs/core/http'
import router from '@adonisjs/core/services/router'

const PostsController = () => import('#controllers/posts_controller')

router.resource('posts', PostsController).titles({
  index: 'All posts', // Simple string
  create: ({ i18n }: HttpContext) => i18n.t('post.create'), // From lang files
  show: (ctx: HttpContext, post: Post) => post.title, // From route model binding
  edit: (ctx: HttpContext, post: Post) => {
    return `${i18n.t('post.edit')} - ${post.title}` // From lang files and route model binding
  },
})
```
