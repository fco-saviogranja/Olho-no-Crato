// Para onde vai o dinheiro: a despesa do exercício aberta por área, por
// secretaria, por tipo de gasto e por ação do orçamento.

import { consultar, referencia, ultimoMesComDados } from '../api/tce.js';
import {
  chaveAcao, dicionarios, grupoFonte, nomeAcao, nomeElemento, nomeFonte, nomeFuncao, nomeOrgao,
  nomeSubfuncao, nomeUnidade,
} from '../api/auxiliares.js';
import { dinheiro, MESES, percentual } from '../api/formato.js';
import { agrupar, ordenarPor, somarVarios } from '../dados/agregacoes.js';
import {
  abas, aviso, botao, carimbo, carregando, el, erroNaTela, gaveta, listaDetalhes, ranking, secao,
} from '../ui/componentes.js';
import { pictogramaFuncao } from '../ui/pictogramas.js';
import { tabela } from '../ui/tabela.js';

const CAMPOS = [
  'codigo_orgao', 'codigo_unidade_orcamentaria', 'codigo_funcao', 'codigo_subfuncao',
  'codigo_programa', 'codigo_projeto_atividade', 'numero_projeto_atividade',
  'numero_subprojeto_atividade', 'codigo_elemento_despesa', 'codigo_fonte',
  'valor_fixado_orcamento_bal_despesa', 'valor_empenhado_ate_mes',
  'valor_liquidado_ate_mes', 'valor_pago_ate_mes',
];

const VALORES = CAMPOS.slice(10);

export const titulo = 'Para onde vai';

export async function montar(raiz, estado) {
  raiz.append(carregando('Abrindo o balancete de despesa de ' + estado.ano + '...'));

  try {
    const mes = await ultimoMesComDados(estado.ano);
    if (!mes) {
      raiz.replaceChildren(aviso('alerta',
        'Ainda não há balancete de despesa publicado para ' + estado.ano + '. Escolha outro exercício.'));
      return;
    }

    const [balancete, dic] = await Promise.all([
      consultar('/balancetes_despesas_orcamentarias',
        { ano: estado.ano, mes: referencia(estado.ano, mes) },
        { tudo: true, select: CAMPOS }),
      dicionarios(estado.ano, ['acoes']),
    ]);

    const linhas = balancete.dados;
    const totais = somarVarios(linhas, VALORES);

    raiz.replaceChildren();
    raiz.append(el('div', { class: 'topo-pagina' },
      el('h1', { texto: 'Para onde vai o dinheiro' }),
      el('p', { class: 'linha-fina' },
        'Despesa de ' + estado.ano + ' acumulada até ' + MESES[mes - 1] + '. '
        + dinheiro(totais.valor_pago_ate_mes) + ' já foram pagos, de um orçamento de '
        + dinheiro(totais.valor_fixado_orcamento_bal_despesa) + '.')));

    raiz.append(aviso('info',
      'A ordenação padrão é pelo valor pago, que é o dinheiro que de fato saiu do caixa. '
      + 'Clique em qualquer linha para ver a abertura detalhada.'));

    const bloco = secao({});
    bloco.corpo.append(abas([
      {
        id: 'area',
        titulo: 'Por área',
        montar: (c) => c.append(visao(linhas, totais, dic, estado, {
          chave: 'codigo_funcao',
          rotulo: (codigo) => nomeFuncao(dic, codigo),
          icone: (grupo) => pictogramaFuncao(grupo.chave),
          nomeColuna: 'Função de governo',
          detalharPor: (l) => nomeSubfuncao(dic, l.codigo_subfuncao),
          nomeDetalhe: 'Subfunção',
        })),
      },
      {
        id: 'secretaria',
        titulo: 'Por secretaria',
        montar: (c) => c.append(visao(linhas, totais, dic, estado, {
          chave: 'codigo_orgao',
          rotulo: (codigo) => nomeOrgao(dic, codigo),
          nomeColuna: 'Órgão',
          detalharPor: (l) => nomeUnidade(dic, l.codigo_orgao, l.codigo_unidade_orcamentaria),
          nomeDetalhe: 'Unidade orçamentária',
        })),
      },
      {
        id: 'tipo',
        titulo: 'Por tipo de gasto',
        montar: (c) => c.append(visao(linhas, totais, dic, estado, {
          chave: 'codigo_elemento_despesa',
          rotulo: (codigo) => nomeElemento(dic, codigo),
          nomeColuna: 'Elemento de despesa',
          detalharPor: (l) => nomeOrgao(dic, l.codigo_orgao),
          nomeDetalhe: 'Órgão',
        })),
      },
      {
        id: 'acao',
        titulo: 'Por ação',
        montar: (c) => c.append(visao(linhas, totais, dic, estado, {
          chave: (l) => chaveAcao(l),
          rotulo: (chave, exemplo) => nomeAcao(dic, exemplo),
          nomeColuna: 'Projeto ou atividade',
          detalharPor: (l) => nomeElemento(dic, l.codigo_elemento_despesa),
          nomeDetalhe: 'Elemento de despesa',
        })),
      },
      {
        id: 'fonte',
        titulo: 'Por origem do recurso',
        montar: (c) => {
          c.append(aviso('info',
            'Fonte de recursos é a origem do dinheiro e diz se ele pode ser gasto livremente ou se '
            + 'está carimbado para uma finalidade, como educação ou saúde. A API do TCE devolve só o '
            + 'código; os nomes vêm da Tabela III do Manual do SIM.'));
          c.append(visao(linhas, totais, dic, estado, {
            chave: (l) => String(l.codigo_fonte ?? '').trim().slice(0, 3),
            rotulo: (codigo, exemplo) => grupoFonte(dic, exemplo.codigo_fonte),
            nomeColuna: 'Fonte de recursos',
            detalharPor: (l) => nomeFonte(dic, l.codigo_fonte),
            nomeDetalhe: 'Detalhamento da fonte',
          }));
        },
      },
    ]));
    raiz.append(bloco);

    raiz.append(carimbo({
      origem: balancete.origem, ts: balancete.ts,
      endpoints: ['balancetes_despesas_orcamentarias'],
    }));
  } catch (erro) {
    raiz.replaceChildren(erroNaTela(erro, () => estado.recarregar()));
  }
}

function visao(linhas, totais, dic, estado, config) {
  const grupos = ordenarPor(
    agrupar(linhas, config.chave, VALORES, config.rotulo),
    'valor_pago_ate_mes',
  );

  const colunas = [
    { campo: 'rotulo', rotulo: config.nomeColuna, tipo: 'texto' },
    { campo: 'valor_fixado_orcamento_bal_despesa', rotulo: 'Orçado', tipo: 'dinheiro' },
    { campo: 'valor_empenhado_ate_mes', rotulo: 'Empenhado', tipo: 'dinheiro' },
    { campo: 'valor_liquidado_ate_mes', rotulo: 'Liquidado', tipo: 'dinheiro' },
    { campo: 'valor_pago_ate_mes', rotulo: 'Pago', tipo: 'dinheiro' },
    {
      campo: 'participacao',
      rotulo: 'Fatia do pago',
      tipo: 'numero',
      formatar: (_, linha) => percentual(linha.valor_pago_ate_mes, totais.valor_pago_ate_mes),
    },
  ];

  const abrir = (grupo) => abrirDetalhe(grupo, dic, config, estado);

  return el('div', {},
    ranking(grupos.slice(0, 8), {
      campo: 'valor_pago_ate_mes',
      total: totais.valor_pago_ate_mes,
      icone: config.icone,
      aoClicar: abrir,
    }),
    el('h3', { class: 'sub-titulo', texto: 'Tabela completa' }),
    tabela(grupos, colunas, {
      ordenarPor: 'valor_pago_ate_mes',
      camposBusca: ['rotulo'],
      aoClicarLinha: abrir,
      nomeArquivo: 'crato-' + estado.ano + '-despesa-' + config.nomeColuna.toLowerCase().replace(/\s+/g, '-'),
    }));
}

function abrirDetalhe(grupo, dic, config, estado) {
  const detalhados = ordenarPor(
    agrupar(grupo.linhas, config.detalharPor, VALORES),
    'valor_pago_ate_mes',
  );
  const totalGrupo = somarVarios(grupo.linhas, VALORES);

  const conteudo = el('div', {},
    listaDetalhes([
      ['Orçado', dinheiro(totalGrupo.valor_fixado_orcamento_bal_despesa)],
      ['Empenhado', dinheiro(totalGrupo.valor_empenhado_ate_mes)],
      ['Liquidado', dinheiro(totalGrupo.valor_liquidado_ate_mes)],
      ['Pago', dinheiro(totalGrupo.valor_pago_ate_mes)],
      ['Dotações', String(grupo.quantidade)],
    ]),
    el('h3', { texto: 'Abertura por ' + config.nomeDetalhe.toLowerCase() }),
    tabela(detalhados, [
      { campo: 'chave', rotulo: config.nomeDetalhe, tipo: 'texto' },
      { campo: 'valor_empenhado_ate_mes', rotulo: 'Empenhado', tipo: 'dinheiro' },
      { campo: 'valor_liquidado_ate_mes', rotulo: 'Liquidado', tipo: 'dinheiro' },
      { campo: 'valor_pago_ate_mes', rotulo: 'Pago', tipo: 'dinheiro' },
    ], {
      ordenarPor: 'valor_pago_ate_mes',
      busca: false,
      porPagina: 20,
      nomeArquivo: 'crato-' + estado.ano + '-detalhe',
    }),
    botao('Ver quem recebeu esse dinheiro', () => estado.navegar('#/fornecedores'),
      { classe: 'botao botao-secundario' }));

  gaveta(grupo.rotulo, conteudo);
}
