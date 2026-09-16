import { supabase, supabaseConfigured } from "./supabase";

export type Memory = {
  id: string;
  memory: string;
  created_at: string;
  categories?: string[];
  metadata?: Record<string, unknown>;
};

export const memoryConfigured = supabaseConfigured && process.env.NEXT_PUBLIC_MEM0_ENABLED === "true";

const NOT_CONFIGURED = "Memory is not configured.";

type Mem0Body =
  | { action: "add"; messages: { role: string; content: string }[]; metadata?: Record<string, unknown> }
  | { action: "search"; query: string; limit?: number }
  | { action: "list" }
  | { action: "delete_all" };

async function invoke(body: Mem0Body): Promise<{ data: unknown; error: string | null }> {
  if (!memoryConfigured || !supabase) return { data: null, error: NOT_CONFIGURED };
  const { data, error } = await supabase.functions.invoke("mem0", { body });
  if (error) return { data: null, error: error.message };
  if (data && typeof data === "object" && "error" in data && (data as { error?: unknown }).error) {
    return { data: null, error: String((data as { error: unknown }).error) };
  }
  return { data, error: null };
}

function toMemories(data: unknown): Memory[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)
      ? (data as { results: unknown[] }).results
      : [];
  return list
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({
      id: String(item.id ?? ""),
      memory: String(item.memory ?? ""),
      created_at: String(item.created_at ?? ""),
      categories: Array.isArray(item.categories) ? (item.categories as string[]) : undefined,
      metadata: item.metadata && typeof item.metadata === "object" ? (item.metadata as Record<string, unknown>) : undefined
    }))
    .filter((memory) => memory.id && memory.memory);
}

export async function addMemory(
  messages: { role: "user" | "assistant"; content: string }[],
  metadata?: Record<string, unknown>
): Promise<{ error: string | null }> {
  const { error } = await invoke({ action: "add", messages, metadata });
  return { error };
}

export async function searchMemories(query: string, limit?: number): Promise<{ memories: Memory[]; error: string | null }> {
  const { data, error } = await invoke({ action: "search", query, limit });
  return { memories: error ? [] : toMemories(data), error };
}

export async function listMemories(): Promise<{ memories: Memory[]; error: string | null }> {
  const { data, error } = await invoke({ action: "list" });
  return { memories: error ? [] : toMemories(data), error };
}

export async function deleteAllMemories(): Promise<{ error: string | null }> {
  const { error } = await invoke({ action: "delete_all" });
  return { error };
}
