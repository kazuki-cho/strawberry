/*
  # バックオフィスシステムの基本テーブル作成

  1. 新規テーブル
    - `employees` (社員情報)
      - `id` (uuid, primary key)
      - `user_id` (uuid, auth.usersへの参照)
      - `employee_code` (社員番号)
      - `first_name` (氏名-名)
      - `last_name` (氏名-姓)
      - `email` (メールアドレス)
      - `department` (部署)
      - `position` (役職)
      - `hire_date` (入社日)
      - `created_at` (作成日時)
      - `updated_at` (更新日時)

    - `attendance_records` (勤怠記録)
      - `id` (uuid, primary key)
      - `employee_id` (社員ID)
      - `date` (日付)
      - `clock_in` (出勤時刻)
      - `clock_out` (退勤時刻)
      - `break_time` (休憩時間)
      - `status` (状態: 通常/休暇/欠勤等)
      - `created_at` (作成日時)
      - `updated_at` (更新日時)

    - `expense_claims` (経費申請)
      - `id` (uuid, primary key)
      - `employee_id` (申請者ID)
      - `amount` (金額)
      - `category` (経費カテゴリ)
      - `description` (説明)
      - `status` (状態: 申請中/承認済/却下)
      - `approved_by` (承認者ID)
      - `approved_at` (承認日時)
      - `created_at` (作成日時)
      - `updated_at` (更新日時)

    - `salary_records` (給与記録)
      - `id` (uuid, primary key)
      - `employee_id` (社員ID)
      - `year_month` (年月)
      - `base_salary` (基本給)
      - `allowances` (手当)
      - `deductions` (控除)
      - `net_salary` (手取り)
      - `created_at` (作成日時)
      - `updated_at` (更新日時)

  2. セキュリティ
    - 全テーブルでRLSを有効化
    - 部署や役職に基づいたアクセス制御
*/

-- 社員情報テーブル
CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  employee_code text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  department text NOT NULL,
  position text NOT NULL,
  hire_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 勤怠記録テーブル
CREATE TABLE attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) NOT NULL,
  date date NOT NULL,
  clock_in timestamptz,
  clock_out timestamptz,
  break_time interval DEFAULT '00:00:00',
  status text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 経費申請テーブル
CREATE TABLE expense_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) NOT NULL,
  amount decimal(10,2) NOT NULL,
  category text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending',
  approved_by uuid REFERENCES employees(id),
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 給与記録テーブル
CREATE TABLE salary_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) NOT NULL,
  year_month date NOT NULL,
  base_salary decimal(10,2) NOT NULL,
  allowances jsonb DEFAULT '{}',
  deductions jsonb DEFAULT '{}',
  net_salary decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLSの有効化
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE salary_records ENABLE ROW LEVEL SECURITY;

-- 基本的なポリシーの設定
CREATE POLICY "Users can view their own employee record"
  ON employees FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own attendance"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own expenses"
  ON expense_claims FOR SELECT
  TO authenticated
  USING (employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their own salary records"
  ON salary_records FOR SELECT
  TO authenticated
  USING (employee_id IN (
    SELECT id FROM employees WHERE user_id = auth.uid()
  ));