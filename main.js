window.onload = function() {
    init();
};

const loadJSON = async () => {
    const urlJson = 'https://raw.githubusercontent.com/Xatpy/mareas/main/octubre_2021.json';
    return fetch(urlJson)
            .then(response => {
                if (!response.ok) {
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(json => {
                this.users = json;
                return json;
            })
            .catch(function () {
                this.dataError = true;
            });
}

const calculateTotalMinutes = (hour, minutes) => {
    return parseInt(hour) * 60 + parseInt(minutes);
}

const getTotalMinutesOfTide = (tide) => {
    const [tideHour, tideMinutes] = tide.hora.substr(0, tide.hora.indexOf(' ')).split(':');
    return calculateTotalMinutes(tideHour, tideMinutes);
}

const getTideIndex = (currentTime, tides) => {
    let currentTimeMinutes = calculateTotalMinutes(currentTime.hour, currentTime.minutes);
    let arrayMinutes = tides.map(tide => getTotalMinutesOfTide(tide))

    let tideIndex = -1;
    if (currentTimeMinutes < arrayMinutes[0]) {
        tideIndex = -1;
    } else if (currentTimeMinutes > arrayMinutes[arrayMinutes.length - 1]) {
        tideIndex = arrayMinutes.length - 1;
    } else {
        for (let i = 0; i < arrayMinutes.length - 1; ++i) {
            if (currentTimeMinutes >= arrayMinutes[i] && currentTimeMinutes <= arrayMinutes[i + 1]) {
                tideIndex = i;
            }
        }
    }
    return tideIndex;
}

const getPercentagePassed = (tides, index, currentTime, previousDayTides, nextDayTides) => {
    let totalDifference = -1;
    let minutes = calculateTotalMinutes(currentTime.hour, currentTime.minutes);
    debugger
    if (index === -1) {
        let minutesFromPrevDay = 0;
        debugger
        if (previousDayTides !== null) {
            minutesFromPrevDay = calculateTotalMinutes("23", "59") - getTotalMinutesOfTide(previousDayTides[previousDayTides.length - 1]);
        }
        totalDifference = getTotalMinutesOfTide(tides[0]) + minutesFromPrevDay;
        minutes += minutesFromPrevDay;
    } else if (index === tides.length - 1) {
        const endOfDayMinutes = calculateTotalMinutes("23", "59");
        totalDifference = endOfDayMinutes - getTotalMinutesOfTide(tides[tides.length - 2]);
        minutes = endOfDayMinutes - minutes;
    } else {
        totalDifference = getTotalMinutesOfTide(tides[index + 1]) - getTotalMinutesOfTide(tides[index]);
        minutes = getTotalMinutesOfTide(tides[index + 1]) - minutes;
    }
    const percentage = 100 - (minutes / totalDifference * 100.0).toFixed();
    return percentage;
}

const getTideStatus = (tides, index, currentTime, previousDayTides, nextDayTides) => {
    let status = '';
    if (index === -1) {
        status += tides[0].tipo === "Alta" ? "⏫ Subiendo..." : "⏬ Bajando";
    } else {
        status += tides[index].tipo === "Alta" ? "⏬ Bajando... " : "⏫ Subiendo...";
    }
    status += ` ${getPercentagePassed(tides, index, currentTime, previousDayTides, nextDayTides)}%`;
    return status;
}

const init = () => {
    loadJSON()
    .then(response => {
        const currentDay = getDay();
        const dayTides = response.dias[currentDay - 1].mareas;
        const previousDayTides = currentDay > 1 ? response.dias[currentDay - 2].mareas : null;
        const nextDayTides = currentDay < response.dias.length ? response.dias[currentDay].mareas : null;

        let currentTime = getCurrentTime();
        currentTime = {
            "hour": "19",
            "minutes": "3",
            "seconds": "25"
        }
        const tideIndex = getTideIndex(currentTime, dayTides);
        const statusTide = getTideStatus(dayTides, tideIndex, currentTime, previousDayTides, nextDayTides);
        createTitle(currentTime);
        for (let i = 0; i < dayTides.length; ++i) {
            const writeText = dayTides[i].hora + " --- " + dayTides[i].tipo + (tideIndex === i ? " <----- " + statusTide : "");
            document.getElementById("marea" + (i+1).toString()).textContent = writeText;
        }

        setCSSTides(tideIndex, dayTides.length);
    });
}

const setCSSTides = (tideIndex, numberOfTides) => {
    debugger
    if (tideIndex != -1) {
        const tideIndex = document.getElementById("marea0");
        tideIndex.style.height = 0;
    }

    for (let index = 0; index < numberOfTides; ++index) {
        const tideElement = document.getElementById(`marea${index + 1}`);
        if (index === tideIndex) {
            tideElement.style.height = '60vh';
        } else {
            tideElement.style.height = '5vh';
        }
    }

    if (tideIndex >= 0 && tideIndex < numberOfTides) {
        
    }
}

const createTitle = (currentTime) => {
    const time = `${getTodayDate()} |||| ${currentTime.hour}:${currentTime.minutes}:${currentTime.seconds}`;
    const location = 'Conil de la Frontera'
    document.getElementById("day").textContent = `Mareas en ${location}`;
    document.getElementById("date").textContent = time;
}

const createDate = (stringHour) => {
    const dateTarget = new Date();
    const splittedHour = stringHour.split(':');
    dateTarget.setHours(splittedHour[0]);
    dateTarget.setMinutes(splittedHour[1]);
    dateTarget.setSeconds(0);
    dateTarget.setMilliseconds(0);
    return dateTarget;
}

const getCurrentTime = () => {
    const today = new Date();
    return {
        "hour": today.getHours(),
        "minutes": today.getMinutes(),
        "seconds": today.getSeconds(),
    }
}

const getTodayDate = () => {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    return date;
}

const getDay = () => {
    return new Date().getDate();
}
