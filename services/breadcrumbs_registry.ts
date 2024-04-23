import app from '@adonisjs/core/services/app'
import { BreadcrumbsRegistry } from '../src/breadcrumbs_registry.js'

let registry: BreadcrumbsRegistry

await app.booted(async () => {
  registry = await app.container.make('breadcrumbs.registry')
})

export { registry as default }
