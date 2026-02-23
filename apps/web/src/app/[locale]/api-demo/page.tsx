import { useTranslations } from 'next-intl';
import { UserList } from './client-example';
import { AppFileUploadDemo } from './upload-example';

export default function ApiDemoPage() {
  const t = useTranslations('pages.api-demo');

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-gray-600">{t('description')}</p>
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">📤 App 用户文件上传示例</h2>
        <p className="text-sm text-gray-600 mb-4">
          支持服务器中转上传和预签名 URL 客户端直传两种方式，兼容 Cloudflare R2 / AWS S3
        </p>
        <AppFileUploadDemo />
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">客户端 API 示例</h2>
        <p className="text-sm text-gray-600 mb-4">
          使用 React Query + Axios，支持自动缓存、重试、错误处理
        </p>
        <UserList />
      </div>

      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">API 特性</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">🔐 认证管理</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 自动添加 Authorization token</li>
              <li>• Token 过期自动处理</li>
              <li>• 支持服务端和客户端</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">🔄 请求管理</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 自动重试机制</li>
              <li>• 请求超时控制</li>
              <li>• 请求/响应拦截器</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">⚠️ 错误处理</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 统一错误类型 (APIError)</li>
              <li>• 详细错误信息</li>
              <li>• 可配置的错误提示</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">📝 类型安全</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• TypeScript 完整支持</li>
              <li>• 泛型响应类型</li>
              <li>• 服务层封装</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">📤 文件操作</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 文件上传（进度监听）</li>
              <li>• 文件下载</li>
              <li>• 多文件批量上传</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">📊 日志记录</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 请求日志</li>
              <li>• 错误日志</li>
              <li>• 开发/生产环境区分</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-blue-50 dark:bg-blue-900/20">
        <h2 className="text-xl font-bold mb-2">📚 使用文档</h2>
        <p className="text-sm mb-4">
          完整的 API 使用指南请查看项目根目录的{' '}
          <code className="bg-black/10 px-2 py-1 rounded">API_GUIDE.md</code> 文件
        </p>
        <div className="space-y-2 text-sm">
          <div>
            <strong>客户端调用:</strong>
            <pre className="bg-black/10 p-2 rounded mt-1 overflow-x-auto">
              {`import { clientGet } from '@/lib/api';
const response = await clientGet<User[]>('/users');`}
            </pre>
          </div>
          <div>
            <strong>服务端调用:</strong>
            <pre className="bg-black/10 p-2 rounded mt-1 overflow-x-auto">
              {`import { serverGet } from '@/lib/api';
const response = await serverGet<User[]>('/users');`}
            </pre>
          </div>
          <div>
            <strong>使用服务层:</strong>
            <pre className="bg-black/10 p-2 rounded mt-1 overflow-x-auto">
              {`import { userService } from '@/lib/api/services';
const response = await userService.getUsers();`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
