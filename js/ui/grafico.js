// Gráficos em SVG puro. Sem biblioteca externa: o app inteiro roda sem
// instalar nada e sem depender de CDN, o que também evita quebrar quando o
// visitante está com conexão ruim.

import { dinheiro, dinheiroCurto, percentual } from '../api/formato.js';
import { el } from './componentes.js';

const NS = 'http://www.w3.org/2000/svg';
export const CORES = 8;

function svgEl(tag, props = {}, ...filhos) {
  const node = document.createElementNS(NS, tag);
  for (const [chave, valor] of Object.entries(props)) {
    if (valor === null || valor === undefined || valor === false) continue;
    node.setAttribute(chave, valor);
  }
  for (const filho of filhos.flat()) {
    if (!filho) continue;
    node.append(filho instanceof Node ? filho : document.createTextNode(String(filho)));
  }
  return node;
}

function cor(indice) {
  return 'var(--serie-' + ((indice % CORES) + 1) + ')';
}

/**
 * Rosca com legenda ao lado.
 * itens: [{ rotulo, valor }] já ordenados e com "Outros" agrupado.
 */
export function rosca(itens, opcoes = {}) {
  const formatar = opcoes.formatar || dinheiro;
  const icone = opcoes.icone || (() => null);
  const total = itens.reduce((a, i) => a + (Number(i.valor) || 0), 0);
  if (!total) return el('p', { class: 'sem-grafico', texto: 'Sem valores para desenhar.' });

  const raio = 15.915494; // circunferência = 100, então cada fatia vira %
  const svg = svgEl('svg', {
    viewBox: '0 0 42 42', class: 'rosca', role: 'img',
    'aria-label': opcoes.descricao || 'Gráfico de rosca',
  });
  svg.append(svgEl('circle', {
    cx: 21, cy: 21, r: raio, fill: 'none', 'stroke-width': 6, class: 'rosca-trilho',
  }));

  let acumulado = 0;
  itens.forEach((item, i) => {
    const fatia = ((Number(item.valor) || 0) / total) * 100;
    if (fatia <= 0) return;
    svg.append(svgEl('circle', {
      cx: 21, cy: 21, r: raio, fill: 'none', stroke: cor(i), 'stroke-width': 6,
      'stroke-dasharray': fatia.toFixed(3) + ' ' + (100 - fatia).toFixed(3),
      'stroke-dashoffset': (25 - acumulado).toFixed(3),
      class: 'rosca-fatia',
    }, svgEl('title', {}, item.rotulo + ': ' + formatar(item.valor))));
    acumulado += fatia;
  });

  const legenda = el('ul', { class: 'legenda' }, itens.map((item, i) => el('li', {},
    el('span', { class: 'legenda-cor', style: 'background:' + cor(i) }),
    icone(item),
    el('span', { class: 'legenda-rotulo', texto: item.rotulo, title: item.rotulo }),
    el('span', { class: 'legenda-valor' },
      formatar(item.valor) + ' · ' + percentual(item.valor, total)))));

  return el('div', { class: 'grafico grafico-rosca' },
    el('div', { class: 'rosca-caixa' }, svg,
      opcoes.centro ? el('div', { class: 'rosca-centro' },
        el('strong', { texto: opcoes.centro }),
        opcoes.centroDetalhe ? el('span', { texto: opcoes.centroDetalhe }) : null) : null),
    legenda);
}

/**
 * Linhas de evolução mensal.
 * series: [{ nome, valores: number[] }]  rotulos: string[]
 */
export function linhas(series, rotulos, opcoes = {}) {
  const largura = 720;
  const altura = 280;
  const margem = { topo: 16, direita: 16, baixo: 34, esquerda: 68 };
  const areaL = largura - margem.esquerda - margem.direita;
  const areaA = altura - margem.topo - margem.baixo;

  const todos = series.flatMap((s) => s.valores.map((v) => Number(v) || 0));
  const maximo = Math.max(1, ...todos);
  const passo = rotulos.length > 1 ? areaL / (rotulos.length - 1) : 0;
  const x = (i) => margem.esquerda + i * passo;
  const y = (v) => margem.topo + areaA - ((Number(v) || 0) / maximo) * areaA;

  const svg = svgEl('svg', {
    viewBox: '0 0 ' + largura + ' ' + altura, class: 'linhas', role: 'img',
    'aria-label': opcoes.descricao || 'Gráfico de linhas',
  });

  for (let n = 0; n <= 4; n += 1) {
    const valor = (maximo / 4) * n;
    const py = y(valor);
    svg.append(svgEl('line', {
      x1: margem.esquerda, x2: largura - margem.direita, y1: py, y2: py, class: 'grade',
    }));
    svg.append(svgEl('text', {
      x: margem.esquerda - 8, y: py + 4, class: 'eixo-rotulo', 'text-anchor': 'end',
    }, dinheiroCurto(valor)));
  }

  rotulos.forEach((rotulo, i) => {
    svg.append(svgEl('text', {
      x: x(i), y: altura - 12, class: 'eixo-rotulo', 'text-anchor': 'middle',
    }, rotulo));
  });

  series.forEach((serie, s) => {
    const pontos = serie.valores.map((v, i) => x(i) + ',' + y(v)).join(' ');
    svg.append(svgEl('polyline', {
      points: pontos, fill: 'none', stroke: cor(s), 'stroke-width': 2.5,
      'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    }));
    serie.valores.forEach((v, i) => {
      svg.append(svgEl('circle', { cx: x(i), cy: y(v), r: 3.5, fill: cor(s) },
        svgEl('title', {}, serie.nome + ' em ' + rotulos[i] + ': ' + dinheiro(v))));
    });
  });

  const legenda = el('ul', { class: 'legenda legenda-linha' }, series.map((s, i) => el('li', {},
    el('span', { class: 'legenda-cor', style: 'background:' + cor(i) }),
    el('span', { class: 'legenda-rotulo', texto: s.nome }))));

  return el('div', { class: 'grafico grafico-linhas' },
    el('div', { class: 'grafico-rolagem' }, svg), legenda);
}

/** Colunas verticais, usadas para comparações mês a mês de um único valor. */
export function colunas(valores, rotulos, opcoes = {}) {
  const largura = 720;
  const altura = 260;
  const margem = { topo: 16, direita: 16, baixo: 34, esquerda: 68 };
  const areaL = largura - margem.esquerda - margem.direita;
  const areaA = altura - margem.topo - margem.baixo;
  const maximo = Math.max(1, ...valores.map((v) => Number(v) || 0));
  const larguraBarra = (areaL / valores.length) * 0.62;

  const svg = svgEl('svg', {
    viewBox: '0 0 ' + largura + ' ' + altura, class: 'colunas', role: 'img',
    'aria-label': opcoes.descricao || 'Gráfico de colunas',
  });

  for (let n = 0; n <= 4; n += 1) {
    const valor = (maximo / 4) * n;
    const py = margem.topo + areaA - (valor / maximo) * areaA;
    svg.append(svgEl('line', {
      x1: margem.esquerda, x2: largura - margem.direita, y1: py, y2: py, class: 'grade',
    }));
    svg.append(svgEl('text', {
      x: margem.esquerda - 8, y: py + 4, class: 'eixo-rotulo', 'text-anchor': 'end',
    }, dinheiroCurto(valor)));
  }

  valores.forEach((v, i) => {
    const centro = margem.esquerda + (areaL / valores.length) * (i + 0.5);
    const alturaBarra = ((Number(v) || 0) / maximo) * areaA;
    svg.append(svgEl('rect', {
      x: centro - larguraBarra / 2, y: margem.topo + areaA - alturaBarra,
      width: larguraBarra, height: Math.max(0, alturaBarra),
      fill: cor(opcoes.cor || 0), rx: 2,
    }, svgEl('title', {}, rotulos[i] + ': ' + dinheiro(v))));
    svg.append(svgEl('text', {
      x: centro, y: altura - 12, class: 'eixo-rotulo', 'text-anchor': 'middle',
    }, rotulos[i]));
  });

  return el('div', { class: 'grafico grafico-colunas' },
    el('div', { class: 'grafico-rolagem' }, svg));
}

/**
 * Uma cor por etapa da despesa, sempre a mesma em todo o sistema. É regra da
 * identidade: empenhado é milho, liquidado é azul, pago é vermelhão, e essas
 * cores não servem para mais nada.
 */
export function corDaEtapa(nome) {
  const chave = String(nome || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (chave.includes('empenh')) return 'var(--etapa-empenhado)';
  if (chave.includes('liquid')) return 'var(--etapa-liquidado)';
  if (chave.includes('pago') || chave.includes('pagam')) return 'var(--etapa-pago)';
  if (chave.includes('arrecad') || chave.includes('receita')) return 'var(--etapa-receita)';
  return 'var(--etapa-previsto)';
}

function barraDaEtapa(fracao, corDaBarra) {
  return el('div', { class: 'barra' },
    el('div', {
      class: 'barra-preenche',
      style: 'width:' + (fracao * 100).toFixed(2) + '%;background:' + corDaBarra,
    }));
}

/** Barra única mostrando quanto do orçamento já virou empenho, liquidação e pagamento. */
export function barraExecucao(etapas, total) {
  return el('div', { class: 'execucao' }, etapas.map((etapa) => {
    const fracao = total ? Math.min(1, (Number(etapa.valor) || 0) / total) : 0;
    return el('div', { class: 'execucao-linha' },
      el('div', { class: 'execucao-rotulo' },
        el('span', { texto: etapa.nome }),
        el('span', { class: 'execucao-valor', texto: dinheiro(etapa.valor) })),
      barraDaEtapa(fracao, etapa.cor || corDaEtapa(etapa.nome)),
      el('span', { class: 'execucao-pct', texto: percentual(etapa.valor, total) + ' do orçamento' }));
  }));
}
