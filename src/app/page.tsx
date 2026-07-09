"use client";

import { useMemo, useState } from "react";

const starterPhrases = ["ありがとう", "了解", "おつかれ", "ごめん", "OK", "最高", "いま行く", "またね"].join(
  "\n"
);

type GenerateResponse = {
  mode: "demo" | "api";
  images: string[];
  error?: string;
};

export default function Home() {
  const [character, setCharacter] = useState("丸くて小さな柴犬のキャラクター");
  const [mood, setMood] = useState("日常会話で使いやすい、明るく親しみやすい表情");
  const [style, setStyle] = useState("太めの線、フラットカラー、かわいい日本のスタンプ風");
  const [phrases, setPhrases] = useState(starterPhrases);
  const [count, setCount] = useState(8);
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState("まずは8枚で雰囲気を確認できます。");
  const [loading, setLoading] = useState(false);

  const phraseCount = useMemo(
    () => phrases.split(/\r?\n/).slice(0, count).filter((phrase) => phrase.trim()).length,
    [phrases, count]
  );

  async function generate() {
    setLoading(true);
    setStatus("画像を生成しています...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ character, mood, style, phrases, count })
      });
      const data = (await response.json()) as GenerateResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "生成に失敗しました。");
      }

      setImages(data.images);
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
              {Array.from({ length: count }, (_, index) => (
                <span key={index + 1}>No.{index + 1}</span>
              ))}
            </div>
            <textarea
              id="phrases"
              value={phrases}
              onChange={(event) => setPhrases(event.target.value)}
              placeholder="1行に1つずつ短文を入力"
            />
          </div>
          <p className="fineprint">
            1行に1つずつ入力します。選択中の{count}枚に対して、{phraseCount}個の短文を使います。
          </p>
        </div>

        <div className="actions single">
          <button className="primary" disabled={loading} onClick={generate} type="button">
            {loading ? "生成中" : "生成"}
          </button>
        </div>

        <p className="fineprint">
          Vercel公開直後はデモモードで動かせます。OpenAI APIキーを設定すると実画像生成に切り替わります。
        </p>
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
          <div className="grid">
            {images.map((src, index) => (
              <button className="stamp" key={`${src}-${index}`} onClick={() => downloadImage(src, index)} type="button">
                <img alt={`生成スタンプ ${index + 1}`} src={src} />
              </button>
            ))}
          </div>
        ) : (
          <div className="empty">
            左の条件を調整して生成すると、ここにスタンプ画像が並びます。
          </div>
        )}
      </section>
    </main>
  );
}
