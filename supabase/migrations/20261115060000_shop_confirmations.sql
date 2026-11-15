create table public.shop_confirmations (
  key text primary key,
  created_at timestamptz not null default now(),
  payload jsonb not null,
  sent_at timestamptz
);
alter table public.shop_confirmations enable row level security;
revoke all on public.shop_confirmations from public, anon, authenticated;
grant select, insert, update on public.shop_confirmations to service_role;

create function public.register_shop_withdrawal(receipt_key text, receipt jsonb, sender_hash text)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(sender_hash, 0));
  if exists (select 1 from public.shop_confirmations where key = receipt_key) then
    return true;
  end if;
  if (select count(*) from public.shop_confirmations
      where key like 'withdrawal/%' and payload->>'sender' = sender_hash
      and created_at > now() - interval '1 hour') >= 10 then
    return false;
  end if;
  insert into public.shop_confirmations(key, payload)
    values (receipt_key, receipt || jsonb_build_object('sender', sender_hash))
    on conflict do nothing;
  return true;
end;
$$;
revoke all on function public.register_shop_withdrawal(text, jsonb, text) from public, anon, authenticated;
grant execute on function public.register_shop_withdrawal(text, jsonb, text) to service_role;
