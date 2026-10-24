window.__ModuleLoader__.load({
  id: 'dsh-context-mekko',
  factory(require) {
    const React = require('react');

    const h = React.createElement;
    const { Fragment, useCallback, useEffect, useMemo, useRef, useState } = React;

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
      approx: '构成按 Harness 的 token 启发式估算；占用按 Provider 报告。',
      used: '已用',
      of: '/',
      tokens: 'tokens',
      estimated: '估算',
      search: '搜索这个分类…',
      other: '其他',
      topContributors: '占用排行',
      items: '{count} 项',
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
      approx: 'Composition uses the harness token heuristic; occupancy uses provider-reported pressure.',
      used: 'used',
      of: 'of',
      tokens: 'tokens',
      estimated: 'estimated',
      search: 'Filter this category…',
      other: 'Other',
      topContributors: 'Largest contributions',
      items: '{count} items',
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
.cmk-foot{flex:none;padding:9px 16px 11px;border-top:1px solid var(--dsw-alias-border-l3,rgba(128,128,128,.16));color:var(--dsw-alias-label-tertiary,#888);font-size:11px;line-height:16px}
.cmk-chart{position:relative;isolation:isolate;display:flex;gap:4px;height:184px;width:100%;align-items:stretch;padding:5px;border-radius:18px;overflow:hidden;background:linear-gradient(145deg,color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 36%,transparent),color-mix(in srgb,var(--dsw-alias-bg-base,#fff) 12%,transparent)),rgba(128,128,128,.045);border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.16),inset 0 -1px 0 rgba(0,0,0,.08),0 12px 30px rgba(0,0,0,.12);backdrop-filter:blur(22px) saturate(150%);-webkit-backdrop-filter:blur(22px) saturate(150%)}
.cmk-chart::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:linear-gradient(120deg,rgba(255,255,255,.12),transparent 28%,transparent 68%,rgba(255,255,255,.045))}
.cmk-col{position:relative;z-index:1;display:flex;flex-direction:column;gap:4px;min-width:3px;overflow:visible;border-radius:11px;background:transparent;transition:flex-grow .48s cubic-bezier(.22,1,.36,1)}
.cmk-cell{--cmk-cell-color:#8a8f98;flex:1 1 0;min-height:2px;padding:0;margin:0;border:1px solid color-mix(in srgb,var(--cmk-cell-color) 30%,rgba(255,255,255,.26));border-radius:10px;cursor:pointer;position:relative;overflow:hidden;isolation:isolate;background:linear-gradient(135deg,color-mix(in srgb,var(--cmk-cell-color) 68%,rgba(255,255,255,.18)) 0%,color-mix(in srgb,var(--cmk-cell-color) 46%,transparent) 52%,color-mix(in srgb,var(--cmk-cell-color) 58%,transparent) 100%);backdrop-filter:blur(14px) saturate(170%);-webkit-backdrop-filter:blur(14px) saturate(170%);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(0,0,0,.10),0 3px 10px rgba(0,0,0,.10);transition:flex-grow .48s cubic-bezier(.22,1,.36,1),transform .18s ease,filter .18s ease,box-shadow .18s ease,opacity .18s ease}
.cmk-cell::before{content:"";position:absolute;inset:0;z-index:0;border-radius:inherit;pointer-events:none;background:linear-gradient(112deg,rgba(255,255,255,.38) 0%,rgba(255,255,255,.09) 22%,transparent 46%,rgba(255,255,255,.04) 72%,rgba(255,255,255,.14) 100%);opacity:.72;mix-blend-mode:screen}
.cmk-cell::after{content:"";position:absolute;left:7%;right:16%;top:0;height:46%;border-radius:0 0 50% 50%;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.22),transparent);filter:blur(2px);opacity:.55}
.cmk-cell:hover{filter:brightness(1.10) saturate(1.12);transform:translateY(-1px);outline:1px solid rgba(255,255,255,.38);outline-offset:-1px;z-index:2;box-shadow:inset 0 1px 0 rgba(255,255,255,.40),inset 0 -1px 0 rgba(0,0,0,.10),0 6px 16px color-mix(in srgb,var(--cmk-cell-color) 24%,rgba(0,0,0,.16))}
.cmk-cell:active{transform:translateY(0) scale(.995)}
.cmk-cell:focus-visible{outline:2px solid var(--dsw-focus-ring-color,#4c8bf5);outline-offset:-2px;z-index:3}
.cmk-cellOther{opacity:.76;background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.16) 0 5px,transparent 5px 11px),linear-gradient(135deg,color-mix(in srgb,var(--cmk-cell-color) 58%,rgba(255,255,255,.16)) 0%,color-mix(in srgb,var(--cmk-cell-color) 38%,transparent) 100%)}
@media (prefers-reduced-motion:reduce){.cmk-col,.cmk-cell{transition:none}.cmk-cell:hover{transform:none}}
@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){.cmk-chart{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.10))}.cmk-cell{background:color-mix(in srgb,var(--cmk-cell-color) 72%,var(--dsw-alias-bg-base,#fff))}}
.cmk-legend{display:flex;flex-direction:column;gap:1px;margin-top:14px}
.cmk-legendRow{display:flex;align-items:center;gap:8px;width:100%;padding:6px 6px;border:0;border-radius:7px;background:transparent;color:inherit;font:inherit;text-align:left;cursor:pointer}
.cmk-legendRow:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.08))}
.cmk-legendRow:focus-visible{outline:var(--dsw-focus-ring-width,2px) solid var(--dsw-focus-ring-color,#4c8bf5);outline-offset:-1px}
.cmk-swatch{width:10px;height:10px;border-radius:3px;flex:none}
.cmk-legendName{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--dsw-alias-label-secondary,#555)}
.cmk-legendNum{flex:none;color:var(--dsw-alias-label-tertiary,#888);font-variant-numeric:tabular-nums;font-size:12px}
.cmk-totals{display:flex;align-items:baseline;gap:6px;margin-top:12px;color:var(--dsw-alias-label-tertiary,#888);font-size:12px}
.cmk-sectionTitle{margin:16px 0 4px;color:var(--dsw-alias-label-secondary,#555);font-size:12px;font-weight:600;line-height:18px}
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
@media (max-width:640px){.cmk-chart{height:140px}}
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

    function pickLeaves(category) {
      const sorted = [...category.children].sort((left, right) => right.tokens - left.tokens);
      const limit = 8;
      if (sorted.length <= limit) return sorted;
      const head = sorted.slice(0, limit - 1);
      const rest = sorted.slice(limit - 1);
      const tokens = rest.reduce((total, child) => total + child.tokens, 0);
      return [
        ...head,
        {
          id: `${category.key}:other`,
          label: 'other',
          tokens,
          other: true,
          count: rest.length,
        },
      ];
    }

    function Mekko({ categories, onSelectCategory, onOpenBlock, t }) {
      const total = categories.reduce((sum, category) => sum + category.tokens, 0);
      if (total <= 0) return h('div', { className: 'cmk-empty' }, '—');
      return h(
        'div',
        { className: 'cmk-chart' },
        categories.map((category) => {
          const color = CATEGORY_COLORS[category.key] ?? '#8a8f98';
          const leaves = pickLeaves(category);
          return h(
            'div',
            {
              key: category.key,
              className: 'cmk-col',
              style: { flexGrow: Math.max(category.tokens, 1), flexBasis: 0, minWidth: 3 },
              title: `${translate(t, `category.${category.key}`)} · ${formatTokens(category.tokens)}`,
            },
            leaves.map((leaf, index) =>
              h('button', {
                key: leaf.id,
                type: 'button',
                className: leaf.other ? 'cmk-cell cmk-cellOther' : 'cmk-cell',
                style: {
                  flexGrow: Math.max(leaf.tokens, 1),
                  flexBasis: 0,
                  '--cmk-cell-color': leaf.other ? color : shade(color, index),
                },
                title: leaf.other
                  ? translate(t, 'detail.other', { count: leaf.count })
                  : `${leaf.label} · ${formatTokens(leaf.tokens)} tokens`,
                'aria-label': leaf.other
                  ? translate(t, 'detail.other', { count: leaf.count })
                  : `${leaf.label}, ${formatTokens(leaf.tokens)} tokens`,
                onClick: () => {
                  if (leaf.other) onSelectCategory(category.key);
                  else onOpenBlock(leaf, category);
                },
              }),
            ),
          );
        }),
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

    function Overview({ data, onSelectCategory, onOpenBlock, t }) {
      const categories = [...data.categories].sort(
        (left, right) => CATEGORY_ORDER.indexOf(left.key) - CATEGORY_ORDER.indexOf(right.key),
      );
      if (data.totalTokens <= 0) {
        return h('div', { className: 'cmk-empty' }, translate(t, 'empty'));
      }
      return h(
        'div',
        null,
        h('div', { className: 'cmk-totals' },
          h('span', null, h('b', null, formatTokens(data.totalTokens))),
          h('span', null, translate(t, 'tokens')),
          h('span', null, '·'),
          h('span', null, translate(t, 'estimated')),
        ),
        h(Mekko, { categories, onSelectCategory, onOpenBlock, t }),
        h(Legend, { categories, total: data.totalTokens, onSelectCategory, t }),
        (() => {
          const top = categories
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

    function CategoryDetail({ category, data, onBack, onOpenBlock, t }) {
      const [query, setQuery] = useState('');
      const total = category.tokens;
      const children = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const sorted = [...category.children].sort((left, right) => right.tokens - left.tokens);
        if (needle.length === 0) return sorted;
        return sorted.filter(
          (child) =>
            child.label.toLowerCase().includes(needle) ||
            String(child.preview ?? '').toLowerCase().includes(needle),
        );
      }, [category, query]);
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
          h(
            'div',
            { style: { flex: 1, minWidth: 0 } },
            h('div', { className: 'cmk-detailTitle' }, translate(t, `category.${category.key}`)),
            h(
              'div',
              { className: 'cmk-detailMeta' },
              `${formatTokens(category.tokens)} · ${formatPercent(
                data.totalTokens === 0 ? 0 : category.tokens / data.totalTokens,
              )}`,
            ),
          ),
          h('span', { className: 'cmk-swatch', style: { backgroundColor: CATEGORY_COLORS[category.key] } }),
        ),
        category.children.length > 10
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
          children.map((child) => {
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
                style: {
                  backgroundColor: shade(CATEGORY_COLORS[category.key] ?? '#8a8f98', children.indexOf(child)),
                },
              }),
              h(
                'span',
                { className: 'cmk-rowText' },
                h('span', { className: 'cmk-rowLabel' }, child.label),
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
                    backgroundColor: CATEGORY_COLORS[category.key] ?? '#8a8f98',
                  },
                }),
              ),
              h('span', { className: 'cmk-rowNum' }, formatTokens(child.tokens)),
            );
          }),
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
            h('div', { className: 'cmk-contentTitle' }, content.title ?? blockId),
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
          onBack: () => setView({ kind: 'overview' }),
          onOpenBlock: (block) => openBlock(block, category),
          t,
        });
      } else {
        content = h(Overview, {
          data,
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
        h('div', { className: 'cmk-foot' }, translate(t, 'approx')),
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
