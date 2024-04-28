import { createServer } from 'node:http'
import supertest from 'supertest'
import { test } from '@japa/runner'
import { NextFn } from '@adonisjs/http-server/types'
import { HttpContext } from '@adonisjs/core/http'
import { RouterFactory, HttpContextFactory, RequestFactory } from '@adonisjs/http-server/factories'

import { BreadcrumbsRegistry } from '../src/breadcrumbs_registry.js'
import { Breadcrumbs } from '../src/breadcrumbs.js'
import { setupApp } from '../test_helpers/index.js'
import { BreadcrumbsMiddleware } from '../src/breadcrumbs_middleware.js'
import { BreadcrumbsTrail } from '../src/breadcrumbs_trail.js'

test.group('BreadcrumbsTrail', () => {
  test('for method should register named routes', async ({ assert }) => {
    const router = new RouterFactory().create()
    router.get('/', async () => {}).as('home')
    router.get('/foo', async () => {}).as('foo')
    router.get('/foo/:foo', async () => {}).as('foo.show')
    router.commit()

    const ctx = new HttpContextFactory().create()
    ctx.request = new RequestFactory().merge({ url: '/foo/1', method: 'GET' }).create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route
    ctx.resources = {
      foo: { id: 1, title: 'Foo' },
    }

    const registry = new BreadcrumbsRegistry(router)
    registry.for('home', (_: HttpContext, trail) => {
      trail.push('Home', '/')
    })
    registry.for('foo', (_: HttpContext, trail) => {
      trail.parent('home')
      trail.push('Foo parent', '/foo')
    })
    registry.for('foo.show', ({ request }: HttpContext, trail, foo) => {
      trail.parent('foo')
      trail.push(foo.title, request.url())
    })

    const breadcrumbs = new Breadcrumbs(router, registry, ctx)
    assert.containsSubset(breadcrumbs.get('foo.show'), {
      title: 'Foo',
      url: '/foo/1',
      parent: {
        title: 'Foo parent',
        url: '/foo',
        parent: { title: 'Home', url: '/' },
      },
    })
  })
})
