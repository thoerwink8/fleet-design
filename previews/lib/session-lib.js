// Shared demo renderers for the session overview column (SessionPanel, DetailsPanel, TaskRow, ChangeRow, UsageDetail).
// Data is static and made up; layout, hierarchy and interaction follow the card readmes.
const wan = (n) => (n / 10000).toFixed(1) + '万';
const num = (n) => n.toLocaleString('en-US');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
// middle truncation keeps both ends (drive / file name, provider / tool)
const midTrunc = (s, max) => (s.length <= max ? s : s.slice(0, Math.ceil((max - 1) * 0.45)) + '…' + s.slice(s.length - Math.floor((max - 1) * 0.55)));

// ---------- tooltip for truncated names (hover 500ms or keyboard focus, Esc closes) ----------
let __tip;
function tipFor(root) {
  if (!__tip) { __tip = document.createElement('div'); __tip.className = 'fa-tip'; __tip.setAttribute('role', 'tooltip'); __tip.id = 'fa-name-tip'; __tip.hidden = true; __tip.style.cssText = 'position:fixed;z-index:20;max-width:320px;overflow-wrap:anywhere'; document.body.appendChild(__tip); }
  let t;
  root.querySelectorAll('[data-full]').forEach((el) => {
    const show = (now) => { clearTimeout(t); t = setTimeout(() => { const r = el.getBoundingClientRect(); __tip.textContent = el.dataset.full; __tip.hidden = false; const w = __tip.offsetWidth; __tip.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px'; __tip.style.top = (r.bottom + 4) + 'px'; el.setAttribute('aria-describedby', 'fa-name-tip'); }, now ? 0 : 500); };
    const hide = () => { clearTimeout(t); __tip.hidden = true; el.removeAttribute('aria-describedby'); };
    el.onmouseenter = () => show(); el.onmouseleave = hide; el.onfocus = () => show(true); el.onblur = hide;
    el.onkeydown = (e) => { if (e.key === 'Escape') hide(); };
  });
}

// ---------- context: full (agents that report a per-category breakdown) ----------
const CAP = 500000;
const CTX_ROWS = [
  // [label, tokens, series class, kind]  kind: '' normal | 'gray' small category | 'buf' buffer | 'free' | 'lazy'
  ['消息', 120000, 'fa-s1'], ['系统工具', 62000, 'fa-s2'], ['MCP 工具', 61000, 'fa-s3'], ['记忆文件', 40000, 'fa-s4'], ['系统提示词', 28000, 'fa-s5'], ['Skills', 20000, 'fa-s6'],
  ['MCP 服务器指令', 9000, 'fa-s7', 'gray'], ['自定义智能体', 4000, 'fa-s7', 'gray'], ['自上次更新以来', 6000, 'fa-s7', 'gray'],
  ['自动压缩缓冲区', 33000, '', 'buf'], ['可用空间', 117000, '', 'free'],
  ['MCP 工具（延迟加载）', 64000, '', 'lazy'], ['系统工具（延迟加载）', 23000, '', 'lazy'],
];
const MCP_TOOLS = [
  ['GitHub · Create pull request', 412], ['GitHub · List pull requests', 288], ['GitHub · Get pull request diff', 336], ['GitHub · Search code', 302], ['GitHub · Create issue comment', 254],
  ['Linear · Search issues', 268], ['Linear · Update issue state', 231], ['Sentry · Get issue details', 1004], ['Sentry · List recent events', 512],
  ['Playwright · Browser navigate', 186], ['Playwright · Browser take screenshot', 224], ['Playwright · Browser click', 198], ['Postgres · Run read-only query', 1425],
  ['Figma · Get design context', 686], ['Slack · Search messages', 340], ['Notion · Fetch page', 308],
];
const MEM_FILES = [['C:\\Users\\dev\\.claude\\CLAUDE.md', 6482], ['C:\\src\\acme-app\\CLAUDE.md', 100], ['C:\\src\\acme-app\\AGENTS.md', 8990], ['C:\\Users\\dev\\.claude\\memory\\MEMORY.md', 64]];
const AGENTS6 = [['general-purpose', 168], ['Explore', 87], ['Plan', 87], ['code-reviewer', 142], ['docs-writer', 56], ['statusline-setup', 31]];

function swatch(cls, kind) {
  if (kind === 'free' || kind === 'lazy') return '<span class="sw fa-dot--ring" style="box-shadow:inset 0 0 0 1px var(--fa-fg-muted)"></span>';
  if (kind === 'buf') return '<span class="sw" style="background:var(--fa-border);box-shadow:inset 0 0 0 1px var(--fa-fg-muted)"></span>';
  return '<span class="sw ' + cls + '"></span>';
}
function ctxBar(rows, cap, opts = {}) {
  const segs = rows.filter((r) => r[3] !== 'free' && r[3] !== 'lazy');
  return '<div class="fa-meter fa-meter--seg" role="img" aria-label="' + esc(opts.label || '上下文占用') + '" style="margin:4px 8px 8px">'
    + segs.map((r) => '<i class="' + (r[3] === 'buf' ? '' : r[2]) + '" style="width:' + (r[1] / cap * 100).toFixed(2) + '%;' + (r[3] === 'buf' ? 'background:var(--fa-border)' : '') + '"></i>').join('') + '<i></i></div>';
}
function grp(id, name, items, maxChars) {
  return '<div class="fa-grp"><button class="fa-grp__h" aria-expanded="false" aria-controls="' + id + '"><span class="chev">' + ic('chevR') + '</span><span class="x">' + name + '</span><span class="n">' + items.length + '</span></button>'
    + '<div class="fa-grp__list" id="' + id + '" role="list" hidden>' + items.map(([n, v]) => { const s = midTrunc(n, maxChars); const cut = s !== n; return '<div class="fa-gi" role="listitem"><span class="x' + (cut ? ' is-cut' : '') + '"' + (cut ? ' tabindex="0" data-full="' + esc(n) + '"' : '') + '>' + esc(s) + '</span><span class="n">' + num(v) + '</span></div>'; }).join('') + '</div></div>';
}
function ctxFull(el, opts = {}) {
  const used = CTX_ROWS.filter((r) => !['buf', 'free', 'lazy'].includes(r[3])).reduce((a, r) => a + r[1], 0);
  const rows = opts.rows || CTX_ROWS.length;
  const left = CTX_ROWS.find((r) => r[3] === 'free')[1];
  el.innerHTML = '<div class="fa-kv"><span>已使用 ' + Math.round(used / CAP * 100) + '%</span><span class="v">' + wan(used) + ' / ' + wan(CAP) + '</span></div>'
    + ctxBar(CTX_ROWS, CAP, { label: '上下文占用 ' + Math.round(used / CAP * 100) + '%' })
    + CTX_ROWS.slice(0, rows).map((r) => '<div class="fa-src' + (r[3] === 'lazy' ? ' is-lazy' : '') + '">' + swatch(r[2], r[3]) + '<span class="x">' + r[0] + '</span><span class="n">' + wan(r[1]) + '</span><span class="n">' + (r[3] === 'lazy' ? '—' : (r[1] / CAP * 100).toFixed(1) + '%') + '</span></div>').join('')
    + (opts.more || '') + (opts.groups === false ? '' : '<div class="fa-grps">' + grp('g-mcp', 'MCP 工具', MCP_TOOLS, 30) + grp('g-mem', '记忆文件', MEM_FILES, 30) + grp('g-ag', '自定义智能体', AGENTS6, 30) + '</div>')
    + '<div class="fa-kv" style="margin-top:4px"><span class="fa-muted">距自动压缩还剩 ' + wan(left) + '</span><button class="fa-btn fa-btn--sm fa-btn--secondary" data-compact>压缩会话</button></div>';
  el.querySelectorAll('.fa-grp__h').forEach((b) => { b.onclick = () => { const open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open); document.getElementById(b.getAttribute('aria-controls')).hidden = !open; }; });
  const cb = el.querySelector('[data-compact]'); if (cb) cb.onclick = () => { cb.textContent = '压缩中…'; cb.setAttribute('aria-busy', 'true'); cb.disabled = true; setTimeout(() => { cb.textContent = '已压缩'; cb.removeAttribute('aria-busy'); }, 900); };
  tipFor(el);
}
// ---------- context: generic (any agent: only the four parts every engine reports) ----------
const GEN = [['缓存前缀', 182000, 'fa-s1'], ['本轮新增', 48000, 'fa-s2'], ['最新输出', 13800, 'fa-s3']];
function ctxGeneric(el, cap = 1000000) {
  const used = GEN.reduce((a, r) => a + r[1], 0);
  el.innerHTML = '<div class="fa-kv"><span>已使用 ' + (used / cap * 100).toFixed(1) + '%</span><span class="v">' + wan(used) + ' / ' + wan(cap) + '</span></div>'
    + ctxBar(GEN, cap, { label: '上下文占用 ' + (used / cap * 100).toFixed(1) + '%' })
    + GEN.map((r) => '<div class="fa-src">' + swatch(r[2]) + '<span class="x">' + r[0] + '</span><span class="n">' + wan(r[1]) + '</span><span class="n">' + (r[1] / cap * 100).toFixed(1) + '%</span></div>').join('')
    + '<div class="fa-src">' + swatch('', 'free') + '<span class="x">剩余可用</span><span class="n">' + wan(cap - used) + '</span><span class="n">' + ((cap - used) / cap * 100).toFixed(1) + '%</span></div>';
}

// ---------- connectors ----------
const CONN = [
  { n: 'GitHub', icon: 'branch', tools: ['Create pull request', 'List pull requests', 'Search code', 'Create issue comment'] },
  { n: 'Linear', tools: ['Search issues', 'Update issue state'] },
  { n: 'Sentry', st: 'error', tools: ['Get issue details', 'List recent events'] },
  { n: 'Notion', st: 'login', tools: ['Fetch page'] },
  { n: 'Playwright', icon: 'globe', tools: ['Browser navigate', 'Browser click', 'Browser take screenshot'] },
];
function connectors(el, startOpen) {
  const ok = CONN.filter((c) => !c.st).length;
  let open = !!startOpen, inTools = null; const off = new Set();
  const slot = (c) => '<span class="fa-agent fa-agent--20">' + (c.icon ? ic(c.icon) : c.n[0]) + '</span>';
  function draw() {
    if (inTools) {
      const c = CONN[inTools - 1];
      el.innerHTML = '<div class="fa-sec__h"><button class="fa-icon-btn" data-back aria-label="返回连接器">' + ic('back') + '</button>' + esc(c.n) + ' 的工具<span class="aside">本会话启用 ' + c.tools.filter((t) => !off.has(c.n + t)).length + ' / ' + c.tools.length + '</span></div><div class="fa-sec__b">'
        + c.tools.map((t) => '<label class="fa-conn fa-conn--tool"><span class="x">' + esc(t) + '</span><input type="checkbox" role="switch" ' + (off.has(c.n + t) ? '' : 'checked') + ' data-t="' + esc(c.n + t) + '" aria-label="在本会话启用 ' + esc(t) + '"></label>').join('') + '</div>';
      el.querySelector('[data-back]').onclick = () => { inTools = null; draw(); el.querySelector('[data-c="' + CONN.indexOf(c) + '"]')?.focus(); };
      el.querySelectorAll('[data-t]').forEach((i) => { i.onchange = () => { i.checked ? off.delete(i.dataset.t) : off.add(i.dataset.t); draw(); el.querySelector('[data-t="' + i.dataset.t + '"]').focus(); }; });
      return;
    }
    el.innerHTML = '<button class="fa-sec__h fa-sec__h--btn" aria-expanded="' + open + '" data-tog><span class="chev">' + ic('chevR') + '</span>连接器<span class="aside">已连接 ' + ok + ' 个</span></button>'
      + (open ? '<div class="fa-sec__b">' + CONN.map((c, i) => '<div class="fa-conn" role="button" tabindex="0" data-c="' + i + '" aria-label="' + c.n + '，打开工具清单">' + slot(c) + '<span class="x">' + c.n + '</span>' + (c.st === 'error' ? '<span class="st is-bad">连接失败</span>' : c.st === 'login' ? '<button class="fa-link st" data-login>去登录</button>' : '') + '</div>').join('') + '<button class="fa-more" data-tog2>收起</button></div>' : '');
    el.querySelector('[data-tog]').onclick = () => { open = !open; draw(); el.querySelector('[data-tog]').focus(); };
    const t2 = el.querySelector('[data-tog2]'); if (t2) t2.onclick = () => { open = false; draw(); el.querySelector('[data-tog]').focus(); };
    el.querySelectorAll('[data-c]').forEach((r) => { const go = () => { inTools = +r.dataset.c + 1; draw(); el.querySelector('[data-back]').focus(); }; r.onclick = (e) => { if (e.target.closest('[data-login]')) return; go(); }; r.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });
    el.querySelectorAll('[data-login]').forEach((b) => { b.onclick = (e) => { e.stopPropagation(); b.textContent = '已打开登录页'; }; });
  }
  draw();
}

// ---------- changes (PR rows) ----------
const CHG = [
  { st: 'open', t: '修消息送达核对：按接受帧计数，不再等回执', repo: 'acme-web', n: 29, a: 74, d: 10 },
  { st: 'merged', t: 'docs(specs): 全功能取舍表补上会话页右侧栏', repo: 'acme-app', n: 21, a: 212, d: 18 },
  { st: 'merged', t: 'feat(web): show cache hit rate and turn output in thread details', repo: 'acme-app', n: 22, a: 388, d: 41 },
  { st: 'closed', t: 'fix(close): 残留空会话目录不再挡住新建', repo: 'acme-web', n: 17, a: 9, d: 3 },
  { st: 'open', t: 'fix(sweep): 按分支过滤后再清理已合并的工作树', repo: 'acme-web', n: 18, a: 27, d: 12 },
];
const PR_IC = { open: ['prOpen', 'fa-pr-open', '开着'], merged: ['prMerged', 'fa-pr-merged', '已合并'], closed: ['prClosed', 'fa-pr-closed', '已关闭'] };
function chgRow(c, i) {
  const p = PR_IC[c.st];
  return '<div class="fa-chg" tabindex="0" role="link" data-i="' + i + '" aria-label="' + esc(c.t) + '，' + p[2] + '，' + c.repo + ' #' + c.n + '，增加 ' + c.a + ' 行，删除 ' + c.d + ' 行"><span class="ty ' + p[1] + '" title="' + p[2] + '">' + ic(p[0]) + '</span>'
    + '<div style="min-width:0"><div class="t">' + esc(c.t) + '</div><div class="s"><span class="id">' + c.repo + ' #' + c.n + '</span><span class="add">+' + c.a + '</span><span class="del">−' + c.d + '</span></div></div>'
    + '<span class="acts"><button class="fa-icon-btn" aria-label="更多操作" aria-haspopup="menu" data-chgmore="' + i + '">' + ic('more') + '</button></span></div>';
}

// ---------- background tasks ----------
const AGN = { C: 'Claude Code', K: 'Kimi Code', X: 'Codex' };
const TASKS = [
  { id: 1, ty: 'agent', t: '盘点子会话数据和界面', ag: 'C', st: 'running', tm: '3 分钟', steps: 14, run: 1, fail: 0 },
  { id: 2, ty: 'cmd', t: 'pnpm vitest run --reporter=dot', ag: 'C', st: 'running', tm: '42 秒' },
  { id: 3, ty: 'sub', t: '复审 PR #57 返工', ag: 'K', st: 'failed', tm: '11 分钟', steps: 15, run: 0, fail: 1 },
  { id: 4, ty: 'agent', t: '核对消息送达帧', ag: 'X', st: 'new', tm: '刚刚' },
  { id: 5, ty: 'cmd', t: 'pnpm build', ag: 'C', st: 'done', tm: '1 分 12 秒' },
  { id: 6, ty: 'agent', t: '整理 Composer 紧凑变体的截图', ag: 'C', st: 'done', tm: '6 分钟', steps: 9, run: 0, fail: 0 },
];
const TY = { cmd: ['terminal', '命令'], agent: ['agent', '智能体'], sub: ['chat', '子会话'] };
const DOT = { running: 'running', failed: 'error', new: 'running', done: '' };
function taskRow(x, expanded) {
  const hasSub = x.steps && x.st !== 'new';
  const word = { running: '运行中', failed: '失败', new: '刚启动', done: '已完成' }[x.st];
  return '<div class="fa-task' + (x.st === 'done' ? ' is-done' : '') + (x.st === 'failed' ? ' is-failed' : '') + '" tabindex="0" role="button" data-id="' + x.id + '"' + (hasSub ? ' aria-expanded="' + !!expanded + '"' : '') + ' aria-label="' + TY[x.ty][1] + '：' + esc(x.t) + '，' + word + '，' + x.tm + '">'
    + '<span class="ty" title="' + TY[x.ty][1] + '">' + ic(TY[x.ty][0]) + '</span>'
    + '<span class="t"><span class="x">' + esc(x.t) + '</span>' + (hasSub ? ic('chevR') : '') + '</span>'
    + '<span class="end"><span class="fa-agent" title="' + AGN[x.ag] + '">' + x.ag + (DOT[x.st] ? '<span class="fa-dot fa-dot--' + DOT[x.st] + '"></span>' : '') + '</span><span class="tm">' + x.tm + '</span>'
    + (x.st === 'running' || x.st === 'new' ? '<button class="fa-icon-btn" data-stop="' + x.id + '" aria-label="停止 ' + esc(x.t) + '">' + ic('stop') + '</button>' : '<span style="width:24px"></span>') + '</span>'
    + (hasSub && expanded ? '<span class="sub"><span>' + x.steps + ' 步</span>' + (x.run ? '<span>' + x.run + ' 个正在运行</span>' : '') + (x.fail ? '<span class="bad">' + x.fail + ' 个失败</span>' : '') + (x.st === 'done' ? '<span>全部完成</span>' : '') + '</span>' : '')
    + '</div>';
}

// ---------- one turn's live status: line -> steps -> raw ----------
// steps: k = think | read | cmd | msg | edit; done/now/fail decide the tense
const TURN_STEPS = [
  { k: 'think', done: '想了想：先确认 token 刷新失败时是不是只重试一次，再看测试有没有覆盖并发刷新', raw: '先确认 token 刷新失败时是不是只重试一次。refresh.ts 里 retry 是写死的 1 次，但 session.ts 在并发请求时会各自触发刷新，可能刷两次。要看测试有没有覆盖并发刷新。' },
  { k: 'read', done: '读了 3 个文件', raw: 'src/auth/session.ts\nsrc/auth/refresh.ts\nsrc/auth/session.test.ts' },
  { k: 'edit', done: '改了 session.ts（+12 −3）', raw: '@@ -41,7 +41,16 @@\n-  const token = await refresh()\n+  inflight ??= refresh().finally(() => { inflight = null })\n+  const token = await inflight' },
  { k: 'cmd', done: '跑了 pnpm test', now: '正在跑 pnpm test', fail: '跑 pnpm test', raw: '$ pnpm vitest run src/auth\n ✓ session.test.ts (9 tests)\n ✓ refresh.test.ts (5 tests)\n Tests  14 passed', rawFail: '$ pnpm vitest run src/auth\n ✗ session.test.ts > concurrent refresh\n   expected 1 call, received 2\n Tests  1 failed | 13 passed' },
  { k: 'msg', done: '给子会话发了消息 · 复审 PR #57', now: '正在给子会话发消息 · 复审 PR #57', raw: '→ 子会话「复审 PR #57」\n只看 Sidebar.tsx 的 Shift 连选，结论带 文件:行。' },
];
function turnBlock(el, state) {
  // state: running-collapsed | running-open | failed | finished
  let open = state === 'running-open' || state === 'failed', raw = new Set(state === 'failed' ? [3] : []), sec = state === 'failed' ? 47 : 12;
  const running = state.startsWith('running');
  const steps = state === 'failed' ? TURN_STEPS.slice(0, 4) : running ? TURN_STEPS.slice(0, 4) : TURN_STEPS;
  const nowIdx = running ? 3 : -1, failIdx = state === 'failed' ? 3 : -1;
  const label = (s, i) => i === failIdx ? s.fail + ' <span class="bad">失败</span>' : i === nowIdx ? (s.now || s.done) : s.done;
  function draw() {
    if (state === 'finished' && !open) {
      el.innerHTML = '<button class="fa-fold__sum" aria-expanded="false">' + ic('chevR') + '跑了 12 条命令，读了 5 个文件，完成 2 个后台任务</button>';
      el.firstChild.onclick = () => { open = true; draw(); el.querySelector('button').focus(); }; return;
    }
    const head = state === 'finished'
      ? '<button class="fa-fold__sum" aria-expanded="true">' + ic('chevR') + '跑了 12 条命令，读了 5 个文件，完成 2 个后台任务</button>'
      : '<button class="fa-run" aria-expanded="' + open + '">' + (state === 'failed' ? '<span class="fa-dot fa-dot--error" role="img" aria-label="出错了"></span><span class="lead">跑测试失败了，在等你决定</span>' : '<span class="fa-dots3" aria-hidden="true"><i></i><i></i><i></i></span><span class="lead">正在跑测试</span>') + '<span class="sec">' + sec + ' 秒</span>' + ic('chevR') + '</button>';
    el.innerHTML = head + (open ? '<div class="fa-steps">' + steps.map((s, i) => '<button class="fa-step' + (i === nowIdx ? ' is-now' : '') + '" aria-expanded="' + raw.has(i) + '" data-s="' + i + '"><span class="x">' + label(s, i) + '</span>' + ic('chevR') + '</button>' + (raw.has(i) ? '<pre class="fa-fold__out fa-step__raw">' + esc(i === failIdx ? s.rawFail : s.raw) + '</pre>' : '')).join('') + '</div>' : '');
    el.querySelector('.fa-run, .fa-fold__sum').onclick = () => { open = !open; draw(); el.querySelector('.fa-run, .fa-fold__sum').focus(); };
    el.querySelectorAll('[data-s]').forEach((b) => { b.onclick = () => { const i = +b.dataset.s; raw.has(i) ? raw.delete(i) : raw.add(i); draw(); el.querySelector('[data-s="' + i + '"]').focus(); }; });
    const d = el.querySelector('.fa-dots3'); if (d && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => d.classList.toggle('is-paused', !e.isIntersecting)).observe(d);
  }
  draw();
  if (running) setInterval(() => { if (document.hidden) return; sec++; const s = el.querySelector('.sec'); if (s) s.textContent = sec + ' 秒'; }, 1000);
}
