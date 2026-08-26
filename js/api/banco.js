// Cliente do banco de apoio no Supabase.
//
// Regra que vale para o site inteiro: o banco é opcional. Se não estiver
// configurado, se estiver pausado ou se demorar, nada quebra; a página segue
// com o que vem da API do TCE. Por isso todo erro aqui vira "indisponível" em
// vez de exceção, e quem chama decide o que mostrar.

import { BANCO, ESPERA_BANCO } from '../config.js';

const CONFIGURADO = Boolean(BANCO.url && BANCO.chavePublica);

let estadoAtual = CONFIGURADO ? 'desconhecido' : 'ausente';
let verificacao = null;
let ultimaFalha = 0;

export function configurado() {
  return CONFIGURADO;
}

/** ausente: não configurado. ativo: respondendo. indisponivel: fora do ar. */
export function estado() {
  return estadoAtual;
}

function cabecalhos(extras = {}) {
  return {
    apikey: BANCO.chavePublica,
    Authorization: 'Bearer ' + BANCO.chavePublica,
    Accept: 'application/json',
    ...extras,
  };
}

async function pedir(caminho, opcoes = {}) {
  if (!CONFIGURADO) return null;
  const controle = new AbortController();
  const relogio = setTimeout(() => controle.abort(), opcoes.espera || ESPERA_BANCO);
  try {
    const resposta = await fetch(BANCO.url.replace(/\/+$/, '') + caminho, {
      method: opcoes.method || 'GET',
      headers: cabecalhos(opcoes.headers),
      body: opcoes.body,
      signal: controle.signal,
    });
    clearTimeout(relogio);
    if (!resposta.ok) {
      // 4xx é erro de consulta, e não sinal de banco fora do ar
      if (resposta.status >= 500) {
        estadoAtual = 'indisponivel';
        ultimaFalha = Date.now();
      }
      return null;
    }
    estadoAtual = 'ativo';
    return resposta;
  } catch {
    clearTimeout(relogio);
    estadoAtual = 'indisponivel';
    ultimaFalha = Date.now();
    return null;
  }
}

/**
 * Confere se o banco responde.
 *
 * Uma falha não desliga o recurso para sempre: depois de uma carência a
 * verificação é refeita. Sem isso, um único engasgo de rede logo na abertura
 * da página deixaria a busca indisponível até o visitante recarregar, que foi
 * exatamente o que aconteceu no primeiro teste.
 */
const CARENCIA = 30000;

export function disponivel() {
  if (!CONFIGURADO) return Promise.resolve(false);
  if (estadoAtual === 'ativo') return Promise.resolve(true);
  if (estadoAtual === 'indisponivel' && Date.now() - ultimaFalha < CARENCIA) {
    return Promise.resolve(false);
  }
  if (!verificacao) {
    verificacao = confirmar().then((ok) => {
      verificacao = null;
      return ok;
    });
  }
  return verificacao;
}

/**
 * A primeira requisição de uma página fria estoura o tempo limite com
 * frequência: DNS, aperto de mão TLS e verificação de CORS acontecem enquanto o
 * navegador ainda busca os módulos do site, e o conjunto passa dos seis
 * segundos. A segunda tentativa reaproveita a conexão já aberta e responde em
 * menos de meio segundo. Sem esse retorno, a busca aparecia como indisponível
 * para quem tem o banco no ar, que era o caso aqui.
 */
async function confirmar() {
  const sonda = '/rest/v1/sincronizacoes?select=tabela&limit=1';
  if (await pedir(sonda)) return true;
  await new Promise((ok) => setTimeout(ok, 500));
  return Boolean(await pedir(sonda));
}

/**
 * Consulta uma tabela ou visão pelo PostgREST.
 * filtros seguem a sintaxe do PostgREST: { exercicio: 'eq.2025' }
 */
export async function selecionar(recurso, filtros = {}, opcoes = {}) {
  const busca = new URLSearchParams();
  busca.set('select', opcoes.campos || '*');
  for (const [chave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== null && valor !== '') busca.set(chave, valor);
  }
  if (opcoes.ordem) busca.set('order', opcoes.ordem);
  if (opcoes.limite) busca.set('limit', String(opcoes.limite));
  if (opcoes.deslocamento) busca.set('offset', String(opcoes.deslocamento));
  const resposta = await pedir('/rest/v1/' + recurso + '?' + busca.toString(), opcoes);
  if (!resposta) return null;
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

/** Chama uma função do banco (as buscas textuais são feitas assim). */
/**
 * Igual a selecionar(), mas traz tudo, em blocos.
 *
 * O PostgREST devolve no maximo mil linhas por requisicao, e o balancete de um
 * exercicio do Crato passa de duas mil e oitocentas. Sem isto, a copia guardada
 * no banco entregaria um terco do orcamento como se fosse o total, que e o tipo
 * de erro que ninguem percebe olhando a tela.
 */
export async function selecionarTudo(recurso, filtros = {}, opcoes = {}) {
  const bloco = opcoes.bloco || 1000;
  const teto = opcoes.maxBlocos || 20;
  const tudo = [];
  for (let n = 0; n < teto; n += 1) {
    const pagina = await selecionar(recurso, filtros,
      Object.assign({}, opcoes, { limite: bloco, deslocamento: n * bloco }));
    if (!pagina) return tudo.length ? tudo : null;
    tudo.push(...pagina);
    if (pagina.length < bloco) break;
  }
  return tudo;
}

export async function chamar(funcao, argumentos = {}, opcoes = {}) {
  const resposta = await pedir('/rest/v1/rpc/' + funcao, {
    ...opcoes,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(argumentos),
  });
  if (!resposta) return null;
  try {
    return await resposta.json();
  } catch {
    return null;
  }
}

/** Quando a última carga rodou, para carimbar as telas que usam o banco. */
export async function ultimaCarga() {
  const linhas = await selecionar('sincronizacoes', {}, {
    campos: 'tabela,linhas,concluida_em',
    ordem: 'concluida_em.desc',
    limite: 1,
  });
  return linhas && linhas.length ? linhas[0] : null;
}
