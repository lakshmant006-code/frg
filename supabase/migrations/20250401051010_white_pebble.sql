/*
  # Create Roles Table and Policies

  1. New Tables
    - `roles`
      - `role_id` (bigint, primary key)
      - `role_name` (text, unique)
      - `role_description` (text, nullable)

  2. Security
    - Enable RLS on `roles` table
    - Add policies for authenticated users to manage roles
    - Insert default roles (Admin, Manager, Employee)
*/

-- Create roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS roles (
  role_id bigint PRIMARY KEY,
  role_name text NOT NULL,
  role_description text,
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

CREATE POLICY "Users can create roles"
  ON roles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update roles"
  ON roles
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete roles"
  ON roles
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert default roles
INSERT INTO roles (role_id, role_name, role_description)
VALUES 
  (1, 'Admin', 'Full system access with all administrative privileges'),
  (2, 'Manager', 'Team management and project oversight capabilities'),
  (3, 'Employee', 'Standard user access for time tracking and project work')
ON CONFLICT (role_id) DO NOTHING;