// Obras e serviços de engenharia: o que está sendo construído ou reformado
// no município, por quanto e em que situação.

import { consultar, emLote, referencia, ultimoMesComDados } from '../api/tce.js';
import { dicionarios, nomeOrgao } from '../api/auxiliares.js';
import { capitalizar, data, dinheiro, numero, texto, truncar } from '../api/formato.js';
import { agrupar, ordenarPor, somar } from '../dados/agregacoes.js';
import {
  abas, aviso, carimbo, carregando, cartao, el, erroNaTela, gaveta, grade,
  listaDetalhes, ranking, secao, vazio,
} from '../ui/componentes.js';
import { tabela } from '../ui/tabela.js';

const CAMPOS_OBRA = [
  'numero_obra', 'tipo_obra', 'data_inicio_obra', 'data_fim_obra', 'descricao_obra_servico',
  'valor_total_obra', 'codigo_orgao', 'tipo_execucao', 'numero_registro_obra',
];

const CAMPOS_STATUS = [
  'numero_obra', 'tipo_obra', 'status_obra', 'observacao_status', 'data_envio_informacao',
  'data_termo_conclusao', 'nome_responsavel',
];

const CAMPOS_MEDICAO = [
  'numero_obra_servico', 'tipo_obra_servico', 'numero_medicao', 'data_medicao', 'valor_medicao',
  'nome_responsavel_municipio', 'numero_empenho', 'data_referencia_doc',
];

export const titulo = 'Obras';

export async function montar(raiz, estado) {
  raiz.append(carregando('Buscando obras de ' + estado.ano + '...'));
  const inicio = estado.ano + '-01-01';
  const fim = estado.ano + '-12-31';

  try {
    const [obras, status, dic] = await Promise.all([
      consultar('/obras_municipais_servicos_engenharia', { ano: estado.ano, inicio, fim },
        { tudo: true, select: CAMPOS_OBRA }),
      consultar('/status_obras_servico_engenharia', { inicio, fim },
        { tudo: true, select: CAMPOS_STATUS }).catch(() => ({ dados: [] })),
      dicionarios(estado.ano),
    ]);

    // fica o status mais recente de cada obra
    const ultimoStatus = new Map();
    for (const s of status.dados) {
      const chave = String(s.numero_obra) + '/' + texto(s.tipo_obra);
      const atual = ultimoStatus.get(chave);
      if (!atual || String(s.data_envio_informacao) > String(atual.data_envio_informacao)) {
        ultimoStatus.set(chave, s);
      }
    }

    const linhas = obras.dados.map((o) => {
      const s = ultimoStatus.get(String(o.numero_obra) + '/' + texto(o.tipo_obra));
      return Object.assign({}, o, {
        situacao: s ? texto(s.observacao_status) || 'informada' : 'sem informação de situação',
        responsavel: s ? capitalizar(s.nome_responsavel) : '',
        conclusao: s ? s.data_termo_conclusao : null,
        atualizado: s ? s.data_envio_informacao : null,
        orgao: nomeOrgao(dic, o.codigo_orgao),
        descricao: texto(o.descricao_obra_servico),
      });
    });

    raiz.replaceChildren();
    raiz.append(el('div', { class: 'topo-pagina' },
      el('h1', { texto: 'Obras e serviços de engenharia' }),
      el('p', { class: 'linha-fina' },
        'Obras registradas no exercício de ' + estado.ano + '. A situação vem das informações '
        + 'que a prefeitura envia ao TCE ao longo do ano.')));

    if (!linhas.length) {
      raiz.append(vazio('Nenhuma obra registrada em ' + estado.ano,
        'O TCE não devolveu obras do Crato iniciadas neste exercício. '
        + 'Obras de anos anteriores podem continuar em execução: consulte os exercícios passados.'));
      raiz.append(situacoesSoltas(status.dados, estado));
      return;
    }

    raiz.append(resumo(linhas));

    const bloco = secao({});
    bloco.corpo.append(abas([
      { id: 'lista', titulo: 'Todas as obras', montar: (c) => c.append(listaObras(linhas, estado)) },
      { id: 'situacao', titulo: 'Por situação', montar: (c) => c.append(porSituacao(linhas)) },
      { id: 'orgao', titulo: 'Por secretaria', montar: (c) => c.append(porOrgao(linhas)) },
      { id: 'medicoes', titulo: 'Medições', montar: (c) => montarMedicoes(c, estado) },
    ]));
    raiz.append(bloco);

    raiz.append(carimbo({
      origem: obras.origem, ts: obras.ts,
      endpoints: ['obras_municipais_servicos_engenharia', 'status_obras_servico_engenharia'],
    }));
  } catch (erro) {
    raiz.replaceChildren(erroNaTela(erro, () => estado.recarregar()));
  }
}

function resumo(linhas) {
  const total = somar(linhas, 'valor_total_obra');
  const concluidas = linhas.filter((l) => /conclu/i.test(l.situacao)).length;
  const andamento = linhas.filter((l) => /andamento/i.test(l.situacao)).length;

  return grade(
    cartao({
      titulo: 'Valor das obras', valor: total, tom: 'empenhado',
      detalhe: numero(linhas.length) + ' obras e serviços registrados',
    }),
    cartao({
      titulo: 'Em andamento', valor: numero(andamento), tom: 'liquidado',
      detalhe: 'Segundo a última informação enviada ao TCE',
    }),
    cartao({
      titulo: 'Concluídas', valor: numero(concluidas), tom: 'pago',
      detalhe: 'Com registro de conclusão no período',
    }),
  );
}

function listaObras(linhas, estado) {
  return tabela(linhas, [
    { campo: 'data_inicio_obra', rotulo: 'Início', formatar: (v) => data(v) },
    { campo: 'descricao', rotulo: 'Obra ou serviço', tipo: 'texto', formatar: (v) => truncar(v, 110) },
    { campo: 'orgao', rotulo: 'Secretaria', tipo: 'texto' },
    { campo: 'situacao', rotulo: 'Situação', tipo: 'texto' },
    { campo: 'valor_total_obra', rotulo: 'Valor', tipo: 'dinheiro' },
  ], {
    ordenarPor: 'valor_total_obra',
    camposBusca: ['descricao', 'orgao', 'situacao'],
    aoClicarLinha: (l) => abrirObra(l),
    nomeArquivo: 'crato-' + estado.ano + '-obras',
  });
}

function abrirObra(l) {
  const conteudo = el('div', {},
    listaDetalhes([
      ['Valor total', dinheiro(l.valor_total_obra)],
      ['Situação', l.situacao],
      ['Início previsto', data(l.data_inicio_obra)],
      ['Fim previsto', data(l.data_fim_obra) || 'não informado'],
      l.conclusao ? ['Termo de conclusão', data(l.conclusao)] : null,
      ['Secretaria', l.orgao],
      ['Responsável informado', l.responsavel || 'não informado'],
      ['Registro da obra', texto(l.numero_registro_obra) || 'não informado'],
      l.atualizado ? ['Situação atualizada em', data(l.atualizado)] : null,
    ]),
    el('h3', { texto: 'Descrição' }),
    el('p', { texto: l.descricao || 'não informada' }));

  gaveta('Obra ' + texto(l.numero_obra), conteudo);
}

function porSituacao(linhas) {
  const grupos = ordenarPor(
    agrupar(linhas, 'situacao', ['valor_total_obra']),
    'valor_total_obra',
  );
  return el('div', {},
    aviso('info',
      'A situação é o texto que a própria prefeitura enviou ao TCE na última atualização de cada obra.'),
    ranking(grupos, { campo: 'valor_total_obra' }));
}

function porOrgao(linhas) {
  const grupos = ordenarPor(agrupar(linhas, 'orgao', ['valor_total_obra']), 'valor_total_obra');
  return ranking(grupos, { campo: 'valor_total_obra' });
}

function situacoesSoltas(status, estado) {
  if (!status.length) return el('div', {});
  const bloco = secao({
    titulo: 'Situações informadas em ' + estado.ano,
    descricao: 'Mesmo sem obras iniciadas neste exercício, a prefeitura atualizou a situação de '
      + numero(status.length) + ' registros, que podem ser de obras de anos anteriores.',
  });
  bloco.corpo.append(tabela(status, [
    { campo: 'numero_obra', rotulo: 'Obra', tipo: 'texto' },
    { campo: 'observacao_status', rotulo: 'Situação', tipo: 'texto' },
    { campo: 'data_envio_informacao', rotulo: 'Informado em', formatar: (v) => data(v) },
    { campo: 'nome_responsavel', rotulo: 'Responsável', tipo: 'texto', formatar: (v) => capitalizar(v) },
  ], { ordenarPor: 'data_envio_informacao', nomeArquivo: 'crato-' + estado.ano + '-situacao-obras' }));
  return bloco;
}

async function montarMedicoes(alvo, estado) {
  alvo.append(carregando('Buscando medições mês a mês...'));
  try {
    const ultimo = await ultimoMesComDados(estado.ano,
      { path: '/medicoes_obras_municipio', campo: 'codigo_orgao' });
    const meses = Array.from({ length: ultimo || 12 }, (_, i) => i + 1);
    const partes = await emLote(meses, async (m) => {
      const { dados } = await consultar('/medicoes_obras_municipio',
        { ano: estado.ano, mes: referencia(estado.ano, m) },
        { tudo: true, select: CAMPOS_MEDICAO }).catch(() => ({ dados: [] }));
      return dados;
    }, 4);
    const medicoes = partes.flat();

    alvo.replaceChildren();
    if (!medicoes.length) {
      alvo.append(vazio('Nenhuma medição publicada',
        'Medição é a conferência do quanto da obra foi executado em cada etapa. '
        + 'O TCE não devolveu medições do Crato para ' + estado.ano + '.'));
      return;
    }

    alvo.append(aviso('info',
      'Cada medição atesta uma etapa executada da obra e serve de base para o pagamento.'));
    alvo.append(tabela(medicoes, [
      { campo: 'numero_obra_servico', rotulo: 'Obra', tipo: 'texto' },
      { campo: 'numero_medicao', rotulo: 'Medição', tipo: 'texto' },
      { campo: 'data_medicao', rotulo: 'Data', formatar: (v) => data(v) },
      {
        campo: 'nome_responsavel_municipio', rotulo: 'Responsável do município',
        tipo: 'texto', formatar: (v) => capitalizar(v),
      },
      { campo: 'valor_medicao', rotulo: 'Valor medido', tipo: 'dinheiro' },
    ], {
      ordenarPor: 'valor_medicao',
      camposBusca: ['numero_obra_servico', 'nome_responsavel_municipio'],
      nomeArquivo: 'crato-' + estado.ano + '-medicoes',
    }));
  } catch (erro) {
    alvo.replaceChildren(erroNaTela(erro, () => montarMedicoes(alvo, estado)));
  }
}
