'use client';

import { useTranslations } from 'next-intl';
import { LocalizedLink } from '@/components/common/localized-link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <LocalizedLink href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backToHome')}
        </LocalizedLink>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{t('title')}</CardTitle>
          <CardDescription className="text-base">{t('description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('content')}</p>
          
          <div className="mt-6 flex gap-3">
            <LocalizedLink href="/about" asButton variant="outline">
              About
            </LocalizedLink>
            <LocalizedLink href="/router-test" asButton variant="outline">
              Router Test
            </LocalizedLink>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
