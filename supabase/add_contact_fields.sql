-- Add email to customers and phone + email to suppliers
-- Run in Supabase → SQL Editor

ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS phone TEXT NOT NULL DEFAULT '';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS email TEXT NOT NULL DEFAULT '';
