import { Breadcrumbs as BreadcrumbsType } from './breadcrumbs.js'

export type Title = string | ((...args: any[]) => string)

export type RouteTitle<T> = (title: Title) => T

export type BreadcrumbItem = {
  url: string
  title: string
  name?: string
  parent?: BreadcrumbItem
}

export type Breadcrumbs = BreadcrumbsType
