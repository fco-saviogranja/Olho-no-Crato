// Formatação de números, datas e textos para leitura de cidadão.

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

const NUM = new Intl.NumberFormat('pt-BR');

export const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

export function dinheiro(valor) {
  const n = Number(valor);
  return BRL.format(Number.isFinite(n) ? n : 0);
}

/** Versão curta para cards e eixos de gráfico: R$ 762,3 mi */
export function dinheiroCurto(valor) {
  const n = Number(valor) || 0;
  const abs = Math.abs(n);
  if (abs >= 1e9) return `R$ ${NUM.format(+(n / 1e9).toFixed(1))} bi`;
  if (abs >= 1e6) return `R$ ${NUM.format(+(n / 1e6).toFixed(1))} mi`;
  if (abs >= 1e3) return `R$ ${NUM.format(+(n / 1e3).toFixed(1))} mil`;
  return dinheiro(n);
}

export function numero(valor) {
  const n = Number(valor);
  return NUM.format(Number.isFinite(n) ? n : 0);
}

export function percentual(parte, total, casas = 1) {
  if (!total) return '0%';
  return `${NUM.format(+((parte / total) * 100).toFixed(casas))}%`;
}

/** A API devolve datas como "2025-01-02T00:00:00". */
export function data(valor) {
  if (!valor) return '';
  const texto = String(valor).slice(0, 10);
  const [ano, mes, dia] = texto.split('-');
  if (!ano || !mes || !dia) return String(valor);
  return `${dia}/${mes}/${ano}`;
}

/** 202501 -> "janeiro de 2025" */
export function mesReferencia(valor) {
  const n = Number(valor);
  if (!n) return '';
  const ano = Math.floor(n / 100);
  const mes = n % 100;
  if (mes < 1 || mes > 12) return String(ano);
  return `${MESES[mes - 1]} de ${ano}`;
}

/** 202500 -> 2025 */
export function anoDoExercicio(valor) {
  const n = Number(valor) || 0;
  return n > 9999 ? Math.floor(n / 100) : n;
}

/**
 * Muitos campos vêm com espaços de preenchimento ou mascarados com asteriscos.
 * Alguns nomes chegam do TCE com bytes quebrados (metade de um caractere
 * acentuado), que viram surrogates soltos e apareceriam como losango preto.
 */
export function texto(valor) {
  if (valor === null || valor === undefined) return '';
  const t = String(valor)
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '')
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '')
    .replace(/�/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (/^\*+$/.test(t)) return 'protegido';
  return t;
}

/** CPF/CNPJ: o TCE entrega CPF criptografado e CNPJ em claro. */
export function documento(valor) {
  const t = texto(valor);
  if (!t) return '';
  const so = t.replace(/\D/g, '');
  if (so.length === 14) {
    return so.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }
  if (so.length === 11) {
    return so.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
  }
  return t.length > 20 ? 'protegido' : t;
}

export function truncar(valor, limite = 90) {
  const t = texto(valor);
  return t.length > limite ? `${t.slice(0, limite - 1)}…` : t;
}

/** Primeira letra maiúscula, resto como veio (nomes do TCE vêm em caixa alta). */
export function capitalizar(valor) {
  const t = texto(valor);
  if (!t) return '';
  if (t === t.toUpperCase() && t.length > 4) {
    return t
      .toLowerCase()
      .replace(/(^|[\s/(-])([a-zà-ú])/g, (_, a, b) => a + b.toUpperCase())
      .replace(/\b(Da|De|Do|Das|Dos|E|Em|Para|Com|A|O|As|Os)\b/g, (m) => m.toLowerCase());
  }
  return t;
}

// Siglas que aparecem no texto dos empenhos do Crato e que perderiam sentido
// em minúscula. A lista é curta de propósito: qualquer palavra que não esteja
// aqui vira minúscula, o que é melhor do que arriscar rebaixar o texto inteiro.
const SIGLAS = new Set([
  'DOM', 'GP', 'INSS', 'IPTU', 'ISS', 'ICMS', 'IRRF', 'FGTS', 'PIS', 'PASEP',
  'CNPJ', 'CPF', 'LTDA', 'ME', 'EPP', 'RPPS', 'RGPS', 'SUS', 'FUNDEB', 'PNAE',
  'PNATE', 'CRAS', 'CREAS', 'UBS', 'SAMU', 'TCE', 'TCU', 'MEI', 'CE', 'EPI',
  'CNH', 'CEP', 'PIB', 'LOA', 'LDO', 'PPA', 'SEDUC', 'FOPAG', 'PSF', 'ESF',
]);

/**
 * Texto corrido em caixa alta vira frase legível.
 *
 * Diferente de capitalizar(), que serve para nomes próprios: o objeto de um
 * empenho tem trezentos caracteres de prosa, e capitalizar cada palavra deixa o
 * parágrafo com cara de manchete, difícil de ler justamente onde a pessoa mais
 * precisa ler. Aqui só a abertura de frase sobe. Palavra com número dentro fica
 * como veio, porque costuma ser número de decreto, processo ou medida.
 */
export function frase(valor) {
  const t = texto(valor);
  if (!t) return '';
  if (t !== t.toUpperCase()) return t;
  const minusculo = t
    .split(/(\s+)/)
    .map((parte) => {
      if (/\d/.test(parte)) return parte;
      if (SIGLAS.has(parte.replace(/[^A-ZÀ-Ú]/g, ''))) return parte;
      return parte.toLowerCase();
    })
    .join('');
  // sobe a primeira letra do texto e a de cada frase seguinte
  return minusculo.replace(/(^\s*|[.!?]\s+)([a-zà-ú])/g,
    (_, antes, letra) => antes + letra.toUpperCase());
}

export function escapar(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
