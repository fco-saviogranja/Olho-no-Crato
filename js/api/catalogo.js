// Gerado a partir de openapi_prod.yaml (SIM/TCE-CE, OpenAPI 3.0.1 v2.0).
// Nao editar a mao: rode novamente o gerador se a API mudar.
// Total de endpoints: 74

export const GRUPOS = [
  {
    "sigla": "AUX",
    "nome": "Auxiliares",
    "descricao": "Tabelas de apoio: municipios, funcoes de governo e tipos de unidade.",
    "total": 3
  },
  {
    "sigla": "BAS",
    "nome": "Documentacao de Informacoes Basicas (BAS)",
    "descricao": "Quem e quem na prefeitura: orgaos, gestores, unidades e contas bancarias.",
    "total": 8
  },
  {
    "sigla": "ORC",
    "nome": "Documentacao referente ao Orcamento Municipal (ORC)",
    "descricao": "O plano de gastos e de arrecadacao aprovado para o ano.",
    "total": 6
  },
  {
    "sigla": "BAL",
    "nome": "Documentacao referente aos Balancetes (BAL)",
    "descricao": "O resumo mensal e acumulado da execucao do orcamento.",
    "total": 8
  },
  {
    "sigla": "DCR",
    "nome": "Documentacao Comprobatoria de Receitas (DCR)",
    "descricao": "Os taloes que comprovam cada entrada de dinheiro.",
    "total": 4
  },
  {
    "sigla": "DCD",
    "nome": "Documentacao Comprobatoria de Despesas (DCD)",
    "descricao": "O caminho completo de cada gasto: empenho, liquidacao, nota fiscal e pagamento.",
    "total": 15
  },
  {
    "sigla": "LCO",
    "nome": "Processos Administrativos para Contratacoes (LCO)",
    "descricao": "Licitacoes, contratos, fornecedores e itens contratados.",
    "total": 9
  },
  {
    "sigla": "OSC",
    "nome": "Documentacao referente a Processos de Parcerias com OSC (OSC)",
    "descricao": "Repasses e parcerias com organizacoes da sociedade civil.",
    "total": 8
  },
  {
    "sigla": "CRD",
    "nome": "Documentacao referente a Abertura de Creditos Adicionais (CRD)",
    "descricao": "Mudancas no orcamento durante o ano: creditos extras e remanejamentos.",
    "total": 5
  },
  {
    "sigla": "OSE",
    "nome": "Documentacao de Obras Municipais ou Servicos de Engenharia (OSE)",
    "descricao": "Obras publicas, medicoes e situacao de cada uma.",
    "total": 3
  },
  {
    "sigla": "PAT",
    "nome": "Documentacao de Controle do Patrimonio Municipal (PAT)",
    "descricao": "Os bens que pertencem ao municipio.",
    "total": 5
  }
];

export const ENDPOINTS = [
  {
    "id": "funcoes",
    "path": "/funcoes",
    "grupo": "AUX",
    "titulo": "Funções",
    "params": [
      {
        "nome": "codigo_funcao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Função"
      },
      {
        "nome": "nome_funcao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Nome da Função"
      }
    ],
    "campos": {
      "codigo_funcao": "Código da Função",
      "nome_funcao": "Nome da Função"
    },
    "tipos": {
      "codigo_funcao": "string",
      "nome_funcao": "string"
    }
  },
  {
    "id": "municipios",
    "path": "/municipios",
    "grupo": "AUX",
    "titulo": "Municípios",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "nome_municipio",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Nome do Município"
      },
      {
        "nome": "codigo_municipio_ibge",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Município do IBGE"
      },
      {
        "nome": "codigo_municipio_geonames",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Município do GeoNames"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "nome_municipio": "Nome do Município",
      "codigo_municipio_ibge": "Código do Município do IBGE",
      "codigo_municipio_geonames": "Código do Município do GeoNames"
    },
    "tipos": {
      "codigo_municipio": "string",
      "nome_municipio": "string",
      "codigo_municipio_ibge": "string",
      "codigo_municipio_geonames": "string"
    }
  },
  {
    "id": "tipos_unidades_administrativas",
    "path": "/tipos_unidades_administrativas",
    "grupo": "AUX",
    "titulo": "Tipos de Unidades Administrativas",
    "params": [
      {
        "nome": "codigo_tipo_unidade_administrativa",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Tipo da Unidade Administrativa"
      },
      {
        "nome": "nome_tipo_unidade_administrativa",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Descrição do Tipo da Unidade Administrativa"
      }
    ],
    "campos": {
      "codigo_tipo_unidade_administrativa": "Código do Tipo da Unidade Administrativa",
      "nome_tipo_unidade_administrativa": "Descrição do Tipo da Unidade Administrativa"
    },
    "tipos": {
      "codigo_tipo_unidade_administrativa": "string",
      "nome_tipo_unidade_administrativa": "string"
    }
  },
  {
    "id": "contas_bancarias_municipio",
    "path": "/contas_bancarias_municipio",
    "grupo": "BAS",
    "titulo": "Contas Bancárias do Município",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "numero_banco": "Número do Banco",
      "numero_agencia": "Número da Agência",
      "numero_conta": "Número da Conta Corrente",
      "data_abertura_conta": "Data da Abertura da Conta Corrente",
      "valor_saldo_abertura": "Saldo ou Valor de Abertura da Conta Corrente",
      "tipo_conta": "Tipo de Conta Bancária",
      "codigo_funcao_conta": "Função de Governo a que se Vincula a Conta Bancária",
      "descricao_objetivo_conta": "Descrição do Objeto de Vínculo da Conta Bancária",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "numero_banco": "string",
      "numero_agencia": "string",
      "numero_conta": "string",
      "data_abertura_conta": "string",
      "valor_saldo_abertura": "number",
      "tipo_conta": "integer",
      "codigo_funcao_conta": "string",
      "descricao_objetivo_conta": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "contas_extra_orcamentarias",
    "path": "/contas_extra_orcamentarias",
    "grupo": "BAS",
    "titulo": "Contas Extra-Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_conta_extra_orc": "Código da Conta Extra- Orçamentária",
      "descricao_conta_extra_orc": "Descrição da Conta ExtraOrçamentária",
      "valor_saldo_inicio": "Situação Patrimonial e Saldo no Início do Exercício",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_conta_extra_orc": "integer",
      "descricao_conta_extra_orc": "string",
      "valor_saldo_inicio": "number",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "empresas_estatais",
    "path": "/empresas_estatais",
    "grupo": "BAS",
    "titulo": "Empresas Estatais",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao_vinculo": "Código do Órgão Municipal ao Qual Empresa Está Vinculada",
      "cnpj_estatal": "Número de CNPJ da Estatal",
      "nome_razao_social": "Nome ou Razão Social da Estatal",
      "tipo_empresa_estatal": "Tipo de Empresa Estatal",
      "situacao_estatal": "Situação de Dependência da Estatal",
      "tipo_acionista_controlador": "Tipo de Acionista Controlador",
      "cnpj_acionista_controlador": "Número de CNPJ do Acionista Controlador",
      "nome_razao_social_acionista": "Nome ou Razão Social do Acionista Controlador",
      "percentual_acionista_estatal": "Percentual de Participação do Acionista Controlador no Controle da Estatal",
      "numero_lei_criacao_estatal": "Número da Lei que Autorizou a Criação da Estatal",
      "data_lei_criacao_estatal": "Data da Lei que Autorizou a Criação da Estatal",
      "data_criacao_estatal": "Data da Criação da Estatal",
      "descricao_endereco_estatal": "Endereço da Estatal",
      "numero_cep_estatal": "Número do CEP da Estatal",
      "numero_telefone_estatal": "Número do Telefone da Estatal",
      "email_estatal": "E-mail da Estatal",
      "cpf_gestor_estatal": "Número do CPF do Gestor Responsável pela Estatal",
      "nome_gestor_estatal": "Nome Gestor Responsável pela Estatal",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao_vinculo": "string",
      "cnpj_estatal": "string",
      "nome_razao_social": "string",
      "tipo_empresa_estatal": "string",
      "situacao_estatal": "string",
      "tipo_acionista_controlador": "string",
      "cnpj_acionista_controlador": "string",
      "nome_razao_social_acionista": "string",
      "percentual_acionista_estatal": "number",
      "numero_lei_criacao_estatal": "string",
      "data_lei_criacao_estatal": "string",
      "data_criacao_estatal": "string",
      "descricao_endereco_estatal": "string",
      "numero_cep_estatal": "string",
      "numero_telefone_estatal": "string",
      "email_estatal": "string",
      "cpf_gestor_estatal": "string",
      "nome_gestor_estatal": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "gestores",
    "path": "/gestores",
    "grupo": "BAS",
    "titulo": "Gestores",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_unidade_gestora",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Código da Unidade Gestora"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "cpf_gestor": "Número do CPF do Gestor",
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_unidade_gestora": "Código da Unidade Gestora",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_ingresso": "Forma de Ingresso no Serviço Público Municipal",
      "codigo_vinculo": "Tipo de relação com o serviço público",
      "numero_expediente": "Número do Expediente de Nomeação ou Posse",
      "data_inicio_gestao": "Data de Início da Gestão",
      "nome_gestor": "Nome do Gestor",
      "data_fim_gestao": "Data de Fim da Gestão",
      "tipo_cargo": "Código do Tipo de Cargo",
      "status_ordenador": "Status de Ordenador",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "cpf_gestor": "string",
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_unidade_gestora": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_ingresso": "string",
      "codigo_vinculo": "string",
      "numero_expediente": "string",
      "data_inicio_gestao": "string",
      "nome_gestor": "string",
      "data_fim_gestao": "string",
      "tipo_cargo": "string",
      "status_ordenador": "boolean",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "ordenadores_despesas",
    "path": "/ordenadores_despesas",
    "grupo": "BAS",
    "titulo": "Ordenadores de Despesas",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_unidade_gestora",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Código da Unidade Gestora"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_unidade_gestora": "Código da Unidade Gestora",
      "codigo_orgao": "Código do Órgão",
      "nome_ordenador": "Nome do Ordenador",
      "data_inclusao_unidade_orcamentaria": "Data de Inclusão da Unidade Orçamentária",
      "cpf_ordenador": "Número do CPF do Ordenador",
      "codigo_ingresso": "Forma de Ingresso no Serviço Público Municipal",
      "codigo_vinculo": "Tipo de relação com o serviço público",
      "numero_expediente_nomeacao": "Número do Expediente de Nomeação ou Posse",
      "data_inicio_gestao_ordenador": "Data de Início da Designação",
      "data_fim_gestao_ordenador": "Data de Fim da Designação",
      "tipo_cargo": "Código do Tipo de Cargo",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_unidade_gestora": "integer",
      "codigo_orgao": "string",
      "nome_ordenador": "string",
      "data_inclusao_unidade_orcamentaria": "string",
      "cpf_ordenador": "string",
      "codigo_ingresso": "string",
      "codigo_vinculo": "string",
      "numero_expediente_nomeacao": "string",
      "data_inicio_gestao_ordenador": "string",
      "data_fim_gestao_ordenador": "string",
      "tipo_cargo": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "orgaos",
    "path": "/orgaos",
    "grupo": "BAS",
    "titulo": "Órgãos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "nome_orgao": "Nome do Órgão",
      "codigo_tipo_unidade": "Código do Tipo de Unidade Administrativa",
      "cgc_orgao": "Número de CNPJ do Órgão",
      "email_orgao": "E-Mail do Órgão",
      "numero_fax_orgao": "Número do Fax do Órgão",
      "numero_fone_orgao": "Número do Telefone do Órgão",
      "cep_orgao": "Número do CEP do Órgão",
      "endereco_orgao": "Endereço do Órgão"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "nome_orgao": "string",
      "codigo_tipo_unidade": "string",
      "cgc_orgao": "string",
      "email_orgao": "string",
      "numero_fax_orgao": "string",
      "numero_fone_orgao": "string",
      "cep_orgao": "string",
      "endereco_orgao": "string"
    }
  },
  {
    "id": "unidades_gestoras",
    "path": "/unidades_gestoras",
    "grupo": "BAS",
    "titulo": "Unidades Gestoras",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Ano do exercício do orçamento. Atenção: dados disponíveis a partir de 2008. Adicione “00” ao final do ano. Exemplo: 2010 → 201000"
      },
      {
        "nome": "codigo_unidade_gestora",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Código da unidade gestora"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Ano do exercício do orçamento. Atenção: dados disponíveis a partir de 2008. Adicione “00” ao final do ano. Exemplo: 2010 → 201000",
      "codigo_unidade_gestora": "Código da unidade gestora",
      "nome_unidade_gestora": "Nome da Unidade Gestora",
      "data_criacao_ug": "Data de Cadastro da Unidade Gestora",
      "data_extincao_ug": "Data de Extinção da Unidade Gestora",
      "numero_lei_criacao": "Número da lei de Criação da Unidade Gestora",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_inclusao_uo": "Data de Inclusão da Unidade Orçamentária na Unidade Gestora",
      "data_exclusao_uo": "Data da Exclusão da Unidade Orçamentária na Unidade Gestora",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_unidade_gestora": "integer",
      "nome_unidade_gestora": "string",
      "data_criacao_ug": "string",
      "data_extincao_ug": "string",
      "numero_lei_criacao": "string",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_inclusao_uo": "string",
      "data_exclusao_uo": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "unidades_orcamentarias",
    "path": "/unidades_orcamentarias",
    "grupo": "BAS",
    "titulo": "Unidades Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_tipo_unidade": "Código do Tipo de Unidade Administrativa",
      "nome_unidade": "Nome da Unidade Orçamentária",
      "tipo_administracao_unidade": "Tipo de Administração"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_tipo_unidade": "string",
      "nome_unidade": "string",
      "tipo_administracao_unidade": "string"
    }
  },
  {
    "id": "dados_orcamentos",
    "path": "/dados_orcamentos",
    "grupo": "ORC",
    "titulo": "Dados dos Orçamentos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "nu_lei_orcamento": "Número da Lei do Orçamento",
      "valor_total_fixado_orcamento": "Valor Total Fixado no Orçamento",
      "percentual_supl_orcamento": "Percentual de Suplementação sobre o total fixado autorizado na Lei Orçamentária",
      "valor_total_supl_orcamento": "Valor total para Suplementações autorizado na Lei Orçamentária em unidade monetária",
      "data_envio_loa": "Data de envio do projeto de LOA para a Câmara Municipal",
      "data_aprovacao_loa": "Data de aprovação do projeto de LOA pela Câmara Municipal",
      "data_publicacao_loa": "Data de Publicação da LOA"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "nu_lei_orcamento": "string",
      "valor_total_fixado_orcamento": "number",
      "percentual_supl_orcamento": "number",
      "valor_total_supl_orcamento": "number",
      "data_envio_loa": "string",
      "data_aprovacao_loa": "string",
      "data_publicacao_loa": "string"
    }
  },
  {
    "id": "elementos_despesas_projetos_atividades",
    "path": "/elementos_despesas_projetos_atividades",
    "grupo": "ORC",
    "titulo": "Elementos de Despesas por Projetos e Atividades",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_funcao": "Código da Função",
      "codigo_subfuncao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_subprojeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "codigo_elemento_despesa": "Código do Elemento de Despesa",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "valor_atual_categoria_economica": "",
      "valor_orcado_categoria_economica": "Valor fixado para Despesa com este Elemento no Projeto ou Atividade especificado"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_funcao": "string",
      "codigo_subfuncao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_subprojeto_atividade": "string",
      "codigo_elemento_despesa": "string",
      "tipo_fonte": "string",
      "codigo_fonte": "string",
      "valor_atual_categoria_economica": "number",
      "valor_orcado_categoria_economica": "number"
    }
  },
  {
    "id": "orcamento_despesa",
    "path": "/orcamento_despesa",
    "grupo": "ORC",
    "titulo": "Orçamento de Despesa",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_elemento_despesa": "Classificação da Despesa",
      "nome_elemento_despesa": "Descrição do Elemento de Despesa",
      "valor_total_fixado": "Valor Total Fixado no Orçamento"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_elemento_despesa": "string",
      "nome_elemento_despesa": "string",
      "valor_total_fixado": "number"
    }
  },
  {
    "id": "orcamento_despesas_projetos_atividades",
    "path": "/orcamento_despesas_projetos_atividades",
    "grupo": "ORC",
    "titulo": "Orçamento de Despesas por Projetos e Atividades",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_funcao": "Código da Função",
      "codigo_subfuncao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_subprojeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "codigo_tipo_orcamento": "Código do Tipo de Orçamento",
      "nome_projeto_atividade": "Nome do Projeto ou Atividade",
      "descricao_projeto_atividade": "Descrição do Projeto ou Atividade",
      "valor_total_fixado_projeto_atividade": "Valor Total do Projeto ou Atividade Fixado no Orçamento"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_funcao": "string",
      "codigo_subfuncao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_subprojeto_atividade": "string",
      "codigo_tipo_orcamento": "string",
      "nome_projeto_atividade": "string",
      "descricao_projeto_atividade": "string",
      "valor_total_fixado_projeto_atividade": "number"
    }
  },
  {
    "id": "orcamento_receita",
    "path": "/orcamento_receita",
    "grupo": "ORC",
    "titulo": "Orçamento de Receita",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_rubrica": "Código da Receita Orçamentária",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "descricao_rubrica": "Descrição do Detalhamento da Receita Orçamentária",
      "valor_previsto": "Valor Previsto no Orçamento"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_rubrica": "string",
      "tipo_fonte": "string",
      "codigo_fonte": "string",
      "descricao_rubrica": "string",
      "valor_previsto": "number"
    }
  },
  {
    "id": "programas_governo",
    "path": "/programas_governo",
    "grupo": "ORC",
    "titulo": "Programas de Governo",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_programa": "Código do Programa de Governo",
      "numero_programa": "Nome do Programa de Governo"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_programa": "string",
      "numero_programa": "string"
    }
  },
  {
    "id": "balancetes_contabeis",
    "path": "/balancetes_contabeis",
    "grupo": "BAL",
    "titulo": "Balancetes Contábeis",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_unidade_gestora",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Código da Unidade Gestora"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_unidade_gestora": "Código da Unidade Gestora",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta_contabil": "Código da Conta Contábil",
      "codigo_funcao": "Código da Função",
      "codigo_sub_funcao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_sub_projeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "codigo_natureza_despesa_orc": "Código da Natureza da Despesa Orçamentária",
      "codigo_grupo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "codigo_complemento_fonte": "Código do Complemento da Fonte",
      "data_referencia_doc": "Data de Referência da Documentação",
      "codigo_saldo_no_mes": "Natureza do Saldo Inicial do Mês",
      "valor_saldo_no_mes": "Valor do Saldo Inicial do Mês",
      "valor_total_debitos_no_mes": "Valor Total dos Débitos Realizados no Mês",
      "valor_total_creditos_no_mes": "Valor Total dos Créditos Realizados no Mês",
      "codigo_saldo_ate_mes": "Natureza do Saldo Final até o Mês",
      "valor_saldo_ate_mes": "Valor do Saldo Final até o Mês",
      "exercicio_orcamento_restos_pagar": "Exercício do Orçamento – Restos a Pagar"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_unidade_gestora": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta_contabil": "string",
      "codigo_funcao": "string",
      "codigo_sub_funcao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_sub_projeto_atividade": "string",
      "codigo_natureza_despesa_orc": "string",
      "codigo_grupo_fonte": "string",
      "codigo_fonte": "string",
      "codigo_complemento_fonte": "string",
      "data_referencia_doc": "integer",
      "codigo_saldo_no_mes": "string",
      "valor_saldo_no_mes": "number",
      "valor_total_debitos_no_mes": "number",
      "valor_total_creditos_no_mes": "number",
      "codigo_saldo_ate_mes": "string",
      "valor_saldo_ate_mes": "number",
      "exercicio_orcamento_restos_pagar": "integer"
    }
  },
  {
    "id": "balancetes_contabeis_despesas",
    "path": "/balancetes_contabeis_despesas",
    "grupo": "BAL",
    "titulo": "Balancetes Contábeis de Despesas",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_unidade_gestora",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Código da Unidade Gestora"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_unidade_gestora": "Código da Unidade Gestora",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta_contabil": "Código da Conta Contábil",
      "codigo_funcao": "Código da Função",
      "codigo_sub_funcao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_sub_projeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "codigo_natureza_despesa_orc": "Código da Natureza da Despesa Orçamentária",
      "codigo_grupo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "codigo_complemento_fonte": "Código do Complemento da Fonte",
      "data_referencia_doc": "Data de Referência da Documentação",
      "codigo_saldo_no_mes": "Natureza do Saldo Inicial do Mês",
      "valor_saldo_no_mes": "Valor do Saldo Inicial do Mês",
      "valor_total_debitos_no_mes": "Valor Total dos Débitos Realizados no Mês",
      "valor_total_creditos_no_mes": "Valor Total dos Créditos Realizados no Mês",
      "codigo_saldo_ate_mes": "Natureza do Saldo Final até o Mês",
      "valor_saldo_ate_mes": "Valor do Saldo Final até o Mês",
      "exercicio_orcamento_restos_pagar": "Exercício do Orçamento – Restos a Pagar"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_unidade_gestora": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta_contabil": "string",
      "codigo_funcao": "string",
      "codigo_sub_funcao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_sub_projeto_atividade": "string",
      "codigo_natureza_despesa_orc": "string",
      "codigo_grupo_fonte": "string",
      "codigo_fonte": "string",
      "codigo_complemento_fonte": "string",
      "data_referencia_doc": "integer",
      "codigo_saldo_no_mes": "string",
      "valor_saldo_no_mes": "number",
      "valor_total_debitos_no_mes": "number",
      "valor_total_creditos_no_mes": "number",
      "codigo_saldo_ate_mes": "string",
      "valor_saldo_ate_mes": "number",
      "exercicio_orcamento_restos_pagar": "integer"
    }
  },
  {
    "id": "balancetes_contabeis_receitas",
    "path": "/balancetes_contabeis_receitas",
    "grupo": "BAL",
    "titulo": "Balancetes Contábeis de Receitas",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_unidade_gestora",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Código da Unidade Gestora"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_unidade_gestora": "Código da Unidade Gestora",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta_contabil": "Código da Conta Contábil",
      "codigo_receita": "Código da Natureza da Receita Orçamentária",
      "grupo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "codigo_complemento_fonte": "Código do Complemento da Fonte",
      "data_referencia_doc": "Data de Referência da Documentação",
      "codigo_saldo_no_mes": "Natureza do Saldo Inicial do Mês",
      "valor_saldo_no_mes": "Valor do Saldo Inicial do Mês",
      "valor_total_debidos": "Valor Total dos Débitos Realizados no Mês",
      "valor_total_creditos": "Valor Total dos Créditos Realizados no Mês",
      "codigo_saldo_ate_mes": "Natureza do Saldo Final até o Mês",
      "valor_saldo_ate_mes": "Valor do Saldo Final até o Mês"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_unidade_gestora": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta_contabil": "string",
      "codigo_receita": "string",
      "grupo_fonte": "string",
      "codigo_fonte": "string",
      "codigo_complemento_fonte": "string",
      "data_referencia_doc": "integer",
      "codigo_saldo_no_mes": "string",
      "valor_saldo_no_mes": "number",
      "valor_total_debidos": "number",
      "valor_total_creditos": "number",
      "codigo_saldo_ate_mes": "string",
      "valor_saldo_ate_mes": "number"
    }
  },
  {
    "id": "balancetes_despesas_extra_orcamentarias",
    "path": "/balancetes_despesas_extra_orcamentarias",
    "grupo": "BAL",
    "titulo": "Balancetes de Despesas Extra-Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta_extraorcamentaria": "Código da Conta Extraorçamentária",
      "data_referencia_doc": "Data de Referência da Documentação",
      "tipo_balancete": "Tipo do Balancete",
      "valor_anulacoes_no_mes": "Valor das Anulações no Mês",
      "vl_anulacao_ate_mes_bde": "Valor das Anulações até o Mês",
      "valor_pago_no_mes": "Valor Pago no Mês",
      "valor_pago_ate_mes": "Valor Pago até o Mês"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta_extraorcamentaria": "integer",
      "data_referencia_doc": "integer",
      "tipo_balancete": "string",
      "valor_anulacoes_no_mes": "number",
      "vl_anulacao_ate_mes_bde": "number",
      "valor_pago_no_mes": "number",
      "valor_pago_ate_mes": "number"
    }
  },
  {
    "id": "balancetes_despesas_orcamentarias",
    "path": "/balancetes_despesas_orcamentarias",
    "grupo": "BAL",
    "titulo": "Balancetes de Despesas Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_funcao": "Código da Função",
      "codigo_subfuncao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_subprojeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "codigo_elemento_despesa": "Código do Elemento de Despesa",
      "data_referencia_doc": "Data de Referência da Documentação",
      "tipo_balancete": "Tipo do Balancete",
      "valor_fixado_orcamento_bal_despesa": "Valor Fixado no Orçamento",
      "valor_suplementado_no_mes": "Valor Suplementado no Mês",
      "valor_suplementado_ate_mes": "Valor Suplementado até o Mês",
      "valor_anulacoes_no_mes": "Valor das Anulações de Dotação no Mês",
      "valor_empenhado_no_mes": "Valor Empenhado no Mês",
      "valor_empenhado_ate_mes": "Valor Empenhado até o Mês",
      "valor_saldo_dotacao": "Valor do Saldo da Dotação",
      "valor_pago_no_mes": "Valor Pago no Mês",
      "valor_pago_ate_mes": "Valor Pago até o Mês",
      "valor_empenhado_pagar": "Valor Empenhado a Pagar",
      "valor_anulacoes_dotacao_ate_mes": "Valor das Anulações de Dotação até o Mês",
      "valor_anulacoes_empenhos_no_mes": "Valor das Anulações de Empenhos no Mês",
      "valor_anulacoes_empenhos_ate_mes": "Valor das Anulações de Empenhos até o Mês",
      "valor_liquidado_no_mes": "Valor Liquidado no Mês",
      "valor_liquidado_ate_mes": "Valor Liquidado até o Mês",
      "valor_estornos_liquidacao_no_mes": "Valor dos Estornos de Liquidação no Mês",
      "valor_estornos_liquidacao_ate_mes": "Valor dos Estornos de Liquidação até o Mês",
      "valor_estornos_pagos_no_mes": "Valor dos Estornos de Pagamento no Mês",
      "valor_estornos_pagos_ate_mes": "Valor dos Estornos de Pagamento até o Mês",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_funcao": "string",
      "codigo_subfuncao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_subprojeto_atividade": "string",
      "codigo_elemento_despesa": "string",
      "data_referencia_doc": "integer",
      "tipo_balancete": "string",
      "valor_fixado_orcamento_bal_despesa": "number",
      "valor_suplementado_no_mes": "number",
      "valor_suplementado_ate_mes": "number",
      "valor_anulacoes_no_mes": "number",
      "valor_empenhado_no_mes": "number",
      "valor_empenhado_ate_mes": "number",
      "valor_saldo_dotacao": "number",
      "valor_pago_no_mes": "number",
      "valor_pago_ate_mes": "number",
      "valor_empenhado_pagar": "number",
      "valor_anulacoes_dotacao_ate_mes": "number",
      "valor_anulacoes_empenhos_no_mes": "number",
      "valor_anulacoes_empenhos_ate_mes": "number",
      "valor_liquidado_no_mes": "number",
      "valor_liquidado_ate_mes": "number",
      "valor_estornos_liquidacao_no_mes": "number",
      "valor_estornos_liquidacao_ate_mes": "number",
      "valor_estornos_pagos_no_mes": "number",
      "valor_estornos_pagos_ate_mes": "number",
      "tipo_fonte": "string",
      "codigo_fonte": "string"
    }
  },
  {
    "id": "balancetes_receitas_extra_orcamentarias",
    "path": "/balancetes_receitas_extra_orcamentarias",
    "grupo": "BAL",
    "titulo": "Balancetes de Receitas Extra-Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta_extraorcamentaria": "Código da Conta Extraorçamentária",
      "data_referencia_doc": "Data de Referência da Documentação",
      "tipo_balancete": "Tipo do Balancete",
      "valor_anulacoes_no_mes": "Valor das Anulações no Mês",
      "valor_anulacoes_ate_mes": "Valor das Anulações até o Mês",
      "valor_arrecadacao_no_mes": "Valor da Arrecadação no Mês",
      "valor_arrecadacao_ate_mes": "Valor da Arrecadação até Mês"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta_extraorcamentaria": "integer",
      "data_referencia_doc": "integer",
      "tipo_balancete": "string",
      "valor_anulacoes_no_mes": "number",
      "valor_anulacoes_ate_mes": "number",
      "valor_arrecadacao_no_mes": "number",
      "valor_arrecadacao_ate_mes": "number"
    }
  },
  {
    "id": "balancetes_receitas_orcamentarias",
    "path": "/balancetes_receitas_orcamentarias",
    "grupo": "BAL",
    "titulo": "Balancetes de Receitas Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_rubrica": "Código Receita Orçamentária",
      "data_referencia_doc": "Data de Referência da Documentação",
      "tipo_balancete": "Tipo do Balancete",
      "valor_previsto_orcamento": "Valor Previsto no Orçamento",
      "valor_anulacoes_no_mes": "Valor das Anulações no mês",
      "valor_arrecadacao_no_mes": "Valor da Arrecadação no mês",
      "valor_arrecadacao_ate_mes": "Valor da Arrecadação até o mês",
      "valor_anulacoes_ate_mes": "Valor das Anulações até mês",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_rubrica": "string",
      "data_referencia_doc": "integer",
      "tipo_balancete": "string",
      "valor_previsto_orcamento": "number",
      "valor_anulacoes_no_mes": "number",
      "valor_arrecadacao_no_mes": "number",
      "valor_arrecadacao_ate_mes": "number",
      "valor_anulacoes_ate_mes": "number",
      "tipo_fonte": "string",
      "codigo_fonte": "string"
    }
  },
  {
    "id": "balencetes_contabeis_contas_bancarias",
    "path": "/balencetes_contabeis_contas_bancarias",
    "grupo": "BAL",
    "titulo": "Balancetes Contábeis de Contas Bancárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_unidade_gestora",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Código da Unidade Gestora"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_unidade_gestora": "Código da Unidade Gestora",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta_contabil": "Código da Conta Contábil",
      "numero_banco": "Número do Banco",
      "numero_agencia": "Número da Agência",
      "numero_conta_corrente": "Número da Conta Bancária",
      "codigo_grupo_fonte": "Código do Grupo da Fonte",
      "codigo_especificacao_fonte": "Código da Especificação da Fonte",
      "codigo_complemento_fonte": "Código do Complemento da Fonte",
      "data_referencia_doc": "Data de Referência da Documentação",
      "codigo_saldo_no_mes": "Natureza do Saldo Inicial do Mês",
      "valor_saldo_no_mes": "Valor do Saldo Inicial do Mês",
      "valor_tot_debitos_no_mes": "Valor Total dos Débitos Realizados no Mês",
      "valor_tot_creditos_no_mes": "Valor Total dos Créditos Realizados no Mês",
      "codigo_saldo_ate_mes": "Natureza do Saldo Final até o Mês",
      "valor_saldo_ate_mes": "Valor do Saldo Final até o Mês"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_unidade_gestora": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta_contabil": "string",
      "numero_banco": "string",
      "numero_agencia": "string",
      "numero_conta_corrente": "string",
      "codigo_grupo_fonte": "string",
      "codigo_especificacao_fonte": "string",
      "codigo_complemento_fonte": "string",
      "data_referencia_doc": "integer",
      "codigo_saldo_no_mes": "string",
      "valor_saldo_no_mes": "number",
      "valor_tot_debitos_no_mes": "number",
      "valor_tot_creditos_no_mes": "number",
      "codigo_saldo_ate_mes": "string",
      "valor_saldo_ate_mes": "number"
    }
  },
  {
    "id": "anulacoes_taloes_receitas_extras_orcamentarias",
    "path": "/anulacoes_taloes_receitas_extras_orcamentarias",
    "grupo": "DCR",
    "titulo": "Anulações de Talões de Receitas Extra-Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação da Anulação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta": "Código da Conta Extra-orçamentária",
      "numero_talao_receita": "Número do Talão de Receita Extra-orçamentária Anulado",
      "data_talao_receita": "Data do Talão de Receita Extra-orçamentária Anulado",
      "data_anulacao": "Data da Anulação do Talão de Receita Extra-orçamentária",
      "data_referencia_doc": "Data de Referência da Documentação da Anulação",
      "modalidade_anulacao": "Modalidade da Anulação de Talão de Receita Extra-orçamentária",
      "valor_anulacao": "Valor da Anulação",
      "historico_anulacao": "Histórico da Anulação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta": "integer",
      "numero_talao_receita": "string",
      "data_talao_receita": "string",
      "data_anulacao": "string",
      "data_referencia_doc": "integer",
      "modalidade_anulacao": "string",
      "valor_anulacao": "number",
      "historico_anulacao": "string"
    }
  },
  {
    "id": "anulacoes_taloes_receitas_orcamentarias",
    "path": "/anulacoes_taloes_receitas_orcamentarias",
    "grupo": "DCR",
    "titulo": "Anulações de Talões de Receitas Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação da Anulação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_rubrica": "Código da Receita Orçamentária",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "numero_talao_receita": "Número do Talão de Receita Anulado",
      "data_talao_receita": "Data do Talão de Receita Anulado",
      "data_anulacao": "Data da Anulação do Talão de Receita",
      "data_referencia_doc": "Data de Referência da Documentação da Anulação",
      "modalidade_anulacao": "Modalidade da Anulação de Talão de Receita",
      "valor_anulacao": "Valor da Anulação",
      "historico_analucao": "Histórico da Anulação",
      "codigo_complemento_fonte": "Código do Complemento da Fonte"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_rubrica": "string",
      "tipo_fonte": "string",
      "codigo_fonte": "string",
      "numero_talao_receita": "string",
      "data_talao_receita": "string",
      "data_anulacao": "string",
      "data_referencia_doc": "integer",
      "modalidade_anulacao": "string",
      "valor_anulacao": "number",
      "historico_analucao": "string",
      "codigo_complemento_fonte": "string"
    }
  },
  {
    "id": "taloes_receitas_extras_orcamentarias",
    "path": "/taloes_receitas_extras_orcamentarias",
    "grupo": "DCR",
    "titulo": "Talões de Receitas Extra-Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta_extra": "Código da Conta Extra-orçamentária",
      "numero_talao_receita_extra": "Número do Talão de Receita Extra-orçamentária",
      "data_talao_receita_extra": "Data do Talão de Receita Extra-orçamentária",
      "data_referencia_doc": "Data de Referência da Documentação",
      "valor_receita_extra": "Valor da Receita Extra-orçamentária",
      "historico_receita_extra": "Histórico da Receita Extra-orçamentária",
      "tipo_documento_contribuinte": "Tipo de Documento de Identificação do Contribuinte",
      "dados_documento_contribuinte": "Dados do Documento de Identificação do Contribuinte",
      "nome_razao_contribuinte": "Nome ou Razão Social do Contribuinte",
      "numero_banco": "Número do Banco ou Agente Recebedor",
      "numero_agencia": "Número da Agência Bancária",
      "numero_conta_corrente": "Número da Conta-corrente",
      "numero_documento_credito": "Número do Documento de Crédito (Bancário ou de Caixa)",
      "data_credito": "Data do Crédito",
      "tipo_documento_credito": "Tipo do Documento de Crédito"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta_extra": "integer",
      "numero_talao_receita_extra": "string",
      "data_talao_receita_extra": "string",
      "data_referencia_doc": "integer",
      "valor_receita_extra": "number",
      "historico_receita_extra": "string",
      "tipo_documento_contribuinte": "string",
      "dados_documento_contribuinte": "string",
      "nome_razao_contribuinte": "string",
      "numero_banco": "string",
      "numero_agencia": "string",
      "numero_conta_corrente": "string",
      "numero_documento_credito": "string",
      "data_credito": "string",
      "tipo_documento_credito": "integer"
    }
  },
  {
    "id": "taloes_receitas_orcamentarias",
    "path": "/taloes_receitas_orcamentarias",
    "grupo": "DCR",
    "titulo": "Talões de Receitas Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_rubrica": "Código da Receita Orçamentária",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "numero_talao_receita": "Número do Talão de Receita",
      "data_talao_receita": "Data do Talão de Receita",
      "data_referencia_doc": "Data de Referência da Documentação",
      "valor_receita": "Valor da Receita",
      "historico_receita": "Histórico da Receita Orçamentária",
      "tipo_doc_contribuinte": "Tipo de Documento de Identificação do Contribuinte",
      "numero_doc_contribuinte": "Dados do Documento de Identificação do Contribuinte",
      "nome_razao_contribuinte": "Nome ou Razão Social do Contribuinte",
      "numero_banco": "Número do Banco ou Agente Recebedor",
      "numero_agencia_bancaria": "Número da Agência Bancária",
      "numero_conta_corrente": "Número da Conta Corrente",
      "numero_doc_credito": "Número do Documento de Crédito (Bancário ou de Caixa)",
      "data_credito": "Data do Crédito",
      "tipo_documento_credito": "Tipo do Documento de Crédito",
      "codigo_complemento_fonte": "Código do Complemento da Fonte",
      "status_talao": "Status do Talão"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_rubrica": "string",
      "tipo_fonte": "string",
      "codigo_fonte": "string",
      "numero_talao_receita": "string",
      "data_talao_receita": "string",
      "data_referencia_doc": "integer",
      "valor_receita": "number",
      "historico_receita": "string",
      "tipo_doc_contribuinte": "string",
      "numero_doc_contribuinte": "string",
      "nome_razao_contribuinte": "string",
      "numero_banco": "string",
      "numero_agencia_bancaria": "string",
      "numero_conta_corrente": "string",
      "numero_doc_credito": "string",
      "data_credito": "string",
      "tipo_documento_credito": "integer",
      "codigo_complemento_fonte": "string",
      "status_talao": "string"
    }
  },
  {
    "id": "cheques_notas_pagamentos",
    "path": "/cheques_notas_pagamentos",
    "grupo": "DCD",
    "titulo": "Cheques de Notas de Pagamentos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_nota_empenho": "Número da Nota de Empenho",
      "numero_nota_pagamento": "Número da Nota de Pagamento",
      "numero_banco": "Número do Banco",
      "numero_agencia": "Número da Agência Bancária",
      "numero_conta": "Número da Conta-corrente",
      "numero_cheque": "Número do Cheque ou Documento Bancário que identifique o saque",
      "data_referencia_doc": "Data de Referência da Documentação",
      "data_emissao_cheque": "Data da Emissão do Cheque",
      "valor_cheque": "Valor do Cheque",
      "tipo_documento_bancario": "Tipo Cheque ou outro Documento Bancário"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_nota_empenho": "string",
      "numero_nota_pagamento": "string",
      "numero_banco": "string",
      "numero_agencia": "string",
      "numero_conta": "string",
      "numero_cheque": "string",
      "data_referencia_doc": "integer",
      "data_emissao_cheque": "string",
      "valor_cheque": "number",
      "tipo_documento_bancario": "integer"
    }
  },
  {
    "id": "deducoes_notas_pagamentos",
    "path": "/deducoes_notas_pagamentos",
    "grupo": "DCD",
    "titulo": "Deduções de Notas de Pagamentos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_nota_empenho": "Número da Nota de Empenho",
      "numero_sub_empenho": "Número do Sub-empenho",
      "numero_nota_pagamento": "Número da Nota de Pagamento",
      "codigo_conta_extra_orc": "Código da Conta Extra- orçamentária",
      "data_referencia_doc": "Data de Referência da Documentação",
      "valor_deducao": "Valor da Dedução da Nota de Pagamento",
      "tipo_classificacao": "Classificação da Dedução"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_nota_empenho": "string",
      "numero_sub_empenho": "string",
      "numero_nota_pagamento": "string",
      "codigo_conta_extra_orc": "integer",
      "data_referencia_doc": "integer",
      "valor_deducao": "number",
      "tipo_classificacao": "string"
    }
  },
  {
    "id": "despesas_extra_orcamentarias",
    "path": "/despesas_extra_orcamentarias",
    "grupo": "DCD",
    "titulo": "Despesas Extra-Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta_extraorcamentaria": "Código da Conta Extra- orçamentária",
      "numero_banco": "Número do Banco",
      "numero_agencia": "Número da Agência Bancária",
      "numero_conta": "Número da Agência Bancária",
      "numero_documento_despesa_extra": "Número do Cheque, Documento Bancário ou Controle de Caixa que identifique o saque",
      "data_referencia_doc": "Data de Referência da Documentação",
      "numero_documento_caixa": "Número do Documento de Caixa",
      "data_emissao_despesa_extra": "Número do Documento de Caixa",
      "valor_documento_despesa_extra": "Valor da Despesa Total (Cheque, Doc. Bancário ou Caixa)",
      "valor_deducao_despesa_extra": "Valor das Deduções",
      "tipo_documento_despesa_extra": "Tipo: Cheque, Documento Bancário ou Caixa",
      "status_estorno_despesa_extra": "Status Estornado",
      "nome_credor_despesa_extra": "Nome ou Razão Social do Credor"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta_extraorcamentaria": "integer",
      "numero_banco": "string",
      "numero_agencia": "string",
      "numero_conta": "string",
      "numero_documento_despesa_extra": "string",
      "data_referencia_doc": "integer",
      "numero_documento_caixa": "string",
      "data_emissao_despesa_extra": "string",
      "valor_documento_despesa_extra": "number",
      "valor_deducao_despesa_extra": "number",
      "tipo_documento_despesa_extra": "integer",
      "status_estorno_despesa_extra": "integer",
      "nome_credor_despesa_extra": "string"
    }
  },
  {
    "id": "estornos_despesas_extra_orcamentarias",
    "path": "/estornos_despesas_extra_orcamentarias",
    "grupo": "DCD",
    "titulo": "Estornos de Despesas Extra-Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_conta_extraorcamentaria": "Código da Conta Extra- orçamentária",
      "numero_banco": "Número do Banco",
      "numero_agencia": "Número da Agência Bancária",
      "numero_conta": "Número da Conta-corrente",
      "numero_documento_bancario": "Número do Cheque, Documento Bancário ou Controle de Caixa que identifique o saque",
      "data_estorno": "Data do Estorno da Despesa Extra-Orçamentária",
      "data_referencia_doc": "Data de Referência da Documentação",
      "nome_assessor": "Nome do Responsável pelo Estorno",
      "descricao_justificativa": "Justificativa para o Estorno da Despesa Extra-Orçamentária"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_conta_extraorcamentaria": "integer",
      "numero_banco": "string",
      "numero_agencia": "string",
      "numero_conta": "string",
      "numero_documento_bancario": "string",
      "data_estorno": "string",
      "data_referencia_doc": "integer",
      "nome_assessor": "string",
      "descricao_justificativa": "string"
    }
  },
  {
    "id": "estornos_liquidacao",
    "path": "/estornos_liquidacao",
    "grupo": "DCD",
    "titulo": "Estornos de Liquidação",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_nota_empenho": "Número da Nota de Empenho",
      "data_liquidacao": "Data da Liquidação da Despesa",
      "data_estorno_liquidacao": "Data do Estorno da Liquidação",
      "data_referencia_doc": "Data de Referência da Documentação",
      "nome_assessor": "Nome do Assessor de Contabilidade Responsável pelo Estorno de Liquidação",
      "descricao_justificativa": "Justificativa para o Estorno da Liquidação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_nota_empenho": "string",
      "data_liquidacao": "string",
      "data_estorno_liquidacao": "string",
      "data_referencia_doc": "integer",
      "nome_assessor": "string",
      "descricao_justificativa": "string"
    }
  },
  {
    "id": "estornos_pagamentos",
    "path": "/estornos_pagamentos",
    "grupo": "DCD",
    "titulo": "Estornos de Pagamentos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_nota_empenho": "Número da Nota de Empenho",
      "numero_sub_empenho_nota_pagamento": "Número do Sub-empenho",
      "numero_nota_pagamento": "Número da Nota de Pagamento ESTORNADA",
      "data_estorno_pagamento": "Data do ESTORNO de Pagamento",
      "data_referencia_doc": "Data de Referência da Documentação",
      "nome_assessor": "Nome do Assessor de Contabilidade Responsável pelo Estorno de Pagamento",
      "descricao_justificativa": "Justificativa para o Estorno da Nota de Pagamento"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_nota_empenho": "string",
      "numero_sub_empenho_nota_pagamento": "string",
      "numero_nota_pagamento": "string",
      "data_estorno_pagamento": "string",
      "data_referencia_doc": "integer",
      "nome_assessor": "string",
      "descricao_justificativa": "string"
    }
  },
  {
    "id": "estornos_transferencias_financeiras",
    "path": "/estornos_transferencias_financeiras",
    "grupo": "DCD",
    "titulo": "Estornos de Transferências Financeiras",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_transferencia",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data do Estorno ou Transferência Financeira"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data do Estorno ou Transferência Financeira"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data do Estorno ou Transferência Financeira"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_transferencia": "Data do Estorno ou Transferência Financeira",
      "numero_sequencial_transf": "Número Sequencial do Estorno ou Transferência Financeira no mesmo Dia",
      "tipo_transferencia": "Tipo de Registro Financeiro",
      "numero_banco_origem": "Número do Banco Original ou Número Identificador do Caixa no Município (de onde foi transferido ou estornado)",
      "numero_agencia_origem": "Número da Agência Bancária Original ou Caixa (de onde foi transferido ou estornado)",
      "numero_conta_origem": "Número da Conta Bancária Original ou Caixa (de onde foi transferido ou estornado)",
      "numero_documento_bancario": "Número do Documento Bancário Original ou de Identificação do lançamento no Caixa (de onde foi transferido ou estornado)",
      "numero_banco_destino": "Número do Banco de Destino ou Número Identificador do Caixa no Município (para onde foi transferido)",
      "numero_agencia_destino": "Número da Agência Bancária de Destino ou Caixa (para onde foi transferido)",
      "numero_conta_destino": "Número da Agência Bancária de Destino ou Caixa (para onde foi transferido)",
      "valor_estorno_transf": "Valor da Operação (Estorno ou Transferência)",
      "descricao_motivo": "Descrição de Motivo para o Estorno ou Transferência Financeira",
      "tipo_documento_bancario": "Tipo do Documento Bancário Original ou de Identificação do lançamento no Caixa (de onde foi transferido ou estornado)",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_transferencia": "string",
      "numero_sequencial_transf": "integer",
      "tipo_transferencia": "string",
      "numero_banco_origem": "string",
      "numero_agencia_origem": "string",
      "numero_conta_origem": "string",
      "numero_documento_bancario": "string",
      "numero_banco_destino": "string",
      "numero_agencia_destino": "string",
      "numero_conta_destino": "string",
      "valor_estorno_transf": "number",
      "descricao_motivo": "string",
      "tipo_documento_bancario": "integer",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "itens_notas_fiscais",
    "path": "/itens_notas_fiscais",
    "grupo": "DCD",
    "titulo": "Itens de Notas Fiscais",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao": "Data da Emissão da Nota de Empenho",
      "numero_nota_empenho": "Número da Nota de Empenho",
      "data_liquidacao": "Data da Liquidação da Despesa",
      "tipo_nota_fiscal": "Tipo da Nota Fiscal",
      "numero_nota_fiscal": "Número da Nota Fiscal",
      "numero_item_sequencial": "Número Sequencial do Item da Nota Fiscal",
      "descricao_item": "Descrição do Item",
      "unidade_compra": "Unidade de Compra",
      "numero_quantidade_comprada": "Quantidade Comprada",
      "valor_unitario_item": "Valor Unitário do Item",
      "valor_total_item": "Valor Total do Item",
      "codigo_ncm": "Código NCM (Nomenclatura Comum do Mercosul)"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao": "string",
      "numero_nota_empenho": "string",
      "data_liquidacao": "string",
      "tipo_nota_fiscal": "string",
      "numero_nota_fiscal": "string",
      "numero_item_sequencial": "string",
      "descricao_item": "string",
      "unidade_compra": "string",
      "numero_quantidade_comprada": "number",
      "valor_unitario_item": "number",
      "valor_total_item": "number",
      "codigo_ncm": "string"
    }
  },
  {
    "id": "liquidacoes",
    "path": "/liquidacoes",
    "grupo": "DCD",
    "titulo": "Liquidações",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_empenho": "Número da Nota de Empenho",
      "data_liquidacao": "Data da Liquidação da Despesa",
      "data_referencia_doc": "Data de Referência da Documentação",
      "nome_responsavel_liquidacao": "Nome do Responsável pela Liquidação da Despesa",
      "numero_sub_empenho_liquidacao": "Número do Sub-empenho",
      "valor_liquidado": "Valor da Liquidação",
      "status_estornado": "Status de Estornado",
      "status_folha": "Status Liquidação de Folha",
      "cpf_responsavel_liquidacao": "Número do CPF do Responsável pela Liquidação da Despesa"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_empenho": "string",
      "data_liquidacao": "string",
      "data_referencia_doc": "integer",
      "nome_responsavel_liquidacao": "string",
      "numero_sub_empenho_liquidacao": "string",
      "valor_liquidado": "number",
      "status_estornado": "boolean",
      "status_folha": "integer",
      "cpf_responsavel_liquidacao": "string"
    }
  },
  {
    "id": "notas_anulacoes_empenhos",
    "path": "/notas_anulacoes_empenhos",
    "grupo": "DCD",
    "titulo": "Notas de Anulações de Empenhos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação da Anulação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho Anulada",
      "numero_nota_empenho": "Número da Nota de Empenho Anulada",
      "numero_nota_anulacao": "Número da Nota de Anulação de Empenho",
      "data_referencia_doc": "Data de Referência da Documentação da Anulação",
      "data_anulacao": "Data da Anulação da Nota de Empenho",
      "modalidade_anulacao": "Modalidade da Anulação",
      "descricao_anulacao": "Histórico da Anulação da Nota de Empenho",
      "valor_anterior_saldo_dotacao": "Valor Anterior do Saldo da Dotação",
      "valor_anulacao": "Valor Anulado",
      "valor_atual_saldo_dotacao": "Valor Atual do Saldo da Dotação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_nota_empenho": "string",
      "numero_nota_anulacao": "string",
      "data_referencia_doc": "integer",
      "data_anulacao": "string",
      "modalidade_anulacao": "string",
      "descricao_anulacao": "string",
      "valor_anterior_saldo_dotacao": "number",
      "valor_anulacao": "number",
      "valor_atual_saldo_dotacao": "number"
    }
  },
  {
    "id": "notas_empenhos",
    "path": "/notas_empenhos",
    "grupo": "DCD",
    "titulo": "Notas de Empenhos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_empenho": "Número da Nota de Empenho",
      "data_referencia_doc": "Data de Referência da Documentação",
      "codigo_funcao": "Código da Função",
      "codigo_subfuncao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_subprojeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "codigo_elemento_despesa": "Código do Elemento de Despesa",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "modalidade_nota_empenho": "Modalidade da Nota de Empenho",
      "descricao_historico_empenho": "Histórico da Nota de Empenho",
      "valor_anterior_saldo_dotacao": "Valor Anterior do Saldo da Dotação",
      "valor_empenhado": "Valor Empenhado",
      "valor_atual_saldo_dotacao": "Valor Atual do Saldo da Dotação",
      "tipo_processo_licitatorio": "Espécie do Processo Administrativo para Contratação",
      "numero_documento_negociante": "Dados do Documento de Identificação do Credor",
      "estado_empenho": "Status do Empenho",
      "numero_nota_anulacao": "Número da Nota de Anulação do Empenho",
      "data_emissao_empenho_susbtituto": "Data da Emissão do Empenho Substituto",
      "numero_empenho_substituto": "Número do Empenho Substituto",
      "codigo_tipo_negociante": "Tipo de Documento de Identificação do Credor",
      "nome_negociante": "Nome ou Razão Social do Credor",
      "endereco_negociante": "Endereço Completo do Credor",
      "fone_negociante": "Número do Telefone do Credor",
      "cep_negociante": "Número do CEP do Credor",
      "municipio_negociante": "Nome do Município do Credor",
      "codigo_uf": "Unidade da Federação do Endereço do Credor",
      "cpf_ordenador": "CPF do Ordenador da Despesa",
      "cd_transferencia_tf": "Código de Identificação da Transferência ao Município",
      "cd_complem_fonte": "Código do Complemento da Fonte",
      "cd_subelem_desp": "Código do Subelemento de Despesa",
      "cpf_gestor": "",
      "data_contrato": "",
      "numero_contrato": "",
      "data_realizacao_autuacao_licitacao": "",
      "numero_licitacao": ""
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_empenho": "string",
      "data_referencia_doc": "integer",
      "codigo_funcao": "string",
      "codigo_subfuncao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_subprojeto_atividade": "string",
      "codigo_elemento_despesa": "string",
      "tipo_fonte": "string",
      "codigo_fonte": "string",
      "modalidade_nota_empenho": "string",
      "descricao_historico_empenho": "string",
      "valor_anterior_saldo_dotacao": "number",
      "valor_empenhado": "number",
      "valor_atual_saldo_dotacao": "number",
      "tipo_processo_licitatorio": "string",
      "numero_documento_negociante": "string",
      "estado_empenho": "string",
      "numero_nota_anulacao": "string",
      "data_emissao_empenho_susbtituto": "string",
      "numero_empenho_substituto": "string",
      "codigo_tipo_negociante": "string",
      "nome_negociante": "string",
      "endereco_negociante": "string",
      "fone_negociante": "string",
      "cep_negociante": "string",
      "municipio_negociante": "string",
      "codigo_uf": "string",
      "cpf_ordenador": "string",
      "cd_transferencia_tf": "string",
      "cd_complem_fonte": "string",
      "cd_subelem_desp": "string",
      "cpf_gestor": "string",
      "data_contrato": "string",
      "numero_contrato": "string",
      "data_realizacao_autuacao_licitacao": "string",
      "numero_licitacao": "string"
    }
  },
  {
    "id": "notas_fiscais",
    "path": "/notas_fiscais",
    "grupo": "DCD",
    "titulo": "Notas Fiscais",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_empenho": "Número da Nota de Empenho",
      "data_liquidacao": "Data da Liquidação da Despesa",
      "tipo_nota_fiscal": "Tipo de Nota Fiscal",
      "numero_nota_fiscal": "Número da Nota Fiscal",
      "data_referencia_doc": "Data de Referência da Documentação",
      "numero_serie_selo_transito": "Série do Selo de Trânsito",
      "numero_selo_transito": "Número do Selo de Trânsito",
      "numero_serie": "Número de Série do Selo de Autenticidade",
      "numero_formulario": "Números de Formulários",
      "data_limite": "Data Limite para Expedição da Nota Fiscal",
      "cgf_emitente": "Número do CGF do Emitente",
      "data_emissao": "Data da Emissão da Nota Fiscal",
      "valor_liquido": "Valor da Nota Fiscal (Líquido)",
      "valor_desconto": "Valor Total do Desconto Aplicado",
      "valor_bruto": "Valor Bruto da Nota Fiscal",
      "valor_aliquota_iss": "Alíquota do ISS (Imposto Sobre Serviço)",
      "valor_base_calculo_iss": "Base de cálculo do ISS",
      "tipo_emissao": "Tipo de Emissão da Nota Fiscal",
      "numero_protocolo_autenticacao": "Número do Protocolo de Autorização da Nota Fiscal Eletrônica (Para NFE padrão nacional)",
      "numero_chave_acesso_nfe": "Chave de Acesso da Nota Fiscal Eletrônica (Para NFE padrão nacional)",
      "cpf_cnpj_emitente": "Número do CNPJ ou CPF do Emitente",
      "codigo_verifica_nfe_fpn": "Código ou Chave de Verificação de NFE fora do padrão nacional"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_empenho": "string",
      "data_liquidacao": "string",
      "tipo_nota_fiscal": "string",
      "numero_nota_fiscal": "string",
      "data_referencia_doc": "integer",
      "numero_serie_selo_transito": "string",
      "numero_selo_transito": "string",
      "numero_serie": "string",
      "numero_formulario": "string",
      "data_limite": "string",
      "cgf_emitente": "string",
      "data_emissao": "string",
      "valor_liquido": "number",
      "valor_desconto": "number",
      "valor_bruto": "number",
      "valor_aliquota_iss": "number",
      "valor_base_calculo_iss": "number",
      "tipo_emissao": "integer",
      "numero_protocolo_autenticacao": "integer",
      "numero_chave_acesso_nfe": "string",
      "cpf_cnpj_emitente": "string",
      "codigo_verifica_nfe_fpn": "string"
    }
  },
  {
    "id": "notas_pagamentos",
    "path": "/notas_pagamentos",
    "grupo": "DCD",
    "titulo": "Notas de Pagamentos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_empenho": "Número da Nota de Empenho",
      "numero_sub_empenho": "Número do Sub-empenho",
      "numero_nota_pagamento": "Número da Nota de Pagamento",
      "data_referencia_doc": "Data de Referência da Documentação",
      "numero_documento_caixa": "Número do Documento de Caixa",
      "data_nota_pagamento": "Data da Nota de Pagamento",
      "valor_nota_pagamento": "Valor da Nota de Pagamento",
      "valor_empenhado_a_pagar": "Valor Empenhado a Pagar",
      "estado_de_estornado": "Status Estornado",
      "nome_responsavel_pagamento": "Nome do Responsável pelo Pagamento",
      "cpf_responsavel_pagamento": "Número do CPF do Responsável pelo Pagamento"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_empenho": "string",
      "numero_sub_empenho": "string",
      "numero_nota_pagamento": "string",
      "data_referencia_doc": "integer",
      "numero_documento_caixa": "string",
      "data_nota_pagamento": "string",
      "valor_nota_pagamento": "number",
      "valor_empenhado_a_pagar": "number",
      "estado_de_estornado": "integer",
      "nome_responsavel_pagamento": "string",
      "cpf_responsavel_pagamento": "string"
    }
  },
  {
    "id": "notas_pagamentos_folhas",
    "path": "/notas_pagamentos_folhas",
    "grupo": "DCD",
    "titulo": "Notas de Pagamentos de Folhas",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_nota_empenho": "Número da Nota de Empenho",
      "numero_sub_empenho": "Número do Sub-empenho",
      "numero_nota_pagamento": "Número da Nota de Pagamento",
      "data_competencia_folha": "Data de Competência da Folha",
      "tipo_folha": "Tipo da Folha",
      "data_emissao_folha": "Data de Emissão da Folha",
      "data_referencia_doc": "Data de Referência da Documentação",
      "valor_pagamento_folha": "Valor do Pagamento da Folha"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_nota_empenho": "string",
      "numero_sub_empenho": "string",
      "numero_nota_pagamento": "string",
      "data_competencia_folha": "integer",
      "tipo_folha": "string",
      "data_emissao_folha": "string",
      "data_referencia_doc": "integer",
      "valor_pagamento_folha": "number"
    }
  },
  {
    "id": "pagamentos_liquidacoes",
    "path": "/pagamentos_liquidacoes",
    "grupo": "DCD",
    "titulo": "Pagamentos de Liquidações",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_nota_empenho": "Número da Nota de Empenho",
      "numero_sub_empenho": "Número do Sub-empenho",
      "numero_nota_pagamento": "Número da Nota de Pagamento",
      "data_liquidacao": "Data da Liquidação da Despesa",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_nota_empenho": "string",
      "numero_sub_empenho": "string",
      "numero_nota_pagamento": "string",
      "data_liquidacao": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "contratados",
    "path": "/contratados",
    "grupo": "LCO",
    "titulo": "Contratados",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data inicio da data que o Contrato foi firmado"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data fim da data que o Contrato foi firmado"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_contrato": "Data que o Contrato foi firmado",
      "numero_contrato": "Número do Contrato",
      "numero_documento_negociante": "Número do Documento de Identificação do Contratado",
      "codigo_tipo_negociante": "Tipo de Documento de Identificação do Contratado",
      "nome_negociante": "Nome ou Razão Social do Contratado",
      "endereco_negociante": "Endereço Completo do Contratado",
      "fone_negociante": "Número do Telefone do Contratado",
      "cep_negociante": "Número do CEP do Contratado",
      "nome_municipio_negociante": "Nome do Município do Contratado",
      "codigo_uf": "Unidade da Federação do Endereço do Contratado",
      "data_referencia_doc": "Data de Referência da Documentação",
      "cpf_gestor": "Número do CPF do Gestor Responsável por Firmar o Contrato"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_contrato": "string",
      "numero_contrato": "string",
      "numero_documento_negociante": "string",
      "codigo_tipo_negociante": "string",
      "nome_negociante": "string",
      "endereco_negociante": "string",
      "fone_negociante": "string",
      "cep_negociante": "string",
      "nome_municipio_negociante": "string",
      "codigo_uf": "string",
      "data_referencia_doc": "integer",
      "cpf_gestor": "string"
    }
  },
  {
    "id": "contratos",
    "path": "/contratos",
    "grupo": "LCO",
    "titulo": "Contratos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data de Celebração do Contrato"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data de Celebração do Contrato"
      },
      {
        "nome": "cpf_gestor_original",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Número do CPF do Gestor Responsável pela celebração do Contrato Original"
      },
      {
        "nome": "cpf_fiscal_contrato",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Número do CPF do Fiscal do Contrato"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "cpf_gestor": "Número do CPF do Gestor Responsável pela Celebração do Contrato",
      "data_contrato": "Data de Celebração do Contrato",
      "numero_contrato": "Número do Contrato",
      "tipo_contrato": "Tipo de Objeto contratado",
      "modalide_contrato": "Modalidade do Contrato",
      "numero_contrato_original": "Número do Contrato Original",
      "data_contrato_original": "Data que o Contrato Original foi celebrado",
      "data_inicio_vigencia_contrato": "Data de Início da Vigência do Contrato",
      "data_fim_vigencia_contrato": "Data Prevista para o Fim da Vigência do Contrato",
      "descricao_objeto_contrato": "Descrição do Objeto do Contrato",
      "valor_total_contrato": "Valor Total do Contrato",
      "data_referencia_doc": "Data de Referência da Documentação",
      "data_autuacao_processo_adm": "Data de Autuação do Processo Administrativo para Contratação",
      "numero_processo_adm": "Número do Processo Administrativo para Contratação",
      "nome_fiscal_contrato": "Nome do Fiscal do Contrato",
      "numero_id_contrato_pncp": "Número do Id Contrato PNCP",
      "cpf_gestor_original": "Número do CPF do Gestor Responsável pela celebração do Contrato Original",
      "cpf_fiscal_contrato": "Número do CPF do Fiscal do Contrato"
    },
    "tipos": {
      "codigo_municipio": "string",
      "cpf_gestor": "string",
      "data_contrato": "string",
      "numero_contrato": "string",
      "tipo_contrato": "string",
      "modalide_contrato": "string",
      "numero_contrato_original": "string",
      "data_contrato_original": "string",
      "data_inicio_vigencia_contrato": "string",
      "data_fim_vigencia_contrato": "string",
      "descricao_objeto_contrato": "string",
      "valor_total_contrato": "number",
      "data_referencia_doc": "integer",
      "data_autuacao_processo_adm": "string",
      "numero_processo_adm": "string",
      "nome_fiscal_contrato": "string",
      "numero_id_contrato_pncp": "string",
      "cpf_gestor_original": "string",
      "cpf_fiscal_contrato": "string"
    }
  },
  {
    "id": "dotacoes_utilizadas_contratacoes",
    "path": "/dotacoes_utilizadas_contratacoes",
    "grupo": "LCO",
    "titulo": "Dotações Utilizadas em Contratações",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data de Autuação do Processo Administrativo para Contratação"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data de Autuação do Processo Administrativo para Contratação"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_realizacao_licitacao": "Data de Autuação do Processo Administrativo para Contratação",
      "numero_licitacao": "Número do Processo Administrativo para Contratação",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_funcao": "Código da Função",
      "codigo_subfuncao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_subprojeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "codigo_elemento_despesa": "Código do Elemento de Despesa",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "valor_dotacao_doc": "Valor Utilizado na Contratação",
      "data_referencia_doc": "Data de Referência da Documentação",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_realizacao_licitacao": "string",
      "numero_licitacao": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_funcao": "string",
      "codigo_subfuncao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_subprojeto_atividade": "string",
      "codigo_elemento_despesa": "string",
      "tipo_fonte": "string",
      "codigo_fonte": "string",
      "valor_dotacao_doc": "number",
      "data_referencia_doc": "integer",
      "codigo_unidade_orcamentaria": "string"
    }
  },
  {
    "id": "identificacao_responsaveis_contratacao",
    "path": "/identificacao_responsaveis_contratacao",
    "grupo": "LCO",
    "titulo": "Identificação de Responsáveis pela Contratação",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "cpf_gestor": "Número do CPF do Gestor da Unidade Gestora a qual pertence o Responsável pela Contratação",
      "data_criacao_comissao": "Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação",
      "numero_comissao_licitacao": "Número Sequencial de comissão/equipe/agente Responsável pela Contratação para a Unidade Gestora a que pertence",
      "cpf_membro": "Número do CPF do Responsável pela Contratação",
      "tipo_membro": "Função do Responsável pela Contratação",
      "data_admissao_membro": "Data de Nomeação do Responsável pela Contratação",
      "data_saida_membro": "Data de Exoneração do Responsável pela Contratação",
      "nome_membro": "Nome do Responsável pela Contratação",
      "endereco_membro": "Endereço Completo do Responsável pela Contratação",
      "fone_membro": "Número do Telefone do Responsável pela Contratação",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "cpf_gestor": "string",
      "data_criacao_comissao": "string",
      "numero_comissao_licitacao": "string",
      "cpf_membro": "string",
      "tipo_membro": "string",
      "data_admissao_membro": "string",
      "data_saida_membro": "string",
      "nome_membro": "string",
      "endereco_membro": "string",
      "fone_membro": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "itens_compoem_bens_servicos",
    "path": "/itens_compoem_bens_servicos",
    "grupo": "LCO",
    "titulo": "Itens que Compõem Bens e Serviços",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data de Autuação do Processo Administrativo para Contratação"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data de Autuação do Processo Administrativo para Contratação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_realizacao_licitacao": "Data de Autuação do Processo Administrativo para Contratação",
      "numero_licitacao": "Número do Processo Administrativo para Contratação",
      "numero_sequencial_item_licitacao": "Número Sequencial do Item que Compõe o Bem ou Serviço",
      "numero_documento_negociante": "Número do Documento de Identificação do Licitante Vencedor ou Fornecedo",
      "descricao_item_licitacao": "Descrição do Item que Compõe o Bem ou Serviço",
      "valor_vencedor_item_licitacao": "Valor Proposto para o Item pelo Licitante VENCEDOR ou Fornecedor",
      "codigo_tipo_negociante": "Tipo de Documento de Identificação do Licitante Vencedor ou Fornecedor",
      "descricao_unidade_item_licitacao": "Unidade do Item que Compõe o Bem ou Serviço",
      "numero_quantidade_item_licitacao": "Quantidade do Item que Compõe o Bem ou Serviço",
      "valor_unitario_item_licitacao": "Valor Unitário do Item que Compõe o Bem ou Serviço",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_realizacao_licitacao": "string",
      "numero_licitacao": "string",
      "numero_sequencial_item_licitacao": "integer",
      "numero_documento_negociante": "string",
      "descricao_item_licitacao": "string",
      "valor_vencedor_item_licitacao": "number",
      "codigo_tipo_negociante": "string",
      "descricao_unidade_item_licitacao": "string",
      "numero_quantidade_item_licitacao": "number",
      "valor_unitario_item_licitacao": "number",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "licitantes_fornecedores_bens_servicos",
    "path": "/licitantes_fornecedores_bens_servicos",
    "grupo": "LCO",
    "titulo": "Licitantes e Fornecedores de Bens e Serviços",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início Data de Autuação Processo Administrativo para Contratação"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim Data de Autuação Processo Administrativo para Contratação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_realizacao_licitacao": "Data de Autuação Processo Administrativo para Contratação",
      "numero_licitacao": "Número do Processo Administrativo para Contratação",
      "numero_documento_negociante": "Tipo de Documento de Identificação do Licitante ou Fornecedor",
      "codigo_tipo_negociante": "Número do Documento de Identificação do Licitante ou Fornecedor",
      "nome_negociante": "Nome ou Razão Social do Licitante ou Fornecedor",
      "endereco_negociante": "Endereço Completo do Licitante ou Fornecedo",
      "fone_negociante": "Número do Telefone do Licitante ou Fornecedor",
      "cep_negociante": "Número do CEP do Licitante ou Fornecedor",
      "nome_municipio_negociante": "Nome do Município do Licitante ou Fornecedor",
      "codigo_uf": "Unidade da Federação do Endereço do Licitante ou Fornecedor",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_realizacao_licitacao": "string",
      "numero_licitacao": "string",
      "numero_documento_negociante": "string",
      "codigo_tipo_negociante": "string",
      "nome_negociante": "string",
      "endereco_negociante": "string",
      "fone_negociante": "string",
      "cep_negociante": "string",
      "nome_municipio_negociante": "string",
      "codigo_uf": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "processos_administrativos_contratacoes",
    "path": "/processos_administrativos_contratacoes",
    "grupo": "LCO",
    "titulo": "Processos Administrativos de Contratações",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data de Autuação do Processo Administrativo para Contratação"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da data de Autuação do Processo Administrativo para Contratação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_realizacao_autuacao_licitacao": "Data de Autuação do Processo Administrativo para Contratação",
      "numero_licitacao": "Número do Processo Administrativo para Contratação",
      "hora_licitacao": "Hora da Realização da Licitação (Abertura das propostas)",
      "data_emissao_edital": "Data da Emissão do Edital",
      "modalidade_licitacao": "Modalidade da Licitação",
      "tipo_licitacao": "Critério de Julgamento da Licitação",
      "descricao_objeto_licitacao": "Descrição do Objeto do Processo Administrativo para Contratação",
      "valor_orcado_estimado": "Valor Total do Orçamento Estimado para o Objeto do Processo Administrativo para Contratação",
      "valor_limite_superior": "Valor do Limite Superior Desclassificatório para o Objeto Licitado",
      "cpf_gestor": "Número do CPF do Gestor da Unidade Gestora a qual pertence o Responsável pela Contratação",
      "data_criacao_comissao": "Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação",
      "numero_comissao": "Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação",
      "nome_responsavel_homologacao": "Nome do Responsável pela Homologação ou Ratificação do Processo Administrativo para Contratação",
      "data_realizacao_licitacao": "Data da Realização da Licitação (Abertura das propostas)",
      "modalidade_processo_administrativo": "Espécie do Processo Administrativo para Contratação",
      "cpf_responsavel_juridico": "Número do CPF do Responsável pelo Parecer Jurídico do Processo Administrativo para Contratação",
      "nome_responsavel_juridico": "Nome do Responsável pelo Parecer Jurídico do Processo Administrativo para Contratação",
      "data_homologacao": "Data de Homologação ou Ratificação do Processo Administrativo para Contratação",
      "descricao_justificativa_preco": "Justificativa do Preço Estabelecido para o Objeto Contratado",
      "descricao_motivo_fornecedor": "Motivo da escolha do Fornecedor que justificou o Processo Administrativo para Contratação",
      "descricao_fundamentacao_legal": "Fundamentação Legal para o Processo Administrativo para Contratação",
      "nome_orgao_ata": "Órgão Gerenciador da Ata de Registro de Preço",
      "data_referencia_doc": "Data de Referência da Documentação",
      "nome_resp_cotacao": "Nome do Responsável pela Cotação de Preços do Processo Administrativo para Contratação",
      "nome_resp_termo_referencia": "Nome do Responsável pela elaboração do Termo de Referência / Projeto Básico do Processo Administrativo para Contratação",
      "tipo_forma_contratacao": "Forma da Contratação",
      "tipo_disputa": "Tipo de Disputa",
      "descricao_url_plataforma_contratacao": "Sistema de Registro de Preços",
      "tipo_sistema_registro_precos": "Sistema de Registro de Preços",
      "numero_id_contratacao_pncp": "Número do Id Contratação PNCP",
      "numero_id_ata_pncp": "Número do Id Ata PNCP",
      "cpf_responsavel_homologacao": "Número do CPF do Responsável pela Homologação ou Ratificação do Processo Administrativo para Contratação",
      "cpf_resp_cotacao": "Número do CPF do Responsável pela Cotação de Preços do Processo Administrativo para Contratação",
      "cpf_resp_termo_referencia": "Número do CPF do Responsável pela elaboração do Termo de Referência / Projeto Básico do Processo Adm. para Contratação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_realizacao_autuacao_licitacao": "string",
      "numero_licitacao": "string",
      "hora_licitacao": "string",
      "data_emissao_edital": "string",
      "modalidade_licitacao": "string",
      "tipo_licitacao": "string",
      "descricao_objeto_licitacao": "string",
      "valor_orcado_estimado": "number",
      "valor_limite_superior": "number",
      "cpf_gestor": "string",
      "data_criacao_comissao": "string",
      "numero_comissao": "string",
      "nome_responsavel_homologacao": "string",
      "data_realizacao_licitacao": "string",
      "modalidade_processo_administrativo": "string",
      "cpf_responsavel_juridico": "string",
      "nome_responsavel_juridico": "string",
      "data_homologacao": "string",
      "descricao_justificativa_preco": "string",
      "descricao_motivo_fornecedor": "string",
      "descricao_fundamentacao_legal": "string",
      "nome_orgao_ata": "string",
      "data_referencia_doc": "integer",
      "nome_resp_cotacao": "string",
      "nome_resp_termo_referencia": "string",
      "tipo_forma_contratacao": "string",
      "tipo_disputa": "string",
      "descricao_url_plataforma_contratacao": "string",
      "tipo_sistema_registro_precos": "string",
      "numero_id_contratacao_pncp": "string",
      "numero_id_ata_pncp": "string",
      "cpf_responsavel_homologacao": "string",
      "cpf_resp_cotacao": "string",
      "cpf_resp_termo_referencia": "string"
    }
  },
  {
    "id": "publicacoes_editais_processos_administrativos_parcerias",
    "path": "/publicacoes_editais_processos_administrativos_parcerias",
    "grupo": "LCO",
    "titulo": "Publicações de Editais de Processos Administrativos de Parcerias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": ""
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": ""
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_realizacao_licitacao": "Data de Autuação Processo Administrativo para Contratações",
      "numero_licitacao": "Número do Processo Administrativo para Contratações",
      "numero_sequencial_publicacao_edital": "Número Sequencial da Publicação do Processo Administrativo para Contratações",
      "codigo_publicacao_edital": "Código do Veículo de Publicação do Processo Administrativo para Contratações",
      "descricao_publicacao_edital": "Descrição do Veículo de Publicação do Processo Administrativo para Contratações",
      "data_publicacao_edital": "Data da Publicação do Processo Administrativo para Contratações",
      "data_referencia_doc": "Data de Referência da Documentação",
      "data_inicio": "",
      "data_fim": ""
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_realizacao_licitacao": "string",
      "numero_licitacao": "string",
      "numero_sequencial_publicacao_edital": "string",
      "codigo_publicacao_edital": "string",
      "descricao_publicacao_edital": "string",
      "data_publicacao_edital": "string",
      "data_referencia_doc": "integer",
      "data_inicio": "string",
      "data_fim": "string"
    }
  },
  {
    "id": "tipos_responsaveis_contratacao",
    "path": "/tipos_responsaveis_contratacao",
    "grupo": "LCO",
    "titulo": "Tipos de Responsáveis pela Contratação",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "cpf_gestor": "Número do CPF do Gestor da Unidade Gestora a qual pertence o Responsável pela Contratação",
      "data_portaria_comissao": "Data da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação",
      "numero_sequencial_comissao_ug": "Número Sequencial de comissão/equipe/agente Responsável pela Contratação para a Unidade Gestora a que pertence",
      "numero_portaria_comissao": "Número da Portaria de criação/designação de comissão/equipe/agente Responsável pela Contratação",
      "tipo_responsavel_contratacao": "Tipo do Responsável de Contratação",
      "data_extincao_comissao": "Data de Extinção de comissão/equipe/agente Responsável pela Contratação",
      "numero_portaria_extincao": "Número da Portaria de Extinção comissão/equipe/agente Responsável pela Contratação",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "cpf_gestor": "string",
      "data_portaria_comissao": "string",
      "numero_sequencial_comissao_ug": "string",
      "numero_portaria_comissao": "string",
      "tipo_responsavel_contratacao": "string",
      "data_extincao_comissao": "string",
      "numero_portaria_extincao": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "aditivos_parcerias",
    "path": "/aditivos_parcerias",
    "grupo": "OSC",
    "titulo": "Aditivos de Parcerias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da data do Instrumento Jurídico da Parceria - OSC"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da data do Instrumento Jurídico da Parceria - OSC"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_instrumento_juridico": "Data do Instrumento Jurídico da Parceria - OSC",
      "numero_instrumento_juridico": "Número do Instrumento Jurídico da Parceria - OSC",
      "tipo_instrumento_juridico": "Tipo do Instrumento Jurídico da Parceria - OSC",
      "data_aditivo_instrumento": "Data do Aditivo ao Instrumento Jurídico da Parceria - OSC",
      "numero_sequencial_aditivo": "Número Sequencial do Aditivo ao Instrumento Jurídico da Parceria - OSC",
      "tipo_aditivo_instrumento": "Tipo de Aditivo ao Instrumento Jurídico da Parceria - OSC",
      "data_inicio_vigencia_aditivo": "Data de Início da Vigência do Aditivo da Parceria - OSC",
      "data_fim_atual_vigencia_aditivo": "Data Prevista Atualizada para o Fim da Vigência da Parceria - OSC",
      "valor_aditivo_parceria": "Valor do Aditivo da Parceria – OSC",
      "descricao_justificativa_aditivo": "Descrição da Justificativa do Aditivo à Parceria – OSC",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_instrumento_juridico": "string",
      "numero_instrumento_juridico": "string",
      "tipo_instrumento_juridico": "string",
      "data_aditivo_instrumento": "string",
      "numero_sequencial_aditivo": "string",
      "tipo_aditivo_instrumento": "string",
      "data_inicio_vigencia_aditivo": "string",
      "data_fim_atual_vigencia_aditivo": "string",
      "valor_aditivo_parceria": "number",
      "descricao_justificativa_aditivo": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "comissoes_parcerias_osc",
    "path": "/comissoes_parcerias_osc",
    "grupo": "OSC",
    "titulo": "Comissões de Parcerias OSC",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "numero_portaria_extincao_osc",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Número da Portaria de Extinção da Comissão da Parceria - OSC"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "cpf_gestor_ug_osc": "Número do CPF do Gestor da Unidade Gestora a qual pertence à Comissão da Parceria - OSC",
      "data_criacao_comissao_osc": "Data de Criação da Comissão da Parceria - OSC",
      "numero_comissao_ug_osc": "Número Sequencial da Comissão da Parceria - OSC para a Unidade Gestora a que pertence",
      "numero_portaria_comissao_osc": "Número da Portaria de Criação da Comissão da Parceria - OSC",
      "tipo_comissao_osc": "Tipo da Comissão da Parceria - OSC",
      "data_extincao_comissao_osc": "Data de Extinção da Comissão da Parceria - OSC",
      "numero_portaria_extincao_osc": "Número da Portaria de Extinção da Comissão da Parceria - OSC",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "cpf_gestor_ug_osc": "string",
      "data_criacao_comissao_osc": "string",
      "numero_comissao_ug_osc": "string",
      "numero_portaria_comissao_osc": "string",
      "tipo_comissao_osc": "string",
      "data_extincao_comissao_osc": "string",
      "numero_portaria_extincao_osc": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "dotacoes_utilizadas_parcerias_osc",
    "path": "/dotacoes_utilizadas_parcerias_osc",
    "grupo": "OSC",
    "titulo": "Dotações Utilizadas em Parcerias OSC",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data de Autuação do Processo Administrativo para Parceria – OSC"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data de Autuação do Processo Administrativo para Parceria – OSC"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_autuacao_processo_osc": "Data de Autuação do Processo Administrativo para Parceria – OSC",
      "numero_processo_admin_osc": "Número do Processo Administrativo para Parceria -OSC",
      "modalidade_processo_admin_osc": "Modalidade do Processo Administrativo para Parceria - OSC",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_funcao": "Código da Função",
      "codigo_sub_funcao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_sub_projeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "codigo_elemento_despesa": "Código do Elemento de Despesa",
      "codigo_grupo_fonte": "Código do Grupo da Fonte",
      "codigo_especificacao_fonte": "Código da Especificação da Fonte",
      "valor_utilizado_osc": "Valor Utilizado na Parceria – OSC",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_autuacao_processo_osc": "string",
      "numero_processo_admin_osc": "string",
      "modalidade_processo_admin_osc": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_funcao": "string",
      "codigo_sub_funcao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_sub_projeto_atividade": "string",
      "codigo_elemento_despesa": "string",
      "codigo_grupo_fonte": "string",
      "codigo_especificacao_fonte": "string",
      "valor_utilizado_osc": "number",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "membros_comissoes_parcerias_osc",
    "path": "/membros_comissoes_parcerias_osc",
    "grupo": "OSC",
    "titulo": "Membros das Comissões de Parcerias OSC",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "cpf_gestor_ug_osc": "Número do CPF do Gestor da Unidade Gestora a qual pertence à Comissão da Parceria - OSC",
      "data_criacao_comissao_osc": "Data de Criação da Comissão da Parceria - OSC",
      "numero_comissao_ug_osc": "Número Sequencial da Comissão da Parceria - OSC para a Unidade Gestora a que pertence",
      "cpf_membro_comissao_osc": "Número do CPF do Membro da Comissão da Parceria - OSC",
      "nome_membro_comissao_osc": "Nome do Membro da Comissão da Parceria - OSC",
      "endereco_membro_comissao_osc": "Endereço Completo do Membro da Comissão da Parceria - OSC",
      "numero_telefone_membro_comissao": "Número do Telefone do Membro da Comissão da Parceria – OSC",
      "tipo_membro_comissao_osc": "Tipo do Membro da Comissão da Parceria - OSC",
      "data_admissao_membro_comissao": "Data de Admissão do Membro da Comissão da Parceria - OSC",
      "data_saida_membro_comissao": "Data de Saída do Membro da Comissão da Parceria - OSC",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "cpf_gestor_ug_osc": "string",
      "data_criacao_comissao_osc": "string",
      "numero_comissao_ug_osc": "string",
      "cpf_membro_comissao_osc": "string",
      "nome_membro_comissao_osc": "string",
      "endereco_membro_comissao_osc": "string",
      "numero_telefone_membro_comissao": "string",
      "tipo_membro_comissao_osc": "string",
      "data_admissao_membro_comissao": "string",
      "data_saida_membro_comissao": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "organizacoes_sociedade_civil_osc",
    "path": "/organizacoes_sociedade_civil_osc",
    "grupo": "OSC",
    "titulo": "Organizações da Sociedade Civil (OSC)",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Inicio da Data de Autuação Processo Administrativo para Parceria - OSC"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data de Autuação Processo Administrativo para Parceria - OSC"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_autuacao_processo_osc": "Data de Autuação Processo Administrativo para Parceria - OSC",
      "numero_processo_admin_osc": "Número do Processo Administrativo para Parceria - OSC",
      "modalidade_processo_admin_osc": "Modalidade do Processo Administrativo para Parceria -OSC",
      "cnpj_identificacao_osc": "Número do Documento de Identificação da OSC",
      "nome_razao_social_osc": "Nome ou Razão Social da OSC",
      "endereco_osc": "Endereço Completo da OSC",
      "numero_telefone_osc": "Número do Telefone da OSC",
      "numero_cep_osc": "Número do CEP da OSC",
      "nome_municipio_osc": "Nome do Município da OSC",
      "nome_uf_osc": "Unidade da Federação da OSC",
      "organizacao_vencedora_osc": "Organização Vencedora",
      "data_referencia_doc": "Data de Referência da Documentação",
      "endereco_eletronico_osc": "Endereço Eletrônico da OSC"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_autuacao_processo_osc": "string",
      "numero_processo_admin_osc": "string",
      "modalidade_processo_admin_osc": "string",
      "cnpj_identificacao_osc": "string",
      "nome_razao_social_osc": "string",
      "endereco_osc": "string",
      "numero_telefone_osc": "string",
      "numero_cep_osc": "string",
      "nome_municipio_osc": "string",
      "nome_uf_osc": "string",
      "organizacao_vencedora_osc": "string",
      "data_referencia_doc": "integer",
      "endereco_eletronico_osc": "string"
    }
  },
  {
    "id": "parcerias_osc",
    "path": "/parcerias_osc",
    "grupo": "OSC",
    "titulo": "Parcerias OSC",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data do Instrumento Jurídico da Parceria - OSC"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data do Instrumento Jurídico da Parceria - OSC"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_instrumento_juridico_osc": "Data do Instrumento Jurídico da Parceria - OSC",
      "numero_instrumento_juridico_osc": "Número do Instrumento Jurídico da Parceria - OSC",
      "tipo_instrumento_juridico_osc": "Tipo do Instrumento Jurídico da Parceria - OSC",
      "data_inicio_vigencia_osc": "Data de Início da Vigência da Parceria - OSC",
      "data_fim_vigencia_osc": "Data Prevista para o Fim da Vigência da Parceria - OSC",
      "descricao_objeto_osc": "Descrição do Objeto da Parceria - OSC",
      "descricao_justificativa_osc": "Descrição da Justificativa da Parceria – OSC",
      "valor_previsto_realizacao_osc": "Valor Previsto para realização do objeto da Parceria – OSC",
      "cpf_responsavel_osc": "Número do CPF do Dirigente responsável pela OSC",
      "nome_responsavel_osc": "Nome Dirigente responsável pela OSC",
      "cpf_agente_responsavel_osc": "Número do CPF do Agente Público responsável pela Parceria",
      "nome_agente_responsavel_osc": "Nome Agente Público responsável pela Parceria",
      "data_autuacao_processo_osc": "Data de Autuação Processo Administrativo para Parceria – OSC",
      "numero_processo_admin_osc": "Número do Processo Administrativo para Parceria – OSC",
      "modalidde_processo_admin_osc": "Modalidade do Processo Administrativo para Parceria - OSC",
      "cnpj_osc": "Número do Documento de Identificação da OSC",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_instrumento_juridico_osc": "string",
      "numero_instrumento_juridico_osc": "string",
      "tipo_instrumento_juridico_osc": "string",
      "data_inicio_vigencia_osc": "string",
      "data_fim_vigencia_osc": "string",
      "descricao_objeto_osc": "string",
      "descricao_justificativa_osc": "string",
      "valor_previsto_realizacao_osc": "number",
      "cpf_responsavel_osc": "string",
      "nome_responsavel_osc": "string",
      "cpf_agente_responsavel_osc": "string",
      "nome_agente_responsavel_osc": "string",
      "data_autuacao_processo_osc": "string",
      "numero_processo_admin_osc": "string",
      "modalidde_processo_admin_osc": "string",
      "cnpj_osc": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "processos_administrativos_parcerias_osc",
    "path": "/processos_administrativos_parcerias_osc",
    "grupo": "OSC",
    "titulo": "Processos Administrativos de Parcerias OSC",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data de Autuação do Processo Administrativo para Parceria – OSC"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data de Autuação do Processo Administrativo para Parceria – OSC"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_autuacao_processo_osc": "Data de Autuação do Processo Administrativo para Parceria – OSC",
      "numero_processo_osc": "Número do Processo Administrativo para Parceria – OSC",
      "modalidade_processo_osc": "Modalidade do Processo Administrativo para Parceria - OSC",
      "cpf_responsavel_processo_osc": "Número do CPF do Responsável pela Homologação ou Ratificação do Processo Administrativo para Parceria - OSC",
      "nome_responsavel_processo_osc": "Nome do Responsável pela Homologação ou Ratificação do Processo Administrativo para Parceria - OSC",
      "data_homologacao_processo_osc": "Data de Homologação ou Ratificação do Processo Administrativo para Parceria – OSC",
      "cpf_gestor_responsavel_ug_osc": "Número do CPF do Gestor da Unidade Gestora a qual pertence à Comissão da Parceria – OSC",
      "data_criacao_comissao_osc": "Data da Criação da Comissão da Parceria – OSC",
      "numero_comissao_ug_osc": "Número Sequencial da Comissão da Parceria – OSC para a Unidade Gestora a que pertence",
      "descricao_justificativa_processo": "Descrição da Justificativa para o Processo de Dispensa ou Inexigibilidade",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_autuacao_processo_osc": "string",
      "numero_processo_osc": "string",
      "modalidade_processo_osc": "string",
      "cpf_responsavel_processo_osc": "string",
      "nome_responsavel_processo_osc": "string",
      "data_homologacao_processo_osc": "string",
      "cpf_gestor_responsavel_ug_osc": "string",
      "data_criacao_comissao_osc": "string",
      "numero_comissao_ug_osc": "string",
      "descricao_justificativa_processo": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "publicacoes_editais_processos_administrativos_parcerias_osc",
    "path": "/publicacoes_editais_processos_administrativos_parcerias_osc",
    "grupo": "OSC",
    "titulo": "Publicações de Editais de Processos Administrativos de Parcerias OSC",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data de Autuação Processo Administrativo para Parceria – OSC"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data de Autuação Processo Administrativo para Parceria – OSC"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_autuacao_processo_osc": "Data de Autuação Processo Administrativo para Parceria – OSC",
      "numero_processo_osc": "Número do Processo Administrativo para Parceria – OSC",
      "modalidade_processo_osc": "Modalidade do Processo Administrativo para Parceria – OSC",
      "data_edital_processo_osc": "Data do Edital do Processo Administrativo para Parceria – OSC",
      "numero_edital_processo_osc": "Número do Edital do Processo Administrativo para Parceria - OSC",
      "numero_sequencial_processo_osc": "Número Sequencial da Publicação do Processo Administrativo para Parceria – OSC",
      "codigo_publicacao_processo_osc": "Código do Veículo de Publicação do Processo Administrativo para Parceria – OSC",
      "descricao_publicacao_processo_osc": "Descrição do Veículo de Publicação do Processo Administrativo para Parceria - OSC",
      "data_publicacao_processo_osc": "Data da Publicação do Processo Administrativo para Parceria - OSC",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_autuacao_processo_osc": "string",
      "numero_processo_osc": "string",
      "modalidade_processo_osc": "string",
      "data_edital_processo_osc": "string",
      "numero_edital_processo_osc": "string",
      "numero_sequencial_processo_osc": "string",
      "codigo_publicacao_processo_osc": "string",
      "descricao_publicacao_processo_osc": "string",
      "data_publicacao_processo_osc": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "abertura_creditos_adicionais",
    "path": "/abertura_creditos_adicionais",
    "grupo": "CRD",
    "titulo": "Abertura de Créditos Adicionais",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "numero_abertura_credito_dia",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Número Sequencial da Abertura de Crédito no Dia"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data da Abertura de Crédito"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data da Abertura de Crédito"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "data_abertura_credito": "Data da Abertura de Crédito",
      "numero_abertura_credito_dia": "Número Sequencial da Abertura de Crédito no Dia",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_funcao": "Código da Função",
      "codigo_subfuncao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_sub_projeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "cd_elemento_despesa": "Código do Elemento de Despesa",
      "codigo_tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "data_referencia_doc": "Data de Referência da Documentação",
      "numero_lei": "Número da Lei que autorizou a Abertura de Crédito",
      "numero_decreto": "Número do Decreto que autorizou a Abertura de Crédito",
      "tipo_abertura_credito": "Tipo de Abertura de Crédito",
      "codigo_fonte_recursos": "Fonte de Recursos do Crédito",
      "valor_credito_super": "Valor do Crédito por Superávit Financeiro",
      "valor_credito_excesso": "Valor do Crédito por Excesso de Arrecadação",
      "valor_credito_operacao": "Valor do Crédito por Operações Financeiras",
      "valor_credito_anulacao": "Valor do Crédito por Anulações de Dotação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "data_abertura_credito": "string",
      "numero_abertura_credito_dia": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_funcao": "string",
      "codigo_subfuncao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_sub_projeto_atividade": "string",
      "cd_elemento_despesa": "string",
      "codigo_tipo_fonte": "string",
      "codigo_fonte": "string",
      "data_referencia_doc": "integer",
      "numero_lei": "string",
      "numero_decreto": "string",
      "tipo_abertura_credito": "string",
      "codigo_fonte_recursos": "string",
      "valor_credito_super": "number",
      "valor_credito_excesso": "number",
      "valor_credito_operacao": "number",
      "valor_credito_anulacao": "number"
    }
  },
  {
    "id": "destinacao_remanejamentos_transposicoes_transferencias_dotacoes",
    "path": "/destinacao_remanejamentos_transposicoes_transferencias_dotacoes",
    "grupo": "CRD",
    "titulo": "Destinação de Remanejamentos, Transposições e Transferências de Dotações",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão Beneficiado com a Alteração Orçamentária"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária Beneficiada com a Alteração Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "data_alteracao": "Data da Alteração Orçamentária",
      "numero_sequencia": "Número Sequencial da Alteração Orçamentária no Dia",
      "codigo_orgao": "Código do Órgão Beneficiado com a Alteração Orçamentária",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária Beneficiada com a Alteração Orçamentária",
      "codigo_funcao": "Código da Função da Dotação Beneficiada com a Alteração Orçamentária",
      "codigo_subfuncao": "Código da Subfunção da Dotação Beneficiada com a Alteração Orçamentária",
      "codigo_programa": "Código do Programa da Dotação Beneficiada com a Alteração Orçamentária",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade da Dotação Beneficiada com a Alteração Orçamentária",
      "numero_projeto_atividade": "Número do Projeto ou Atividade da Dotação Beneficiada com a Alteração Orçamentária",
      "numero_sub_projeto_atividade": "Número do Sub-projeto ou Sub- atividade da Dotação Beneficiada com a Alteração Orçamentária",
      "codigo_elemento": "Código do Elemento de Despesa da Dotação Beneficiada com a Alteração Orçamentária",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "data_referencia_doc": "Data de Referência da Documentação",
      "valor_destino": "Valor Destinado à Dotação Beneficiada com a Alteração Orçamentária"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "data_alteracao": "string",
      "numero_sequencia": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_funcao": "string",
      "codigo_subfuncao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_sub_projeto_atividade": "string",
      "codigo_elemento": "string",
      "tipo_fonte": "string",
      "codigo_fonte": "string",
      "data_referencia_doc": "integer",
      "valor_destino": "number"
    }
  },
  {
    "id": "fontes_abertura_credito_anulacao_dotacao",
    "path": "/fontes_abertura_credito_anulacao_dotacao",
    "grupo": "CRD",
    "titulo": "Fontes de Abertura de Crédito por Anulação de Dotação",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão da Dotação Anulada"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária da Dotação Anulada"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data da Abertura de Crédito"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data da Abertura de Crédito"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "data_abertura_credito": "Data da Abertura de Crédito",
      "numero_sequencia_abertura": "Número Sequencial da Abertura de Crédito no Dia",
      "codigo_orgao": "Código do Órgão da Dotação Anulada",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária da Dotação Anulada",
      "codigo_funcao": "Código da Função da Dotação Anulada",
      "codigo_sub_funcao": "Código da Subfunção da Dotação Anulada",
      "codigo_programa": "Código do Programa da Dotação Anulada",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade da Dotação Anulada",
      "numero_projeto_atividade": "Número do Projeto ou Atividade da Dotação Anulada",
      "numero_sub_projeto_atividade": "Número do Sub-projeto ou Sub-atividade da Dotação Anulada",
      "codigo_elemento_despesa": "Código do Elemento de Despesa da Dotação Anulada",
      "codigo_grupo_fonte": "Código do Grupo da Fonte da Dotação Anulada",
      "codigo_especificacao_fonte": "Código da Especificação da Fonte da Dotação Anulada",
      "valor_credito_anulacao": "Valor do Crédito por Anulação de Dotação",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "data_abertura_credito": "string",
      "numero_sequencia_abertura": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_funcao": "string",
      "codigo_sub_funcao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_sub_projeto_atividade": "string",
      "codigo_elemento_despesa": "string",
      "codigo_grupo_fonte": "string",
      "codigo_especificacao_fonte": "string",
      "valor_credito_anulacao": "number",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "movimentacoes_fontes_recursos",
    "path": "/movimentacoes_fontes_recursos",
    "grupo": "CRD",
    "titulo": "Movimentações de Fontes de Recursos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "data_modificacao_fonte": "Data da Modificação na Fonte de Recursos",
      "numero_sequencia_modificacao": "Número Sequencial da Modificação no Dia",
      "tipo_movimentacao_mf": "Tipo de Movimentação",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_funcao": "Código da Função",
      "codigo_sub_funcao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_subprojeto_atividade": "Número do Subprojeto ou Sub-atividade",
      "codigo_elemento_despesa": "Código do Elemento de Despesa",
      "tipo_fonte_origem": "Código do Grupo da Fonte de Origem",
      "codigo_fonte_origem": "Código da Especificação da Fonte de Origem",
      "tipo_fonte_destino": "Código do Grupo da Fonte de Destino",
      "codigo_fonte_destino": "Código da Especificação da Fonte de Destino",
      "valor_movimentacao_mf": "Valor da Movimentação entre Fontes de Recursos",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "data_modificacao_fonte": "string",
      "numero_sequencia_modificacao": "integer",
      "tipo_movimentacao_mf": "string",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_funcao": "string",
      "codigo_sub_funcao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_subprojeto_atividade": "string",
      "codigo_elemento_despesa": "string",
      "tipo_fonte_origem": "string",
      "codigo_fonte_origem": "string",
      "tipo_fonte_destino": "string",
      "codigo_fonte_destino": "string",
      "valor_movimentacao_mf": "number",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "remanejamentos_transposicoes_transferencias_dotacoes",
    "path": "/remanejamentos_transposicoes_transferencias_dotacoes",
    "grupo": "CRD",
    "titulo": "Remanejamentos, Transposições e Transferências de Dotações",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "data_alteracao_orcamento": "Data da Alteração do Orçamento",
      "numero_sequencia_alteracao": "Número Sequencial da Alteração Orçamentária no Dia",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "codigo_funcao": "Código da Função",
      "codigo_sub_funcao": "Código da Subfunção",
      "codigo_programa": "Código do Programa",
      "codigo_projeto_atividade": "Código de Projeto ou Atividade",
      "numero_projeto_atividade": "Número do Projeto ou Atividade",
      "numero_sub_projeto_atividade": "Número do Sub-projeto ou Sub-atividade",
      "codigo_elemento_despesa": "Código do Elemento de Despesa",
      "tipo_fonte": "Código do Grupo da Fonte",
      "codigo_fonte": "Código da Especificação da Fonte",
      "data_referencia_doc": "Data de Referência da Documentação",
      "numero_lei_alteracao": "Número da Lei que autorizou a Alteração Orçamentária",
      "tipo_alteracao": "Tipo de Alteração Orçamentária",
      "valor_realocado": "Valor do Remanejamento, Transposição ou Transferência"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "data_alteracao_orcamento": "string",
      "numero_sequencia_alteracao": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "codigo_funcao": "string",
      "codigo_sub_funcao": "string",
      "codigo_programa": "string",
      "codigo_projeto_atividade": "string",
      "numero_projeto_atividade": "string",
      "numero_sub_projeto_atividade": "string",
      "codigo_elemento_despesa": "string",
      "tipo_fonte": "string",
      "codigo_fonte": "string",
      "data_referencia_doc": "integer",
      "numero_lei_alteracao": "string",
      "tipo_alteracao": "string",
      "valor_realocado": "number"
    }
  },
  {
    "id": "medicoes_obras_municipio",
    "path": "/medicoes_obras_municipio",
    "grupo": "OSE",
    "titulo": "Medições de Obras do Município",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "data_emissao_empenho": "Data da Emissão da Nota de Empenho",
      "numero_empenho": "Número da Nota de Empenho",
      "data_inicio_obra_servico": "Data de Início da Obra ou Serviço de Engenharia",
      "tipo_obra_servico": "Tipo se é Obra ou Serviço de Engenharia",
      "numero_obra_servico": "Número da Obra ou Serviço de Engenharia",
      "numero_medicao": "Número da Medição",
      "valor_medicao": "Valor da Medição",
      "data_medicao": "Data da Medição",
      "cpf_responsavel_empresa": "CPF do Responsável pela Medição da Empresa",
      "nome_responsavel_empresa": "Responsável pela Medição da Empresa",
      "cpf_responsavel_municipio": "CPF do Responsável pela Medição do Município",
      "nome_responsavel_municipio": "Responsável pela Medição do Município",
      "formacao_profissional_responsavel": "Formação Profissional do Responsável pela Obra ou Serviço de Engenharia",
      "cpf_responsavel_obra": "CPF do Engenheiro ou Arquiteto Responsável pela Obra",
      "nome_responsavel_obra": "Engenheiro ou Arquiteto Responsável pela Obra",
      "numero_art_fiscalizacao": "Número de ART de Fiscalização",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_empenho": "string",
      "data_inicio_obra_servico": "string",
      "tipo_obra_servico": "string",
      "numero_obra_servico": "integer",
      "numero_medicao": "string",
      "valor_medicao": "number",
      "data_medicao": "string",
      "cpf_responsavel_empresa": "string",
      "nome_responsavel_empresa": "string",
      "cpf_responsavel_municipio": "string",
      "nome_responsavel_municipio": "string",
      "formacao_profissional_responsavel": "string",
      "cpf_responsavel_obra": "string",
      "nome_responsavel_obra": "string",
      "numero_art_fiscalizacao": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "obras_municipais_servicos_engenharia",
    "path": "/obras_municipais_servicos_engenharia",
    "grupo": "OSE",
    "titulo": "Obras Municipais e Serviços de Engenharia",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data de Início da Obra ou Serviço de Engenharia"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data de Início da Obra ou Serviço de Engenharia"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_inicio_obra": "Data de Início da Obra ou Serviço de Engenharia",
      "tipo_obra": "Tipo se é Obra ou Serviço de Engenharia",
      "numero_obra": "Número da Obra ou Serviço de Engenharia",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária",
      "descricao_obra_servico": "Descrição da Obra ou Serviço de Engenharia",
      "tipo_execucao": "Tipo de Execução da Obra ou Serviço de Engenharia",
      "data_fim_obra": "Data Prevista para o Término da Obra ou Serviço de Engenharia",
      "valor_total_obra": "Valor Total da Obra ou Serviço de Engenharia",
      "numero_registro_obra": "Número do Registro da Obra ou Serviço de Engenharia no CREA",
      "tipo_classificacao_bem": "Classificação do Bem"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_inicio_obra": "string",
      "tipo_obra": "string",
      "numero_obra": "integer",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "descricao_obra_servico": "string",
      "tipo_execucao": "string",
      "data_fim_obra": "string",
      "valor_total_obra": "number",
      "numero_registro_obra": "string",
      "tipo_classificacao_bem": "string"
    }
  },
  {
    "id": "status_obras_servico_engenharia",
    "path": "/status_obras_servico_engenharia",
    "grupo": "OSE",
    "titulo": "Status de Obras e Serviços de Engenharia",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data de Início da Obra ou Serviço de Engenharia"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data de Início da Obra ou Serviço de Engenharia"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "data_inicio_obra": "Data de Início da Obra ou Serviço de Engenharia",
      "tipo_obra": "Tipo se é Obra ou Serviço de Engenharia",
      "numero_obra": "Número da Obra ou Serviço de Engenharia",
      "data_envio_informacao": "Data do Envio da Informação Sobre o Status da obra ou Serviço de Engenharia",
      "status_obra": "Status da Obra ou Serviço de Engenharia",
      "cpf_responsavel": "CPF do Responsável Pela Informação",
      "nome_responsavel": "Nome do Responsável pela Informação",
      "numero_telefone_responsavel": "Número do Telefone do Responsável pela Informação",
      "email_responsavel": "E-mail do Responsável pela Informação",
      "observacao_status": "Observação sobre o Status",
      "data_termo_conclusao": "Data do Termo de Conclusão",
      "tipo_termo_conclusao": "Tipo de Termo de Conclusão",
      "numero_registro_bem": "Número de Registro ou Tombo do Bem"
    },
    "tipos": {
      "codigo_municipio": "string",
      "data_inicio_obra": "string",
      "tipo_obra": "string",
      "numero_obra": "integer",
      "data_envio_informacao": "string",
      "status_obra": "integer",
      "cpf_responsavel": "string",
      "nome_responsavel": "string",
      "numero_telefone_responsavel": "string",
      "email_responsavel": "string",
      "observacao_status": "string",
      "data_termo_conclusao": "string",
      "tipo_termo_conclusao": "integer",
      "numero_registro_bem": "string"
    }
  },
  {
    "id": "ajuste_reavaliacao_patrimonial_desincorporacao_bem_municipio",
    "path": "/ajuste_reavaliacao_patrimonial_desincorporacao_bem_municipio",
    "grupo": "PAT",
    "titulo": "Ajuste, Reavaliação Patrimonial e Desincorporação de Bem do Município",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão Responsável pelo Ajuste /Reavaliação /Melhorias/ Desincorporação do Bem"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária Responsável pelo Ajuste / Reavaliação /Melhorias /Desincorporação do Bem"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "numero_registro": "Número de Registro ou Tombo do Bem",
      "data_avaliacao": "Data do Ajuste/Reavaliação/Melhorias/Desincorporação do Bem",
      "data_referencia_doc": "Data de Referência da Documentação",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão Responsável pelo Ajuste /Reavaliação /Melhorias/ Desincorporação do Bem",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária Responsável pelo Ajuste / Reavaliação /Melhorias /Desincorporação do Bem",
      "cpf_servidor_responsavel": "Número do CPF do Responsável pelo Ajuste/Reavaliação/Melhorias/Desincorporação do Bem (Agente Público do Órgão Responsável pelo Ajuste/Reavaliação/Melhorias/Desincorporação do Bem)",
      "codigo_ingresso": "Forma de Ingresso no Serviço Público Municipal (Agente Público do Órgão Responsável pelo Ajuste/Reavaliação/Melhorias/Desincorporação do Bem)",
      "codigo_vinculo": "Tipo de relação com o serviço público (Agente Público do Órgão Responsável pelo Ajuste/Reavaliação/Melhorias/Desincorporação do Bem)",
      "numero_expediente": "Número do Expediente de Nomeação ou Posse (Agente Público do Órgão Responsável pelo Ajuste/Reavaliação/Melhorias/Desincorporação do Bem)",
      "status_situacao_bem": "Situações de Ajuste/Reavaliação/Melhorias/Desincorporação do Bem",
      "valor_ajuste_avaliacao": "Valor do Ajuste/Reavaliação/Melhorias/Desincorporação do Bem",
      "descricao_ajuste_motivo": "Descrição do Ajuste/Reavaliação/Melhorias/Desincorporação do Bem",
      "valor_residual_atualizado": "Valor Residual do Bem Atualizado",
      "valor_depreciavel_atualizado": "Valor Depreciável do Bem Atualizado",
      "numero_vida_util_atualizado": "Vida Útil Econômica Atualizado"
    },
    "tipos": {
      "codigo_municipio": "string",
      "numero_registro": "string",
      "data_avaliacao": "string",
      "data_referencia_doc": "integer",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "cpf_servidor_responsavel": "string",
      "codigo_ingresso": "string",
      "codigo_vinculo": "string",
      "numero_expediente": "string",
      "status_situacao_bem": "integer",
      "valor_ajuste_avaliacao": "number",
      "descricao_ajuste_motivo": "string",
      "valor_residual_atualizado": "number",
      "valor_depreciavel_atualizado": "number",
      "numero_vida_util_atualizado": "integer"
    }
  },
  {
    "id": "bens_incorporados_patrimonio_municipio",
    "path": "/bens_incorporados_patrimonio_municipio",
    "grupo": "PAT",
    "titulo": "Bens Incorporados ao Patrimônio do Município",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_inicio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Início da Data do Registro ou Tombo do Bem"
      },
      {
        "nome": "data_fim",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Data Fim da Data do Registro ou Tombo do Bem"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "numero_registro": "Número de Registro ou Tombo do Bem",
      "data_referencia_doc": "Data de Referência da Documentação",
      "data_aquisicao": "Data do Registro ou Tombo do Bem",
      "tipo_classificacao": "Classificação do Bem",
      "tipo_natureza": "Natureza do Bem",
      "status_baixa": "Status de Bem Baixado",
      "descricao_bem": "Descrição do Bem",
      "area_bem_m2": "Área do Bem Imóvel - M2",
      "municipio_cartorio": "Município do Cartório do Bem Imóvel",
      "zona_cartorio": "Zona Cartorial do Bem Imóvel",
      "matricula_registro": "Matrícula do Registro do Bem Imóvel",
      "longitude": "Coordenada da Longitude do Bem Imóvel",
      "latitude": "Coordenada da Latitude do Bem Imóvel",
      "endereco": "Endereço Completo do Bem Imóvel",
      "distrito_localidade": "Distrito/Localidade do Bem Imóvel",
      "vida_util": "Vida Útil Econômica do Bem",
      "valor_depreciavel": "Valor Depreciável do Bem",
      "valor_residual": "Valor Residual do Bem"
    },
    "tipos": {
      "codigo_municipio": "string",
      "numero_registro": "string",
      "data_referencia_doc": "integer",
      "data_aquisicao": "string",
      "tipo_classificacao": "string",
      "tipo_natureza": "integer",
      "status_baixa": "boolean",
      "descricao_bem": "string",
      "area_bem_m2": "number",
      "municipio_cartorio": "string",
      "zona_cartorio": "string",
      "matricula_registro": "string",
      "longitude": "string",
      "latitude": "string",
      "endereco": "string",
      "distrito_localidade": "string",
      "vida_util": "integer",
      "valor_depreciavel": "number",
      "valor_residual": "number"
    }
  },
  {
    "id": "contas_redutoras_bens_incorporados_patrimonio_municipio",
    "path": "/contas_redutoras_bens_incorporados_patrimonio_municipio",
    "grupo": "PAT",
    "titulo": "Contas Redutoras de Bens Incorporados ao Patrimônio do Município",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão Responsável pelas Situações de Depreciação, Amortização, Exaustão e Redução/Reversão ao Valor Recuperável"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária Responsável pelas Situações de Depreciação, Amortização, Exaustão e Redução/Reversão ao Valor Recuperável"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "numero_registro": "Número de Registro ou Tombo do Bem",
      "data_situacao": "Data das Situações de Depreciação, Amortização, Exaustão e Redução/Reversão ao Valor Recuperável",
      "situacao_bem": "Situação de Depreciação, Amortização, Exaustão ou Redução /Reversão ao Valor Recuperável",
      "data_referencia_doc": "Data de Referência da Documentação",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão Responsável pelas Situações de Depreciação, Amortização, Exaustão e Redução/Reversão ao Valor Recuperável",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária Responsável pelas Situações de Depreciação, Amortização, Exaustão e Redução/Reversão ao Valor Recuperável",
      "cpf_responsavel_situacao": "Número do CPF do Responsável pelas Situações de Depreciação, Amortização e Exaustão e Redução/Reversão ao Valor Recuperável (Agente Público do Órgão Responsável pelas Situações de Depreciação, Amortização, Exaustão e Redução/Reversão ao Valor Recuperável)",
      "tipo_ingresso": "Forma de Ingresso no Serviço Público Municipal (Agente Público do Órgão Responsável pelas Situações de Depreciação, Amortização, Exaustão e Redução/Reversão ao Valor Recuperável)",
      "tipo_vinculo": "Tipo de relação com o serviço público (Agente Público do Órgão Responsável pelas Situações de Depreciação, Amortização, Exaustão e Redução /Reversão ao Valor Recuperável)",
      "numero_expediente": "Número do Expediente de Nomeação ou Posse (Agente Público do Órgão Responsável pelas Situações de Depreciação, Amortização, Exaustão e Redução/Reversão ao Valor Recuperável)",
      "valor_situacao": "Valor das Situações de Depreciação, Amortização, Exaustão ou Redução / Reversão ao Valor Recuperável e Baixas de Depreciação, Amortização e Exaustão.",
      "descricao_situacao_bem": "Descrição das Situações de Depreciação, Amortização, Exaustão ou Redução/Reversão ao Valor Recuperável e Baixas de Depreciação, Amortização e Exaustão."
    },
    "tipos": {
      "codigo_municipio": "string",
      "numero_registro": "string",
      "data_situacao": "string",
      "situacao_bem": "string",
      "data_referencia_doc": "integer",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "cpf_responsavel_situacao": "string",
      "tipo_ingresso": "string",
      "tipo_vinculo": "string",
      "numero_expediente": "string",
      "valor_situacao": "number",
      "descricao_situacao_bem": "string"
    }
  },
  {
    "id": "controle_bens_notas_empenhos",
    "path": "/controle_bens_notas_empenhos",
    "grupo": "PAT",
    "titulo": "Controle de Bens por Notas de Empenhos",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão que emitiu o Empenho para a Aquisição do Bem"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária que emitiu o Empenho para a Aquisição do Bem"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "numero_registro": "Número de Registro ou Tombo do Bem",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão que emitiu o Empenho para a Aquisição do Bem",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária que emitiu o Empenho para a Aquisição do Bem",
      "data_emissao_empenho": "Data da Nota de Empenho de Aquisição do Bem",
      "numero_nota_empenho": "Número da Nota de Empenho de Aquisição do Bem",
      "data_referencia_doc": "Data de Referência da Documentação"
    },
    "tipos": {
      "codigo_municipio": "string",
      "numero_registro": "string",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "data_emissao_empenho": "string",
      "numero_nota_empenho": "string",
      "data_referencia_doc": "integer"
    }
  },
  {
    "id": "controle_bens_unidades_orcamentarias",
    "path": "/controle_bens_unidades_orcamentarias",
    "grupo": "PAT",
    "titulo": "Controle de Bens por Unidades Orçamentárias",
    "params": [
      {
        "nome": "codigo_municipio",
        "obrigatorio": true,
        "tipo": "string",
        "rotulo": "Código do Município"
      },
      {
        "nome": "data_referencia_doc",
        "obrigatorio": true,
        "tipo": "integer",
        "rotulo": "Data de Referência da Documentação"
      },
      {
        "nome": "exercicio_orcamento",
        "obrigatorio": false,
        "tipo": "integer",
        "rotulo": "Exercício do Orçamento"
      },
      {
        "nome": "codigo_orgao",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código do Órgão para onde o Bem foi Disponibilizado"
      },
      {
        "nome": "codigo_unidade_orcamentaria",
        "obrigatorio": false,
        "tipo": "string",
        "rotulo": "Código da Unidade Orçamentária para onde o Bem foi Disponibilizado"
      }
    ],
    "campos": {
      "codigo_municipio": "Código do Município",
      "numero_registro": "Número de Registro ou Tombo do Bem",
      "data_disponibilizacao": "Data de Disponibilização do Bem",
      "data_referencia_doc": "Data de Referência da Documentação",
      "exercicio_orcamento": "Exercício do Orçamento",
      "codigo_orgao": "Código do Órgão para onde o Bem foi Disponibilizado",
      "codigo_unidade_orcamentaria": "Código da Unidade Orçamentária para onde o Bem foi Disponibilizado",
      "cpf_responsavel_recebimento": "Número do CPF do Responsável pelo Recebimento do Bem (do Agente Público do Órgão Beneficiado pelo Bem)",
      "codigo_ingresso": "Forma de Ingresso no Serviço Público Municipal (do Agente Público do Órgão Beneficiado pelo Bem)",
      "codigo_vinculo": "Tipo de relação com o serviço público (do Agente Público do Órgão Beneficiado pelo Bem)",
      "numero_expediente": "Número do Expediente de Nomeação ou Posse (do Agente Público do Órgão Beneficiado pelo Bem)"
    },
    "tipos": {
      "codigo_municipio": "string",
      "numero_registro": "string",
      "data_disponibilizacao": "string",
      "data_referencia_doc": "integer",
      "exercicio_orcamento": "integer",
      "codigo_orgao": "string",
      "codigo_unidade_orcamentaria": "string",
      "cpf_responsavel_recebimento": "string",
      "codigo_ingresso": "string",
      "codigo_vinculo": "string",
      "numero_expediente": "string"
    }
  }
];

export const POR_ID = Object.fromEntries(ENDPOINTS.map((e) => [e.id, e]));

export function endpointsDoGrupo(sigla) {
  return ENDPOINTS.filter((e) => e.grupo === sigla);
}

export function rotuloCampo(id, campo) {
  return (POR_ID[id] && POR_ID[id].campos[campo]) || campo;
}
