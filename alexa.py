import requests
from datetime import datetime

def get_current_month_file(now):
    current_year = str(now.year)
    current_month = str(now.month)
    return f'{current_year}_{current_month}.json'

def get_response_from_API():
    base_url = 'https://raw.githubusercontent.com/Xatpy/mareas/main/data/'
    now = datetime.now()
    url = base_url + get_current_month_file(now)
    print(url)
    response = requests.get(url)
    tidesMonth = response.json()
    current_day = datetime.now().day
    print(tidesMonth['dias'][current_day])

    tides = tidesMonth['dias'][current_day]['mareas']
    print(tides)

    hour = now.hour
    minutes = now.minute
    print(hour, minutes)



get_response_from_API()