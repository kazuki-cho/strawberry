CREATE TABLE IF NOT EXISTS employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code text UNIQUE NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    password_hash text,
    department text,
    position text,
    hire_date date,
    address text,
    phone text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- ダミーデータ挿入
INSERT INTO employees (id, employee_code, first_name, last_name, email, password_hash, department, position, hire_date, address, phone) VALUES
  ('00000000-0000-0000-0000-000000000001', 'E001', '太郎', '山田', 'taro.yamada@example.com', 'dummyhash1', '営業', '主任', '2020-04-01', '東京都千代田区1-1-1', '090-1111-1111'),
  ('00000000-0000-0000-0000-000000000002', 'E002', '花子', '佐藤', 'hanako.sato@example.com', 'dummyhash2', '総務', '一般', '2021-05-10', '東京都港区2-2-2', '090-2222-2222'),
  ('00000000-0000-0000-0000-000000000003', 'E003', '一郎', '鈴木', 'ichiro.suzuki@example.com', 'dummyhash3', '開発', 'リーダー', '2019-03-15', '東京都新宿区3-3-3', '090-3333-3333'),
  ('00000000-0000-0000-0000-000000000004', 'E004', '美咲', '高橋', 'misaki.takahashi@example.com', 'dummyhash4', '人事', '主任', '2018-07-20', '東京都渋谷区4-4-4', '090-4444-4444'),
  ('00000000-0000-0000-0000-000000000005', 'E005', '健太', '田中', 'kenta.tanaka@example.com', 'dummyhash5', '営業', '一般', '2022-01-05', '東京都豊島区5-5-5', '090-5555-5555'),
  ('00000000-0000-0000-0000-000000000006', 'E006', 'さくら', '伊藤', 'sakura.ito@example.com', 'dummyhash6', '開発', '一般', '2020-10-12', '東京都板橋区6-6-6', '090-6666-6666'),
  ('00000000-0000-0000-0000-000000000007', 'E007', '直樹', '渡辺', 'naoki.watanabe@example.com', 'dummyhash7', '総務', '主任', '2017-09-30', '東京都江東区7-7-7', '090-7777-7777'),
  ('00000000-0000-0000-0000-000000000008', 'E008', '由美', '中村', 'yumi.nakamura@example.com', 'dummyhash8', '人事', '一般', '2021-11-18', '東京都世田谷区8-8-8', '090-8888-8888'),
  ('00000000-0000-0000-0000-000000000009', 'E009', '翔太', '小林', 'shota.kobayashi@example.com', 'dummyhash9', '開発', '主任', '2019-12-25', '東京都大田区9-9-9', '090-9999-9999'),
  ('00000000-0000-0000-0000-000000000010', 'E010', '恵', '加藤', 'megumi.kato@example.com', 'dummyhash10', '営業', 'リーダー', '2016-02-14', '東京都墨田区10-10-10', '090-1010-1010');

-- 給与設定テーブル
CREATE TABLE IF NOT EXISTS employee_salary_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid UNIQUE NOT NULL REFERENCES employees(id),
    base_salary integer NOT NULL DEFAULT 0, -- 基本月給
    life_plan_allowance integer NOT NULL DEFAULT 0, -- 生涯設計手当
    dc_pension_contribution integer NOT NULL DEFAULT 0, -- 確定拠出年金掛金
    professional_allowance integer NOT NULL DEFAULT 0, -- 職能給
    fixed_overtime_pay integer NOT NULL DEFAULT 0, -- 固定残業代
    deductions jsonb, -- その他控除
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 給与履歴テーブル
CREATE TABLE IF NOT EXISTS salary_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id uuid NOT NULL REFERENCES employees(id),
    year_month date NOT NULL, -- 対象年月 (例: 2025-07-01)
    gross_salary integer NOT NULL, -- 総支給額
    net_salary integer NOT NULL, -- 手取り額
    details jsonb, -- 給与計算の詳細（基本給、手当、控除、税金など）
    calculation_date timestamptz NOT NULL DEFAULT now(),
    UNIQUE(employee_id, year_month)
);

-- 給与履歴のダミーデータ
-- E001 山田太郎
INSERT INTO salary_records (employee_id, year_month, gross_salary, net_salary, details) VALUES
((SELECT id FROM employees WHERE employee_code = 'E001'), '2024-05-01', 300000, 250000, '{"type": "salary", "base": 280000, "overtime": 20000}'),
((SELECT id FROM employees WHERE employee_code = 'E001'), '2024-06-01', 310000, 260000, '{"type": "salary", "base": 280000, "overtime": 30000}'),
((SELECT id FROM employees WHERE employee_code = 'E001'), '2024-06-15', 150000, 120000, '{"type": "bonus", "reason": "Summer Bonus"}');

-- E002 佐藤花子
INSERT INTO salary_records (employee_id, year_month, gross_salary, net_salary, details) VALUES
((SELECT id FROM employees WHERE employee_code = 'E002'), '2024-05-01', 280000, 230000, '{"type": "salary", "base": 280000, "overtime": 0}'),
((SELECT id FROM employees WHERE employee_code = 'E002'), '2024-06-01', 280000, 230000, '{"type": "salary", "base": 280000, "overtime": 0}');


-- updated_atを自動更新するためのトリガー
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- employeesテーブルのトリガー
CREATE TRIGGER set_employees_timestamp
BEFORE UPDATE ON employees
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- employee_salary_settingsテーブルのトリガー
CREATE TRIGGER set_employee_salary_settings_timestamp
BEFORE UPDATE ON employee_salary_settings
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Master tables from V2
CREATE TABLE IF NOT EXISTS compensation_grades (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    grade INT NOT NULL,
    standard_remuneration INT NOT NULL,
    remuneration_range_min INT NOT NULL,
    remuneration_range_max INT,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title, grade)
);
CREATE TABLE IF NOT EXISTS insurance_rates (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    insurance_type VARCHAR(255) NOT NULL,
    rate NUMERIC(8, 6) NOT NULL,
    effective_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(title, insurance_type)
);

-- Comments from V2
COMMENT ON TABLE compensation_grades IS '健康保険・厚生年金保険の標準報酬月額等級マスタ';
COMMENT ON COLUMN compensation_grades.title IS '等級表のタイトル（例: 令和5年3月分）';
COMMENT ON COLUMN compensation_grades.grade IS '等級';
COMMENT ON COLUMN compensation_grades.standard_remuneration IS '標準報酬月額';
COMMENT ON COLUMN compensation_grades.remuneration_range_min IS '報酬月額範囲（下限）';
COMMENT ON COLUMN compensation_grades.remuneration_range_max IS '報酬月額範囲（上限）';
COMMENT ON COLUMN compensation_grades.effective_date IS 'この等級表が有効になる年月日';
COMMENT ON TABLE insurance_rates IS '各種保険料率のマスタ';
COMMENT ON COLUMN insurance_rates.title IS '料率表のタイトル（例: 令和5年3月分）';
COMMENT ON COLUMN insurance_rates.insurance_type IS '保険種類（例: 健康保険料率）';
COMMENT ON COLUMN insurance_rates.rate IS '保険料率';
COMMENT ON COLUMN insurance_rates.effective_date IS 'この料率が有効になる年月日';

-- Triggers for master tables
CREATE TRIGGER set_compensation_grades_timestamp
BEFORE UPDATE ON compensation_grades
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_insurance_rates_timestamp
BEFORE UPDATE ON insurance_rates
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

-- Initial data for master tables from V3 and V4
INSERT INTO compensation_grades (title, grade, remuneration_range_min, remuneration_range_max, standard_remuneration, effective_date) VALUES
('令和5年3月分', 1, 0, 63000, 58000, '2023-03-01'),
('令和5年3月分', 2, 63000, 73000, 68000, '2023-03-01'),
('令和5年3月分', 3, 73000, 83000, 78000, '2023-03-01'),
('令和5年3月分', 4, 83000, 93000, 88000, '2023-03-01'),
('令和5年3月分', 5, 93000, 101000, 98000, '2023-03-01'),
('令和5年3月分', 6, 101000, 107000, 104000, '2023-03-01'),
('令和5年3月分', 7, 107000, 114000, 110000, '2023-03-01'),
('令和5年3月分', 8, 114000, 122000, 118000, '2023-03-01'),
('令和5年3月分', 9, 122000, 130000, 126000, '2023-03-01'),
('令和5年3月分', 10, 130000, 138000, 134000, '2023-03-01'),
('令和5年3月分', 11, 138000, 146000, 142000, '2023-03-01'),
('令和5年3月分', 12, 146000, 155000, 150000, '2023-03-01'),
('令和5年3月分', 13, 155000, 165000, 160000, '2023-03-01'),
('令和5年3月分', 14, 165000, 175000, 170000, '2023-03-01'),
('令和5年3月分', 15, 175000, 185000, 180000, '2023-03-01'),
('令和5年3月分', 16, 185000, 195000, 190000, '2023-03-01'),
('令和5年3月分', 17, 195000, 210000, 200000, '2023-03-01'),
('令和5年3月分', 18, 210000, 230000, 220000, '2023-03-01'),
('令和5年3月分', 19, 230000, 250000, 240000, '2023-03-01'),
('令和5年3月分', 20, 250000, 270000, 260000, '2023-03-01'),
('令和5年3月分', 21, 270000, 290000, 280000, '2023-03-01'),
('令和5年3月分', 22, 290000, 310000, 300000, '2023-03-01'),
('令和5年3月分', 23, 310000, 330000, 320000, '2023-03-01'),
('令和5年3月分', 24, 330000, 350000, 340000, '2023-03-01'),
('令和5年3月分', 25, 350000, 370000, 360000, '2023-03-01'),
('令和5年3月分', 26, 370000, 395000, 380000, '2023-03-01'),
('令和5年3月分', 27, 395000, 425000, 410000, '2023-03-01'),
('令和5年3月分', 28, 425000, 455000, 440000, '2023-03-01'),
('令和5年3月分', 29, 455000, 485000, 470000, '2023-03-01'),
('令和5年3月分', 30, 485000, 515000, 500000, '2023-03-01'),
('令和5年3月分', 31, 515000, 545000, 530000, '2023-03-01'),
('令和5年3月分', 32, 545000, 575000, 560000, '2023-03-01'),
('令和5年3月分', 33, 575000, 605000, 590000, '2023-03-01'),
('令和5年3月分', 34, 605000, 635000, 620000, '2023-03-01'),
('令和5年3月分', 35, 635000, 665000, 650000, '2023-03-01'),
('令和5年3月分', 36, 665000, 695000, 680000, '2023-03-01'),
('令和5年3月分', 37, 695000, 730000, 710000, '2023-03-01'),
('令和5年3月分', 38, 730000, 770000, 750000, '2023-03-01'),
('令和5年3月分', 39, 770000, 810000, 790000, '2023-03-01'),
('令和5年3月分', 40, 810000, 855000, 830000, '2023-03-01'),
('令和5年3月分', 41, 855000, 905000, 880000, '2023-03-01'),
('令和5年3月分', 42, 905000, 955000, 930000, '2023-03-01'),
('令和5年3月分', 43, 955000, 1005000, 980000, '2023-03-01'),
('令和5年3月分', 44, 1005000, 1055000, 1030000, '2023-03-01'),
('令和5年3月分', 45, 1055000, 1105000, 1090000, '2023-03-01'),
('令和5年3月分', 46, 1105000, 1155000, 1150000, '2023-03-01'),
('令和5年3月分', 47, 1155000, 1205000, 1210000, '2023-03-01'),
('令和5年3月分', 48, 1205000, 1255000, 1270000, '2023-03-01'),
('令和5年3月分', 49, 1255000, 1305000, 1330000, '2023-03-01'),
('令和5年3月分', 50, 1355000, NULL, 1390000, '2023-03-01');

INSERT INTO compensation_grades (title, grade, remuneration_range_min, remuneration_range_max, standard_remuneration, effective_date) VALUES
('令和6年3月分', 1, 0, 63000, 58000, '2024-03-01'),
('令和6年3月分', 2, 63000, 73000, 68000, '2024-03-01'),
('令和6年3月分', 3, 73000, 83000, 78000, '2024-03-01'),
('令和6年3月分', 4, 83000, 93000, 88000, '2024-03-01'),
('令和6年3月分', 5, 93000, 101000, 98000, '2024-03-01'),
('令和6年3月分', 6, 101000, 107000, 104000, '2024-03-01'),
('令和6年3月分', 7, 107000, 114000, 110000, '2024-03-01'),
('令和6年3月分', 8, 114000, 122000, 118000, '2024-03-01'),
('令和6年3月分', 9, 122000, 130000, 126000, '2024-03-01'),
('令和6年3月分', 10, 130000, 138000, 134000, '2024-03-01'),
('令和6年3月分', 11, 138000, 146000, 142000, '2024-03-01'),
('令和6年3月分', 12, 146000, 155000, 150000, '2024-03-01'),
('令和6年3月分', 13, 155000, 165000, 160000, '2024-03-01'),
('令和6年3月分', 14, 165000, 175000, 170000, '2024-03-01'),
('令和6年3月分', 15, 175000, 185000, 180000, '2024-03-01'),
('令和6年3月分', 16, 185000, 195000, 190000, '2024-03-01'),
('令和6年3月分', 17, 195000, 210000, 200000, '2024-03-01'),
('令和6年3月分', 18, 210000, 230000, 220000, '2024-03-01'),
('令和6年3月分', 19, 230000, 250000, 240000, '2024-03-01'),
('令和6年3月分', 20, 250000, 270000, 260000, '2024-03-01'),
('令和6年3月分', 21, 270000, 290000, 280000, '2024-03-01'),
('令和6年3月分', 22, 290000, 310000, 300000, '2024-03-01'),
('令和6年3月分', 23, 310000, 330000, 320000, '2024-03-01'),
('令和6年3月分', 24, 330000, 350000, 340000, '2024-03-01'),
('令和6年3月分', 25, 350000, 370000, 360000, '2024-03-01'),
('令和6年3月分', 26, 370000, 395000, 380000, '2024-03-01'),
('令和6年3月分', 27, 395000, 425000, 410000, '2024-03-01'),
('令和6年3月分', 28, 425000, 455000, 440000, '2024-03-01'),
('令和6年3月分', 29, 455000, 485000, 470000, '2024-03-01'),
('令和6年3月分', 30, 485000, 515000, 500000, '2024-03-01'),
('令和6年3月分', 31, 515000, 545000, 530000, '2024-03-01'),
('令和6年3月分', 32, 545000, 575000, 560000, '2024-03-01'),
('令和6年3月分', 33, 575000, 605000, 590000, '2024-03-01'),
('令和6年3月分', 34, 605000, 635000, 620000, '2024-03-01'),
('令和6年3月分', 35, 635000, 665000, 650000, '2024-03-01'),
('令和6年3月分', 36, 665000, 695000, 680000, '2024-03-01'),
('令和6年3月分', 37, 695000, 730000, 710000, '2024-03-01'),
('令和6年3月分', 38, 730000, 770000, 750000, '2024-03-01'),
('令和6年3月分', 39, 770000, 810000, 790000, '2024-03-01'),
('令和6年3月分', 40, 810000, 855000, 830000, '2024-03-01'),
('令和6年3月分', 41, 855000, 905000, 880000, '2024-03-01'),
('令和6年3月分', 42, 905000, 955000, 930000, '2024-03-01'),
('令和6年3月分', 43, 955000, 1005000, 980000, '2024-03-01'),
('令和6年3月分', 44, 1005000, 1055000, 1030000, '2024-03-01'),
('令和6年3月分', 45, 1055000, 1105000, 1090000, '2024-03-01'),
('令和6年3月分', 46, 1105000, 1155000, 1150000, '2024-03-01'),
('令和6年3月分', 47, 1155000, 1205000, 1210000, '2024-03-01'),
('令和6年3月分', 48, 1205000, 1255000, 1270000, '2024-03-01'),
('令和6年3月分', 49, 1255000, 1305000, 1330000, '2024-03-01'),
('令和6年3月分', 50, 1355000, NULL, 1390000, '2024-03-01');

INSERT INTO insurance_rates (title, insurance_type, rate, effective_date) VALUES
('令和6年3月分', '健康保険料率', 0.0998, '2024-03-01'),
('令和6年3月分', '厚生年金保険料率', 0.1830, '2024-03-01'),
('令和6年3月分', '雇用保険料率（本人負担）', 0.006, '2024-04-01'),
('令和6年3月分', '雇用保険料率（会社負担）', 0.0095, '2024-04-01'),
('令和6年3月分', '子ども・子育て拠出金率', 0.0036, '2024-04-01');
INSERT INTO insurance_rates (title, insurance_type, rate, effective_date) VALUES
('令和5年3月分', '健康保険料率', 0.0991, '2023-03-01'),
('令和5年3月分', '厚生年金保険料率', 0.1830, '2023-03-01'),
('令和5年3月分', '雇用保険料率（本人負担）', 0.006, '2023-04-01'),
('令和5年3月分', '雇用保険料率（会社負担）', 0.0095, '2023-04-01'),
('令和5年3月分', '子ども・子育て拠出金率', 0.0036, '2023-04-01');