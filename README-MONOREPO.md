# ORGANI モノレポ構成

Turborepoを使用したモノレポ構成で、組織管理アプリと人事評価アプリを独立したNext.jsアプリケーションとして運用します。

## 🏗️ プロジェクト構成

```
organi-monorepo/
├── apps/
│   ├── organization/          # 組織管理アプリ (port 3000)
│   │   ├── app/
│   │   ├── components/
│   │   ├── package.json
│   │   └── Dockerfile
│   └── evaluation/            # 人事評価アプリ (port 3001)
│       ├── app/
│       ├── components/
│       ├── package.json
│       └── Dockerfile
├── packages/
│   ├── shared-ui/             # 共通UIコンポーネント
│   ├── auth/                  # 認証ライブラリ
│   └── types/                 # 共通型定義
├── turbo.json                 # Turborepo設定
├── docker-compose.yml         # Docker統合環境
└── package.json               # ルートpackage.json
```

## 🚀 開発環境セットアップ

### 1. 依存関係のインストール
```bash
# ルートでモノレポ全体の依存関係をインストール
npm install
```

### 2. 開発サーバーの起動

#### **Option A: 両アプリを並行起動**
```bash
npm run dev
```
- 組織管理アプリ: http://localhost:3000
- 人事評価アプリ: http://localhost:3001

#### **Option B: 個別アプリの起動**
```bash
# 組織管理アプリのみ
npm run dev:organization

# 人事評価アプリのみ
npm run dev:evaluation
```

## 🐳 Docker環境での実行

### 開発環境（Hot Reload付き）
```bash
# 全サービスを起動
docker-compose up -d

# ログの確認
docker-compose logs -f

# 特定サービスのみ起動
docker-compose up organization
docker-compose up evaluation
```

### アクセスURL
- **組織管理アプリ**: http://localhost:3000
- **人事評価アプリ**: http://localhost:3001
- **統合アクセス（Nginx経由）**: http://localhost
  - http://localhost/organization → 組織管理
  - http://localhost/evaluation → 人事評価

## 🔧 利用可能なコマンド

### ルートレベルのコマンド
```bash
npm run dev                    # 全アプリの開発サーバー起動
npm run build                  # 全アプリのビルド
npm run start                  # 全アプリの本番起動
npm run lint                   # 全アプリのリント実行
npm run type-check             # 全アプリの型チェック

# 個別アプリコマンド
npm run dev:organization       # 組織管理アプリのみ開発
npm run dev:evaluation        # 人事評価アプリのみ開発
npm run build:organization    # 組織管理アプリのみビルド
npm run build:evaluation      # 人事評価アプリのみビルド
```

### アプリケーション固有のコマンド
```bash
# apps/organization/ ディレクトリ内で
cd apps/organization
npm run dev      # ポート3000で起動
npm run build
npm run start

# apps/evaluation/ ディレクトリ内で
cd apps/evaluation
npm run dev      # ポート3001で起動
npm run build
npm run start
```

## 📦 共通ライブラリ

### @organi/types
```typescript
import { Organization, Employee, Evaluation } from '@organi/types';
```

### @organi/auth
```typescript
import { useTokenAuth, generateToken, verifyToken } from '@organi/auth';
```

### @organi/shared-ui
```typescript
import { Button, Modal } from '@organi/shared-ui';
```

## 🔄 アプリケーション間の連携

- **組織管理 → 人事評価**: 「評価システム」ボタンから `http://localhost:3001` へリンク
- **人事評価 → 組織管理**: 「組織管理へ」ボタンから `http://localhost:3000` へリンク
- 各アプリは独立して動作し、認証情報は共通ライブラリで管理

## 🛠️ トラブルシューティング

### ポート競合の場合
```bash
# ポート使用状況確認
lsof -i :3000
lsof -i :3001

# プロセス終了
kill -9 <PID>
```

### 依存関係の問題
```bash
# 全体の依存関係を再インストール
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### Docker関連
```bash
# コンテナとネットワークのクリーンアップ
docker-compose down -v
docker system prune -a

# イメージの再ビルド
docker-compose build --no-cache
```

## 🚀 本番環境デプロイ

### 個別デプロイ
各アプリケーションを独立してデプロイ可能：

```bash
# 組織管理アプリ
cd apps/organization
npm run build
npm run start

# 人事評価アプリ
cd apps/evaluation
npm run build
npm run start
```

### Docker統合デプロイ
```bash
# 本番用ビルド
docker-compose build
docker-compose up -d
```

## 🎯 開発のメリット

1. **独立性**: 各アプリが独立して開発・デプロイ可能
2. **共通化**: 認証、UI、型定義の共有によるコードの再利用
3. **スケーラビリティ**: 個別のスケーリングとメンテナンス
4. **開発効率**: ホットリロード、並行開発のサポート
5. **運用柔軟性**: Docker、Kubernetes対応