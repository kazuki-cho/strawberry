-- employees テーブル作成
CREATE TABLE IF NOT EXISTS employees (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    employee_code text UNIQUE NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    department text,
    position text,
    hire_date date,
    address text,
    phone text
);

-- ダミーデータ挿入
INSERT INTO employees (user_id, employee_code, first_name, last_name, email, password_hash, department, position, hire_date, address, phone) VALUES
  (gen_random_uuid(), 'E001', '太郎', '山田', 'taro.yamada@example.com', 'dummyhash1', '営業', '主任', '2020-04-01', '東京都千代田区1-1-1', '090-1111-1111'),
  (gen_random_uuid(), 'E002', '花子', '佐藤', 'hanako.sato@example.com', 'dummyhash2', '総務', '一般', '2021-05-10', '東京都港区2-2-2', '090-2222-2222'),
  (gen_random_uuid(), 'E003', '一郎', '鈴木', 'ichiro.suzuki@example.com', 'dummyhash3', '開発', 'リーダー', '2019-03-15', '東京都新宿区3-3-3', '090-3333-3333'),
  (gen_random_uuid(), 'E004', '美咲', '高橋', 'misaki.takahashi@example.com', 'dummyhash4', '人事', '主任', '2018-07-20', '東京都渋谷区4-4-4', '090-4444-4444'),
  (gen_random_uuid(), 'E005', '健太', '田中', 'kenta.tanaka@example.com', 'dummyhash5', '営業', '一般', '2022-01-05', '東京都豊島区5-5-5', '090-5555-5555'),
  (gen_random_uuid(), 'E006', 'さくら', '伊藤', 'sakura.ito@example.com', 'dummyhash6', '開発', '一般', '2020-10-12', '東京都板橋区6-6-6', '090-6666-6666'),
  (gen_random_uuid(), 'E007', '直樹', '渡辺', 'naoki.watanabe@example.com', 'dummyhash7', '総務', '主任', '2017-09-30', '東京都江東区7-7-7', '090-7777-7777'),
  (gen_random_uuid(), 'E008', '由美', '中村', 'yumi.nakamura@example.com', 'dummyhash8', '人事', '一般', '2021-11-18', '東京都世田谷区8-8-8', '090-8888-8888'),
  (gen_random_uuid(), 'E009', '翔太', '小林', 'shota.kobayashi@example.com', 'dummyhash9', '開発', '主任', '2019-12-25', '東京都大田区9-9-9', '090-9999-9999'),
  (gen_random_uuid(), 'E010', '恵', '加藤', 'megumi.kato@example.com', 'dummyhash10', '営業', 'リーダー', '2016-02-14', '東京都墨田区10-10-10', '090-1010-1010');
