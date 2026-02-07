import type { Metadata } from 'next';
import { PdfToText } from '@/components/features/pdf-to-text';

export const metadata: Metadata = {
  title: 'PDF 转文本 - 在线工具',
  description: '从 PDF 中提取文字内容，支持复制和下载为 TXT，浏览器本地处理',
};

export default function PdfToTextPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PdfToText />
    </div>
  );
}
