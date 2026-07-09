import OpenAI from "openai";
import { NextResponse } from "next/server";
import { demoSvgDataUrl } from "@/lib/demo-image";
import { buildStampPrompt, type StampRequest } from "@/lib/prompt";

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
    phrases: body.phrases ?? ""
  };

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" || !process.env.OPENAI_API_KEY) {
    const labels = input.phrases
      .split(/\r?\n/)
      .map((phrase) => phrase.trim())
      .filter(Boolean);

    return NextResponse.json({
      mode: "demo",
      images: Array.from({ length: count }, (_, index) =>
        demoSvgDataUrl(labels[index % Math.max(labels.length, 1)] ?? "Stamp", index)
      )
    });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.IMAGE_MODEL ?? "gpt-image-1";
  const images: string[] = [];

  for (let index = 0; index < count; index += 1) {
    const result = await client.images.generate({
      model,
      prompt: buildStampPrompt(input, index),
      size: "1024x1024",
      n: 1
    });

    const image = result.data?.[0]?.b64_json;
    if (!image) {
      throw new Error("Image generation returned no image data.");
    }

    images.push(`data:image/png;base64,${image}`);
  }

  return NextResponse.json({ mode: "api", images });
}
