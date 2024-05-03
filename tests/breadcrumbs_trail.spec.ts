import { test } from '@japa/runner'
import { RouterFactory, HttpContextFactory } from '@adonisjs/http-server/factories'

import { BreadcrumbsRegistry } from '../src/breadcrumbs_registry.js'
import { BreadcrumbsTrail } from '../src/breadcrumbs_trail.js'
import { Breadcrumbs } from '../src/breadcrumbs.js'

test.group('BreadcrumbsTrail', () => {
  test('items attribute should be an array', async ({ assert }) => {
    const router = new RouterFactory().create()
    const ctx = new HttpContextFactory().create()
    const registry = new BreadcrumbsRegistry(router)

    const trail = new BreadcrumbsTrail(registry, router, ctx, [])
    assert.isArray(trail.items)
  })

  test('push method should add breadcrumb items to the trail', async ({ assert }) => {
    const router = new RouterFactory().create()
    const ctx = new HttpContextFactory().create()
    const registry = new BreadcrumbsRegistry(router)

    const trail = new BreadcrumbsTrail(registry, router, ctx, [])
    trail.push('Foos', '/foos', 'foos.index')
    trail.push('Foo - 1', '/foo/1', 'foos.show')

    assert.deepEqual(trail.items, [
      { title: 'Foos', url: '/foos', name: 'foos.index' },
      { title: 'Foo - 1', url: '/foo/1', name: 'foos.show' },
    ])
  })

  test('parent method should execute the callback of a route registered with BreadcrumbsRegistry.for method', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()
    router.get('/', () => {}).as('home')
    router.get('/foos', () => {}).as('foos')
    router.commit()

    const ctx = new HttpContextFactory().create()
    ctx.route = router.match('/foos', 'GET')!.route

    const registry = new BreadcrumbsRegistry(router)
    registry.for('home', (_, trail) => {
      trail.push('Home', '/', 'home')
    })
    registry.for('foos', (_, trail) => {
      trail.parent('home')
      trail.push('Foos', '/foos', 'foos')
    })

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)

    assert.deepEqual(breadcrumbs.get('foos'), [
      { title: 'Home', url: '/', name: 'home' },
      { title: 'Foos', url: '/foos', name: 'foos' },
    ])
  })
})
