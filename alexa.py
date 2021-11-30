import requests
from datetime import datetime

def get_current_month_file(now):
    current_year = str(now.year)
    current_month = str(now.month)
    return f'{current_year}_{current_month}.json'

def get_total_minutes_of_tide(tide):
    tideTime = tide['hora']
    print("---", tideTime)
    tide_time = tideTime[0:tideTime.index(' ')]
    tide_hour, tide_minutes = tide_time.split(':')
    total_minutes = calculate_total_minutes(tide_hour, tide_minutes)
    print (tide_hour, tide_minutes)
    print(total_minutes)

def calculate_total_minutes(hour, minutes):
    print ("hour", hour)
    print("minutes", minutes)
    return int(hour) * 60 + int(minutes)

def get_tide_index(tides, now):
    hour = now.hour
    minutes = now.minute
    tide_index = -1

    for tide in tides:
        get_total_minutes_of_tide(tide)
    
    return tide_index


def get_response_from_API():
    base_url = 'https://raw.githubusercontent.com/Xatpy/mareas/main/data/'
    now = datetime.now()
    url = base_url + get_current_month_file(now)
    print(url)
    response = requests.get(url)
    tidesMonth = response.json()
    current_day = datetime.now().day
    print("Current day", current_day)
    print(tidesMonth['dias'][current_day - 1])

    tides = tidesMonth['dias'][current_day - 1]['mareas']
    print(tides)

    hour = now.hour
    minutes = now.minute
    print(hour, minutes)
    tide_index = get_tide_index(tides, now)



get_response_from_API()