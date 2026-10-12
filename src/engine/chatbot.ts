export type ChatRule = { id: string; keywords: string[]; reply: string };
export type ChatReply = { rule: ChatRule | null; matched: string | null; text: string };

function words(text: string) {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

function containsWords(message: string[], keyword: string[]) {
  if (keyword.length === 0 || keyword.length > message.length) return false;
  return message.some((_, start) => keyword.every((word, offset) => message[start + offset] === word));
}

export function chatReply(message: string, rules: ChatRule[], fallback: string): ChatReply {
  const messageWords = words(message);
  for (const rule of rules) {
    for (const keyword of rule.keywords) {
      if (containsWords(messageWords, words(keyword))) return { rule, matched: keyword, text: rule.reply };
    }
  }
  return { rule: null, matched: null, text: fallback };
}
