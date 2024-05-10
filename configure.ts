import type Configure from '@adonisjs/core/commands/configure'

import { stubsRoot } from './stubs/main.js'

/**
 * Configures the package
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  await codemods.makeUsingStub(stubsRoot, 'config.stub', {})

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
  await codemods.updateRcFile((transformer) => {
    transformer.addProvider('@artian-techs/adonis-breadcrumbs/breadcrumbs_provider')
  })
}
