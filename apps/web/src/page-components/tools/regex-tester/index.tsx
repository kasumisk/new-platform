'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Regex, Copy, CheckCircle, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MatchResult {
  match: string;
  index: number;
  groups?: string[];
}

const COMMON_PATTERNS = [
  { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  { name: '手机号', pattern: '1[3-9]\\d{9}' },
  { name: 'URL', pattern: 'https?://[^\\s]+' },
  { name: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
  { name: '身份证', pattern: '\\d{17}[\\dXx]' },
  { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { name: '中文', pattern: '[\\u4e00-\\u9fa5]+' },
  { name: 'HTML标签', pattern: '<[^>]+>' },
];

export function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!pattern || !testString) return null;

    try {
      const flagStr = Object.entries(flags)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join('');

      const regex = new RegExp(pattern, flagStr);
      const matches: MatchResult[] = [];

      if (flags.g) {
        let match;
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1).length > 0 ? match.slice(1) : undefined,
          });
          // Prevent infinite loop for zero-length matches
          if (match[0].length === 0) regex.lastIndex++;
        }
      } else {
        const match = regex.exec(testString);
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1).length > 0 ? match.slice(1) : undefined,
          });
        }
      }

      return { success: true, matches, regex };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : '无效的正则表达式',
        matches: [],
      };
    }
  }, [pattern, testString, flags]);

  const highlightedText = useMemo(() => {
    if (!result?.success || result.matches.length === 0) return testString;

    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    result.matches.forEach((m, i) => {
      if (m.index > lastIndex) {
        parts.push(testString.slice(lastIndex, m.index));
      }
      parts.push(
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {m.match}
        </mark>
      );
      lastIndex = m.index + m.match.length;
    });

    if (lastIndex < testString.length) {
      parts.push(testString.slice(lastIndex));
    }

    return parts;
  }, [testString, result]);

  const copyPattern = async () => {
    await navigator.clipboard.writeText(pattern);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    setPattern('');
    setTestString('');
    setFlags({ g: true, i: false, m: false });
  };

  const applyCommonPattern = (p: string) => {
    setPattern(p);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Regex className="w-7 h-7" />
            正则表达式测试
          </h1>
          <p className="text-muted-foreground">在线测试正则表达式，实时高亮匹配结果</p>
        </div>
        <Button variant="outline" onClick={handleReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          清空
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Pattern & Test String */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pattern Input */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">正则表达式</CardTitle>
                <Button variant="outline" size="sm" onClick={copyPattern} disabled={!pattern}>
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
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-mono text-lg">/</span>
                <Input
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  placeholder="输入正则表达式..."
                  className="font-mono flex-1"
                />
                <span className="text-muted-foreground font-mono text-lg">/</span>
                <span className="font-mono text-muted-foreground">
                  {Object.entries(flags)
                    .filter(([, v]) => v)
                    .map(([k]) => k)
                    .join('')}
                </span>
              </div>

              {/* Flags */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    id="flag-g"
                    checked={flags.g}
                    onCheckedChange={(v) => setFlags({ ...flags, g: v })}
                  />
                  <Label htmlFor="flag-g" className="text-sm">
                    g (全局匹配)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="flag-i"
                    checked={flags.i}
                    onCheckedChange={(v) => setFlags({ ...flags, i: v })}
                  />
                  <Label htmlFor="flag-i" className="text-sm">
                    i (忽略大小写)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="flag-m"
                    checked={flags.m}
                    onCheckedChange={(v) => setFlags({ ...flags, m: v })}
                  />
                  <Label htmlFor="flag-m" className="text-sm">
                    m (多行模式)
                  </Label>
                </div>
              </div>

              {/* Error */}
              {result && !result.success && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {result.error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test String */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">测试文本</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder="输入要测试的文本..."
                className="font-mono text-sm min-h-[200px] resize-none"
              />
            </CardContent>
          </Card>

          {/* Highlighted Result */}
          {testString && result?.success && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  匹配高亮
                  <span className="text-sm font-normal text-muted-foreground">
                    (共 {result.matches.length} 处匹配)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg font-mono text-sm whitespace-pre-wrap break-all">
                  {highlightedText}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Results & Common Patterns */}
        <div className="space-y-6">
          {/* Match Results */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">匹配结果</CardTitle>
            </CardHeader>
            <CardContent>
              {result?.success && result.matches.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.matches.map((m, i) => (
                    <div key={i} className="p-2 bg-muted rounded text-sm font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">#{i + 1}</span>
                        <span className="text-xs text-muted-foreground">位置: {m.index}</span>
                      </div>
                      <div className="mt-1 break-all">{m.match}</div>
                      {m.groups && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          捕获组: {m.groups.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  {!pattern || !testString
                    ? '输入正则表达式和测试文本'
                    : result?.success
                      ? '没有匹配结果'
                      : '正则表达式错误'}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Common Patterns */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">常用正则</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {COMMON_PATTERNS.map((p) => (
                  <Button
                    key={p.name}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start font-normal"
                    onClick={() => applyCommonPattern(p.pattern)}
                  >
                    <span className="truncate">{p.name}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="flex gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">提示</p>
                  <ul className="space-y-1 text-xs">
                    <li>• 使用 \\ 转义反斜杠</li>
                    <li>• 点击常用正则快速填充</li>
                    <li>• 匹配结果实时高亮显示</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
