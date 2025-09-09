# ORGANI（組織管理アプリ）

組織構造を視覚的に管理し、社員の異動をドラッグ&ドロップで直感的に操作できるWebアプリケーションです。人事評価システムとの連携も可能で、組織図を超えた柔軟な評価関係管理に対応しています。アクセスToken認証システムにより、権限に応じたアクセス制御を実現しています。

![組織図管理アプリ](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## ✨ 主要機能

### 📊 組織図表示・管理
- **階層的組織構造**: 本部→部→課の3階層構造をサポート
- **視覚的階層識別**: アイコンによる組織階層の直感的な識別（🏢本部・👥部・👔課）
- **アコーディオン表示**: 組織の展開・折りたたみでスッキリとした表示
- **管理職の明確化**: 本部長・部長・課長の役職を視覚的に区別
- **複雑な組織対応**: 本部直轄、課なし部署、兼任役職に対応

### 🔍 高度なフィルター機能
- **名前検索**: 社員名による部分一致検索
- **部門別フィルター**: 本部単位での絞り込み表示
- **役職別フィルター**: 役職による条件検索
- **複合フィルター**: 複数条件の組み合わせ検索
- **自動展開**: 検索結果に該当するアコーディオンの自動展開
- **リアルタイム結果**: 入力と同時に結果が更新

### ✏️ ドラッグ&ドロップ編集
- **直感的な異動操作**: 社員をドラッグ&ドロップで部署間を移動
- **リアルタイム反映**: 変更内容が即座に組織図に反映
- **自動保存**: 編集内容は自動的にサーバーに保存

### 👤 社員情報管理
- **詳細情報表示**: 社員の基本情報、連絡先、入社日など
- **タブ化インターフェース**: 基本情報と評価関係を分離表示
- **編集機能**: 社員情報の直接編集が可能
- **ドラッグ移動**: モーダルウィンドウをドラッグして自由に移動可能

### 🎯 人事評価システム連携
- **評価関係管理**: 評価者と被評価者の関係を柔軟に設定
- **管理職の評価関係**: 本部長→部長、部長→課長の階層的評価関係を正確に反映
- **カスタム評価関係**: 組織階層に関係なく評価者を個別指定可能
- **1次評価者の明確化**: 管理職の評価担当範囲をリアルタイムで可視化
- **部門内制限**: 評価者変更は同一部門内の管理職に限定
- **評価者変更の即座反映**: 評価者変更時に被評価者リストが自動更新

### 🔐 アクセスToken認証システム
- **3段階の権限管理**:
  - **ADMIN（管理者権限）**: 全ての機能にアクセス可能（閲覧・編集・削除）
  - **EDITOR（編集者権限）**: 閲覧・編集が可能（削除は不可）
  - **VIEWER（閲覧者権限）**: 閲覧のみ可能
- **デモToken提供**: 各権限レベルのテスト用アクセスTokenを内蔵
- **ローカルストレージ**: ブラウザにアクセスTokenを安全に保存
- **モーダル認証**: 美しいログイン画面でユーザー体験を向上

### 💾 多様なデータ出力
- **3つのエクスポート形式**:
  1. **組織図（Markdown）**: 組織構造に沿ったデータ出力
  2. **評価関係（Markdown）**: 評価者別の被評価者一覧
  3. **統合データ（CSV）**: 組織図と評価関係を含む全データ
- **データインポート**: JSON形式でのデータ一括更新
- **自動ファイル同期**: サーバーサイドとクライアントサイドのデータ同期

## 🛠️ 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **ドラッグ&ドロップ**: react-dnd + react-dnd-html5-backend
- **アイコン**: React Icons
- **状態管理**: React useState/useEffect + useRef

## 🚀 セットアップ

### 前提条件
- Node.js 18以上
- npm, yarn, pnpm, または bun

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd organi

# 依存関係をインストール
npm install
# または
yarn install
# または
pnpm install
```

### 開発サーバーの起動

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## 🚀 Vercelデプロイメント

### ワンクリックデプロイ

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Takashi-Matsumura/organi)

### 手動デプロイ手順

1. **Vercelアカウントを作成**
   - [vercel.com](https://vercel.com) でアカウント作成

2. **GitHubリポジトリと連携**
   ```bash
   # GitHubリポジトリを作成してプッシュ
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/Takashi-Matsumura/organi.git
   git push -u origin main
   ```

3. **Vercelでプロジェクトをインポート**
   - Vercelダッシュボードで「New Project」
   - GitHubリポジトリを選択
   - プロジェクト設定を確認（自動検出されます）

4. **デプロイ実行**
   - 「Deploy」ボタンをクリック
   - 数分後にデプロイ完了

### デプロイメント設定

プロジェクトには以下の設定が含まれています：

- **next.config.ts**: Vercel最適化設定
- **vercel.json**: デプロイメント設定
- **API Route**: サーバーレス関数対応

### 重要な注意事項

⚠️ **データの永続化について**

Vercel環境では以下の制限があります：
- **ファイルシステムへの書き込み不可**: データはメモリ内でのみ管理
- **セッション内での変更**: サーバー再起動で初期データにリセット
- **デモ用途向け**: 本格運用には外部データベース推奨

### 本格運用時の推奨構成

```typescript
// 推奨: 外部データベース連携例
const DATABASE_OPTIONS = [
  'Supabase (PostgreSQL)',
  'PlanetScale (MySQL)',
  'MongoDB Atlas',
  'Firebase Firestore',
  'Vercel KV (Redis)'
]
```

## 📁 プロジェクト構造

```
organi/
├── app/
│   ├── api/organization/         # 組織データAPI
│   ├── page.tsx                  # メインページ
│   ├── layout.tsx                # アプリケーションレイアウト
│   └── globals.css               # グローバルスタイル
├── components/
│   ├── Accordion.tsx             # アコーディオンコンポーネント
│   ├── AccessTokenInput.tsx      # アクセスToken入力・認証コンポーネント
│   ├── DndOrganizationChart.tsx  # ドラッグ&ドロップ対応組織図
│   ├── DraggableEmployee.tsx     # ドラッグ可能な社員コンポーネント
│   ├── DropZone.tsx              # ドロップゾーンコンポーネント
│   ├── EmployeeEditor.tsx        # 社員編集フォーム
│   ├── EmployeeModal.tsx         # 社員情報モーダル
│   └── OrganizationChart.tsx     # 読み取り専用組織図
├── hooks/
│   └── useTokenAuth.ts           # アクセスToken認証カスタムフック
├── data/
│   └── organization-data.json    # 組織データ（サーバーサイド）
├── public/data/
│   └── organization-data.json    # 組織データ（クライアントサイド）
├── types/
│   └── organization.ts           # TypeScript型定義
└── ...
```

## 📖 使用方法

### アクセスToken認証

#### デモ用アクセスToken
アプリケーション起動時に以下のデモTokenでログインできます：

- **管理者権限**: `demo-admin-token-2024`
  - 全機能にアクセス可能（閲覧・編集・削除）
- **編集者権限**: `demo-editor-token-2024`
  - 閲覧・編集が可能（削除機能は無効）
- **閲覧者権限**: `demo-viewer-token-2024`
  - 閲覧のみ可能（編集・削除機能は無効）

#### ログイン手順
1. アプリケーションにアクセス
2. 中央のログインモーダルでアクセスTokenを入力
3. 「認証」ボタンをクリック
4. ログイン処理完了後、自動的にメイン画面に遷移
5. 右上の権限バッジでログイン状態を確認

### 基本操作

#### 1. 表示モード（全権限）
- 組織図の閲覧
- フィルター機能による社員検索
- 社員をクリックして詳細情報を表示
- 管理職の被評価者一覧を確認

#### 2. 編集モード（EDITOR・ADMIN権限）
- 「編集モード」ボタンで切り替え
- 社員をドラッグ&ドロップで異動
- リアルタイムで組織図が更新

### フィルター機能の使用方法

#### 1. 名前検索
- フィルター欄の「名前検索」に社員名を入力
- 部分一致で該当する社員を検索
- 該当する社員が所属するアコーディオンが自動展開

#### 2. 部門・役職フィルター
- ドロップダウンから条件を選択
- 複数条件の組み合わせ検索が可能
- 「クリア」ボタンで全条件をリセット

### 社員情報の管理

#### 基本情報の編集
1. 社員をクリックしてモーダルを開く
2. 「基本情報」タブで「編集」ボタンをクリック
3. 必要な情報を修正して「保存」

#### モーダルウィンドウの操作
- **移動**: モーダルのヘッダー部分をドラッグして自由に移動
- **背景参照**: モーダルを移動させて背景の組織図を確認しながら情報参照
- **位置リセット**: 新しいモーダルを開く際は中央位置に自動リセット

#### 評価関係の管理（管理職のみ）
1. 管理職をクリックしてモーダルを開く
2. 「被評価者」タブを選択（被評価者数が表示される）
3. 「被評価者編集」ボタンで編集モード
4. ドロップダウンから新しい評価者を選択
5. 変更は即座に反映され、関連する管理職の被評価者リストも自動更新

### データの出力・取り込み

#### エクスポート
「エクスポート」ボタンから3つの形式を選択：
- **組織図（Markdown）**: 組織構造の文書化
- **評価関係（Markdown）**: 人事評価の実施状況
- **統合データ（CSV）**: データ分析・システム連携

#### インポート
「インポート」ボタンからJSON形式のファイルをアップロード

## 🔧 API エンドポイント

### GET /api/organization
組織データを取得

**レスポンス:**
```json
{
  "id": "org-001",
  "name": "株式会社サンプル",
  "departments": [...],
  "employees": [...]
}
```

### PUT /api/organization
組織データを更新

**リクエスト:**
```json
{
  "id": "org-001",
  "name": "株式会社サンプル",
  "departments": [...],
  "employees": [...]
}
```

## 📋 データ構造

### 基本型定義

```typescript
interface Organization {
  id: string
  name: string
  departments: Department[]
  employees: Employee[]
}

interface Department {
  id: string
  name: string
  manager: string
  managerId: string
  sections: Section[]
}

interface Section {
  id: string
  name: string
  manager: string
  managerId: string
  courses: Course[]
}

interface Course {
  id: string
  name: string
  manager: string
  managerId: string
}

interface Employee {
  id: string
  name: string
  position: string
  department: string
  section: string
  course?: string
  email: string
  phone: string
  employeeId: string
  joinDate: string
  birthDate: string
  evaluatorId?: string  // カスタム評価者ID（任意）
}
```

### 評価関係の仕組み

#### デフォルト評価関係
組織階層に基づく自動的な評価関係：
- **本部長**: 本部直轄社員 + 配下の部長を評価
- **部長**: 部直轄社員 + 配下の課長を評価  
- **課長**: 配下の課員を評価
- **管理職自身の評価**: 部長は本部長に評価され、課長は部長に評価される

#### カスタム評価関係
`evaluatorId`フィールドで個別に評価者を指定：
- 組織階層に関係なく評価者を設定可能
- 同一部門内の管理職から選択
- デフォルト関係よりも優先される
- カスタム評価設定時は「カスタム評価」として明示表示

## 🎨 カスタマイズ

### 組織データの初期設定
`data/organization-data.json`を編集して初期組織データをカスタマイズ

### スタイルの変更
Tailwind CSSクラスを使用してUIをカスタマイズ

### 組織構造の拡張
型定義を拡張して4階層以上の組織構造にも対応可能

## 🔒 セキュリティ考慮事項

- 個人情報の適切な取り扱い
- アクセス権限の管理（実装は各環境に依存）
- データの暗号化（本番環境では推奨）

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。
大きな変更を行う前に、まずイシューを開いて議論してください。

## 📄 ライセンス

This project is licensed under the MIT License.

## 🔄 最新の改善点

### 2025年9月9日更新
- **アクセスToken認証システム**: 3段階の権限管理（ADMIN・EDITOR・VIEWER）を実装
- **ログインモーダル**: 美しいログイン画面でユーザー体験を向上
- **権限制御**: 各権限レベルに応じた機能アクセス制御
- **デモToken**: テスト用のアクセスTokenを内蔵して即座にテスト可能
- **スマートヘッダー**: 権限バッジ表示とコンパクトなコントロール配置
- **ドラッグ移動機能**: 社員情報モーダルをドラッグして自由に移動可能
- **視覚的階層識別**: 組織階層にアイコンを追加（🏢本部・👥部・👔課）
- **高度なフィルター機能**: 名前検索・部門別・役職別の複合フィルター機能を実装
- **自動展開機能**: フィルター検索時に該当するアコーディオンの自動展開
- **評価関係の精密化**: 管理職が被評価者として正しく認識される仕様に修正
- **リアルタイム更新**: 評価者変更時に被評価者リストが即座に更新される機能を実装
- **カスタム評価の明示**: カスタム評価関係が設定されている場合の視覚的な識別を改善

### 自動デプロイメントのテスト
このプロジェクトはVercelの自動デプロイメント機能でホスティングされています。
GitHubにプッシュされた変更が自動的にVercelでビルドおよびデプロイされます。

## 👨‍💻 作者

Created with Claude Code - AI-powered development assistant