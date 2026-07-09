export type StampRequest = {
  character: string;
  mood: string;
  style: string;
  count: number;
  phrases: string;
};

export function buildStampPrompt(input: StampRequest, index: number) {
  const phrases = input.phrases
    .split(/\r?\n/)
    .map((phrase) => phrase.trim())
    .filter(Boolean);
  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? "";

  return [
    "Create one transparent-background sticker image for a LINE sticker pack.",
    "Canvas should be square, centered subject, clean silhouette, no border, no watermark.",
    "Make it readable at small chat size and leave generous transparent padding.",
    `Character: ${input.character}.`,
    `Mood/action: ${input.mood}.`,
    `Visual style: ${input.style}.`,
    phrase ? `Include short Japanese text: ${phrase}.` : "No text unless it improves the sticker."
  ].join(" ");
}
