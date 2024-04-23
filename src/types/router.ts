declare module '@adonisjs/core/http' {
  export interface Route {
    title: (title: string | ((...args: any[]) => string)) => this
  }

  export interface RouteResource {
    titles: (titles: Record<string, string>) => this
  }
}
