-- Cole no SQL Editor uma vez

create table if not exists join_requests (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  email text not null,
  name text not null,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table join_requests enable row level security;

drop policy if exists join_select_owner on join_requests;
create policy join_select_owner on join_requests for select using (
  exists (
    select 1 from members m
    where m.family_id = join_requests.family_id
      and m.user_id = auth.uid()
      and m.role = 'owner'
  )
);

create or replace function public.request_join(p_invite text, p_email text, p_name text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  fid uuid;
  uid uuid;
begin
  select id into fid from families where invite_code = upper(trim(p_invite));
  if fid is null then raise exception 'Código inválido'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  insert into join_requests (family_id, email, name, user_id)
  values (fid, lower(trim(p_email)), p_name, uid);
end;
$fn$;

create or replace function public.approve_join(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  r join_requests;
begin
  select * into r from join_requests where id = p_id;
  if r.id is null then raise exception 'Pedido não existe'; end if;
  if not exists (
    select 1 from members m
    where m.family_id = r.family_id and m.user_id = auth.uid() and m.role = 'owner'
  ) then
    raise exception 'Só o responsável confirma';
  end if;
  update auth.users
  set email_confirmed_at = coalesce(email_confirmed_at, now())
  where lower(email) = lower(r.email);
  if r.user_id is not null then
    insert into members (family_id, user_id, name, role)
    values (r.family_id, r.user_id, r.name, 'member')
    on conflict (family_id, user_id) do nothing;
  end if;
  update join_requests set status = 'approved' where id = p_id;
end;
$fn$;

grant execute on function public.request_join(text, text, text) to anon, authenticated;
grant execute on function public.approve_join(uuid) to authenticated;
