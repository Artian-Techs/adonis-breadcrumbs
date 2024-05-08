import { createServer } from 'node:http'
import supertest from 'supertest'
import { test } from '@japa/runner'
import { NextFn } from '@adonisjs/http-server/types'
import { HttpContext } from '@adonisjs/core/http'
import { RouterFactory, HttpContextFactory, RequestFactory } from '@adonisjs/http-server/factories'

import { BreadcrumbsRegistry } from '../src/breadcrumbs_registry.js'
import { Breadcrumbs } from '../src/breadcrumbs.js'
import { setupApp } from '../test_helpers/index.js'
import BreadcrumbsMiddleware from '../src/breadcrumbs_middleware.js'

test.group('Breadcrumbs', () => {
  test('get method should return an array', async ({ assert }) => {
    const router = new RouterFactory().create()
    const route = router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, 'Foo')
    registry.computePatterns()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)

    assert.isArray(breadcrumbs.get())
  })

  test('get method should return the information of the current route breadcrumbs', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    const route = router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, 'Foo')
    registry.computePatterns()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)
    const items = breadcrumbs.get()
    const firstItem = items.at(0)!

    assert.property(firstItem, 'title')
    assert.property(firstItem, 'url')
    assert.equal(firstItem.title, 'Foo')
    assert.equal(firstItem.url, '/')
  })

  test('get method should return the information of the current route and its parent breadcrumbs', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    const route1 = router.get('/foo', async () => {})
    const route2 = router.get('/foo/:foo', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route1, 'Foo')
    registry.register(route2, 'Foo 1')
    registry.computePatterns()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/foo/1', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)
    const items = breadcrumbs.get()

    assert.strictEqual(items.at(0)!.url, '/foo')
    assert.strictEqual(items.at(1)!.url, '/foo/1')
    assert.containsSubset(items, [
      { title: 'Foo', url: '/foo', name: undefined },
      { title: 'Foo 1', url: '/foo/1', name: undefined },
    ])
  })

  test('get method should return an ordered array of breadcrumb items', async ({ assert }) => {
    const router = new RouterFactory().create()
    const route1 = router.get('/foo', async () => {})
    const route2 = router.get('/foo/:foo', async () => {})
    const route3 = router.get('/foo/:foo/bar', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route1, 'Foo')
    registry.register(route2, 'Foo 1')
    registry.register(route3, 'Foo 1 Bar')
    registry.computePatterns()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/foo/1/bar', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)
    const items = breadcrumbs.get()

    assert.strictEqual(items.at(0)!.url, '/foo')
    assert.strictEqual(items.at(1)!.url, '/foo/1')
    assert.strictEqual(items.at(2)!.url, '/foo/1/bar')
    assert.deepEqual(items, [
      { title: 'Foo', url: '/foo', name: undefined },
      { title: 'Foo 1', url: '/foo/1', name: undefined },
      { title: 'Foo 1 Bar', url: '/foo/1/bar', name: undefined },
    ])
  })

  test('skip method should remove specified route by its name from the breadcrumbs array', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    const route1 = router.get('/foo', async () => {}).as('foos')
    const route2 = router.get('/foo/:foo', async () => {}).as('foos.foo')
    const route3 = router.get('/foo/:foo/bar', async () => {}).as('foos.foo.bar')
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route1, 'Foo')
    registry.register(route2, 'Foo 1')
    registry.register(route3, 'Foo 1 Bar')
    registry.computePatterns()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/foo/1/bar', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)
    const items = breadcrumbs.skip('foos.foo')

    assert.deepEqual(items, [
      { title: 'Foo', url: '/foo', name: 'foos' },
      { title: 'Foo 1 Bar', url: '/foo/1/bar', name: 'foos.foo.bar' },
    ])
  })

  test('skip method should remove specified routes by their names from the breadcrumbs array', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    const route1 = router.get('/foo', async () => {}).as('foos')
    const route2 = router.get('/foo/:foo', async () => {}).as('foos.foo')
    const route3 = router.get('/foo/:foo/bar', async () => {}).as('foos.foo.bar')
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route1, 'Foo')
    registry.register(route2, 'Foo 1')
    registry.register(route3, 'Foo 1 Bar')
    registry.computePatterns()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/foo/1/bar', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)
    const items = breadcrumbs.skip(['foos', 'foos.foo'])

    assert.deepEqual(items, [{ title: 'Foo 1 Bar', url: '/foo/1/bar', name: 'foos.foo.bar' }])
  })

  test('title should be returned as-is if it has been registered as a string', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    const route = router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, 'Foo')
    registry.computePatterns()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)
    const breadcrumbItem = breadcrumbs.get()

    assert.equal(breadcrumbItem.at(0)!.title, 'Foo')
  })

  test('title callback should be executed if it has been registered as a closure', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    const route = router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, () => 'Foo')
    registry.computePatterns()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)
    const breadcrumbItem = breadcrumbs.get()

    assert.equal(breadcrumbItem.at(0)!.title, 'Foo')
  })

  test('title callback first parameter must always be an instance of HttpContext', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    const route = router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, (ctx) => {
      assert.instanceOf(ctx, HttpContext)

      return 'Foo'
    })
    registry.computePatterns()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route

    new Breadcrumbs(router, registry, ctx)
  })

  test('HttpContext | breadcrumbs.get should return the breadcrumbs for the current route', async ({
    assert,
  }) => {
    const app = await setupApp()
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    const httpServer = createServer(server.handle.bind(server))

    class Foo {
      id = 1
      title = 'Current Foo title'
    }

    class Bar {
      id = 5
      title = 'Current Bar title'
    }

    router.use([
      async () => ({
        default: class Test {
          async handle(ctx: HttpContext, next: NextFn) {
            ctx.resources = {
              foo: new Foo(),
              bar: new Bar(),
            }

            await next()
          }
        },
      }),
    ])
    router.use([
      async () => ({
        default: BreadcrumbsMiddleware,
      }),
    ])
    router.get('/', async () => {}).title('Home title')
    router.get('/foos', async () => {}).title('Foos title')
    router.get('/foos/:foo', async () => {}).title((_: HttpContext, foo: Foo) => foo.title)
    router
      .get('/foos/:foo/bars', async () => {})
      .title((_: HttpContext, foo: Foo) => `${foo.title} ${foo.id} - Bars title`)
    router
      .get('/foos/:foo/bars/:bar', async ({ breadcrumbs }) => {
        return breadcrumbs.get()
      })
      .title((_: HttpContext, foo: Foo, bar: Bar) => {
        return `${foo.title} - ${bar.title}`
      })

    await app.start(() => {})
    await server.boot()

    const { body } = await supertest(httpServer).get('/foos/1/bars/5')

    assert.deepEqual(body, [
      { title: 'Home title', url: '/' },
      { title: 'Foos title', url: '/foos' },
      { title: 'Current Foo title', url: '/foos/1' },
      {
        title: 'Current Foo title 1 - Bars title',
        url: '/foos/1/bars',
      },
      {
        title: 'Current Foo title - Current Bar title',
        url: '/foos/1/bars/5',
      },
    ])
  })

  test('HttpContext | breadcrumbs.get should return the breadcrumbs for the current resource route', async ({
    assert,
  }) => {
    const app = await setupApp()
    const router = await app.container.make('router')
    const server = await app.container.make('server')
    const httpServer = createServer(server.handle.bind(server))

    class Post {
      id = 1
      title = 'Foo'
    }

    class PostsController {
      async show({ breadcrumbs }: HttpContext) {
        return breadcrumbs.get()
      }
    }

    router.use([
      async () => ({
        default: class {
          async handle(ctx: HttpContext, next: NextFn) {
            ctx.resources = {
              post: new Post(),
            }

            await next()
          }
        },
      }),
    ])
    router.use([
      async () => ({
        default: BreadcrumbsMiddleware,
      }),
    ])
    router.resource('posts', PostsController).titles({
      index: 'All posts',
      create: 'New post',
      edit: ({ resources }: HttpContext) => `Edit post - ${resources.post.title}`,
      show: ({ resources }: HttpContext) => `Post - ${resources.post.title}`,
    })

    await app.start(() => {})
    await server.boot()

    const { body } = await supertest(httpServer).get('/posts/1')
    assert.deepEqual(body, [
      { title: 'All posts', url: '/posts', name: 'posts.index' },
      { title: 'Post - Foo', url: '/posts/1', name: 'posts.show' },
    ])
  })
})
