/*
  # Insert Predefined Skills

  1. Changes
    - Insert predefined skills for construction software
    - Each skill has a unique ID, name, and type
    - All skills are linked to the default organization (Org_ID = 1)

  2. Security
    - No changes to RLS policies needed
*/

-- Insert predefined skills
INSERT INTO "Skills" ("Skill_ID", "Skill_Name", "Skill_Type", "Org_ID")
VALUES 
  (1, 'Autodesk Revit', 'REVIT', 1),
  (2, 'Vertex Systems BD', 'VERTEX', 1),
  (3, 'StrucSoft', 'STRUCSOFT', 1),
  (4, 'FRAMECAD', 'FRAMECAD', 1),
  (5, 'Scottsdale Construction Systems', 'SCOTTSDALE', 1),
  (6, 'MWF Advance Metal', 'MWF', 1)
ON CONFLICT ("Skill_ID") DO UPDATE 
SET 
  "Skill_Name" = EXCLUDED."Skill_Name",
  "Skill_Type" = EXCLUDED."Skill_Type";