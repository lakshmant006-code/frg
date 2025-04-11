/*
  # Add RLS policies for Resource_mgmt_Org table

  1. Security Changes
    - Enable RLS on Resource_mgmt_Org table
    - Add policies for authenticated users to:
      - Read all organizations
      - Insert new organizations
      - Update organizations
      - Delete organizations
*/

-- Enable RLS
ALTER TABLE "Resource_mgmt_Org" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all organizations
CREATE POLICY "Users can read organizations"
ON "Resource_mgmt_Org"
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to insert organizations
CREATE POLICY "Users can insert organizations"
ON "Resource_mgmt_Org"
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update organizations
CREATE POLICY "Users can update organizations"
ON "Resource_mgmt_Org"
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete organizations
CREATE POLICY "Users can delete organizations"
ON "Resource_mgmt_Org"
FOR DELETE
TO authenticated
USING (true);