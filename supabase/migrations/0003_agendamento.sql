-- Agendamento da sincronização diária.
--
-- Depende de duas extensões que o Supabase oferece mas não deixa ligadas por
-- padrão: pg_cron, que agenda, e pg_net, que faz a chamada HTTP. Se a migração
-- falhar aqui, ligue as duas em Database > Extensions no painel e rode de novo.
--
-- Só faz sentido aplicar depois que a função de borda estiver publicada:
--   supabase functions deploy sincronizar

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- endereço e segredo da função, guardados fora do código
-- ---------------------------------------------------------------------------

create table if not exists public.configuracao (
  chave text primary key,
  valor text not null,
  atualizada_em timestamptz not null default now()
);

comment on table public.configuracao is
  'Endereço e segredo usados pelo agendamento. Não tem leitura pública.';

-- sem policy de leitura: só a chave de serviço enxerga, porque guarda segredo
alter table public.configuracao enable row level security;
revoke all on public.configuracao from anon, authenticated;

-- ---------------------------------------------------------------------------
-- disparo
-- ---------------------------------------------------------------------------

create or replace function public.disparar_sincronizacao()
returns bigint
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  endereco text;
  segredo  text;
  pedido   bigint;
begin
  select valor into endereco from public.configuracao where chave = 'url_sincronizacao';
  select valor into segredo  from public.configuracao where chave = 'segredo_sincronizacao';

  if endereco is null then
    raise notice 'sincronizacao nao agendada: falta url_sincronizacao em public.configuracao';
    return null;
  end if;

  select net.http_post(
    url := endereco,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-segredo-sincronizacao', coalesce(segredo, '')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  ) into pedido;

  return pedido;
end;
$$;

comment on function public.disparar_sincronizacao is
  'Chama a funcao de borda que traz do TCE a janela recente dos dados.';

-- Tirar de anon e authenticated nao basta: toda funcao nasce com EXECUTE para
-- PUBLIC, e os dois papeis herdam dali. Sem a primeira linha, qualquer pessoa
-- de posse da chave publicavel, que vai no navegador de quem visita, dispara a
-- carga chamando /rest/v1/rpc/disparar_sincronizacao.
revoke all on function public.disparar_sincronizacao() from public;
revoke all on function public.disparar_sincronizacao() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- todo dia as 9h em Fortaleza, que e meio-dia em UTC
-- ---------------------------------------------------------------------------

select cron.unschedule('sincronizar-tce')
where exists (select 1 from cron.job where jobname = 'sincronizar-tce');

select cron.schedule(
  'sincronizar-tce',
  '0 12 * * *',
  $$select public.disparar_sincronizacao()$$
);
