This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### 川上の相談導線・社内の連絡希望とタスク管理

- 川上のホーム／カタログには「ご相談・予約」を固定表示します。SPでは下部メニューの直上、PCでは画面下部に配置し、既存の相談予約カレンダーへ進めます。
- 社内管理の「顧客管理 → 詳細・編集」で希望連絡方法を複数選択できます。「選択した連絡方法のみを希望」と時間帯・配慮事項も保存できます。未選択は未確認として表示します。サンプルには電話のみ・メールのみ希望のお客様を用意しています。
- 「タスク管理」は既存の対応案件を引き継ぎ、追加・編集・完了・状況絞り込みに対応しています。顧客に紐づけるタスクと社内タスクを登録でき、担当者・期限・優先度・メモを編集できます。顧客の連絡希望はタスク一覧／編集画面にも表示します。
- 顧客情報とタスクの変更はブラウザ実行中のみ保持します。再読み込みで初期化され、メール送信・電話発信などの外部連絡は行いません。
