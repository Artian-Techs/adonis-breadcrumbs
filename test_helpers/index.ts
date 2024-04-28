import type { Database } from '@adonisjs/lucid/database'

import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { IgnitorFactory } from '@adonisjs/core/factories'
import { defineConfig } from '@adonisjs/lucid'

const BASE_URL = new URL('./tmp', import.meta.url)
const BASE_PATH = fileURLToPath(BASE_URL)

export async function setupApp() {
  const ignitor = new IgnitorFactory()
    .withCoreProviders()
    .withCoreConfig()
    .merge({
      rcFileContents: {
        providers: [
          () => import('@adonisjs/lucid/database_provider'),
          () => import('@adonisjs/route-model-binding/rmb_provider'),
          () => import('../providers/breadcrumbs_provider.js'),
        ],
      },
      config: {
        database: defineConfig({
          connection: 'sqlite',
          connections: {
            sqlite: {
              client: 'better-sqlite3',
              connection: {
                filename: join(BASE_PATH, 'db.sqlite3'),
              },
            },
          },
        }),
      },
    })
    .create(BASE_URL, {
      importer: (filePath) => {
        if (filePath.startsWith('./') || filePath.startsWith('../')) {
          return import(new URL(filePath, BASE_URL).href)
        }

        return import(filePath)
      },
    })

  const app = ignitor.createApp('web')
  await app.init()
  await app.boot()

  return app
}

/**
 * Migrate database
 */
export async function migrate(database: Database) {
  await database.connection().schema.createTable('posts', (table) => {
    table.increments('id')
    table.string('title').notNullable()
    table.string('slug').notNullable()
  })

  await database.connection().schema.createTable('comments', (table) => {
    table.increments('id')
    table.integer('post_id').notNullable().unsigned().references('id').inTable('posts')
    table.string('body').notNullable()
    table.string('slug').notNullable()
  })
}

/**
 * Rollback database
 */
export async function rollback(database: Database) {
  await database.connection().schema.dropTable('comments')
  await database.connection().schema.dropTable('posts')
  await database.manager.closeAll()
}
