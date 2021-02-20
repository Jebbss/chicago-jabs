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

function makeYAxis(dataset, w, h, padding, svg) {
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, (d) => d)])
        .range([h - padding, padding]);
    const yAxis = d3.axisLeft(yScale);
    svg.append("g")
        .attr("transform", "translate(60,0)")
        .call(yAxis);
    return yScale;
}

function makeBarChart(dataset) {
    const w = 500;
    const h = 300;
    const padding = 60;
    const svg = d3.select("svg")
        .attr("width", w)
        .attr("height", h);
    const barWidth = w / dataset.length
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", (d, i) =>  i * barWidth)
        .attr("height", (d) => Math.round(d / 10))
        .attr("y", (d) => h - Math.round(d / 10))
        .attr("width", barWidth - 3)
        .attr("fill", "navy")
        .attr("class", "bar")
    // makeYAxis(dataset, w, h, padding, svg)

}

function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

document.addEventListener("DOMContentLoaded", function () {
    let doses = 0;
    let cumulativeDoses = 0;
    getVaccineData().then(vaccineJson => {
        for (let i = 0; i < 7; i++) {
            doses += parseInt(vaccineJson[i]["total_doses_daily"])
            if (i === 0) {
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

    fetch('https://jebbss.github.io/chicago-jabs/python/rolling-mean.json')
        .then(response => response.json())
        .then(jsonResponse => {
            let dataset = []
            console.log(1)
            for (let i = 0; i < jsonResponse.length; i++) {
                if(isNaN(parseInt(jsonResponse[i]['days_to_complete'])))
                    continue
                dataset.push(parseInt(jsonResponse[i]['days_to_complete']))
            }
            console.log(dataset)
            makeBarChart(dataset.reverse())
        })
});