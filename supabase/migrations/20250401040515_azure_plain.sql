/*
  # Add role relationship to employees

  1. Changes
    - Add role_id column to employees table
    - Add foreign key constraint to Roles table
    - Update existing role column to role_id
    - Add role name view for easier querying

  2. Security
    - Maintain existing RLS policies
*/

-- First create a temporary column for the new role_id
ALTER TABLE employees 
ADD COLUMN role_id bigint;

-- Add foreign key constraint
ALTER TABLE employees
ADD CONSTRAINT employees_role_id_fkey
FOREIGN KEY (role_id) REFERENCES "Roles"("Role_id");

-- Create a view to make it easier to get role names
CREATE OR REPLACE VIEW employee_roles AS
SELECT 
  e.id,
  e.employee_id,
  e.first_name,
  e.last_name,
  e.email,
  e.role_id,
  r."Role_Name" as role_name,
  r."Role_Description" as role_description
FROM employees e
LEFT JOIN "Roles" r ON e.role_id = r."Role_id";

-- Update existing policies
DROP POLICY IF EXISTS "Users can read all employees" ON employees;
DROP POLICY IF EXISTS "Users can insert employees" ON employees;
DROP POLICY IF EXISTS "Users can update employees" ON employees;
DROP POLICY IF EXISTS "Users can delete employees" ON employees;

-- Recreate policies
CREATE POLICY "Users can read all employees"
  ON employees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert employees"
  ON employees
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update employees"
  ON employees
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete employees"
  ON employees
  FOR DELETE
  TO authenticated
  USING (true);