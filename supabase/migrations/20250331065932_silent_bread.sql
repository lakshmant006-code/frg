/*
  # Create projects table with client relationship

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `project_number` (text, unique)
      - `name` (text)
      - `client_id` (uuid, foreign key to clients.id)
      - `description` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `project_status` (text)
      - `visibility` (text)
      - `billable` (boolean)
      - `budget_unit` (numeric)
      - `hourly_rate` (numeric)
      - `time_budget_hours` (integer)
      - `expense_limit` (numeric)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `projects` table
    - Add policies for authenticated users to:
      - Read all projects
      - Insert projects
      - Update projects
      - Delete projects

  3. Triggers
    - Add trigger to update `updated_at` timestamp on record updates
*/

-- First ensure the clients table has the correct primary key
ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_pkey;
ALTER TABLE clients ADD CONSTRAINT clients_pkey PRIMARY KEY (id);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_number text UNIQUE NOT NULL,
  name text NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  project_status text NOT NULL,
  visibility text NOT NULL,
  billable boolean DEFAULT false,
  budget_unit numeric,
  hourly_rate numeric,
  time_budget_hours integer,
  expense_limit numeric,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updating updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();