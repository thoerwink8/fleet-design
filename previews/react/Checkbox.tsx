import { useState } from 'react';
import { Checkbox } from '../../react/checkbox';
import { Demo, mount, Say } from './lib';

const ROWS = ['排查登录超时', '修复 sandbox 目录读取', '整理 Composer 紧凑变体'];

function Page() {
  const [release, setRelease] = useState(true);
  const [picked, setPicked] = useState<string[]>([ROWS[0] ?? '']);
  const all = picked.length === ROWS.length;
  return (
    <>
      <Demo caption="带文字：整行可点，32 高；勾选是中性色，不用品牌色">
        <div className="fa-col">
          <Checkbox label="闲置时释放内存" checked={release} onCheckedChange={setRelease} />
          <Checkbox label="显示已归档" defaultChecked={false} />
          <Checkbox label="托管策略锁定" defaultChecked disabled />
        </div>
      </Demo>
      <Demo caption="多选：全选框有半选态">
        <div className="fa-col">
          <Checkbox
            label="全选"
            checked={all}
            indeterminate={picked.length > 0 && !all}
            onCheckedChange={(c) => setPicked(c ? [...ROWS] : [])}
          />
          {ROWS.map((r) => (
            <Checkbox
              key={r}
              label={r}
              checked={picked.includes(r)}
              onCheckedChange={(c) => setPicked(c ? [...picked, r] : picked.filter((x) => x !== r))}
            />
          ))}
        </div>
      </Demo>
      <Say>{`释放内存：${release ? '开' : '关'}；已选 ${picked.length} 项`}</Say>
    </>
  );
}

mount(<Page />);
