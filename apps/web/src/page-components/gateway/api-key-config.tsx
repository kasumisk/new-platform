'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getApiKeyConfig, saveApiKeyConfig, clearApiKeyConfig } from '@/lib/api/gateway-client';
import { Key, CheckCircle2 } from 'lucide-react';

export function ApiKeyConfig() {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const config = getApiKeyConfig();
    if (config) {
      setApiKey(config.apiKey);
      setApiSecret(config.apiSecret);
      setIsConfigured(true);
    }
  }, []);

  const handleSave = () => {
    if (!apiKey || !apiSecret) {
      return;
    }

    const config = { apiKey, apiSecret };
    saveApiKeyConfig(config);
    setIsConfigured(true);
    setSaveSuccess(true);

    // 3秒后隐藏成功提示
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleClear = () => {
    clearApiKeyConfig();
    setApiKey('');
    setApiSecret('');
    setIsConfigured(false);
    setSaveSuccess(false);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Key className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">API 认证配置</h3>
              <p className="text-sm text-muted-foreground">
                配置您的 API Key 和 Secret 以使用 Gateway 接口
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="输入您的 API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                placeholder="输入您的 API Secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={!apiKey || !apiSecret} className="gap-2">
              {isConfigured ? '更新配置' : '保存配置'}
            </Button>

            {isConfigured && (
              <Button variant="outline" onClick={handleClear}>
                清除配置
              </Button>
            )}
          </div>

          {saveSuccess && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
              <AlertDescription className="text-green-600 dark:text-green-500">
                配置保存成功！您现在可以开始测试 Gateway API 了。
              </AlertDescription>
            </Alert>
          )}

          {!apiKey || !apiSecret ? (
            <Alert>
              <AlertDescription className="text-sm">
                <strong>提示：</strong> 请输入您的 API Key 和 Secret，保存后即可使用测试功能。
              </AlertDescription>
            </Alert>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
