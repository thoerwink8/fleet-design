import { useState } from 'react';
import { Button, IconButton } from '../../react/button';
import { Demo, mount, Say } from './lib';

const Copy = () => (
  <svg className="fa-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="5" y="5" width="8" height="8" rx="1.5" />
    <path d="M3 10.5V4a1 1 0 0 1 1-1h6.5" />
  </svg>
);

const X = () => (
  <svg className="fa-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

function Page() {
  const [said, say] = useState('点一个按钮看反馈。');
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Demo caption="变体：主、次、幽灵、危险">
        <div className="fa-row">
          <Button variant="primary" data-cmp="primary" onClick={() => say('主按钮：继续发送')}>
            继续发送
          </Button>
          <Button variant="secondary" data-cmp="secondary" onClick={() => say('次按钮：取消')}>
            取消
          </Button>
          <Button data-cmp="ghost" onClick={() => say('幽灵按钮：编辑')}>
            编辑
          </Button>
          <Button variant="danger" data-cmp="danger" onClick={() => say('危险按钮：删除 4 个会话')}>
            删除 4 个会话
          </Button>
        </div>
      </Demo>
      <Demo caption="低调的三种：次要文字的幽灵按钮；确认弹窗以外的删除">
        <div className="fa-row">
          <Button variant="muted" data-cmp="muted" onClick={() => say('次要文字的幽灵按钮：查看日志')}>
            查看日志
          </Button>
          <Button variant="danger-secondary" data-cmp="danger-secondary" onClick={() => say('带底的删除：删除项目')}>
            删除项目
          </Button>
          <Button variant="danger-ghost" size="xs" icon aria-label="移除这一项" data-cmp="danger-ghost" onClick={() => say('行内移除')}>
            <X />
          </Button>
        </div>
      </Demo>
      <Demo caption="尺寸 24 / 28 / 32 / 40，图标按钮同高正方形">
        <div className="fa-row">
          <Button variant="secondary" size="xs" data-cmp="xs">
            行内 24
          </Button>
          <Button variant="secondary" size="sm" data-cmp="sm">
            小 28
          </Button>
          <Button variant="secondary">默认 32</Button>
          <Button variant="secondary" size="lg" data-cmp="lg">
            大 40
          </Button>
          <Button variant="secondary" size="sm" icon aria-label="复制" data-cmp="icon-sm" onClick={() => say('已复制')}>
            <Copy />
          </Button>
          <IconButton label="复制路径" data-cmp="icon-btn" onClick={() => say('已复制路径')}>
            <Copy />
          </IconButton>
        </div>
      </Demo>
      <Demo caption="进行中：文字换成进行时，按钮仍可聚焦但不响应；禁用要写原因">
        <div className="fa-row">
          <Button
            variant="primary"
            loading={busy}
            loadingText="压缩中…"
            data-cmp="busy"
            onClick={() => {
              setBusy(true);
              say('开始压缩');
              setTimeout(() => {
                setBusy(false);
                say('压缩完成');
              }, 1500);
            }}
          >
            压缩会话
          </Button>
          <Button variant="primary" disabled aria-describedby="why" data-cmp="disabled-primary">
            继续发送
          </Button>
          <Button variant="secondary" disabled aria-describedby="why" data-cmp="disabled-secondary">
            全部撤回
          </Button>
          <span className="fa-hint" id="why">
            没有排队消息，所以不能继续发送或撤回
          </span>
        </div>
      </Demo>
      <Say>{said}</Say>
    </>
  );
}

mount(<Page />);
