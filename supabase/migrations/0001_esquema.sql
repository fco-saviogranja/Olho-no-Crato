-- Esquema do Olho no Crato no Supabase.
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


-- ---------------------------------------------------------------------------
-- empenhos: Notas de Empenhos (endpoint /notas_empenhos)
-- ---------------------------------------------------------------------------

create table if not exists public.empenhos (
  id text primary key,
  exercicio_orcamento                              integer,
  codigo_orgao                                     text,
  codigo_unidade_orcamentaria                      text,
  data_emissao_empenho                             timestamp,
  numero_empenho                                   text,
  data_referencia_doc                              integer,
  codigo_funcao                                    text,
  codigo_subfuncao                                 text,
  codigo_programa                                  text,
  codigo_projeto_atividade                         text,
  numero_projeto_atividade                         text,
  numero_subprojeto_atividade                      text,
  codigo_elemento_despesa                          text,
  tipo_fonte                                       text,
  codigo_fonte                                     text,
  modalidade_nota_empenho                          text,
  descricao_historico_empenho                      text,
  valor_anterior_saldo_dotacao                     numeric(18,4),
  valor_empenhado                                  numeric(18,4),
  valor_atual_saldo_dotacao                        numeric(18,4),
  tipo_processo_licitatorio                        text,
  numero_documento_negociante                      text,
  estado_empenho                                   text,
  numero_nota_anulacao                             text,
  data_emissao_empenho_susbtituto                  timestamp,
  numero_empenho_substituto                        text,
  codigo_tipo_negociante                           text,
  nome_negociante                                  text,
  municipio_negociante                             text,
  codigo_uf                                        text,
  cpf_ordenador                                    text,
  cd_transferencia_tf                              text,
  cd_complem_fonte                                 text,
  cd_subelem_desp                                  text,
  cpf_gestor                                       text,
  data_contrato                                    timestamp,
  numero_contrato                                  text,
  data_realizacao_autuacao_licitacao               timestamp,
  numero_licitacao                                 text,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.empenhos is 'Notas de Empenhos (TCE-CE, endpoint /notas_empenhos)';
comment on column public.empenhos.exercicio_orcamento is 'Exercício do Orçamento';
comment on column public.empenhos.codigo_orgao is 'Código do Órgão';
comment on column public.empenhos.codigo_unidade_orcamentaria is 'Código da Unidade Orçamentária';
comment on column public.empenhos.data_emissao_empenho is 'Data da Emissão da Nota de Empenho';
comment on column public.empenhos.numero_empenho is 'Número da Nota de Empenho';
comment on column public.empenhos.data_referencia_doc is 'Data de Referência da Documentação';
comment on column public.empenhos.codigo_funcao is 'Código da Função';
comment on column public.empenhos.codigo_subfuncao is 'Código da Subfunção';
comment on column public.empenhos.codigo_programa is 'Código do Programa';
comment on column public.empenhos.codigo_projeto_atividade is 'Código de Projeto ou Atividade';
comment on column public.empenhos.numero_projeto_atividade is 'Número do Projeto ou Atividade';
comment on column public.empenhos.numero_subprojeto_atividade is 'Número do Sub-projeto ou Sub-atividade';
comment on column public.empenhos.codigo_elemento_despesa is 'Código do Elemento de Despesa';
comment on column public.empenhos.tipo_fonte is 'Código do Grupo da Fonte';
comment on column public.empenhos.codigo_fonte is 'Código da Especificação da Fonte';
comment on column public.empenhos.modalidade_nota_empenho is 'Modalidade da Nota de Empenho';
comment on column public.empenhos.descricao_historico_empenho is 'Histórico da Nota de Empenho';
comment on column public.empenhos.valor_anterior_saldo_dotacao is 'Valor Anterior do Saldo da Dotação';
comment on column public.empenhos.valor_empenhado is 'Valor Empenhado';
comment on column public.empenhos.valor_atual_saldo_dotacao is 'Valor Atual do Saldo da Dotação';
comment on column public.empenhos.tipo_processo_licitatorio is 'Espécie do Processo Administrativo para Contratação';
comment on column public.empenhos.numero_documento_negociante is 'Dados do Documento de Identificação do Credor';
comment on column public.empenhos.estado_empenho is 'Status do Empenho';
comment on column public.empenhos.numero_nota_anulacao is 'Número da Nota de Anulação do Empenho';
comment on column public.empenhos.data_emissao_empenho_susbtituto is 'Data da Emissão do Empenho Substituto';
comment on column public.empenhos.numero_empenho_substituto is 'Número do Empenho Substituto';
comment on column public.empenhos.codigo_tipo_negociante is 'Tipo de Documento de Identificação do Credor';
comment on column public.empenhos.nome_negociante is 'Nome ou Razão Social do Credor';
comment on column public.empenhos.municipio_negociante is 'Nome do Município do Credor';
comment on column public.empenhos.codigo_uf is 'Unidade da Federação do Endereço do Credor';
comment on column public.empenhos.cpf_ordenador is 'CPF do Ordenador da Despesa';
comment on column public.empenhos.cd_transferencia_tf is 'Código de Identificação da Transferência ao Município';
comment on column public.empenhos.cd_complem_fonte is 'Código do Complemento da Fonte';
comment on column public.empenhos.cd_subelem_desp is 'Código do Subelemento de Despesa';

create index if not exists empenhos_numero_documento_negociante_idx on public.empenhos (numero_documento_negociante);
create index if not exists empenhos_exercicio_orcamento_idx on public.empenhos (exercicio_orcamento);
create index if not exists empenhos_codigo_orgao_idx on public.empenhos (codigo_orgao);
create index if not exists empenhos_valor_empenhado_idx on public.empenhos (valor_empenhado);
create index if not exists empenhos_nome_negociante_busca_idx on public.empenhos using gin ((public.sem_acento(lower(nome_negociante))) gin_trgm_ops);
create index if not exists empenhos_descricao_historico_empenho_busca_idx on public.empenhos using gin ((public.sem_acento(lower(descricao_historico_empenho))) gin_trgm_ops);

drop trigger if exists empenhos_alteracao on public.empenhos;
create trigger empenhos_alteracao
  before update on public.empenhos
  for each row execute function public.registrar_alteracao();

alter table public.empenhos enable row level security;
drop policy if exists "leitura publica" on public.empenhos;
create policy "leitura publica" on public.empenhos for select using (true);

-- ---------------------------------------------------------------------------
-- contratos: Contratos (endpoint /contratos)
-- ---------------------------------------------------------------------------

create table if not exists public.contratos (
  id text primary key,
  cpf_gestor                                       text,
  data_contrato                                    timestamp,
  numero_contrato                                  text,
  tipo_contrato                                    text,
  modalide_contrato                                text,
  numero_contrato_original                         text,
  data_contrato_original                           timestamp,
  data_inicio_vigencia_contrato                    timestamp,
  data_fim_vigencia_contrato                       timestamp,
  descricao_objeto_contrato                        text,
  valor_total_contrato                             numeric(18,4),
  data_referencia_doc                              integer,
  data_autuacao_processo_adm                       timestamp,
  numero_processo_adm                              text,
  nome_fiscal_contrato                             text,
  numero_id_contrato_pncp                          text,
  cpf_gestor_original                              text,
  cpf_fiscal_contrato                              text,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.contratos is 'Contratos (TCE-CE, endpoint /contratos)';
comment on column public.contratos.cpf_gestor is 'Número do CPF do Gestor Responsável pela Celebração do Contrato';
comment on column public.contratos.data_contrato is 'Data de Celebração do Contrato';
comment on column public.contratos.numero_contrato is 'Número do Contrato';
comment on column public.contratos.tipo_contrato is 'Tipo de Objeto contratado';
comment on column public.contratos.modalide_contrato is 'Modalidade do Contrato';
comment on column public.contratos.numero_contrato_original is 'Número do Contrato Original';
comment on column public.contratos.data_contrato_original is 'Data que o Contrato Original foi celebrado';
comment on column public.contratos.data_inicio_vigencia_contrato is 'Data de Início da Vigência do Contrato';
comment on column public.contratos.data_fim_vigencia_contrato is 'Data Prevista para o Fim da Vigência do Contrato';
comment on column public.contratos.descricao_objeto_contrato is 'Descrição do Objeto do Contrato';
comment on column public.contratos.valor_total_contrato is 'Valor Total do Contrato';
comment on column public.contratos.data_referencia_doc is 'Data de Referência da Documentação';
comment on column public.contratos.data_autuacao_processo_adm is 'Data de Autuação do Processo Administrativo para Contratação';
comment on column public.contratos.numero_processo_adm is 'Número do Processo Administrativo para Contratação';
comment on column public.contratos.nome_fiscal_contrato is 'Nome do Fiscal do Contrato';
comment on column public.contratos.numero_id_contrato_pncp is 'Número do Id Contrato PNCP';
comment on column public.contratos.cpf_gestor_original is 'Número do CPF do Gestor Responsável pela celebração do Contrato Original';
comment on column public.contratos.cpf_fiscal_contrato is 'Número do CPF do Fiscal do Contrato';

create index if not exists contratos_data_contrato_idx on public.contratos (data_contrato);
create index if not exists contratos_valor_total_contrato_idx on public.contratos (valor_total_contrato);
create index if not exists contratos_descricao_objeto_contrato_busca_idx on public.contratos using gin ((public.sem_acento(lower(descricao_objeto_contrato))) gin_trgm_ops);
create index if not exists contratos_nome_fiscal_contrato_busca_idx on public.contratos using gin ((public.sem_acento(lower(nome_fiscal_contrato))) gin_trgm_ops);

drop trigger if exists contratos_alteracao on public.contratos;
create trigger contratos_alteracao
  before update on public.contratos
  for each row execute function public.registrar_alteracao();

alter table public.contratos enable row level security;
drop policy if exists "leitura publica" on public.contratos;
create policy "leitura publica" on public.contratos for select using (true);

-- ---------------------------------------------------------------------------
-- contratados: Contratados (endpoint /contratados)
-- ---------------------------------------------------------------------------

create table if not exists public.contratados (
  id text primary key,
  data_contrato                                    timestamp,
  numero_contrato                                  text,
  numero_documento_negociante                      text,
  codigo_tipo_negociante                           text,
  nome_negociante                                  text,
  nome_municipio_negociante                        text,
  codigo_uf                                        text,
  data_referencia_doc                              integer,
  cpf_gestor                                       text,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.contratados is 'Contratados (TCE-CE, endpoint /contratados)';
comment on column public.contratados.data_contrato is 'Data que o Contrato foi firmado';
comment on column public.contratados.numero_contrato is 'Número do Contrato';
comment on column public.contratados.numero_documento_negociante is 'Número do Documento de Identificação do Contratado';
comment on column public.contratados.codigo_tipo_negociante is 'Tipo de Documento de Identificação do Contratado';
comment on column public.contratados.nome_negociante is 'Nome ou Razão Social do Contratado';
comment on column public.contratados.nome_municipio_negociante is 'Nome do Município do Contratado';
comment on column public.contratados.codigo_uf is 'Unidade da Federação do Endereço do Contratado';
comment on column public.contratados.data_referencia_doc is 'Data de Referência da Documentação';
comment on column public.contratados.cpf_gestor is 'Número do CPF do Gestor Responsável por Firmar o Contrato';

create index if not exists contratados_numero_documento_negociante_idx on public.contratados (numero_documento_negociante);
create index if not exists contratados_data_contrato_idx on public.contratados (data_contrato);
create index if not exists contratados_nome_negociante_busca_idx on public.contratados using gin ((public.sem_acento(lower(nome_negociante))) gin_trgm_ops);

drop trigger if exists contratados_alteracao on public.contratados;
create trigger contratados_alteracao
  before update on public.contratados
  for each row execute function public.registrar_alteracao();

alter table public.contratados enable row level security;
drop policy if exists "leitura publica" on public.contratados;
create policy "leitura publica" on public.contratados for select using (true);

-- ---------------------------------------------------------------------------
-- licitacoes: Processos Administrativos de Contratações (endpoint /processos_administrativos_contratacoes)
-- ---------------------------------------------------------------------------

create table if not exists public.licitacoes (
  id text primary key,
  data_realizacao_autuacao_licitacao               timestamp,
  numero_licitacao                                 text,
  hora_licitacao                                   text,
  data_emissao_edital                              timestamp,
  modalidade_licitacao                             text,
  tipo_licitacao                                   text,
  descricao_objeto_licitacao                       text,
  valor_orcado_estimado                            numeric(18,4),
  valor_limite_superior                            numeric(18,4),
  cpf_gestor                                       text,
  data_criacao_comissao                            timestamp,
  numero_comissao                                  text,
  nome_responsavel_homologacao                     text,
  data_realizacao_licitacao                        timestamp,
  modalidade_processo_administrativo               text,
  cpf_responsavel_juridico                         text,
  nome_responsavel_juridico                        text,
  data_homologacao                                 timestamp,
  descricao_justificativa_preco                    text,
  descricao_motivo_fornecedor                      text,
  descricao_fundamentacao_legal                    text,
  nome_orgao_ata                                   text,
  data_referencia_doc                              integer,
  nome_resp_cotacao                                text,
  nome_resp_termo_referencia                       text,
  tipo_forma_contratacao                           text,
  tipo_disputa                                     text,
  descricao_url_plataforma_contratacao             text,
  tipo_sistema_registro_precos                     text,
  numero_id_contratacao_pncp                       text,
  numero_id_ata_pncp                               text,
  cpf_responsavel_homologacao                      text,
  cpf_resp_cotacao                                 text,
  cpf_resp_termo_referencia                        text,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.licitacoes is 'Processos Administrativos de Contratações (TCE-CE, endpoint /processos_administrativos_contratacoes)';
comment on column public.licitacoes.data_realizacao_autuacao_licitacao is 'Data de Autuação do Processo Administrativo para Contratação';
comment on column public.licitacoes.numero_licitacao is 'Número do Processo Administrativo para Contratação';
comment on column public.licitacoes.hora_licitacao is 'Hora da Realização da Licitação (Abertura das propostas)';
comment on column public.licitacoes.data_emissao_edital is 'Data da Emissão do Edital';
comment on column public.licitacoes.modalidade_licitacao is 'Modalidade da Licitação';
comment on column public.licitacoes.tipo_licitacao is 'Critério de Julgamento da Licitação';
comment on column public.licitacoes.descricao_objeto_licitacao is 'Descrição do Objeto do Processo Administrativo para Contratação';
comment on column public.licitacoes.valor_orcado_estimado is 'Valor Total do Orçamento Estimado para o Objeto do Processo Administrativo para Contratação';
comment on column public.licitacoes.valor_limite_superior is 'Valor do Limite Superior Desclassificatório para o Objeto Licitado';
comment on column public.licitacoes.cpf_gestor is 'Número do CPF do Gestor da Unidade Gestora a qual pertence o Responsável pela Contratação';
comment on column public.licitacoes.data_criacao_comissao is 'Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação';
comment on column public.licitacoes.numero_comissao is 'Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação';
comment on column public.licitacoes.nome_responsavel_homologacao is 'Nome do Responsável pela Homologação ou Ratificação do Processo Administrativo para Contratação';
comment on column public.licitacoes.data_realizacao_licitacao is 'Data da Realização da Licitação (Abertura das propostas)';
comment on column public.licitacoes.modalidade_processo_administrativo is 'Espécie do Processo Administrativo para Contratação';
comment on column public.licitacoes.cpf_responsavel_juridico is 'Número do CPF do Responsável pelo Parecer Jurídico do Processo Administrativo para Contratação';
comment on column public.licitacoes.nome_responsavel_juridico is 'Nome do Responsável pelo Parecer Jurídico do Processo Administrativo para Contratação';
comment on column public.licitacoes.data_homologacao is 'Data de Homologação ou Ratificação do Processo Administrativo para Contratação';
comment on column public.licitacoes.descricao_justificativa_preco is 'Justificativa do Preço Estabelecido para o Objeto Contratado';
comment on column public.licitacoes.descricao_motivo_fornecedor is 'Motivo da escolha do Fornecedor que justificou o Processo Administrativo para Contratação';
comment on column public.licitacoes.descricao_fundamentacao_legal is 'Fundamentação Legal para o Processo Administrativo para Contratação';
comment on column public.licitacoes.nome_orgao_ata is 'Órgão Gerenciador da Ata de Registro de Preço';
comment on column public.licitacoes.data_referencia_doc is 'Data de Referência da Documentação';
comment on column public.licitacoes.nome_resp_cotacao is 'Nome do Responsável pela Cotação de Preços do Processo Administrativo para Contratação';
comment on column public.licitacoes.nome_resp_termo_referencia is 'Nome do Responsável pela elaboração do Termo de Referência / Projeto Básico do Processo Administrativo para Contratação';
comment on column public.licitacoes.tipo_forma_contratacao is 'Forma da Contratação';
comment on column public.licitacoes.tipo_disputa is 'Tipo de Disputa';
comment on column public.licitacoes.descricao_url_plataforma_contratacao is 'Sistema de Registro de Preços';
comment on column public.licitacoes.tipo_sistema_registro_precos is 'Sistema de Registro de Preços';
comment on column public.licitacoes.numero_id_contratacao_pncp is 'Número do Id Contratação PNCP';
comment on column public.licitacoes.numero_id_ata_pncp is 'Número do Id Ata PNCP';
comment on column public.licitacoes.cpf_responsavel_homologacao is 'Número do CPF do Responsável pela Homologação ou Ratificação do Processo Administrativo para Contratação';
comment on column public.licitacoes.cpf_resp_cotacao is 'Número do CPF do Responsável pela Cotação de Preços do Processo Administrativo para Contratação';
comment on column public.licitacoes.cpf_resp_termo_referencia is 'Número do CPF do Responsável pela elaboração do Termo de Referência / Projeto Básico do Processo Adm. para Contratação';

create index if not exists licitacoes_data_realizacao_autuacao_licitacao_idx on public.licitacoes (data_realizacao_autuacao_licitacao);
create index if not exists licitacoes_valor_orcado_estimado_idx on public.licitacoes (valor_orcado_estimado);
create index if not exists licitacoes_descricao_objeto_licitacao_busca_idx on public.licitacoes using gin ((public.sem_acento(lower(descricao_objeto_licitacao))) gin_trgm_ops);
create index if not exists licitacoes_descricao_fundamentacao_legal_busca_idx on public.licitacoes using gin ((public.sem_acento(lower(descricao_fundamentacao_legal))) gin_trgm_ops);

drop trigger if exists licitacoes_alteracao on public.licitacoes;
create trigger licitacoes_alteracao
  before update on public.licitacoes
  for each row execute function public.registrar_alteracao();

alter table public.licitacoes enable row level security;
drop policy if exists "leitura publica" on public.licitacoes;
create policy "leitura publica" on public.licitacoes for select using (true);

-- ---------------------------------------------------------------------------
-- itens_licitacao: Itens que Compõem Bens e Serviços (endpoint /itens_compoem_bens_servicos)
-- ---------------------------------------------------------------------------

create table if not exists public.itens_licitacao (
  id text primary key,
  data_realizacao_licitacao                        timestamp,
  numero_licitacao                                 text,
  numero_sequencial_item_licitacao                 bigint,
  numero_documento_negociante                      text,
  descricao_item_licitacao                         text,
  valor_vencedor_item_licitacao                    numeric(18,4),
  codigo_tipo_negociante                           text,
  descricao_unidade_item_licitacao                 text,
  numero_quantidade_item_licitacao                 numeric(18,4),
  valor_unitario_item_licitacao                    numeric(18,4),
  data_referencia_doc                              integer,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.itens_licitacao is 'Itens que Compõem Bens e Serviços (TCE-CE, endpoint /itens_compoem_bens_servicos)';
comment on column public.itens_licitacao.data_realizacao_licitacao is 'Data de Autuação do Processo Administrativo para Contratação';
comment on column public.itens_licitacao.numero_licitacao is 'Número do Processo Administrativo para Contratação';
comment on column public.itens_licitacao.numero_sequencial_item_licitacao is 'Número Sequencial do Item que Compõe o Bem ou Serviço';
comment on column public.itens_licitacao.numero_documento_negociante is 'Número do Documento de Identificação do Licitante Vencedor ou Fornecedo';
comment on column public.itens_licitacao.descricao_item_licitacao is 'Descrição do Item que Compõe o Bem ou Serviço';
comment on column public.itens_licitacao.valor_vencedor_item_licitacao is 'Valor Proposto para o Item pelo Licitante VENCEDOR ou Fornecedor';
comment on column public.itens_licitacao.codigo_tipo_negociante is 'Tipo de Documento de Identificação do Licitante Vencedor ou Fornecedor';
comment on column public.itens_licitacao.descricao_unidade_item_licitacao is 'Unidade do Item que Compõe o Bem ou Serviço';
comment on column public.itens_licitacao.numero_quantidade_item_licitacao is 'Quantidade do Item que Compõe o Bem ou Serviço';
comment on column public.itens_licitacao.valor_unitario_item_licitacao is 'Valor Unitário do Item que Compõe o Bem ou Serviço';
comment on column public.itens_licitacao.data_referencia_doc is 'Data de Referência da Documentação';

create index if not exists itens_licitacao_numero_documento_negociante_idx on public.itens_licitacao (numero_documento_negociante);
create index if not exists itens_licitacao_valor_unitario_item_licitacao_idx on public.itens_licitacao (valor_unitario_item_licitacao);
create index if not exists itens_licitacao_descricao_item_licitacao_busca_idx on public.itens_licitacao using gin ((public.sem_acento(lower(descricao_item_licitacao))) gin_trgm_ops);

drop trigger if exists itens_licitacao_alteracao on public.itens_licitacao;
create trigger itens_licitacao_alteracao
  before update on public.itens_licitacao
  for each row execute function public.registrar_alteracao();

alter table public.itens_licitacao enable row level security;
drop policy if exists "leitura publica" on public.itens_licitacao;
create policy "leitura publica" on public.itens_licitacao for select using (true);

-- ---------------------------------------------------------------------------
-- licitantes: Licitantes e Fornecedores de Bens e Serviços (endpoint /licitantes_fornecedores_bens_servicos)
-- ---------------------------------------------------------------------------

create table if not exists public.licitantes (
  id text primary key,
  data_realizacao_licitacao                        timestamp,
  numero_licitacao                                 text,
  numero_documento_negociante                      text,
  codigo_tipo_negociante                           text,
  nome_negociante                                  text,
  nome_municipio_negociante                        text,
  codigo_uf                                        text,
  data_referencia_doc                              integer,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.licitantes is 'Licitantes e Fornecedores de Bens e Serviços (TCE-CE, endpoint /licitantes_fornecedores_bens_servicos)';
comment on column public.licitantes.data_realizacao_licitacao is 'Data de Autuação Processo Administrativo para Contratação';
comment on column public.licitantes.numero_licitacao is 'Número do Processo Administrativo para Contratação';
comment on column public.licitantes.numero_documento_negociante is 'Tipo de Documento de Identificação do Licitante ou Fornecedor';
comment on column public.licitantes.codigo_tipo_negociante is 'Número do Documento de Identificação do Licitante ou Fornecedor';
comment on column public.licitantes.nome_negociante is 'Nome ou Razão Social do Licitante ou Fornecedor';
comment on column public.licitantes.nome_municipio_negociante is 'Nome do Município do Licitante ou Fornecedor';
comment on column public.licitantes.codigo_uf is 'Unidade da Federação do Endereço do Licitante ou Fornecedor';
comment on column public.licitantes.data_referencia_doc is 'Data de Referência da Documentação';

create index if not exists licitantes_numero_documento_negociante_idx on public.licitantes (numero_documento_negociante);
create index if not exists licitantes_nome_negociante_busca_idx on public.licitantes using gin ((public.sem_acento(lower(nome_negociante))) gin_trgm_ops);

drop trigger if exists licitantes_alteracao on public.licitantes;
create trigger licitantes_alteracao
  before update on public.licitantes
  for each row execute function public.registrar_alteracao();

alter table public.licitantes enable row level security;
drop policy if exists "leitura publica" on public.licitantes;
create policy "leitura publica" on public.licitantes for select using (true);

-- ---------------------------------------------------------------------------
-- obras: Obras Municipais e Serviços de Engenharia (endpoint /obras_municipais_servicos_engenharia)
-- ---------------------------------------------------------------------------

create table if not exists public.obras (
  id text primary key,
  data_inicio_obra                                 timestamp,
  tipo_obra                                        text,
  numero_obra                                      bigint,
  exercicio_orcamento                              integer,
  codigo_orgao                                     text,
  codigo_unidade_orcamentaria                      text,
  descricao_obra_servico                           text,
  tipo_execucao                                    text,
  data_fim_obra                                    timestamp,
  valor_total_obra                                 numeric(18,4),
  numero_registro_obra                             text,
  tipo_classificacao_bem                           text,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.obras is 'Obras Municipais e Serviços de Engenharia (TCE-CE, endpoint /obras_municipais_servicos_engenharia)';
comment on column public.obras.data_inicio_obra is 'Data de Início da Obra ou Serviço de Engenharia';
comment on column public.obras.tipo_obra is 'Tipo se é Obra ou Serviço de Engenharia';
comment on column public.obras.numero_obra is 'Número da Obra ou Serviço de Engenharia';
comment on column public.obras.exercicio_orcamento is 'Exercício do Orçamento';
comment on column public.obras.codigo_orgao is 'Código do Órgão';
comment on column public.obras.codigo_unidade_orcamentaria is 'Código da Unidade Orçamentária';
comment on column public.obras.descricao_obra_servico is 'Descrição da Obra ou Serviço de Engenharia';
comment on column public.obras.tipo_execucao is 'Tipo de Execução da Obra ou Serviço de Engenharia';
comment on column public.obras.data_fim_obra is 'Data Prevista para o Término da Obra ou Serviço de Engenharia';
comment on column public.obras.valor_total_obra is 'Valor Total da Obra ou Serviço de Engenharia';
comment on column public.obras.numero_registro_obra is 'Número do Registro da Obra ou Serviço de Engenharia no CREA';
comment on column public.obras.tipo_classificacao_bem is 'Classificação do Bem';

create index if not exists obras_exercicio_orcamento_idx on public.obras (exercicio_orcamento);
create index if not exists obras_valor_total_obra_idx on public.obras (valor_total_obra);
create index if not exists obras_descricao_obra_servico_busca_idx on public.obras using gin ((public.sem_acento(lower(descricao_obra_servico))) gin_trgm_ops);

drop trigger if exists obras_alteracao on public.obras;
create trigger obras_alteracao
  before update on public.obras
  for each row execute function public.registrar_alteracao();

alter table public.obras enable row level security;
drop policy if exists "leitura publica" on public.obras;
create policy "leitura publica" on public.obras for select using (true);

-- ---------------------------------------------------------------------------
-- obras_situacao: Status de Obras e Serviços de Engenharia (endpoint /status_obras_servico_engenharia)
-- ---------------------------------------------------------------------------

create table if not exists public.obras_situacao (
  id text primary key,
  data_inicio_obra                                 timestamp,
  tipo_obra                                        text,
  numero_obra                                      bigint,
  data_envio_informacao                            timestamp,
  status_obra                                      bigint,
  cpf_responsavel                                  text,
  nome_responsavel                                 text,
  observacao_status                                text,
  data_termo_conclusao                             timestamp,
  tipo_termo_conclusao                             bigint,
  numero_registro_bem                              text,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.obras_situacao is 'Status de Obras e Serviços de Engenharia (TCE-CE, endpoint /status_obras_servico_engenharia)';
comment on column public.obras_situacao.data_inicio_obra is 'Data de Início da Obra ou Serviço de Engenharia';
comment on column public.obras_situacao.tipo_obra is 'Tipo se é Obra ou Serviço de Engenharia';
comment on column public.obras_situacao.numero_obra is 'Número da Obra ou Serviço de Engenharia';
comment on column public.obras_situacao.data_envio_informacao is 'Data do Envio da Informação Sobre o Status da obra ou Serviço de Engenharia';
comment on column public.obras_situacao.status_obra is 'Status da Obra ou Serviço de Engenharia';
comment on column public.obras_situacao.cpf_responsavel is 'CPF do Responsável Pela Informação';
comment on column public.obras_situacao.nome_responsavel is 'Nome do Responsável pela Informação';
comment on column public.obras_situacao.observacao_status is 'Observação sobre o Status';
comment on column public.obras_situacao.data_termo_conclusao is 'Data do Termo de Conclusão';
comment on column public.obras_situacao.tipo_termo_conclusao is 'Tipo de Termo de Conclusão';
comment on column public.obras_situacao.numero_registro_bem is 'Número de Registro ou Tombo do Bem';

create index if not exists obras_situacao_numero_obra_idx on public.obras_situacao (numero_obra);
create index if not exists obras_situacao_observacao_status_busca_idx on public.obras_situacao using gin ((public.sem_acento(lower(observacao_status))) gin_trgm_ops);
create index if not exists obras_situacao_nome_responsavel_busca_idx on public.obras_situacao using gin ((public.sem_acento(lower(nome_responsavel))) gin_trgm_ops);

drop trigger if exists obras_situacao_alteracao on public.obras_situacao;
create trigger obras_situacao_alteracao
  before update on public.obras_situacao
  for each row execute function public.registrar_alteracao();

alter table public.obras_situacao enable row level security;
drop policy if exists "leitura publica" on public.obras_situacao;
create policy "leitura publica" on public.obras_situacao for select using (true);

-- ---------------------------------------------------------------------------
-- bens: Bens Incorporados ao Patrimônio do Município (endpoint /bens_incorporados_patrimonio_municipio)
-- ---------------------------------------------------------------------------

create table if not exists public.bens (
  id text primary key,
  numero_registro                                  text,
  data_referencia_doc                              integer,
  data_aquisicao                                   timestamp,
  tipo_classificacao                               text,
  tipo_natureza                                    bigint,
  status_baixa                                     boolean,
  descricao_bem                                    text,
  area_bem_m2                                      numeric(18,4),
  municipio_cartorio                               text,
  zona_cartorio                                    text,
  matricula_registro                               text,
  longitude                                        text,
  latitude                                         text,
  endereco                                         text,
  distrito_localidade                              text,
  vida_util                                        bigint,
  valor_depreciavel                                numeric(18,4),
  valor_residual                                   numeric(18,4),
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.bens is 'Bens Incorporados ao Patrimônio do Município (TCE-CE, endpoint /bens_incorporados_patrimonio_municipio)';
comment on column public.bens.numero_registro is 'Número de Registro ou Tombo do Bem';
comment on column public.bens.data_referencia_doc is 'Data de Referência da Documentação';
comment on column public.bens.data_aquisicao is 'Data do Registro ou Tombo do Bem';
comment on column public.bens.tipo_classificacao is 'Classificação do Bem';
comment on column public.bens.tipo_natureza is 'Natureza do Bem';
comment on column public.bens.status_baixa is 'Status de Bem Baixado';
comment on column public.bens.descricao_bem is 'Descrição do Bem';
comment on column public.bens.area_bem_m2 is 'Área do Bem Imóvel - M2';
comment on column public.bens.municipio_cartorio is 'Município do Cartório do Bem Imóvel';
comment on column public.bens.zona_cartorio is 'Zona Cartorial do Bem Imóvel';
comment on column public.bens.matricula_registro is 'Matrícula do Registro do Bem Imóvel';
comment on column public.bens.longitude is 'Coordenada da Longitude do Bem Imóvel';
comment on column public.bens.latitude is 'Coordenada da Latitude do Bem Imóvel';
comment on column public.bens.endereco is 'Endereço Completo do Bem Imóvel';
comment on column public.bens.distrito_localidade is 'Distrito/Localidade do Bem Imóvel';
comment on column public.bens.vida_util is 'Vida Útil Econômica do Bem';
comment on column public.bens.valor_depreciavel is 'Valor Depreciável do Bem';
comment on column public.bens.valor_residual is 'Valor Residual do Bem';

create index if not exists bens_data_aquisicao_idx on public.bens (data_aquisicao);
create index if not exists bens_valor_depreciavel_idx on public.bens (valor_depreciavel);
create index if not exists bens_descricao_bem_busca_idx on public.bens using gin ((public.sem_acento(lower(descricao_bem))) gin_trgm_ops);
create index if not exists bens_endereco_busca_idx on public.bens using gin ((public.sem_acento(lower(endereco))) gin_trgm_ops);
create index if not exists bens_distrito_localidade_busca_idx on public.bens using gin ((public.sem_acento(lower(distrito_localidade))) gin_trgm_ops);

drop trigger if exists bens_alteracao on public.bens;
create trigger bens_alteracao
  before update on public.bens
  for each row execute function public.registrar_alteracao();

alter table public.bens enable row level security;
drop policy if exists "leitura publica" on public.bens;
create policy "leitura publica" on public.bens for select using (true);

-- ---------------------------------------------------------------------------
-- creditos: Abertura de Créditos Adicionais (endpoint /abertura_creditos_adicionais)
-- ---------------------------------------------------------------------------

create table if not exists public.creditos (
  id text primary key,
  exercicio_orcamento                              integer,
  data_abertura_credito                            timestamp,
  numero_abertura_credito_dia                      bigint,
  codigo_orgao                                     text,
  codigo_unidade_orcamentaria                      text,
  codigo_funcao                                    text,
  codigo_subfuncao                                 text,
  codigo_programa                                  text,
  codigo_projeto_atividade                         text,
  numero_projeto_atividade                         text,
  numero_sub_projeto_atividade                     text,
  cd_elemento_despesa                              text,
  codigo_tipo_fonte                                text,
  codigo_fonte                                     text,
  data_referencia_doc                              integer,
  numero_lei                                       text,
  numero_decreto                                   text,
  tipo_abertura_credito                            text,
  codigo_fonte_recursos                            text,
  valor_credito_super                              numeric(18,4),
  valor_credito_excesso                            numeric(18,4),
  valor_credito_operacao                           numeric(18,4),
  valor_credito_anulacao                           numeric(18,4),
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.creditos is 'Abertura de Créditos Adicionais (TCE-CE, endpoint /abertura_creditos_adicionais)';
comment on column public.creditos.exercicio_orcamento is 'Exercício do Orçamento';
comment on column public.creditos.data_abertura_credito is 'Data da Abertura de Crédito';
comment on column public.creditos.numero_abertura_credito_dia is 'Número Sequencial da Abertura de Crédito no Dia';
comment on column public.creditos.codigo_orgao is 'Código do Órgão';
comment on column public.creditos.codigo_unidade_orcamentaria is 'Código da Unidade Orçamentária';
comment on column public.creditos.codigo_funcao is 'Código da Função';
comment on column public.creditos.codigo_subfuncao is 'Código da Subfunção';
comment on column public.creditos.codigo_programa is 'Código do Programa';
comment on column public.creditos.codigo_projeto_atividade is 'Código de Projeto ou Atividade';
comment on column public.creditos.numero_projeto_atividade is 'Número do Projeto ou Atividade';
comment on column public.creditos.numero_sub_projeto_atividade is 'Número do Sub-projeto ou Sub-atividade';
comment on column public.creditos.cd_elemento_despesa is 'Código do Elemento de Despesa';
comment on column public.creditos.codigo_tipo_fonte is 'Código do Grupo da Fonte';
comment on column public.creditos.codigo_fonte is 'Código da Especificação da Fonte';
comment on column public.creditos.data_referencia_doc is 'Data de Referência da Documentação';
comment on column public.creditos.numero_lei is 'Número da Lei que autorizou a Abertura de Crédito';
comment on column public.creditos.numero_decreto is 'Número do Decreto que autorizou a Abertura de Crédito';
comment on column public.creditos.tipo_abertura_credito is 'Tipo de Abertura de Crédito';
comment on column public.creditos.codigo_fonte_recursos is 'Fonte de Recursos do Crédito';
comment on column public.creditos.valor_credito_super is 'Valor do Crédito por Superávit Financeiro';
comment on column public.creditos.valor_credito_excesso is 'Valor do Crédito por Excesso de Arrecadação';
comment on column public.creditos.valor_credito_operacao is 'Valor do Crédito por Operações Financeiras';
comment on column public.creditos.valor_credito_anulacao is 'Valor do Crédito por Anulações de Dotação';

create index if not exists creditos_exercicio_orcamento_idx on public.creditos (exercicio_orcamento);
create index if not exists creditos_data_abertura_credito_idx on public.creditos (data_abertura_credito);
create index if not exists creditos_numero_lei_busca_idx on public.creditos using gin ((public.sem_acento(lower(numero_lei))) gin_trgm_ops);
create index if not exists creditos_numero_decreto_busca_idx on public.creditos using gin ((public.sem_acento(lower(numero_decreto))) gin_trgm_ops);

drop trigger if exists creditos_alteracao on public.creditos;
create trigger creditos_alteracao
  before update on public.creditos
  for each row execute function public.registrar_alteracao();

alter table public.creditos enable row level security;
drop policy if exists "leitura publica" on public.creditos;
create policy "leitura publica" on public.creditos for select using (true);

-- ---------------------------------------------------------------------------
-- balancete_despesa: Balancetes de Despesas Orçamentárias (endpoint /balancetes_despesas_orcamentarias)
-- ---------------------------------------------------------------------------

create table if not exists public.balancete_despesa (
  id text primary key,
  exercicio_orcamento                              integer,
  codigo_orgao                                     text,
  codigo_unidade_orcamentaria                      text,
  codigo_funcao                                    text,
  codigo_subfuncao                                 text,
  codigo_programa                                  text,
  codigo_projeto_atividade                         text,
  numero_projeto_atividade                         text,
  numero_subprojeto_atividade                      text,
  codigo_elemento_despesa                          text,
  data_referencia_doc                              integer,
  tipo_balancete                                   text,
  valor_fixado_orcamento_bal_despesa               numeric(18,4),
  valor_suplementado_no_mes                        numeric(18,4),
  valor_suplementado_ate_mes                       numeric(18,4),
  valor_anulacoes_no_mes                           numeric(18,4),
  valor_empenhado_no_mes                           numeric(18,4),
  valor_empenhado_ate_mes                          numeric(18,4),
  valor_saldo_dotacao                              numeric(18,4),
  valor_pago_no_mes                                numeric(18,4),
  valor_pago_ate_mes                               numeric(18,4),
  valor_empenhado_pagar                            numeric(18,4),
  valor_anulacoes_dotacao_ate_mes                  numeric(18,4),
  valor_anulacoes_empenhos_no_mes                  numeric(18,4),
  valor_anulacoes_empenhos_ate_mes                 numeric(18,4),
  valor_liquidado_no_mes                           numeric(18,4),
  valor_liquidado_ate_mes                          numeric(18,4),
  valor_estornos_liquidacao_no_mes                 numeric(18,4),
  valor_estornos_liquidacao_ate_mes                numeric(18,4),
  valor_estornos_pagos_no_mes                      numeric(18,4),
  valor_estornos_pagos_ate_mes                     numeric(18,4),
  tipo_fonte                                       text,
  codigo_fonte                                     text,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.balancete_despesa is 'Balancetes de Despesas Orçamentárias (TCE-CE, endpoint /balancetes_despesas_orcamentarias)';
comment on column public.balancete_despesa.exercicio_orcamento is 'Exercício do Orçamento';
comment on column public.balancete_despesa.codigo_orgao is 'Código do Órgão';
comment on column public.balancete_despesa.codigo_unidade_orcamentaria is 'Código da Unidade Orçamentária';
comment on column public.balancete_despesa.codigo_funcao is 'Código da Função';
comment on column public.balancete_despesa.codigo_subfuncao is 'Código da Subfunção';
comment on column public.balancete_despesa.codigo_programa is 'Código do Programa';
comment on column public.balancete_despesa.codigo_projeto_atividade is 'Código de Projeto ou Atividade';
comment on column public.balancete_despesa.numero_projeto_atividade is 'Número do Projeto ou Atividade';
comment on column public.balancete_despesa.numero_subprojeto_atividade is 'Número do Sub-projeto ou Sub-atividade';
comment on column public.balancete_despesa.codigo_elemento_despesa is 'Código do Elemento de Despesa';
comment on column public.balancete_despesa.data_referencia_doc is 'Data de Referência da Documentação';
comment on column public.balancete_despesa.tipo_balancete is 'Tipo do Balancete';
comment on column public.balancete_despesa.valor_fixado_orcamento_bal_despesa is 'Valor Fixado no Orçamento';
comment on column public.balancete_despesa.valor_suplementado_no_mes is 'Valor Suplementado no Mês';
comment on column public.balancete_despesa.valor_suplementado_ate_mes is 'Valor Suplementado até o Mês';
comment on column public.balancete_despesa.valor_anulacoes_no_mes is 'Valor das Anulações de Dotação no Mês';
comment on column public.balancete_despesa.valor_empenhado_no_mes is 'Valor Empenhado no Mês';
comment on column public.balancete_despesa.valor_empenhado_ate_mes is 'Valor Empenhado até o Mês';
comment on column public.balancete_despesa.valor_saldo_dotacao is 'Valor do Saldo da Dotação';
comment on column public.balancete_despesa.valor_pago_no_mes is 'Valor Pago no Mês';
comment on column public.balancete_despesa.valor_pago_ate_mes is 'Valor Pago até o Mês';
comment on column public.balancete_despesa.valor_empenhado_pagar is 'Valor Empenhado a Pagar';
comment on column public.balancete_despesa.valor_anulacoes_dotacao_ate_mes is 'Valor das Anulações de Dotação até o Mês';
comment on column public.balancete_despesa.valor_anulacoes_empenhos_no_mes is 'Valor das Anulações de Empenhos no Mês';
comment on column public.balancete_despesa.valor_anulacoes_empenhos_ate_mes is 'Valor das Anulações de Empenhos até o Mês';
comment on column public.balancete_despesa.valor_liquidado_no_mes is 'Valor Liquidado no Mês';
comment on column public.balancete_despesa.valor_liquidado_ate_mes is 'Valor Liquidado até o Mês';
comment on column public.balancete_despesa.valor_estornos_liquidacao_no_mes is 'Valor dos Estornos de Liquidação no Mês';
comment on column public.balancete_despesa.valor_estornos_liquidacao_ate_mes is 'Valor dos Estornos de Liquidação até o Mês';
comment on column public.balancete_despesa.valor_estornos_pagos_no_mes is 'Valor dos Estornos de Pagamento no Mês';
comment on column public.balancete_despesa.valor_estornos_pagos_ate_mes is 'Valor dos Estornos de Pagamento até o Mês';
comment on column public.balancete_despesa.tipo_fonte is 'Código do Grupo da Fonte';
comment on column public.balancete_despesa.codigo_fonte is 'Código da Especificação da Fonte';

create index if not exists balancete_despesa_exercicio_orcamento_idx on public.balancete_despesa (exercicio_orcamento);
create index if not exists balancete_despesa_codigo_orgao_idx on public.balancete_despesa (codigo_orgao);
create index if not exists balancete_despesa_codigo_funcao_idx on public.balancete_despesa (codigo_funcao);

drop trigger if exists balancete_despesa_alteracao on public.balancete_despesa;
create trigger balancete_despesa_alteracao
  before update on public.balancete_despesa
  for each row execute function public.registrar_alteracao();

alter table public.balancete_despesa enable row level security;
drop policy if exists "leitura publica" on public.balancete_despesa;
create policy "leitura publica" on public.balancete_despesa for select using (true);

-- ---------------------------------------------------------------------------
-- balancete_receita: Balancetes de Receitas Orçamentárias (endpoint /balancetes_receitas_orcamentarias)
-- ---------------------------------------------------------------------------

create table if not exists public.balancete_receita (
  id text primary key,
  exercicio_orcamento                              integer,
  codigo_orgao                                     text,
  codigo_unidade_orcamentaria                      text,
  codigo_rubrica                                   text,
  data_referencia_doc                              integer,
  tipo_balancete                                   text,
  valor_previsto_orcamento                         numeric(18,4),
  valor_anulacoes_no_mes                           numeric(18,4),
  valor_arrecadacao_no_mes                         numeric(18,4),
  valor_arrecadacao_ate_mes                        numeric(18,4),
  valor_anulacoes_ate_mes                          numeric(18,4),
  tipo_fonte                                       text,
  codigo_fonte                                     text,
  hash            text        not null,
  sincronizado_em timestamptz not null default now()
);

comment on table public.balancete_receita is 'Balancetes de Receitas Orçamentárias (TCE-CE, endpoint /balancetes_receitas_orcamentarias)';
comment on column public.balancete_receita.exercicio_orcamento is 'Exercício do Orçamento';
comment on column public.balancete_receita.codigo_orgao is 'Código do Órgão';
comment on column public.balancete_receita.codigo_unidade_orcamentaria is 'Código da Unidade Orçamentária';
comment on column public.balancete_receita.codigo_rubrica is 'Código Receita Orçamentária';
comment on column public.balancete_receita.data_referencia_doc is 'Data de Referência da Documentação';
comment on column public.balancete_receita.tipo_balancete is 'Tipo do Balancete';
comment on column public.balancete_receita.valor_previsto_orcamento is 'Valor Previsto no Orçamento';
comment on column public.balancete_receita.valor_anulacoes_no_mes is 'Valor das Anulações no mês';
comment on column public.balancete_receita.valor_arrecadacao_no_mes is 'Valor da Arrecadação no mês';
comment on column public.balancete_receita.valor_arrecadacao_ate_mes is 'Valor da Arrecadação até o mês';
comment on column public.balancete_receita.valor_anulacoes_ate_mes is 'Valor das Anulações até mês';
comment on column public.balancete_receita.tipo_fonte is 'Código do Grupo da Fonte';
comment on column public.balancete_receita.codigo_fonte is 'Código da Especificação da Fonte';

create index if not exists balancete_receita_exercicio_orcamento_idx on public.balancete_receita (exercicio_orcamento);
create index if not exists balancete_receita_codigo_rubrica_idx on public.balancete_receita (codigo_rubrica);

drop trigger if exists balancete_receita_alteracao on public.balancete_receita;
create trigger balancete_receita_alteracao
  before update on public.balancete_receita
  for each row execute function public.registrar_alteracao();

alter table public.balancete_receita enable row level security;
drop policy if exists "leitura publica" on public.balancete_receita;
create policy "leitura publica" on public.balancete_receita for select using (true);

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

