# ORGANI - 組織管理・人事評価システム

**Turborepoを使用したモノレポ構成**で、組織管理と人事評価の2つのNext.jsアプリケーションを統合した企業向けシステムです。組織構造を視覚的に管理し、実際の組織階層に基づく評価システムを提供します。

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.14-06B6D4?logo=tailwindcss)
![Turborepo](https://img.shields.io/badge/Turborepo-2-EF4444?logo=turborepo)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

## 🏗️ プロジェクト構成

```
organi/
├── apps/
│   ├── organization/          # 組織管理アプリ (port 3000)
│   │   ├── app/
│   │   ├── components/
│   │   └── package.json
│   └── evaluation/            # 人事評価アプリ (port 3001)
│       ├── app/
│       ├── components/
│       ├── lib/
│       └── package.json
├── packages/
│   ├── types/                 # 共通型定義
│   ├── auth/                  # 認証ライブラリ
│   └── shared-ui/             # 共通UIコンポーネント
├── turbo.json                 # Turborepo設定
├── docker-compose.yml         # Docker統合環境
└── nginx.conf                 # リバースプロキシ設定
```

## 🚀 クイックスタート

### Docker環境での起動（推奨）

```bash
# 全サービス起動（統合アクセス）
docker-compose up -d

# アクセスURL
# 統合アクセス: http://localhost
# http://localhost/organization → 組織管理 (port 3000)
# http://localhost/evaluation → 人事評価 (port 3001)

# ログ確認
docker-compose logs -f

# 停止
docker-compose down
```

### 開発環境の起動

```bash
# 依存関係のインストール（初回のみ）
npm install

# 全アプリを並行起動
npm run dev

# アクセスURL
# 組織管理: http://localhost:3000
# 人事評価: http://localhost:3001
```

## ✨ 組織管理アプリ（Port 3000）

### 📊 組織図表示・管理
- **階層的組織構造**: 本部→部→課の3階層構造をサポート
- **視覚的階層識別**: アイコンによる組織階層の直感的な識別（🏢本部・👥部・👔課）
- **ドラッグ&ドロップ編集**: 社員をドラッグ&ドロップで部署間を移動
- **リアルタイム反映**: 変更内容が即座に組織図に反映

### 🔍 高度な社員検索・分析
- **多角的検索機能**: 名前、社員ID、メールアドレス、役職、資格等級、入社年度での検索
- **リアルタイムフィルタリング**: 複数条件の組み合わせ検索と即座の結果反映
- **ソート機能**: 氏名、役職、所属、資格等級、入社日でのソート（昇順・降順・リセット）
- **ページネーション**: 20件ずつの表示とスムーズなページ移動
- **データ分析**: 組織構造の統計情報とグラフィカルな可視化

### 🎯 評価関係管理
- **評価関係設定**: 評価者と被評価者の関係を柔軟に設定
- **階層的評価**: 本部長→部長、部長→課長の自然な評価関係
- **カスタム評価**: 組織階層に関係なく評価者を個別指定可能
- **管理職識別**: 評価権限を持つ管理職を自動識別

### 📤 データエクスポート
- **組織図データ（Markdown）**: 組織構造に沿ったデータ出力
- **評価関係データ（Markdown）**: 評価者と被評価者の関係データ
- **統合データ（CSV）**: 組織図と評価関係を含む全データ

### 🔐 アクセス制御
- **Token認証**: セキュアなアクセストークンベースの認証
- **権限管理**: ADMIN/EDITOR/VIEWER の3段階権限
- **API保護**: 認可APIエンドポイントによる操作制限

## ⭐ 人事評価アプリ（Port 3001）

### 🔑 評価者ログイン
- **直感的ログイン**: 美しいグラデーションUIでの評価者選択
- **組織データ連携**: 組織管理アプリの実際の管理職データを使用
- **部署別表示**: 部署ごとにグループ化された評価者一覧
- **役職権限**: 管理者/評価者の区別表示

### 📋 動的な被評価者管理
- **組織階層連動**: ログインした評価者に応じて被評価者を自動生成
  - **本部長**: 配下の部長クラスを評価
  - **部長**: 配下の課長クラスを評価
  - **課長**: 配下の一般職員を評価
- **リアルタイムAPI**: 組織管理アプリからリアルタイムでデータ取得

### 🏆 3段階評価システム
- **結果評価 (score1)**: 業績・成果に対する評価
- **プロセス評価 (score2)**: 業務プロセス・取り組み姿勢の評価
- **成長評価 (score3)**: スキル向上・成長に関する評価
- **重み付き計算**: 各評価の重み設定による最終スコア算出

### 📊 評価ダッシュボード
- **進捗可視化**: 総評価数、完了数、進行中、完了率の統計表示
- **評価状況管理**: 未着手/進行中/完了のステータス管理
- **モーダル評価**: 直感的なモーダルウィンドウでの評価入力

### 🔗 アプリ間連携
- **シームレス移動**: 各アプリ間でのワンクリック移動
- **データ整合性**: 組織管理アプリの組織構造を評価システムに反映
- **統一認証**: 共通の認証システムによる一貫した体験

## 🛠️ 技術スタック

### フロントエンド
- **Next.js 15**: App Router対応の最新フレームワーク
- **TypeScript 5**: 型安全性を保証
- **Tailwind CSS 3.4.14**: ユーティリティファーストのスタイリング
- **React Icons**: 豊富なアイコンライブラリ
- **React DnD**: ドラッグ&ドロップ機能

### バックエンド
- **Next.js API Routes**: サーバーサイド処理
- **JWT**: トークンベース認証
- **LDAP支援**: エンタープライズ認証対応

### インフラ・DevOps
- **Turborepo**: モノレポ管理とビルド最適化
- **Docker & Docker Compose**: コンテナ化とオーケストレーション
- **Nginx**: リバースプロキシとロードバランシング
- **Vercel Ready**: 本番デプロイ対応

## 📁 利用可能なコマンド

### Docker コマンド（推奨）
```bash
# 環境の起動
docker-compose up -d

# ログ確認
docker-compose logs -f [service-name]  # organization, evaluation, nginx

# 特定サービスの再起動
docker-compose restart organization
docker-compose restart evaluation

# 環境のクリーンアップ
docker-compose down -v

# イメージの再ビルド
docker-compose build --no-cache
```

### 開発コマンド
```bash
# 全アプリの開発サーバー起動
npm run dev

# 個別アプリの起動
npm run dev:organization       # 組織管理アプリのみ
npm run dev:evaluation        # 人事評価アプリのみ

# ビルド
npm run build                  # 全アプリビルド
npm run build:organization    # 組織管理アプリのみ
npm run build:evaluation      # 人事評価アプリのみ

# 品質管理
npm run lint                   # 全アプリのリント実行
npm run type-check             # 全アプリの型チェック
```

### 個別アプリでの品質チェック
```bash
# 組織管理アプリ
cd apps/organization
npm run lint                   # ESLint実行
npm run type-check             # TypeScript型チェック

# 人事評価アプリ
cd apps/evaluation
npm run lint                   # ESLint実行
npm run type-check             # TypeScript型チェック
```

## 🌐 アクセスURL

### Docker環境（統合アクセス）
- **統合アクセス**: http://localhost
- **組織管理**: http://localhost/organization
- **人事評価**: http://localhost/evaluation

### 開発環境（直接アクセス）
- **組織管理アプリ**: http://localhost:3000
- **人事評価アプリ**: http://localhost:3001

## 🔧 システム要件と設定

### 動作確認済み環境
- **Node.js**: 20.x以上
- **Docker**: 20.x以上
- **Docker Compose**: 2.x以上

### 重要な設定情報
- **TailwindCSS**: バージョン3.4.14で統一（v4からダウングレード済み）
- **型安全性**: TypeScript strict mode対応、全型エラー修正済み
- **ESLint**: Next.js推奨設定 + TypeScript対応
- **コンテナ間通信**: Docker内部ネットワーク経由でのAPI連携

### ポート構成
```
80    : Nginx (リバースプロキシ)
3000  : 組織管理アプリ
3001  : 人事評価アプリ
```

## 🏢 適用シナリオ

### 企業向け機能
- **中小企業**: 50-200名規模の組織管理
- **人事部門**: 評価業務の効率化とデジタル化
- **管理職**: 部下の評価管理と進捗可視化
- **経営層**: 組織全体の評価状況把握

### 業界・用途
- **システム開発会社**: 技術者の組織管理と評価
- **コンサルティング**: プロジェクトベースの評価管理
- **製造業**: 階層的組織構造の管理
- **サービス業**: 店舗・支店の管理体制

## 🚀 デプロイメント

### Docker本番デプロイ（推奨）
```bash
# 本番用環境変数設定
export NODE_ENV=production

# 本番用ビルドと起動
docker-compose up -d --build

# ヘルスチェック
curl http://localhost/organization/api/health
curl http://localhost/evaluation/api/organization
```

### Vercelデプロイ
```bash
# 組織管理アプリ
cd apps/organization
vercel --prod

# 人事評価アプリ
cd apps/evaluation
vercel --prod
```

### トラブルシューティング
```bash
# コンテナ間通信確認
docker-compose exec evaluation curl http://organization:3000/api/organization

# ログ詳細確認
docker-compose logs --tail=50 organization
docker-compose logs --tail=50 evaluation
docker-compose logs --tail=50 nginx

# キャッシュクリア
docker-compose down -v
docker system prune -f
docker-compose up -d --build
```

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。開発に参加される場合は、以下の手順に従ってください：

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## 📋 開発状況

### ✅ 完了済み機能
- **Dockerコンテナ化**: 3サービス（organization, evaluation, nginx）の統合環境
- **型安全性確保**: TypeScript全型エラー修正完了
- **TailwindCSS安定化**: v3.4.14での統一とスタイル適用確認
- **コンテナ間通信**: 評価アプリから組織管理アプリへのAPI連携
- **被評価者データ表示**: 組織階層に基づく動的な被評価者リスト生成
- **リバースプロキシ**: Nginxによる統合アクセス環境

### 🔧 品質管理状況
- **組織管理アプリ**: 型エラー 0個、ESLint警告 13個
- **評価アプリ**: 型エラー 0個、ESLint警告 3個
- **Docker環境**: 全サービス正常稼働中

### 🚀 次のステップ
- ESLint警告の解消（任意）
- テストの追加（任意）
- 本番環境でのパフォーマンス最適化

---

**ORGANI** - より効率的な組織管理と人事評価を実現するモダンなWebアプリケーション