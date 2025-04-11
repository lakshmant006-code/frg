/*
  # Add RLS policies for Skills table

  1. Security Changes
    - Enable RLS on Skills table (already enabled)
    - Add policies for authenticated users to:
      - Insert new skills
      - Read all skills
      - Update skills
      - Delete skills
*/

-- Policy for inserting skills
CREATE POLICY "Users can insert skills"
ON public."Skills"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for reading skills
CREATE POLICY "Users can read all skills"
ON public."Skills"
FOR SELECT
TO authenticated
USING (true);

-- Policy for updating skills
CREATE POLICY "Users can update skills"
ON public."Skills"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for deleting skills
CREATE POLICY "Users can delete skills"
ON public."Skills"
FOR DELETE
TO authenticated
USING (true);