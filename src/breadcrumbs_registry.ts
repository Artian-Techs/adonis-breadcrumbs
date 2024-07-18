import type { HttpRouterService } from '@adonisjs/core/types'
import type { BreadcrumbsConfig } from './define_config.js'
import type { Title } from './types.js'

import { BreadcrumbsTrail } from './breadcrumbs_trail.js'
import { HttpContext, Route } from '@adonisjs/core/http'
import { RouteJSON } from '@adonisjs/http-server/types'

type RouteData = {
  title: Title
  domain?: string
}

export class BreadcrumbsRegistry {
  /**
   * AdonisJS router instance
   */
  #router: HttpRouterService

  /**
   * Breadcrumbs config
   */
  #config: BreadcrumbsConfig

  /**
   * Routes registry. Keys are patterns and values are title strings/callbacks
   */
  #routes: Record<string, RouteData> = {}

  /**
   * Temporary storage for route instances and titles/callbacks.
   * The instances will be fetched during application post-starting phase
   * (i.e: when provider's `ready` method is executed) to get the correct pattern.
   */
  #tmp: Array<[Route, Title]> = []

  #namedRoutes: Record<
    string,
    (ctx: HttpContext, trail: BreadcrumbsTrail, ...args: any[]) => void
  > = {}

  constructor(config: BreadcrumbsConfig, router: HttpRouterService) {
    this.#config = config
    this.#router = router
  }

  get routes() {
    return this.#routes
  }

  get namedRoutes() {
    return this.#namedRoutes
  }

  get temporaryRoutes() {
    return this.#tmp
  }

  get prefix() {
    return this.#config.prefix
  }

  /**
   * Register routes with their final patterns
   */
  computePatterns() {
    for (const [route, title] of this.#tmp) {
      const { pattern, domain } = route.toJSON()

      if (!this.#routes[pattern]) {
        this.#routes[pattern] = {
          title,
          domain,
        }
      }
    }
  }

  getNamedRouteCallback(routeName: string) {
    return this.#namedRoutes[routeName]
  }

  has(pattern: string) {
    return !!this.#routes[pattern]
  }

  /**
   * Register a named route from outside the router, by its name
   */
  for(routeName: string, cb: (ctx: HttpContext, trail: BreadcrumbsTrail, ...args: any[]) => void) {
    this.#router.commit()

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
  register(route: Route, title: Title) {
    this.#ensureIsGetRoute(route.toJSON())
    this.#tmp.push([route, title])

    return this
  }

  getRouteDataByPattern(pattern: string) {
    if (!pattern.startsWith('/')) {
      pattern = `/${pattern}`
    }

    return this.#routes[pattern] ?? {}
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
