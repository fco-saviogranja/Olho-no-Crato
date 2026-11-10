// Sobre: de onde vêm os dados, como foram tratados e o que este site não sabe.
// Num projeto de extensão, esta página vale tanto quanto os gráficos.

import {
  anosDisponiveis, BASE, cache, MUNICIPIO, MUNICIPIO_COM_BANCO, MUNICIPIOS, municipioPorCodigo,
} from '../api/tce.js';
import * as banco from '../api/banco.js';
import { ENDPOINTS, GRUPOS } from '../api/catalogo.js';
import { numero } from '../api/formato.js';
import { botao, el, secao } from '../ui/componentes.js';

export const titulo = 'Sobre';

export async function montar(raiz, estado) {
  raiz.append(el('div', { class: 'topo-pagina' },
    el('h1', { texto: 'Sobre o Olho no Cariri' }),
    el('p', { class: 'linha-fina' },
      'Um site de consulta cidadã aos gastos públicos dos nove municípios da Região '
      + 'Metropolitana do Cariri, no Ceará. Você está vendo ' + MUNICIPIO.nome + '.')));

  const oQueE = secao({ titulo: 'O que é' });
  oQueE.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'Os dados de gasto público já são públicos: cada município presta contas '
      + 'mensalmente ao Tribunal de Contas do Estado do Ceará pelo Sistema de Informações '
      + 'Municipais, e o TCE publica tudo em uma interface aberta de programação. O problema é que '
      + 'essa interface fala em código, não em português: órgão 08, função 12, elemento 33903000.'),
    el('p', {}, 'Este site faz a tradução. Ele consulta a mesma base, cruza os códigos com as '
      + 'tabelas oficiais e apresenta o resultado em linguagem de cidadão, mantendo sempre o '
      + 'caminho de volta ao dado bruto para quem quiser conferir.'),
    el('p', {}, 'Foi feito como Projeto de Extensão VI do curso de Direito, em 2026.2.')));
  raiz.append(oQueE);

  const quais = secao({
    titulo: 'Quais municípios, e por que esses',
    descricao: 'A fronteira do site é jurídica, não geográfica.',
  });
  quais.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'O site cobre os nove municípios da Região Metropolitana do Cariri, instituída '
      + 'pela Lei Complementar Estadual nº 78, de 26 de junho de 2009. A escolha do recorte não '
      + 'foi de gosto: "Cariri" no uso corrente vai de nove a quase trinta municípios, dependendo '
      + 'de quem fala e do critério, e um site de prestação de contas precisa de uma fronteira que '
      + 'alguém tenha definido por escrito e que possa ser conferida.'),
    el('ul', { class: 'lista-larga' },
      MUNICIPIOS.map((m) => el('li', {},
        el('strong', { texto: m.nome }),
        ' · código ', el('code', { class: 'codigo', texto: m.codigo }),
        ' no SIM, ', el('code', { class: 'codigo', texto: m.ibge }), ' no IBGE',
        m.codigo === MUNICIPIO.codigo ? el('strong', { texto: ' · você está vendo este' }) : null))),
    el('p', {}, 'Os dois códigos existem porque são sistemas diferentes: o Tribunal numera os '
      + 'municípios do Ceará por conta própria, de 001 a 184, e esse número não tem relação com o '
      + 'código do IBGE. Quem consulta a API trocando um pelo outro recebe uma lista vazia com '
      + 'resposta de sucesso, sem mensagem de erro nenhuma.')));
  raiz.append(quais);

  const fonte = secao({ titulo: 'De onde vêm os dados' });
  fonte.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'Fonte única: a ',
      el('a', { href: 'https://api-dados-abertos.tce.ce.gov.br/sim/', target: '_blank', rel: 'noopener' },
        'API de Dados Abertos do SIM'),
      ', do TCE-CE. O endereço consultado é ',
      el('code', { class: 'codigo', texto: BASE }),
      ' e o município escolhido é o código ',
      el('code', { class: 'codigo', texto: MUNICIPIO.codigo }),
      ' (' + MUNICIPIO.nome + ', IBGE ' + MUNICIPIO.ibge + ').'),
    el('p', {}, 'A consulta parte do seu navegador direto para o TCE. Não existe servidor '
      + 'intermediário, banco de dados nem cópia dos números em outro lugar: o que você vê é o que '
      + 'o Tribunal está publicando neste momento.'),
    el('p', {}, 'Trocar de município não muda nada além desse código: são os mesmos endpoints, '
      + 'lidos do mesmo jeito, com o mesmo tratamento. Isso importa para quem for comparar '
      + 'cidades — a diferença que aparecer na tela é diferença do dado, não de método.'),
    el('p', {}, 'O site cobre ' + ENDPOINTS.length + ' conjuntos de dados, distribuídos em '
      + GRUPOS.length + ' grupos, todos abertos em ',
      el('a', { href: '#/explorador', texto: 'Dados brutos' }), '.'),
    el('ul', {}, GRUPOS.map((g) => el('li', {},
      el('strong', { texto: g.sigla }), ' · ' + g.descricao + ' (' + g.total + ' conjuntos)')))));
  raiz.append(fonte);

  const tratamento = secao({ titulo: 'O que foi feito com os dados' });
  tratamento.corpo.append(el('div', { class: 'texto-longo' },
    el('ul', { class: 'lista-larga' },
      el('li', {}, 'Códigos de função, subfunção e fonte de recursos foram traduzidos com as '
        + 'tabelas oficiais do Manual do SIM 2026 (Tabelas II e III), guardadas junto do site.'),
      el('li', {}, 'Nomes de órgãos, unidades, elementos de despesa e ações vêm da própria API, '
        + 'consultados no exercício selecionado.'),
      el('li', {}, 'Os totais do Panorama e da página Para onde vai saem do balancete mensal '
        + 'consolidado, somando os valores acumulados até o último mês publicado.'),
      el('li', {}, 'Nenhum valor é estimado, projetado ou corrigido pela inflação. Soma e '
        + 'porcentagem são as únicas operações aplicadas.'),
      el('li', {}, 'Textos em caixa alta foram ajustados para leitura, sem alterar o conteúdo.'))));
  raiz.append(tratamento);

  const limites = secao({
    titulo: 'Limitações',
    descricao: 'O que os números não mostram, e por quê.',
  });
  limites.corpo.append(el('div', { class: 'texto-longo' },
    el('ul', { class: 'lista-larga' },
      el('li', {}, el('strong', { texto: 'Os dados chegam com atraso. ' }),
        'O município tem prazo para enviar cada mês ao TCE, então o mês corrente e o anterior '
        + 'costumam estar incompletos ou ausentes.'),
      el('li', {}, el('strong', { texto: 'Os números podem mudar. ' }),
        'O município pode retificar informações já enviadas. Consultas feitas em dias diferentes '
        + 'podem devolver valores diferentes para o mesmo mês, por isso cada página mostra a data e '
        + 'a hora da consulta.'),
      el('li', {}, el('strong', { texto: 'O site mostra o que foi informado, não o que aconteceu. ' }),
        'Se a prefeitura deixou de enviar um conjunto de dados, ele aparece vazio aqui. Vazio não '
        + 'significa que nada foi gasto.'),
      el('li', {}, el('strong', { texto: 'A completude varia de prefeitura para prefeitura. ' }),
        'Cada município alimenta o SIM com sua própria estrutura administrativa e seu próprio '
        + 'grau de disciplina. Um conjunto cheio numa cidade e vazio na vizinha costuma dizer mais '
        + 'sobre quem informou do que sobre o que foi feito — e é por isso que a página de '
        + 'Parcerias compara o mesmo endpoint em outros municípios antes de concluir qualquer '
        + 'coisa a partir de uma tela vazia.'),
      el('li', {}, el('strong', { texto: 'Comparar cidades exige cuidado com o tamanho delas. ' }),
        'Juazeiro do Norte tem orçamento mais de dez vezes maior que o de Nova Olinda. Colocar os '
        + 'totais lado a lado sem considerar população, rede de serviços e competências próprias '
        + 'de cada município produz comparação que parece análise e não é. O site não calcula '
        + 'valor por habitante, justamente para não sugerir uma equivalência que os números '
        + 'sozinhos não sustentam.'),
      el('li', {}, el('strong', { texto: 'Restos a pagar não estão separados. ' }),
        'O balancete de um exercício não inclui pagamentos de empenhos de anos anteriores, então o '
        + 'total pago em um ano não é todo o dinheiro que saiu do caixa naquele ano.'),
      el('li', {}, el('strong', { texto: 'Alguns códigos ficam sem tradução. ' }),
        'Programas de governo, modalidades de licitação e tipos de contrato aparecem pelo código, '
        + 'porque a API não devolve o nome e não há tabela pública equivalente. Nesses casos o site '
        + 'mostra o código cru em vez de adivinhar.'),
      el('li', {}, el('strong', { texto: 'Dados pessoais vêm protegidos da origem. ' }),
        'O TCE entrega o CPF de pessoas físicas criptografado e mascara endereços e telefones. '
        + 'Este site não tenta reverter nada disso.'),
      el('li', {}, el('strong', { texto: 'Não é o Portal da Transparência oficial. ' }),
        'Este é um trabalho acadêmico independente. Para atos oficiais, consulte a Prefeitura '
        + 'Municipal de cada cidade e o próprio TCE-CE.'))));
  raiz.append(limites);

  const municipioDoBanco = municipioPorCodigo(MUNICIPIO_COM_BANCO);
  const camadas = secao({
    titulo: 'As duas fontes de dados',
    descricao: 'Quase tudo vem do TCE ao vivo. Só três recursos dependem de um banco de apoio, '
      + 'e esse banco cobre um município só.',
  });
  const situacaoBanco = el('p', { class: 'nota', texto: 'Verificando o banco de apoio...' });
  camadas.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'O Panorama, as páginas temáticas e os dados brutos falam direto com a API do '
      + 'Tribunal, sem intermediário. É de lá que saem todos os valores que o site mostra por '
      + 'exercício.'),
    el('p', {}, 'Três coisas a API não consegue fazer: procurar uma palavra, somar um fornecedor '
      + 'em vários anos de uma vez e lembrar o que já foi informado antes. Para isso existe um '
      + 'banco de apoio, carregado periodicamente a partir da mesma API, que sustenta as páginas ',
    el('a', { href: '#/busca', texto: 'Buscar' }), ', ',
    el('a', { href: '#/historico', texto: 'Ano a ano' }), ' e ',
    el('a', { href: '#/retificacoes', texto: 'Retificações' }), '.'),
    el('p', {}, 'O banco guarda uma cópia do que o TCE publicou em cada carga. É isso que permite '
      + 'mostrar quando um valor já informado foi retificado depois, algo que a API não registra, '
      + 'porque ela sempre devolve apenas a versão mais recente.'),
    // Sem artigo antes do nome: "apenas Crato" pede "o", "apenas Barbalha" não,
    // e o município do banco é configurável. Dois-pontos resolve para qualquer um.
    el('p', {}, el('strong', { texto: 'Esse banco cobre um município só: '
      + (municipioDoBanco ? municipioDoBanco.nome : 'um apenas') + '. ' }),
    'Guardar nove municípios passaria de 1,4 GB, contra os 500 MB do plano gratuito em que o '
      + 'banco roda. Nos outros oito, ', el('a', { href: '#/busca', texto: 'Buscar' }), ', ',
    el('a', { href: '#/historico', texto: 'Ano a ano' }), ' e ',
    el('a', { href: '#/retificacoes', texto: 'Retificações' }),
    ' saem do menu e explicam a ausência se você chegar nelas por link. Todas as demais seções '
      + 'funcionam igual nos nove, porque falam direto com o Tribunal.'),
    el('p', {}, 'Ampliar não é só questão de espaço: as tabelas do banco foram desenhadas quando '
      + 'o site tratava de uma cidade só, e por isso não guardam o código do município. Incluir '
      + 'os outros oito exige refazer a estrutura, não apenas carregar mais dados.'),
    el('p', {}, 'Se o banco estiver fora do ar, essas páginas avisam e o resto do site '
      + 'continua funcionando igual.'),
    situacaoBanco));
  raiz.append(camadas);

  banco.disponivel().then(async (ativo) => {
    if (!banco.configurado()) {
      situacaoBanco.textContent = 'Banco de apoio: não configurado nesta instalação. '
        + 'Buscar, Ano a ano e Retificações ficam indisponíveis; o restante funciona normalmente.';
      return;
    }
    if (!ativo) {
      situacaoBanco.textContent = 'Banco de apoio: sem resposta no momento.';
      return;
    }
    const carga = await banco.ultimaCarga();
    situacaoBanco.textContent = carga && carga.concluida_em
      ? 'Banco de apoio: ativo, carregado pela última vez em '
        + new Date(carga.concluida_em).toLocaleString('pt-BR') + '.'
      : 'Banco de apoio: ativo.';
  });

  const tecnico = secao({ titulo: 'Como o site é feito' });
  const infoCache = el('p', { class: 'nota', texto: 'Verificando o armazenamento local...' });
  tecnico.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'Site estático, sem servidor próprio, escrito em HTML, CSS e JavaScript sem nenhuma '
      + 'biblioteca externa. Os gráficos são desenhados em SVG pelo próprio site.'),
    el('p', {}, 'Cada consulta ao TCE é guardada no seu navegador por 24 horas, para não repetir '
      + 'pedidos e para o site continuar funcionando se o Tribunal sair do ar. Nada é enviado a '
      + 'terceiros e o site não usa cookies nem qualquer forma de rastreamento.'),
    el('p', {}, 'Exercícios disponíveis para consulta: de ' + anosDisponiveis().slice(-1)[0]
      + ' a ' + anosDisponiveis()[0] + '.'),
    infoCache,
    botao('Apagar os dados guardados neste navegador', async () => {
      await cache.limpar();
      infoCache.textContent = 'Armazenamento local apagado. A próxima consulta vai direto ao TCE.';
    }, { classe: 'botao botao-secundario' })));
  raiz.append(tecnico);

  cache.tamanho().then((n) => {
    infoCache.textContent = n
      ? 'Há ' + numero(n) + ' consultas guardadas neste navegador.'
      : 'Não há nenhuma consulta guardada neste navegador.';
  }).catch(() => {
    infoCache.textContent = '';
  });

  const uso = secao({ titulo: 'Uso e reprodução' });
  uso.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'Os dados são públicos e podem ser reutilizados livremente, citando o TCE-CE como '
      + 'fonte. Toda tabela do site tem botão para baixar em CSV, que abre no Excel ou no '
      + 'LibreOffice.'),
    el('p', {}, 'Encontrou um número que parece errado? Abra a mesma consulta em ',
      el('a', { href: '#/explorador', texto: 'Dados brutos' }),
      ' e compare com o que o TCE devolve. Se a diferença estiver no site, é falha do site.')));
  raiz.append(uso);
}
