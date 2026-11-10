// Contratos e licitações do exercício: o que a prefeitura comprou, de quem,
// por quanto e com base em qual processo.

import { consultar, MUNICIPIO } from '../api/tce.js';
import { capitalizar, data, dinheiro, documento, numero, texto, truncar } from '../api/formato.js';
import { agrupar, ordenarPor, somar } from '../dados/agregacoes.js';
import {
  abas, aviso, botao, carimbo, carregando, cartao, el, erroNaTela, gaveta, grade,
  listaDetalhes, ranking, secao, vazio,
} from '../ui/componentes.js';
import { tabela } from '../ui/tabela.js';

const CAMPOS_CONTRATO = [
  'data_contrato', 'numero_contrato', 'valor_total_contrato', 'descricao_objeto_contrato',
  'data_inicio_vigencia_contrato', 'data_fim_vigencia_contrato', 'nome_fiscal_contrato',
  'numero_processo_adm', 'numero_contrato_original', 'tipo_contrato', 'modalide_contrato',
  'numero_id_contrato_pncp',
];

const CAMPOS_CONTRATADO = [
  'data_contrato', 'numero_contrato', 'nome_negociante', 'numero_documento_negociante',
  'codigo_tipo_negociante', 'nome_municipio_negociante',
];

const CAMPOS_LICITACAO = [
  'data_realizacao_autuacao_licitacao', 'numero_licitacao', 'descricao_objeto_licitacao',
  'valor_orcado_estimado', 'data_realizacao_licitacao', 'data_homologacao',
  'nome_responsavel_homologacao', 'modalidade_licitacao', 'tipo_licitacao',
  'modalidade_processo_administrativo', 'descricao_fundamentacao_legal',
  'descricao_url_plataforma_contratacao', 'numero_id_contratacao_pncp',
];

export const titulo = 'Contratos';

function periodo(ano) {
  return { inicio: ano + '-01-01', fim: ano + '-12-31' };
}

function chaveContrato(linha) {
  return String(linha.numero_contrato || '').trim() + '@' + String(linha.data_contrato || '').slice(0, 10);
}

export async function montar(raiz, estado) {
  raiz.append(carregando('Buscando contratos de ' + estado.ano + '...'));
  const { inicio, fim } = periodo(estado.ano);

  try {
    const [contratos, contratados] = await Promise.all([
      consultar('/contratos', { inicio, fim }, { tudo: true, select: CAMPOS_CONTRATO }),
      consultar('/contratados', { inicio, fim }, { tudo: true, select: CAMPOS_CONTRATADO }),
    ]);

    const porContrato = new Map();
    for (const c of contratados.dados) {
      const chave = chaveContrato(c);
      if (!porContrato.has(chave)) porContrato.set(chave, []);
      porContrato.get(chave).push(c);
    }

    const linhas = contratos.dados.map((c) => {
      const partes = porContrato.get(chaveContrato(c)) || [];
      return Object.assign({}, c, {
        contratados: partes,
        nome_contratado: partes.length
          ? capitalizar(partes[0].nome_negociante) + (partes.length > 1 ? ' e mais ' + (partes.length - 1) : '')
          : 'não informado',
        objeto: texto(c.descricao_objeto_contrato),
      });
    });

    raiz.replaceChildren();
    raiz.append(el('div', { class: 'topo-pagina' },
      el('h1', { texto: 'Contratos e licitações' }),
      el('p', { class: 'linha-fina' },
        'Contratos celebrados em ' + estado.ano + ' e os processos que os originaram.')));

    if (!linhas.length) {
      raiz.append(vazio('Nenhum contrato em ' + estado.ano,
        'O TCE não devolveu contratos celebrados por ' + MUNICIPIO.nome + ' nesse período.'));
      return;
    }

    raiz.append(resumo(linhas));

    const bloco = secao({});
    bloco.corpo.append(abas([
      { id: 'contratos', titulo: 'Contratos (' + numero(linhas.length) + ')', montar: (c) => c.append(listaContratos(linhas, estado)) },
      { id: 'empresas', titulo: 'Empresas contratadas', montar: (c) => c.append(porEmpresa(linhas, estado)) },
      { id: 'licitacoes', titulo: 'Licitações e processos', montar: (c) => montarLicitacoes(c, estado) },
      { id: 'itens', titulo: 'Itens contratados', montar: (c) => montarItens(c, estado) },
    ]));
    raiz.append(bloco);

    raiz.append(carimbo({
      origem: contratos.origem, ts: contratos.ts, endpoints: ['contratos', 'contratados'],
    }));
  } catch (erro) {
    raiz.replaceChildren(erroNaTela(erro, () => estado.recarregar()));
  }
}

function resumo(linhas) {
  const total = somar(linhas, 'valor_total_contrato');
  const aditivos = linhas.filter((l) => texto(l.numero_contrato_original)).length;
  const maior = ordenarPor(linhas, 'valor_total_contrato')[0];

  return grade(
    cartao({
      titulo: 'Valor contratado', valor: total, tom: 'empenhado',
      detalhe: numero(linhas.length) + ' contratos e aditivos registrados',
      ajuda: 'Soma do valor total de cada contrato celebrado no exercício. Não é o valor pago.',
    }),
    cartao({
      titulo: 'Aditivos', valor: numero(aditivos), tom: 'neutro',
      detalhe: 'Contratos que alteram um contrato anterior',
    }),
    cartao({
      titulo: 'Maior contrato', valor: maior ? maior.valor_total_contrato : 0, tom: 'previsto',
      detalhe: maior ? truncar(maior.objeto, 60) : '',
    }),
  );
}

function listaContratos(linhas, estado) {
  return tabela(linhas, [
    { campo: 'data_contrato', rotulo: 'Data', formatar: (v) => data(v) },
    { campo: 'numero_contrato', rotulo: 'Número', tipo: 'texto' },
    { campo: 'nome_contratado', rotulo: 'Contratado', tipo: 'texto' },
    { campo: 'objeto', rotulo: 'Objeto', tipo: 'texto', formatar: (v) => truncar(v, 110) },
    { campo: 'valor_total_contrato', rotulo: 'Valor', tipo: 'dinheiro' },
  ], {
    ordenarPor: 'valor_total_contrato',
    camposBusca: ['objeto', 'nome_contratado', 'numero_contrato'],
    aoClicarLinha: (linha) => abrirContrato(linha),
    nomeArquivo: '' + estado.ano + '-contratos',
  });
}

function abrirContrato(linha) {
  const conteudo = el('div', {},
    listaDetalhes([
      ['Valor total', dinheiro(linha.valor_total_contrato)],
      ['Assinado em', data(linha.data_contrato)],
      ['Vigência', data(linha.data_inicio_vigencia_contrato) + ' a ' + data(linha.data_fim_vigencia_contrato)],
      ['Processo administrativo', texto(linha.numero_processo_adm) || 'não informado'],
      ['Fiscal do contrato', capitalizar(linha.nome_fiscal_contrato) || 'não informado'],
      texto(linha.numero_contrato_original)
        ? ['Altera o contrato', texto(linha.numero_contrato_original)] : null,
      texto(linha.numero_id_contrato_pncp)
        ? ['Identificador no PNCP', texto(linha.numero_id_contrato_pncp)] : null,
      ['Códigos do TCE', 'tipo ' + texto(linha.tipo_contrato) + ', modalidade ' + texto(linha.modalide_contrato)],
    ]),
    el('h3', { texto: 'Objeto' }),
    el('p', { texto: texto(linha.descricao_objeto_contrato) || 'não informado' }),
    el('h3', { texto: 'Quem foi contratado' }),
    linha.contratados.length
      ? el('ul', { class: 'lista-simples' }, linha.contratados.map((c) => el('li', {},
        capitalizar(c.nome_negociante) + ' · ' + documento(c.numero_documento_negociante)
        + (texto(c.nome_municipio_negociante) ? ' · ' + capitalizar(c.nome_municipio_negociante) : ''))))
      : el('p', { class: 'nota', texto: 'O TCE não devolveu o contratado deste contrato.' }));

  gaveta('Contrato ' + texto(linha.numero_contrato), conteudo);
}

function porEmpresa(linhas, estado) {
  const expandido = [];
  for (const contrato of linhas) {
    for (const c of contrato.contratados) {
      expandido.push({
        documento: texto(c.numero_documento_negociante),
        nome: capitalizar(c.nome_negociante),
        municipio: capitalizar(c.nome_municipio_negociante),
        valor: Number(contrato.valor_total_contrato) || 0,
      });
    }
  }

  if (!expandido.length) {
    return vazio('Sem vínculo entre contrato e contratado',
      'O TCE não devolveu a lista de contratados para este período.');
  }

  const grupos = ordenarPor(
    agrupar(expandido, 'documento', ['valor'], (chave, exemplo) => exemplo.nome || chave),
    'valor',
  );
  const total = somar(expandido, 'valor');

  return el('div', {},
    aviso('info',
      'Um contrato com mais de um contratado aparece uma vez para cada um, então a soma por '
      + 'empresa pode ser maior que o total contratado.'),
    ranking(grupos.slice(0, 10), { campo: 'valor', total }),
    el('h3', { texto: 'Todas as contratadas' }),
    tabela(grupos, [
      { campo: 'rotulo', rotulo: 'Empresa ou pessoa', tipo: 'texto' },
      { campo: 'chave', rotulo: 'CNPJ ou CPF', tipo: 'texto', formatar: (v) => documento(v) },
      { campo: 'quantidade', rotulo: 'Contratos', tipo: 'numero' },
      { campo: 'valor', rotulo: 'Valor somado', tipo: 'dinheiro' },
    ], {
      ordenarPor: 'valor',
      camposBusca: ['rotulo', 'chave'],
      nomeArquivo: '' + estado.ano + '-contratadas',
    }));
}

async function montarLicitacoes(alvo, estado) {
  alvo.append(carregando('Buscando processos de contratação...'));
  const { inicio, fim } = periodo(estado.ano);
  try {
    const { dados, origem, ts } = await consultar('/processos_administrativos_contratacoes',
      { inicio, fim }, { tudo: true, select: CAMPOS_LICITACAO });

    alvo.replaceChildren();
    if (!dados.length) {
      alvo.append(vazio('Nenhum processo em ' + estado.ano, 'Nada foi publicado para este período.'));
      return;
    }

    alvo.append(aviso('info',
      'Aqui estão os processos que antecedem o contrato: edital, disputa e homologação. '
      + 'O valor mostrado é o orçado pela prefeitura antes da disputa.'));
    alvo.append(tabela(dados, [
      { campo: 'data_realizacao_autuacao_licitacao', rotulo: 'Autuação', formatar: (v) => data(v) },
      { campo: 'numero_licitacao', rotulo: 'Número', tipo: 'texto' },
      {
        campo: 'descricao_objeto_licitacao', rotulo: 'Objeto', tipo: 'texto',
        formatar: (v) => truncar(v, 110),
      },
      { campo: 'valor_orcado_estimado', rotulo: 'Valor orçado', tipo: 'dinheiro' },
      { campo: 'data_homologacao', rotulo: 'Homologação', formatar: (v) => data(v) },
    ], {
      ordenarPor: 'valor_orcado_estimado',
      camposBusca: ['descricao_objeto_licitacao', 'numero_licitacao'],
      aoClicarLinha: (l) => abrirLicitacao(l),
      nomeArquivo: '' + estado.ano + '-licitacoes',
    }));
    alvo.append(carimbo({ origem, ts, endpoints: ['processos_administrativos_contratacoes'] }));
  } catch (erro) {
    alvo.replaceChildren(erroNaTela(erro, () => montarLicitacoes(alvo, estado)));
  }
}

function abrirLicitacao(l) {
  const plataforma = texto(l.descricao_url_plataforma_contratacao);
  const conteudo = el('div', {},
    listaDetalhes([
      ['Valor orçado', dinheiro(l.valor_orcado_estimado)],
      ['Autuação', data(l.data_realizacao_autuacao_licitacao)],
      ['Realização', data(l.data_realizacao_licitacao)],
      ['Homologação', data(l.data_homologacao) || 'não informada'],
      ['Responsável pela homologação', capitalizar(l.nome_responsavel_homologacao) || 'não informado'],
      texto(l.numero_id_contratacao_pncp) ? ['Identificador no PNCP', texto(l.numero_id_contratacao_pncp)] : null,
      ['Códigos do TCE', 'modalidade ' + texto(l.modalidade_licitacao) + ', tipo ' + texto(l.tipo_licitacao)
        + ', processo ' + texto(l.modalidade_processo_administrativo)],
    ]),
    el('h3', { texto: 'Objeto' }),
    el('p', { texto: texto(l.descricao_objeto_licitacao) || 'não informado' }),
    texto(l.descricao_fundamentacao_legal)
      ? el('div', {}, el('h3', { texto: 'Fundamentação legal' }),
        el('p', { texto: texto(l.descricao_fundamentacao_legal) }))
      : null,
    plataforma && /^https?:/i.test(plataforma)
      ? el('p', {}, el('a', { href: plataforma, target: '_blank', rel: 'noopener', texto: 'Abrir a plataforma da disputa' }))
      : null);

  gaveta('Processo ' + texto(l.numero_licitacao), conteudo);
}

async function montarItens(alvo, estado) {
  alvo.append(carregando('Buscando itens contratados (pode demorar)...'));
  const { inicio, fim } = periodo(estado.ano);
  try {
    const { dados, origem, ts } = await consultar('/itens_compoem_bens_servicos', { inicio, fim }, {
      tudo: true,
      select: ['numero_licitacao', 'descricao_item_licitacao', 'descricao_unidade_item_licitacao',
        'numero_quantidade_item_licitacao', 'valor_unitario_item_licitacao',
        'valor_vencedor_item_licitacao', 'numero_documento_negociante'],
    });

    alvo.replaceChildren();
    if (!dados.length) {
      alvo.append(vazio('Nenhum item detalhado', 'O TCE não devolveu itens para este período.'));
      return;
    }

    alvo.append(aviso('info',
      'Item a item é onde dá para comparar preço: quanto o município pagou por unidade de cada '
      + 'produto ou serviço. Use a busca para procurar por um item específico.'));
    alvo.append(tabela(dados, [
      { campo: 'numero_licitacao', rotulo: 'Licitação', tipo: 'texto' },
      {
        campo: 'descricao_item_licitacao', rotulo: 'Item', tipo: 'texto',
        formatar: (v) => truncar(v, 90),
      },
      { campo: 'descricao_unidade_item_licitacao', rotulo: 'Unidade', tipo: 'texto' },
      { campo: 'numero_quantidade_item_licitacao', rotulo: 'Quantidade', tipo: 'numero' },
      { campo: 'valor_unitario_item_licitacao', rotulo: 'Preço unitário', tipo: 'dinheiro' },
      { campo: 'valor_vencedor_item_licitacao', rotulo: 'Valor vencedor', tipo: 'dinheiro' },
    ], {
      ordenarPor: 'valor_vencedor_item_licitacao',
      camposBusca: ['descricao_item_licitacao', 'numero_licitacao'],
      nomeArquivo: '' + estado.ano + '-itens',
    }));
    alvo.append(carimbo({ origem, ts, endpoints: ['itens_compoem_bens_servicos'] }));
  } catch (erro) {
    alvo.replaceChildren(erroNaTela(erro, () => montarItens(alvo, estado)));
  }
}

export { botao };
