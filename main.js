function loadJSON(callback) {   
    const urlJson = 'https://raw.githubusercontent.com/Xatpy/mareas/main/noviembre_2020.json';
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

function init() {
    loadJSON(function(response) {
    // Parse JSON string into object
        const actual_JSON = JSON.parse(response);

        const mareas = actual_JSON.dias[getDay() - 1].mareas;

        const date = getTodayDate()
        document.getElementById("day").textContent = (date);
        const time = getHour();
        //document.write(time);
        
        for (let i = 0; i < mareas.length; ++i) {
            document.getElementById("marea" + (i+1).toString()).textContent = mareas[i].hora + " --- " + mareas[i].tipo;
        }

        debugger
    });
}

function getHour() {
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return time;
}

function getTodayDate() {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    return date;
    //return today.getDate();
}

function getDay() {
    var today = new Date();
    return today.getDate();
}

window.onload = function() {
    init();
};
