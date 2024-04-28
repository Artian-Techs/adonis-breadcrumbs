import type { HttpContext } from '@adonisjs/http-server'
import type { BreadcrumbsRegistry } from './breadcrumbs_registry.js'
import type { BreadcrumbItem } from './types/main.js'

export class BreadcrumbsTrail {
  #registry: BreadcrumbsRegistry

  #ctx: HttpContext

  #resources: Record<string, any>[] = []

  #breadcrumbs: BreadcrumbItem[] = []

  constructor(registry: BreadcrumbsRegistry, ctx: HttpContext, resources: Record<string, any>[]) {
    this.#registry = registry
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
    this.#registry.getNamedRouteCallback(routeName)(this.#ctx, this, ...this.#resources)

    return this
  }

  /**
   * Add a breadcrumb item to the trail
   */
  push(title: string, url: string, name?: string) {
    this.#breadcrumbs.push({ title, url, name })

    return this
  }

  organize() {
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
  }
}
