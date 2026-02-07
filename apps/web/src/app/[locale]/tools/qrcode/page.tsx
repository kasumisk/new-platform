import { QRCodeGenerator } from '@/page-components/tools/qrcode-generator';

export const metadata = {
  title: '二维码生成器 - Tools',
  description: '在线生成自定义二维码，支持 Logo、颜色、样式设置，可生成网址、WiFi、邮箱等多种类型',
};

export default function QRCodePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <QRCodeGenerator />
    </div>
  );
}
