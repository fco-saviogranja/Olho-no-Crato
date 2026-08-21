// Pictogramas das funções de governo.
//
// Desenhados aqui em SVG, e não exportados de uma ferramenta de design, por
// três motivos: herdam a cor do texto e por isso funcionam no tema claro e no
// escuro sem duas versões; pesam cerca de trezentos bytes cada, contra dezenas
// de kilobytes de uma imagem; e escalam sem borrar em qualquer tamanho.
//
// O traço segue a direção 1b: reto, ponta quadrada, canto vivo, sem gradiente
// e sem sombra. São apoio à leitura, nunca portadores únicos de significado,
// então o nome da função aparece escrito ao lado em todos os lugares.

const NS = 'http://www.w3.org/2000/svg';

const FORMAS = {
  // 01 Legislativa: tribuna
  '01': '<path d="M5 6h14v4H5z" class="cheio"/><path d="M12 10v8"/><path d="M7 21h10"/>',
  // 02 Judiciária: balança
  '02': '<path d="M12 4v16M7 21h10M4 8h16"/><path d="M4 8l-2 5h4zM20 8l-2 5h4z"/>',
  // 03 Essencial à Justiça: código de leis
  '03': '<path d="M5 3h14v18H5z"/><path d="M9 3v18"/><path d="M12 9h4M12 13h4"/>',
  // 04 Administração: prédio público com colunas
  '04': '<path d="M2 9L12 4l10 5"/><path d="M5 9v10M9.5 9v10M14.5 9v10M19 9v10"/><path d="M2 21h20"/>',
  // 05 Defesa Nacional: escudo
  '05': '<path d="M12 3l8 3v7l-8 8-8-8V6z"/>',
  // 06 Segurança Pública: cadeado
  '06': '<path d="M5 11h14v10H5z"/><path d="M8.5 11V7h7v4"/>',
  // 07 Relações Exteriores: globo
  '07': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3.5 4 3.5 14 0 18M12 3c-3.5 4-3.5 14 0 18"/>',
  // 08 Assistência Social: duas pessoas
  '08': '<circle cx="8" cy="7" r="3"/><path d="M2 20v-4h12v4"/><circle cx="18" cy="9" r="2.5"/><path d="M14 20v-3h8v3"/>',
  // 09 Previdência Social: tempo e dinheiro
  '09': '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 3"/>',
  // 10 Saúde: cruz
  '10': '<path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" class="cheio"/>',
  // 11 Trabalho: maleta
  '11': '<path d="M2 8h20v12H2z"/><path d="M8.5 8V4h7v4"/><path d="M2 13h20"/>',
  // 12 Educação: chapéu de formatura
  '12': '<path d="M12 4L2 9l10 5 10-5z"/><path d="M6 11.5V18h12v-6.5"/>',
  // 13 Cultura: folhetos de cordel na corda
  '13': '<path d="M2 5h20"/><path d="M6 5v8h4V5M14 5v10h4V5"/><path d="M6.5 8h3M14.5 8h3M6.5 10.5h3M14.5 10.5h3"/>',
  // 14 Direitos da Cidadania: voz do cidadão
  '14': '<circle cx="11" cy="5" r="2.5"/><path d="M11 8v8"/><path d="M11 11L6 14M11 11l6-6"/><path d="M11 16l-3 5M11 16l3 5"/>',
  // 15 Urbanismo: quadra de prédios
  '15': '<path d="M2 21V11h6v10M8 21V4h7v17M15 21v-7h7v7"/><path d="M1 21h22"/><path d="M4 14h2M11 8h2M18 17h2"/>',
  // 16 Habitação: casa
  '16': '<path d="M2 11L12 3l10 8"/><path d="M5 11v10h14V11"/><path d="M10 21v-6h4v6"/>',
  // 17 Saneamento: gota
  '17': '<path d="M12 3l6 8c2 4-1 9-6 9s-8-5-6-9z"/>',
  // 18 Gestão Ambiental: folha
  '18': '<path d="M21 3c-10 0-17 5-17 12v4h4c9 0 13-6 13-16z"/><path d="M5 20L17 8"/>',
  // 19 Ciência e Tecnologia: frasco
  '19': '<path d="M9 3v7L3 20h18L15 10V3"/><path d="M8 3h8"/><path d="M6 15h12"/>',
  // 20 Agricultura: plantio
  '20': '<path d="M1 21h22"/><path d="M6 21v-7M6 14l-3-3M6 14l3-3"/><path d="M12 21v-10M12 11l-3-3M12 11l3-3"/><path d="M18 21v-7M18 14l-3-3M18 14l3-3"/>',
  // 21 Organização Agrária: terreno demarcado
  '21': '<path d="M3 7h18v14H3z"/><path d="M12 7v14M3 14h18"/><path d="M7 3v4M17 3v4"/>',
  // 22 Indústria: fábrica
  '22': '<path d="M2 21V11l6 4V11l6 4V5h6v16z"/><path d="M1 21h22"/>',
  // 23 Comércio e Serviços: sacola
  '23': '<path d="M4 8h16l-1 13H5z"/><path d="M8.5 8V4h7v4"/>',
  // 24 Comunicações: antena
  '24': '<path d="M12 21v-9"/><path d="M8 12h8l-4-5z"/><path d="M5 9L8 4M19 9l-3-5M2 11L6 3M22 11l-4-8"/>',
  // 25 Energia: raio
  '25': '<path d="M13 2L4 14h6l-1 8 9-12h-6z" class="cheio"/>',
  // 26 Transporte: caminhão
  '26': '<path d="M2 6h11v10H2z"/><path d="M13 9h4l4 4v3h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  // 27 Desporto e Lazer: bola
  '27': '<circle cx="12" cy="12" r="9"/><path d="M12 7l4.5 3.5-1.7 5.5h-5.6L7.5 10.5z" class="cheio"/><path d="M12 3v4M3.5 10l4 .5M20.5 10l-4 .5M7 20l2.2-4M17 20l-2.2-4"/>',
  // 28 Encargos Especiais: cédula
  '28': '<path d="M2 7h20v10H2z"/><circle cx="12" cy="12" r="3"/><path d="M5 10v4M19 10v4"/>',
  // 99 Reserva de Contingência: cofre
  '99': '<path d="M3 4h18v16H3z"/><circle cx="11" cy="12" r="3.5"/><path d="M11 12h6"/><path d="M6 20v2M18 20v2"/>',
};

/**
 * Devolve o pictograma da função, ou nulo quando o código não tem símbolo.
 * O elemento é decorativo: quem lê com leitor de tela ouve o nome escrito.
 */
export function pictogramaFuncao(codigo) {
  const chave = String(codigo ?? '').trim().padStart(2, '0');
  const formas = FORMAS[chave];
  if (!formas) return null;
  const s = document.createElementNS(NS, 'svg');
  s.setAttribute('viewBox', '0 0 24 24');
  s.setAttribute('class', 'pictograma');
  s.setAttribute('aria-hidden', 'true');
  s.setAttribute('focusable', 'false');
  s.innerHTML = formas;
  return s;
}

export function temPictograma(codigo) {
  return Boolean(FORMAS[String(codigo ?? '').trim().padStart(2, '0')]);
}
