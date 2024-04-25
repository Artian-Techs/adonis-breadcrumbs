import { test } from '@japa/runner'

import { BreadcrumbsRegistry } from '../src/breadcrumbs_registry.js'
import { Breadcrumbs } from '../src/breadcrumbs.js'
import { RouterFactory, HttpContextFactory, RequestFactory } from '@adonisjs/http-server/factories'
import { HttpContext } from '@adonisjs/core/http'

test.group('Breadcrumbs', () => {
  test('get method should return an object', async ({ assert }) => {
    const router = new RouterFactory().create()
    router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register('/', 'Foo')

    const httpContext = new HttpContextFactory().create()
    httpContext.route = router.findOrFail('/')
    httpContext.request = new RequestFactory().merge({ url: '/' }).create()

    const breadcrumbs = new Breadcrumbs(router, registry, httpContext)

    assert.isObject(breadcrumbs.get())
  })

  test('get method should return an object containing the information of the current route breadcrumbs', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register('/', 'Foo')

    const httpContext = new HttpContextFactory().create()
    httpContext.route = router.findOrFail('/')
    httpContext.request = new RequestFactory().merge({ url: '/' }).create()

    const breadcrumbs = new Breadcrumbs(router, registry, httpContext)
    const breadcrumbItem = breadcrumbs.get()

    assert.property(breadcrumbItem, 'title')
    assert.property(breadcrumbItem, 'url')
    assert.equal(breadcrumbItem?.title, 'Foo')
    assert.equal(breadcrumbItem?.url, '/')
  })

  test('get method should return an object containing the information of the current route parent breadcrumbs', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    router.get('/foo', async () => {})
    router.get('/foo/:foo', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register('/foo', 'Foo')
    registry.register('/foo/:foo', 'Foo 1')

    const httpContext = new HttpContextFactory().create()
    httpContext.route = router.findOrFail('/foo/:foo')
    httpContext.request = new RequestFactory().merge({ url: '/foo/1' }).create()

    const breadcrumbs = new Breadcrumbs(router, registry, httpContext)
    const breadcrumbItem = breadcrumbs.get()

    assert.property(breadcrumbItem, 'parent')
    assert.deepEqual(breadcrumbItem?.parent, {
      title: 'Foo',
      url: '/foo',
    })
  })

  test('get method should return an object containing the information of the current route ancestors breadcrumbs', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    router.get('/foo', async () => {})
    router.get('/foo/:foo', async () => {})
    router.get('/foo/:foo/bar', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register('/foo', 'Foo')
    registry.register('/foo/:foo', 'Foo 1')
    registry.register('/foo/:foo/bar', 'Foo 1 Bar')

    const httpContext = new HttpContextFactory().create()
    httpContext.route = router.findOrFail('/foo/:foo/bar')
    httpContext.request = new RequestFactory().merge({ url: '/foo/1/bar' }).create()

    const breadcrumbs = new Breadcrumbs(router, registry, httpContext)
    const breadcrumbItem = breadcrumbs.get()
    const parentItem = breadcrumbItem?.parent
    const ancestorItem = parentItem?.parent

    assert.property(breadcrumbItem, 'parent')
    assert.deepEqual(parentItem, {
      title: 'Foo 1',
      url: '/foo/1',
      parent: { title: 'Foo', url: '/foo' },
    })
    assert.property(parentItem, 'parent')
    assert.deepEqual(ancestorItem, {
      title: 'Foo',
      url: '/foo',
    })
  })

  test('title should be returned as-is if it has been registered as a string', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register('/', 'Foo')

    const httpContext = new HttpContextFactory().create()
    httpContext.route = router.findOrFail('/')
    httpContext.request = new RequestFactory().merge({ url: '/' }).create()

    const breadcrumbs = new Breadcrumbs(router, registry, httpContext)
    const breadcrumbItem = breadcrumbs.get()

    assert.equal(breadcrumbItem?.title, 'Foo')
  })

  test('title callback should be executed if it has been registered as a closure', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register('/', () => 'Foo')

    const httpContext = new HttpContextFactory().create()
    httpContext.route = router.findOrFail('/')
    httpContext.request = new RequestFactory().merge({ url: '/' }).create()

    const breadcrumbs = new Breadcrumbs(router, registry, httpContext)
    const breadcrumbItem = breadcrumbs.get()

    assert.equal(breadcrumbItem?.title, 'Foo')
  })

  test('title callback first parameter must always be an instance of HttpContext', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register('/', (ctx) => {
      assert.instanceOf(ctx, HttpContext)

      return 'Foo'
    })

    const httpContext = new HttpContextFactory().create()
    httpContext.route = router.findOrFail('/')
    httpContext.request = new RequestFactory().merge({ url: '/' }).create()

    new Breadcrumbs(router, registry, httpContext)
  })
})
