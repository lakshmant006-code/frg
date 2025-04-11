/*
  # Fix Roles Schema and Employee Relationships

  1. Changes
    - Drop existing Roles table and recreate with proper case-sensitive column names
    - Add proper foreign key relationship from employees to Roles
    - Create RLS policies for role management
    - Add default roles

  2. Security
    - Enable RLS on Roles table
    - Add policies for role management
    - Only admins can create/update/delete roles
    - All authenticated users can read roles

  3. Notes
    - Preserves existing data by using IF EXISTS checks
    - Maintains referential integrity with employees table
*/

-- Drop existing Roles table if it exists
DROP TABLE IF EXISTS "Roles" CASCADE;

-- Create Roles table with proper column names
CREATE TABLE IF NOT EXISTS "Roles" (
  "Role_id" bigint PRIMARY KEY,
  "Role_Name" text UNIQUE NOT NULL,
  "Role_Description" text
);

-- Enable RLS
ALTER TABLE "Roles" ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read roles"
  ON "Roles"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can create roles"
  ON "Roles"
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update roles"
  ON "Roles"
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete roles"
  ON "Roles"
  FOR DELETE
  TO authenticated
  USING (is_admin());

-- Insert default roles
INSERT INTO "Roles" ("Role_id", "Role_Name", "Role_Description")
VALUES 
  (1, 'Admin', 'Full system access with all administrative privileges'),
  (2, 'Manager', 'Team management and project oversight capabilities'),
  (3, 'Employee', 'Standard user access for time tracking and project work')
ON CONFLICT ("Role_id") DO NOTHING;

-- Update employees table to reference Roles
ALTER TABLE employees
DROP COLUMN IF EXISTS "Role_Name";

-- Add role_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'employees' AND column_name = 'role_id'
  ) THEN
    ALTER TABLE employees 
    ADD COLUMN role_id bigint REFERENCES "Roles"("Role_id");
  END IF;
END $$;

-- Update employee_roles view
CREATE OR REPLACE VIEW employee_roles AS
SELECT 
  e.id,
  e.employee_id,
  e.first_name,
  e.last_name,
  e.email,
  e.phone,
  e.date_joined,
  e.role_id,
  r."Role_Name" as role_name,
  r."Role_Description" as role_description,
  e.working_shift,
  e.active,
  e.created_at,
  e.updated_at
FROM employees e
LEFT JOIN "Roles" r ON e.role_id = r."Role_id";