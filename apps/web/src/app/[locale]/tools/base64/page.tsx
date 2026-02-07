import { Base64Tool } from '@/page-components/tools/base64-tool';

export const metadata = {
  title: 'Base64 编解码 - Base64 Encoder/Decoder',
  description: '在线 Base64 编码解码工具，支持中文文本转换',
};

export default function Base64ToolPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Base64Tool />
    </div>
  );
}
