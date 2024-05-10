/// <reference types="@adonisjs/route-model-binding/rmb_middleware" />

import type { StoreRouteNode } from '@adonisjs/core/types/http'
import type { HttpRouterService } from '@adonisjs/core/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { BreadcrumbItem, Title } from './types.js'

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

  /**
   * The breadcrumbs trail instance
   */
  #trail: BreadcrumbsTrail

  /**
   * The resources from the current route HttpContext.resources object.
   * Resources are ordered based on the order of route parameters.
   * Resources are set only when route model binding is used
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
    if (this.#trail.items.length > 0) {
      return this.#trail.items
    }

    if (routeName) {
      const callback = this.#registry.getNamedRouteCallback(routeName)
      callback(this.#ctx, this.#trail, ...this.#resources)
    } else {
      this.#build()
    }

    /**
     * If a global prefix is defined in the config,
     * then add it to the start of the trail
     */
    if (this.#registry.prefix) {
      let prefix =
        typeof this.#registry.prefix === 'function'
          ? this.#registry.prefix(this.#ctx, this.#router)
          : this.#registry.prefix

      if (prefix) {
        /**
         * If the prefix is a string, we need to perform some checks.
         * - We need to find a match for the prefix if it's a URL with dynamic parameters.
         * - If there is a match, get the route pattern and find its registered title.
         * - If a title is found, construct a BreadcrumbItem object and resolve the title.
         */
        if (typeof prefix === 'string') {
          const route = this.#router.match(prefix, 'GET')?.route

          if (route) {
            const title = this.#registry.getTitleByRoutePattern(route.pattern)

            if (!title) {
              throw new Error(
                `Cannot find a title for the route ${route.pattern}. Make sure to register one.`
              )
            }

            prefix = {
              title: this.#resolveTitle(title),
              url: prefix,
              name: route.name,
            }
          }
        }

        const item = prefix as BreadcrumbItem

        /**
         * To add the prefix breadcrumb item at the start of the trail,
         * it must not have the same URL as the current URL
         */
        if (item.url !== this.#url) {
          this.#trail.items.unshift(item)
        }
      }
    }

    return this.#trail.items
  }

  /**
   * Return breadcrumbs without the specified routes
   */
  skip(routeNames: string | string[]) {
    const routes = Array.isArray(routeNames) ? routeNames : [routeNames]

    return this.get().filter((item) => !routes.includes(item.name!))
  }

  /**
   * Set resources if route model binding is used
   */
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
          this.#resolveTitle(title),
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

  #resolveTitle(title: Title) {
    return typeof title === 'function' ? title(this.#ctx, ...this.#resources) : title
  }
}
