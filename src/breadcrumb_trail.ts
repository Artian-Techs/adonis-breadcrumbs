import { BreadcrumbItem } from './types/main.js'

export class BreadcrumbTrail {
  #breadcrumbs: BreadcrumbItem[] = []

  #isParentSet = false

  parent() {
    if (this.#isParentSet) {
      this.#breadcrumbs[0] = {}
    } else {
      this.#isParentSet = true

      this.#breadcrumbs.unshift()
    }

    return this
  }

  /**
   * Add a breadcrumb item to the trail
   */
  add(title: string, item?: BreadcrumbItem) {
    this.#breadcrumbs.push(item)

    return this
  }
}
