# 🚀 クイックスタートガイド

WebFlow Proxyを5分で起動する方法

## 前提条件

- Node.js (v14以上) がインストールされていること
  - 未インストールの場合: https://nodejs.org/ からダウンロード

## 起動手順

### Windows ユーザー

1. フォルダを開く
2. `start.bat` をダブルクリック
3. ブラウザで `http://localhost:3000` にアクセス

### Mac / Linux ユーザー

1. ターミナルを開く
2. プロジェクトフォルダに移動
   ```bash
   cd /path/to/webflow-proxy
   ```
3. 起動スクリプトを実行
   ```bash
   ./start.sh
   ```
4. ブラウザで `http://localhost:3000` にアクセス

### 手動起動

```bash
# 1. 依存関係のインストール
npm install

# 2. サーバー起動
npm start
```

## 使い方

1. トップページでURLを入力
2. 「アクセス開始」ボタンをクリック
3. プロキシ経由でサイトが表示されます

## テスト用おすすめサイト

- `https://example.com`
- `https://wikipedia.org`
- `https://github.com`

## トラブルシューティング

### エラー: "ポートが使用中です"

別のポートで起動:
```bash
PORT=3001 npm start
```

### エラー: "モジュールが見つかりません"

依存関係を再インストール:
```bash
npm install
```

### ページが表示されない

- URLが正しいか確認
- インターネット接続を確認
- ブラウザのキャッシュをクリア

## サポート

詳細は `README.md` を参照してください。
