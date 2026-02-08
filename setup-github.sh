#!/bin/bash

echo "======================================"
echo "  GitHub初期設定スクリプト"
echo "======================================"
echo ""

# ユーザー名とリポジトリ名の入力
read -p "GitHubユーザー名を入力: " USERNAME
read -p "リポジトリ名を入力 (例: webflow-proxy): " REPO_NAME

echo ""
echo "設定内容:"
echo "  ユーザー名: $USERNAME"
echo "  リポジトリ名: $REPO_NAME"
echo "  リポジトリURL: https://github.com/$USERNAME/$REPO_NAME.git"
echo ""

read -p "この内容で進めますか？ (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "キャンセルしました。"
    exit 1
fi

echo ""
echo "Git設定を開始します..."

# Git初期化
if [ ! -d ".git" ]; then
    echo "✓ Gitを初期化中..."
    git init
else
    echo "✓ Gitは既に初期化されています"
fi

# ファイルを追加
echo "✓ ファイルを追加中..."
git add .

# コミット
echo "✓ コミット中..."
git commit -m "Initial commit: WebFlow Proxy for Render deployment"

# リモートリポジトリを追加
echo "✓ リモートリポジトリを設定中..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$USERNAME/$REPO_NAME.git"

# ブランチ名を変更
echo "✓ メインブランチを設定中..."
git branch -M main

echo ""
echo "======================================"
echo "  設定完了！"
echo "======================================"
echo ""
echo "次のステップ:"
echo ""
echo "1. GitHubで新しいリポジトリを作成してください:"
echo "   https://github.com/new"
echo "   リポジトリ名: $REPO_NAME"
echo ""
echo "2. 以下のコマンドでプッシュしてください:"
echo "   git push -u origin main"
echo ""
echo "3. Renderでデプロイしてください:"
echo "   詳細は DEPLOY_RENDER.md を参照"
echo ""
