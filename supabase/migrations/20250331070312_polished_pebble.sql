/*
  # Create project_activities junction table

  1. New Tables
    - `project_activities`
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects.id)
      - `activity_id` (uuid, foreign key to activities.id)
      - `hours_allocated` (numeric)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `project_activities` table
    - Add policies for authenticated users to:
      - Read all project activities
      - Insert project activities
      - Update project activities
      - Delete project activities

  3. Relationships
    - Foreign key to projects table
    - Foreign key to activities table
*/

-- Create project_activities junction table
CREATE TABLE IF NOT EXISTS project_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  hours_allocated numeric,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, activity_id)
);

-- Enable RLS
ALTER TABLE project_activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all project activities"
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
  USING (true);

CREATE POLICY "Users can delete project activities"
  ON project_activities
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updating updated_at
CREATE TRIGGER update_project_activities_updated_at
  BEFORE UPDATE ON project_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();