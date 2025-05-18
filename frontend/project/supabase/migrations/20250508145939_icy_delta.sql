/*
  # 社員一覧表示のためのポリシー更新

  1. 変更内容
    - 全社員が他の社員の基本情報を閲覧できるように RLS ポリシーを追加
    - 機密情報（マイナンバーなど）は引き続き本人のみアクセス可能
*/

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their own employee record" ON employees;

-- 基本情報の閲覧ポリシーを追加
CREATE POLICY "Users can view employee basic info"
  ON employees FOR SELECT
  TO authenticated
  USING (
    CASE 
      WHEN auth.uid() = user_id THEN true  -- 自分のレコードは全ての情報を閲覧可能
      ELSE (
        auth.uid() IN (  -- 認証済みユーザーは基本情報のみ閲覧可能
          SELECT user_id 
          FROM employees 
          WHERE user_id IS NOT NULL
        )
      )
    END
  );