import { useState } from 'react';
import { Button } from '../../react/button';
import { Meter } from '../../react/meter';
import { Demo, mount } from './lib';

function Page() {
  const [used, setUsed] = useState(70);
  return (
    <>
      <Demo caption="细条：输入框下面的上下文占用，后面跟百分比">
        <Meter label="上下文占用" value={10} size="thin" showValue />
      </Demo>
      <Demo caption="默认 8 高；到 95% 换危险色">
        <div className="fa-col" style={{ maxWidth: 320 }}>
          <Meter label="上下文占用（可调）" value={used} />
          <div className="fa-row">
            <Button size="sm" variant="secondary" onClick={() => setUsed(Math.min(100, used + 25))}>
              加 25%
            </Button>
            <span className="fa-num" data-testid="used">
              {used}%
            </span>
          </div>
          <Meter label="上下文占用 97%" value={97} />
        </div>
      </Demo>
      <Demo caption="分段：按来源拆开，相邻段留 1px 缝">
        <Meter
          label="上下文构成"
          value={62}
          segments={[
            { label: '系统提示', value: 8, series: 1 },
            { label: '工具', value: 14, series: 2 },
            { label: '对话', value: 40, series: 3 },
          ]}
          style={{ maxWidth: 320 }}
        />
      </Demo>
    </>
  );
}

mount(<Page />);
