-- Add User table and update MedicalCard with userId
-- Run this manually in your Supabase SQL editor

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Add userId column to MedicalCard if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'MedicalCard' 
        AND column_name = 'userId'
    ) THEN
        ALTER TABLE "MedicalCard" ADD COLUMN "userId" TEXT;
    END IF;
END $$;

-- Add foreign key constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'MedicalCard_userId_fkey'
    ) THEN
        ALTER TABLE "MedicalCard" 
        ADD CONSTRAINT "MedicalCard_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
    END IF;
END $$;

-- Add index for userId
CREATE INDEX IF NOT EXISTS "MedicalCard_userId_idx" ON "MedicalCard"("userId");
