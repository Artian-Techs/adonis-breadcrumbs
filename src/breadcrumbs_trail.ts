import type { HttpContext } from '@adonisjs/core/http'
import type { HttpRouterService } from '@adonisjs/core/types'
import type { BreadcrumbsRegistry } from './breadcrumbs_registry.js'
import type { BreadcrumbItem } from './types.js'

export class BreadcrumbsTrail {
  #registry: BreadcrumbsRegistry

  #router: HttpRouterService

  #ctx: HttpContext

  #resources: Record<string, any>[] = []

  #breadcrumbs: BreadcrumbItem[] = []

  constructor(
    registry: BreadcrumbsRegistry,
    router: HttpRouterService,
    ctx: HttpContext,
    resources: Record<string, any>[]
  ) {
    this.#registry = registry
    this.#router = router
    this.#ctx = ctx
    this.#resources = resources
  }

  get items() {
    return this.#breadcrumbs
  }

  /**
   * Add a parent item to the trail
   */
  parent(routeName: string) {
    const callback = this.#registry.getNamedRouteCallback(routeName)

    if (!callback) {
      throw new Error(`Cannot find a callback for route ${routeName}`)
    }

    callback(this.#ctx, this, ...this.#resources)

    return this
  }

  /**
   * Add a breadcrumb item to the trail
   */
  push(title: string, url: string, name?: string) {
    /**
     * If name is not defined, then try to find the route name.
     * This is helpful for BreadcrumbsRegistry.for method
     */
    if (!name) {
      const route = this.#router.match(url, 'GET')

      if (route) {
        name = route.route.name
      }
    }

    this.#breadcrumbs.push({ title, url, name })

    return this
  }

  /* organize() {
    return (
      this.#breadcrumbs.reduce(
        (previousItem: BreadcrumbItem, currentItem: BreadcrumbItem, index) => {
          if (index > 0) {
            currentItem.parent = previousItem
          }

          return currentItem
        },
        this.#breadcrumbs.at(-1)!
      ) ?? {}
    )
  } */
}
