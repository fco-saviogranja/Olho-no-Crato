// Página inicial: a porta de entrada do site.
//
// Antes do redesenho, quem chegava via só a pergunta "escolha o município",
// numa tela nua. Funcionava, mas não dizia o que o site é nem por que alguém
// deveria se importar — e um projeto de extensão que depende de alcançar quem
// nunca ouviu falar de balancete não pode abrir assim.
//
// A ordem das seções é um argumento: primeiro o direito (o dinheiro é
// público), depois a procedência (dados oficiais do TCE), depois a escolha da
// cidade, depois o que dá para descobrir, e só então como se faz. Quem rola
// até o fim passou por uma explicação inteira sem ter clicado em nada.

import { MUNICIPIOS } from '../api/tce.js';
import { el } from '../ui/componentes.js';

export const titulo = 'Início';

/** Seção de ponta a ponta, com o conteúdo parando na coluna do resto do site. */
function faixa(classe, ...filhos) {
  return el('section', { class: 'faixa ' + classe },
    el('div', { class: 'faixa-interna' }, filhos));
}

function sobretitulo(texto) {
  return el('p', { class: 'sobretitulo', texto });
}

function abertura(estado) {
  return faixa('faixa-abertura',
    el('div', { class: 'abertura-texto' },
      sobretitulo('Do Cariri, para quem vive o Cariri.'),
      el('h1', { class: 'abertura-titulo' },
        'O dinheiro é público.', el('br'), 'O olhar é de todos.'),
      el('p', { class: 'abertura-linha' },
        'Entenda de onde vem e para onde vai o dinheiro das prefeituras do '
        + 'Cariri. Dados abertos, explicados em português e perto de você.'),
      el('a', {
        class: 'botao botao-grande',
        href: '#municipios',
        onClick: (e) => {
          e.preventDefault();
          const alvo = document.getElementById('municipios');
          if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
      }, 'Escolher meu município', el('span', { class: 'botao-seta', texto: '↓' })),
      el('p', { class: 'abertura-nota', texto: 'Sem cadastro. Sem complicação. É seu direito saber.' })),
    el('div', { class: 'abertura-gravura' },
      // A xilogravura é decorativa: o que ela comunica já está dito no texto
      // ao lado, então descrevê-la de novo só faria o leitor de tela repetir.
      el('img', { src: 'cariri.svg', alt: '', width: '540', height: '448', loading: 'lazy' }),
      el('p', { class: 'gravura-assinatura', texto: 'Nossa terra. Nossas contas.' })));
}

function confianca() {
  return faixa('faixa-confianca',
    el('span', { class: 'confianca-item', texto: 'Dados oficiais · TCE-CE' }),
    el('span', { class: 'confianca-item confianca-centro', texto: 'Nove municípios. Um olhar cidadão.' }),
    el('span', { class: 'confianca-item', texto: 'Acesso público e gratuito' }));
}

function escolha(estado) {
  const grade = el('div', { class: 'municipios-grade' },
    MUNICIPIOS.map((m) => el('button', {
      class: 'municipio-opcao',
      type: 'button',
      onClick: () => estado.definirMunicipio(m.codigo),
    },
    el('span', { class: 'municipio-uf', texto: m.uf }),
    el('strong', { texto: m.nome }),
    el('span', { class: 'municipio-seta', 'aria-hidden': 'true', texto: '→' }))));

  return faixa('faixa-escolha',
    el('div', { class: 'escolha-cabecalho', id: 'municipios' },
      el('div', {},
        sobretitulo('01 · Comece pela sua cidade'),
        el('h2', { texto: 'De qual Cariri você quer saber?' })),
      el('p', { class: 'escolha-apoio',
        texto: 'Escolha um município para consultar as contas. Dá para trocar '
          + 'de cidade quando quiser, no alto da página.' })),
    grade,
    el('p', { class: 'escolha-rodape',
      texto: 'Região Metropolitana do Cariri · nove municípios, conforme a Lei '
        + 'Complementar Estadual nº 78/2009.' }));
}

const CAMINHOS = [
  { rota: 'despesas', titulo: 'Para onde vai',
    texto: 'Acompanhe os gastos com saúde, educação e outras áreas.',
    chamada: 'Despesas públicas' },
  { rota: 'fornecedores', titulo: 'Quem recebe',
    texto: 'Conheça as pessoas e empresas que recebem recursos públicos.',
    chamada: 'Fornecedores' },
  { rota: 'contratos', titulo: 'O que é contratado',
    texto: 'Consulte contratos e acompanhe as obras do seu município.',
    chamada: 'Contratos e obras' },
  { rota: 'receitas', titulo: 'De onde vem',
    texto: 'Entenda as receitas, os impostos e os repasses para a cidade.',
    chamada: 'Receitas públicas' },
];

function caminhos(estado) {
  return faixa('faixa-caminhos',
    sobretitulo('02 · Informação que faz sentido'),
    el('h2', { texto: 'Das contas da prefeitura à sua vida.' }),
    el('div', { class: 'caminhos-grade' },
      CAMINHOS.map((c) => el('a', {
        class: 'caminho-cartao',
        href: '#/' + c.rota,
        // sem município escolhido o roteador devolveria a tela inicial, então
        // o cartão leva junto a escolha pendente em vez de virar beco sem saída
        onClick: (e) => {
          if (estado.municipio) return;
          e.preventDefault();
          const alvo = document.getElementById('municipios');
          if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
      },
      el('span', { class: 'caminho-numero', texto: '0' + (CAMINHOS.indexOf(c) + 1) }),
      el('strong', { texto: c.titulo }),
      el('p', { texto: c.texto }),
      el('span', { class: 'caminho-chamada' },
        c.chamada, el('span', { 'aria-hidden': 'true', texto: ' →' }))))));
}

const PASSOS = [
  { n: '01', titulo: 'Escolha sua cidade',
    texto: 'Comece pelo município que faz parte da sua vida.' },
  { n: '02', titulo: 'Explore as contas',
    texto: 'Veja receitas, despesas, contratos e quem recebe os recursos.' },
  { n: '03', titulo: 'Confira a origem',
    texto: 'Consulte a fonte e entenda o contexto de cada informação.' },
];

function comoFunciona() {
  return faixa('faixa-como',
    el('div', { class: 'como-cabecalho' },
      el('div', {},
        sobretitulo('03 · Transparência, sem mistério'),
        el('h2', {}, 'Não precisa ser especialista.', el('br'), 'Só precisa querer saber.'),
        el('p', { class: 'como-link' },
          'Uma palavra nova? ',
          el('a', { href: '#/glossario', texto: 'Consulte o glossário →' }))),
      el('ol', { class: 'passos' },
        PASSOS.map((p) => el('li', {},
          el('span', { class: 'passo-numero', texto: p.n }),
          el('strong', { texto: p.titulo }),
          el('p', { texto: p.texto }))))));
}

export async function montar(raiz, estado) {
  raiz.append(
    abertura(estado),
    confianca(),
    escolha(estado),
    caminhos(estado),
    comoFunciona(),
  );
}
