import AppDataSource from '../core/database/data-source';
import { Client } from '../entities/client.entity';
import { ModelConfig } from '../entities/model-config.entity';
import { Provider } from '../entities/provider.entity';

async function checkData() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    // 检查 Clients
    const clientRepo = AppDataSource.getRepository(Client);
    const clients = await clientRepo.find();
    console.log(`📱 Clients: ${clients.length}`);
    clients.forEach((client) => {
      console.log(`  - ${client.name} (${client.id})`);
      console.log(`    API Key: ${client.apiKey}`);
      console.log(`    API Secret: ${client.apiSecret}`);
      console.log(`    Status: ${client.status}\n`);
    });

    // 检查 Providers
    const providerRepo = AppDataSource.getRepository(Provider);
    const providers = await providerRepo.find();
    console.log(`\n🏢 Providers: ${providers.length}`);
    providers.forEach((provider) => {
      console.log(`  - ${provider.name} (${provider.type})`);
      console.log(`    Enabled: ${provider.enabled}`);
      console.log(`    Status: ${provider.status}\n`);
    });

    // 检查 Models
    const modelRepo = AppDataSource.getRepository(ModelConfig);
    const models = await modelRepo.find({ relations: ['provider'] });
    console.log(`\n🤖 Models: ${models.length}`);
    models.forEach((model) => {
      console.log(`  - ${model.displayName} (${model.modelName})`);
      console.log(`    Provider: ${model.provider.name}`);
      console.log(`    Capability: ${model.capabilityType}`);
      console.log(`    Enabled: ${model.enabled}`);
      console.log(`    Priority: ${model.priority}\n`);
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();
