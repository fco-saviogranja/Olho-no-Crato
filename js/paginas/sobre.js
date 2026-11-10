// Sobre: de onde vêm os dados, como foram tratados e o que este site não sabe.
// Num projeto de extensão, esta página vale tanto quanto os gráficos.

import { anosDisponiveis, BASE, MUNICIPIO, cache } from '../api/tce.js';
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

  const camadas = secao({
    titulo: 'As duas fontes de dados',
    descricao: 'Quase tudo vem do TCE ao vivo. Só três recursos dependem de um banco de apoio.',
  });
  const situacaoBanco = el('p', { class: 'nota', texto: 'Verificando o banco de apoio...' });
  camadas.corpo.append(el('div', { class: 'texto-longo' },
    el('p', {}, 'O Panorama, as páginas temáticas e os dados brutos falam direto com a API do '
      + 'Tribunal, sem intermediário. É de lá que saem todos os valores que o site mostra por '
      + 'exercício.'),
    el('p', {}, 'Três coisas a API não consegue fazer: procurar uma palavra, somar um fornecedor '
      + 'em vários anos de uma vez e lembrar o que já foi informado antes. Para isso existe um '
      + 'banco de apoio, carregado periodicamente a partir da mesma API, que sustenta as páginas ',
    el('a', { href: '#/busca', texto: 'Buscar' }), ' e ',
    el('a', { href: '#/historico', texto: 'Ano a ano' }), '.'),
    el('p', {}, 'O banco guarda uma cópia do que o TCE publicou em cada carga. É isso que permite '
      + 'mostrar quando um valor já informado foi retificado depois, algo que a API não registra, '
      + 'porque ela sempre devolve apenas a versão mais recente.'),
    el('p', {}, 'Se o banco estiver fora do ar, essas duas páginas avisam e o resto do site '
      + 'continua funcionando igual.'),
    situacaoBanco));
  raiz.append(camadas);

  banco.disponivel().then(async (ativo) => {
    if (!banco.configurado()) {
      situacaoBanco.textContent = 'Banco de apoio: não configurado nesta instalação. '
        + 'Buscar e Ano a ano ficam indisponíveis; o restante funciona normalmente.';
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
