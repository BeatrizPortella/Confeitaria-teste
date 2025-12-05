-- Supabase schema for Confeitaria admin panel
-- Users (admin)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- Options (recheios, massas, coberturas, tamanhos, adicionais)
CREATE TABLE options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type text CHECK (type IN ('RECHEIO','MASSA','COBERTURA','TAMANHO','ADICIONAL')) NOT NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  price numeric(10,2) DEFAULT 0.00,
  active boolean DEFAULT true,
  "order" integer DEFAULT 0,
  meta jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Orders
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  items jsonb NOT NULL, -- array of {optionId, type, name, price}
  total numeric(10,2) NOT NULL,
  status text CHECK (status IN ('NEW','IN_PROGRESS','READY','DELIVERED','CANCELLED')) DEFAULT 'NEW',
  assigned_to text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Option changes (audit log)
CREATE TABLE option_changes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_id uuid REFERENCES options(id),
  admin_id uuid REFERENCES users(id),
  change jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS) for tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (admin only)
CREATE POLICY "admin_access" ON users USING (auth.role() = 'admin');
CREATE POLICY "admin_access" ON options USING (auth.role() = 'admin');
CREATE POLICY "admin_access" ON orders USING (auth.role() = 'admin');
