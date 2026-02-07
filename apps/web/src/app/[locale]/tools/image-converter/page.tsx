import { ImageConverter } from '@/page-components/tools/image-converter';

export const metadata = {
  title: '图片格式转换 - Image Converter',
  description: '在线图片格式转换工具，支持 PNG、JPG、WebP、GIF、BMP 等格式互转',
};

export default function ImageConverterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ImageConverter />
    </div>
  );
}
