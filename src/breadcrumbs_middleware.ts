import type { NextFn } from '@adonisjs/core/types/http'
import type { HttpRouterService } from '@adonisjs/core/types'

import { HttpContext } from '@adonisjs/core/http'

import { Breadcrumbs } from './breadcrumbs.js'
import { BreadcrumbsRegistry } from './breadcrumbs_registry.js'

export class BreadcrumbsMiddleware {
  constructor(
    protected router: HttpRouterService,
    protected registry: BreadcrumbsRegistry
  ) {}

  async handle(ctx: HttpContext, next: NextFn) {
    if (ctx.route) {
      ctx.breadcrumbs = new Breadcrumbs(this.router, this.registry, ctx)
    }

    await next()
  }
}
