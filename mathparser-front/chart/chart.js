// chart.js
import {appConfiguration} from "../js/configuration.js";
import {createMathparserService} from "../js/mathparserService.js";

let mathParserService = createMathparserService(appConfiguration);
document.getElementById('drawButton').addEventListener('click', draw);

let destroyPreviousChart = null;

async function draw()
{
    let button = document.getElementById("drawButton");
    button.disabled = true;

    let ctx = document.getElementById("myChart");

    let labels = getLabels();

    button.innerHTML = '<div class="loader"></div>';

    let points = await getPoints(labels);
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

async function mathFunction(args) {
    let textarea = document.getElementById("expressionInputElement");
    let expression = textarea.value;
    let parametersTable = args.map(a => [
    {
        variableName: "x",
        value: a
    }]);
    let response = await mathParserService.computeFunctionValues(expression, parametersTable);

    let jsonResponse = await response.content;

    return jsonResponse.result;
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
    let computed = await mathFunction(labels);

    let results = computed.map(c => ({
            x: c.parameters[0].value,
            y: c.value
    }));

    return results;
}