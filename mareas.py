import json
import requests
import os
from datetime import datetime
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
    def convertMesStringToNumber(self):
        if self.mes == "enero":
            return "1"
        elif self.mes == "febrero":
            return "2"
        elif self.mes == "marzo":
            return "3"
        elif self.mes == "abril":
            return "4"
        elif self.mes == "mayo":
            return "5"
        elif self.mes == "junio":
            return "6"
        elif self.mes == "julio":
            return "7"
        elif self.mes == "agosto":
            return "8"
        elif self.mes == "septiembre":
            return "9"
        elif self.mes == "octubre":
            return "10"
        elif self.mes == "noviembre":
            return "11"
        elif self.mes == "diciembre":
            return "12"
        else:
            return self.mes


    def __init__(self, mes, dias):
        self.mes = mes
        self.dias = dias
        self.mes_number = self.convertMesStringToNumber()

def get_current_date_and_time():
    now = datetime.now()
    date_string = now.strftime("%Y-%m-%d__%H-%M-%S")
    return date_string

def write_to_file(jsonValue: list[str], month: str, year: str, mes_number: str):
    directory = 'gh_actions_data'
    if not os.path.exists(directory):
        os.makedirs(directory)
    fileName = f'{directory}/{get_current_date_and_time()}_{month}_{year}.json'

    with open(fileName, 'w') as f:
        f.write(jsonValue + '\n')
        print ("✅ File generated: ", fileName)

    print("Update data file")
    fileName = f'data/{year}_{mes_number}.json'
    with open(fileName, 'w') as f:
        f.write(jsonValue + '\n')
        print ("✅ File updated: ", fileName)


def scrapear_mareas():
    try:
        listDiasInfo = []

        url = "https://tablademareas.com/es/cadiz/conil-de-la-frontera#_mareas"
        req = requests.get(url)
        bsObj = BeautifulSoup(req.text, "html.parser")

        month = bsObj.find(id = "tabla_mareas_mes_mes").getText().strip()
        year = bsObj.find(id = "tabla_mareas_mes_ano").getText().strip()
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
        mesInfo = MesInfo(month, listDiasInfo)

        jsonValue = json.dumps(mesInfo, default=dumper, sort_keys=True)

        write_to_file(jsonValue, month, year, mesInfo.mes_number)

    except Exception as e: print(e)

scrapear_mareas()
