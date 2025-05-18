/*
  # 社員情報テーブルの拡張

  1. 変更内容
    - `employees` テーブルに以下のフィールドを追加:
      - `last_name_kana` (姓カナ)
      - `first_name_kana` (名カナ)
      - `last_name_en` (姓英語)
      - `first_name_en` (名英語)
      - `phone` (電話番号)
      - `emergency_contact` (緊急連絡先)
      - `postal_code` (郵便番号)
      - `prefecture` (都道府県)
      - `city` (市区町村)
      - `address1` (町番地)
      - `address2` (建物名等)
      - `my_number` (マイナンバー)
      - `employment_type` (雇用形態)
*/

DO $$ 
BEGIN
  -- 新しいカラムの追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'last_name_kana') THEN
    ALTER TABLE employees 
      ADD COLUMN last_name_kana text,
      ADD COLUMN first_name_kana text,
      ADD COLUMN last_name_en text,
      ADD COLUMN first_name_en text,
      ADD COLUMN phone text,
      ADD COLUMN emergency_contact text,
      ADD COLUMN postal_code text,
      ADD COLUMN prefecture text,
      ADD COLUMN city text,
      ADD COLUMN address1 text,
      ADD COLUMN address2 text,
      ADD COLUMN my_number text,
      ADD COLUMN employment_type text;
  END IF;
END $$;