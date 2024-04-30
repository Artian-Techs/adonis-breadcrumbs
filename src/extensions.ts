import type { Title } from './types.js'

import { Route, RouteResource } from '@adonisjs/core/http'
import { BreadcrumbsRegistry } from './breadcrumbs_registry.js'

export function addRoutePlugin(registry: BreadcrumbsRegistry) {
  Route.macro('title', function (this: Route, title: Title) {
    registry.register(this, title)

    return this
  })

  RouteResource.macro('titles', function (this: RouteResource, titles: Record<string, Title>) {
    const routes = this.routes.filter((route) => route.toJSON().methods.includes('GET'))

    for (const route of routes) {
      registry.register(route, titles[route.getName()!.split('.').pop()!])
    }

    return this
  })
}
