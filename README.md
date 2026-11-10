# Olho no Cariri

Consulta cidadã aos gastos públicos dos nove municípios da **Região Metropolitana
do Cariri**, no Ceará, alimentada pela API de Dados Abertos do Sistema de
Informações Municipais (SIM) do Tribunal de Contas do Estado do Ceará.

O recorte é o da Lei Complementar Estadual 78/2009, que instituiu a região: é uma
fronteira definida por escrito, e não a extensão variável que "Cariri" tem no uso
corrente. Quem visita escolhe o município ao entrar, e troca quando quiser.

Projeto de Extensão VI · Curso de Direito · 2026.2

## O problema que ele resolve

Os dados já são públicos. Cada município presta contas todo mês ao TCE-CE e o
Tribunal publica tudo em uma API aberta. Só que a API fala em código: órgão `08`,
função `12`, elemento `33903000`, fonte `540107000`. Este site faz a tradução e
apresenta os mesmos números em linguagem de cidadão, sempre com o caminho de
volta ao dado bruto para quem quiser conferir.

## Como rodar

O site é estático: HTML, CSS e JavaScript, sem instalação, sem build e sem
dependência de biblioteca externa. Só não funciona abrindo o `index.html` direto
pelo Windows Explorer, porque o navegador bloqueia módulos JavaScript no
protocolo `file://`. Use um servidor local:

```bash
node ferramentas/servidor.mjs
```

Depois abra <http://localhost:5510>. Para ver a pasta pronta exatamente como o
visitante verá, passe a porta e a pasta:

```bash
node ferramentas/servidor.mjs 5511 publicar
```

Node é a única exigência, e ela já existe: é o que monta a pasta de publicação
e o que o Cloudflare roda no build. Existe um equivalente em Python
(`ferramentas/servidor.py`), com os mesmos argumentos, para quem preferir.

Os dois recusam qualquer caminho que comece com ponto. Sem isso, servir a raiz
do projeto deixaria o `.env`, que tem a chave de escrita no banco, a um GET de
distância em `localhost`.

## Como publicar

Nunca suba a pasta do projeto inteira: ela contém o `.env` com a chave de
serviço, que grava no banco. Monte antes a pasta do que vai ao ar:

```bash
node ferramentas/preparar-publicacao.mjs
```

O script cria `publicar/` do zero com o que o navegador precisa e nada mais
(`index.html`, `css/`, `js/`, `dados/`, a imagem de compartilhamento e os
arquivos que o Cloudflare lê, cerca de 590 KB). Antes de terminar ele confere
arquivo por arquivo se escapou algum `.env` ou alguma chave que não seja a
anônima; se achar, apaga a pasta e aborta com erro.

O site está no Cloudflare, ligado a este repositório: todo push na `main`
publica sozinho. A configuração do lado do Cloudflare é:

| Campo | Valor |
|---|---|
| Build command | `node ferramentas/preparar-publicacao.mjs` |
| Deploy command | `npx wrangler deploy` |

O resto está em `wrangler.jsonc`, versionado aqui: nome do projeto, pasta a
servir (`publicar/`) e o tratamento de endereço desconhecido, que devolve a
página inicial porque a navegação é por hash.

`publicar/` não entra no repositório de propósito. Ela é montada pelo próprio
build, então o que está versionado é a receita, não o resultado.

Serve qualquer hospedagem estática: não há variável de ambiente nem backend
para configurar.

A documentação do TCE afirma que a API só aceita requisições de endereços de IP
brasileiros. Na prática a restrição não está sendo aplicada: a mesma consulta
feita de fora do país foi testada e respondeu normalmente. Ainda assim, não
convém depender disso, porque é uma regra que o Tribunal pode passar a cumprir
a qualquer momento. Como quem consulta é o navegador de quem visita, e não um
servidor, o site não corre esse risco de todo modo.

## As duas fontes

Quase tudo no site vem da API do TCE ao vivo, direto do navegador de quem
visita. Não há servidor no meio, nem cópia dos números em outro lugar.

Três recursos a API não sustenta, porque ela não tem filtro por texto, obriga a
escolher um exercício por consulta e sempre devolve só a versão mais recente do
dado:

- buscar uma palavra em todos os anos de uma vez;
- somar quanto um fornecedor recebeu ao longo de vários exercícios;
- saber quando um valor já informado ao TCE foi retificado depois.

Para isso existe um banco de apoio no Supabase, carregado periodicamente a
partir da mesma API. Ele sustenta **Buscar**, **Ano a ano** e
**Retificações**. Se estiver fora do ar ou nem configurado, essas páginas avisam
e o restante do site continua funcionando normalmente.

**O banco cobre apenas o Crato.** Um município ocupa 233 MB; os nove passariam de
1,4 GB, contra os 500 MB do plano gratuito do Supabase. Nos outros oito, as três
páginas somem do menu e explicam a ausência a quem chegar por link direto.

Ampliar o banco não é só questão de espaço. As tabelas não guardam o
`codigo_municipio`: ele está na lista de campos ignorados em
`ferramentas/gerar-esquema.mjs`, porque tudo ali é Crato por definição, e o `id`
de cada registro é montado só com exercício, órgão e número. Carregar um segundo
município hoje faria os empenhos dos dois colidirem na mesma chave. Para valer, é
preciso acrescentar a coluna nas doze tabelas, recompor as chaves e revisar as
oito views e as quatro funções de busca para filtrar por município.

O banco não espelha a API inteira. Um exercício de todos os endpoints medidos
passa de 90 MB de JSON cru, e nove exercícios não caberiam no plano gratuito.
Entram apenas as doze tabelas listadas em `ferramentas/tabelas.mjs`, e dos
balancetes só o mês de fechamento, porque as colunas "até o mês" já trazem o
acumulado do ano.

## Identidade visual

Direção **1b "Olho Aberto"**, do handoff em
`ESTUDOS/DIREITO/2026.2/Olho no Crato_ identidade visual/design_handoff_identidade_1b`.
Cordel e xilogravura: caixa alta condensada, cantos retos, sem sombra difusa e
sem gradiente.

| Papel | Cor | Onde aparece |
|---|---|---|
| Vermelhão | `#E2402A` | marca, etapa "pago", destaque gráfico |
| Carvão | `#16110E` | texto principal e barra de navegação |
| Azul cartório | `#1D4F91` | etapa "liquidado", receita, foco de teclado |
| Milho | `#F0D14E` | etapa "empenhado" |
| Creme | `#FBF7EE` | fundo da página |

A regra de cor dos dados não é negociável: **uma cor por etapa da despesa**,
sempre a mesma em todo o sistema. As barras de ranking usam a cor do texto
sólida, porque ali a hierarquia é o comprimento, não a cor.

Tipografia por Google Fonts, com divisão rígida: **Archivo** carrega marca,
títulos, rótulos e todos os números; **Newsreader** carrega texto corrido e
explicações; **IBM Plex Mono** carrega códigos. Número nunca em serif,
parágrafo explicativo nunca em sans.

O tema escuro segue a preferência do sistema na primeira visita e a escolha
explícita depois, guardada em `localStorage` e aplicada por `data-tema` no
`<html>`.

### Duas mudanças em relação ao handoff

Ambas por causa da regra de acessibilidade que o próprio handoff estabelece
("nenhum texto de conteúdo abaixo de 4,5:1"), que a paleta original não
alcançava em dois pontos:

1. **Texto miúdo em vermelhão** usa a variante forte `#B22F1D`. O vermelhão
   vivo sobre creme dá 3,93:1; a variante forte dá 5,92:1. O vermelhão vivo
   continua nos elementos gráficos e nos números grandes, que contam como texto
   grande e passam com 3:1.
2. **Fundo de botão e de aba ativa** também usa `#B22F1D`, com texto creme
   (5,92:1). Creme sobre o vermelhão vivo daria 3,93:1. No tema escuro a lógica
   inverte: fundo `#FF6A52` com texto carvão, 6,70:1.

## Estrutura

```
index.html                 casca do site
css/estilo.css             tema claro e escuro, responsivo
js/
  app.js                   roteador por hash e estado global (exercício)
  api/
    tce.js                 cliente da API: paginação, cache, repetição, formatos
    cache.js               guarda as consultas no navegador (IndexedDB, 24 h)
    catalogo.js            os 74 endpoints descritos como dados (gerado)
    auxiliares.js          tradução de códigos para nomes
    formato.js             dinheiro, datas, textos
  dados/agregacoes.js      somas, agrupamentos, ordenação, busca
  ui/
    componentes.js         cartões, seções, avisos, ranking, abas, gaveta
    tabela.js              tabela com ordenação, busca, paginação e CSV
    grafico.js             rosca, linhas e colunas em SVG puro
  paginas/                 uma por rota do site
dados/
  fontes.json              Tabela III do Manual do SIM 2026 (fontes de recursos)
  subfuncoes.json          Tabela II do Manual do SIM 2026 (subfunções)
ferramentas/               scripts de manutenção, não precisam rodar para usar o site
```

## Páginas

Marcadas com (banco) as que dependem do banco de apoio, e que por isso só
existem no Crato. As demais funcionam nos nove municípios.

| Rota | O que mostra |
|---|---|
| `#/panorama` | Receita, orçamento e execução da despesa do exercício |
| `#/busca` | Busca por palavra, fornecedor e preço de item em todos os anos (banco) |
| `#/despesas` | Gasto por área, secretaria, tipo, ação e fonte de recursos |
| `#/fornecedores` | Cada credor do exercício, separado em pessoa física, empresa e folha; ficha com o objeto de cada empenho e o que foi anulado |
| `#/contratos` | Contratos, empresas contratadas, licitações e itens |
| `#/obras` | Obras e serviços de engenharia, situação e medições |
| `#/receitas` | De onde vem o dinheiro, por rubrica, destinação e mês |
| `#/historico` | Receita e despesa de todos os exercícios lado a lado (banco) |
| `#/retificacoes` | Valores alterados depois de já informados ao TCE (banco) |
| `#/patrimonio` | Bens incorporados e o controle por unidade |
| `#/parcerias` | Parcerias com organizações da sociedade civil |
| `#/creditos` | Créditos adicionais e remanejamentos do orçamento |
| `#/explorador` | Os 74 conjuntos de dados crus, com filtro e exportação |
| `#/glossario` | Empenho, liquidação, pagamento, dotação, fonte e outros |
| `#/sobre` | Metodologia, tratamento dos dados e limitações |

O município e o exercício valem para o site todo e vão na própria URL
(`#/despesas?municipio=094&ano=2025`), então qualquer tela pode ser compartilhada
por link. Sem município na URL e sem escolha anterior guardada, o site abre
perguntando qual cidade.

## A API do TCE-CE, em resumo

Base: `https://api-dados-abertos.tce.ce.gov.br/sim`
Documentação: <https://api-dados-abertos.tce.ce.gov.br/sim/>
Municípios: `codigo_municipio` de 001 a 184, numeração própria do Tribunal, sem
relação com a do IBGE. Os nove do site estão em `js/api/tce.js`, conferidos
contra o endpoint `/municipios`: Barbalha 023, Caririaçu 038, Crato 049, Farias
Brito 055, Jardim 092, Juazeiro do Norte 094, Missão Velha 109, Nova Olinda 117
e Santana do Cariri 154.

Quatro detalhes que custam tempo de quem integra pela primeira vez:

1. **`exercicio_orcamento` usa o formato `AAAA00`.** O ano de 2025 é `202500`.
   Enviar `2025` devolve lista vazia com HTTP 200, sem mensagem de erro nenhuma.
   No site isso é tratado em um lugar só, em `js/api/tce.js`.
2. **`data_referencia_doc` usa `AAAAMM`.** Janeiro de 2025 é `202501`.
3. **`data_inicio` e `data_fim` usam `aaaa-mm-dd`**, mas `data_transferencia`
   é timestamp e exige `aaaa-mm-ddThh:mm:ss`.
4. **Cada resposta traz no máximo 1000 registros.** Para passar disso, use
   `$start_index`. Existem ainda dois parâmetros não documentados que ajudam
   muito: `$select`, que reduz o tamanho da resposta em cerca de oito vezes, e
   `$orderby`. Não existe `$filter`.
5. **`estado_empenho` não é documentado.** `OR` é empenho em vigor, `AP` é
   anulado em parte e `AT` é anulado por inteiro. Conferido cruzando o exercício
   de 2025 do Crato com `/notas_anulacoes_empenhos`: nenhum dos 9.587 empenhos
   `OR` tem nota de anulação, e todos os 552 `AP` e 199 `AT` têm. Nos `AT` o
   valor anulado bate centavo a centavo com o empenhado.
6. **`codigo_tipo_negociante` também não é documentado.** `1` traz CNPJ em
   claro, `2` traz CPF criptografado, `6` rotula folha de pagamento e `7`, no
   exercício inteiro de 2025, só apareceu em diária. Atenção: nos tipos 6 e 7 o
   documento é um marcador coletivo, igual para todo mundo. Agrupar por ele
   junta 208 pessoas diferentes numa linha só. Ver `js/dados/credores.js`.

A API é aberta, não exige autenticação e responde com `Access-Control-Allow-Origin: *`,
o que permite consultá-la direto do navegador.

## Montar o banco de apoio

Passo a passo, uma vez só. Tudo é opcional: pular esta seção deixa o site
funcionando, sem as páginas Buscar e Ano a ano.

**1. Entrar na conta e criar o projeto.** O login abre o navegador e guarda o
token na sua máquina.

```bash
supabase login
```

Depois crie o projeto na região de São Paulo, que é a mais próxima:

```bash
supabase projects create olho-no-crato --region sa-east-1 --org-id SUA_ORG
```

**2. Ligar a pasta local ao projeto** (o `ref` aparece na saída acima):

```bash
supabase link --project-ref SEU_REF
```

**3. Aplicar o esquema:**

```bash
supabase db push
```

Se a migração do agendamento falhar, ligue `pg_cron` e `pg_net` em
Database > Extensions no painel e rode de novo.

**4. Guardar as chaves fora do repositório.** Crie um arquivo `.env` na raiz
(ele já está no `.gitignore`) com o endereço do projeto e a chave de serviço,
que estão em Project Settings > API:

```
SUPABASE_URL=https://SEU_REF.supabase.co
SUPABASE_SERVICE_KEY=a_chave_service_role
```

A chave de serviço grava no banco e **nunca** vai para o site.

**5. Carregar os dados** (leva alguns minutos e pode ser repetido à vontade):

```bash
node ferramentas/sincronizar.mjs
```

Para conferir antes, sem gravar nada: `node ferramentas/sincronizar.mjs --simular`.
Para carregar só uma parte: `--tabela=empenhos,contratos --de=2024 --ate=2026`.

**6. Apontar o site para o banco.** Em `js/config.js`, preencha `url` com o
endereço do projeto e `chaveAnonima` com a chave **anon**, não a de serviço. A
chave publicável é pública por natureza: ela só permite leitura, porque cada tabela
tem política de acesso somente de leitura.

**7. Deixar a atualização no automático** (opcional):

```bash
supabase functions deploy sincronizar
supabase secrets set SEGREDO_SINCRONIZACAO=uma_frase_qualquer
```

Depois registre o endereço e o segredo na tabela `configuracao`, pelo SQL Editor
do painel:

```sql
insert into public.configuracao (chave, valor) values
  ('url_sincronizacao', 'https://SEU_REF.supabase.co/functions/v1/sincronizar'),
  ('segredo_sincronizacao', 'a_mesma_frase')
on conflict (chave) do update set valor = excluded.valor, atualizada_em = now();
```

A partir daí a função roda todo dia às 9h de Fortaleza e traz só a janela
recente. A carga completa dos anos antigos continua sendo o passo 5, feito na
sua máquina.

Uma observação sobre o plano gratuito: projetos sem atividade por uma semana são
pausados e levam cerca de meio minuto para voltar. O agendamento diário já serve
de sinal de vida e evita isso.

## Manutenção

O catálogo dos 74 endpoints é gerado da especificação OpenAPI publicada pelo
próprio TCE, e é ele que move o explorador e os rótulos das tabelas. Se a API
mudar:

```bash
curl -o ferramentas/openapi_prod.yaml https://api-dados-abertos.tce.ce.gov.br/sim/openapi_prod.yaml
python ferramentas/gerar-catalogo.py
```

As tabelas de fontes de recursos e subfunções vêm das planilhas oficiais do
Manual do SIM, em <https://www.tce.ce.gov.br/municipios/sim/documentacao-e-programas>.
Para atualizar para um novo exercício, baixe as Tabelas II e III como
`ferramentas/funcoes2026.xlsx` e `ferramentas/fontes2026.xlsx` e rode:

```bash
python ferramentas/gerar-tabelas.py
```

Para conferir se todos os endpoints continuam respondendo:

```bash
node ferramentas/verificar-endpoints.mjs 2025 1
```

## Limitações conhecidas

- Os dados chegam com cerca de dois meses de atraso, que é o prazo de envio do
  município ao TCE.
- O município pode retificar informações já enviadas, então consultas em dias
  diferentes podem devolver valores diferentes para o mesmo mês. Cada página
  mostra a data e a hora da consulta.
- Conjunto vazio significa que o município não informou aquilo ao TCE, e não que
  nada aconteceu. O grupo de parcerias com OSC, por exemplo, está inteiramente
  vazio para o Crato em todo o período disponível, enquanto municípios vizinhos
  têm registros. A completude varia bastante de prefeitura para prefeitura, e
  comparar cidades exige ler o vazio com cuidado.
- Programas de governo, modalidades de licitação e tipos de contrato aparecem
  pelo código, porque a API não devolve o nome e não há tabela pública
  equivalente. O site mostra o código cru em vez de adivinhar o significado.
- O endpoint `publicacoes_editais_processos_administrativos_parcerias` consta na
  documentação do TCE mas responde 404 no servidor. Fica no catálogo com o aviso
  correspondente.
- Restos a pagar não estão separados: o balancete de um exercício não inclui
  pagamentos de empenhos de anos anteriores.
- O objeto do empenho só é carregado sob demanda, ao abrir a ficha de um credor.
  A API não filtra por credor, então ver o objeto obriga a baixar o mês inteiro,
  cerca de 646 KB por mês. A tela avisa o custo antes de consultar.
- A folha de pagamento vem em blocos, nunca servidor por servidor. Quem quiser a
  remuneração individual precisa do grupo CPF do SIM, que está fora do escopo
  deste projeto.
- Comparar municípios pelos totais brutos engana: Juazeiro do Norte tem orçamento
  mais de dez vezes maior que o de Nova Olinda. O site não calcula valor por
  habitante, para não sugerir equivalência que os números sozinhos não sustentam.
- Este não é o Portal da Transparência oficial de nenhuma das prefeituras.

## Fonte e reúso

Dados públicos do TCE-CE, reutilizáveis com citação da fonte. Toda tabela do site
tem botão para baixar em CSV.
