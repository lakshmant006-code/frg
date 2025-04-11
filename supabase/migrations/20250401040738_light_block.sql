/*
  # Add default roles

  1. Changes
    - Insert default roles (Admin, Manager, Employee) into Roles table
    - Add descriptions for each role

  2. Security
    - Maintain existing RLS policies
*/

-- Insert default roles if they don't exist
DO $$ 
BEGIN
  -- Admin role
  IF NOT EXISTS (SELECT 1 FROM "Roles" WHERE "Role_Name" = 'Admin') THEN
    INSERT INTO "Roles" ("Role_id", "Role_Name", "Role_Description")
    VALUES (1, 'Admin', 'Full system access with all administrative privileges');
  END IF;

  -- Manager role
  IF NOT EXISTS (SELECT 1 FROM "Roles" WHERE "Role_Name" = 'Manager') THEN
    INSERT INTO "Roles" ("Role_id", "Role_Name", "Role_Description")
    VALUES (2, 'Manager', 'Team management and project oversight capabilities');
  END IF;

  -- Employee role
  IF NOT EXISTS (SELECT 1 FROM "Roles" WHERE "Role_Name" = 'Employee') THEN
    INSERT INTO "Roles" ("Role_id", "Role_Name", "Role_Description")
    VALUES (3, 'Employee', 'Standard user access for time tracking and project work');
  END IF;
END $$;