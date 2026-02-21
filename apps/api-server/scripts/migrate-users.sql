-- Migration: Split users table into admin_users and app_users
BEGIN;

-- 1. Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'admin' NOT NULL,
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  avatar VARCHAR(255),
  nickname VARCHAR(100),
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 2. Create app_users table
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_type VARCHAR(20) DEFAULT 'anonymous' NOT NULL,
  email VARCHAR(255),
  password VARCHAR(255),
  google_id VARCHAR(255),
  device_id VARCHAR(255),
  nickname VARCHAR(100),
  avatar VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE NOT NULL,
  last_login_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 3. Create indexes on app_users
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_email ON app_users (email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_app_users_google_id ON app_users (google_id) WHERE google_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_app_users_device_id ON app_users (device_id);

-- 4. Migrate users to admin_users (preserve IDs for user_roles FK)
INSERT INTO admin_users (id, username, password, email, phone, role, status, avatar, nickname, last_login_at, created_at, updated_at)
SELECT id, username, password, email, phone,
  CASE WHEN is_admin = true THEN 'super_admin' ELSE 'admin' END,
  CASE WHEN status::text = 'active' THEN 'active' WHEN status::text = 'suspended' THEN 'suspended' ELSE 'inactive' END,
  avatar, nickname, last_login_at, created_at, updated_at
FROM users
ON CONFLICT (id) DO NOTHING;

-- 5. Drop old FK from user_roles -> users
ALTER TABLE user_roles DROP CONSTRAINT IF EXISTS "FK_87b8888186ca9769c960e926870";

-- 6. Add new FK from user_roles -> admin_users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_roles_admin_users'
  ) THEN
    ALTER TABLE user_roles ADD CONSTRAINT "FK_user_roles_admin_users"
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE;
  END IF;
END $$;

COMMIT;
