// Panorama do exercício: quanto o Crato previu arrecadar, quanto arrecadou,
// quanto planejou gastar e em que pé está a execução da despesa.

import { consultar, emLote, referencia, ultimoMesComDados, anoAtual } from '../api/tce.js';
import { dicionarios, nomeFuncao, nomeOrgao } from '../api/auxiliares.js';
import { data, dinheiro, MESES, numero, percentual, texto } from '../api/formato.js';
import { agrupar, comOutros, ordenarPor, somarVarios } from '../dados/agregacoes.js';
import {
  aviso, botao, carimbo, carregando, cartao, el, erroNaTela, grade, ranking, secao,
} from '../ui/componentes.js';
import { barraExecucao, linhas, rosca } from '../ui/grafico.js';
import { pictogramaFuncao } from '../ui/pictogramas.js';

const CAMPOS_DESPESA = [
  'codigo_orgao', 'codigo_funcao', 'valor_fixado_orcamento_bal_despesa',
  'valor_empenhado_ate_mes', 'valor_liquidado_ate_mes', 'valor_pago_ate_mes',
];

const CAMPOS_MES = [
  'valor_empenhado_no_mes', 'valor_liquidado_no_mes', 'valor_pago_no_mes',
];

export const titulo = 'Panorama';
export const descricao = 'O ano inteiro em uma tela: o que entrou, o que foi planejado e o que já foi gasto.';

export async function montar(raiz, estado) {
  raiz.append(carregando('Consultando o balancete do exercício ' + estado.ano + '...'));

  try {
    const mes = await ultimoMesComDados(estado.ano);
    if (!mes) {
      raiz.replaceChildren(semDados(estado));
      return;
    }

    const ref = referencia(estado.ano, mes);
    const [despesa, receita, loa, dic] = await Promise.all([
      consultar('/balancetes_despesas_orcamentarias', { ano: estado.ano, mes: ref },
        { tudo: true, select: CAMPOS_DESPESA }),
      consultar('/balancetes_receitas_orcamentarias', { ano: estado.ano, mes: ref },
        { tudo: true, select: ['valor_previsto_orcamento', 'valor_arrecadacao_ate_mes'] }),
      consultar('/dados_orcamentos', { ano: estado.ano }).catch(() => ({ dados: [] })),
      dicionarios(estado.ano),
    ]);

    raiz.replaceChildren();
    raiz.append(cabecalho(estado, mes, loa.dados[0]));

    const d = somarVarios(despesa.dados, CAMPOS_DESPESA.slice(2));
    const r = somarVarios(receita.dados, ['valor_previsto_orcamento', 'valor_arrecadacao_ate_mes']);

    raiz.append(cartoes(d, r));
    raiz.append(execucao(d));
    raiz.append(porArea(despesa.dados, dic));
    raiz.append(porOrgao(despesa.dados, dic, estado));
    raiz.append(evolucao(estado, mes));
    raiz.append(carimbo({
      origem: despesa.origem,
      ts: despesa.ts,
      endpoints: ['balancetes_despesas_orcamentarias', 'balancetes_receitas_orcamentarias'],
    }));
  } catch (erro) {
    raiz.replaceChildren(erroNaTela(erro, () => estado.recarregar()));
  }
}

function semDados(estado) {
  return el('div', {},
    aviso('alerta', 'O TCE ainda não tem balancete publicado para o exercício de ' + estado.ano
      + ' no Crato. Escolha um ano anterior.'),
    botao('Ver ' + (estado.ano - 1), () => estado.definirAno(estado.ano - 1)));
}

function cabecalho(estado, mes, loa) {
  const parcial = estado.ano >= anoAtual() || mes < 12;
  const caixa = el('div', { class: 'topo-pagina' },
    el('div', {},
      el('h1', { texto: 'Crato em ' + estado.ano }),
      el('p', { class: 'linha-fina' },
        parcial
          ? 'Dados publicados até ' + MESES[mes - 1] + '. Os meses seguintes ainda não foram enviados ao TCE.'
          : 'Exercício encerrado, com os doze meses publicados.')));

  if (loa) {
    const partes = [];
    if (texto(loa.nu_lei_orcamento)) partes.push('Lei Orçamentária ' + texto(loa.nu_lei_orcamento));
    if (loa.data_publicacao_loa) partes.push('publicada em ' + data(loa.data_publicacao_loa));
    if (partes.length) caixa.append(el('p', { class: 'etiqueta-loa', texto: partes.join(', ') }));
  }
  return caixa;
}

function cartoes(d, r) {
  const arrecadado = r.valor_arrecadacao_ate_mes;
  const previsto = r.valor_previsto_orcamento;
  const sobra = arrecadado - d.valor_pago_ate_mes;

  return grade(
    cartao({
      titulo: 'Receita arrecadada', valor: arrecadado, tom: 'receita',
      detalhe: previsto ? percentual(arrecadado, previsto) + ' do previsto (' + dinheiro(previsto) + ')' : null,
      ajuda: 'Dinheiro que efetivamente entrou no caixa da prefeitura no período.',
    }),
    cartao({
      titulo: 'Orçamento da despesa', valor: d.valor_fixado_orcamento_bal_despesa, tom: 'previsto',
      detalhe: 'Teto autorizado para gastar',
      ajuda: 'Valor fixado na Lei Orçamentária, já com créditos adicionais e anulações do período.',
    }),
    cartao({
      titulo: 'Empenhado', valor: d.valor_empenhado_ate_mes, tom: 'empenhado',
      detalhe: percentual(d.valor_empenhado_ate_mes, d.valor_fixado_orcamento_bal_despesa) + ' do orçamento',
      ajuda: 'A prefeitura reservou o dinheiro e assumiu o compromisso com o fornecedor.',
    }),
    cartao({
      titulo: 'Liquidado', valor: d.valor_liquidado_ate_mes, tom: 'liquidado',
      detalhe: percentual(d.valor_liquidado_ate_mes, d.valor_empenhado_ate_mes) + ' do empenhado',
      ajuda: 'O produto foi entregue ou o serviço prestado, e a prefeitura conferiu.',
    }),
    cartao({
      titulo: 'Pago', valor: d.valor_pago_ate_mes, tom: 'pago',
      detalhe: percentual(d.valor_pago_ate_mes, d.valor_empenhado_ate_mes) + ' do empenhado',
      ajuda: 'O dinheiro saiu do caixa e chegou a quem forneceu.',
    }),
    cartao({
      titulo: 'Arrecadado menos pago', valor: sobra, tom: sobra >= 0 ? 'neutro' : 'alerta',
      detalhe: sobra >= 0 ? 'Entrou mais do que saiu no período' : 'Saiu mais do que entrou no período',
      ajuda: 'Comparação simples entre a receita arrecadada e a despesa paga. Não é o resultado contábil do exercício.',
    }),
  );
}

function execucao(d) {
  const bloco = secao({
    titulo: 'Como o orçamento virou gasto',
    descricao: 'Todo gasto público passa por três etapas. Só a última tira dinheiro do caixa.',
  });
  bloco.corpo.append(barraExecucao([
    { nome: 'Empenhado', valor: d.valor_empenhado_ate_mes },
    { nome: 'Liquidado', valor: d.valor_liquidado_ate_mes },
    { nome: 'Pago', valor: d.valor_pago_ate_mes },
  ], d.valor_fixado_orcamento_bal_despesa));
  bloco.corpo.append(el('p', { class: 'nota' },
    'Empenhar é reservar. Liquidar é confirmar que a entrega aconteceu. Pagar é transferir o dinheiro. ',
    el('a', { href: '#/glossario', texto: 'Ver o glossário completo' })));
  return bloco;
}

function porArea(linhasDespesa, dic) {
  const grupos = agrupar(linhasDespesa, 'codigo_funcao', ['valor_pago_ate_mes'],
    (codigo) => nomeFuncao(dic, codigo));
  const itens = comOutros(grupos, 'valor_pago_ate_mes', 7).map((g) => ({
    rotulo: g.rotulo, valor: g.valor_pago_ate_mes, codigo: g.chave,
  }));
  const total = itens.reduce((a, i) => a + i.valor, 0);

  const bloco = secao({
    titulo: 'Em que áreas o dinheiro foi gasto',
    descricao: 'Divisão por função de governo, com base no que já foi efetivamente pago.',
  });
  bloco.corpo.append(rosca(itens, {
    icone: (item) => pictogramaFuncao(item.codigo),
    descricao: 'Distribuição do valor pago por função de governo',
    centro: dinheiro(total).replace(/,\d\d$/, ''),
    centroDetalhe: 'pago no período',
  }));
  return bloco;
}

function porOrgao(linhasDespesa, dic, estado) {
  const grupos = ordenarPor(
    agrupar(linhasDespesa, 'codigo_orgao', ['valor_pago_ate_mes', 'valor_empenhado_ate_mes'],
      (codigo) => nomeOrgao(dic, codigo)),
    'valor_pago_ate_mes',
  ).slice(0, 10);

  const bloco = secao({
    titulo: 'Quais secretarias mais gastaram',
    descricao: 'Os dez órgãos com maior valor pago no período.',
    acoes: botao('Ver todos', () => estado.navegar('#/despesas'), { classe: 'botao botao-secundario' }),
  });
  bloco.corpo.append(ranking(grupos, {
    campo: 'valor_pago_ate_mes',
    aoClicar: () => estado.navegar('#/despesas'),
  }));
  return bloco;
}

/** Série mensal: carrega um balancete por mês, em segundo plano. */
function evolucao(estado, ultimoMes) {
  const bloco = secao({
    titulo: 'Mês a mês',
    descricao: 'Quanto foi empenhado, liquidado e pago em cada mês do exercício.',
  });
  const alvo = el('div', {});
  bloco.corpo.append(alvo);

  const carregar = async () => {
    alvo.replaceChildren(carregando('Montando a série mensal (' + ultimoMes + ' consultas)...'));
    try {
      const meses = Array.from({ length: ultimoMes }, (_, i) => i + 1);
      const resultados = await emLote(meses, async (m) => {
        const { dados } = await consultar('/balancetes_despesas_orcamentarias',
          { ano: estado.ano, mes: referencia(estado.ano, m) },
          { tudo: true, select: CAMPOS_MES });
        return somarVarios(dados, CAMPOS_MES);
      }, 4);

      alvo.replaceChildren(linhas([
        { nome: 'Empenhado', valores: resultados.map((r) => r.valor_empenhado_no_mes) },
        { nome: 'Liquidado', valores: resultados.map((r) => r.valor_liquidado_no_mes) },
        { nome: 'Pago', valores: resultados.map((r) => r.valor_pago_no_mes) },
      ], meses.map((m) => MESES[m - 1].slice(0, 3)), {
        descricao: 'Evolução mensal da execução da despesa',
      }));

      const maiorMes = resultados
        .map((r, i) => ({ mes: i, valor: r.valor_pago_no_mes }))
        .sort((a, b) => b.valor - a.valor)[0];
      if (maiorMes && maiorMes.valor > 0) {
        alvo.append(el('p', { class: 'nota' },
          'O mês de maior pagamento foi ' + MESES[maiorMes.mes] + ', com ' + dinheiro(maiorMes.valor) + '.'));
      }
    } catch (erro) {
      alvo.replaceChildren(erroNaTela(erro, carregar));
    }
  };

  alvo.append(botao('Carregar a série mensal', carregar, { classe: 'botao botao-secundario' }));
  alvo.append(el('p', { class: 'nota', texto: 'São ' + ultimoMes + ' consultas ao TCE, uma por mês.' }));
  return bloco;
}

export { numero };
