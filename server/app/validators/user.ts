import vine from '@vinejs/vine'
// This regex ensures the password contains a digit, a lower case letter, an uppercase letter and a special character
const PASSWORD_REGEX = new RegExp('^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\\da-zA-Z]).{8,}$')

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().minLength(8).maxLength(64).trim().regex(PASSWORD_REGEX),
  })
)

export const loginValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().minLength(8).maxLength(64).trim(),
  })
)

export const resetPasswordValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().minLength(8).maxLength(64).trim().regex(PASSWORD_REGEX),
    code: vine.string().trim(),
  })
)

export const destroyUserValidator = vine.compile(
  vine.object({
    email: vine.string().email().trim(),
    password: vine.string().trim(),
  })
)
