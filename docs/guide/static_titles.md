# Static titles

Defining titles is easy. This module adds a `title` method on the `Route` instance and should only be used with `GET` routes, otherwise, an exception is raised. Routes are registered in a breadcrumbs registry using their pattern.

## Define titles

```typescript
import router from '@adonisjs/core/services/router'

router.get('/', () => {}).title('Home')
router.get('/admin/dashboard', () => {}).title('Admin dashboard')
```

::: info
The `title` method accepts also a callback as the only argument. This callback always has the current route HTTP context as the first argument, just like controller methods.
:::

::: warning
When a route has one parent or more, bear in mind that the HTTP context of the current route will be passed to **_all_** parents. Which means that when you define a title for one of the parents, which is using a callback as argument instead of a string, and calling for example `ctx.request.url()`, it will return the URL of the current request and not the URL of the parent.
:::

## Get breadcrumbs

To generate breadcrumbs for the current route, you must access the `breadcrumbs` property within the HTTP context and call the `get` method (only if you don't want to share breadcrumbs globally from the middleware or Inertia config).

```typescript{5}
import { HttpContext } from '@adonisjs/core/http'

export default class AdminDashboardController {
  async show({ breadcrumbs }: HttpContext) {
    return breadcrumbs.get()
  }
}
```

In this example, the `https://your-site.com/admin/dashboard` URL should return an ordered array containing the breadcrumbs of the `/admin/dashboard` route.

```json
[
  { "url": "/", "title": "Home", "name": undefined },
  { "url": "/admin/dashboard", "title": "Admin dashboard", "name": undefined }
]
```

## Views and Templates

The same array can be generated in Edge and/or Inertia views.

### Using Edge

```pug [Edge]
<ol>
  @each((breadcrumb, index) in breadcrumbs.get())
    <li>
      <span><a href="{{ breadcrumb.url }}">{{ breadcrumb.title }}</a></span>

      @if(index < breadcrumbs.get().length - 1)
        <span>/</span>
      @end
    </li>
  @end
</ol>
```

### Using Inertia

::: code-group

```vue [Vue]
<script setup lang="ts">
import type { BreadcrumbItem } from '@artian-techs/adonis-breadcrumbs/types'

defineProps<{
  // ... other props
  breadcrumbs: BreadcrumbItem[]
}>()
</script>

<template>
  <ol>
    <li v-for="(breadcrumb, index) in breadcrumbs" :key="index">
      <span>
        <a href="{{ breadcrumb.url }}">{{ breadcrumb.title }}</a>
      </span>

      <span v-if="index < breadcrumbs.length - 1">/</span>
    </li>
  </ol>
</template>
```

```tsx [TSX]
import type { BreadcrumbItem } from '@artian-techs/adonis-breadcrumbs/types'

export default function Home(props: { breadcrumbs: BreadcrumbItem[] }) {
  return (
    <ol>
      {breadcrumbs.map((breadcrumb, index) => (
        <li key={index}>
          <span>
            <a href={breadcrumb.url}>{breadcrumb.title}</a>
          </span>

          {index < breadcrumbs.length - 1 && <span>/</span>}
        </li>
      ))}
    </ol>
  )
}
```

```svelte [Svelte]
<script>
  import type { BreadcrumbItem } from '@artian-techs/adonis-breadcrumbs/types'

  export let breadcrumbs: BreadcrumbItem[];
</script>

<ol>
  {#each breadcrumbs as breadcrumb, index}
    <li>
      <span>
        <a href={breadcrumb.url}>{breadcrumb.title}</a>
      </span>
      {#if index < breadcrumbs.length - 1}
        <span>/</span>
      {/if}
    </li>
  {/each}
</ol>
```

:::
