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

    let resultTextElement = document.getElementById("resultTextElement");
    let response = null;
    try{
        response = await mathParserService.computeExpression(textarea.value, parameters);
    }
    catch(err)
    {
        resultTextElement.innerText = "Ошибка!"
        if(err == "TypeError: Failed to fetch")
            resultTextElement.innerText += "Проверьте ваше подключение к сети.";
        return;
    }

    
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

function addParameter() {
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

    deleteButton.addEventListener("click", () => parametersDiv.removeChild(parameterDiv));
}
