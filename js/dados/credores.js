// Quem é o credor de um empenho.
//
// Parece trivial e não é. O TCE identifica o credor por um documento, mas em
// parte dos casos esse documento é um marcador coletivo, não a identidade de
// alguém: em 2025, os 650 empenhos de diária do Crato vêm todos com o mesmo
// documento criptografado, embora tragam 208 nomes diferentes. Agrupar só pelo
// documento, como o site fazia antes, transformava 208 pessoas numa linha só
// com o nome de quem aparecesse primeiro. O mesmo vale para a folha de
// pagamento, que vem em blocos sob um documento único.
//
// A saída não é abandonar o documento, que é o identificador certo para
// empresas: é detectar quando ele deixou de identificar alguém.

import { capitalizar, texto } from '../api/formato.js';
import { agrupar } from './agregacoes.js';

/**
 * Quantos nomes distintos um documento pode carregar antes de deixar de ser
 * identidade. Um CNPJ real aparece com variação de grafia: acento, "LTDA",
 * abreviação, nome fantasia. Nos dados do Crato o maior caso legítimo tem três
 * formas (Fundo de Previdência Social, a mesma sem acento, PREVICRATO); os
 * marcadores coletivos saltam para oito, doze e duzentos e oito. O corte fica
 * no meio dessa distância.
 */
const LIMITE_VARIACOES = 3;

// codigo_tipo_negociante é o tipo do documento do credor. 1 e 2 se leem nos
// próprios dados: 1 traz CNPJ em claro, 2 traz CPF criptografado. 6 e 7 também
// vêm criptografados; 6 rotula folha de pagamento e 7, no exercício inteiro de
// 2025, só apareceu em diária (elemento 33901400). Os rótulos dizem o que se
// observa, sem inventar o que a API não documenta.
const NATUREZAS = {
  1: 'juridica',
  2: 'fisica',
  6: 'folha',
  7: 'fisica',
};

export const ROTULO_NATUREZA = {
  juridica: 'Empresa, órgão ou entidade',
  fisica: 'Pessoa física',
  folha: 'Folha de pagamento',
  outra: 'Não identificado',
};

export function natureza(codigoTipo) {
  return NATUREZAS[Number(texto(codigoTipo))] || 'outra';
}

// estado_empenho não vem documentado na API. O significado foi verificado
// cruzando o exercício de 2025 inteiro com /notas_anulacoes_empenhos: os 9.587
// empenhos "OR" não têm nenhuma nota de anulação; os 552 "AP" e os 199 "AT"
// têm todos. Nos "AT" o valor anulado bate centavo a centavo com o empenhado,
// R$ 3,5 milhões dos dois lados, o que confirma a anulação total.
export const ESTADOS = {
  OR: { rotulo: 'Em vigor', tom: 'ok' },
  AP: { rotulo: 'Anulado em parte', tom: 'atencao' },
  AT: { rotulo: 'Anulado por inteiro', tom: 'erro' },
};

export function estadoEmpenho(codigo) {
  return ESTADOS[texto(codigo).toUpperCase()]
    || { rotulo: texto(codigo) || 'Não informado', tom: 'neutro' };
}

/**
 * Chave natural de um empenho. Precisa dos quatro campos: o número se repete
 * entre órgãos e entre exercícios, e a mesma unidade reemite número em datas
 * diferentes. É a chave que casa a nota de empenho com a nota de anulação,
 * onde o TCE chama o mesmo campo de numero_nota_empenho.
 */
export function chaveEmpenho(orgao, unidade, numero, dataEmissao) {
  return [texto(orgao), texto(unidade), texto(numero), texto(dataEmissao).slice(0, 10)].join('/');
}

export const chaveDoEmpenho = (e) => chaveEmpenho(
  e.codigo_orgao, e.codigo_unidade_orcamentaria, e.numero_empenho, e.data_emissao_empenho);

export const chaveDaAnulacao = (a) => chaveEmpenho(
  a.codigo_orgao, a.codigo_unidade_orcamentaria, a.numero_nota_empenho, a.data_emissao_empenho);

/** Indexa as anulações por empenho. Um empenho pode ser anulado mais de uma vez. */
export function indexarAnulacoes(anulacoes = []) {
  const mapa = new Map();
  for (const a of anulacoes) {
    const k = chaveDaAnulacao(a);
    if (!mapa.has(k)) mapa.set(k, { valor: 0, notas: [] });
    const item = mapa.get(k);
    item.valor += Number(a.valor_anulacao) || 0;
    item.notas.push(a);
  }
  return mapa;
}

const doc = (e) => texto(e.numero_documento_negociante);
const nome = (e) => texto(e.nome_negociante);

/**
 * Marca quais documentos deixaram de identificar uma pessoa só.
 * Devolve um Set com esses documentos.
 */
export function documentosColetivos(empenhos) {
  const nomesPorDoc = new Map();
  for (const e of empenhos) {
    const d = doc(e);
    if (!d) continue;
    if (!nomesPorDoc.has(d)) nomesPorDoc.set(d, new Set());
    nomesPorDoc.get(d).add(nome(e));
  }
  const coletivos = new Set();
  for (const [d, nomes] of nomesPorDoc) {
    if (nomes.size > LIMITE_VARIACOES) coletivos.add(d);
  }
  return coletivos;
}

/**
 * Agrupa os empenhos por credor. Cada grupo ganha:
 *   documento  o documento como veio do TCE
 *   natureza   juridica | fisica | folha | outra
 *   coletivo   true quando o documento é compartilhado e a identidade é o nome
 */
export function agruparCredores(empenhos, anulacoes = []) {
  const coletivos = documentosColetivos(empenhos);
  const anuladas = indexarAnulacoes(anulacoes);
  // quando o documento é coletivo, quem identifica é o nome; o documento
  // continua na chave para que dois homônimos de origens diferentes não virem
  // a mesma pessoa
  const chaveDe = (e) => {
    const d = doc(e);
    if (!d) return 'nome:' + nome(e);
    return coletivos.has(d) ? d + '|' + nome(e) : d;
  };

  const grupos = agrupar(empenhos, chaveDe, ['valor_empenhado'],
    (_, exemplo) => capitalizar(nome(exemplo)) || 'Sem nome informado');

  for (const g of grupos) {
    const exemplo = g.linhas[0];
    g.documento = doc(exemplo);
    g.nome = nome(exemplo);
    g.natureza = natureza(exemplo.codigo_tipo_negociante);
    g.coletivo = coletivos.has(g.documento);
    g.municipio = texto(exemplo.municipio_negociante);

    // o empenhado bruto conta compromisso que depois foi desfeito; sem o
    // desconto, quem teve o empenho cancelado aparece recebendo o que não
    // recebeu
    g.valor_anulado = 0;
    for (const linha of g.linhas) {
      const anulacao = anuladas.get(chaveDoEmpenho(linha));
      linha.valor_anulado = anulacao ? anulacao.valor : 0;
      linha.anulacoes = anulacao ? anulacao.notas : [];
      g.valor_anulado += linha.valor_anulado;
    }
    g.valor_liquido = g.valor_empenhado - g.valor_anulado;
    g.anulados = g.linhas.filter((l) => l.valor_anulado > 0).length;
  }
  return grupos;
}

/** Soma por natureza, para o resumo da página. */
export function porNatureza(grupos) {
  const saida = {};
  for (const g of grupos) {
    const n = g.natureza;
    saida[n] = saida[n] || {
      natureza: n, credores: 0, empenhos: 0, valor: 0, anulado: 0, liquido: 0,
    };
    saida[n].credores += 1;
    saida[n].empenhos += g.quantidade;
    saida[n].valor += g.valor_empenhado;
    saida[n].anulado += g.valor_anulado || 0;
    saida[n].liquido += g.valor_liquido === undefined ? g.valor_empenhado : g.valor_liquido;
  }
  return saida;
}
