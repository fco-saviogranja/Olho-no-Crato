# -*- coding: utf-8 -*-
"""Gera js/api/catalogo.js a partir da especificacao OpenAPI do SIM/TCE-CE.

Baixe a especificacao antes de rodar:

    curl -o ferramentas/openapi_prod.yaml \
        https://api-dados-abertos.tce.ce.gov.br/sim/openapi_prod.yaml
    python ferramentas/gerar-catalogo.py

Sao mantidos apenas os 11 grupos que o site cobre. Para incluir pessoal (CPF),
previdencia (RPP), frota (VCL) ou outros documentos (OUT), acrescente a tag
correspondente na lista GRUPOS abaixo e rode de novo.
"""
import io, json, os, re, sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SPEC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(RAIZ, 'ferramentas', 'openapi_prod.yaml')
SAIDA = sys.argv[2] if len(sys.argv) > 2 else os.path.join(RAIZ, 'js', 'api', 'catalogo.js')

# tags da spec que entram no app, na ordem de exibicao
GRUPOS = [
    ("Auxiliares", "AUX", "Tabelas de apoio: municipios, funcoes de governo e tipos de unidade."),
    ("Documentacao de Informacoes Basicas (BAS)", "BAS", "Quem e quem na prefeitura: orgaos, gestores, unidades e contas bancarias."),
    ("Documentacao referente ao Orcamento Municipal (ORC)", "ORC", "O plano de gastos e de arrecadacao aprovado para o ano."),
    ("Documentacao referente aos Balancetes (BAL)", "BAL", "O resumo mensal e acumulado da execucao do orcamento."),
    ("Documentacao Comprobatoria de Receitas (DCR)", "DCR", "Os taloes que comprovam cada entrada de dinheiro."),
    ("Documentacao Comprobatoria de Despesas (DCD)", "DCD", "O caminho completo de cada gasto: empenho, liquidacao, nota fiscal e pagamento."),
    ("Processos Administrativos para Contratacoes (LCO)", "LCO", "Licitacoes, contratos, fornecedores e itens contratados."),
    ("Documentacao referente a Processos de Parcerias com OSC (OSC)", "OSC", "Repasses e parcerias com organizacoes da sociedade civil."),
    ("Documentacao referente a Abertura de Creditos Adicionais (CRD)", "CRD", "Mudancas no orcamento durante o ano: creditos extras e remanejamentos."),
    ("Documentacao de Obras Municipais ou Servicos de Engenharia (OSE)", "OSE", "Obras publicas, medicoes e situacao de cada uma."),
    ("Documentacao de Controle do Patrimonio Municipal (PAT)", "PAT", "Os bens que pertencem ao municipio."),
]

def sem_acento(s):
    tab = str.maketrans("áàâãäéèêëíìîïóòôõöúùûüçÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇ",
                        "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC")
    return s.translate(tab)

SIGLA_POR_TAG = {}
NOME_POR_SIGLA = {}
for tag_norm, sigla, desc in GRUPOS:
    SIGLA_POR_TAG[tag_norm] = sigla
    NOME_POR_SIGLA[sigla] = (tag_norm, desc)

IGNORAR_PARAM = {"$format", "$count", "$start_index"}

texto = io.open(SPEC, encoding="utf-8").read()
linhas = texto.split("\n")

def indent(l):
    return len(l) - len(l.lstrip(" "))

def limpa(v):
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in "'\"":
        v = v[1:-1]
    return v.replace("''", "'").strip()

def escalar(i, chave_indent):
    """Junta linhas de continuacao de um escalar iniciado na linha i."""
    valor = linhas[i].split(":", 1)[1]
    j = i + 1
    while j < len(linhas) and linhas[j].strip() and indent(linhas[j]) > chave_indent:
        valor += " " + linhas[j].strip()
        j += 1
    return limpa(valor), j

# ---------- schemas: dv_<x>_element -> {campo: descricao} ----------
campos_por_schema = {}
tipos_por_schema = {}
i = 0
while i < len(linhas):
    m = re.match(r"^    (dv_\w+_element):\s*$", linhas[i])
    if not m:
        i += 1
        continue
    nome = m.group(1)
    campos = {}
    tipos = {}
    i += 1
    campo_atual = None
    while i < len(linhas):
        l = linhas[i]
        if l.strip() and indent(l) <= 4:
            break
        mc = re.match(r"^        (\w+):\s*$", l)
        if mc:
            campo_atual = mc.group(1)
            campos[campo_atual] = ""
            tipos[campo_atual] = "string"
            i += 1
            continue
        mt = re.match(r"^          type: (\w+)", l)
        if mt and campo_atual:
            tipos[campo_atual] = mt.group(1)
            i += 1
            continue
        md = re.match(r"^          description:", l)
        if md and campo_atual:
            campos[campo_atual], i = escalar(i, 10)
            continue
        i += 1
    campos_por_schema[nome] = campos
    tipos_por_schema[nome] = tipos

# ---------- paths ----------
endpoints = []
i = 0
while i < len(linhas):
    m = re.match(r"^  (/[\w_]+):\s*$", linhas[i])
    if not m:
        i += 1
        continue
    path = m.group(1)
    tag = summary = schema = None
    params = []
    i += 1
    while i < len(linhas):
        l = linhas[i]
        if l.strip() and indent(l) <= 2:
            break
        if re.match(r"^      tags:\s*$", l):
            tag = linhas[i + 1].strip().lstrip("- ").strip()
            i += 2
            continue
        if re.match(r"^      summary:", l):
            summary, i = escalar(i, 6)
            continue
        mp = re.match(r"^      - name: (.+)$", l)
        if mp:
            p = {"nome": limpa(mp.group(1)), "obrigatorio": False, "tipo": "string", "rotulo": ""}
            i += 1
            while i < len(linhas):
                l2 = linhas[i]
                if l2.strip() and indent(l2) <= 6:
                    break
                if re.match(r"^        required: true", l2):
                    p["obrigatorio"] = True
                elif re.match(r"^          type:", l2):
                    p["tipo"] = limpa(l2.split(":", 1)[1])
                elif re.match(r"^        description:", l2):
                    p["rotulo"], i = escalar(i, 8)
                    continue
                i += 1
            if p["nome"] not in IGNORAR_PARAM:
                params.append(p)
            continue
        ms = re.search(r"#/components/schemas/(dv_\w+_response)", l)
        if ms and schema is None:
            schema = ms.group(1).replace("_response", "_element")
        i += 1
    if tag is None:
        continue
    sigla = SIGLA_POR_TAG.get(sem_acento(tag))
    if not sigla:
        continue
    endpoints.append({
        "id": path.lstrip("/"),
        "path": path,
        "grupo": sigla,
        "titulo": summary or path,
        "params": params,
        "campos": campos_por_schema.get(schema, {}),
        "tipos": tipos_por_schema.get(schema, {}),
    })

ordem = [g[1] for g in GRUPOS]
endpoints.sort(key=lambda e: (ordem.index(e["grupo"]), e["id"]))

# ---------- saida ----------
grupos_js = [{"sigla": s, "nome": NOME_POR_SIGLA[s][0], "descricao": NOME_POR_SIGLA[s][1],
              "total": sum(1 for e in endpoints if e["grupo"] == s)} for s in ordem]

cab = ("// Gerado a partir de openapi_prod.yaml (SIM/TCE-CE, OpenAPI 3.0.1 v2.0).\n"
       "// Nao editar a mao: rode novamente o gerador se a API mudar.\n"
       "// Total de endpoints: %d\n\n" % len(endpoints))
js = cab
js += "export const GRUPOS = " + json.dumps(grupos_js, ensure_ascii=False, indent=2) + ";\n\n"
js += "export const ENDPOINTS = " + json.dumps(endpoints, ensure_ascii=False, indent=2) + ";\n\n"
js += ("export const POR_ID = Object.fromEntries(ENDPOINTS.map((e) => [e.id, e]));\n\n"
       "export function endpointsDoGrupo(sigla) {\n"
       "  return ENDPOINTS.filter((e) => e.grupo === sigla);\n"
       "}\n\n"
       "export function rotuloCampo(id, campo) {\n"
       "  return (POR_ID[id] && POR_ID[id].campos[campo]) || campo;\n"
       "}\n")

io.open(SAIDA, "w", encoding="utf-8", newline="\n").write(js)

print("endpoints:", len(endpoints))
for s in ordem:
    print("  %-4s %d" % (s, sum(1 for e in endpoints if e["grupo"] == s)))
sem_campos = [e["id"] for e in endpoints if not e["campos"]]
print("sem rotulos de campo:", sem_campos or "nenhum")
sem_rotulo_param = [(e["id"], p["nome"]) for e in endpoints for p in e["params"] if not p["rotulo"]]
print("params sem rotulo:", sem_rotulo_param or "nenhum")
