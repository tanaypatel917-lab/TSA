import { expect, test } from "@playwright/test";

test("Listen advances paragraphs, pauses, stops, and stays visible on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    class FakeUtterance {
      text: string;
      voice: SpeechSynthesisVoice | null = null;
      lang = "en-US";
      rate = 1;
      onstart: ((event: Event) => void) | null = null;
      onend: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      onboundary: ((event: SpeechSynthesisEvent) => void) | null = null;

      constructor(text: string) {
        this.text = text;
      }
    }

    let current: FakeUtterance | null = null;
    let timer = 0;
    const synth = {
      speaking: false,
      paused: false,
      getVoices: () => [],
      speak: (utterance: FakeUtterance) => {
        current = utterance;
        synth.speaking = true;
        synth.paused = false;
        window.setTimeout(() => {
          if (current === utterance) utterance.onstart?.(new Event("start"));
        }, 0);
        timer = window.setTimeout(() => {
          if (current !== utterance || synth.paused) return;
          current = null;
          synth.speaking = false;
          utterance.onend?.(new Event("end"));
        }, 300);
      },
      pause: () => {
        synth.paused = true;
        window.clearTimeout(timer);
      },
      resume: () => {
        const utterance = current;
        if (!utterance) return;
        synth.paused = false;
        timer = window.setTimeout(() => {
          if (current !== utterance || synth.paused) return;
          current = null;
          synth.speaking = false;
          utterance.onend?.(new Event("end"));
        }, 300);
      },
      cancel: () => {
        window.clearTimeout(timer);
        current = null;
        synth.speaking = false;
        synth.paused = false;
      }
    };

    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: FakeUtterance });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: synth });
  });

  await page.goto("/modules/ai-foundations/lessons/what-is-ai/");
  const listen = page.getByRole("button", { name: "▶ Listen", exact: true });
  await expect(listen).toBeVisible();
  await listen.click();

  const first = page.locator('[data-paragraph="0"]');
  const second = page.locator('[data-paragraph="1"]');
  await expect(first).toHaveAttribute("data-speaking", "true");
  await expect(second).toHaveAttribute("data-speaking", "true");
  await page.getByRole("button", { name: "❚❚ Pause", exact: true }).click();
  await expect(page.getByRole("button", { name: "▶ Resume", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "■ Stop", exact: true }).click();
  await expect(page.locator("[data-speaking]")).toHaveCount(0);
  await expect(listen).toBeVisible();
});
