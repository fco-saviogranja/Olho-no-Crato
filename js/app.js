// Roteador e casca do app. Cada página é um módulo carregado sob demanda que
// exporta montar(raiz, estado).

import { anoAtual, MUNICIPIO, PRIMEIRO_ANO, cache } from './api/tce.js';
import { limparMemoria } from './api/auxiliares.js';
import * as banco from './api/banco.js';
import { botao, carregando, el, erroNaTela, seletorAno } from './ui/componentes.js';

// semAno:   a página atravessa todos os exercícios, então o seletor de ano não
//           teria efeito e só confundiria.
// comBanco: depende do banco de apoio para cruzar exercícios, coisa que a API
//           do TCE não faz. Sem banco configurado a página some do menu, e o
//           resto do site continua funcionando igual.
const ROTAS = [
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

const app = document.getElementById('app');
const navegacao = document.getElementById('navegacao');
const areaAno = document.getElementById('area-ano');

const estado = {
  ano: anoInicial(),
  rota: PADRAO,
  params: new URLSearchParams(),
  navegar(hash) {
    window.location.hash = hash;
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
    aplicarHash({ preservarAno: true });
  },
  recarregar() {
    desenhar();
  },
};

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

function lerHash() {
  const bruto = window.location.hash.replace(/^#\/?/, '');
  const [caminho, consulta] = bruto.split('?');
  const id = caminho || PADRAO;
  return {
    rota: ROTAS.some((r) => r.id === id) ? id : PADRAO,
    params: new URLSearchParams(consulta || ''),
  };
}

function aplicarHash({ preservarAno } = {}) {
  const { rota, params } = lerHash();
  if (preservarAno) {
    params.set('ano', String(estado.ano));
    const consulta = params.toString();
    window.location.hash = '#/' + rota + (consulta ? '?' + consulta : '');
    return;
  }
  const daUrl = Number(params.get('ano'));
  if (daUrl >= PRIMEIRO_ANO && daUrl <= anoAtual() && daUrl !== estado.ano) estado.ano = daUrl;
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

// as rotas dependentes do banco continuam alcançáveis por link direto mesmo
// quando não aparecem no menu: quem chegar nelas vê a explicação da própria página
const ROTAS_NO_MENU = ROTAS.filter((r) => !r.comBanco || banco.configurado());

function montarNavegacao() {
  navegacao.replaceChildren();
  for (const grupo of ['principal', 'mais', 'apoio']) {
    const itens = ROTAS_NO_MENU.filter((r) => r.grupo === grupo);
    if (!itens.length) continue;
    navegacao.append(el('div', { class: 'nav-grupo nav-' + grupo },
      itens.map((r) => el('a', {
        href: '#/' + r.id, dados: { rota: r.id }, texto: r.titulo,
      }))));
  }
}

async function desenhar() {
  const rota = ROTAS.find((r) => r.id === estado.rota) || ROTAS[0];
  marcarNavegacao();
  app.replaceChildren(carregando('Abrindo ' + rota.titulo + '...'));
  document.title = rota.titulo + ' · Olho no Crato';
  window.scrollTo({ top: 0 });

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
  areaAno.replaceChildren(
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
  );
}

window.addEventListener('hashchange', () => aplicarHash());

montarNavegacao();
document.getElementById('nome-municipio').textContent = MUNICIPIO.nome + '/' + MUNICIPIO.uf;
// a barra depende da rota, por isso só é montada depois que aplicarHash a define
aplicarHash();
montarBarraAno();

// o seletor de ano precisa refletir mudanças vindas da URL
window.addEventListener('hashchange', montarBarraAno);
