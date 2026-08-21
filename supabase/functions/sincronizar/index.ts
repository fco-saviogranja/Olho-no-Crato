// Sincronização incremental do Olho no Crato.
//
// A carga completa dos nove exercícios é feita na máquina de quem mantém o
// projeto, com ferramentas/sincronizar.mjs. Esta função cuida só da janela
// recente, que é a única que muda: o exercício corrente e os últimos meses.
// Ela é chamada por pg_cron uma vez por dia.
//
// Rodar de novo não duplica nada. Quando um valor já guardado chega diferente
// do TCE, o gatilho do banco registra a mudança na tabela alteracoes, que é o
// que alimenta a página de retificações.

import { TABELAS, type Tabela } from './tabelas.ts';

const TCE = 'https://api-dados-abertos.tce.ce.gov.br/sim';
const MUNICIPIO = '049';
const LOTE = 500;

const URL_BANCO = Deno.env.get('SUPABASE_URL') ?? '';
const CHAVE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SEGREDO = Deno.env.get('SEGREDO_SINCRONIZACAO') ?? '';

interface Resultado {
  tabela: string;
  periodo: string;
  linhas: number;
  erro?: string;
}

// ---------------------------------------------------------------------------
// TCE
// ---------------------------------------------------------------------------

/** exercicio_orcamento usa AAAA00: mandar 2026 devolve lista vazia sem erro. */
function exercicio(ano: number): number {
  return ano * 100;
}

function referencia(ano: number, mes: number): number {
  return ano * 100 + mes;
}

async function buscarTce(
  path: string,
  params: Record<string, string | number>,
  orderby: string,
): Promise<Record<string, unknown>[]> {
  const linhas: Record<string, unknown>[] = [];
  for (let inicio = 0; inicio < 60000; inicio += 1000) {
    const url = new URL(TCE + path);
    url.searchParams.set('codigo_municipio', MUNICIPIO);
    for (const [chave, valor] of Object.entries(params)) {
      url.searchParams.set(chave, String(valor));
    }
    url.searchParams.set('$orderby', orderby);
    url.searchParams.set('$count', '1000');
    if (inicio) url.searchParams.set('$start_index', String(inicio));

    const resposta = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!resposta.ok) throw new Error('TCE respondeu ' + resposta.status);
    const corpo = await resposta.json();
    if (corpo.__errors__) throw new Error(corpo.__errors__[0]?.message ?? 'consulta recusada');
    const pagina = corpo.elements ?? [];
    linhas.push(...pagina);
    if (pagina.length < 1000) break;
  }
  return linhas;
}

/** Quantas linhas de balancete o mês devolve, até o limite pedido. */
async function quantasLinhas(ano: number, mes: number, limite: number): Promise<number> {
  const url = new URL(TCE + '/balancetes_despesas_orcamentarias');
  url.searchParams.set('codigo_municipio', MUNICIPIO);
  url.searchParams.set('exercicio_orcamento', String(exercicio(ano)));
  url.searchParams.set('data_referencia_doc', String(referencia(ano, mes)));
  url.searchParams.set('$select', 'codigo_orgao');
  url.searchParams.set('$count', String(limite));
  const r = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!r.ok) return 0;
  const c = await r.json();
  return (c.elements ?? []).length;
}

/**
 * O mês recém-publicado costuma aparecer pela metade: o município envia parte
 * das dotações e completa depois. Julho de 2026 chegou com 27 linhas contra
 * 2.641 de junho. Como o balancete traz valores acumulados desde janeiro,
 * gravar um mês incompleto faria o site mostrar R$ 17 milhões no lugar de
 * R$ 811 milhões. Mês completo nunca encolhe em relação ao anterior.
 */
async function mesCompleto(ano: number, mes: number): Promise<boolean> {
  if (mes <= 1) return true;
  const [atual, anterior] = await Promise.all([
    quantasLinhas(ano, mes, 1000),
    quantasLinhas(ano, mes - 1, 1000),
  ]);
  if (!anterior) return true;
  return atual >= anterior * 0.9;
}

/** Último mês com balancete completo publicado, por busca binária. */
async function ultimoMes(ano: number): Promise<number> {
  const teto = ano < new Date().getFullYear() ? 12 : new Date().getUTCMonth() + 1;
  const tem = async (mes: number) => (await quantasLinhas(ano, mes, 1)) > 0;

  let achado: number;
  if (await tem(teto)) {
    achado = teto;
  } else {
    let baixo = 1;
    let alto = teto - 1;
    achado = 0;
    while (baixo <= alto) {
      const meio = Math.floor((baixo + alto) / 2);
      if (await tem(meio)) {
        achado = meio;
        baixo = meio + 1;
      } else {
        alto = meio - 1;
      }
    }
  }

  while (achado > 1 && !(await mesCompleto(ano, achado))) {
    achado -= 1;
  }
  return achado;
}

// ---------------------------------------------------------------------------
// preparo e gravação
// ---------------------------------------------------------------------------

function limpar(valor: unknown): unknown {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === 'string') {
    const t = valor.replace(/\s+/g, ' ').trim();
    return t === '' ? null : t;
  }
  return valor;
}

function pedacoDaChave(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  const t = String(valor).trim();
  return /^\d{4}-\d{2}-\d{2}T/.test(t) ? t.slice(0, 10) : t;
}

async function digerir(texto: string): Promise<string> {
  const bytes = new TextEncoder().encode(texto);
  const resumo = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(resumo))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

async function prepararLinhas(config: Tabela, brutas: Record<string, unknown>[]) {
  const porId = new Map<string, Record<string, unknown>>();
  for (const bruta of brutas) {
    const linha: Record<string, unknown> = {};
    for (const coluna of config.colunas) linha[coluna] = limpar(bruta[coluna]);
    linha.id = config.chave.map((c) => pedacoDaChave(bruta[c])).join('|');
    linha.hash = await digerir(JSON.stringify(config.colunas.map((c) => linha[c])));
    porId.set(linha.id as string, linha);
  }
  return [...porId.values()];
}

async function gravar(tabela: string, linhas: Record<string, unknown>[]) {
  for (let i = 0; i < linhas.length; i += LOTE) {
    const resposta = await fetch(
      URL_BANCO + '/rest/v1/' + tabela + '?on_conflict=id',
      {
        method: 'POST',
        headers: {
          apikey: CHAVE,
          Authorization: 'Bearer ' + CHAVE,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify(linhas.slice(i, i + LOTE)),
      },
    );
    if (!resposta.ok) {
      throw new Error('banco respondeu ' + resposta.status + ': ' + (await resposta.text()).slice(0, 200));
    }
  }
}

async function registrar(tabela: string, periodo: string, dados: Record<string, unknown>) {
  await fetch(URL_BANCO + '/rest/v1/sincronizacoes', {
    method: 'POST',
    headers: {
      apikey: CHAVE,
      Authorization: 'Bearer ' + CHAVE,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify([{ tabela, periodo, ...dados }]),
  });
}

// ---------------------------------------------------------------------------
// janela recente
// ---------------------------------------------------------------------------

async function periodosDe(config: Tabela, ano: number, meses: number) {
  if (config.periodo === 'intervalo') {
    return [{ rotulo: String(ano), params: { data_inicio: ano + '-01-01', data_fim: ano + '-12-31' } }];
  }
  if (config.periodo === 'exercicioIntervalo') {
    return [{
      rotulo: String(ano),
      params: {
        exercicio_orcamento: exercicio(ano),
        data_inicio: ano + '-01-01',
        data_fim: ano + '-12-31',
      },
    }];
  }
  if (config.fechamento) {
    const mes = await ultimoMes(ano);
    if (!mes) return [];
    return [{
      rotulo: ano + '-' + String(mes).padStart(2, '0'),
      params: { exercicio_orcamento: exercicio(ano), data_referencia_doc: referencia(ano, mes) },
    }];
  }
  const ultimo = ano < new Date().getFullYear() ? 12 : new Date().getUTCMonth() + 1;
  const primeiro = Math.max(1, ultimo - meses + 1);
  const lista = [];
  for (let mes = primeiro; mes <= ultimo; mes += 1) {
    lista.push({
      rotulo: ano + '-' + String(mes).padStart(2, '0'),
      params: { exercicio_orcamento: exercicio(ano), data_referencia_doc: referencia(ano, mes) },
    });
  }
  return lista;
}

// ---------------------------------------------------------------------------
// entrada
// ---------------------------------------------------------------------------

Deno.serve(async (requisicao) => {
  if (SEGREDO) {
    const enviado = requisicao.headers.get('x-segredo-sincronizacao');
    if (enviado !== SEGREDO) {
      return new Response(JSON.stringify({ erro: 'não autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }
  if (!URL_BANCO || !CHAVE) {
    return new Response(JSON.stringify({ erro: 'faltam as variáveis do Supabase' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const parametros = new URL(requisicao.url).searchParams;
  const ano = Number(parametros.get('ano')) || new Date().getFullYear();
  const meses = Number(parametros.get('meses')) || 3;
  const filtro = (parametros.get('tabela') || '').split(',').filter(Boolean);
  const alvos = filtro.length ? TABELAS.filter((t) => filtro.includes(t.tabela)) : TABELAS;

  const resultados: Resultado[] = [];
  for (const config of alvos) {
    let periodos;
    try {
      periodos = await periodosDe(config, ano, meses);
    } catch (erro) {
      resultados.push({ tabela: config.tabela, periodo: String(ano), linhas: 0, erro: String(erro) });
      continue;
    }
    for (const periodo of periodos) {
      try {
        const brutas = await buscarTce(config.path, periodo.params, config.chave.join(','));
        const linhas = await prepararLinhas(config, brutas);
        if (linhas.length) await gravar(config.tabela, linhas);
        resultados.push({ tabela: config.tabela, periodo: periodo.rotulo, linhas: linhas.length });
      } catch (erro) {
        resultados.push({
          tabela: config.tabela, periodo: periodo.rotulo, linhas: 0, erro: String(erro).slice(0, 200),
        });
      }
    }
    const daTabela = resultados.filter((r) => r.tabela === config.tabela);
    await registrar(config.tabela, ano + ' (ultimos ' + meses + ' meses)', {
      linhas: daTabela.reduce((s, r) => s + r.linhas, 0),
      concluida_em: new Date().toISOString(),
      erro: daTabela.find((r) => r.erro)?.erro ?? null,
    });
  }

  const total = resultados.reduce((s, r) => s + r.linhas, 0);
  return new Response(JSON.stringify({ ano, meses, total, resultados }, null, 2), {
    headers: { 'Content-Type': 'application/json' },
  });
});
