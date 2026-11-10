// Patrimônio: os bens que o município incorporou e o controle desses bens
// pelas unidades administrativas.

import { consultar, emLote, MUNICIPIO, referencia, ultimoMesComDados } from '../api/tce.js';
import { dicionarios, nomeOrgao, nomeUnidade } from '../api/auxiliares.js';
import { capitalizar, data, dinheiro, numero, texto, truncar } from '../api/formato.js';
import { agrupar, ordenarPor, somar } from '../dados/agregacoes.js';
import {
  abas, aviso, carimbo, carregando, cartao, el, erroNaTela, gaveta, grade,
  listaDetalhes, ranking, secao, vazio,
} from '../ui/componentes.js';
import { tabela } from '../ui/tabela.js';

const CAMPOS_BEM = [
  'numero_registro', 'data_aquisicao', 'descricao_bem', 'tipo_classificacao', 'tipo_natureza',
  'status_baixa', 'endereco', 'distrito_localidade', 'area_bem_m2', 'municipio_cartorio',
  'matricula_registro', 'vida_util', 'valor_depreciavel', 'valor_residual',
  'latitude', 'longitude', 'data_referencia_doc',
];

export const titulo = 'Patrimônio';

export async function montar(raiz, estado) {
  raiz.append(carregando('Buscando bens incorporados em ' + estado.ano + '...'));

  try {
    const [bens, dic] = await Promise.all([
      consultar('/bens_incorporados_patrimonio_municipio',
        { inicio: estado.ano + '-01-01', fim: estado.ano + '-12-31' },
        { tudo: true, select: CAMPOS_BEM }),
      dicionarios(estado.ano),
    ]);

    raiz.replaceChildren();
    raiz.append(el('div', { class: 'topo-pagina' },
      el('h1', { texto: 'Patrimônio do município' }),
      el('p', { class: 'linha-fina' },
        'Bens incorporados ao patrimônio em ' + estado.ano + ': o que ' + MUNICIPIO.nome + ' comprou, '
        + 'construiu ou recebeu e passou a ser público.')));

    if (!bens.dados.length) {
      raiz.append(vazio('Nenhum bem incorporado em ' + estado.ano,
        'O TCE não devolveu incorporações patrimoniais de ' + MUNICIPIO.nome + ' neste período.'));
    } else {
      raiz.append(resumo(bens.dados));

      const bloco = secao({});
      bloco.corpo.append(abas([
        { id: 'lista', titulo: 'Bens incorporados', montar: (c) => c.append(lista(bens.dados, estado)) },
        { id: 'natureza', titulo: 'Por natureza', montar: (c) => c.append(porCampo(bens.dados, 'tipo_natureza', 'Natureza')) },
        { id: 'classificacao', titulo: 'Por classificação', montar: (c) => c.append(porCampo(bens.dados, 'tipo_classificacao', 'Classificação')) },
        { id: 'unidades', titulo: 'Controle por unidade', montar: (c) => montarControle(c, estado, dic) },
      ]));
      raiz.append(bloco);
    }

    raiz.append(aviso('info',
      'O valor mostrado é o valor depreciável informado ao TCE, que nem sempre corresponde ao '
      + 'preço de compra. Bens sem valor informado aparecem zerados.'));

    raiz.append(carimbo({
      origem: bens.origem, ts: bens.ts,
      endpoints: ['bens_incorporados_patrimonio_municipio'],
    }));
  } catch (erro) {
    raiz.replaceChildren(erroNaTela(erro, () => estado.recarregar()));
  }
}

function resumo(bens) {
  const total = somar(bens, 'valor_depreciavel');
  const imoveis = bens.filter((b) => Number(b.area_bem_m2) > 0).length;
  const baixados = bens.filter((b) => texto(b.status_baixa) && texto(b.status_baixa) !== '0').length;

  return grade(
    cartao({
      titulo: 'Valor incorporado', valor: total, tom: 'pago',
      detalhe: numero(bens.length) + ' bens registrados no exercício',
    }),
    cartao({
      titulo: 'Com área registrada', valor: numero(imoveis), tom: 'neutro',
      detalhe: 'Provavelmente imóveis ou terrenos',
    }),
    cartao({
      titulo: 'Com marca de baixa', valor: numero(baixados), tom: 'previsto',
      detalhe: 'Bens já retirados do patrimônio',
    }),
  );
}

function lista(bens, estado) {
  return tabela(bens, [
    { campo: 'data_aquisicao', rotulo: 'Aquisição', formatar: (v) => data(v) },
    { campo: 'numero_registro', rotulo: 'Registro', tipo: 'texto' },
    { campo: 'descricao_bem', rotulo: 'Bem', tipo: 'texto', formatar: (v) => truncar(capitalizar(v), 110) },
    { campo: 'distrito_localidade', rotulo: 'Localidade', tipo: 'texto', formatar: (v) => capitalizar(v) },
    { campo: 'valor_depreciavel', rotulo: 'Valor', tipo: 'dinheiro' },
  ], {
    ordenarPor: 'valor_depreciavel',
    camposBusca: ['descricao_bem', 'distrito_localidade', 'endereco', 'numero_registro'],
    aoClicarLinha: (b) => abrirBem(b),
    nomeArquivo: '' + estado.ano + '-bens',
  });
}

function abrirBem(b) {
  const lat = Number(b.latitude);
  const lon = Number(b.longitude);
  const temMapa = Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0;

  const conteudo = el('div', {},
    listaDetalhes([
      ['Valor depreciável', dinheiro(b.valor_depreciavel)],
      ['Valor residual', dinheiro(b.valor_residual)],
      ['Aquisição', data(b.data_aquisicao)],
      ['Vida útil informada', texto(b.vida_util) ? texto(b.vida_util) + ' anos' : 'não informada'],
      ['Endereço', capitalizar(b.endereco) || 'não informado'],
      ['Localidade', capitalizar(b.distrito_localidade) || 'não informada'],
      Number(b.area_bem_m2) ? ['Área', numero(b.area_bem_m2) + ' m²'] : null,
      texto(b.matricula_registro) ? ['Matrícula', texto(b.matricula_registro)] : null,
      texto(b.municipio_cartorio) ? ['Cartório', capitalizar(b.municipio_cartorio)] : null,
      ['Códigos do TCE', 'natureza ' + texto(b.tipo_natureza) + ', classificação ' + texto(b.tipo_classificacao)],
    ]),
    el('h3', { texto: 'Descrição' }),
    el('p', { texto: capitalizar(b.descricao_bem) || 'não informada' }),
    temMapa
      ? el('p', {}, el('a', {
        href: 'https://www.openstreetmap.org/?mlat=' + lat + '&mlon=' + lon + '#map=18/' + lat + '/' + lon,
        target: '_blank', rel: 'noopener', texto: 'Ver a localização no mapa',
      }))
      : null);

  gaveta(truncar(capitalizar(b.descricao_bem), 60) || 'Bem público', conteudo);
}

function porCampo(bens, campo, nomeColuna) {
  const grupos = ordenarPor(
    agrupar(bens, (b) => texto(b[campo]) || 'não informado', ['valor_depreciavel']),
    'valor_depreciavel',
  );
  return el('div', {},
    aviso('info',
      'O TCE devolve apenas o código deste campo. Os valores abaixo são os códigos como vieram.'),
    ranking(grupos, { campo: 'valor_depreciavel' }));
}

async function montarControle(alvo, estado, dic) {
  alvo.append(carregando('Buscando o controle de bens por unidade...'));
  try {
    const ultimo = await ultimoMesComDados(estado.ano,
      { path: '/controle_bens_unidades_orcamentarias', campo: 'codigo_orgao' });
    const meses = Array.from({ length: ultimo || 12 }, (_, i) => i + 1);
    const partes = await emLote(meses, async (m) => {
      const { dados } = await consultar('/controle_bens_unidades_orcamentarias',
        { mes: referencia(estado.ano, m) },
        {
          tudo: true,
          select: ['numero_registro', 'codigo_orgao', 'codigo_unidade_orcamentaria',
            'data_disponibilizacao', 'data_referencia_doc'],
        }).catch(() => ({ dados: [] }));
      return dados;
    }, 4);
    const registros = partes.flat();

    alvo.replaceChildren();
    if (!registros.length) {
      alvo.append(vazio('Sem registros de controle',
        'Nenhuma unidade informou controle de bens no período.'));
      return;
    }

    const grupos = ordenarPor(
      agrupar(registros, (r) => nomeUnidade(dic, r.codigo_orgao, r.codigo_unidade_orcamentaria), []),
      'quantidade',
    );

    alvo.append(aviso('info',
      'Aqui aparece qual unidade da prefeitura ficou responsável por cada bem. '
      + 'É o registro de quem guarda o quê.'));
    alvo.append(ranking(grupos.slice(0, 12), { campo: 'quantidade', formatar: (v) => numero(v) + ' bens' }));
    alvo.append(tabela(registros, [
      { campo: 'numero_registro', rotulo: 'Registro do bem', tipo: 'texto' },
      {
        campo: 'codigo_orgao', rotulo: 'Órgão', tipo: 'texto',
        formatar: (v) => nomeOrgao(dic, v),
      },
      {
        campo: 'codigo_unidade_orcamentaria', rotulo: 'Unidade', tipo: 'texto',
        formatar: (v, l) => nomeUnidade(dic, l.codigo_orgao, v),
      },
      { campo: 'data_disponibilizacao', rotulo: 'Disponibilizado em', formatar: (v) => data(v) },
    ], {
      ordenarPor: 'data_disponibilizacao',
      nomeArquivo: '' + estado.ano + '-controle-bens',
    }));
  } catch (erro) {
    alvo.replaceChildren(erroNaTela(erro, () => montarControle(alvo, estado, dic)));
  }
}
