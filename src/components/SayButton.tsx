"use client";

import { useEffect, useState } from "react";

function pickVoice() {
  const voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  return voices.find((voice) => voice.localService && voice.lang === "en-US") ?? voices.find((voice) => voice.localService) ?? voices[0];
}

export function SayButton({ term }: { term: string }) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;
    setSupported(true);
    window.speechSynthesis.getVoices();
  }, []);

  function say() {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(term);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang ?? "en-US";
    utterance.rate = 0.85;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utterance);
  }

  if (!supported) return null;
  return <button type="button" className="say-button" data-speaking={speaking} aria-label={`Say “${term}” out loud`} onClick={say}><span aria-hidden="true" className="say-wave"><i /><i /><i /></span></button>;
}
