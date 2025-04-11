/*
  # Add employee_id to project_activities table

  1. Changes
    - Add employee_id column to project_activities table
    - Add foreign key constraint to employees table
    - Update RLS policies to include the new column

  2. Security
    - Maintain existing RLS policies
    - Ensure proper foreign key constraints
*/

-- Add employee_id column
ALTER TABLE project_activities
ADD COLUMN employee_id uuid REFERENCES employees(id) ON DELETE SET NULL;

-- Update existing policies to include employee_id
DROP POLICY IF EXISTS "Users can read project activities" ON project_activities;
DROP POLICY IF EXISTS "Users can insert project activities" ON project_activities;
DROP POLICY IF EXISTS "Users can update project activities" ON project_activities;
DROP POLICY IF EXISTS "Users can delete project activities" ON project_activities;

-- Recreate policies with employee_id included
CREATE POLICY "Users can read project activities"
  ON project_activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert project activities"
  ON project_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update project activities"
  ON project_activities
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete project activities"
  ON project_activities
  FOR DELETE
  TO authenticated
  USING (true);