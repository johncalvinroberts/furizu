import { Exception } from '@adonisjs/core/exceptions'

export class EmailTakenException extends Exception {
  static status = 409
  static message = 'This email is already taken'
}
