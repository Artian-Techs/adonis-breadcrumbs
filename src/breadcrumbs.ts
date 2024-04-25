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

  #item?: BreadcrumbItem

  constructor(router: HttpRouterService, registry: BreadcrumbsRegistry, ctx: HttpContext) {
    this.#router = router
    this.#registry = registry
    this.#ctx = ctx
    this.#route = ctx.route!
    this.#url = ctx.request.url(true)

    this.#item = this.#setItem(this.#route.pattern, this.#url)
  }

  get() {
    return this.#item
  }

  #setItem(pattern: string, url: string) {
    const title = this.#registry.getTitleByRoutePattern(pattern)

    if (title) {
      const params = this.#extractParamsFromRoutePattern(pattern)
      const resources = []

      if (this.#contextHasResources()) {
        resources.push(...params.map((param) => this.#ctx.resources[param]))
      }

      let item: BreadcrumbItem = {
        title: typeof title === 'function' ? title(this.#ctx, ...resources) : title,
        url,
      }

      if (this.#hasParent(pattern)) {
        const parentPattern = this.#getParentPattern(pattern)

        if (parentPattern) {
          item.parent = this.#setItem(parentPattern, this.#getParentUrl(url))
        }
      }

      return item
    }
  }

  #hasParent(pattern: string) {
    const parentPattern = this.#getParentPattern(pattern)

    if (parentPattern) {
      return this.#registry.has(parentPattern)
    }
  }

  #getParentPattern(pattern: string) {
    if (pattern.length <= 1) {
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

  #contextHasResources() {
    return 'resources' in this.#ctx
  }

  /**
   * Extract the parent URL from the current URL.
   * Should also handle the case where the URL is the root URL (i.e "/").
   */
  #getParentUrl(url: string) {
    const fragments = url.split('/').filter((fragment) => fragment !== '')

    let parentUrl = ''

    for (let i = 0; i < fragments.length - 1; i++) {
      parentUrl += `/${fragments[i]}`
    }

    if (parentUrl === '') {
      return '/'
    }

    return parentUrl
  }

  #makeUrl(url: string) {}
}
