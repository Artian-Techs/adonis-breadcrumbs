import type { HttpRouterService } from '@adonisjs/core/types'
import type { HttpContext } from '@adonisjs/core/http'
import type { BreadcrumbItem } from './types.js'

/**
 * Expected shape of the config accepted by the "defineConfig" method
 */
export type BreadcrumbsConfig = {
  prefix?:
    | string
    | BreadcrumbItem
    | ((ctx: HttpContext, router: HttpRouterService) => string | BreadcrumbItem | undefined)
    | null
}

/**
 * Define config for Breadcrumbs
 */
export function defineConfig<T extends BreadcrumbsConfig>(config: T): T {
  return config
}
