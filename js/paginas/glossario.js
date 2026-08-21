// Glossário: as palavras que travam a leitura de gasto público, explicadas
// como se explica para quem nunca leu um orçamento.

import { el, secao } from '../ui/componentes.js';

export const titulo = 'Glossário';

const VERBETES = [
  {
    termo: 'Orçamento (LOA)',
    curto: 'A lei que autoriza o gasto do ano.',
    texto: 'A Lei Orçamentária Anual é aprovada pela Câmara Municipal no fim do ano anterior. '
      + 'Ela estima quanto o município vai arrecadar e fixa quanto pode gastar em cada área. '
      + 'É autorização, não obrigação: o orçamento pode ser executado parcialmente.',
  },
  {
    termo: 'Empenho',
    curto: 'A prefeitura reserva o dinheiro e assume o compromisso.',
    texto: 'Primeira das três etapas da despesa. O município separa uma parte da dotação para uma '
      + 'compra ou serviço específico e emite a nota de empenho em nome do fornecedor. '
      + 'Nada saiu do caixa ainda, mas o dinheiro deixou de estar disponível para outra coisa.',
  },
  {
    termo: 'Liquidação',
    curto: 'A entrega foi conferida e a dívida está reconhecida.',
    texto: 'Segunda etapa. O produto chegou ou o serviço foi prestado, e a prefeitura conferiu a '
      + 'nota fiscal e a execução. A partir daí o município reconhece que deve o valor. '
      + 'Se um empenho fica muito tempo sem liquidar, ou a compra não aconteceu, ou não foi conferida.',
  },
  {
    termo: 'Pagamento',
    curto: 'O dinheiro sai do caixa.',
    texto: 'Terceira e última etapa. É o único momento em que o dinheiro efetivamente deixa a conta '
      + 'do município. Por isso, quando se pergunta quanto foi gasto de verdade, o valor pago é a '
      + 'resposta mais próxima.',
  },
  {
    termo: 'Objeto do empenho',
    curto: 'O texto em que a prefeitura diz o que está contratando.',
    texto: 'Todo empenho traz uma descrição do que motivou a despesa: qual serviço, qual compra, '
      + 'para qual secretaria, com base em qual contrato. É a parte mais direta de ler de todo o '
      + 'dado orçamentário, porque está em português corrido e não em código. Aparece na ficha de '
      + 'cada credor, em Quem recebe.',
  },
  {
    termo: 'Anulação de empenho',
    curto: 'O compromisso é desfeito e o dinheiro volta para a dotação.',
    texto: 'Empenhar reserva dinheiro; anular devolve essa reserva ao orçamento. Acontece quando a '
      + 'compra não se realiza, quando o valor empenhado foi maior que o necessário ou quando houve '
      + 'erro de lançamento. A anulação pode ser total ou parcial. Empenho anulado não vira '
      + 'pagamento, então o valor não chega ao credor, ainda que o empenho continue aparecendo no '
      + 'nome dele.',
  },
  {
    termo: 'Dotação',
    curto: 'O endereço do dinheiro dentro do orçamento.',
    texto: 'Cada real do orçamento tem um endereço completo: qual órgão, qual unidade, qual função, '
      + 'qual programa, qual ação, qual tipo de gasto e qual fonte. Esse conjunto é a dotação '
      + 'orçamentária, e é o que permite dizer exatamente de onde saiu cada despesa.',
  },
  {
    termo: 'Função e subfunção',
    curto: 'A área de atuação do gasto.',
    texto: 'Função é a grande área: Saúde, Educação, Urbanismo, Segurança Pública. Subfunção é o '
      + 'detalhe dentro dela, como Atenção Básica dentro de Saúde ou Ensino Fundamental dentro de '
      + 'Educação. A classificação é nacional, definida pela Portaria MOG 42/1999, o que permite '
      + 'comparar municípios diferentes.',
  },
  {
    termo: 'Elemento de despesa',
    curto: 'O tipo de coisa que se comprou.',
    texto: 'Diz respeito à natureza do gasto: vencimentos de pessoal, material de consumo, serviços '
      + 'de terceiros, obras e instalações, equipamentos. Um mesmo elemento aparece em várias áreas, '
      + 'e é por ele que se responde a perguntas como quanto o município gasta com combustível.',
  },
  {
    termo: 'Fonte de recursos',
    curto: 'De onde veio o dinheiro e para que ele pode ser usado.',
    texto: 'Parte da receita é livre, como os impostos próprios não vinculados. Outra parte é '
      + 'carimbada: recursos do FUNDEB só podem ir para educação, transferências do SUS só para '
      + 'saúde. Quando um serviço não anda, às vezes o problema não é falta de dinheiro em caixa, '
      + 'e sim falta de dinheiro daquela fonte específica.',
  },
  {
    termo: 'Crédito adicional',
    curto: 'Reforço no orçamento depois da lei aprovada.',
    texto: 'Durante o ano o orçamento pode ser reforçado com créditos suplementares, especiais ou '
      + 'extraordinários. O dinheiro tem que vir de algum lugar: excesso de arrecadação, superávit '
      + 'do ano anterior, operação de crédito ou anulação de outra dotação. A abertura é feita por '
      + 'decreto do prefeito, com base em autorização legal.',
  },
  {
    termo: 'Restos a pagar',
    curto: 'Despesa empenhada num ano e paga no seguinte.',
    texto: 'Quando o ano acaba com empenhos não pagos, eles viram restos a pagar e são quitados no '
      + 'exercício seguinte. Por isso o valor pago em um ano nem sempre corresponde ao que foi '
      + 'empenhado nesse mesmo ano.',
  },
  {
    termo: 'Balancete',
    curto: 'O resumo mensal das contas.',
    texto: 'Todo mês o município envia ao TCE um balancete com receitas e despesas do período e o '
      + 'acumulado do ano. É a fonte mais confiável para acompanhar a execução do orçamento, e é '
      + 'dela que este site tira os números do Panorama.',
  },
  {
    termo: 'Licitação',
    curto: 'O processo de escolha de quem vai fornecer.',
    texto: 'Regra geral para compras públicas, hoje regida principalmente pela Lei 14.133/2021. '
      + 'A prefeitura publica um edital, empresas apresentam propostas e vence quem atende às '
      + 'condições com a melhor oferta. Dispensa e inexigibilidade são exceções previstas em lei, '
      + 'que precisam ser justificadas.',
  },
  {
    termo: 'Dispensa e inexigibilidade',
    curto: 'As duas formas legais de contratar sem licitar.',
    texto: 'Na dispensa, a licitação seria possível mas a lei permite pular, em hipóteses '
      + 'delimitadas como valor pequeno ou emergência. Na inexigibilidade, licitar é inviável '
      + 'porque não há competição possível, como no fornecedor exclusivo ou no profissional de '
      + 'notória especialização. As duas exigem justificativa escrita e publicada. Não são atalhos '
      + 'livres: são exceções que precisam ser fundamentadas, hoje nos artigos 74 e 75 da Lei '
      + '14.133/2021.',
  },
  {
    termo: 'Contrato e aditivo',
    curto: 'O acordo assinado e as mudanças nele.',
    texto: 'O contrato formaliza o que foi licitado: objeto, valor, prazo e fiscal responsável. '
      + 'O aditivo altera o contrato já existente, prorrogando prazo ou mudando valor, dentro dos '
      + 'limites legais.',
  },
  {
    termo: 'Parceria com OSC',
    curto: 'Repasse a associações e fundações sem fins lucrativos.',
    texto: 'Regida pela Lei 13.019/2014, envolve termo de colaboração, termo de fomento ou acordo '
      + 'de cooperação, em regra precedidos de chamamento público, com plano de trabalho e '
      + 'prestação de contas.',
  },
  {
    termo: 'Ordenador de despesa',
    curto: 'Quem autoriza o gasto e responde por ele.',
    texto: 'É a autoridade que assina o empenho e autoriza o pagamento, normalmente o secretário da '
      + 'pasta ou o gestor do fundo. Responde pessoalmente perante o Tribunal de Contas pelos atos '
      + 'que pratica.',
  },
  {
    termo: 'SIM e TCE-CE',
    curto: 'De onde vêm os dados deste site.',
    texto: 'O Sistema de Informações Municipais é o canal pelo qual os 184 municípios cearenses e o '
      + 'Governo do Estado prestam contas ao Tribunal de Contas do Estado do Ceará. O TCE publica '
      + 'esses dados em uma API aberta, que é a única fonte deste site.',
  },
];

export async function montar(raiz) {
  raiz.append(el('div', { class: 'topo-pagina' },
    el('h1', { texto: 'Glossário' }),
    el('p', { class: 'linha-fina' },
      'Orçamento público tem vocabulário próprio. Estes são os termos que aparecem no site, '
      + 'na ordem em que fazem sentido.')));

  const caminho = secao({
    titulo: 'As três etapas da despesa',
    descricao: 'Do orçamento aprovado até o dinheiro sair da conta do município.',
  });
  caminho.corpo.append(el('ol', { class: 'caminho' },
    ['A Câmara aprova a Lei Orçamentária, que autoriza o gasto',
      'A prefeitura empenha: reserva o dinheiro para um fornecedor',
      'O fornecedor entrega, e a prefeitura liquida: confere e reconhece a dívida',
      'A prefeitura paga: o dinheiro sai da conta',
      'Tudo isso é informado mês a mês ao TCE, e aparece aqui'].map((passo) => el('li', { texto: passo }))));
  raiz.append(caminho);

  const lista = secao({ titulo: 'Termos', descricao: 'Em ordem de uso, não alfabética.' });
  // os verbetes vão num contêiner próprio para poderem correr em duas colunas
  // nas telas largas, sem esticar a linha de leitura
  const verbetes = el('div', { class: 'verbetes' });
  for (const v of VERBETES) {
    verbetes.append(el('div', { class: 'verbete' },
      el('h3', { texto: v.termo }),
      el('p', { class: 'verbete-curto', texto: v.curto }),
      el('p', { texto: v.texto })));
  }
  lista.corpo.append(verbetes);
  raiz.append(lista);
}
