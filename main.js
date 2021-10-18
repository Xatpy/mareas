function loadJSON(callback) {
    const urlJson = 'https://raw.githubusercontent.com/Xatpy/mareas/main/octubre_2021.json';
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', urlJson, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        callback(xobj.responseText);
    }
    };
    xobj.send(null);
}

const getTotalMinutesOfTide = (tide) => {
    const [tideHour, tideMinutes] = tide.hora.substr(0, tide.hora.indexOf(' ')).split(':')
    return parseInt(tideHour) * 60 + parseInt(tideMinutes)
}

const getTideIndex = (currentTime, tides) => {
    let currentTimeMinutes = parseInt(currentTime.hour) * 60 + parseInt(currentTime.minutes);
    let arrayMinutes = tides.map(tide => getTotalMinutesOfTide(tide))

    debugger
    let tideIndex = -1;
    if (currentTimeMinutes < arrayMinutes[0]) {
        tideIndex = 0;
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

function init() {
    loadJSON(function(response) {
        // Parse JSON string into object
        const actual_JSON = JSON.parse(response);

        const mareas = actual_JSON.dias[getDay() - 1].mareas;

        let currentTime = getCurrentTime();
        currentTime = {
            "hour": "1",
            "minutes": "39",
            "seconds": "25"
        }
        const tideIndex = getTideIndex(currentTime, mareas);
        const date = getTodayDate() + "   ||   " ;
        const time = `${getTodayDate()} || ${currentTime.hour}:${currentTime.minutes}:${currentTime.seconds}`;
        document.getElementById("day").textContent = (date);
debugger
        let alreadySelected = false;
        for (let i = 0; i < mareas.length; ++i) {
            const [tideHour, tideMinutes] = mareas[i].hora.substr(0, mareas[i].hora.indexOf(' ')).split(':')
            const writeText = mareas[i].hora + " --- " + mareas[i].tipo + (tideIndex === i ? " <----- " : "");
            document.getElementById("marea" + (i+1).toString()).textContent = writeText;
        }
    });
}

function createDate(stringHour) {
    const dateTarget = new Date();
    const splittedHour = stringHour.split(':');
    dateTarget.setHours(splittedHour[0]);
    dateTarget.setMinutes(splittedHour[1]);
    dateTarget.setSeconds(0);
    dateTarget.setMilliseconds(0);
    return dateTarget;
}

function getCurrentTime() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return {
        "hour": today.getHours(),
        "minutes": today.getMinutes(),
        "seconds": today.getSeconds(),
    }
}

function getTodayDate() {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    return date;
}

function getDay() {
    var today = new Date();
    return today.getDate();
}

window.onload = function() {
    init();
};
