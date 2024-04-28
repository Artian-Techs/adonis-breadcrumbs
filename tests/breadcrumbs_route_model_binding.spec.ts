import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

import { test } from '@japa/runner'
import { HttpContextFactory, RequestFactory } from '@adonisjs/http-server/factories'
import { HttpContext } from '@adonisjs/core/http'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import RouteModelBindingMiddleware from '@adonisjs/route-model-binding/rmb_middleware'
import { bind } from '@adonisjs/route-model-binding'

import { BreadcrumbsRegistry } from '../src/breadcrumbs_registry.js'
import { migrate, rollback, setupApp } from '../test_helpers/index.js'
import { BreadcrumbsMiddleware } from '../src/breadcrumbs_middleware.js'

test.group('Breadcrumbs - Route Model Binding', () => {
  test('get method should return correct data when route model binding is used', async ({
    assert,
  }) => {
    const app = await setupApp()
    const db = await app.container.make('lucid.db')

    await migrate(db)

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare postId: number

      @column()
      declare slug: string

      @column()
      declare body: string

      @belongsTo(() => Post)
      declare post: BelongsTo<typeof Post>
    }

    class Post extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare title: string

      @column()
      declare slug: string

      @hasMany(() => Comment)
      declare comments: HasMany<typeof Comment>
    }

    class PostsController {
      @bind()
      async show(_: HttpContext, __: Post) {}
    }

    const router = await app.container.make('router')
    const route = router.get('/posts/:post', [PostsController, 'show'])
    router.commit()

    await Post.create({ title: 'Post 1', slug: 'post-1' })

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, (_: HttpContext, post: Post) => post.title)

    const ctx = new HttpContextFactory()
      .merge({
        request: new RequestFactory().merge({ url: '/posts/1', method: 'GET' }).create(),
      })
      .create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route
    ctx.params = router.match(ctx.request.url(), ctx.request.method())?.params ?? {}

    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {})
    await new BreadcrumbsMiddleware(router, registry).handle(ctx, async () => {
      assert.containsSubset(ctx.breadcrumbs.get(), { title: 'Post 1', url: '/posts/1' })
    })

    await rollback(db)
  })

  test('get method should return correct data when route model binding with multiple params', async ({
    assert,
  }) => {
    const app = await setupApp()
    const db = await app.container.make('lucid.db')

    await migrate(db)

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare postId: number

      @column()
      declare slug: string

      @column()
      declare body: string

      @belongsTo(() => Post)
      declare post: BelongsTo<typeof Post>
    }

    class Post extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare title: string

      @column()
      declare slug: string

      @hasMany(() => Comment)
      declare comments: HasMany<typeof Comment>
    }

    class PostsController {
      @bind()
      async show(_: HttpContext, __: Post, ___: Comment) {}
    }

    const router = await app.container.make('router')
    const route = router.get('/posts/:post/comments/:comment', [PostsController, 'show'])
    router.commit()

    await Post.create({ title: 'Post 1', slug: 'post-1' }).then(async (post) => {
      await post.related('comments').create({ slug: 'comment-1', body: 'Comment 1' })
    })

    const registry = new BreadcrumbsRegistry(router)
    registry.register(
      route,
      (_: HttpContext, post: Post, comment: Comment) => `${post.title} - Comment ${comment.id}`
    )

    const ctx = new HttpContextFactory()
      .merge({
        request: new RequestFactory().merge({ url: '/posts/1/comments/1', method: 'GET' }).create(),
      })
      .create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route
    ctx.params = router.match(ctx.request.url(), ctx.request.method())?.params ?? {}

    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {})
    await new BreadcrumbsMiddleware(router, registry).handle(ctx, async () => {
      assert.containsSubset(ctx.breadcrumbs.get(), {
        title: 'Post 1 - Comment 1',
        url: '/posts/1/comments/1',
      })
    })

    await rollback(db)
  })

  test('get method should return correct data when route model binding is used with a custom route param', async ({
    assert,
  }) => {
    const app = await setupApp()
    const db = await app.container.make('lucid.db')

    await migrate(db)

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare postId: number

      @column()
      declare slug: string

      @column()
      declare body: string

      @belongsTo(() => Post)
      declare post: BelongsTo<typeof Post>
    }

    class Post extends BaseModel {
      @column({ isPrimary: true })
      declare id: number

      @column()
      declare title: string

      @column()
      declare slug: string

      @hasMany(() => Comment)
      declare comments: HasMany<typeof Comment>
    }

    class PostsController {
      @bind()
      async show(_: HttpContext, __: Post) {}
    }

    const router = await app.container.make('router')
    const route = router.get('/posts/:post(slug)', [PostsController, 'show'])
    router.commit()

    await Post.create({ title: 'Post 1', slug: 'post-1' })

    const registry = new BreadcrumbsRegistry(router)
    registry.register(route, (_: HttpContext, post: Post) => post.title)

    const ctx = new HttpContextFactory()
      .merge({
        request: new RequestFactory().merge({ url: '/posts/post-1', method: 'GET' }).create(),
      })
      .create()
    ctx.route = router.match(ctx.request.url(), ctx.request.method())!.route
    ctx.params = router.match(ctx.request.url(), ctx.request.method())?.params ?? {}

    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {})
    await new BreadcrumbsMiddleware(router, registry).handle(ctx, async () => {
      assert.containsSubset(ctx.breadcrumbs.get(), { title: 'Post 1', url: '/posts/post-1' })
    })

    await rollback(db)
  })
})
