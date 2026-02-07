import { VideoCompressor } from '@/page-components/tools/video-compressor';

export const metadata = {
  title: '视频压缩 - Video Compressor',
  description: '在线视频压缩工具，智能压缩视频大小，保持最佳画质，浏览器本地处理更安全',
};

export default function VideoCompressorPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <VideoCompressor />
    </div>
  );
}
