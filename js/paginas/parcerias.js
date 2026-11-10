// Parcerias com organizações da sociedade civil: termos de colaboração,
// fomento e acordos de cooperação, na forma da Lei 13.019/2014.
//
// No Crato este grupo de dados está vazio em todo o período disponível, e essa
// ausência é informação: a página mostra o resultado da consulta e compara com
// municípios vizinhos para deixar claro que o problema não é do site.

import {
  anoAtual, consultar, emLote, MUNICIPIO, municipioPorCodigo, PRIMEIRO_ANO,
} from '../api/tce.js';
import { capitalizar, data, dinheiro, documento, numero, texto, truncar } from '../api/formato.js';
import { ordenarPor, somar } from '../dados/agregacoes.js';
import {
  aviso, botao, carimbo, carregando, cartao, el, erroNaTela, gaveta, grade,
  listaDetalhes, secao,
} from '../ui/componentes.js';
import { tabela } from '../ui/tabela.js';

const CAMPOS_PARCERIA = [
  'data_instrumento_juridico_osc', 'numero_instrumento_juridico_osc', 'tipo_instrumento_juridico_osc',
  'data_inicio_vigencia_osc', 'data_fim_vigencia_osc', 'descricao_objeto_osc',
  'valor_previsto_realizacao_osc', 'cnpj_osc', 'nome_responsavel_osc',
  'numero_processo_admin_osc', 'descricao_justificativa_osc',
];

const CAMPOS_OSC = [
  'cnpj_identificacao_osc', 'nome_razao_social_osc', 'nome_municipio_osc', 'nome_uf_osc',
  'organizacao_vencedora_osc', 'numero_processo_admin_osc', 'data_autuacao_processo_osc',
];

// A comparação existe para separar "o município não firmou parceria" de "o
// município não informou": se os vizinhos têm registro e este não tem, o
// silêncio diz outra coisa.
//
// Fortaleza entra como contraste de fora da região, por ser a capital e por ter
// registro em praticamente todo endpoint. Os demais saem da própria lista do
// site, tirando o município aberto, que já é a primeira linha da comparação.
const CAPITAL = { codigo: '057', nome: 'Fortaleza' };
const MAIORES = ['094', '023', '049'];

function vizinhos() {
  const outros = MAIORES
    .filter((codigo) => codigo !== MUNICIPIO.codigo)
    .map((codigo) => municipioPorCodigo(codigo))
    .filter(Boolean)
    .map((m) => ({ codigo: m.codigo, nome: m.nome }));
  return [CAPITAL, ...outros];
}

export const titulo = 'Parcerias';

export async function montar(raiz, estado) {
  raiz.append(carregando('Consultando parcerias com OSC...'));
  const inicio = estado.ano + '-01-01';
  const fim = estado.ano + '-12-31';

  try {
    const [parcerias, organizacoes] = await Promise.all([
      consultar('/parcerias_osc', { inicio, fim }, { tudo: true, select: CAMPOS_PARCERIA }),
      consultar('/organizacoes_sociedade_civil_osc', { inicio, fim },
        { tudo: true, select: CAMPOS_OSC }).catch(() => ({ dados: [] })),
    ]);

    raiz.replaceChildren();
    raiz.append(el('div', { class: 'topo-pagina' },
      el('h1', { texto: 'Parcerias com a sociedade civil' }),
      el('p', { class: 'linha-fina' },
        'Termos de colaboração, de fomento e acordos de cooperação firmados com associações, '
        + 'fundações e demais organizações sem fins lucrativos, conforme a Lei 13.019/2014.')));

    if (parcerias.dados.length) {
      raiz.append(comParcerias(parcerias.dados, organizacoes.dados, estado));
    } else {
      raiz.append(await semParcerias(estado, raiz));
    }

    raiz.append(carimbo({
      origem: parcerias.origem, ts: parcerias.ts,
      endpoints: ['parcerias_osc', 'organizacoes_sociedade_civil_osc'],
    }));
  } catch (erro) {
    raiz.replaceChildren(erroNaTela(erro, () => estado.recarregar()));
  }
}

function comParcerias(parcerias, organizacoes, estado) {
  const total = somar(parcerias, 'valor_previsto_realizacao_osc');
  const nomes = new Map();
  for (const o of organizacoes) {
    nomes.set(texto(o.cnpj_identificacao_osc), capitalizar(o.nome_razao_social_osc));
  }

  const linhas = parcerias.map((p) => Object.assign({}, p, {
    organizacao: nomes.get(texto(p.cnpj_osc)) || 'organização não identificada',
    objeto: texto(p.descricao_objeto_osc),
  }));

  const caixa = el('div', {});
  caixa.append(grade(
    cartao({
      titulo: 'Valor das parcerias', valor: total, tom: 'empenhado',
      detalhe: numero(parcerias.length) + ' instrumentos firmados em ' + estado.ano,
    }),
    cartao({
      titulo: 'Organizações', valor: numero(new Set(linhas.map((l) => texto(l.cnpj_osc))).size),
      tom: 'neutro', detalhe: 'Entidades com parceria no exercício',
    }),
  ));

  const bloco = secao({ titulo: 'Instrumentos firmados' });
  bloco.corpo.append(tabela(linhas, [
    { campo: 'data_instrumento_juridico_osc', rotulo: 'Data', formatar: (v) => data(v) },
    { campo: 'numero_instrumento_juridico_osc', rotulo: 'Número', tipo: 'texto' },
    { campo: 'organizacao', rotulo: 'Organização', tipo: 'texto' },
    { campo: 'objeto', rotulo: 'Objeto', tipo: 'texto', formatar: (v) => truncar(v, 100) },
    { campo: 'valor_previsto_realizacao_osc', rotulo: 'Valor previsto', tipo: 'dinheiro' },
  ], {
    ordenarPor: 'valor_previsto_realizacao_osc',
    camposBusca: ['organizacao', 'objeto'],
    aoClicarLinha: (l) => abrirParceria(l),
    nomeArquivo: '' + estado.ano + '-parcerias',
  }));
  caixa.append(bloco);
  return caixa;
}

function abrirParceria(l) {
  gaveta('Parceria ' + texto(l.numero_instrumento_juridico_osc), el('div', {},
    listaDetalhes([
      ['Valor previsto', dinheiro(l.valor_previsto_realizacao_osc)],
      ['Organização', l.organizacao],
      ['CNPJ', documento(l.cnpj_osc)],
      ['Assinatura', data(l.data_instrumento_juridico_osc)],
      ['Vigência', data(l.data_inicio_vigencia_osc) + ' a ' + data(l.data_fim_vigencia_osc)],
      ['Processo administrativo', texto(l.numero_processo_admin_osc) || 'não informado'],
      ['Responsável pela organização', capitalizar(l.nome_responsavel_osc) || 'não informado'],
    ]),
    el('h3', { texto: 'Objeto' }),
    el('p', { texto: l.objeto || 'não informado' }),
    texto(l.descricao_justificativa_osc)
      ? el('div', {}, el('h3', { texto: 'Justificativa' }),
        el('p', { texto: texto(l.descricao_justificativa_osc) }))
      : null));
}

async function semParcerias(estado, raiz) {
  const caixa = el('div', {});

  caixa.append(aviso('alerta',
    'A consulta ao TCE não devolveu nenhuma parceria de ' + MUNICIPIO.nome + ' em ' + estado.ano + '. '
    + 'Isso pode significar que o município não firmou parcerias no período ou que não as informou '
    + 'ao Sistema de Informações Municipais.'));

  const bloco = secao({
    titulo: 'Comparação com outros municípios',
    descricao: 'Dá para verificar consultando os mesmos endpoints para outros municípios cearenses. '
      + 'Se eles devolverem dados, a base funciona e a lacuna é de ' + MUNICIPIO.nome + '.',
  });

  const alvo = el('div', {});
  bloco.corpo.append(alvo);
  caixa.append(bloco);

  const comparar = async () => {
    alvo.replaceChildren(carregando('Consultando o mesmo endpoint em outros municípios...'));
    try {
      const periodoLargo = { inicio: PRIMEIRO_ANO + '-01-01', fim: anoAtual() + '-12-31' };
      const alvos = [{ codigo: MUNICIPIO.codigo, nome: MUNICIPIO.nome }, ...vizinhos()];
      const resultados = await emLote(alvos, async (m) => {
        const { dados } = await consultar('/parcerias_osc',
          Object.assign({ codigo_municipio: m.codigo }, periodoLargo),
          { tudo: true, maxPaginas: 3, select: ['numero_instrumento_juridico_osc', 'valor_previsto_realizacao_osc'] });
        return {
          rotulo: m.nome,
          quantidade: dados.length,
          valor: somar(dados, 'valor_previsto_realizacao_osc'),
        };
      }, 2);

      alvo.replaceChildren(
        tabela(ordenarPor(resultados, 'quantidade'), [
          { campo: 'rotulo', rotulo: 'Município', tipo: 'texto' },
          { campo: 'quantidade', rotulo: 'Parcerias encontradas', tipo: 'numero' },
          { campo: 'valor', rotulo: 'Valor previsto somado', tipo: 'dinheiro' },
        ], { busca: false, nomeArquivo: 'comparacao-parcerias-osc' }),
        el('p', { class: 'nota' },
          'Consulta feita agora, de ' + PRIMEIRO_ANO + ' a ' + anoAtual()
          + ', limitada a três páginas por município. Municípios grandes podem ter mais registros '
          + 'do que o mostrado.'),
      );
    } catch (erro) {
      alvo.replaceChildren(erroNaTela(erro, comparar));
    }
  };

  alvo.append(botao('Comparar com outros municípios', comparar, { classe: 'botao' }));

  const contexto = secao({
    titulo: 'O que a lei exige nessas parcerias',
    descricao: 'Parceria com OSC é uma das formas de o dinheiro público chegar a entidades privadas.',
  });
  contexto.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'A Lei 13.019/2014, o Marco Regulatório das Organizações da Sociedade Civil, exige '
      + 'chamamento público, plano de trabalho e prestação de contas para repasses a associações e '
      + 'fundações. O SIM tem oito conjuntos de dados só para essas parcerias, incluindo as comissões '
      + 'de seleção e as publicações de editais.'),
    el('p', {}, 'Quando esses conjuntos vêm vazios, o cidadão não consegue verificar por esta via '
      + 'quem recebeu, quanto e para quê.'),
    el('p', {}, 'Repasses a entidades também podem aparecer como empenho comum. A página ',
    el('a', { href: '#/fornecedores', texto: 'Quem recebe' }),
    ' mostra fundações e associações entre os maiores recebedores do município, ainda que sem o '
      + 'detalhamento próprio das parcerias.')));
  caixa.append(contexto);

  return caixa;
}
