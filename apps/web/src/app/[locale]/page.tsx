'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { LanguageToggle } from '@/components/common/language-toggle';
import { LocalizedLink } from '@/components/common/localized-link';
import { UsersDemo } from '@/components/features/users-demo';
import { useUIStore } from '@/store';
import { CheckCircle2 } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const t = useTranslations();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const features = [
    'Next.js 15+',
    'React 19',
    'TypeScript',
    'Tailwind CSS',
    'shadcn/ui',
    'React Query',
    'Zustand',
    'next-intl',
    'next-themes',
    'PWA Support',
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-[--color-background] to-[--color-muted]">
      <header className="border-b border-[--color-border] bg-[--color-background]/95 backdrop-blur supports-backdrop-filter:bg-[--color-background]/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">{t('common.welcome')}</h1>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* Hero Section */}
          <div className="space-y-6 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t('home.title')}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-[--color-muted-foreground] md:text-xl">
              {t('home.description')}
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <LocalizedLink href="/api-demo" asButton size="lg">
                api示例
              </LocalizedLink>
              <LocalizedLink href="/components-demo" asButton size="lg">
                组件示例
              </LocalizedLink>
              <LocalizedLink href="/gateway-test" asButton size="lg" variant="outline">
                Gateway API 测试
              </LocalizedLink>
              <LocalizedLink href="/router-test" asButton size="lg" variant="outline">
                {t('home.getStarted')}
              </LocalizedLink>
              <LocalizedLink href="/about" asButton size="lg" variant="outline">
                {t('navigation.about')}
              </LocalizedLink>
              <LocalizedLink href="/tools" asButton size="lg" variant="outline">
                tools
              </LocalizedLink>
            </div>
          </div>

          {/* Features Grid */}
          <Card>
            <CardHeader>
              <CardTitle>🚀 技术栈</CardTitle>
              <CardDescription>集成了现代化的开发工具和最佳实践</CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicIcon name="candy-cane" color="red" size={48} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((tech) => (
                  <div
                    key={tech}
                    className="flex items-center gap-2 rounded-lg border border-[--color-border] bg-[--color-background] p-3 transition-colors hover:bg-[--color-accent]"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[--color-primary]" />
                    <span className="text-sm font-medium">{tech}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Demo Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Zustand Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Zustand 状态管理</CardTitle>
                <CardDescription>轻量级的全局状态管理</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-[--color-border] bg-[--color-muted] p-4">
                  <p className="text-sm font-medium">
                    Sidebar 状态:{' '}
                    <span className="text-[--color-primary]">{sidebarOpen ? '打开' : '关闭'}</span>
                  </p>
                </div>
                <Button onClick={toggleSidebar} variant="secondary" className="w-full">
                  切换 Sidebar
                </Button>
              </CardContent>
            </Card>

            {/* React Query Demo */}
            <UsersDemo />
          </div>

          {/* Info Cards */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>🌍 国际化</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  使用 next-intl 支持多语言切换，轻松构建全球化应用
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🎨 主题切换</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  基于 next-themes 的亮/暗模式切换，支持系统主题自动适配
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📱 PWA 支持</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  使用 next-pwa 构建渐进式 Web 应用，支持离线访问
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="border-t border-[--color-border] py-6 md:py-8">
        <div className="container mx-auto px-4 text-center text-sm text-[--color-muted-foreground]">
          Built with ❤️ using Next.js and shadcn/ui
        </div>
      </footer>
    </div>
  );
}
