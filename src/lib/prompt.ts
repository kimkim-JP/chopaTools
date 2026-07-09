export type StampRequest = {
  character: string;
  mood: string;
  style: string;
  count: number;
  phrases: string;
  textColor: string;
  strokeColor: string;
  strokeWidth: number;
  fontStyle: string;
};

export function buildStampSheetPrompt(input: StampRequest, sheetIndex: number) {
  const phrases = getPhrases(input);
  const sheetPhrases = Array.from({ length: 8 }, (_, index) => {
    const phraseIndex = sheetIndex * 8 + index;
    return phrases[phraseIndex] ?? "";
  });

  return [
    "Create one transparent-background sprite sheet for a LINE sticker pack.",
    "The sheet must contain exactly 8 separate stickers arranged in a strict 2 columns by 4 rows grid.",
    "Each grid cell must contain one complete sticker, centered with generous transparent padding.",
    "Do not draw grid lines, borders, frames, watermarks, shadows outside each sticker, or a background.",
    "The final image will be cropped by software into 8 equal cells, so keep every character and text fully inside its own cell.",
    "Each cropped sticker must work as a LINE sticker at 370x320 PNG with transparent background.",
    `Character: ${input.character}.`,
    `Mood/action: ${input.mood}.`,
    `Visual style: ${input.style}.`,
    `Text style: ${input.fontStyle}, text color ${input.textColor}, outline color ${input.strokeColor}, outline width ${input.strokeWidth}px.`,
    "Use bold readable Japanese text. Keep the text short, centered near the top or bottom of each sticker, and never let it touch the crop edge.",
    "Use these texts in reading order, left to right, top to bottom:",
    ...sheetPhrases.map((phrase, index) => `${index + 1}. ${phrase || "no text"}`)
  ].join(" ");
}

function getPhrases(input: StampRequest) {
  return input.phrases.split(/\r?\n/).map((phrase) => phrase.trim());
}
