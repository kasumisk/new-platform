import { TimestampTool } from '@/page-components/tools/timestamp-tool';

export const metadata = {
  title: '时间戳转换 - Timestamp Converter',
  description: '在线时间戳转换工具，Unix 时间戳与日期格式相互转换',
};

export default function TimestampToolPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <TimestampTool />
    </div>
  );
}
