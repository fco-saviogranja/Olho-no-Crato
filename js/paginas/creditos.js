// Créditos adicionais: o orçamento aprovado pela Câmara não é definitivo. Ao
// longo do ano ele é reforçado e remanejado por lei e por decreto. Esta página
// mostra quanto e para onde.

import { consultar } from '../api/tce.js';
import { dicionarios, nomeElemento, nomeFuncao, nomeOrgao, nomeSubfuncao } from '../api/auxiliares.js';
import { data, dinheiro, MESES, numero, percentual, texto } from '../api/formato.js';
import { agrupar, ordenarPor, porMes, somar, somarVarios } from '../dados/agregacoes.js';
import {
  abas, aviso, carimbo, carregando, cartao, el, erroNaTela, grade, ranking, secao, vazio,
} from '../ui/componentes.js';
import { colunas as graficoColunas } from '../ui/grafico.js';
import { tabela } from '../ui/tabela.js';

const CAMPOS = [
  'data_abertura_credito', 'codigo_orgao', 'codigo_funcao', 'codigo_subfuncao',
  'cd_elemento_despesa', 'codigo_fonte', 'numero_lei', 'numero_decreto',
  'tipo_abertura_credito', 'valor_credito_super', 'valor_credito_excesso',
  'valor_credito_operacao', 'valor_credito_anulacao', 'data_referencia_doc',
];

const VALORES = ['valor_credito_super', 'valor_credito_excesso', 'valor_credito_operacao',
  'valor_credito_anulacao'];

const CAMPOS_REMANEJAMENTO = [
  'data_alteracao_orcamento', 'codigo_orgao', 'codigo_funcao', 'codigo_elemento_despesa',
  'numero_lei_alteracao', 'tipo_alteracao', 'valor_realocado', 'data_referencia_doc',
];

export const titulo = 'Créditos extras';

export async function montar(raiz, estado) {
  raiz.append(carregando('Buscando créditos adicionais de ' + estado.ano + '...'));

  try {
    const [creditos, dic] = await Promise.all([
      consultar('/abertura_creditos_adicionais',
        { ano: estado.ano, inicio: estado.ano + '-01-01', fim: estado.ano + '-12-31' },
        { tudo: true, select: CAMPOS }),
      dicionarios(estado.ano),
    ]);

    const linhas = creditos.dados.map((l) => Object.assign({}, l, {
      valor_total: VALORES.reduce((a, c) => a + (Number(l[c]) || 0), 0),
    }));

    raiz.replaceChildren();
    raiz.append(el('div', { class: 'topo-pagina' },
      el('h1', { texto: 'Créditos adicionais' }),
      el('p', { class: 'linha-fina' },
        'Reforços de orçamento abertos em ' + estado.ano + '. '
        + 'É aqui que se vê quanto o orçamento aprovado mudou durante o ano.')));

    raiz.append(aviso('info',
      'Crédito adicional é dinheiro acrescentado a uma dotação depois que a Lei Orçamentária foi '
      + 'aprovada. Ele precisa de uma origem: sobra de arrecadação, operação de crédito, superávit '
      + 'do ano anterior ou anulação de outra dotação, que é a forma mais comum.'));

    if (!linhas.length) {
      raiz.append(vazio('Nenhum crédito adicional em ' + estado.ano,
        'O TCE não devolveu aberturas de crédito do Crato neste exercício.'));
      return;
    }

    const totais = somarVarios(linhas, VALORES);
    const total = somar(linhas, 'valor_total');

    raiz.append(grade(
      cartao({
        titulo: 'Total dos créditos', valor: total, tom: 'empenhado',
        detalhe: numero(linhas.length) + ' aberturas no exercício',
      }),
      cartao({
        titulo: 'Por anulação de dotação', valor: totais.valor_credito_anulacao, tom: 'previsto',
        detalhe: percentual(totais.valor_credito_anulacao, total) + ' do total',
        ajuda: 'Tira dinheiro de uma despesa para reforçar outra. Não aumenta o orçamento total.',
      }),
      cartao({
        titulo: 'Por excesso de arrecadação', valor: totais.valor_credito_excesso, tom: 'receita',
        detalhe: percentual(totais.valor_credito_excesso, total) + ' do total',
        ajuda: 'Usa a receita que veio acima do previsto na lei.',
      }),
      cartao({
        titulo: 'Por superávit e operação de crédito',
        valor: totais.valor_credito_super + totais.valor_credito_operacao, tom: 'liquidado',
        detalhe: percentual(totais.valor_credito_super + totais.valor_credito_operacao, total) + ' do total',
        ajuda: 'Sobra financeira do exercício anterior e empréstimos contratados.',
      }),
    ));

    const bloco = secao({});
    bloco.corpo.append(abas([
      { id: 'destino', titulo: 'Para onde foram', montar: (c) => c.append(porDestino(linhas, total, dic, estado)) },
      { id: 'normas', titulo: 'Por lei e decreto', montar: (c) => c.append(porNorma(linhas, total, estado)) },
      { id: 'mes', titulo: 'Mês a mês', montar: (c) => c.append(mensal(linhas, estado)) },
      { id: 'lista', titulo: 'Lista completa', montar: (c) => c.append(listaCompleta(linhas, dic, estado)) },
      { id: 'remanejamento', titulo: 'Remanejamentos', montar: (c) => montarRemanejamentos(c, estado, dic) },
    ]));
    raiz.append(bloco);

    raiz.append(carimbo({
      origem: creditos.origem, ts: creditos.ts, endpoints: ['abertura_creditos_adicionais'],
    }));
  } catch (erro) {
    raiz.replaceChildren(erroNaTela(erro, () => estado.recarregar()));
  }
}

function porDestino(linhas, total, dic, estado) {
  const porOrgao = ordenarPor(
    agrupar(linhas, 'codigo_orgao', ['valor_total'], (c) => nomeOrgao(dic, c)), 'valor_total');
  const porFuncao = ordenarPor(
    agrupar(linhas, 'codigo_funcao', ['valor_total'], (c) => nomeFuncao(dic, c)), 'valor_total');

  return el('div', {},
    el('h3', { texto: 'Secretarias que mais receberam reforço' }),
    ranking(porOrgao.slice(0, 10), { campo: 'valor_total', total }),
    el('h3', { texto: 'Áreas reforçadas' }),
    ranking(porFuncao.slice(0, 10), { campo: 'valor_total', total }));
}

function porNorma(linhas, total, estado) {
  const grupos = ordenarPor(
    agrupar(linhas, (l) => (texto(l.numero_decreto) || 'sem decreto') + ' · lei ' + (texto(l.numero_lei) || 'não informada'),
      ['valor_total']),
    'valor_total',
  );

  return el('div', {},
    aviso('info',
      'A lei autoriza a abertura do crédito e fixa um limite; o decreto do prefeito é o ato que '
      + 'efetivamente abre. Comparar os dois mostra quanto da autorização foi usada.'),
    tabela(grupos, [
      { campo: 'rotulo', rotulo: 'Decreto e lei', tipo: 'texto' },
      { campo: 'quantidade', rotulo: 'Aberturas', tipo: 'numero' },
      { campo: 'valor_total', rotulo: 'Valor', tipo: 'dinheiro' },
      {
        campo: 'fatia', rotulo: 'Fatia', tipo: 'numero',
        formatar: (_, l) => percentual(l.valor_total, total),
      },
    ], {
      ordenarPor: 'valor_total',
      camposBusca: ['rotulo'],
      nomeArquivo: 'crato-' + estado.ano + '-creditos-normas',
    }));
}

function mensal(linhas, estado) {
  const serie = porMes(linhas, 'valor_total', estado.ano);
  return el('div', {},
    graficoColunas(serie, MESES.map((m) => m.slice(0, 3)), {
      descricao: 'Créditos adicionais abertos por mês', cor: 1,
    }),
    el('p', { class: 'nota' },
      'Concentração de créditos no fim do ano costuma indicar ajuste do orçamento à realidade '
      + 'da execução, e não planejamento novo.'));
}

function listaCompleta(linhas, dic, estado) {
  return tabela(linhas, [
    { campo: 'data_abertura_credito', rotulo: 'Data', formatar: (v) => data(v) },
    { campo: 'numero_decreto', rotulo: 'Decreto', tipo: 'texto' },
    { campo: 'numero_lei', rotulo: 'Lei', tipo: 'texto' },
    { campo: 'codigo_orgao', rotulo: 'Secretaria', tipo: 'texto', formatar: (v) => nomeOrgao(dic, v) },
    { campo: 'codigo_subfuncao', rotulo: 'Subfunção', tipo: 'texto', formatar: (v) => nomeSubfuncao(dic, v) },
    {
      campo: 'cd_elemento_despesa', rotulo: 'Tipo de gasto', tipo: 'texto',
      formatar: (v) => nomeElemento(dic, v),
    },
    { campo: 'valor_total', rotulo: 'Valor', tipo: 'dinheiro' },
  ], {
    ordenarPor: 'valor_total',
    camposBusca: ['numero_decreto', 'numero_lei'],
    nomeArquivo: 'crato-' + estado.ano + '-creditos',
  });
}

async function montarRemanejamentos(alvo, estado, dic) {
  alvo.append(carregando('Buscando remanejamentos e transposições...'));
  try {
    const { dados, origem, ts } = await consultar(
      '/remanejamentos_transposicoes_transferencias_dotacoes',
      { ano: estado.ano }, { tudo: true, select: CAMPOS_REMANEJAMENTO });

    alvo.replaceChildren();
    if (!dados.length) {
      alvo.append(vazio('Nenhum remanejamento registrado',
        'Remanejar é mover dotação de um lugar para outro dentro do orçamento. '
        + 'O TCE não devolveu registros para ' + estado.ano + '.'));
      return;
    }

    alvo.append(aviso('info',
      'Remanejamento, transposição e transferência são movimentações de dotação entre órgãos, '
      + 'programas ou categorias, sempre com autorização legislativa.'));
    alvo.append(tabela(dados, [
      { campo: 'data_alteracao_orcamento', rotulo: 'Data', formatar: (v) => data(v) },
      { campo: 'numero_lei_alteracao', rotulo: 'Lei', tipo: 'texto' },
      { campo: 'codigo_orgao', rotulo: 'Secretaria', tipo: 'texto', formatar: (v) => nomeOrgao(dic, v) },
      { campo: 'codigo_funcao', rotulo: 'Área', tipo: 'texto', formatar: (v) => nomeFuncao(dic, v) },
      { campo: 'valor_realocado', rotulo: 'Valor realocado', tipo: 'dinheiro' },
    ], {
      ordenarPor: 'valor_realocado',
      nomeArquivo: 'crato-' + estado.ano + '-remanejamentos',
    }));
    alvo.append(carimbo({
      origem, ts, endpoints: ['remanejamentos_transposicoes_transferencias_dotacoes'],
    }));
  } catch (erro) {
    alvo.replaceChildren(erroNaTela(erro, () => montarRemanejamentos(alvo, estado, dic)));
  }
}
