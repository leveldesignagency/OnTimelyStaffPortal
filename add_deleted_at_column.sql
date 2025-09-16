-- Add deleted_at column to users table for soft delete functionality
-- This migration adds the necessary column for the undo/restore user features

-- Add the deleted_at column as a nullable timestamp
ALTER TABLE users 
ADD COLUMN deleted_at TIMESTAMPTZ NULL;

-- Add an index on deleted_at for better query performance
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NOT NULL;

-- Add a comment to document the column purpose
COMMENT ON COLUMN users.deleted_at IS 'Timestamp when user was soft deleted. NULL means user is active.';

-- Optional: Add a check constraint to ensure deleted_at is in the past
-- ALTER TABLE users ADD CONSTRAINT check_deleted_at_past 
-- CHECK (deleted_at IS NULL OR deleted_at <= NOW());
