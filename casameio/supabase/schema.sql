-- CasaMeio — cole no SQL Editor do Supabase e rode uma vez

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text unique not null,
  personal_visible_to_owner boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (family_id, user_id)
);

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  month text not null,
  kind text not null check (kind in ('casa', 'pessoal')),
  title text not null,
  amount numeric(12,2) not null,
  due_on date,
  recurrence text not null default 'mes' check (recurrence in ('unico', 'mes', 'parcela')),
  owner_user_id uuid references auth.users(id) on delete set null,
  paid boolean not null default false,
  paid_by uuid references auth.users(id),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists bills_family_month on bills (family_id, month, kind);

alter table families enable row level security;
alter table members enable row level security;
alter table bills enable row level security;

-- membro vê a própria família
create policy families_select on families for select using (
  exists (select 1 from members m where m.family_id = families.id and m.user_id = auth.uid())
);
create policy families_update_owner on families for update using (
  exists (select 1 from members m where m.family_id = families.id and m.user_id = auth.uid() and m.role = 'owner')
);

create policy members_select on members for select using (
  exists (select 1 from members me where me.family_id = members.family_id and me.user_id = auth.uid())
);
create policy members_insert_self on members for insert with check (user_id = auth.uid());

-- casa: todo mundo da família
-- pessoal: dono da conta, ou o responsável se a política estiver ligada
create policy bills_select on bills for select using (
  exists (
    select 1 from members me
    where me.family_id = bills.family_id and me.user_id = auth.uid()
    and (
      bills.kind = 'casa'
      or bills.owner_user_id = auth.uid()
      or (
        me.role = 'owner'
        and bills.kind = 'pessoal'
        and exists (
          select 1 from families f
          where f.id = bills.family_id and f.personal_visible_to_owner = true
        )
      )
    )
  )
);

create policy bills_insert on bills for insert with check (
  exists (
    select 1 from members me
    where me.family_id = bills.family_id and me.user_id = auth.uid()
    and (
      (bills.kind = 'casa' and me.role = 'owner')
      or (bills.kind = 'pessoal' and bills.owner_user_id = auth.uid())
    )
  )
);

create policy bills_update on bills for update using (
  exists (
    select 1 from members me
    where me.family_id = bills.family_id and me.user_id = auth.uid()
    and (
      bills.kind = 'casa'
      or bills.owner_user_id = auth.uid()
    )
  )
);
