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
    return total_minutes

def calculate_total_minutes(hour, minutes):
    print ("hour", hour)
    print("minutes", minutes)
    return int(hour) * 60 + int(minutes)

def get_tide_index(tides, now):
    list_minutes = []
    for tide in tides:
        list_minutes.append(get_total_minutes_of_tide(tide))

    current_time_minutes = calculate_total_minutes(now.hour, now.minute)
    
    tide_index = -1
    if (current_time_minutes < list_minutes[0]):
        tide_index = - 1
    elif (current_time_minutes > list_minutes[len(list_minutes) - 1]):
        tide_index = len(list_minutes) - 1
    else:
        for i in range(len(list_minutes) - 1):
            if list_minutes[i] <= current_time_minutes <=  list_minutes[i + 1]:
                tide_index = i

    return tide_index

def get_percentage_passed(tides, tide_index, now):
    total_difference = -1
    minutes = calculate_total_minutes(now.hour, now.minute)
    if (tide_index == -1):
        # todo previous day
        min_previous = 0
    elif tide_index == len(tides) -1:
        end_of_day_minutes = calculate_total_minutes("23", "59")
        total_difference = end_of_day_minutes - get_total_minutes_of_tide(tides[len(tides) - 2])
        minutes = end_of_day_minutes - minutes
    else:
        total_difference = calculate_total_minutes(tides[tide_index + 1]) - calculate_total_minutes(tides[tide_index])
        minutes = get_total_minutes_of_tide(tides[tide_index + 1]) - minutes

    percentage = 100 - (minutes / total_difference * 100.0)
    return round(percentage, 0)


def get_tide_status(tides, tide_index, now):
    status = ''
    if (tide_index == -1):
        if tides[0]['tipo'] == "Alta":
            status += "Subiendo"
        else:
            status += "Bajando"
    else:
        if (tides[tide_index]['tipo'] == "Alta"):
            status += "Bajando"
        else:
            status += "Subiendo"
    percentage = get_percentage_passed(tides, tide_index, now)
    status += " al " + str(percentage)
    status += "%"
    return status

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
    print("Tide index", tide_index)

    status = get_tide_status(tides, tide_index, now)
    print (status)
    return status



get_response_from_API()