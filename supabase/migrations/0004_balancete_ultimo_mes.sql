-- Corrige a contagem dupla do balancete e limpa o mes incompleto ja gravado.
--
-- Os valores do balancete sao acumulados desde janeiro. Guardar dois meses do
-- mesmo exercicio e soma-los conta o mesmo dinheiro duas vezes: em 2026 a visao
-- passou a mostrar R$ 829,0 milhoes orcados no lugar de R$ 811,1 milhoes,
-- porque somou junho com julho.
--
-- Alem disso, o mes recem-publicado chega pela metade. Julho de 2026 veio com
-- 27 linhas contra 2.641 de junho, e nao pode ser tratado como fechamento do
-- exercicio. A carga passou a recusar mes incompleto; aqui apagamos o que ja
-- havia entrado antes da correcao.

delete from public.balancete_despesa where data_referencia_doc = 202607;
delete from public.balancete_receita  where data_referencia_doc = 202607;

-- Os valores do balancete sao acumulados desde janeiro, entao somar dois meses
-- do mesmo exercicio conta o mesmo dinheiro duas vezes. Estas visoes olham
-- apenas o ultimo mes guardado de cada exercicio.
create or replace view public.ultimo_balancete_despesa with (security_invoker = on) as
select exercicio_orcamento, max(data_referencia_doc) as mes
from public.balancete_despesa
group by exercicio_orcamento;

create or replace view public.execucao_por_exercicio with (security_invoker = on) as
select
  b.exercicio_orcamento / 100                       as exercicio,
  u.mes                                             as mes_referencia,
  sum(b.valor_fixado_orcamento_bal_despesa)         as orcado,
  sum(b.valor_empenhado_ate_mes)                    as empenhado,
  sum(b.valor_liquidado_ate_mes)                    as liquidado,
  sum(b.valor_pago_ate_mes)                         as pago
from public.balancete_despesa b
join public.ultimo_balancete_despesa u
  on u.exercicio_orcamento = b.exercicio_orcamento
 and u.mes = b.data_referencia_doc
group by b.exercicio_orcamento, u.mes;

-- gasto por area em todos os exercicios, para comparar um ano com o outro
create or replace view public.execucao_por_funcao with (security_invoker = on) as
select
  b.exercicio_orcamento / 100        as exercicio,
  b.codigo_funcao                    as funcao,
  sum(b.valor_empenhado_ate_mes)     as empenhado,
  sum(b.valor_liquidado_ate_mes)     as liquidado,
  sum(b.valor_pago_ate_mes)          as pago
from public.balancete_despesa b
join public.ultimo_balancete_despesa u
  on u.exercicio_orcamento = b.exercicio_orcamento
 and u.mes = b.data_referencia_doc
group by b.exercicio_orcamento, b.codigo_funcao;

-- arrecadacao por exercicio
create or replace view public.ultimo_balancete_receita with (security_invoker = on) as
select exercicio_orcamento, max(data_referencia_doc) as mes
from public.balancete_receita
group by exercicio_orcamento;

create or replace view public.receita_por_exercicio with (security_invoker = on) as
select
  b.exercicio_orcamento / 100          as exercicio,
  sum(b.valor_previsto_orcamento)      as previsto,
  sum(b.valor_arrecadacao_ate_mes)     as arrecadado
from public.balancete_receita b
join public.ultimo_balancete_receita u
  on u.exercicio_orcamento = b.exercicio_orcamento
 and u.mes = b.data_referencia_doc
group by b.exercicio_orcamento;

-- conferencia: 2026 deve voltar a mostrar junho, com R$ 811.109.937,19 orcados
select exercicio, mes_referencia, orcado, empenhado, pago
from public.execucao_por_exercicio
order by exercicio;
