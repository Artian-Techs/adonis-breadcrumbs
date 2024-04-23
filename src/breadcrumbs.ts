import type { StoreRouteNode } from '@adonisjs/core/types/http'
import type { HttpRouterService } from '@adonisjs/core/types'
import type { HttpContext } from '@adonisjs/core/http'

import { BreadcrumbsRegistry } from './breadcrumbs_registry.js'
import { BreadcrumbItem } from './types/main.js'

export class Breadcrumbs {
  /**
   * The router instance
   */
  #router: HttpRouterService

  /**
   * The breadcrumbs registry instance
   */
  #registry: BreadcrumbsRegistry

  /**
   * The current HTTP context
   */
  #ctx: HttpContext

  /**
   * The current route object
   */
  #route: StoreRouteNode

  /**
   * The current request URL
   */
  #url: string

  #item: BreadcrumbItem | null = null

  #visited = new Set<string>()

  constructor(router: HttpRouterService, registry: BreadcrumbsRegistry, ctx: HttpContext) {
    this.#router = router
    this.#registry = registry
    this.#ctx = ctx
    this.#route = ctx.route!
    this.#url = ctx.request.url()

    const title = this.#registry.getTitleByRoutePattern(this.#route.pattern)

    if (title) {
      const params = this.#extractParamsFromRoutePattern(this.#route.pattern)
      const resources = params.map((param) => ctx.resources[param])

      this.#item = {
        title: typeof title === 'function' ? title(...resources) : title,
        url: this.#url,
      }

      if (this.#hasParent(this.#route.pattern)) {
        const parentPattern = this.#getParentPattern(this.#route.pattern)

        if (parentPattern) {
          this.#setParent(parentPattern, this.#item)
        }
      }
    }
  }

  get() {
    return this.#item
  }

  #hasParent(pattern: string) {
    const parentPattern = this.#getParentPattern(pattern)

    if (parentPattern) {
      return this.#registry.has(parentPattern)
    }
  }

  #setParent(pattern: string, currentItem: Partial<BreadcrumbItem>) {
    if (this.#visited.has(pattern)) {
      return // Already visited this pattern, terminate recursion
    }

    this.#visited.add(pattern)

    const title = this.#registry.getTitleByRoutePattern(pattern)

    if (title) {
      const params = this.#extractParamsFromRoutePattern(this.#route.pattern)
      const resources = params.map((param) => this.#ctx.resources[param])

      const url = currentItem.url!.split('/').slice(0, -1).join('/')

      const item = {
        title: typeof title === 'function' ? title(...resources) : title,
        url: url.length < 1 ? '/' : url,
      }

      currentItem.parent = item

      if (this.#hasParent(pattern)) {
        const parentPattern = this.#getParentPattern(pattern)

        if (parentPattern) {
          this.#setParent(parentPattern, item)
        }
      }
    }
  }

  #getParentPattern(pattern: string) {
    if (pattern.length < 1) {
      return
    }

    const parentPattern = pattern.split('/').slice(0, -1).join('/')

    return parentPattern.length === 0 ? '/' : parentPattern
  }

  #extractParamsFromRoutePattern(pattern: string) {
    const params = pattern.match(/:([a-zA-Z0-9_]+)/g)

    if (!params) {
      return []
    }

    return params.map((param) => param.slice(1))
  }

  #makeUrl(url: string) {}
}
