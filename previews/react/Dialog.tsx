import { useState } from 'react';
import { Button } from '../../react/button';
import { ConfirmDialog, Dialog, DialogClose } from '../../react/dialog';
import { Input } from '../../react/input';
import { Demo, mount, Say } from './lib';

const NAMES = [
  ['kimi', '沙盒测试：已重命名'],
  ['claude', '排查：登录超时'],
  ['kimi', '定时：沙盒测试'],
  ['claude', '从这里开新会话'],
];

function Page() {
  const [said, say] = useState('');
  const [name, setName] = useState('排查登录超时');
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <>
      <Demo caption="确认弹窗（演示态先打开）：焦点先落在「取消」，Esc 取消，点遮罩不关">
        <div className="fa-row">
          <ConfirmDialog
            defaultOpen
            trigger={<Button variant="secondary">删除 4 个会话…</Button>}
            title="删除 4 个会话"
            description="将删除以下 4 个会话，删除后无法恢复。"
            confirmLabel="删除 4 个会话"
            danger
            onConfirm={() => say('已删除 4 个会话')}
          >
            {NAMES.map(([ag, t]) => (
              <div key={t}>
                <span className="ag">{ag}</span>
                {t}
              </div>
            ))}
          </ConfirmDialog>
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            还原文件…
          </Button>
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="还原这个文件？"
            description="还原会丢掉 src/auth/session.ts 里未提交的改动，可以再从提交里找回旧版本。"
            confirmLabel="还原文件"
            onConfirm={() => say('已还原')}
          />
        </div>
      </Demo>
      <Demo caption="普通弹窗：短任务，Esc 或点遮罩关闭，焦点回到触发按钮">
        <div className="fa-row">
          <Dialog
            trigger={<Button variant="secondary">重命名…</Button>}
            title="重命名会话"
            footer={
              <>
                <DialogClose render={<Button variant="secondary" />}>取消</DialogClose>
                <DialogClose render={<Button variant="primary" />} onClick={() => say(`已重命名为「${name}」`)}>
                  保存
                </DialogClose>
              </>
            }
          >
            <Input label="会话标题" value={name} onValueChange={setName} />
          </Dialog>
        </div>
      </Demo>
      <Say>{said}</Say>
    </>
  );
}

mount(<Page />);
