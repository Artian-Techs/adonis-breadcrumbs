import type { HttpRouterService } from '@adonisjs/core/types'

import { BreadcrumbsTrail } from './breadcrumbs_trail.js'
import { HttpContext, Route } from '@adonisjs/http-server'
import { RouteJSON } from '@adonisjs/http-server/types'

export class BreadcrumbsRegistry {
  #router: HttpRouterService

  #routes: Record<string, string | ((...args: any[]) => string)> = {}

  #namedRoutes: Record<
    string,
    (ctx: HttpContext, trail: BreadcrumbsTrail, ...args: any[]) => void
  > = {}

  constructor(router: HttpRouterService) {
    this.#router = router
  }

  get routes() {
    return this.#routes
  }

  get(routeName: string) {
    return this.#namedRoutes[routeName]
  }

  getNamedRouteCallback(routeName: string) {
    return this.#namedRoutes[routeName]
  }

  has(pattern: string) {
    return !!this.#routes[pattern]
  }

  /**
   * `route` param can be the route pattern or route name.
   */
  for(routeName: string, cb: (ctx: HttpContext, trail: BreadcrumbsTrail, ...args: any[]) => void) {
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
  register(route: Route, title: string | ((...args: any[]) => string)) {
    this.#ensureIsGetRoute(route.toJSON())

    const pattern = route.getPattern()

    if (!this.#routes[pattern]) {
      this.#routes[pattern] = title
    }

    return this
  }

  getTitleByRoutePattern(pattern: string) {
    if (!pattern.startsWith('/')) {
      pattern = `/${pattern}`
    }

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
