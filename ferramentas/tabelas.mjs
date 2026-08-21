// Quais endpoints do TCE sao espelhados no banco, com que chave natural e
// como a carga percorre o tempo. E a unica lista que precisa mudar para incluir
// ou tirar uma tabela: o esquema e a carga leem daqui.
//
// O banco nao espelha a API inteira. Um exercicio completo de todos os
// endpoints medidos passa de 90 MB de JSON cru, e nove exercicios nao caberiam
// no plano gratuito do Supabase. Entra aqui o que a API do TCE nao consegue
// fazer: cruzar exercicios, buscar texto e guardar historico de retificacao.
// O resto continua sendo consultado ao vivo pelo site.

/**
 * periodo diz como a sincronizacao percorre o tempo:
 *   exercicioMes      exercicio_orcamento + data_referencia_doc, mes a mes
 *   exercicioIntervalo exercicio_orcamento + data_inicio/data_fim do ano
 *   intervalo         apenas data_inicio/data_fim do ano
 * fechamento: so o ultimo mes de cada exercicio, porque as colunas "ate_mes"
 * do balancete ja trazem o acumulado do ano inteiro.
 */
export const TABELAS = [
  {
    tabela: 'empenhos',
    endpoint: 'notas_empenhos',
    periodo: 'exercicioMes',
    chave: ['exercicio_orcamento', 'codigo_orgao', 'codigo_unidade_orcamentaria',
      'data_emissao_empenho', 'numero_empenho'],
    busca: ['nome_negociante', 'descricao_historico_empenho'],
    indices: [['numero_documento_negociante'], ['exercicio_orcamento'], ['codigo_orgao'],
      ['valor_empenhado']],
    ignorar: ['endereco_negociante', 'fone_negociante', 'cep_negociante'],
  },
  {
    tabela: 'contratos',
    endpoint: 'contratos',
    periodo: 'intervalo',
    chave: ['numero_contrato', 'data_contrato'],
    busca: ['descricao_objeto_contrato', 'nome_fiscal_contrato'],
    indices: [['data_contrato'], ['valor_total_contrato']],
  },
  {
    tabela: 'contratados',
    endpoint: 'contratados',
    periodo: 'intervalo',
    chave: ['numero_contrato', 'data_contrato', 'numero_documento_negociante'],
    busca: ['nome_negociante'],
    indices: [['numero_documento_negociante'], ['data_contrato']],
    ignorar: ['endereco_negociante', 'fone_negociante', 'cep_negociante'],
  },
  {
    tabela: 'licitacoes',
    endpoint: 'processos_administrativos_contratacoes',
    periodo: 'intervalo',
    chave: ['numero_licitacao', 'data_realizacao_autuacao_licitacao'],
    busca: ['descricao_objeto_licitacao', 'descricao_fundamentacao_legal'],
    indices: [['data_realizacao_autuacao_licitacao'], ['valor_orcado_estimado']],
  },
  {
    tabela: 'itens_licitacao',
    endpoint: 'itens_compoem_bens_servicos',
    periodo: 'intervalo',
    chave: ['numero_licitacao', 'data_realizacao_licitacao', 'numero_sequencial_item_licitacao'],
    busca: ['descricao_item_licitacao'],
    indices: [['numero_documento_negociante'], ['valor_unitario_item_licitacao']],
  },
  {
    tabela: 'licitantes',
    endpoint: 'licitantes_fornecedores_bens_servicos',
    periodo: 'intervalo',
    chave: ['numero_licitacao', 'data_realizacao_licitacao', 'numero_documento_negociante'],
    busca: ['nome_negociante'],
    indices: [['numero_documento_negociante']],
    ignorar: ['endereco_negociante', 'fone_negociante', 'cep_negociante'],
  },
  {
    tabela: 'obras',
    endpoint: 'obras_municipais_servicos_engenharia',
    periodo: 'exercicioIntervalo',
    chave: ['numero_obra', 'tipo_obra', 'data_inicio_obra'],
    busca: ['descricao_obra_servico'],
    indices: [['exercicio_orcamento'], ['valor_total_obra']],
  },
  {
    tabela: 'obras_situacao',
    endpoint: 'status_obras_servico_engenharia',
    periodo: 'intervalo',
    chave: ['numero_obra', 'tipo_obra', 'data_envio_informacao'],
    busca: ['observacao_status', 'nome_responsavel'],
    indices: [['numero_obra']],
    ignorar: ['numero_telefone_responsavel', 'email_responsavel'],
  },
  {
    tabela: 'bens',
    endpoint: 'bens_incorporados_patrimonio_municipio',
    periodo: 'intervalo',
    chave: ['numero_registro', 'data_referencia_doc'],
    busca: ['descricao_bem', 'endereco', 'distrito_localidade'],
    indices: [['data_aquisicao'], ['valor_depreciavel']],
  },
  {
    tabela: 'creditos',
    endpoint: 'abertura_creditos_adicionais',
    periodo: 'exercicioIntervalo',
    chave: ['exercicio_orcamento', 'data_abertura_credito', 'numero_abertura_credito_dia',
      'codigo_orgao', 'codigo_unidade_orcamentaria', 'cd_elemento_despesa', 'codigo_fonte'],
    busca: ['numero_lei', 'numero_decreto'],
    indices: [['exercicio_orcamento'], ['data_abertura_credito']],
  },
  {
    tabela: 'balancete_despesa',
    endpoint: 'balancetes_despesas_orcamentarias',
    periodo: 'exercicioMes',
    fechamento: true,
    chave: ['exercicio_orcamento', 'data_referencia_doc', 'codigo_orgao',
      'codigo_unidade_orcamentaria', 'codigo_funcao', 'codigo_subfuncao', 'codigo_programa',
      'codigo_projeto_atividade', 'numero_projeto_atividade', 'numero_subprojeto_atividade',
      'codigo_elemento_despesa', 'tipo_fonte', 'codigo_fonte'],
    indices: [['exercicio_orcamento'], ['codigo_orgao'], ['codigo_funcao']],
  },
  {
    tabela: 'balancete_receita',
    endpoint: 'balancetes_receitas_orcamentarias',
    periodo: 'exercicioMes',
    fechamento: true,
    chave: ['exercicio_orcamento', 'data_referencia_doc', 'codigo_orgao',
      'codigo_unidade_orcamentaria', 'codigo_rubrica', 'tipo_fonte', 'codigo_fonte'],
    indices: [['exercicio_orcamento'], ['codigo_rubrica']],
  },
];
