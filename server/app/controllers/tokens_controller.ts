import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { BadRequestException, NotFoundException } from '#exceptions/common'

export default class TokensController {
  async list(ctx: HttpContext) {
    const userId = ctx.auth.user?.id
    const user = await User.findOrFail(userId)
    const currentToken = ctx.auth.user?.currentAccessToken
    const allTokens = User.accessTokens.all(user)
    return { currentToken, allTokens }
  }

  // swaps the users current access token with a new one, destroying the old one
  async swap(ctx: HttpContext) {
    const currentToken = ctx.auth.user?.currentAccessToken
    const user = await User.findOrFail(ctx.auth.user?.id)
    const nextToken = await User.accessTokens.create(user)
    await User.accessTokens.delete(user, currentToken!.identifier)
    return nextToken
  }

  async destroy(ctx: HttpContext) {
    const userId = ctx.auth.user?.id
    const tokenId = ctx.params.id
    const user = await User.findOrFail(userId)
    if (!user) {
      throw new BadRequestException()
    }
    const token = await User.accessTokens.find(user, tokenId)
    if (!token || token.tokenableId !== userId) {
      throw new NotFoundException()
    }
    await User.accessTokens.delete(user, token.identifier)
  }
}
