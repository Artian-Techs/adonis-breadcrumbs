import type { RouteJSON } from '@adonisjs/http-server/types'
import type { HttpRouterService } from '@adonisjs/core/types'

import { BreadcrumbTrail } from './breadcrumb_trail.js'

export class BreadcrumbsRegistry {
  #router: HttpRouterService

  #routes: Record<string, string | ((...args: any[]) => string)> = {}

  #namedRoutes: Record<string, (trail: BreadcrumbTrail, ...args: any[]) => void> = {}

  constructor(router: HttpRouterService) {
    this.#router = router
  }

  get routes() {
    return this.#routes
  }

  has(pattern: string) {
    return !!this.#routes[pattern]
  }

  /**
   * `route` param can be the route pattern or route name.
   */
  for(routeName: string, cb: (trail: BreadcrumbTrail, ...args: any[]) => void) {
    const route = this.#router.findOrFail(routeName)

    this.#ensureIsGetRoute(route)

    if (!this.#namedRoutes[routeName]) {
      this.#namedRoutes[routeName] = cb
    }

    return this
  }

  /**
   * Register a new pair of route and title/callback
   */
  register(pattern: string, title: string | ((...args: any[]) => string)) {
    const route = this.#router.findOrFail(pattern)

    this.#ensureIsGetRoute(route)

    if (!this.#routes[pattern]) {
      this.#routes[pattern] = title
    }

    return this
  }

  getTitleByRoutePattern(pattern: string) {
    return this.#routes[pattern]
  }

  /**
   * Ensure the route is a GET route
   */
  #ensureIsGetRoute(route: RouteJSON) {
    if (!route.methods.includes('GET')) {
      throw new Error(`Route ${route.pattern} must be a GET route`)
    }
  }
}
