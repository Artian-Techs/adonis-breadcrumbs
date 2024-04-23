import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/http-server/types'

import { createServer } from 'node:http'
import supertest from 'supertest'
import { test } from '@japa/runner'
import { ServerFactory } from '@adonisjs/http-server/factories'

import { BreadcrumbsMiddleware } from '../src/middleware/breadcrumbs_middleware.js'
import { setupApp } from '../test_helpers/index.js'

test.group('Breadcrumbs', () => {
  test('test', async ({ assert }) => {
    const app = await setupApp()
    // const server = await app.container.make('server')
    const server = new ServerFactory().merge({ app }).create()
    const httpServer = createServer(server.handle.bind(server))

    class Foo {
      id = 1
      title = 'Current Foo title'
    }

    class Bar {
      id = 5
      title = 'Current Bar title'
    }

    server.getRouter().use([
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
    server.getRouter().use([
      async () => ({
        default: BreadcrumbsMiddleware,
      }),
    ])
    server
      .getRouter()
      .get('/', async ({ breadcrumbs }) => {})
      .title('Home title')
    server
      .getRouter()
      .get('/foos', async () => {})
      .title('Foos title')
    server
      .getRouter()
      .get('/foos/:foo', async () => {})
      .title((foo: Foo) => foo.title)
    server
      .getRouter()
      .get('/foos/:foo/bars', async () => {})
      .title((foo: Foo) => `${foo.title} ${foo.id} - Bars title`)
    server
      .getRouter()
      .get('/foos/:foo/bars/:bar', async ({ breadcrumbs }) => {
        console.dir(breadcrumbs.get(), { depth: null })
      })
      .title((foo: Foo, bar: Bar) => {
        return `${foo.title} - ${bar.title}`
      })
    await server.boot()
    await app.container.make('breadcrumbs.registry')

    await supertest(httpServer).get('/foos/1/bars/5')
  })
})
