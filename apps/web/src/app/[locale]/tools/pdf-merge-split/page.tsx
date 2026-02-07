import type { Metadata } from 'next';
import { PdfMergeSplit } from '@/components/features/pdf-merge-split';

export const metadata: Metadata = {
  title: 'PDF 合并拆分 - 在线工具',
  description: '合并多个 PDF 文件或按页拆分，浏览器本地处理更安全',
};

export default function PdfMergeSplitPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <PdfMergeSplit />
    </div>
  );
}
