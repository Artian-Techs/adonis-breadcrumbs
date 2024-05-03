/// <reference types="@adonisjs/route-model-binding/rmb_middleware" />

import type { StoreRouteNode } from '@adonisjs/core/types/http'
import type { HttpRouterService } from '@adonisjs/core/types'
import type { HttpContext } from '@adonisjs/core/http'

import { BreadcrumbsRegistry } from './breadcrumbs_registry.js'
import { ParamsParser } from './params_parser.js'
import { BreadcrumbsTrail } from './breadcrumbs_trail.js'

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

  #trail: BreadcrumbsTrail

  /**
   * The resources from the current route HttpContext.resources object.
   * Resources are ordered based on the order of route parameters.
   */
  #resources: Record<string, any>[] = []

  /**
   * The current request URL
   */
  #url: string

  constructor(router: HttpRouterService, registry: BreadcrumbsRegistry, ctx: HttpContext) {
    this.#router = router
    this.#registry = registry
    this.#ctx = ctx
    this.#route = ctx.route!
    this.#url = ctx.request.url(true)

    this.#setResources()

    this.#trail = new BreadcrumbsTrail(this.#registry, this.#router, this.#ctx, this.#resources)
  }

  get(routeName?: string) {
    const items = this.#trail.items

    if (items.length > 0) {
      return items
    }

    if (routeName) {
      const callback = this.#registry.getNamedRouteCallback(routeName)
      callback(this.#ctx, this.#trail, ...this.#resources)
    } else {
      this.#build()
    }

    return items
  }

  #setResources() {
    const resolvedParams = new ParamsParser(this.#route.meta.params ?? []).parse()

    if (this.#ctx.resources) {
      this.#resources.push(...resolvedParams.map((param) => this.#ctx.resources[param]))
    }
  }

  #build() {
    const patternFragments = this.#getFragments(this.#route.pattern)
    const urlFragments = this.#getFragments(this.#url)

    for (const [i, fragment] of patternFragments.entries()) {
      const title = this.#registry.getTitleByRoutePattern(fragment)

      if (title) {
        this.#trail.push(
          typeof title === 'function' ? title(this.#ctx, ...this.#resources) : title,
          urlFragments[i],
          this.#router.findOrFail(fragment).name
        )
      }
    }
  }

  /**
   * Get fragments of a route pattern/URL.
   */
  #getFragments(pattern: string) {
    const parts = pattern.split('/')
    const paths = ['/']
    let currentPath = ''

    for (const part of parts) {
      if (part) {
        currentPath += '/' + part
        paths.push(currentPath)
      }
    }

    return paths
  }
}
