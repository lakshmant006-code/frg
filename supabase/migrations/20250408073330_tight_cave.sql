/*
  # Fix Project Activities Act_id Column

  1. Changes
    - Rename Act_ID column to Act_id in Project_Activities table to match Activities table
    - Update foreign key constraint to use correct column name
    - Preserve existing data and relationships

  2. Security
    - Maintain existing RLS policies
*/

-- First drop the existing foreign key constraint if it exists
ALTER TABLE "Project_Activities"
DROP CONSTRAINT IF EXISTS "Project_Activities_Act_ID_fkey";

-- Rename the column
ALTER TABLE "Project_Activities" 
RENAME COLUMN "Act_ID" TO "Act_id";

-- Re-add the foreign key constraint with the correct column name
ALTER TABLE "Project_Activities"
ADD CONSTRAINT "Project_Activities_Act_id_fkey"
  FOREIGN KEY ("Act_id")
  REFERENCES "Activities"("Act_id")
  ON DELETE CASCADE;

-- Drop and recreate the unique constraint if it exists
ALTER TABLE "Project_Activities"
DROP CONSTRAINT IF EXISTS "Project_Activities_Act_id_key";

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_project_activities_act_id 
ON "Project_Activities"("Act_id");