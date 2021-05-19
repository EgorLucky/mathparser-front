// chart.js
import {appConfiguration} from "../js/configuration.js";
import {createMathparserService} from "../js/mathparserService.js?v=2";

let environment = (document.location.host.startsWith('127') || document.location.host.startsWith("localhost")) ? "development": "production";
const mathParserService = createMathparserService(appConfiguration, environment);

document.getElementById('drawButton').addEventListener('click', draw);

let destroyPreviousChart = null;

async function draw()
{
    let button = document.getElementById("drawButton");
    button.disabled = true;

    let ctx = document.getElementById("myChart");

    let params = getParams();

    let loadStatusDiv = document.getElementById("loadStatus");

    loadStatusDiv.innerHTML = '<div class="loader" style="margin:auto"></div>';

    let computeResult = null;
    try{
        computeResult = await mathParserService.compute2DIntervalPlot(params);
    }
    catch(err)
    {
        loadStatusDiv.innerHTML = "Ошибка!"
        if(err == "TypeError: Failed to fetch")
            loadStatusDiv.innerHTML += "Проверьте ваше подключение к сети.";
        button.disabled = false;
        return;
    }

    if(computeResult.status != 200)
    {
        if(computeResult.contentType.includes("json"))
            loadStatusDiv.innerHTML = "Ошибка! Ответ от сервера: " + computeResult.content.message;
        else 
        {
            loadStatusDiv.innerHTML = "Ошибка!";
            console.log(response.content);
        }
        button.disabled = false;
        return;
    }

    const points = computeResult.content.result;
    const labels = points.map(p => p.x);

    loadStatusDiv.innerHTML = "";
    button.innerHTML = 'Нарисовать';

    if(destroyPreviousChart != null)
        destroyPreviousChart();

    let data = {
        //args
        labels: labels,
        datasets: [
        {
                label: "mathFunction",
                function: x => points.filter(p => p.x == x)
                                    .map(p => p.y),
            borderColor: "rgba(255, 206, 86, 1)",
            data: [],
            fill: false
        }]
    };

    Chart.pluginService.register({
        beforeInit: function (chart) {
            let data = chart.config.data;
            for (let i = 0; i < data.datasets.length; i++) {
                for (let j = 0; j < data.labels.length; j++) {
                    let fct = data.datasets[i].function,
                        x = data.labels[j],
                        functionValues = fct(x);
                    functionValues.map(y => data.datasets[i].data.push(y));
                }
            }
        }
    });

    let myBarChart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }],
                xAxes: [{
                    ticks: {
                        beginAtZero: false
                    }
                }]
            }
        }
    });
    destroyPreviousChart = () => myBarChart.destroy();

    button.disabled = false;
}

function getParams() {

    let xMinTextBox = document.getElementById("xMinTextBox");
    let xMaxTextBox = document.getElementById("xMaxTextBox");
    let xStepTextBox = document.getElementById("xStepTextBox");
    let expression = document.getElementById("expressionInputElement").value;

    if (!(Number(xMinTextBox.value) != NaN &&
        Number(xMaxTextBox.value) != NaN &&
        Number(xStepTextBox.value) != NaN))
        return {
            xMin: 0,
            xMax: 5,
            xStep: 1,
            expression
        };

    let xMin = Number(xMinTextBox.value);
    let xMax = Number(xMaxTextBox.value);
    let xStep = Number(xStepTextBox.value);
    

    return {xMin, xMax, xStep, expression};
}