-- Add deleted_at column to companies table for soft delete functionality
-- This migration adds the necessary column for the undo/restore company features

-- Add the deleted_at column as a nullable timestamp
ALTER TABLE companies 
ADD COLUMN deleted_at TIMESTAMPTZ NULL;

-- Add an index on deleted_at for better query performance
CREATE INDEX idx_companies_deleted_at ON companies(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add a comment to document the column purpose
COMMENT ON COLUMN companies.deleted_at IS 'Timestamp when company was soft deleted. NULL means company is active.';

-- Optional: Add a check constraint to ensure deleted_at is in the past
-- ALTER TABLE companies ADD CONSTRAINT check_companies_deleted_at_past 
-- CHECK (deleted_at IS NULL OR deleted_at <= NOW());
