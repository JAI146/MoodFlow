-- Create custom Prisma user for better access control and monitoring
-- Run this in Supabase SQL Editor or via migration script

-- Create custom user (change password to a secure one)
CREATE USER "prisma" WITH PASSWORD 'change_this_password' BYPASSRLS CREATEDB;

-- Extend prisma's privileges to postgres (necessary to view changes in Dashboard)
GRANT "prisma" TO "postgres";

-- Grant it necessary permissions over the relevant schemas (public)
GRANT USAGE ON SCHEMA public TO prisma;
GRANT CREATE ON SCHEMA public TO prisma;
GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;

-- Also grant access to auth schema (for foreign keys to auth.users)
GRANT USAGE ON SCHEMA auth TO prisma;
GRANT SELECT ON ALL TABLES IN SCHEMA auth TO prisma;
