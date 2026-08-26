// Peças de interface reaproveitadas por todas as páginas.

import { dinheiro, dinheiroCurto, escapar, numero, percentual } from '../api/formato.js';
import { anosDisponiveis } from '../api/tce.js';

/** Cria elemento com atributos e filhos. */
export function el(tag, props = {}, ...filhos) {
  const node = document.createElement(tag);
  for (const [chave, valor] of Object.entries(props || {})) {
    if (valor === null || valor === undefined || valor === false) continue;
    if (chave === 'class') node.className = valor;
    else if (chave === 'html') node.innerHTML = valor;
    else if (chave === 'texto') node.textContent = valor;
    else if (chave.startsWith('on') && typeof valor === 'function') {
      node.addEventListener(chave.slice(2).toLowerCase(), valor);
    } else if (chave === 'dados') {
      for (const [d, v] of Object.entries(valor)) node.dataset[d] = v;
    } else node.setAttribute(chave, valor);
  }
  for (const filho of filhos.flat()) {
    if (filho === null || filho === undefined || filho === false) continue;
    node.append(filho instanceof Node ? filho : document.createTextNode(String(filho)));
  }
  return node;
}

export function secao({ titulo, descricao, acoes, id }) {
  const cabecalho = el('div', { class: 'secao-cabecalho' },
    el('div', {},
      titulo ? el('h2', { texto: titulo }) : null,
      descricao ? el('p', { class: 'secao-descricao', texto: descricao }) : null),
    acoes ? el('div', { class: 'secao-acoes' }, acoes) : null);
  const corpo = el('div', { class: 'secao-corpo' });
  const node = el('section', { class: 'secao', id }, cabecalho, corpo);
  node.corpo = corpo;
  return node;
}

/** Cartão de número grande. tom: neutro, previsto, empenhado, liquidado, pago, receita. */
export function cartao({ titulo, valor, detalhe, tom = 'neutro', ajuda }) {
  const dica = typeof valor === 'number' ? dinheiro(valor) : null;
  return el('div', { class: 'cartao cartao-' + tom },
    el('div', { class: 'cartao-titulo' },
      titulo,
      ajuda ? el('span', { class: 'ajuda', title: ajuda, 'aria-label': ajuda, texto: '?' }) : null),
    el('strong', { class: 'cartao-valor', title: dica },
      typeof valor === 'number' ? dinheiroCurto(valor) : valor),
    detalhe ? el('span', { class: 'cartao-detalhe' }, detalhe) : null);
}

export function grade(...cartoes) {
  return el('div', { class: 'grade-cartoes' }, cartoes.flat());
}

export function aviso(tipo, texto, extra) {
  return el('div', { class: 'aviso aviso-' + tipo },
    el('span', { class: 'aviso-icone', 'aria-hidden': 'true', texto: tipo === 'info' ? 'i' : '!' }),
    el('div', {}, el('p', { texto }), extra || null));
}

export function carregando(texto = 'Consultando o TCE...') {
  return el('div', { class: 'carregando' },
    el('div', { class: 'girando', 'aria-hidden': 'true' }),
    el('p', { texto }));
}

export function barraProgresso(texto = '') {
  const legenda = el('p', { class: 'progresso-legenda', texto });
  const preenche = el('div', { class: 'progresso-preenche' });
  const node = el('div', { class: 'progresso' },
    el('div', { class: 'progresso-trilho' }, preenche), legenda);
  node.atualizar = (fracao, novoTexto) => {
    const pct = Math.min(100, Math.max(0, fracao * 100)).toFixed(1);
    preenche.style.width = pct + '%';
    if (novoTexto !== undefined) legenda.textContent = novoTexto;
  };
  return node;
}

export function vazio(titulo, texto, extra) {
  return el('div', { class: 'vazio' },
    el('h3', { texto: titulo }),
    texto ? el('p', { texto }) : null,
    extra || null);
}

export function erroNaTela(erro, aoRepetir, extra) {
  return el('div', { class: 'aviso aviso-erro' },
    el('span', { class: 'aviso-icone', 'aria-hidden': 'true', texto: '!' }),
    el('div', {},
      el('p', { texto: (erro && erro.message) || 'Algo deu errado ao consultar o TCE.' }),
      aoRepetir ? el('button', { class: 'botao', onClick: aoRepetir, texto: 'Tentar de novo' }) : null,
      extra || null));
}

/**
 * Quando um conjunto de dados do TCE sai do ar, a página que dependia dele vira
 * um beco sem saída. Quem chegou querendo saber do dinheiro público merece uma
 * porta em vez de um pedido de desculpas: as outras páginas leem endpoints
 * diferentes e costumam continuar de pé na mesma hora.
 */
export function saidas(itens) {
  return el('div', { class: 'saidas' },
    el('p', { class: 'nota', texto: 'Estas partes do site não dependem desse dado e devem estar funcionando:' }),
    el('ul', { class: 'lista-saidas' }, itens.map((i) => el('li', {},
      el('a', { href: i.href, texto: i.rotulo }),
      i.nota ? el('span', { class: 'saida-nota', texto: ' — ' + i.nota }) : null))));
}

const FONTES_CARIMBO = {
  rede: 'Consultado agora no TCE-CE',
  cache: 'Dado guardado no seu navegador',
  'cache-antigo': 'TCE fora do ar: mostrando a última cópia guardada',
  banco: 'TCE fora do ar: cópia guardada no banco de apoio, lida',
};

/** Carimbo de procedência: de onde veio o dado e quando. */
export function carimbo({ origem, ts, endpoints = [] }) {
  const quando = ts ? new Date(ts).toLocaleString('pt-BR') : '';
  const fonte = FONTES_CARIMBO[origem] || 'TCE-CE';
  const classe = origem === 'cache-antigo' || origem === 'banco'
    ? 'carimbo carimbo-alerta' : 'carimbo';
  return el('p', { class: classe },
    fonte + (quando ? ' em ' + quando : ''),
    endpoints.length ? el('span', { class: 'carimbo-endpoints' }, ' · ' + endpoints.join(', ')) : null);
}

export function seletorAno(anoAtual, aoMudar, opcoes = {}) {
  const rotulo = opcoes.rotulo || 'Exercício';
  const select = el('select', { class: 'seletor', 'aria-label': rotulo });
  for (const ano of anosDisponiveis()) {
    select.append(el('option', { value: ano, selected: ano === Number(anoAtual) }, String(ano)));
  }
  select.addEventListener('change', () => aoMudar(Number(select.value)));
  return el('label', { class: 'campo' }, el('span', { texto: rotulo }), select);
}

export function botao(texto, aoClicar, opcoes = {}) {
  return el('button', {
    class: opcoes.classe || 'botao', onClick: aoClicar, title: opcoes.titulo, texto,
  });
}

/**
 * A largura sai pronta no atributo; quem anima é o CSS, esticando a barra da
 * esquerda. Numa primeira versão eu crescia a barra por JavaScript, e ela
 * ficava zerada quando a aba abria em segundo plano, porque o navegador não
 * roda requestAnimationFrame em aba oculta. O dado não pode depender da
 * animação acontecer.
 */
export function barraProporcao(fracao) {
  const largura = (Math.max(0, Math.min(1, fracao)) * 100).toFixed(2);
  return el('div', { class: 'barra' },
    el('div', { class: 'barra-preenche', style: 'width:' + largura + '%' }));
}

/** Lista de ranking: rótulo, barra proporcional, valor e percentual. */
export function ranking(itens, opcoes = {}) {
  const { campo, total, aoClicar } = opcoes;
  const formatar = opcoes.formatar || dinheiro;
  // um nó do DOM só existe em um lugar: o pictograma vem de uma função para
  // que cada linha receba o seu
  const icone = opcoes.icone || (() => null);
  const maior = itens.reduce((m, i) => Math.max(m, Number(i[campo]) || 0), 0);
  const soma = total === undefined ? itens.reduce((a, i) => a + (Number(i[campo]) || 0), 0) : total;
  return el('ol', { class: 'ranking' }, itens.map((item) => {
    const valor = Number(item[campo]) || 0;
    const plural = item.quantidade === 1 ? ' registro' : ' registros';
    const linha = el('li', { class: aoClicar ? 'ranking-item clicavel' : 'ranking-item' },
      el('div', { class: 'ranking-topo' },
        el('span', { class: 'ranking-rotulo', title: item.rotulo },
          icone(item),
          el('span', { class: 'ranking-nome', texto: item.rotulo })),
        el('span', { class: 'ranking-valor', texto: formatar(valor) })),
      barraProporcao(maior ? valor / maior : 0),
      el('div', { class: 'ranking-rodape' },
        el('span', { texto: percentual(valor, soma) + ' do total' }),
        item.quantidade ? el('span', { texto: numero(item.quantidade) + plural }) : null));
    if (aoClicar) {
      linha.tabIndex = 0;
      linha.setAttribute('role', 'button');
      linha.addEventListener('click', () => aoClicar(item));
      linha.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          aoClicar(item);
        }
      });
    }
    return linha;
  }));
}

/** Abas simples. secoes: [{ id, titulo, montar(container) }] */
export function abas(secoes, inicial) {
  const navegacao = el('div', { class: 'abas', role: 'tablist' });
  const painel = el('div', { class: 'abas-painel' });
  const montadas = new Map();
  let ativa = null;

  function ativar(id) {
    if (ativa === id) return;
    ativa = id;
    for (const b of navegacao.children) b.classList.toggle('ativa', b.dataset.id === id);
    painel.replaceChildren();
    let conteudo = montadas.get(id);
    if (!conteudo) {
      conteudo = el('div', { class: 'aba-conteudo' });
      montadas.set(id, conteudo);
      secoes.find((s) => s.id === id).montar(conteudo);
    }
    painel.append(conteudo);
  }

  for (const s of secoes) {
    navegacao.append(el('button', {
      class: 'aba', role: 'tab', dados: { id: s.id },
      onClick: () => ativar(s.id), texto: s.titulo,
    }));
  }
  const node = el('div', { class: 'abas-caixa' }, navegacao, painel);
  ativar(inicial || secoes[0].id);
  node.ativar = ativar;
  return node;
}

export function detalhe(rotulo, valor) {
  return el('div', { class: 'detalhe' },
    el('dt', { texto: rotulo }),
    el('dd', {}, valor instanceof Node ? valor : el('span', { texto: String(valor == null ? '' : valor) })));
}

export function listaDetalhes(pares) {
  return el('dl', { class: 'lista-detalhes' },
    pares.filter(Boolean).map((par) => detalhe(par[0], par[1])));
}

/** Painel lateral para o detalhe de um item sem trocar de página. */
export function gaveta(titulo, conteudo) {
  const fechar = () => node.remove();
  const node = el('div', {
    class: 'gaveta-fundo',
    onClick: (e) => { if (e.target === node) fechar(); },
  }, el('aside', { class: 'gaveta', role: 'dialog', 'aria-label': titulo },
    el('header', { class: 'gaveta-cabecalho' },
      el('h2', { texto: titulo }),
      el('button', { class: 'botao-icone', 'aria-label': 'Fechar', onClick: fechar, texto: 'X' })),
    el('div', { class: 'gaveta-corpo' }, conteudo)));
  document.addEventListener('keydown', function aoEsc(e) {
    if (e.key === 'Escape') {
      fechar();
      document.removeEventListener('keydown', aoEsc);
    }
  });
  document.body.append(node);
  return node;
}

export { escapar };
