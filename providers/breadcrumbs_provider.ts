import type { ApplicationService } from '@adonisjs/core/types'

import { BreadcrumbsRegistry } from '../src/breadcrumbs_registry.js'
import { BreadcrumbsMiddleware } from '../src/middleware/breadcrumbs_middleware.js'

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
