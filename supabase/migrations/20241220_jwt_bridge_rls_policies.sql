-- JWT Bridge RLS Policies Migration
-- This migration updates Row Level Security policies to work with Stack Auth JWT tokens
-- Author: XalesIn ERP Team
-- Version: 1.0.0

-- Create function to extract user context from JWT claims
CREATE OR REPLACE FUNCTION auth.jwt_user_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id',
    auth.uid()::text
  );
$$;

-- Create function to extract tenant ID from JWT claims
CREATE OR REPLACE FUNCTION auth.jwt_tenant_id()
RETURNS TEXT
LANGUAGE SQL
STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'tenant_id',
    current_setting('request.jwt.claims', true)::json->>'org_id',
    current_setting('request.jwt.claims', true)::json->>'organization_id'
  );
$$;

-- Create function to extract user roles from JWT claims
CREATE OR REPLACE FUNCTION auth.jwt_user_roles()
RETURNS TEXT[]
LANGUAGE SQL
STABLE
AS $$
  SELECT CASE 
    WHEN current_setting('request.jwt.claims', true)::json->>'roles' IS NOT NULL THEN
      ARRAY(SELECT json_array_elements_text(current_setting('request.jwt.claims', true)::json->'roles'))
    ELSE
      ARRAY[]::TEXT[]
  END;
$$;

-- Create function to extract user permissions from JWT claims
CREATE OR REPLACE FUNCTION auth.jwt_user_permissions()
RETURNS TEXT[]
LANGUAGE SQL
STABLE
AS $$
  SELECT CASE 
    WHEN current_setting('request.jwt.claims', true)::json->>'permissions' IS NOT NULL THEN
      ARRAY(SELECT json_array_elements_text(current_setting('request.jwt.claims', true)::json->'permissions'))
    ELSE
      ARRAY[]::TEXT[]
  END;
$$;

-- Create function to check if user has specific permission
CREATE OR REPLACE FUNCTION auth.has_permission(permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT permission_name = ANY(auth.jwt_user_permissions());
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION auth.has_role(role_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT role_name = ANY(auth.jwt_user_roles());
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
AS $$
  SELECT auth.has_role('admin') OR auth.has_role('super_admin') OR auth.has_role('system_admin');
$$;

-- Create enhanced tenant context function that works with JWT
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_id TEXT, user_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set tenant context for RLS
  PERFORM set_config('app.current_tenant_id', tenant_id, true);
  PERFORM set_config('app.current_user_id', user_id, true);
  
  -- Log context setting for debugging
  RAISE DEBUG 'Tenant context set: tenant_id=%, user_id=%', tenant_id, user_id;
END;
$$;

-- Create audit logging table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  duration_ms INTEGER,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  input_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS policy for audit_logs - users can only see their own tenant's logs
CREATE POLICY "audit_logs_tenant_isolation" ON audit_logs
  FOR ALL
  USING (
    tenant_id = COALESCE(
      auth.jwt_tenant_id(),
      current_setting('app.current_tenant_id', true)
    )
  );

-- RLS policy for audit_logs - admins can see all logs in their tenant
CREATE POLICY "audit_logs_admin_access" ON audit_logs
  FOR ALL
  USING (
    auth.is_admin() AND 
    tenant_id = COALESCE(
      auth.jwt_tenant_id(),
      current_setting('app.current_tenant_id', true)
    )
  );

-- Create inventory_items table if it doesn't exist (example business table)
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sku TEXT NOT NULL,
  description TEXT,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT NOT NULL
);

-- Enable RLS on inventory_items
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS policy for inventory_items - tenant isolation
CREATE POLICY "inventory_items_tenant_isolation" ON inventory_items
  FOR ALL
  USING (
    tenant_id = COALESCE(
      auth.jwt_tenant_id(),
      current_setting('app.current_tenant_id', true)
    )
  );

-- RLS policy for inventory_items - read access with inventory.read permission
CREATE POLICY "inventory_items_read_permission" ON inventory_items
  FOR SELECT
  USING (
    auth.has_permission('inventory.read') OR
    auth.has_permission('inventory.manage') OR
    auth.is_admin()
  );

-- RLS policy for inventory_items - write access with inventory.write permission
CREATE POLICY "inventory_items_write_permission" ON inventory_items
  FOR INSERT
  WITH CHECK (
    auth.has_permission('inventory.write') OR
    auth.has_permission('inventory.manage') OR
    auth.is_admin()
  );

-- RLS policy for inventory_items - update access with inventory.write permission
CREATE POLICY "inventory_items_update_permission" ON inventory_items
  FOR UPDATE
  USING (
    auth.has_permission('inventory.write') OR
    auth.has_permission('inventory.manage') OR
    auth.is_admin()
  )
  WITH CHECK (
    auth.has_permission('inventory.write') OR
    auth.has_permission('inventory.manage') OR
    auth.is_admin()
  );

-- RLS policy for inventory_items - delete access with inventory.delete permission
CREATE POLICY "inventory_items_delete_permission" ON inventory_items
  FOR DELETE
  USING (
    auth.has_permission('inventory.delete') OR
    auth.has_permission('inventory.manage') OR
    auth.is_admin()
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant_id ON inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_sku ON inventory_items(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.jwt_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.jwt_tenant_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.jwt_user_roles() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.jwt_user_permissions() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.has_permission(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.has_role(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auth.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_tenant_context(TEXT, TEXT) TO anon, authenticated;

-- Grant table permissions
GRANT ALL ON audit_logs TO authenticated;
GRANT ALL ON inventory_items TO authenticated;

-- Create health check table for monitoring
CREATE TABLE IF NOT EXISTS health_check (
  id INTEGER PRIMARY KEY DEFAULT 1,
  status TEXT DEFAULT 'healthy',
  last_check TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO health_check (id, status) VALUES (1, 'healthy') ON CONFLICT (id) DO NOTHING;

GRANT SELECT ON health_check TO anon, authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION auth.jwt_user_id() IS 'Extract user ID from JWT claims or fallback to auth.uid()';
COMMENT ON FUNCTION auth.jwt_tenant_id() IS 'Extract tenant ID from JWT claims';
COMMENT ON FUNCTION auth.jwt_user_roles() IS 'Extract user roles array from JWT claims';
COMMENT ON FUNCTION auth.jwt_user_permissions() IS 'Extract user permissions array from JWT claims';
COMMENT ON FUNCTION auth.has_permission(TEXT) IS 'Check if current user has specific permission';
COMMENT ON FUNCTION auth.has_role(TEXT) IS 'Check if current user has specific role';
COMMENT ON FUNCTION auth.is_admin() IS 'Check if current user has admin privileges';
COMMENT ON FUNCTION set_tenant_context(TEXT, TEXT) IS 'Set tenant context for RLS policies';

COMMENT ON TABLE audit_logs IS 'Audit trail for all system operations';
COMMENT ON TABLE inventory_items IS 'Business inventory items with multi-tenant support';
COMMENT ON TABLE health_check IS 'System health monitoring table';