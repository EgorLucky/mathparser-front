// chart.js
import {appConfiguration} from "../js/configuration.js";
import {createMathparserService} from "../js/mathparserService.js";

let environment = (document.location.host.startsWith('127') || document.location.host.startsWith("localhost")) ? "development": "production";
const mathParserService = createMathparserService(appConfiguration, environment);

document.getElementById('drawButton').addEventListener('click', draw);

let destroyPreviousChart = null;

async function draw()
{
    let button = document.getElementById("drawButton");
    button.disabled = true;

    let ctx = document.getElementById("myChart");

    let labels = getLabels();

    let loadStatusDiv = document.getElementById("loadStatus");

    loadStatusDiv.innerHTML = '<div class="loader" style="margin:auto"></div>';

    let getPointsResponse = null;
    try{
        getPointsResponse = await getPoints(labels);
    }
    catch(err)
    {
        loadStatusDiv.innerHTML = "Ошибка!"
        if(err == "TypeError: Failed to fetch")
            loadStatusDiv.innerHTML += "Проверьте ваше подключение к сети.";
        button.disabled = false;
        return;
    }

    if(getPointsResponse.status != 200)
    {
        if(getPointsResponse.contentType.includes("json"))
            loadStatusDiv.innerHTML = "Ошибка! Ответ от сервера: " + getPointsResponse.content.message;
        else 
        {
            loadStatusDiv.innerHTML = "Ошибка!";
            console.log(response.content);
        }
        button.disabled = false;
        return;
    }

    let points = getPointsResponse.content.result.map(c => ({
        x: c.parameters[0].value,
        y: c.value
    }));

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

function getLabels() {

    let xMinTextBox = document.getElementById("xMinTextBox");
    let xMaxTextBox = document.getElementById("xMaxTextBox");
    let xStepTextBox = document.getElementById("xStepTextBox");

    if (!(Number(xMinTextBox.value) != NaN &&
        Number(xMaxTextBox.value) != NaN &&
        Number(xStepTextBox.value) != NaN))
        return [0, 1, 2, 3, 4, 5];

    let xMin = Number(xMinTextBox.value);
    let xMax = Number(xMaxTextBox.value);
    let xStep = Number(xStepTextBox.value);
    let result = [];
    for (xMin; xMin < xMax; xMin += xStep)
        result.push(xMin);
    result.push(xMax);

    return result;
}

async function getPoints(labels) {
    let textarea = document.getElementById("expressionInputElement");
    let expression = textarea.value;
    let parametersTable = labels.map(a => [
    {
        variableName: "x",
        value: a
    }]);
    let response = await mathParserService.computeFunctionValues(expression, parametersTable);

    return response;
}