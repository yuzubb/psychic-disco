#!/bin/bash

echo "======================================"
echo "  Vercel クイックデプロイ"
echo "======================================"
echo ""

# Vercel CLIがインストールされているか確認
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLIがインストールされていません。"
    echo ""
    read -p "今すぐインストールしますか？ (y/n): " INSTALL_VERCEL
    
    if [ "$INSTALL_VERCEL" = "y" ]; then
        echo "📦 Vercel CLIをインストール中..."
        npm install -g vercel
        echo "✓ インストール完了！"
        echo ""
    else
        echo ""
        echo "手動でインストールしてください："
        echo "  npm install -g vercel"
        echo ""
        exit 1
    fi
fi

echo "🚀 Vercelへデプロイを開始します..."
echo ""

# デプロイ前の確認
echo "デプロイモードを選択してください："
echo "1) プレビュー（テスト用）"
echo "2) 本番環境"
echo ""

read -p "選択 (1/2): " DEPLOY_MODE

if [ "$DEPLOY_MODE" = "2" ]; then
    echo ""
    echo "🌐 本番環境にデプロイ中..."
    vercel --prod
else
    echo ""
    echo "🔍 プレビュー環境にデプロイ中..."
    vercel
fi

echo ""
echo "======================================"
echo "  デプロイ完了！"
echo "======================================"
echo ""
echo "次のステップ:"
echo "1. 表示されたURLにアクセスしてテスト"
echo "2. 問題なければ本番環境にデプロイ（vercel --prod）"
echo "3. カスタムドメインを設定（オプション）"
echo ""
echo "詳細は DEPLOY_VERCEL.md を参照してください"
echo ""
