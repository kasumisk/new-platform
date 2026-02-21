import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * 迁移：拆分用户表
 * - 创建 admin_users 表（管理后台用户）
 * - 创建 app_users 表（App 用户）
 * - 将现有 users 表中的数据迁移到 admin_users
 * - 更新 user_roles 外键引用
 * - 删除旧 users 表
 */
export class SplitUsersTable1740000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. 创建 admin_users 表
    await queryRunner.query(`
      CREATE TYPE "admin_role_enum" AS ENUM ('super_admin', 'admin')
    `);
    await queryRunner.query(`
      CREATE TYPE "admin_user_status_enum" AS ENUM ('active', 'inactive', 'suspended')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'admin_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          { name: 'username', type: 'varchar', length: '100', isUnique: true },
          { name: 'password', type: 'varchar', length: '255' },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isNullable: true,
            isUnique: true,
          },
          { name: 'phone', type: 'varchar', length: '20', isNullable: true },
          { name: 'role', type: 'admin_role_enum', default: "'admin'" },
          {
            name: 'status',
            type: 'admin_user_status_enum',
            default: "'active'",
          },
          { name: 'avatar', type: 'varchar', length: '255', isNullable: true },
          {
            name: 'nickname',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'last_login_at', type: 'timestamp', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 2. 创建 app_users 表
    await queryRunner.query(`
      CREATE TYPE "app_user_auth_type_enum" AS ENUM ('anonymous', 'google', 'email')
    `);
    await queryRunner.query(`
      CREATE TYPE "app_user_status_enum" AS ENUM ('active', 'inactive', 'banned')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'app_users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'auth_type',
            type: 'app_user_auth_type_enum',
            default: "'anonymous'",
          },
          { name: 'email', type: 'varchar', length: '255', isNullable: true },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'google_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'device_id',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'nickname',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          { name: 'avatar', type: 'varchar', length: '255', isNullable: true },
          { name: 'status', type: 'app_user_status_enum', default: "'active'" },
          { name: 'email_verified', type: 'boolean', default: false },
          { name: 'last_login_at', type: 'timestamp', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // 创建 app_users 索引
    await queryRunner.createIndex(
      'app_users',
      new TableIndex({
        name: 'IDX_app_users_email',
        columnNames: ['email'],
        isUnique: true,
        where: '"email" IS NOT NULL',
      }),
    );
    await queryRunner.createIndex(
      'app_users',
      new TableIndex({
        name: 'IDX_app_users_google_id',
        columnNames: ['google_id'],
        isUnique: true,
        where: '"google_id" IS NOT NULL',
      }),
    );
    await queryRunner.createIndex(
      'app_users',
      new TableIndex({
        name: 'IDX_app_users_device_id',
        columnNames: ['device_id'],
      }),
    );

    // 3. 将现有 users 表数据迁移到 admin_users
    // 仅迁移管理员用户（is_admin = true 或 role = 'admin'）
    await queryRunner.query(`
      INSERT INTO admin_users (id, username, password, email, phone, role, status, avatar, nickname, last_login_at, created_at, updated_at)
      SELECT id, username, password, email, phone,
        CASE WHEN role = 'admin' OR is_admin = true THEN 'super_admin'::admin_role_enum ELSE 'admin'::admin_role_enum END,
        CASE
          WHEN status = 'active' THEN 'active'::admin_user_status_enum
          WHEN status = 'inactive' THEN 'inactive'::admin_user_status_enum
          WHEN status = 'suspended' THEN 'suspended'::admin_user_status_enum
          ELSE 'active'::admin_user_status_enum
        END,
        avatar, nickname, last_login_at, created_at, updated_at
      FROM users
    `);

    // 4. 删除 user_roles 的旧外键约束（如果存在）
    try {
      await queryRunner.query(`
        ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS "FK_user_roles_user_id"
      `);
      await queryRunner.query(`
        ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS "FK_87b8888186ca9769c960e926870"
      `);
    } catch {
      // 约束可能不存在，忽略
    }

    // 5. 重新添加外键指向 admin_users
    await queryRunner.query(`
      ALTER TABLE user_roles ADD CONSTRAINT "FK_user_roles_admin_user_id"
        FOREIGN KEY ("user_id") REFERENCES admin_users(id) ON DELETE CASCADE
    `);

    // 6. 删除旧 users 表
    await queryRunner.query(`DROP TABLE IF EXISTS users CASCADE`);

    // 清理旧枚举类型
    await queryRunner.query(`DROP TYPE IF EXISTS "users_role_enum" CASCADE`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_status_enum" CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除外键
    await queryRunner.query(`
      ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS "FK_user_roles_admin_user_id"
    `);

    // 删除新表
    await queryRunner.query(`DROP TABLE IF EXISTS app_users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS admin_users CASCADE`);

    // 删除枚举类型
    await queryRunner.query(`DROP TYPE IF EXISTS "admin_role_enum" CASCADE`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "admin_user_status_enum" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "app_user_auth_type_enum" CASCADE`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "app_user_status_enum" CASCADE`,
    );
  }
}
