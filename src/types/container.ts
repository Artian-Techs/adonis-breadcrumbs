import { BreadcrumbsRegistry } from '../breadcrumbs_registry.js'

declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'breadcrumbs.registry': BreadcrumbsRegistry
  }
}
