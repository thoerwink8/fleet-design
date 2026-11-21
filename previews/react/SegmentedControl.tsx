import { useState } from 'react';
import { SegmentedControl } from '../../react/segmented-control';
import { Demo, mount, Say } from './lib';

type Size = '14' | '15' | '18';

function Page() {
  const [size, setSize] = useState<Size>('15');
  const [said, say] = useState('');
  return (
    <>
      <Demo caption="受控：字号（改完立即生效，下面这行字跟着变）">
        <SegmentedControl
          aria-label="字号"
          options={[
            { value: '14', label: '标准' },
            { value: '15', label: '较大' },
            { value: '18', label: '超大' },
          ]}
          value={size}
          onValueChange={(v) => {
            setSize(v);
            say(`字号 ${v}`);
          }}
        />
        <div style={{ fontSize: `${size}px`, lineHeight: 1.6 }} data-testid="sample">
          我读了 3 个文件，改了 2 处。
        </div>
      </Demo>
      <Demo caption="非受控：动效">
        <SegmentedControl
          aria-label="动效"
          options={[
            { value: 'full', label: '标准' },
            { value: 'reduced', label: '减弱' },
          ]}
          defaultValue="full"
          onValueChange={(v) => say(`动效 ${v}`)}
        />
      </Demo>
      <Demo caption="禁用一项（写原因）">
        <SegmentedControl
          aria-label="上下文"
          options={[
            { value: '200k', label: '200K' },
            { value: '1m', label: '1M', disabled: true },
          ]}
          defaultValue="200k"
        />
      </Demo>
      <Say>{said}</Say>
    </>
  );
}

mount(<Page />);
