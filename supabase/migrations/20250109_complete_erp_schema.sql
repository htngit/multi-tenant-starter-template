-- Complete ERP Schema Migration
-- Financial Management & HR Modules
-- Created: 2025-01-09

-- =============================================
-- FINANCIAL MANAGEMENT MODULE
-- =============================================

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    account_code VARCHAR(20) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    parent_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, account_code)
);

-- Accounts (General Ledger)
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    chart_account_id UUID REFERENCES chart_of_accounts(id),
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, account_number)
);

-- Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    entry_number VARCHAR(50) NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT,
    reference VARCHAR(100),
    total_debit DECIMAL(15,2) DEFAULT 0.00,
    total_credit DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'reversed')),
    created_by VARCHAR(255),
    approved_by VARCHAR(255),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, entry_number)
);

-- Journal Entry Lines
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id),
    description TEXT,
    debit_amount DECIMAL(15,2) DEFAULT 0.00,
    credit_amount DECIMAL(15,2) DEFAULT 0.00,
    line_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_type VARCHAR(20) NOT NULL CHECK (invoice_type IN ('sales', 'purchase')),
    customer_id UUID REFERENCES customers(id),
    supplier_id UUID REFERENCES suppliers(id),
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(15,2) DEFAULT 0.00,
    tax_amount DECIMAL(15,2) DEFAULT 0.00,
    discount_amount DECIMAL(15,2) DEFAULT 0.00,
    total_amount DECIMAL(15,2) DEFAULT 0.00,
    paid_amount DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    currency VARCHAR(3) DEFAULT 'USD',
    notes TEXT,
    terms TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, invoice_number)
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0.00,
    tax_percentage DECIMAL(5,2) DEFAULT 0.00,
    line_total DECIMAL(15,2) NOT NULL,
    line_number INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    payment_number VARCHAR(50) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('received', 'made')),
    invoice_id UUID REFERENCES invoices(id),
    customer_id UUID REFERENCES customers(id),
    supplier_id UUID REFERENCES suppliers(id),
    payment_date DATE NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'credit_card', 'check', 'other')),
    reference VARCHAR(100),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, payment_number)
);

-- =============================================
-- HUMAN RESOURCES MODULE
-- =============================================

-- Departments
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    manager_id UUID, -- Will reference employees table
    parent_department_id UUID REFERENCES departments(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, code)
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    user_id VARCHAR(255), -- Stack Auth user ID
    employee_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    department_id UUID REFERENCES departments(id),
    position VARCHAR(100),
    hire_date DATE,
    termination_date DATE,
    salary DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'USD',
    employment_type VARCHAR(20) CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    address TEXT,
    emergency_contact JSONB,
    benefits JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, employee_number)
);

-- Add foreign key constraint for department manager
ALTER TABLE departments ADD CONSTRAINT departments_manager_id_fkey 
    FOREIGN KEY (manager_id) REFERENCES employees(id);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    break_duration INTEGER DEFAULT 0, -- in minutes
    total_hours DECIMAL(4,2),
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'sick', 'vacation')),
    notes TEXT,
    approved_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(team_id, employee_id, attendance_date)
);

-- Payroll
CREATE TABLE IF NOT EXISTS payroll (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(15,2) NOT NULL,
    overtime_hours DECIMAL(4,2) DEFAULT 0.00,
    overtime_rate DECIMAL(15,2) DEFAULT 0.00,
    overtime_amount DECIMAL(15,2) DEFAULT 0.00,
    allowances DECIMAL(15,2) DEFAULT 0.00,
    deductions DECIMAL(15,2) DEFAULT 0.00,
    gross_pay DECIMAL(15,2) NOT NULL,
    tax_deduction DECIMAL(15,2) DEFAULT 0.00,
    net_pay DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
    pay_date DATE,
    created_by VARCHAR(255),
    approved_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- BUSINESS INTELLIGENCE VIEWS
-- =============================================

-- Financial Summary View
CREATE OR REPLACE VIEW financial_summary AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    COALESCE(SUM(CASE WHEN i.invoice_type = 'sales' THEN i.total_amount END), 0) as total_sales,
    COALESCE(SUM(CASE WHEN i.invoice_type = 'purchase' THEN i.total_amount END), 0) as total_purchases,
    COALESCE(SUM(CASE WHEN i.invoice_type = 'sales' THEN i.paid_amount END), 0) as total_received,
    COALESCE(SUM(CASE WHEN i.invoice_type = 'purchase' THEN i.paid_amount END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN i.invoice_type = 'sales' THEN (i.total_amount - i.paid_amount) END), 0) as accounts_receivable,
    COALESCE(SUM(CASE WHEN i.invoice_type = 'purchase' THEN (i.total_amount - i.paid_amount) END), 0) as accounts_payable
FROM teams t
LEFT JOIN invoices i ON t.id = i.team_id
GROUP BY t.id, t.name;

-- Inventory Summary View
CREATE OR REPLACE VIEW inventory_summary AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    COUNT(DISTINCT p.id) as total_products,
    COUNT(DISTINCT w.id) as total_warehouses,
    COALESCE(SUM(inv.quantity), 0) as total_stock_quantity,
    COALESCE(SUM(inv.quantity * p.cost_price), 0) as total_stock_value
FROM teams t
LEFT JOIN products p ON t.id = p.team_id
LEFT JOIN warehouses w ON t.id = w.team_id
LEFT JOIN inventory inv ON t.id = inv.team_id
GROUP BY t.id, t.name;

-- Sales Performance View
CREATE OR REPLACE VIEW sales_performance AS
SELECT 
    so.team_id,
    DATE_TRUNC('month', so.order_date) as month,
    COUNT(*) as total_orders,
    SUM(so.total_amount) as total_sales,
    AVG(so.total_amount) as average_order_value,
    COUNT(DISTINCT so.customer_id) as unique_customers
FROM sales_orders so
WHERE so.status = 'completed'
GROUP BY so.team_id, DATE_TRUNC('month', so.order_date);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Financial indexes
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_team_id ON chart_of_accounts(team_id);
CREATE INDEX IF NOT EXISTS idx_accounts_team_id ON accounts(team_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_team_id ON journal_entries(team_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_invoices_team_id ON invoices(team_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_team_id ON payments(team_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- HR indexes
CREATE INDEX IF NOT EXISTS idx_departments_team_id ON departments(team_id);
CREATE INDEX IF NOT EXISTS idx_employees_team_id ON employees(team_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_attendance_team_id ON attendance(team_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_payroll_team_id ON payroll(team_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Financial Management RLS Policies
CREATE POLICY "Users can access their team's chart of accounts" ON chart_of_accounts
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can access their team's accounts" ON accounts
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can access their team's journal entries" ON journal_entries
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can access their team's journal entry lines" ON journal_entry_lines
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can access their team's invoices" ON invoices
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can access their team's invoice items" ON invoice_items
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can access their team's payments" ON payments
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

-- HR Management RLS Policies
CREATE POLICY "Users can access their team's departments" ON departments
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can access their team's employees" ON employees
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can access their team's attendance" ON attendance
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

CREATE POLICY "Users can access their team's payroll" ON payroll
    FOR ALL USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.jwt() ->> 'sub'));

-- =============================================
-- TRIGGERS FOR AUDIT TRAILS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payroll_updated_at BEFORE UPDATE ON payroll FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals(invoice_id UUID)
RETURNS VOID AS $$
DECLARE
    subtotal DECIMAL(15,2);
    tax_amount DECIMAL(15,2);
    total_amount DECIMAL(15,2);
BEGIN
    -- Calculate subtotal from invoice items
    SELECT COALESCE(SUM(line_total), 0) INTO subtotal
    FROM invoice_items
    WHERE invoice_items.invoice_id = calculate_invoice_totals.invoice_id;
    
    -- Calculate tax (assuming tax is calculated on subtotal)
    SELECT COALESCE(SUM(line_total * tax_percentage / 100), 0) INTO tax_amount
    FROM invoice_items
    WHERE invoice_items.invoice_id = calculate_invoice_totals.invoice_id;
    
    -- Calculate total
    total_amount := subtotal + tax_amount;
    
    -- Update invoice
    UPDATE invoices SET
        subtotal = calculate_invoice_totals.subtotal,
        tax_amount = calculate_invoice_totals.tax_amount,
        total_amount = calculate_invoice_totals.total_amount,
        updated_at = now()
    WHERE id = calculate_invoice_totals.invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get account balance
CREATE OR REPLACE FUNCTION get_account_balance(account_id UUID, as_of_date DATE DEFAULT CURRENT_DATE)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    balance DECIMAL(15,2) := 0;
BEGIN
    SELECT COALESCE(SUM(debit_amount - credit_amount), 0) INTO balance
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    WHERE jel.account_id = get_account_balance.account_id
    AND je.entry_date <= as_of_date
    AND je.status = 'posted';
    
    RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- INITIAL DATA SETUP
-- =============================================

-- Insert default chart of accounts structure
-- This will be populated when teams are created

COMMIT;

-- Add comments for documentation
COMMENT ON TABLE chart_of_accounts IS 'Chart of accounts for financial reporting';
COMMENT ON TABLE accounts IS 'General ledger accounts';
COMMENT ON TABLE journal_entries IS 'Journal entries for double-entry bookkeeping';
COMMENT ON TABLE journal_entry_lines IS 'Individual lines of journal entries';
COMMENT ON TABLE invoices IS 'Sales and purchase invoices';
COMMENT ON TABLE invoice_items IS 'Line items for invoices';
COMMENT ON TABLE payments IS 'Payment records for invoices';
COMMENT ON TABLE departments IS 'Organizational departments';
COMMENT ON TABLE employees IS 'Employee master data';
COMMENT ON TABLE attendance IS 'Employee attendance tracking';
COMMENT ON TABLE payroll IS 'Payroll processing records';