// Busca em todos os exercícios de uma vez, que é justamente o que a API do
// TCE não permite: ela não tem filtro por texto e obriga a consultar um
// período por vez. Esta página só existe quando o banco de apoio está de pé.

import * as banco from '../api/banco.js';
import { capitalizar, data, dinheiro, documento, numero, texto, truncar } from '../api/formato.js';
import {
  abas, aviso, botao, carregando, cartao, el, grade, secao, vazio,
} from '../ui/componentes.js';
import { linhas as graficoLinhas } from '../ui/grafico.js';
import { tabela } from '../ui/tabela.js';

export const titulo = 'Busca';

export async function montar(raiz, estado) {
  raiz.append(el('div', { class: 'topo-pagina' },
    el('h1', { texto: 'Buscar em todos os anos' }),
    el('p', { class: 'linha-fina' },
      'Procure uma palavra no histórico dos empenhos, no objeto dos contratos e das licitações '
      + 'e na descrição dos itens comprados, sem precisar escolher o exercício.')));

  if (!(await banco.disponivel())) {
    raiz.append(bancoForaDoAr(estado));
    return;
  }

  const termoInicial = estado.params.get('q') || '';
  const campo = el('input', {
    type: 'search', class: 'campo-busca', value: termoInicial,
    placeholder: 'merenda, combustível, ambulância, pavimentação...',
    'aria-label': 'Termo a procurar',
  });
  const resultado = el('div', {});

  const procurar = async () => {
    const termo = campo.value.trim();
    if (termo.length < 3) {
      resultado.replaceChildren(aviso('alerta', 'Escreva pelo menos três letras.'));
      return;
    }
    resultado.replaceChildren(carregando('Procurando em todos os exercícios...'));
    const [textos, fornecedores, precos] = await Promise.all([
      banco.chamar('buscar_texto', { termo, limite: 60 }),
      banco.chamar('buscar_fornecedor', { termo, limite: 40 }),
      banco.chamar('precos_do_item', { termo, limite: 300 }),
    ]);

    if (!textos && !fornecedores && !precos) {
      resultado.replaceChildren(bancoForaDoAr(estado));
      return;
    }

    const achados = textos || [];
    const empresas = fornecedores || [];
    const itens = precos || [];

    if (!achados.length && !empresas.length && !itens.length) {
      resultado.replaceChildren(vazio('Nada encontrado para "' + termo + '"',
        'Tente uma palavra mais curta ou sem plural. A busca ignora acentos e maiúsculas.'));
      return;
    }

    resultado.replaceChildren(
      resumoDaBusca(achados, empresas, itens),
      montarAbas(termo, achados, empresas, itens, estado),
    );
  };

  campo.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') procurar();
  });

  const bloco = secao({
    titulo: 'Termo de busca',
    descricao: 'A busca ignora acentos e não diferencia maiúsculas.',
  });
  bloco.corpo.append(
    el('div', { class: 'tabela-ferramentas' }, campo, botao('Procurar', procurar)),
    el('div', { class: 'chips' }, ['merenda', 'combustível', 'ambulância', 'pavimentação',
      'medicamento', 'locação de veículo'].map((sugestao) => el('button', {
      class: 'chip',
      texto: sugestao,
      onClick: () => { campo.value = sugestao; procurar(); },
    }))),
  );
  raiz.append(bloco);
  raiz.append(resultado);

  if (termoInicial) procurar();
}

function bancoForaDoAr(estado) {
  const naoConfigurado = banco.estado() === 'ausente';
  return el('div', {},
    aviso('alerta', naoConfigurado
      ? 'A busca em todos os anos depende do banco de apoio, que ainda não foi configurado. '
        + 'O restante do site continua funcionando direto com a API do TCE.'
      : 'A busca em todos os anos depende do banco de apoio, que não respondeu agora. No plano '
        + 'gratuito ele hiberna depois de uma semana parado e leva cerca de meio minuto para '
        + 'acordar. O restante do site continua funcionando direto com a API do TCE.'),
    botao('Ver os dados de um exercício por vez', () => estado.navegar('#/explorador'),
      { classe: 'botao botao-secundario' }));
}

function resumoDaBusca(achados, empresas, itens) {
  const porOrigem = {};
  for (const a of achados) porOrigem[a.origem] = (porOrigem[a.origem] || 0) + 1;
  const valorTotal = achados.reduce((soma, a) => soma + (Number(a.valor) || 0), 0);

  return grade(
    cartao({
      titulo: 'Registros encontrados', valor: numero(achados.length), tom: 'neutro',
      detalhe: Object.entries(porOrigem).map(([o, n]) => n + ' em ' + o.toLowerCase()).join(', ')
        || 'nenhum',
    }),
    cartao({
      titulo: 'Valor somado', valor: valorTotal, tom: 'empenhado',
      detalhe: 'Soma dos registros listados, para dar ordem de grandeza',
      ajuda: 'Empenho, contrato e licitação medem coisas diferentes; a soma serve só de referência.',
    }),
    cartao({
      titulo: 'Recebedores no nome', valor: numero(empresas.length), tom: 'previsto',
      detalhe: 'Fornecedores cujo nome contém o termo',
    }),
  );
}

function montarAbas(termo, achados, empresas, itens, estado) {
  const secoes = [];

  if (achados.length) {
    secoes.push({
      id: 'registros',
      titulo: 'Onde aparece (' + achados.length + ')',
      montar: (c) => c.append(tabela(achados, [
        { campo: 'origem', rotulo: 'Tipo', tipo: 'texto' },
        { campo: 'exercicio', rotulo: 'Ano', tipo: 'numero' },
        { campo: 'data', rotulo: 'Data', formatar: (v) => data(v) },
        { campo: 'identificacao', rotulo: 'Documento', tipo: 'texto' },
        {
          campo: 'descricao', rotulo: 'Descrição', tipo: 'texto',
          formatar: (v) => truncar(capitalizar(v), 120),
        },
        { campo: 'parte', rotulo: 'Envolvido', tipo: 'texto', formatar: (v) => capitalizar(v) },
        { campo: 'valor', rotulo: 'Valor', tipo: 'dinheiro' },
      ], {
        ordenarPor: 'valor',
        camposBusca: ['descricao', 'parte', 'identificacao'],
        nomeArquivo: 'busca-' + termo.replace(/\s+/g, '-'),
      })),
    });
  }

  if (empresas.length) {
    secoes.push({
      id: 'fornecedores',
      titulo: 'Recebedores (' + empresas.length + ')',
      montar: (c) => c.append(
        aviso('info',
          'Somando todos os exercícios guardados no banco. A API do TCE só permite consultar '
          + 'um exercício por vez.'),
        tabela(empresas, [
          { campo: 'nome', rotulo: 'Nome', tipo: 'texto', formatar: (v) => capitalizar(v) },
          { campo: 'documento', rotulo: 'CNPJ ou CPF', tipo: 'texto', formatar: (v) => documento(v) },
          { campo: 'municipio', rotulo: 'Município', tipo: 'texto', formatar: (v) => capitalizar(v) },
          { campo: 'empenhos', rotulo: 'Empenhos', tipo: 'numero' },
          {
            campo: 'periodo', rotulo: 'Período', tipo: 'texto',
            formatar: (_, l) => l.primeiro_exercicio + ' a ' + l.ultimo_exercicio,
          },
          { campo: 'total_empenhado', rotulo: 'Total empenhado', tipo: 'dinheiro' },
        ], {
          ordenarPor: 'total_empenhado',
          camposBusca: ['nome', 'documento'],
          nomeArquivo: 'recebedores-' + termo.replace(/\s+/g, '-'),
        }),
      ),
    });
  }

  if (itens.length) {
    secoes.push({
      id: 'precos',
      titulo: 'Preço ao longo dos anos',
      montar: (c) => c.append(precoDoItem(itens, termo)),
    });
  }

  return secoes.length
    ? el('div', { class: 'secao' }, abas(secoes))
    : vazio('Nada encontrado', 'Tente outra palavra.');
}

function precoDoItem(itens, termo) {
  const porAno = new Map();
  for (const i of itens) {
    const ano = Number(i.exercicio);
    if (!ano) continue;
    if (!porAno.has(ano)) porAno.set(ano, []);
    porAno.get(ano).push(Number(i.preco_unitario) || 0);
  }
  const anos = [...porAno.keys()].sort();
  const medias = anos.map((a) => {
    const valores = porAno.get(a);
    return valores.reduce((s, v) => s + v, 0) / valores.length;
  });
  const maximos = anos.map((a) => Math.max(...porAno.get(a)));
  const minimos = anos.map((a) => Math.min(...porAno.get(a)));

  const caixa = el('div', {});
  caixa.append(aviso('info',
    'Cada linha é um item comprado em uma licitação. Quando o mesmo produto aparece em anos '
    + 'diferentes, dá para ver quanto o preço unitário variou. Descrições muito genéricas '
    + 'misturam produtos diferentes, então confira a descrição antes de concluir qualquer coisa.'));

  if (anos.length > 1) {
    caixa.append(graficoLinhas([
      { nome: 'Menor preço', valores: minimos },
      { nome: 'Preço médio', valores: medias },
      { nome: 'Maior preço', valores: maximos },
    ], anos.map(String), { descricao: 'Preço unitário de "' + termo + '" ao longo dos anos' }));
  }

  caixa.append(tabela(itens, [
    { campo: 'exercicio', rotulo: 'Ano', tipo: 'numero' },
    { campo: 'data', rotulo: 'Data', formatar: (v) => data(v) },
    { campo: 'licitacao', rotulo: 'Licitação', tipo: 'texto' },
    {
      campo: 'descricao', rotulo: 'Item', tipo: 'texto',
      formatar: (v) => truncar(capitalizar(v), 110),
    },
    { campo: 'unidade', rotulo: 'Unidade', tipo: 'texto' },
    { campo: 'quantidade', rotulo: 'Quantidade', tipo: 'texto' },
    { campo: 'preco_unitario', rotulo: 'Preço unitário', tipo: 'dinheiro' },
  ], {
    ordenarPor: 'preco_unitario',
    camposBusca: ['descricao', 'licitacao'],
    nomeArquivo: 'precos-' + termo.replace(/\s+/g, '-'),
  }));

  if (anos.length > 1) {
    const primeiro = medias[0];
    const ultimo = medias[medias.length - 1];
    if (primeiro > 0) {
      const variacao = ((ultimo - primeiro) / primeiro) * 100;
      caixa.append(el('p', { class: 'nota' },
        'O preço médio passou de ' + dinheiro(primeiro) + ' em ' + anos[0] + ' para '
        + dinheiro(ultimo) + ' em ' + anos[anos.length - 1] + ', variação de '
        + variacao.toFixed(1).replace('.', ',') + '%. Sem correção pela inflação.'));
    }
  }

  return caixa;
}

export { texto };
