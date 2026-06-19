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
  registerTool: (tool: object, options?: { signal?: AbortSignal }) => void;
}

export function isWebMcpAvailable(): boolean {
  return (
    typeof document !== "undefined" &&
    "modelContext" in document &&
    !!(document as unknown as { modelContext?: ModelContextLike }).modelContext
  );
}

/** Register one tool. Returns an always-safe unregister function. No-ops cleanly
 *  when WebMCP is unavailable or registration throws. */
export function registerAgentTool(def: AgentToolDef): () => void {
  if (!isWebMcpAvailable()) return () => {};
  const mc = (document as unknown as { modelContext: ModelContextLike })
    .modelContext;
  const controller = new AbortController();
  try {
    mc.registerTool({ ...def }, { signal: controller.signal });
  } catch {
    return () => {};
  }
  return () => {
    try {
      controller.abort();
    } catch {
      /* already gone */
    }
  };
}
