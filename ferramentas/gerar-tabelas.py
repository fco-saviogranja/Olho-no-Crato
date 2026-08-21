# -*- coding: utf-8 -*-
"""Converte as tabelas oficiais do SIM/TCE-CE em dados/fontes.json e
dados/subfuncoes.json, que sao o que da nome aos codigos no site.

Baixe as duas planilhas para esta pasta antes de rodar:

    curl -o ferramentas/fontes2026.xlsx \
        https://www.tce.ce.gov.br/downloads/municipios/sim-documentacao-e-programas/TCECE_SIM2026_Tabela_III_-_Fonte_de_Recurso.xlsx
    curl -o ferramentas/funcoes2026.xlsx \
        https://www.tce.ce.gov.br/downloads/TCECE_SIM2026_Tabela__II_-_Funo_e_Subfuno.xlsx
    python ferramentas/gerar-tabelas.py

Le xlsx sem biblioteca externa: um xlsx e um zip com XML dentro.
"""
import zipfile, re, json, io, os
import xml.etree.ElementTree as ET

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SP = os.path.join(RAIZ, 'ferramentas')
DEST = os.path.join(RAIZ, 'dados')
NS = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'


def ler(caminho):
    z = zipfile.ZipFile(caminho)
    compartilhadas = []
    if 'xl/sharedStrings.xml' in z.namelist():
        raiz = ET.fromstring(z.read('xl/sharedStrings.xml'))
        for si in raiz.findall(NS + 'si'):
            compartilhadas.append(''.join(t.text or '' for t in si.iter(NS + 't')))
    folhas = {}
    for nome in sorted(n for n in z.namelist() if re.match(r'xl/worksheets/sheet\d+\.xml$', n)):
        raiz = ET.fromstring(z.read(nome))
        linhas = []
        for row in raiz.iter(NS + 'row'):
            celulas = {}
            for c in row.findall(NS + 'c'):
                col = re.match(r'[A-Z]+', c.get('r')).group(0)
                v = c.find(NS + 'v')
                if c.get('t') == 'inlineStr':
                    texto = ''.join(x.text or '' for x in c.iter(NS + 't'))
                elif v is None:
                    texto = ''
                elif c.get('t') == 's':
                    texto = compartilhadas[int(v.text)]
                else:
                    texto = v.text or ''
                celulas[col] = ' '.join(texto.split())
            linhas.append(celulas)
        folhas[nome] = linhas
    return folhas


def grava(nome, dados):
    caminho = os.path.join(DEST, nome)
    io.open(caminho, 'w', encoding='utf-8', newline='\n').write(
        json.dumps(dados, ensure_ascii=False, indent=1) + '\n')
    print(nome, '->', len(dados) - 1, 'registros')


# ---- fontes de recursos ----
folhas = ler(os.path.join(SP, 'fontes2026.xlsx'))
linhas = folhas['xl/worksheets/sheet1.xml']
fontes = {
    '_fonte': ('Tabela III - Fonte ou Destinacao de Recursos, do Manual do SIM 2026 (TCE-CE), '
               'baseada na Portaria STN/MF. Cada verbete traz o nome do grupo de fonte e o nome '
               'analitico do codigo completo de nove digitos.'),
}
grupos = {}
for l in linhas:
    codigo = (l.get('A') or '').strip()
    if not re.fullmatch(r'\d{9}', codigo):
        continue
    principal = (l.get('B') or '').strip()
    fontes[codigo] = {
        'nome': (l.get('G') or l.get('C') or '').strip(),
        'grupo': principal,
        'grupoNome': (l.get('C') or '').strip(),
        'detalhamento': (l.get('E') or '').strip(),
        'especificacao': (l.get('H') or '').strip(),
    }
    if principal and principal not in grupos:
        grupos[principal] = (l.get('C') or '').strip()

# codigos de fonte incluidos por portarias posteriores (folha de alteracoes)
for l in folhas.get('xl/worksheets/sheet4.xml', []):
    codigo = (l.get('A') or '').strip()
    if re.fullmatch(r'\d{3}', codigo) and codigo not in grupos:
        grupos[codigo] = (l.get('B') or '').strip()

fontes['_grupos'] = grupos
grava('fontes.json', fontes)

# ---- funcoes e subfuncoes ----
folhas = ler(os.path.join(SP, 'funcoes2026.xlsx'))
subfuncoes = {
    '_fonte': ('Tabela II - Funcao e Subfuncao, do Manual do SIM 2026 (TCE-CE), aprovada pela '
               'Portaria SOF/MPO n. 169/2024. A API do TCE devolve apenas o codigo.'),
}
for l in folhas['xl/worksheets/sheet2.xml']:
    codigo = (l.get('A') or '').strip()
    nome = (l.get('B') or '').strip()
    if re.fullmatch(r'\d{1,3}', codigo) and nome:
        subfuncoes[codigo.zfill(3)] = nome
grava('subfuncoes.json', subfuncoes)

funcoes = {
    '_fonte': 'Tabela II - Funcao e Subfuncao, do Manual do SIM 2026 (TCE-CE).',
}
for l in folhas['xl/worksheets/sheet1.xml']:
    codigo = (l.get('A') or '').strip()
    nome = (l.get('B') or '').strip()
    if re.fullmatch(r'\d{1,2}', codigo) and nome:
        funcoes[codigo.zfill(2)] = nome
grava('funcoes.json', funcoes)
