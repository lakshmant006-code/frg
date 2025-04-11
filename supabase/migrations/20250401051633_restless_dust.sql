/*
  # Fix Roles Table and Policies

  1. Changes
    - Drop and recreate Roles table with correct column names
    - Add proper RLS policies
    - Insert default roles
    
  2. Security
    - Enable RLS
    - Allow all authenticated users to read roles
    - Only admins can create/update/delete roles
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS "roles" CASCADE;

-- Create roles table with correct column names
CREATE TABLE IF NOT EXISTS "roles" (
  "role_id" bigint PRIMARY KEY,
  "role_name" text NOT NULL,
  "role_description" text,
  CONSTRAINT roles_role_name_key UNIQUE (role_name)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Insert default roles
INSERT INTO roles (role_id, role_name, role_description)
VALUES 
  (1, 'Admin', 'Full system access with all administrative privileges'),
  (2, 'Manager', 'Team management and project oversight capabilities'),
  (3, 'Employee', 'Standard user access for time tracking and project work')
ON CONFLICT (role_id) DO NOTHING;