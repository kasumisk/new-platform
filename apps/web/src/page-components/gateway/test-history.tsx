'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Image as ImageIcon, Trash2, Calendar } from 'lucide-react';

interface TestRecord {
  id: string;
  type: 'text' | 'stream' | 'image';
  model: string;
  prompt: string;
  timestamp: number;
  cost?: number;
  currency?: string;
}

export function TestHistory() {
  const [history, setHistory] = useState<TestRecord[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem('gateway_test_history');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      } catch (error) {
        console.error('Failed to parse history:', error);
      }
    }
  };

  const clearHistory = () => {
    if (confirm('确定要清除所有测试历史吗？')) {
      localStorage.removeItem('gateway_test_history');
      setHistory([]);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'stream':
        return <MessageSquare className="h-4 w-4" />;
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'text':
        return '文本生成';
      case 'stream':
        return '流式生成';
      case 'image':
        return '图像生成';
      default:
        return type;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }

    // 小于1小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} 分钟前`;
    }

    // 小于1天
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} 小时前`;
    }

    // 大于1天
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-2 text-lg font-semibold">暂无测试历史</h3>
          <p className="text-sm text-muted-foreground">
            开始使用 Gateway API 进行测试，历史记录将显示在这里
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">测试历史</h3>
          <p className="text-sm text-muted-foreground">共 {history.length} 条记录</p>
        </div>
        <Button variant="outline" size="sm" onClick={clearHistory} className="gap-2">
          <Trash2 className="h-4 w-4" />
          清空历史
        </Button>
      </div>

      <div className="space-y-3">
        {history.map((record) => (
          <Card key={record.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="gap-1">
                      {getTypeIcon(record.type)}
                      {getTypeLabel(record.type)}
                    </Badge>
                    <Badge variant="outline">{record.model}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(record.timestamp)}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">{record.prompt}</p>

                  {record.cost !== undefined && (
                    <div className="text-xs text-muted-foreground">
                      费用: {record.cost.toFixed(6)} {record.currency}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * 保存测试记录到历史
 */
export function saveTestRecord(record: Omit<TestRecord, 'id' | 'timestamp'>) {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem('gateway_test_history');
  const history: TestRecord[] = stored ? JSON.parse(stored) : [];

  const newRecord: TestRecord = {
    ...record,
    id: Date.now().toString(),
    timestamp: Date.now(),
  };

  history.unshift(newRecord);

  // 最多保留 50 条记录
  if (history.length > 50) {
    history.pop();
  }

  localStorage.setItem('gateway_test_history', JSON.stringify(history));
}
