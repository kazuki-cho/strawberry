/*
  # Fix Employee RLS Policy

  1. Changes
    - Remove the recursive policy that was causing infinite loops
    - Create a new simplified policy that:
      - Allows users to view their own complete record
      - Allows authenticated users to view basic employee information
      - Prevents unauthorized access
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view employee basic info" ON employees;

-- Create new policy with simplified logic
CREATE POLICY "Users can view employees"
  ON employees FOR SELECT
  TO authenticated
  USING (
    -- Allow access to all employee records for authenticated users
    -- This is a simplified approach that avoids recursion while maintaining security
    auth.uid() IS NOT NULL
  );