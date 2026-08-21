// Percorre os 74 endpoints do catalogo com os mesmos parametros que o site
// monta e informa quais respondem, quais vem vazios e quais dao erro.
//
//   node ferramentas/verificar-endpoints.mjs 2025 1
//
// O primeiro argumento e o exercicio e o segundo o mes de referencia.
import { pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const base = pathToFileURL(join(raiz, 'js', 'api')).href + '/';
const { ENDPOINTS } = await import(base + 'catalogo.js');
const t = await import(base + 'tce.js');

const ANO = Number(process.argv[2] || 2025);
const MES = Number(process.argv[3] || 1);

function paramsPara(e) {
  const p = {};
  for (const par of e.params.filter((x) => x.obrigatorio)) {
    switch (par.nome) {
      case 'codigo_municipio': break;
      case 'exercicio_orcamento': p.exercicio_orcamento = ANO; break;
      case 'data_referencia_doc': p.data_referencia_doc = t.referencia(ANO, MES); break;
      case 'data_inicio': p.data_inicio = ANO + '-01-01'; break;
      case 'data_fim': p.data_fim = ANO + '-12-31'; break;
      case 'data_transferencia': p.data_transferencia = ANO + '-01-01'; break;
      default: p[par.nome] = '';
    }
  }
  if (!e.params.some((x) => x.nome === 'codigo_municipio')) p.semMunicipio = true;
  return p;
}

const linhas = [];
for (const e of ENDPOINTS) {
  const params = paramsPara(e);
  try {
    const { dados } = await t.consultar(e.path, params, { limite: 1000, recarregar: true });
    linhas.push({ grupo: e.grupo, id: e.id, n: dados.length, erro: null });
  } catch (erro) {
    linhas.push({ grupo: e.grupo, id: e.id, n: null, erro: erro.message.slice(0, 90) });
  }
}

const comErro = linhas.filter((l) => l.erro);
const vazios = linhas.filter((l) => !l.erro && l.n === 0);
const comDados = linhas.filter((l) => l.n > 0);

console.log('=== exercicio ' + ANO + ', mes de referencia ' + MES);
console.log('total: %d | com dados: %d | vazios: %d | com erro: %d',
  linhas.length, comDados.length, vazios.length, comErro.length);
console.log('\n--- COM ERRO DE PARAMETRO:');
comErro.forEach((l) => console.log('  [%s] %s -> %s', l.grupo, l.id, l.erro));
console.log('\n--- VAZIOS (consulta ok, TCE sem registros):');
vazios.forEach((l) => console.log('  [%s] %s', l.grupo, l.id));
console.log('\n--- COM DADOS:');
comDados.forEach((l) => console.log('  [' + l.grupo + '] ' + l.id.padEnd(58) + l.n));
