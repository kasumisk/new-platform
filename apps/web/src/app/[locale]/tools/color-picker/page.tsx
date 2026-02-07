import { ColorPicker } from '@/page-components/tools/color-picker';

export const metadata = {
  title: '取色器 - Color Picker',
  description: '从图片中提取颜色，支持 HEX、RGB、HSL 多种格式',
};

export default function ColorPickerPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ColorPicker />
    </div>
  );
}
