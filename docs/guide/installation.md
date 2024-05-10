# Installation

The Adonis Breadcrumbs package is available on [npm](https://www.npmjs.com/package/@artian-techs/adonis-breadcrumbs).
You can install it using the following ace command to automagically configure it:

```sh
node ace add @artian-techs/adonis-breadcrumbs
```

<details>

<summary>
See steps performed by the add command
</summary>

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
</details>

::: tip
Once the middleware is registered:

- Edge views will have access to the same breadcrumbs instance as in the HTTP context.
- Inertia views will only have access to the array of the breadcrumbs of the current route. This is because we can't pass an instance to Inertia, as everything is serialized.

:::
