/**
 * Canonical registered MCP tool names — must match `@designproof/schema` MCP_TOOL_NAMES.
 * Drift test reads this file / the live server registration.
 */
export const REGISTERED_MCP_TOOLS = [
  "designproof_capture",
  "designproof_diagnose",
  "designproof_redesign",
  "designproof_apply",
  "designproof_capture_matrix",
  "designproof_proof_verify",
  "designproof_proof_revert",
  "designproof_design_from_features",
  "designproof_voice",
  "designproof_install_info",
  "designproof_resolve_intent",
] as const;

export type RegisteredMcpTool = (typeof REGISTERED_MCP_TOOLS)[number];
