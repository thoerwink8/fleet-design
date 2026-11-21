import { useState } from 'react';
import { Select } from '../../react/select';
import { Demo, mount, Say } from './lib';

type Size = '14' | '15' | '18';
const SIZES = [
  { value: '14', label: '标准' },
  { value: '15', label: '较大' },
  { value: '18', label: '超大' },
] as const;

function Page() {
  const [size, setSize] = useState<Size>('15');
  const [said, say] = useState('');
  return (
    <>
      <Demo caption="受控单选下拉（Enter / 方向键 / Esc）">
        <div>
          <Select<Size>
            aria-label="字号"
            options={SIZES}
            value={size}
            onValueChange={(v) => {
              setSize(v);
              say(`字号 ${v}`);
            }}
            style={{ width: 200, justifyContent: 'space-between' }}
          />
        </div>
      </Demo>
      <Demo caption="幽灵变体：输入框里的选择器，无边框 28 高">
        <div className="fa-row">
          <Select
            variant="ghost"
            aria-label="强度"
            defaultValue="mid"
            options={[
              { value: 'low', label: '低强度' },
              { value: 'mid', label: '中强度' },
              { value: 'high', label: '高强度' },
              { value: 'max', label: '最高强度', disabled: true },
            ]}
            onValueChange={(v) => say(`强度 ${v}`)}
          />
        </div>
      </Demo>
      <Demo caption="占位文字">
        <Select aria-label="分组" placeholder="选择分组" options={[{ value: 'a', label: '工作区 A' }]} style={{ width: 200 }} />
      </Demo>
      <div style={{ height: 160 }} aria-hidden="true" />
      <Say>{said}</Say>
    </>
  );
}

mount(<Page />);
