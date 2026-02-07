'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TextGenerationTest } from '@/page-components/gateway/text-generation';
import { StreamGenerationTest } from '@/page-components/gateway/stream-generation';
import { ImageGenerationTest } from '@/page-components/gateway/image-generation';
import { ApiKeyConfig } from '@/page-components/gateway/api-key-config';
import { TestHistory } from '@/page-components/gateway/test-history';
import { Sparkles, MessageSquare, Image as ImageIcon, History, Settings } from 'lucide-react';

export default function GatewayTestPage() {
  const [activeTab, setActiveTab] = useState('text');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gateway API 测试</h1>
              <p className="text-muted-foreground">测试 AI 能力网关的各项功能</p>
            </div>
          </div>
        </div>

        {/* API Key Configuration */}
        <ApiKeyConfig />

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="text" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              文本生成
            </TabsTrigger>
            <TabsTrigger value="stream" className="gap-2">
              <Sparkles className="h-4 w-4" />
              流式生成
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              图像生成
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              测试历史
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              设置
            </TabsTrigger>
          </TabsList>

          {/* 文本生成 */}
          <TabsContent value="text" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>同步文本生成</CardTitle>
                <CardDescription>
                  使用 POST /api/gateway/text/generation 接口测试文本生成功能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TextGenerationTest />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 流式生成 */}
          <TabsContent value="stream" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>流式文本生成 (SSE)</CardTitle>
                <CardDescription>
                  使用 POST /api/gateway/text/generation/stream 接口测试流式生成功能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StreamGenerationTest />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 图像生成 */}
          <TabsContent value="image" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>图像生成</CardTitle>
                <CardDescription>
                  使用 POST /api/gateway/image/generation 接口测试图像生成功能
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageGenerationTest />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 测试历史 */}
          <TabsContent value="history" className="space-y-6">
            <TestHistory />
          </TabsContent>

          {/* 设置 */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>接口设置</CardTitle>
                <CardDescription>配置测试环境和参数</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <h3 className="mb-2 font-semibold">接口地址</h3>
                  <p className="text-sm text-muted-foreground">
                    开发环境: http://localhost:3005/api/gateway
                  </p>
                  <p className="text-sm text-muted-foreground">
                    生产环境: https://api.example.com/api/gateway
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <h3 className="mb-2 font-semibold">认证方式</h3>
                  <p className="text-sm text-muted-foreground">
                    在请求头中添加: X-API-Key 和 X-API-Secret
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <h3 className="mb-2 font-semibold">速率限制</h3>
                  <p className="text-sm text-muted-foreground">
                    默认: 100 次/分钟，可在后台管理系统中配置
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Documentation Link */}
        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between p-6">
            <div className="space-y-1">
              <p className="font-medium">需要帮助？</p>
              <p className="text-sm text-muted-foreground">查看完整的 API 文档和使用示例</p>
            </div>
            <a
              href="http://localhost:3005/api-docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              查看 API 文档
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
