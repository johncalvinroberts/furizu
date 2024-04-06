import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected foldersTableName = 'folders'
  protected filesTableName = 'files'

  async up() {
    this.schema.createTable(this.foldersTableName, (table) => {
      table.uuid('id').primary()
      table.uuid('parent_id').nullable().references('folders.id').onDelete('CASCADE')
      table.uuid('electric_user_id').notNullable()
      table.specificType('name', 'varchar').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
    this.schema.createTable(this.filesTableName, (table) => {
      table.uuid('id').primary()
      table.uuid('folder_id').notNullable().references('folders.id').onDelete('CASCADE')
      table.specificType('name', 'varchar').notNullable()
      table.specificType('type', 'varchar').notNullable()
      table.bigInteger('size').notNullable() // Size in bytes
      table.specificType('s3_key', 'varchar').notNullable()
      table.uuid('electric_user_id').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
    this.schema.raw('CREATE INDEX idx_files_folder_id ON files(folder_id)')
    this.schema.raw('CREATE INDEX idx_files_user_id ON files(electric_user_id)')
    this.schema.raw('CREATE INDEX idx_folders_parent_id ON folders(parent_id)')

    this.schema.raw('ALTER TABLE folders ENABLE ELECTRIC')
    this.schema.raw('ALTER TABLE files ENABLE ELECTRIC')
  }

  async down() {
    this.schema.dropTable(this.foldersTableName)
    // this.schema.raw('ALTER TABLE files DISABLE ELECTRIC')
    // this.schema.dropTable(this.filesTableName)
  }
}
