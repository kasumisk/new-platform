/**
 * App 版本种子数据脚本
 * 运行方式：npx ts-node -r tsconfig-paths/register src/scripts/seed-app-versions.ts
 */
import { DataSource } from 'typeorm';
import {
  AppVersion,
  AppPlatform,
  UpdateType,
  AppVersionStatus,
} from '../entities/app-version.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ai_platform',
  entities: [AppVersion],
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
});

function parseVersionCode(version: string): number {
  const parts = version.split('.').map(Number);
  return (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
}

const versions: Partial<AppVersion>[] = [
  // ========== Android 版本 ==========
  {
    platform: AppPlatform.ANDROID,
    version: '1.0.0',
    versionCode: parseVersionCode('1.0.0'),
    updateType: UpdateType.OPTIONAL,
    title: 'v1.0.0 首次发布',
    description:
      '## 🎉 首次发布\n\n- 基础功能上线\n- 支持文本生成\n- 支持多模型切换',
    downloadUrl: 'https://example.com/releases/android/app-v1.0.0.apk',
    fileSize: 15360000,
    checksum: 'md5:a1b2c3d4e5f6',
    channel: 'official',
    status: AppVersionStatus.ARCHIVED,
    grayRelease: false,
    grayPercent: 0,
    releaseDate: new Date('2025-06-01'),
    i18nDescription: {
      'zh-CN':
        '## 🎉 首次发布\n\n- 基础功能上线\n- 支持文本生成\n- 支持多模型切换',
      'en-US':
        '## 🎉 Initial Release\n\n- Core features launched\n- Text generation support\n- Multi-model switching',
    },
  },
  {
    platform: AppPlatform.ANDROID,
    version: '1.1.0',
    versionCode: parseVersionCode('1.1.0'),
    updateType: UpdateType.OPTIONAL,
    title: 'v1.1.0 功能优化',
    description:
      '## ✨ 功能优化\n\n- 新增图片识别功能\n- 优化对话界面\n- 修复已知 bug',
    downloadUrl: 'https://example.com/releases/android/app-v1.1.0.apk',
    fileSize: 16384000,
    checksum: 'md5:b2c3d4e5f6a7',
    channel: 'official',
    status: AppVersionStatus.PUBLISHED,
    grayRelease: false,
    grayPercent: 0,
    releaseDate: new Date('2025-08-15'),
    i18nDescription: {
      'zh-CN':
        '## ✨ 功能优化\n\n- 新增图片识别功能\n- 优化对话界面\n- 修复已知 bug',
      'en-US':
        '## ✨ Feature Improvements\n\n- Added image recognition\n- Optimized chat UI\n- Fixed known bugs',
    },
  },
  {
    platform: AppPlatform.ANDROID,
    version: '1.2.0',
    versionCode: parseVersionCode('1.2.0'),
    updateType: UpdateType.FORCE,
    title: 'v1.2.0 重要安全更新',
    description:
      '## 🔐 重要安全更新\n\n- 修复关键安全漏洞\n- 升级网络传输加密\n- 优化性能',
    downloadUrl: 'https://example.com/releases/android/app-v1.2.0.apk',
    fileSize: 17408000,
    checksum: 'md5:c3d4e5f6a7b8',
    channel: 'official',
    minSupportVersion: '1.1.0',
    minSupportVersionCode: parseVersionCode('1.1.0'),
    status: AppVersionStatus.PUBLISHED,
    grayRelease: false,
    grayPercent: 0,
    releaseDate: new Date('2025-12-01'),
    i18nDescription: {
      'zh-CN':
        '## 🔐 重要安全更新\n\n- 修复关键安全漏洞\n- 升级网络传输加密\n- 优化性能',
      'en-US':
        '## 🔐 Critical Security Update\n\n- Fixed critical security vulnerability\n- Upgraded network encryption\n- Performance optimizations',
    },
  },

  // ========== iOS 版本 ==========
  {
    platform: AppPlatform.IOS,
    version: '1.0.0',
    versionCode: parseVersionCode('1.0.0'),
    updateType: UpdateType.OPTIONAL,
    title: 'v1.0.0 首次发布',
    description:
      '## 🎉 首次发布\n\n- 基础功能上线\n- 支持文本生成\n- 支持多模型切换',
    downloadUrl: 'https://apps.apple.com/app/example/id123456789',
    fileSize: 20480000,
    channel: 'app_store',
    status: AppVersionStatus.ARCHIVED,
    grayRelease: false,
    grayPercent: 0,
    releaseDate: new Date('2025-06-15'),
    i18nDescription: {
      'zh-CN':
        '## 🎉 首次发布\n\n- 基础功能上线\n- 支持文本生成\n- 支持多模型切换',
      'en-US':
        '## 🎉 Initial Release\n\n- Core features launched\n- Text generation support\n- Multi-model switching',
    },
  },
  {
    platform: AppPlatform.IOS,
    version: '1.1.0',
    versionCode: parseVersionCode('1.1.0'),
    updateType: UpdateType.OPTIONAL,
    title: 'v1.1.0 功能优化',
    description:
      '## ✨ 功能优化\n\n- 新增图片识别功能\n- 适配 iOS 17\n- 修复已知 bug',
    downloadUrl: 'https://apps.apple.com/app/example/id123456789',
    fileSize: 22528000,
    channel: 'app_store',
    status: AppVersionStatus.PUBLISHED,
    grayRelease: false,
    grayPercent: 0,
    releaseDate: new Date('2025-09-01'),
    i18nDescription: {
      'zh-CN':
        '## ✨ 功能优化\n\n- 新增图片识别功能\n- 适配 iOS 17\n- 修复已知 bug',
      'en-US':
        '## ✨ Feature Improvements\n\n- Added image recognition\n- iOS 17 compatibility\n- Fixed known bugs',
    },
  },

  // ========== 草稿版本 (用于测试) ==========
  {
    platform: AppPlatform.ANDROID,
    version: '1.3.0',
    versionCode: parseVersionCode('1.3.0'),
    updateType: UpdateType.OPTIONAL,
    title: 'v1.3.0 新功能预览（灰度）',
    description:
      '## 🚀 新功能预览\n\n- AI 语音对话\n- 文档上传分析\n- 新增 DeepSeek 模型支持',
    downloadUrl: 'https://example.com/releases/android/app-v1.3.0-beta.apk',
    fileSize: 18432000,
    checksum: 'sha256:d4e5f6a7b8c9',
    channel: 'official',
    minSupportVersion: '1.1.0',
    minSupportVersionCode: parseVersionCode('1.1.0'),
    status: AppVersionStatus.DRAFT,
    grayRelease: true,
    grayPercent: 20,
  },
];

async function seed() {
  console.log('🔄 开始初始化 App 版本数据...');

  await AppDataSource.initialize();

  const repo = AppDataSource.getRepository(AppVersion);

  for (const versionData of versions) {
    const existing = await repo.findOne({
      where: {
        platform: versionData.platform,
        version: versionData.version,
      },
    });

    if (existing) {
      console.log(
        `  ⏭️  版本已存在: ${versionData.platform} v${versionData.version}`,
      );
    } else {
      const entity = repo.create(versionData);
      await repo.save(entity);
      console.log(
        `  ✅ 创建版本: ${versionData.platform} v${versionData.version} (${versionData.status})`,
      );
    }
  }

  console.log('\n✅ App 版本数据初始化完成！');
  console.log(`\n📊 总结:`);
  console.log(`  - Android 版本: 4 个 (3 发布/归档, 1 草稿灰度)`);
  console.log(`  - iOS 版本: 2 个 (全部发布/归档)`);

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('❌ 初始化失败:', err);
  process.exit(1);
});
