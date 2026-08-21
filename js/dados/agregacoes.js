// Somatórios e agrupamentos. Nada de rede aqui: entra lista de registros do
// TCE, sai lista pronta para tabela ou gráfico.

export function somar(linhas, campo) {
  let total = 0;
  for (const l of linhas) total += Number(l[campo]) || 0;
  return total;
}

export function somarVarios(linhas, campos) {
  const totais = {};
  for (const c of campos) totais[c] = 0;
  for (const l of linhas) {
    for (const c of campos) totais[c] += Number(l[c]) || 0;
  }
  return totais;
}

/**
 * Agrupa por uma chave e soma os campos pedidos.
 * chave: função que recebe a linha e devolve string, ou nome de campo.
 * Devolve [{ chave, rotulo, quantidade, linhas, ...somas }] sem ordenação.
 */
export function agrupar(linhas, chave, campos, rotulo) {
  const obterChave = typeof chave === 'function' ? chave : (l) => String(l[chave] ?? '').trim();
  const grupos = new Map();
  for (const l of linhas) {
    const k = obterChave(l);
    let g = grupos.get(k);
    if (!g) {
      g = { chave: k, rotulo: k, quantidade: 0, linhas: [] };
      for (const c of campos) g[c] = 0;
      grupos.set(k, g);
    }
    g.quantidade += 1;
    g.linhas.push(l);
    for (const c of campos) g[c] += Number(l[c]) || 0;
  }
  const lista = [...grupos.values()];
  if (rotulo) {
    for (const g of lista) g.rotulo = rotulo(g.chave, g.linhas[0]);
  }
  return lista;
}

export function ordenarPor(lista, campo, crescente = false) {
  const copia = [...lista];
  copia.sort((a, b) => {
    const va = a[campo];
    const vb = b[campo];
    if (typeof va === 'number' && typeof vb === 'number') return crescente ? va - vb : vb - va;
    const ta = String(va ?? '');
    const tb = String(vb ?? '');
    return crescente ? ta.localeCompare(tb, 'pt-BR') : tb.localeCompare(ta, 'pt-BR');
  });
  return copia;
}

/**
 * Mantém os N maiores e junta o resto em "Outros", para gráficos não virarem
 * uma sopa de fatias minúsculas.
 */
export function comOutros(lista, campo, n = 8, nomeResto = 'Outros') {
  const ordenada = ordenarPor(lista, campo);
  if (ordenada.length <= n + 1) return ordenada;
  const principais = ordenada.slice(0, n);
  const resto = ordenada.slice(n);
  const juntos = {
    chave: '__outros__',
    rotulo: `${nomeResto} (${resto.length})`,
    quantidade: resto.reduce((a, g) => a + g.quantidade, 0),
    linhas: [],
  };
  juntos[campo] = resto.reduce((a, g) => a + (Number(g[campo]) || 0), 0);
  return [...principais, juntos];
}

/** Série de 12 meses a partir de registros que tenham data_referencia_doc. */
export function porMes(linhas, campo, ano) {
  const serie = new Array(12).fill(0);
  for (const l of linhas) {
    const ref = Number(l.data_referencia_doc) || 0;
    if (ano && Math.floor(ref / 100) !== Number(ano)) continue;
    const mes = ref % 100;
    if (mes >= 1 && mes <= 12) serie[mes - 1] += Number(l[campo]) || 0;
  }
  return serie;
}

/** Percentual de execução com trava para não estourar em caso de dado torto. */
export function razao(parte, total) {
  if (!total) return 0;
  return parte / total;
}

/** Busca simples por texto em vários campos, sem acento e sem caixa. */
export function semAcento(valor) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function filtrarPorTexto(linhas, termo, campos) {
  const alvo = semAcento(termo).trim();
  if (!alvo) return linhas;
  const partes = alvo.split(/\s+/);
  return linhas.filter((l) => {
    const texto = campos.map((c) => semAcento(l[c])).join(' ');
    return partes.every((p) => texto.includes(p));
  });
}
