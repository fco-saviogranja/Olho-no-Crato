// Comparação entre exercícios.
//
// A API do TCE responde um exercício por vez, então colocar nove anos lado a
// lado exigiria dezenas de consultas no navegador. Por isso esta página lê os
// totais já somados do banco de apoio.

import * as banco from '../api/banco.js';
import { funcoes, nomeFuncao } from '../api/auxiliares.js';
import { numero, percentual } from '../api/formato.js';
import { ordenarPor } from '../dados/agregacoes.js';
import {
  abas, aviso, carregando, cartao, el, grade, secao, vazio,
} from '../ui/componentes.js';
import { linhas as graficoLinhas } from '../ui/grafico.js';
import { tabela } from '../ui/tabela.js';

export const titulo = 'Ano a ano';

export async function montar(raiz, estado) {
  raiz.append(el('div', { class: 'topo-pagina' },
    el('h1', { texto: 'Comparação entre exercícios' }),
    el('p', { class: 'linha-fina' },
      'Como a receita e a despesa do Crato evoluíram ao longo dos exercícios, e quais valores já '
      + 'informados ao TCE foram alterados depois.')));

  const espera = carregando('Verificando o banco de apoio...');
  raiz.append(espera);
  const temBanco = await banco.disponivel();
  espera.remove();

  if (!temBanco) {
    raiz.append(aviso('alerta', banco.estado() === 'ausente'
      ? 'Esta página depende do banco de apoio, que ainda não foi configurado. As demais páginas '
        + 'funcionam normalmente, um exercício por vez, consultando o TCE ao vivo.'
      : 'O banco de apoio não respondeu agora. As demais páginas continuam funcionando, um '
        + 'exercício por vez, consultando o TCE ao vivo.'));
    raiz.append(el('p', {},
      'Para ver um exercício isolado, use o ', el('a', { href: '#/panorama', texto: 'Panorama' }), '.'));
    return;
  }

  const bloco = secao({});
  bloco.corpo.append(abas([
    { id: 'execucao', titulo: 'Receita e despesa', montar: montarExecucao },
    { id: 'areas', titulo: 'Áreas ao longo do tempo', montar: montarAreas },
  ]));
  raiz.append(bloco);

  raiz.append(el('p', { class: 'nota' },
    'Os valores desta página são os que o TCE publica hoje. Para ver o que já foi informado e '
    + 'depois alterado, veja ', el('a', { href: '#/retificacoes', texto: 'Retificações' }), '.'));
}

async function montarExecucao(alvo) {
  alvo.append(carregando('Somando os exercícios...'));
  const [despesa, receita] = await Promise.all([
    banco.selecionar('execucao_por_exercicio', {}, { ordem: 'exercicio.asc' }),
    banco.selecionar('receita_por_exercicio', {}, { ordem: 'exercicio.asc' }),
  ]);
  alvo.replaceChildren();

  if (!despesa || !despesa.length) {
    alvo.append(vazio('Banco ainda sem dados',
      'Nenhum exercício foi carregado no banco de apoio até agora.'));
    return;
  }

  const porAno = new Map(despesa.map((d) => [Number(d.exercicio), d]));
  for (const r of receita || []) {
    const alvoAno = porAno.get(Number(r.exercicio));
    if (alvoAno) {
      alvoAno.previsto = Number(r.previsto);
      alvoAno.arrecadado = Number(r.arrecadado);
    }
  }
  const anos = [...porAno.keys()].sort();
  const linhasAnos = anos.map((a) => porAno.get(a));

  const primeiro = linhasAnos[0];
  const ultimo = linhasAnos[linhasAnos.length - 1];
  const crescimento = primeiro.pago > 0
    ? (Number(ultimo.pago) / Number(primeiro.pago) - 1)
    : 0;

  alvo.append(grade(
    cartao({
      titulo: 'Exercícios no banco', valor: numero(anos.length), tom: 'neutro',
      detalhe: 'De ' + anos[0] + ' a ' + anos[anos.length - 1],
    }),
    cartao({
      titulo: 'Pago em ' + anos[anos.length - 1], valor: Number(ultimo.pago), tom: 'pago',
      detalhe: Number(ultimo.mes_referencia) % 100 === 12
        ? 'Exercício completo' : 'Exercício ainda em andamento',
    }),
    cartao({
      titulo: 'Variação desde ' + anos[0],
      valor: (crescimento >= 0 ? '+' : '') + percentual(Math.abs(crescimento), 1, 0).replace('%', '%'),
      tom: crescimento >= 0 ? 'empenhado' : 'alerta',
      detalhe: 'Comparando o valor pago, sem corrigir pela inflação',
      ajuda: 'Os valores estão em reais correntes de cada ano, então parte da variação é inflação.',
    }),
  ));

  alvo.append(graficoLinhas([
    { nome: 'Orçado', valores: linhasAnos.map((l) => Number(l.orcado)) },
    { nome: 'Empenhado', valores: linhasAnos.map((l) => Number(l.empenhado)) },
    { nome: 'Pago', valores: linhasAnos.map((l) => Number(l.pago)) },
    { nome: 'Arrecadado', valores: linhasAnos.map((l) => Number(l.arrecadado || 0)) },
  ], anos.map(String), { descricao: 'Evolução do orçamento e da execução por exercício' }));

  alvo.append(aviso('info',
    'Os valores estão em reais de cada ano. Como não há correção pela inflação, crescimento '
    + 'nominal não significa necessariamente mais serviço público entregue.'));

  alvo.append(tabela(linhasAnos, [
    { campo: 'exercicio', rotulo: 'Exercício', tipo: 'numero' },
    { campo: 'previsto', rotulo: 'Receita prevista', tipo: 'dinheiro' },
    { campo: 'arrecadado', rotulo: 'Arrecadado', tipo: 'dinheiro' },
    { campo: 'orcado', rotulo: 'Despesa orçada', tipo: 'dinheiro' },
    { campo: 'empenhado', rotulo: 'Empenhado', tipo: 'dinheiro' },
    { campo: 'liquidado', rotulo: 'Liquidado', tipo: 'dinheiro' },
    { campo: 'pago', rotulo: 'Pago', tipo: 'dinheiro' },
    {
      campo: 'execucao', rotulo: 'Executado', tipo: 'numero',
      formatar: (_, l) => percentual(l.pago, l.orcado),
    },
  ], {
    ordenarPor: 'exercicio', crescente: true, busca: false,
    nomeArquivo: 'crato-execucao-por-exercicio',
  }));
}

async function montarAreas(alvo) {
  alvo.append(carregando('Comparando as áreas ano a ano...'));
  const [linhasFuncao, mapaFuncoes] = await Promise.all([
    banco.selecionar('execucao_por_funcao', {}, { ordem: 'exercicio.asc' }),
    funcoes().catch(() => new Map()),
  ]);
  alvo.replaceChildren();

  if (!linhasFuncao || !linhasFuncao.length) {
    alvo.append(vazio('Banco ainda sem dados', 'Nenhum balancete foi carregado até agora.'));
    return;
  }

  const dic = { funcoes: mapaFuncoes };
  const anos = [...new Set(linhasFuncao.map((l) => Number(l.exercicio)))].sort();
  const porFuncao = new Map();
  for (const l of linhasFuncao) {
    const codigo = String(l.funcao || '').trim();
    if (!porFuncao.has(codigo)) porFuncao.set(codigo, new Map());
    porFuncao.get(codigo).set(Number(l.exercicio), Number(l.pago));
  }

  const totais = [...porFuncao.entries()].map(([codigo, anosDaFuncao]) => ({
    chave: codigo,
    rotulo: nomeFuncao(dic, codigo),
    total: [...anosDaFuncao.values()].reduce((s, v) => s + v, 0),
    porAno: anosDaFuncao,
  }));
  const principais = ordenarPor(totais, 'total').slice(0, 6);

  alvo.append(aviso('info',
    'Cada linha é uma área de governo. Comparar a mesma área entre anos mostra onde a prefeitura '
    + 'passou a gastar mais e onde recuou.'));

  alvo.append(graficoLinhas(
    principais.map((f) => ({
      nome: f.rotulo,
      valores: anos.map((a) => f.porAno.get(a) || 0),
    })),
    anos.map(String),
    { descricao: 'Valor pago por área de governo em cada exercício' },
  ));

  const paraTabela = ordenarPor(totais, 'total').map((f) => {
    const linha = { rotulo: f.rotulo, total: f.total };
    for (const a of anos) linha['ano' + a] = f.porAno.get(a) || 0;
    return linha;
  });

  alvo.append(tabela(paraTabela, [
    { campo: 'rotulo', rotulo: 'Área', tipo: 'texto' },
    ...anos.map((a) => ({ campo: 'ano' + a, rotulo: String(a), tipo: 'dinheiro' })),
    { campo: 'total', rotulo: 'Total no período', tipo: 'dinheiro' },
  ], {
    ordenarPor: 'total', camposBusca: ['rotulo'],
    nomeArquivo: 'crato-areas-por-exercicio',
  }));
}

