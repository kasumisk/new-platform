import { ImageCompressor } from '@/page-components/tools/image-compressor';

export const metadata = {
  title: '图片压缩 - Image Compressor',
  description: '在线图片压缩工具，智能压缩减小文件大小，保持最佳画质',
};

export default function ImageCompressorPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ImageCompressor />
    </div>
  );
}
