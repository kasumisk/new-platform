import AppDataSource from '../core/database/data-source';

async function checkMigrations() {
  try {
    await AppDataSource.initialize();
    console.log('✅ 数据库连接成功\n');

    // 查询已执行的迁移
    const migrations = await AppDataSource.query(`
      SELECT * FROM migrations ORDER BY timestamp
    `);

    console.log('已执行的迁移:');
    console.log('=====================');
    migrations.forEach((m: any) => {
      console.log(`- ${m.name} (timestamp: ${m.timestamp})`);
    });
    console.log('\n总计:', migrations.length, '个迁移已执行');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkMigrations();
