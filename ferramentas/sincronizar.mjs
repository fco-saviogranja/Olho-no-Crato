// Carrega no Supabase os dados do TCE que o site precisa cruzar entre
// exercicios. Roda na sua maquina, com a chave de servico no ambiente.
//
//   set SUPABASE_URL=https://xxxx.supabase.co
//   set SUPABASE_SERVICE_KEY=eyJ...
//   node ferramentas/sincronizar.mjs
//
// Opcoes:
//   --tabela=empenhos,contratos   so estas tabelas (padrao: todas)
//   --de=2018 --ate=2026          intervalo de exercicios (padrao: 2018 ate hoje)
//   --lote=500                    linhas por requisicao ao Supabase
//   --simular                     busca no TCE e mostra o que faria, sem gravar
//
// A carga e idempotente: rodar de novo nao duplica nada, so atualiza o que
// mudou e registra a mudanca na tabela alteracoes.

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const { TABELAS } = await import(pathToFileURL(join(raiz, 'ferramentas', 'tabelas.mjs')).href);
const tce = await import(pathToFileURL(join(raiz, 'js', 'api', 'catalogo.js')).href)
  .then(() => import(pathToFileURL(join(raiz, 'js', 'api', 'tce.js')).href));
const { POR_ID } = await import(pathToFileURL(join(raiz, 'js', 'api', 'catalogo.js')).href);

// ---------------------------------------------------------------------------
// configuracao
// ---------------------------------------------------------------------------

function lerArgumento(nome, padrao) {
  const achado = process.argv.find((a) => a.startsWith('--' + nome + '='));
  return achado ? achado.split('=').slice(1).join('=') : padrao;
}

function lerEnvLocal() {
  for (const caminho of [join(raiz, '.env'), join(raiz, 'supabase', '.env')]) {
    try {
      // O Bloco de Notas do Windows grava UTF-8 com marca de ordem de byte, e
      // essa marca invisível grudaria na primeira chave do arquivo,
      // transformando SUPABASE_URL em algo que não é lido por ninguém. Quem
      // edita o .env está trocando uma credencial, geralmente com pressa, e
      // não merece caçar um caractere que não aparece na tela.
      const bruto = readFileSync(caminho, 'utf8').replace(/^﻿/, '');
      for (const linha of bruto.split('\n')) {
        const limpa = linha.trim();
        if (!limpa || limpa.startsWith('#')) continue;
        const corte = limpa.indexOf('=');
        if (corte < 0) continue;
        const chave = limpa.slice(0, corte).trim();
        if (!process.env[chave]) {
          process.env[chave] = limpa.slice(corte + 1).trim().replace(/^["']|["']$/g, '');
        }
      }
    } catch {
      // arquivo opcional
    }
  }
}

lerEnvLocal();

const URL_SUPABASE = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const CHAVE = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const SIMULAR = process.argv.includes('--simular');
const LOTE = Number(lerArgumento('lote', 500));
const DE = Number(lerArgumento('de', 2018));
const ATE = Number(lerArgumento('ate', new Date().getFullYear()));
const FILTRO = lerArgumento('tabela', '').split(',').filter(Boolean);

if (!SIMULAR && (!URL_SUPABASE || !CHAVE)) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_KEY no ambiente.');
  console.error('Rode com --simular para ver o que seria carregado sem gravar nada.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// preparo das linhas
// ---------------------------------------------------------------------------

function limpar(valor) {
  if (valor === null || valor === undefined) return null;
  if (typeof valor === 'string') {
    const t = valor
      .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '')
      .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    return t === '' ? null : t;
  }
  return valor;
}

function pedacoDaChave(valor) {
  if (valor === null || valor === undefined) return '';
  const t = String(valor).trim();
  // datas viram so o dia, para a chave nao depender do fuso nem da hora zerada
  return /^\d{4}-\d{2}-\d{2}T/.test(t) ? t.slice(0, 10) : t;
}

function prepararLinha(config, colunas, bruta) {
  const linha = {};
  for (const coluna of colunas) {
    linha[coluna] = limpar(bruta[coluna]);
  }
  linha.id = config.chave.map((c) => pedacoDaChave(bruta[c])).join('|');
  linha.hash = createHash('sha256')
    .update(JSON.stringify(colunas.map((c) => linha[c])))
    .digest('hex')
    .slice(0, 32);
  return linha;
}

function colunasDe(config) {
  const endpoint = POR_ID[config.endpoint];
  const ignorar = new Set(['codigo_municipio', ...(config.ignorar || [])]);
  return Object.keys(endpoint.campos).filter((c) => !ignorar.has(c));
}

// ---------------------------------------------------------------------------
// gravacao no Supabase
// ---------------------------------------------------------------------------

async function chamarSupabase(caminho, opcoes = {}) {
  const resposta = await fetch(URL_SUPABASE + caminho, {
    ...opcoes,
    headers: {
      apikey: CHAVE,
      Authorization: 'Bearer ' + CHAVE,
      'Content-Type': 'application/json',
      ...(opcoes.headers || {}),
    },
  });
  if (!resposta.ok) {
    const corpo = await resposta.text();
    throw new Error('Supabase ' + resposta.status + ': ' + corpo.slice(0, 300));
  }
  return resposta;
}

async function gravar(tabela, linhas) {
  if (!linhas.length || SIMULAR) return;
  for (let i = 0; i < linhas.length; i += LOTE) {
    const lote = linhas.slice(i, i + LOTE);
    await chamarSupabase('/rest/v1/' + tabela + '?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(lote),
    });
  }
}

async function contarAlteracoes(tabela, desde) {
  if (SIMULAR) return 0;
  const consulta = '/rest/v1/alteracoes?select=id&tabela=eq.' + tabela
    + '&percebida_em=gte.' + encodeURIComponent(desde);
  const resposta = await chamarSupabase(consulta, {
    headers: { Prefer: 'count=exact', Range: '0-0' },
  });
  const faixa = resposta.headers.get('content-range') || '';
  return Number(faixa.split('/')[1]) || 0;
}

async function registrarSincronizacao(tabela, periodo, dados) {
  if (SIMULAR) return;
  await chamarSupabase('/rest/v1/sincronizacoes', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([{ tabela, periodo, ...dados }]),
  });
}

// ---------------------------------------------------------------------------
// percursos no tempo
// ---------------------------------------------------------------------------

async function periodosDe(config, ano) {
  if (config.periodo === 'intervalo') {
    return [{ rotulo: String(ano), params: { inicio: ano + '-01-01', fim: ano + '-12-31' } }];
  }
  if (config.periodo === 'exercicioIntervalo') {
    return [{
      rotulo: String(ano),
      params: { ano, inicio: ano + '-01-01', fim: ano + '-12-31' },
    }];
  }
  if (config.periodo === 'exercicioMes') {
    if (config.fechamento) {
      const mes = await tce.ultimoMesComDados(ano, { semCache: true });
      if (!mes) return [];
      return [{
        rotulo: ano + '-' + String(mes).padStart(2, '0'),
        params: { ano, mes: tce.referencia(ano, mes) },
      }];
    }
    const limite = ano < new Date().getFullYear() ? 12 : new Date().getMonth() + 1;
    return Array.from({ length: limite }, (_, i) => ({
      rotulo: ano + '-' + String(i + 1).padStart(2, '0'),
      params: { ano, mes: tce.referencia(ano, i + 1) },
    }));
  }
  throw new Error('periodo desconhecido: ' + config.periodo);
}

// ---------------------------------------------------------------------------
// execucao
// ---------------------------------------------------------------------------

const alvos = FILTRO.length ? TABELAS.filter((t) => FILTRO.includes(t.tabela)) : TABELAS;
const inicio = Date.now();
let totalLinhas = 0;
let totalAlteracoes = 0;

console.log('Carga do Olho no Crato: %d tabelas, exercicios de %d a %d%s',
  alvos.length, DE, ATE, SIMULAR ? ' (simulacao, nada sera gravado)' : '');
console.log('Destino: %s\n', SIMULAR ? 'nenhum' : URL_SUPABASE);

for (const config of alvos) {
  const colunas = colunasDe(config);
  const endpoint = POR_ID[config.endpoint];
  let linhasDaTabela = 0;
  let alteracoesDaTabela = 0;
  const comecou = new Date().toISOString();

  for (let ano = DE; ano <= ATE; ano += 1) {
    let periodos;
    try {
      periodos = await periodosDe(config, ano);
    } catch (erro) {
      console.log('  %s %d: nao foi possivel determinar o periodo (%s)',
        config.tabela, ano, erro.message.slice(0, 60));
      continue;
    }

    for (const periodo of periodos) {
      try {
        // sem ordenacao explicita, duas paginas seguidas podem repetir ou pular
        // uma linha; ordenar pela chave natural torna a paginacao deterministica
        const { dados } = await tce.consultar(endpoint.path, periodo.params, {
          tudo: true, maxPaginas: 60, semCache: true, orderby: config.chave.join(','),
        });
        if (!dados.length) continue;

        const preparadas = new Map();
        for (const bruta of dados) {
          const linha = prepararLinha(config, colunas, bruta);
          preparadas.set(linha.id, linha);
        }
        const linhas = [...preparadas.values()];

        await gravar(config.tabela, linhas);
        linhasDaTabela += linhas.length;
        const duplicadas = dados.length - linhas.length;
        console.log('  %s %s: %d linhas%s',
          config.tabela.padEnd(20), periodo.rotulo, linhas.length,
          duplicadas ? ' (' + duplicadas + ' repetidas na origem)' : '');
      } catch (erro) {
        console.log('  %s %s: ERRO %s',
          config.tabela.padEnd(20), periodo.rotulo, erro.message.slice(0, 120));
        await registrarSincronizacao(config.tabela, periodo.rotulo, {
          linhas: 0, concluida_em: new Date().toISOString(), erro: erro.message.slice(0, 500),
        });
      }
    }
  }

  alteracoesDaTabela = await contarAlteracoes(config.tabela, comecou);
  await registrarSincronizacao(config.tabela, DE + '-' + ATE, {
    linhas: linhasDaTabela,
    alteradas: alteracoesDaTabela,
    concluida_em: new Date().toISOString(),
  });

  totalLinhas += linhasDaTabela;
  totalAlteracoes += alteracoesDaTabela;
  console.log('  %s: %d linhas%s\n', config.tabela, linhasDaTabela,
    alteracoesDaTabela ? ', ' + alteracoesDaTabela + ' valores alterados desde a ultima carga' : '');
}

const minutos = ((Date.now() - inicio) / 60000).toFixed(1);
console.log('Fim: %s linhas em %s minutos.', totalLinhas.toLocaleString('pt-BR'), minutos);
if (totalAlteracoes) {
  console.log('%d campos mudaram em relacao ao que ja estava guardado. '
    + 'Veja a visao retificacoes.', totalAlteracoes);
}
