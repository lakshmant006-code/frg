/*
  # Update Client Relationships and Constraints

  1. Changes
    - Add ON DELETE CASCADE to relevant foreign key constraints
    - Add ON UPDATE CASCADE for client name propagation
    - Ensure proper constraint behavior for data integrity

  2. Security
    - Maintain existing RLS policies
*/

-- Update Projects table foreign key constraint
ALTER TABLE "Projects"
DROP CONSTRAINT IF EXISTS "Projects_Client_ID_fkey",
ADD CONSTRAINT "Projects_Client_ID_fkey"
  FOREIGN KEY ("Client_ID")
  REFERENCES "Clients"("Client_ID")
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Update Project_Activities table foreign key constraint
ALTER TABLE "Project_Activities"
DROP CONSTRAINT IF EXISTS "Project_Activities_Client_ID_fkey",
ADD CONSTRAINT "Project_Activities_Client_ID_fkey"
  FOREIGN KEY ("Client_ID")
  REFERENCES "Clients"("Client_ID")
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Update Project_Activity_Resources table foreign key constraint
ALTER TABLE "Project_Activity_Resources"
DROP CONSTRAINT IF EXISTS "Project_Activity_Resources_Client_ID_fkey",
ADD CONSTRAINT "Project_Activity_Resources_Client_ID_fkey"
  FOREIGN KEY ("Client_ID")
  REFERENCES "Clients"("Client_ID")
  ON UPDATE CASCADE
  ON DELETE CASCADE;

-- Add trigger to update Project_name in Project_Activity_Resources when Projects.Proj_Name changes
CREATE OR REPLACE FUNCTION update_project_activity_resources_project_name()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Project_Activity_Resources"
  SET "Project_name" = NEW."Proj_Name"
  WHERE "Project_ID" = NEW."Project_ID";
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_project_name_trigger ON "Projects";
CREATE TRIGGER update_project_name_trigger
  AFTER UPDATE OF "Proj_Name" ON "Projects"
  FOR EACH ROW
  EXECUTE FUNCTION update_project_activity_resources_project_name();