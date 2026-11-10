// Tabela com ordenação, busca, paginação e exportação para CSV.
// É usada tanto pelas páginas temáticas quanto pelo explorador, então precisa
// aceitar colunas descritas na mão ou deduzidas do nome do campo.

import {
  anoDoExercicio, data, dinheiro, documento, mesReferencia, numero, texto,
} from '../api/formato.js';
import { apelidoMunicipio } from '../api/tce.js';
import { filtrarPorTexto, ordenarPor } from '../dados/agregacoes.js';
import { el, vazio } from './componentes.js';

const POR_PAGINA = 50;

/** Escolhe o formato pela cara do nome do campo, para o explorador genérico. */
export function formatadorPara(campo) {
  const c = String(campo).toLowerCase();
  if (c === 'exercicio_orcamento') return { fn: anoDoExercicio, tipo: 'numero' };
  if (c === 'data_referencia_doc') return { fn: mesReferencia, tipo: 'texto' };
  if (c.startsWith('valor') || c.startsWith('vl_')) return { fn: dinheiro, tipo: 'dinheiro' };
  if (c.startsWith('data_') || c.endsWith('_data')) return { fn: data, tipo: 'texto' };
  if (c.includes('cpf') || c.includes('cgc') || c.includes('cnpj') || c.includes('documento_negociante')) {
    return { fn: documento, tipo: 'texto' };
  }
  if (c.startsWith('percentual') || c.startsWith('numero_') || c.startsWith('quantidade')) {
    return { fn: texto, tipo: 'texto' };
  }
  return { fn: texto, tipo: 'texto' };
}

function valorFormatado(coluna, linha) {
  if (coluna.formatar) return coluna.formatar(linha[coluna.campo], linha);
  // o tipo declarado pela página manda mais que o palpite pelo nome do campo:
  // colunas como "pago" ou "orcado" são dinheiro sem parecer, porque não
  // começam com "valor_"
  if (coluna.tipo === 'dinheiro') return dinheiro(linha[coluna.campo]);
  return formatadorPara(coluna.campo).fn(linha[coluna.campo]);
}

function tipoDaColuna(coluna) {
  return coluna.tipo || formatadorPara(coluna.campo).tipo;
}

/**
 * Números vão crus para o CSV, para poderem ser somados na planilha, mas com o
 * ruído de ponto flutuante das somas aparado e com vírgula decimal.
 */
function numeroParaCSV(valor, tipo) {
  const arredondado = tipo === 'dinheiro'
    ? valor.toFixed(2)
    : String(Math.round(valor * 1e6) / 1e6);
  return arredondado.replace('.', ',');
}

function paraCSV(colunas, linhas) {
  const cabecalho = colunas.map((c) => c.rotulo);
  const corpo = linhas.map((linha) => colunas.map((coluna) => {
    const cru = linha[coluna.campo];
    // uma coluna que abrevia na tela pode mandar o texto inteiro para o arquivo:
    // a tela tem largura, a planilha não
    if (coluna.csv) return coluna.csv(cru, linha);
    if (typeof cru === 'number') return numeroParaCSV(cru, tipoDaColuna(coluna));
    return texto(valorFormatado(coluna, linha));
  }));
  return [cabecalho, ...corpo]
    .map((linha) => linha.map((celula) => {
      const t = String(celula == null ? '' : celula);
      return /[;"\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    }).join(';'))
    .join('\r\n');
}

export function baixarCSV(nome, colunas, linhas) {
  // o BOM faz o Excel abrir o arquivo em UTF-8 sem estragar os acentos
  const conteudo = '﻿' + paraCSV(colunas, linhas);
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/csv;charset=utf-8' }));
  // O município entra aqui, num lugar só, e não no nome que cada página passa:
  // quem baixa planilha de três cidades para comparar precisa distinguir os
  // arquivos na pasta de downloads, e era o tipo de prefixo que ficaria para
  // trás numa página nova.
  const link = el('a', { href: url, download: apelidoMunicipio() + '-' + nome + '.csv' });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Monta a tabela.
 * colunas: [{ campo, rotulo, tipo, formatar, largura }]
 * opcoes: { busca, camposBusca, ordenarPor: campo, crescente, aoClicarLinha,
 *           nomeArquivo, porPagina, vazioTitulo, vazioTexto }
 */
export function tabela(linhas, colunas, opcoes = {}) {
  const {
    busca = true, aoClicarLinha, expandir, nomeArquivo = 'dados',
    porPagina = POR_PAGINA, vazioTitulo = 'Nenhum registro',
    vazioTexto = 'A consulta não devolveu linhas para este filtro.',
  } = opcoes;

  const camposBusca = opcoes.camposBusca
    || colunas.filter((c) => tipoDaColuna(c) === 'texto').map((c) => c.campo);

  let termo = '';
  let campoOrdem = opcoes.ordenarPor || null;
  let crescente = opcoes.crescente || false;
  let pagina = 1;

  const info = el('p', { class: 'tabela-info' });
  const corpo = el('tbody');
  const cabecalho = el('tr');
  const paginacao = el('div', { class: 'paginacao' });

  const campoBusca = el('input', {
    class: 'campo-busca', type: 'search', placeholder: 'Buscar nesta lista...',
    'aria-label': 'Buscar nesta lista',
  });
  campoBusca.addEventListener('input', () => {
    termo = campoBusca.value;
    pagina = 1;
    desenhar();
  });

  function filtradas() {
    let lista = termo ? filtrarPorTexto(linhas, termo, camposBusca) : linhas;
    if (campoOrdem) lista = ordenarPor(lista, campoOrdem, crescente);
    return lista;
  }

  function desenharCabecalho() {
    cabecalho.replaceChildren();
    for (const coluna of colunas) {
      const ativa = campoOrdem === coluna.campo;
      const seta = ativa ? (crescente ? ' ▲' : ' ▼') : '';
      const th = el('th', {
        class: 'ordenavel ' + tipoDaColuna(coluna),
        style: coluna.largura ? 'width:' + coluna.largura : null,
        title: coluna.ajuda || coluna.rotulo,
        'aria-sort': ativa ? (crescente ? 'ascending' : 'descending') : 'none',
      }, el('button', {
        class: 'ordenar',
        texto: coluna.rotulo + seta,
        onClick: () => {
          if (campoOrdem === coluna.campo) crescente = !crescente;
          else {
            campoOrdem = coluna.campo;
            crescente = tipoDaColuna(coluna) === 'texto';
          }
          pagina = 1;
          desenhar();
        },
      }));
      cabecalho.append(th);
    }
  }

  /**
   * Abre o detalhe da linha numa linha própria logo abaixo, em vez de um painel
   * por cima. Texto comprido, como o objeto de um empenho, fica onde a pessoa
   * estava lendo, e continua funcionando no celular, onde passar o mouse para
   * ver a dica não existe.
   */
  function prepararExpansao(tr, linha) {
    let aberta = null;
    const alternar = () => {
      if (aberta) {
        aberta.remove();
        aberta = null;
        tr.classList.remove('expandida');
        tr.setAttribute('aria-expanded', 'false');
        return;
      }
      const conteudo = expandir(linha);
      if (!conteudo) return;
      // a caixa do detalhe é presa à área visível pelo CSS, com consulta de
      // contêiner: a célula é larga como a tabela inteira, que no celular não
      // cabe na tela
      aberta = el('tr', { class: 'linha-detalhe' },
        el('td', { colspan: String(colunas.length) },
          el('div', { class: 'linha-detalhe-caixa' }, conteudo)));
      tr.after(aberta);
      tr.classList.add('expandida');
      tr.setAttribute('aria-expanded', 'true');
    };
    tr.setAttribute('aria-expanded', 'false');
    tr.addEventListener('click', alternar);
    tr.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        alternar();
      }
    });
  }

  function desenhar() {
    const lista = filtradas();
    const paginas = Math.max(1, Math.ceil(lista.length / porPagina));
    if (pagina > paginas) pagina = paginas;
    const inicio = (pagina - 1) * porPagina;
    const visiveis = lista.slice(inicio, inicio + porPagina);

    desenharCabecalho();
    corpo.replaceChildren();
    for (const linha of visiveis) {
      const tr = el('tr', aoClicarLinha || expandir ? { class: 'clicavel', tabindex: '0' } : {});
      for (const coluna of colunas) {
        const td = el('td', { class: tipoDaColuna(coluna) }, valorFormatado(coluna, linha));
        // texto longo abreviado na célula continua inteiro no atributo, para
        // quem estiver no computador ler sem abrir nada
        if (coluna.dica) td.title = coluna.dica(linha[coluna.campo], linha);
        tr.append(td);
      }
      if (aoClicarLinha) {
        tr.addEventListener('click', () => aoClicarLinha(linha));
        tr.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') aoClicarLinha(linha);
        });
      }
      corpo.append(tr);
      if (expandir) prepararExpansao(tr, linha);
    }

    const total = numero(lista.length);
    const de = lista.length ? numero(inicio + 1) : '0';
    const ate = numero(Math.min(inicio + porPagina, lista.length));
    info.textContent = lista.length === linhas.length
      ? 'Mostrando ' + de + ' a ' + ate + ' de ' + total + ' registros'
      : 'Mostrando ' + de + ' a ' + ate + ' de ' + total + ' encontrados (de ' + numero(linhas.length) + ')';

    paginacao.replaceChildren();
    if (paginas > 1) {
      paginacao.append(
        el('button', {
          class: 'botao-pagina', disabled: pagina === 1, texto: 'Anterior',
          onClick: () => { pagina -= 1; desenhar(); },
        }),
        el('span', { class: 'pagina-atual', texto: 'Página ' + pagina + ' de ' + numero(paginas) }),
        el('button', {
          class: 'botao-pagina', disabled: pagina === paginas, texto: 'Próxima',
          onClick: () => { pagina += 1; desenhar(); },
        }),
      );
    }
  }

  if (!linhas.length) {
    return el('div', { class: 'tabela-caixa' }, vazio(vazioTitulo, vazioTexto));
  }

  const ferramentas = el('div', { class: 'tabela-ferramentas' },
    busca ? campoBusca : null,
    el('button', {
      class: 'botao botao-secundario',
      texto: 'Baixar CSV',
      title: 'Salva o que está filtrado agora, para abrir no Excel ou no LibreOffice',
      onClick: () => baixarCSV(nomeArquivo, colunas, filtradas()),
    }));

  const node = el('div', { class: 'tabela-caixa' },
    ferramentas,
    info,
    el('div', { class: 'tabela-rolagem' },
      el('table', { class: 'tabela' }, el('thead', {}, cabecalho), corpo)),
    paginacao);

  desenhar();
  return node;
}

/** Colunas a partir do catálogo: usa os rótulos em português da própria API. */
export function colunasDoCatalogo(endpoint, camposDesejados) {
  const campos = camposDesejados && camposDesejados.length
    ? camposDesejados
    : Object.keys(endpoint.campos);
  return campos.map((campo) => ({
    campo,
    rotulo: endpoint.campos[campo] || campo,
    ajuda: endpoint.campos[campo],
  }));
}
