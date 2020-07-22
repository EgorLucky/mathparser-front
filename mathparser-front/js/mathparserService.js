export function createMathparserService(configuration){
	return {
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
			
			let content = null;
			
			if(response.status == 200 || 
				response.headers.get("content-type").includes("application/json") != -1)
				content = await response.json();
			else 
				content = await response.text();

			let result = {
				status : response.status,
				content: content,
				contentType: response.headers.get("content-type")
			};

			return result;
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
	};
}