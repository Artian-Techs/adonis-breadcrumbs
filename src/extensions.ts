import { Route } from '@adonisjs/core/http'
import { BreadcrumbsRegistry } from './breadcrumbs_registry.js'

export function addRoutePlugin(registry: BreadcrumbsRegistry) {
  Route.macro('title', function (this: Route, title: string | ((...args: any[]) => string)) {
    registry.register(this.getPattern(), title)

    return this
  })
}
