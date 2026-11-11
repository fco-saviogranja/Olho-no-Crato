// Roteador e casca do app. Cada página é um módulo carregado sob demanda que
// exporta montar(raiz, estado).

import {
  anoAtual, cache, definirMunicipio, MUNICIPIO, MUNICIPIO_COM_BANCO,
  municipioPorCodigo, PRIMEIRO_ANO,
} from './api/tce.js';
import { limparMemoria } from './api/auxiliares.js';
import * as banco from './api/banco.js';
import {
  aviso, botao, carregando, el, erroNaTela, seletorAno, seletorMunicipio,
} from './ui/componentes.js';

// semAno:   a página atravessa todos os exercícios, então o seletor de ano não
//           teria efeito e só confundiria.
// comBanco: depende do banco de apoio para cruzar exercícios, coisa que a API
//           do TCE não faz. Sem banco configurado a página some do menu, e o
//           resto do site continua funcionando igual.
const ROTAS = [
  { id: 'inicio', titulo: 'Início', grupo: 'principal', semAno: true, foraDoMenu: true },
  { id: 'panorama', titulo: 'Panorama', grupo: 'principal' },
  { id: 'busca', titulo: 'Buscar', grupo: 'principal', semAno: true, comBanco: true },
  { id: 'despesas', titulo: 'Para onde vai', grupo: 'principal' },
  { id: 'fornecedores', titulo: 'Quem recebe', grupo: 'principal' },
  { id: 'contratos', titulo: 'Contratos', grupo: 'principal' },
  { id: 'obras', titulo: 'Obras', grupo: 'principal' },
  { id: 'receitas', titulo: 'De onde vem', grupo: 'principal' },
  { id: 'historico', titulo: 'Ano a ano', grupo: 'mais', semAno: true, comBanco: true },
  { id: 'retificacoes', titulo: 'Retificações', grupo: 'mais', semAno: true, comBanco: true },
  { id: 'patrimonio', titulo: 'Patrimônio', grupo: 'mais' },
  { id: 'parcerias', titulo: 'Parcerias', grupo: 'mais' },
  { id: 'creditos', titulo: 'Créditos extras', grupo: 'mais' },
  { id: 'explorador', titulo: 'Dados brutos', grupo: 'mais' },
  { id: 'glossario', titulo: 'Glossário', grupo: 'apoio' },
  { id: 'sobre', titulo: 'Sobre', grupo: 'apoio' },
];

const PAGINA_INICIAL = ROTAS.find((r) => r.id === 'inicio');

/**
 * Uma falha de rede ao carregar um módulo fica gravada no mapa de módulos do
 * navegador: repetir o mesmo endereço falha para sempre até recarregar a
 * página. Por isso a segunda tentativa muda a consulta do endereço.
 */
async function carregarPagina(id) {
  const caminho = './paginas/' + id + '.js';
  try {
    return await import(caminho);
  } catch (primeira) {
    try {
      return await import(caminho + '?r=' + Date.now());
    } catch {
      throw primeira;
    }
  }
}

const PADRAO = 'panorama';
const CHAVE_ANO = 'olho-no-crato:ano';
const CHAVE_MUNICIPIO = 'olho-no-crato:municipio';

const app = document.getElementById('app');
const navegacao = document.getElementById('navegacao');
const menuBotao = document.getElementById('menu-botao');
const cabecalho = document.querySelector('.cabecalho');

/**
 * No celular o menu comeca recolhido. Fechar depois de escolher uma secao nao
 * e enfeite: o cabecalho e grudento, e um menu aberto de quinze itens cobriria
 * justamente a pagina que a pessoa acabou de pedir.
 */
function alternarMenu(abrir) {
  const aberto = abrir === undefined ? !cabecalho.classList.contains('menu-aberto') : abrir;
  cabecalho.classList.toggle('menu-aberto', aberto);
  menuBotao.setAttribute('aria-expanded', String(aberto));
}

menuBotao.addEventListener('click', () => alternarMenu());
navegacao.addEventListener('click', (e) => { if (e.target.closest('a')) alternarMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && cabecalho.classList.contains('menu-aberto')) {
    alternarMenu(false);
    menuBotao.focus();
  }
});
const areaAno = document.getElementById('area-ano');

const estado = {
  ano: anoInicial(),
  // null enquanto ninguem escolheu: e o que faz a tela de escolha aparecer.
  // Depois de escolhido, vale o codigo do SIM, e MUNICIPIO em tce.js acompanha.
  municipio: null,
  rota: PADRAO,
  params: new URLSearchParams(),
  navegar(hash) {
    window.location.hash = hash;
  },
  definirMunicipio(codigo) {
    if (!municipioPorCodigo(codigo)) return;
    const mudou = definirMunicipio(codigo);
    estado.municipio = MUNICIPIO.codigo;
    try {
      localStorage.setItem(CHAVE_MUNICIPIO, MUNICIPIO.codigo);
    } catch {
      // sem armazenamento local a escolha vale so nesta visita
    }
    if (!mudou) return;
    // os nomes de orgao e unidade sao memorizados por municipio: sem limpar,
    // a proxima cidade herdaria as secretarias da anterior
    limparMemoria();
    aplicarHash({ preservarEstado: true });
  },
  definirAno(ano) {
    const limpo = Math.min(anoAtual(), Math.max(PRIMEIRO_ANO, Number(ano) || anoAtual()));
    if (limpo === estado.ano) return;
    estado.ano = limpo;
    try {
      localStorage.setItem(CHAVE_ANO, String(limpo));
    } catch {
      // navegador sem armazenamento local: segue sem lembrar a escolha
    }
    limparMemoria();
    aplicarHash({ preservarEstado: true });
  },
  recarregar() {
    desenhar();
  },
};

/**
 * Municipio da URL, depois o lembrado, depois nenhum. Nenhum nao e falha: e o
 * caso da primeira visita, e e o que faz a tela de escolha aparecer. Link
 * compartilhado com ?municipio= abre direto na cidade certa, sem perguntar.
 */
function municipioInicial() {
  const daUrl = new URLSearchParams(window.location.hash.split('?')[1] || '').get('municipio');
  if (municipioPorCodigo(daUrl)) return String(daUrl);
  try {
    const guardado = localStorage.getItem(CHAVE_MUNICIPIO);
    if (municipioPorCodigo(guardado)) return String(guardado);
  } catch {
    // sem localStorage: pergunta de novo a cada visita, que e o mal menor
  }
  return null;
}

function anoInicial() {
  const daUrl = Number(new URLSearchParams(window.location.hash.split('?')[1] || '').get('ano'));
  if (daUrl >= PRIMEIRO_ANO && daUrl <= anoAtual()) return daUrl;
  try {
    const guardado = Number(localStorage.getItem(CHAVE_ANO));
    if (guardado >= PRIMEIRO_ANO && guardado <= anoAtual()) return guardado;
  } catch {
    // sem localStorage
  }
  // no começo do ano o exercício corrente ainda não tem balancete publicado
  return new Date().getMonth() < 3 ? anoAtual() - 1 : anoAtual();
}

/**
 * Quem digita o endereço sem nada depois dele entra pela porta da frente.
 *
 * Antes, endereço nu caía direto no Panorama, e quem já tinha uma cidade
 * guardada no navegador nunca mais via a inicial — ia parar numa tela de
 * números sem ter escolhido nada naquela visita. A escolha do município é a
 * primeira decisão do site, e é ela que precisa aparecer.
 *
 * Vale só para o endereço nu. Link com rota continua abrindo onde aponta, que
 * é o que sustenta a promessa de poder compartilhar qualquer tela.
 */
function lerHash() {
  const bruto = window.location.hash.replace(/^#\/?/, '');
  const [caminho, consulta] = bruto.split('?');
  const id = caminho || 'inicio';
  return {
    rota: ROTAS.some((r) => r.id === id) ? id : PADRAO,
    params: new URLSearchParams(consulta || ''),
  };
}

/** True quando não há rota nenhuma no endereço: "", "#" ou "#/". */
function enderecoNu() {
  return window.location.hash.replace(/^#\/?/, '').split('?')[0] === '';
}

function aplicarHash({ preservarEstado } = {}) {
  const { rota, params } = lerHash();
  if (preservarEstado) {
    params.set('ano', String(estado.ano));
    if (estado.municipio) params.set('municipio', estado.municipio);
    const consulta = params.toString();
    const novo = '#/' + rota + (consulta ? '?' + consulta : '');
    // trocar o hash dispara hashchange, que redesenha; se o endereco ja for
    // esse, o evento nao vem e a pagina ficaria com o dado da cidade anterior
    if (window.location.hash === novo) {
      estado.params = params;
      desenhar();
    } else {
      window.location.hash = novo;
    }
    return;
  }
  const anoDaUrl = Number(params.get('ano'));
  if (anoDaUrl >= PRIMEIRO_ANO && anoDaUrl <= anoAtual() && anoDaUrl !== estado.ano) {
    estado.ano = anoDaUrl;
  }
  const municipioDaUrl = params.get('municipio');
  if (municipioPorCodigo(municipioDaUrl) && municipioDaUrl !== estado.municipio) {
    estado.municipio = String(municipioDaUrl);
    definirMunicipio(municipioDaUrl);
    limparMemoria();
  }
  // O endereço nu passa a mostrar #/inicio na barra. Vai por replaceState e
  // não por location.hash: trocar o hash criaria uma entrada no histórico, e
  // aí o botão voltar devolveria a mesma tela em vez de sair do site.
  if (enderecoNu()) history.replaceState(null, '', '#/inicio');

  estado.rota = rota;
  estado.params = params;
  desenhar();
}

function marcarNavegacao() {
  for (const link of navegacao.querySelectorAll('a')) {
    const ativo = link.dataset.rota === estado.rota;
    link.classList.toggle('ativo', ativo);
    if (ativo) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

/**
 * As rotas que dependem do banco continuam alcançáveis por link direto mesmo
 * quando não aparecem no menu: quem chegar nelas vê a explicação na própria
 * página. Some do menu em dois casos — banco não configurado, e município sem
 * cópia no banco, que hoje é qualquer um que não seja o Crato.
 */
function rotasNoMenu() {
  const temBanco = banco.configurado() && estado.municipio === MUNICIPIO_COM_BANCO;
  return ROTAS.filter((r) => !r.foraDoMenu && (!r.comBanco || temBanco));
}

function montarNavegacao() {
  navegacao.replaceChildren();
  // na tela de escolha não há seção para visitar: o menu só apareceria para
  // levar a páginas que iam devolver a mesma pergunta
  cabecalho.classList.toggle('sem-municipio', !estado.municipio);
  if (!estado.municipio) return;
  for (const grupo of ['principal', 'mais', 'apoio']) {
    const itens = rotasNoMenu().filter((r) => r.grupo === grupo);
    if (!itens.length) continue;
    navegacao.append(el('div', { class: 'nav-grupo nav-' + grupo },
      itens.map((r) => el('a', {
        href: '#/' + r.id, dados: { rota: r.id }, texto: r.titulo,
      }))));
  }
}

/**
 * O banco de apoio guarda só o Crato, então Buscar, Ano a ano e Retificações
 * não têm o que mostrar nos outros oito. Dizer isso em uma tela própria é mais
 * honesto que deixar a página abrir vazia, e o aviso explica o porquê em vez
 * de parecer defeito.
 */
function telaSemBanco(rota) {
  return el('div', { class: 'pagina' },
    el('h1', { texto: rota.titulo }),
    aviso('alerta',
      rota.titulo + ' ainda existe só para o Crato. Esta página cruza vários '
      + 'exercícios de uma vez, coisa que a API do Tribunal não faz, e por isso '
      + 'depende de uma cópia dos dados guardada à parte — que hoje cobre '
      + 'apenas o Crato.'),
    el('p', { class: 'secao-descricao' },
      'As demais seções funcionam normalmente em ' + MUNICIPIO.nome
      + ', consultando o TCE ao vivo, um exercício por vez.'),
    el('div', { class: 'secao-acoes' },
      botao('Ver ' + rota.titulo + ' no Crato', () => estado.definirMunicipio(MUNICIPIO_COM_BANCO)),
      botao('Ir para o Panorama de ' + MUNICIPIO.nome, () => estado.navegar('#/panorama'),
        { classe: 'botao botao-secundario' })));
}

async function desenhar() {
  let rota = ROTAS.find((r) => r.id === estado.rota) || ROTAS[0];

  // Sem município escolhido, tudo leva à inicial: é ela que faz a pergunta, e
  // agora ela responde junto o que o site é. Antes havia uma tela separada só
  // com a lista de cidades, que não dizia nada a quem chegava pela primeira vez.
  if (!estado.municipio) rota = PAGINA_INICIAL;

  // o menu muda com o município, porque as rotas do banco só existem no Crato
  montarNavegacao();
  marcarNavegacao();
  // os seletores refletem rota e município, e os dois acabaram de ser decididos
  montarBarraAno();
  window.scrollTo({ top: 0 });

  // A inicial é de ponta a ponta: as faixas coloridas precisam sangrar até a
  // borda, então ela dispensa a coluna central que as outras páginas usam.
  app.classList.toggle('sem-coluna', rota.id === 'inicio');

  document.title = rota.id === 'inicio'
    ? 'Olho no Cariri · as contas das prefeituras do Cariri'
    : rota.titulo + ' · ' + MUNICIPIO.nome + ' · Olho no Cariri';

  if (rota.comBanco && estado.municipio !== MUNICIPIO_COM_BANCO) {
    app.replaceChildren(telaSemBanco(rota));
    return;
  }

  app.replaceChildren(carregando('Abrindo ' + rota.titulo + '...'));

  try {
    const modulo = await carregarPagina(rota.id);
    const raiz = el('div', { class: 'pagina pagina-' + rota.id });
    app.replaceChildren(raiz);
    await modulo.montar(raiz, estado);
  } catch (erro) {
    console.error(erro);
    app.replaceChildren(erroNaTela(erro, desenhar));
  }
}

const CHAVE_TEMA = 'olho-no-crato:tema';

/** claro, escuro, ou nulo enquanto a escolha ainda for a do sistema. */
function temaGuardado() {
  try {
    const valor = localStorage.getItem(CHAVE_TEMA);
    return valor === 'claro' || valor === 'escuro' ? valor : null;
  } catch {
    return null;
  }
}

function temaEmUso() {
  if (temaGuardado()) return temaGuardado();
  const escuroNoSistema = window.matchMedia
    && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return escuroNoSistema ? 'escuro' : 'claro';
}

function alternarTema() {
  const novo = temaEmUso() === 'escuro' ? 'claro' : 'escuro';
  const raiz = document.documentElement;

  // As transições de cor precisam sair da frente durante a troca: um elemento
  // com transition na cor fica preso ao valor do tema anterior quando a
  // variável muda, e o link acaba com a cor do escuro sobre o fundo do claro.
  raiz.setAttribute('data-trocando-tema', '');
  raiz.setAttribute('data-tema', novo);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => raiz.removeAttribute('data-trocando-tema'));
  });

  try {
    localStorage.setItem(CHAVE_TEMA, novo);
  } catch {
    // sem armazenamento local a escolha vale só nesta visita
  }
  montarBarraAno();
}

function montarBarraAno() {
  // Buscar e Ano a ano atravessam todos os exercícios: o seletor ali só
  // confundiria, porque não teria efeito nenhum sobre o que a página mostra.
  const rota = ROTAS.find((r) => r.id === estado.rota);
  const escuro = temaEmUso() === 'escuro';

  // Na tela de escolha os controles não têm sobre o que agir, e um seletor de
  // exercício ao lado da pergunta "qual município?" só rouba atenção.
  if (!estado.municipio) {
    areaAno.replaceChildren();
    return;
  }

  // replaceChildren não descarta null como o el() faz: ele escreve "null" na
  // tela, em letras, ao lado do seletor. Por isso a lista é filtrada antes.
  const controles = [
    seletorMunicipio(estado.municipio, (codigo) => estado.definirMunicipio(codigo)),
    rota && rota.semAno ? null : seletorAno(estado.ano, (ano) => estado.definirAno(ano)),
    botao('Atualizar dados', async () => {
      await cache.limpar();
      limparMemoria();
      desenhar();
    }, { classe: 'botao botao-secundario', titulo: 'Descarta a cópia guardada e consulta o TCE de novo' }),
    botao(escuro ? 'Tema claro' : 'Tema escuro', alternarTema, {
      classe: 'botao botao-secundario',
      titulo: escuro ? 'Mudar para o tema claro' : 'Mudar para o tema escuro',
    }),
  ];
  areaAno.replaceChildren(...controles.filter(Boolean));
}

window.addEventListener('hashchange', () => aplicarHash());

// o município decide quais rotas aparecem no menu, então vem antes dele
estado.municipio = municipioInicial();
if (estado.municipio) definirMunicipio(estado.municipio);

// desenhar() monta menu e barra, então aplicarHash dá conta da partida inteira
aplicarHash();
