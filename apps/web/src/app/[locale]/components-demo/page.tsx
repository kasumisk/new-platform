'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/lib/hooks/use-toast';
import { LocalizedLink } from '@/components/common/localized-link';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Loader2,
  RefreshCw 
} from 'lucide-react';
import { useState } from 'react';

// 加载骨架屏示例组件
function UserCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[80%]" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
      </CardContent>
    </Card>
  );
}

// 实际用户卡片
function UserCard({ name, email, bio }: { name: string; email: string; bio: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-lg">
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>{email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{bio}</p>
      </CardContent>
    </Card>
  );
}

// 表格骨架屏
function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-3 w-[200px]" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

export default function ComponentsDemo() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showData, setShowData] = useState(false);

  const simulateLoading = () => {
    setIsLoading(true);
    setShowData(false);
    
    setTimeout(() => {
      setIsLoading(false);
      setShowData(true);
      toast({
        title: '加载完成',
        description: '数据已成功加载',
        variant: 'default',
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <LocalizedLink href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回首页
        </LocalizedLink>
      </div>

      <div className="space-y-8">
        {/* 标题 */}
        <div>
          <h1 className="text-4xl font-bold mb-2">组件示例</h1>
          <p className="text-lg text-muted-foreground">
            Toast 通知和加载骨架屏的完整示例
          </p>
        </div>

        {/* Toast 示例 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Toast 通知系统
            </CardTitle>
            <CardDescription>
              点击下面的按钮查看不同类型的 Toast 通知
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="default"
                onClick={() =>
                  toast({
                    title: '成功！',
                    description: '操作已成功完成',
                    variant: 'default',
                  })
                }
                className="w-full"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                成功通知
              </Button>

              <Button
                variant="destructive"
                onClick={() =>
                  toast({
                    title: '错误',
                    description: '操作失败，请重试',
                    variant: 'destructive',
                  })
                }
                className="w-full"
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                错误通知
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    title: '提示信息',
                    description: '这是一条普通的提示信息',
                  })
                }
                className="w-full"
              >
                <Info className="mr-2 h-4 w-4" />
                信息通知
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  toast({
                    title: '长时间通知',
                    description: '这条通知将显示 10 秒',
                    duration: 10000,
                  })
                }
                className="w-full"
              >
                <Loader2 className="mr-2 h-4 w-4" />
                长时间通知
              </Button>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() =>
                  toast({
                    title: '带标题和描述',
                    description: '这是一条包含详细描述的通知消息，可以显示更多信息给用户。',
                  })
                }
                className="w-full"
              >
                完整通知示例
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 骨架屏示例 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              加载骨架屏
            </CardTitle>
            <CardDescription>
              点击加载按钮查看骨架屏效果
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button 
              onClick={simulateLoading}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  加载中...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  模拟加载数据
                </>
              )}
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isLoading ? (
                <>
                  <UserCardSkeleton />
                  <UserCardSkeleton />
                </>
              ) : showData ? (
                <>
                  <UserCard
                    name="张三"
                    email="zhangsan@example.com"
                    bio="全栈开发工程师，热爱编程和开源项目。"
                  />
                  <UserCard
                    name="李四"
                    email="lisi@example.com"
                    bio="UI/UX 设计师，专注于用户体验设计。"
                  />
                </>
              ) : (
                <div className="col-span-2 text-center py-8 text-muted-foreground">
                  点击上方按钮加载数据
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 表格骨架屏示例 */}
        <Card>
          <CardHeader>
            <CardTitle>表格加载示例</CardTitle>
            <CardDescription>
              常见的列表/表格加载骨架屏
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <TableSkeleton />
            ) : showData ? (
              <div className="space-y-3">
                {[
                  { id: 1, name: '项目 Alpha', status: '进行中' },
                  { id: 2, name: '项目 Beta', status: '已完成' },
                  { id: 3, name: '项目 Gamma', status: '计划中' },
                  { id: 4, name: '项目 Delta', status: '进行中' },
                  { id: 5, name: '项目 Epsilon', status: '已完成' },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                  >
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {item.id}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID: {item.id}
                      </div>
                    </div>
                    <div className="text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === '已完成'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : item.status === '进行中'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                点击上方按钮加载数据
              </div>
            )}
          </CardContent>
        </Card>

        {/* 其他骨架屏样式 */}
        <Card>
          <CardHeader>
            <CardTitle>其他骨架屏样式</CardTitle>
            <CardDescription>
              常见的 UI 元素加载状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 文章骨架屏 */}
            <div>
              <h3 className="text-sm font-medium mb-3">文章卡片</h3>
              <div className="space-y-3">
                <Skeleton className="h-[200px] w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </div>

            {/* 头像和文本 */}
            <div>
              <h3 className="text-sm font-medium mb-3">评论列表</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-4/5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader>
            <CardTitle>💡 使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Toast 通知</h4>
              <pre className="bg-background p-3 rounded-md overflow-x-auto">
{`import { useToast } from '@/lib/hooks/use-toast';

const { toast } = useToast();

toast({
  title: '标题',
  description: '描述信息',
  variant: 'default', // 或 'destructive'
  duration: 5000, // 毫秒
});`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2">骨架屏</h4>
              <pre className="bg-background p-3 rounded-md overflow-x-auto">
{`import { Skeleton } from '@/components/ui/skeleton';

<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-12 w-12 rounded-full" />`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
