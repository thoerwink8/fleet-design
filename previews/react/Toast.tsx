import { useEffect, useState } from 'react';
import { Button } from '../../react/button';
import { Icon, type IconName } from '../../react/internal';
import { ToastProvider, useToast, type ToastKind } from '../../react/toast';
import { Demo, mount, Say } from './lib';

const KINDS: readonly { kind: ToastKind; icon: IconName; text: string }[] = [
  { kind: 'info', icon: 'info', text: '已同步工作区设置' },
  { kind: 'success', icon: 'check', text: '已复制 Session ID' },
  { kind: 'warning', icon: 'warn', text: '继续将消耗按量额度' },
  { kind: 'danger', icon: 'alert', text: '已永久删除 4 个会话' },
];

function Buttons() {
  const toast = useToast();
  const [said, say] = useState('');
  const [n, setN] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the demo toast is shown once, on mount
  useEffect(() => {
    // Demo state: one toast with 撤销 that stays until closed.
    toast.show({ text: '已归档「排查登录超时」', action: { label: '撤销', onClick: () => say('已恢复') }, timeout: 0 });
  }, []);
  return (
    <>
      <div className="fa-row">
        <Button variant="secondary" onClick={() => toast.show({ text: '已复制 Session ID', kind: 'success' })}>
          复制 Session ID
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setN(n + 1);
            toast.show({ text: `已归档第 ${n + 1} 个会话`, action: { label: '撤销', onClick: () => say(`撤销了第 ${n + 1} 个`) } });
          }}
        >
          归档会话
        </Button>
      </div>
      <Say>{said}</Say>
    </>
  );
}

mount(
  <ToastProvider>
    <Demo caption="右下角一列，最多 3 条；带撤销的停 8 秒，其余 4 秒，悬停或聚焦时暂停">
      <Buttons />
    </Demo>
    <Demo caption="四种类型：info / 成功 / 警告 / 危险（图形两两可分）">
      <div className="fa-row">
        {KINDS.map((k) => (
          <div key={k.kind} className="fa-toast">
            <span className={`m-${k.kind}`}>
              <Icon name={k.icon} />
            </span>
            <span className="grow">{k.text}</span>
            <button className="fa-icon-btn" type="button" aria-label="关闭">
              <Icon name="x" />
            </button>
          </div>
        ))}
      </div>
    </Demo>
    <div style={{ height: 72 }} aria-hidden="true" />
  </ToastProvider>,
);
