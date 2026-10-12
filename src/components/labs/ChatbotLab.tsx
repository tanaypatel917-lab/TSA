"use client";

import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { pipFallback, pipRules, pipSuggestions } from "@/content/chatbot";
import { chatReply, type ChatReply } from "@/engine/chatbot";
import { LabFrame } from "./LabFrame";

type ChatMessage = { id: number; sender: "pip" | "student"; reply: ChatReply };

const openingMessage: ChatMessage = {
  id: 0,
  sender: "pip",
  reply: chatReply("Hello!", pipRules, pipFallback)
};

const hoodSpec = "Model: 6 keyword rules · Data: none, every reply was written by us · Runs on your device";

export function ChatbotLab() {
  const [messages, setMessages] = useState<ChatMessage[]>([openingMessage]);
  const [draft, setDraft] = useState("");
  const [hoodOpen, setHoodOpen] = useState(false);
  const nextId = useRef(1);
  const latestBot = [...messages].reverse().find((message) => message.sender === "pip")!;

  function send(message: string) {
    const text = message.trim();
    if (!text) return;

    const studentMessage: ChatMessage = {
      id: nextId.current++,
      sender: "student",
      reply: { rule: null, matched: null, text }
    };
    const botMessage: ChatMessage = {
      id: nextId.current++,
      sender: "pip",
      reply: chatReply(text, pipRules, pipFallback)
    };
    setMessages((current) => [...current, studentMessage, botMessage].slice(-12));
    setDraft("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(draft);
  }

  function startOver() {
    setMessages([openingMessage]);
    setDraft("");
  }

  const hoodContent = <>
    <div className="chatbot-table-wrap">
      <table className="chatbot-rule-table">
        <caption className="sr-only">Pip&apos;s written keyword rules and replies</caption>
        <thead><tr><th scope="col">Rule</th><th scope="col">Keywords</th><th scope="col">Reply</th></tr></thead>
        <tbody>
          {pipRules.map((rule) => <tr key={rule.id} data-fired={latestBot.reply.rule?.id === rule.id}>
            <td data-label="Rule">{rule.id}</td>
            <td data-label="Keywords">{rule.keywords.join(", ")}</td>
            <td data-label="Reply">{rule.reply}</td>
          </tr>)}
          <tr className="chatbot-fallback-row" data-fired={latestBot.reply.rule === null}>
            <td data-label="Rule" colSpan={2}>No rule matched → fallback reply</td>
            <td data-label="Reply">{pipFallback}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </>;

  return <LabFrame
    id="lab-chatbot"
    sources="chatbot"
    title="Meet Pip. Is it thinking, or following a menu?"
    note="Pip never understands a message. It looks for keywords and picks a reply someone wrote in advance. Early chatbots like ELIZA (1966) worked this way. Today's language models generate new text instead, but they still don't check whether it's true."
    hood={{ spec: hoodSpec, content: hoodContent }}
    onHoodOpenChange={setHoodOpen}
  >
    <div className="chatbot-window">
      <div className="chatbot-window-header">
        <span>Pip · school helper bot</span>
        <button className="button-secondary chatbot-start-over" type="button" onClick={startOver}>Start over</button>
      </div>
      <div className="chatbot-log" role="log" aria-live="polite" aria-label="Conversation with Pip">
        {messages.map((message) => <article key={message.id} className="chatbot-turn" data-sender={message.sender}>
          <span className="chatbot-speaker">{message.sender === "pip" ? "Pip" : "You"}</span>
          <p className="chatbot-bubble">{message.reply.text}
            {message.sender === "pip" && hoodOpen && <small className="chatbot-rule-tag">{message.reply.rule && message.reply.matched ? `Rule: ${message.reply.rule.id} · matched "${message.reply.matched}"` : "No rule matched"}</small>}
          </p>
        </article>)}
      </div>
    </div>
    <div className="lab-choices chatbot-suggestions" role="group" aria-label="Try a message">
      {pipSuggestions.map((suggestion) => <button key={suggestion} type="button" onClick={() => send(suggestion)}>{suggestion}</button>)}
    </div>
    <form className="chatbot-compose" onSubmit={submit}>
      <label className="lab-field chatbot-message-field"><span>Message Pip</span><input type="text" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={200} /></label>
      <button className="button-primary" type="submit">Send <span aria-hidden="true">↗</span></button>
    </form>
  </LabFrame>;
}
