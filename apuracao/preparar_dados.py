"""Gera os arquivos estáticos do mapa da apuração.

- malhas/: topologias (TopoJSON) feitas a partir da malha do IBGE: brasil.json
  com os estados e um arquivo por estado com os municípios. Ficam no
  repositório para o mapa não depender da API do IBGE na noite da apuração.
  Precisa de Node (o mapshaper roda via npx).
- dados/municipios.json: municípios do 2º turno com o código do TSE, o código
  do IBGE e o nome (as cidades do exterior ficam na UF "zz").
- dados/1turno.json: votos de Lula e Flávio no 1º turno por estado e por
  município, base do modo "Virada" e do modo simulação.
- dados/exterior.json: coordenadas e país das cidades onde se vota no exterior.
- malhas/mundo.json: os outros países, desenhados em volta do Brasil.
- bandeiras/: bandeira de cada estado, do Wikimedia Commons.

Roda tudo ou só as etapas pedidas:

    python3 apuracao/preparar_dados.py
    python3 apuracao/preparar_dados.py municipios exterior
"""

import gzip
import json
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

IBGE = "https://servicodados.ibge.gov.br/api/v3/malhas"
TSE = "https://resultados.tse.jus.br/oficial/ele2026"
PRIMEIRO_TURNO, SEGUNDO_TURNO = "006257", "006258"
CANDIDATOS = ("13", "22")
# Sigla → código do IBGE.
UFS = {
    "ac": 12, "al": 27, "ap": 16, "am": 13, "ba": 29, "ce": 23, "df": 53, "es": 32, "go": 52,
    "ma": 21, "mt": 51, "ms": 50, "mg": 31, "pr": 41, "pb": 25, "pa": 15, "pe": 26, "pi": 22,
    "rj": 33, "rn": 24, "rs": 43, "ro": 11, "rr": 14, "sc": 42, "se": 28, "sp": 35, "to": 17,
}
RAIZ = Path(__file__).parent


def baixar_json(url):
    with urllib.request.urlopen(url, timeout=300) as resposta:
        corpo = resposta.read()
    texto = gzip.decompress(corpo) if corpo[:2] == b"\x1f\x8b" else corpo
    return json.loads(texto)


def gravar(caminho, conteudo):
    caminho.parent.mkdir(exist_ok=True)
    caminho.write_text(json.dumps(conteudo, ensure_ascii=False, separators=(",", ":")))
    print(f"{caminho.relative_to(RAIZ)}: {caminho.stat().st_size // 1024} KB")


# ---------- Malhas ----------

# A malha "máxima" do IBGE vira uma topologia: cada fronteira existe uma vez só,
# compartilhada pelos dois lados, e a simplificação respeita isso. Os estados
# saem da união dos próprios municípios, então as linhas batem certinho no zoom.
MAPSHAPER = ["npx", "--yes", "mapshaper@0.6.102"]
SIMPLIFICACAO = "8%"


def baixar_malhas():
    with tempfile.TemporaryDirectory() as pasta:
        for uf in UFS:
            malha = baixar_json(f"{IBGE}/estados/{uf.upper()}?intrarregiao=municipio"
                                "&formato=application/vnd.geo%2Bjson&qualidade=maxima")
            (Path(pasta) / f"{uf}.json").write_text(json.dumps(malha))

        ibge_para_uf = json.dumps({str(codigo): uf for uf, codigo in UFS.items()})
        destino = RAIZ / "malhas"
        shutil.rmtree(destino, ignore_errors=True)
        destino.mkdir()
        subprocess.run([
            *MAPSHAPER, "-i", *sorted(str(p) for p in Path(pasta).glob("*.json")), "combine-files", "snap",
            "-merge-layers", "force", "name=municipios",
            "-each", f"uf = ({ibge_para_uf})[codarea.slice(0, 2)]",
            "-simplify", "visvalingam", "weighted", SIMPLIFICACAO, "keep-shapes",
            "-clean",
            "-dissolve", "uf", "+", "name=estados",
            "-target", "municipios", "-split", "uf",
            "-o", f"{destino}/", "format=topojson", "singles", "id-field=codarea", "quantization=100000",
            "-target", "estados",
            "-o", f"{destino}/brasil.json", "format=topojson", "id-field=uf", "quantization=100000",
        ], check=True)


# ---------- Municípios e 1º turno ----------

def votos(resultado):
    """[votos de Lula, votos de Flávio, votos válidos] de um arquivo de resultado do TSE."""
    candidatos = {
        candidato["n"]: int(candidato["vap"])
        for agremiacao in resultado["carg"][0]["agr"]
        for partido in agremiacao["par"]
        for candidato in partido["cand"]
    }
    return [*(candidatos[numero] for numero in CANDIDATOS), int(resultado["v"]["vv"])]


def resultado_1turno(abrangencia):
    return votos(baixar_json(f"{TSE}/{PRIMEIRO_TURNO.lstrip('0')}/dados/{abrangencia[:2]}/"
                             f"{abrangencia}-c0001-e{PRIMEIRO_TURNO}-u.json"))


def ler_municipios():
    """Municípios do 2º turno por UF, incluindo as cidades do exterior (UF "zz", sem código IBGE)."""
    config = baixar_json(f"{TSE}/{SEGUNDO_TURNO.lstrip('0')}/config/mun-e{SEGUNDO_TURNO}-cm.json")
    return {
        estado["cd"]: [[mun["cd"], mun["cdi"], mun["nm"]] for mun in estado["mu"]]
        for estado in config["abr"]
        if estado["cd"] in UFS or estado["cd"] == "zz"
    }


def preparar_municipios():
    municipios = ler_municipios()
    gravar(RAIZ / "dados" / "municipios.json", municipios)

    # Tudo indexado pela chave do arquivo do TSE: "sp", "sp71072", "zz29254".
    estados = ["br", "zz", *UFS]
    cidades = [uf + cd for uf, lista in municipios.items() for cd, _, _ in lista]
    with ThreadPoolExecutor(max_workers=16) as pool:
        gravar(RAIZ / "dados" / "1turno.json", {
            "uf": dict(zip(estados, pool.map(resultado_1turno, estados))),
            "mun": dict(zip(cidades, pool.map(resultado_1turno, cidades))),
        })


# ---------- Exterior ----------

# O TSE só dá o nome da cidade em português; coordenadas e país vêm do geocodificador
# da Open-Meteo (base GeoNames), que entende português e põe a cidade mais populosa
# primeiro ("Artigas" é a do Uruguai, "Tóquio" a do Japão). O resultado fica em
# dados/exterior.json e só cidades novas são consultadas de novo.
GEOCODIFICADOR = "https://geocoding-api.open-meteo.com/v1/search"
# Nomes ambíguos, em português que o geocodificador não conhece ou que não são o nome da
# cidade: (busca, país ISO) e, se o nome do país vier ausente ou estranho, o nome certo.
CONSULTAS = {
    "ARTIGAS": ("Artigas", "UY"), "CHUY": ("Chuy", "UY"), "RIVERA": ("Rivera", "UY"),
    "RIO BRANCO": ("Río Branco", "UY"),
    "BAREIN": ("Manama", "BH", "Barein"), "KUAITE": ("Kuwait City", "KW"), "CANTÃO": ("Guangzhou", "CN"),
    "CAIENA": ("Cayenne", "GF", "Guiana Francesa"),
    "ST GEORGES DE LOYAPOCK": ("Saint-Georges", "GF", "Guiana Francesa"),
    "CONCEPCIÓN": ("Concepción", "PY"), "CÓRDOBA": ("Córdoba", "AR"), "MENDOZA": ("Mendoza", "AR"),
    "GEORGETOWN": ("Georgetown", "GY"), "GUATEMALA": ("Guatemala City", "GT"),
    "KINGSTON-JAMAICA": ("Kingston", "JM"), "LA PAZ": ("La Paz", "BO"), "LAGOS": ("Lagos", "NG"),
    "MEXICO": ("Mexico City", "MX"), "PANAMA": ("Panama City", "PA"), "PORTO": ("Porto", "PT"),
    "PRAIA": ("Praia", "CV"), "SAINT JOHNS": ("Saint John's", "AG"), "SANTIAGO": ("Santiago", "CL"),
    "SÃO DOMINGOS": ("Santo Domingo", "DO"), "SÃO FRANCISCO": ("San Francisco", "US"),
    "SÃO JOSÉ": ("San José", "CR"), "SÃO SALVADOR": ("San Salvador", "SV"), "SÃO TOMÉ": ("São Tomé", "ST"),
    "BRIDGETOWN": ("Bridgetown", "BB"), "TRÍPOLI": ("Tripoli", "LY"),
    "DACCA": ("Dhaka", "BD"), "KATMANDU": ("Kathmandu", "NP"), "KIEV": ("Kyiv", "UA"),
    "LUSACA": ("Lusaka", "ZM"), "MOSCOU": ("Moscow", "RU"), "NOVA YORK": ("New York City", "US"),
    "TALIN": ("Tallinn", "EE"), "COPENHAGUE": ("Copenhagen", "DK"), "HELSINQUE": ("Helsinki", "FI"),
    "IAUNDÊ": ("Yaoundé", "CM"), "IEREVAN": ("Yerevan", "AM"), "JACARTA": ("Jakarta", "ID"),
    "LILONGUE": ("Lilongwe", "MW"), "NOVA DELHI": ("New Delhi", "IN"),
    "PASO LOS LIBRES": ("Paso de los Libres", "AR"), "UAGADUGU": ("Ouagadougou", "BF"),
    "HONG KONG": ("Hong Kong", "HK", "Hong Kong"), "RAMALLAH": ("Ramallah", "PS", "Palestina"),
    "ABIDJÃ": ("Abidjan", "CI", "Costa do Marfim"), "KINSHASA": ("Kinshasa", "CD", "Rep. Dem. do Congo"),
    "TEERÃ": ("Tehran", "IR", "Irã"), "WASHINGTON": ("Washington", "US"), "COLOMBO": ("Colombo", "LK"),
}


def geocodificar(nome):
    busca, pais, *nome_do_pais = CONSULTAS.get(nome, (nome.title(), None))
    parametros = {"name": busca, "count": 1, "language": "pt", **({"countryCode": pais} if pais else {})}
    encontrados = baixar_json(f"{GEOCODIFICADOR}?{urllib.parse.urlencode(parametros)}").get("results")
    if not encontrados:
        return None

    lugar = encontrados[0]
    pais_escrito = nome_do_pais[0] if nome_do_pais else lugar["country"]
    return [round(lugar["longitude"], 4), round(lugar["latitude"], 4), pais_escrito]


def preparar_exterior():
    caminho = RAIZ / "dados" / "exterior.json"
    conhecidas = json.loads(caminho.read_text()) if caminho.exists() else {}
    faltando = []
    for cd, _, nome in ler_municipios()["zz"]:
        conhecidas[cd] = conhecidas.get(cd) or geocodificar(nome)
        print(nome, "→", conhecidas[cd])
        if not conhecidas[cd]:
            faltando.append(nome)
            del conhecidas[cd]
    gravar(caminho, conhecidas)
    if faltando:
        sys.exit(f"Sem coordenadas (adicione em CONSULTAS): {', '.join(faltando)}")


# ---------- Mundo ----------

# Contorno dos países (Natural Earth 1:110 milhões, via world-atlas), atrás do Brasil e na
# vista do exterior. A versão leve basta para o fundo e não pesa no zoom; o arquivo já vem
# no formato que o d3 espera, então só saem o Brasil (que tem malha própria) e a Antártida.
MUNDO = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json"
FORA_DO_FUNDO = {"Brazil", "Antarctica"}


def preparar_mundo():
    mundo = baixar_json(MUNDO)
    paises = mundo["objects"].pop("countries")
    paises["geometries"] = [g for g in paises["geometries"] if g["properties"]["name"] not in FORA_DO_FUNDO]
    mundo["objects"] = {"paises": paises}
    gravar(RAIZ / "malhas" / "mundo.json", mundo)


# ---------- Bandeiras ----------

# Bandeiras dos estados (símbolos oficiais), do Wikimedia Commons, em PNG de 120 px
# (um dos tamanhos que o Commons já tem pronto; tamanhos fora do padrão são recusados).
COMMONS = "https://commons.wikimedia.org/w/api.php"
BANDEIRAS = {
    "ac": "Bandeira do Acre.svg", "al": "Bandeira de Alagoas.svg", "ap": "Bandeira do Amapá.svg",
    "am": "Bandeira do Amazonas.svg", "ba": "Bandeira da Bahia.svg", "ce": "Bandeira do Ceará.svg",
    "df": "Bandeira do Distrito Federal (Brasil).svg", "es": "Bandeira do Espírito Santo.svg",
    "go": "Bandeira de Goiás.svg", "ma": "Bandeira do Maranhão.svg", "mt": "Bandeira de Mato Grosso.svg",
    "ms": "Bandeira de Mato Grosso do Sul.svg", "mg": "Bandeira de Minas Gerais.svg", "pa": "Bandeira do Pará.svg",
    "pb": "Bandeira da Paraíba.svg", "pr": "Bandeira do Paraná.svg", "pe": "Bandeira de Pernambuco.svg",
    "pi": "Bandeira do Piauí.svg", "rj": "Bandeira do estado do Rio de Janeiro.svg",
    "rn": "Bandeira do Rio Grande do Norte.svg", "rs": "Bandeira do Rio Grande do Sul.svg",
    "ro": "Bandeira de Rondônia.svg", "rr": "Bandeira de Roraima.svg", "sc": "Bandeira de Santa Catarina.svg",
    "sp": "Bandeira do estado de São Paulo.svg", "se": "Bandeira de Sergipe.svg", "to": "Bandeira do Tocantins.svg",
}


def baixar_bandeiras():
    destino = RAIZ / "bandeiras"
    destino.mkdir(exist_ok=True)
    cabecalho = {"User-Agent": "storell.dev.br/apuracao (mapa da apuração)"}
    for uf, arquivo in BANDEIRAS.items():
        if (destino / f"{uf}.png").exists():
            continue
        time.sleep(3)  # o Commons recusa pedidos em rajada
        consulta = urllib.parse.urlencode({
            "action": "query", "titles": f"File:{arquivo}", "prop": "imageinfo",
            "iiprop": "url", "iiurlwidth": 120, "format": "json", "redirects": 1,
        })
        with urllib.request.urlopen(urllib.request.Request(f"{COMMONS}?{consulta}", headers=cabecalho)) as resposta:
            [pagina] = json.load(resposta)["query"]["pages"].values()
        with urllib.request.urlopen(urllib.request.Request(pagina["imageinfo"][0]["thumburl"], headers=cabecalho)) as imagem:
            (destino / f"{uf}.png").write_bytes(imagem.read())
        print(f"bandeiras/{uf}.png")


ETAPAS = {
    "malhas": baixar_malhas,
    "municipios": preparar_municipios,
    "exterior": preparar_exterior,
    "mundo": preparar_mundo,
    "bandeiras": baixar_bandeiras,
}

if __name__ == "__main__":
    for etapa in sys.argv[1:] or ETAPAS:
        ETAPAS[etapa]()
