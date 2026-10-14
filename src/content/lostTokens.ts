export const LOST_TOKENS = [
  {
    id: "bos",
    glyph: "<bos>",
    page: "/",
    hint: "Hiding on the homepage",
    note: "Beginning of sequence: many models put this token before the first word."
  },
  {
    id: "subword",
    glyph: "##ing",
    page: "/glossary",
    hint: "Tucked into the glossary",
    note: "A subword piece. Tokenizers split rare words into common chunks like this one."
  },
  {
    id: "mask",
    glyph: "[MASK]",
    page: "/timeline",
    hint: "Somewhere in AI history",
    note: "BERT learned language by guessing words hidden behind this token."
  },
  {
    id: "unk",
    glyph: "<unk>",
    page: "/badges",
    hint: "Among the badges",
    note: "Unknown: older tokenizers used this for words they had never seen."
  },
  {
    id: "pad",
    glyph: "<pad>",
    page: "/about",
    hint: "On the page about how we built this",
    note: "Padding: filler tokens that make a batch of sentences the same length."
  },
  {
    id: "eos",
    glyph: "<eos>",
    page: "404",
    hint: "On a page that doesn't exist",
    note: "End of sequence: the token that tells a model to stop writing."
  }
] as const;

export type LostTokenId = (typeof LOST_TOKENS)[number]["id"];
