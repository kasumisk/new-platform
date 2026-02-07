import { JsonFormatter } from '@/page-components/tools/json-formatter';

export const metadata = {
  title: 'JSON 格式化 - JSON Formatter',
  description: '在线 JSON 格式化工具，支持格式化、压缩、验证 JSON 数据',
};

export default function JsonFormatterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <JsonFormatter />
    </div>
  );
}
