import type { Metadata } from 'next';
import { ImageToPdf } from '@/components/features/image-to-pdf';

export const metadata: Metadata = {
  title: '图片转 PDF - 在线工具',
  description: '将多张图片合并为 PDF 文件，支持拖拽排序，浏览器本地处理',
};

export default function ImageToPdfPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ImageToPdf />
    </div>
  );
}
