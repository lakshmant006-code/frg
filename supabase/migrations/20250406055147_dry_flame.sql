-- Add foreign key for team lead in Teams table
ALTER TABLE "Teams"
DROP CONSTRAINT IF EXISTS "Teams_Team_Lead_fkey",
ADD CONSTRAINT "Teams_Team_Lead_fkey"
  FOREIGN KEY ("Team_Lead")
  REFERENCES "Employees"("Emp_id")
  ON UPDATE CASCADE
  ON DELETE SET NULL;

-- Enable RLS on Team_Members if not already enabled
ALTER TABLE "Team_Members" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read team members" ON "Team_Members";
DROP POLICY IF EXISTS "Users can insert team members" ON "Team_Members";
DROP POLICY IF EXISTS "Users can update team members" ON "Team_Members";
DROP POLICY IF EXISTS "Users can delete team members" ON "Team_Members";

-- Create policies for Team_Members
CREATE POLICY "Users can read team members"
  ON "Team_Members"
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert team members"
  ON "Team_Members"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update team members"
  ON "Team_Members"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete team members"
  ON "Team_Members"
  FOR DELETE
  TO authenticated
  USING (true);