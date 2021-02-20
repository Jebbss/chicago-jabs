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

function makeYAxis(dataset, w, h, yAxisPadding, yAxisPaddingBottom, svg) {
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, (d) => d)])
        .range([h - yAxisPaddingBottom, yAxisPaddingBottom]);
    const yAxis = d3.axisLeft(yScale);
    svg.append("g")
        .attr("transform", "translate(" + yAxisPadding + ",0)")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", "-4.5em")
        .attr("text-anchor", "end")
        .attr("stroke", "black")
        .text("Days to jab 80% of Chicago residents");
    return yScale;
}

function makeBarChart(dataset) {
    const w = 600;
    const h = 400;
    const yAxisPaddingLeft = 60;
    const yAxisPaddingBottom = 5;
    const yAxisPaddingRight = 5;
    const svg = d3.select("svg")
        .attr("width", w)
        .attr("height", h);
    const barWidth = (w - yAxisPaddingLeft - yAxisPaddingRight) / dataset.length
    const yScale = makeYAxis(dataset, w, h, yAxisPaddingLeft, yAxisPaddingBottom, svg)
    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", (d, i) =>  yAxisPaddingRight + yAxisPaddingLeft + (i * barWidth))
        .attr("height", (d) => h - yScale(d) - yAxisPaddingBottom)
        .attr("y", (d) =>  yScale(d))
        .attr("width", barWidth - 3)
        .attr("fill", "navy")
        .attr("class", "bar")
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