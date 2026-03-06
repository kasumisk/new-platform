import { ImageCropper } from '@/page-components/tools/image-cropper';

export const metadata = {
  title: '图片裁切 - Image Cropper',
  description: '在线图片裁切工具，支持自定义比例、旋转、翻转，浏览器本地处理更安全',
};

export default function ImageCropperPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ImageCropper />
    </div>
  );
}
