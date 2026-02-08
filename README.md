# WebFlow Proxy 🌐

CroxyProxyスタイルのモダンなWebプロキシサーバー。美しいUIと強力な機能を備えています。

## 特徴

- ✨ モダンで美しいユーザーインターフェース
- 🔒 安全なプロキシ接続
- 🌓 ダークモード/ライトモード切り替え
- 📱 完全レスポンシブデザイン
- 🚀 高速なページ読み込み
- 🔄 自動URL書き換え
- 🎨 アニメーション効果

## 必要要件

- Node.js (v14以上推奨)
- npm または yarn

## インストール

1. **依存関係のインストール**

```bash
npm install
```

または

```bash
yarn install
```

## 使用方法

### サーバーの起動

**本番環境:**
```bash
npm start
```

**開発環境（自動再起動付き）:**
```bash
npm run dev
```

サーバーは `http://localhost:3000` で起動します。

### 使い方

1. ブラウザで `http://localhost:3000` にアクセス
2. アクセスしたいURLを入力フォームに入力
3. 「アクセス開始」ボタンをクリック
4. プロキシ経由でウェブサイトが表示されます

## 技術スタック

### バックエンド
- **Express.js** - Webフレームワーク
- **Request** - HTTPリクエスト処理
- **Cheerio** - HTML解析とDOM操作

### フロントエンド
- **HTML5/CSS3** - 構造とスタイリング
- **Vanilla JavaScript** - インタラクティブ機能
- **Google Fonts** - Darker Grotesque & IBM Plex Mono

## プロジェクト構成

```
.
├── proxy-server.js      # メインサーバーファイル
├── package.json         # 依存関係の定義
├── public/              # 静的ファイル
│   └── index.html       # フロントエンドUI
└── README.md            # このファイル
```

## 主な機能

### URL書き換え
- 絶対URL、相対URL、プロトコル相対URLの自動書き換え
- HTML、CSS、JavaScript内のURLを適切に処理
- フォーム、画像、リンク、iframeのURL変換

### コンテンツ処理
- HTMLのパース と書き換え
- CSSのURL書き換え
- JavaScriptファイルのプロキシ
- バイナリファイル（画像など）の転送

### セキュリティ
- User-Agentの適切な設定
- リダイレクトの制限
- Content-Security-Policyの除去

## カスタマイズ

### ポート番号の変更

環境変数 `PORT` を設定することでポート番号を変更できます:

```bash
PORT=8080 npm start
```

### スタイルのカスタマイズ

`public/index.html` の `<style>` タグ内のCSS変数を編集することで、カラーテーマを変更できます:

```css
:root {
    --bg-primary: #0a0e27;
    --accent-primary: #00f5ff;
    /* その他の変数... */
}
```

## 注意事項

⚠️ **重要な免責事項:**

- このプロキシは教育目的で作成されています
- 著作権で保護されたコンテンツへの不正アクセスには使用しないでください
- 利用規約を遵守し、合法的な目的でのみ使用してください
- 商用利用する場合は、適切なライセンスとセキュリティ対策を実装してください

## トラブルシューティング

### ポートがすでに使用されている

```bash
# 別のポートを指定
PORT=3001 npm start
```

### モジュールが見つからない

```bash
# 依存関係を再インストール
rm -rf node_modules
npm install
```

### ページが正しく表示されない

一部のウェブサイトは以下の理由でプロキシ経由では正しく動作しない場合があります:
- Content-Security-Policy（CSP）の制限
- JavaScriptによる動的なURL生成
- WebSocketやその他のリアルタイム通信
- CORS（Cross-Origin Resource Sharing）の制限

## ライセンス

MIT License

## 貢献

プルリクエストを歓迎します！大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## サポート

問題が発生した場合は、GitHubのissueで報告してください。

---

**開発者へ:** このプロキシは基本的な機能を提供しますが、本格的な商用利用には追加のセキュリティ対策、エラー処理、パフォーマンス最適化が必要です。
