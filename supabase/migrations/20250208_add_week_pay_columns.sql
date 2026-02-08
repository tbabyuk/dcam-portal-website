-- Add week_1_pay and week_2_pay columns to portal_attendance
-- Run this in Supabase SQL Editor: Table Editor > portal_attendance > or SQL Editor

ALTER TABLE portal_attendance
ADD COLUMN IF NOT EXISTS week_1_pay DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS week_2_pay DECIMAL(10, 2) DEFAULT 0;
