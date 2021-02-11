const jabsNeeded = 4310362;
function getVaccineData() {
    const Http = new XMLHttpRequest();
    const url = 'https://data.cityofchicago.org/resource/2vhs-cf6b.json';
    Http.open('GET', url);
    Http.send()

    return new Promise((resolve) => {
        Http.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                resolve(JSON.parse(Http.responseText));
            }
        }
    })
}
function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

document.addEventListener("DOMContentLoaded", function() {
    let doses = 0;
    let cumulativeDoses = 0;
    getVaccineData().then(vaccineJson => {
        for (let i = 0; i < 7; i++) {
            doses += parseInt(vaccineJson[i]["total_doses_daily"])
            if(i === 0){
                const cumulativeDosesElement = document.getElementById("cumulative_doses");
                cumulativeDoses = vaccineJson[i]["total_doses_cumulative"];
                cumulativeDosesElement.innerText = Intl.NumberFormat().format(vaccineJson[i]["total_doses_cumulative"])
            }
        }
        const dailyRateElement = document.getElementById("calculated_daily_rate");
        let dailyRate = Math.round(doses / 7);
        dailyRateElement.innerText = Intl.NumberFormat().format(dailyRate);
        const jabsNeededElement = document.getElementById("jabs_needed");
        const jabsPending = jabsNeeded - cumulativeDoses;
        jabsNeededElement.innerText = Intl.NumberFormat().format(jabsPending);
        const daysToJabElement = document.getElementById("days_to_jab");
        let daysToJab = Math.round(jabsNeeded / dailyRate);
        daysToJabElement.innerText = Intl.NumberFormat().format(daysToJab);
        const jabHorizon = document.getElementById("jab_horizon");
        let jabHorizonDate = addDays(new Date(), daysToJab);
        jabHorizon.innerText = jabHorizonDate.toDateString();
    })
});