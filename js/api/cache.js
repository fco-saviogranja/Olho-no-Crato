// Cache das consultas ao TCE em IndexedDB, com validade e uso como rede de
// segurança quando a API está fora do ar.

const BANCO = 'olho-no-crato';
const LOJA = 'consultas';
const VALIDADE_PADRAO = 24 * 60 * 60 * 1000; // 24 horas

const memoria = new Map();
let promessaBanco = null;

function temIndexedDB() {
  return typeof indexedDB !== 'undefined';
}

function abrir() {
  if (!temIndexedDB()) return Promise.resolve(null);
  if (promessaBanco) return promessaBanco;
  promessaBanco = new Promise((ok) => {
    const req = indexedDB.open(BANCO, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(LOJA)) db.createObjectStore(LOJA);
    };
    req.onsuccess = () => ok(req.result);
    req.onerror = () => ok(null);
  });
  return promessaBanco;
}

function transacao(db, modo, acao) {
  return new Promise((ok) => {
    let resultado;
    const tx = db.transaction(LOJA, modo);
    const req = acao(tx.objectStore(LOJA));
    if (req) req.onsuccess = () => { resultado = req.result; };
    tx.oncomplete = () => ok(resultado);
    tx.onerror = () => ok(undefined);
    tx.onabort = () => ok(undefined);
  });
}

export async function ler(chave) {
  const emMemoria = memoria.get(chave);
  if (emMemoria) return emMemoria;
  const db = await abrir();
  if (!db) return undefined;
  const registro = await transacao(db, 'readonly', (loja) => loja.get(chave));
  if (registro) memoria.set(chave, registro);
  return registro;
}

export async function gravar(chave, dados) {
  const registro = { dados, ts: Date.now() };
  memoria.set(chave, registro);
  const db = await abrir();
  if (!db) return;
  await transacao(db, 'readwrite', (loja) => loja.put(registro, chave));
}

export function expirou(registro, validade = VALIDADE_PADRAO) {
  if (!registro) return true;
  return Date.now() - registro.ts > validade;
}

export async function limpar() {
  memoria.clear();
  const db = await abrir();
  if (!db) return;
  await transacao(db, 'readwrite', (loja) => loja.clear());
}

export async function tamanho() {
  const db = await abrir();
  if (!db) return memoria.size;
  const total = await transacao(db, 'readonly', (loja) => loja.count());
  return total ?? 0;
}
