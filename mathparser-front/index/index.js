// index.js
import {appConfiguration} from "../js/configuration.js";
import {createMathparserService} from "../js/mathparserService.js";

document.getElementById("addParameterButton").addEventListener("click", addParameter);
document.getElementById("computeButton").addEventListener("click", computeButtonClicked);

let environment = (document.location.host.startsWith('127') || document.location.host.startsWith("localhost")) ? "development": "production";
const mathParserService = createMathparserService(appConfiguration, environment);
let parameterCount = 0;


reloadLastFunctions();
    
async function reloadLastFunctions() {

    let lastComputedFunctions = document.getElementById("lastComputedFunctions");
    lastComputedFunctions.innerHTML = '<div class="loader" style="margin:auto"></div>';

    let response = null;
    try{
        response = await mathParserService.getLast(20);
    }
    catch(err)
    {
        lastComputedFunctions.innerHTML = "Ошибка!"
        if(err == "TypeError: Failed to fetch")
        lastComputedFunctions.innerHTML += "Проверьте ваше подключение к сети.";
        return;
    }
    if(response.status != 200 || response.content.length == undefined)
    {
        lastComputedFunctions.innerHTML = response.content;
        return;
    }

    let table = createLastComputedFunctionsTable(response.content);

    lastComputedFunctions.innerHTML = '';
    lastComputedFunctions.appendChild(table);
}

async function computeButtonClicked(){
    let button = document.getElementById("computeButton");
    let textarea = document.getElementById("expressionInputElement");
    let resultTextElement = document.getElementById("resultTextElement");
    resultTextElement.innerHTML = '<div class="loader" style="margin:auto"></div>';

    let parametersDiv = document.getElementById("parameters");
    let parameters = [];

    for (let i = 0; i < parametersDiv.children.length; i++) {
        let child = parametersDiv.children[i];
        if (child.className != "parameter")
            continue;
        let variableName = "";
        let value = 0;
        for (let j = 0; j < child.children[1].children.length; j++) {
            let subChild = child.children[1].children[j];
            if (subChild.className == "parameterNameInput")
                variableName = subChild.value;
            else if(subChild.className == "parameterValueInput")
                value = Number(subChild.value);
        }

        parameters.push({
            variableName: variableName,
            value: value
        });
    }

    button.disabled = true;
    
    let response = null;
    try{
        response = await mathParserService.computeExpression(textarea.value, parameters);
    }
    catch(err)
    {
        resultTextElement.innerText = "Ошибка!"
        if(err == "TypeError: Failed to fetch")
            resultTextElement.innerText += "Проверьте ваше подключение к сети.";
        button.disabled = false;
        resultTextElement.innerHTML = '';
        return;
    }

    if(response.status == 200)
    {
        resultTextElement.innerHTML = '';
        resultTextElement.innerText = response.content.result;
        reloadLastFunctions();
    }
    else
    {
        if(response.contentType.includes("json"))
            resultTextElement.innerText = "Ошибка! Ответ от сервера: " + response.content.message;
        else 
        {
            resultTextElement.innerText = "Ошибка!";
            console.log(response.content);
        }
    }
    
    button.disabled = false;
}

function addParameter() {
    
    if(parameterCount == 5){
        alert("Не более 5 параметров!");
        return;
    }
    parameterCount++;
    let parametersDiv = document.getElementById("parameters");

    let parameterDiv = document.createElement("div");

    parameterDiv.className = "parameter";
    parameterDiv.style.display = "flex";

    let parameterLabelDiv = document.createElement("div");
    parameterDiv.appendChild(parameterLabelDiv);

    let span1 = document.createElement("span");
    span1.innerText = "Имя параметра:";
    parameterLabelDiv.appendChild(span1);

    parameterLabelDiv.appendChild(document.createElement("br"));

    let span2 = document.createElement("span");
    span2.innerText = "Значение:";
    parameterLabelDiv.appendChild(span2);

    let parameterInputDiv = document.createElement("div");
    parameterDiv.appendChild(parameterInputDiv);

    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "parameterNameInput";
    parameterInputDiv.appendChild(nameInput);

    parameterInputDiv.appendChild(document.createElement("br"));

    var valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.className = "parameterValueInput";
    parameterInputDiv.appendChild(valueInput);

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "Удалить параметр";
    deleteButton.style.height ="22px";

    parameterDiv.appendChild(deleteButton);
    
    parametersDiv.appendChild(parameterDiv);

    deleteButton.addEventListener("click", () => {parametersDiv.removeChild(parameterDiv); parameterCount--;});
}

function createLastComputedFunctionsTable(content)
{
    const table = document.createElement("table");
    table.border = 1;
    table.cellSpacing = 0;
    table.style.fontSize = "xx-large";

    let rowIndex = -1;
    let cellIndex = 0;
    content.map(e => {
        rowIndex++;
        table.insertRow();
        table.rows[rowIndex].insertCell();
        table.rows[rowIndex].cells[cellIndex].colSpan = 2;
        table.rows[rowIndex].cells[cellIndex].innerText = "F(" + e.parameters.map(p => p.name).join(",") + ") = " + e.expressionString;
        
        cellIndex = 0;

        rowIndex++;
        table.insertRow();
        table.rows[rowIndex].insertCell();
        table.rows[rowIndex].cells[cellIndex].innerText = "Параметры:";
        table.rows[rowIndex].insertCell();
        cellIndex++;
        table.rows[rowIndex].cells[cellIndex].innerText = "Значение:";
        
        cellIndex = 0;

        e.points.map(point => {
            table.insertRow();
            rowIndex++;

            table.rows[rowIndex].insertCell();
            cellIndex = 0;

            let paramStr = "";
            if(e.parameters.length != 0)
            {
                paramStr = e.parameters.map(p => p.values.filter(v => v.pointId == point.id).map(v => 
                    {
                        let result = v.value.toString();
                        return result;
                    })[0])
                    .join(",");
            }

            table.rows[rowIndex].cells[cellIndex].innerText = "F(" + paramStr +")";

            table.rows[rowIndex].insertCell();
            cellIndex++;
            table.rows[rowIndex].cells[cellIndex].innerText = point.result;
        });
        
        cellIndex = 0;
    });

    return table;
}
