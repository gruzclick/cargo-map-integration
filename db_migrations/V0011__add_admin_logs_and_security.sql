-- Migration V0011: Add admin logs table and security enhancements

-- Create admin_logs table for audit trail
CREATE TABLE IF NOT EXISTS admin_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admins(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON admin_logs(action);

-- Add role column to admins table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='admins' AND column_name='role') THEN
        ALTER TABLE admins ADD COLUMN role VARCHAR(50) DEFAULT 'support';
    END IF;
END $$;

-- Add token column for session management
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='admins' AND column_name='token') THEN
        ALTER TABLE admins ADD COLUMN token VARCHAR(255);
        CREATE INDEX idx_admins_token ON admins(token);
    END IF;
END $$;

-- Add biometric_enabled column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='admins' AND column_name='biometric_enabled') THEN
        ALTER TABLE admins ADD COLUMN biometric_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add credential_id for WebAuthn
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='admins' AND column_name='credential_id') THEN
        ALTER TABLE admins ADD COLUMN credential_id TEXT;
    END IF;
END $$;

-- Add last_login tracking
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='admins' AND column_name='last_login') THEN
        ALTER TABLE admins ADD COLUMN last_login TIMESTAMP;
    END IF;
END $$;

-- Add login_attempts for rate limiting
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='admins' AND column_name='login_attempts') THEN
        ALTER TABLE admins ADD COLUMN login_attempts INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add locked_until for account lockout
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='admins' AND column_name='locked_until') THEN
        ALTER TABLE admins ADD COLUMN locked_until TIMESTAMP;
    END IF;
END $$;

-- Update existing admins to superadmin if they exist
UPDATE admins SET role = 'superadmin' WHERE role IS NULL OR role = 'support';
