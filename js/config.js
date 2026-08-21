// Configuração do banco de apoio.
//
// O site funciona sem nada disto: se o banco não estiver configurado ou não
// responder, tudo continua vindo direto da API do TCE. O banco só acrescenta o
// que a API não sabe fazer, que é cruzar exercícios, buscar texto e mostrar as
// retificações.
//
// A chave abaixo é a chave anônima do Supabase. Ela é pública por natureza:
// vai no navegador de quem visita e só permite leitura, porque as tabelas têm
// política de acesso somente de leitura. A chave de serviço, que grava, nunca
// aparece aqui; ela fica no ambiente de quem roda a carga.

export const BANCO = {
  url: 'https://bbzzsxwwhgmxpajelbuz.supabase.co',
  chaveAnonima: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJienpzeHd3aGdteHBhamVsYnV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMTM2OTMsImV4cCI6MjEwMjc4OTY5M30.ciTMa35nHfrS4eVFf_b2vnysKlC83VjfmEgLxvga47c',
};

// Quanto esperar pelo banco antes de desistir e ir direto ao TCE. O plano
// gratuito do Supabase pausa o projeto depois de uma semana parada e demora
// cerca de 30 segundos para acordar, então não vale a pena esperar muito.
export const ESPERA_BANCO = 6000;
