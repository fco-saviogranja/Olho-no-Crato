// Cliente da API de Dados Abertos do SIM/TCE-CE.
//
// Cuidados que esta camada resolve de uma vez por todas:
//  - exercicio_orcamento usa o formato AAAA00 (2025 vira 202500). Mandar 2025
//    devolve lista vazia com HTTP 200, sem erro nenhum.
//  - data_referencia_doc usa AAAAMM (janeiro de 2025 vira 202501).
//  - data_inicio e data_fim exigem aaaa-mm-dd.
//  - cada resposta traz no maximo 1000 registros; passar disso exige $start_index.

import * as cache from './cache.js';

export const BASE = 'https://api-dados-abertos.tce.ce.gov.br/sim';

export const MUNICIPIO = {
  codigo: '049',
  nome: 'Crato',
  uf: 'CE',
  ibge: '2304202',
};

export const PRIMEIRO_ANO = 2018;
export const LIMITE_PAGINA = 1000;

export class ErroTCE extends Error {
  constructor(mensagem, detalhes = {}) {
    super(mensagem);
    this.name = 'ErroTCE';
    Object.assign(this, detalhes);
  }
}

/** 2025 vira 202500 */
export function exercicio(ano) {
  const n = Number(ano);
  return n > 9999 ? n : n * 100;
}

/** (2025, 3) vira 202503 */
export function referencia(ano, mes) {
  return Number(ano) * 100 + Number(mes);
}

export function anoAtual() {
  return new Date().getFullYear();
}

export function anosDisponiveis() {
  const anos = [];
  for (let a = anoAtual(); a >= PRIMEIRO_ANO; a -= 1) anos.push(a);
  return anos;
}

/**
 * Traduz parametros amigaveis para os nomes que a API espera.
 * Aceita tambem os nomes crus, usados pelo explorador.
 */
export function montarParams(params = {}) {
  const saida = {};
  const semMunicipio = params.semMunicipio === true;
  for (const [chave, valor] of Object.entries(params)) {
    if (chave === 'semMunicipio') continue;
    if (valor === undefined || valor === null || valor === '') continue;
    switch (chave) {
      case 'ano':
      case 'exercicio_orcamento':
        // vale tanto para o apelido amigavel quanto para o nome cru vindo do
        // explorador: 2025 e 202500 chegam ao TCE do mesmo jeito
        saida.exercicio_orcamento = exercicio(valor);
        break;
      case 'mes':
        saida.data_referencia_doc = Number(valor);
        break;
      case 'inicio':
        saida.data_inicio = valor;
        break;
      case 'fim':
        saida.data_fim = valor;
        break;
      case 'data_transferencia':
        // este campo é timestamp, e o TCE exige aaaa-mm-ddThh:mm:ss
        saida.data_transferencia = /^\d{4}-\d{2}-\d{2}$/.test(valor) ? valor + 'T00:00:00' : valor;
        break;
      default:
        saida[chave] = valor;
    }
  }
  if (!('codigo_municipio' in saida) && !semMunicipio) {
    saida.codigo_municipio = MUNICIPIO.codigo;
  }
  return saida;
}

function montarUrl(path, params, opcoes) {
  const { select, orderby, inicio = 0, limite = LIMITE_PAGINA } = opcoes;
  const url = new URL(BASE + path);
  for (const [chave, valor] of Object.entries(params)) {
    url.searchParams.set(chave, valor);
  }
  if (select && select.length) url.searchParams.set('$select', select.join(','));
  if (orderby) url.searchParams.set('$orderby', orderby);
  url.searchParams.set('$count', String(limite));
  if (inicio) url.searchParams.set('$start_index', String(inicio));
  return url.toString();
}

async function buscarUrl(url, opcoes = {}) {
  const { tentativas = 3, espera = 30000 } = opcoes;
  let ultimoErro;
  for (let tentativa = 1; tentativa <= tentativas; tentativa += 1) {
    const controle = new AbortController();
    const relogio = setTimeout(() => controle.abort(), espera);
    try {
      const resposta = await fetch(url, {
        signal: controle.signal,
        headers: { Accept: 'application/json' },
      });
      clearTimeout(relogio);
      if (resposta.status === 400) {
        const corpo = await resposta.json().catch(() => null);
        const msg = corpo && corpo.__errors__ && corpo.__errors__[0]
          ? corpo.__errors__[0].message
          : 'Parametros invalidos.';
        throw new ErroTCE(msg, { url, definitivo: true });
      }
      if (resposta.status === 404) {
        throw new ErroTCE(
          'Este conjunto de dados consta na documentação do TCE, mas o servidor responde que ele '
          + 'não existe. Nada a fazer do lado de cá: é uma lacuna da própria API.',
          { url, definitivo: true },
        );
      }
      if (!resposta.ok) throw new ErroTCE('O TCE respondeu ' + resposta.status + '.', { url });
      const corpo = await resposta.json();
      if (corpo.__errors__) {
        const msg = corpo.__errors__[0] ? corpo.__errors__[0].message : 'Consulta recusada pelo TCE.';
        throw new ErroTCE(msg, { url, definitivo: true });
      }
      return corpo.elements || [];
    } catch (erro) {
      clearTimeout(relogio);
      ultimoErro = erro;
      if (erro.definitivo) break;
      if (tentativa < tentativas) {
        await new Promise((ok) => setTimeout(ok, 500 * 2 ** (tentativa - 1)));
      }
    }
  }
  if (ultimoErro && ultimoErro.name === 'AbortError') {
    throw new ErroTCE('O TCE demorou demais para responder.', { url });
  }
  if (ultimoErro instanceof ErroTCE) throw ultimoErro;
  throw new ErroTCE('Nao foi possivel falar com o TCE. Verifique a conexao.', { url, causa: ultimoErro });
}

/**
 * Consulta um endpoint do SIM.
 * Devolve { dados, origem: rede | cache | cache-antigo, ts, paginas }.
 */
export async function consultar(path, params = {}, opcoes = {}) {
  const {
    select, orderby, tudo = false, limite = LIMITE_PAGINA,
    maxPaginas = 40, progresso, validade, recarregar = false, semCache = false,
  } = opcoes;

  const finais = montarParams(params);
  const chave = montarUrl(path, finais, { select, orderby, limite }) + (tudo ? '|tudo' : '');

  // a carga inicial do banco percorre centenas de milhares de linhas: guardar
  // tudo em cache so serviria para estourar a memoria do processo
  if (semCache) {
    const dados = [];
    let paginas = 0;
    for (let inicio = 0; paginas < maxPaginas; inicio += limite) {
      const pagina = await buscarUrl(montarUrl(path, finais, { select, orderby, inicio, limite }));
      dados.push(...pagina);
      paginas += 1;
      if (progresso) progresso(dados.length, paginas);
      if (!tudo || pagina.length < limite) break;
    }
    return { dados, origem: 'rede', ts: Date.now(), paginas };
  }

  if (!recarregar) {
    const guardado = await cache.ler(chave);
    if (guardado && !cache.expirou(guardado, validade)) {
      return { dados: guardado.dados, origem: 'cache', ts: guardado.ts, paginas: 0 };
    }
  }

  try {
    const dados = [];
    let paginas = 0;
    for (let inicio = 0; paginas < maxPaginas; inicio += limite) {
      const url = montarUrl(path, finais, { select, orderby, inicio, limite });
      const pagina = await buscarUrl(url);
      dados.push(...pagina);
      paginas += 1;
      if (progresso) progresso(dados.length, paginas);
      if (!tudo || pagina.length < limite) break;
    }
    await cache.gravar(chave, dados);
    return { dados, origem: 'rede', ts: Date.now(), paginas };
  } catch (erro) {
    const guardado = await cache.ler(chave);
    if (guardado) {
      return { dados: guardado.dados, origem: 'cache-antigo', ts: guardado.ts, paginas: 0, erro };
    }
    throw erro;
  }
}

/** Executa varias consultas com concorrencia limitada, preservando a ordem. */
export async function emLote(itens, tarefa, concorrencia = 4) {
  const saida = new Array(itens.length);
  let proximo = 0;
  const trabalhadores = Array.from(
    { length: Math.min(concorrencia, itens.length) },
    async () => {
      while (proximo < itens.length) {
        const indice = proximo;
        proximo += 1;
        saida[indice] = await tarefa(itens[indice], indice);
      }
    },
  );
  await Promise.all(trabalhadores);
  return saida;
}

/**
 * Ultimo mes do exercicio que ja tem balancete publicado.
 * Anos fechados terminam em dezembro; o ano corrente e descoberto por busca
 * binaria (3 ou 4 consultas leves em vez de 12).
 */
export async function ultimoMesComDados(ano, opcoes = {}) {
  const teto = ano < anoAtual() ? 12 : new Date().getMonth() + 1;

  const temDados = async (mes) => (await quantasLinhas(ano, mes, opcoes, 1)) > 0;

  let achado;
  if (await temDados(teto)) {
    achado = teto;
  } else {
    let baixo = 1;
    let alto = teto - 1;
    achado = 0;
    while (baixo <= alto) {
      const meio = Math.floor((baixo + alto) / 2);
      if (await temDados(meio)) {
        achado = meio;
        baixo = meio + 1;
      } else {
        alto = meio - 1;
      }
    }
  }

  while (achado > 1 && !(await mesCompleto(ano, achado, opcoes))) {
    achado -= 1;
  }
  return achado;
}

/** Quantas linhas de balancete o mês devolve, até o limite pedido. */
async function quantasLinhas(ano, mes, opcoes, limite) {
  const resposta = await consultar('/balancetes_despesas_orcamentarias', {
    ano, mes: referencia(ano, mes),
  }, Object.assign({ select: ['codigo_orgao'], limite }, opcoes));
  return resposta.dados.length;
}

/**
 * O mês recém-publicado costuma aparecer pela metade: o município envia parte
 * das dotações e completa depois. Em julho de 2026, por exemplo, o balancete
 * chegou com 27 linhas contra 2.641 de junho. Como os valores do balancete são
 * acumulados desde janeiro, aceitar um mês incompleto faria o site mostrar
 * R$ 17 milhões no lugar de R$ 811 milhões.
 *
 * O teste é comparar o tamanho do mês com o do anterior: mês completo nunca
 * encolhe, porque o número de dotações é estável ao longo do exercício.
 */
async function mesCompleto(ano, mes, opcoes) {
  if (mes <= 1) return true;
  const [atual, anterior] = await Promise.all([
    quantasLinhas(ano, mes, opcoes, LIMITE_PAGINA),
    quantasLinhas(ano, mes - 1, opcoes, LIMITE_PAGINA),
  ]);
  if (!anterior) return true;
  return atual >= anterior * 0.9;
}

export { cache };
