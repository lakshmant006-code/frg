/*
  # Add Activities Table

  1. New Tables
    - `activities`
      - `id` (uuid, primary key)
      - `activity_number` (text, unique)
      - `name` (text)
      - `description` (text)
      - `billable` (boolean)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `activities` table
    - Add policies for authenticated users to perform CRUD operations
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_number text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  billable boolean DEFAULT false,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete activities"
  ON activities
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for updating updated_at
CREATE TRIGGER update_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();