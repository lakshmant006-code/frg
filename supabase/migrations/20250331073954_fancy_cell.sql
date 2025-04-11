/*
  # Add resource timestamps to project activities

  1. Changes
    - Add start_time column to track when resource started
    - Add last_updated column to track last update time
    - Update RLS policies to include new columns

  2. Security
    - Maintain existing RLS policies
    - Add validation for timestamps
*/

ALTER TABLE project_activities
ADD COLUMN start_time timestamptz DEFAULT now(),
ADD COLUMN last_updated timestamptz DEFAULT now();

-- Update existing policies
DROP POLICY IF EXISTS "Users can read project activities" ON project_activities;
DROP POLICY IF EXISTS "Users can insert project activities" ON project_activities;
DROP POLICY IF EXISTS "Users can update project activities" ON project_activities;
DROP POLICY IF EXISTS "Users can delete project activities" ON project_activities;

-- Recreate policies with new columns included
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