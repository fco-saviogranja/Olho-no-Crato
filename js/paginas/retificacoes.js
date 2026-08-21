// Retificações: o que o município mudou depois de já ter informado ao TCE.
//
// A API do TCE mostra sempre o estado atual, sem memória. Como o banco de
// apoio guarda o que foi lido em cada carga, dá para comparar e registrar toda
// vez que um valor já enviado muda. Foi uma dessas mudanças, notada por acaso
// durante o desenvolvimento, que deu origem a esta página.

import * as banco from '../api/banco.js';
import { capitalizar, data, dinheiro, numero, texto } from '../api/formato.js';
import { agrupar, ordenarPor } from '../dados/agregacoes.js';
import {
  aviso, botao, carregando, cartao, el, grade, ranking, secao, vazio,
} from '../ui/componentes.js';
import { tabela } from '../ui/tabela.js';

export const titulo = 'Retificações';

const NOMES_TABELA = {
  empenhos: 'Empenhos',
  contratos: 'Contratos',
  contratados: 'Contratados',
  licitacoes: 'Licitações',
  itens_licitacao: 'Itens de licitação',
  licitantes: 'Licitantes',
  obras: 'Obras',
  obras_situacao: 'Situação de obras',
  bens: 'Bens patrimoniais',
  creditos: 'Créditos adicionais',
  balancete_despesa: 'Balancete de despesa',
  balancete_receita: 'Balancete de receita',
};

export async function montar(raiz, estado) {
  raiz.append(el('div', { class: 'topo-pagina' },
    el('h1', { texto: 'Valores corrigidos depois do envio' }),
    el('p', { class: 'linha-fina' },
      'Dados de prestação de contas não são definitivos: o município pode corrigir o que já '
      + 'enviou ao TCE. Esta página registra essas correções.')));

  raiz.append(explicacao());

  if (!(await banco.disponivel())) {
    raiz.append(aviso('alerta',
      'O histórico depende do banco de apoio, que não respondeu agora. '
      + 'O restante do site continua funcionando direto com a API do TCE.'));
    return;
  }

  const carregando0 = carregando('Consultando o histórico de alterações...');
  raiz.append(carregando0);

  const [valores, todas, ultima] = await Promise.all([
    banco.selecionar('retificacoes', {}, {
      ordem: 'percebida_em.desc', limite: 500,
    }),
    banco.selecionar('alteracoes', {}, {
      campos: 'tabela,campo,percebida_em', ordem: 'percebida_em.desc', limite: 2000,
    }),
    banco.ultimaCarga(),
  ]);
  carregando0.remove();

  if (!valores || !todas) {
    raiz.append(aviso('alerta', 'Não foi possível ler o histórico agora.'));
    return;
  }

  if (!todas.length) {
    raiz.append(vazio('Nenhuma alteração registrada até agora',
      'Desde a primeira carga do banco, nada que o município já havia enviado foi modificado. '
      + 'A comparação é refeita a cada atualização.'));
    if (ultima) {
      raiz.append(el('p', { class: 'carimbo' },
        'Última atualização do banco em ' + new Date(ultima.concluida_em).toLocaleString('pt-BR')));
    }
    return;
  }

  raiz.append(resumo(valores, todas));
  raiz.append(porOnde(todas));
  if (valores.length) raiz.append(maioresMudancas(valores, estado));
  if (ultima) {
    raiz.append(el('p', { class: 'carimbo' },
      'Comparação feita a cada carga do banco. Última em '
      + new Date(ultima.concluida_em).toLocaleString('pt-BR') + '.'));
  }
}

function explicacao() {
  const bloco = secao({ titulo: 'Como funciona a retificação' });
  bloco.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'A API do TCE entrega sempre a versão atual de cada informação, sem guardar o '
      + 'que havia antes. Quem consulta hoje e quem consultou mês passado podem ver números '
      + 'diferentes para o mesmo mês já encerrado, sem qualquer aviso.'),
    el('p', {}, 'Retificar é legítimo e faz parte da prestação de contas: erro de digitação, '
      + 'lançamento em dotação errada, nota cancelada. O que não existe hoje é registro público '
      + 'e fácil de consultar sobre o que mudou, quando e em quanto.'),
    el('p', {}, 'Este site guarda uma cópia de cada carga e compara com a anterior. Quando um '
      + 'valor muda, a diferença fica registrada aqui, com data.')));
  return bloco;
}

function resumo(valores, todas) {
  const somaDiferencas = valores.reduce((s, r) => s + Math.abs(Number(r.diferenca) || 0), 0);
  const tabelas = new Set(todas.map((a) => a.tabela)).size;
  const maisRecente = todas[0] ? new Date(todas[0].percebida_em) : null;

  return grade(
    cartao({
      titulo: 'Alterações registradas', valor: numero(todas.length), tom: 'neutro',
      detalhe: 'Em ' + tabelas + ' conjunto' + (tabelas === 1 ? '' : 's') + ' de dados',
    }),
    cartao({
      titulo: 'Mudanças de valor', valor: numero(valores.length), tom: 'empenhado',
      detalhe: 'Alterações em campos monetários',
    }),
    cartao({
      titulo: 'Soma das diferenças', valor: somaDiferencas, tom: 'alerta',
      detalhe: 'Somando o tamanho de cada mudança, para cima ou para baixo',
      ajuda: 'Não é dinheiro a mais nem a menos: é o total movimentado pelas correções.',
    }),
    cartao({
      titulo: 'Mais recente', valor: maisRecente ? maisRecente.toLocaleDateString('pt-BR') : '-',
      tom: 'previsto',
      detalhe: maisRecente ? maisRecente.toLocaleTimeString('pt-BR') : '',
    }),
  );
}

function porOnde(todas) {
  const porTabela = ordenarPor(
    agrupar(todas, 'tabela', [], (t) => NOMES_TABELA[t] || t), 'quantidade');
  const porCampo = ordenarPor(agrupar(todas, 'campo', []), 'quantidade').slice(0, 10);

  const bloco = secao({
    titulo: 'Em quais dados houve correção',
    descricao: 'Quais conjuntos de dados e quais campos mudam com mais frequência.',
  });
  bloco.corpo.append(
    el('h3', { texto: 'Por conjunto de dados' }),
    ranking(porTabela, { campo: 'quantidade', formatar: (v) => numero(v) + ' alterações' }),
    el('h3', { texto: 'Por campo' }),
    ranking(porCampo, { campo: 'quantidade', formatar: (v) => numero(v) + ' alterações' }),
  );
  return bloco;
}

function maioresMudancas(valores, estado) {
  const comTamanho = valores.map((r) => Object.assign({}, r, {
    tamanho: Math.abs(Number(r.diferenca) || 0),
    conjunto: NOMES_TABELA[r.tabela] || r.tabela,
  }));

  const bloco = secao({
    titulo: 'Maiores mudanças de valor',
    descricao: 'Ordenadas pela diferença entre o valor anterior e o atual.',
  });
  bloco.corpo.append(tabela(comTamanho, [
    { campo: 'conjunto', rotulo: 'Conjunto', tipo: 'texto' },
    { campo: 'campo', rotulo: 'Campo', tipo: 'texto' },
    { campo: 'registro', rotulo: 'Registro', tipo: 'texto' },
    { campo: 'valor_antigo', rotulo: 'Antes', tipo: 'dinheiro' },
    { campo: 'valor_novo', rotulo: 'Depois', tipo: 'dinheiro' },
    {
      campo: 'diferenca', rotulo: 'Diferença', tipo: 'dinheiro',
      formatar: (v) => (Number(v) > 0 ? '+' : '') + dinheiro(v),
    },
    { campo: 'percebida_em', rotulo: 'Percebida em', formatar: (v) => data(v) },
  ], {
    ordenarPor: 'tamanho',
    camposBusca: ['conjunto', 'campo', 'registro'],
    nomeArquivo: 'crato-retificacoes',
  }));
  bloco.corpo.append(el('p', { class: 'nota' },
    'O registro é a chave do dado no TCE, montada com os campos que o identificam. '
    + 'Para achar o documento original, use esses valores em ',
    el('a', { href: '#/explorador', texto: 'Dados brutos' }), '.'));
  return bloco;
}

export { capitalizar, texto };
