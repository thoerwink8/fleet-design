import { useState } from 'react';
import { IconButton } from '../../react/button';
import { DialogClose } from '../../react/dialog';
import { Drawer } from '../../react/drawer';
import { Demo, mount, Say } from './lib';

const Burger = () => (
  <svg className="fa-ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M3 4.5h10M3 8h10M3 11.5h10" />
  </svg>
);
const THREADS = ['排查登录超时', '修复 sandbox 目录读取', '整理 Composer 紧凑变体'];

function Page() {
  const [open, setOpen] = useState(true);
  const [current, setCurrent] = useState(THREADS[0]);
  return (
    <>
      <Demo caption="受控（演示态先打开）。点遮罩、Esc 或选一个会话关闭，焦点回到菜单按钮">
        <div className="fa-row" style={{ gap: 8 }}>
          <Drawer
            open={open}
            onOpenChange={setOpen}
            label="会话列表"
            trigger={
              <IconButton label="打开会话列表">
                <Burger />
              </IconButton>
            }
          >
            <div className="fa-row" style={{ justifyContent: 'space-between', height: 40, padding: '0 8px' }}>
              <b style={{ font: '500 14px/20px var(--fa-font-sans)' }}>会话</b>
              <DialogClose render={<IconButton label="关闭">×</IconButton>} />
            </div>
            <div className="fa-col" style={{ gap: 0, padding: '0 8px' }}>
              {THREADS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="fa-item"
                  aria-current={t === current ? 'true' : undefined}
                  onClick={() => {
                    setCurrent(t);
                    setOpen(false);
                  }}
                >
                  <span className="grow">{t}</span>
                </button>
              ))}
            </div>
          </Drawer>
          <b style={{ font: '500 14px/20px var(--fa-font-sans)' }}>{current}</b>
        </div>
      </Demo>
      <Say>{open ? '抽屉开着' : `当前会话：${current}`}</Say>
    </>
  );
}

mount(<Page />);
