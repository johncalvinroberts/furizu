/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
const UsersController = () => import('#controllers/users_controller')
const TokensController = () => import('#controllers/tokens_controller')

router
  .group(() => {
    router
      .group(() => {
        router.get('/', async () => {
          return {
            good: 'morning',
          }
        })
        router
          .group(() => {
            router.post('register', [UsersController, 'register'])
            router.post('login', [UsersController, 'login'])
            router.post('reset-password', [UsersController, 'resetPassword'])
            router.post('request-password-reset', [UsersController, 'requestPasswordReset'])
            router
              .group(() => {
                router.get('me', [UsersController, 'me'])
              })
              .use(middleware.auth())
          })
          .prefix('users')
        router
          .group(() => {
            router.get('/', [TokensController, 'list'])
            router.patch('/', [TokensController, 'swap'])
            router.delete('/:id', [TokensController, 'destroy'])
          })
          .use(middleware.auth())
          .prefix('tokens')
      })
      .prefix('v1')
  })
  .prefix('api')
