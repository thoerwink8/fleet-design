import { useState } from 'react';
import { Button } from '../../react/button';
import { Menu, type MenuEntry } from '../../react/menu';
import { Demo, mount, Say } from './lib';

function Page() {
  const [said, say] = useState('选一项看反馈。');
  const [release, setRelease] = useState(true);
  const [open, setOpen] = useState(true);
  const items: MenuEntry[] = [
    { label: '置顶', shortcut: 'P', onSelect: () => say('已置顶') },
    { label: '标为未读', shortcut: 'U', onSelect: () => say('已标为未读') },
    { label: '重命名', shortcut: 'R', onSelect: () => say('进入行内重命名') },
    { type: 'separator' },
    { label: '本会话用量', end: '81K tokens', onSelect: () => say('打开用量详情') },
    {
      type: 'submenu',
      label: '复制',
      items: [
        { label: '复制会话标题', onSelect: () => say('已复制会话标题') },
        { label: '复制 Session ID', onSelect: () => say('已复制 Session ID') },
      ],
    },
    { type: 'separator' },
    {
      type: 'checkbox',
      label: '闲置时释放内存',
      checked: release,
      onCheckedChange: (c) => {
        setRelease(c);
        say(`闲置时释放内存：${c ? '开' : '关'}`);
      },
    },
    { label: '移到分组', disabled: true },
    { label: '归档', shortcut: 'A', onSelect: () => say('已归档') },
    { type: 'separator' },
    { label: '删除', shortcut: 'D', danger: true, onSelect: () => say('打开确认：删除后无法恢复') },
  ];
  return (
    <>
      <Demo caption="点「更多」打开；方向键、Enter、Esc；右侧单字母是快捷键，菜单开着时直接按">
        <div className="fa-row" style={{ minHeight: 40 }}>
          <Menu trigger={<Button variant="secondary">更多</Button>} items={items} aria-label="会话操作" align="start" />
        </div>
      </Demo>
      <Demo caption="受控、带分组（演示态默认展开）">
        <div className="fa-row" style={{ minHeight: 280, alignItems: 'flex-start' }}>
          <Menu
            open={open}
            onOpenChange={setOpen}
            align="start"
            aria-label="视图"
            trigger={<Button variant="secondary">视图：{open ? '展开' : '收起'}</Button>}
            items={[
              {
                type: 'group',
                label: '排序',
                items: [
                  { label: '最近活动', onSelect: () => say('按最近活动排序') },
                  { label: '创建时间', onSelect: () => say('按创建时间排序') },
                ],
              },
              { type: 'separator' },
              { type: 'group', label: '显示', items: [{ type: 'checkbox', label: '显示已归档', defaultChecked: false }] },
            ]}
          />
        </div>
      </Demo>
      <Say>{said}</Say>
    </>
  );
}

mount(<Page />);
