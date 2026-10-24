window.__ModuleLoader__.load({
  id: 'dsh-context-mekko',
  factory(require) {
    const React = require('react');

    const h = React.createElement;
    const { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } = React;

    const NS = 'context-mekko';
    const PACKAGE = 'dsh-context-mekko';
    const TAB_ID = 'dsh-context-mekko/tab';
    const TAB_KIND = 'contextMekko';

    const zh = {
      tag: 'Context',
      tagTitle: '查看当前上下文构成',
      title: '上下文构成',
      subtitle: '下一次请求实际会看到的内容',
      close: '关闭上下文检查器',
      loading: '正在计算上下文…',
      loadFailed: '上下文构成加载失败。',
      retry: '重试',
      back: '返回',
      copy: '复制',
      copied: '已复制',
      empty: '当前还没有模型可见的上下文。',
      used: '已用',
      of: '/',
      tokens: 'tokens',
      estimated: '估算',
      search: '搜索这个分类…',
      other: '其他',
      free: 'Free',
      topContributors: '占用排行',
      items: '{count} 项',
      listTruncated: '仅显示前 {count} 项；搜索可查找全部',
      tileLimitHint: '最多展示 {count} 个，其余请在下方搜索查看',
      loadContentFailed: '内容加载失败。',
      category: {
        system: '系统与指令',
        tools: '工具定义',
        skills: '技能目录',
        runtime: '运行环境',
        conversation: '对话历史',
        toolResults: '工具结果',
        injected: '注入与其他',
      },
      groups: {
        user: '用户',
        assistant: '助手',
        tool: '工具',
        system: '系统',
        context: '上下文',
        developer: '开发者消息',
        instructions: '工作区指令',
        injected: '注入消息',
        other: '其他',
        team: '团队',
        goal: '目标',
        plan: '计划',
        compaction: '压缩摘要',
        'tool-jobs': '工具任务',
      },
      detail: {
        source: '来源',
        seq: '会话事件',
        truncated: '内容过长，已截断显示。',
        noContent: '该部分没有可渲染内容。',
        other: '其余 {count} 项',
      },
    };

    const en = {
      tag: 'Context',
      tagTitle: 'Inspect the current context window',
      title: 'Context',
      subtitle: 'What the next request will see',
      close: 'Close context inspector',
      loading: 'Measuring context…',
      loadFailed: 'Could not load the context breakdown.',
      retry: 'Retry',
      back: 'Back',
      copy: 'Copy',
      copied: 'Copied',
      empty: 'No model-visible context yet.',
      used: 'used',
      of: 'of',
      tokens: 'tokens',
      estimated: 'estimated',
      search: 'Filter this category…',
      other: 'Other',
      free: 'Free',
      topContributors: 'Largest contributions',
      items: '{count} items',
      listTruncated: 'Showing the first {count}; search covers all',
      tileLimitHint: 'Showing at most {count}; search below for the rest',
      loadContentFailed: 'Could not load this contribution.',
      category: {
        system: 'System & instructions',
        tools: 'Tool definitions',
        skills: 'Skill catalog',
        runtime: 'Runtime & environment',
        conversation: 'Conversation',
        toolResults: 'Tool results',
        injected: 'Injected & other',
      },
      groups: {
        user: 'User',
        assistant: 'Assistant',
        tool: 'Tool',
        system: 'System',
        context: 'Context',
        developer: 'Developer message',
        instructions: 'Workspace instructions',
        injected: 'Injected',
        other: 'Other',
        team: 'Team',
        goal: 'Goal',
        plan: 'Plan',
        compaction: 'Compaction summary',
        'tool-jobs': 'Tool jobs',
      },
      detail: {
        source: 'Source',
        seq: 'Session event',
        truncated: 'Content was truncated for display.',
        noContent: 'This contribution has no rendered content.',
        other: '{count} more items',
      },
    };

    const CATEGORY_COLORS = {
      system: '#8b9bb4',
      tools: '#b48bff',
      skills: '#35b8a6',
      runtime: '#5b8def',
      conversation: '#e0a23d',
      toolResults: '#e26a50',
      injected: '#8a8f98',
    };

    const CATEGORY_ORDER = [
      'system',
      'tools',
      'skills',
      'runtime',
      'conversation',
      'toolResults',
      'injected',
    ];

    const CSS = `
.cmk-tag{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;border:1px solid var(--dsw-alias-border-l3,rgba(128,128,128,.22));background:transparent;color:var(--dsw-alias-label-secondary,#555);font-family:inherit;font-size:12px;line-height:18px;white-space:nowrap;cursor:pointer;flex:none;transition:background-color .15s,border-color .15s,color .15s}
.cmk-tag:hover,.cmk-tag[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1));color:var(--dsw-alias-label-primary,#111);border-color:var(--dsw-alias-border-l2,rgba(128,128,128,.28))}
.cmk-tag:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,#4c8bf5);outline-offset:2px}
.cmk-tagGlyph{display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;flex:none}
.cmk-tagNum{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary,#888);padding-left:2px}
.cmk-panel{height:100%;min-height:0;display:flex;flex-direction:column;box-sizing:border-box;background:transparent;color:var(--dsw-alias-label-primary,#111);font-family:inherit;font-size:13px;line-height:20px}
.cmk-panel *{box-sizing:border-box}
.cmk-panelHead{flex:none;display:flex;align-items:flex-start;gap:10px;padding:12px 14px 10px;border-bottom:1px solid var(--dsw-alias-border-l3,rgba(128,128,128,.16))}
.cmk-panelText{flex:1;min-width:0}
.cmk-panelTitle{font-size:14px;line-height:21px;font-weight:600;margin:0;color:var(--dsw-alias-label-primary,#111)}
.cmk-panelSubtitle{margin:1px 0 0;font-size:11px;line-height:17px;color:var(--dsw-alias-label-tertiary,#888);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmk-headSide{flex:none;display:flex;align-items:center;gap:8px;padding-top:1px}
.cmk-ring{flex:none;display:inline-flex;align-items:center;justify-content:center}
.cmk-panelBody{flex:1;min-height:0;overflow:auto;padding:12px 14px 22px}
.cmk-chart{position:relative;isolation:isolate;display:block;height:600px;width:100%;padding:5px;border-radius:18px;overflow:hidden;background:linear-gradient(145deg,color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 36%,transparent),color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 12%,transparent)),rgba(128,128,128,.045);border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 -1px 0 rgba(0,0,0,.08),0 12px 30px rgba(0,0,0,.12);backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%)}
.cmk-chart::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(120deg,rgba(255,255,255,.12),transparent 28%,transparent 68%,rgba(255,255,255,.045))}
.cmk-chartNested{height:520px;margin:0 0 14px}
.cmk-motion{position:absolute;inset:0;z-index:4;width:100%;height:100%;pointer-events:none}
.cmk-info{flex:none;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border:1px solid rgba(255,255,255,.22);border-radius:50%;background:color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 42%,transparent);backdrop-filter:blur(12px) saturate(150%);-webkit-backdrop-filter:blur(12px) saturate(150%);color:var(--dsw-alias-label-secondary,#555);font-family:inherit;font-size:11px;font-weight:600;line-height:1;cursor:help;box-shadow:inset 0 1px 0 rgba(255,255,255,.18)}
.cmk-info:hover,.cmk-info:focus-visible{color:var(--dsw-alias-label-primary,#111);border-color:rgba(255,255,255,.36);outline:none}
.cmk-tile{--cmk-tile-color:#8a8f98;container-type:size;position:absolute;z-index:1;padding:0;margin:0;border:1px solid color-mix(in srgb,var(--cmk-tile-color) 30%,rgba(255,255,255,.26));border-radius:12px;cursor:pointer;overflow:hidden;isolation:isolate;background:linear-gradient(135deg,color-mix(in srgb,var(--cmk-tile-color) 68%,rgba(255,255,255,.18)) 0%,color-mix(in srgb,var(--cmk-tile-color) 46%,transparent) 52%,color-mix(in srgb,var(--cmk-tile-color) 58%,transparent) 100%);backdrop-filter:blur(14px) saturate(170%);-webkit-backdrop-filter:blur(14px) saturate(170%);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(0,0,0,.10),0 3px 10px rgba(0,0,0,.10);transition:left .5s cubic-bezier(.22,1,.36,1),top .5s cubic-bezier(.22,1,.36,1),width .5s cubic-bezier(.22,1,.36,1),height .5s cubic-bezier(.22,1,.36,1),transform .18s ease,filter .18s ease,box-shadow .18s ease}
.cmk-tile::before{content:"";position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;background:linear-gradient(112deg,rgba(255,255,255,.38) 0%,rgba(255,255,255,.09) 22%,transparent 46%,rgba(255,255,255,.04) 72%,rgba(255,255,255,.14) 100%);opacity:.72;mix-blend-mode:screen}
.cmk-tile::after{content:"";position:absolute;left:7%;right:16%;top:0;height:46%;border-radius:0 0 50% 50%;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.22),transparent);filter:blur(2px);opacity:.55}
.cmk-tile:hover{filter:brightness(1.10) saturate(1.12);transform:translateY(-1px);outline:1px solid rgba(255,255,255,.38);outline-offset:-1px;z-index:2;box-shadow:inset 0 1px 0 rgba(255,255,255,.40),inset 0 -1px 0 rgba(0,0,0,.10),0 6px 16px color-mix(in srgb,var(--cmk-tile-color) 24%,rgba(0,0,0,.16))}
.cmk-tile:active{transform:translateY(0) scale(.995)}
.cmk-tile:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#4c8bf5);outline-offset:-2px;z-index:3}
.cmk-tileLabel{position:absolute;inset:6px 7px;z-index:2;display:none;flex-direction:column;align-items:flex-start;gap:2px;pointer-events:none;text-align:left;color:var(--dsw-alias-label-primary,#111);font:inherit}
.cmk-tileLabelTitle{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:16px;font-weight:600}
.cmk-tileLabelMeta{display:none;font-size:11px;line-height:15px;opacity:.78;font-variant-numeric:tabular-nums}
@container (min-width:72px) and (min-height:30px){.cmk-tileLabel{display:flex}}
@container (min-width:72px) and (min-height:48px){.cmk-tileLabelMeta{display:block}}
.cmk-free{container-type:size;position:absolute;z-index:1;overflow:hidden;border:1px dashed rgba(128,128,128,.38);border-radius:12px;background:repeating-linear-gradient(135deg,rgba(128,128,128,.055) 0 8px,transparent 8px 17px),linear-gradient(145deg,rgba(255,255,255,.045),rgba(128,128,128,.025));box-shadow:inset 0 1px 0 rgba(255,255,255,.10);backdrop-filter:blur(12px) saturate(120%);-webkit-backdrop-filter:blur(12px) saturate(120%);color:var(--dsw-alias-label-tertiary,#888);cursor:default;transition:left .5s cubic-bezier(.22,1,.36,1),top .5s cubic-bezier(.22,1,.36,1),width .5s cubic-bezier(.22,1,.36,1),height .5s cubic-bezier(.22,1,.36,1)}
.cmk-freeLabel{position:absolute;inset:12px;display:none;flex-direction:column;align-items:flex-start;gap:3px;pointer-events:none;text-align:left}
.cmk-freeTitle{font-size:14px;line-height:20px;font-weight:600;color:var(--dsw-alias-label-secondary,#555)}
.cmk-freeMeta{font-size:12px;line-height:17px;font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary,#888)}
@container (min-width:100px) and (min-height:64px){.cmk-freeLabel{display:flex}}
@media (prefers-reduced-motion:reduce){.cmk-tile,.cmk-free{transition:none}.cmk-tile:hover{transform:none}}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.cmk-chart{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.10))}.cmk-tile{background:color-mix(in srgb,var(--cmk-tile-color) 72%,var(--dsw-alias-bg-base,#fff))}}
.cmk-legend{display:flex;flex-direction:column;gap:1px;margin-top:14px}
.cmk-legendRow{display:flex;align-items:center;gap:8px;width:100%;padding:6px 6px;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.cmk-legendRow:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.08))}
.cmk-legendRow:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,#4c8bf5);outline-offset:-1px}
.cmk-swatch{width:10px;height:10px;border-radius:3px;flex:none}
.cmk-legendName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary,#555)}
.cmk-legendNum{flex:none;color:var(--dsw-alias-label-tertiary,#888);font-variant-numeric:tabular-nums;font-size:12px}
.cmk-totals{display:flex;align-items:baseline;gap:6px;margin-top:12px;color:var(--dsw-alias-label-tertiary,#888);font-size:12px}
.cmk-sectionTitle{margin:16px 0 4px;color:var(--dsw-alias-label-secondary,#555);font-size:12px;font-weight:600;line-height:18px}
.cmk-listNote{margin-top:8px;color:var(--dsw-alias-label-tertiary,#888);font-size:11px;line-height:16px;text-align:center}
.cmk-totals b{color:var(--dsw-alias-label-secondary,#555);font-weight:600;font-variant-numeric:tabular-nums}
.cmk-backRow{display:flex;align-items:center;gap:8px;margin:0 0 12px}
.cmk-back{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 8px;border:1px solid var(--dsw-alias-border-l3,rgba(128,128,128,.2));border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,#555);font:inherit;font-size:12px;cursor:pointer}
.cmk-back:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1));color:var(--dsw-alias-label-primary,#111)}
.cmk-detailTitle{font-size:14px;line-height:22px;font-weight:600;margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.cmk-detailMeta{color:var(--dsw-alias-label-tertiary,#888);font-size:12px;flex:none}
.cmk-search{width:100%;height:30px;margin:0 0 10px;padding:0 9px;border:1px solid var(--dsw-alias-border-l3,rgba(128,128,128,.2));border-radius:8px;background:var(--dsw-alias-bg-base,#fff);color:var(--dsw-alias-label-primary,#111);font:inherit;font-size:12px;outline:none}
.cmk-search:focus{border-color:var(--dsw-alias-state-business-primary,#4c8bf5)}
.cmk-list{display:flex;flex-direction:column;gap:2px}
.cmk-row{display:flex;align-items:center;gap:9px;width:100%;padding:7px 7px;border:0;border-radius:8px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer;min-width:0}
.cmk-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.08))}
.cmk-row:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,#4c8bf5);outline-offset:-1px}
.cmk-rowText{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.cmk-rowLabel{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-primary,#111);font-size:12px;line-height:18px}
.cmk-rowPreview{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-tertiary,#888);font-size:11px;line-height:16px}
.cmk-rowNum{flex:none;color:var(--dsw-alias-label-tertiary,#888);font-variant-numeric:tabular-nums;font-size:12px}
.cmk-rowBar{flex:none;width:56px;height:4px;border-radius:2px;overflow:hidden;background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}
.cmk-rowBarFill{height:100%;border-radius:2px}
.cmk-contentHead{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.cmk-contentTitles{flex:1;min-width:0}
.cmk-contentTitle{font-size:14px;line-height:22px;font-weight:600;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmk-contentSub{color:var(--dsw-alias-label-tertiary,#888);font-size:11px;line-height:16px;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cmk-copy{flex:none;height:28px;padding:0 9px;border:1px solid var(--dsw-alias-border-l3,rgba(128,128,128,.2));border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,#555);font:inherit;font-size:12px;cursor:pointer}
.cmk-copy:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1));color:var(--dsw-alias-label-primary,#111)}
.cmk-pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0;padding:12px;border-radius:9px;background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.07));color:var(--dsw-alias-label-primary,#111);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.65;tab-size:2}
.cmk-meta{display:grid;grid-template-columns:auto 1fr;gap:3px 12px;margin:12px 0 0;color:var(--dsw-alias-label-tertiary,#888);font-size:11px;line-height:16px}
.cmk-meta b{color:var(--dsw-alias-label-secondary,#555);font-weight:500;font-variant-numeric:tabular-nums}
.cmk-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;min-height:220px;color:var(--dsw-alias-label-tertiary,#888);font-size:12px;text-align:center}
.cmk-spinner{width:20px;height:20px;border:2px solid var(--dsw-alias-border-l3,rgba(128,128,128,.2));border-top-color:var(--dsw-alias-label-secondary,#555);border-radius:50%;animation:cmk-spin .8s linear infinite}
@keyframes cmk-spin{to{transform:rotate(360deg)}}
.cmk-retry{height:28px;padding:0 12px;border:1px solid var(--dsw-alias-border-l3,rgba(128,128,128,.2));border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary,#555);font:inherit;font-size:12px;cursor:pointer}
.cmk-retry:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.1))}
.cmk-empty{padding:28px 0;color:var(--dsw-alias-label-tertiary,#888);font-size:12px;text-align:center}
@media (max-width:640px){.cmk-chart{height:420px}}
`;

    function readPath(root, path) {
      let current = root;
      for (const part of path.split('.')) {
        if (current === undefined || current === null) return undefined;
        current = current[part];
      }
      return current;
    }

    function translate(t, key, vars) {
      let text;
      try {
        text = typeof t === 'function' ? t(key) : undefined;
      } catch {
        text = undefined;
      }
      if (typeof text !== 'string' || text === key) {
        const fallback = readPath(en, key);
        if (typeof fallback === 'string') text = fallback;
      }
      if (typeof text !== 'string') text = key;
      if (vars !== undefined) {
        text = text.replace(/\{(\w+)\}/g, (match, name) =>
          vars[name] === undefined ? match : String(vars[name]),
        );
      }
      return text;
    }

    function formatTokens(value) {
      const number = typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : 0;
      if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`;
      if (number >= 1_000) return `${(number / 1_000).toFixed(1)}k`;
      return String(Math.round(number));
    }

    function formatPercent(value) {
      if (typeof value !== 'number' || !Number.isFinite(value)) return '';
      const pct = value * 100;
      return pct >= 10 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1)}%`;
    }

    function shade(color, index) {
      const amount = 100 - (index % 4) * 13;
      return `color-mix(in srgb, ${color} ${amount}%, var(--dsw-alias-bg-base, #fff))`;
    }

    function useChangeKey(useProjection) {
      const pressure = typeof useProjection === 'function' ? useProjection('contextPressure') : undefined;
      const breakdown = typeof useProjection === 'function' ? useProjection('contextBreakdown') : undefined;
      const key = [
        pressure?.projectedTokens ?? '',
        pressure?.pressureTokens ?? '',
        breakdown?.systemTokens ?? '',
        breakdown?.toolsTokens ?? '',
        breakdown?.messageTokens ?? '',
      ].join('|');
      return { pressure, key };
    }

    function apiUrl(path) {
      return new URL(path, document.baseURI).toString();
    }

    function useBreakdown(sessionId, changeKey) {
      const [state, setState] = useState({ status: 'idle', data: null, error: null });
      const [retryToken, setRetryToken] = useState(0);
      useEffect(() => {
        if (typeof sessionId !== 'string' || sessionId.length === 0) return undefined;
        let alive = true;
        const controller = new AbortController();
        const timer = setTimeout(async () => {
          if (!alive) return;
          setState((previous) => ({
            status: previous.data === null ? 'loading' : 'refreshing',
            data: previous.data,
            error: null,
          }));
          try {
            const url = new URL(apiUrl('api/context-mekko'));
            url.searchParams.set('sessionId', sessionId);
            const response = await fetch(url.toString(), {
              signal: controller.signal,
              headers: { accept: 'application/json' },
            });
            if (!response.ok) {
              const message = await response.text();
              throw new Error(message || `HTTP ${String(response.status)}`);
            }
            const data = await response.json();
            if (!alive) return;
            setState({ status: 'ready', data, error: null });
          } catch (error) {
            if (!alive || error?.name === 'AbortError') return;
            setState((previous) => ({
              status: 'error',
              data: previous.data,
              error: error instanceof Error ? error.message : String(error),
            }));
          }
        }, 220);
        return () => {
          alive = false;
          clearTimeout(timer);
          controller.abort();
        };
      }, [sessionId, changeKey, retryToken]);
      return {
        ...state,
        retry: useCallback(() => {
          setRetryToken((value) => value + 1);
        }, []),
      };
    }

    function useContent(sessionId, blockId) {
      const [state, setState] = useState({ status: 'idle', data: null, error: null });
      useEffect(() => {
        if (typeof blockId !== 'string' || blockId.length === 0) {
          setState({ status: 'idle', data: null, error: null });
          return undefined;
        }
        let alive = true;
        const controller = new AbortController();
        setState({ status: 'loading', data: null, error: null });
        (async () => {
          try {
            const url = new URL(apiUrl('api/context-mekko/content'));
            url.searchParams.set('sessionId', sessionId);
            url.searchParams.set('blockId', blockId);
            const response = await fetch(url.toString(), {
              signal: controller.signal,
              headers: { accept: 'application/json' },
            });
            if (!response.ok) {
              const message = await response.text();
              throw new Error(message || `HTTP ${String(response.status)}`);
            }
            const data = await response.json();
            if (alive) setState({ status: 'ready', data, error: null });
          } catch (error) {
            if (!alive || error?.name === 'AbortError') return;
            setState({
              status: 'error',
              data: null,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        })();
        return () => {
          alive = false;
          controller.abort();
        };
      }, [sessionId, blockId]);
      return state;
    }

    function CategoryGlyph({ color }) {
      return h(
        'svg',
        { width: 14, height: 14, viewBox: '0 0 14 14', 'aria-hidden': true },
        h('rect', { x: 1, y: 1, width: 3.4, height: 12, rx: 1, fill: color }),
        h('rect', { x: 5.4, y: 1, width: 3.4, height: 8, rx: 1, fill: color, opacity: 0.75 }),
        h('rect', { x: 9.8, y: 1, width: 3.2, height: 11, rx: 1, fill: color, opacity: 0.5 }),
      );
    }

    function Ring({ percent }) {
      const radius = 8;
      const circumference = 2 * Math.PI * radius;
      const clamped = typeof percent === 'number' && Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
      return h(
        'svg',
        { className: 'cmk-ring', width: 22, height: 22, viewBox: '0 0 22 22', 'aria-hidden': true },
        h('circle', {
          cx: 11,
          cy: 11,
          r: radius,
          fill: 'none',
          stroke: 'var(--dsw-alias-border-l3, rgba(128,128,128,.2))',
          strokeWidth: 2.4,
        }),
        h('circle', {
          cx: 11,
          cy: 11,
          r: radius,
          fill: 'none',
          stroke: 'var(--dsw-alias-label-secondary, #555)',
          strokeWidth: 2.4,
          strokeLinecap: 'round',
          strokeDasharray: `${String((circumference * clamped) / 100)} ${String(circumference)}`,
          transform: 'rotate(-90 11 11)',
        }),
      );
    }

    const CHART_PAD = 5;
    const TILE_GAP = 3;
    const MAX_TILES = 100;
    const MAX_LIST_ROWS = 100;

    function worstAspect(areas, length) {
      if (areas.length === 0 || length <= 0) return Infinity;
      let sum = 0;
      let max = 0;
      let min = Infinity;
      for (const area of areas) {
        sum += area;
        max = Math.max(max, area);
        min = Math.min(min, area);
      }
      if (sum <= 0 || min <= 0) return Infinity;
      return Math.max((length * length * max) / (sum * sum), (sum * sum) / (length * length * min));
    }

    function layoutTreemap(items, width, height) {
      const entries = items
        .filter((item) => item.tokens > 0)
        .map((item) => ({ item, area: item.tokens }))
        .sort((left, right) => right.area - left.area);
      const total = entries.reduce((sum, entry) => sum + entry.area, 0);
      if (total <= 0 || width <= 0 || height <= 0) return [];
      const scale = (width * height) / total;
      const rects = [];
      let x = 0;
      let y = 0;
      let w = width;
      let h = height;
      let index = 0;

      while (index < entries.length) {
        const vertical = w >= h;
        const length = vertical ? h : w;
        const row = [];
        let best = Infinity;
        let next = index;
        while (next < entries.length) {
          const candidate = row.concat(entries[next].area * scale);
          const ratio = worstAspect(candidate, length);
          if (row.length === 0 || ratio <= best) {
            row.push(entries[next].area * scale);
            best = ratio;
            next += 1;
          } else {
            break;
          }
        }
        const rowArea = row.reduce((sum, area) => sum + area, 0);
        const thickness = rowArea / Math.max(length, 1);
        let offset = 0;
        for (let cursor = index; cursor < next; cursor += 1) {
          const area = row[cursor - index];
          if (vertical) {
            const cellHeight = area / Math.max(thickness, 1e-6);
            rects.push({
              item: entries[cursor].item,
              x,
              y: y + offset,
              width: thickness,
              height: cellHeight,
            });
            offset += cellHeight;
          } else {
            const cellWidth = area / Math.max(thickness, 1e-6);
            rects.push({
              item: entries[cursor].item,
              x: x + offset,
              y,
              width: cellWidth,
              height: thickness,
            });
            offset += cellWidth;
          }
        }
        if (vertical) {
          x += thickness;
          w = Math.max(w - thickness, 0);
        } else {
          y += thickness;
          h = Math.max(h - thickness, 0);
        }
        index = next;
      }
      return rects;
    }

    function useElementSize(ref) {
      const [size, setSize] = useState({ width: 0, height: 0 });
      useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return undefined;
        const measure = () => {
          const rect = element.getBoundingClientRect();
          const next = {
            width: Math.max(rect.width - CHART_PAD * 2, 0),
            height: Math.max(rect.height - CHART_PAD * 2, 0),
          };
          setSize((previous) =>
            previous.width === next.width && previous.height === next.height ? previous : next,
          );
        };
        measure();
        if (typeof ResizeObserver === 'undefined') return undefined;
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
      }, [ref]);
      return size;
    }

    function tileStyle(rect) {
      return {
        left: `${rect.x + CHART_PAD + TILE_GAP / 2}px`,
        top: `${rect.y + CHART_PAD + TILE_GAP / 2}px`,
        width: `${Math.max(rect.width - TILE_GAP, 1)}px`,
        height: `${Math.max(rect.height - TILE_GAP, 1)}px`,
      };
    }

    function motionRect(rect) {
      return {
        x: rect.x + CHART_PAD + TILE_GAP / 2,
        y: rect.y + CHART_PAD + TILE_GAP / 2,
        width: Math.max(rect.width - TILE_GAP, 1),
        height: Math.max(rect.height - TILE_GAP, 1),
      };
    }

    function classifyMotion(previous, next) {
      if (!previous || previous.sessionId !== next.sessionId) return null;
      if (next.compactionSeq !== null && next.compactionSeq !== previous.compactionSeq) return 'compaction';
      if (previous.window !== next.window) return 'window';
      const previousTokens = new Map(previous.categories.map((category) => [category.key, category.tokens]));
      let growth = 0;
      let shrink = 0;
      for (const category of next.categories) {
        const delta = category.tokens - (previousTokens.get(category.key) ?? 0);
        if (delta > 0) growth += delta;
        else shrink -= delta;
      }
      const delta = next.used - previous.used;
      const threshold = Math.max(256, next.window * 0.0002);
      if (delta >= threshold || growth >= threshold) return 'consume';
      if (delta <= -threshold || shrink >= threshold) return 'release';
      return null;
    }

    function buildMotionPlan(previous, next, kind) {
      const previousTokens = new Map(previous.categories.map((category) => [category.key, category.tokens]));
      const changes = next.categories.map((category) => ({
        key: category.key,
        delta: category.tokens - (previousTokens.get(category.key) ?? 0),
      }));
      const positive = changes.filter((change) => change.delta > 0);
      const negative = changes.filter((change) => change.delta < 0);
      const targets = positive
        .map((change) => ({
          key: change.key,
          color: CATEGORY_COLORS[change.key] ?? '#8a8f98',
          rect: next.rects.get(change.key),
          delta: change.delta,
        }))
        .filter((target) => target.rect !== undefined);
      const origins = negative
        .map((change) => ({
          key: change.key,
          color: CATEGORY_COLORS[change.key] ?? '#8a8f98',
          rect: previous.rects.get(change.key),
          delta: change.delta,
        }))
        .filter((origin) => origin.rect !== undefined);

      if (kind === 'consume' && targets.length === 0) return null;
      if (kind !== 'consume' && origins.length === 0) return null;
      return {
        kind,
        duration: kind === 'compaction' ? 1400 : kind === 'release' ? 700 : 1100,
        targets,
        origins,
        previousFree: previous.freeRect,
        free: next.freeRect,
        usedFrom: previous.used,
        usedTo: next.used,
      };
    }

    const GLOW_CACHE = new Map();

    function glowSprite(color) {
      const cached = GLOW_CACHE.get(color);
      if (cached !== undefined) return cached;
      const sprite = document.createElement('canvas');
      sprite.width = 64;
      sprite.height = 64;
      const context = sprite.getContext('2d');
      if (context === null) return null;
      const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.22, color);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 64, 64);
      GLOW_CACHE.set(color, sprite);
      return sprite;
    }

    function MotionLayer({ plan, onDone }) {
      const canvasRef = useRef(null);
      const doneRef = useRef(onDone);
      doneRef.current = onDone;

      useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || typeof window === 'undefined') return undefined;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
          doneRef.current();
          return undefined;
        }
        const context = canvas.getContext('2d');
        if (context === null) return undefined;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const resize = () => {
          const rect = canvas.getBoundingClientRect();
          if (rect.width <= 0 || rect.height <= 0) return;
          canvas.width = Math.max(1, Math.round(rect.width * dpr));
          canvas.height = Math.max(1, Math.round(rect.height * dpr));
          context.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();
        const observer =
          typeof ResizeObserver === 'undefined'
            ? undefined
            : new ResizeObserver(() => {
                resize();
              });
        observer?.observe(canvas);
        const start = performance.now();
        let frame = 0;
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          cancelAnimationFrame(frame);
          doneRef.current();
        };
        const drawGlow = (color, x, y, radius, alpha) => {
          const sprite = glowSprite(color);
          if (sprite === null) return;
          context.globalAlpha = alpha;
          context.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
        };
        const drawGhost = (color, rect, alpha) => {
          if (rect === undefined) return;
          const radius = Math.min(12, rect.width / 3, rect.height / 3);
          context.globalAlpha = alpha;
          context.fillStyle = color;
          context.beginPath();
          if (typeof context.roundRect === 'function') {
            context.roundRect(rect.x, rect.y, rect.width, rect.height, radius);
          } else {
            context.rect(rect.x, rect.y, rect.width, rect.height);
          }
          context.fill();
        };
        const draw = (now) => {
          const elapsed = now - start;
          const width = canvas.width / dpr;
          const height = canvas.height / dpr;
          context.clearRect(0, 0, width, height);
          if (plan.kind === 'consume') {
            const source = plan.previousFree ?? plan.free;
            const sourceY = source.y + source.height * 0.72;
            const particles = Math.min(10, Math.max(4, plan.targets.length * 4));
            const lanes = Math.ceil(particles / plan.targets.length);
            for (let index = 0; index < particles; index += 1) {
              const target = plan.targets[index % plan.targets.length];
              const lane = Math.floor(index / plan.targets.length);
              const delay = index * 42;
              const progress = Math.max(0, Math.min(1, (elapsed - delay) / 700));
              if (progress <= 0) continue;
              const eased = 1 - Math.pow(1 - progress, 3);
              const startX = source.x + source.width * ((lane + 1) / (lanes + 1));
              const endX = target.rect.x + target.rect.width / 2;
              const endY = target.rect.y + target.rect.height / 2;
              const controlX = (startX + endX) / 2;
              const controlY = Math.min(sourceY, endY) - 42;
              const inverse = 1 - eased;
              const x = inverse * inverse * startX + 2 * inverse * eased * controlX + eased * eased * endX;
              const y = inverse * inverse * sourceY + 2 * inverse * eased * controlY + eased * eased * endY;
              drawGlow(target.color, x, y, 11, 0.62);
              context.globalAlpha = 0.95;
              context.fillStyle = target.color;
              context.beginPath();
              context.arc(x, y, 2.6, 0, Math.PI * 2);
              context.fill();
              if (progress > 0.62) {
                context.globalAlpha = (1 - progress) * 0.7;
                context.strokeStyle = target.color;
                context.lineWidth = 1.6;
                context.beginPath();
                context.arc(endX, endY, 8 + (1 - progress) * 18, 0, Math.PI * 2);
                context.stroke();
              }
            }
          } else {
            const freeY = plan.free.y + plan.free.height * 0.42;
            plan.origins.slice(0, 8).forEach((origin, index) => {
              const delay = index * 35;
              const progress = Math.max(0, Math.min(1, (elapsed - delay) / 1000));
              if (progress <= 0) return;
              const eased = 1 - Math.pow(1 - progress, 3);
              const startX = origin.rect.x + origin.rect.width / 2;
              const startY = origin.rect.y + origin.rect.height * 0.55;
              const x = startX + Math.sin(index * 1.7 + progress * 2.4) * 32 * progress;
              const y = startY + (freeY - startY) * eased;
              drawGhost(origin.color, origin.rect, 0.26 * (1 - progress));
              drawGlow(origin.color, x, y, 18 + progress * 48, 0.42 * (1 - progress));
              drawGlow(origin.color, x + 24 * Math.sin(index), y + 10, 14 + progress * 32, 0.26 * (1 - progress));
            });
          }
          if (elapsed >= plan.duration) {
            finish();
            return;
          }
          frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
        const onVisibility = () => {
          if (document.visibilityState === 'hidden') finish();
        };
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
          finished = true;
          cancelAnimationFrame(frame);
          observer?.disconnect();
          document.removeEventListener('visibilitychange', onVisibility);
        };
      }, [plan]);

      return h('canvas', { ref: canvasRef, className: 'cmk-motion', 'aria-hidden': true });
    }

    function MekkoTile({ rect, item, onSelectCategory, share, t }) {
      const category = item.category;
      const color = CATEGORY_COLORS[category.key] ?? '#8a8f98';
      const label = translate(t, `category.${category.key}`);
      const meta = `${formatTokens(category.tokens)} · ${formatPercent(share)}`;
      return h(
        'button',
        {
          type: 'button',
          className: 'cmk-tile',
          style: { ...tileStyle(rect), '--cmk-tile-color': color },
          title: `${label} · ${meta} of used context`,
          'aria-label': `${label}, ${meta} of used context`,
          onClick: () => onSelectCategory(category.key),
        },
        h(
          'span',
          { className: 'cmk-tileLabel' },
          h('span', { className: 'cmk-tileLabelTitle' }, label),
          h('span', { className: 'cmk-tileLabelMeta' }, meta),
        ),
      );
    }

    function FreeTile({ rect, tokens, windowTokens, t }) {
      const percent = windowTokens > 0 ? formatPercent(tokens / windowTokens) : '';
      const label = translate(t, 'free');
      return h(
        'div',
        {
          className: 'cmk-free',
          style: tileStyle(rect),
          role: 'img',
          'aria-label': `${label} · ${formatTokens(tokens)}${percent ? ` · ${percent}` : ''}`,
          title: `${label} · ${formatTokens(tokens)}${percent ? ` · ${percent}` : ''}`,
        },
        h(
          'span',
          { className: 'cmk-freeLabel' },
          h('span', { className: 'cmk-freeTitle' }, label),
          h('span', { className: 'cmk-freeMeta' }, `${formatTokens(tokens)}${percent ? ` · ${percent}` : ''}`),
        ),
      );
    }

    function skillNameFromText(text) {
      const match = /<skill_content\b[^>]*\bname=["']([^"']+)["']/u.exec(String(text ?? ''));
      return match?.[1];
    }

    function normalizeChild(category, child) {
      if (category.key !== 'toolResults') return child;
      const preview = String(child.preview ?? '');
      if (child.group === 'skill' || preview.includes('<skill_content')) {
        return {
          ...child,
          group: 'skill',
          label: skillNameFromText(preview) ?? child.label.replace(/^Skill · /u, ''),
        };
      }
      return child;
    }

    function buildGroups(category) {
      const groups = new Map();
      for (const child of category.children) {
        const normalized = normalizeChild(category, child);
        const key =
          typeof normalized.group === 'string' && normalized.group.length > 0
            ? normalized.group
            : 'other';
        let group = groups.get(key);
        if (group === undefined) {
          group = { key, tokens: 0, children: [] };
          groups.set(key, group);
        }
        group.tokens += normalized.tokens;
        group.children.push(normalized);
      }
      return [...groups.values()]
        .map((group) => ({
          ...group,
          children: [...group.children].sort((left, right) => right.tokens - left.tokens),
        }))
        .sort((left, right) => right.tokens - left.tokens);
    }

    function leafLabelWithoutGroup(label, groupKey) {
      if (groupKey === 'assistant') return label.replace(/^Assistant\s*·\s*/u, '');
      if (groupKey === 'user') return label.replace(/^User\s+/u, '');
      if (groupKey === 'system') return label.replace(/^System\s+/u, '');
      return label;
    }

    function groupLabel(t, key) {
      const known = new Set([
        'user',
        'assistant',
        'system',
        'developer',
        'instructions',
        'injected',
        'other',
        'team',
        'goal',
        'plan',
        'compaction',
        'tool-jobs',
      ]);
      return known.has(key) ? translate(t, `groups.${key}`) : key;
    }

    function limitTreemapItems(items) {
      return [...items].sort((left, right) => right.tokens - left.tokens).slice(0, MAX_TILES);
    }

    function NestedTreemap({ items, onSelect, t }) {
      const chartRef = useRef(null);
      const size = useElementSize(chartRef);
      const limited = limitTreemapItems(items);
      const total = items.reduce((sum, item) => sum + item.tokens, 0);
      const rects = layoutTreemap(limited, size.width, size.height);
      return h(
        'div',
        { ref: chartRef, className: 'cmk-chart cmk-chartNested' },
        rects.map(({ item, ...rect }) => {
          const meta = `${formatTokens(item.tokens)} · ${formatPercent(total > 0 ? item.tokens / total : 0)}`;
          return h(
            'button',
            {
              key: item.key,
              type: 'button',
              className: 'cmk-tile',
              style: { ...tileStyle(rect), '--cmk-tile-color': item.color },
              title: `${item.label} · ${meta}`,
              'aria-label': `${item.label}, ${meta}`,
              onClick: () => onSelect(item),
            },
            h(
              'span',
              { className: 'cmk-tileLabel' },
              h('span', { className: 'cmk-tileLabelTitle' }, item.label),
              h('span', { className: 'cmk-tileLabelMeta' }, meta),
            ),
          );
        }),
      );
    }

    function Mekko({
      sessionId,
      asOfSeq,
      categories,
      rawCategories = [],
      usedTokens = 0,
      layoutScale = 1,
      freeTokens = 0,
      windowTokens = 0,
      compaction,
      onSelectCategory,
      t,
    }) {
      const chartRef = useRef(null);
      const size = useElementSize(chartRef);
      const [motionPlan, setMotionPlan] = useState(null);
      const activePlanRef = useRef(null);
      const motionRef = useRef(null);
      const motionId = useRef(0);
      const clearMotion = useCallback(() => {
        activePlanRef.current = null;
        setMotionPlan(null);
      }, []);
      const onMotionDone = clearMotion;
      const estimatedTotal = categories.reduce((sum, category) => sum + category.tokens, 0);
      const items = categories.map((category) => ({
        key: category.key,
        tokens: category.tokens * layoutScale,
        category,
      }));
      const layoutTotal = items.reduce((sum, item) => sum + item.tokens, 0);
      const totalWindow = layoutTotal + freeTokens;
      const usedShare = totalWindow > 0 ? Math.min(Math.max(layoutTotal / totalWindow, 0), 1) : 1;
      const usedHeight = size.height * usedShare;
      const freeHeight = Math.max(size.height - usedHeight, 0);
      const rects = layoutTreemap(items, size.width, usedHeight);
      const motionKey = [
        sessionId,
        asOfSeq,
        usedTokens,
        windowTokens,
        compaction?.seq ?? '',
        rawCategories.map((category) => `${category.key}:${category.tokens}`).join(','),
        size.width,
        size.height,
      ].join('|');

      useEffect(() => {
        if (size.width <= 0 || size.height <= 0) return;
        const rectsByKey = new Map(
          rects.map(({ item, ...rect }) => [
            item.key,
            motionRect({ ...rect, y: rect.y + freeHeight }),
          ]),
        );
        const freeRect = motionRect({ x: 0, y: 0, width: size.width, height: freeHeight });
        const current = {
          sessionId,
          used: usedTokens,
          window: windowTokens,
          categories: rawCategories.map(({ key, tokens }) => ({ key, tokens })),
          compactionSeq: compaction?.seq ?? null,
          rects: rectsByKey,
          freeRect,
          size: { width: size.width, height: size.height },
        };
        const previous = motionRef.current;
        if (previous === null) {
          motionRef.current = current;
          return;
        }
        if (previous.sessionId !== sessionId) {
          clearMotion();
          motionRef.current = current;
          return;
        }
        if (previous.size.width !== size.width || previous.size.height !== size.height) {
          clearMotion();
          motionRef.current = current;
          return;
        }
        const usedChanged = previous.used !== current.used;
        const windowChanged = previous.window !== current.window;
        const compactionChanged =
          current.compactionSeq !== null && current.compactionSeq !== previous.compactionSeq;
        const categorySignatureChanged = JSON.stringify(previous.categories) !== JSON.stringify(current.categories);
        if (!usedChanged && !windowChanged && !compactionChanged && !categorySignatureChanged) return;
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
          clearMotion();
          motionRef.current = current;
          return;
        }
        const kind = classifyMotion(previous, current);
        if (kind === 'window') {
          clearMotion();
          motionRef.current = current;
          return;
        }
        const plan = kind === null ? null : buildMotionPlan(previous, current, kind);
        if (plan === null) {
          clearMotion();
          if (kind === 'compaction') motionRef.current = current;
          return;
        }
        motionRef.current = current;
        plan.id = ++motionId.current;

        activePlanRef.current = plan;
        setMotionPlan(plan);
      }, [motionKey]);

      if (estimatedTotal <= 0) return h('div', { className: 'cmk-empty' }, '—');
      return h(
        'div',
        { ref: chartRef, className: 'cmk-chart' },
        freeTokens > 0 && freeHeight > 0
          ? h(FreeTile, {
              key: 'free',
              rect: { x: 0, y: 0, width: size.width, height: freeHeight },
              tokens: freeTokens,
              windowTokens,
              t,
            })
          : null,
        rects.map(({ item, ...rect }) =>
          h(MekkoTile, {
            key: item.key,
            rect: { ...rect, y: rect.y + freeHeight },
            item,
            share: windowTokens > 0 ? item.category.tokens / windowTokens : 0,
            onSelectCategory,
            t,
          }),
        ),
        motionPlan === null ? null : h(MotionLayer, { plan: motionPlan, onDone: onMotionDone }),
      );
    }

    function Legend({ categories, total, onSelectCategory, t }) {
      const sortedCategories = [...categories].sort(
        (left, right) =>
          right.tokens - left.tokens || CATEGORY_ORDER.indexOf(left.key) - CATEGORY_ORDER.indexOf(right.key),
      );
      return h(
        'div',
        { className: 'cmk-legend' },
        sortedCategories.map((category) => {
          const color = CATEGORY_COLORS[category.key] ?? '#8a8f98';
          return h(
            'button',
            {
              key: category.key,
              type: 'button',
              className: 'cmk-legendRow',
              onClick: () => onSelectCategory(category.key),
            },
            h('span', { className: 'cmk-swatch', style: { backgroundColor: color } }),
            h('span', { className: 'cmk-legendName' }, translate(t, `category.${category.key}`)),
            h(
              'span',
              { className: 'cmk-legendNum' },
              `${formatTokens(category.tokens)} · ${formatPercent(total === 0 ? 0 : category.tokens / total)}`,
            ),
          );
        }),
      );
    }

    function Overview({ sessionId, data, usedTokens, contextWindow, onSelectCategory, onOpenBlock, t }) {
      const categories = [...data.categories].sort(
        (left, right) => CATEGORY_ORDER.indexOf(left.key) - CATEGORY_ORDER.indexOf(right.key),
      );
      if (data.totalTokens <= 0) {
        return h('div', { className: 'cmk-empty' }, translate(t, 'empty'));
      }
      const windowTokens =
        Number.isFinite(contextWindow) && contextWindow > 0
          ? contextWindow
          : Number.isFinite(data.contextWindow) && data.contextWindow > 0
            ? data.contextWindow
            : Math.max(data.totalTokens, 1);
      const reportedUsed = Number.isFinite(usedTokens) && usedTokens >= 0 ? usedTokens : data.totalTokens;
      const used = Math.min(Math.max(reportedUsed, 0), windowTokens);
      const layoutScale = used / data.totalTokens;
      const freeTokens = Math.max(windowTokens - used, 0);
      const displayCategories = categories.map((category) => ({
        ...category,
        tokens: category.tokens * layoutScale,
        children: category.children.map((child) => ({ ...child, tokens: child.tokens * layoutScale })),
      }));
      return h(
        'div',
        null,
        h('div', { className: 'cmk-totals' },
          h('span', null, h('b', null, `~${formatTokens(used)}`)),
          h('span', null, translate(t, 'of')),
          h('span', null, formatTokens(windowTokens)),
          h('span', null, '·'),
          h('span', null, formatPercent(windowTokens > 0 ? used / windowTokens : 0)),
        ),
        h(Mekko, {
          sessionId,
          asOfSeq: data.asOfSeq,
          categories: displayCategories,
          rawCategories: categories,
          usedTokens: used,
          freeTokens,
          windowTokens,
          compaction: data.compaction,
          onSelectCategory,
          t,
        }),
        h(Legend, { categories: displayCategories, total: windowTokens, onSelectCategory, t }),
        (() => {
          const top = displayCategories
            .flatMap((category) => category.children.map((child) => ({ child, category })))
            .filter((entry) => entry.child.tokens > 0)
            .sort((left, right) => right.child.tokens - left.child.tokens)
            .slice(0, 8);
          if (top.length === 0) return null;
          return h(
            'div',
            null,
            h('div', { className: 'cmk-sectionTitle' }, translate(t, 'topContributors')),
            h(
              'div',
              { className: 'cmk-list' },
              top.map(({ child, category }) =>
                h(
                  'button',
                  {
                    key: `${category.key}:${child.id}`,
                    type: 'button',
                    className: 'cmk-row',
                    onClick: () => onOpenBlock(child, category),
                  },
                  h('span', {
                    className: 'cmk-swatch',
                    style: { backgroundColor: CATEGORY_COLORS[category.key] ?? '#8a8f98' },
                  }),
                  h(
                    'span',
                    { className: 'cmk-rowText' },
                    h('span', { className: 'cmk-rowLabel' }, child.label),
                    h(
                      'span',
                      { className: 'cmk-rowPreview' },
                      `${translate(t, `category.${category.key}`)}${child.preview ? ` · ${child.preview}` : ''}`,
                    ),
                  ),
                  h('span', { className: 'cmk-rowNum' }, formatTokens(child.tokens)),
                ),
              ),
            ),
          );
        })(),
      );
    }

    function CategoryDetail({ category, data, usedTokens, contextWindow, onBack, onOpenBlock, t }) {
      const [query, setQuery] = useState('');
      const [selectedGroupKey, setSelectedGroupKey] = useState(null);
      const windowTokens =
        Number.isFinite(contextWindow) && contextWindow > 0
          ? contextWindow
          : Number.isFinite(data.contextWindow) && data.contextWindow > 0
            ? data.contextWindow
            : Math.max(data.totalTokens, 1);
      const reportedUsed = Number.isFinite(usedTokens) && usedTokens >= 0 ? usedTokens : data.totalTokens;
      const used = Math.min(Math.max(reportedUsed, 0), windowTokens);
      const displayScale = data.totalTokens > 0 ? used / data.totalTokens : 1;
      const groups = useMemo(() => buildGroups(category), [category]);
      const displayGroups = useMemo(
        () =>
          groups.map((group) => ({
            ...group,
            tokens: group.tokens * displayScale,
            children: group.children.map((child) => ({ ...child, tokens: child.tokens * displayScale })),
          })),
        [groups, displayScale],
      );
      const selectedGroup =
        selectedGroupKey === null ? undefined : displayGroups.find((group) => group.key === selectedGroupKey);
      const showGroups = displayGroups.length > 1 && selectedGroup === undefined;
      const leafGroup =
        selectedGroup ?? (displayGroups.length === 1 ? displayGroups[0] : undefined);
      const activeChildren = leafGroup
        ? leafGroup.children
        : displayGroups.flatMap((group) => group.children);
      const childLabel = (child) => leafLabelWithoutGroup(child.label, leafGroup?.key);
      const displayCategoryTokens = category.tokens * displayScale;
      const total = selectedGroup ? selectedGroup.tokens : displayCategoryTokens;
      const color = CATEGORY_COLORS[category.key] ?? '#8a8f98';

      const children = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const sorted = [...activeChildren].sort((left, right) => right.tokens - left.tokens);
        if (needle.length === 0) return sorted;
        return sorted.filter(
          (child) =>
            child.label.toLowerCase().includes(needle) ||
            String(child.preview ?? '').toLowerCase().includes(needle),
        );
      }, [activeChildren, query]);

      useEffect(() => {
        setSelectedGroupKey(null);
        setQuery('');
      }, [category.key]);
      useEffect(() => {
        if (selectedGroupKey !== null && !displayGroups.some((group) => group.key === selectedGroupKey)) {
          setSelectedGroupKey(null);
        }
      }, [displayGroups, selectedGroupKey]);

      const handleBack = selectedGroup ? () => setSelectedGroupKey(null) : onBack;
      const groupItems = displayGroups.map((group, index) => ({
        key: group.key,
        label: groupLabel(t, group.key),
        tokens: group.tokens,
        color: shade(color, index),
        group,
      }));
      const childItems = children.map((child, index) => ({
        key: child.id,
        label: childLabel(child),
        tokens: child.tokens,
        color: shade(color, index),
        child,
      }));
      const chartItems = showGroups ? groupItems : childItems;
      const hiddenTiles = Math.max(0, chartItems.length - MAX_TILES);
      const hint = translate(t, 'tileLimitHint', { count: MAX_TILES });
      const visibleChildren = children.slice(0, MAX_LIST_ROWS);

      return h(
        'div',
        null,
        h(
          'div',
          { className: 'cmk-backRow' },
          h(
            'button',
            { type: 'button', className: 'cmk-back', onClick: handleBack },
            h('span', { 'aria-hidden': true }, '‹'),
            translate(t, 'back'),
          ),
          h(
            'div',
            { style: { flex: 1, minWidth: 0 } },
            h('div', { className: 'cmk-detailTitle' }, translate(t, `category.${category.key}`)),
            h(
              'div',
              { className: 'cmk-detailMeta' },
              selectedGroup !== undefined
                ? `${groupLabel(t, selectedGroup.key)} · ${formatTokens(selectedGroup.tokens)} · ${formatPercent(
                    displayCategoryTokens > 0 ? selectedGroup.tokens / displayCategoryTokens : 0,
                  )}`
                : `${formatTokens(displayCategoryTokens)} · ${formatPercent(
                    windowTokens > 0 ? displayCategoryTokens / windowTokens : 0,
                  )}`,
            ),
          ),
          hiddenTiles > 0
            ? h(
                'span',
                {
                  className: 'cmk-info',
                  role: 'img',
                  tabIndex: 0,
                  'aria-label': hint,
                  title: hint,
                },
                h('span', { 'aria-hidden': true }, 'i'),
              )
            : null,
        ),
        h(NestedTreemap, {
          items: chartItems,
          onSelect: (item) => {
            if (showGroups) setSelectedGroupKey(item.group.key);
            else onOpenBlock(item.child, category);
          },
          t,
        }),
        showGroups
          ? h(
              'div',
              { className: 'cmk-list' },
              groupItems.slice(0, MAX_TILES).map((item) =>
                h(
                  'button',
                  {
                    key: item.key,
                    type: 'button',
                    className: 'cmk-row',
                    onClick: () => setSelectedGroupKey(item.group.key),
                  },
                  h('span', {
                    className: 'cmk-swatch',
                    style: { backgroundColor: item.color },
                  }),
                  h(
                    'span',
                    { className: 'cmk-rowText' },
                    h('span', { className: 'cmk-rowLabel' }, item.label),
                    h(
                      'span',
                      { className: 'cmk-rowPreview' },
                      translate(t, 'items', { count: item.group.children.length }),
                    ),
                  ),
                  h('span', { className: 'cmk-rowNum' }, formatTokens(item.tokens)),
                ),
              ),
            )
          : h(
              Fragment,
              null,
              children.length > 10
                ? h('input', {
                    className: 'cmk-search',
                    value: query,
                    placeholder: translate(t, 'search'),
                    onChange: (event) => setQuery(event.target.value),
                    'aria-label': translate(t, 'search'),
                  })
                : null,
              h(
                'div',
                { className: 'cmk-list' },
                visibleChildren.map((child, index) => {
                  const share = total === 0 ? 0 : child.tokens / total;
                  return h(
                    'button',
                    {
                      key: child.id,
                      type: 'button',
                      className: 'cmk-row',
                      onClick: () => onOpenBlock(child, category),
                    },
                    h('span', {
                      className: 'cmk-swatch',
                      style: { backgroundColor: shade(color, index) },
                    }),
                    h(
                      'span',
                      { className: 'cmk-rowText' },
                      h('span', { className: 'cmk-rowLabel' }, childLabel(child)),
                      child.preview ? h('span', { className: 'cmk-rowPreview' }, child.preview) : null,
                    ),
                    h(
                      'span',
                      { className: 'cmk-rowBar', 'aria-hidden': true },
                      h('span', {
                        className: 'cmk-rowBarFill',
                        style: {
                          display: 'block',
                          width: `${String(Math.max(2, share * 100))}%`,
                          backgroundColor: color,
                        },
                      }),
                    ),
                    h('span', { className: 'cmk-rowNum' }, formatTokens(child.tokens)),
                  );
                }),
              ),
              children.length > MAX_LIST_ROWS
                ? h(
                    'div',
                    { className: 'cmk-listNote' },
                    translate(t, 'listTruncated', { count: MAX_LIST_ROWS }),
                  )
                : null,
            ),
      );
    }

    function ContentView({ sessionId, blockId, tokens, onBack, t }) {
      const state = useContent(sessionId, blockId);
      const [copied, setCopied] = useState(false);
      const copy = useCallback(async () => {
        if (state.status !== 'ready') return;
        try {
          await navigator.clipboard.writeText(state.data.body ?? '');
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        } catch {
          setCopied(false);
        }
      }, [state]);
      if (state.status === 'loading' || state.status === 'idle') {
        return h(
          'div',
          { className: 'cmk-state' },
          h('span', { className: 'cmk-spinner' }),
          h('span', null, translate(t, 'loading')),
        );
      }
      if (state.status === 'error') {
        return h(
          'div',
          { className: 'cmk-state' },
          h('span', null, translate(t, 'loadContentFailed')),
          h('span', { style: { opacity: 0.7 } }, state.error),
        );
      }
      const content = state.data;
      const title = skillNameFromText(content.body) ?? content.title ?? blockId;
      return h(
        'div',
        null,
        h(
          'div',
          { className: 'cmk-backRow' },
          h(
            'button',
            { type: 'button', className: 'cmk-back', onClick: onBack },
            h('span', { 'aria-hidden': true }, '‹'),
            translate(t, 'back'),
          ),
        ),
        h(
          'div',
          { className: 'cmk-contentHead' },
          h(
            'div',
            { className: 'cmk-contentTitles' },
            h('div', { className: 'cmk-contentTitle' }, title),
            h(
              'div',
              { className: 'cmk-contentSub' },
              content.subtitle ?? '',
              typeof tokens === 'number' ? ` · ${formatTokens(tokens)} tokens` : '',
            ),
          ),
          h(
            'button',
            { type: 'button', className: 'cmk-copy', onClick: copy },
            copied ? translate(t, 'copied') : translate(t, 'copy'),
          ),
        ),
        h('pre', { className: 'cmk-pre' }, content.body ?? ''),
        h(
          'div',
          { className: 'cmk-meta' },
          content.meta?.sourceKind
            ? h(Fragment, null, h('span', null, translate(t, 'detail.source')), h('b', null, String(content.meta.sourceKind)))
            : null,
          content.meta?.eventType
            ? h(Fragment, null, h('span', null, 'Event'), h('b', null, String(content.meta.eventType)))
            : null,
          typeof content.meta?.seq === 'number'
            ? h(Fragment, null, h('span', null, translate(t, 'detail.seq')), h('b', null, String(content.meta.seq)))
            : null,
          typeof content.meta?.tokens === 'number'
            ? h(Fragment, null, h('span', null, 'Tokens'), h('b', null, `~${formatTokens(content.meta.tokens)}`))
            : null,
        ),
        content.meta?.truncated ? h('div', { className: 'cmk-totals' }, translate(t, 'detail.truncated')) : null,
      );
    }

    function ContextPanel({ sessionId: sessionIdProp, useTabInfo, useProjection, t }) {
      const tabInfo = typeof useTabInfo === 'function' ? useTabInfo() : undefined;
      const params = tabInfo?.tab?.navigation?.params;
      const sessionId =
        typeof sessionIdProp === 'string' && sessionIdProp.length > 0
          ? sessionIdProp
          : typeof params?.sessionId === 'string'
            ? params.sessionId
            : undefined;
      const { pressure, key } = useChangeKey(useProjection);
      const breakdown = useBreakdown(sessionId, key);
      const [view, setView] = useState({ kind: 'overview' });
      const data = breakdown.data;
      const initialSessionRef = useRef(sessionId);

      useEffect(() => {
        if (initialSessionRef.current === sessionId) return;
        initialSessionRef.current = sessionId;
        setView({ kind: 'overview' });
      }, [sessionId]);
      useEffect(() => {
        if (!data) return;
        if (view.kind === 'category' && !data.categories.some((category) => category.key === view.key)) {
          setView({ kind: 'overview' });
        }
      }, [data, view]);

      const used = pressure?.projectedTokens ?? pressure?.pressureTokens;
      const windowSize = pressure?.contextWindow ?? data?.contextWindow;
      const percent =
        typeof used === 'number' && typeof windowSize === 'number' && windowSize > 0
          ? Math.min(100, (used / windowSize) * 100)
          : undefined;
      const category =
        view.kind === 'category' && data
          ? data.categories.find((candidate) => candidate.key === view.key)
          : undefined;

      const openBlock = (block, fromCategory) => {
        setView({
          kind: 'content',
          blockId: block.contentId,
          tokens: block.tokens,
          from: fromCategory === undefined ? { kind: 'overview' } : { kind: 'category', key: fromCategory.key },
        });
      };

      let content;
      if (breakdown.status === 'loading' && data === null) {
        content = h(
          'div',
          { className: 'cmk-state' },
          h('span', { className: 'cmk-spinner' }),
          h('span', null, translate(t, 'loading')),
        );
      } else if (breakdown.status === 'error' && data === null) {
        content = h(
          'div',
          { className: 'cmk-state' },
          h('span', null, translate(t, 'loadFailed')),
          h('span', { style: { opacity: 0.7, maxWidth: 320, overflowWrap: 'anywhere' } }, breakdown.error),
          h('button', { type: 'button', className: 'cmk-retry', onClick: breakdown.retry }, translate(t, 'retry')),
        );
      } else if (data === null) {
        content = h('div', { className: 'cmk-state' }, translate(t, 'empty'));
      } else if (view.kind === 'content') {
        content = h(ContentView, {
          sessionId,
          blockId: view.blockId,
          tokens: view.tokens,
          onBack: () => setView(view.from ?? { kind: 'overview' }),
          t,
        });
      } else if (view.kind === 'category' && category !== undefined) {
        content = h(CategoryDetail, {
          category,
          data,
          usedTokens: used,
          contextWindow: windowSize,
          onBack: () => setView({ kind: 'overview' }),
          onOpenBlock: (block) => openBlock(block, category),
          t,
        });
      } else {
        content = h(Overview, {
          sessionId,
          data,
          usedTokens: used,
          contextWindow: windowSize,
          onSelectCategory: (categoryKey) => setView({ kind: 'category', key: categoryKey }),
          onOpenBlock: (block) => openBlock(block, undefined),
          t,
        });
      }

      return h(
        'div',
        { className: 'cmk-panel', role: 'region', 'aria-label': translate(t, 'title') },
        h(
          'div',
          { className: 'cmk-panelHead' },
          h(
            'div',
            { className: 'cmk-panelText' },
            h('div', { className: 'cmk-panelTitle' }, translate(t, 'title')),
            h('div', { className: 'cmk-panelSubtitle' }, translate(t, 'subtitle')),
          ),
          h(
            'div',
            { className: 'cmk-headSide' },
            typeof percent === 'number' ? h(Ring, { percent }) : null,
            typeof used === 'number'
              ? h(
                  'span',
                  { className: 'cmk-tagNum', style: { color: 'var(--dsw-alias-label-secondary, #555)' } },
                  typeof windowSize === 'number'
                    ? `~${formatTokens(used)} / ${formatTokens(windowSize)}`
                    : `~${formatTokens(used)}`,
                )
              : null,
          ),
        ),
        h('div', { className: 'cmk-panelBody' }, content),
      );
    }

    class TabBoundary extends React.Component {
      constructor(props) {
        super(props);
        this.state = { error: null };
      }
      static getDerivedStateFromError(error) {
        return { error };
      }
      componentDidCatch(error) {
        console.error('[context-mekko] panel crashed', error);
      }
      render() {
        if (this.state.error !== null) {
          return h(
            'div',
            { className: 'cmk-panel' },
            h(
              'div',
              { className: 'cmk-state cmk-panelBody' },
              h('span', null, 'Context panel crashed'),
              h(
                'pre',
                { className: 'cmk-pre', style: { maxWidth: '100%', textAlign: 'left' } },
                String(this.state.error?.stack ?? this.state.error),
              ),
            ),
          );
        }
        return this.props.children;
      }
    }

    function ContextTab(props) {
      return h(TabBoundary, null, h(ContextPanel, props));
    }

    function ContextTag({ sessionId, useProjection, openContext, t }) {
      const { pressure } = useChangeKey(useProjection);
      if (typeof sessionId !== 'string' || sessionId.length === 0) return null;
      const used = pressure?.projectedTokens ?? pressure?.pressureTokens;
      const windowSize = pressure?.contextWindow;
      const percent =
        typeof used === 'number' && typeof windowSize === 'number' && windowSize > 0
          ? Math.min(100, Math.round((used / windowSize) * 100))
          : undefined;
      return h(
        'button',
        {
          type: 'button',
          className: 'cmk-tag',
          'aria-label': translate(t, 'tagTitle'),
          title: translate(t, 'tagTitle'),
          onClick: () => {
            if (typeof openContext === 'function') openContext(sessionId);
          },
        },
        h('span', { className: 'cmk-tagGlyph' }, h(CategoryGlyph, { color: '#8b9bb4' })),
        h('span', null, translate(t, 'tag')),
        typeof percent === 'number' ? h('span', { className: 'cmk-tagNum' }, `${String(percent)}%`) : null,
      );
    }

    const inject = ['slots', 'locale', 'sidebarRight', 'sidebarRightTabs'];

    function apply(ctx) {
      const t = ctx.locale.bind(NS);
      ctx.effect(() => ctx.locale.register(NS, { en, zh }), 'context-mekko: dictionaries');
      ctx.effect(() => {
        const style = document.createElement('style');
        style.dataset.plugin = PACKAGE;
        style.textContent = CSS;
        document.head.appendChild(style);
        return () => style.remove();
      }, 'context-mekko: styles');
      ctx.effect(
        () =>
          ctx.sidebarRightTabs.register({
            id: TAB_ID,
            kind: TAB_KIND,
            priority: 'extension',
            title: () => t('tag'),
          }),
        'context-mekko: tab type',
      );
      ctx.effect(
        () =>
          ctx.slots.inject('sidebar.right.pane.tab', () =>
            ctx.slots.register(
              {
                name: 'sidebar.right.pane.tab',
                key: TAB_ID,
                locale: NS,
              },
              ContextTab,
            ),
          ),
        'context-mekko: tab body',
      );
      ctx.slots.inject('conversation.session.header.utilities', () =>
        ctx.slots.register(
          {
            name: 'conversation.session.header.utilities',
            id: 'context-mekko',
            order: 10,
            locale: NS,
            inject: () => ({
              openContext: (sessionId) => {
                ctx.sidebarRight.openTab(TAB_KIND, { params: { sessionId } });
              },
            }),
          },
          ContextTag,
        ),
      );
    }

    return { inject, apply };
  },
});
