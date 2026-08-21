// Tradução de códigos para nomes. O SIM devolve quase tudo codificado:
// órgão 08, função 12, elemento 31901300. Sem esta camada o app fala em
// código, e o objetivo é justamente o contrário.
//
// A API não nomeia subfunções nem fontes de recursos. Para esses dois casos o
// app usa as tabelas oficiais do Manual do SIM 2026, convertidas para JSON em
// dados/subfuncoes.json e dados/fontes.json. Programas de governo continuam
// aparecendo pelo código, porque /programas_governo não traz nome nenhum.

import { consultar } from './tce.js';
import { capitalizar, texto } from './formato.js';

const memoria = new Map();

async function umaVez(chave, tarefa) {
  if (!memoria.has(chave)) memoria.set(chave, tarefa());
  try {
    return await memoria.get(chave);
  } catch (erro) {
    memoria.delete(chave);
    throw erro;
  }
}

const ANO_LONGO = 30 * 24 * 3600 * 1000;

/** Chave da dotação usada para achar o nome da ação (projeto ou atividade). */
export function chaveAcao(linha) {
  return [
    linha.codigo_orgao, linha.codigo_unidade_orcamentaria, linha.codigo_programa,
    linha.codigo_projeto_atividade, linha.numero_projeto_atividade, linha.numero_subprojeto_atividade,
  ].map((p) => String(p ?? '').trim()).join('/');
}

/** Funções de governo (Saúde, Educação...). Tabela fixa, não depende do ano. */
export function funcoes() {
  return umaVez('funcoes', async () => {
    const { dados } = await consultar('/funcoes', { semMunicipio: true },
      { select: ['codigo_funcao', 'nome_funcao'], tudo: true, validade: ANO_LONGO });
    const mapa = new Map();
    for (const f of dados) mapa.set(String(f.codigo_funcao).trim(), texto(f.nome_funcao));
    return mapa;
  });
}

async function tabelaLocal(arquivo) {
  const mapa = new Map();
  try {
    const resposta = await fetch(new URL('../../dados/' + arquivo, import.meta.url));
    const json = await resposta.json();
    for (const [codigo, valor] of Object.entries(json)) {
      if (!codigo.startsWith('_')) mapa.set(codigo, valor);
    }
    mapa.creditoFonte = json._fonte || '';
    mapa.grupos = json._grupos || null;
  } catch {
    // sem a tabela o app segue mostrando o código
  }
  return mapa;
}

/** Subfunções: tabela oficial do Manual do SIM, a API só devolve o código. */
export function subfuncoes() {
  return umaVez('subfuncoes', () => tabelaLocal('subfuncoes.json'));
}

/** Fontes de recursos: idem, com o nome analítico dos nove dígitos. */
export function fontes() {
  return umaVez('fontes', () => tabelaLocal('fontes.json'));
}

/** Órgãos da prefeitura no exercício (secretarias, fundos, câmara). */
export function orgaos(ano) {
  return umaVez(`orgaos:${ano}`, async () => {
    const { dados } = await consultar('/orgaos', { ano },
      { select: ['codigo_orgao', 'nome_orgao', 'codigo_tipo_unidade', 'cgc_orgao'], tudo: true });
    const mapa = new Map();
    for (const o of dados) {
      mapa.set(String(o.codigo_orgao).trim(), {
        nome: texto(o.nome_orgao),
        tipo: texto(o.codigo_tipo_unidade),
        cnpj: texto(o.cgc_orgao),
      });
    }
    return mapa;
  });
}

/** Unidades orçamentárias dentro de cada órgão. */
export function unidades(ano) {
  return umaVez(`unidades:${ano}`, async () => {
    const { dados } = await consultar('/unidades_orcamentarias', { ano },
      { select: ['codigo_orgao', 'codigo_unidade_orcamentaria', 'nome_unidade'], tudo: true });
    const mapa = new Map();
    for (const u of dados) {
      const chave = `${String(u.codigo_orgao).trim()}/${String(u.codigo_unidade_orcamentaria).trim()}`;
      mapa.set(chave, texto(u.nome_unidade));
    }
    return mapa;
  });
}

/** Elementos de despesa (Vencimentos, Material de Consumo, Obras...). */
export function elementos(ano) {
  return umaVez(`elementos:${ano}`, async () => {
    const { dados } = await consultar('/orcamento_despesa', { ano },
      { select: ['codigo_elemento_despesa', 'nome_elemento_despesa'], tudo: true });
    const mapa = new Map();
    for (const e of dados) {
      const codigo = String(e.codigo_elemento_despesa).trim();
      if (!mapa.has(codigo)) mapa.set(codigo, texto(e.nome_elemento_despesa));
    }
    return mapa;
  });
}

/** Ações do orçamento: o nome do projeto ou atividade de cada dotação. */
export function acoes(ano) {
  return umaVez(`acoes:${ano}`, async () => {
    const { dados } = await consultar('/orcamento_despesas_projetos_atividades', { ano }, {
      select: ['codigo_orgao', 'codigo_unidade_orcamentaria', 'codigo_programa',
        'codigo_projeto_atividade', 'numero_projeto_atividade', 'numero_subprojeto_atividade',
        'nome_projeto_atividade'],
      tudo: true,
    });
    const mapa = new Map();
    for (const a of dados) {
      const chave = chaveAcao(a);
      if (!mapa.has(chave)) mapa.set(chave, texto(a.nome_projeto_atividade));
    }
    return mapa;
  });
}

/** Rubricas de receita, com a descrição que vem no próprio orçamento. */
export function rubricas(ano) {
  return umaVez(`rubricas:${ano}`, async () => {
    const { dados } = await consultar('/orcamento_receita', { ano },
      { select: ['codigo_rubrica', 'descricao_rubrica'], tudo: true });
    const mapa = new Map();
    for (const r of dados) {
      const codigo = String(r.codigo_rubrica).trim();
      if (!mapa.has(codigo)) mapa.set(codigo, texto(r.descricao_rubrica));
    }
    return mapa;
  });
}

/**
 * Carrega de uma vez os dicionários usados pelas páginas de despesa.
 * Falha de um deles não derruba os outros: quem não carregar mostra o código.
 */
const SEM_ANO = new Set(['funcoes', 'subfuncoes', 'fontes']);

export async function dicionarios(ano, extras = []) {
  const pedidos = { funcoes, subfuncoes, fontes, orgaos, elementos, unidades, acoes, rubricas };
  const nomes = ['funcoes', 'subfuncoes', 'fontes', 'orgaos', 'elementos', 'unidades', ...extras];
  const resultados = await Promise.allSettled(
    nomes.map((n) => (SEM_ANO.has(n) ? pedidos[n]() : pedidos[n](ano))),
  );
  const dic = {};
  nomes.forEach((n, i) => {
    dic[n] = resultados[i].status === 'fulfilled' ? resultados[i].value : new Map();
  });
  for (const n of Object.keys(pedidos)) {
    if (!dic[n]) dic[n] = new Map();
  }
  return dic;
}

export function nomeFuncao(dic, codigo) {
  const c = String(codigo ?? '').trim();
  const nome = dic.funcoes.get(c);
  return nome ? capitalizar(nome) : `Função ${c}`;
}

export function nomeSubfuncao(dic, codigo) {
  const c = String(codigo ?? '').trim();
  return dic.subfuncoes.get(c) || `Subfunção ${c}`;
}

export function nomeOrgao(dic, codigo) {
  const c = String(codigo ?? '').trim();
  const reg = dic.orgaos.get(c);
  return reg ? capitalizar(reg.nome) : `Órgão ${c}`;
}

export function nomeUnidade(dic, orgao, unidade) {
  const chave = `${String(orgao ?? '').trim()}/${String(unidade ?? '').trim()}`;
  const nome = dic.unidades.get(chave);
  return nome ? capitalizar(nome) : `Unidade ${chave}`;
}

export function nomeElemento(dic, codigo) {
  const c = String(codigo ?? '').trim();
  const nome = dic.elementos.get(c);
  return nome ? capitalizar(nome) : `Elemento ${c}`;
}

export function nomeAcao(dic, linha) {
  const nome = dic.acoes.get(chaveAcao(linha));
  return nome ? capitalizar(nome) : `Ação ${String(linha.numero_projeto_atividade ?? '').trim()}`;
}

/** Nome analítico da fonte de nove dígitos, com recuo para o grupo de três. */
export function nomeFonte(dic, codigo) {
  const c = String(codigo ?? '').trim();
  const registro = dic.fontes.get(c);
  if (registro && registro.nome) return registro.nome;
  const grupo = c.slice(0, 3);
  const nomeGrupo = dic.fontes.grupos && dic.fontes.grupos[grupo];
  return nomeGrupo || 'Fonte ' + c;
}

export function grupoFonte(dic, codigo) {
  const c = String(codigo ?? '').trim().slice(0, 3);
  const registro = dic.fontes.get(String(codigo ?? '').trim());
  if (registro && registro.grupoNome) return registro.grupoNome;
  const nomeGrupo = dic.fontes.grupos && dic.fontes.grupos[c];
  return nomeGrupo || 'Fonte ' + c;
}

export function nomeRubrica(dic, codigo) {
  const c = String(codigo ?? '').trim();
  const nome = dic.rubricas.get(c);
  return nome ? capitalizar(nome) : `Rubrica ${c}`;
}

export function limparMemoria() {
  memoria.clear();
}
