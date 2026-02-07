'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Copy, CheckCircle, RefreshCw, ArrowRightLeft, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

type Mode = 'toDate' | 'toTimestamp';

export function TimestampTool() {
  const [mode, setMode] = useState<Mode>('toDate');
  const [timestamp, setTimestamp] = useState('');
  const [dateString, setDateString] = useState('');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [copied, setCopied] = useState<string | null>(null);
  const [useSeconds, setUseSeconds] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    return {
      iso: date.toISOString(),
      local: date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      utc: date.toUTCString(),
      relative: getRelativeTime(ts),
    };
  };

  const getRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const absDiff = Math.abs(diff);
    const isFuture = diff < 0;

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let result = '';
    if (years > 0) result = `${years} 年`;
    else if (months > 0) result = `${months} 个月`;
    else if (days > 0) result = `${days} 天`;
    else if (hours > 0) result = `${hours} 小时`;
    else if (minutes > 0) result = `${minutes} 分钟`;
    else result = `${seconds} 秒`;

    return isFuture ? `${result}后` : `${result}前`;
  };

  const handleTimestampChange = (value: string) => {
    setTimestamp(value);
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      // Auto-detect if it's seconds or milliseconds
      const ts = value.length <= 10 ? num * 1000 : num;
      setUseSeconds(value.length <= 10);
    }
  };

  const convertToDate = () => {
    const num = parseInt(timestamp, 10);
    if (isNaN(num)) return null;
    const ts = useSeconds ? num * 1000 : num;
    return formatDate(ts);
  };

  const convertToTimestamp = () => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return {
      ms: date.getTime(),
      s: Math.floor(date.getTime() / 1000),
    };
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  const setCurrentTimestamp = () => {
    setTimestamp(String(Date.now()));
    setUseSeconds(false);
  };

  const setNowDate = () => {
    const now = new Date();
    setDateString(now.toISOString().slice(0, 16));
  };

  const currentFormatted = formatDate(currentTime);
  const dateResult = convertToDate();
  const timestampResult = convertToTimestamp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-7 h-7" />
            时间戳转换
          </h1>
          <p className="text-muted-foreground">Unix 时间戳与日期格式相互转换</p>
        </div>
      </div>

      {/* Current Time */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">当前时间</p>
              <p className="text-2xl font-mono font-bold">{currentTime}</p>
              <p className="text-sm text-muted-foreground mt-1">{currentFormatted.local}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(String(currentTime))}
              >
                {copied === String(currentTime) ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                复制毫秒
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(String(Math.floor(currentTime / 1000)))}
              >
                {copied === String(Math.floor(currentTime / 1000)) ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                复制秒
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode Toggle */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={mode === 'toDate' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('toDate')}
          className={cn(mode !== 'toDate' && 'hover:bg-background')}
        >
          时间戳 → 日期
        </Button>
        <Button
          variant={mode === 'toTimestamp' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setMode('toTimestamp')}
          className={cn(mode !== 'toTimestamp' && 'hover:bg-background')}
        >
          日期 → 时间戳
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {mode === 'toDate' ? (
          <>
            {/* Timestamp Input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">输入时间戳</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={timestamp}
                    onChange={(e) => handleTimestampChange(e.target.value)}
                    placeholder="如 1700000000000 或 1700000000"
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={setCurrentTimestamp}>
                    现在
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={!useSeconds ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUseSeconds(false)}
                  >
                    毫秒
                  </Button>
                  <Button
                    variant={useSeconds ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setUseSeconds(true)}
                  >
                    秒
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Date Result */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">转换结果</CardTitle>
              </CardHeader>
              <CardContent>
                {dateResult ? (
                  <div className="space-y-3">
                    {[
                      { label: '本地时间', value: dateResult.local },
                      { label: 'ISO 格式', value: dateResult.iso },
                      { label: 'UTC 格式', value: dateResult.utc },
                      { label: '相对时间', value: dateResult.relative },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <Label className="w-20 shrink-0 text-muted-foreground">{item.label}</Label>
                        <Input value={item.value} readOnly className="font-mono text-sm" />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => copyToClipboard(item.value)}
                        >
                          {copied === item.value ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>输入时间戳查看转换结果</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* Date Input */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">输入日期时间</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="datetime-local"
                    value={dateString}
                    onChange={(e) => setDateString(e.target.value)}
                    className="font-mono"
                  />
                  <Button variant="outline" onClick={setNowDate}>
                    现在
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  选择日期和时间，或直接在输入框中编辑
                </p>
              </CardContent>
            </Card>

            {/* Timestamp Result */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">转换结果</CardTitle>
              </CardHeader>
              <CardContent>
                {timestampResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="w-20 shrink-0 text-muted-foreground">毫秒</Label>
                      <Input value={timestampResult.ms} readOnly className="font-mono" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(String(timestampResult.ms))}
                      >
                        {copied === String(timestampResult.ms) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="w-20 shrink-0 text-muted-foreground">秒</Label>
                      <Input value={timestampResult.s} readOnly className="font-mono" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(String(timestampResult.s))}
                      >
                        {copied === String(timestampResult.s) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>选择日期时间查看转换结果</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
