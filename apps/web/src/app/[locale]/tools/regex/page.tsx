import { RegexTester } from '@/page-components/tools/regex-tester';

export const metadata = {
  title: '正则表达式测试 - Regex Tester',
  description: '在线正则表达式测试工具，实时高亮匹配结果',
};

export default function RegexTesterPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <RegexTester />
    </div>
  );
}
