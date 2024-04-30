import type Configure from '@adonisjs/core/commands/configure'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  /**
   * Register middleware
   */
  await codemods.registerMiddleware('router', [
    {
      path: '@artian-techs/adonis-breadcrumbs/breadcrumbs_middleware',
    },
  ])

  /**
   * Register provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@artian-techs/adonis-breadcrumbs/breadcrumbs_provider')
  })
}
