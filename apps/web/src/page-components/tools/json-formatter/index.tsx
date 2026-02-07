'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Braces,
  Copy,
  CheckCircle,
  Minimize2,
  Maximize2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export function JsonFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState(2);

  const formatJson = useCallback(
    (pretty: boolean) => {
      setError(null);
      if (!input.trim()) {
        setOutput('');
        return;
      }

      try {
        const parsed = JSON.parse(input);
        const formatted = pretty
          ? JSON.stringify(parsed, null, indentSize)
          : JSON.stringify(parsed);
        setOutput(formatted);
      } catch (e) {
        setError(e instanceof Error ? e.message : '无效的 JSON 格式');
        setOutput('');
      }
    },
    [input, indentSize]
  );

  const copyToClipboard = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setError(null);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
    } catch (e) {
      console.error('Failed to read clipboard:', e);
    }
  };

  const sampleJson = `{
  "name": "example",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Braces className="w-7 h-7" />
            JSON 格式化
          </h1>
          <p className="text-muted-foreground">格式化、压缩、验证 JSON 数据</p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          清空
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">输入 JSON</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePaste}>
                  粘贴
                </Button>
                <Button variant="outline" size="sm" onClick={() => setInput(sampleJson)}>
                  示例
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在此粘贴或输入 JSON..."
              className="font-mono text-sm min-h-[400px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">输出结果</CardTitle>
              <Button variant="outline" size="sm" onClick={copyToClipboard} disabled={!output}>
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    复制
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive min-h-[400px]">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">JSON 解析错误</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <Textarea
                value={output}
                readOnly
                placeholder="格式化结果将显示在这里..."
                className="font-mono text-sm min-h-[400px] resize-none bg-muted"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label>缩进:</Label>
              <div className="flex gap-1">
                {[2, 4].map((size) => (
                  <Button
                    key={size}
                    variant={indentSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setIndentSize(size)}
                  >
                    {size} 空格
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex-1" />

            <div className="flex gap-2">
              <Button onClick={() => formatJson(true)} disabled={!input.trim()}>
                <Maximize2 className="w-4 h-4 mr-2" />
                格式化
              </Button>
              <Button variant="outline" onClick={() => formatJson(false)} disabled={!input.trim()}>
                <Minimize2 className="w-4 h-4 mr-2" />
                压缩
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
