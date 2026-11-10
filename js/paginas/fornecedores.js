// Quem recebe o dinheiro público: cada pessoa física e cada empresa com
// empenho em seu nome, quanto foi empenhado, o que já foi anulado e qual o
// objeto de cada empenho.
//
// A lista sai leve: os campos pesados, principalmente o objeto do empenho, só
// são buscados quando alguém abre a ficha de um credor. Um exercício inteiro
// do Crato tem cerca de dez mil empenhos, e trazer o objeto de todos de uma
// vez custaria oito megabytes na primeira tela.

import { consultar, emLote, MUNICIPIO, referencia, ultimoMesComDados } from '../api/tce.js';
import { dicionarios, nomeElemento, nomeFuncao, nomeOrgao } from '../api/auxiliares.js';
import {
  capitalizar, data, dinheiro, documento, frase, numero, percentual, texto, truncar,
} from '../api/formato.js';
import { agrupar, ordenarPor, somar } from '../dados/agregacoes.js';
import {
  agruparCredores, chaveDoEmpenho, estadoEmpenho, porNatureza, ROTULO_NATUREZA,
} from '../dados/credores.js';
import {
  abas, aviso, barraProgresso, botao, carimbo, cartao, el, erroNaTela, gaveta, grade,
  listaDetalhes, ranking, secao, vazio,
} from '../ui/componentes.js';
import { tabela } from '../ui/tabela.js';

// campos curtos para a lista: um exercício inteiro passa de dez mil empenhos
const CAMPOS = [
  'numero_documento_negociante', 'nome_negociante', 'codigo_tipo_negociante',
  'municipio_negociante', 'valor_empenhado', 'codigo_orgao', 'codigo_unidade_orcamentaria',
  'codigo_funcao', 'codigo_elemento_despesa', 'numero_empenho', 'data_emissao_empenho',
  'data_referencia_doc', 'estado_empenho',
];

// campos da ficha, buscados só quando alguém abre um credor
const CAMPOS_FICHA = CAMPOS.concat([
  'descricao_historico_empenho', 'modalidade_nota_empenho',
  'numero_contrato', 'numero_licitacao', 'tipo_processo_licitatorio',
]);

const CAMPOS_ANULACAO = [
  'codigo_orgao', 'codigo_unidade_orcamentaria', 'numero_nota_empenho',
  'data_emissao_empenho', 'data_anulacao', 'valor_anulacao', 'modalidade_anulacao',
  'descricao_anulacao',
];

// Empenho ordinário, estimativo e global são as três formas do artigo 60 da
// Lei 4.320/1964.
const MODALIDADES = {
  O: 'Ordinário, de valor certo e pagamento de uma vez',
  E: 'Estimativo, de valor aproximado para despesa que se repete',
  G: 'Global, de valor certo e pagamento parcelado',
};

// A espécie do processo foi confirmada no exercício de 2025: todo empenho "N",
// "D" e "I" traz número de licitação, e nenhum "F" traz. Os exemplos de "I"
// são serviços técnicos especializados, o caso clássico de inexigibilidade.
const ESPECIES = {
  N: 'Licitação',
  D: 'Dispensa de licitação',
  I: 'Inexigibilidade de licitação',
  F: 'Sem processo de contratação',
};

const NATUREZAS_EM_ABA = [
  { id: 'todos', titulo: 'Todos' },
  { id: 'juridica', titulo: 'Empresas e órgãos' },
  { id: 'fisica', titulo: 'Pessoas físicas' },
  { id: 'folha', titulo: 'Folha de pagamento' },
];

export const titulo = 'Quem recebe';

export async function montar(raiz, estado) {
  raiz.replaceChildren(el('div', { class: 'topo-pagina' },
    el('h1', { texto: 'Quem recebe o dinheiro' }),
    el('p', { class: 'linha-fina' },
      'Cada pessoa e cada empresa com empenho em seu nome em ' + estado.ano
      + '. Abra um nome para ver o objeto de cada empenho.')));

  const progresso = barraProgresso('Preparando...');
  raiz.append(progresso);

  try {
    const mes = await ultimoMesComDados(estado.ano,
      { path: '/notas_empenhos', campo: 'numero_empenho' });
    if (!mes) {
      raiz.replaceChildren(aviso('alerta',
        'Não há empenhos publicados para ' + estado.ano + '. Escolha outro exercício.'));
      return;
    }

    const meses = Array.from({ length: mes }, (_, i) => i + 1);
    let prontos = 0;
    const avancar = () => {
      prontos += 1;
      progresso.atualizar(prontos / (meses.length * 2),
        'Carregando os empenhos: ' + Math.min(prontos, meses.length) + ' de ' + meses.length + ' meses');
    };

    const [partes, anulacoes, dic] = await Promise.all([
      emLote(meses, async (m) => {
        const r = await consultar('/notas_empenhos',
          { ano: estado.ano, mes: referencia(estado.ano, m) },
          { tudo: true, select: CAMPOS });
        avancar();
        return r;
      }, 4),
      emLote(meses, async (m) => {
        const { dados } = await consultar('/notas_anulacoes_empenhos',
          { ano: estado.ano, mes: referencia(estado.ano, m) },
          { tudo: true, select: CAMPOS_ANULACAO });
        avancar();
        return dados;
      }, 4).then((r) => r.flat()),
      dicionarios(estado.ano),
    ]);

    const empenhos = partes.flatMap((p) => p.dados);
    const origem = partes.some((p) => p.origem === 'rede') ? 'rede' : partes[0].origem;
    const ts = Math.max(...partes.map((p) => p.ts));

    progresso.remove();

    if (!empenhos.length) {
      raiz.append(vazio('Nenhum empenho encontrado',
        'O TCE não devolveu notas de empenho de ' + MUNICIPIO.nome + ' para ' + estado.ano + '.'));
      return;
    }

    const credores = agruparCredores(empenhos, anulacoes);

    raiz.append(resumo(empenhos, credores, mes));
    raiz.append(comoLer());
    raiz.append(listaCredores(credores, dic, estado, mes));
    raiz.append(deOndeVem(empenhos));
    raiz.append(carimbo({
      origem, ts, endpoints: ['notas_empenhos', 'notas_anulacoes_empenhos'],
    }));
  } catch (erro) {
    progresso.remove();
    raiz.append(erroNaTela(erro, () => estado.recarregar()));
  }
}

function resumo(empenhos, credores, mes) {
  const total = somar(empenhos, 'valor_empenhado');
  const anulado = credores.reduce((a, g) => a + g.valor_anulado, 0);
  const n = porNatureza(credores);
  const pf = n.fisica || { credores: 0, valor: 0 };
  const pj = n.juridica || { credores: 0, valor: 0 };

  return grade(
    cartao({
      titulo: 'Total empenhado', valor: total, tom: 'empenhado',
      detalhe: numero(empenhos.length) + ' notas de empenho em ' + mes + ' meses',
    }),
    cartao({
      titulo: 'Anulado depois', valor: anulado, tom: anulado ? 'alerta' : 'neutro',
      detalhe: percentual(anulado, total) + ' do empenhado foi cancelado',
      ajuda: 'Empenho anulado é compromisso desfeito. O dinheiro volta para a dotação e não chega ao credor.',
    }),
    cartao({
      titulo: 'Empresas, órgãos e entidades', valor: numero(pj.credores), tom: 'previsto',
      detalhe: dinheiro(pj.valor) + ' empenhados, ' + percentual(pj.valor, total) + ' do total',
    }),
    cartao({
      titulo: 'Pessoas físicas', valor: numero(pf.credores), tom: 'neutro',
      detalhe: dinheiro(pf.valor) + ' empenhados, ' + percentual(pf.valor, total) + ' do total',
      ajuda: 'Prestadores de serviço, beneficiários e quem recebeu diária. O CPF chega criptografado do TCE.',
    }),
  );
}

function comoLer() {
  const bloco = secao({ titulo: 'Como ler esta lista' });
  bloco.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'Nem todo recebedor é uma empresa. Aparecem aqui o INSS, outras prefeituras, '
      + 'consórcios, cartórios, a folha de pagamento do próprio município e pessoas físicas que '
      + 'prestaram serviço ou receberam diária.'),
    el('p', {}, 'O CNPJ das empresas vem aberto. O CPF das pessoas físicas chega criptografado do '
      + 'TCE e por isso aparece como protegido: o nome é público, o documento não.'),
    el('p', {}, 'A folha de pagamento não identifica servidor por servidor. Ela vem em blocos, '
      + 'como "folha dos efetivos" ou "folha dos comissionados", e é assim que aparece aqui.'),
    el('p', {}, 'Empenhar não é pagar. É reservar o dinheiro e assumir o compromisso. Parte desses '
      + 'compromissos é desfeita depois, por anulação, e nesses casos o valor não chega ao credor.')));
  return bloco;
}

function listaCredores(credores, dic, estado, mes) {
  const total = credores.reduce((a, g) => a + g.valor_empenhado, 0);
  const abrir = (grupo) => abrirCredor(grupo, dic, estado, mes);

  const bloco = secao({
    titulo: 'Cada credor do exercício',
    descricao: 'Clique em um nome para ver os empenhos daquele credor e o objeto de cada um.',
  });

  const secoes = NATUREZAS_EM_ABA
    .map((aba) => {
      const lista = aba.id === 'todos'
        ? credores
        : credores.filter((g) => g.natureza === aba.id);
      return Object.assign({}, aba, { lista });
    })
    .filter((aba) => aba.lista.length)
    .map((aba) => ({
      id: aba.id,
      titulo: aba.titulo + ' (' + numero(aba.lista.length) + ')',
      montar: (c) => c.append(painelDaNatureza(aba, total, abrir, estado)),
    }));

  bloco.corpo.append(abas(secoes));
  return bloco;
}

function painelDaNatureza(aba, totalGeral, abrir, estado) {
  const lista = ordenarPor(aba.lista, 'valor_empenhado');
  const somaAba = lista.reduce((a, g) => a + g.valor_empenhado, 0);

  const caixa = el('div', {});

  if (aba.id === 'fisica') {
    caixa.append(aviso('info',
      'Estas são as pessoas físicas com empenho no próprio nome. O TCE emite os empenhos de diária '
      + 'sob um documento único, igual para todo mundo, e é o nome que separa uma pessoa da outra '
      + 'nesses casos.'));
  }
  if (aba.id === 'folha') {
    caixa.append(aviso('info',
      'A folha vem agrupada por bloco, não por servidor. Ela responde por parte grande do gasto '
      + 'do município justamente por reunir milhares de pessoas em poucos empenhos.'));
  }

  caixa.append(
    ranking(lista.slice(0, 10), {
      campo: 'valor_empenhado', total: somaAba, aoClicar: abrir,
    }),
    el('h3', { texto: 'Lista completa' }),
    tabela(lista, colunasDoCredor(totalGeral, aba.id), {
      ordenarPor: 'valor_empenhado',
      camposBusca: ['rotulo', 'documento'],
      aoClicarLinha: abrir,
      nomeArquivo: '' + estado.ano + '-credores-' + aba.id,
    }),
  );
  return caixa;
}

function colunasDoCredor(totalGeral, natureza) {
  const colunas = [
    { campo: 'rotulo', rotulo: 'Nome', tipo: 'texto' },
    {
      campo: 'documento', rotulo: 'CNPJ ou CPF', tipo: 'texto',
      formatar: (v, l) => (l.coletivo ? 'identificador coletivo' : documento(v)),
    },
  ];
  if (natureza === 'todos') {
    colunas.push({
      campo: 'natureza', rotulo: 'Tipo', tipo: 'texto',
      formatar: (v) => ROTULO_NATUREZA[v],
    });
  }
  colunas.push(
    { campo: 'quantidade', rotulo: 'Empenhos', tipo: 'numero' },
    { campo: 'valor_empenhado', rotulo: 'Empenhado', tipo: 'dinheiro' },
    {
      campo: 'valor_anulado', rotulo: 'Anulado', tipo: 'dinheiro',
      formatar: (v) => (v > 0 ? dinheiro(v) : '—'),
    },
    { campo: 'valor_liquido', rotulo: 'Fica de pé', tipo: 'dinheiro' },
    {
      campo: 'fatia', rotulo: 'Fatia', tipo: 'numero',
      formatar: (_, l) => percentual(l.valor_empenhado, totalGeral),
    },
  );
  return colunas;
}

function abrirCredor(grupo, dic, estado, ultimoMes) {
  const empenhos = ordenarPor(grupo.linhas, 'valor_empenhado');
  const porOrgao = ordenarPor(
    agrupar(empenhos, 'codigo_orgao', ['valor_empenhado'], (c) => nomeOrgao(dic, c)),
    'valor_empenhado',
  );

  const conteudo = el('div', {},
    identidade(grupo),
    grupo.valor_anulado > 0 ? aviso('alerta',
      dinheiro(grupo.valor_anulado) + ' dos ' + dinheiro(grupo.valor_empenhado)
      + ' empenhados foram anulados depois, em ' + grupo.anulados
      + (grupo.anulados === 1 ? ' empenho' : ' empenhos') + '. Esse valor não chega ao credor.') : null,
    el('h3', { texto: 'Quais órgãos empenharam' }),
    ranking(porOrgao, { campo: 'valor_empenhado', total: grupo.valor_empenhado }),
    blocoDosEmpenhos(grupo, empenhos, dic, estado, ultimoMes));

  gaveta(grupo.rotulo, conteudo);
}

function identidade(grupo) {
  const pares = [
    ['Tipo de credor', ROTULO_NATUREZA[grupo.natureza]],
    ['Documento', grupo.coletivo
      ? 'identificador coletivo, compartilhado com outros credores'
      : documento(grupo.documento)],
    ['Total empenhado', dinheiro(grupo.valor_empenhado)],
  ];
  if (grupo.valor_anulado > 0) {
    pares.push(['Anulado depois', dinheiro(grupo.valor_anulado)]);
    pares.push(['Fica de pé', dinheiro(grupo.valor_liquido)]);
  }
  pares.push(['Notas de empenho', numero(grupo.quantidade)]);
  pares.push(['Município do credor', capitalizar(grupo.municipio) || 'não informado']);
  return listaDetalhes(pares);
}

/**
 * O objeto do empenho só é buscado quando alguém pede. Custa cerca de 650 KB
 * por mês consultado, e só são consultados os meses em que este credor teve
 * empenho, que costumam ser poucos.
 */
function blocoDosEmpenhos(grupo, empenhos, dic, estado, ultimoMes) {
  const caixa = el('div', {});
  const mesesDoCredor = [...new Set(empenhos
    .map((e) => Number(String(e.data_referencia_doc).slice(4, 6)))
    .filter((m) => m >= 1 && m <= ultimoMes))].sort((a, b) => a - b);

  const listaDeEmpenhos = (comObjeto) => tabela(empenhos, colunasDoEmpenho(dic, comObjeto), {
    ordenarPor: 'valor_empenhado',
    busca: empenhos.length > 12,
    porPagina: 25,
    expandir: comObjeto ? (linha) => detalheDoEmpenho(linha, dic) : undefined,
    nomeArquivo: '' + estado.ano + '-empenhos-'
      + texto(grupo.rotulo).toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40),
  });

  const desenhar = (topo, corpo) => caixa.replaceChildren(
    el('h3', { texto: 'Empenhos' }), topo, corpo);

  const carregar = async () => {
    desenhar(el('p', { class: 'nota', texto: 'Buscando o objeto dos empenhos...' }),
      listaDeEmpenhos(false));
    try {
      const fichas = await emLote(mesesDoCredor, async (m) => {
        const { dados } = await consultar('/notas_empenhos',
          { ano: estado.ano, mes: referencia(estado.ano, m) },
          { tudo: true, select: CAMPOS_FICHA });
        return dados;
      }, 3);

      // casa pela chave natural do empenho, e não pela ordem: a API não
      // garante que duas consultas devolvam as linhas na mesma sequência
      const porChave = new Map();
      for (const linha of fichas.flat()) porChave.set(chaveDoEmpenho(linha), linha);
      let achados = 0;
      for (const e of empenhos) {
        const ficha = porChave.get(chaveDoEmpenho(e));
        if (!ficha) continue;
        achados += 1;
        e.descricao_historico_empenho = ficha.descricao_historico_empenho;
        e.modalidade_nota_empenho = ficha.modalidade_nota_empenho;
        e.numero_contrato = ficha.numero_contrato;
        e.numero_licitacao = ficha.numero_licitacao;
        e.tipo_processo_licitatorio = ficha.tipo_processo_licitatorio;
      }
      desenhar(el('p', { class: 'nota',
        texto: 'Clique em um empenho para ler o objeto inteiro e ver o vínculo com '
          + 'contrato ou licitação.' }), listaDeEmpenhos(true));
      if (achados < empenhos.length) {
        caixa.append(aviso('alerta', 'O TCE não devolveu o objeto de '
          + (empenhos.length - achados) + ' dos ' + empenhos.length + ' empenhos deste credor.'));
      }
    } catch (erro) {
      desenhar(pedirObjeto(), listaDeEmpenhos(false));
      caixa.append(erroNaTela(erro, carregar));
    }
  };

  function pedirObjeto() {
    return el('div', {},
      el('p', { class: 'nota',
        texto: 'A lista abaixo ainda não traz o objeto de cada empenho, que é o texto onde a '
          + 'prefeitura descreve o que foi contratado.' }),
      botao('Ver o objeto de cada empenho', carregar, {
        classe: 'botao botao-secundario',
        titulo: 'Consulta ' + mesesDoCredor.length
          + (mesesDoCredor.length === 1 ? ' mês' : ' meses') + ' no TCE',
      }),
      el('p', { class: 'nota', texto: custoDaConsulta(mesesDoCredor.length) }));
  }

  desenhar(pedirObjeto(), listaDeEmpenhos(false));
  return caixa;
}

/**
 * O texto do objeto não vem sozinho: a API não filtra por credor, então buscar
 * o objeto de um empenho obriga a baixar o mês inteiro. Quem está no celular
 * merece saber disso antes de clicar, e não depois.
 */
function custoDaConsulta(meses) {
  const KB_POR_MES = 646; // medido no Crato: cerca de 860 empenhos por mês
  const total = meses * KB_POR_MES;
  const tamanho = total >= 1024
    ? (total / 1024).toFixed(1).replace('.', ',') + ' MB'
    : total + ' KB';
  return 'São ' + meses + (meses === 1 ? ' consulta' : ' consultas')
    + ' ao TCE, cerca de ' + tamanho + '. O TCE não permite filtrar por credor, '
    + 'então o mês inteiro vem junto. Fica guardado no navegador por 24 horas.';
}

function colunasDoEmpenho(dic, comObjeto) {
  const colunas = [
    { campo: 'data_emissao_empenho', rotulo: 'Data', formatar: (v) => data(v) },
    { campo: 'numero_empenho', rotulo: 'Empenho', tipo: 'texto' },
  ];
  if (comObjeto) {
    colunas.push({
      campo: 'descricao_historico_empenho',
      rotulo: 'Objeto',
      tipo: 'texto',
      largura: '42%',
      formatar: (v) => truncar(frase(v), 96) || 'não informado',
      dica: (v) => frase(v),
      csv: (v) => frase(v),
    });
  } else {
    colunas.push(
      { campo: 'codigo_orgao', rotulo: 'Órgão', tipo: 'texto', formatar: (v) => nomeOrgao(dic, v) },
      { campo: 'codigo_funcao', rotulo: 'Área', tipo: 'texto', formatar: (v) => nomeFuncao(dic, v) },
    );
  }
  colunas.push(
    {
      campo: 'estado_empenho', rotulo: 'Situação', tipo: 'texto',
      formatar: (v, l) => estadoEmpenho(v).rotulo
        + (l.valor_anulado > 0 ? ' (' + dinheiro(l.valor_anulado) + ')' : ''),
    },
    { campo: 'valor_empenhado', rotulo: 'Valor', tipo: 'dinheiro' },
  );
  return colunas;
}

function detalheDoEmpenho(linha, dic) {
  const objeto = texto(linha.descricao_historico_empenho);
  const especie = ESPECIES[texto(linha.tipo_processo_licitatorio).toUpperCase()];
  const modalidade = MODALIDADES[texto(linha.modalidade_nota_empenho).toUpperCase()];

  const caixa = el('div', {},
    el('h4', { texto: 'Objeto do empenho' }),
    el('p', { class: 'objeto-empenho', texto: frase(objeto) || 'O TCE não informou o objeto.' }));

  caixa.append(listaDetalhes([
    ['Órgão', nomeOrgao(dic, linha.codigo_orgao)],
    ['Área de governo', nomeFuncao(dic, linha.codigo_funcao)],
    ['Tipo de gasto', nomeElemento(dic, linha.codigo_elemento_despesa)],
    modalidade ? ['Forma do empenho', modalidade] : null,
    especie ? ['Como foi contratado', especie] : null,
    texto(linha.numero_licitacao) ? ['Licitação', texto(linha.numero_licitacao)] : null,
    texto(linha.numero_contrato) ? ['Contrato', texto(linha.numero_contrato)] : null,
  ]));

  for (const nota of linha.anulacoes || []) {
    caixa.append(
      el('h4', { texto: 'Anulação de ' + dinheiro(nota.valor_anulacao)
        + ' em ' + data(nota.data_anulacao) }),
      el('p', { class: 'objeto-empenho',
        texto: frase(texto(nota.descricao_anulacao)) || 'Sem justificativa informada.' }));
  }

  if (texto(linha.numero_licitacao) || texto(linha.numero_contrato)) {
    caixa.append(el('p', { class: 'nota' },
      'O processo que originou este empenho está em ',
      el('a', { href: '#/contratos', texto: 'Contratos e licitações' }), '.'));
  }
  return caixa;
}

function deOndeVem(empenhos) {
  const grupos = ordenarPor(
    agrupar(empenhos, (e) => capitalizar(e.municipio_negociante) || 'Não informado',
      ['valor_empenhado']),
    'valor_empenhado',
  );
  const total = somar(empenhos, 'valor_empenhado');

  // Comparação sem acento e sem caixa: o cadastro do TCE escreve "MISSAO
  // VELHA", e comparar com "Missão Velha" não acharia a própria cidade.
  const semAcento = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const daCasa = grupos.find((g) => semAcento(g.chave) === semAcento(MUNICIPIO.nome));

  const bloco = secao({
    titulo: 'De onde são os credores',
    descricao: 'Município informado no cadastro de cada recebedor.',
  });
  if (daCasa) {
    bloco.corpo.append(aviso('info',
      percentual(daCasa.valor_empenhado, total) + ' do valor empenhado foi para credores '
      + 'cadastrados na própria cidade.'));
  }
  bloco.corpo.append(ranking(grupos.slice(0, 10), { campo: 'valor_empenhado', total }));
  return bloco;
}
