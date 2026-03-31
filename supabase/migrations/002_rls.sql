-- ============================================================
-- kleerFUEL: Row Level Security Policies — Migration 002
-- ============================================================

-- Helper: get current user's company_id
create or replace function get_my_company_id()
returns uuid language sql security definer stable as $$
  select company_id from profiles where id = auth.uid()
$$;

-- Helper: check if current user is super_admin
create or replace function is_super_admin()
returns boolean language sql security definer stable as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'super_admin')
$$;

-- Helper: check if user has at least the given role
create or replace function has_role(required_role text)
returns boolean language sql security definer stable as $$
  select exists(
    select 1 from profiles where id = auth.uid() and role = any(
      case required_role
        when 'admin' then array['admin','super_admin']
        when 'ops'   then array['ops','admin','super_admin']
        else array[required_role]
      end
    )
  )
$$;

-- Enable RLS
alter table companies enable row level security;
alter table profiles enable row level security;
alter table depots enable row level security;
alter table tanks enable row level security;
alter table tank_readings enable row level security;
alter table vehicles enable row level security;
alter table drivers enable row level security;
alter table suppliers enable row level security;
alter table supplier_agreements enable row level security;
alter table purchase_orders enable row level security;
alter table deliveries enable row level security;
alter table transactions enable row level security;
alter table manual_dips enable row level security;
alter table anomalies enable row level security;
alter table subscriptions enable row level security;
alter table alert_rules enable row level security;

-- ======================== COMPANIES ========================
create policy "companies_select" on companies for select
  using (id = get_my_company_id() or is_super_admin());
create policy "companies_update" on companies for update
  using (id = get_my_company_id() and has_role('admin'));
create policy "companies_super_all" on companies for all
  using (is_super_admin());

-- ======================== PROFILES ========================
create policy "profiles_select" on profiles for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "profiles_update_own" on profiles for update
  using (id = auth.uid());
create policy "profiles_admin_all" on profiles for all
  using ((company_id = get_my_company_id() and has_role('admin')) or is_super_admin());

-- ======================== DEPOTS ========================
create policy "depots_select" on depots for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "depots_insert" on depots for insert
  with check (company_id = get_my_company_id() and has_role('admin'));
create policy "depots_update" on depots for update
  using (company_id = get_my_company_id() and has_role('admin'));
create policy "depots_delete" on depots for delete
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== TANKS ========================
create policy "tanks_select" on tanks for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "tanks_insert" on tanks for insert
  with check (company_id = get_my_company_id() and has_role('admin'));
create policy "tanks_update" on tanks for update
  using (company_id = get_my_company_id() and has_role('admin'));
create policy "tanks_delete" on tanks for delete
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== TANK READINGS ========================
create policy "tank_readings_select" on tank_readings for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "tank_readings_insert" on tank_readings for insert
  with check (company_id = get_my_company_id());

-- ======================== VEHICLES ========================
create policy "vehicles_select" on vehicles for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "vehicles_insert" on vehicles for insert
  with check (company_id = get_my_company_id() and has_role('admin'));
create policy "vehicles_update" on vehicles for update
  using (company_id = get_my_company_id() and has_role('admin'));
create policy "vehicles_delete" on vehicles for delete
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== DRIVERS ========================
create policy "drivers_select" on drivers for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "drivers_insert" on drivers for insert
  with check (company_id = get_my_company_id() and has_role('admin'));
create policy "drivers_update" on drivers for update
  using (company_id = get_my_company_id() and has_role('admin'));
create policy "drivers_delete" on drivers for delete
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== SUPPLIERS ========================
create policy "suppliers_select" on suppliers for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "suppliers_insert" on suppliers for insert
  with check (company_id = get_my_company_id() and has_role('admin'));
create policy "suppliers_update" on suppliers for update
  using (company_id = get_my_company_id() and has_role('admin'));
create policy "suppliers_delete" on suppliers for delete
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== AGREEMENTS ========================
create policy "agreements_select" on supplier_agreements for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "agreements_admin" on supplier_agreements for all
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== PURCHASE ORDERS ========================
create policy "po_select" on purchase_orders for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "po_admin" on purchase_orders for all
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== DELIVERIES ========================
create policy "deliveries_select" on deliveries for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "deliveries_insert" on deliveries for insert
  with check (company_id = get_my_company_id() and has_role('ops'));
create policy "deliveries_update" on deliveries for update
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== TRANSACTIONS ========================
create policy "transactions_select" on transactions for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "transactions_insert" on transactions for insert
  with check (company_id = get_my_company_id() and has_role('ops'));
create policy "transactions_update" on transactions for update
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== MANUAL DIPS ========================
create policy "manual_dips_select" on manual_dips for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "manual_dips_insert" on manual_dips for insert
  with check (company_id = get_my_company_id() and has_role('ops'));

-- ======================== ANOMALIES ========================
create policy "anomalies_select" on anomalies for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "anomalies_insert" on anomalies for insert
  with check (company_id = get_my_company_id());
create policy "anomalies_update" on anomalies for update
  using (company_id = get_my_company_id() and has_role('admin'));

-- ======================== SUBSCRIPTIONS ========================
create policy "subscriptions_select" on subscriptions for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "subscriptions_super" on subscriptions for all
  using (is_super_admin());

-- ======================== ALERT RULES ========================
create policy "alert_rules_select" on alert_rules for select
  using (company_id = get_my_company_id() or is_super_admin());
create policy "alert_rules_admin" on alert_rules for all
  using (company_id = get_my_company_id() and has_role('admin'));
