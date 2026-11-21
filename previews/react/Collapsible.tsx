import { useState } from 'react';
import { Collapsible, DetailsPanel } from '../../react/collapsible';
import { Demo, mount, Say } from './lib';

function Kv({ k, v }: { k: string; v: string }) {
  return (
    <div className="fa-kv">
      <span>{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}

function Page() {
  const [env, setEnv] = useState(true);
  return (
    <>
      <Demo caption="详情面板的分节：32 高的节头，Enter / 空格展开收起">
        <DetailsPanel aria-label="会话详情">
          <Collapsible title="环境" open={env} onOpenChange={setEnv} aside="本机">
            <Kv k="工作区" v="acme-web" />
            <Kv k="分支" v="local/42-login-fix" />
          </Collapsible>
          <Collapsible title="上下文" defaultOpen={false} aside="70%">
            <Kv k="对话" v="48K" />
          </Collapsible>
        </DetailsPanel>
      </Demo>
      <Demo caption="对话里的折叠行：一行概述，点开看每一步">
        <Collapsible variant="fold" title="跑了 12 条命令，读了 5 个文件，完成 2 个后台任务">
          <button type="button" className="fa-fold__cmd">
            <span className="tx">pnpm vitest run --reporter=dot</span>
          </button>
          <button type="button" className="fa-fold__cmd">
            <span className="tx">git diff --stat</span>
          </button>
        </Collapsible>
      </Demo>
      <Say>{env ? '环境：展开' : '环境：收起'}</Say>
    </>
  );
}

mount(<Page />);
