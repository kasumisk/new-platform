import type { Metadata } from 'next';
import { PdfToImage } from '@/components/features/pdf-to-image';

export const metadata: Metadata = {
  title: 'PDF 转图片 - 在线工具',
  description: '将 PDF 文档转换为高清 PNG/JPG 图片，支持批量导出，浏览器本地处理',
};

export default function PdfToImagePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PdfToImage />
    </div>
  );
}
