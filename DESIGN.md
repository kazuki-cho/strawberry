# Strawberry アプリケーション設計情報

## 1. 概要

Strawberryは、従業員管理と給与管理機能を提供する社内向けWebアプリケーションです。

## 2. 技術スタック

- **フロントエンド:** React, TypeScript, Vite, Material-UI
- **バックエンド:** Python, Flask
- **データベース:** PostgreSQL
- **コンテナ化:** Docker, Docker Compose
- **リバースプロキシ:** Nginx

## 3. 機能一覧

### 3.1. 従業員管理

- 従業員一覧の表示 (ページネーション対応)
- 従業員詳細の表示
- 従業員情報の更新

### 3.2. 給与管理

- **給与設定:**
    - 従業員ごとの給与設定（基本給、手当、控除）の一覧表示
    - 従業員ごとの給与設定の更新
- **給与履歴:**
    - 給与履歴の一覧表示と検索（従業員番号、氏名、年月、種別）
    - 給与履歴詳細の表示
    - 給与履歴の新規作成、更新、削除
    - 給与明細の一括生成（指定年月の給与・賞与）

## 4. データベース設計

### 4.1. `employees` テーブル

| カラム名 | データ型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| employee_code | text | 社員番号 (ユニーク) |
| first_name | text | 名 |
| last_name | text | 姓 |
| email | text | メールアドレス |
| password_hash | text | ハッシュ化されたパスワード (現在未使用) |
| department | text | 部署 |
| position | text | 役職 |
| hire_date | date | 入社日 |
| address | text | 住所 |
| phone | text | 電話番号 |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### 4.2. `employee_salary_settings` テーブル

| カラム名 | データ型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| employee_id | uuid | 従業員ID (employeesテーブルへの外部キー) |
| base_salary | integer | 基本月給 |
| life_plan_allowance | integer | 生涯設計手当 |
| dc_pension_contribution | integer | 確定拠出年金掛金 |
| professional_allowance | integer | 職能給 |
| fixed_overtime_pay | integer | 固定残業代 |
| deductions | jsonb | その他控除 |

### 4.3. `salary_records` テーブル

| カラム名 | データ型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| employee_id | uuid | 従業員ID (employeesテーブルへの外部キー) |
| year_month | date | 対象年月 |
| gross_salary | integer | 総支給額 |
| net_salary | integer | 手取り額 |
| details | jsonb | 給与計算の詳細 |
| calculation_date | timestamptz | 計算日時 |

## 5. APIエンドポイント (バックエンド)

- `GET /api/employees`: 従業員一覧の取得
- `GET /api/employees/<employee_id>`: 従業員詳細の取得
- `PUT /api/employees/<employee_id>`: 従業員情報の更新
- `GET /api/employees/salary-settings`: 全従業員の給与設定一覧の取得
- `GET /api/employees/<employee_id>/salary`: 特定従業員の給与設定の取得
- `POST /api/employees/<employee_id>/salary`: 特定従業員の給与設定の更新 (UPSERT)
- `GET /api/salary_records`: 給与履歴の一覧取得 (フィルタリング、ページネーション対応)
- `POST /api/salary_records`: 給与履歴の新規作成
- `GET /api/salary_records/<record_id>`: 給与履歴詳細の取得
- `PUT /api/salary_records/<record_id>`: 給与履歴の更新
- `DELETE /api/salary_records`: 複数の給与履歴の削除
- `POST /api/salary_records/generate`: 給与明細の一括生成

## 6. フロントエンドルーティング

- `/`: 従業員一覧ページ
- `/employees/:employeeId`: 従業員詳細ページ
- `/salary-settings`: 給与設定一覧ページ
- `/salary-settings/:employeeId`: 従業員ごとの給与設定ページ
- `/salary-history`: 給与履歴一覧ページ
- `/salary-history/:recordId`: 給与履歴詳細ページ
- `/salary-history/edit/:recordId`: 給与履歴編集ページ
- `/salary-dashboard`: 給与ダッシュボードページ (TODO)