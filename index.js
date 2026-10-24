/**
 * Host half of the Context Mekko plugin.
 *
 * The browser asks for the current model-visible surface of one session. This
 * module reconstructs that surface from the live Session (or from Session Query
 * for a cold session), prices every contribution with the same fixed heuristic
 * used by @deepseek-ai/dsh-token-meter, and returns a small category tree plus
 * a block id for every leaf. Full content is served only when a block is
 * opened, so the live payload stays small.
 *
 * The plugin adds no model-visible content and never mutates the session.
 */

const ROUTE = "/api/context-mekko";
const CONTENT_ROUTE = "/api/context-mekko/content";

const CHARS_PER_TOKEN = 4;
const BLOCK_OVERHEAD = 4;
const ROLE_OVERHEAD = 4;
const MAX_CONTENT_BYTES = 1_500_000;

const CATEGORY_ORDER = [
  "system",
  "tools",
  "skills",
  "runtime",
  "conversation",
  "toolResults",
  "injected",
];

const CATEGORY_LABELS = {
  system: "System & instructions",
  tools: "Tool definitions",
  skills: "Skill catalog",
  runtime: "Runtime & environment",
  conversation: "Conversation",
  toolResults: "Tool results",
  injected: "Injected & other",
};

/** @param {unknown} value */
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** @param {unknown[]} list */
function sum(list) {
  let total = 0;
  for (const value of list) total += value;
  return total;
}

/** @param {unknown[]} list */
function findLast(list, predicate) {
  for (let index = list.length - 1; index >= 0; index -= 1) {
    if (predicate(list[index])) return list[index];
  }
  return undefined;
}

/** @param {string} value @param {number} length */
function excerpt(value, length) {
  if (typeof value !== "string") return "";
  const collapsed = value.replace(/\s+/gu, " ").trim();
  return collapsed.length > length ? `${collapsed.slice(0, length - 1)}…` : collapsed;
}

/** @param {number} value */
function formatCount(value) {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

/**
 * Structural price of one block under the fixed heuristic. Image offload marks
 * do not change the reference price; provider route pricing owns visual tokens.
 * @param {Record<string, unknown>} block
 */
function estimateStructuralBlock(block) {
  if (block.type === "image") {
    const { offloaded: _offloaded, ...reference } = block;
    return BLOCK_OVERHEAD + Math.ceil(JSON.stringify(reference).length / CHARS_PER_TOKEN);
  }
  return BLOCK_OVERHEAD + Math.ceil(JSON.stringify(block).length / CHARS_PER_TOKEN);
}

/**
 * @param {Record<string, unknown>[]} blocks
 */
function estimateContent(blocks) {
  let tokens = 0;
  for (const block of blocks) {
    if (block.type === "text" || block.type === "reasoning") {
      tokens += Math.ceil(String(block.text ?? "").length / CHARS_PER_TOKEN) + BLOCK_OVERHEAD;
    } else if (block.type === "tool-call") {
      tokens +=
        Math.ceil(String(block.name ?? "").length / CHARS_PER_TOKEN) +
        Math.ceil(String(block.arguments ?? "").length / CHARS_PER_TOKEN) +
        BLOCK_OVERHEAD;
    } else {
      tokens += estimateStructuralBlock(block);
    }
  }
  return tokens;
}

/**
 * @param {{ role?: string, content?: Record<string, unknown>[] }} message
 */
function estimateMessage(message) {
  const content = Array.isArray(message.content) ? message.content : [];
  if (message.role === "system") {
    let characters = 0;
    for (const block of content) {
      characters +=
        block.type === "text" ? String(block.text ?? "").length : JSON.stringify(block).length;
    }
    return characters === 0 ? 0 : Math.ceil(characters / CHARS_PER_TOKEN) + ROLE_OVERHEAD;
  }
  return estimateContent(content) + ROLE_OVERHEAD;
}

/**
 * @param {{ tools?: Record<string, unknown>[] } | undefined} header
 */
function estimateToolsTokens(header) {
  const tools = header?.tools;
  if (!Array.isArray(tools) || tools.length === 0) return 0;
  return Math.ceil(JSON.stringify(tools).length / CHARS_PER_TOKEN) + BLOCK_OVERHEAD;
}

/**
 * Re-derive one message the way Session does for a cold snapshot. Live sessions
 * use their own SurfaceManager projection instead.
 * @param {Record<string, unknown>} event
 */
function deriveMessageFromEvent(event) {
  switch (event.type) {
    case "user/message":
      return event.data;
    case "system/message":
    case "developer/message":
    case "assistant/message": {
      const message = event.data?.message;
      return Array.isArray(message?.content) && message.content.length > 0 ? message : null;
    }
    case "tool/result":
      return event.data?.message ?? null;
    default:
      return null;
  }
}

/**
 * Allocate one category total over weighted leaves. The last leaf absorbs
 * rounding so the leaves always sum to the category total.
 * @param {number[]} weights
 * @param {number} total
 */
function allocate(weights, total) {
  if (weights.length === 0) return [];
  const weightSum = weights.reduce((left, right) => left + right, 0);
  const tokens = new Array(weights.length).fill(0);
  if (weightSum <= 0) {
    const each = Math.floor(total / weights.length);
    tokens.fill(each);
    tokens[tokens.length - 1] += total - each * weights.length;
    return tokens;
  }
  let assigned = 0;
  for (let index = 0; index < weights.length; index += 1) {
    if (index === weights.length - 1) {
      tokens[index] = Math.max(0, total - assigned);
    } else {
      const value = Math.round((weights[index] / weightSum) * total);
      tokens[index] = Math.max(0, value);
      assigned += tokens[index];
    }
  }
  return tokens;
}

/** @param {Record<string, unknown>} message */
function messageSourceKind(message) {
  const source = isObject(message.source) ? message.source : undefined;
  return typeof source?.kind === "string" ? source.kind : undefined;
}

/**
 * Compact metadata from one compaction summary event. The client uses `seq` as
 * a one-shot latch and `shadowedTokens` only for the accompanying copy, never
 * for Free geometry.
 * @param {Record<string, unknown> | undefined} event
 */
function compactionFromEvent(event) {
  if (event === undefined || event === null) return undefined;
  const data = isObject(event.data) ? event.data : {};
  const seq = Number(event.seq);
  if (!Number.isFinite(seq)) return undefined;
  return {
    seq,
    shadowedTokens: Number.isFinite(data.shadowedTokenCount)
      ? Math.max(0, Number(data.shadowedTokenCount))
      : undefined,
    summaryTokens:
      typeof data.summary === "string" ? Math.ceil(data.summary.length / CHARS_PER_TOKEN) : undefined,
    turn: Number.isFinite(data.turn) ? Number(data.turn) : undefined,
    model: typeof data.model === "string" ? data.model : undefined,
    provider: typeof data.provider === "string" ? data.provider : undefined,
  };
}

/**
 * Extract the loaded skill's name from a `skill` tool result. The result body
 * starts with a `<skill_content name="…">` envelope, so the tool name alone
 * would hide which skill was actually loaded.
 * @param {Record<string, unknown>} message
 */
function skillNameFromMessage(message) {
  const match = /<skill_content\b[^>]*\bname=["']([^"']+)["']/u.exec(messageText(message));
  return match?.[1];
}

/** @param {Record<string, unknown>} message */
function messageText(message) {
  const content = Array.isArray(message.content) ? message.content : [];
  const parts = [];
  for (const block of content) {
    if (block.type === "text" || block.type === "reasoning") parts.push(String(block.text ?? ""));
    else if (block.type === "tool-call") parts.push(`[tool-call] ${String(block.name ?? "")}`);
    else if (block.type === "image") parts.push("[image]");
    else parts.push(`[${String(block.type ?? "block")}]`);
  }
  return parts.join("\n");
}

/**
 * The model-visible surface of one session, plus the latest request envelope.
 * @param {any} ctx
 * @param {string} sessionId
 */
async function readSource(ctx, sessionId) {
  const sessions = ctx.get("sessions");
  const live = typeof sessions?.get === "function" ? sessions.get(sessionId) : undefined;
  if (live !== undefined && Array.isArray(live.log) && live.surface !== undefined) {
    const surface = [];
    const nodes = live.surface.nodes;
    for (const seq of nodes) {
      const event = live.log[seq];
      if (event === undefined) continue;
      let message = null;
      try {
        message = live.surface.deriveEventMessage(event);
      } catch {
        message = deriveMessageFromEvent(event);
      }
      if (message !== null && message !== undefined) surface.push({ event, message });
    }
    const headerEvent = findLast(live.log, (event) => event.type === "request/header");
    const contextEvent = findLast(live.log, (event) => event.type === "request/context");
    const compactionEvent = findLast(live.log, (event) => event.type === "compaction/summary");
    return {
      surface,
      header: headerEvent?.data?.header,
      contextWindow: contextEvent?.data?.contextWindow,
      compaction: compactionFromEvent(compactionEvent),
    };
  }

  const query = ctx.get("sessionQuery");
  if (typeof query?.readSurface !== "function") {
    throw new Error("session query is unavailable in this profile");
  }
  const captured = await query.readSurface(sessionId);
  const surface = [];
  for (const event of captured.events) {
    const message = deriveMessageFromEvent(event);
    if (message !== null) surface.push({ event, message });
  }
  let header;
  let contextWindow;
  let compaction;
  if (typeof query.listEvents === "function") {
    const records = await query.listEvents(sessionId);
    const headerSeq = findLast(records, (record) => record.type === "request/header")?.seq;
    const contextSeq = findLast(records, (record) => record.type === "request/context")?.seq;
    const compactionSeq = findLast(records, (record) => record.type === "compaction/summary")?.seq;
    if (headerSeq !== undefined && typeof query.readEvent === "function") {
      const record = await query.readEvent({ sessionId, seq: headerSeq, before: 0, after: 0 });
      header = record?.target?.data?.header;
    }
    if (contextSeq !== undefined && typeof query.readEvent === "function") {
      const record = await query.readEvent({ sessionId, seq: contextSeq, before: 0, after: 0 });
      contextWindow = record?.target?.data?.contextWindow;
    }
    if (compactionSeq !== undefined && typeof query.readEvent === "function") {
      const record = await query.readEvent({ sessionId, seq: compactionSeq, before: 0, after: 0 });
      compaction = compactionFromEvent(record?.target);
    }
  }
  return { surface, header, contextWindow, compaction };
}

/**
 * Classify one message into a category and a leaf kind.
 * @param {Record<string, unknown>} event
 * @param {Record<string, unknown>} message
 */
function classify(event, message) {
  const kind = messageSourceKind(message);
  if (event.type === "system/message") {
    return { category: "system", kind: "system" };
  }
  if (event.type === "developer/message") {
    return { category: "system", kind: "developer" };
  }
  if (event.type === "tool/result") {
    return { category: "toolResults", kind: "tool-result" };
  }
  if (event.type === "assistant/message") {
    return { category: "conversation", kind: "assistant" };
  }
  if (event.type === "user/message") {
    switch (kind) {
      case "runtime-context":
        return { category: "runtime", kind: "sections" };
      case "time-context":
        return { category: "runtime", kind: "sections" };
      case "skill-catalog":
        return { category: "skills", kind: "catalog" };
      case "agent-instructions":
        return { category: "system", kind: "instructions" };
      case "user":
        return { category: "conversation", kind: "user" };
      default:
        return { category: "injected", kind: "injected" };
    }
  }
  return { category: "injected", kind: "other" };
}

/** @param {Record<string, unknown>[]} surface */
function toolCallNames(surface) {
  const names = new Map();
  for (const { message } of surface) {
    const content = Array.isArray(message?.content) ? message.content : [];
    for (const block of content) {
      if (block?.type === "tool-call" && typeof block.id === "string") {
        names.set(block.id, typeof block.name === "string" ? block.name : "tool");
      }
    }
  }
  return names;
}

/**
 * @param {Record<string, unknown>[]} surface
 * @param {string} callId
 */
function findToolNameByCallId(surface, callId) {
  if (callId.length === 0) return undefined;
  for (const { message } of surface) {
    const content = Array.isArray(message?.content) ? message.content : [];
    for (const block of content) {
      if (block?.type === "tool-call" && block.id === callId) {
        return typeof block.name === "string" ? block.name : undefined;
      }
    }
  }
  return undefined;
}

/**
 * Split a merged workspace-instructions injection into one section per
 * `Instructions from: <path>` header. The body remains model-facing text.
 * @param {string} text
 */
function splitInstructionFiles(text) {
  const source = String(text ?? '');
  const matches = [...source.matchAll(/^\s*Instructions from:\s*(.+?)\s*$/gmu)];
  if (matches.length === 0) return [{ label: 'Workspace instructions', body: source.trim() }];
  return matches.map((match, index) => {
    const next = matches[index + 1];
    const body = source.slice(match.index + match[0].length, next?.index ?? source.length)
      .replace(/<\/system-reminder>\s*$/u, '')
      .trim();
    return { label: match[1].trim(), body };
  });
}

/**
 * Human-readable label for one leaf, before localization.
 * @param {ReturnType<typeof classify>} classification
 * @param {Record<string, unknown>} event
 * @param {Record<string, unknown>} message
 * @param {Map<string, string>} toolNames
 */
function leafLabel(classification, event, message, toolNames) {
  switch (classification.kind) {
    case "system":
      return "System prompt";
    case "developer":
      return "Tool context";
    case "instructions":
      return "Workspace instructions";
    case "user":
      return "User message";
    case "assistant":
      return typeof event.data?.step === "number"
        ? `Assistant · step ${String(event.data.step)}`
        : "Assistant message";
    case "tool-result": {
      const toolName = toolNames.get(String(message.toolCallId ?? "")) ?? "tool result";
      if (toolName === "skill") {
        const skillName = skillNameFromMessage(message);
        if (skillName !== undefined) return skillName;
      }
      return `Tool result · ${toolName}`;
    }
    case "sections":
      return "Runtime context";
    case "catalog":
      return "Skill catalog";
    default: {
      const kind = messageSourceKind(message);
      return kind === undefined ? "Injected context" : `Injected · ${kind}`;
    }
  }
}

/**
 * Build the category tree for one surface.
 * @param {{ surface: { event: any, message: any }[], header?: any, contextWindow?: number }} source
 */
export function buildBreakdown(source) {
  const { surface, header, contextWindow } = source;
  const toolNames = toolCallNames(surface);
  const categories = new Map(
    CATEGORY_ORDER.map((key) => [key, { key, label: CATEGORY_LABELS[key], tokens: 0, children: [] }]),
  );
  let messageTokens = 0;
  let asOfSeq = null;

  for (const { event, message } of surface) {
    if (message === null || message === undefined) continue;
    const tokens = estimateMessage(message);
    messageTokens += tokens;
    if (typeof event.seq === "number") asOfSeq = event.seq;
    if (tokens === 0) continue;
    const classification = classify(event, message);
    const category = categories.get(classification.category);
    if (category === undefined) continue;
    const seq = Number(event.seq);
    const source = isObject(message.source) ? message.source : undefined;

    if (classification.kind === "sections") {
      const sections = Array.isArray(source?.sections) ? source.sections : [];
      if (sections.length === 0) {
        category.children.push({
          id: `msg:${String(seq)}`,
          label: leafLabel(classification, event, message, toolNames),
          tokens,
          kind: "text",
          preview: excerpt(messageText(message), 96),
          contentId: `msg:${String(seq)}`,
          group: "context",
          seq,
        });
      } else {
        const texts = sections.map((section) => String(section?.text ?? ""));
        const prices = allocate(
          texts.map((text) => text.length),
          tokens,
        );
        sections.forEach((section, index) => {
          const name = String(section?.name ?? `section-${String(index + 1)}`);
          category.children.push({
            id: `section:${String(seq)}:${name}`,
            label: name,
            tokens: prices[index] ?? 0,
            kind: "text",
            preview: excerpt(texts[index], 96),
            contentId: `section:${String(seq)}:${name}`,
            group: "context",
            seq,
          });
        });
      }
      category.tokens += tokens;
      continue;
    }

    if (classification.kind === "instructions") {
      const files = splitInstructionFiles(messageText(message));
      if (files.length > 1) {
        const prices = allocate(
          files.map((file) => file.body.length),
          tokens,
        );
        files.forEach((file, index) => {
          category.children.push({
            id: `instr:${String(seq)}:${String(index)}`,
            label: file.label,
            tokens: prices[index] ?? 0,
            kind: "text",
            preview: excerpt(file.body, 96),
            contentId: `instr:${String(seq)}:${String(index)}`,
            group: "instructions",
            seq,
          });
        });
        category.tokens += tokens;
        continue;
      }
    }

    if (classification.kind === "catalog") {
      const entries = Array.isArray(source?.entries) ? source.entries : [];
      if (entries.length === 0) {
        category.children.push({
          id: `msg:${String(seq)}`,
          label: "Skill catalog",
          tokens,
          kind: "json",
          preview: excerpt(messageText(message), 96),
          contentId: `msg:${String(seq)}`,
          group: "context",
          seq,
        });
      } else {
        const names = entries.map((entry) => String(entry?.name ?? "skill"));
        const weights = entries.map(
          (entry) => String(entry?.name ?? "").length + String(entry?.description ?? "").length,
        );
        const prices = allocate(weights, tokens);
        entries.forEach((entry, index) => {
          category.children.push({
            id: `skill:${String(seq)}:${names[index]}`,
            label: names[index],
            tokens: prices[index] ?? 0,
            kind: "json",
            preview: excerpt(String(entry?.description ?? ""), 96),
            contentId: `skill:${String(seq)}:${names[index]}`,
            group: "skill",
            seq,
          });
        });
      }
      category.tokens += tokens;
      continue;
    }

    category.children.push({
      id: `msg:${String(seq)}`,
      label: leafLabel(classification, event, message, toolNames),
      tokens,
      kind: classification.category === "toolResults" ? "text" : "text",
      preview: excerpt(messageText(message), 96),
      contentId: `msg:${String(seq)}`,
      group:
        classification.category === "toolResults"
          ? (toolNames.get(String(message.toolCallId ?? "")) ?? "tool")
          : classification.category === "injected"
            ? (messageSourceKind(message) ?? classification.kind)
            : classification.kind,
      seq,
    });
    category.tokens += tokens;
  }

  const toolTokens = estimateToolsTokens(header);
  if (toolTokens > 0) {
    const tools = Array.isArray(header?.tools) ? header.tools : [];
    const weights = tools.map((tool) => JSON.stringify(tool).length);
    const prices = allocate(weights, toolTokens);
    const toolCategory = categories.get("tools");
    tools.forEach((tool, index) => {
      const name = String(tool?.name ?? `tool-${String(index + 1)}`);
      toolCategory.children.push({
        id: `tool:${name}`,
        label: name,
        tokens: prices[index] ?? 0,
        kind: "json",
        preview: excerpt(String(tool?.description ?? ""), 96),
        contentId: `tool:${name}`,
        group: "tool",
      });
    });
    toolCategory.tokens = toolTokens;
  }

  const populated = [];
  for (const key of CATEGORY_ORDER) {
    const category = categories.get(key);
    if (category.tokens <= 0) continue;
    const childrenTotal = sum(category.children.map((child) => child.tokens));
    if (category.children.length > 0 && childrenTotal !== category.tokens) {
      const last = category.children[category.children.length - 1];
      last.tokens = Math.max(0, last.tokens + category.tokens - childrenTotal);
    }
    populated.push(category);
  }
  const totalTokens = sum(populated.map((category) => category.tokens));

  return {
    version: 1,
    asOfSeq,
    contextWindow: typeof contextWindow === "number" ? contextWindow : undefined,
    totalTokens,
    messageTokens,
    toolTokens,
    compaction: source.compaction,
    categories: populated.map((category) => ({
      ...category,
      share: totalTokens === 0 ? 0 : category.tokens / totalTokens,
      count: category.children.length,
    })),
  };
}

/**
 * Render one message as a plain-text body for the content drawer.
 * @param {Record<string, unknown>} event
 * @param {Record<string, unknown>} message
 */
function renderMessageBody(event, message) {
  const content = Array.isArray(message.content) ? message.content : [];
  const lines = [];
  for (const block of content) {
    switch (block?.type) {
      case "text":
        lines.push(String(block.text ?? ""));
        break;
      case "reasoning":
        lines.push("[reasoning]");
        lines.push(String(block.text ?? ""));
        break;
      case "tool-call":
        lines.push(`[tool-call] ${String(block.name ?? "")}`);
        lines.push(String(block.arguments ?? ""));
        break;
      case "image": {
        const name = block.source?.name ?? block.attachmentId ?? "image";
        lines.push(`[image] ${String(name)}`);
        break;
      }
      case "file": {
        const name = block.source?.name ?? block.path ?? block.attachmentId ?? "file";
        lines.push(`[file] ${String(name)}`);
        break;
      }
      default:
        lines.push(`[${String(block?.type ?? "block")}] ${JSON.stringify(block)}`);
        break;
    }
  }
  if (lines.length === 0) {
    lines.push(`[${String(event.type)}] ${JSON.stringify(event.data)}`);
  }
  return lines.join("\n");
}

/**
 * Resolve one content block id for the drawer.
 * @param {{ surface: { event: any, message: any }[], header?: any }} source
 * @param {string} blockId
 */
export function buildContent(source, blockId) {
  const { surface, header } = source;
  const colon = blockId.indexOf(":");
  const prefix = colon === -1 ? blockId : blockId.slice(0, colon);
  const rest = colon === -1 ? "" : blockId.slice(colon + 1);

  if (prefix === "msg") {
    const seq = Number(rest);
    const found = surface.find((entry) => Number(entry.event.seq) === seq);
    if (found === undefined) return undefined;
    const { event, message } = found;
    const body = renderMessageBody(event, message);
    const tokens = estimateMessage(message);
    const sourceKind = messageSourceKind(message);
    const toolName =
      message.role === "tool"
        ? findToolNameByCallId(surface, String(message.toolCallId ?? ""))
        : undefined;
    const skillName = toolName === "skill" ? skillNameFromMessage(message) : undefined;
    let title;
    if (message.role === "tool") {
      title = skillName ?? (toolName === undefined ? "Tool result" : `Tool result · ${toolName}`);
    } else if (message.role === "assistant") title = "Assistant message";
    else if (message.role === "system") title = "System prompt";
    else if (sourceKind === "runtime-context") title = "Runtime context";
    else if (sourceKind === "time-context") title = "Time context";
    else if (sourceKind === "skill-catalog") title = "Skill catalog";
    else if (sourceKind === "agent-instructions") title = "Workspace instructions";
    else if (sourceKind === "tool-jobs") title = "Tool job notice";
    else title = "Message";
    return {
      id: blockId,
      title,
      subtitle: `${String(event.type)} · seq ${String(event.seq)}${toolName === undefined ? "" : ` · ${toolName}`}`,
      kind: "text",
      body,
      meta: {
        role: message.role,
        eventType: event.type,
        seq: event.seq,
        tokens,
        sourceKind: messageSourceKind(message) ?? null,
      },
    };
  }

  if (prefix === "instr") {
    const [seqText, indexText] = rest.split(":");
    const seq = Number(seqText);
    const index = Number(indexText);
    const found = surface.find((entry) => Number(entry.event.seq) === seq);
    if (found === undefined) return undefined;
    const files = splitInstructionFiles(messageText(found.message));
    const file = files[index];
    if (file === undefined) return undefined;
    return {
      id: blockId,
      title: file.label,
      subtitle: `user/message · seq ${String(seq)} · workspace instructions`,
      kind: "text",
      body: file.body,
      meta: {
        role: "user",
        eventType: "user/message",
        seq,
        tokens: estimateMessage(found.message),
        sourceKind: "agent-instructions",
      },
    };
  }

  if (prefix === "tool") {
    const name = rest;
    const tools = Array.isArray(header?.tools) ? header.tools : [];
    const tool = tools.find((candidate) => String(candidate?.name ?? "") === name);
    if (tool === undefined) return undefined;
    return {
      id: blockId,
      title: name,
      subtitle: "Tool definition",
      kind: "json",
      body: JSON.stringify(tool, null, 2),
      meta: { tokens: Math.ceil(JSON.stringify(tool).length / CHARS_PER_TOKEN) },
    };
  }

  if (prefix === "skill" || prefix === "section") {
    const next = rest.indexOf(":");
    const seq = Number(next === -1 ? rest : rest.slice(0, next));
    const name = next === -1 ? "" : rest.slice(next + 1);
    const found = surface.find((entry) => Number(entry.event.seq) === seq);
    if (found === undefined) return undefined;
    const sourceData = isObject(found.message.source) ? found.message.source : undefined;
    if (prefix === "skill") {
      const entries = Array.isArray(sourceData?.entries) ? sourceData.entries : [];
      const entry = entries.find((candidate) => String(candidate?.name ?? "") === name);
      if (entry === undefined) return undefined;
      return {
        id: blockId,
        title: name,
        subtitle: "Skill catalog entry",
        kind: "json",
        body: JSON.stringify(entry, null, 2),
        meta: { seq, tokens: Math.ceil(JSON.stringify(entry).length / CHARS_PER_TOKEN) },
      };
    }
    const sections = Array.isArray(sourceData?.sections) ? sourceData.sections : [];
    const section = sections.find((candidate) => String(candidate?.name ?? "") === name);
    if (section === undefined) return undefined;
    return {
      id: blockId,
      title: name,
      subtitle: "Runtime context section",
      kind: "text",
      body: String(section.text ?? ""),
      meta: { seq, tokens: Math.ceil(String(section.text ?? "").length / CHARS_PER_TOKEN) },
    };
  }

  return undefined;
}

/** @param {unknown} value @param {number} status */
function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/** @param {string} message @param {number} status */
function textResponse(message, status) {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}

/**
 * @param {any} ctx
 * @param {Request} request
 * @param {boolean} wantsContent
 */
async function serve(ctx, request, wantsContent) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  if (sessionId === null || sessionId.length === 0) {
    return textResponse("missing sessionId query parameter", 400);
  }
  try {
    const source = await readSource(ctx, sessionId);
    if (!wantsContent) return jsonResponse(buildBreakdown(source));
    const blockId = url.searchParams.get("blockId");
    if (blockId === null || blockId.length === 0) {
      return textResponse("missing blockId query parameter", 400);
    }
    const content = buildContent(source, blockId);
    if (content === undefined) return textResponse("context block not found", 404);
    if (typeof content.body === "string" && content.body.length > MAX_CONTENT_BYTES) {
      content.body = content.body.slice(0, MAX_CONTENT_BYTES);
      content.meta = { ...content.meta, truncated: true };
    }
    return jsonResponse(content);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return textResponse(`context mekko failed: ${message}`, 500);
  }
}

export const inject = ["connection"];

/** @param {any} ctx */
export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: ROUTE,
        methods: ["GET"],
        requestBody: "buffered",
        fetch: (request) => serve(ctx, request, false),
      }),
    "context-mekko: breakdown route",
  );
  ctx.effect(
    () =>
      ctx.connection.fetch.register({
        path: CONTENT_ROUTE,
        methods: ["GET"],
        requestBody: "buffered",
        fetch: (request) => serve(ctx, request, true),
      }),
    "context-mekko: content route",
  );
}

// Exported for local verification and future tests.
export { estimateMessage, estimateToolsTokens, deriveMessageFromEvent };
