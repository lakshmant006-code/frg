/*
  # Update project activities table timestamps

  1. Changes
    - Safely adds start_time and last_updated columns if they don't exist
    - Recreates RLS policies to ensure proper access control
  
  2. Security
    - Maintains existing RLS policies with updated definitions
    - Ensures authenticated users can perform CRUD operations
*/

-- Safely add columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_activities' AND column_name = 'start_time'
  ) THEN
    ALTER TABLE project_activities
    ADD COLUMN start_time timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_activities' AND column_name = 'last_updated'
  ) THEN
    ALTER TABLE project_activities
    ADD COLUMN last_updated timestamptz DEFAULT now();
  END IF;
END $$;

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