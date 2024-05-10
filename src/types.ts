import type { HttpContext } from '@adonisjs/core/http'

import type { Breadcrumbs as BreadcrumbsType } from './breadcrumbs.js'

export type Title = string | ((ctx: HttpContext, ...args: any[]) => string)

export type RouteTitle<T> = (title: Title) => T

export interface BreadcrumbItem {
  url: string
  title: string
  name?: string
}

export type Breadcrumbs = BreadcrumbsType
