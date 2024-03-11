import { EmailTakenException } from '#exceptions/user'
import { BadRequestException, NotAllowedException } from '#exceptions/common'
import { DateTime } from 'luxon'
import crypto from 'node:crypto'
import hash from '@adonisjs/core/services/hash'
import User from '#models/user'
import VerificationToken from '#models/verification_token'
import {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
  destroyUserValidator,
} from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async register(ctx: HttpContext) {
    const data = await registerValidator.validate(ctx.request.all())
    const exists = await User.findBy('email', data.email)
    if (exists) {
      throw new EmailTakenException()
    }
    const user = await User.create({ email: data.email, password: data.password })
    const token = await User.accessTokens.create(user)
    return { token }
  }

  async login(ctx: HttpContext) {
    const { email, password } = await loginValidator.validate(ctx.request.all())
    ctx.logger.info('checking user credentials')
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)
    return { token }
  }

  async me(ctx: HttpContext) {
    const user = ctx.auth.user?.id
    return { user }
  }

  // TODO: this should be only allowed in sudo mode
  async destroy(ctx: HttpContext) {
    const requestUser = ctx.auth.user
    const { email, password } = await destroyUserValidator.validate(ctx.request.all())
    const user = await User.verifyCredentials(email, password)
    if (user.id !== requestUser?.id || user.email !== requestUser?.email) {
      throw new NotAllowedException()
    }
    await user.delete()
    return {}
  }

  async requestPasswordReset(ctx: HttpContext) {
    const { email } = ctx.request.only(['email'])
    const user = await User.findBy('email', email)
    if (!user) {
      return {}
    }
    // 160 bits of entropy
    const code = crypto.randomBytes(20).toString('hex')
    const codeHash = await hash.make(code)
    const expiresAt = DateTime.now().plus({ minutes: 20 })
    await VerificationToken.create({ codeHash, userId: user.id, expiresAt })
    // TODO: send email
    return {}
  }

  async resetPassword(ctx: HttpContext) {
    const { email, code, password } = await resetPasswordValidator.validate(ctx.request.all())
    const user = await User.findBy('email', email)
    if (!user) {
      throw new BadRequestException()
    }
    const codeHash = await hash.make(code)
    const userVerificationToken = await VerificationToken.query()
      .where('user_id', user.id)
      .where('code_hash', codeHash)
      .first()
    const now = DateTime.now()
    if (!userVerificationToken) {
      throw new BadRequestException()
    }
    const isTokenExpired = userVerificationToken.expiresAt < now
    if (isTokenExpired) {
      throw new BadRequestException()
    }
    // if we get here, update the users password
    user.password = password
    await Promise.all([user.save(), userVerificationToken.delete()])
    return {}
  }
}
