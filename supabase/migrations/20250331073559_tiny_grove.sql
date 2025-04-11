/*
  # Add actual hours to project activities table

  1. Changes
    - Add actual_hours column to project_activities table
    - Add check constraint to ensure actual_hours is non-negative
    - Update RLS policies to include the new column

  2. Security
    - Maintain existing RLS policies
    - Add validation for actual_hours
*/

-- Add actual_hours column with non-negative check
ALTER TABLE project_activities
ADD COLUMN actual_hours numeric DEFAULT 0 CHECK (actual_hours >= 0);

-- Update existing policies
DROP POLICY IF EXISTS "Users can read project activities" ON project_activities;
DROP POLICY IF EXISTS "Users can insert project activities" ON project_activities;
DROP POLICY IF EXISTS "Users can update project activities" ON project_activities;
DROP POLICY IF EXISTS "Users can delete project activities" ON project_activities;

-- Recreate policies with actual_hours included
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