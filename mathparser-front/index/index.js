// index.js
import {appConfiguration} from "../js/configuration.js";
import {createMathparserService} from "../js/mathparserService.js";

document.getElementById("addParameterButton").addEventListener("click", addParameter);
document.getElementById("computeButton").addEventListener("click", computeButtonClicked);

let mathParserService = createMathparserService(appConfiguration);


async function computeButtonClicked()
{
    let textarea = document.getElementById("expressionInputElement");

    let parametersDiv = document.getElementById("parameters");
    let parameters = [];

    for (let i = 0; i < parametersDiv.children.length; i++) {
        let child = parametersDiv.children[i];
        if (child.className != "parameter")
            continue;
        let variableName = "";
        let value = 0;
        for (let j = 0; j < child.children.length; j++) {
            let subChild = child.children[j];
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

    let response = await mathParserService.computeExpression(textarea.value, parameters);

    let resultTextElement = document.getElementById("resultTextElement");
    if(response.status == 200)
    {
        resultTextElement.innerText = response.content.result;
    }
    else
    {
        if(response.contentType.indexOf("json") != -1)
            resultTextElement.innerText = "Ошибка! Ответ от сервера: " + response.content.message;
        else 
        {
            resultTextElement.innerText = "Ошибка!";
            console.log(response.content);
        }
    }
}

function addParameter()
{
    let parametersDiv = document.getElementById("parameters");

    let parameterDiv = document.createElement("div");

    parameterDiv.className = "parameter";

    let span1 = document.createElement("span");
    span1.innerText = "Имя параметра:";
    parameterDiv.appendChild(span1);

    let nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "parameterNameInput";
    parameterDiv.appendChild(nameInput);

    parameterDiv.appendChild(document.createElement("br"));

    let span2 = document.createElement("span");
    span2.innerText = "Значение:";
    parameterDiv.appendChild(span2);

    var valueInput = document.createElement("input");
    valueInput.type = "text";
    valueInput.className = "parameterValueInput";
    parameterDiv.appendChild(valueInput);

    parametersDiv.appendChild(parameterDiv);
}
