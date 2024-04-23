import { Breadcrumbs } from '../breadcrumbs.js'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    breadcrumbs: InstanceType<typeof Breadcrumbs>
  }
}
