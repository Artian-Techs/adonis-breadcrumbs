import { test } from '@japa/runner'

import { Route, RouteResource } from '@adonisjs/core/http'

test.group('Breadcrumbs', () => {
  test('Route class should have title method', async ({ assert }) => {
    assert.property(Route.prototype, 'title')
  })

  test('RouteResource class should have titles method', async ({ assert }) => {
    assert.property(RouteResource.prototype, 'titles')
  })
})
