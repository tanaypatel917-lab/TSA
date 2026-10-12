import type { ChatRule } from "@/engine/chatbot";

export const pipRules: ChatRule[] = [
  { id: "greet", keywords: ["hi", "hello", "hey"], reply: "Hi! I'm Pip, the school helper bot. Ask me about lunch, the library or homework." },
  { id: "lunch", keywords: ["lunch", "food", "eat", "menu"], reply: "Today's lunch is pasta, salad and an apple." },
  { id: "library", keywords: ["library", "book", "books"], reply: "The library is open 7:30 to 4:00. You can borrow 3 books at a time." },
  { id: "homework", keywords: ["homework", "assignment", "due"], reply: "Homework is posted on the class page by 5 p.m." },
  { id: "feelings", keywords: ["sad", "stressed", "worried", "upset"], reply: "I'm sorry you feel that way. Please talk to a counselor or a trusted adult." },
  { id: "thanks", keywords: ["thanks", "thank"], reply: "You're welcome!" }
];

export const pipFallback = "Sorry, I didn't get that. Try asking about lunch, the library or homework.";
export const pipSuggestions = ["Hello!", "What's for lunch?", "Can you explain photosynthesis?", "I like books but I hate the library", "I'm not stressed at all"];
