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

</details>

Alternatively, you can install it manually using your favorite package manager and running the configure command:
::: code-group

```sh [npm]
npm install @artian-techs/adonis-breadcrumbs
node ace configure @artian-techs/adonis-breadcrumbs
```

```sh [pnpm]
pnpm install @artian-techs/adonis-breadcrumbs
node ace configure @artian-techs/adonis-breadcrumbs
```

```sh [yarn]
yarn add @artian-techs/adonis-breadcrumbs
node ace configure @artian-techs/adonis-breadcrumbs
```

:::

<details>

<summary>
See steps performed by the configure command
</summary>

1. Registers the following service provider inside the `adonisrc.ts` file.

```ts
{
  providers: [
    // ...other providers
    () => import('@artian-techs/adonis-breadcrumbs/breadcrumbs_provider'),
  ]
}
```

2. register the following middleware inside the `start/kernel.ts` file.

```ts
router.use([() => import('@artian-techs/adonis-breadcrumbs/breadcrumbs_middleware')])
```

</details>

::: tip
Once the middleware is registered, you will have access to the same breadcrumbs instance as the one in the HTTP context.
:::
