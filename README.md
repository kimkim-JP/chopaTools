# LINE Stamp Studio

LINEスタンプ向けの画像をAI生成するWebアプリのMVPです。

## Stack

- Next.js App Router
- Vercel deployment
- OpenAI image generation API
- Stripe Checkout ready for a later paid flow

## Local Setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open `http://localhost:3000`.

`NEXT_PUBLIC_DEMO_MODE=true` のままなら、APIキーなしでデモ画像を表示できます。

## Vercel Environment Variables

最初の公開では、以下だけで動きます。

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_URL` | 本番URL。Vercelでは `https://your-app.vercel.app` |
| `NEXT_PUBLIC_DEMO_MODE` | `true` なら画像生成APIを呼ばずにデモ画像を返す |

実際のAI画像生成を使う時に追加します。

| Name | Purpose |
| --- | --- |
| `OPENAI_API_KEY` | OpenAIのAPIキー |
| `IMAGE_MODEL` | 画像生成モデル。初期値は `gpt-image-1` |

Stripe決済を追加する時に使います。

| Name | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook署名シークレット |
| `STRIPE_PRICE_ID_STARTER` | スタンプ生成商品のPrice ID |

## Stripe Later

1. Stripe Dashboardで商品とPriceを作成します。
2. Price IDを `STRIPE_PRICE_ID_STARTER` に設定します。
3. Webhook endpointに `/api/stripe/webhook` を登録します。
4. 受け取るイベントに `checkout.session.completed` を含めます。

このMVPではWebhook受信までを実装しています。公開前には、購入完了をDBに保存してユーザーごとの生成回数を管理してください。

## GitHub and Vercel

1. GitHubにこのフォルダをpushします。
2. VercelでGitHub repoをImportします。
3. Framework Presetは `Next.js` を選びます。
4. Build Commandは `pnpm build` のままでOKです。
5. Install Commandは `pnpm install` のままでOKです。
6. Environment Variablesに `NEXT_PUBLIC_DEMO_MODE=true` を登録します。
7. Deployします。

## Current Product Flow

1. ユーザーがキャラクター、表情・用途、画風、短文、枚数を入力します。
2. `生成` を押すと `/api/generate` が画像を返します。
3. 画像をクリックするとPNG/SVGデータとして保存できます。

## Production TODO

- ユーザー認証を追加する
- Stripe Webhook完了時にDBへ購入記録を保存する
- 生成回数、再生成、履歴、ダウンロードZIPを追加する
- LINE公式の最新審査ガイドラインに合わせて画像サイズ、余白、形式の検証を追加する
