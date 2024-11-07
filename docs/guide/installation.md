# Installation

The Adonis Breadcrumbs package is available on [npm](https://www.npmjs.com/package/@artian-techs/adonis-breadcrumbs).
You can install it using the following ace command to automagically configure it:

```sh
node ace add @artian-techs/adonis-breadcrumbs
```

::: details See steps performed by the add command

1. Installs the `@artian-techs/adonis-breadcrumbs` package using the detected package manager.

2. Registers the following service provider inside the `adonisrc.ts` file.

   ```ts
   {
     providers: [
       // ...other providers
       () => import('@artian-techs/adonis-breadcrumbs/breadcrumbs_provider'),
     ]
   }
   ```

3. register the following middleware inside the `start/kernel.ts` file.

   ```ts
   router.use([() => import('@artian-techs/adonis-breadcrumbs/breadcrumbs_middleware')])
   ```

4. Create the `config/breadcrumbs.ts` file.

:::

::: info
Once the middleware is registered:

- Edge views will have access to the same breadcrumbs instance as in the HTTP context.

:::

If you are using Inertia, you will have to configure it to share the breadcrumbs with all of your routes.

Just open `config/inertia.ts` and add a new shared property.

```ts
  sharedData: {
    // ... other shared properties
    breadcrumbs: (ctx) => ctx.breadcrumbs.get(),
  },
```

::: warning
You must use the `get` method to serialize breadcrumb items, since `ctx.breadcrumbs` is an instance. We do not share the breadcrumb items with Inertia from the middleware because items might be added manually (e.g from a controller method using `ctx.breadcrumbs.add()` method), and because `get` method must be called everytime after `add` method which could be redundant.
:::
