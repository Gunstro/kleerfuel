-- ============================================================
-- kleerFUEL Seed Data — Demo Company
-- ============================================================
-- Run AFTER registering demo user via the app (demo@kleerdemo.co.za)
-- Then: UPDATE profiles SET company_id = '11111111-1111-1111-1111-111111111111',
--         role = 'admin', full_name = 'Demo Admin'
--         WHERE email = 'demo@kleerdemo.co.za';
-- ============================================================

insert into companies (id, name, slug, plan, address, email, vat_number) values
  ('11111111-1111-1111-1111-111111111111',
   'KleerDemo Mining Pty Ltd',
   'kleerdemo', 'pro',
   '123 Mine Road, Johannesburg, 2000',
   'admin@kleerdemo.co.za',
   '4123456789')
on conflict (id) do nothing;

-- Depots
insert into depots (id, company_id, name, location_description, latitude, longitude) values
  ('22220001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   'Johannesburg Main Depot', 'Industrial Zone A, Johannesburg', -26.2041, 28.0473),
  ('22220001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Pretoria East Depot', 'Silverton Industrial, Pretoria', -25.7461, 28.3025)
on conflict (id) do nothing;

-- Tanks
insert into tanks (id, company_id, depot_id, name, fuel_type, capacity_liters, current_level_liters, alert_threshold_percent, cost_per_liter, iot_device_id, iot_protocol) values
  ('aaaa0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111',
   '22220001-0000-0000-0000-000000000001',
   'Tank A – JHB Main Diesel', 'diesel', 20000, 15000, 20, 22.50, 'IOT-JHB-001', 'lorawan'),
  ('aaaa0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   '22220001-0000-0000-0000-000000000001',
   'Tank B – JHB Petrol 95', 'petrol_95', 10000, 4500, 25, 24.10, 'IOT-JHB-002', 'lorawan'),
  ('aaaa0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111',
   '22220001-0000-0000-0000-000000000002',
   'Tank C – PTA Diesel', 'diesel', 15000, 12000, 20, 22.50, 'IOT-PTA-001', 'rs485_modbus'),
  ('aaaa0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   '22220001-0000-0000-0000-000000000001',
   'Tank D – AdBlue', 'adblue', 5000, 3200, 30, 12.00, 'IOT-JHB-003', 'mqtt')
on conflict (id) do nothing;

-- Vehicles
insert into vehicles (id, company_id, registration, make, model, year, vehicle_type, fuel_type, tank_capacity_liters) values
  ('bbbb0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'GP 123-456', 'Mercedes', 'Actros 2645', 2022, 'truck', 'diesel', 400),
  ('bbbb0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'GP 789-012', 'Toyota', 'Hilux 2.8 GD-6', 2021, 'bakkie', 'diesel', 80),
  ('bbbb0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'GP 345-678', 'Ford', 'Ranger 2.0 BiTurbo', 2020, 'bakkie', 'diesel', 80),
  ('bbbb0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'GP 901-234', 'Volvo', 'FH16 750', 2023, 'truck', 'diesel', 600)
on conflict (id) do nothing;

-- Drivers
insert into drivers (id, company_id, full_name, license_number, license_type, phone, employee_number) values
  ('cccc0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Sipho Nkosi', 'DL123456', 'Code 14', '+27 82 111 2222', 'EMP-001'),
  ('cccc0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Johan van der Merwe', 'DL789012', 'Code 14', '+27 83 333 4444', 'EMP-002'),
  ('cccc0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Thabo Mokoena', 'DL345678', 'Code 10', '+27 84 555 6666', 'EMP-003')
on conflict (id) do nothing;

-- Suppliers
insert into suppliers (id, company_id, name, contact_name, contact_phone, contact_email, preferred) values
  ('dddd0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Engen Petroleum', 'Sales Team', '+27 11 123 4567', 'sales@engen.co.za', true),
  ('dddd0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Sasol Industrial', 'John Smith', '+27 11 987 6543', 'john@sasol.co.za', false),
  ('dddd0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'TotalEnergies SA', 'Mary Jones', '+27 12 456 7890', 'mary@total.co.za', false)
on conflict (id) do nothing;

-- Subscription
insert into subscriptions (company_id, plan, max_tanks, max_vehicles, max_users, max_depots, iot_enabled, ai_ocr_enabled, advanced_analytics, price_per_month, currency) values
  ('11111111-1111-1111-1111-111111111111', 'pro', 20, 100, 25, 10, true, true, true, 2499.00, 'ZAR')
on conflict (company_id) do nothing;

-- Historical tank readings (7 days of trend data)
insert into tank_readings (tank_id, company_id, level_liters, level_percent, source, recorded_at) values
  ('aaaa0001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',18500,92.5,'simulated', now()-interval '7 days'),
  ('aaaa0001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',17800,89.0,'simulated', now()-interval '6 days'),
  ('aaaa0001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',17100,85.5,'simulated', now()-interval '5 days'),
  ('aaaa0001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',16300,81.5,'simulated', now()-interval '4 days'),
  ('aaaa0001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',15700,78.5,'simulated', now()-interval '3 days'),
  ('aaaa0001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',15300,76.5,'simulated', now()-interval '2 days'),
  ('aaaa0001-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111',15000,75.0,'simulated', now()-interval '1 day'),
  ('aaaa0001-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',9000,90.0,'simulated', now()-interval '7 days'),
  ('aaaa0001-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',8200,82.0,'simulated', now()-interval '5 days'),
  ('aaaa0001-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',6500,65.0,'simulated', now()-interval '3 days'),
  ('aaaa0001-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111',4500,45.0,'simulated', now()-interval '1 day'),
  ('aaaa0001-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',14000,93.3,'simulated', now()-interval '7 days'),
  ('aaaa0001-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',13200,88.0,'simulated', now()-interval '4 days'),
  ('aaaa0001-0000-0000-0000-000000000003','11111111-1111-1111-1111-111111111111',12000,80.0,'simulated', now()-interval '1 day'),
  ('aaaa0001-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111',4800,96.0,'simulated', now()-interval '7 days'),
  ('aaaa0001-0000-0000-0000-000000000004','11111111-1111-1111-1111-111111111111',3200,64.0,'simulated', now()-interval '1 day');

-- Demo anomalies
insert into anomalies (company_id, tank_id, type, severity, volume_loss_liters, cost_impact, description, auto_detected, detected_at) values
  ('11111111-1111-1111-1111-111111111111', 'aaaa0001-0000-0000-0000-000000000002',
   'unauthorized_drop', 'critical', 250.5, 6037.05,
   'Tank B dropped 250.5L between 02:00–03:00 (quiet hours). No authorised transaction recorded.',
   true, now()-interval '2 days'),
  ('11111111-1111-1111-1111-111111111111', 'aaaa0001-0000-0000-0000-000000000001',
   'supplier_mismatch', 'high', 48.0, 1080.00,
   'Delivery invoice: 5000L. IoT measured increase: 4952L. Discrepancy: 48L.',
   true, now()-interval '4 days'),
  ('11111111-1111-1111-1111-111111111111', 'aaaa0001-0000-0000-0000-000000000002',
   'low_level', 'medium', null, null,
   'Tank B – Petrol 95 level at 45% — approaching alert threshold of 25%.',
   true, now()-interval '1 day');
