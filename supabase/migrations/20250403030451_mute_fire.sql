/*
  # Add updated_at column to Employees table

  1. Changes
    - Add updated_at column to Employees table
    - Add trigger to automatically update updated_at on record changes
    - Add created_at column for consistency

  2. Security
    - No changes to RLS policies needed
*/

-- Add timestamp columns if they don't exist
ALTER TABLE "Employees"
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS update_employees_updated_at ON "Employees";

CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON "Employees"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();