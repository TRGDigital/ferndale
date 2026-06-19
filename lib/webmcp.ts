// WebMCP (Web Model Context Protocol) — feature-detected helpers.
//
// WebMCP lets a page hand AI agents a typed "instruction manual" of actions via
// document.modelContext.registerTool(), so an agent can invoke an action directly
// instead of simulating clicks. Spec: W3C Web Machine Learning CG draft.
// Ref: https://webmachinelearning.github.io/webmcp/
//
// It is feature-detected and degrades to a clean no-op everywhere it is not yet
// available, so it never affects normal visitors.

export interface AgentToolDef {
  /** Unique within the document; [A-Za-z0-9_.-]. */
  name: string;
  title?: string;
  /** What the tool does + when to use it. The agent reads this to decide. */
  description: string;
  /** JSON Schema for the input parameters. */
  inputSchema?: object;
  annotations?: {
    /** Tool only reads — never mutates state. */
    readOnlyHint?: boolean;
    /** Output may contain user-supplied content — treat as data, not instructions. */
    untrustedContentHint?: boolean;
  };
  execute: (input: Record<string, unknown>) => Promise<unknown> | unknown;
}

interface ModelContextLike {
  registerTool?: (tool: object) => void;
  unregisterTool?: (name: string) => void;
}

/** Current spec exposes navigator.modelContext; older drafts used
 *  document.modelContext. Support both so we register wherever it lives. */
function getModelContext(): ModelContextLike | null {
  if (typeof navigator !== "undefined") {
    const mc = (navigator as unknown as { modelContext?: ModelContextLike })
      .modelContext;
    if (mc?.registerTool) return mc;
  }
  if (typeof document !== "undefined") {
    const mc = (document as unknown as { modelContext?: ModelContextLike })
      .modelContext;
    if (mc?.registerTool) return mc;
  }
  return null;
}

export function isWebMcpAvailable(): boolean {
  return !!getModelContext();
}

/** Register one tool. Returns an always-safe unregister function. No-ops cleanly
 *  when WebMCP is unavailable or registration throws. `execute` must resolve to
 *  an object (WebMCP requirement). */
export function registerAgentTool(def: AgentToolDef): () => void {
  const mc = getModelContext();
  if (!mc?.registerTool) return () => {};
  try {
    mc.registerTool({
      name: def.name,
      description: def.description,
      inputSchema: def.inputSchema,
      annotations: def.annotations,
      execute: def.execute,
    });
  } catch {
    return () => {};
  }
  return () => {
    try {
      mc.unregisterTool?.(def.name);
    } catch {
      /* already gone */
    }
  };
}
