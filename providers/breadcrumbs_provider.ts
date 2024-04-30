import type { ApplicationService } from '@adonisjs/core/types'
import type { RouteTitle, Title } from '../src/types.js'
import type { Breadcrumbs } from '../src/breadcrumbs.js'

import { BreadcrumbsRegistry } from '../src/breadcrumbs_registry.js'
import { BreadcrumbsMiddleware } from '../src/breadcrumbs_middleware.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'breadcrumbs.registry': BreadcrumbsRegistry
  }
}

declare module '@adonisjs/core/http' {
  export interface Route {
    title: RouteTitle<this>
  }

  export interface RouteResource {
    titles: (titles: Record<string, Title>) => this
    title: RouteTitle<this>
  }
  interface HttpContext {
    breadcrumbs: InstanceType<typeof Breadcrumbs>
  }
}

export default class BreadcrumbsProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('breadcrumbs.registry', async () => {
      return new BreadcrumbsRegistry(await this.app.container.make('router'))
    })

    this.app.container.singleton(BreadcrumbsMiddleware, async () => {
      const router = await this.app.container.make('router')
      const registry = await this.app.container.make('breadcrumbs.registry')

      return new BreadcrumbsMiddleware(router, registry)
    })
  }

  async boot() {
    const { addRoutePlugin } = await import('../src/extensions.js')
    addRoutePlugin(await this.app.container.make('breadcrumbs.registry'))
  }
}
