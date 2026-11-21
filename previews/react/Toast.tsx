import { useEffect, useState } from 'react';
import { Button } from '../../react/button';
import { ToastProvider, useToast } from '../../react/toast';
import { Demo, mount, Say } from './lib';

function Buttons() {
  const toast = useToast();
  const [said, say] = useState('');
  const [n, setN] = useState(0);
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
  </ToastProvider>,
);
