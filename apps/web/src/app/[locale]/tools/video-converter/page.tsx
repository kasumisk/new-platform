import { VideoConverter } from '@/page-components/tools/video-converter';

export const metadata = {
  title: '视频格式转换 - Video Converter',
  description: '在线视频格式转换工具，支持 MP4、WebM、MOV、AVI 等格式互转，浏览器本地处理',
};

export default function VideoConverterPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <VideoConverter />
    </div>
  );
}
