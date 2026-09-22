-- SheMesh Hub — Finance Core
-- Classification rule: transfers and bus/asset never inflate operating expenses

create table if not exists public.money_movements (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  movement_date date not null default current_date,
  account text not null check (account in ('Current', 'Investment', 'Asset')),
  classification text not null check (classification in (
    'Income',
    'Operating Expense',
    'Transfer Current→Investment',
    'Transfer Investment→Current',
    'Bus Sponsorship',
    'Bus Payment',
    'Asset Purchase'
  )),
  description text not null,
  amount numeric(14,2) not null,
  reference text,
  who_paid text,
  receipt_status text check (receipt_status in ('Attached', 'Missing', 'No receipt – prepaid')),
  no_receipt_reason text,
  document_path text,
  is_cleared boolean not null default false,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.bank_transactions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  transaction_date date not null,
  description text not null,
  amount numeric(14,2) not null,
  category text,
  colour_code text,
  notes text,
  is_reconciled boolean not null default false,
  linked_movement_id uuid references public.money_movements(id),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.bank_reconciliations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  opening_balance numeric(14,2) not null,
  closing_balance numeric(14,2) not null,
  calculated_balance numeric(14,2),
  status text not null default 'draft' check (status in ('draft', 'balanced', 'discrepancy')),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  expense_date date not null,
  description text not null,
  amount numeric(14,2) not null,
  purchaser text not null,                    -- REQUIRED
  category text,
  allocation text,
  receipt_status text,
  receipt_path text,
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.reimbursements (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  requester text not null,
  request_date date not null,
  amount numeric(14,2) not null,
  bank_details text,
  receipt_status text,
  no_receipt_reason text,
  document_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid')),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  invoice_date date,
  supplier text,
  invoice_number text,
  amount numeric(14,2),
  document_path text,
  linked_payment_id uuid references public.money_movements(id),
  notes text
);

create table if not exists public.monthly_payments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  period date not null,
  payee text not null,
  amount numeric(14,2) not null,
  category text,
  frequency text check (frequency in ('monthly', 'bi-annual', 'once-off', 'unforeseen')),
  status text default 'planned',
  notes text
);

create table if not exists public.organisation_settings (
  organisation_id uuid primary key references public.organisations(id) on delete cascade,
  investment_target numeric(14,2) default 50000,
  updated_at timestamptz default now()
);

create index if not exists idx_money_movements_org_date on public.money_movements(organisation_id, movement_date);
create index if not exists idx_bank_tx_org_date on public.bank_transactions(organisation_id, transaction_date);
create index if not exists idx_expenses_org_date on public.expenses(organisation_id, expense_date);
