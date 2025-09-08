# organi（組織図管理アプリ）

組織構造を視覚的に管理し、社員の異動をドラッグ&ドロップで直感的に操作できるWebアプリケーションです。

![組織図管理アプリ](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)

## 機能

### 📊 組織図表示
- 階層的な組織構造の表示（本部→部→課）
- アコーディオン形式で組織の展開・折りたたみが可能
- 管理職（本部長・部長・課長）の明確な表示
- 社員情報のモーダル表示

### ✏️ ドラッグ&ドロップ編集
- 社員をドラッグ&ドロップで異動
- リアルタイムでの組織変更
- 変更内容の自動保存

### 💾 データ管理
- JSONファイルでのデータ永続化
- マークダウン形式でのエクスポート（AI分析用）
- JSONファイルからのインポート
- 自動的なファイル同期（data/とpublic/data/）

### 🎯 複雑な組織構造対応
- 本部長直下の直轄社員
- 課を持たない部署
- 部長兼課長などの兼任役職

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **ドラッグ&ドロップ**: react-dnd + react-dnd-html5-backend
- **アイコン**: React Icons
- **状態管理**: React useState/useEffect

## セットアップ

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

## プロジェクト構造

```
organi/
├── app/
│   ├── api/organization/         # 組織データAPI
│   ├── page.tsx                  # メインページ
│   └── ...
├── components/
│   ├── Accordion.tsx             # アコーディオンコンポーネント
│   ├── DndOrganizationChart.tsx  # ドラッグ&ドロップ対応組織図
│   ├── DraggableEmployee.tsx     # ドラッグ可能な社員コンポーネント
│   ├── DropZone.tsx              # ドロップゾーンコンポーネント
│   ├── EmployeeModal.tsx         # 社員情報モーダル
│   └── OrganizationChart.tsx     # 読み取り専用組織図
├── data/
│   └── organization-data.json    # 組織データ（サーバーサイド）
├── public/data/
│   └── organization-data.json    # 組織データ（クライアントサイド）
├── types/
│   └── organization.ts           # TypeScript型定義
└── ...
```

## 使用方法

### 基本操作
1. **表示モード**: 組織図の閲覧、社員情報の確認
2. **編集モード**: ドラッグ&ドロップでの社員異動

### データのエクスポート/インポート
- **エクスポート**: マークダウン形式（.md）でダウンロード
- **インポート**: JSON形式（.json）でアップロード

### 社員の異動
1. 「編集モード」に切り替え
2. 社員をドラッグして移動先の部署にドロップ
3. 変更は自動的に保存されます

## API エンドポイント

### GET /api/organization
組織データを取得

### PUT /api/organization
組織データを更新

## データ形式

組織データはJSONで管理され、以下の構造になっています：

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
}
```

## カスタマイズ

### 組織データの初期設定
`data/organization-data.json` を編集して、初期組織データをカスタマイズできます。

### スタイルの変更
Tailwind CSSクラスを使用してスタイルをカスタマイズできます。

## ライセンス

This project is licensed under the MIT License.

## 作者

Created with Claude Code