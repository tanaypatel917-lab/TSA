import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info"
};

const MEM0_BASE = "https://api.mem0.ai";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const mem0Key = Deno.env.get("MEM0_API_KEY");
  if (!mem0Key) {
    return json({ error: "MEM0_API_KEY is not configured" }, 500);
  }

  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return json({ error: "Missing Authorization header" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authorization } } }
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return json({ error: "Unauthorized" }, 401);
  }
  const userId = user.id;

  let body: {
    action?: string;
    messages?: { role: string; content: string }[];
    metadata?: Record<string, unknown>;
    query?: string;
    limit?: number;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const mem0Headers = {
    Authorization: `Token ${mem0Key}`,
    "Content-Type": "application/json"
  };

  let upstream: Response;
  switch (body.action) {
    case "add":
      upstream = await fetch(`${MEM0_BASE}/v3/memories/add/`, {
        method: "POST",
        headers: mem0Headers,
        body: JSON.stringify({
          messages: body.messages ?? [],
          user_id: userId,
          metadata: body.metadata ?? {},
          infer: true
        })
      });
      break;
    case "search":
      upstream = await fetch(`${MEM0_BASE}/v3/memories/search/`, {
        method: "POST",
        headers: mem0Headers,
        body: JSON.stringify({
          query: body.query ?? "",
          filters: { user_id: userId },
          top_k: body.limit ?? 10
        })
      });
      break;
    case "list":
      upstream = await fetch(`${MEM0_BASE}/v3/memories/?page_size=50`, {
        method: "POST",
        headers: mem0Headers,
        body: JSON.stringify({ filters: { user_id: userId } })
      });
      break;
    case "delete_all":
      upstream = await fetch(`${MEM0_BASE}/v1/memories/?user_id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: mem0Headers
      });
      break;
    default:
      return json({ error: "Unknown action" }, 400);
  }

  const text = await upstream.text();
  try {
    return json(JSON.parse(text), upstream.status);
  } catch {
    return json({ error: "Unexpected response from Mem0", detail: text }, upstream.status);
  }
});
