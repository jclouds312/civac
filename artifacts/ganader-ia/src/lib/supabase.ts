import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL ?? import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }) : null;

export type ChatRecord = { id: string; thread_id: string; author_id: string; body: string; created_at: string };

type ChatPayload = { text: string; channel?: string; type?: string; replyTo?: string; replyText?: string; pinned?: boolean };

async function getThread(channel: string, userId: string) {
  if (!supabase) return null;
  const { data: existing } = await supabase.from("chat_threads").select("id").eq("title", channel).eq("created_by", userId).maybeSingle();
  if (existing?.id) return existing.id as string;
  const { data } = await supabase.from("chat_threads").insert({ title: channel, created_by: userId }).select("id").single();
  return data?.id as string | null;
}

export async function loadCloudMessages(userId: string) {
  if (!supabase) return [] as ChatRecord[];
  const { data } = await supabase.from("chat_messages").select("id, thread_id, author_id, body, created_at").order("created_at", { ascending: true }).limit(500);
  return (data ?? []) as ChatRecord[];
}

export async function saveCloudMessage(userId: string, message: ChatPayload) {
  if (!supabase) return;
  const threadId = await getThread(message.channel ?? "general", userId);
  if (!threadId) return;
  await supabase.from("chat_messages").insert({ thread_id: threadId, author_id: userId, body: JSON.stringify(message) });
}

export function subscribeToCloudMessages(onChange: () => void) {
  return supabase?.channel("civac-chat-live").on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, onChange).subscribe();
}

export function unsubscribeFromCloudMessages(channel: ReturnType<NonNullable<typeof supabase>["channel"]> | undefined) {
  if (channel && supabase) void supabase.removeChannel(channel);
}
