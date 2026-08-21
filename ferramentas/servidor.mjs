// Servidor local para ver o site.
//
// Existe em Node, e não só em Python, porque Node já é obrigatório aqui: é o
// que monta a pasta de publicação e o que o Cloudflare roda no build. Depender
// também de Python significava que a primeira instrução do README quebrava em
// máquina onde o Python não está no PATH, que é o padrão no Windows quando se
// instala sem marcar a caixa.
//
//   node ferramentas/servidor.mjs                 serve o projeto na 5510
//   node ferramentas/servidor.mjs 5511 publicar   serve a pasta pronta
//
// Nada de cache: durante o desenvolvimento, arquivo guardado pelo navegador
// esconde a correção que se acabou de fazer e faz procurar defeito onde não há.

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const PORTA = Number(process.env.PORT || process.argv[2] || 5510);
const PASTA = resolve(RAIZ, process.argv[3] || '.');

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.yaml': 'text/plain; charset=utf-8',
};

/**
 * Servir a raiz do projeto significa ter o .env, com a chave que grava no
 * banco, a um GET de distância. Uma página qualquer aberta no navegador não
 * consegue ler a resposta de outra origem, mas contar só com isso é apostar
 * numa proteção que existe para outro fim. Arquivo que começa com ponto não
 * é do site: .env, .git e .gitignore ficam de fora, sempre.
 */
function escondido(pedido) {
  return pedido.split(/[/\\]/).some((parte) => parte.startsWith('.') && parte !== '.' && parte !== '..');
}

createServer((req, res) => {
  const pedido = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (escondido(pedido)) {
    res.writeHead(403).end('arquivo oculto não é servido');
    return;
  }
  // normalize resolve os ".." antes da checagem; sem isso um pedido a
  // /../../.env sairia da pasta servida
  let caminho = join(PASTA, normalize(pedido));
  if (!caminho.startsWith(PASTA + sep) && caminho !== PASTA) {
    res.writeHead(403).end('fora da pasta servida');
    return;
  }

  if (existsSync(caminho) && statSync(caminho).isDirectory()) {
    caminho = join(caminho, 'index.html');
  }
  // a navegação é por hash, então endereço desconhecido cai na página inicial
  if (!existsSync(caminho)) caminho = join(PASTA, 'index.html');
  if (!existsSync(caminho)) {
    res.writeHead(404).end('não encontrado');
    return;
  }

  res.writeHead(200, {
    'Content-Type': TIPOS[extname(caminho).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  });
  createReadStream(caminho).pipe(res);
}).listen(PORTA, '127.0.0.1', () => {
  const nome = PASTA === RAIZ ? 'o projeto' : PASTA.slice(RAIZ.length + 1) + '/';
  console.log('servindo ' + nome + ' em http://localhost:' + PORTA);
  console.log('Ctrl+C para parar');
});
