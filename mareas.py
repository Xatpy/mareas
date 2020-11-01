import json
import requests,datetime
from bs4 import BeautifulSoup

def dumper(obj):
    try:
        return obj.toJSON()
    except:
        return obj.__dict__

class MareaInfo:
    def __init__(self, hora, tipo):
        self.hora = hora
        self.tipo = tipo

class DiaInfo:
    def __init__(self, dia, mareas):
        self.dia = dia
        self.mareas = mareas

class MesInfo:
    def __init__(self, mes, dias):
        self.mes = mes
        self.dias = dias


def scrapearMareas():
    try:
        listDiasInfo = []

        url = "https://tablademareas.com/es/cadiz/conil-de-la-frontera#_mareas"
        req = requests.get(url)
        bsObj = BeautifulSoup(req.text, "html.parser")

        mes = bsObj.find(id = "tabla_mareas_mes_mes").getText().strip()
        dias = bsObj.find_all("td", class_ ="tabla_mareas_dia")
        for dia in dias:
            textDia = dia.findChildren("div", class_= "tabla_mareas_dia_numero")[0].getText().strip()
            mareas = dia.parent.findChildren("div", class_= "tabla_mareas_marea_hora")
            if not any(x.dia == textDia for x in listDiasInfo):
                mareasInfo = []
                for marea in mareas:
                    attrs = marea.attrs["class"]
                    isBajaMar = "tabla_mareas_hora_bajamar" in attrs
                    mareaInfo = MareaInfo(marea.getText().strip(), str("Baja" if isBajaMar else "Alta"))
                    mareasInfo.append(mareaInfo)

                diaInfo = DiaInfo(textDia, mareasInfo)
                listDiasInfo.append(diaInfo)
        mesInfo = MesInfo(mes, listDiasInfo)

        jsonValue = json.dumps(mesInfo, default=dumper, indent=2)
        return jsonValue
        #with open(mes + '_2020.txt', 'w') as f:
            #print >> f, jsonValue

    except Exception as e: print(e)

#scrapearMareas()
