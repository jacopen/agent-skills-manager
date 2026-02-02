# TypeScript Coding Standards

## 基本原則

- 型安全性を最優先
- 明示的な型定義を使用
- any型は避ける

## 命名規則

- クラス名: PascalCase
- 関数名: camelCase
- 定数名: UPPER_SNAKE_CASE
- インターフェース名: PascalCase (Iプレフィックスなし)

## インポート順序

1. 外部ライブラリ
2. 内部モジュール
3. 型定義

## エラー処理

- 型安全なエラーハンドリング
- カスタムエラークラスの使用
- async/await優先

## テスト

- 各関数に対する単体テスト
- 統合テストの実施