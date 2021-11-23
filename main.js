window.onload = function() {
    init();
};

const loadJSON = async () => {
    const jsonFileName = getMonthAndYearFilenameJson();
    const urlJson = `https://raw.githubusercontent.com/Xatpy/mareas/main/data/${jsonFileName}`;
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
    if (index === -1) {
        let minutesFromPrevDay = 0;
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
    let goingDown = false;
    if (index === -1) {
        if (tides[0].tipo === "Alta") {
            status += "⏫ Subiendo...";
        } else {
            status += "⏬ Bajando...";
            goingDown = true;
        }
    } else {
        if (tides[index].tipo === "Alta") {
            status += "⏬ Bajando... ";
            goingDown = true;
        } else {
            status += "⏫ Subiendo... ";
        }
    }
    const percentage = getPercentagePassed(tides, index, currentTime, previousDayTides, nextDayTides);
    status += ` ${percentage}%`;
    return [status, percentage, goingDown];
}

const init = () => {
    loadJSON()
    .then(response => {
        const currentDay = getDay();
        const dayTides = response.dias[currentDay - 1].mareas;
        const previousDayTides = currentDay > 1 ? response.dias[currentDay - 2].mareas : null;
        const nextDayTides = currentDay < response.dias.length ? response.dias[currentDay].mareas : null;

        let currentTime = getCurrentTime();
        /*currentTime = {
            "hour": "17",
            "minutes": "45",
            "seconds": "0"
        }*/
        const tideIndex = getTideIndex(currentTime, dayTides);
        createTitle(currentTime);
        for (let i = -1; i < dayTides.length; ++i) {
            const tideElement = document.getElementById("marea" + (i+1).toString());
            if (i >= 0) {
                tideElement.appendChild(getSpanTimeTide(dayTides[i]));
                tideElement.classList.add("selectedTide")
            }

            if (tideIndex === i) {
                const statusTide = getTideStatus(dayTides, tideIndex, currentTime, previousDayTides, nextDayTides);
                const el = document.createElement("div");
                el.id = "selectedTide";
                el.appendChild(document.createTextNode(statusTide[0]));
                tideElement.appendChild(el);
                el.classList.add("selectedTidePercentage");

                const divForCanvas = document.createElement("div");
                divForCanvas.id = "divForCanvas";
                const canvas = document.createElement("canvas")
                canvas.id = "canvasElement";
                const goingDown = statusTide[2];
                let percentage = statusTide[1];
                if (goingDown) {
                    divForCanvas.style.transform = "scale(-1, 1)";
                    percentage = 100 - percentage;
                }
                divForCanvas.appendChild(canvas);
                el.appendChild(divForCanvas);
                createManometer(percentage, goingDown);
            }
        }
        setCSSTides(tideIndex, dayTides.length);
    });
}

const getSpanTimeTide = (dayTide) => {
    const spanTime = document.createElement("span");
    const hourTitle = `${dayTide.tipo === "Alta" ? "⬆️" : "⬇️"}  ${dayTide.hora} - ${dayTide.tipo}`;
    spanTime.innerHTML = hourTitle;
    spanTime.classList.add("spanTime");
    return spanTime;
}

const setCSSTides = (tideIndex, numberOfTides) => {
    const HEIGHT_HEADER = 13;
    const HEIGHT_SECUNDARY_TIDE = 3;

    const initialTide = document.getElementById("marea0");
    let mainTideHeight = -1;
    if (tideIndex != -1) {
        mainTideHeight = 100 - HEIGHT_HEADER - (numberOfTides - 1) * HEIGHT_SECUNDARY_TIDE;
        initialTide.style.height = 0;
    } else {
        mainTideHeight = 100 - HEIGHT_HEADER - (numberOfTides * HEIGHT_SECUNDARY_TIDE);
        initialTide.style.height = `${mainTideHeight}vh`;
    }

    for (let index = 0; index < numberOfTides; ++index) {
        const tideElement = document.getElementById(`marea${index + 1}`);
        if (index === tideIndex) {
            tideElement.style.height = `${mainTideHeight}vh`;
        } else {
            tideElement.style.height = `${HEIGHT_SECUNDARY_TIDE}vh`;
        }
    }
}

const formatTiming = (numberStr) => {
    return (numberStr.length === 1) ? "0" + numberStr : numberStr;
}

const createTitle = (currentTime) => {
    const emojiTime = getEmojiTime(currentTime.hour, currentTime.minutes);
    const time = `🗓 ${getTodayDate()} || ${formatTiming(currentTime.hour)}:${formatTiming(currentTime.minutes)}h ${emojiTime}`;
    const location = 'Conil de la Frontera'
    document.getElementById("day").textContent = `🌊 Mareas en ${location} 🏖️`;
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
    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    return date;
}

const getDay = () => {
    return new Date().getDate();
}

const getMonthAndYearFilenameJson = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return `${year}_${month}.json`;
}

const getEmojiTime = (hour, minutes) => {
    if (hour >= 12) {
        hour = hour - 12;
    }
    if (hour === 0) {
        return (minutes < 30) ? "🕛" : "🕧";
    } else if (hour === 1) {
        return (minutes < 30) ? "🕐" : "🕜";
    } else if (hour === 2) {
        return (minutes < 30) ? "🕑" : "🕝";
    } else if (hour === 3) {
        return (minutes < 30) ? "🕒" : "🕞";
    } else if (hour === 4) {
        return (minutes < 30) ? "🕓" : "🕟";
    } else if (hour === 5) {
        return (minutes < 30) ? "🕔" : "🕠";
    } else if (hour === 6) {
        return (minutes < 30) ? "🕕" : "🕡";
    } else if (hour === 7) {
        return (minutes < 30) ? "🕖" : "🕢";
    } else if (hour === 8) {
        return (minutes < 30) ? "🕗" : "🕣";
    } else if (hour === 9) {
        return (minutes < 30) ? "🕘" : "🕤";
    } else if (hour === 10) {
        return (minutes < 30) ? "🕙" : "🕥";
    } else if (hour === 11) {
        return (minutes < 30) ? "🕚" : "🕦";
    } else {
        return "🕰";
    }
}

const createManometer = (value, goingDown) => {
    var opts = {
        angle: 0, // The span of the gauge arc
        lineWidth: 0.3, // The line thickness
        radiusScale: 0.85, // Relative radius
        pointer: {
          length: 0.54, // // Relative to gauge radius
          strokeWidth: 0.033, // The thickness
          color: '#000000' // Fill color
        },
        limitMax: false,     // If false, max value increases automatically if value > maxValue
        limitMin: false,     // If true, the min value of the gauge will be fixed
        colorStart: !goingDown ? '#6FADCF' : '#E0E0E0' ,   // Colors
        colorStop: !goingDown ? '#8FC0DA' : '#E0E0E0' ,    // just experiment with them
        strokeColor: !goingDown ? '#E0E0E0' : '#6FADCF',  // to see which ones work best for you
        generateGradient: true,
        highDpiSupport: true,     // High resolution support
      };
      const target = document.getElementById('canvasElement'); // your canvas element
      let gauge = new Gauge(target).setOptions(opts); // create sexy gauge!
      gauge.maxValue = 100; // set max gauge value
      gauge.setMinValue(0);  // Prefer setter over gauge.minValue = 0
      gauge.animationSpeed = 33; // set animation speed (32 is default value)
      gauge.set(value); // set actual value
}