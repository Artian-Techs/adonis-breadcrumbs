import { test } from '@japa/runner'

import { BreadcrumbsRegistry } from '../src/breadcrumbs_registry.js'
import { RouterFactory } from '@adonisjs/http-server/factories'

test.group('BreadcrumbsRegistry', () => {
  test('routes attribute should be an object', async ({ assert }) => {
    const router = new RouterFactory().create()
    const registry = new BreadcrumbsRegistry(router)

    assert.isObject(registry.routes)
  })

  test('register method should add a GET route pattern and title as string to the routes object', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    const route = router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, 'Foo')

    assert.property(registry.routes, '/')
    assert.typeOf(registry.routes['/'], 'string')
  })

  test('register method should add a GET route pattern and title as a closure to the routes object', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    const route = router.get('/', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, () => 'Foo')

    assert.property(registry.routes, '/')
    assert.typeOf(registry.routes['/'], 'function')
  })

  test('non-GET route should throw an error when trying to be registered', async ({ assert }) => {
    const router = new RouterFactory().create()
    const route = router.post('/foo', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)

    assert.throws(() => registry.register(route, 'Foo'), 'Route /foo must be a GET route')
  })

  test('has method should return true if route exists in the routes object', async ({ assert }) => {
    const router = new RouterFactory().create()
    const route = router.get('/foo', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, 'Foo')

    assert.isTrue(registry.has('/foo'))
  })

  test('has method should return false if route does not exist in the routes object', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    router.get('/foo', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)

    assert.isFalse(registry.has('/foo'))
  })

  test('getTitleByRoutePattern method should return a route by its pattern', async ({ assert }) => {
    const router = new RouterFactory().create()
    const route = router.get('/foo', async () => {})
    router.commit()

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, 'Foo')

    assert.equal(registry.getTitleByRoutePattern('/foo'), 'Foo')
  })
})
