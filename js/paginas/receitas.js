// De onde vem o dinheiro: receita prevista e arrecadada por rubrica e por
// origem, mais os talões que comprovam cada entrada.

import { consultar, emLote, referencia, ultimoMesComDados } from '../api/tce.js';
import * as banco from '../api/banco.js';
import { dicionarios, grupoFonte, nomeOrgao, nomeRubrica, rubricas } from '../api/auxiliares.js';
import { capitalizar, data, dinheiro, MESES, numero, percentual, texto, truncar } from '../api/formato.js';
import { agrupar, comOutros, ordenarPor, somarVarios } from '../dados/agregacoes.js';
import {
  abas, aviso, carimbo, carregando, cartao, el, erroNaTela, grade, ranking, saidas, secao, vazio,
} from '../ui/componentes.js';
import { colunas as graficoColunas, rosca } from '../ui/grafico.js';
import { tabela } from '../ui/tabela.js';

const CAMPOS = [
  'codigo_orgao', 'codigo_rubrica', 'codigo_fonte', 'valor_previsto_orcamento',
  'valor_arrecadacao_ate_mes', 'valor_anulacoes_ate_mes',
];

const VALORES = ['valor_previsto_orcamento', 'valor_arrecadacao_ate_mes', 'valor_anulacoes_ate_mes'];

const SEM_BALANCETE = [
  { href: '#/fornecedores', rotulo: 'Quem recebe o dinheiro', nota: 'lê as notas de empenho' },
  { href: '#/contratos', rotulo: 'Contratos e licitações' },
  { href: '#/obras', rotulo: 'Obras e serviços de engenharia' },
  { href: '#/patrimonio', rotulo: 'Bens do município' },
  { href: '#/creditos', rotulo: 'Créditos extras abertos no ano' },
];

export const titulo = 'De onde vem';

/**
 * A rubrica de receita segue a classificação da natureza da receita. O primeiro
 * dígito separa receitas correntes de receitas de capital, e o segundo dá a
 * origem. Só os dois primeiros níveis são estáveis o bastante para rotular.
 */
const CATEGORIAS = {
  1: 'Receitas correntes',
  2: 'Receitas de capital',
  7: 'Receitas correntes intraorçamentárias',
  8: 'Receitas de capital intraorçamentárias',
  9: 'Deduções da receita',
};

export async function montar(raiz, estado) {
  raiz.append(carregando('Consultando a receita de ' + estado.ano + '...'));

  try {
    const mes = await ultimoMesComDados(estado.ano,
      { path: '/balancetes_receitas_orcamentarias', campo: 'codigo_orgao' });
    if (!mes) {
      raiz.replaceChildren(aviso('alerta',
        'Ainda não há balancete publicado para ' + estado.ano + '. Escolha outro exercício.'));
      return;
    }

    const [balancete, dic, mapaRubricas] = await Promise.all([
      consultar('/balancetes_receitas_orcamentarias',
        { ano: estado.ano, mes: referencia(estado.ano, mes) },
        { tudo: true, select: CAMPOS }),
      dicionarios(estado.ano),
      rubricas(estado.ano).catch(() => new Map()),
    ]);
    dic.rubricas = mapaRubricas;

    const linhas = balancete.dados;
    const totais = somarVarios(linhas, VALORES);

    raiz.replaceChildren();
    raiz.append(el('div', { class: 'topo-pagina' },
      el('h1', { texto: 'De onde vem o dinheiro' }),
      el('p', { class: 'linha-fina' },
        'Receita de ' + estado.ano + ' acumulada até ' + MESES[mes - 1] + '.')));

    if (!linhas.length) {
      raiz.append(vazio('Sem receita publicada', 'O TCE não devolveu balancete de receita.'));
      return;
    }

      montarCorpo(raiz, linhas, totais, dic, estado, mes);

    raiz.append(carimbo({
      origem: balancete.origem, ts: balancete.ts,
      endpoints: ['balancetes_receitas_orcamentarias'],
    }));
  } catch (erro) {
    if (erro && erro.ausente) {
      const doBanco = await pelaCopia(raiz, estado, erro);
      if (doBanco) return;
    }
    raiz.replaceChildren(erroNaTela(erro, () => estado.recarregar(),
      erro && erro.ausente ? saidas(SEM_BALANCETE) : null));
  }
}

/**
 * Os cartões e as seis abas da receita. Em função própria porque as montam
 * tanto a rota normal, com o dado do TCE, quanto a queda para o banco de apoio.
 */
function montarCorpo(alvo, linhas, totais, dic, estado, mes) {
    alvo.append(grade(
    cartao({
      titulo: 'Previsto para o ano', valor: totais.valor_previsto_orcamento, tom: 'previsto',
      detalhe: 'Estimativa da Lei Orçamentária',
    }),
    cartao({
      titulo: 'Arrecadado', valor: totais.valor_arrecadacao_ate_mes, tom: 'receita',
      detalhe: percentual(totais.valor_arrecadacao_ate_mes, totais.valor_previsto_orcamento)
        + ' do previsto',
    }),
    cartao({
      titulo: 'Anulações', valor: totais.valor_anulacoes_ate_mes, tom: 'neutro',
      detalhe: 'Estornos de receita no período',
      ajuda: 'Lançamentos cancelados, por exemplo por erro de recolhimento.',
    }),
    ));

    const bloco = secao({});
    bloco.corpo.append(abas([
    { id: 'categoria', titulo: 'Por tipo de receita', montar: (c) => c.append(porCategoria(linhas, totais, dic)) },
    { id: 'rubrica', titulo: 'Por rubrica', montar: (c) => c.append(porRubrica(linhas, totais, dic, estado)) },
    { id: 'fonte', titulo: 'Por destinação', montar: (c) => c.append(porFonte(linhas, totais, dic, estado)) },
    { id: 'orgao', titulo: 'Por órgão', montar: (c) => c.append(porOrgao(linhas, totais, dic, estado)) },
    { id: 'mes', titulo: 'Mês a mês', montar: (c) => montarMensal(c, estado, mes) },
    { id: 'taloes', titulo: 'Talões de receita', montar: (c) => montarTaloes(c, estado, mes) },
    ]));
    alvo.append(bloco);
}

/**
 * Monta a página a partir do banco de apoio quando o TCE não responde. Como a
 * carga guarda o balancete com os mesmos nomes de coluna do TCE, as agregações
 * valem sobre a cópia sem mudar nada.
 */
async function pelaCopia(raiz, estado, erro) {
  raiz.replaceChildren(carregando('O TCE não respondeu. Procurando no banco de apoio...'));
  if (!(await banco.disponivel())) return false;

  const exercicio = estado.ano * 100;
  const ultimo = await banco.selecionar('ultimo_balancete_receita',
    { exercicio_orcamento: 'eq.' + exercicio });
  const ref = ultimo && ultimo[0] && ultimo[0].mes;
  if (!ref) return false;

  const [linhas, dic, mapaRubricas] = await Promise.all([
    banco.selecionarTudo('balancete_receita', {
      exercicio_orcamento: 'eq.' + exercicio,
      data_referencia_doc: 'eq.' + ref,
    }, { campos: CAMPOS.join(',') }),
    dicionarios(estado.ano).catch(() => ({})),
    rubricas(estado.ano).catch(() => new Map()),
  ]);
  if (!linhas || !linhas.length) return false;
  dic.rubricas = mapaRubricas;

  const mes = Number(String(ref).slice(4, 6)) || 12;
  const totais = somarVarios(linhas, VALORES);

  raiz.replaceChildren();
  raiz.append(el('div', { class: 'topo-pagina' },
    el('h1', { texto: 'De onde vem o dinheiro' }),
    el('p', { class: 'linha-fina' },
      'Receita de ' + estado.ano + ' acumulada até ' + MESES[mes - 1] + '.')));

  montarCorpo(raiz, linhas, totais, dic, estado, mes);

  const ultimaCarga = await banco.ultimaCarga().catch(() => null);
  raiz.append(carimbo({
    origem: 'banco',
    ts: ultimaCarga && ultimaCarga.concluida_em ? new Date(ultimaCarga.concluida_em).getTime() : null,
    endpoints: ['balancete_receita'],
  }));
  return true;
}

function categoria(codigo) {
  const primeiro = Number(String(codigo || '').trim()[0]);
  return CATEGORIAS[primeiro] || 'Outras receitas';
}

function porCategoria(linhas, totais, dic) {
  const grupos = ordenarPor(
    agrupar(linhas, (l) => categoria(l.codigo_rubrica), VALORES),
    'valor_arrecadacao_ate_mes',
  );
  const itens = grupos.map((g) => ({ rotulo: g.chave, valor: g.valor_arrecadacao_ate_mes }));

  return el('div', {},
    rosca(itens, {
      descricao: 'Receita arrecadada por categoria econômica',
      centro: dinheiro(totais.valor_arrecadacao_ate_mes).replace(/,\d\d$/, ''),
      centroDetalhe: 'arrecadado',
    }),
    el('p', { class: 'nota' },
      'Receita corrente é o dinheiro do dia a dia: impostos, transferências da União e do Estado, '
      + 'taxas. Receita de capital vem de empréstimos, venda de bens e convênios de investimento.'));
}

function porRubrica(linhas, totais, dic, estado) {
  const grupos = ordenarPor(
    agrupar(linhas, 'codigo_rubrica', VALORES, (codigo) => nomeRubrica(dic, codigo)),
    'valor_arrecadacao_ate_mes',
  );

  return el('div', {},
    ranking(grupos.slice(0, 10), {
      campo: 'valor_arrecadacao_ate_mes', total: totais.valor_arrecadacao_ate_mes,
    }),
    el('h3', { texto: 'Todas as rubricas' }),
    tabela(grupos, [
      { campo: 'rotulo', rotulo: 'Rubrica', tipo: 'texto', formatar: (v) => truncar(v, 90) },
      { campo: 'chave', rotulo: 'Código', tipo: 'texto' },
      { campo: 'valor_previsto_orcamento', rotulo: 'Previsto', tipo: 'dinheiro' },
      { campo: 'valor_arrecadacao_ate_mes', rotulo: 'Arrecadado', tipo: 'dinheiro' },
      {
        campo: 'execucao', rotulo: 'Realizado', tipo: 'numero',
        formatar: (_, l) => percentual(l.valor_arrecadacao_ate_mes, l.valor_previsto_orcamento),
      },
    ], {
      ordenarPor: 'valor_arrecadacao_ate_mes',
      camposBusca: ['rotulo', 'chave'],
      nomeArquivo: 'crato-' + estado.ano + '-receita-rubricas',
    }));
}

function porFonte(linhas, totais, dic, estado) {
  const grupos = ordenarPor(
    agrupar(linhas, (l) => String(l.codigo_fonte ?? '').trim().slice(0, 3), VALORES,
      (codigo, exemplo) => grupoFonte(dic, exemplo.codigo_fonte)),
    'valor_arrecadacao_ate_mes',
  );

  return el('div', {},
    aviso('info',
      'A destinação diz para que o dinheiro pode ser usado. Recurso vinculado só pode ser gasto '
      + 'na finalidade indicada, como FUNDEB na educação e transferências do SUS na saúde.'),
    ranking(grupos, {
      campo: 'valor_arrecadacao_ate_mes', total: totais.valor_arrecadacao_ate_mes,
    }));
}

function porOrgao(linhas, totais, dic, estado) {
  const grupos = ordenarPor(
    agrupar(linhas, 'codigo_orgao', VALORES, (codigo) => nomeOrgao(dic, codigo)),
    'valor_arrecadacao_ate_mes',
  );
  return ranking(grupos, {
    campo: 'valor_arrecadacao_ate_mes', total: totais.valor_arrecadacao_ate_mes,
  });
}

async function montarMensal(alvo, estado, ultimoMes) {
  alvo.append(carregando('Somando a arrecadação de cada mês...'));
  try {
    const meses = Array.from({ length: ultimoMes }, (_, i) => i + 1);
    const valores = await emLote(meses, async (m) => {
      const { dados } = await consultar('/balancetes_receitas_orcamentarias',
        { ano: estado.ano, mes: referencia(estado.ano, m) },
        { tudo: true, select: ['valor_arrecadacao_no_mes'] });
      return dados.reduce((a, x) => a + (Number(x.valor_arrecadacao_no_mes) || 0), 0);
    }, 4);

    alvo.replaceChildren(
      graficoColunas(valores, meses.map((m) => MESES[m - 1].slice(0, 3)), {
        descricao: 'Arrecadação mês a mês', cor: 5,
      }),
      el('p', { class: 'nota', texto: 'Total no período: ' + dinheiro(valores.reduce((a, v) => a + v, 0)) }),
    );
  } catch (erro) {
    alvo.replaceChildren(erroNaTela(erro, () => montarMensal(alvo, estado, ultimoMes)));
  }
}

async function montarTaloes(alvo, estado, ultimoMes) {
  const mesEscolhido = Math.min(ultimoMes, 1);
  alvo.append(carregando('Buscando talões de receita...'));
  try {
    const { dados, origem, ts } = await consultar('/taloes_receitas_orcamentarias',
      { ano: estado.ano, mes: referencia(estado.ano, mesEscolhido || 1) }, {
        tudo: true,
        select: ['numero_talao_receita', 'data_talao_receita', 'valor_receita', 'historico_receita',
          'nome_razao_contribuinte', 'codigo_rubrica'],
      });

    alvo.replaceChildren();
    alvo.append(aviso('info',
      'O talão é o documento que comprova cada entrada de dinheiro no caixa. Esta aba mostra '
      + MESES[(mesEscolhido || 1) - 1] + ' de ' + estado.ano
      + '; os demais meses estão em Dados brutos, no endpoint taloes_receitas_orcamentarias.'));

    if (!dados.length) {
      alvo.append(vazio('Sem talões neste mês', 'O TCE não devolveu talões para o período.'));
      return;
    }

    alvo.append(tabela(dados, [
      { campo: 'data_talao_receita', rotulo: 'Data', formatar: (v) => data(v) },
      { campo: 'numero_talao_receita', rotulo: 'Talão', tipo: 'texto' },
      {
        campo: 'nome_razao_contribuinte', rotulo: 'Contribuinte', tipo: 'texto',
        formatar: (v) => capitalizar(v) || 'não informado',
      },
      { campo: 'historico_receita', rotulo: 'Histórico', tipo: 'texto', formatar: (v) => truncar(v, 80) },
      { campo: 'valor_receita', rotulo: 'Valor', tipo: 'dinheiro' },
    ], {
      ordenarPor: 'valor_receita',
      camposBusca: ['nome_razao_contribuinte', 'historico_receita'],
      nomeArquivo: 'crato-' + estado.ano + '-taloes',
    }));
    alvo.append(carimbo({ origem, ts, endpoints: ['taloes_receitas_orcamentarias'] }));
  } catch (erro) {
    alvo.replaceChildren(erroNaTela(erro, () => montarTaloes(alvo, estado, ultimoMes)));
  }
}

export { numero, texto };
