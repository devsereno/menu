-- Cole no SQL Editor do projeto casameio (depois do schema.sql)

drop policy if exists families_insert on families;
create policy families_insert on families for insert with check (auth.uid() is not null);

drop policy if exists families_select on families;
create policy families_select on families for select using (
  auth.uid() is not null
);

alter table bills add column if not exists series_id text;
alter table bills add column if not exists parcela_n int;
alter table bills add column if not exists parcela_total int;
alter table bills add column if not exists banco text;

-- o membro também pode marcar pago na casa
drop policy if exists bills_update on bills;
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
