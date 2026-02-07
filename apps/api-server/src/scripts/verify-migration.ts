import AppDataSource from '../core/database/data-source';

async function verifyData() {
  try {
    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    // 检查 providers
    const providers = await AppDataSource.query(`
      SELECT id, name, type, enabled, status FROM providers ORDER BY name
    `);
    console.log('Providers:');
    console.log('==========');
    providers.forEach((p: any) => {
      console.log(
        `- ${p.name} (${p.type}) - enabled: ${p.enabled}, status: ${p.status}`,
      );
    });
    console.log(`\n总计: ${providers.length} 个提供商\n`);

    // 检查 model_configs
    const models = await AppDataSource.query(`
      SELECT 
        m.id,
        m."modelName",
        m."capabilityType",
        p.name as provider_name,
        m.enabled,
        m.status
      FROM model_configs m
      JOIN providers p ON p.id = m."providerId"
      ORDER BY p.name, m."capabilityType", m."modelName"
    `);
    console.log('Model Configs:');
    console.log('==============');
    models.forEach((m: any) => {
      console.log(
        `- ${m.provider_name}/${m.modelName} (${m.capabilityType}) - enabled: ${m.enabled}, status: ${m.status}`,
      );
    });
    console.log(`\n总计: ${models.length} 个模型配置\n`);

    // 检查 client_capability_permissions 的字段
    const permissionColumns = await AppDataSource.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'client_capability_permissions'
      ORDER BY ordinal_position
    `);
    console.log('Permission Table Columns:');
    console.log('=========================');
    permissionColumns.forEach((c: any) => {
      console.log(`- ${c.column_name}: ${c.data_type}`);
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

verifyData();
