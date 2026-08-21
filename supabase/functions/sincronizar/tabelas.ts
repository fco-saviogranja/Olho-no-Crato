// GERADO por ferramentas/gerar-esquema.mjs. Nao editar a mao.

export interface Tabela {
  tabela: string;
  path: string;
  periodo: string;
  fechamento: boolean;
  chave: string[];
  colunas: string[];
}

export const TABELAS: Tabela[] = [
  {
    "tabela": "empenhos",
    "path": "/notas_empenhos",
    "periodo": "exercicioMes",
    "fechamento": false,
    "chave": [
      "exercicio_orcamento",
      "codigo_orgao",
      "codigo_unidade_orcamentaria",
      "data_emissao_empenho",
      "numero_empenho"
    ],
    "colunas": [
      "exercicio_orcamento",
      "codigo_orgao",
      "codigo_unidade_orcamentaria",
      "data_emissao_empenho",
      "numero_empenho",
      "data_referencia_doc",
      "codigo_funcao",
      "codigo_subfuncao",
      "codigo_programa",
      "codigo_projeto_atividade",
      "numero_projeto_atividade",
      "numero_subprojeto_atividade",
      "codigo_elemento_despesa",
      "tipo_fonte",
      "codigo_fonte",
      "modalidade_nota_empenho",
      "descricao_historico_empenho",
      "valor_anterior_saldo_dotacao",
      "valor_empenhado",
      "valor_atual_saldo_dotacao",
      "tipo_processo_licitatorio",
      "numero_documento_negociante",
      "estado_empenho",
      "numero_nota_anulacao",
      "data_emissao_empenho_susbtituto",
      "numero_empenho_substituto",
      "codigo_tipo_negociante",
      "nome_negociante",
      "municipio_negociante",
      "codigo_uf",
      "cpf_ordenador",
      "cd_transferencia_tf",
      "cd_complem_fonte",
      "cd_subelem_desp",
      "cpf_gestor",
      "data_contrato",
      "numero_contrato",
      "data_realizacao_autuacao_licitacao",
      "numero_licitacao"
    ]
  },
  {
    "tabela": "contratos",
    "path": "/contratos",
    "periodo": "intervalo",
    "fechamento": false,
    "chave": [
      "numero_contrato",
      "data_contrato"
    ],
    "colunas": [
      "cpf_gestor",
      "data_contrato",
      "numero_contrato",
      "tipo_contrato",
      "modalide_contrato",
      "numero_contrato_original",
      "data_contrato_original",
      "data_inicio_vigencia_contrato",
      "data_fim_vigencia_contrato",
      "descricao_objeto_contrato",
      "valor_total_contrato",
      "data_referencia_doc",
      "data_autuacao_processo_adm",
      "numero_processo_adm",
      "nome_fiscal_contrato",
      "numero_id_contrato_pncp",
      "cpf_gestor_original",
      "cpf_fiscal_contrato"
    ]
  },
  {
    "tabela": "contratados",
    "path": "/contratados",
    "periodo": "intervalo",
    "fechamento": false,
    "chave": [
      "numero_contrato",
      "data_contrato",
      "numero_documento_negociante"
    ],
    "colunas": [
      "data_contrato",
      "numero_contrato",
      "numero_documento_negociante",
      "codigo_tipo_negociante",
      "nome_negociante",
      "nome_municipio_negociante",
      "codigo_uf",
      "data_referencia_doc",
      "cpf_gestor"
    ]
  },
  {
    "tabela": "licitacoes",
    "path": "/processos_administrativos_contratacoes",
    "periodo": "intervalo",
    "fechamento": false,
    "chave": [
      "numero_licitacao",
      "data_realizacao_autuacao_licitacao"
    ],
    "colunas": [
      "data_realizacao_autuacao_licitacao",
      "numero_licitacao",
      "hora_licitacao",
      "data_emissao_edital",
      "modalidade_licitacao",
      "tipo_licitacao",
      "descricao_objeto_licitacao",
      "valor_orcado_estimado",
      "valor_limite_superior",
      "cpf_gestor",
      "data_criacao_comissao",
      "numero_comissao",
      "nome_responsavel_homologacao",
      "data_realizacao_licitacao",
      "modalidade_processo_administrativo",
      "cpf_responsavel_juridico",
      "nome_responsavel_juridico",
      "data_homologacao",
      "descricao_justificativa_preco",
      "descricao_motivo_fornecedor",
      "descricao_fundamentacao_legal",
      "nome_orgao_ata",
      "data_referencia_doc",
      "nome_resp_cotacao",
      "nome_resp_termo_referencia",
      "tipo_forma_contratacao",
      "tipo_disputa",
      "descricao_url_plataforma_contratacao",
      "tipo_sistema_registro_precos",
      "numero_id_contratacao_pncp",
      "numero_id_ata_pncp",
      "cpf_responsavel_homologacao",
      "cpf_resp_cotacao",
      "cpf_resp_termo_referencia"
    ]
  },
  {
    "tabela": "itens_licitacao",
    "path": "/itens_compoem_bens_servicos",
    "periodo": "intervalo",
    "fechamento": false,
    "chave": [
      "numero_licitacao",
      "data_realizacao_licitacao",
      "numero_sequencial_item_licitacao"
    ],
    "colunas": [
      "data_realizacao_licitacao",
      "numero_licitacao",
      "numero_sequencial_item_licitacao",
      "numero_documento_negociante",
      "descricao_item_licitacao",
      "valor_vencedor_item_licitacao",
      "codigo_tipo_negociante",
      "descricao_unidade_item_licitacao",
      "numero_quantidade_item_licitacao",
      "valor_unitario_item_licitacao",
      "data_referencia_doc"
    ]
  },
  {
    "tabela": "licitantes",
    "path": "/licitantes_fornecedores_bens_servicos",
    "periodo": "intervalo",
    "fechamento": false,
    "chave": [
      "numero_licitacao",
      "data_realizacao_licitacao",
      "numero_documento_negociante"
    ],
    "colunas": [
      "data_realizacao_licitacao",
      "numero_licitacao",
      "numero_documento_negociante",
      "codigo_tipo_negociante",
      "nome_negociante",
      "nome_municipio_negociante",
      "codigo_uf",
      "data_referencia_doc"
    ]
  },
  {
    "tabela": "obras",
    "path": "/obras_municipais_servicos_engenharia",
    "periodo": "exercicioIntervalo",
    "fechamento": false,
    "chave": [
      "numero_obra",
      "tipo_obra",
      "data_inicio_obra"
    ],
    "colunas": [
      "data_inicio_obra",
      "tipo_obra",
      "numero_obra",
      "exercicio_orcamento",
      "codigo_orgao",
      "codigo_unidade_orcamentaria",
      "descricao_obra_servico",
      "tipo_execucao",
      "data_fim_obra",
      "valor_total_obra",
      "numero_registro_obra",
      "tipo_classificacao_bem"
    ]
  },
  {
    "tabela": "obras_situacao",
    "path": "/status_obras_servico_engenharia",
    "periodo": "intervalo",
    "fechamento": false,
    "chave": [
      "numero_obra",
      "tipo_obra",
      "data_envio_informacao"
    ],
    "colunas": [
      "data_inicio_obra",
      "tipo_obra",
      "numero_obra",
      "data_envio_informacao",
      "status_obra",
      "cpf_responsavel",
      "nome_responsavel",
      "observacao_status",
      "data_termo_conclusao",
      "tipo_termo_conclusao",
      "numero_registro_bem"
    ]
  },
  {
    "tabela": "bens",
    "path": "/bens_incorporados_patrimonio_municipio",
    "periodo": "intervalo",
    "fechamento": false,
    "chave": [
      "numero_registro",
      "data_referencia_doc"
    ],
    "colunas": [
      "numero_registro",
      "data_referencia_doc",
      "data_aquisicao",
      "tipo_classificacao",
      "tipo_natureza",
      "status_baixa",
      "descricao_bem",
      "area_bem_m2",
      "municipio_cartorio",
      "zona_cartorio",
      "matricula_registro",
      "longitude",
      "latitude",
      "endereco",
      "distrito_localidade",
      "vida_util",
      "valor_depreciavel",
      "valor_residual"
    ]
  },
  {
    "tabela": "creditos",
    "path": "/abertura_creditos_adicionais",
    "periodo": "exercicioIntervalo",
    "fechamento": false,
    "chave": [
      "exercicio_orcamento",
      "data_abertura_credito",
      "numero_abertura_credito_dia",
      "codigo_orgao",
      "codigo_unidade_orcamentaria",
      "cd_elemento_despesa",
      "codigo_fonte"
    ],
    "colunas": [
      "exercicio_orcamento",
      "data_abertura_credito",
      "numero_abertura_credito_dia",
      "codigo_orgao",
      "codigo_unidade_orcamentaria",
      "codigo_funcao",
      "codigo_subfuncao",
      "codigo_programa",
      "codigo_projeto_atividade",
      "numero_projeto_atividade",
      "numero_sub_projeto_atividade",
      "cd_elemento_despesa",
      "codigo_tipo_fonte",
      "codigo_fonte",
      "data_referencia_doc",
      "numero_lei",
      "numero_decreto",
      "tipo_abertura_credito",
      "codigo_fonte_recursos",
      "valor_credito_super",
      "valor_credito_excesso",
      "valor_credito_operacao",
      "valor_credito_anulacao"
    ]
  },
  {
    "tabela": "balancete_despesa",
    "path": "/balancetes_despesas_orcamentarias",
    "periodo": "exercicioMes",
    "fechamento": true,
    "chave": [
      "exercicio_orcamento",
      "data_referencia_doc",
      "codigo_orgao",
      "codigo_unidade_orcamentaria",
      "codigo_funcao",
      "codigo_subfuncao",
      "codigo_programa",
      "codigo_projeto_atividade",
      "numero_projeto_atividade",
      "numero_subprojeto_atividade",
      "codigo_elemento_despesa",
      "tipo_fonte",
      "codigo_fonte"
    ],
    "colunas": [
      "exercicio_orcamento",
      "codigo_orgao",
      "codigo_unidade_orcamentaria",
      "codigo_funcao",
      "codigo_subfuncao",
      "codigo_programa",
      "codigo_projeto_atividade",
      "numero_projeto_atividade",
      "numero_subprojeto_atividade",
      "codigo_elemento_despesa",
      "data_referencia_doc",
      "tipo_balancete",
      "valor_fixado_orcamento_bal_despesa",
      "valor_suplementado_no_mes",
      "valor_suplementado_ate_mes",
      "valor_anulacoes_no_mes",
      "valor_empenhado_no_mes",
      "valor_empenhado_ate_mes",
      "valor_saldo_dotacao",
      "valor_pago_no_mes",
      "valor_pago_ate_mes",
      "valor_empenhado_pagar",
      "valor_anulacoes_dotacao_ate_mes",
      "valor_anulacoes_empenhos_no_mes",
      "valor_anulacoes_empenhos_ate_mes",
      "valor_liquidado_no_mes",
      "valor_liquidado_ate_mes",
      "valor_estornos_liquidacao_no_mes",
      "valor_estornos_liquidacao_ate_mes",
      "valor_estornos_pagos_no_mes",
      "valor_estornos_pagos_ate_mes",
      "tipo_fonte",
      "codigo_fonte"
    ]
  },
  {
    "tabela": "balancete_receita",
    "path": "/balancetes_receitas_orcamentarias",
    "periodo": "exercicioMes",
    "fechamento": true,
    "chave": [
      "exercicio_orcamento",
      "data_referencia_doc",
      "codigo_orgao",
      "codigo_unidade_orcamentaria",
      "codigo_rubrica",
      "tipo_fonte",
      "codigo_fonte"
    ],
    "colunas": [
      "exercicio_orcamento",
      "codigo_orgao",
      "codigo_unidade_orcamentaria",
      "codigo_rubrica",
      "data_referencia_doc",
      "tipo_balancete",
      "valor_previsto_orcamento",
      "valor_anulacoes_no_mes",
      "valor_arrecadacao_no_mes",
      "valor_arrecadacao_ate_mes",
      "valor_anulacoes_ate_mes",
      "tipo_fonte",
      "codigo_fonte"
    ]
  }
];
