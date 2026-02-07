import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Image,
  Shrink,
  Pipette,
  QrCode,
  FileJson,
  Clock,
  KeyRound,
  Palette,
  Regex,
  Binary,
  Video,
  Film,
  FileText,
  FileImage,
  Merge,
  FileType,
} from 'lucide-react';

interface Tool {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  category: 'image' | 'video' | 'pdf' | 'dev' | 'text' | 'other';
  isNew?: boolean;
  comingSoon?: boolean;
}

const tools: Tool[] = [
  // 图片工具
  {
    title: '图片格式转换',
    description: '支持 PNG、JPG、WebP、GIF、BMP 等格式互转，可调节质量和尺寸',
    icon: Image,
    href: '/tools/image-converter',
    color: 'text-blue-500',
    category: 'image',
  },
  {
    title: '图片压缩',
    description: '智能压缩图片大小，保持最佳画质，支持批量处理',
    icon: Shrink,
    href: '/tools/image-compressor',
    color: 'text-green-500',
    category: 'image',
    isNew: true,
  },
  {
    title: '取色器',
    description: '从图片中提取颜色，支持 HEX、RGB、HSL 多种格式输出',
    icon: Pipette,
    href: '/tools/color-picker',
    color: 'text-pink-500',
    category: 'image',
    isNew: true,
  },
  // 视频工具
  {
    title: '视频格式转换',
    description: '支持 MP4、WebM、MOV、AVI 等格式互转，浏览器本地处理',
    icon: Video,
    href: '/tools/video-converter',
    color: 'text-violet-500',
    category: 'video',
    isNew: true,
  },
  {
    title: '视频压缩',
    description: '智能压缩视频大小，保持最佳画质，支持自定义分辨率',
    icon: Film,
    href: '/tools/video-compressor',
    color: 'text-emerald-500',
    category: 'video',
    isNew: true,
  },
  // PDF 工具
  {
    title: 'PDF 转图片',
    description: '将 PDF 文档转换为高清 PNG/JPG 图片，支持批量导出',
    icon: FileImage,
    href: '/tools/pdf-to-image',
    color: 'text-red-500',
    category: 'pdf',
    isNew: true,
  },
  {
    title: '图片转 PDF',
    description: '将多张图片合并为 PDF 文件，支持拖拽排序',
    icon: FileText,
    href: '/tools/image-to-pdf',
    color: 'text-orange-500',
    category: 'pdf',
    isNew: true,
  },
  {
    title: 'PDF 转文本',
    description: '从 PDF 中提取文字内容，支持复制和下载为 TXT',
    icon: FileType,
    href: '/tools/pdf-to-text',
    color: 'text-teal-500',
    category: 'pdf',
    isNew: true,
  },
  {
    title: 'PDF 合并拆分',
    description: '合并多个 PDF 文件或按页拆分，本地处理更安全',
    icon: Merge,
    href: '/tools/pdf-merge-split',
    color: 'text-indigo-500',
    category: 'pdf',
    isNew: true,
  },
  // 开发工具
  {
    title: 'JSON 格式化',
    description: '格式化、压缩、验证 JSON 数据，支持自定义缩进',
    icon: FileJson,
    href: '/tools/json-formatter',
    color: 'text-yellow-500',
    category: 'dev',
    isNew: true,
  },
  {
    title: '正则表达式测试',
    description: '在线测试正则表达式，实时高亮匹配结果，内置常用模式',
    icon: Regex,
    href: '/tools/regex',
    color: 'text-cyan-500',
    category: 'dev',
    isNew: true,
  },
  {
    title: '时间戳转换',
    description: 'Unix 时间戳与日期时间互转，支持毫秒和秒级精度',
    icon: Clock,
    href: '/tools/timestamp',
    color: 'text-purple-500',
    category: 'dev',
    isNew: true,
  },
  {
    title: 'Base64 编解码',
    description: '文本与 Base64 格式互转，完整支持中文编码',
    icon: Binary,
    href: '/tools/base64',
    color: 'text-orange-500',
    category: 'dev',
    isNew: true,
  },
  // 其他工具 (即将推出)
  {
    title: '二维码生成',
    description: '生成自定义二维码，支持 Logo、颜色、样式设置',
    icon: QrCode,
    href: '/tools/qrcode',
    color: 'text-indigo-500',
    category: 'other',
    isNew: true,
  },
  {
    title: '密码生成器',
    description: '生成安全随机密码，可自定义长度和字符类型',
    icon: KeyRound,
    href: '#',
    color: 'text-red-500',
    category: 'other',
    comingSoon: true,
  },
];

const categories = [
  { id: 'all', name: '全部工具' },
  { id: 'image', name: '图片工具' },
  { id: 'video', name: '视频工具' },
  { id: 'pdf', name: 'PDF 工具' },
  { id: 'dev', name: '开发工具' },
  { id: 'other', name: '其他工具' },
];

export const metadata: Metadata = {
  title: '在线工具箱 - Tools',
  description: '实用的在线工具集合，包括图片格式转换、压缩、取色器、JSON格式化等功能',
};

export default function ToolsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧰 在线工具箱</h1>
        <p className="text-muted-foreground">
          实用的在线工具，无需安装，即开即用，数据本地处理更安全
        </p>
      </div>

      {/* 分类导航 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <a
            key={cat.id}
            href={cat.id === 'all' ? '#' : `#${cat.id}`}
            className="px-4 py-2 rounded-full bg-muted hover:bg-primary/10 transition-colors text-sm font-medium"
          >
            {cat.name}
          </a>
        ))}
      </div>

      {/* 图片工具 */}
      <section id="image" className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-500" />
          图片工具
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools
            .filter((t) => t.category === 'image')
            .map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
        </div>
      </section>

      {/* 视频工具 */}
      <section id="video" className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-violet-500" />
          视频工具
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools
            .filter((t) => t.category === 'video')
            .map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
        </div>
      </section>

      {/* PDF 工具 */}
      <section id="pdf" className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          PDF 工具
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools
            .filter((t) => t.category === 'pdf')
            .map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
        </div>
      </section>

      {/* 开发工具 */}
      <section id="dev" className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileJson className="w-5 h-5 text-yellow-500" />
          开发工具
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools
            .filter((t) => t.category === 'dev')
            .map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
        </div>
      </section>

      {/* 其他工具 */}
      <section id="other" className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-red-500" />
          其他工具
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools
            .filter((t) => t.category === 'other')
            .map((tool) => (
              <ToolCard key={tool.href} tool={tool} />
            ))}
        </div>
      </section>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  if (tool.comingSoon) {
    return (
      <div>
        <Card className="h-full transition-all cursor-not-allowed opacity-60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${tool.color}`}>
                <tool.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  {tool.title}
                  <span className="px-1.5 py-0.5 text-xs bg-muted-foreground/20 text-muted-foreground rounded">
                    即将推出
                  </span>
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{tool.description}</CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Link href={tool.href}>
      <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${tool.color}`}>
              <tool.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <CardTitle className="group-hover:text-primary transition-colors flex items-center gap-2">
                {tool.title}
                {tool.isNew && (
                  <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded">
                    NEW
                  </span>
                )}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription>{tool.description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
