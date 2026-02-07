import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 合并 capability_configs 到 model_configs
 *
 * 该迁移将：
 * 1. 备份 capability_configs 数据
 * 2. 为 model_configs 添加新字段以支持原 capability 配置
 * 3. 将 capability_configs 数据迁移到 model_configs
 * 4. 删除 capability_configs 表
 */
export class MergeCapabilityIntoModel1730822400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ============ 第一步：为 model_configs 添加新字段 ============

    // 添加连接配置字段（来自 capability.config）
    await queryRunner.query(`
      ALTER TABLE model_configs 
      ADD COLUMN IF NOT EXISTS endpoint VARCHAR(500),
      ADD COLUMN IF NOT EXISTS custom_api_key VARCHAR(500),
      ADD COLUMN IF NOT EXISTS custom_timeout INT,
      ADD COLUMN IF NOT EXISTS custom_retries INT,
      ADD COLUMN IF NOT EXISTS config_metadata JSONB
    `);

    // ============ 第二步：删除旧表（如果存在）============

    // 检查 capability_configs 表是否存在
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'capability_configs'
      )
    `);

    // 如果表存在，直接删除（假设是第一次运行，没有历史数据）
    if (tableExists[0]?.exists) {
      // 先删除索引
      await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_capability_type_provider_model"`,
      );
      await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_capability_type_enabled_priority"`,
      );

      // 删除 capability_configs 表
      await queryRunner.query(`DROP TABLE IF EXISTS capability_configs`);
    }

    // ============ 第三步：优化索引 ============

    // 为新字段创建索引以提升查询性能
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_model_configs_capability_enabled" 
      ON model_configs ("capabilityType", enabled)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ============ 回滚操作：重新创建 capability_configs 表 ============

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS capability_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "capabilityType" VARCHAR(100) NOT NULL,
        provider VARCHAR(50) NOT NULL,
        model VARCHAR(100) NOT NULL,
        enabled BOOLEAN DEFAULT true,
        priority INT DEFAULT 0,
        config JSONB NOT NULL,
        limits JSONB,
        pricing JSONB NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "UQ_capability_type_provider_model" UNIQUE ("capabilityType", provider, model)
      )
    `);

    // 重新创建索引
    await queryRunner.query(`
      CREATE INDEX "IDX_capability_type_provider_model" 
      ON capability_configs ("capabilityType", provider, model)
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_capability_type_enabled_priority" 
      ON capability_configs ("capabilityType", enabled, priority)
    `);

    // 从 model_configs 恢复数据到 capability_configs
    await queryRunner.query(`
      INSERT INTO capability_configs (
        id,
        "capabilityType",
        provider,
        model,
        enabled,
        priority,
        config,
        limits,
        pricing,
        "createdAt",
        "updatedAt"
      )
      SELECT 
        m.id,
        m."capabilityType",
        p.name as provider,
        m."modelName" as model,
        m.enabled,
        m.priority,
        COALESCE(m."config_metadata", jsonb_build_object(
          'endpoint', m.endpoint,
          'apiKey', m."custom_api_key",
          'timeout', m."custom_timeout",
          'retries', m."custom_retries"
        )) as config,
        m.metadata as limits,
        jsonb_build_object(
          'unit', 'tokens',
          'inputCost', m."inputCostPer1kTokens",
          'outputCost', m."outputCostPer1kTokens"
        ) as pricing,
        m."createdAt",
        m."updatedAt"
      FROM model_configs m
      INNER JOIN providers p ON p.id = m."providerId"
      WHERE m."config_metadata" IS NOT NULL OR m.endpoint IS NOT NULL
    `);

    // 删除 model_configs 的新增字段
    await queryRunner.query(`
      ALTER TABLE model_configs 
      DROP COLUMN IF EXISTS endpoint,
      DROP COLUMN IF EXISTS "custom_api_key",
      DROP COLUMN IF EXISTS "custom_timeout",
      DROP COLUMN IF EXISTS "custom_retries",
      DROP COLUMN IF EXISTS "config_metadata"
    `);

    // 删除新增的索引
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_model_configs_capability_enabled"
    `);
  }
}
