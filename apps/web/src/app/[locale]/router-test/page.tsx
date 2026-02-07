'use client';

import { useTranslations } from 'next-intl';
import { useLocalizedRouter, getAllLocalizedPaths } from '@/lib/hooks/use-localized-router';
import { LocalizedLink } from '@/components/common/localized-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function RouterTestPage() {
  const t = useTranslations('routerTest');
  const { push, replace, switchLocale, getCurrentPath, locale } = useLocalizedRouter();

  const allPaths = getAllLocalizedPaths('/router-test');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <LocalizedLink href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToHome')}
        </LocalizedLink>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t('description')}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>📍 {t('currentLocale')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Locale:</span>
                <code className="rounded bg-muted px-2 py-1">{locale}</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{t('currentPath')}:</span>
                <code className="rounded bg-muted px-2 py-1">{getCurrentPath()}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔀 {t('programmaticNav')}</CardTitle>
            <CardDescription>
              使用 useLocalizedRouter Hook 进行编程式导航
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-3 text-sm font-medium">Push 导航:</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => push('/')} variant="outline">
                  {t('pushToHome')}
                </Button>
                <Button onClick={() => push('/about')} variant="outline">
                  {t('pushToAbout')}
                </Button>
                <Button onClick={() => push('/contact')} variant="outline">
                  {t('pushToContact')}
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">Replace 导航:</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => replace('/about')} variant="secondary">
                  {t('replaceToAbout')}
                </Button>
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">语言切换:</p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => switchLocale('zh')} 
                  variant="default"
                  disabled={locale === 'zh'}
                >
                  {t('switchToZh')}
                </Button>
                <Button 
                  onClick={() => switchLocale('en')} 
                  variant="default"
                  disabled={locale === 'en'}
                >
                  {t('switchToEn')}
                </Button>
                <Button 
                  onClick={() => switchLocale('fr')} 
                  variant="default"
                  disabled={locale === 'fr'}
                >
                  Passer au français
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🔗 {t('linkNav')}</CardTitle>
            <CardDescription>
              使用 LocalizedLink 组件进行声明式导航
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <LocalizedLink href="/" asButton variant="outline">
                {t('linkToHome')}
              </LocalizedLink>
              <LocalizedLink href="/about" asButton variant="outline">
                {t('linkToAbout')}
              </LocalizedLink>
              <LocalizedLink href="/contact" asButton variant="outline">
                {t('linkToContact')}
              </LocalizedLink>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🌍 {t('allLocalizedPaths')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(allPaths).map(([lang, path]) => (
                <div key={lang} className="flex items-center gap-2">
                  <span className="w-12 font-semibold uppercase">{lang}:</span>
                  <code className="rounded bg-muted px-2 py-1 flex-1">{path}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle>💡 说明</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{t('explanation')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
