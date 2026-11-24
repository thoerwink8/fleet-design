import { useEffect, useState } from 'react';
import { Button } from '../../react/button';
import { type CommandItem, CommandPalette } from '../../react/command-palette';
import { Demo, mount, Say } from './lib';

function Page() {
  const [open, setOpen] = useState(true);
  const [said, say] = useState('');
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  const items: CommandItem[] = [
    {
      id: 't1',
      lead: <span className="fa-agent">C</span>,
      group: '会话',
      title: '排查登录超时：token 刷新后旧会话没有失效',
      summary: '读了 3 个文件，正在改 auth/session.ts 里的刷新逻辑',
      meta: 'Opus 5.5 · 12 轮',
      metaEnd: 'acme-web · local/42-login-fix',
      end: '3 分钟',
      keywords: 'login auth',
      onRun: () => say('打开会话：排查登录超时'),
    },
    {
      id: 't2',
      lead: <span className="fa-agent">K</span>,
      group: '会话',
      title: '修复 sandbox 目录读取',
      summary: '已提交，未推送。测试 14 个全部通过',
      meta: 'Sonnet 5.5 · 6 轮',
      metaEnd: 'demo-app · main',
      end: '昨天',
      onRun: () => say('打开会话：修复 sandbox 目录读取'),
    },
    { id: 'c1', group: '命令', title: '新建会话', end: 'Ctrl+N', keywords: 'new', onRun: () => say('新建会话') },
    { id: 'c2', group: '命令', title: '切换主题', keywords: 'theme dark', onRun: () => say('切换主题') },
    { id: 'c3', group: '命令', title: '打开设置', keywords: 'settings', onRun: () => say('打开设置') },
    {
      id: 'c4',
      group: '命令',
      title: '同步设置到所有工作区',
      summary: '把本机外观和快捷键写进共享配置',
      keywords: 'sync settings',
      lead: <span className="fa-agent">C</span>,
      onRun: () => say('同步设置'),
    },
    {
      id: 'd1',
      group: '命令',
      title: '重新生成会话摘要',
      summary: '上一轮还没结束，等它完成后才能重新生成',
      keywords: 'summary regenerate',
      disabled: true,
      lead: <span className="fa-agent">C</span>,
      onRun: () => say('不应执行'),
    },
  ];
  return (
    <>
      <Demo caption="受控（演示态先打开）。面板自己居中、距顶 15%、不超过视口。↑↓ 跳过禁用行。Ctrl+K 再打开">
        <div className="fa-row">
          <Button variant="secondary" onClick={() => setOpen(true)}>
            打开命令面板
          </Button>
        </div>
      </Demo>
      <CommandPalette open={open} onOpenChange={setOpen} items={items} />
      <Say>{said}</Say>
    </>
  );
}

mount(<Page />);
