"use client";

import { useMemo, useState } from "react";

const starterPhrases = ["ありがとう", "了解", "おつかれ", "ごめん", "OK", "最高", "いま行く", "またね"];
const maxStampCount = 40;

type GenerateResponse = {
  mode: "demo" | "api";
  sheets: string[];
  error?: string;
};

export default function Home() {
  const [character, setCharacter] = useState("丸くて小さな柴犬のキャラクター");
  const [mood, setMood] = useState("日常会話で使いやすい、明るく親しみやすい表情");
  const [style, setStyle] = useState("太めの線、フラットカラー、かわいい日本のスタンプ風");
  const [phrases, setPhrases] = useState<string[]>(
    Array.from({ length: maxStampCount }, (_, index) => starterPhrases[index] ?? "")
  );
  const [textColor, setTextColor] = useState("#111111");
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [count, setCount] = useState(8);
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState("まずは8枚で雰囲気を確認できます。");
  const [loading, setLoading] = useState(false);
  const [phraseScrollTop, setPhraseScrollTop] = useState(0);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [tabImageIndex, setTabImageIndex] = useState(0);

  const phraseCount = useMemo(
    () => phrases.slice(0, count).filter((phrase) => phrase.trim()).length,
    [phrases, count]
  );

  const phraseText = useMemo(() => phrases.slice(0, count).join("\n"), [phrases, count]);

  function updatePhraseText(value: string) {
    const lines = value.split(/\r?\n/);
    setPhrases((current) =>
      current.map((phrase, index) => {
        if (index >= count) {
          return phrase;
        }

        return lines[index] ?? "";
      })
    );
  }

  async function generate() {
    setLoading(true);
    setStatus("8枚1シートで画像を生成しています...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character, mood, style, phrases: phraseText, count, textColor, strokeColor, strokeWidth })
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "生成に失敗しました。");
      }

      const splitImages = await splitSheetsIntoStamps(data.sheets, count);
      setImages(splitImages);
      setMainImageIndex(0);
      setTabImageIndex(0);
      setStatus(data.mode === "demo" ? "デモ画像を表示中です。" : "生成が完了しました。");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  function downloadImage(src: string, index: number) {
    const anchor = document.createElement("a");
    anchor.href = src;
    anchor.download = `line-stamp-${String(index + 1).padStart(2, "0")}.png`;
    anchor.click();
  }

  async function downloadResizedImage(src: string, width: number, height: number, filename: string) {
    const image = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const drawX = (width - drawWidth) / 2;
    const drawY = (height - drawHeight) / 2;

    context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = filename;
    anchor.click();
  }

  async function splitSheetsIntoStamps(sheets: string[], targetCount: number) {
    const stamps: string[] = [];

    for (const sheet of sheets) {
      const image = await loadImage(sheet);
      const cellWidth = image.naturalWidth / 2;
      const cellHeight = image.naturalHeight / 4;

      for (let index = 0; index < 8 && stamps.length < targetCount; index += 1) {
        const sourceX = (index % 2) * cellWidth;
        const sourceY = Math.floor(index / 2) * cellHeight;
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 320;

        const context = canvas.getContext("2d");
        if (!context) {
          continue;
        }

        context.clearRect(0, 0, 320, 320);
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        const scale = Math.min(320 / cellWidth, 320 / cellHeight);
        const drawWidth = cellWidth * scale;
        const drawHeight = cellHeight * scale;
        const drawX = (320 - drawWidth) / 2;
        const drawY = (320 - drawHeight) / 2;

        context.drawImage(image, sourceX, sourceY, cellWidth, cellHeight, drawX, drawY, drawWidth, drawHeight);
        stamps.push(canvas.toDataURL("image/png"));
      }
    }

    return stamps;
  }

  function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });
  }

  return (
    <main className="shell">
      <aside className="studio-panel">
        <div className="brand">
          <div className="logo">LS</div>
          <div>
            <h1>LINE Stamp Studio</h1>
            <p className="lead">AIでスタンプ案を作り、PNGとして保存する制作画面です。</p>
          </div>
        </div>

        <div className="field">
          <label htmlFor="character">キャラクター</label>
          <input id="character" value={character} onChange={(event) => setCharacter(event.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="mood">表情・用途</label>
          <textarea id="mood" value={mood} onChange={(event) => setMood(event.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="style">画風</label>
          <textarea id="style" className="compact-textarea" value={style} onChange={(event) => setStyle(event.target.value)} />
        </div>

        <div className="style-controls">
          <div className="field">
            <label htmlFor="textColor">文字色</label>
            <div className="color-input">
              <input id="textColor" type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} />
              <input value={textColor} onChange={(event) => setTextColor(event.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="strokeColor">縁取り色</label>
            <div className="color-input">
              <input id="strokeColor" type="color" value={strokeColor} onChange={(event) => setStrokeColor(event.target.value)} />
              <input value={strokeColor} onChange={(event) => setStrokeColor(event.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="strokeWidth">縁取りpx</label>
            <input
              id="strokeWidth"
              max={12}
              min={0}
              type="number"
              value={strokeWidth}
              onChange={(event) => setStrokeWidth(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="field">
          <label>枚数</label>
          <div className="segmented" aria-label="生成枚数">
            {[8, 16, 24, 40].map((value) => (
              <button
                className={count === value ? "active" : ""}
                key={value}
                onClick={() => setCount(value)}
                type="button"
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="field phrase-field">
          <label htmlFor="phrases">入れたい短文</label>
          <div className="phrase-editor">
            <div className="phrase-numbers" aria-hidden="true">
              <div className="phrase-number-track" style={{ transform: `translateY(-${phraseScrollTop}px)` }}>
                {Array.from({ length: count }, (_, index) => (
                  <span key={index + 1}>No.{index + 1}</span>
                ))}
              </div>
            </div>
            <textarea
              id="phrases"
              value={phraseText}
              onChange={(event) => updatePhraseText(event.target.value)}
              onScroll={(event) => setPhraseScrollTop(event.currentTarget.scrollTop)}
              placeholder="1行に1つずつ短文を入力"
              wrap="off"
            />
          </div>
          <p className="fineprint">
            1行に1つずつ入力します。選択中の{count}枚に対して、{phraseCount}個の短文を使います。
          </p>
        </div>

        <div className="panel-spacer" />

        <div className="panel-footer">
          <div className="actions single">
            <button className="primary" disabled={loading} onClick={generate} type="button">
              {loading ? "生成中" : "生成"}
            </button>
          </div>

          <p className="fineprint">
            Vercel公開直後はデモモードで動かせます。OpenAI APIキーを設定すると実画像生成に切り替わります。
          </p>
        </div>
      </aside>

      <section className="workspace">
        <div className="toolbar">
          <div>
            <h2>スタンププレビュー</h2>
            <p className="lead">各画像をクリックすると個別に保存できます。</p>
          </div>
          <div className="status" role="status">
            {status}
          </div>
        </div>

        {images.length > 0 ? (
          <>
            <div className="asset-picker">
              <div>
                <h3>メイン画像</h3>
                <p className="lead">240×240 PNG</p>
                <div className="asset-preview square">
                  <img alt="選択中のメイン画像" src={images[mainImageIndex]} />
                </div>
                <button
                  className="mini-button"
                  onClick={() => downloadResizedImage(images[mainImageIndex], 240, 240, "main.png")}
                  type="button"
                >
                  保存
                </button>
              </div>
              <div>
                <h3>タブ画像</h3>
                <p className="lead">96×74 PNG</p>
                <div className="asset-preview tab">
                  <img alt="選択中のタブ画像" src={images[tabImageIndex]} />
                </div>
                <button
                  className="mini-button"
                  onClick={() => downloadResizedImage(images[tabImageIndex], 96, 74, "tab.png")}
                  type="button"
                >
                  保存
                </button>
              </div>
            </div>

            <div className="grid">
              {images.map((src, index) => (
                <div className="stamp-card" key={`${src}-${index}`}>
                  <button className="stamp" onClick={() => downloadImage(src, index)} type="button">
                    <img alt={`生成スタンプ ${index + 1}`} src={src} />
                  </button>
                  <div className="stamp-tools">
                    <span>No.{index + 1}</span>
                    <button
                      className={mainImageIndex === index ? "tool-active" : ""}
                      onClick={() => setMainImageIndex(index)}
                      type="button"
                    >
                      メイン
                    </button>
                    <button
                      className={tabImageIndex === index ? "tool-active" : ""}
                      onClick={() => setTabImageIndex(index)}
                      type="button"
                    >
                      タブ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty">
            左の条件を調整して生成すると、ここにスタンプ画像が並びます。
          </div>
        )}
      </section>
    </main>
  );
}
