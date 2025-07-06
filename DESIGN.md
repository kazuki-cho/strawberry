# Strawberry アプリケーション設計情報

## 1. 概要

Strawberryは、従業員管理、経費申請、勤怠管理などの機能を提供する社内向けWebアプリケーションです。

## 2. 技術スタック

- **フロントエンド:** React, TypeScript, Vite, Tailwind CSS
- **バックエンド:** Node.js, Express, TypeScript
- **データベース:** PostgreSQL
- **コンテナ化:** Docker, Docker Compose
- **リバースプロキシ:** Nginx

## 3. 機能一覧

### 3.1. 認証

- メールアドレスとパスワードによるログイン機能
- ログアウト機能
- 認証状態の確認 (セッション管理)

### 3.2. 従業員管理

- 従業員一覧の表示
- 従業員詳細の表示
- 従業員の新規登録

### 3.3. 経費申請

- 経費申請一覧の表示
- 経費の新規申請
- 経費の検索

### 3.4. 勤怠管理

- 勤怠記録一覧の表示
- 勤怠情報の修正
- 休暇申請

## 4. データベース設計

### 4.1. `employees` テーブル

| カラム名 | データ型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| user_id | uuid | ユーザーID (Supabase連携の名残) |
| employee_code | text | 社員番号 (ユニーク) |
| first_name | text | 名 |
| last_name | text | 姓 |
| email | text | メールアドレス (ユニーク) |
| password_hash | text | ハッシュ化されたパスワード |
| department | text | 部署 |
| position | text | 役職 |
| hire_date | date | 入社日 |
| ... | ... | (その他、住所、連絡先などの詳細情報) |

### 4.2. `attendance_records` テーブル

| カラム名 | データ型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| employee_id | uuid | 従業員ID (employeesテーブルへの外部キー) |
| date | date | 日付 |
| clock_in | timestamptz | 出勤時刻 |
| clock_out | timestamptz | 退勤時刻 |
| break_time | interval | 休憩時間 |
| status | text | 状態 (通常勤務, 有給休暇など) |

### 4.3. `expense_claims` テーブル

| カラム名 | データ型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| employee_id | uuid | 従業員ID (employeesテーブルへの外部キー) |
| amount | decimal | 金額 |
| category | text | カテゴリ (交通費, 接待費など) |
| description | text | 説明 |
| status | text | ステータス (pending, approved, rejected) |
| approved_by | uuid | 承認者の従業員ID |
| approved_at | timestamptz | 承認日時 |

### 4.4. `salary_records` テーブル

| カラム名 | データ型 | 説明 |
|---|---|---|
| id | uuid | 主キー |
| employee_id | uuid | 従業員ID (employeesテーブルへの外部キー) |
| year_month | date | 年月 |
| base_salary | decimal | 基本給 |
| allowances | jsonb | 手当 |
| deductions | jsonb | 控除 |
| net_salary | decimal | 差引支給額 |

## 5. APIエンドポイント (バックエンド)

- `POST /api/auth/login`: ログイン
- `POST /api/auth/logout`: ログアウト
- `GET /api/auth/me`: 認証状態の確認
- `GET /api/employees`: 従業員一覧の取得

(注: 現在の実装では、経費申請、勤怠管理などのAPIは未実装です)

## 6. フロントエンドルーティング

- `/login`: ログインページ
- `/`: ホームページ (ダッシュボード)
- `/employees`: 従業員一覧ページ
- `/employees/new`: 従業員登録ページ
- `/employees/:id`: 従業員詳細ページ
- `/expenses`: 経費申請ページ
- `/attendance`: 勤怠管理ページ
- `/attendance/edit`: 勤怠修正ページ
- `/attendance/leave`: 休暇申請ページ
