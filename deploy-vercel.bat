@echo off
chcp 65001 >nul
echo ======================================
echo   Vercel クイックデプロイ
echo ======================================
echo.

REM Vercel CLIがインストールされているか確認
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Vercel CLIがインストールされていません。
    echo.
    set /p INSTALL_VERCEL="今すぐインストールしますか？ (y/n): "
    
    if /i "%INSTALL_VERCEL%"=="y" (
        echo 📦 Vercel CLIをインストール中...
        call npm install -g vercel
        echo ✓ インストール完了！
        echo.
    ) else (
        echo.
        echo 手動でインストールしてください：
        echo   npm install -g vercel
        echo.
        pause
        exit /b 1
    )
)

echo 🚀 Vercelへデプロイを開始します...
echo.

REM デプロイ前の確認
echo デプロイモードを選択してください：
echo 1^) プレビュー（テスト用）
echo 2^) 本番環境
echo.

set /p DEPLOY_MODE="選択 (1/2): "

if "%DEPLOY_MODE%"=="2" (
    echo.
    echo 🌐 本番環境にデプロイ中...
    call vercel --prod
) else (
    echo.
    echo 🔍 プレビュー環境にデプロイ中...
    call vercel
)

echo.
echo ======================================
echo   デプロイ完了！
echo ======================================
echo.
echo 次のステップ:
echo 1. 表示されたURLにアクセスしてテスト
echo 2. 問題なければ本番環境にデプロイ（vercel --prod）
echo 3. カスタムドメインを設定（オプション）
echo.
echo 詳細は DEPLOY_VERCEL.md を参照してください
echo.

pause
