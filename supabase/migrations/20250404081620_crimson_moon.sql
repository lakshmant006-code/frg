/*
  # Fix Project_Activities RLS Policies

  1. Changes
    - Enable RLS on Project_Activities table
    - Add policies for authenticated users to:
      - Read all project activities
      - Insert project activities
      - Update project activities
      - Delete project activities

  2. Security
    - Ensure proper access control for project activities
    - Allow authenticated users to manage project activities
*/

-- Enable RLS if not already enabled
ALTER TABLE "Project_Activities" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read project activities" ON "Project_Activities";
DROP POLICY IF EXISTS "Users can insert project activities" ON "Project_Activities";
DROP POLICY IF EXISTS "Users can update project activities" ON "Project_Activities";
DROP POLICY IF EXISTS "Users can delete project activities" ON "Project_Activities";

-- Create new policies
CREATE POLICY "Users can read project activities"
  ON "Project_Activities"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert project activities"
  ON "Project_Activities"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update project activities"
  ON "Project_Activities"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete project activities"
  ON "Project_Activities"
  FOR DELETE
  TO authenticated
  USING (true);