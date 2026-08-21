-- Permissoes que faltaram na primeira migracao.
--
-- O papel service_role, usado pela carga, nao tinha sido contemplado, e por
-- isso o PostgREST respondia 403 mesmo com a chave de servico correta.
-- Ja esta incorporado ao gerador: uma instalacao nova nao precisa deste arquivo.

grant usage on schema public to anon, authenticated, service_role;

grant select on all tables in schema public to anon, authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
