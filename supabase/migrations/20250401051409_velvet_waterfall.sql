/*
  # Fix Roles Table RLS Policies

  1. Changes
    - Drop existing policies
    - Create new RLS policies with proper permissions
    - Add is_admin function for role-based access control
    
  2. Security
    - Only admin users can create/update/delete roles
    - All authenticated users can read roles
*/

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM employees e
    WHERE e.id = auth.uid()
    AND e.role_id = 1  -- Admin role_id is 1
  );
END;
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read roles" ON roles;
DROP POLICY IF EXISTS "Users can create roles" ON roles;
DROP POLICY IF EXISTS "Users can update roles" ON roles;
DROP POLICY IF EXISTS "Users can delete roles" ON roles;

-- Create new policies with proper permissions
CREATE POLICY "Users can read roles"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create roles"
  ON roles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update roles"
  ON roles
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete roles"
  ON roles
  FOR DELETE
  TO authenticated
  USING (is_admin());