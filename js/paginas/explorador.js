// Explorador dos dados brutos: abre qualquer um dos 74 endpoints do SIM que o
// app cobre, monta o formulário a partir do catálogo e mostra o resultado em
// tabela, com exportação para CSV.
//
// Esta página é inteiramente movida pelo catálogo gerado da especificação
// OpenAPI, então acompanhar uma mudança da API é regerar o catálogo.

import { BASE, consultar, montarParams, referencia } from '../api/tce.js';
import { ENDPOINTS, GRUPOS, POR_ID } from '../api/catalogo.js';
import { MESES, numero } from '../api/formato.js';
import {
  aviso, botao, carimbo, carregando, el, erroNaTela, secao, vazio,
} from '../ui/componentes.js';
import { colunasDoCatalogo, tabela } from '../ui/tabela.js';

export const titulo = 'Dados brutos';

const ROTULOS_PADRAO = {
  data_inicio: 'Data inicial',
  data_fim: 'Data final',
  exercicio_orcamento: 'Exercício',
  data_referencia_doc: 'Mês de referência',
  codigo_municipio: 'Município',
};

export async function montar(raiz, estado) {
  const idInicial = estado.params.get('endpoint');
  let selecionado = POR_ID[idInicial] || POR_ID.notas_empenhos || ENDPOINTS[0];
  let grupoAtivo = selecionado.grupo;

  raiz.append(el('div', { class: 'topo-pagina' },
    el('h1', { texto: 'Dados brutos do TCE' }),
    el('p', { class: 'linha-fina' },
      'Os ' + ENDPOINTS.length + ' conjuntos de dados do Sistema de Informações Municipais que este '
      + 'site cobre, sem intermediação. Escolha um, ajuste o período e baixe o CSV.')));

  raiz.append(aviso('info',
    'Esta é a mesma informação que alimenta as demais páginas, na forma em que o TCE entrega. '
    + 'Serve para conferir qualquer número mostrado no site.'));

  const seletorGrupo = el('div', { class: 'chips' });
  const seletorEndpoint = el('select', { class: 'seletor', 'aria-label': 'Conjunto de dados' });
  const descricaoEndpoint = el('p', { class: 'nota' });
  const formulario = el('div', { class: 'formulario' });
  const resultado = el('div', {});

  function desenharGrupos() {
    seletorGrupo.replaceChildren();
    for (const g of GRUPOS) {
      seletorGrupo.append(el('button', {
        class: 'chip' + (g.sigla === grupoAtivo ? ' ativo' : ''),
        title: g.descricao,
        texto: g.sigla + ' (' + g.total + ')',
        onClick: () => {
          grupoAtivo = g.sigla;
          selecionado = ENDPOINTS.find((e) => e.grupo === g.sigla);
          desenharGrupos();
          desenharEndpoints();
          desenharFormulario();
          resultado.replaceChildren();
        },
      }));
    }
    const grupo = GRUPOS.find((g) => g.sigla === grupoAtivo);
    if (grupo) descricaoEndpoint.textContent = grupo.nome + ': ' + grupo.descricao;
  }

  function desenharEndpoints() {
    seletorEndpoint.replaceChildren();
    for (const e of ENDPOINTS.filter((x) => x.grupo === grupoAtivo)) {
      seletorEndpoint.append(el('option', {
        value: e.id, selected: e.id === selecionado.id,
      }, e.titulo));
    }
  }

  seletorEndpoint.addEventListener('change', () => {
    selecionado = POR_ID[seletorEndpoint.value];
    desenharFormulario();
    resultado.replaceChildren();
  });

  function desenharFormulario() {
    formulario.replaceChildren();
    const obrigatorios = selecionado.params.filter((p) => p.obrigatorio);

    for (const p of obrigatorios) {
      if (p.nome === 'codigo_municipio') continue;
      formulario.append(campoDe(p, estado));
    }

    const opcionais = selecionado.params.filter((p) => !p.obrigatorio);
    if (opcionais.length) {
      const extra = el('details', { class: 'campo-extra' },
        el('summary', { texto: 'Filtros opcionais (' + opcionais.length + ')' }),
        el('div', { class: 'formulario' }, opcionais.map((p) => campoDe(p, estado))));
      formulario.append(extra);
    }

    formulario.append(el('div', { class: 'campo' },
      el('span', { texto: ' ' }),
      botao('Consultar', consultarAgora)));
  }

  function campoDe(p, est) {
    const rotulo = p.rotulo || ROTULOS_PADRAO[p.nome] || p.nome;
    let entrada;

    if (p.nome === 'exercicio_orcamento') {
      entrada = el('select', { class: 'seletor', dados: { param: p.nome } });
      for (let ano = new Date().getFullYear(); ano >= 2018; ano -= 1) {
        entrada.append(el('option', { value: ano, selected: ano === est.ano }, String(ano)));
      }
    } else if (p.nome === 'data_referencia_doc') {
      entrada = el('select', { class: 'seletor', dados: { param: p.nome } });
      for (let m = 1; m <= 12; m += 1) {
        entrada.append(el('option', {
          value: referencia(est.ano, m), selected: m === 1,
        }, MESES[m - 1] + ' de ' + est.ano));
      }
    } else if (p.nome === 'data_inicio' || p.nome === 'data_fim') {
      entrada = el('input', {
        type: 'date', class: 'campo-texto', dados: { param: p.nome },
        value: p.nome === 'data_inicio' ? est.ano + '-01-01' : est.ano + '-12-31',
      });
    } else if (p.nome === 'data_transferencia') {
      entrada = el('input', {
        type: 'date', class: 'campo-texto', dados: { param: p.nome },
        value: est.ano + '-01-01',
      });
    } else {
      entrada = el('input', {
        type: 'text', class: 'campo-texto', dados: { param: p.nome },
        placeholder: p.obrigatorio ? 'obrigatório' : 'opcional',
      });
    }

    return el('label', { class: 'campo' },
      el('span', { texto: rotulo, title: p.rotulo }), entrada);
  }

  async function consultarAgora() {
    const params = {};
    let faltando = null;
    for (const entrada of formulario.querySelectorAll('[data-param]')) {
      const nome = entrada.dataset.param;
      const valor = entrada.value.trim();
      const definicao = selecionado.params.find((p) => p.nome === nome);
      if (!valor) {
        if (definicao && definicao.obrigatorio) faltando = definicao;
        continue;
      }
      params[nome] = valor;
    }

    if (faltando) {
      resultado.replaceChildren(aviso('alerta',
        'Preencha o campo obrigatório: ' + (faltando.rotulo || faltando.nome) + '.'));
      return;
    }

    const precisaMunicipio = selecionado.params.some((p) => p.nome === 'codigo_municipio');
    if (!precisaMunicipio) params.semMunicipio = true;

    resultado.replaceChildren(carregando('Consultando ' + selecionado.path + '...'));
    try {
      const { dados, origem, ts } = await consultar(selecionado.path, params, { tudo: true, maxPaginas: 10 });

      resultado.replaceChildren();
      if (!dados.length) {
        resultado.append(vazio('Nenhum registro',
          'A consulta funcionou, mas o TCE não tem registros do Crato para estes parâmetros. '
          + 'Vazio aqui costuma significar que o município não enviou esses dados.'));
      } else {
        const campos = Object.keys(dados[0]);
        resultado.append(tabela(dados, colunasDoCatalogo(selecionado, campos), {
          nomeArquivo: 'crato-' + selecionado.id,
          porPagina: 40,
        }));
        if (dados.length >= 10000) {
          resultado.append(aviso('alerta',
            'A consulta parou em ' + numero(dados.length) + ' registros, que é o teto do explorador. '
            + 'Reduza o período para ver o restante.'));
        }
      }
      resultado.append(consultaFeita(params));
      resultado.append(carimbo({ origem, ts, endpoints: [selecionado.id] }));
    } catch (erro) {
      resultado.replaceChildren(erroNaTela(erro, consultarAgora));
    }
  }

  /** Mostra a consulta como ela foi de fato para o TCE, já com AAAA00. */
  function consultaFeita(params) {
    const enviados = montarParams(params);
    const partes = Object.entries(enviados).map(([chave, valor]) => chave + '=' + valor);
    const endereco = BASE + selecionado.path + '?' + partes.join('&');
    return el('p', { class: 'nota' },
      'Consulta enviada ao TCE: ',
      el('a', { class: 'codigo', href: endereco, target: '_blank', rel: 'noopener', texto: endereco }));
  }

  const bloco = secao({
    titulo: 'Escolha o conjunto de dados',
    descricao: 'Os grupos seguem a organização do próprio TCE.',
  });
  bloco.corpo.append(
    seletorGrupo,
    descricaoEndpoint,
    el('label', { class: 'campo' }, el('span', { texto: 'Conjunto' }), seletorEndpoint),
    formulario,
  );
  raiz.append(bloco);
  raiz.append(resultado);

  desenharGrupos();
  desenharEndpoints();
  desenharFormulario();
}
