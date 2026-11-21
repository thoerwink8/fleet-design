import { useState } from 'react';
import { Input } from '../../react/input';
import { Demo, mount } from './lib';

function Page() {
  const [title, setTitle] = useState('排查登录超时');
  const [branch, setBranch] = useState('local/42-login fix');
  const bad = /\s/.test(branch);
  return (
    <Demo caption="标签、提示、错误态、前后缀、禁用">
      <div className="fa-col" style={{ gap: 20, maxWidth: 420 }}>
        <Input label="会话标题" value={title} onValueChange={setTitle} hint="留空则恢复自动标题。最长 20 个字。" data-cmp="plain" />
        <Input
          label="分支名"
          mono
          value={branch}
          onValueChange={setBranch}
          error={bad ? '分支名不能有空格。把空格换成连字符。' : undefined}
          hint="字母、数字、/ 和 -"
          data-cmp="branch"
        />
        <Input
          label="单次花费上限"
          prefix="$"
          suffix="每次运行"
          defaultValue="2.00"
          inputMode="decimal"
          hint="前缀和后缀在框里。"
          data-cmp="affix"
        />
        <Input label="工作区路径" mono defaultValue="C:\src\acme-app" disabled hint="由当前仓库决定，不能在这里改" data-cmp="disabled" />
      </div>
    </Demo>
  );
}

mount(<Page />);
