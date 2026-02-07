'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Binary,
  Copy,
  CheckCircle,
  ArrowDown,
  ArrowUp,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'encode' | 'decode';

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const process = useCallback(() => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }

    try {
      if (mode === 'encode') {
        // Handle Unicode properly
        const encoded = btoa(unescape(encodeURIComponent(input)));
        setOutput(encoded);
      } else {
        // Decode
        const decoded = decodeURIComponent(escape(atob(input.trim())));
        setOutput(decoded);
      }
    } catch (e) {
      setError(mode === 'decode' ? '无效的 Base64 编码' : '编码失败');
      setOutput('');
    }
  }, [input, mode]);

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

  const swapInputOutput = () => {
    setInput(output);
    setOutput('');
    setError(null);
    setMode(mode === 'encode' ? 'decode' : 'encode');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Binary className="w-7 h-7" />
            Base64 编解码111
          </h1>
          <p className="text-muted-foreground">文本与 Base64 格式相互转换</p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          清空111
        </Button>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label>模式:</Label>
            <div className="flex gap-1 bg-muted p-1 rounded-lg">
              <Button
                variant={mode === 'encode' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('encode')}
                className={cn(mode !== 'encode' && 'hover:bg-background')}
              >
                <ArrowDown className="w-4 h-4 mr-2" />
                编码 (Encode)
              </Button>
              <Button
                variant={mode === 'decode' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('decode')}
                className={cn(mode !== 'decode' && 'hover:bg-background')}
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                解码 (Decode)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {mode === 'encode' ? '原始文本' : 'Base64 编码'}
              </CardTitle>
              <Button variant="outline" size="sm" onClick={handlePaste}>
                粘贴
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入需要编码的文本...' : '输入 Base64 编码...'}
              className="font-mono text-sm min-h-[300px] resize-none"
            />
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="h-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Binary className="w-4 h-4" />
                {mode === 'encode' ? 'Base64 编码' : '解码文本'}
              </CardTitle>
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
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive min-h-[300px]">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">转换错误</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            ) : (
              <Textarea
                value={output}
                readOnly
                placeholder="结果将显示在这里..."
                className="font-mono text-sm min-h-[300px] resize-none bg-muted"
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <Button onClick={process} disabled={!input.trim()} size="lg">
              {mode === 'encode' ? (
                <>
                  <ArrowDown className="w-4 h-4 mr-2" />
                  编码为 Base64
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4 mr-2" />
                  解码 Base64
                </>
              )}
            </Button>
            {output && (
              <Button variant="outline" onClick={swapInputOutput}>
                交换并{mode === 'encode' ? '解码' : '编码'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
