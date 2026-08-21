// Gera supabase/migrations/0001_esquema.sql a partir do catalogo dos endpoints.
//
//   node ferramentas/gerar-esquema.mjs
//
// O banco nao espelha a API inteira. Um exercicio completo de todos os
// endpoints medidos passa de 90 MB de JSON cru, e nove exercicios nao caberiam
// no plano gratuito do Supabase. O que entra aqui e o que a API do TCE nao
// consegue fazer: cruzar exercicios, buscar texto e guardar historico de
// retificacao. O resto continua sendo consultado ao vivo.

import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const { POR_ID } = await import(pathToFileURL(join(raiz, 'js', 'api', 'catalogo.js')).href);
const { TABELAS } = await import(pathToFileURL(join(raiz, 'ferramentas', 'tabelas.mjs')).href);


function tipoSql(campo, tipoSpec) {
  if (campo === 'data_referencia_doc' || campo === 'exercicio_orcamento') return 'integer';
  if (/^data_|_data$/.test(campo)) return 'timestamp';
  if (/^valor_|^area_bem|_m2$/.test(campo)) return 'numeric(18,4)';
  if (tipoSpec === 'number') return 'numeric(18,4)';
  if (tipoSpec === 'integer') return 'bigint';
  if (tipoSpec === 'boolean') return 'boolean';
  return 'text';
}

function colunasDe(config) {
  const endpoint = POR_ID[config.endpoint];
  if (!endpoint) throw new Error('endpoint fora do catalogo: ' + config.endpoint);
  const ignorar = new Set(['codigo_municipio', ...(config.ignorar || [])]);
  return Object.keys(endpoint.campos)
    .filter((c) => !ignorar.has(c))
    .map((campo) => ({
      campo,
      tipo: tipoSql(campo, endpoint.tipos[campo]),
      rotulo: endpoint.campos[campo],
    }));
}

const partes = [];
const p = (texto) => partes.push(texto);

p(`-- Esquema do Olho no Crato no Supabase.
-- GERADO por ferramentas/gerar-esquema.mjs. Nao editar a mao.
--
-- O banco e um complemento da API do TCE, nao um espelho: guarda o que a API
-- nao sabe fazer, que e cruzar exercicios, buscar texto e registrar quando um
-- valor ja informado foi retificado pelo municipio.
--
-- Tudo aqui e dado publico. A leitura e liberada para anonimo; a escrita so
-- acontece com a chave de servico, que nunca vai para o navegador.

-- O Supabase costuma manter as extensoes no schema "extensions", mas nem sempre.
-- Em vez de qualificar cada uso, o caminho de busca cobre os dois lugares
-- possiveis, e assim o script roda igual nos dois casos.
create schema if not exists extensions;
set search_path = public, extensions;

create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;

-- unaccent de um argumento e apenas estavel, e indice funcional exige
-- imutabilidade; a forma de dois argumentos, com o dicionario explicito, e
-- imutavel. O search_path fixo na funcao evita depender de quem a chama.
create or replace function public.sem_acento(entrada text)
returns text language sql immutable parallel safe strict
set search_path = public, extensions, pg_catalog as $$
  select unaccent('unaccent', entrada)
$$;

comment on function public.sem_acento is
  'Remove acentos para busca; imutavel para poder ser usada em indice.';

-- ---------------------------------------------------------------------------
-- registro de alteracoes: o municipio pode retificar dado ja enviado ao TCE
-- ---------------------------------------------------------------------------

create table if not exists public.alteracoes (
  id           bigserial primary key,
  tabela       text        not null,
  registro     text        not null,
  campo        text        not null,
  valor_antigo text,
  valor_novo   text,
  percebida_em timestamptz not null default now()
);

comment on table public.alteracoes is
  'Cada vez que a sincronizacao encontra um valor diferente do que ja estava guardado, a mudanca fica registrada aqui.';

create index if not exists alteracoes_tabela_registro_idx
  on public.alteracoes (tabela, registro);
create index if not exists alteracoes_percebida_idx
  on public.alteracoes (percebida_em desc);

create or replace function public.registrar_alteracao()
returns trigger language plpgsql as $$
declare
  campo   text;
  antigo  jsonb;
  novo    jsonb;
  ignorar text[] := array['sincronizado_em', 'hash'];
begin
  if old.hash is not distinct from new.hash then
    return new;
  end if;
  antigo := to_jsonb(old);
  novo := to_jsonb(new);
  for campo in select chave from jsonb_object_keys(novo) as chave loop
    if campo = any(ignorar) then
      continue;
    end if;
    if antigo -> campo is distinct from novo -> campo then
      insert into public.alteracoes (tabela, registro, campo, valor_antigo, valor_novo)
      values (tg_table_name, new.id, campo, antigo ->> campo, novo ->> campo);
    end if;
  end loop;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- controle da sincronizacao
-- ---------------------------------------------------------------------------

create table if not exists public.sincronizacoes (
  id             bigserial primary key,
  tabela         text        not null,
  periodo        text        not null,
  linhas         integer     not null default 0,
  novas          integer     not null default 0,
  alteradas      integer     not null default 0,
  iniciada_em    timestamptz not null default now(),
  concluida_em   timestamptz,
  erro           text
);

comment on table public.sincronizacoes is
  'Diario de bordo da carga: o que foi buscado no TCE, quando e com que resultado.';

create index if not exists sincronizacoes_tabela_idx
  on public.sincronizacoes (tabela, iniciada_em desc);
`);

for (const config of TABELAS) {
  const colunas = colunasDe(config);
  const endpoint = POR_ID[config.endpoint];

  p(`
-- ---------------------------------------------------------------------------
-- ${config.tabela}: ${endpoint.titulo} (endpoint ${endpoint.path})
-- ---------------------------------------------------------------------------

create table if not exists public.${config.tabela} (
  id text primary key,
${colunas.map((c) => `  ${c.campo.padEnd(48)} ${c.tipo},`).join('\n')}
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);
`);

  p(`comment on table public.${config.tabela} is ${literal(endpoint.titulo + ' (TCE-CE, endpoint ' + endpoint.path + ')')};`);
  for (const c of colunas) {
    if (c.rotulo) {
      p(`comment on column public.${config.tabela}.${c.campo} is ${literal(c.rotulo)};`);
    }
  }

  p('');
  for (const indice of config.indices || []) {
    const nome = `${config.tabela}_${indice.join('_')}_idx`.slice(0, 63);
    p(`create index if not exists ${nome} on public.${config.tabela} (${indice.join(', ')});`);
  }
  for (const campo of config.busca || []) {
    const nome = `${config.tabela}_${campo}_busca_idx`.slice(0, 63);
    p(`create index if not exists ${nome} on public.${config.tabela} `
      + `using gin ((public.sem_acento(lower(${campo}))) gin_trgm_ops);`);
  }

  p(`
drop trigger if exists ${config.tabela}_alteracao on public.${config.tabela};
create trigger ${config.tabela}_alteracao
  before update on public.${config.tabela}
  for each row execute function public.registrar_alteracao();

alter table public.${config.tabela} enable row level security;
drop policy if exists "leitura publica" on public.${config.tabela};
create policy "leitura publica" on public.${config.tabela} for select using (true);`);
}

p(`
-- ---------------------------------------------------------------------------
-- leitura publica das tabelas de controle
-- ---------------------------------------------------------------------------

alter table public.alteracoes enable row level security;
drop policy if exists "leitura publica" on public.alteracoes;
create policy "leitura publica" on public.alteracoes for select using (true);

alter table public.sincronizacoes enable row level security;
drop policy if exists "leitura publica" on public.sincronizacoes;
create policy "leitura publica" on public.sincronizacoes for select using (true);

-- ---------------------------------------------------------------------------
-- visoes: o que a API do TCE nao consegue responder
-- ---------------------------------------------------------------------------

-- quanto cada fornecedor recebeu somando todos os exercicios de uma vez
create or replace view public.fornecedores_totais with (security_invoker = on) as
select
  numero_documento_negociante              as documento,
  max(nome_negociante)                     as nome,
  max(codigo_tipo_negociante)              as tipo,
  max(municipio_negociante)                as municipio,
  sum(valor_empenhado)                     as total_empenhado,
  count(*)                                 as empenhos,
  min(exercicio_orcamento) / 100           as primeiro_exercicio,
  max(exercicio_orcamento) / 100           as ultimo_exercicio,
  count(distinct exercicio_orcamento)      as exercicios
from public.empenhos
group by numero_documento_negociante;

comment on view public.fornecedores_totais is
  'Ranking de recebedores somando todos os exercicios guardados. E a consulta que a API do TCE nao permite fazer.';

-- o mesmo, quebrado por exercicio, para desenhar a evolucao de um fornecedor
create or replace view public.fornecedores_por_exercicio with (security_invoker = on) as
select
  numero_documento_negociante    as documento,
  exercicio_orcamento / 100      as exercicio,
  max(nome_negociante)           as nome,
  sum(valor_empenhado)           as total_empenhado,
  count(*)                       as empenhos
from public.empenhos
group by numero_documento_negociante, exercicio_orcamento;

-- execucao do orcamento por exercicio, ja somada
-- Os valores do balancete sao acumulados desde janeiro, entao somar dois meses
-- do mesmo exercicio conta o mesmo dinheiro duas vezes. Estas visoes olham
-- apenas o ultimo mes guardado de cada exercicio.
create or replace view public.ultimo_balancete_despesa with (security_invoker = on) as
select exercicio_orcamento, max(data_referencia_doc) as mes
from public.balancete_despesa
group by exercicio_orcamento;

create or replace view public.execucao_por_exercicio with (security_invoker = on) as
select
  b.exercicio_orcamento / 100                       as exercicio,
  u.mes                                             as mes_referencia,
  sum(b.valor_fixado_orcamento_bal_despesa)         as orcado,
  sum(b.valor_empenhado_ate_mes)                    as empenhado,
  sum(b.valor_liquidado_ate_mes)                    as liquidado,
  sum(b.valor_pago_ate_mes)                         as pago
from public.balancete_despesa b
join public.ultimo_balancete_despesa u
  on u.exercicio_orcamento = b.exercicio_orcamento
 and u.mes = b.data_referencia_doc
group by b.exercicio_orcamento, u.mes;

-- gasto por area em todos os exercicios, para comparar um ano com o outro
create or replace view public.execucao_por_funcao with (security_invoker = on) as
select
  b.exercicio_orcamento / 100        as exercicio,
  b.codigo_funcao                    as funcao,
  sum(b.valor_empenhado_ate_mes)     as empenhado,
  sum(b.valor_liquidado_ate_mes)     as liquidado,
  sum(b.valor_pago_ate_mes)          as pago
from public.balancete_despesa b
join public.ultimo_balancete_despesa u
  on u.exercicio_orcamento = b.exercicio_orcamento
 and u.mes = b.data_referencia_doc
group by b.exercicio_orcamento, b.codigo_funcao;

-- arrecadacao por exercicio
create or replace view public.ultimo_balancete_receita with (security_invoker = on) as
select exercicio_orcamento, max(data_referencia_doc) as mes
from public.balancete_receita
group by exercicio_orcamento;

create or replace view public.receita_por_exercicio with (security_invoker = on) as
select
  b.exercicio_orcamento / 100          as exercicio,
  sum(b.valor_previsto_orcamento)      as previsto,
  sum(b.valor_arrecadacao_ate_mes)     as arrecadado
from public.balancete_receita b
join public.ultimo_balancete_receita u
  on u.exercicio_orcamento = b.exercicio_orcamento
 and u.mes = b.data_referencia_doc
group by b.exercicio_orcamento;

-- retificacoes de valor, que e o tipo de alteracao que interessa
create or replace view public.retificacoes with (security_invoker = on) as
select
  a.tabela,
  a.registro,
  a.campo,
  a.valor_antigo::numeric   as valor_antigo,
  a.valor_novo::numeric     as valor_novo,
  a.valor_novo::numeric - a.valor_antigo::numeric as diferenca,
  a.percebida_em
from public.alteracoes a
where a.campo like 'valor%'
  and a.valor_antigo ~ '^-?[0-9.]+$'
  and a.valor_novo ~ '^-?[0-9.]+$'
  and a.valor_antigo::numeric is distinct from a.valor_novo::numeric;

comment on view public.retificacoes is
  'Alteracoes de valor em dados que o municipio ja havia enviado ao TCE.';

-- ---------------------------------------------------------------------------
-- busca textual: o TCE nao tem filtro por texto
-- ---------------------------------------------------------------------------

create or replace function public.buscar_fornecedor(termo text, limite integer default 50)
returns table (
  documento text,
  nome text,
  municipio text,
  total_empenhado numeric,
  empenhos bigint,
  primeiro_exercicio integer,
  ultimo_exercicio integer
) language sql stable as $$
  select f.documento, f.nome, f.municipio, f.total_empenhado, f.empenhos,
         f.primeiro_exercicio, f.ultimo_exercicio
  from public.fornecedores_totais f
  where public.sem_acento(lower(f.nome)) like '%' || public.sem_acento(lower(termo)) || '%'
     or f.documento like '%' || termo || '%'
  order by f.total_empenhado desc
  limit limite
$$;

comment on function public.buscar_fornecedor is
  'Procura um recebedor pelo nome ou pelo documento somando todos os exercicios.';

create or replace function public.buscar_texto(termo text, limite integer default 60)
returns table (
  origem text,
  exercicio integer,
  data timestamp,
  identificacao text,
  descricao text,
  parte text,
  valor numeric
) language sql stable as $$
  with alvo as (select public.sem_acento(lower(termo)) as t)
  (
    select 'Empenho'::text,
           (e.exercicio_orcamento / 100)::integer,
           e.data_emissao_empenho,
           e.numero_empenho,
           e.descricao_historico_empenho,
           e.nome_negociante,
           e.valor_empenhado
    from public.empenhos e, alvo
    where public.sem_acento(lower(e.descricao_historico_empenho)) like '%' || alvo.t || '%'
    order by e.valor_empenhado desc
    limit limite
  )
  union all
  (
    select 'Contrato'::text,
           extract(year from c.data_contrato)::integer,
           c.data_contrato,
           c.numero_contrato,
           c.descricao_objeto_contrato,
           c.nome_fiscal_contrato,
           c.valor_total_contrato
    from public.contratos c, alvo
    where public.sem_acento(lower(c.descricao_objeto_contrato)) like '%' || alvo.t || '%'
    order by c.valor_total_contrato desc
    limit limite
  )
  union all
  (
    select 'Licitacao'::text,
           extract(year from l.data_realizacao_autuacao_licitacao)::integer,
           l.data_realizacao_autuacao_licitacao,
           l.numero_licitacao,
           l.descricao_objeto_licitacao,
           l.nome_responsavel_homologacao,
           l.valor_orcado_estimado
    from public.licitacoes l, alvo
    where public.sem_acento(lower(l.descricao_objeto_licitacao)) like '%' || alvo.t || '%'
    order by l.valor_orcado_estimado desc
    limit limite
  )
  union all
  (
    select 'Item'::text,
           extract(year from i.data_realizacao_licitacao)::integer,
           i.data_realizacao_licitacao,
           i.numero_licitacao,
           i.descricao_item_licitacao,
           i.descricao_unidade_item_licitacao,
           i.valor_unitario_item_licitacao
    from public.itens_licitacao i, alvo
    where public.sem_acento(lower(i.descricao_item_licitacao)) like '%' || alvo.t || '%'
    order by i.valor_unitario_item_licitacao desc
    limit limite
  )
$$;

comment on function public.buscar_texto is
  'Procura um termo no historico dos empenhos, no objeto dos contratos e licitacoes e na descricao dos itens, em todos os exercicios de uma vez.';

-- preco de um mesmo item ao longo dos anos, para comparar compras
create or replace function public.precos_do_item(termo text, limite integer default 200)
returns table (
  exercicio integer,
  data timestamp,
  licitacao text,
  descricao text,
  unidade text,
  quantidade text,
  preco_unitario numeric
) language sql stable as $$
  select extract(year from i.data_realizacao_licitacao)::integer,
         i.data_realizacao_licitacao,
         i.numero_licitacao,
         i.descricao_item_licitacao,
         i.descricao_unidade_item_licitacao,
         i.numero_quantidade_item_licitacao,
         i.valor_unitario_item_licitacao
  from public.itens_licitacao i
  where public.sem_acento(lower(i.descricao_item_licitacao))
        like '%' || public.sem_acento(lower(termo)) || '%'
    and i.valor_unitario_item_licitacao > 0
  order by i.data_realizacao_licitacao
  limit limite
$$;

comment on function public.precos_do_item is
  'Historico de preco unitario de um item nas licitacoes do municipio.';

-- ---------------------------------------------------------------------------
-- permissoes: o PostgREST consulta como anon, entao precisa do grant explicito
-- ---------------------------------------------------------------------------

-- anon e authenticated so leem; service_role tambem grava, porque e com ela
-- que a carga insere e atualiza. Sem o grant para service_role o PostgREST
-- responde 403 mesmo com a chave de servico correta.
grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
`);

function literal(texto) {
  return "'" + String(texto).replace(/'/g, "''") + "'";
}

const destino = join(raiz, 'supabase', 'migrations');
mkdirSync(destino, { recursive: true });
const arquivo = join(destino, '0001_esquema.sql');
writeFileSync(arquivo, partes.join('\n') + '\n', 'utf8');

// a funcao de borda roda no Supabase e nao enxerga ferramentas/tabelas.mjs,
// entao a mesma configuracao vai junto dela, gerada daqui para nao divergir
const paraBorda = TABELAS.map((c) => ({
  tabela: c.tabela,
  path: POR_ID[c.endpoint].path,
  periodo: c.periodo,
  fechamento: Boolean(c.fechamento),
  chave: c.chave,
  colunas: colunasDe(c).map((coluna) => coluna.campo),
}));
const pastaBorda = join(raiz, 'supabase', 'functions', 'sincronizar');
mkdirSync(pastaBorda, { recursive: true });
writeFileSync(join(pastaBorda, 'tabelas.ts'),
  '// GERADO por ferramentas/gerar-esquema.mjs. Nao editar a mao.\n\n'
  + 'export interface Tabela {\n'
  + '  tabela: string;\n  path: string;\n  periodo: string;\n  fechamento: boolean;\n'
  + '  chave: string[];\n  colunas: string[];\n}\n\n'
  + 'export const TABELAS: Tabela[] = '
  + JSON.stringify(paraBorda, null, 2) + ';\n', 'utf8');

const resumo = TABELAS.map((c) => ({
  tabela: c.tabela,
  endpoint: c.endpoint,
  colunas: colunasDe(c).length,
  periodo: c.periodo + (c.fechamento ? ' (so o fechamento)' : ''),
}));
console.table(resumo);
console.log('esquema gravado em supabase/migrations/0001_esquema.sql');
