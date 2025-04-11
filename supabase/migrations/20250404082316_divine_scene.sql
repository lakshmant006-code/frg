/*
  # Add RLS policies for Project_Activity_Resources table

  1. Changes
    - Enable RLS on Project_Activity_Resources table
    - Add policies for authenticated users to:
      - Read all project activity resources
      - Insert new resources
      - Update existing resources
      - Delete resources

  2. Security
    - All authenticated users can perform CRUD operations
    - Maintains data integrity with existing foreign key constraints
*/

-- Enable RLS if not already enabled
ALTER TABLE "Project_Activity_Resources" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read project activity resources" ON "Project_Activity_Resources";
DROP POLICY IF EXISTS "Users can insert project activity resources" ON "Project_Activity_Resources";
DROP POLICY IF EXISTS "Users can update project activity resources" ON "Project_Activity_Resources";
DROP POLICY IF EXISTS "Users can delete project activity resources" ON "Project_Activity_Resources";

-- Create new policies
CREATE POLICY "Users can read project activity resources"
  ON "Project_Activity_Resources"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert project activity resources"
  ON "Project_Activity_Resources"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update project activity resources"
  ON "Project_Activity_Resources"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete project activity resources"
  ON "Project_Activity_Resources"
  FOR DELETE
  TO authenticated
  USING (true);