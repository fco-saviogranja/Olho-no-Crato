// Configuração do banco de apoio.
//
// O site funciona sem nada disto: se o banco não estiver configurado ou não
// responder, tudo continua vindo direto da API do TCE. O banco só acrescenta o
// que a API não sabe fazer, que é cruzar exercícios, buscar texto e mostrar as
// retificações.
//
// A chave abaixo é a chave publicável do Supabase. Ela é pública por natureza:
// vai no navegador de quem visita e só permite leitura, porque as tabelas têm
// política de acesso somente de leitura. Conferido: com ela, inserir e apagar
// respondem 401. A chave secreta, que grava, nunca aparece aqui; ela fica no
// ambiente de quem roda a carga.
//
// Era um JWT começando com eyJ até 21/08/2026, quando as chaves legadas do
// Supabase foram desativadas e o site perdeu Busca, Retificações e Ano a ano
// de uma vez. O formato novo, sb_publishable_, rotaciona sem derrubar as
// outras chaves junto, que era o defeito do modelo antigo.

export const BANCO = {
  url: 'https://bbzzsxwwhgmxpajelbuz.supabase.co',
  chavePublica: 'sb_publishable_GHGH6KJw2nWhnUFAdk4QxA_5ENwM1QK',
};

// Quanto esperar pelo banco antes de desistir e ir direto ao TCE. O plano
// gratuito do Supabase pausa o projeto depois de uma semana parada e demora
// cerca de 30 segundos para acordar, então não vale a pena esperar muito.
export const ESPERA_BANCO = 6000;
