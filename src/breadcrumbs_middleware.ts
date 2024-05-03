/// <reference types="@adonisjs/core/providers/edge_provider" />
/// <reference types="@adonisjs/inertia/inertia_middleware" />

import type { NextFn } from '@adonisjs/core/types/http'
import type { HttpRouterService } from '@adonisjs/core/types'

import { HttpContext } from '@adonisjs/core/http'

import { Breadcrumbs } from './breadcrumbs.js'
import { BreadcrumbsRegistry } from './breadcrumbs_registry.js'

export default class BreadcrumbsMiddleware {
  constructor(
    protected router: HttpRouterService,
    protected registry: BreadcrumbsRegistry
  ) {}

  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.route) {
      ctx.breadcrumbs = new Breadcrumbs(this.router, this.registry, ctx)

      /**
       * Share breadcrumbs instance with Inertia and Edge views
       */
      for (const module of ['view', 'inertia'] as const) {
        if (ctx[module]) {
          ctx[module].share({
            breadcrumbs: ctx.breadcrumbs,
          })
        }
      }
    }

    await next()
  }
}
