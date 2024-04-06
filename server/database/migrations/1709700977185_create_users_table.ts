import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').notNullable().primary()
      table.specificType('full_name', 'varchar').nullable()
      table.specificType('email', 'varchar').nullable() // note: should be unique!
      table.specificType('password', 'varchar').nullable()
      table.timestamp('email_verified_at').nullable()
      table.timestamp('unprovisional_at').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
