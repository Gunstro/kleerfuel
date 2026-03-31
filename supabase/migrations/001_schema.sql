-- ============================================================
-- kleerFUEL: Multi-Tenant Schema — Migration 001
-- ============================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Updated_at auto-trigger
create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- COMPANIES (Tenant root)
-- ============================================================
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  plan text default 'starter' check (plan in ('starter', 'standard', 'pro', 'enterprise')),
  logo_url text,
  address text,
  phone text,
  email text,
  vat_number text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger set_companies_updated_at before update on companies
  for each row execute procedure trigger_set_updated_at();

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id) on delete set null,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text default 'viewer' check (role in ('super_admin', 'admin', 'ops', 'viewer')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger set_profiles_updated_at before update on profiles
  for each row execute procedure trigger_set_updated_at();

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- DEPOTS
-- ============================================================
create table if not exists depots (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  location_description text,
  latitude decimal(10,8),
  longitude decimal(11,8),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger set_depots_updated_at before update on depots
  for each row execute procedure trigger_set_updated_at();
create index idx_depots_company_id on depots(company_id);

-- ============================================================
-- TANKS
-- ============================================================
create table if not exists tanks (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  depot_id uuid references depots(id) on delete set null,
  name text not null,
  fuel_type text default 'diesel' check (fuel_type in ('diesel', 'petrol_93', 'petrol_95', 'paraffin', 'adblue')),
  capacity_liters decimal(12,2) not null,
  current_level_liters decimal(12,2) default 0,
  alert_threshold_percent decimal(5,2) default 20.0,
  cost_per_liter decimal(10,4),
  iot_device_id text,
  iot_protocol text check (iot_protocol in ('rs485_modbus', 'lorawan', 'sigfox', 'mqtt', 'manual')),
  qr_code text unique,
  notes text,
  is_active boolean default true,
  last_reading_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger set_tanks_updated_at before update on tanks
  for each row execute procedure trigger_set_updated_at();
create index idx_tanks_company_id on tanks(company_id);
create index idx_tanks_depot_id on tanks(depot_id);
create index idx_tanks_iot_device_id on tanks(iot_device_id);

-- ============================================================
-- TANK READINGS (IoT Telemetry)
-- ============================================================
create table if not exists tank_readings (
  id uuid primary key default uuid_generate_v4(),
  tank_id uuid references tanks(id) on delete cascade not null,
  company_id uuid references companies(id) on delete cascade not null,
  level_liters decimal(12,2) not null,
  level_percent decimal(5,2),
  temperature_celsius decimal(6,2),
  water_detected boolean default false,
  sensor_status text default 'ok' check (sensor_status in ('ok', 'warning', 'error', 'offline')),
  source text default 'iot' check (source in ('iot', 'manual_dip', 'calculated', 'simulated')),
  raw_payload jsonb,
  recorded_at timestamptz default now(),
  created_at timestamptz default now()
);
create index idx_tank_readings_tank_id on tank_readings(tank_id);
create index idx_tank_readings_company_id on tank_readings(company_id);
create index idx_tank_readings_recorded_at on tank_readings(recorded_at desc);

-- ============================================================
-- VEHICLES
-- ============================================================
create table if not exists vehicles (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  registration text not null,
  make text,
  model text,
  year int check (year >= 1990 and year <= 2035),
  vehicle_type text default 'truck' check (vehicle_type in ('truck', 'bakkie', 'car', 'motorbike', 'generator', 'equipment')),
  fuel_type text default 'diesel',
  tank_capacity_liters decimal(8,2),
  qr_code text unique,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger set_vehicles_updated_at before update on vehicles
  for each row execute procedure trigger_set_updated_at();
create index idx_vehicles_company_id on vehicles(company_id);

-- ============================================================
-- DRIVERS
-- ============================================================
create table if not exists drivers (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete set null,
  full_name text not null,
  license_number text,
  license_type text,
  phone text,
  employee_number text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger set_drivers_updated_at before update on drivers
  for each row execute procedure trigger_set_updated_at();
create index idx_drivers_company_id on drivers(company_id);

-- ============================================================
-- SUPPLIERS
-- ============================================================
create table if not exists suppliers (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  name text not null,
  contact_name text,
  contact_phone text,
  contact_email text,
  address text,
  account_number text,
  preferred boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger set_suppliers_updated_at before update on suppliers
  for each row execute procedure trigger_set_updated_at();
create index idx_suppliers_company_id on suppliers(company_id);

-- ============================================================
-- SUPPLIER AGREEMENTS
-- ============================================================
create table if not exists supplier_agreements (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  supplier_id uuid references suppliers(id) on delete cascade not null,
  fuel_type text not null,
  price_per_liter decimal(10,4) not null,
  valid_from date not null,
  valid_to date,
  min_order_liters decimal(10,2),
  lead_time_hours int,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_agreements_company_id on supplier_agreements(company_id);

-- ============================================================
-- PURCHASE ORDERS
-- ============================================================
create table if not exists purchase_orders (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  tank_id uuid references tanks(id) not null,
  supplier_id uuid references suppliers(id),
  po_number text unique,
  ordered_liters decimal(12,2) not null,
  price_per_liter decimal(10,4),
  total_value decimal(12,2),
  status text default 'pending' check (status in ('pending','sent','confirmed','in_transit','delivered','cancelled')),
  auto_generated boolean default false,
  otp_code text,
  otp_verified boolean default false,
  otp_verified_at timestamptz,
  expected_delivery_at timestamptz,
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger set_purchase_orders_updated_at before update on purchase_orders
  for each row execute procedure trigger_set_updated_at();
create index idx_purchase_orders_company_id on purchase_orders(company_id);
create index idx_purchase_orders_tank_id on purchase_orders(tank_id);

-- ============================================================
-- DELIVERIES (Refill Tank)
-- ============================================================
create table if not exists deliveries (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  tank_id uuid references tanks(id) not null,
  supplier_id uuid references suppliers(id),
  purchase_order_id uuid references purchase_orders(id),
  delivered_liters_invoice decimal(12,2),
  delivered_liters_iot decimal(12,2),
  delivered_liters_manual decimal(12,2),
  tank_level_before decimal(12,2),
  tank_level_after decimal(12,2),
  tanker_start_reading decimal(12,2),
  tanker_end_reading decimal(12,2),
  invoice_number text,
  invoice_image_url text,
  discrepancy_liters decimal(12,2),
  discrepancy_percent decimal(5,2),
  status text default 'pending' check (status in ('pending','verified','discrepancy','flagged')),
  recorded_by uuid references profiles(id),
  delivered_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create trigger set_deliveries_updated_at before update on deliveries
  for each row execute procedure trigger_set_updated_at();
create index idx_deliveries_company_id on deliveries(company_id);
create index idx_deliveries_tank_id on deliveries(tank_id);

-- ============================================================
-- TRANSACTIONS (Refuel Vehicle)
-- ============================================================
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  tank_id uuid references tanks(id) not null,
  vehicle_id uuid references vehicles(id),
  driver_id uuid references drivers(id),
  liters_dispensed decimal(10,2) not null,
  pump_start_reading decimal(12,2),
  pump_end_reading decimal(12,2),
  odometer_reading decimal(10,2),
  previous_odometer decimal(10,2),
  km_since_last_fill decimal(10,2),
  cost_per_liter decimal(10,4),
  total_cost decimal(12,2),
  odometer_image_url text,
  pump_image_url text,
  iot_delta_liters decimal(10,2),
  variance_liters decimal(10,2),
  reference_number text,
  notes text,
  synced_offline boolean default false,
  recorded_by uuid references profiles(id),
  transaction_at timestamptz default now(),
  created_at timestamptz default now()
);
create index idx_transactions_company_id on transactions(company_id);
create index idx_transactions_tank_id on transactions(tank_id);
create index idx_transactions_transaction_at on transactions(transaction_at desc);

-- ============================================================
-- MANUAL DIPS
-- ============================================================
create table if not exists manual_dips (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  tank_id uuid references tanks(id) not null,
  dip_level_liters decimal(12,2) not null,
  dip_level_percent decimal(5,2),
  iot_level_at_time decimal(12,2),
  variance_liters decimal(10,2),
  notes text,
  recorded_by uuid references profiles(id),
  dipped_at timestamptz default now(),
  created_at timestamptz default now()
);
create index idx_manual_dips_tank_id on manual_dips(tank_id);
create index idx_manual_dips_company_id on manual_dips(company_id);

-- ============================================================
-- ANOMALIES
-- ============================================================
create table if not exists anomalies (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  tank_id uuid references tanks(id) not null,
  type text not null check (type in ('theft','leak','supplier_mismatch','sensor_offline','sensor_calibration','unauthorized_drop','low_level')),
  severity text default 'medium' check (severity in ('low','medium','high','critical')),
  volume_loss_liters decimal(10,2),
  cost_impact decimal(12,2),
  transaction_id uuid references transactions(id),
  delivery_id uuid references deliveries(id),
  reading_id uuid references tank_readings(id),
  description text not null,
  auto_detected boolean default true,
  is_resolved boolean default false,
  resolution_notes text,
  resolved_by uuid references profiles(id),
  resolved_at timestamptz,
  detected_at timestamptz default now(),
  created_at timestamptz default now()
);
create index idx_anomalies_company_id on anomalies(company_id);
create index idx_anomalies_tank_id on anomalies(tank_id);
create index idx_anomalies_detected_at on anomalies(detected_at desc);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null unique,
  plan text default 'starter' check (plan in ('starter','standard','pro','enterprise')),
  max_tanks int default 5,
  max_vehicles int default 20,
  max_users int default 5,
  max_depots int default 2,
  iot_enabled boolean default false,
  ai_ocr_enabled boolean default false,
  advanced_analytics boolean default false,
  price_per_month decimal(10,2),
  currency text default 'ZAR',
  billing_day int default 1,
  trial_ends_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- ALERT RULES
-- ============================================================
create table if not exists alert_rules (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade not null,
  tank_id uuid references tanks(id),
  rule_type text not null check (rule_type in ('low_level','rapid_drop','quiet_hours_activity','sensor_offline','supplier_discrepancy')),
  threshold_value decimal(10,2),
  quiet_hours_start time,
  quiet_hours_end time,
  notify_email boolean default true,
  notify_sms boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_alert_rules_company_id on alert_rules(company_id);
