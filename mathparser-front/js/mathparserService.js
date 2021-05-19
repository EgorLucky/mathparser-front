export function createMathparserService(configuration, environment){
	let serviceHost = (environment == "production")? configuration.mathParserServiceUrlProd: configuration.mathParserServiceUrlLocal;
	return {
		getLast: async function(limit){
			let response = await fetch(serviceHost + '/api/math/getLast?limit=' + limit);

			return await getResponseContent(response);

		},
		computeExpression: async function(expression, parameters) {
			let payloadObject = {
				expression: expression,
				parameters: parameters
            };
			
			let response = await fetch(serviceHost + '/api/math/computeExpression',
			{
				method: "post",
				headers: {
					"content-type": "application/json"
				},
				body: JSON.stringify(payloadObject)
			});
			
			return await getResponseContent(response);
		},
		
		compute2DIntervalPlot: async function(payload) {
			
			const payloadObject = {
				expression: payload.expression,
				max: payload.xMax,
				min: payload.xMin,
				step: payload.xStep
			};
			
			let response = await fetch(serviceHost + '/api/math/compute2DIntervalPlot',
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