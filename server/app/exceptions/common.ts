import { Exception } from '@adonisjs/core/exceptions'

export class BadRequestException extends Exception {
  static status = 400
  static message = 'Bad Request'
}
export class NotAllowedException extends Exception {
  static status = 403
  static message = 'Bad Request'
}
export class NotFoundException extends Exception {
  static status = 403
  static message = 'Not Found'
}
