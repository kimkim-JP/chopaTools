import OpenAI from "openai";
import { NextResponse } from "next/server";
import { demoSheetSvgDataUrl } from "@/lib/demo-image";
import { buildStampSheetPrompt, type StampRequest } from "@/lib/prompt";

export const runtime = "nodejs";

const ALLOWED_COUNTS = new Set([8, 16, 24, 40]);

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<StampRequest>;
  const count = Number(body.count ?? 8);

  if (!body.character || !body.mood || !body.style) {
    return NextResponse.json(
      { error: "character, mood, style are required." },
      { status: 400 }
    );
  }

  if (!ALLOWED_COUNTS.has(count)) {
    return NextResponse.json({ error: "count must be 8, 16, 24, or 40." }, { status: 400 });
  }

  const input: StampRequest = {
    character: body.character,
    mood: body.mood,
    style: body.style,
    count,
    phrases: body.phrases ?? "",
    textColor: body.textColor ?? "#111111",
    strokeColor: body.strokeColor ?? "#ffffff",
    strokeWidth: Number(body.strokeWidth ?? 3)
  };
  const sheetCount = Math.ceil(count / 8);
  const phrases = input.phrases.split(/\r?\n/).map((phrase) => phrase.trim());

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      mode: "demo",
      sheets: Array.from({ length: sheetCount }, (_, sheetIndex) =>
        demoSheetSvgDataUrl({
          labels: phrases.slice(sheetIndex * 8, sheetIndex * 8 + 8),
          textColor: input.textColor,
          strokeColor: input.strokeColor,
          strokeWidth: input.strokeWidth,
          sheetIndex
        })
      )
    });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.IMAGE_MODEL ?? "gpt-image-1";
  const sheets: string[] = [];

  for (let sheetIndex = 0; sheetIndex < sheetCount; sheetIndex += 1) {
    const result = await client.images.generate({
      model,
      prompt: buildStampSheetPrompt(input, sheetIndex),
      size: "1024x1536",
      quality: "low",
      n: 1
    });

    const image = result.data?.[0]?.b64_json;
    if (!image) {
      throw new Error("Image generation returned no image data.");
    }

    sheets.push(`data:image/png;base64,${image}`);
  }

  return NextResponse.json({ mode: "api", sheets });
}
