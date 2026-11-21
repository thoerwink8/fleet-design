import { useState } from 'react';
import { Button } from '../../react/button';
import { Tooltip, TooltipProvider } from '../../react/tooltip';
import { Demo, mount, Say } from './lib';

const Plus = () => (
  <svg className="fa-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M8 3v10M3 8h10" />
  </svg>
);

function Page() {
  const [said, say] = useState('');
  const [open, setOpen] = useState(false);
  return (
    <TooltipProvider>
      <Demo caption="展开态（defaultOpen）">
        <div style={{ height: 64, paddingTop: 40 }}>
          <Tooltip content="排查登录超时：先看 auth/session.ts 里 token 刷新的逻辑" defaultOpen side="top">
            <Button variant="secondary" data-testid="static-open">
              固定展开的提示
            </Button>
          </Tooltip>
        </div>
      </Demo>
      <Demo caption="悬停 500ms 或 Tab 聚焦出现，Esc 关闭">
        <div className="fa-row" style={{ gap: 16, paddingTop: 32 }}>
          <Tooltip content="新建会话" shortcut="Ctrl+N">
            <Button variant="secondary" icon aria-label="新建会话" onClick={() => say('新建会话')}>
              <Plus />
            </Button>
          </Tooltip>
          <Tooltip content="归档对话" open={open} onOpenChange={setOpen}>
            <Button variant="secondary" aria-label="归档对话">
              受控：{open ? '开' : '关'}
            </Button>
          </Tooltip>
        </div>
      </Demo>
      <Say>{said}</Say>
    </TooltipProvider>
  );
}

mount(<Page />);
