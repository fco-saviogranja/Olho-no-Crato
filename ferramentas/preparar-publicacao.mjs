// Monta a pasta publicar/ com o que vai ao ar, e só isso.
//
//   node ferramentas/preparar-publicacao.mjs
//
// Publicar a pasta do projeto inteira levaria junto o .env com a chave de
// serviço, além de scripts e SQL que o site não usa. Por isso a publicação sai
// de uma pasta separada, montada do zero a cada vez e conferida antes de
// fechar: se algo que parece segredo entrar ali, o script aborta.

import {
  copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmdirSync, statSync, unlinkSync,
} from 'node:fs';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = dirname(dirname(fileURLToPath(import.meta.url)));
const destino = join(raiz, 'publicar');

// o que o navegador precisa para o site funcionar
const CONTEUDO = [
  'index.html', 'css', 'js', 'dados',
  // imagem que o WhatsApp e as redes leem ao receber o link
  'compartilhar.png',
  'robots.txt', 'sitemap.xml',
  // lido pelo Cloudflare, não pelo navegador. Não há _redirects: a regra de
  // endereço desconhecido vive no wrangler.jsonc, em not_found_handling, e
  // escrever a mesma regra nos dois lugares faz o Cloudflare recusar o deploy
  // por laço infinito, porque /index.html casaria com a própria regra.
  '_headers',
];

// nunca podem sair daqui, nem por engano
const PROIBIDOS = [/^\.env/, /service[_-]?role/i, /^\.git/];

function listar(pasta, base = pasta) {
  const saida = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) saida.push(...listar(caminho, base));
    else saida.push(relative(base, caminho).replace(/\\/g, '/'));
  }
  return saida;
}

/**
 * Remoção recursiva escrita à mão pelo mesmo motivo da cópia: rmSync recursivo
 * não apaga nada neste caminho com acento no Windows, e pior, não reclama.
 * Uma pasta antiga sobrevivendo aqui faria a conferência de segredo examinar
 * lixo da execução passada em vez do que vai realmente ao ar.
 */
function apagarPasta(alvo = destino) {
  if (!existsSync(alvo)) return;
  for (const nome of readdirSync(alvo)) {
    const caminho = join(alvo, nome);
    if (statSync(caminho).isDirectory()) apagarPasta(caminho);
    else unlinkSync(caminho);
  }
  rmdirSync(alvo);
}

apagarPasta();
mkdirSync(destino, { recursive: true });

/**
 * Cópia recursiva escrita à mão de propósito: cpSync do Node aborta sem
 * mensagem nenhuma quando o caminho tem acento no Windows, e o caminho deste
 * projeto tem.
 */
function copiar(origem, alvo) {
  if (statSync(origem).isDirectory()) {
    mkdirSync(alvo, { recursive: true });
    for (const nome of readdirSync(origem)) copiar(join(origem, nome), join(alvo, nome));
  } else {
    mkdirSync(dirname(alvo), { recursive: true });
    copyFileSync(origem, alvo);
  }
}

for (const item of CONTEUDO) {
  const origem = join(raiz, item);
  if (!existsSync(origem)) {
    console.error('faltando: ' + item);
    process.exit(1);
  }
  copiar(origem, join(destino, item));
}

// A navegação é por hash, então o servidor entrega sempre o index.html da raiz.
// O _redirects vai junto mesmo assim, para que um endereço digitado errado caia
// na página inicial em vez de num 404 do Cloudflare.

const arquivos = listar(destino);
const suspeitos = arquivos.filter((a) => PROIBIDOS.some((p) => p.test(a)));

// confere o conteúdo também: chave de serviço é um JWT com role service_role
const comSegredo = [];
for (const arquivo of arquivos) {
  if (!['.js', '.json', '.html', '.css', '.txt', '.md'].includes(extname(arquivo))) continue;
  const texto = readFileSync(join(destino, arquivo), 'utf8');
  for (const achado of texto.match(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g) || []) {
    try {
      const carga = JSON.parse(Buffer.from(achado.split('.')[1], 'base64url').toString());
      if (carga.role && carga.role !== 'anon') comSegredo.push(arquivo + ' (role ' + carga.role + ')');
    } catch {
      // não é um JWT legível, então não é chave do Supabase
    }
  }
}

if (suspeitos.length || comSegredo.length) {
  console.error('ABORTADO: encontrei o que não pode ir ao ar.');
  for (const s of suspeitos) console.error('  arquivo proibido: ' + s);
  for (const s of comSegredo) console.error('  chave não pública: ' + s);
  apagarPasta();
  if (existsSync(destino)) {
    console.error('\nATENÇÃO: não consegui apagar publicar/. Apague à mão antes de publicar.');
  }
  process.exit(1);
}

const tamanho = arquivos.reduce((total, a) => total + statSync(join(destino, a)).size, 0);
console.log('publicar/ pronta com %d arquivos, %s KB', arquivos.length, Math.round(tamanho / 1024));
console.log('conferido: nenhum .env e nenhuma chave além da anônima.');
// Este script e o build do Cloudflare, que o roda a cada push na main. Rodar
// a mao serve para conferir antes de publicar, ou para servir a pasta local.
if (process.env.CI || process.env.CF_PAGES || process.env.WORKERS_CI) {
  console.log('publicar/ montada pelo build do Cloudflare.');
} else {
  console.log('');
  console.log('Publicar e dar push: o Cloudflare roda este mesmo script na main.');
  console.log('  git push');
  console.log('');
  console.log('Para conferir a pasta montada antes disso:');
  console.log('  node ferramentas/servidor.mjs 5511 publicar');
}
