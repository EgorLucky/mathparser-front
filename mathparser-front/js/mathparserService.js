export function createMathparserService(configuration){
	return {
		getLast: async function(limit){
			let response = await fetch(configuration.mathParserServiceUrl + '/api/math/getLast?limit=' + limit);

			return await getResponseContent(response);

		},
		computeExpression: async function(expression, parameters) {
			let payloadObject = {
				expression: expression,
				parameters: parameters
            };
			
			let response = await fetch(configuration.mathParserServiceUrl + '/api/math/computeExpression',
			{
				method: "post",
				headers: {
					"content-type": "application/json"
				},
				body: JSON.stringify(payloadObject)
			});
			
			return await getResponseContent(response);
		},
		
		computeFunctionValues: async function(expression, parametersTable) {
			
			let payloadObject = {
				expression: expression,
				parametersTable: parametersTable
            };
			
			let response = await fetch(configuration.mathParserServiceUrl + '/api/math/computeFunctionValues',
			{
				method: "post",
				headers: {
					"content-type": "application/json"
				},
				body: JSON.stringify(payloadObject)
			});

			return await getResponseContent(response);
		}
	};
}

async function getResponseContent(response)
{
	let content = null;
			
	if(response.status == 200 || 
		response.headers.get("content-type").includes("application/json"))
		content = await response.json();
	else 
		content = await response.text();

	let result = {
		status : response.status,
		content: content,
		contentType: response.headers.get("content-type")
	};

	return result;
}